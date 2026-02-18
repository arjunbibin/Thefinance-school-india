'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import localLogo from '@/images/logo.png';

export default function Navbar() {
  const db = useFirestore();
  
  // Real-time branding sync from Firestore
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  // Fallbacks: Firestore -> Local Upload -> Placeholder
  const logoUrl = branding?.logoUrl || localLogo || PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';
  const appName = branding?.appName || 'The Finance School India';
  const tagline = branding?.tagline || "Let's Deal with The Wealth";

  return (
    <nav className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between px-8 py-4 glass-morphism border-white/40 finance-3d-shadow rounded-3xl animate-in fade-in slide-in-from-top-4 duration-1000">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden finance-3d-shadow group-hover:scale-110 transition-transform duration-300 bg-white">
          <Image 
            src={logoUrl} 
            alt="Logo" 
            fill 
            className="object-contain p-1"
            data-ai-hint="finance logo"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-headline font-bold text-primary tracking-tighter leading-none">
            {appName}
          </span>
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1 opacity-80">
            {tagline}
          </span>
        </div>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-primary hover:bg-accent/20 rounded-xl finance-3d-shadow-inner bg-white/50 border border-white/40">
            <User className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </nav>
  );
}
