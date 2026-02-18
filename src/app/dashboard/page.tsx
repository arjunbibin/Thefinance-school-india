
'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Trophy, 
  BookOpen, 
  Clock, 
  Activity, 
  Settings, 
  LogOut, 
  Shield, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Layout,
  MessageSquare,
  Globe,
  Save
} from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Dashboard() {
  const db = useFirestore();
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'avatar-user')?.imageUrl || '';
  
  // Firestore Branding Sync
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: brandingData } = useDoc(brandingRef);
  
  const [appName, setAppName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (brandingData) {
      setAppName(brandingData.appName || '');
      setTagline(brandingData.tagline || '');
      setLogoUrl(brandingData.logoUrl || '');
    }
  }, [brandingData]);

  const handleUpdateBranding = () => {
    setDocumentNonBlocking(brandingRef, {
      appName,
      tagline,
      logoUrl
    }, { merge: true });
  };

  return (
    <div className="min-h-screen bg-background selection:bg-accent selection:text-primary">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Workspace <span className="text-accent">Hub</span></h1>
            <p className="text-muted-foreground text-lg">Manage your wealth strategy and platform configuration.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-12 px-6 rounded-xl border-2 glass-morphism font-bold">
              <Activity className="w-5 h-5 mr-2" /> Global Market Stats
            </Button>
            <Button className="h-12 px-6 rounded-xl bg-primary text-white font-bold shadow-xl">
              <Zap className="w-5 h-5 mr-2 fill-accent" /> Premium Insights
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-96 space-y-8">
            <Card className="finance-3d-shadow border-none bg-white overflow-hidden rounded-[2rem]">
              <div className="h-32 bg-primary relative">
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                  <Avatar className="w-28 h-28 border-8 border-white finance-3d-shadow">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-slate-200 text-primary font-bold text-2xl">JD</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardHeader className="pt-16 text-center">
                <CardTitle className="text-3xl font-headline font-bold text-primary">John Doe</CardTitle>
                <Badge className="bg-accent text-primary font-bold px-3 py-1 mx-auto mt-2 w-fit">Level 24 Architect</Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 border-t border-slate-50">
                <Button variant="ghost" className="w-full h-12 justify-start gap-4 rounded-xl group font-bold">
                  <Layout className="w-5 h-5 text-primary" /> Portfolio Overview
                </Button>
                <Button variant="ghost" className="w-full h-12 justify-start gap-4 rounded-xl group font-bold">
                  <Settings className="w-5 h-5 text-primary" /> Account Settings
                </Button>
                <Button variant="ghost" className="w-full h-12 justify-start gap-4 rounded-xl text-destructive font-bold">
                  <LogOut className="w-5 h-5" /> Secure Exit
                </Button>
              </CardContent>
            </Card>

            {/* Branding Settings Card */}
            <Card className="finance-3d-shadow border-none bg-white p-8 rounded-[2rem]">
               <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-3 text-primary">
                 <Globe className="text-accent w-6 h-6" /> Branding Control
               </h3>
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="appName" className="text-sm font-bold text-slate-500">App Name</Label>
                   <Input 
                     id="appName" 
                     placeholder="The Finance School India" 
                     value={appName} 
                     onChange={(e) => setAppName(e.target.value)}
                     className="rounded-xl border-slate-100"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="tagline" className="text-sm font-bold text-slate-500">Tagline</Label>
                   <Input 
                     id="tagline" 
                     placeholder="Let's Deal with The Wealth" 
                     value={tagline} 
                     onChange={(e) => setTagline(e.target.value)}
                     className="rounded-xl border-slate-100"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="logoUrl" className="text-sm font-bold text-slate-500">Logo URL</Label>
                   <Input 
                     id="logoUrl" 
                     placeholder="https://..." 
                     value={logoUrl} 
                     onChange={(e) => setLogoUrl(e.target.value)}
                     className="rounded-xl border-slate-100"
                   />
                 </div>
                 <Button 
                   onClick={handleUpdateBranding}
                   className="w-full mt-4 bg-primary text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2"
                 >
                   <Save className="w-4 h-4" /> Sync to Firestore
                 </Button>
                 <p className="text-[10px] text-muted-foreground italic text-center mt-2">
                   Changes will reflect across the site in real-time.
                 </p>
               </div>
            </Card>
          </aside>

          <div className="flex-1 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
               <Card className="bg-white finance-3d-shadow border-none p-6 rounded-[2rem]">
                 <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4">
                    <BookOpen className="text-primary w-6 h-6" />
                 </div>
                 <div className="text-4xl font-headline font-bold text-primary">14</div>
                 <p className="text-sm font-bold text-muted-foreground mt-1">Mastered Courses</p>
               </Card>
               
               <Card className="bg-white finance-3d-shadow border-none p-6 rounded-[2rem]">
                 <div className="p-3 bg-accent/10 rounded-2xl w-fit mb-4">
                    <Clock className="text-primary w-6 h-6" />
                 </div>
                 <div className="text-4xl font-headline font-bold text-primary">128h</div>
                 <p className="text-sm font-bold text-muted-foreground mt-1">Simulated Time</p>
               </Card>

               <Card className="bg-white finance-3d-shadow border-none p-6 rounded-[2rem]">
                 <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4">
                    <Activity className="text-primary w-6 h-6" />
                 </div>
                 <div className="text-4xl font-headline font-bold text-primary">18 Days</div>
                 <p className="text-sm font-bold text-muted-foreground mt-1">Engagement Streak</p>
               </Card>
            </div>

            <Card className="bg-white finance-3d-shadow border-none rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">Active Learning Paths</CardTitle>
                  <CardDescription>3 courses currently in progress</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="flex flex-col sm:flex-row items-center gap-8 group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 finance-3d-shadow-inner flex items-center justify-center">
                    <Zap className="w-10 h-10 text-accent fill-accent" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-headline font-bold text-primary">Advanced Crypto Architecture</h4>
                      <span className="text-lg font-bold text-accent">68%</span>
                    </div>
                    <Progress value={68} className="h-4 bg-slate-100 rounded-full" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 finance-3d-shadow-inner flex items-center justify-center">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-headline font-bold text-primary">Portfolio Defensive Strategies</h4>
                      <span className="text-lg font-bold text-accent">12%</span>
                    </div>
                    <Progress value={12} className="h-4 bg-slate-100 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
