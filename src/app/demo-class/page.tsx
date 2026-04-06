'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, ChevronLeft, BookOpen, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DemoClassPage() {
  const db = useFirestore();
  const router = useRouter();
  
  const demoClassRef = useMemoFirebase(() => doc(db, 'system_settings', 'demo_class'), [db]);
  const { data: demoClass, isLoading: isDemoLoading } = useDoc(demoClassRef);

  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  if (isDemoLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (!demoClass || !demoClass.isActive) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="text-4xl font-headline font-bold text-primary">The Demo Class is not available yet.</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-xl h-12">Return Home</Button>
      </main>
      <Footer />
    </div>
  );

  const ytId = getYoutubeId(demoClass.videoUrl);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow max-w-5xl mx-auto px-6 py-24 w-full">
        <div className="mb-12">
          <Link href="/#demo">
            <Button variant="ghost" className="rounded-xl flex items-center gap-2 font-bold"><ChevronLeft className="w-5 h-5" /> Back to Home</Button>
          </Link>
        </div>

        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">{demoClass.title || "The Demo Class"}</h1>
          <p className="text-muted-foreground mt-6 text-lg max-w-2xl mx-auto">Witness the future of financial literacy. Learn how we make money management simple, fun, and impactful.</p>
        </div>

        <div className="space-y-12">
          <Card className="relative aspect-video w-full overflow-hidden border-none bg-black finance-3d-shadow rounded-[2.5rem]">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0`}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <video src={demoClass.videoUrl} className="w-full h-full object-cover" controls autoPlay />
            )}
          </Card>

          {demoClass.description && (
            <div className="p-8 md:p-12 bg-white finance-3d-shadow rounded-[2.5rem]">
              <h3 className="text-2xl font-headline font-bold text-primary mb-6 flex items-center gap-3"><BookOpen className="w-6 h-6 text-accent" /> About This Session</h3>
              <div className="text-muted-foreground text-lg whitespace-pre-wrap">{demoClass.description}</div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 pt-8">
            <Card className="p-10 border-none bg-primary text-white finance-3d-shadow rounded-[2.5rem] flex flex-col justify-center gap-8">
              <h3 className="text-3xl font-headline font-bold">Ready to start your journey?</h3>
              <div className="space-y-4">
                <Link href="/#courses" className="block">
                  <Button className="w-full h-16 rounded-2xl bg-accent text-primary font-bold text-xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                    <ThumbsUp className="w-6 h-6" /> I am Interested
                  </Button>
                </Link>
                <Link href="/#testimonials" className="block">
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-white/30 bg-white/10 text-white font-bold text-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                    <ThumbsDown className="w-6 h-6" /> Not Interested
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-10 border-none bg-white finance-3d-shadow rounded-[2.5rem] flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center"><MessageSquare className="w-10 h-10" /></div>
              <h4 className="font-headline font-bold text-primary text-2xl">Have Questions?</h4>
              <p className="text-muted-foreground">Connect with our learning consultants directly on WhatsApp for personal guidance.</p>
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-xl border-2 border-accent text-primary font-bold text-lg"
                onClick={() => window.open(branding?.whatsappUrl || '#', '_blank')}
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
