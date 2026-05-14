
import Link from "next/link";
import { Instagram, Twitter, Music, Youtube, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="font-headline text-4xl tracking-wider text-primary neon-gold">
            ASTROWAVE
          </Link>
          <p className="text-muted-foreground max-w-xs leading-relaxed">
            Redefining African entertainment through immersive events, culture, and talent management. Vibes Beyond the Horizon.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary/20 transition-colors text-primary">
              <Instagram size={20} />
            </Link>
            <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary/20 transition-colors text-primary">
              <Twitter size={20} />
            </Link>
            <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary/20 transition-colors text-primary">
              <Music size={20} />
            </Link>
            <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary/20 transition-colors text-primary">
              <Youtube size={20} />
            </Link>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-6">
          <h4 className="font-headline text-xl tracking-widest uppercase">Quick Links</h4>
          <ul className="space-y-4 text-muted-foreground font-medium">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/events" className="hover:text-primary transition-colors">Events</Link></li>
            <li><Link href="/management" className="hover:text-primary transition-colors">Talent</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Divisions */}
        <div className="space-y-6">
          <h4 className="font-headline text-xl tracking-widest uppercase">Divisions</h4>
          <ul className="space-y-4 text-muted-foreground font-medium">
            <li><Link href="/events" className="hover:text-primary transition-colors">AstroWave Events</Link></li>
            <li><Link href="/management" className="hover:text-primary transition-colors">AstroWave Management</Link></li>
            <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
              AstroWave Records <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-bold">SOON</span>
            </li>
            <li className="flex items-center gap-2 opacity-50 cursor-not-allowed">
              AstroWave Cares <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-bold">SOON</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h4 className="font-headline text-xl tracking-widest uppercase">Get in Touch</h4>
          <ul className="space-y-4 text-muted-foreground font-medium">
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-primary" />
              <span>info@astrowave.live</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-primary" />
              <span>+233 (0) 20 000 0000</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={18} className="text-primary" />
              <span>Accra, Ghana</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto border-t border-white/5 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>© 2025 AstroWave. All Rights Reserved.</p>
        <p>Founded by Calvin Mensah Delali.</p>
      </div>
    </footer>
  );
}
