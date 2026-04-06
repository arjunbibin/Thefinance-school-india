
'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldAlert, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Security: Only allow framing of trusted domains to prevent Iframe Injection attacks
const TRUSTED_DOMAINS = [
  'thefinschool.nurturecrm.in',
  'financeschool.in',
  'nurturecrm.in'
];

function RegisterContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  if (!url) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-12 md:p-24 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-bold text-primary">No Access Link Found</h2>
          <p className="text-muted-foreground italic text-lg max-w-md">Please select a course from the homepage to proceed with registration.</p>
        </div>
        <Link href="/#courses">
          <Button className="rounded-xl h-12 bg-primary px-8 font-bold">Browse Courses</Button>
        </Link>
      </div>
    );
  }

  // Domain Validation Logic
  let isTrusted = false;
  try {
    const parsedUrl = new URL(url);
    isTrusted = TRUSTED_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain));
  } catch (e) {
    isTrusted = false;
  }

  if (!isTrusted) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-12 md:p-24 text-center space-y-6 bg-destructive/5">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto finance-3d-shadow">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-bold text-destructive">Untrusted Source Detected</h2>
          <p className="text-muted-foreground text-lg max-w-md">For your security, we only allow official enrollment portals to be displayed here. If you believe this is an error, please contact support.</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="rounded-xl h-12 border-primary text-primary font-bold">Back to Safety</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow relative bg-slate-100/50 min-h-[70vh]">
      <div className="w-full h-full flex flex-col">
        <div className="bg-primary/5 border-b px-6 py-2 flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-primary/40" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Secure Encrypted Session</span>
        </div>
        <div className="flex-grow">
          <iframe 
            src={url}
            className="w-full h-full border-none min-h-[700px] md:min-h-[85vh]"
            title="Official Enrollment Portal"
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
