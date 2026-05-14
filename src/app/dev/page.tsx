'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DevPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dev/components');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-gold animate-spin" />
    </div>
  );
}
