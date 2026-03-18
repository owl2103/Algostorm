'use client'

// Background: moving glowing balls (orbs) only, deterministic (no Math.random)
const ORBS = [
  { id: 1, size: 420, color: 'rgba(75, 123, 234, 0.35)', top: '-12%', left: '-10%', anim: 'orb-float-a', delay: '0s' },
  { id: 2, size: 360, color: 'rgba(217, 127, 157, 0.30)', top: '8%', left: '65%', anim: 'orb-float-b', delay: '1.2s' },
  { id: 3, size: 320, color: 'rgba(127, 191, 127, 0.26)', top: '55%', left: '8%', anim: 'orb-float-c', delay: '0.6s' },
  { id: 4, size: 460, color: 'rgba(232, 180, 168, 0.28)', top: '62%', left: '70%', anim: 'orb-float-a', delay: '2.0s' },
  { id: 5, size: 260, color: 'rgba(75, 123, 234, 0.22)', top: '30%', left: '32%', anim: 'orb-float-b', delay: '0.2s' },
]

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6f3] via-[#faf7f3] to-[#f5f2ee]" />

      <div className="absolute inset-0">
        {ORBS.map((o) => (
          <div
            key={o.id}
            className="absolute rounded-full blur-3xl"
            style={{
              width: o.size,
              height: o.size,
              top: o.top,
              left: o.left,
              background: `radial-gradient(circle, ${o.color} 0%, rgba(255,255,255,0) 70%)`,
              mixBlendMode: 'multiply',
              animation: `${o.anim} 16s ease-in-out infinite`,
              animationDelay: o.delay,
              opacity: 1,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes orb-float-a {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -25px) scale(1.08); }
        }
        @keyframes orb-float-b {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-35px, 30px) scale(1.10); }
        }
        @keyframes orb-float-c {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(25px, 20px) scale(1.06); }
        }
      `}</style>
    </div>
  )
}
