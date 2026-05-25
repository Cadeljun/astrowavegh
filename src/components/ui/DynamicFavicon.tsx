'use client'

import { useEffect } from 'react'
import { useCMSSettings } from '@/lib/cms/useCMS'

export default function DynamicFavicon() {
  const { settings } = useCMSSettings()

  useEffect(() => {
    if (!settings?.faviconUrl) return
    
    // Update all favicon link tags
    const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]', 'link[rel="apple-touch-icon"]']
    
    selectors.forEach(selector => {
      const links = document.querySelectorAll(selector)
      links.forEach(link => {
        (link as HTMLLinkElement).href = settings.faviconUrl
      })
      
      // Create if doesn't exist
      if (links.length === 0) {
        const link = document.createElement('link')
        link.rel = selector.includes('apple') ? 'apple-touch-icon' : 'icon'
        link.href = settings.faviconUrl
        document.head.appendChild(link)
      }
    })
  }, [settings?.faviconUrl])

  return null
}
