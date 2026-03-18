'use client'

import { useEffect } from 'react'

function removeDevtoolsNodes() {
  const selectors = [
    'nextjs-portal',
    '#__nextjs-devtools',
    '#__nextjs-devtools-button',
    '[data-nextjs-devtools]',
    '[data-nextjs-devtools-button]',
  ]

  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach((el) => {
      try {
        el.remove()
      } catch {
        ;(el as HTMLElement).style.display = 'none'
      }
    })
  }
}

export function RemoveNextJsDevtools() {
  useEffect(() => {
    // Remove immediately (in case it already exists)
    removeDevtoolsNodes()

    // Keep removing if Next injects it later
    const obs = new MutationObserver(() => removeDevtoolsNodes())
    obs.observe(document.documentElement, { childList: true, subtree: true })

    // Extra safety: periodic cleanup for a short time
    const start = Date.now()
    const t = window.setInterval(() => {
      removeDevtoolsNodes()
      if (Date.now() - start > 8000) window.clearInterval(t)
    }, 250)

    return () => {
      obs.disconnect()
      window.clearInterval(t)
    }
  }, [])

  return null
}

