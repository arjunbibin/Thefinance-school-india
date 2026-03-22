'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  addDocumentNonBlocking,
  updateDocumentNonBlocking
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
  Star,
  Crown,
  Video,
  ListChecks,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
  Link as LinkIcon
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
        description: "Access restricted." 
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

  const teamQuery = useMemoFirebase(() => query(collection(db, 'team')), [db]);
  const { data: team } = useCollection(teamQuery);

  const slidesQuery = useMemoFirebase(() => query(collection(db, 'slides'), orderBy('order', 'asc')), [db]);
  const { data: slides } = useCollection(slidesQuery);

  const galleryQuery = useMemoFirebase(() => query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), [db]);
  const { data: gallery } = useCollection(galleryQuery);

  const testimonialsQuery = useMemoFirebase(() => query(collection(db, 'testimonialVideos'), orderBy('order', 'asc')), [db]);
  const { data: testimonials } = useCollection(testimonialsQuery);

  const reviewsQuery = useMemoFirebase(() => query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), [db]);
  const { data: reviews } = useCollection(reviewsQuery);

  // States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Forms
  const [brandingForm, setBrandingForm] = useState<any>({});
  const [demoClassForm, setDemoClassForm] = useState<any>({});
  const [courseForm, setCourseForm] = useState({ title: '', subtitle: '', description: '', highlights: '', category: 'Foundational', lessons: '', rating: '5.0', buyLink: '', order: 0, imageUrl: '' });
  const [teamForm, setTeamForm] = useState({ name: '', role: '', bio: '', leadershipType: 'team', imageUrl: '' });
  const [slideForm, setSlideForm] = useState({ title: '', description: '', order: 0, imageUrl: '' });
  const [galleryForm, setGalleryForm] = useState({ description: '', imageUrl: '' });
  const [testimonialForm, setTestimonialForm] = useState({ title: '', videoUrl: '', order: 0 });
  const [reviewForm, setReviewForm] = useState({ userName: '', userPhoto: '', designation: 'Student', rating: 5, content: '' });

  useEffect(() => { if (branding) setBrandingForm(branding); }, [branding]);
  useEffect(() => { if (demoClass) setDemoClassForm(demoClass); }, [demoClass]);

  const handleLogout = async () => {
    localStorage.removeItem('activeSessionId');
    await auth.signOut();
    router.push('/');
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', 
        (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100), 
        (err) => { toast({ variant: "destructive", title: "Upload Failed" }); reject(err); }, 
        () => getDownloadURL(uploadTask.snapshot.ref).then((url) => { setUploadProgress(null); resolve(url); })
      );
    });
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandingRef) {
      setDocumentNonBlocking(brandingRef, brandingForm, { merge: true });
      toast({ title: "Branding Updated" });
    }
  };

  const handleSaveDemoClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoClassRef) {
      setDocumentNonBlocking(demoClassRef, { ...demoClassForm, id: 'demo_class', lastUpdated: new Date().toISOString() }, { merge: true });
      toast({ title: "Demo Class Updated" });
    }
  };

  const handleDeleteItem = async (col: string, id: string) => {
    if (confirm('Delete this item permanently?')) {
      try { await deleteDoc(doc(db, col, id)); toast({ title: "Item Deleted" }); } 
      catch (e) { toast({ variant: "destructive", title: "Delete Failed" }); }
    }
  };

  const handleSubmitForm = async (e: React.FormEvent, col: string, form: any, setForm: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSave = { ...form };
      if (col === 'courses' && typeof dataToSave.highlights === 'string') {
        dataToSave.highlights = dataToSave.highlights.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
      
      if (editingItem) {
        updateDocumentNonBlocking(doc(db, col, editingItem.id), dataToSave);
        toast({ title: "Updated successfully" });
      } else {
        await addDocumentNonBlocking(collection(db, col), { ...dataToSave, createdAt: serverTimestamp() });
        toast({ title: "Added successfully" });
      }
      setEditingItem(null);
      // Reset forms
      if (col === 'courses') setCourseForm({ title: '', subtitle: '', description: '', highlights: '', category: 'Foundational', lessons: '', rating: '5.0', buyLink: '', order: 0, imageUrl: '' });
      if (col === 'team') setTeamForm({ name: '', role: '', bio: '', leadershipType: 'team', imageUrl: '' });
      if (col === 'slides') setSlideForm({ title: '', description: '', order: 0, imageUrl: '' });
      if (col === 'gallery') setGalleryForm({ description: '', imageUrl: '' });
      if (col === 'testimonialVideos') setTestimonialForm({ title: '', videoUrl: '', order: 0 });
      if (col === 'reviews') setReviewForm({ userName: '', userPhoto: '', designation: 'Student', rating: 5, content: '' });
    } finally { setIsSubmitting(false); }
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase().split('?')[0];
    return lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.gif');
  };

  const sortedTeam = React.useMemo(() => {
    if (!team) return [];
    return [...team].sort((a, b) => {
      const rank = { ceo: 0, 'co-founder': 1, team: 2 };
      const aRank = rank[a.leadershipType as keyof typeof rank] ?? 2;
      const bRank = rank[b.leadershipType as keyof typeof rank] ?? 2;
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });
  }, [team]);

  if (isUserLoading || isProfileLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || !isAuthorized) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pb-24 px-6 max-w-7xl mx-auto w-full pt-16">
        <div className="mb-12 flex items-center justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Staff <span className="text-accent">Portal</span> <span className="text-sm font-code text-slate-400">v1.6</span></h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 font-medium"><ShieldAlert className="w-4 h-4 text-accent" /> Authenticated: {profile?.firstName} ({profile?.role})</p>
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
            <TabsTrigger value="reviews" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-10"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Settings className="w-6 h-6" /> Configuration & Social Links</CardTitle></CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSaveBranding} className="max-w-4xl grid md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-6">
                    <h3 className="font-headline font-bold text-xl text-primary border-b pb-2">Identity</h3>
                    <div className="space-y-2"><Label>Institutional Name</Label><Input value={brandingForm.appName || ''} onChange={e => setBrandingForm({...brandingForm, appName: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label>Brand Tagline</Label><Input value={brandingForm.tagline || ''} onChange={e => setBrandingForm({...brandingForm, tagline: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2">
                       <Label>Logo URL / Upload</Label>
                       <div className="flex gap-2">
                          <Input value={brandingForm.logoUrl || ''} onChange={e => setBrandingForm({...brandingForm, logoUrl: e.target.value})} className="rounded-xl h-12" />
                          <div className="relative">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { if(e.target.files?.[0]) setBrandingForm({...brandingForm, logoUrl: await uploadFile(e.target.files[0], 'branding')}) }} />
                            <Button type="button" size="icon" className="h-12 w-12 rounded-xl"><Upload className="w-4 h-4" /></Button>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2"><Label>Integrated Quiz URL</Label><Input value={brandingForm.quizUrl || ''} onChange={e => setBrandingForm({...brandingForm, quizUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://..." /></div>
                    <h3 className="font-headline font-bold text-xl text-primary border-b pb-2 pt-4">Impact & Metrics</h3>
                    <div className="p-6 rounded-3xl bg-slate-50 border space-y-4 finance-3d-shadow-inner">
                      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border mb-2">
                        <Label className="flex items-center gap-2 font-bold text-primary"><Trophy className="w-4 h-4 text-yellow-500" /> Show No.1 Badge</Label>
                        <Switch checked={brandingForm.showNo1Badge || false} onCheckedChange={v => setBrandingForm({...brandingForm, showNo1Badge: v})} />
                      </div>
                      <div className="space-y-2"><Label>Students Enrolled</Label><Input value={brandingForm.statsStudents || ''} onChange={e => setBrandingForm({...brandingForm, statsStudents: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label>Workshops Done</Label><Input value={brandingForm.statsWorkshops || ''} onChange={e => setBrandingForm({...brandingForm, statsWorkshops: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label>Testimonials Count</Label><Input value={brandingForm.statsTestimonials || ''} onChange={e => setBrandingForm({...brandingForm, statsTestimonials: e.target.value})} className="rounded-xl h-12" /></div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="font-headline font-bold text-xl text-primary border-b pb-2">Social & App Presence</h3>
                    <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border finance-3d-shadow-inner">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp URL</Label>
                        <Input value={brandingForm.whatsappUrl || ''} onChange={e => setBrandingForm({...brandingForm, whatsappUrl: e.target.value})} className="rounded-xl h-12 bg-white" placeholder="https://wa.me/..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> Instagram URL</Label>
                        <Input value={brandingForm.instagramUrl || ''} onChange={e => setBrandingForm({...brandingForm, instagramUrl: e.target.value})} className="rounded-xl h-12 bg-white" placeholder="https://instagram.com/..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> Facebook URL</Label>
                        <Input value={brandingForm.facebookUrl || ''} onChange={e => setBrandingForm({...brandingForm, facebookUrl: e.target.value})} className="rounded-xl h-12 bg-white" placeholder="https://facebook.com/..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-600" /> YouTube URL</Label>
                        <Input value={brandingForm.youtubeUrl || ''} onChange={e => setBrandingForm({...brandingForm, youtubeUrl: e.target.value})} className="rounded-xl h-12 bg-white" placeholder="https://youtube.com/..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn URL</Label>
                        <Input value={brandingForm.linkedinUrl || ''} onChange={e => setBrandingForm({...brandingForm, linkedinUrl: e.target.value})} className="rounded-xl h-12 bg-white" placeholder="https://linkedin.com/..." />
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Support Email</Label><Input value={brandingForm.emailAddress || ''} onChange={e => setBrandingForm({...brandingForm, emailAddress: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="p-6 rounded-3xl bg-slate-50 border space-y-4 mt-6">
                      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border mb-2">
                        <Label className="flex items-center gap-2 font-bold text-primary"><Smartphone className="w-4 h-4 text-accent" /> Enable App Downloads</Label>
                        <Switch checked={brandingForm.showAppDownload || false} onCheckedChange={v => setBrandingForm({...brandingForm, showAppDownload: v})} />
                      </div>
                      <div className="space-y-2"><Label>Play Store URL</Label><Input value={brandingForm.playStoreUrl || ''} onChange={e => setBrandingForm({...brandingForm, playStoreUrl: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label>App Store URL</Label><Input value={brandingForm.appStoreUrl || ''} onChange={e => setBrandingForm({...brandingForm, appStoreUrl: e.target.value})} className="rounded-xl h-12" /></div>
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
                      <Switch checked={demoClassForm.isActive || false} onCheckedChange={v => setDemoClassForm({...demoClassForm, isActive: v})} />
                    </div>
                    <div className="space-y-2"><Label>Display Title</Label><Input value={demoClassForm.title || ''} onChange={e => setDemoClassForm({...demoClassForm, title: e.target.value})} className="rounded-xl h-12" required /></div>
                    <div className="space-y-2">
                       <Label>Video URL / Upload (YouTube or Direct)</Label>
                       <div className="flex gap-2">
                          <Input value={demoClassForm.videoUrl || ''} onChange={e => setDemoClassForm({...demoClassForm, videoUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://..." />
                          <div className="relative">
                             <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { if(e.target.files?.[0]) setDemoClassForm({...demoClassForm, videoUrl: await uploadFile(e.target.files[0], 'demo')}) }} />
                             <Button type="button" size="icon" className="h-12 w-12 rounded-xl"><Upload className="w-4 h-4" /></Button>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={demoClassForm.description || ''} onChange={e => setDemoClassForm({...demoClassForm, description: e.target.value})} className="rounded-xl min-h-[120px]" /></div>
                    <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg">Save Demo Settings</Button>
                  </div>
                  <div className="space-y-4">
                    <Label className="font-bold">Video Preview</Label>
                    <div className="border-4 border-slate-50 rounded-[2rem] overflow-hidden bg-slate-900 aspect-video finance-3d-shadow relative">
                       {getYoutubeId(demoClassForm.videoUrl) ? (
                         <iframe src={`https://www.youtube.com/embed/${getYoutubeId(demoClassForm.videoUrl)}`} className="w-full h-full" />
                       ) : demoClassForm.videoUrl ? <video src={demoClassForm.videoUrl} className="w-full h-full object-cover" controls /> : <div className="absolute inset-0 flex items-center justify-center text-white/20"><Play className="w-16 h-16" /></div>}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Dialog onOpenChange={(open) => { if(!open) { setEditingItem(null); setCourseForm({ title: '', subtitle: '', description: '', highlights: '', category: 'Foundational', lessons: '', rating: '5.0', buyLink: '', order: 0, imageUrl: '' }); } }}>
                <DialogTrigger asChild>
                  <Card className="finance-3d-shadow border-none bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group hover:border-primary transition-colors cursor-pointer min-h-[400px]">
                    <Plus className="w-8 h-8 text-primary mb-4" />
                    <span className="font-bold text-primary">Add New Course</span>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>{editingItem ? 'Edit Course' : 'Create New Course'}</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => handleSubmitForm(e, 'courses', courseForm, setCourseForm)} className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2 col-span-2"><Label>Course Title</Label><Input value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} required /></div>
                    <div className="space-y-2 col-span-2"><Label>Subtitle</Label><Input value={courseForm.subtitle} onChange={e => setCourseForm({...courseForm, subtitle: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Category</Label>
                      <Select value={courseForm.category} onValueChange={v => setCourseForm({...courseForm, category: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Foundational">Foundational</SelectItem><SelectItem value="Leadership">Leadership</SelectItem><SelectItem value="Premium">Premium</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Order (Sort)</Label><Input type="number" value={courseForm.order} onChange={e => setCourseForm({...courseForm, order: parseInt(e.target.value)})} /></div>
                    <div className="space-y-2 col-span-2">
                       <Label>Image URL / Upload</Label>
                       <div className="flex gap-2">
                          <Input value={courseForm.imageUrl} onChange={e => setCourseForm({...courseForm, imageUrl: e.target.value})} placeholder="https://..." />
                          <div className="relative">
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { if(e.target.files?.[0]) setCourseForm({...courseForm, imageUrl: await uploadFile(e.target.files[0], 'courses')}) }} />
                             <Button type="button" size="icon" className="h-10 w-10"><Upload className="w-4 h-4" /></Button>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2 col-span-2"><Label>Buy/Enroll Link</Label><Input value={courseForm.buyLink} onChange={e => setCourseForm({...courseForm, buyLink: e.target.value})} placeholder="https://..." /></div>
                    <div className="space-y-2 col-span-2"><Label>Key Topics (Comma separated)</Label><Input value={courseForm.highlights} onChange={e => setCourseForm({...courseForm, highlights: e.target.value})} placeholder="Budgeting, Stocks, Taxes..." /></div>
                    <div className="space-y-2 col-span-2"><Label>Description</Label><Textarea value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} /></div>
                    <DialogFooter className="col-span-2 pt-4"><Button type="submit" className="w-full" disabled={isSubmitting}>{editingItem ? 'Update Course' : 'Add Course'}</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {courses?.map(course => (
                <Card key={course.id} className="finance-3d-shadow border-none bg-white rounded-[2rem] overflow-hidden flex flex-col group">
                   <div className="relative h-48 w-full">
                      <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl" onClick={() => { setEditingItem(course); setCourseForm({...course, highlights: Array.isArray(course.highlights) ? course.highlights.join(', ') : course.highlights}); }}><Pencil className="w-4 h-4" /></Button>
                         <Button size="icon" variant="destructive" className="h-10 w-10 rounded-xl" onClick={() => handleDeleteItem('courses', course.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                   </div>
                   <div className="p-6 flex-grow space-y-3">
                      <Badge>{course.category}</Badge>
                      <h4 className="font-bold text-xl">{course.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                   </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Dialog onOpenChange={(open) => { if(!open) { setEditingItem(null); setTeamForm({ name: '', role: '', bio: '', leadershipType: 'team', imageUrl: '' }); } }}>
                <DialogTrigger asChild>
                  <Card className="finance-3d-shadow border-none bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group hover:border-accent transition-colors cursor-pointer min-h-[300px]">
                    <Plus className="w-8 h-8 text-accent mb-4" />
                    <span className="font-bold text-accent">Add Team Member</span>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingItem ? 'Edit Member' : 'New Team Member'}</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => handleSubmitForm(e, 'team', teamForm, setTeamForm)} className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Full Name</Label><Input value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} required /></div>
                    <div className="space-y-2"><Label>Role Title</Label><Input value={teamForm.role} onChange={e => setTeamForm({...teamForm, role: e.target.value})} required /></div>
                    <div className="space-y-2"><Label>Leadership Tier</Label>
                      <Select value={teamForm.leadershipType} onValueChange={v => setTeamForm({...teamForm, leadershipType: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="ceo">CEO / Founder</SelectItem><SelectItem value="co-founder">Co-Founder</SelectItem><SelectItem value="team">Staff Member</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                       <Label>Profile Image URL / Upload</Label>
                       <div className="flex gap-2">
                          <Input value={teamForm.imageUrl} onChange={e => setTeamForm({...teamForm, imageUrl: e.target.value})} placeholder="https://..." />
                          <div className="relative">
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { if(e.target.files?.[0]) setTeamForm({...teamForm, imageUrl: await uploadFile(e.target.files[0], 'team')}) }} />
                             <Button type="button" size="icon" className="h-10 w-10"><Upload className="w-4 h-4" /></Button>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2"><Label>Bio/Quote</Label><Textarea value={teamForm.bio} onChange={e => setTeamForm({...teamForm, bio: e.target.value})} /></div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>{editingItem ? 'Update Member' : 'Save Member'}</Button>
                  </form>
                </DialogContent>
              </Dialog>
              {sortedTeam.map(member => (
                <Card key={member.id} className="finance-3d-shadow border-none bg-white rounded-[2rem] p-6 text-center space-y-4 relative group">
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
                   <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={() => { setEditingItem(member); setTeamForm(member); }}><Pencil className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem('team', member.id)}><Trash2 className="w-3 h-3" /></Button>
                   </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="memories">
            <Tabs defaultValue="slides">
              <TabsList className="bg-transparent gap-4 mb-6">
                <TabsTrigger value="slides" className="rounded-xl px-6 py-2">Slideshow</TabsTrigger>
                <TabsTrigger value="gallery" className="rounded-xl px-6 py-2">Gallery</TabsTrigger>
                <TabsTrigger value="testimonials" className="rounded-xl px-6 py-2">Testimonials</TabsTrigger>
              </TabsList>
              
              <TabsContent value="slides" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Dialog onOpenChange={(open) => { if(!open) { setEditingItem(null); setSlideForm({ title: '', description: '', order: 0, imageUrl: '' }); } }}>
                    <DialogTrigger asChild>
                      <Card className="finance-3d-shadow border-none bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group hover:border-primary transition-colors cursor-pointer min-h-[250px]">
                        <Plus className="w-8 h-8 text-primary mb-2" />
                        <span className="font-bold text-primary">Add Home Slide</span>
                      </Card>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{editingItem ? 'Edit Slide' : 'New Homepage Slide'}</DialogTitle></DialogHeader>
                      <form onSubmit={(e) => handleSubmitForm(e, 'slides', slideForm, setSlideForm)} className="space-y-4 pt-4">
                        <div className="space-y-2"><Label>Title</Label><Input value={slideForm.title} onChange={e => setSlideForm({...slideForm, title: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Description</Label><Input value={slideForm.description} onChange={e => setSlideForm({...slideForm, description: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Order</Label><Input type="number" value={slideForm.order} onChange={e => setSlideForm({...slideForm, order: parseInt(e.target.value)})} /></div>
                        <div className="space-y-2">
                           <Label>Media URL / Upload (Image/Video/GIF)</Label>
                           <div className="flex gap-2">
                              <Input value={slideForm.imageUrl} onChange={e => setSlideForm({...slideForm, imageUrl: e.target.value})} placeholder="https://..." />
                              <div className="relative">
                                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { if(e.target.files?.[0]) setSlideForm({...slideForm, imageUrl: await uploadFile(e.target.files[0], 'slides')}) }} />
                                 <Button type="button" size="icon" className="h-10 w-10"><Upload className="w-4 h-4" /></Button>
                              </div>
                           </div>
                        </div>
                        <Button type="submit" className="w-full">{editingItem ? 'Update Slide' : 'Add Slide'}</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  {slides?.map(slide => {
                    const ytId = getYoutubeId(slide.imageUrl);
                    const isVideo = isVideoUrl(slide.imageUrl);
                    return (
                      <Card key={slide.id} className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden relative group aspect-video">
                         {ytId ? (
                           <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full pointer-events-none" />
                         ) : isVideo ? (
                           <video src={slide.imageUrl} className="w-full h-full object-cover" muted loop autoPlay />
                         ) : (
                           <Image src={slide.imageUrl} alt="Slide" fill className="object-cover" />
                         )}
                         <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <h4 className="text-white font-bold mb-2 truncate">{slide.title}</h4>
                           <div className="flex gap-2">
                              <Button size="sm" variant="secondary" onClick={() => { setEditingItem(slide); setSlideForm(slide); }}><Pencil className="w-4 h-4 mr-2" /> Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteItem('slides', slide.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                           </div>
                         </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Dialog onOpenChange={(open) => { if(!open) { setEditingItem(null); setGalleryForm({ description: '', imageUrl: '' }); } }}>
                  <DialogTrigger asChild>
                    <Card className="aspect-square finance-3d-shadow border-none bg-white rounded-[2.5rem] flex items-center justify-center border-2 border-dashed cursor-pointer hover:border-primary transition-all">
                      <Plus className="w-8 h-8 text-primary" />
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? 'Edit Memory' : 'Add Memory'}</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => handleSubmitForm(e, 'gallery', galleryForm, setGalleryForm)} className="space-y-4 pt-4">
                      <div className="space-y-2">
                         <Label>Image URL / Upload</Label>
                         <div className="flex gap-2">
                            <Input value={galleryForm.imageUrl} onChange={e => setGalleryForm({...galleryForm, imageUrl: e.target.value})} placeholder="https://..." />
                            <div className="relative">
                               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { if(e.target.files?.[0]) setGalleryForm({...galleryForm, imageUrl: await uploadFile(e.target.files[0], 'gallery')}) }} />
                               <Button type="button" size="icon" className="h-10 w-10"><Upload className="w-4 h-4" /></Button>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-2"><Label>Description</Label><Input value={galleryForm.description} onChange={e => setGalleryForm({...galleryForm, description: e.target.value})} /></div>
                      <Button type="submit" className="w-full">{editingItem ? 'Update' : 'Add to Gallery'}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                {gallery?.map(item => (
                  <Card key={item.id} className="aspect-square finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden relative group">
                    <Image src={item.imageUrl} alt="Memory" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <Button variant="secondary" size="icon" onClick={() => { setEditingItem(item); setGalleryForm(item); }}><Pencil className="w-4 h-4" /></Button>
                       <Button variant="destructive" size="icon" onClick={() => handleDeleteItem('gallery', item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="testimonials" className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Dialog onOpenChange={(open) => { if(!open) { setEditingItem(null); setTestimonialForm({ title: '', videoUrl: '', order: 0 }); } }}>
                  <DialogTrigger asChild>
                    <Card className="aspect-[9/16] finance-3d-shadow border-none bg-white rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed cursor-pointer hover:border-accent transition-all">
                      <Plus className="w-8 h-8 text-accent mb-2" />
                      <span className="text-xs font-bold text-accent">Add Story</span>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? 'Edit Success Story' : 'New Success Story'}</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => handleSubmitForm(e, 'testimonialVideos', testimonialForm, setTestimonialForm)} className="space-y-4 pt-4">
                      <div className="space-y-2"><Label>Title / Student Name</Label><Input value={testimonialForm.title} onChange={e => setTestimonialForm({...testimonialForm, title: e.target.value})} /></div>
                      <div className="space-y-2">
                         <Label>Video URL / Upload (YouTube Shorts or MP4)</Label>
                         <div className="flex gap-2">
                            <Input value={testimonialForm.videoUrl} onChange={e => setTestimonialForm({...testimonialForm, videoUrl: e.target.value})} placeholder="https://..." />
                            <div className="relative">
                               <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { if(e.target.files?.[0]) setTestimonialForm({...testimonialForm, videoUrl: await uploadFile(e.target.files[0], 'testimonials')}) }} />
                               <Button type="button" size="icon" className="h-10 w-10"><Upload className="w-4 h-4" /></Button>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-2"><Label>Order</Label><Input type="number" value={testimonialForm.order} onChange={e => setTestimonialForm({...testimonialForm, order: parseInt(e.target.value)})} /></div>
                      <Button type="submit" className="w-full">{editingItem ? 'Update Story' : 'Add Story'}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                {testimonials?.map(item => {
                  const ytId = getYoutubeId(item.videoUrl);
                  const isVideo = isVideoUrl(item.videoUrl);
                  return (
                    <Card key={item.id} className="aspect-[9/16] finance-3d-shadow border-none bg-slate-900 rounded-[2.5rem] overflow-hidden relative group">
                      <div className="w-full h-full">
                        {ytId ? (
                           <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full pointer-events-none" />
                        ) : isVideo ? (
                           <video src={item.videoUrl} className="w-full h-full object-cover" muted />
                        ) : (
                           <div className="absolute inset-0 flex items-center justify-center"><Video className="w-12 h-12 text-white/10" /></div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                         <p className="text-white font-bold text-center px-4 truncate">{item.title}</p>
                         <div className="flex gap-2">
                           <Button variant="secondary" size="sm" onClick={() => { setEditingItem(item); setTestimonialForm(item); }}><Pencil className="w-4 h-4" /></Button>
                           <Button variant="destructive" size="sm" onClick={() => handleDeleteItem('testimonialVideos', item.id)}><Trash2 className="w-4 h-4" /></Button>
                         </div>
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Dialog onOpenChange={(open) => { if(!open) { setEditingItem(null); setReviewForm({ userName: '', userPhoto: '', designation: 'Student', rating: 5, content: '' }); } }}>
                <DialogTrigger asChild>
                  <Card className="finance-3d-shadow border-none bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group hover:border-primary transition-colors cursor-pointer min-h-[300px]">
                    <Plus className="w-8 h-8 text-primary mb-4" />
                    <span className="font-bold text-primary">Add Review</span>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingItem ? 'Edit Review' : 'Add New Review'}</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => handleSubmitForm(e, 'reviews', reviewForm, setReviewForm)} className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Reviewer Name</Label><Input value={reviewForm.userName} onChange={e => setReviewForm({...reviewForm, userName: e.target.value})} required /></div>
                    <div className="space-y-2"><Label>Designation</Label><Input value={reviewForm.designation} onChange={e => setReviewForm({...reviewForm, designation: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Star Rating (1-5)</Label><Input type="number" min="1" max="5" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})} /></div>
                    <div className="space-y-2">
                       <Label>Reviewer Photo URL / Upload</Label>
                       <div className="flex gap-2">
                          <Input value={reviewForm.userPhoto} onChange={e => setReviewForm({...reviewForm, userPhoto: e.target.value})} placeholder="https://..." />
                          <div className="relative">
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { if(e.target.files?.[0]) setReviewForm({...reviewForm, userPhoto: await uploadFile(e.target.files[0], 'reviews')}) }} />
                             <Button type="button" size="icon" className="h-10 w-10"><Upload className="w-4 h-4" /></Button>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2"><Label>Review Content</Label><Textarea value={reviewForm.content} onChange={e => setReviewForm({...reviewForm, content: e.target.value})} required /></div>
                    <Button type="submit" className="w-full">{editingItem ? 'Update Review' : 'Add Review'}</Button>
                  </form>
                </DialogContent>
              </Dialog>
              {reviews?.map(review => (
                <Card key={review.id} className="finance-3d-shadow border-none bg-white rounded-[2.5rem] p-8 relative group">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden finance-3d-shadow-inner">
                        <Image src={review.userPhoto || `https://picsum.photos/seed/${review.id}/100/100`} alt={review.userName} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold">{review.userName}</h4>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />)}
                        </div>
                      </div>
                   </div>
                   <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-4">"{review.content}"</p>
                   <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={() => { setEditingItem(review); setReviewForm(review); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem('reviews', review.id)}><Trash2 className="w-4 h-4" /></Button>
                   </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}