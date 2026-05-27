'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Primary brand identity from user provided Cloudinary assets
const PRIMARY_LOGO = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779676928/h301f38brcdtgkdz8myk.png';

export default function Logo({ height = 40, className, linkTo = '/' }: { height?: number; className?: string; linkTo?: string }) {
  const content = (
    <div style={{ height: `${height}px` }} className={cn("relative flex items-center select-none flex-shrink-0", className)}>
      <img
        src={PRIMARY_LOGO}
        alt="AstroWave"
        style={{ height: '100%', width: 'auto' }}
        className="object-contain block"
        loading="eager"
      />
    </div>
  );

  if (!linkTo) return content;

  return (
    <Link href={linkTo} className="inline-flex items-center">
      {content}
    </Link>
  );
}
