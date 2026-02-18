
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { User, Zap, Bell } from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

export default function Navbar() {
  const logoUrl = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';

  return (
    <nav className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between px-8 py-4 glass-morphism border-white/40 finance-3d-shadow rounded-3xl animate-in fade-in slide-in-from-top-4 duration-1000">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden finance-3d-shadow group-hover:scale-110 transition-transform duration-300 bg-white">
          <Image 
            src={logoUrl} 
            alt="The Finance School India Logo" 
            fill 
            className="object-contain p-1"
            data-ai-hint="finance logo"
          />
        </div>
        <span className="text-2xl font-headline font-bold text-primary tracking-tighter hidden sm:block">
          The Finance<span className="text-accent italic drop-shadow-sm"> School India</span>
        </span>
      </Link>
      
      <div className="hidden lg:flex items-center gap-10">
        <Link href="/" className="text-sm font-bold text-primary/70 hover:text-primary hover:scale-105 transition-all uppercase tracking-widest">Home</Link>
        <Link href="#courses" className="text-sm font-bold text-primary/70 hover:text-primary hover:scale-105 transition-all uppercase tracking-widest">Courses</Link>
        <Link href="#tools" className="text-sm font-bold text-primary/70 hover:text-primary hover:scale-105 transition-all uppercase tracking-widest">Tools</Link>
        <Link href="#news" className="text-sm font-bold text-primary/70 hover:text-primary hover:scale-105 transition-all uppercase tracking-widest">Pulse Feed</Link>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5 rounded-xl hidden sm:flex">
          <Bell className="w-5 h-5" />
        </Button>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-primary hover:bg-accent/20 rounded-xl finance-3d-shadow-inner bg-white/50 border border-white/40">
            <User className="w-5 h-5" />
          </Button>
        </Link>
        <Button className="bg-primary text-white hover:bg-primary/95 h-12 px-8 rounded-xl font-bold shadow-xl transition-all hover:scale-105 hidden md:flex">
          <Zap className="w-4 h-4 mr-2 fill-accent text-accent" /> Join Now
        </Button>
      </div>
    </nav>
  );
}
