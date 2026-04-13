import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Диафильм — Советский Киоск',
  description: 'Просмотр советских диафильмов',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
