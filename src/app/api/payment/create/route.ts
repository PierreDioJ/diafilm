import { updateSession, getSession } from '@/lib/state'
import { randomUUID } from 'crypto'

export async function POST() {
  const session = getSession()

  // Don't create a new payment if one is already pending
  if (session.status === 'payment_pending' && session.paymentId) {
    return Response.json({ ok: true, demo: false })
  }

  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY

  // Demo mode — no real YooKassa credentials
  if (!shopId || !secretKey) {
    updateSession({
      status: 'payment_pending',
      paymentId: `demo_${randomUUID()}`,
      confirmationUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/payment/demo-confirm`,
      paidAt: null,
    })
    return Response.json({ ok: true, demo: true })
  }

  // Real YooKassa payment
  const idempotenceKey = randomUUID()
  const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64')

  try {
    const res = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
      },
      body: JSON.stringify({
        amount: { value: '300.00', currency: 'RUB' },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/payment/success`,
        },
        description: 'Просмотр диафильма',
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('YooKassa error:', res.status, errBody)
      return Response.json({ ok: false, error: 'Payment creation failed' }, { status: 502 })
    }

    const payment = await res.json()

    updateSession({
      status: 'payment_pending',
      paymentId: payment.id as string,
      confirmationUrl: (payment.confirmation?.confirmation_url ?? payment.confirmation?.confirmation_token ?? null) as string | null,
      paidAt: null,
    })

    return Response.json({ ok: true, demo: false })
  } catch (err) {
    console.error('Payment create error:', err)
    return Response.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
