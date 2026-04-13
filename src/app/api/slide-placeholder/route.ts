import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const film = params.get('film') ?? 'Диафильм'
  const slide = parseInt(params.get('slide') ?? '1', 10)
  const total = parseInt(params.get('total') ?? '1', 10)

  // Calculate progress bar width
  const progress = Math.round((slide / total) * 100)

  // Generate a pseudo-random scene description based on slide number for variety
  const scenes = [
    'Далеко-далеко, за лесами...',
    'Однажды в тёплый летний день...',
    'В волшебном лесу жили-были...',
    'Солнце светило ярко...',
    'На лесной опушке...',
    'У синего моря...',
    'За горами, за долами...',
    'Тихим вечером у костра...',
    'В старом добром городе...',
    'Когда-то давным-давно...',
  ]
  const sceneText = scenes[(slide - 1) % scenes.length]

  // Decorative dots pattern (simulating film grain)
  const dots = Array.from({ length: 30 }, (_, i) => {
    const x = ((i * 73 + 17) % 460) + 20
    const y = ((i * 37 + 53) % 260) + 60
    const r = (i % 3) + 1
    const opacity = (0.03 + (i % 5) * 0.01).toFixed(2)
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#d4941e" opacity="${opacity}"/>`
  }).join('')

  // Sprocket holes
  const sprocketsLeft = Array.from({ length: 7 }, (_, i) => {
    const y = 40 + i * 50
    return `<rect x="8" y="${y}" width="16" height="28" rx="3" ry="3" fill="#000" opacity="0.8"/>`
  }).join('')

  const sprocketsRight = Array.from({ length: 7 }, (_, i) => {
    const y = 40 + i * 50
    return `<rect x="476" y="${y}" width="16" height="28" rx="3" ry="3" fill="#000" opacity="0.8"/>`
  }).join('')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="380" viewBox="0 0 500 380">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1e0f03"/>
      <stop offset="100%" stop-color="#0a0500"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="40%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.7)"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="500" height="380" fill="url(#bg)"/>

  <!-- Film strip left edge -->
  <rect x="0" y="0" width="36" height="380" fill="#0d0600"/>
  <rect x="34" y="0" width="2" height="380" fill="#2a1505"/>

  <!-- Film strip right edge -->
  <rect x="464" y="0" width="36" height="380" fill="#0d0600"/>
  <rect x="464" y="0" width="2" height="380" fill="#2a1505"/>

  <!-- Sprocket holes -->
  ${sprocketsLeft}
  ${sprocketsRight}

  <!-- Film grain dots -->
  ${dots}

  <!-- Main frame border -->
  <rect x="44" y="12" width="412" height="356" fill="none" stroke="#2a1505" stroke-width="1"/>
  <rect x="46" y="14" width="408" height="352" fill="none" stroke="#1a0a02" stroke-width="1"/>

  <!-- Inner frame highlight -->
  <rect x="50" y="18" width="400" height="344" fill="none" stroke="#3a1f08" stroke-width="0.5" opacity="0.5"/>

  <!-- Vignette overlay -->
  <rect x="36" y="0" width="428" height="380" fill="url(#vignette)" opacity="0.5"/>

  <!-- Corner ornaments -->
  <path d="M50 18 L70 18 M50 18 L50 38" stroke="#d4941e" stroke-width="1.5" opacity="0.6"/>
  <path d="M450 18 L430 18 M450 18 L450 38" stroke="#d4941e" stroke-width="1.5" opacity="0.6"/>
  <path d="M50 362 L70 362 M50 362 L50 342" stroke="#d4941e" stroke-width="1.5" opacity="0.6"/>
  <path d="M450 362 L430 362 M450 362 L450 342" stroke="#d4941e" stroke-width="1.5" opacity="0.6"/>

  <!-- Scene illustration area (decorative frame) -->
  <rect x="70" y="40" width="360" height="220" fill="#0d0600" opacity="0.5" rx="1"/>
  <rect x="72" y="42" width="356" height="216" fill="none" stroke="#2a1505" stroke-width="0.5"/>

  <!-- Decorative scene: simple stylized landscape -->
  <!-- Sky -->
  <rect x="72" y="42" width="356" height="140" fill="#0a0f1a" rx="1"/>
  <!-- Stars -->
  <circle cx="120" cy="70" r="1.5" fill="#f5e6c8" opacity="0.6"/>
  <circle cx="200" cy="55" r="1" fill="#f5e6c8" opacity="0.5"/>
  <circle cx="280" cy="80" r="1.5" fill="#f5e6c8" opacity="0.7"/>
  <circle cx="350" cy="60" r="1" fill="#f5e6c8" opacity="0.4"/>
  <circle cx="400" cy="75" r="2" fill="#f5e6c8" opacity="0.5"/>
  <circle cx="160" cy="100" r="1" fill="#f5e6c8" opacity="0.3"/>
  <circle cx="320" cy="95" r="1.5" fill="#f5e6c8" opacity="0.4"/>
  <!-- Moon -->
  <circle cx="380" cy="80" r="18" fill="#d4941e" opacity="0.15"/>
  <circle cx="385" cy="75" r="15" fill="#0a0f1a" opacity="0.6"/>

  <!-- Ground -->
  <rect x="72" y="182" width="356" height="76" fill="#0f0800"/>

  <!-- Horizon line -->
  <line x1="72" y1="182" x2="428" y2="182" stroke="#2a1505" stroke-width="1"/>

  <!-- Trees silhouettes -->
  <polygon points="110,182 125,130 140,182" fill="#0d0600"/>
  <polygon points="130,182 148,120 166,182" fill="#0a0500"/>
  <polygon points="360,182 375,135 390,182" fill="#0d0600"/>
  <polygon points="380,182 396,125 412,182" fill="#0a0500"/>

  <!-- House silhouette -->
  <rect x="200" y="152" width="60" height="30" fill="#120800"/>
  <polygon points="195,152 230,125 265,152" fill="#0f0600"/>
  <!-- Window light -->
  <rect x="212" y="160" width="10" height="12" fill="#d4941e" opacity="0.3"/>
  <rect x="238" y="160" width="10" height="12" fill="#d4941e" opacity="0.2"/>

  <!-- Text area -->
  <!-- Film title -->
  <text x="250" y="295"
    font-family="Georgia, serif"
    font-size="18"
    font-weight="bold"
    fill="#d4941e"
    text-anchor="middle"
    opacity="0.95"
  >${escapeXml(film)}</text>

  <!-- Ornamental line -->
  <line x1="130" y1="303" x2="220" y2="303" stroke="#5a3010" stroke-width="0.5"/>
  <text x="250" y="307" font-family="serif" font-size="8" fill="#d4941e" text-anchor="middle" opacity="0.5">✦</text>
  <line x1="280" y1="303" x2="370" y2="303" stroke="#5a3010" stroke-width="0.5"/>

  <!-- Scene description -->
  <text x="250" y="325"
    font-family="Georgia, serif"
    font-size="11"
    fill="#a08060"
    text-anchor="middle"
    font-style="italic"
    opacity="0.8"
  >${escapeXml(sceneText)}</text>

  <!-- Slide number -->
  <text x="250" y="350"
    font-family="monospace, serif"
    font-size="10"
    fill="#5a3010"
    text-anchor="middle"
    letter-spacing="3"
  >— КАДР ${slide} / ${total} —</text>

  <!-- Progress bar -->
  <rect x="80" y="360" width="340" height="3" fill="#1a0a00" rx="1"/>
  <rect x="80" y="360" width="${Math.round(3.4 * progress)}" height="3" fill="#d4941e" rx="1" opacity="0.6"/>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
