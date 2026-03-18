'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Feature', href: '/predict' },
    ...(user ? [{ label: 'History', href: '/account' }] : []),
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 clay-card border-b border-white/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - MedPredict M only, no N */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4b7bea] to-[#d97f9d] rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#4b7bea]/40 transition-all duration-400 transform group-hover:scale-110">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4b7bea] to-[#d97f9d]">
                MedPredict
              </span>
              <span className="text-xs text-[#8b7b6f] font-medium">Pro</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[#3d3530] font-medium hover:text-[#4b7bea] transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4b7bea] to-[#d97f9d] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-[#8b7b6f]">{user.name}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 clay-button bg-white text-[#4b7bea] border-2 border-[#4b7bea] font-semibold hover:bg-[#f5f2ee]"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="clay-button bg-white text-[#4b7bea] border-2 border-[#4b7bea] font-semibold hover:bg-[#f5f2ee]">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="clay-button bg-gradient-to-r from-[#4b7bea] to-[#7fbf7f] text-white font-semibold">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#3d3530] hover:text-[#4b7bea] transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6 space-y-3 animate-slide-up">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-[#3d3530] hover:text-[#4b7bea] font-medium py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-2 clay-button bg-white text-[#4b7bea] border-2 border-[#4b7bea] font-semibold"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full clay-button bg-white text-[#4b7bea] border-2 border-[#4b7bea] font-semibold">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <button className="w-full clay-button bg-gradient-to-r from-[#4b7bea] to-[#7fbf7f] text-white font-semibold mt-2">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
