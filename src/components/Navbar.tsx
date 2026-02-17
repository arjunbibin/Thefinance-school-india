import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Box, User, LayoutDashboard, Globe, Zap, Bell } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between px-8 py-4 glass-morphism border-white/40 finance-3d-shadow rounded-3xl animate-in fade-in slide-in-from-top-4 duration-1000">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="bg-primary p-2.5 rounded-2xl finance-3d-shadow group-hover:scale-110 transition-transform duration-300">
          <Box className="text-accent w-7 h-7" />
        </div>
        <span className="text-2xl font-headline font-bold text-primary tracking-tighter">
          Finance<span className="text-accent italic drop-shadow-sm">Verse</span>
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
