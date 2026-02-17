import React from 'react';
import ThreeHero from '@/components/ThreeHero';
import Navbar from '@/components/Navbar';
import CourseCatalog from '@/components/sections/CourseCatalog';
import FinancialTools from '@/components/sections/FinancialTools';
import NewsFeed from '@/components/sections/NewsFeed';
import Footer from '@/components/Footer';
import FinanceIcon3D from '@/components/FinanceIcon3D';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Layers, Shield, Zap, MousePointer2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-accent selection:text-primary">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 px-6 overflow-hidden">
        <ThreeHero />
        
        <div className="relative z-10 text-center max-w-5xl animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass-morphism mb-10 border border-white/40 finance-3d-shadow transition-all hover:scale-105 cursor-pointer group">
            <Zap className="w-5 h-5 text-accent animate-pulse fill-accent" />
            <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase">The Future of Financial Literacy</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-headline font-bold text-primary mb-8 leading-[0.9] tracking-tighter">
            Master Markets in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-2xl">
              3D Intelligence
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground/80 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
            Navigate the complexity of global finance with immersive visualizations, 
            intelligent simulation engines, and live institutional-grade data.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Button size="lg" className="h-16 bg-primary hover:bg-primary/95 text-white px-10 text-xl font-bold rounded-2xl transition-all hover:scale-110 shadow-2xl hover:shadow-primary/40 group">
              Get Started Free
              <ArrowRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold rounded-2xl glass-morphism hover:bg-white/60 border-2 transition-all hover:scale-105 finance-3d-shadow">
              Watch 3D Demo
            </Button>
          </div>
        </div>

        {/* Floating Interactive Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden xl:block">
           <FinanceIcon3D 
            icon={Globe} 
            className="absolute top-1/4 left-20 animate-float" 
            style={{ animationDuration: '7s' }}
           />
           <FinanceIcon3D 
            icon={Layers} 
            className="absolute bottom-1/3 right-24 animate-float" 
            style={{ animationDuration: '9s', animationDelay: '1s' }} 
           />
           <FinanceIcon3D 
            icon={Shield} 
            className="absolute top-1/3 right-1/4 animate-float" 
            style={{ animationDuration: '8s', animationDelay: '2s' }} 
           />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce cursor-pointer hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Explore Verse</span>
          <MousePointer2 className="w-5 h-5 text-primary rotate-180" />
        </div>
      </section>

      {/* Content Wrappers for Layered Feel */}
      <div className="relative z-10 space-y-32 pb-32">
        <div className="bg-white/40 backdrop-blur-sm rounded-[4rem] mx-4 py-8 finance-3d-shadow-inner border border-white/20">
          <CourseCatalog />
        </div>
        
        <FinancialTools />
        
        <div className="bg-gradient-to-b from-transparent to-slate-100/50">
          <NewsFeed />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
