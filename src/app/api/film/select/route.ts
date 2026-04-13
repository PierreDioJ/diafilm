import { getSession, updateSession } from '@/lib/state'
import { getFilmById } from '@/lib/films'

export async function POST(request: Request) {
  const session = getSession()

  if (session.status !== 'film_selection') {
    return Response.json(
      { ok: false, error: 'Not in film selection state' },
      { status: 400 }
    )
  }

  let filmId: string
  try {
    const body = await request.json()
    filmId = body?.filmId
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  if (!filmId || typeof filmId !== 'string') {
    return Response.json({ ok: false, error: 'filmId is required' }, { status: 400 })
  }

  const film = getFilmById(filmId)
  if (!film) {
    return Response.json({ ok: false, error: 'Film not found' }, { status: 404 })
  }

  updateSession({
    status: 'viewing',
    selectedFilmId: filmId,
    currentSlide: 0,
  })

  return Response.json({ ok: true, film })
}
