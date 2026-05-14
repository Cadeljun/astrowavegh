
"use client";

import { useState } from "react";
import { Music, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function RecordsPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Waitlist Joined!",
        description: "You're on the list. The frequency is rising.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-primary/5 to-brand-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 blur-3xl animate-pulse" />
      
      <div className="relative z-10 text-center space-y-12 max-w-4xl">
        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-primary mb-8 animate-[spin_10s_linear_infinite]">
          <Music size={40} />
        </div>
        
        <div className="space-y-4">
          <h1 className="font-headline text-7xl md:text-9xl tracking-[0.2em] text-white uppercase neon-gold">Records</h1>
          <p className="text-primary font-bold tracking-[0.5em] uppercase text-sm">The Sound of the Future • Coming Soon</p>
        </div>
        
        <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
          We are building the definitive label for the new African creative renaissance. A home for the bold, the unique, and the authentic.
        </p>

        <form onSubmit={handleJoin} className="max-w-md mx-auto w-full flex flex-col sm:flex-row gap-4 pt-8">
           <Input 
             type="email" 
             placeholder="Join the waitlist" 
             required 
             className="bg-white/5 border-white/10 h-14 rounded-none focus:border-primary/50 text-center sm:text-left" 
           />
           <Button type="submit" disabled={loading} className="bg-primary text-background h-14 px-8 font-bold tracking-widest uppercase rounded-none hover:bg-white transition-all min-w-[160px]">
             {loading ? <Loader2 className="animate-spin" /> : <>Join <Send size={16} className="ml-2" /></>}
           </Button>
        </form>
      </div>
    </div>
  );
}
