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
  ExternalLink 
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

  const workshopFormUrl = "https://thefinschool.nurturecrm.in/publicwebform/0dd471d0-33bc-4a23-a83f-7881c4577842";

  const handleSocialClick = (url: string) => {
    if (url && url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
            <button 
              onClick={() => handleSocialClick(socialLinks.whatsapp)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5" 
              title="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSocialClick(socialLinks.facebook)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5" 
              title="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSocialClick(socialLinks.instagram)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5" 
              title="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSocialClick(socialLinks.youtube)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5" 
              title="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSocialClick(socialLinks.email)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-accent hover:text-primary transition-all cursor-pointer border border-white/5" 
              title="Email"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-headline font-bold mb-6">Our Programs</h4>
          <ul className="space-y-4 text-slate-400">
            <li className="hover:text-accent cursor-pointer">Finance for Life</li>
            <li className="hover:text-accent cursor-pointer">Rise and Lead</li>
            <li className="hover:text-accent cursor-pointer">Little CEO (Premium)</li>
            <li>
              <Link 
                href={`/register?url=${encodeURIComponent(workshopFormUrl)}`}
                className="hover:text-accent cursor-pointer flex items-center gap-2"
              >
                Offline Workshops <ExternalLink className="w-3 h-3" />
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-slate-400">
            <li className="hover:text-accent cursor-pointer">Mentor WhatsApp</li>
            <li className="hover:text-accent cursor-pointer">Doubt Clearing</li>
            <li className="hover:text-accent cursor-pointer">Recorded Sessions</li>
            <li>
              <Link href="/login" className="flex items-center gap-2 hover:text-accent cursor-pointer text-white/50 text-xs font-bold uppercase tracking-widest mt-4">
                <ShieldCheck className="w-4 h-4" /> Staff Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>© 2026 {appName}. Building tomorrow's entrepreneurs.</p>
        <div className="flex gap-8">
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4" /> {branding?.emailAddress || "support@financeschool.in"}
          </span>
        </div>
      </div>
    </footer>
  );
}
