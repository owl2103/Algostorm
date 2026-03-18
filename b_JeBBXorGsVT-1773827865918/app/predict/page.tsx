'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ProbabilityBarChart } from '@/components/probability-bar-chart'
import { SYMPTOMS, DEFAULT_RECORD } from '@/lib/schema'
import { useAuth } from '@/contexts/AuthContext'

type TopPrediction = { disease: string; probability: number }
type PredictResponse = { top_predictions: TopPrediction[] }

export default function PredictPage() {
  const { user, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace('/login')
    }
  }, [isLoaded, user, router])

  const [record, setRecord] = useState<Record<string, unknown>>({ ...DEFAULT_RECORD })
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({})
  const [topK, setTopK] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PredictResponse | null>(null)

  async function onPredict() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        record: {
          ...record,
          ...Object.fromEntries(SYMPTOMS.map((s) => [s, symptoms[s] ? 1 : 0])),
        },
        top_k: topK,
      }
      const base = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
      const r = await fetch(`${base}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(`Predict failed: ${r.status} ${text}`)
      }
      const data: PredictResponse = await r.json()
      setResult(data)

      // Save report for logged-in user (MongoDB)
      if (user?.email) {
        void fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            record: payload.record,
            topK,
            result: data.top_predictions,
          }),
        })
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

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

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-[#3d3530] mb-6">
              Health Prediction{' '}
              <span className="bg-gradient-to-r from-[#4b7bea] to-[#d97f9d] bg-clip-text text-transparent">
                Analysis
              </span>
            </h1>
            <p className="text-xl text-[#8b7b6f] max-w-2xl mx-auto">
              Enter patient vitals and symptoms. Our AI model predicts likely diseases with confidence scores.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient inputs */}
            <div className="clay-card p-8 md:p-10 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#3d3530]">Patient inputs</h2>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-[#3d3530]">
                    Top-K
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={topK}
                      onChange={(e) => setTopK(Number(e.target.value))}
                      className="clay-input w-16 ml-2"
                    />
                  </label>
                  <button
                    onClick={onPredict}
                    disabled={loading}
                    className="clay-button bg-gradient-to-r from-[#4b7bea] to-[#7fbf7f] text-white px-6 py-2 disabled:opacity-70"
                  >
                    {loading ? 'Predicting…' : 'Predict'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Age</label>
                  <input
                    type="number"
                    className="clay-input w-full"
                    value={String(record.age ?? '')}
                    onChange={(e) => setRecord({ ...record, age: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Sex</label>
                  <select
                    className="clay-input w-full"
                    value={String(record.sex ?? 'M')}
                    onChange={(e) => setRecord({ ...record, sex: e.target.value })}
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Smoker</label>
                  <select
                    className="clay-input w-full"
                    value={String(record.smoker ?? 'no')}
                    onChange={(e) => setRecord({ ...record, smoker: e.target.value })}
                  >
                    <option value="no">no</option>
                    <option value="yes">yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Activity</label>
                  <select
                    className="clay-input w-full"
                    value={String(record.activity_level ?? 'medium')}
                    onChange={(e) => setRecord({ ...record, activity_level: e.target.value })}
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">BMI</label>
                  <input
                    type="number"
                    step="0.1"
                    className="clay-input w-full"
                    value={String(record.bmi ?? '')}
                    onChange={(e) => setRecord({ ...record, bmi: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="clay-input w-full"
                    value={String(record.temperature_c ?? '')}
                    onChange={(e) => setRecord({ ...record, temperature_c: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Heart rate</label>
                  <input
                    type="number"
                    className="clay-input w-full"
                    value={String(record.heart_rate ?? '')}
                    onChange={(e) => setRecord({ ...record, heart_rate: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">SpO2 (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="clay-input w-full"
                    value={String(record.spo2 ?? '')}
                    onChange={(e) => setRecord({ ...record, spo2: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Systolic BP</label>
                  <input
                    type="number"
                    className="clay-input w-full"
                    value={String(record.systolic_bp ?? '')}
                    onChange={(e) => setRecord({ ...record, systolic_bp: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Diastolic BP</label>
                  <input
                    type="number"
                    className="clay-input w-full"
                    value={String(record.diastolic_bp ?? '')}
                    onChange={(e) => setRecord({ ...record, diastolic_bp: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Glucose (mg/dL)</label>
                  <input
                    type="number"
                    className="clay-input w-full"
                    value={String(record.fasting_glucose_mg_dl ?? '')}
                    onChange={(e) => setRecord({ ...record, fasting_glucose_mg_dl: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">HbA1c (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="clay-input w-full"
                    value={String(record.hba1c_pct ?? '')}
                    onChange={(e) => setRecord({ ...record, hba1c_pct: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-2">Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    className="clay-input w-full"
                    value={String(record.total_cholesterol_mg_dl ?? '')}
                    onChange={(e) => setRecord({ ...record, total_cholesterol_mg_dl: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="border-t border-[#e8b4a8]/30 pt-6">
                <h3 className="text-sm font-semibold text-[#3d3530] mb-3">Symptoms (select all that apply)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SYMPTOMS.map((s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2 p-2 rounded-lg border border-[#e8b4a8]/30 hover:bg-[#f5f2ee]/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!symptoms[s]}
                        onChange={(e) => setSymptoms({ ...symptoms, [s]: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-[#3d3530]">{s.replaceAll('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error ? <div className="text-sm text-red-500">{error}</div> : null}
            </div>

            {/* Prediction result */}
            <div className="clay-card p-8 md:p-10">
              <h2 className="text-xl font-bold text-[#3d3530] mb-6">Prediction result</h2>
              {!result ? (
                <p className="text-[#8b7b6f]">Submit inputs to see top predictions.</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-[#e8b4a8]/30 bg-[#f5f2ee]/50">
                      <div className="text-xs text-[#8b7b6f]">Top prediction</div>
                      <div className="text-lg font-bold text-[#4b7bea]">{result.top_predictions[0]?.disease ?? '—'}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-[#e8b4a8]/30 bg-[#f5f2ee]/50">
                      <div className="text-xs text-[#8b7b6f]">Confidence</div>
                      <div className="text-lg font-bold text-[#4b7bea]">
                        {result.top_predictions[0] ? `${(result.top_predictions[0].probability * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                  </div>
                  <ProbabilityBarChart data={result.top_predictions} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
