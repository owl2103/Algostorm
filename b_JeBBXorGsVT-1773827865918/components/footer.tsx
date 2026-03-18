'use client'

import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-[#e8b4a8]/30">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf7f3] to-[#f5f2ee] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4b7bea] to-[#d97f9d] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <div>
                <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4b7bea] to-[#d97f9d]">
                  MedPredict Pro
                </p>
                <p className="text-xs text-[#8b7b6f]">Early Disease Detection</p>
              </div>
            </div>
            <p className="text-[#8b7b6f] text-sm leading-relaxed">
              Advanced ML-powered healthcare diagnostics for early disease detection and patient care.
            </p>
          </div>

          {/* Navbar Options Section */}
          <div>
            <h3 className="font-semibold text-[#3d3530] mb-6">Navigation</h3>
            <ul className="space-y-3">
              <li key="nav-0">
                <Link href="/" className="text-[#8b7b6f] hover:text-[#4b7bea] transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li key="nav-1">
                <Link href="/predict" className="text-[#8b7b6f] hover:text-[#4b7bea] transition-colors duration-300">
                  Feature
                </Link>
              </li>
              <li key="nav-2">
                <Link href="/about" className="text-[#8b7b6f] hover:text-[#4b7bea] transition-colors duration-300">
                  About
                </Link>
              </li>
              <li key="nav-3">
                <Link href="/contact" className="text-[#8b7b6f] hover:text-[#4b7bea] transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Features Section */}
          <div>
            <h3 className="font-semibold text-[#3d3530] mb-6">Features</h3>
            <ul className="space-y-3">
              <li key="feature-0">
                <Link href="/predict" className="text-[#8b7b6f] hover:text-[#4b7bea] transition-colors duration-300">
                  Symptoms
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-semibold text-[#3d3530] mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-[#8b7b6f] hover:text-[#4b7bea] transition-colors cursor-pointer">
                <Mail size={18} className="text-[#4b7bea]" />
                <a href="mailto:shreyaadhikary3@gmail.com" className="text-sm">shreyaadhikary3@gmail.com</a>
              </li>
              <li className="flex items-center gap-3 text-[#8b7b6f] hover:text-[#4b7bea] transition-colors cursor-pointer">
                <Phone size={18} className="text-[#4b7bea]" />
                <a href="tel:7477644278" className="text-sm">7477644278</a>
              </li>
              <li className="flex items-center gap-3 text-[#8b7b6f] hover:text-[#4b7bea] transition-colors cursor-pointer">
                <MapPin size={18} className="text-[#4b7bea]" />
                <span className="text-sm">Champadanga Tarakeswar</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e8b4a8]/30 my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#8b7b6f] text-sm">
            © 2026 MedPredict Pro. All rights reserved.
          </p>

          {/* Footer Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link key="footer-0" href="#privacy" className="text-[#8b7b6f] hover:text-[#4b7bea] transition-colors">
              Privacy Policy
            </Link>
            <Link key="footer-1" href="#terms" className="text-[#8b7b6f] hover:text-[#4b7bea] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
