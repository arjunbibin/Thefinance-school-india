
'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { UserSquare, Star, Crown, Sparkles } from 'lucide-react';

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        
        {/* Twinkling Star Layers */}
        <div className="stars-layer-1 absolute inset-0 opacity-30" />
        <div className="stars-layer-2 absolute inset-0 opacity-20" />
        
        {/* Diagonal Shooting Stars (Top-Right to Bottom-Left) */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className={cn("shooting-star", `shooting-star-${i + 1}`)} />
        ))}
      </div>

      <Navbar />
      
      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="mb-24 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="mb-6 text-accent border-accent/20 px-8 py-2 finance-3d-shadow-inner bg-white/5 uppercase tracking-[0.3em] font-bold backdrop-blur-md">
            The Leadership
          </Badge>
          <h1 className="text-5xl md:text-8xl font-headline font-bold text-white tracking-tighter mb-6">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-primary drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">Visionaries</span>
          </h1>
          <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            The dedicated professionals behind The Finance School India, committed to building a financially literate generation.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
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
                    isCEO ? "scale-110 md:scale-125 z-20" : isCoFounder ? "scale-105 md:scale-115 z-10" : "hover:-translate-y-2"
                  )}>
                    {/* Metallic Aura Shimmer */}
                    {isLead && (
                      <div className={cn(
                        "absolute inset-0 rounded-full animate-spin-slow opacity-30 blur-2xl",
                        isCEO ? "bg-gradient-to-tr from-yellow-500 via-amber-200 to-yellow-600" : "bg-gradient-to-tr from-slate-400 via-white to-slate-500"
                      )} />
                    )}

                    <div 
                      className={cn(
                        "relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 bg-slate-900 finance-3d-shadow transition-transform duration-500 group-hover:scale-105 animate-float",
                        isCEO ? "border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.4)]" : 
                        isCoFounder ? "border-slate-300 shadow-[0_0_40px_rgba(203,213,225,0.3)]" : 
                        "border-white/10 group-hover:border-accent/40"
                      )}
                      style={{ animationDelay: `${index * 0.8}s` }}
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
                        <div className="w-full h-full flex items-center justify-center text-slate-700"><UserSquare className="w-24 h-24 opacity-50" /></div>
                      )}
                      
                      {/* Reflection Shine */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    
                    <div className={cn(
                      "absolute -bottom-2 -right-2 p-3 rounded-2xl border transition-all duration-500",
                      isCEO ? "bg-yellow-400 text-primary border-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.6)] scale-125" : 
                      isCoFounder ? "bg-slate-200 text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110" : 
                      "bg-white/10 text-accent border-white/10 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                    )}>
                      {isCEO ? <Crown className="w-6 h-6 fill-primary" /> : isCoFounder ? <Star className="w-5 h-5 fill-slate-900" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className={cn(
                      "font-headline font-bold text-white transition-all duration-300",
                      isLead ? "text-3xl tracking-tight" : "text-xl text-slate-200"
                    )}>
                      {member.name}
                    </h3>
                    
                    <div className={cn(
                      "inline-flex px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                      isCEO ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30" : 
                      isCoFounder ? "bg-slate-200/20 text-slate-200 border border-slate-200/30" : 
                      "bg-white/5 text-slate-400 border border-white/10 group-hover:text-accent group-hover:border-accent/30"
                    )}>
                      {member.role}
                    </div>

                    {member.bio && (
                      <p className="text-sm text-slate-500 mt-4 italic max-w-[280px] line-clamp-3 leading-relaxed transition-colors group-hover:text-slate-400">
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
          background-image: radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1.5px 1.5px at 50px 160px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 80px 120px, #fff, rgba(0,0,0,0));
          background-size: 200px 200px;
        }

        .stars-layer-2 {
          background-image: radial-gradient(1px 1px at 100px 150px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 200px 50px, #fff, rgba(0,0,0,0)),
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
          /* Rotated to point correctly on its path */
          transform: rotate(-135deg); 
          filter: drop-shadow(0 0 4px #fff);
        }

        .shooting-star::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 80px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0));
        }

        @keyframes shooting {
          0% {
            transform: rotate(-135deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: rotate(-135deg) translateX(-1000px);
            opacity: 0;
          }
        }

        .shooting-star-1 { top: 10%; right: 10%; animation: shooting 4s linear infinite; animation-delay: 1s; }
        .shooting-star-2 { top: 20%; right: 40%; animation: shooting 5s linear infinite; animation-delay: 3s; }
        .shooting-star-3 { top: 5%; right: 70%; animation: shooting 3s linear infinite; animation-delay: 5s; }
        .shooting-star-4 { top: 40%; right: 20%; animation: shooting 6s linear infinite; animation-delay: 7s; }
        .shooting-star-5 { top: 60%; right: 5%; animation: shooting 4.5s linear infinite; animation-delay: 2s; }
        .shooting-star-6 { top: 15%; right: 15%; animation: shooting 5.5s linear infinite; animation-delay: 4.5s; }
      `}</style>
    </div>
  );
}
