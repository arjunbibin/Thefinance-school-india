
'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Users, ShieldCheck, Briefcase, Star } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: "Arjun Bibin",
    role: "CEO & Founder",
    id: "team-ceo",
    bio: "Passionate about empowering the next generation with practical financial wisdom.",
    icon: Star,
    isFounder: true
  },
  {
    name: "Sarah Jenkins",
    role: "Co-Founder",
    id: "team-cofounder",
    bio: "Expert in educational strategy and leadership development for young minds.",
    icon: ShieldCheck,
    isFounder: true
  },
  {
    name: "David Chen",
    role: "General Manager",
    id: "team-manager1",
    bio: "Driving operational excellence and community engagement across India.",
    icon: Briefcase,
    isFounder: false
  },
  {
    name: "Elena Rodriguez",
    role: "Tech Head",
    id: "team-techhead",
    bio: "Innovating the digital learning experience with cutting-edge 3D tools.",
    icon: Users,
    isFounder: false
  }
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="mb-20 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">The Leadership</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">Meet Our <span className="text-accent">Visionaries</span></h1>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            The dedicated professionals behind The Finance School India, committed to building a financially literate generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {TEAM_MEMBERS.map((member, index) => {
            const placeholder = PlaceHolderImages.find(img => img.id === member.id);
            const MemberIcon = member.icon;
            
            return (
              <div 
                key={member.id} 
                className={cn(
                  "flex flex-col items-center text-center group",
                  "animate-in fade-in slide-in-from-bottom-10 duration-1000",
                  member.isFounder ? "animate-float" : ""
                )}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* 3D Circular Portrait Container */}
                <div className="relative mb-8 p-2 rounded-full finance-3d-shadow transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                  <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white finance-3d-shadow-inner">
                    <Image
                      src={placeholder?.imageUrl || `https://picsum.photos/seed/${member.id}/400/400`}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      data-ai-hint="professional portrait"
                    />
                    {/* Decorative Ring */}
                    <div className="absolute inset-0 border-[6px] border-primary/10 rounded-full pointer-events-none" />
                  </div>
                  
                  {/* Floating Icon Badge */}
                  <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl finance-3d-shadow border border-slate-100 transform rotate-12 group-hover:rotate-0 transition-transform">
                    <MemberIcon className="w-6 h-6 text-accent" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-headline font-bold text-primary group-hover:text-accent transition-colors">{member.name}</h3>
                  <Badge variant="secondary" className="px-4 py-1 rounded-lg text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border-none">
                    {member.role}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-4 italic max-w-[250px]">
                    "{member.bio}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
