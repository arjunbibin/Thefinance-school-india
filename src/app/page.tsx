'use client';

import React from 'react';
import Link from 'next/link';
import ThreeHero from '@/components/ThreeHero';
import Navbar from '@/components/Navbar';
import CourseCatalog from '@/components/sections/CourseCatalog';
import ShowcaseSlideshow from '@/components/sections/ShowcaseSlideshow';
import ReviewsSection from '@/components/sections/ReviewsSection';
import VideoShowcase from '@/components/sections/VideoShowcase';
import WorkshopInvitation from '@/components/sections/WorkshopInvitation';
import ConnectWithUs from '@/components/sections/ConnectWithUs';
import Footer from '@/components/Footer';
import FinanceIcon3D from '@/components/FinanceIcon3D';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Globe, 
  Layers, 
  Shield, 
  Zap, 
  Clock, 
  Calendar, 
  Video, 
  MessageCircle, 
  Target,
  CircleCheckBig,
  ArrowRight,
  Users,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Trophy,
  School,
  TrendingUp,
  Award,
  PlayCircle
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const db = useFirestore();
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  const demoClassRef = useMemoFirebase(() => doc(db, 'system_settings', 'demo_class'), [db]);
  const { data: demoClass } = useDoc(demoClassRef);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const getYoutubeThumb = (url: string) => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  };

  const demoThumb = demoClass?.videoUrl ? getYoutubeThumb(demoClass.videoUrl) : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-accent selection:text-primary text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16 px-6 overflow-hidden">
        <ThreeHero />
        
        <div className="relative z-10 text-center max-w-5xl animate-in fade-in zoom-in duration-1000">
          {!branding?.showNo1Badge && (
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass-morphism mb-10 border border-white/40 finance-3d-shadow transition-all hover:scale-105 cursor-pointer group">
              <Zap className="w-5 h-5 text-accent animate-pulse fill-accent" />
              <span className="text-[10px] md:text-sm font-bold text-primary tracking-[0.2em] uppercase">The Future of Financial Literacy</span>
            </div>
          )}
          
          <h1 className="text-4xl md:text-7xl lg:text-9xl font-headline font-bold text-primary mb-8 leading-[1] tracking-tighter">
            Let's Deal with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-2xl">
              The Wealth
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-muted-foreground/80 mb-10 md:mb-14 max-w-3xl mx-auto leading-relaxed font-medium px-4">
            From budgeting basics to investment insights, The Finance School India empowers individuals to take charge of their money with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-6">
            <Link href="/quiz" className="w-full sm:w-auto">
              <Button className="h-14 md:h-16 px-8 md:px-12 rounded-2xl bg-accent text-primary font-bold text-lg md:text-xl finance-3d-shadow hover:scale-105 transition-transform flex items-center gap-3 w-full animate-pulse border-none">
                <GraduationCap className="w-6 h-6" /> Attend Quiz
              </Button>
            </Link>
            <Link href="#courses" className="w-full sm:w-auto">
              <Button variant="outline" className="h-14 md:h-16 px-8 md:px-12 rounded-2xl border-2 border-primary text-primary font-bold text-lg md:text-xl finance-3d-shadow hover:scale-105 transition-transform flex items-center gap-3 w-full bg-white">
                Explore Courses <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
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
      </section>

      {/* Impact Stats Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <div className="relative p-8 md:p-12 lg:p-16 rounded-[3rem] bg-white finance-3d-shadow overflow-hidden group border border-slate-50 flex flex-col items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          {/* India's No.1 Badge */}
          {branding?.showNo1Badge && (
            <div className="relative z-10 inline-flex items-center gap-3 px-8 py-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 border-2 border-white/50 finance-3d-shadow mb-12 transition-all hover:scale-110 cursor-default group animate-bounce">
              <Trophy className="w-6 h-6 text-primary fill-primary animate-pulse" />
              <span className="text-xs md:text-base font-black text-primary tracking-widest uppercase">India's No.1 Financial Literacy Program</span>
            </div>
          )}

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 w-full">
            {[
              { icon: GraduationCap, label: "Students Enrolled", value: branding?.statsStudents || "5000+", color: "text-primary" },
              { icon: School, label: "Workshops Conducted", value: branding?.statsWorkshops || "150+", color: "text-accent" },
              { icon: MessageSquare, label: "Success Testimonials", value: branding?.statsTestimonials || "200+", color: "text-primary" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-8 md:p-6 lg:p-10 text-center gap-4 transition-all duration-500 hover:scale-105">
                <div className={cn("p-4 rounded-[1.5rem] finance-3d-shadow-inner mb-2", stat.color)}>
                  <stat.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-primary tracking-tighter">
                    {stat.value}
                  </h3>
                  <p className="text-muted-foreground font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mt-2">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
          <Card className="p-8 md:p-12 border-none bg-white finance-3d-shadow rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] md:text-sm font-bold uppercase tracking-widest">
                <Globe className="w-4 h-4" /> Our Vision
              </div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">Building a <span className="text-accent">Secure Future</span></h2>
              <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
                To build a financially literate and economically independent generation capable of
                making informed, responsible, and confident financial decisions for a secure and
                fulfilling life.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </Card>

          <Card className="p-8 md:p-12 border-none bg-primary text-white rounded-[2.5rem] md:rounded-[3rem] finance-3d-shadow relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-[10px] md:text-sm font-bold uppercase tracking-widest">
                <Target className="w-4 h-4" /> Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Practical <span className="text-accent">Empowerment</span></h2>
              <ul className="space-y-4">
                {[
                  "To provide practical financial education through interactive workshops.",
                  "To teach individuals how to manage income effectively.",
                  "To empower people to escape from scams and debt traps.",
                  "To develop ethical wealth creation habits."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CircleCheckBig className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <span className="text-sm md:text-lg opacity-90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </Card>
        </div>
      </section>

      {/* Demo Class Section - Conditional */}
      {demoClass?.isActive && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <Card className="relative overflow-hidden border-none bg-slate-900 text-white p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] finance-3d-shadow group">
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-accent/20 text-accent border border-accent/20 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                  <PlayCircle className="w-4 h-4 animate-pulse" /> Exclusive Preview
                </div>
                <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
                  {demoClass.title || "Experience Our Demo Class"}
                </h2>
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">
                  Get a firsthand look at how we transform financial education into an interactive, 3D journey. Watch our sample workshop highlights now.
                </p>
                <Link href="/demo-class">
                  <Button className="h-16 px-10 rounded-2xl bg-white text-primary font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3 group/btn">
                    Attend Demo Class <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
              <Link href="/demo-class" className="block">
                <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white/10 finance-3d-shadow group-hover:scale-105 transition-transform duration-700 cursor-pointer">
                  {demoThumb ? (
                    <Image src={demoThumb} alt="Demo Thumbnail" fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-20 h-20 bg-accent text-primary rounded-full flex items-center justify-center shadow-2xl animate-float">
                      <PlayCircle className="w-10 h-10 fill-primary" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20" />
                </div>
              </Link>
            </div>
            {/* Background Orbs */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          </Card>
        </section>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 space-y-8 pb-12 px-2 md:px-0">
        <div id="courses" className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] md:rounded-[4rem] mx-2 md:mx-4 py-8 md:py-12 finance-3d-shadow-inner border border-white/20">
          <CourseCatalog />
        </div>

        <div className="space-y-8">
          <ShowcaseSlideshow />
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700 px-6">
            <Link href="/gallery" className="w-full md:w-auto">
              <Button className="h-14 md:h-16 px-8 rounded-2xl bg-primary text-white font-bold text-sm md:text-lg finance-3d-shadow hover:scale-105 transition-transform flex items-center gap-3 w-full border-none">
                See More Memories <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/team" className="w-full md:w-auto">
              <Button variant="outline" className="h-14 md:h-16 px-8 rounded-2xl border-2 border-primary text-primary font-bold text-sm md:text-lg finance-3d-shadow hover:scale-105 transition-transform flex items-center gap-3 w-full bg-white">
                View Our Team <Users className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/testimonials" className="w-full md:w-auto">
              <Button variant="outline" className="h-14 md:h-16 px-8 rounded-2xl border-2 border-accent text-primary font-bold text-sm md:text-lg finance-3d-shadow hover:scale-105 transition-transform flex items-center gap-3 w-full bg-white">
                See Our Testimonials <MessageSquare className="w-5 h-5 text-accent" />
              </Button>
            </Link>
          </div>
        </div>

        <VideoShowcase />
        <ReviewsSection />
        <WorkshopInvitation />

        {/* Attend Quiz CTA */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <Card className="p-8 py-12 md:p-24 border-none bg-gradient-to-br from-white via-slate-50 to-accent/5 finance-3d-shadow rounded-[2.5rem] md:rounded-[4rem] text-center relative overflow-hidden group">
             <div className="relative z-10 space-y-8 md:space-y-12">
               <div className="inline-flex items-center gap-3 px-6 md:px-8 py-2 md:py-3 rounded-full bg-accent/10 text-primary text-[10px] md:text-sm font-bold uppercase tracking-widest finance-3d-shadow-inner border border-accent/20">
                 <Trophy className="w-4 h-4 md:w-6 md:h-6 text-accent animate-bounce" /> Skill Assessment
               </div>
               <h2 className="text-3xl md:text-5xl lg:text-8xl font-headline font-bold text-primary tracking-tighter leading-tight md:leading-[0.9]">
                 Ready to Test Your <br />
                 <span className="text-accent italic drop-shadow-sm">Financial IQ?</span>
               </h2>
               <p className="text-base md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                 Put your knowledge to the ultimate test! Join our elite interactive quiz platform to unlock your full potential.
               </p>
               <div className="pt-4 md:pt-8">
                 <Link href="/quiz">
                   <Button className="h-16 md:h-20 lg:h-24 px-8 md:px-12 lg:px-20 rounded-2xl lg:rounded-[2rem] bg-primary text-white font-bold text-lg md:text-xl lg:text-4xl finance-3d-shadow hover:scale-105 active:scale-95 transition-all flex items-center gap-4 md:gap-8 mx-auto group shadow-[0_20px_40px_rgba(79,70,229,0.3)] border-none">
                     <GraduationCap className="w-6 h-6 md:w-10 lg:w-14 lg:h-14 group-hover:rotate-12 transition-transform" /> 
                     Attend Quiz 
                     <ArrowRight className="w-5 h-5 md:w-8 lg:w-10 lg:h-10 group-hover:translate-x-3 transition-transform" />
                   </Button>
                 </Link>
               </div>
             </div>
             <div className="absolute top-0 right-0 w-64 md:w-[500px] h-64 md:h-[500px] bg-accent/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000" />
             <div className="absolute bottom-0 left-0 w-64 md:w-[500px] h-64 md:h-[500px] bg-primary/10 rounded-full blur-[100px] -ml-20 -mb-20 group-hover:scale-125 transition-transform duration-1000" />
          </Card>
        </section>

        <ConnectWithUs />

        <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-12">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary">Course Structure & <span className="text-accent">Support</span></h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Our programs combine live interaction with practical workshops and dedicated mentorship.
                </p>
              </div>

              <div className="grid gap-6">
                {[
                  { icon: Clock, title: "9-Month Journey", desc: "Comprehensive curriculum that can be fast-tracked for accelerated learners.", color: "bg-primary/10" },
                  { icon: Calendar, title: "Flexible Schedule", desc: "Weekly 1-hour live online classes on weekends and public holidays.", color: "bg-accent/10" },
                  { icon: Video, title: "Hybrid Learning", desc: "A mix of Online interactive sessions and Offline practical workshops.", color: "bg-primary/10" }
                ].map((item, i) => (
                  <Card key={i} className="p-5 md:p-6 border-none finance-3d-shadow flex items-start gap-4 bg-white rounded-2xl">
                    <div className={cn("p-3 rounded-xl text-primary", item.color)}><item.icon className="w-5 h-5 md:w-6 md:h-6" /></div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg mb-1">{item.title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-8 md:p-12 border-none bg-primary text-white rounded-[2.5rem] md:rounded-[3rem] finance-3d-shadow relative overflow-hidden">
               <div className="relative z-10 space-y-8">
                  <h3 className="text-2xl md:text-3xl font-headline font-bold">Unmatched Support</h3>
                  <div className="space-y-6">
                    {[
                      { icon: MessageCircle, text: "Dedicated Mentor Support via WhatsApp & Email" },
                      { icon: CircleCheckBig, text: "Live Doubt-Clearing Calls whenever you need" },
                      { icon: Layers, text: "Pre-class & Post-class Recorded Sessions" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="bg-white/20 p-2 rounded-lg"><item.icon className="w-5 h-5" /></div>
                        <span className="text-sm md:text-base">{item.text}</span>
                      </div>
                    ))}
                  </div>
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
