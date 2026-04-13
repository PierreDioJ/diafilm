'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminResetPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleReset = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })
      if (res.ok) {
        setMessage('Сеанс сброшен. Перенаправление...')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setMessage('Ошибка при сбросе сеанса.')
        setLoading(false)
      }
    } catch {
      setMessage('Ошибка соединения.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: '#0d0800',
        color: '#f5e6c8',
        minHeight: '100vh',
        fontFamily: 'Georgia, serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '2rem',
      }}
    >
      <div className="scanlines" />
      <div className="vignette" />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Warning icon */}
        <div
          style={{
            width: 80,
            height: 80,
            border: '3px solid #c0392b',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#c0392b',
          }}
        >
          ⚠
        </div>

        <div>
          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '1.8rem',
              color: '#d4941e',
              margin: '0 0 0.5rem',
              letterSpacing: '0.08em',
            }}
          >
            ПАНЕЛЬ ОПЕРАТОРА
          </h1>
          <p style={{ color: '#a08060', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>
            Сброс сеанса
          </p>
        </div>

        <div
          style={{
            border: '1px solid #5a3010',
            padding: '1.5rem',
            background: 'rgba(26,15,2,0.8)',
            width: '100%',
          }}
        >
          <p style={{ color: '#f5e6c8', lineHeight: 1.7, margin: 0 }}>
            Эта операция немедленно завершит текущий сеанс
            и вернёт систему в исходное состояние.
          </p>
          <p style={{ color: '#c0392b', fontSize: '0.85rem', marginTop: '0.75rem', marginBottom: 0 }}>
            Действие невозможно отменить.
          </p>
        </div>

        <button
          className="btn-danger"
          onClick={handleReset}
          disabled={loading}
          style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'СБРОС...' : 'СБРОСИТЬ СЕАНС'}
        </button>

        {message && (
          <p
            style={{
              color: message.includes('Ошибка') ? '#c0392b' : '#27ae60',
              fontSize: '0.95rem',
              letterSpacing: '0.05em',
            }}
          >
            {message}
          </p>
        )}

        <a
          href="/"
          style={{
            color: '#5a3010',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          ← Вернуться на экран входа
        </a>
      </div>
    </div>
  )
}
