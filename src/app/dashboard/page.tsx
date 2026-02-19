
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
  Activity, 
  Settings, 
  LogOut, 
  Shield, 
  Zap, 
  Layout,
  Globe,
  Briefcase,
  Users,
  Code,
  PieChart,
  HardHat,
  Target
} from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'avatar-user')?.imageUrl || '';

  // Role-based User Profile
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

  const role = profile?.role || 'user';

  const roleConfigs: Record<string, { title: string, icon: any, color: string, stats: any[] }> = {
    admin: {
      title: "Primary Admin",
      icon: Shield,
      color: "bg-destructive",
      stats: [{ label: "Total Users", val: "1,284", icon: Users }, { label: "System Load", val: "12%", icon: Activity }]
    },
    tech_head: {
      title: "Tech Head",
      icon: Code,
      color: "bg-primary",
      stats: [{ label: "Uptime", val: "99.9%", icon: Zap }, { label: "Nodes", val: "24", icon: Globe }]
    },
    content_head: {
      title: "Content Head",
      icon: BookOpen,
      color: "bg-accent",
      stats: [{ label: "Courses", val: "14", icon: Trophy }, { label: "Lessons", val: "142", icon: Clock }]
    },
    accounts_head: {
      title: "Accounts Head",
      icon: PieChart,
      color: "bg-green-500",
      stats: [{ label: "Revenue", val: "$42k", icon: Briefcase }, { label: "Growth", val: "+14%", icon: Activity }]
    },
    manager: {
      title: "General Manager",
      icon: Layout,
      color: "bg-indigo-500",
      stats: [{ label: "Efficiency", val: "94%", icon: Target }, { label: "Team", val: "12", icon: Users }]
    },
    user: {
      title: "Student",
      icon: Trophy,
      color: "bg-slate-500",
      stats: [{ label: "XP", val: "450", icon: Trophy }, { label: "Courses", val: "2", icon: BookOpen }]
    }
  };

  const config = roleConfigs[role] || roleConfigs.user;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
              Welcome, <span className="text-accent">{profile?.firstName || user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-muted-foreground text-lg italic capitalize">{config.title} Terminal Access</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="h-12 px-6 rounded-xl border-2 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all font-bold">
            <LogOut className="w-5 h-5 mr-2" /> Secure Exit
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-80 space-y-8">
            <Card className="finance-3d-shadow border-none bg-white overflow-hidden rounded-[2rem]">
              <div className={`h-24 ${config.color} relative`}>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <Avatar className="w-24 h-24 border-8 border-white finance-3d-shadow">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-slate-200 text-primary font-bold">U</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardHeader className="pt-14 text-center">
                <CardTitle className="text-2xl font-headline font-bold text-primary">{profile?.firstName || 'Staff'}</CardTitle>
                <Badge className={`${config.color} text-white font-bold px-3 py-1 mx-auto mt-2 w-fit border-none`}>
                  <config.icon className="w-3 h-3 mr-1 inline" /> {config.title}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 border-t border-slate-50">
                <Button variant="ghost" className="w-full h-12 justify-start gap-4 rounded-xl group font-bold">
                  <Layout className="w-5 h-5 text-primary" /> Overview
                </Button>
                <Button variant="ghost" className="w-full h-12 justify-start gap-4 rounded-xl group font-bold">
                  <Settings className="w-5 h-5 text-primary" /> Preferences
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              {config.stats.map((stat, i) => (
                <Card key={i} className="p-4 border-none finance-3d-shadow bg-white rounded-2xl text-center">
                  <div className="bg-slate-50 p-2 rounded-lg w-fit mx-auto mb-2"><stat.icon className="w-4 h-4 text-primary" /></div>
                  <div className="text-xl font-bold text-primary">{stat.val}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</div>
                </Card>
              ))}
            </div>
          </aside>

          <div className="flex-1 space-y-10">
            <Card className="bg-white finance-3d-shadow border-none rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">Department Terminal</CardTitle>
                  <CardDescription>Actions and resources for {config.title}s</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {role === 'admin' ? (
                    <>
                      <Card className="p-6 border-2 border-dashed border-slate-100 hover:border-primary/20 hover:bg-slate-50/50 transition-all cursor-pointer rounded-2xl flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-xl text-primary"><Users className="w-6 h-6" /></div>
                        <div><h4 className="font-bold">Staff Directory</h4><p className="text-xs text-muted-foreground">Manage roles & access</p></div>
                      </Card>
                      <Card className="p-6 border-2 border-dashed border-slate-100 hover:border-primary/20 hover:bg-slate-50/50 transition-all cursor-pointer rounded-2xl flex items-center gap-4">
                        <div className="p-4 bg-accent/10 rounded-xl text-primary"><Shield className="w-6 h-6" /></div>
                        <div><h4 className="font-bold">Security Logs</h4><p className="text-xs text-muted-foreground">Audit system activity</p></div>
                      </Card>
                    </>
                  ) : (
                    <div className="col-span-2 text-center py-12 space-y-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-slate-100">
                        <HardHat className="w-10 h-10 text-slate-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-400">Section Under Development</h3>
                        <p className="text-sm text-slate-400">Your role-specific tools are being synchronized.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white finance-3d-shadow border-none rounded-[2rem] p-8">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 rounded-3xl bg-slate-50 finance-3d-shadow-inner flex items-center justify-center">
                  <Zap className="w-10 h-10 text-accent fill-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-headline font-bold text-primary">Core Node Status</h4>
                    <span className="text-lg font-bold text-accent">95%</span>
                  </div>
                  <Progress value={95} className="h-4 bg-slate-100" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
