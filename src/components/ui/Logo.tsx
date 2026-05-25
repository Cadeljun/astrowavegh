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
  
  // Choose correct source based on variant
  let logoSrc = settings?.logoUrl;
  if (variant === 'dark' && settings?.logoDarkUrl) logoSrc = settings.logoDarkUrl;
  if (variant === 'icon' && settings?.logoIconUrl) logoSrc = settings.logoIconUrl;
  
  // Fallback to defaults if settings are empty
  if (!logoSrc) {
    logoSrc = variant === 'icon'
      ? '/logo/astrowave-icon.svg'
      : variant === 'dark'
        ? '/logo/astrowave-logo-dark.svg'
        : '/logo/astrowave-logo.svg';
  }
  
  const logoWidth = variant === 'icon' 
    ? height 
    : height * 4.5;

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
