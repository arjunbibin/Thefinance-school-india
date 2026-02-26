
'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle, ArrowRight, CheckCircle2, MessageSquare, BookOpen, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DemoClassPage() {
  const db = useFirestore();
  const router = useRouter();
  
  const demoClassRef = useMemoFirebase(() => doc(db, 'system_settings', 'demo_class'), [db]);
  const { data: demoClass, isLoading } = useDoc(demoClassRef);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase().split('?')[0];
    return (
      lowerUrl.endsWith('.mp4') || 
      lowerUrl.endsWith('.webm') || 
      lowerUrl.endsWith('.ogg') || 
      lowerUrl.endsWith('.mov') ||
      url.includes('contentType=video')
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!demoClass || !demoClass.isActive) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6">
          <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5 px-6 py-2">Section Offline</Badge>
          <h1 className="text-4xl font-headline font-bold text-primary">The Demo Class is not available yet.</h1>
          <p className="text-muted-foreground max-w-md">Our team is preparing a fresh experience for you. Please check back later or explore our current courses.</p>
          <Button onClick={() => router.push('/')} variant="outline" className="rounded-xl h-12 border-primary text-primary font-bold">Return Home</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const ytId = getYoutubeId(demoClass.videoUrl);
  const isDirectVideo = isVideoUrl(demoClass.videoUrl);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="mb-16 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">The Experience</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">{demoClass.title || "The Demo Class"}</h1>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Witness the future of financial literacy. Learn how we make money management simple, fun, and impactful.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-10 animate-in slide-in-from-left-10 duration-1000">
            {/* Main Video Player */}
            <Card className="relative aspect-video w-full overflow-hidden border-none bg-black finance-3d-shadow rounded-[2.5rem] md:rounded-[4rem] group">
              {ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0&vq=hd1080`}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isDirectVideo ? (
                <video
                  src={demoClass.videoUrl}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/40 space-y-4">
                  <PlayCircle className="w-20 h-20 opacity-20" />
                  <p className="font-bold">Video format not recognized or link is invalid.</p>
                </div>
              )}
            </Card>

            {/* Description Section */}
            {demoClass.description && (
              <div className="p-8 md:p-12 bg-white finance-3d-shadow rounded-[2.5rem] md:rounded-[3.5rem] border border-white/20">
                <h3 className="text-2xl md:text-3xl font-headline font-bold text-primary mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-accent" /> About This Session
                </h3>
                <div className="prose prose-slate max-w-none text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                  {demoClass.description}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-right-10 duration-1000">
            {/* Call to Action Sidebar */}
            <Card className="p-8 md:p-10 border-none bg-primary text-white finance-3d-shadow rounded-[2.5rem] relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                <h3 className="text-3xl font-headline font-bold leading-tight">Ready to start your journey?</h3>
                <p className="opacity-80 text-lg">If you liked this session, our comprehensive programs offer even more value.</p>
                
                <div className="space-y-4">
                  <Button 
                    onClick={() => router.push('/#courses')}
                    className="w-full h-16 rounded-2xl bg-accent text-primary font-bold text-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-xl"
                  >
                    <ThumbsUp className="w-6 h-6" /> I am Interested
                  </Button>
                  <Button 
                    onClick={() => router.push('/testimonials')}
                    variant="outline"
                    className="w-full h-16 rounded-2xl border-white/30 bg-white/10 text-white font-bold text-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                  >
                    <ThumbsDown className="w-6 h-6" /> Not Interested
                  </Button>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">What's Next?</p>
                  <div className="space-y-3">
                    {[
                      "Guided Roadmap to Wealth",
                      "Interactive Live Workshops",
                      "Dedicated Mentor Access"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </Card>

            <Card className="p-8 border-none bg-white finance-3d-shadow rounded-[2.5rem] text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h4 className="font-headline font-bold text-primary text-xl">Have Questions?</h4>
              <p className="text-muted-foreground text-sm">Connect with our learning consultants directly on WhatsApp for guidance.</p>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-accent text-primary font-bold hover:bg-accent/5"
                onClick={() => window.open('https://wa.me/financeschoolindia', '_blank')}
              >
                Chat With Us
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
