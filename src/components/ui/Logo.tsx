'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCMSSettings } from '@/lib/cms/useCMS';
import { DEFAULT_SETTINGS } from '@/lib/cms/definitions';

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
  
  // Choice logic based on variant with reliable fallbacks from CMS definitions
  let logoSrc = '';
  
  if (variant === 'dark') {
    logoSrc = settings?.logoDarkUrl || DEFAULT_SETTINGS.logoDarkUrl;
  } else if (variant === 'icon') {
    logoSrc = settings?.logoIconUrl || DEFAULT_SETTINGS.logoIconUrl;
  } else {
    logoSrc = settings?.logoUrl || DEFAULT_SETTINGS.logoUrl;
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
