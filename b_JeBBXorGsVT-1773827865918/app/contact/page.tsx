'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<{ id: string; name: string; message: string; createdAt: string }[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function loadMessages() {
    try {
      const r = await fetch('/api/contact', { cache: 'no-store' })
      const data = (await r.json()) as { messages?: { id: string; name: string; message: string; createdAt: string }[] }
      if (r.ok && data.messages) setMessages(data.messages)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void loadMessages()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, message: formData.message }),
      })
      const data = (await r.json()) as { error?: string }
      if (!r.ok) throw new Error(data.error || 'Failed to send')
      setFormData({ name: '', message: '' })
      await loadMessages()
    } catch (e2: unknown) {
      setError(e2 instanceof Error ? e2.message : String(e2))
    } finally {
      setSubmitting(false)
    }
  }

  const contactInfo = [
    { icon: Mail, title: 'Email', value: 'shreyaadhikary3@gmail.com', gradient: 'from-[#4b7bea]' },
    { icon: Phone, title: 'Phone', value: '7477644278', gradient: 'from-[#d97f9d]' },
    { icon: MapPin, title: 'Address', value: 'Champadanga Tarakeswar', gradient: 'from-[#7fbf7f]' },
  ]

  return (
    <main className="relative min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#3d3530] mb-8">
            Get in{' '}
            <span className="bg-gradient-to-r from-[#4b7bea] to-[#d97f9d] bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-xl text-[#8b7b6f]">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, idx) => (
              <div key={`contact-${idx}`} className="clay-card p-8 text-center">
                <div className={`w-14 h-14 bg-gradient-to-br ${info.gradient} to-transparent rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <info.icon size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#3d3530] mb-2">{info.title}</h3>
                <p className="text-[#8b7b6f]">{info.value}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto">
            <div className="clay-card p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error ? <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div> : null}
                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-3">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="clay-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3d3530] mb-3">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message..."
                    required
                    rows={6}
                    className="clay-input w-full resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="clay-button w-full bg-gradient-to-r from-[#4b7bea] to-[#d97f9d] text-white flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {submitting ? 'Sending…' : 'Send Message'}
                  <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

          {/* Messages / Reviews */}
          <div className="max-w-4xl mx-auto mt-14">
            <h2 className="text-3xl font-bold text-[#3d3530] mb-6 text-center">Messages</h2>
            {messages.length === 0 ? (
              <p className="text-center text-[#8b7b6f]">No messages yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.map((m) => (
                  <div key={m.id} className="clay-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[#3d3530]">{m.name}</div>
                      <div className="text-xs text-[#8b7b6f]">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                    <p className="text-[#6b6159] leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
