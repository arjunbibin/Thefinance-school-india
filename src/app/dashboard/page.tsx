
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Trophy, 
  BookOpen, 
  Clock, 
  Zap, 
  LogOut, 
  Star,
  PlayCircle,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'avatar-user')?.imageUrl || '';

  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Zap className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const studentName = profile?.firstName || user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">
              Hello, <span className="text-accent underline decoration-accent/30 underline-offset-8">{studentName}</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium">Ready to take charge of your wealth today?</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="h-14 px-8 rounded-2xl border-2 text-destructive border-destructive/10 hover:bg-destructive hover:text-white transition-all font-bold shadow-sm">
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Sidebar Stats */}
          <aside className="lg:col-span-4 space-y-8">
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <div className="h-32 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <Avatar className="w-32 h-32 border-8 border-white finance-3d-shadow">
                    <AvatarImage src={user?.photoURL || avatarUrl} />
                    <AvatarFallback className="bg-slate-100 text-primary font-bold text-2xl">
                      {studentName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardHeader className="pt-20 text-center">
                <CardTitle className="text-3xl font-headline font-bold text-primary">{studentName}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge className="bg-accent text-primary font-bold px-4 py-1.5 border-none rounded-full shadow-sm">
                    <Star className="w-4 h-4 mr-1.5 fill-primary" /> Level 4 Student
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 finance-3d-shadow-inner text-center">
                    <div className="text-2xl font-bold text-primary">1,240</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total XP</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 finance-3d-shadow-inner text-center">
                    <div className="text-2xl font-bold text-accent">12</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Badges</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-xl font-headline font-bold flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-accent" /> Learning Goal
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>Finance for Life</span>
                  <span className="text-primary">65%</span>
                </div>
                <Progress value={65} className="h-3 bg-slate-100" />
              </div>
              <p className="text-sm text-muted-foreground italic">"Wealth is the ability to fully experience life."</p>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            <Card className="bg-white finance-3d-shadow border-none rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-10 border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-headline font-bold">Current Courses</CardTitle>
                  <Button variant="ghost" className="text-accent font-bold">View All <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="group flex flex-col md:flex-row items-center gap-8 p-6 rounded-3xl bg-slate-50/50 hover:bg-white hover:finance-3d-shadow transition-all duration-300 cursor-pointer">
                  <div className="w-full md:w-40 h-28 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <Badge variant="outline" className="border-primary/20 text-primary">Module 4</Badge>
                    <h4 className="text-xl font-bold group-hover:text-primary transition-colors">The Magic of Compounding</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 45 mins</span>
                      <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> 200 XP</span>
                    </div>
                  </div>
                  <Button size="icon" className="h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:scale-110 transition-transform">
                    <PlayCircle className="w-7 h-7" />
                  </Button>
                </div>

                <div className="group flex flex-col md:flex-row items-center gap-8 p-6 rounded-3xl bg-slate-50/50 hover:bg-white hover:finance-3d-shadow transition-all duration-300 cursor-pointer">
                  <div className="w-full md:w-40 h-28 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Award className="w-10 h-10 text-accent" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <Badge variant="outline" className="border-accent/20 text-accent">Module 5</Badge>
                    <h4 className="text-xl font-bold group-hover:text-primary transition-colors">Smart Spending & Budgeting</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 30 mins</span>
                      <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> 150 XP</span>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-2 text-slate-300 border-slate-200 cursor-not-allowed">
                    <Clock className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-none bg-primary text-white rounded-[2.5rem] finance-3d-shadow relative overflow-hidden group cursor-pointer">
                <div className="relative z-10 space-y-4">
                  <Trophy className="w-10 h-10 text-accent fill-accent" />
                  <h4 className="text-2xl font-headline font-bold">Community Leaderboard</h4>
                  <p className="text-white/70 text-sm">See how you rank against other young entrepreneurs in India.</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              </Card>

              <Card className="p-8 border-none bg-white finance-3d-shadow rounded-[2.5rem] relative overflow-hidden group cursor-pointer border-2 border-dashed border-slate-100 hover:border-accent transition-colors">
                <div className="relative z-10 space-y-4">
                  <Star className="w-10 h-10 text-accent" />
                  <h4 className="text-2xl font-headline font-bold text-primary">Unlock Premium</h4>
                  <p className="text-muted-foreground text-sm">Access 'Little CEO' and join exclusive mentorship calls.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
