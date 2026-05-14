
"use client";

import { useState } from "react";
import { getUserVibeRecommendation, type UserVibeOutput } from "@/ai/flows/user-vibe-recommendation-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, Music, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <h2 className="font-headline text-4xl lg:text-5xl tracking-widest text-primary neon-gold mb-4 uppercase">
          AI Vibe Navigator
        </h2>
        <p className="text-muted-foreground text-lg">
          Describe your mood, and let the wave find your perfect experience.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-12">
        <Input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g. 'Chill sunset vibes', 'High energy afrobeats', 'Midnight mystery'..."
          className="bg-brand-surface border-white/10 h-14 text-lg focus:border-primary/50 transition-all text-white placeholder:text-muted-foreground"
        />
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-primary text-background h-14 px-8 font-bold text-lg tracking-widest uppercase hover:bg-primary/80 rounded-none shadow-[0_0_20px_rgba(255,209,102,0.3)]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
          Navigate
        </Button>
      </form>

      {recommendations && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Events */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl tracking-widest flex items-center gap-2">
              <Calendar className="text-primary" /> Events
            </h3>
            {recommendations.events.map((event, i) => (
              <Card key={i} className="glass border-white/5 bg-transparent overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-primary">{event.name}</h4>
                    <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px]">
                      {event.vibeMatchScore}% Match
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Music */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl tracking-widest flex items-center gap-2">
              <Music className="text-secondary" /> Music
            </h3>
            {recommendations.music.map((m, i) => (
              <Card key={i} className="glass border-white/5 bg-transparent overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-secondary">{m.title}</h4>
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary text-[10px]">
                      {m.vibeMatchScore}% Match
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.artist} • {m.genre}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Artists */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl tracking-widest flex items-center gap-2">
              <User className="text-accent" /> Talent
            </h3>
            {recommendations.artists.map((a, i) => (
              <Card key={i} className="glass border-white/5 bg-transparent overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-accent">{a.name}</h4>
                    <Badge variant="secondary" className="bg-accent/20 text-accent text-[10px]">
                      {a.vibeMatchScore}% Match
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
