'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  MessageCircle, 
  Mail, 
  ShieldCheck,
  Smartphone,
  Apple 
} from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Footer() {
  const db = useFirestore();
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  const logoUrl = branding?.logoUrl || "https://firebasestorage.googleapis.com/v0/b/studio-6721629864-6b462.firebasestorage.app/o/logo%2Flogo.png?alt=media&token=1c70983d-c10f-440b-a75b-99d4013b1c9c";
  const appName = branding?.appName || 'The Finance School India';
  
  const socialLinks = {
    whatsapp: branding?.whatsappUrl || "#",
    facebook: branding?.facebookUrl || "#",
    instagram: branding?.instagramUrl || "#",
    youtube: branding?.youtubeUrl || "#",
    email: branding?.emailAddress ? `mailto:${branding.emailAddress}` : "mailto:support@financeschool.in"
  };

  return (
    <footer className="bg-primary text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-4 md:gap-6 mb-6">
            <div className="relative w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl overflow-hidden p-1 md:p-2">
              <Image 
                src={logoUrl} 
                alt="Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-2xl md:text-4xl font-headline font-bold text-white tracking-tight">
              {appName}
            </span>
          </div>
          <p className="text-slate-400 max-w-sm mb-8">
            An Edu-Tech initiative focused on building financial awareness, leadership skills, and real-life readiness among children.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => window.open(socialLinks.whatsapp, '_blank')} className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5"><MessageCircle className="w-5 h-5" /></button>
            <button onClick={() => window.open(socialLinks.facebook, '_blank')} className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5"><Facebook className="w-5 h-5" /></button>
            <button onClick={() => window.open(socialLinks.instagram, '_blank')} className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5"><Instagram className="w-5 h-5" /></button>
            <button onClick={() => window.open(socialLinks.youtube, '_blank')} className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5"><Youtube className="w-5 h-5" /></button>
            <button onClick={() => window.open(socialLinks.email, '_blank')} className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5"><Mail className="w-5 h-5" /></button>
          </div>

          {branding?.showAppDownload && (
            <div className="mt-8 flex flex-wrap gap-4">
              {branding?.playStoreUrl && (
                <button onClick={() => window.open(branding.playStoreUrl, '_blank')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <Smartphone className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold">Google Play</span>
                </button>
              )}
              {branding?.appStoreUrl && (
                <button onClick={() => window.open(branding.appStoreUrl, '_blank')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <Apple className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold">App Store</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-headline font-bold mb-6">Our Programs</h4>
          <ul className="space-y-4 text-slate-400">
            <li>Finance for Life</li>
            <li>Rise and Lead</li>
            <li>Little CEO (Premium)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-slate-400">
            <li>Mentor WhatsApp</li>
            <li>Doubt Clearing</li>
            <li>
              <Link href="/login" className="flex items-center gap-2 hover:text-accent cursor-pointer text-white/50 text-xs font-bold uppercase tracking-widest mt-4">
                <ShieldCheck className="w-4 h-4" /> Staff Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex justify-between items-center text-sm text-slate-500">
        <p>© 2026 {appName}. Building tomorrow's entrepreneurs.</p>
      </div>
    </footer>
  );
}
