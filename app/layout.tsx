import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Latency Topology Visualizer',
  description: 'Real-time cryptocurrency exchange network monitoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}