import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Content Engine — Submit Topic',
  description: 'Submit a topic for LinkedIn content generation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">{children}</body>
    </html>
  )
}
