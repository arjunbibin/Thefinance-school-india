
import React from 'react';
import ThreeHero from '@/components/ThreeHero';
import Navbar from '@/components/Navbar';
import CourseCatalog from '@/components/sections/CourseCatalog';
import Footer from '@/components/Footer';
import FinanceIcon3D from '@/components/FinanceIcon3D';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowRight, 
  Globe, 
  Layers, 
  Shield, 
  Zap, 
  MousePointer2, 
  Clock, 
  Calendar, 
  Video, 
  MessageCircle, 
  CheckCircle,
  Target
} from 'lucide-react';

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
            <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase">Empowering Young Minds</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-headline font-bold text-primary mb-8 leading-[1] tracking-tighter">
            Let's Deal with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-2xl">
              The Wealth
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground/80 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
            From budgeting basics to investment insights, The Finance School India empowers children to take charge of their money with confidence. Learn how to grow, protect, and manage wealth step by step.
          </p>
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Explore Programs</span>
          <MousePointer2 className="w-5 h-5 text-primary rotate-180" />
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16">
          <Card className="p-10 border-none bg-white finance-3d-shadow rounded-[3rem] relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest">
                <Globe className="w-4 h-4" /> Our Vision
              </div>
              <h2 className="text-4xl font-headline font-bold text-primary">Building a <span className="text-accent">Secure Future</span></h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To build a financially literate and economically independent generation capable of
                making informed, responsible, and confident financial decisions for a secure and
                fulfilling life.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </Card>

          <Card className="p-10 border-none bg-primary text-white rounded-[3rem] finance-3d-shadow relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-bold uppercase tracking-widest">
                <Target className="w-4 h-4" /> Our Mission
              </div>
              <h2 className="text-4xl font-headline font-bold">Practical <span className="text-accent">Empowerment</span></h2>
              <ul className="space-y-4">
                {[
                  "To provide practical financial education to students and elders through interactive workshops and structured programs.",
                  "To teach individuals how to manage their income effectively, irrespective of its size.",
                  "To empower people to escape from scams, debt traps, and poor money habits.",
                  "To develop a new generation of financially responsible citizens who value saving, investing, and ethical wealth creation."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent shrink-0 mt-1" />
                    <span className="text-lg opacity-90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </Card>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative z-10 space-y-32 pb-32">
        <div className="bg-white/40 backdrop-blur-sm rounded-[4rem] mx-4 py-8 finance-3d-shadow-inner border border-white/20">
          <CourseCatalog />
        </div>

        {/* Course Structure Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary">Course Structure & <span className="text-accent">Support</span></h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our programs are designed for long-term impact, combining live interaction with practical workshops and dedicated mentorship.
                </p>
              </div>

              <div className="grid gap-6">
                <Card className="p-6 border-none finance-3d-shadow flex items-start gap-4 bg-white rounded-2xl">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary"><Clock className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">9-Month Journey</h4>
                    <p className="text-sm text-muted-foreground">Comprehensive curriculum that can be fast-tracked to 6 months for accelerated learners.</p>
                  </div>
                </Card>
                <Card className="p-6 border-none finance-3d-shadow flex items-start gap-4 bg-white rounded-2xl">
                  <div className="p-3 bg-accent/10 rounded-xl text-primary"><Calendar className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Flexible Schedule</h4>
                    <p className="text-sm text-muted-foreground">Weekly 1-hour live online classes on weekends and public holidays to fit into school life.</p>
                  </div>
                </Card>
                <Card className="p-6 border-none finance-3d-shadow flex items-start gap-4 bg-white rounded-2xl">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary"><Video className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Hybrid Learning</h4>
                    <p className="text-sm text-muted-foreground">A mix of Online interactive sessions and Offline practical workshops for real-world exposure.</p>
                  </div>
                </Card>
              </div>
            </div>

            <Card className="p-10 border-none bg-primary text-white rounded-[3rem] finance-3d-shadow relative overflow-hidden">
               <div className="relative z-10 space-y-8">
                  <h3 className="text-3xl font-headline font-bold">Unmatched Support</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-lg"><MessageCircle className="w-5 h-5" /></div>
                      <span>Dedicated Mentor Support via WhatsApp & Email</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
                      <span>Live Doubt-Clearing Calls whenever you need</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-lg"><Layers className="w-5 h-5" /></div>
                      <span>Pre-class & Post-class Recorded Sessions</span>
                    </div>
                  </div>
                  <Button className="w-full h-14 bg-accent text-primary font-bold rounded-2xl text-lg hover:scale-[1.02] transition-transform">
                    Join the Waitlist
                  </Button>
               </div>
               <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            </Card>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
