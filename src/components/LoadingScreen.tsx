
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] bg-brand-black flex flex-col items-center justify-center transition-opacity duration-1000",
        loading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative">
        <h1 className="font-headline text-6xl md:text-8xl tracking-widest text-primary neon-gold animate-pulse">
          ASTROWAVE
        </h1>
        <div className="mt-4 h-[2px] w-0 bg-primary animate-[loading-bar_1.5s_ease-in-out_forwards]" />
      </div>
    </div>
  );
}
