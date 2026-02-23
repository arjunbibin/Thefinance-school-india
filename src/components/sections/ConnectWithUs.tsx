'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  MessageCircle, 
  Mail, 
  ExternalLink
} from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ConnectWithUs() {
  const db = useFirestore();
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  const socialLinks = [
    { 
      name: 'WhatsApp', 
      icon: MessageCircle, 
      url: branding?.whatsappUrl, 
      color: 'text-green-500', 
      bgColor: 'bg-green-500/10',
      description: 'Instant Support'
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      url: branding?.instagramUrl, 
      color: 'text-pink-500', 
      bgColor: 'bg-pink-500/10',
      description: 'Daily Updates'
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: branding?.facebookUrl, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-600/10',
      description: 'Community'
    },
    { 
      name: 'YouTube', 
      icon: Youtube, 
      url: branding?.youtubeUrl, 
      color: 'text-red-600', 
      bgColor: 'bg-red-600/10',
      description: 'Video Lessons'
    },
    { 
      name: 'Email', 
      icon: Mail, 
      url: branding?.emailAddress ? `mailto:${branding.emailAddress}` : null, 
      color: 'text-primary', 
      bgColor: 'bg-primary/10',
      description: 'Official Queries'
    },
  ];

  const handleOpen = (url: string | undefined | null) => {
    if (url && url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="text-center mb-10 md:mb-16">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Social Network</Badge>
        <h2 className="text-3xl md:text-6xl font-headline font-bold text-primary tracking-tight">Connect With <span className="text-accent">Us</span></h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-sm md:text-lg">Stay updated with financial tips, workshop announcements, and success stories across all platforms.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
        {socialLinks.map((social) => (
          <Card 
            key={social.name}
            onClick={() => handleOpen(social.url)}
            className={`group p-6 md:p-8 border-none bg-white finance-3d-shadow rounded-[2rem] flex flex-col items-center text-center gap-4 cursor-pointer hover:scale-105 transition-all duration-300 ${!social.url ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}
          >
            <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl ${social.bgColor} ${social.color} transition-all duration-300 group-hover:scale-110 shadow-inner`}>
              <social.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-primary text-base md:text-lg">{social.name}</h4>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-tighter opacity-70">{social.description}</p>
            </div>
            {social.url && (
              <div className="mt-2 p-1.5 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
