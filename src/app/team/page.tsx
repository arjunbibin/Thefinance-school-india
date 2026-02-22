'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { UserSquare, Star, ShieldCheck } from 'lucide-react';

const FALLBACK_TEAM = [
  { id: "ceo", name: "Arjun Bibin", role: "CEO & Founder", bio: "Passionate about empowering the next generation with financial wisdom.", isFounder: true },
  { id: "gm", name: "Staff Member", role: "General Manager", bio: "Driving excellence in our financial curriculum.", isFounder: false }
];

export default function TeamPage() {
  const db = useFirestore();
  const teamQuery = useMemoFirebase(() => query(collection(db, 'team'), orderBy('order', 'asc')), [db]);
  const { data: remoteTeam, isLoading } = useCollection(teamQuery);

  const teamMembers = remoteTeam && remoteTeam.length > 0 ? remoteTeam : FALLBACK_TEAM;

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

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id} 
                className={cn(
                  "flex flex-col items-center text-center group",
                  "animate-in fade-in slide-in-from-bottom-20 duration-1000 fill-mode-forwards"
                )}
                style={{ animationDelay: `${index * 150}ms` }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className={cn(
                  "relative mb-8 p-2 rounded-full finance-3d-shadow transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2",
                  member.isFounder ? "animate-float ring-4 ring-accent/20 shadow-[0_0_50px_rgba(14,165,233,0.1)] scale-110" : ""
                )}>
                  <div className={cn(
                    "relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white finance-3d-shadow-inner bg-slate-100",
                    member.isFounder ? "md:w-64 md:h-64" : ""
                  )}>
                    {member.imageUrl ? (
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        data-ai-hint="professional portrait"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><UserSquare className="w-24 h-24" /></div>
                    )}
                    <div className={cn(
                      "absolute inset-0 border-[6px] rounded-full pointer-events-none",
                      member.isFounder ? "border-accent/30" : "border-primary/10"
                    )} />
                  </div>
                  
                  <div className={cn(
                    "absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl finance-3d-shadow border border-slate-100 transform transition-transform",
                    member.isFounder ? "rotate-0 scale-125 bg-accent text-primary" : "rotate-12 group-hover:rotate-0 text-accent"
                  )}>
                    {member.isFounder ? <Star className="w-6 h-6 fill-current" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className={cn(
                    "font-headline font-bold text-primary group-hover:text-accent transition-colors",
                    member.isFounder ? "text-3xl" : "text-2xl"
                  )}>{member.name}</h3>
                  <Badge variant="secondary" className={cn(
                    "px-4 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border-none",
                    member.isFounder ? "bg-accent text-primary shadow-sm" : "bg-primary/10 text-primary"
                  )}>
                    {member.role}
                  </Badge>
                  {member.bio && (
                    <p className="text-sm text-muted-foreground mt-4 italic max-w-[280px] line-clamp-3 leading-relaxed">
                      "{member.bio}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
