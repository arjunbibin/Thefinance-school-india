
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { LogOut, ShieldAlert, UserPlus, Users, Briefcase, Trash2, Upload, Eye, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Admin State
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [isAdminProcessing, setIsAdminProcessing] = useState(false);

  // Slideshow State
  const [newSlide, setNewSlide] = useState({ title: '', description: '', imageUrl: '', order: 0 });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for prototype simplicity
        toast({ variant: "destructive", title: "File too large", description: "Please upload an image under 1MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setNewSlide(prev => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.imageUrl) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide a title and select an image." });
      return;
    }

    setIsSlideProcessing(true);
    try {
      await addDoc(collection(db, 'slides'), {
        title: newSlide.title,
        description: newSlide.description,
        imageUrl: newSlide.imageUrl,
        order: Number(newSlide.order) || (slides ? slides.length : 0),
        imageHint: "school highlights"
      });
      toast({ title: "Slide Added", description: "The homepage slideshow has been updated." });
      setNewSlide({ title: '', description: '', imageUrl: '', order: slides ? slides.length + 1 : 0 });
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
                Staff <span className="text-accent">Portal</span>
              </h1>
              {isAdmin && <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />}
            </div>
            <p className="text-muted-foreground text-lg font-medium">
              Managing <span className="font-bold text-primary">{staffName}</span>'s Department.
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
                    <CardTitle className="text-2xl font-headline font-bold">Live Slideshow Manager</CardTitle>
                    <CardDescription className="text-white/70">Upload images directly and preview them in the school's layout.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="grid lg:grid-cols-5 gap-10">
                  <form onSubmit={handleAddSlide} className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="slideTitle">Display Title</Label>
                        <Input id="slideTitle" placeholder="e.g. Finance Workshop 2024" value={newSlide.title} onChange={(e) => setNewSlide({...newSlide, title: e.target.value})} className="rounded-xl h-12" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slideImage">Select Image from Device</Label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all group"
                        >
                          <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <span className="text-sm font-bold text-slate-500">Click to Browse</span>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slideOrder">Display Sequence (0 is first)</Label>
                        <Input id="slideOrder" type="number" value={newSlide.order} onChange={(e) => setNewSlide({...newSlide, order: parseInt(e.target.value)})} className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slideDesc">Brief Caption</Label>
                        <Textarea id="slideDesc" placeholder="Describe the scene..." value={newSlide.description} onChange={(e) => setNewSlide({...newSlide, description: e.target.value})} className="rounded-xl min-h-[100px]" />
                      </div>
                    </div>
                    <Button type="submit" disabled={isSlideProcessing || !newSlide.imageUrl} className="w-full h-14 bg-accent text-primary font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
                      {isSlideProcessing ? 'Uploading to School Server...' : 'Publish to Homepage'}
                    </Button>
                  </form>

                  <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold text-primary uppercase tracking-widest">Real-time Preview</span>
                    </div>
                    <Card className="border-none bg-slate-50 finance-3d-shadow-inner rounded-[2rem] overflow-hidden">
                      <div className="relative aspect-video md:aspect-[21/9] bg-slate-200 flex items-center justify-center">
                        {previewImage ? (
                          <Image src={previewImage} alt="Preview" fill className="object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <ImageIcon className="w-12 h-12 opacity-20" />
                            <span className="text-xs font-bold">NO IMAGE SELECTED</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                          <h3 className="text-lg md:text-3xl font-headline font-bold text-white mb-1">{newSlide.title || 'Slide Title Here'}</h3>
                          <p className="text-white/80 text-[10px] md:text-sm max-w-md line-clamp-2">{newSlide.description || 'Slide description will appear here...'}</p>
                        </div>
                      </div>
                    </Card>
                    <p className="text-[10px] text-muted-foreground italic text-center">
                      * Preview displays the exact aspect ratio used on the main site.
                    </p>
                  </div>
                </div>

                <div className="mt-16 pt-10 border-t border-slate-100">
                   <h3 className="text-xl font-headline font-bold text-primary mb-8 flex items-center gap-3">
                     <Users className="w-6 h-6" /> Currently Live Slides
                   </h3>
                   <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {slides?.map((slide) => (
                      <Card key={slide.id} className="group border-none bg-white finance-3d-shadow rounded-2xl overflow-hidden relative">
                        <div className="aspect-video relative">
                          <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" />
                          <div className="absolute top-2 right-2">
                            <Button size="icon" variant="destructive" className="h-10 w-10 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" onClick={() => handleDeleteSlide(slide.id)}>
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-primary truncate text-lg">{slide.title}</h4>
                            <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">Order: {slide.order}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{slide.description}</p>
                        </div>
                      </Card>
                    ))}
                    {(!slides || slides.length === 0) && (
                      <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">No custom slides uploaded. Showing defaults on homepage.</p>
                      </div>
                    )}
                  </div>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
