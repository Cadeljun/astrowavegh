'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      {children}
    </div>
  );
}
