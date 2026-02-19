
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Navbar() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  const logoUrl = branding?.logoUrl || "https://firebasestorage.googleapis.com/v0/b/studio-6721629864-6b462.firebasestorage.app/o/logo%2Flogo.png?alt=media&token=1c70983d-c10f-440b-a75b-99d4013b1c9c";
  const appName = branding?.appName || 'The Finance School India';
  const tagline = branding?.tagline || "Let's Deal with The Wealth";

  return (
    <nav className="relative z-50 flex items-center justify-between px-8 py-6 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm">
      <Link href="/" className="flex items-center gap-3 md:gap-5 group">
        <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-2xl md:rounded-3xl overflow-hidden finance-3d-shadow group-hover:scale-110 transition-transform duration-300 bg-white p-1 md:p-2">
          <Image 
            src={logoUrl} 
            alt="Logo" 
            fill 
            className="object-contain"
            data-ai-hint="finance logo"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl md:text-3xl lg:text-4xl font-headline font-bold text-primary tracking-tighter leading-none">
            {appName}
          </span>
          <span className="text-[10px] md:text-xs lg:text-sm font-bold text-accent uppercase tracking-widest mt-1 opacity-80">
            {tagline}
          </span>
        </div>
      </Link>
      
      <div className="flex items-center gap-4">
        {isUserLoading ? (
          <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
        ) : user ? (
          <Link href="/dashboard">
            <Button variant="outline" className="text-primary border-primary/20 bg-white hover:bg-slate-50 rounded-xl finance-3d-shadow font-bold flex items-center gap-2 px-6">
              <User className="w-4 h-4" /> My Dashboard
            </Button>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
