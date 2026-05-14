
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const categories = ["All", "Parties", "Concerts", "Networking", "Nightlife"];

const events = [
  {
    name: "Mask Mirage",
    category: "Nightlife",
    date: "Dec 31, 2025",
    venue: "Secret Garden, Accra",
    price: "Premium",
    img: PlaceHolderImages.find(i => i.id === 'mask-mirage')?.imageUrl,
    description: "An immersive masquerade experience where elegance meets mystery. Dress code: Black Tie & Masks."
  },
  {
    name: "Splash & Seduction",
    category: "Parties",
    date: "Jan 1, 2026",
    venue: "Sunkissed Villas, Ada",
    price: "Tickets Req.",
    img: PlaceHolderImages.find(i => i.id === 'splash-seduction')?.imageUrl,
    description: "The ultimate all-day pool party celebrating the arrival of the New Year. Live DJs, Cabanas, and Vibes."
  },
  {
    name: "Horizon Concert",
    category: "Concerts",
    date: "Feb 14, 2026",
    venue: "Black Star Square",
    price: "Free Early Bird",
    img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&h=600&auto=format&fit=crop",
    description: "A showcase of the brightest talents in the AstroWave ecosystem. Music from the future."
  },
  {
    name: "Wave Network",
    category: "Networking",
    date: "March 5, 2026",
    venue: "The Rooftop Lounge",
    price: "Invite Only",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Connecting brands, artists, and creators in an intimate setting."
  }
];

export default function EventsPage() {
  const [filter, setFilter] = useState("All");

  const filteredEvents = filter === "All" 
    ? events 
    : events.filter(e => e.category === filter);

  return (
    <div className="flex flex-col w-full pt-32 pb-24">
      {/* Header */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="font-headline text-7xl lg:text-9xl tracking-widest text-primary neon-gold uppercase">Experiences</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">Curating the most immersive and culture-defining moments in Ghana.</p>
          </div>
          
          <Tabs defaultValue="All" className="w-full md:w-auto">
            <TabsList className="bg-brand-surface border border-white/5 h-12 p-1">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat} 
                  onClick={() => setFilter(cat)}
                  className="data-[state=active]:bg-primary data-[state=active]:text-background font-bold tracking-widest uppercase text-xs h-10 px-6 rounded-none"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
        {filteredEvents.map((event, i) => (
          <div key={i} className="group relative glass border-white/5 overflow-hidden">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={event.img || ""}
                alt={event.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                data-ai-hint="concert crowd event"
              />
              <div className="absolute top-4 left-4">
                 <span className="bg-primary text-black font-bold text-[10px] tracking-widest uppercase px-3 py-1">
                   {event.category}
                 </span>
              </div>
              <div className="absolute top-4 right-4">
                 <span className="bg-white/10 backdrop-blur-md text-white font-bold text-[10px] tracking-widest uppercase px-3 py-1 border border-white/20">
                   {event.price}
                 </span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-sm font-bold tracking-widest text-primary uppercase">
                <span className="flex items-center gap-2"><Calendar size={18} /> {event.date}</span>
                <span className="flex items-center gap-2"><MapPin size={18} /> {event.venue}</span>
              </div>
              <h3 className="font-headline text-4xl tracking-widest uppercase text-white group-hover:text-primary transition-colors">{event.name}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
              <Button asChild className="w-full bg-white text-black font-bold tracking-widest uppercase rounded-none h-14 hover:bg-primary transition-all">
                <Link href="/contact">Book Experience</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Placeholder */}
      <section className="mt-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto border-t border-white/5 pt-24 text-center space-y-12">
          <h2 className="font-headline text-5xl md:text-7xl tracking-widest uppercase">Past <span className="text-muted-foreground">Vibrations</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-40">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="aspect-square bg-brand-surface border border-white/10 flex items-center justify-center italic text-muted-foreground text-xs">
                 Gallery Coming Soon
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
}
