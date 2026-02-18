
'use client';

import Image from 'next/image';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import localLogo from '@/images/logo.png';

export default function Footer() {
  const db = useFirestore();
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  const logoUrl = branding?.logoUrl || localLogo || PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';
  const appName = branding?.appName || 'The Finance School';

  return (
    <footer className="bg-primary text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden p-1">
              <Image 
                src={logoUrl} 
                alt="Logo" 
                fill 
                className="object-contain"
                data-ai-hint="finance logo"
              />
            </div>
            <span className="text-2xl font-headline font-bold text-white tracking-tight">
              {appName}
            </span>
          </div>
          <p className="text-slate-400 max-w-sm mb-8">
            Empowering the next generation of investors with 3D immersive education and cutting-edge financial tools.
          </p>
          <div className="flex gap-4">
            <div className="p-2 rounded-lg bg-white/10 hover:bg-accent hover:text-primary transition-colors cursor-pointer"><Twitter className="w-5 h-5" /></div>
            <div className="p-2 rounded-lg bg-white/10 hover:bg-accent hover:text-primary transition-colors cursor-pointer"><Linkedin className="w-5 h-5" /></div>
            <div className="p-2 rounded-lg bg-white/10 hover:bg-accent hover:text-primary transition-colors cursor-pointer"><Github className="w-5 h-5" /></div>
          </div>
        </div>

        <div>
          <h4 className="font-headline font-bold mb-6">Platform</h4>
          <ul className="space-y-4 text-slate-400">
            <li className="hover:text-accent cursor-pointer">Course Catalog</li>
            <li className="hover:text-accent cursor-pointer">Simulation Tools</li>
            <li className="hover:text-accent cursor-pointer">News Aggregator</li>
            <li className="hover:text-accent cursor-pointer">Leaderboards</li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-slate-400">
            <li className="hover:text-accent cursor-pointer">Knowledge Base</li>
            <li className="hover:text-accent cursor-pointer">Help Center</li>
            <li className="hover:text-accent cursor-pointer">Terms of Service</li>
            <li className="hover:text-accent cursor-pointer">Privacy Policy</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>© 2024 {appName}. All rights reserved.</p>
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@financeschool.in</span>
        </div>
      </div>
    </footer>
  );
}
