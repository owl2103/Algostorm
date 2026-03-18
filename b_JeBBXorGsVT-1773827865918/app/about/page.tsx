'use client'

import Image from 'next/image'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CheckCircle, Users, Zap, Target } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Accuracy First',
      description: 'We prioritize diagnostic accuracy above all else.',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Users,
      title: 'Patient Care',
      description: 'Every feature is designed with patient wellbeing in mind.',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Continuously advancing medical technology and AI research.',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: CheckCircle,
      title: 'Trust',
      description: 'Building confidence through transparency and compliance.',
      gradient: 'from-pink-500 to-pink-600',
    },
  ]

  const team = [
    {
      name: 'Shreya Adhikary',
      role: 'Full Stack Developer',
      email: 'shreyaadhikary3@gmail.com',
      image: '/shreya.png',
      color: 'from-[#d97f9d]',
    },
    {
      name: 'Niti Mahajan',
      role: 'UI/UX Designer',
      email: 'nitimohajan125@gmail.com',
      image: '/Niti.png',
      color: 'from-[#e8b4a8]',
    },
    {
      name: 'Ritika Gupta',
      role: 'Backend Designer',
      email: 'ritikagupta0511@gmail.com',
      image: '/Ritika.png',
      color: 'from-[#4b7bea]',
    },
    {
      name: 'Soumi Samanta',
      role: 'Frontend Developer',
      email: 'soumiiem31@gmail.com',
      image: '/soumi.png',
      color: 'from-[#7fbf7f]',
    },
  ]

  return (
    <main className="relative min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#3d3530] mb-8">
            About{' '}
            <span className="bg-gradient-to-r from-[#4b7bea] to-[#d97f9d] bg-clip-text text-transparent">
              MedPredict Pro
            </span>
          </h1>
          <p className="text-xl text-[#8b7b6f] leading-relaxed">
            Transforming healthcare through advanced artificial intelligence and machine learning to detect diseases early and save lives.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#3d3530]">Our Mission</h2>
              <div className="space-y-4 text-[#8b7b6f] leading-relaxed">
                <p>
                  MedPredict Pro is dedicated to revolutionizing early disease detection through cutting-edge artificial intelligence and machine learning technology. We believe that early diagnosis can save millions of lives globally.
                </p>
                <p>
                  Our platform leverages advanced neural networks trained on millions of medical records to provide healthcare professionals with accurate, reliable predictions. We're committed to making healthcare more accessible, affordable, and effective.
                </p>
              </div>
            </div>

            <div className="clay-card p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4b7bea] to-[#7fbf7f] rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3d3530] mb-2">98.5% Accuracy</h3>
                  <p className="text-[#8b7b6f] text-sm">Our ML models achieve industry-leading accuracy in disease detection.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#d97f9d] to-[#e8b4a8] rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3d3530] mb-2">HIPAA Compliant</h3>
                  <p className="text-[#8b7b6f] text-sm">Enterprise-grade security meets all healthcare compliance standards.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7fbf7f] to-[#4b7bea] rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3d3530] mb-2">24/7 Support</h3>
                  <p className="text-[#8b7b6f] text-sm">Round-the-clock support for healthcare professionals worldwide.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#3d3530] mb-4">Our Values</h2>
            <p className="text-xl text-[#8b7b6f]">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon
              return (
              <div key={`value-${idx}`} className="clay-card p-6 group">
                <div className={`w-12 h-12 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#3d3530] mb-3">{value.title}</h3>
                <p className="text-[#8b7b6f] text-sm">{value.description}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#3d3530] mb-4">Leadership Team</h2>
            <p className="text-xl text-[#8b7b6f]">Experts leading the future of medical AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, idx) => (
              <div key={`team-${idx}`} className="clay-card p-6 group hover:scale-105 text-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.color} to-transparent`} />
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover relative z-10"
                    sizes="80px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-[#3d3530] mb-1">{member.name}</h3>
                <p className="text-sm font-medium bg-gradient-to-r from-[#4b7bea] to-[#d97f9d] bg-clip-text text-transparent mb-2">
                  {member.role}
                </p>
                <a href={`mailto:${member.email}`} className="text-sm text-[#8b7b6f] hover:text-[#4b7bea] transition-colors">
                  {member.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="clay-card p-12 space-y-8 bg-gradient-to-br from-[#4b7bea]/10 to-[#d97f9d]/10">
            <h2 className="text-4xl font-bold text-[#3d3530] text-center">Our Impact</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-[#4b7bea] to-[#d97f9d] bg-clip-text text-transparent mb-2">
                  50K+
                </p>
                <p className="text-[#8b7b6f]">Lives Impacted</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-[#d97f9d] to-[#e8b4a8] bg-clip-text text-transparent mb-2">
                  100+
                </p>
                <p className="text-[#8b7b6f]">Hospitals Using</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-[#e8b4a8] to-[#7fbf7f] bg-clip-text text-transparent mb-2">
                  15M+
                </p>
                <p className="text-[#8b7b6f]">Medical Records</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-[#7fbf7f] to-[#4b7bea] bg-clip-text text-transparent mb-2">
                  98.5%
                </p>
                <p className="text-[#8b7b6f]">Accuracy Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
