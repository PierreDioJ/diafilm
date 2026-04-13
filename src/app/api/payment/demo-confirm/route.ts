import { getSession, updateSession } from '@/lib/state'

export async function POST() {
  const session = getSession()

  if (session.status !== 'payment_pending') {
    return Response.json(
      { ok: false, error: 'No pending payment' },
      { status: 400 }
    )
  }

  updateSession({
    status: 'film_selection',
    paidAt: Date.now(),
  })

  return Response.json({ ok: true })
}
