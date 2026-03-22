'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useCollection, 
  useMemoFirebase, 
  useAuth, 
  useStorage, 
  setDocumentNonBlocking,
  addDocumentNonBlocking
} from '@/firebase';
import { doc, collection, query, orderBy, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  LogOut, 
  ShieldAlert, 
  Trash2, 
  Upload, 
  Settings,
  GraduationCap,
  Trophy,
  MessageSquare,
  Presentation,
  Play,
  Activity,
  Smartphone,
  Users,
  ImageIcon,
  Plus,
  Pencil,
  Quote,
  Star,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const { toast } = useToast();
  
  // Auth & Profile
  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);
  
  const isAuthorized = !!(user && profile && (profile.role === 'admin' || profile.role === 'staff' || profile.role === 'ceo'));

  useEffect(() => {
    if (isUserLoading || isProfileLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (profile && !isAuthorized) {
      router.push('/');
      toast({ 
        variant: "destructive", 
        title: "Unauthorized", 
        description: "Access restricted. Role: " + (profile?.role || 'none') 
      });
    }
  }, [user, isUserLoading, router, profile, isProfileLoading, isAuthorized, toast]);

  // Data Subscriptions
  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  const demoClassRef = useMemoFirebase(() => doc(db, 'system_settings', 'demo_class'), [db]);
  const { data: demoClass } = useDoc(demoClassRef);

  const coursesQuery = useMemoFirebase(() => query(collection(db, 'courses'), orderBy('order', 'asc')), [db]);
  const { data: courses } = useCollection(coursesQuery);

  const teamQuery = useMemoFirebase(() => query(collection(db, 'team'), orderBy('createdAt', 'desc')), [db]);
  const { data: team } = useCollection(teamQuery);

  const slidesQuery = useMemoFirebase(() => query(collection(db, 'slides'), orderBy('order', 'asc')), [db]);
  const { data: slides } = useCollection(slidesQuery);

  const galleryQuery = useMemoFirebase(() => query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), [db]);
  const { data: gallery } = useCollection(galleryQuery);

  const reviewsQuery = useMemoFirebase(() => query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), [db]);
  const { data: reviews } = useCollection(reviewsQuery);

  // General States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [brandingForm, setBrandingForm] = useState({ 
    appName: '', logoUrl: '', tagline: '', whatsappUrl: '', facebookUrl: '', instagramUrl: '', youtubeUrl: '', emailAddress: '', quizUrl: '',
    statsStudents: '', statsWorkshops: '', statsTestimonials: '', showNo1Badge: false, showAppDownload: false, playStoreUrl: '', appStoreUrl: ''
  });

  const [demoClassForm, setDemoClassForm] = useState({ title: '', description: '', videoUrl: '', isActive: false, isYoutube: true });

  const [newCourse, setNewCourse] = useState({ title: '', subtitle: '', description: '', category: 'Foundational', lessons: '', rating: '5.0', buyLink: '', order: 0, imageUrl: '' });
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', bio: '', leadershipType: 'team', imageUrl: '' });
  const [newSlide, setNewSlide] = useState({ title: '', description: '', order: 0, imageUrl: '' });
  const [newGalleryItem, setNewGalleryItem] = useState({ description: '', imageUrl: '' });

  useEffect(() => { 
    if (branding) setBrandingForm({ 
      appName: branding.appName || '', logoUrl: branding.logoUrl || '', tagline: branding.tagline || '', whatsappUrl: branding.whatsappUrl || '', 
      facebookUrl: branding.facebookUrl || '', instagramUrl: branding.instagramUrl || '', youtubeUrl: branding.youtubeUrl || '', 
      emailAddress: branding.emailAddress || '', quizUrl: branding.quizUrl || '', statsStudents: branding.statsStudents || '', 
      statsWorkshops: branding.statsWorkshops || '', statsTestimonials: branding.statsTestimonials || '', 
      showNo1Badge: branding.showNo1Badge || false, showAppDownload: branding.showAppDownload || false, 
      playStoreUrl: branding.playStoreUrl || '', appStoreUrl: branding.appStoreUrl || ''
    }); 
  }, [branding]);

  useEffect(() => {
    if (demoClass) setDemoClassForm({
      title: demoClass.title || '', description: demoClass.description || '', videoUrl: demoClass.videoUrl || '', 
      isActive: demoClass.isActive || false, isYoutube: !demoClass.videoUrl || !demoClass.videoUrl.includes('firebasestorage')
    });
  }, [demoClass]);

  const handleLogout = async () => {
    localStorage.removeItem('activeSessionId');
    await auth.signOut();
    router.push('/');
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100), (err) => reject(err), 
        () => getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject));
    });
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandingRef) {
      setDocumentNonBlocking(brandingRef, brandingForm, { merge: true });
      toast({ title: "Branding Updated" });
    }
  };

  const handleSaveDemoClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demoClassRef) {
      setDocumentNonBlocking(demoClassRef, { ...demoClassForm, id: 'demo_class', lastUpdated: new Date().toISOString() }, { merge: true });
      toast({ title: "Demo Class Updated" });
    }
  };

  const handleDeleteItem = async (col: string, id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, col, id));
        toast({ title: "Item Deleted" });
      } catch (e) {
        toast({ variant: "destructive", title: "Delete Failed" });
      }
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDocumentNonBlocking(collection(db, 'courses'), { ...newCourse, createdAt: serverTimestamp() });
      setNewCourse({ title: '', subtitle: '', description: '', category: 'Foundational', lessons: '', rating: '5.0', buyLink: '', order: 0, imageUrl: '' });
      toast({ title: "Course Added" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDocumentNonBlocking(collection(db, 'team'), { ...newTeamMember, createdAt: serverTimestamp() });
      setNewTeamMember({ name: '', role: '', bio: '', leadershipType: 'team', imageUrl: '' });
      toast({ title: "Team Member Added" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDocumentNonBlocking(collection(db, 'slides'), { ...newSlide, createdAt: serverTimestamp() });
      setNewSlide({ title: '', description: '', order: 0, imageUrl: '' });
      toast({ title: "Slide Added" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDocumentNonBlocking(collection(db, 'gallery'), { ...newGalleryItem, createdAt: serverTimestamp() });
      setNewGalleryItem({ description: '', imageUrl: '' });
      toast({ title: "Memory Added" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || isProfileLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || !isAuthorized) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pb-24 px-6 max-w-7xl mx-auto w-full pt-16">
        <div className="mb-12 flex items-center justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Staff <span className="text-accent">Portal</span></h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 font-medium"><ShieldAlert className="w-4 h-4 text-accent" /> Authorized: {profile?.firstName} ({profile?.role})</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-destructive/20 text-destructive font-bold h-12 rounded-xl bg-white finance-3d-shadow hover:bg-destructive hover:text-white transition-all"><LogOut className="w-4 h-4 mr-2" /> End Session</Button>
        </div>

        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-slate-100 p-2 rounded-[2rem] mb-10 overflow-x-auto shadow-inner sticky top-24 z-30">
            <TabsTrigger value="branding" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-2"><Settings className="w-4 h-4" /> Branding</TabsTrigger>
            <TabsTrigger value="demo-class" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-2"><Presentation className="w-4 h-4" /> Demo Class</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Courses</TabsTrigger>
            <TabsTrigger value="team" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-2"><Users className="w-4 h-4" /> Team</TabsTrigger>
            <TabsTrigger value="memories" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Campus Content</TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-10"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Settings className="w-6 h-6" /> Configuration & Social Links</CardTitle></CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSaveBranding} className="max-w-4xl grid md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-6">
                    <h3 className="font-headline font-bold text-xl text-primary border-b pb-2">Identity</h3>
                    <div className="space-y-2"><Label>Institutional Name</Label><Input value={brandingForm.appName} onChange={e => setBrandingForm({...brandingForm, appName: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label>Brand Tagline</Label><Input value={brandingForm.tagline} onChange={e => setBrandingForm({...brandingForm, tagline: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label>Logo URL</Label><Input value={brandingForm.logoUrl} onChange={e => setBrandingForm({...brandingForm, logoUrl: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label>Integrated Quiz URL</Label><Input value={brandingForm.quizUrl} onChange={e => setBrandingForm({...brandingForm, quizUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://..." /></div>
                    
                    <h3 className="font-headline font-bold text-xl text-primary border-b pb-2 pt-4">Impact & Metrics</h3>
                    <div className="p-6 rounded-3xl bg-slate-50 border space-y-4 finance-3d-shadow-inner">
                      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border mb-2">
                        <Label className="flex items-center gap-2 font-bold text-primary"><Trophy className="w-4 h-4 text-yellow-500" /> Show No.1 Badge</Label>
                        <Switch checked={brandingForm.showNo1Badge} onCheckedChange={v => setBrandingForm({...brandingForm, showNo1Badge: v})} />
                      </div>
                      <div className="space-y-2"><Label>Students Enrolled</Label><Input value={brandingForm.statsStudents} onChange={e => setBrandingForm({...brandingForm, statsStudents: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label>Workshops Done</Label><Input value={brandingForm.statsWorkshops} onChange={e => setBrandingForm({...brandingForm, statsWorkshops: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label>Testimonials Count</Label><Input value={brandingForm.statsTestimonials} onChange={e => setBrandingForm({...brandingForm, statsTestimonials: e.target.value})} className="rounded-xl h-12" /></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-headline font-bold text-xl text-primary border-b pb-2">Social & App Presence</h3>
                    <div className="space-y-2"><Label>WhatsApp URL</Label><Input value={brandingForm.whatsappUrl} onChange={e => setBrandingForm({...brandingForm, whatsappUrl: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label>YouTube URL</Label><Input value={brandingForm.youtubeUrl} onChange={e => setBrandingForm({...brandingForm, youtubeUrl: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label>Support Email</Label><Input value={brandingForm.emailAddress} onChange={e => setBrandingForm({...brandingForm, emailAddress: e.target.value})} className="rounded-xl h-12" /></div>
                    
                    <div className="p-6 rounded-3xl bg-slate-50 border space-y-4 mt-6">
                      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border mb-2">
                        <Label className="flex items-center gap-2 font-bold text-primary"><Smartphone className="w-4 h-4 text-accent" /> Enable App Downloads</Label>
                        <Switch checked={brandingForm.showAppDownload} onCheckedChange={v => setBrandingForm({...brandingForm, showAppDownload: v})} />
                      </div>
                      <div className="space-y-2"><Label>Play Store URL</Label><Input value={brandingForm.playStoreUrl} onChange={e => setBrandingForm({...brandingForm, playStoreUrl: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label>App Store URL</Label><Input value={brandingForm.appStoreUrl} onChange={e => setBrandingForm({...brandingForm, appStoreUrl: e.target.value})} className="rounded-xl h-12" /></div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 pt-6">
                    <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg bg-slate-900 text-white">Save All Configuration</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo-class">
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary text-white p-10"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Presentation className="w-6 h-6" /> Demo Class Management</CardTitle></CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSaveDemoClass} className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border mb-6">
                      <Label className="font-bold text-primary flex items-center gap-2"><Activity className="w-4 h-4" /> Enable Demo Section</Label>
                      <Switch checked={demoClassForm.isActive} onCheckedChange={v => setDemoClassForm({...demoClassForm, isActive: v})} />
                    </div>
                    <div className="space-y-2"><Label>Display Title</Label><Input value={demoClassForm.title} onChange={e => setDemoClassForm({...demoClassForm, title: e.target.value})} className="rounded-xl h-12" required /></div>
                    <div className="space-y-2"><Label>Video URL (YouTube/MP4)</Label><Input value={demoClassForm.videoUrl} onChange={e => setDemoClassForm({...demoClassForm, videoUrl: e.target.value})} className="rounded-xl h-12" required /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={demoClassForm.description} onChange={e => setDemoClassForm({...demoClassForm, description: e.target.value})} className="rounded-xl min-h-[120px]" /></div>
                    <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg">Save Demo Settings</Button>
                  </div>
                  <div className="space-y-4">
                    <Label className="font-bold">Video Preview</Label>
                    <div className="border-4 border-slate-50 rounded-[2rem] overflow-hidden bg-slate-900 aspect-video finance-3d-shadow">
                       {demoClassForm.videoUrl.includes('youtu') ? (
                         <iframe src={`https://www.youtube.com/embed/${demoClassForm.videoUrl.split('v=')[1] || demoClassForm.videoUrl.split('/').pop()}`} className="w-full h-full" />
                       ) : <video src={demoClassForm.videoUrl} className="w-full h-full object-cover" controls />}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="finance-3d-shadow border-none bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group hover:border-primary transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 mb-4 transition-colors"><Plus className="w-8 h-8 text-primary" /></div>
                    <span className="font-bold text-primary">Add New Course</span>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Create New Course</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddCourse} className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2 col-span-2"><Label>Course Title</Label><Input value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required /></div>
                    <div className="space-y-2 col-span-2"><Label>Subtitle</Label><Input value={newCourse.subtitle} onChange={e => setNewCourse({...newCourse, subtitle: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Category</Label>
                      <Select value={newCourse.category} onValueChange={v => setNewCourse({...newCourse, category: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Foundational">Foundational</SelectItem><SelectItem value="Leadership">Leadership</SelectItem><SelectItem value="Premium">Premium</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Order (Sort)</Label><Input type="number" value={newCourse.order} onChange={e => setNewCourse({...newCourse, order: parseInt(e.target.value)})} /></div>
                    <div className="space-y-2 col-span-2"><Label>Image URL</Label><Input value={newCourse.imageUrl} onChange={e => setNewCourse({...newCourse, imageUrl: e.target.value})} placeholder="https://..." /></div>
                    <div className="space-y-2 col-span-2"><Label>Buy/Enroll Link</Label><Input value={newCourse.buyLink} onChange={e => setNewCourse({...newCourse, buyLink: e.target.value})} placeholder="https://..." /></div>
                    <div className="space-y-2 col-span-2"><Label>Description</Label><Textarea value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} /></div>
                    <DialogFooter className="col-span-2 pt-4"><Button type="submit" className="w-full" disabled={isSubmitting}>Add Course</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {courses?.map(course => (
                <Card key={course.id} className="finance-3d-shadow border-none bg-white rounded-[2rem] overflow-hidden flex flex-col">
                   <div className="relative h-48 w-full"><Image src={course.imageUrl} alt={course.title} fill className="object-cover" /></div>
                   <div className="p-6 flex-grow space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge>{course.category}</Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem('courses', course.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <h4 className="font-bold text-xl">{course.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                   </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="finance-3d-shadow border-none bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group hover:border-accent transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-accent/10 mb-4 transition-colors"><Plus className="w-8 h-8 text-accent" /></div>
                    <span className="font-bold text-accent">Add Team Member</span>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New Team Member</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddTeamMember} className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Full Name</Label><Input value={newTeamMember.name} onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})} required /></div>
                    <div className="space-y-2"><Label>Role Title</Label><Input value={newTeamMember.role} onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value})} required /></div>
                    <div className="space-y-2"><Label>Leadership Tier</Label>
                      <Select value={newTeamMember.leadershipType} onValueChange={v => setNewTeamMember({...newTeamMember, leadershipType: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="ceo">CEO / Founder</SelectItem><SelectItem value="co-founder">Co-Founder</SelectItem><SelectItem value="team">Staff Member</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Profile Image URL</Label><Input value={newTeamMember.imageUrl} onChange={e => setNewTeamMember({...newTeamMember, imageUrl: e.target.value})} placeholder="https://..." /></div>
                    <div className="space-y-2"><Label>Bio/Quote</Label><Textarea value={newTeamMember.bio} onChange={e => setNewTeamMember({...newTeamMember, bio: e.target.value})} /></div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>Save Member</Button>
                  </form>
                </DialogContent>
              </Dialog>
              {team?.map(member => (
                <Card key={member.id} className="finance-3d-shadow border-none bg-white rounded-[2rem] p-6 text-center space-y-4 relative">
                   <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-slate-100">
                     <Image src={member.imageUrl || 'https://picsum.photos/seed/user/100/100'} alt={member.name} fill className="object-cover" />
                   </div>
                   <div>
                     <div className="flex justify-center mb-1">
                        {member.leadershipType === 'ceo' ? <Crown className="w-4 h-4 text-yellow-500" /> : member.leadershipType === 'co-founder' ? <Star className="w-4 h-4 text-slate-400" /> : <Users className="w-4 h-4 text-accent" />}
                     </div>
                     <h4 className="font-bold">{member.name}</h4>
                     <p className="text-xs text-accent font-bold uppercase">{member.role}</p>
                   </div>
                   <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-destructive" onClick={() => handleDeleteItem('team', member.id)}><Trash2 className="w-4 h-4" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="memories">
            <Tabs defaultValue="slides">
              <TabsList className="bg-transparent gap-4 mb-6">
                <TabsTrigger value="slides" className="rounded-xl px-6 py-2">Slideshow</TabsTrigger>
                <TabsTrigger value="gallery" className="rounded-xl px-6 py-2">Gallery</TabsTrigger>
              </TabsList>
              
              <TabsContent value="slides" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="finance-3d-shadow border-none bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group hover:border-primary transition-colors cursor-pointer min-h-[200px]">
                        <Plus className="w-8 h-8 text-primary mb-2" />
                        <span className="font-bold text-primary">Add Home Slide</span>
                      </Card>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>New Homepage Slide</DialogTitle></DialogHeader>
                      <form onSubmit={handleAddSlide} className="space-y-4 pt-4">
                        <div className="space-y-2"><Label>Title</Label><Input value={newSlide.title} onChange={e => setNewSlide({...newSlide, title: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Description</Label><Input value={newSlide.description} onChange={e => setNewSlide({...newSlide, description: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Order</Label><Input type="number" value={newSlide.order} onChange={e => setNewSlide({...newSlide, order: parseInt(e.target.value)})} /></div>
                        <div className="space-y-2"><Label>Media URL (Image/Video)</Label><Input value={newSlide.imageUrl} onChange={e => setNewSlide({...newSlide, imageUrl: e.target.value})} required /></div>
                        <Button type="submit" className="w-full">Add Slide</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  {slides?.map(slide => (
                    <Card key={slide.id} className="finance-3d-shadow border-none bg-white rounded-[2rem] overflow-hidden relative group aspect-video">
                       <Image src={slide.imageUrl} alt="Slide" fill className="object-cover" />
                       <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <h4 className="text-white font-bold">{slide.title}</h4>
                         <Button variant="destructive" size="sm" className="mt-2 w-fit" onClick={() => handleDeleteItem('slides', slide.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                       </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="aspect-square finance-3d-shadow border-none bg-white rounded-[2.5rem] flex items-center justify-center border-2 border-dashed cursor-pointer hover:border-primary transition-all">
                      <Plus className="w-8 h-8 text-primary" />
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Memory</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddGallery} className="space-y-4 pt-4">
                      <div className="space-y-2"><Label>Image URL</Label><Input value={newGalleryItem.imageUrl} onChange={e => setNewGalleryItem({...newGalleryItem, imageUrl: e.target.value})} required /></div>
                      <div className="space-y-2"><Label>Description</Label><Input value={newGalleryItem.description} onChange={e => setNewGalleryItem({...newGalleryItem, description: e.target.value})} /></div>
                      <Button type="submit" className="w-full">Add to Gallery</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                {gallery?.map(item => (
                  <Card key={item.id} className="aspect-square finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden relative group">
                    <Image src={item.imageUrl} alt="Memory" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Button variant="destructive" size="icon" onClick={() => handleDeleteItem('gallery', item.id)}><Trash2 className="w-4 h-4" /></Button></div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}