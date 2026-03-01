'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { UserSquare, Star, Crown, Sparkles, ChevronLeft } from 'lucide-react';

const FALLBACK_TEAM = [
  { id: "ceo", name: "Arjun Bibin", role: "CEO & Founder", bio: "Passionate about empowering the next generation with financial wisdom.", leadershipType: "ceo" },
  { id: "gm", name: "Staff Member", role: "General Manager", bio: "Driving excellence in our financial curriculum.", leadershipType: "team" }
];

export default function TeamPage() {
  const db = useFirestore();
  const teamQuery = useMemoFirebase(() => query(collection(db, 'team'), orderBy('createdAt', 'desc')), [db]);
  const { data: remoteTeam, isLoading } = useCollection(teamQuery);

  const sortedMembers = React.useMemo(() => {
    const raw = (remoteTeam && remoteTeam.length > 0) ? remoteTeam : FALLBACK_TEAM;
    return [...raw].sort((a, b) => {
      const rank = { 'ceo': 0, 'co-founder': 1, 'team': 2 };
      const aRank = rank[a.leadershipType as keyof typeof rank] ?? 2;
      const bRank = rank[b.leadershipType as keyof typeof rank] ?? 2;
      
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });
  }, [remoteTeam]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col overflow-x-hidden relative">
      {/* Cinematic Star Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent opacity-60" />
        
        {/* Twinkling Star Layers */}
        <div className="stars-layer-1 absolute inset-0 opacity-40" />
        <div className="stars-layer-2 absolute inset-0 opacity-30" />
        
        {/* Diagonal Shooting Stars */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className={cn("shooting-star", `shooting-star-${i + 1}`)} />
        ))}
      </div>

      <Navbar />
      
      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="mb-12 flex items-center gap-4 animate-in fade-in duration-700">
          <Link href="/#memories">
            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl flex items-center gap-2 font-bold">
              <ChevronLeft className="w-5 h-5" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-24 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="mb-6 text-accent border-accent/20 px-8 py-2 finance-3d-shadow-inner bg-white/5 uppercase tracking-[0.3em] font-bold backdrop-blur-md">
            The Leadership
          </Badge>
          <h1 className="text-5xl md:text-8xl font-headline font-bold text-white tracking-tighter mb-6">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-primary drop-shadow-[0_0_20px_rgba(14,165,233,0.6)]">Visionaries</span>
          </h1>
          <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            The dedicated professionals behind The Finance School India, committed to building a financially literate generation.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 min-h-[400px]">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12">
            {sortedMembers.map((member, index) => {
              const isCEO = member.leadershipType === 'ceo';
              const isCoFounder = member.leadershipType === 'co-founder';
              const isLead = isCEO || isCoFounder;
              
              return (
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
                    "relative mb-10 p-1 rounded-full transition-all duration-700",
                    isCEO ? "scale-110 md:scale-125 z-20" : isCoFounder ? "scale-105 md:scale-115 z-10" : "scale-100"
                  )}>
                    <div className={cn(
                      "absolute inset-0 rounded-full animate-spin-slow opacity-50 blur-2xl transition-all duration-500",
                      isCEO ? "bg-gradient-to-tr from-yellow-500 via-amber-200 to-yellow-600" : 
                      isCoFounder ? "bg-gradient-to-tr from-slate-400 via-white to-slate-500" : 
                      "bg-white/10 group-hover:bg-accent/40 group-hover:blur-3xl"
                    )} />

                    <div 
                      className={cn(
                        "relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 bg-slate-900 transition-all duration-500 group-hover:scale-105 animate-float shadow-2xl",
                        isCEO ? "border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.4)]" : 
                        isCoFounder ? "border-slate-100 shadow-[0_0_40px_rgba(255,255,255,0.3)]" : 
                        "border-white/20 group-hover:border-accent shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                      )}
                      style={{ animationDelay: `${index * 0.4}s` }}
                    >
                      {member.imageUrl ? (
                        <Image
                          src={member.imageUrl}
                          alt={member.name}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                          data-ai-hint="professional portrait"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800"><UserSquare className="w-24 h-24 opacity-30" /></div>
                      )}
                    </div>
                    
                    <div className={cn(
                      "absolute -bottom-1 -right-1 p-2.5 rounded-2xl border-2 transition-all duration-500",
                      isCEO ? "bg-yellow-500 text-primary border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.6)] scale-110" : 
                      isCoFounder ? "bg-slate-100 text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-100" : 
                      "bg-white text-primary border-white scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                    )}>
                      {isCEO ? <Crown className="w-5 h-5 fill-primary" /> : isCoFounder ? <Star className="w-4 h-4 fill-slate-900" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className={cn(
                      "font-headline font-bold text-white transition-all duration-300",
                      isLead ? "text-3xl tracking-tight" : "text-xl text-slate-100"
                    )}>
                      {member.name}
                    </h3>
                    
                    <div className={cn(
                      "inline-flex px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                      isCEO ? "bg-yellow-400/10 text-yellow-500 border border-yellow-400/40" : 
                      isCoFounder ? "bg-white/10 text-slate-200 border border-white/40" : 
                      "bg-white/5 text-slate-400 border border-white/10 group-hover:text-accent group-hover:border-accent/50"
                    )}>
                      {member.role}
                    </div>

                    {member.bio && (
                      <p className="text-sm text-slate-500 mt-4 italic max-w-[280px] line-clamp-3 leading-relaxed transition-colors group-hover:text-slate-300">
                        "{member.bio}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }

        .stars-layer-1 {
          background-image: radial-gradient(1.5px 1.5px at 20px 30px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1.5px 1.5px at 50px 160px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 80px 120px, #fff, rgba(0,0,0,0));
          background-size: 200px 200px;
        }

        .stars-layer-2 {
          background-image: radial-gradient(1.5px 1.5px at 100px 150px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 200px 50px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 300px 250px, #fff, rgba(0,0,0,0));
          background-size: 400px 400px;
        }

        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0));
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
          transform: rotate(-135deg); 
          filter: drop-shadow(0 0 6px #fff);
        }

        .shooting-star::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 150px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0));
        }

        @keyframes shooting {
          0% {
            transform: rotate(-135deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          40% {
            opacity: 1;
          }
          60% {
            opacity: 0;
            transform: rotate(-135deg) translateX(-1500px);
          }
          100% {
             transform: rotate(-135deg) translateX(-1500px);
             opacity: 0;
          }
        }

        .shooting-star-1 { top: 5%; right: 5%; animation: shooting 4s linear infinite; animation-delay: 0.2s; }
        .shooting-star-2 { top: 15%; right: 35%; animation: shooting 5s linear infinite; animation-delay: 2.1s; }
        .shooting-star-3 { top: 0%; right: 65%; animation: shooting 3s linear infinite; animation-delay: 4.3s; }
        .shooting-star-4 { top: 35%; right: 15%; animation: shooting 6s linear infinite; animation-delay: 6.2s; }
        .shooting-star-5 { top: 55%; right: 0%; animation: shooting 4.5s linear infinite; animation-delay: 1.1s; }
        .shooting-star-6 { top: 10%; right: 10%; animation: shooting 5.5s linear infinite; animation-delay: 3.4s; }
        .shooting-star-7 { top: 30%; right: 80%; animation: shooting 4.1s linear infinite; animation-delay: 5.2s; }
        .shooting-star-8 { top: 50%; right: 20%; animation: shooting 5.1s linear infinite; animation-delay: 7.3s; }
        .shooting-star-9 { top: 20%; right: 90%; animation: shooting 4.7s linear infinite; animation-delay: 0.8s; }
        .shooting-star-10 { top: 70%; right: 30%; animation: shooting 5.9s linear infinite; animation-delay: 2.5s; }
      `}</style>
    </div>
  );
}
