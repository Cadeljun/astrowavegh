"use client";

import { useState } from "react";
import { getUserVibeRecommendation, type UserVibeOutput } from "@/ai/flows/user-vibe-recommendation-flow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sparkles, Loader2, Music, Calendar, Users, Target } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer, scaleIn } from "@/lib/animations";

export default function VibeNavigator() {
  const [mood, setMood] = useState("");
  const [recommendations, setRecommendations] = useState<UserVibeOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;
    setLoading(true);
    try {
      const result = await getUserVibeRecommendation({ moodOrVibe: mood });
      setRecommendations(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-24 px-6">
      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="text-center mb-12"
      >
        <div className="label text-gold tracking-[0.4em] mb-4">AI-POWERED DISCOVERY</div>
        <h2 className="display-lg text-glow-gold mb-6 uppercase">
          Find Your Wave
        </h2>
        <p className="body-lg text-muted max-w-2xl mx-auto">
          Describe your mood or the kind of energy you're looking for, and let our AI navigate you to the perfect AstroWave experience.
        </p>
      </motion.div>

      <motion.form 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        onSubmit={handleSearch} 
        className="flex flex-col md:flex-row gap-4 mb-20"
      >
        <input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g. 'Chill sunset vibes', 'High energy afrobeats', 'Midnight mystery'..."
          className="flex-1 bg-white/5 border border-white/10 h-16 px-6 rounded-sm text-lg focus:border-gold outline-none transition-all text-white placeholder:text-muted/50"
        />
        <Button 
          type="submit" 
          disabled={loading}
          size="lg"
          className="h-16 px-10 min-w-[200px]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" /> NAVIGATE</>}
        </Button>
      </motion.form>

      <AnimatePresence mode="wait">
        {recommendations && (
          <motion.div 
            key="results"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Events */}
            <div className="space-y-6">
              <h3 className="font-display text-2xl tracking-widest flex items-center gap-3 text-gold">
                <Calendar size={20} /> EVENTS
              </h3>
              <div className="space-y-4">
                {recommendations.events.map((event, i) => (
                  <motion.div key={i} variants={scaleIn}>
                    <Card className="p-6 border-white/5 bg-white/[0.02]" glowColor="gold">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white text-lg leading-tight">{event.name}</h4>
                        <Badge variant="live" className="text-[0.6rem] whitespace-nowrap">
                          {event.vibeMatchScore}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted leading-relaxed line-clamp-3">{event.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Music */}
            <div className="space-y-6">
              <h3 className="font-display text-2xl tracking-widest flex items-center gap-3 text-purple">
                <Music size={20} /> MUSIC
              </h3>
              <div className="space-y-4">
                {recommendations.music.map((m, i) => (
                  <motion.div key={i} variants={scaleIn}>
                    <Card className="p-6 border-white/5 bg-white/[0.02]" glowColor="purple">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white text-lg leading-tight">{m.title}</h4>
                        <Badge variant="active" className="bg-purple-dim text-purple border-purple text-[0.6rem]">
                          {m.vibeMatchScore}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">{m.artist} • {m.genre}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Artists */}
            <div className="space-y-6">
              <h3 className="font-display text-2xl tracking-widest flex items-center gap-3 text-cyan">
                <Users size={20} /> TALENT
              </h3>
              <div className="space-y-4">
                {recommendations.artists.map((a, i) => (
                  <motion.div key={i} variants={scaleIn}>
                    <Card className="p-6 border-white/5 bg-white/[0.02]" glowColor="cyan">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white text-lg leading-tight">{a.name}</h4>
                        <Badge variant="free" className="text-[0.6rem]">
                          {a.vibeMatchScore}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted mb-2">{a.role}</p>
                      <p className="text-[0.65rem] text-muted italic line-clamp-2">{a.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
