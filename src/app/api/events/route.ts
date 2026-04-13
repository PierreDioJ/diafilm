import { getSession, emitter } from '@/lib/state'
import type { Session } from '@/lib/state'

export const dynamic = 'force-dynamic'

export async function GET() {
  let cleanup: () => void = () => {}

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data))
        } catch {
          cleanup()
        }
      }

      // Send initial state immediately
      send(`data: ${JSON.stringify(getSession())}\n\n`)

      // Listen for updates
      const listener = (session: Session) => {
        send(`data: ${JSON.stringify(session)}\n\n`)
      }
      emitter.on('update', listener)

      // Heartbeat every 25 seconds to keep connection alive
      const hb = setInterval(() => {
        send(': heartbeat\n\n')
      }, 25_000)

      cleanup = () => {
        emitter.off('update', listener)
        clearInterval(hb)
        try {
          controller.close()
        } catch {
          // already closed
        }
      }
    },
    cancel() {
      cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
