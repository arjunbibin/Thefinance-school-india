'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, GraduationCap, ArrowRight, Building2, Sparkles, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkshopInvitation() {
  const router = useRouter();
  const workshopFormUrl = "https://thefinschool.nurturecrm.in/publicwebform/0dd471d0-33bc-4a23-a83f-7881c4577842";

  const handleInviteClick = () => {
    router.push(`/register?url=${encodeURIComponent(workshopFormUrl)}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <Card className="p-6 py-12 md:p-16 lg:p-24 border-none bg-white finance-3d-shadow rounded-[2.5rem] md:rounded-[4rem] relative overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative z-10 space-y-6 md:space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary text-[10px] md:text-sm font-bold uppercase tracking-widest finance-3d-shadow-inner mx-auto lg:mx-0">
              <School className="w-4 h-4 text-primary" /> Institutional Partnership
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-headline font-bold text-primary tracking-tight leading-[1.1] md:leading-[1]">
              Bring Financial Literacy to Your <span className="text-accent underline decoration-primary/10 underline-offset-8">Campus</span>
            </h2>
            <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Invite us for specialized workshops and seminars. We provide expert training tailored to empower students and faculty with real-world financial skills.
            </p>
            <div className="pt-4 flex justify-center lg:justify-start">
              <Button 
                onClick={handleInviteClick}
                className="h-14 md:h-20 lg:h-24 px-8 md:px-16 lg:px-20 rounded-2xl lg:rounded-[2rem] bg-primary text-white font-bold text-base md:text-xl lg:text-3xl finance-3d-shadow hover:scale-105 active:scale-95 transition-all flex items-center gap-3 md:gap-6 group relative overflow-hidden border-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <GraduationCap className="w-5 h-5 md:w-8 lg:w-10 lg:h-10 group-hover:rotate-12 transition-transform" /> 
                Invite Us Now 
                <ArrowRight className="w-4 h-4 md:w-6 lg:w-8 lg:h-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </div>
          
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
              <Card className="p-10 border-none finance-3d-shadow bg-slate-50 rounded-[3rem] flex flex-col items-center text-center gap-6 hover:scale-110 hover:-rotate-3 transition-all duration-500 group animate-float">
                <div className="p-6 bg-white rounded-[2rem] shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Building2 className="w-12 h-12" />
                </div>
                <span className="font-headline font-bold text-primary text-xl">Schools</span>
                <Star className="w-5 h-5 text-accent animate-pulse" />
              </Card>
              <Card className="p-10 border-none finance-3d-shadow bg-slate-50 rounded-[3rem] flex flex-col items-center text-center gap-6 translate-y-12 hover:scale-110 hover:rotate-3 transition-all duration-500 group animate-float" style={{ animationDelay: '1s' }}>
                <div className="p-6 bg-white rounded-[2rem] shadow-sm text-accent group-hover:bg-accent group-hover:text-primary transition-colors">
                  <GraduationCap className="w-12 h-12" />
                </div>
                <span className="font-headline font-bold text-primary text-xl">Colleges</span>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </Card>
            </div>
            
            <div className="absolute inset-0 bg-accent/5 rounded-full blur-[100px] -z-10 scale-150 animate-pulse" />
          </div>
        </div>
        
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Sparkles className="w-40 md:w-80 h-40 md:h-80 text-primary" />
        </div>
      </Card>
    </section>
  );
}
