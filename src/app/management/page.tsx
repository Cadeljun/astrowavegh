
import Image from "next/image";
import Link from "next/link";
import { Instagram, Music, Zap, TrendingUp, Globe, Briefcase, Camera, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const services = [
  { icon: <TrendingUp size={24} />, title: "PR & Image Management", desc: "Crafting a professional and resonant public persona." },
  { icon: <Briefcase size={24} />, title: "Brand Deals & Partnerships", desc: "Connecting talent with high-impact global brands." },
  { icon: <Globe size={24} />, title: "Career Strategy", desc: "Long-term roadmap for global growth and industry dominance." },
  { icon: <Zap size={24} />, title: "Booking & Logistics", desc: "End-to-end management of event appearances and tours." },
  { icon: <Camera size={24} />, title: "Social Growth", desc: "Optimizing digital presence and fan engagement." },
  { icon: <Mic2 size={24} />, title: "Performance Placement", desc: "Securing slots on the biggest stages and platforms." },
];

const roster = [
  {
    name: "DJ Horizon",
    role: "Amapiano & Afrobeats DJ",
    bio: "Setting dancefloors ablaze from Accra to Lagos. The pulse of the new African night.",
    img: PlaceHolderImages.find(i => i.id === 'dj-roster-1')?.imageUrl,
  },
  {
    name: "DJ Void",
    role: "Experimental Electronic DJ",
    bio: "Merging traditional rhythms with futuristic synth layers. A sonic pioneer.",
    img: PlaceHolderImages.find(i => i.id === 'dj-roster-2')?.imageUrl,
  },
  {
    name: "Uzy",
    role: "Recording Artist",
    bio: "The lyrical voice of the AstroWave movement. Redefining African Hip-hop.",
    img: PlaceHolderImages.find(i => i.id === 'artist-roster-1')?.imageUrl,
  }
];

export default function ManagementPage() {
  return (
    <div className="flex flex-col w-full pt-32 pb-24">
      {/* Hero */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-24 text-center">
        <h1 className="font-headline text-7xl lg:text-9xl tracking-widest text-primary neon-gold uppercase mb-8">
          ASTROWAVE <span className="text-secondary italic">MANAGEMENT</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
          We represent the architects of the new wave. Strategically positioning African talent for global impact and lasting cultural legacy.
        </p>
      </section>

      {/* Roster */}
      <section className="px-6 lg:px-12 mb-32">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {roster.map((talent, i) => (
            <div key={i} className="group relative overflow-hidden glass border-white/5 h-[600px]">
              <Image
                src={talent.img || ""}
                alt={talent.name}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 space-y-4">
                <div className="space-y-1">
                   <h3 className="font-headline text-4xl tracking-widest uppercase text-white">{talent.name}</h3>
                   <p className="text-primary font-bold tracking-[0.2em] text-xs uppercase">{talent.role}</p>
                </div>
                <p className="text-muted-foreground line-clamp-2">{talent.bio}</p>
                <div className="flex items-center gap-4 pt-2">
                   <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary/20 transition-colors text-primary"><Instagram size={20} /></Link>
                   <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary/20 transition-colors text-primary"><Music size={20} /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-6 lg:px-12 bg-brand-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/5 blur-[120px]" />
        <div className="max-w-screen-2xl mx-auto relative z-10">
          <h2 className="font-headline text-5xl md:text-7xl tracking-widest text-center uppercase mb-20">What We <span className="text-secondary">Offer</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={i} className="glass p-10 hover:border-secondary/50 transition-all group">
                <div className="text-secondary mb-6 transition-transform group-hover:scale-110">
                  {s.icon}
                </div>
                <h4 className="font-headline text-2xl tracking-widest uppercase mb-3">{s.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="font-headline text-5xl md:text-7xl tracking-widest uppercase">Join Our <span className="text-primary">Roster</span></h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Think you're the next sound to take the wave globally? We're always looking for the bold, the unique, and the professional.
          </p>
          <Button asChild className="bg-primary text-background font-bold tracking-widest h-16 px-12 rounded-none uppercase text-lg hover:scale-105 transition-transform">
            <Link href="/contact?subject=Talent%20Inquiry">Apply Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
