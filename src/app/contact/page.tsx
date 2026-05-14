
"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Instagram, Twitter, Music, Youtube, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulated Firestore submission
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Message Sent!",
        description: "Your inquiry has been received. Our team will catch the wave back to you soon.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full pt-32 pb-24">
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Info */}
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="font-headline text-7xl lg:text-9xl tracking-widest text-primary neon-gold uppercase">Contact</h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-light">
              Ready to collaborate or book an experience? Reach out and let's bring the vision beyond the horizon.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-brand-surface border border-white/10 rounded-full flex items-center justify-center text-primary group-hover:border-primary transition-all">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Email Us</p>
                <p className="text-xl font-medium">info@astrowave.live</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-brand-surface border border-white/10 rounded-full flex items-center justify-center text-primary group-hover:border-primary transition-all">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Call Us</p>
                <p className="text-xl font-medium">+233 (0) 20 000 0000</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-brand-surface border border-white/10 rounded-full flex items-center justify-center text-primary group-hover:border-primary transition-all">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Visit Us</p>
                <p className="text-xl font-medium">Accra, Ghana</p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-6">Social Connection</p>
            <div className="flex items-center gap-4">
               {[Instagram, Twitter, Music, Youtube].map((Icon, i) => (
                 <Link key={i} href="#" className="w-12 h-12 glass flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-all">
                   <Icon size={20} />
                 </Link>
               ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="glass p-10 lg:p-16 border-white/5 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[60px]" />
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Full Name</Label>
                <Input id="name" placeholder="John Doe" required className="bg-white/5 border-white/10 h-14 focus:border-primary/50 transition-all rounded-none" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" required className="bg-white/5 border-white/10 h-14 focus:border-primary/50 transition-all rounded-none" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="subject" className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Subject</Label>
              <Select required>
                <SelectTrigger className="bg-white/5 border-white/10 h-14 focus:border-primary/50 transition-all rounded-none">
                  <SelectValue placeholder="Select an inquiry type" />
                </SelectTrigger>
                <SelectContent className="bg-brand-surface border-white/10">
                  <SelectItem value="booking">Event Booking</SelectItem>
                  <SelectItem value="talent">Talent Inquiry</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="general">General Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="message" className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Your Message</Label>
              <Textarea id="message" placeholder="How can we build the wave together?" required className="bg-white/5 border-white/10 min-h-[200px] focus:border-primary/50 transition-all rounded-none" />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-background font-bold tracking-[0.2em] h-16 rounded-none uppercase text-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(255,209,102,0.3)]">
              {loading ? <Loader2 className="animate-spin" /> : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

// Minimal Link component for social icons
function Link({ children, href, className }: { children: React.ReactNode, href: string, className?: string }) {
  return <a href={href} className={className}>{children}</a>;
}
