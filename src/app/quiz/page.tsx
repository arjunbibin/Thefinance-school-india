
'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function QuizPortalPage() {
  const db = useFirestore();
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding, isLoading } = useDoc(brandingRef);

  const quizUrl = branding?.quizUrl || 'https://studio--studio-1485746804-cf171.us-central1.hosted.app/';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        {/* Header Section */}
        <div className="w-full bg-white/40 backdrop-blur-md border-b border-white/20 py-8 px-6 text-center">
          <div className="max-w-7xl mx-auto">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Interactive Learning</Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Attend Your <span className="text-accent">Quiz</span></h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">Test your financial wisdom directly in our integrated assessment portal.</p>
          </div>
        </div>

        {/* Quiz Iframe Section */}
        <div className="flex-grow relative bg-slate-100/50 min-h-[70vh]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-bold text-primary italic">Initializing Quiz Portal...</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="flex-grow">
                 <iframe 
                  src={quizUrl}
                  className="w-full h-full border-none min-h-[700px] md:min-h-[85vh]"
                  title="Finance School Quiz"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
