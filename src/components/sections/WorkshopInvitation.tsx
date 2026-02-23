'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, GraduationCap, ArrowRight, Building2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkshopInvitation() {
  const router = useRouter();
  const workshopFormUrl = "https://thefinschool.nurturecrm.in/publicwebform/0dd471d0-33bc-4a23-a83f-7881c4577842";

  const handleInviteClick = () => {
    // Masked internal portal link
    router.push(`/register?url=${encodeURIComponent(workshopFormUrl)}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <Card className="p-6 py-12 md:p-16 border-none bg-white finance-3d-shadow rounded-[2rem] md:rounded-[3rem] relative overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-12 items-center">
          <div className="relative z-10 space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary text-[10px] md:text-sm font-bold uppercase tracking-widest finance-3d-shadow-inner mx-auto lg:mx-0">
              <School className="w-3 h-3 md:w-4 md:h-4 text-primary" /> Institutional Partnership
            </div>
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-headline font-bold text-primary tracking-tight leading-tight px-2 md:px-0">
              Bring Financial Literacy to Your <span className="text-accent">Campus</span>
            </h2>
            <p className="text-sm md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 px-4 md:px-0">
              Invite us for specialized workshops and seminars in your schools, colleges, or universities. We provide expert training tailored to empower students and faculty with real-world financial skills.
            </p>
            <div className="pt-2 md:pt-4 flex justify-center lg:justify-start">
              <Button 
                onClick={handleInviteClick}
                className="h-14 md:h-20 px-8 md:px-16 rounded-2xl md:rounded-3xl bg-primary text-white font-bold text-base md:text-2xl finance-3d-shadow hover:scale-105 transition-all flex items-center gap-3 md:gap-4 group"
              >
                <GraduationCap className="w-5 h-5 md:w-8 md:h-8 group-hover:rotate-12 transition-transform" /> Invite Us Now <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
              </Button>
            </div>
          </div>
          
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <Card className="p-8 border-none finance-3d-shadow bg-slate-50 rounded-[2.5rem] flex flex-col items-center text-center gap-4 hover:scale-105 transition-transform duration-500 group">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Building2 className="w-10 h-10" />
                </div>
                <span className="font-headline font-bold text-primary">Schools</span>
              </Card>
              <Card className="p-8 border-none finance-3d-shadow bg-slate-50 rounded-[2.5rem] flex flex-col items-center text-center gap-4 translate-y-8 hover:scale-105 transition-transform duration-500 group">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-accent group-hover:bg-accent group-hover:text-primary transition-colors">
                  <GraduationCap className="w-10 h-10" />
                </div>
                <span className="font-headline font-bold text-primary">Colleges</span>
              </Card>
            </div>
            
            {/* Background Decorative Element */}
            <div className="absolute inset-0 bg-accent/5 rounded-full blur-3xl -z-10 scale-150 animate-pulse" />
          </div>
        </div>
        
        {/* Decorative corner icon */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-20 md:w-40 h-20 md:h-40 text-primary" />
        </div>
      </Card>
    </section>
  );
}
