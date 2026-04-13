import { getSession, updateSession } from '@/lib/state'

export async function POST() {
  const session = getSession()

  if (session.status !== 'viewing') {
    return Response.json(
      { ok: false, error: 'Not in viewing state' },
      { status: 400 }
    )
  }

  const prevSlide = Math.max(0, session.currentSlide - 1)

  if (prevSlide === session.currentSlide) {
    // Already at first slide
    return Response.json({ ok: true, currentSlide: prevSlide })
  }

  updateSession({ currentSlide: prevSlide })

  return Response.json({ ok: true, currentSlide: prevSlide })
}
