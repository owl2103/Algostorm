'use client'

import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Brain, Heart, Shield, Activity, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning trained on medical data for accurate early diagnosis',
      color: 'from-[#4b7bea] to-[#6b9bf7]',
    },
    {
      icon: Heart,
      title: 'Comprehensive Analysis',
      description: 'Analyzes vitals, symptoms, and health parameters for precise predictions',
      color: 'from-[#d97f9d] to-[#e99ab3]',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security',
      color: 'from-[#e8b4a8] to-[#f0c9c0]',
    },
    {
      icon: Activity,
      title: 'Real-time Insights',
      description: 'Instant predictions with confidence scores and actionable results',
      color: 'from-[#7fbf7f] to-[#9dd49d]',
    },
  ]

  const stats = [
    { value: '98.5%', label: 'Accuracy' },
    { value: '50K+', label: 'Patients' },
    { value: '24/7', label: 'Available' },
    { value: '150+', label: 'Conditions' },
  ]

  return (
    <main className="relative min-h-screen">
      <Navbar />

      {/* Hero Section - Refined */}
      <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4b7bea]/10 text-[#4b7bea] text-sm font-medium">
              <Sparkles size={16} />
              AI-Powered Healthcare
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#2d2722] leading-[1.1] tracking-tight">
                Early Disease
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#4b7bea] via-[#d97f9d] to-[#7fbf7f]">
                  Detection
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-[#6b6159] max-w-xl leading-relaxed">
                Revolutionary diagnostics platform that detects diseases at their earliest stages. Sign in to access our prediction feature.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link href="/predict">
                  <button className="group flex items-center gap-2 clay-button bg-gradient-to-r from-[#4b7bea] to-[#7fbf7f] text-white w-full sm:w-auto px-8 py-4 text-base font-semibold">
                    Use Prediction
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <button className="group flex items-center gap-2 clay-button bg-gradient-to-r from-[#4b7bea] to-[#7fbf7f] text-white w-full sm:w-auto px-8 py-4 text-base font-semibold">
                      Get Started
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link href="/login">
                    <button className="clay-button bg-white text-[#4b7bea] border-2 border-[#4b7bea] w-full sm:w-auto px-8 py-4 font-semibold hover:bg-[#f8f6f3] transition-colors">
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="text-2xl font-bold text-[#4b7bea]">{stat.value}</div>
                  <div className="text-sm text-[#6b6159] font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual - Health AI Concept */}
          <div className="relative">
            <div className="relative clay-card p-10 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-white/90 to-[#f8f6f3]/90">
              <div className="flex flex-col items-center justify-center gap-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4b7bea] to-[#6b9bf7] flex items-center justify-center shadow-lg animate-float">
                    <Brain className="text-white" size={32} />
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d97f9d] to-[#e99ab3] flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                    <Heart className="text-white" size={28} />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7fbf7f] to-[#9dd49d] flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                    <Activity className="text-white" size={32} />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#4b7bea]/60"
                      style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <p className="text-center text-sm font-medium text-[#6b6159]">AI-powered health insights</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#2d2722] mb-4">Why MedPredict Pro?</h2>
          <p className="text-xl text-[#6b6159] max-w-2xl mx-auto">
            Cutting-edge technology combined with medical expertise for superior health predictions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#2d2722] mb-3">{feature.title}</h3>
                <p className="text-[#6b6159] leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4b7bea] via-[#6b8eea] to-[#d97f9d] p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <div className="relative space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {user
                ? 'Access the prediction feature to analyze health data and get AI-powered insights.'
                : 'Create an account to use our disease prediction feature. It\'s free for patients.'}
            </p>
            {user ? (
              <Link href="/predict">
                <button className="clay-button bg-white text-[#4b7bea] px-10 py-4 font-bold text-lg hover:bg-[#f8f6f3] transition-colors">
                  Go to Prediction
                </button>
              </Link>
            ) : (
              <Link href="/signup">
                <button className="clay-button bg-white text-[#4b7bea] px-10 py-4 font-bold text-lg hover:bg-[#f8f6f3] transition-colors">
                  Create Free Account
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
