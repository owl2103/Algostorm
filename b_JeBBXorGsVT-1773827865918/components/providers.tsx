'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { RemoveNextJsDevtools } from '@/components/remove-nextjs-devtools'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RemoveNextJsDevtools />
      {children}
    </AuthProvider>
  )
}
