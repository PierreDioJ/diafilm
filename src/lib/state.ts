import { EventEmitter } from 'events'

export type SessionStatus = 'idle' | 'payment_pending' | 'film_selection' | 'viewing'

export interface Session {
  status: SessionStatus
  paymentId: string | null
  confirmationUrl: string | null
  selectedFilmId: string | null
  currentSlide: number
  paidAt: number | null
}

const defaultSession = (): Session => ({
  status: 'idle',
  paymentId: null,
  confirmationUrl: null,
  selectedFilmId: null,
  currentSlide: 0,
  paidAt: null,
})

// Use globalThis to persist state across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __diafilm_session: Session | undefined
  // eslint-disable-next-line no-var
  var __diafilm_emitter: EventEmitter | undefined
}

if (!globalThis.__diafilm_session) {
  globalThis.__diafilm_session = defaultSession()
}

if (!globalThis.__diafilm_emitter) {
  const emitter = new EventEmitter()
  emitter.setMaxListeners(100)
  globalThis.__diafilm_emitter = emitter
}

export const emitter: EventEmitter = globalThis.__diafilm_emitter!

export function getSession(): Session {
  return globalThis.__diafilm_session!
}

export function updateSession(patch: Partial<Session>): Session {
  const next: Session = { ...globalThis.__diafilm_session!, ...patch }
  globalThis.__diafilm_session = next
  emitter.emit('update', next)
  return next
}

export function resetSession(): Session {
  const next = defaultSession()
  globalThis.__diafilm_session = next
  emitter.emit('update', next)
  return next
}
