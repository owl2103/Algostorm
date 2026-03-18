'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { useAuth } from '@/contexts/AuthContext'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signup } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password.trim()) {
      setError('Password is required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = (await r.json()) as { user?: { email: string; name: string }; error?: string }
      if (!r.ok || !data.user) throw new Error(data.error || 'Signup failed')
      signup(email, password, name)
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
              <h1 className="text-3xl font-bold text-[#3d3530]">Create Account</h1>
              <p className="text-[#8b7b6f] mt-2">Register as a patient to use prediction features</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#3d3530] mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="clay-input w-full"
                  autoComplete="name"
                />
              </div>
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
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="clay-button bg-gradient-to-r from-[#4b7bea] to-[#7fbf7f] text-white w-full py-3 font-semibold">
                Sign Up
              </button>
            </form>
            <p className="text-center text-sm text-[#8b7b6f]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#4b7bea] font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
