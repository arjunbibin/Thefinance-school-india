
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { doc, updateDoc, collection, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { LogOut, ShieldAlert, UserPlus, Users, Briefcase, Code, BarChart, Settings, Mail, MessageSquare, Image as ImageIcon, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  // Admin State
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [isAdminProcessing, setIsAdminProcessing] = useState(false);

  // Slideshow State
  const [newSlide, setNewSlide] = useState({ title: '', description: '', imageUrl: '', order: 0 });
  const [isSlideProcessing, setIsSlideProcessing] = useState(false);

  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const slidesQuery = useMemoFirebase(() => query(collection(db, 'slides'), orderBy('order', 'asc')), [db]);
  const { data: slides, isLoading: isSlidesLoading } = useCollection(slidesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (profile && profile.role === 'user') {
      auth.signOut();
      router.push('/login');
      toast({ variant: "destructive", title: "Unauthorized", description: "Your account has no management role." });
    }
  }, [user, isUserLoading, router, profile, auth, toast]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) return;

    setIsAdminProcessing(true);
    try {
      const targetRef = doc(db, 'userProfiles', targetUserId.trim());
      await updateDoc(targetRef, { role: selectedRole });
      toast({ title: "Staff Position Updated", description: "User permissions have been refreshed." });
      setTargetUserId('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setIsAdminProcessing(false);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.imageUrl) return;

    setIsSlideProcessing(true);
    try {
      await addDoc(collection(db, 'slides'), {
        ...newSlide,
        order: Number(newSlide.order) || (slides ? slides.length : 0)
      });
      toast({ title: "Slide Added", description: "The homepage slideshow has been updated." });
      setNewSlide({ title: '', description: '', imageUrl: '', order: slides ? slides.length + 1 : 0 });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Add Slide", description: error.message });
    } finally {
      setIsSlideProcessing(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'slides', id));
      toast({ title: "Slide Removed", description: "Slide deleted successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: error.message });
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = profile?.role || 'user';
  const isAdmin = role === 'admin';
  const staffName = profile?.firstName || user?.displayName?.split(' ')[0] || 'Administrator';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pb-24 px-6 max-w-6xl mx-auto w-full pt-16">
        <div className="mb-12 space-y-4 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">
                Welcome, <span className="text-accent">{staffName}</span>
              </h1>
              {isAdmin && <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />}
            </div>
            <p className="text-muted-foreground text-lg font-medium">
              Management Portal for <span className="font-bold text-primary">The Finance School India</span>.
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="h-12 px-6 rounded-xl border-2 text-destructive border-destructive/10 hover:bg-destructive hover:text-white transition-all font-bold">
            <LogOut className="w-5 h-5 mr-3" /> Secure Logout
          </Button>
        </div>

        <div className="grid gap-10">
          {/* Slideshow Manager (Admin Only) */}
          {isAdmin && (
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary text-white p-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Homepage Slideshow Manager</CardTitle>
                    <CardDescription className="text-white/70">Add or remove featured visual content from the main site.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleAddSlide} className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slideTitle">Slide Title</Label>
                      <Input id="slideTitle" placeholder="e.g. Finance for Life" value={newSlide.title} onChange={(e) => setNewSlide({...newSlide, title: e.target.value})} className="rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slideImage">Image URL</Label>
                      <Input id="slideImage" placeholder="https://..." value={newSlide.imageUrl} onChange={(e) => setNewSlide({...newSlide, imageUrl: e.target.value})} className="rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slideOrder">Display Order</Label>
                      <Input id="slideOrder" type="number" value={newSlide.order} onChange={(e) => setNewSlide({...newSlide, order: parseInt(e.target.value)})} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slideDesc">Description</Label>
                      <Textarea id="slideDesc" placeholder="Enter a brief summary..." value={newSlide.description} onChange={(e) => setNewSlide({...newSlide, description: e.target.value})} className="rounded-xl min-h-[120px]" />
                    </div>
                    <Button type="submit" disabled={isSlideProcessing} className="w-full h-14 bg-accent text-primary font-bold rounded-xl hover:scale-[1.02] transition-transform">
                      {isSlideProcessing ? 'Saving Slide...' : 'Add to Slideshow'}
                    </Button>
                  </div>
                </form>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slides?.map((slide) => (
                    <Card key={slide.id} className="group border-none bg-slate-50 finance-3d-shadow-inner rounded-2xl overflow-hidden relative">
                      <div className="aspect-video relative">
                        <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" />
                        <div className="absolute top-2 right-2">
                          <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteSlide(slide.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-primary truncate">{slide.title}</h4>
                          <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border">Pos: {slide.order}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{slide.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role Manager (Admin Only) */}
          {isAdmin && (
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-destructive text-white p-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Authorize Staff Position</CardTitle>
                    <CardDescription className="text-white/70">Promote a user by their UID to unlock department dashboards.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleUpdateRole} className="flex flex-col md:flex-row gap-6">
                  <div className="flex-grow space-y-2">
                    <Label htmlFor="targetUid">User UID</Label>
                    <Input id="targetUid" placeholder="e.g. gHZ9n7s2b9X8..." value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} className="rounded-xl h-12" required />
                  </div>
                  <div className="w-full md:w-64 space-y-2">
                    <Label htmlFor="role">Select Department</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Position" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Revoke (User)</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="content_head">Content Head</SelectItem>
                        <SelectItem value="student_specialist">Specialist</SelectItem>
                        <SelectItem value="accounts_head">Accounts Head</SelectItem>
                        <SelectItem value="general_manager">Manager</SelectItem>
                        <SelectItem value="tech_head">Tech Head</SelectItem>
                        <SelectItem value="operations_head">Operations</SelectItem>
                        <SelectItem value="strategy_manager">Strategy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={isAdminProcessing} className="h-12 md:h-20 px-10 bg-destructive text-white font-bold rounded-xl mt-auto">
                    {isAdminProcessing ? 'Applying...' : 'Authorize'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Department Stats Card */}
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard icon={Briefcase} title="Total Slides" value={slides?.length.toString() || '0'} color="bg-primary" />
            <StatCard icon={Users} title="Active Leads" value="45" color="bg-accent" />
            <StatCard icon={Mail} title="Messages" value="8" color="bg-indigo-400" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: { icon: any, title: string, value: string, color: string }) {
  return (
    <Card className="finance-3d-shadow border-none rounded-3xl p-6 bg-white overflow-hidden relative group hover:-translate-y-1 transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.05] rounded-bl-full`} />
      <div className="flex items-center gap-4">
        <div className={`p-3 ${color} text-white rounded-2xl`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-bold">{title}</p>
          <h4 className="text-2xl font-headline font-bold text-primary">{value}</h4>
        </div>
      </div>
    </Card>
  );
}
