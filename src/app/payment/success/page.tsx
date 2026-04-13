export default function PaymentSuccess() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0800',
        color: '#f5e6c8',
        fontFamily: 'Georgia, serif',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✓</div>
      <h1 style={{ fontSize: '2rem', color: '#d4941e', marginBottom: '1rem' }}>
        Оплата получена!
      </h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '320px', lineHeight: 1.6 }}>
        Выберите диафильм на экране внутри будки.
      </p>
    </div>
  )
}
