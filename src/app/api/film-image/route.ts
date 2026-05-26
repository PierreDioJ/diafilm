import { type NextRequest } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { getFilmById } from '@/lib/films'

// Cache sorted file lists per folder to avoid repeated readdir calls
const fileCache = new Map<string, string[]>()

async function getSlides(folderPath: string): Promise<string[]> {
  if (fileCache.has(folderPath)) return fileCache.get(folderPath)!
  const entries = await readdir(folderPath)
  const images = entries
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort()
  fileCache.set(folderPath, images)
  return images
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const slideStr = searchParams.get('slide')

  if (!id || slideStr === null) {
    return new Response('Bad Request', { status: 400 })
  }

  const film = getFilmById(id)
  if (!film) {
    return new Response('Not Found', { status: 404 })
  }

  const slideIndex = parseInt(slideStr, 10)
  if (isNaN(slideIndex) || slideIndex < 0 || slideIndex >= film.totalSlides) {
    return new Response('Not Found', { status: 404 })
  }

  const folderPath = path.join(process.cwd(), 'diafilms', film.folder)

  try {
    const slides = await getSlides(folderPath)
    const filename = slides[slideIndex]
    if (!filename) return new Response('Not Found', { status: 404 })

    const buffer = await readFile(path.join(folderPath, filename))
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not Found', { status: 404 })
  }
}
