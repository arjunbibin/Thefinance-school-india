'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

function RegisterContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  if (!url) {
    return (
      <div className="flex-grow flex items-center justify-center p-24">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground italic text-lg">No registration link was provided.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow relative bg-slate-100/50 min-h-[70vh]">
      <div className="w-full h-full flex flex-col">
        <div className="flex-grow">
          <iframe 
            src={url}
            className="w-full h-full border-none min-h-[700px] md:min-h-[85vh]"
            title="Enrollment Portal"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default function RegisterPortalPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        {/* Header Section */}
        <div className="w-full bg-white/40 backdrop-blur-md border-b border-white/20 py-8 px-6 text-center">
          <div className="max-w-7xl mx-auto">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Official Enrollment</Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Complete Your <span className="text-accent">Registration</span></h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">Please fill out the form below to secure your position in our program.</p>
          </div>
        </div>

        {/* Portal Section */}
        <Suspense fallback={
          <div className="flex-grow flex flex-col items-center justify-center gap-4 py-24">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-bold text-primary italic">Loading secure portal...</p>
          </div>
        }>
          <RegisterContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
