'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { useAuth } from '@/contexts/AuthContext'

type Report = {
  id: string
  createdAt: string
  record: Record<string, unknown>
  result: { disease: string; probability: number }[]
}

export default function AccountPage() {
  const { user, isLoaded } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoaded && !user) router.replace('/login')
  }, [isLoaded, user, router])

  useEffect(() => {
    async function load() {
      if (!user?.email) return
      setLoading(true)
      setError('')
      try {
        const r = await fetch(`/api/reports?email=${encodeURIComponent(user.email)}`, { cache: 'no-store' })
        const data = (await r.json()) as { reports?: Report[]; error?: string }
        if (!r.ok) throw new Error(data.error || 'Failed to load reports')
        setReports(data.reports || [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [user?.email])

  if (!isLoaded || !user) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <div className="text-[#8b7b6f]">Loading...</div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-[#3d3530] mb-4">History</h1>
            <p className="text-[#8b7b6f] text-lg">Past symptom analyses for {user.email}</p>
          </div>

          {error ? <div className="clay-card p-4 text-red-600 mb-6">{error}</div> : null}
          {loading ? (
            <div className="text-center text-[#8b7b6f]">Loading reports…</div>
          ) : reports.length === 0 ? (
            <div className="text-center text-[#8b7b6f]">No saved analyses yet. Run a prediction to save one.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((r) => (
                <div key={r.id} className="clay-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-[#3d3530]">Diagnosis report</div>
                    <div className="text-xs text-[#8b7b6f]">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs text-[#8b7b6f] mb-1">Top prediction</div>
                    <div className="text-lg font-bold text-[#4b7bea]">
                      {r.result?.[0]?.disease ?? '—'}{' '}
                      {r.result?.[0] ? <span className="text-sm text-[#8b7b6f]">({(r.result[0].probability * 100).toFixed(1)}%)</span> : null}
                    </div>
                  </div>
                  <div className="text-sm text-[#6b6159]">
                    <span className="font-semibold text-[#3d3530]">Symptoms selected:</span>{' '}
                    {Object.entries(r.record)
                      .filter(([k, v]) => typeof v === 'number' && v === 1 && k.includes('_'))
                      .map(([k]) => k.replaceAll('_', ' '))
                      .slice(0, 8)
                      .join(', ') || '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

