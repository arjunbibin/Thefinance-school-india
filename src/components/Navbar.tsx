
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { User, LogIn, GraduationCap } from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Navbar() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  const logoUrl = branding?.logoUrl || PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';
  const appName = branding?.appName || 'The Finance School India';
  const tagline = branding?.tagline || "Let's Deal with The Wealth";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass-morphism border-b border-white/20 shadow-lg">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden finance-3d-shadow group-hover:scale-110 transition-transform duration-300 bg-white p-1">
          <Image 
            src={logoUrl} 
            alt="Logo" 
            fill 
            className="object-contain"
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
        {isUserLoading ? (
          <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
        ) : user ? (
          <Link href="/dashboard">
            <Button variant="outline" className="text-primary border-primary/20 bg-white hover:bg-slate-50 rounded-xl finance-3d-shadow font-bold flex items-center gap-2 px-6">
              <User className="w-4 h-4" /> My Dashboard
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" onClick={() => (window as any).isSignUpRequested = false}>
              <Button variant="ghost" className="text-primary font-bold hover:bg-slate-50">
                Log In
              </Button>
            </Link>
            <Link href="/login" onClick={() => (window as any).isSignUpRequested = true}>
              <Button className="bg-primary text-white font-bold px-8 h-12 rounded-xl shadow-xl hover:scale-105 transition-all">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
