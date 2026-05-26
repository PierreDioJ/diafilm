'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Session } from '@/lib/state'
import { FILMS } from '@/lib/films'
import type { Film } from '@/lib/films'

const END_RESET_SECONDS = 10

// ── Air-mouse cursor component ───────────────────────────────────────────────
function AirMouseCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`
        cursorRef.current.style.top = `${e.clientY}px`
      }
      const el = document.elementFromPoint(e.clientX, e.clientY)
      setHovering(el?.closest('button') !== null)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div ref={cursorRef} className="airmouse-cursor">
      <div
        ref={ringRef}
        className="airmouse-cursor-ring"
        style={hovering ? { width: 60, height: 60, borderColor: '#d4941e', boxShadow: '0 0 20px rgba(212,148,30,0.8)' } : undefined}
      />
      <div className="airmouse-cursor-dot" />
      <div className="airmouse-cursor-line-h" />
      <div className="airmouse-cursor-line-v" />
    </div>
  )
}

// ── Film selection screen (air-mouse optimised) ──────────────────────────────
function FilmSelection({ onSelect, loading }: { onSelect: (id: string) => void; loading: boolean }) {
  return (
    <div
      style={{ background: '#0d0800', color: '#f5e6c8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}
      className="airmouse-active relative flex flex-col overflow-hidden"
    >
      <AirMouseCursor />
      <div className="scanlines" />
      <div className="vignette" />

      <header
        style={{ borderBottom: '2px solid #5a3010', background: 'rgba(13,8,0,0.95)' }}
        className="shrink-0 z-50 flex items-center justify-between px-8 py-3"
      >
        <div style={{ color: '#d4941e', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          ◈ Диафильм
        </div>
        <div style={{ color: '#d4941e', fontSize: '0.75rem', letterSpacing: '0.15em', opacity: 0.7 }}>
          КИОСК ПРОСМОТРА
        </div>
        <div style={{ color: '#a08060', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          — ВЫБОР ФИЛЬМА —
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-10 py-8">
        <div className="fade-in w-full max-w-5xl">
          <div className="text-center mb-10">
            <div style={{ color: '#d4941e', fontSize: '0.85rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              ✦ Оплата прошла успешно ✦
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.4rem', color: '#f5e6c8', margin: '0 0 0.4rem' }}>
              Выберите диафильм
            </h2>
            <p style={{ color: '#a08060', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
              Наведите курсор и нажмите на карточку
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              padding: '0.5rem 1rem 1rem',
            }}
          >
            {FILMS.map((film, i) => (
              <button
                key={film.id}
                className="film-card"
                onClick={() => onSelect(film.id)}
                disabled={loading}
                style={{
                  padding: '2rem 2.25rem',
                  textAlign: 'left',
                  width: '100%',
                  animationDelay: `${i * 0.07}s`,
                  opacity: loading ? 0.5 : 1,
                  fontFamily: 'Georgia, serif',
                  border: 'none',
                  outline: 'none',
                  minHeight: 160,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span
                    style={{
                      background: '#d4941e',
                      color: '#0d0800',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '0.25rem 0.6rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {film.year}
                  </span>
                  <span style={{ color: '#5a3010', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                    {film.totalSlides} кадров
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '1.55rem',
                    color: '#d4941e',
                    margin: '0 0 0.6rem',
                    lineHeight: 1.2,
                  }}
                >
                  {film.title}
                </h3>

                <p style={{ color: '#a08060', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
                  {film.description}
                </p>

                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.875rem',
                    borderTop: '1px solid #2a1505',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#5a3010',
                    fontSize: '0.8rem',
                    letterSpacing: '0.12em',
                  }}
                >
                  <span>▶</span>
                  <span>СМОТРЕТЬ</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

type Curtain = { active: boolean; opacity: number; color: string }

export default function ViewerPage() {
  const [session, setSession] = useState<Session | null>(null)
  // displayedSession is what's actually rendered — lags behind session during transitions
  const [displayedSession, setDisplayedSession] = useState<Session | null>(null)
  const displayedRef = useRef<Session | null>(null)
  const inTransitionRef = useRef(false)
  const [curtain, setCurtain] = useState<Curtain>({ active: false, opacity: 0, color: '#0d0800' })

  const [loading, setLoading] = useState(false)
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [endCountdown, setEndCountdown] = useState(END_RESET_SECONDS)
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next')
  const [showEndOverlay, setShowEndOverlay] = useState(false)
  const esRef = useRef<EventSource | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const endTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isLastSlideRef = useRef(false)

  const connectSSE = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
    }
    const es = new EventSource('/api/events')
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const data: Session = JSON.parse(e.data)
        setSession((prev) => {
          if (
            prev?.status === 'viewing' &&
            data.status === 'viewing' &&
            prev.currentSlide !== data.currentSlide
          ) {
            setSlideDirection(data.currentSlide > prev.currentSlide ? 'next' : 'prev')
          }
          return data
        })
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      retryRef.current = setTimeout(() => {
        connectSSE()
      }, 3000)
    }
  }, [])

  useEffect(() => {
    connectSSE()
    return () => {
      esRef.current?.close()
      if (retryRef.current) clearTimeout(retryRef.current)
    }
  }, [connectSSE])

  // Transition manager: animates screen changes for key status transitions
  useEffect(() => {
    if (!session) {
      displayedRef.current = null
      setDisplayedSession(null)
      return
    }

    const prevStatus = displayedRef.current?.status ?? null
    const nextStatus = session.status

    // Same status → propagate immediately (e.g. slide changes within viewing)
    if (prevStatus === nextStatus || prevStatus === null) {
      displayedRef.current = session
      setDisplayedSession(session)
      return
    }

    const isAnimated =
      (prevStatus === 'payment_pending' && nextStatus === 'film_selection') ||
      (prevStatus === 'film_selection' && nextStatus === 'viewing')

    if (!isAnimated || inTransitionRef.current) {
      displayedRef.current = session
      setDisplayedSession(session)
      return
    }

    inTransitionRef.current = true
    // payment→selection: dark fade; selection→viewing: white projector flash
    const color = nextStatus === 'viewing' ? '#f5e6c8' : '#0d0800'
    const captured = session

    // Step 1 — mount curtain at opacity 0, then animate to 1
    setCurtain({ active: true, opacity: 0, color })
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCurtain({ active: true, opacity: 1, color })
      })
    })

    // Step 2 — behind the curtain: swap displayed content
    const t1 = setTimeout(() => {
      displayedRef.current = captured
      setDisplayedSession(captured)
      // Start fade-out
      setCurtain({ active: true, opacity: 0, color })
    }, 550)

    // Step 3 — curtain fully gone
    const t2 = setTimeout(() => {
      setCurtain({ active: false, opacity: 0, color: '#0d0800' })
      inTransitionRef.current = false
    }, 1150)

    return () => {
      cancelAnimationFrame(raf1)
      clearTimeout(t1)
      clearTimeout(t2)
      inTransitionRef.current = false
    }
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll YooKassa for payment status every 3 seconds when payment_pending
  useEffect(() => {
    if (session?.status !== 'payment_pending') return
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/payment/status')
        if (res.ok) {
          const data: { status: string } = await res.json()
          if (data.status !== 'payment_pending') {
            const sessionRes = await fetch('/api/session')
            if (sessionRes.ok) setSession(await sessionRes.json())
          }
        }
      } catch {
        // ignore
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [session?.status])

  // Load QR code when payment pending and confirmationUrl available
  useEffect(() => {
    if (session?.status === 'payment_pending' && session.confirmationUrl) {
      setQrSrc(`/api/qr?url=${encodeURIComponent(session.confirmationUrl)}`)
    } else {
      setQrSrc(null)
    }
  }, [session?.status, session?.confirmationUrl])

  // Keyboard handler for slide navigation
  useEffect(() => {
    if (session?.status !== 'viewing') return

    const handleKey = async (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        if (isLastSlideRef.current) {
          setShowEndOverlay(true)
        } else {
          await fetch('/api/slide/next', { method: 'POST' })
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        await fetch('/api/slide/prev', { method: 'POST' })
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [session?.status])

  // Use displayedSession for rendering; real session for slide-change logic
  const ds = displayedSession
  const selectedFilm = ds?.selectedFilmId
    ? FILMS.find((f) => f.id === ds.selectedFilmId)
    : null

  // isLastSlide based on real session so countdown triggers at the right time
  const isLastSlide =
    session?.status === 'viewing' &&
    selectedFilm &&
    session.currentSlide >= selectedFilm.totalSlides - 1

  useEffect(() => {
    isLastSlideRef.current = !!isLastSlide
    if (!isLastSlide) setShowEndOverlay(false)
  }, [isLastSlide])

  useEffect(() => {
    if (!showEndOverlay) {
      if (endTimerRef.current) {
        clearInterval(endTimerRef.current)
        endTimerRef.current = null
      }
      setEndCountdown(END_RESET_SECONDS)
      return
    }

    setEndCountdown(END_RESET_SECONDS)
    endTimerRef.current = setInterval(() => {
      setEndCountdown((prev) => {
        if (prev <= 1) {
          if (endTimerRef.current) clearInterval(endTimerRef.current)
          fetch('/api/slide/next', { method: 'POST' }).catch(() => {})
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (endTimerRef.current) {
        clearInterval(endTimerRef.current)
        endTimerRef.current = null
      }
    }
  }, [showEndOverlay])

  const handlePayment = async () => {
    setLoading(true)
    try {
      await fetch('/api/payment/create', { method: 'POST' })
    } catch {
      // state update will come via SSE
    } finally {
      setLoading(false)
    }
  }

  const handleDemoConfirm = async () => {
    setLoading(true)
    try {
      await fetch('/api/payment/demo-confirm', { method: 'POST' })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleFilmSelect = async (filmId: string) => {
    setLoading(true)
    try {
      await fetch('/api/film/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filmId }),
      })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (isLastSlide) {
      setShowEndOverlay(true)
      return
    }
    await fetch('/api/slide/next', { method: 'POST' })
  }

  const handlePrev = async () => {
    await fetch('/api/slide/prev', { method: 'POST' })
  }

  const slideNum = ds?.currentSlide ?? 0
  const slideDisplay = slideNum + 1

  return (
    <>
      {/* ── Screen curtain ───────────────────────────────────────────────────── */}
      {curtain.active && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: curtain.color,
            opacity: curtain.opacity,
            transition: 'opacity 0.55s ease',
            zIndex: 99998,
            pointerEvents: curtain.opacity > 0.01 ? 'all' : 'none',
            willChange: 'opacity',
          }}
        />
      )}

      {/* ── IDLE ─────────────────────────────────────────────────────────────── */}
      {(!ds || ds.status === 'idle') && (
        <div
          style={{ background: '#0d0800', color: '#f5e6c8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}
          className="airmouse-active relative flex flex-col items-center justify-center overflow-hidden"
        >
          <AirMouseCursor />
          <div className="scanlines" />
          <div className="vignette" />
          <header
            style={{ borderBottom: '2px solid #5a3010', background: 'rgba(13,8,0,0.95)' }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3"
          >
            <div style={{ color: '#d4941e', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>◈ Диафильм</div>
            <div style={{ color: '#d4941e', fontSize: '0.75rem', letterSpacing: '0.15em', opacity: 0.7 }}>КИОСК ПРОСМОТРА</div>
            <div style={{ color: '#a08060', fontSize: '0.75rem', letterSpacing: '0.1em' }}>— ОЖИДАНИЕ —</div>
          </header>
          <main className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-8 pt-20 pb-12">
            <div className="fade-in flex flex-col items-center gap-8 max-w-lg text-center">
              <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 20px rgba(212,148,30,0.4))' }} className="flicker">🎞</div>
              <div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3rem', color: '#d4941e', letterSpacing: '0.05em', margin: 0, lineHeight: 1.1 }} className="amber-glow-text">
                  ДИАФИЛЬМ
                </h1>
                <p style={{ color: '#a08060', fontSize: '0.9rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
                  советский кинематограф
                </p>
              </div>
              <div className="ornament" style={{ width: '100%' }}>✦</div>
              <p style={{ color: '#f5e6c8', fontSize: '1.1rem', lineHeight: 1.7, opacity: 0.9 }}>
                Окунитесь в мир советских диафильмов.<br />
                Выберите картину и насладитесь просмотром<br />
                в аутентичной будке диапроектора.
              </p>
              <div style={{ border: '2px solid #d4941e', padding: '1rem 2.5rem', position: 'relative' }} className="corner-frame">
                <div style={{ color: '#a08060', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Стоимость сеанса</div>
                <div style={{ color: '#d4941e', fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>300 ₽</div>
              </div>
              <button className="btn-primary amber-glow" onClick={handlePayment} disabled={loading} style={{ fontSize: '1.4rem', padding: '1rem 3rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? '...' : 'ОПЛАТИТЬ'}
              </button>
              <p style={{ color: '#5a3010', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Оплата через ЮКасса • Безопасно и быстро</p>
            </div>
          </main>
          <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #1a0a00', padding: '0.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, background: 'rgba(13,8,0,0.9)' }}>
            <span style={{ color: '#2a1505', fontSize: '0.7rem', letterSpacing: '0.1em' }}>▪ ЭКРАН</span>
            <span style={{ color: '#2a1505', fontSize: '0.7rem', letterSpacing: '0.1em' }}>ДИАФИЛЬМ ©</span>
          </footer>
        </div>
      )}

      {/* ── PAYMENT PENDING ──────────────────────────────────────────────────── */}
      {ds?.status === 'payment_pending' && (
        <div
          style={{ background: '#0d0800', color: '#f5e6c8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}
          className="relative flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="scanlines" />
          <div className="vignette" />
          <header
            style={{ borderBottom: '2px solid #5a3010', background: 'rgba(13,8,0,0.95)' }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3"
          >
            <div style={{ color: '#d4941e', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>◈ Диафильм</div>
            <div style={{ color: '#d4941e', fontSize: '0.75rem', letterSpacing: '0.15em', opacity: 0.7 }}>КИОСК ПРОСМОТРА</div>
            <div style={{ color: '#a08060', fontSize: '0.75rem', letterSpacing: '0.1em' }}>— ОПЛАТА —</div>
          </header>
          <main className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-8 pt-20 pb-12">
            <div className="fade-in flex flex-col items-center gap-8 max-w-lg text-center">
              <div style={{ color: '#d4941e', fontSize: '1.5rem', letterSpacing: '0.1em' }} className="pulse-amber">⬡ ОЖИДАНИЕ ОПЛАТЫ</div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#f5e6c8', margin: 0 }}>Отсканируйте QR-код для оплаты</h2>
              <div style={{ background: '#fff', padding: '1rem', border: '4px solid #d4941e', borderRadius: '2px' }} className="amber-glow">
                {qrSrc ? (
                  <img src={qrSrc} alt="QR код для оплаты" style={{ width: 220, height: 220, display: 'block' }} />
                ) : (
                  <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#333', fontSize: '0.875rem' }}>
                    Загрузка QR...
                  </div>
                )}
              </div>
              <div style={{ border: '1px solid #5a3010', padding: '0.75rem 2rem', background: 'rgba(26,15,2,0.8)' }}>
                <div style={{ color: '#a08060', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>К оплате</div>
                <div style={{ color: '#d4941e', fontSize: '2rem', fontWeight: 'bold' }}>300 ₽</div>
              </div>
              <p style={{ color: '#a08060', fontSize: '0.875rem', lineHeight: 1.6 }}>
                После оплаты страница обновится автоматически.<br />
                Нажмите кнопку на телефоне для подтверждения.
              </p>
              <button className="btn-secondary" onClick={handleDemoConfirm} disabled={loading}>
                ПОДТВЕРДИТЬ ОПЛАТУ (ДЕМО)
              </button>
            </div>
          </main>
        </div>
      )}

      {/* ── FILM SELECTION ───────────────────────────────────────────────────── */}
      {ds?.status === 'film_selection' && (
        <FilmSelection onSelect={handleFilmSelect} loading={loading} />
      )}

      {/* ── VIEWING ──────────────────────────────────────────────────────────── */}
      {ds?.status === 'viewing' && selectedFilm && (
        <div
          style={{ background: '#000', color: '#f5e6c8', height: '100vh', fontFamily: 'Georgia, serif', overflow: 'hidden' }}
          className="relative flex flex-col"
        >
          <div className="scanlines" />
          <div className="flex-1 flex items-stretch relative">
            {/* Left sprocket strip */}
            <div style={{ width: 44, background: '#0a0500', borderRight: '2px solid #2a1505', flexShrink: 0, backgroundImage: 'radial-gradient(circle, #000 55%, transparent 56%)', backgroundSize: '44px 56px', backgroundRepeat: 'repeat-y', backgroundPosition: 'center' }} />

            {/* Main slide area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#050200', position: 'relative' }}>
              <div style={{ height: 8, background: '#0a0500', borderBottom: '1px solid #1a0a00' }} />
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
                <img
                  key={slideNum}
                  src={`/api/film-image?id=${selectedFilm.id}&slide=${slideNum}`}
                  alt={`${selectedFilm.title} — кадр ${slideDisplay}`}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = `/api/slide-placeholder?film=${encodeURIComponent(selectedFilm.title)}&slide=${slideDisplay}&total=${selectedFilm.totalSlides}`
                  }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}
                  className={`flicker ${slideDirection === 'next' ? 'slide-enter-right' : 'slide-enter-left'}`}
                />
                <button onClick={handlePrev} style={{ position: 'absolute', left: 0, top: 0, width: '25%', height: '100%', background: 'transparent', border: 'none', cursor: slideNum > 0 ? 'w-resize' : 'default', opacity: 0 }} aria-label="Предыдущий кадр" />
                <button onClick={handleNext} style={{ position: 'absolute', right: 0, top: 0, width: '25%', height: '100%', background: 'transparent', border: 'none', cursor: 'e-resize', opacity: 0 }} aria-label="Следующий кадр" />
              </div>
              <div style={{ height: 8, background: '#0a0500', borderTop: '1px solid #1a0a00' }} />

              {/* Bottom info bar */}
              <div style={{ height: 64, background: '#080400', borderTop: '2px solid #1a0a00', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
                <div>
                  <div style={{ color: '#d4941e', fontSize: '1.1rem', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>{selectedFilm.title}</div>
                  <div style={{ color: '#5a3010', fontSize: '0.75rem', letterSpacing: '0.1em' }}>{selectedFilm.year} г.</div>
                </div>
                <div style={{ color: '#d4941e', fontSize: '1.3rem', fontFamily: 'monospace', letterSpacing: '0.1em', background: 'rgba(212,148,30,0.08)', border: '1px solid #3a2010', padding: '0.25rem 0.75rem' }}>
                  {slideDisplay} / {selectedFilm.totalSlides}
                </div>
              </div>
            </div>

            {/* Right sprocket strip */}
            <div style={{ width: 44, background: '#0a0500', borderLeft: '2px solid #2a1505', flexShrink: 0, backgroundImage: 'radial-gradient(circle, #000 55%, transparent 56%)', backgroundSize: '44px 56px', backgroundRepeat: 'repeat-y', backgroundPosition: 'center' }} />
          </div>

          {/* END OF FILM overlay */}
          {showEndOverlay && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,8,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }} className="fade-in">
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }} className="flicker">🎞</div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', color: '#d4941e', margin: '0 0 0.5rem', letterSpacing: '0.1em' }} className="amber-glow-text">
                Конец диафильма
              </h2>
              <p style={{ color: '#a08060', fontSize: '1.1rem', marginBottom: '2rem' }}>«{selectedFilm.title}»</p>
              <div className="ornament" style={{ width: 300, marginBottom: '2rem' }}>✦</div>
              <div style={{ border: '1px solid #5a3010', padding: '0.75rem 2rem', textAlign: 'center' }}>
                <div style={{ color: '#a08060', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Сброс через</div>
                <div style={{ color: '#d4941e', fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{endCountdown}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LOADING FALLBACK ─────────────────────────────────────────────────── */}
      {!ds && (
        <div style={{ background: '#0d0800', color: '#f5e6c8', minHeight: '100vh', fontFamily: 'Georgia, serif' }} className="flex items-center justify-center">
          <p style={{ color: '#5a3010' }}>Загрузка...</p>
        </div>
      )}
    </>
  )
}
