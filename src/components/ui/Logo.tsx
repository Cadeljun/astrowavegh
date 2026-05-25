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

const PRIMARY_LOGO = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779676928/h301f38brcdtgkdz8myk.png';

export default function Logo({
  variant = 'default',
  height = 40,
  linkTo = '/',
  className = ''
}: LogoProps) {
  const { settings } = useCMSSettings();
  
  // Choose correct source based on variant
  let logoSrc = '';
  
  if (variant === 'dark') {
    logoSrc = settings?.logoDarkUrl || PRIMARY_LOGO;
  } else if (variant === 'icon') {
    logoSrc = settings?.logoIconUrl || 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779674858/ivzvmlaglz9l1hgevktn.png';
  } else {
    logoSrc = settings?.logoUrl || PRIMARY_LOGO;
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
