import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clima Certo - Dashboard',
  description: 'O seu dashboard de clima moderno e dinâmico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
