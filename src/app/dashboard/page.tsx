import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  MessageSquare
} from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

export default function Dashboard() {
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'avatar-user')?.imageUrl || '';

  return (
    <div className="min-h-screen bg-background selection:bg-accent selection:text-primary">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Workspace <span className="text-accent">Hub</span></h1>
            <p className="text-muted-foreground text-lg">Welcome back, John. Your wealth strategy is performing 12% above benchmark.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-12 px-6 rounded-xl border-2 glass-morphism font-bold hover:scale-105 transition-all">
              <Activity className="w-5 h-5 mr-2" /> Global Market Stats
            </Button>
            <Button className="h-12 px-6 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-all shadow-xl">
              <Zap className="w-5 h-5 mr-2 fill-accent" /> Premium Insights
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar / Profile Card */}
          <aside className="w-full lg:w-96 space-y-8 animate-in slide-in-from-left-10 duration-1000">
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
                <div className="flex flex-col items-center gap-1">
                  <p className="text-base text-muted-foreground italic font-medium">Wealth Architect Pro</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Badge className="bg-accent text-primary font-bold px-3 py-1">Level 24</Badge>
                    <Badge variant="outline" className="border-primary/20 font-bold px-3 py-1">OG Status</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 border-t border-slate-50">
                <Button variant="ghost" className="w-full h-12 justify-start gap-4 rounded-xl hover:bg-slate-50 group">
                  <Layout className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" /> 
                  <span className="font-bold">Portfolio Overview</span>
                  <ChevronRight className="ml-auto w-4 h-4 text-slate-300" />
                </Button>
                <Button variant="ghost" className="w-full h-12 justify-start gap-4 rounded-xl hover:bg-slate-50 group">
                  <Settings className="w-5 h-5 text-primary group-hover:rotate-45 transition-transform" /> 
                  <span className="font-bold">Account Settings</span>
                  <ChevronRight className="ml-auto w-4 h-4 text-slate-300" />
                </Button>
                <Button variant="ghost" className="w-full h-12 justify-start gap-4 rounded-xl hover:bg-destructive/5 text-destructive group">
                  <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
                  <span className="font-bold">Secure Exit</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="finance-3d-shadow border-none bg-white p-8 rounded-[2rem]">
               <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-3">
                 <Trophy className="text-accent w-6 h-6 fill-accent" /> Recent Achievements
               </h3>
               <div className="grid grid-cols-4 gap-4">
                 {[1,2,3,4,5,6,7,8].map(i => (
                   <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${i <= 5 ? 'bg-primary/10 text-primary shadow-sm' : 'bg-slate-50 text-slate-300 shadow-inner'}`}>
                     {i === 1 ? <Shield className="w-5 h-5" /> : 
                      i === 2 ? <Zap className="w-5 h-5" /> : 
                      i === 3 ? <TrendingUp className="w-5 h-5" /> : 
                      <Activity className="w-5 h-5" />}
                   </div>
                 ))}
               </div>
               <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                 <div className="text-sm font-bold text-primary">Hall of Fame</div>
                 <Badge variant="secondary" className="bg-white">Rank #412</Badge>
               </div>
            </Card>
          </aside>

          {/* Main Dashboard Content */}
          <div className="flex-1 space-y-10 animate-in slide-in-from-right-10 duration-1000">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
               <Card className="bg-white finance-3d-shadow border-none p-6 rounded-[2rem] hover:-translate-y-1 transition-transform">
                 <CardContent className="p-0">
                   <div className="flex items-center justify-between mb-4">
                     <div className="p-3 bg-primary/10 rounded-2xl">
                        <BookOpen className="text-primary w-6 h-6" />
                     </div>
                     <Badge className="bg-slate-50 text-primary border-none font-bold">+2 This week</Badge>
                   </div>
                   <div className="text-4xl font-headline font-bold text-primary">14</div>
                   <p className="text-sm font-bold text-muted-foreground mt-1">Mastered Courses</p>
                 </CardContent>
               </Card>
               
               <Card className="bg-white finance-3d-shadow border-none p-6 rounded-[2rem] hover:-translate-y-1 transition-transform">
                 <CardContent className="p-0">
                   <div className="flex items-center justify-between mb-4">
                     <div className="p-3 bg-accent/10 rounded-2xl">
                        <Clock className="text-primary w-6 h-6" />
                     </div>
                     <Badge className="bg-slate-50 text-primary border-none font-bold">Top 5%</Badge>
                   </div>
                   <div className="text-4xl font-headline font-bold text-primary">128h</div>
                   <p className="text-sm font-bold text-muted-foreground mt-1">Simulated Time</p>
                 </CardContent>
               </Card>

               <Card className="bg-white finance-3d-shadow border-none p-6 rounded-[2rem] hover:-translate-y-1 transition-transform">
                 <CardContent className="p-0">
                   <div className="flex items-center justify-between mb-4">
                     <div className="p-3 bg-primary/10 rounded-2xl">
                        <Activity className="text-primary w-6 h-6" />
                     </div>
                     <Badge className="bg-accent text-primary border-none font-bold">FIRE STREAK</Badge>
                   </div>
                   <div className="text-4xl font-headline font-bold text-primary">18 Days</div>
                   <p className="text-sm font-bold text-muted-foreground mt-1">Current Engagement</p>
                 </CardContent>
               </Card>
            </div>

            <Card className="bg-white finance-3d-shadow border-none rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">Active Learning Paths</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">3 courses currently in progress</p>
                </div>
                <Button variant="ghost" className="text-primary font-bold">View Catalog</Button>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="flex flex-col sm:flex-row items-center gap-8 group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 finance-3d-shadow-inner flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                    <Zap className="w-10 h-10 text-accent fill-accent group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-headline font-bold text-primary">Advanced Crypto Architecture</h4>
                      <span className="text-lg font-bold text-accent">68%</span>
                    </div>
                    <Progress value={68} className="h-4 bg-slate-100 rounded-full" />
                    <div className="flex items-center justify-between mt-4">
                       <p className="text-sm text-muted-foreground font-medium">Last active: 2 hours ago • Lesson 14: AMM Algorithms</p>
                       <Button className="bg-primary hover:bg-primary/95 text-white h-10 px-8 rounded-xl font-bold">Continue Path</Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 finance-3d-shadow-inner flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                    <Shield className="w-10 h-10 text-primary group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-headline font-bold text-primary">Portfolio Defensive Strategies</h4>
                      <span className="text-lg font-bold text-accent">12%</span>
                    </div>
                    <Progress value={12} className="h-4 bg-slate-100 rounded-full" />
                    <div className="flex items-center justify-between mt-4">
                       <p className="text-sm text-muted-foreground font-medium">Last active: Yesterday • Lesson 2: Tail Risk Hedging</p>
                       <Button className="bg-primary hover:bg-primary/95 text-white h-10 px-8 rounded-xl font-bold">Resume</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="bg-white finance-3d-shadow border-none p-8 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-headline font-bold">AI Wealth Mentor</h3>
                    <Badge className="bg-primary text-white">Online</Badge>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 mb-6 finance-3d-shadow-inner italic text-muted-foreground">
                    "Based on your recent progress in DeFi, I recommend looking at the Liquidity Management module to optimize your simulated APY."
                  </div>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2">
                    <MessageSquare className="w-5 h-5 mr-2" /> Start Consultation
                  </Button>
               </Card>

               <Card className="bg-primary text-white p-8 rounded-[2rem] finance-3d-shadow flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-headline font-bold">Upgrade to Premium</h3>
                    <p className="text-primary-foreground/70">Unlock professional trading simulations and institutional-grade data terminals.</p>
                  </div>
                  <Button className="mt-8 bg-accent text-primary h-14 rounded-xl font-bold text-lg hover:scale-105 transition-all">
                    Upgrade Now
                  </Button>
               </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
