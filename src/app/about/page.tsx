
import { Heart, Star, Zap, Globe, Users, TrendingUp } from "lucide-react";

export default function AboutPage() {
  const values = [
    { title: "Creativity", icon: <Star />, desc: "Pushing the boundaries of the imaginative landscape." },
    { title: "Collaboration", icon: <Users />, desc: "Building bridges across industries and cultures." },
    { title: "Excellence", icon: <Zap />, desc: "Setting the gold standard in every experience we deliver." },
    { title: "Innovation", icon: <Globe />, desc: "Harnessing technology to amplify African narratives." },
    { title: "Community", icon: <Heart />, desc: "Nurturing the ecosystem that empowers our youth." },
    { title: "Authenticity", icon: <TrendingUp />, desc: "Staying true to the roots while reaching for the stars." },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-brand-surface">
           <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-brand-black" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="font-headline text-7xl md:text-[8rem] tracking-tight text-primary neon-gold mb-6 uppercase">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
            Founded by Calvin Mensah Delali (Cadel), AstroWave is more than a brand. It is a creative pulse resonating through Ghana and beyond.
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-24 px-6 lg:px-12 bg-brand-surface border-y border-white/5">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-6">
            <h2 className="font-headline text-4xl md:text-6xl tracking-widest uppercase">The Vision</h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              AstroWave emerged from a desire to redefine how African entertainment is perceived and consumed. Our founder, Calvin Mensah Delali, envisioned a platform where creativity, luxury, and raw energy could coexist seamlessly.
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We started with a single party and grew into a multi-divisional powerhouse. Today, we manage some of the brightest DJs and artists, curate the country's most talked-about events, and are building the infrastructure for the next generation of African sound.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-8 border-primary/20">
              <h3 className="font-headline text-3xl tracking-widest text-primary mb-4 uppercase">Mission</h3>
              <p className="text-muted-foreground">To elevate African creative talent and culture to the global stage through premium, immersive experiences and strategic management.</p>
            </div>
            <div className="glass p-8 border-secondary/20">
              <h3 className="font-headline text-3xl tracking-widest text-secondary mb-4 uppercase">Vision</h3>
              <p className="text-muted-foreground">To be the primary catalyst for the new African creative renaissance, known globally for excellence, innovation, and vibes beyond the horizon.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="font-headline text-5xl md:text-7xl tracking-widest text-center uppercase mb-20">Core <span className="text-primary">Values</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div key={i} className="glass p-10 hover:border-primary/50 transition-all group">
                <div className="text-primary mb-6 transition-transform group-hover:scale-110">
                  {v.icon}
                </div>
                <h4 className="font-headline text-3xl tracking-widest uppercase mb-3">{v.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Goals / Problem List */}
      <section className="py-24 px-6 lg:px-12 bg-brand-surface relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-8">
            <h2 className="font-headline text-5xl md:text-7xl tracking-widest uppercase text-center">What Problem We <span className="text-accent italic">Solve</span></h2>
            <div className="space-y-8 pt-8">
              {[
                { n: "01", t: "Fragmented Representation", d: "Artists and DJs often lack structured management that understands both the creative and business sides." },
                { n: "02", t: "Lack of Immersive Branding", d: "Events in the region frequently miss the mark on cinematic, cohesive storytelling." },
                { n: "03", t: "Youth Empowerment Gaps", d: "AstroWave creates a hub for the youth to see creative careers as viable, professional, and world-class." },
              ].map((item, i) => (
                <div key={i} className="flex gap-8 group">
                  <span className="font-headline text-6xl text-primary/20 group-hover:text-primary transition-colors">{item.n}</span>
                  <div className="space-y-2">
                    <h4 className="font-headline text-3xl tracking-widest uppercase">{item.t}</h4>
                    <p className="text-muted-foreground text-lg">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
