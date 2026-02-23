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
  Sparkles
} from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

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
      hoverGlow: 'group-hover/item:shadow-[0_0_30px_rgba(34,197,94,0.6)]',
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      url: branding?.instagramUrl, 
      color: 'text-pink-500', 
      bgColor: 'bg-pink-500/10',
      hoverGlow: 'group-hover/item:shadow-[0_0_30px_rgba(236,72,153,0.6)]',
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: branding?.facebookUrl, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-600/10',
      hoverGlow: 'group-hover/item:shadow-[0_0_30px_rgba(37,99,235,0.6)]',
    },
    { 
      name: 'YouTube', 
      icon: Youtube, 
      url: branding?.youtubeUrl, 
      color: 'text-red-600', 
      bgColor: 'bg-red-600/10',
      hoverGlow: 'group-hover/item:shadow-[0_0_30px_rgba(220,38,38,0.6)]',
    },
    { 
      name: 'Email', 
      icon: Mail, 
      url: branding?.emailAddress ? `mailto:${branding.emailAddress}` : null, 
      color: 'text-primary', 
      bgColor: 'bg-primary/10',
      hoverGlow: 'group-hover/item:shadow-[0_0_30px_rgba(79,70,229,0.6)]',
    },
  ];

  const handleOpen = (url: string | undefined | null) => {
    if (url && url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 animate-in fade-in slide-in-from-bottom-10 duration-1000 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
      
      <div className="text-center mb-12 space-y-4">
        <Badge variant="outline" className="text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold flex items-center gap-2 mx-auto w-fit">
          <Sparkles className="w-3 h-3 text-accent animate-pulse" /> Social Network
        </Badge>
        <h2 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">Stay <span className="text-accent italic">Linked</span></h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-xl font-medium px-4">
          Join our digital ecosystem for exclusive updates and financial wisdom.
        </p>
      </div>

      <Card className="p-8 md:p-16 lg:p-20 border-none bg-white finance-3d-shadow rounded-[3rem] md:rounded-[4rem] relative overflow-hidden group">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-6 md:gap-12 items-center justify-items-center relative z-10">
          {socialLinks.map((social, index) => (
            <div 
              key={social.name}
              onClick={() => handleOpen(social.url)}
              className={cn(
                "flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 group/item animate-float",
                !social.url && "opacity-30 grayscale cursor-not-allowed pointer-events-none"
              )}
              style={{ animationDelay: `${index * 0.4}s` }}
            >
              <div className={cn(
                "p-6 md:p-10 rounded-[2rem] lg:rounded-[2.5rem] transition-all duration-500 group-hover/item:scale-115 group-hover/item:rotate-12 shadow-inner relative overflow-hidden",
                social.bgColor,
                social.color,
                social.hoverGlow
              )}>
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover/item:opacity-30 transition-opacity" />
                <social.icon className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1.2} />
              </div>
              <div className="text-center">
                <span className="font-headline font-bold text-primary text-sm md:text-xl block">{social.name}</span>
                <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] opacity-0 group-hover/item:opacity-100 transition-all transform translate-y-2 group-hover/item:translate-y-0">
                  Connect
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Dynamic Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -ml-20 -mb-20 group-hover:scale-125 transition-transform duration-1000" />
      </Card>
    </section>
  );
}
