'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password.trim()) {
      setError('Password is required')
      return
    }
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await r.json()) as { user?: { email: string; name: string }; error?: string }
      if (!r.ok || !data.user) throw new Error(data.error || 'Login failed')
      login(email, password)
      router.push('/predict')
    } catch (e2: unknown) {
      setError(e2 instanceof Error ? e2.message : String(e2))
    }
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <div className="clay-card p-8 md:p-10 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[#3d3530]">Sign In</h1>
              <p className="text-[#8b7b6f] mt-2">Access your account to use the prediction feature</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#3d3530] mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="clay-input w-full"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#3d3530] mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="clay-input w-full"
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="clay-button bg-gradient-to-r from-[#4b7bea] to-[#7fbf7f] text-white w-full py-3 font-semibold">
                Sign In
              </button>
            </form>
            <p className="text-center text-sm text-[#8b7b6f]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#4b7bea] font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
