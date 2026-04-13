import { getSession, resetSession } from '@/lib/state'

export async function GET() {
  return Response.json(getSession())
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body?.action === 'reset') {
      const session = resetSession()
      return Response.json({ ok: true, session })
    }

    return Response.json({ ok: false, error: 'Unknown action' }, { status: 400 })
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }
}
