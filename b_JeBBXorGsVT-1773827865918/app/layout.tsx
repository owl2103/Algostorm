import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import AnimatedBackground from '@/components/animated-background'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'MedPredictPro - Early Disease Detection',
  description: 'Advanced ML-powered early disease detection system for accurate health predictions',
  icons: {
    icon: '/icon.svg?v=2',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <Providers>
          <AnimatedBackground />
          {children}
        </Providers>
      </body>
    </html>
  )
}
