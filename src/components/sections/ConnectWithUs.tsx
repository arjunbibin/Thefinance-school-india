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
  ExternalLink,
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
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]',
      description: 'Instant Support'
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      url: branding?.instagramUrl, 
      color: 'text-pink-500', 
      bgColor: 'bg-pink-500/10',
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]',
      description: 'Daily Updates'
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: branding?.facebookUrl, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-600/10',
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]',
      description: 'Community'
    },
    { 
      name: 'YouTube', 
      icon: Youtube, 
      url: branding?.youtubeUrl, 
      color: 'text-red-600', 
      bgColor: 'bg-red-600/10',
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]',
      description: 'Video Lessons'
    },
    { 
      name: 'Email', 
      icon: Mail, 
      url: branding?.emailAddress ? `mailto:${branding.emailAddress}` : null, 
      color: 'text-primary', 
      bgColor: 'bg-primary/10',
      hoverGlow: 'hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]',
      description: 'Official Queries'
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
      
      <div className="text-center mb-16 space-y-4">
        <Badge variant="outline" className="text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold flex items-center gap-2 mx-auto w-fit">
          <Sparkles className="w-3 h-3 text-accent animate-pulse" /> Social Network
        </Badge>
        <h2 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">Connect With <span className="text-accent italic">Us</span></h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed">
          Join our growing community and stay ahead with exclusive financial insights across all platforms.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
        {socialLinks.map((social, index) => (
          <Card 
            key={social.name}
            onClick={() => handleOpen(social.url)}
            className={cn(
              "group p-8 md:p-10 border-none bg-white finance-3d-shadow rounded-[2.5rem] flex flex-col items-center text-center gap-6 cursor-pointer transition-all duration-500 animate-float",
              social.hoverGlow,
              !social.url && "opacity-50 grayscale cursor-not-allowed pointer-events-none"
            )}
            style={{ animationDelay: `${index * 0.5}s`, animationDuration: '4s' }}
          >
            <div className={cn(
              "p-5 md:p-7 rounded-[2rem] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner",
              social.bgColor,
              social.color
            )}>
              <social.icon className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h4 className="font-headline font-bold text-primary text-lg md:text-2xl">{social.name}</h4>
              <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                {social.description}
              </p>
            </div>
            {social.url && (
              <div className="mt-2 p-2 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
