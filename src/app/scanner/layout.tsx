'use client';

import { usePathname } from 'next/navigation';

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/scanner/login';

  // Login page doesn't need auth wrapper
  if (isLogin) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
