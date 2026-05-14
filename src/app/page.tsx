
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Users, Music, Heart, Calendar, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import VibeNavigator from "@/components/VibeNavigator";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const upcomingEvents = [
  {
    name: "Mask Mirage",
    date: "Dec 31, 2025",
    location: "Secret Garden, Accra",
    description: "An immersive masquerade experience where elegance meets mystery.",
    image: PlaceHolderImages.find(img => img.id === "mask-mirage")?.imageUrl,
  },
  {
    name: "Splash & Seduction",
    date: "Jan 1, 2026",
    location: "Sunkissed Villas, Ada",
    description: "The ultimate all-day pool party celebrating the arrival of the New Year.",
    image: PlaceHolderImages.find(img => img.id === "splash-seduction")?.imageUrl,
  }
];

export default function Home() {
  const heroFallback = PlaceHolderImages.find(img => img.id === "hero-video-fallback")?.imageUrl;

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background (Simulated with high-res image and gradient for now) */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroFallback || ""}
            alt="Hero Background"
            fill
            className="object-cover opacity-40 scale-105 animate-[pulse-slow_8s_infinite]"
            priority
            data-ai-hint="nightlife concert crowd"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black" />
          <div className="absolute inset-0 bg-brand-black/40" />
        </div>

        <div className="relative z-10 text-center space-y-8 px-6 max-w-5xl mx-auto">
          <h1 className="font-headline text-7xl md:text-[10rem] lg:text-[14rem] leading-none tracking-tight text-primary neon-gold select-none animate-in fade-in zoom-in duration-1000">
            ASTROWAVE
          </h1>
          <p className="font-body text-xl md:text-3xl font-light tracking-[0.2em] uppercase text-white/80 animate-in slide-in-from-bottom-4 delay-500 duration-1000">
            Vibes Beyond the Horizon.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-in slide-in-from-bottom-8 delay-700 duration-1000">
            <Button asChild className="bg-primary text-background hover:bg-white transition-all font-bold tracking-[0.2em] text-lg px-10 h-16 rounded-none neon-glow-gold border-2 border-primary">
              <Link href="/events">Explore Events</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold tracking-[0.2em] text-lg px-10 h-16 rounded-none uppercase">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-primary/50">
          <ChevronDown size={40} />
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-24 px-6 lg:px-12 bg-brand-surface border-y border-white/5 relative">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          <div className="space-y-8">
            <h2 className="font-headline text-5xl md:text-7xl tracking-widest text-white leading-tight">
              A CREATIVE <span className="text-primary italic">MOVEMENT</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
              Redefining African entertainment — music, nightlife, talent, and culture, united under one wave. We create experiences that transcend the ordinary.
            </p>
            <Link href="/about" className="inline-flex items-center gap-3 text-primary font-bold text-xl uppercase tracking-widest group">
              Our Story <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse" />
            <div className="relative z-10 w-full h-full glass border border-primary/20 flex items-center justify-center p-12 overflow-hidden rotate-3">
               <div className="w-full h-full bg-primary/10 animate-[spin_20s_linear_infinite] absolute inset-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
               <span className="font-headline text-8xl text-primary neon-gold select-none relative z-20">AW</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Hub */}
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto mb-20">
          <h2 className="font-headline text-5xl md:text-7xl tracking-widest text-center uppercase mb-16">
            The AstroWave <span className="text-primary">Ecosystem</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Active Divisions */}
            <Link href="/events" className="group">
              <div className="glass p-10 h-full flex flex-col justify-between space-y-12 transition-all group-hover:-translate-y-2 group-hover:border-primary/50">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-primary">
                  <Zap size={32} />
                </div>
                <div>
                  <h3 className="font-headline text-3xl tracking-widest mb-3">Events</h3>
                  <p className="text-muted-foreground">Immersive parties, concerts, and nightlife experiences.</p>
                </div>
              </div>
            </Link>

            <Link href="/management" className="group">
              <div className="glass p-10 h-full flex flex-col justify-between space-y-12 transition-all group-hover:-translate-y-2 group-hover:border-secondary/50">
                <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center text-secondary">
                  <Users size={32} />
                </div>
                <div>
                  <h3 className="font-headline text-3xl tracking-widest mb-3">Management</h3>
                  <p className="text-muted-foreground">Strategic talent representation for DJs and artists.</p>
                </div>
              </div>
            </Link>

            {/* Coming Soon */}
            <div className="glass p-10 h-full flex flex-col justify-between space-y-12 opacity-60 cursor-not-allowed">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center text-muted-foreground relative">
                <Music size={32} />
                <span className="absolute -top-2 -right-2 text-[10px] bg-white/10 px-2 py-1 rounded font-bold uppercase">Coming Soon</span>
              </div>
              <div>
                <h3 className="font-headline text-3xl tracking-widest mb-3">Records</h3>
                <p className="text-muted-foreground">Cultivating the future sounds of Africa. Our label is rising.</p>
              </div>
            </div>

            <div className="glass p-10 h-full flex flex-col justify-between space-y-12 opacity-60 cursor-not-allowed">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center text-muted-foreground relative">
                <Heart size={32} />
                <span className="absolute -top-2 -right-2 text-[10px] bg-white/10 px-2 py-1 rounded font-bold uppercase">Coming Soon</span>
              </div>
              <div>
                <h3 className="font-headline text-3xl tracking-widest mb-3">Cares</h3>
                <p className="text-muted-foreground">Giving back to the culture and community that builds us.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-24 px-6 lg:px-12 bg-[#08080A]">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <h2 className="font-headline text-5xl md:text-7xl tracking-widest uppercase">
              Upcoming <span className="text-primary">Experiences</span>
            </h2>
            <Link href="/events" className="text-primary font-bold tracking-widest hover:underline flex items-center gap-2">
              View All Events <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="group relative aspect-[16/10] overflow-hidden">
                <Image
                  src={event.image || ""}
                  alt={event.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 space-y-4 w-full">
                  <div className="flex items-center gap-6 text-sm font-bold tracking-widest text-primary uppercase">
                    <span className="flex items-center gap-2"><Calendar size={16} /> {event.date}</span>
                    <span className="flex items-center gap-2"><MapPin size={16} /> {event.location}</span>
                  </div>
                  <h3 className="font-headline text-4xl tracking-widest text-white uppercase">{event.name}</h3>
                  <p className="text-muted-foreground line-clamp-2 max-w-lg">{event.description}</p>
                  <Button asChild className="bg-white text-black font-bold tracking-widest rounded-none hover:bg-primary transition-colors">
                    <Link href="/contact">Get Tickets</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Vibe Navigator */}
      <section className="py-24 bg-brand-surface border-y border-white/5 relative">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
        <VibeNavigator />
      </section>

      {/* Talent Teaser */}
      <section className="py-24 px-6 lg:px-12 relative">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-headline text-5xl md:text-7xl tracking-widest uppercase">
              The <span className="text-secondary italic">AstroWave</span> Talent
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Home to the boldest sounds and most vibrant creative minds in the game.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { name: "DJ Horizon", role: "Specialist: Amapiano / Afrobeats", img: PlaceHolderImages.find(i => i.id === 'dj-roster-1')?.imageUrl },
              { name: "DJ Void", role: "Specialist: Electronic / Highlife", img: PlaceHolderImages.find(i => i.id === 'dj-roster-2')?.imageUrl },
              { name: "Uzy", role: "Hip-hop Artist / Producer", img: PlaceHolderImages.find(i => i.id === 'artist-roster-1')?.imageUrl },
            ].map((talent, i) => (
              <div key={i} className="group relative aspect-[3/4] overflow-hidden glass border-white/5">
                <Image
                  src={talent.img || ""}
                  alt={talent.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h4 className="font-headline text-3xl tracking-widest uppercase text-white mb-1">{talent.name}</h4>
                  <p className="text-primary font-bold text-xs uppercase tracking-widest">{talent.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white font-bold tracking-widest h-14 px-10 rounded-none uppercase">
              <Link href="/management">Meet The Full Roster</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 animate-pulse" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-12">
          <h2 className="font-headline text-6xl md:text-9xl tracking-tighter uppercase neon-gold">
            READY TO WAVE?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Whether you're an artist, event lover, or a visionary brand — AstroWave has a space for you. Join the horizon.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild className="bg-primary text-background font-bold tracking-[0.2em] text-lg px-12 h-16 rounded-none uppercase hover:scale-105 transition-transform">
              <Link href="/contact">Join the Movement</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold tracking-[0.2em] text-lg px-12 h-16 rounded-none uppercase">
              <Link href="/contact">Book an Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
