
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NavLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Management", href: "/management" },
  { name: "Records", href: "/records" },
  { name: "Cares", href: "/cares" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 lg:px-12",
        scrolled ? "bg-background/80 backdrop-blur-lg border-b border-white/5 py-4" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group">
          <span className="font-headline text-2xl lg:text-3xl tracking-wider text-primary neon-gold transition-all group-hover:opacity-80">
            ASTROWAVE
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {NavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative text-sm font-semibold tracking-widest uppercase transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary animate-in fade-in slide-in-from-left-2" />
                )}
              </Link>
            );
          })}
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-background font-bold tracking-widest uppercase ml-4 rounded-none neon-glow-gold"
          >
            <Link href="/contact">Book Now</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-primary p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 bg-background z-[110] flex flex-col items-center justify-center gap-8 transition-transform duration-500 lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <button
          className="absolute top-6 right-6 text-primary p-2"
          onClick={() => setIsOpen(false)}
        >
          <X size={40} />
        </button>
        <div className="flex flex-col items-center gap-6">
          {NavLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="font-headline text-4xl tracking-widest text-primary hover:opacity-70 transition-opacity"
            >
              {link.name}
            </Link>
          ))}
          <Button
            asChild
            className="mt-4 bg-primary text-background font-headline text-2xl px-12 h-14 rounded-none"
            onClick={() => setIsOpen(false)}
          >
            <Link href="/contact">Book Now</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
