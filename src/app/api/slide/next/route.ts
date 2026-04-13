import { getSession, updateSession, resetSession } from '@/lib/state'
import { getFilmById } from '@/lib/films'

export async function POST() {
  const session = getSession()

  if (session.status !== 'viewing' || !session.selectedFilmId) {
    return Response.json(
      { ok: false, error: 'Not in viewing state' },
      { status: 400 }
    )
  }

  const film = getFilmById(session.selectedFilmId)
  if (!film) {
    return Response.json({ ok: false, error: 'Film not found' }, { status: 404 })
  }

  const isLast = session.currentSlide >= film.totalSlides - 1

  if (isLast) {
    resetSession()
    return Response.json({ ok: true, done: true })
  }

  const nextSlide = session.currentSlide + 1
  updateSession({ currentSlide: nextSlide })

  return Response.json({ ok: true, done: false, currentSlide: nextSlide })
}
