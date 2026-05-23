'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCMSSettings } from '@/lib/cms/useCMS';

interface LogoProps {
  variant?: 'default' | 'icon' | 'dark';
  height?: number;
  linkTo?: string;
  className?: string;
}

export default function Logo({
  variant = 'default',
  height = 40,
  linkTo = '/',
  className = ''
}: LogoProps) {
  const { settings } = useCMSSettings();
  
  const logoSrc = settings?.logoUrl 
    || (variant === 'icon'
      ? '/logo/astrowave-icon.svg'
      : variant === 'dark'
        ? '/logo/astrowave-logo-dark.svg'
        : '/logo/astrowave-logo.svg');
  
  const logoWidth = variant === 'icon' 
    ? height * 1.45
    : height * 3.75;

  const content = (
    <Image
      src={logoSrc}
      alt="AstroWave Logo"
      width={logoWidth}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  );

  if (!linkTo) return content;

  return (
    <Link href={linkTo} className="inline-flex items-center">
      {content}
    </Link>
  );
}
