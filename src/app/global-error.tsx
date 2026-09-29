'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-[#DAAF48]">Something went wrong</h2>
          <p className="text-sm text-neutral-400">An unexpected system error occurred.</p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#DAAF48] text-[#090909] font-bold rounded-xl text-xs uppercase tracking-wider hover:brightness-110 transition-all"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
