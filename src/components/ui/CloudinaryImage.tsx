'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getCloudinaryUrl, CloudinaryTransform } from '@/lib/cloudinary/getUrl'
import { cn } from '@/lib/utils'

interface CloudinaryImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  transforms?: CloudinaryTransform
  priority?: boolean
  fallback?: string
  objectFit?: 'cover' | 'contain' | 'fill'
}

export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  transforms = {},
  priority = false,
  fallback = 'https://picsum.photos/seed/placeholder/800/600',
  objectFit = 'cover'
}: CloudinaryImageProps) {
  const [error, setError] = useState(false)
  
  const optimizedUrl = src 
    ? getCloudinaryUrl(src, transforms)
    : fallback

  const imgSrc = error ? fallback : optimizedUrl

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={cn(`object-${objectFit}`, className)}
        priority={priority}
        onError={() => setError(true)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
      onError={() => setError(true)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  )
}
