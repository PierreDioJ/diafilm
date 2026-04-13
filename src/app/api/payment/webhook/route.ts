import { getSession, updateSession } from '@/lib/state'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const event = body?.event as string | undefined
    const object = body?.object

    if (event === 'payment.succeeded' && object?.status === 'succeeded') {
      const paymentId = object.id as string

      const session = getSession()

      // Only process if it matches the current pending payment
      if (session.status === 'payment_pending' && session.paymentId === paymentId) {
        updateSession({
          status: 'film_selection',
          paidAt: Date.now(),
        })
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Bad Request', { status: 400 })
  }
}
