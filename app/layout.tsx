import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BetterTime',
  description: 'Single-day planner web app for university students designed to improve time management and sleep.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
