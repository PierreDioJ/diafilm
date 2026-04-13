import { getSession, updateSession } from '@/lib/state'

export async function GET() {
  const session = getSession()

  if (session.status !== 'payment_pending' || !session.paymentId) {
    return Response.json({ status: session.status })
  }

  // Demo mode — nothing to poll
  if (session.paymentId.startsWith('demo_')) {
    return Response.json({ status: 'payment_pending' })
  }

  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY
  if (!shopId || !secretKey) {
    return Response.json({ status: 'payment_pending' })
  }

  try {
    const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64')
    const res = await fetch(
      `https://api.yookassa.ru/v3/payments/${session.paymentId}`,
      { headers: { Authorization: `Basic ${credentials}` } }
    )

    if (!res.ok) {
      return Response.json({ status: 'payment_pending' })
    }

    const payment = await res.json()

    if (payment.status === 'succeeded') {
      updateSession({ status: 'film_selection', paidAt: Date.now() })
      return Response.json({ status: 'film_selection' })
    }

    if (payment.status === 'canceled') {
      updateSession({
        status: 'idle',
        paymentId: null,
        confirmationUrl: null,
        paidAt: null,
      })
      return Response.json({ status: 'idle' })
    }

    return Response.json({ status: 'payment_pending' })
  } catch {
    return Response.json({ status: 'payment_pending' })
  }
}
