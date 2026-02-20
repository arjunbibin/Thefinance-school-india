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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useCollection, 
  useMemoFirebase, 
  useAuth, 
  useStorage, 
  updateDocumentNonBlocking, 
  addDocumentNonBlocking, 
  deleteDocumentNonBlocking,
  setDocumentNonBlocking
} from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  LogOut, 
  ShieldAlert, 
  Users, 
  Trash2, 
  Upload, 
  BookOpen, 
  XCircle, 
  UserSquare, 
  Star, 
  Video, 
  Play, 
  Edit2,
  Settings,
  Image as ImageIcon,
  MessageSquare,
  Globe,
  Layout,
  PlusCircle
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
  
  const slideFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const courseFileInputRef = useRef<HTMLInputElement>(null);
  const teamFileInputRef = useRef<HTMLInputElement>(null);
  const reviewFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  
  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const isAuthorized = !!(user && profile && profile.role !== 'user');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (!isProfileLoading && profile && profile.role === 'user') {
      router.push('/');
      toast({ variant: "destructive", title: "Unauthorized", description: "Access restricted to staff." });
    }
  }, [user, isUserLoading, router, profile, isProfileLoading, toast]);

  // DATA FETCHING
  const slidesQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'slides'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: slides } = useCollection(slidesQuery);

  const galleryQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'gallery'), orderBy('createdAt', 'desc')) : null, [db, isAuthorized]);
  const { data: galleryItems } = useCollection(galleryQuery);

  const coursesQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'courses'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: courses } = useCollection(coursesQuery);

  const teamQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'team'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: teamMembers } = useCollection(teamQuery);

  const reviewsQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'reviews'), orderBy('createdAt', 'desc')) : null, [db, isAuthorized]);
  const { data: reviews } = useCollection(reviewsQuery);

  const videosQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'videos'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: videoGallery } = useCollection(videosQuery);

  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  // --- STATES ---
  const [brandingForm, setBrandingForm] = useState({ appName: '', logoUrl: '', tagline: '' });
  useEffect(() => { if (branding) setBrandingForm({ appName: branding.appName || '', logoUrl: branding.logoUrl || '', tagline: branding.tagline || '' }); }, [branding]);

  const [courseForm, setCourseForm] = useState({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [teamForm, setTeamForm] = useState({ id: '', name: '', role: '', bio: '', imageUrl: '', isFounder: false, order: 0 });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [newSlide, setNewSlide] = useState({ title: '', description: '', imageUrl: '', order: 0 });
  const [newGalleryImg, setNewGalleryImg] = useState({ description: '', imageUrl: '' });
  const [newReview, setNewReview] = useState({ userName: '', userPhoto: '', content: '', rating: 5 });
  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', order: 0 });
  
  // File holding states for multi-stage upload
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  const [itemToDelete, setItemToDelete] = useState<{ path: string; id: string } | null>(null);

  const handleLogout = async () => {
    localStorage.removeItem('activeSessionId');
    await auth.signOut();
    router.push('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'video' && file.size > 30 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Videos are limited to 30MB." });
        return;
      }
      if (type !== 'video' && file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Images must be smaller than 5MB." });
        return;
      }

      setSelectedFiles(prev => ({ ...prev, [type]: file }));
      
      // Local preview
      const previewUrl = URL.createObjectURL(file);
      if (type === 'slide') setNewSlide(prev => ({ ...prev, imageUrl: previewUrl }));
      else if (type === 'gallery') setNewGalleryImg(prev => ({ ...prev, imageUrl: previewUrl }));
      else if (type === 'course') setCourseForm(prev => ({ ...prev, imageUrl: previewUrl }));
      else if (type === 'team') setTeamForm(prev => ({ ...prev, imageUrl: previewUrl }));
      else if (type === 'review') setNewReview(prev => ({ ...prev, userPhoto: previewUrl }));
      else if (type === 'video') setNewVideo(prev => ({ ...prev, videoUrl: previewUrl }));
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          setUploadProgress(null);
          reject(error);
        }, 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
        }
      );
    });
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setDocumentNonBlocking(brandingRef!, brandingForm, { merge: true });
    toast({ title: "Branding Updated Successfully" });
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = courseForm.imageUrl;

    try {
      if (selectedFiles['course']) {
        finalImageUrl = await uploadFile(selectedFiles['course'], 'courses');
      }

      const highlightsArray = typeof courseForm.highlights === 'string' ? courseForm.highlights.split(',').map(h => h.trim()).filter(h => h !== '') : (courseForm.highlights || []);
      const data = { 
        title: courseForm.title,
        subtitle: courseForm.subtitle,
        description: courseForm.description,
        imageUrl: finalImageUrl,
        category: courseForm.category,
        rating: Number(courseForm.rating),
        lessons: courseForm.lessons,
        highlights: highlightsArray,
        buyLink: courseForm.buyLink,
        order: Number(courseForm.order)
      };

      if (editingCourseId) {
        const docRef = doc(db, 'courses', editingCourseId);
        updateDocumentNonBlocking(docRef, data);
        toast({ title: "Course Updated" });
      } else {
        const colRef = collection(db, 'courses');
        addDocumentNonBlocking(colRef, { ...data, createdAt: serverTimestamp() });
        toast({ title: "Course Added" });
      }

      setCourseForm({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
      setEditingCourseId(null);
      setSelectedFiles(prev => ({ ...prev, course: null }));
      setUploadProgress(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = teamForm.imageUrl;

    try {
      if (selectedFiles['team']) {
        finalImageUrl = await uploadFile(selectedFiles['team'], 'team');
      }

      const data = {
        name: teamForm.name,
        role: teamForm.role,
        bio: teamForm.bio,
        imageUrl: finalImageUrl,
        isFounder: teamForm.isFounder,
        order: Number(teamForm.order)
      };

      if (editingMemberId) {
        const docRef = doc(db, 'team', editingMemberId);
        updateDocumentNonBlocking(docRef, data);
        toast({ title: "Team Member Updated" });
      } else {
        const colRef = collection(db, 'team');
        addDocumentNonBlocking(colRef, { ...data, createdAt: serverTimestamp() });
        toast({ title: "Team Member Added" });
      }

      setTeamForm({ id: '', name: '', role: '', bio: '', imageUrl: '', isFounder: false, order: 0 });
      setEditingMemberId(null);
      setSelectedFiles(prev => ({ ...prev, team: null }));
      setUploadProgress(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles['slide'] && !newSlide.imageUrl) return toast({ variant: "destructive", title: "Required", description: "Image is required." });
    if (!newSlide.title) return toast({ variant: "destructive", title: "Required", description: "Title is required." });
    
    try {
      let finalImageUrl = newSlide.imageUrl;
      if (selectedFiles['slide']) {
        finalImageUrl = await uploadFile(selectedFiles['slide'], 'slides');
      }

      const colRef = collection(db, 'slides');
      addDocumentNonBlocking(colRef, { 
        title: newSlide.title,
        description: newSlide.description,
        imageUrl: finalImageUrl,
        order: Number(newSlide.order), 
        createdAt: serverTimestamp() 
      });
      
      toast({ title: "Slide Added Successfully" });
      setNewSlide({ title: '', description: '', imageUrl: '', order: 0 });
      setSelectedFiles(prev => ({ ...prev, slide: null }));
      setUploadProgress(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles['gallery'] && !newGalleryImg.imageUrl) return toast({ variant: "destructive", title: "Required", description: "Image is required." });
    
    try {
      let finalImageUrl = newGalleryImg.imageUrl;
      if (selectedFiles['gallery']) {
        finalImageUrl = await uploadFile(selectedFiles['gallery'], 'gallery');
      }

      const colRef = collection(db, 'gallery');
      addDocumentNonBlocking(colRef, { 
        description: newGalleryImg.description,
        imageUrl: finalImageUrl,
        createdAt: serverTimestamp() 
      });
      toast({ title: "Memory Image Added" });
      setNewGalleryImg({ description: '', imageUrl: '' });
      setSelectedFiles(prev => ({ ...prev, gallery: null }));
      setUploadProgress(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = newReview.userPhoto;
      if (selectedFiles['review']) {
        finalImageUrl = await uploadFile(selectedFiles['review'], 'reviews');
      }

      const colRef = collection(db, 'reviews');
      addDocumentNonBlocking(colRef, { ...newReview, userPhoto: finalImageUrl, createdAt: serverTimestamp() });
      toast({ title: "Testimonial Added" });
      setNewReview({ userName: '', userPhoto: '', content: '', rating: 5 });
      setSelectedFiles(prev => ({ ...prev, review: null }));
      setUploadProgress(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles['video']) return toast({ variant: "destructive", title: "Required", description: "Video file is required." });
    
    try {
      const downloadURL = await uploadFile(selectedFiles['video'], 'videos');
      const data = { 
        title: newVideo.title, 
        videoUrl: downloadURL, 
        order: Number(newVideo.order), 
        createdAt: serverTimestamp() 
      };
      const colRef = collection(db, 'videos');
      addDocumentNonBlocking(colRef, data);
      
      setUploadProgress(null);
      setSelectedFiles(prev => ({ ...prev, video: null }));
      setNewVideo({ title: '', videoUrl: '', order: 0 });
      toast({ title: "Showcase Video Published" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    }
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const docRef = doc(db, itemToDelete.path, itemToDelete.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Item Removed Successfully" });
    setItemToDelete(null);
  };

  if (isUserLoading || isProfileLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pb-24 px-6 max-w-7xl mx-auto w-full pt-16">
        <div className="mb-12 flex items-center justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Staff <span className="text-accent">Portal</span></h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 font-medium"><ShieldAlert className="w-4 h-4 text-accent" /> Authorized: {profile?.firstName} ({profile?.role})</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-destructive/20 text-destructive font-bold h-12 rounded-xl bg-white finance-3d-shadow hover:bg-destructive hover:text-white transition-all">
            <LogOut className="w-4 h-4 mr-2" /> End Session
          </Button>
        </div>

        <Tabs defaultValue="web-edit" className="w-full">
          <TabsList className="grid grid-cols-1 h-auto gap-4 bg-transparent p-0 mb-12">
            <TabsTrigger value="web-edit" className="data-[state=active]:bg-primary data-[state=active]:text-white h-16 rounded-3xl finance-3d-shadow border-none font-bold text-xl flex gap-3">
              <Globe className="w-6 h-6" /> Website Content Manager (Web Edit)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="web-edit" className="space-y-12">
            <Tabs defaultValue="videos" className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-2 bg-slate-100 p-2 rounded-[2rem] mb-10 overflow-x-auto shadow-inner">
                <TabsTrigger value="videos" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Showcase Videos</TabsTrigger>
                <TabsTrigger value="courses" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Academic Courses</TabsTrigger>
                <TabsTrigger value="team" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Leadership Team</TabsTrigger>
                <TabsTrigger value="testimonials" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Testimonials</TabsTrigger>
                <TabsTrigger value="assets" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Slides & Gallery</TabsTrigger>
                <TabsTrigger value="branding" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Global Branding</TabsTrigger>
              </TabsList>

              {/* Progress Bar for all uploads */}
              {uploadProgress !== null && (
                <Card className="mb-10 p-6 border-none finance-3d-shadow bg-primary text-white animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> Processing Cloud Upload...</span>
                    <span className="font-headline font-bold">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-3 bg-white/20" />
                </Card>
              )}

              <TabsContent value="videos">
                <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-primary text-white p-10"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Video className="w-6 h-6" /> Success Stories Video Manager</CardTitle></CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <form onSubmit={handleSaveVideo} className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="space-y-2"><Label>Video Caption/Title</Label><Input value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="rounded-xl h-12" placeholder="e.g. Student Leadership Workshop" /></div>
                        <div className="space-y-2"><Label>Display Sequence Order</Label><Input type="number" value={newVideo.order} onChange={e => setNewVideo({...newVideo, order: parseInt(e.target.value) || 0})} className="rounded-xl h-12" /></div>
                        <Button type="button" variant="outline" className="w-full rounded-xl border-dashed h-14 bg-slate-50" onClick={() => videoFileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" /> {selectedFiles['video'] ? 'Change Selected File' : 'Select Video (max 30MB)'}
                        </Button>
                        <input type="file" ref={videoFileInputRef} onChange={e => handleFileChange(e, 'video')} accept="video/*" className="hidden" />
                        <Button type="submit" className="w-full h-14 rounded-xl shadow-lg font-bold text-lg" disabled={uploadProgress !== null || !selectedFiles['video']}>
                          {uploadProgress !== null ? 'Uploading Media...' : 'Add Video to Showcase'}
                        </Button>
                      </div>
                      <div className="border-4 border-slate-50 rounded-[2rem] overflow-hidden bg-slate-900 finance-3d-shadow-inner flex items-center justify-center relative aspect-video">
                        {newVideo.videoUrl ? <video key={newVideo.videoUrl} src={newVideo.videoUrl} className="w-full h-full object-cover" controls /> : <div className="text-white/20 flex flex-col items-center gap-2"><Play className="w-12 h-12 opacity-20" /><p className="text-sm font-bold">New Video Preview</p></div>}
                      </div>
                    </form>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t">
                      {videoGallery?.map(v => (
                        <div key={v.id} className="p-4 bg-slate-50 rounded-2xl relative group border">
                          <p className="font-bold text-[10px] truncate mb-2">{v.title || 'Untitled Showcase'}</p>
                          <div className="aspect-video rounded-lg overflow-hidden bg-black mb-3"><video src={v.videoUrl} className="w-full h-full object-cover" /></div>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            className="w-full rounded-lg relative z-30 font-bold" 
                            onClick={() => setItemToDelete({ path: 'videos', id: v.id })}
                          >
                            <Trash2 className="w-3 h-3 mr-2" /> Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses">
                <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-primary text-white p-10"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><BookOpen className="w-6 h-6" /> {editingCourseId ? 'Modify' : 'Launch New'} Academic Program</CardTitle></CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <form onSubmit={handleSaveCourse} className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Title</Label><Input value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="rounded-xl h-12" required /></div>
                          <div className="space-y-2"><Label>Subtitle</Label><Input value={courseForm.subtitle} onChange={e => setCourseForm({...courseForm, subtitle: e.target.value})} className="rounded-xl h-12" /></div>
                        </div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} className="rounded-xl min-h-[100px]" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={courseForm.category} onValueChange={v => setCourseForm({...courseForm, category: v})}>
                              <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Foundational">Foundational</SelectItem><SelectItem value="Leadership">Leadership</SelectItem><SelectItem value="Premium">Premium</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2"><Label>Lesson Count</Label><Input value={courseForm.lessons} onChange={e => setCourseForm({...courseForm, lessons: e.target.value})} className="rounded-xl h-12" /></div>
                        </div>
                        <div className="space-y-2"><Label>Highlights (Separate by commas)</Label><Input value={courseForm.highlights} onChange={e => setCourseForm({...courseForm, highlights: e.target.value})} className="rounded-xl h-12" placeholder="Topic 1, Topic 2, etc." /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Rating</Label><Input type="number" step="0.1" value={courseForm.rating} onChange={e => setCourseForm({...courseForm, rating: parseFloat(e.target.value) || 0})} className="rounded-xl h-12" /></div>
                          <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={courseForm.order} onChange={e => setCourseForm({...courseForm, order: parseInt(e.target.value) || 0})} className="rounded-xl h-12" /></div>
                        </div>
                        <Button type="button" variant="outline" className="w-full rounded-xl border-dashed h-12" onClick={() => courseFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> {selectedFiles['course'] ? 'Change Banner' : 'Upload Course Cover'}</Button>
                        <input type="file" ref={courseFileInputRef} onChange={e => handleFileChange(e, 'course')} accept="image/*" className="hidden" />
                        <div className="flex gap-4">
                          <Button type="submit" className="flex-1 h-14 rounded-xl font-bold text-lg" disabled={uploadProgress !== null}>{(editingCourseId ? 'Apply Changes' : 'Publish Course')}</Button>
                          {editingCourseId && <Button type="button" variant="ghost" className="h-14 w-14 p-0 rounded-xl bg-slate-100" onClick={() => {setEditingCourseId(null); setCourseForm({id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0})}}><XCircle className="w-6 h-6 text-slate-400" /></Button>}
                        </div>
                      </div>
                      <div className="border-4 border-slate-50 rounded-[2rem] overflow-hidden bg-slate-50 finance-3d-shadow-inner relative aspect-video">
                        {courseForm.imageUrl && <Image src={courseForm.imageUrl} alt="p" fill className="object-cover" />}
                      </div>
                    </form>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t">
                      {courses?.map(c => (
                        <div key={c.id} className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-3 group border relative">
                          <p className="font-bold text-xs truncate">{c.title}</p>
                          <div className="flex gap-2 relative z-30">
                            <Button type="button" variant="outline" size="sm" className="h-10 rounded-lg flex-1 font-bold" onClick={() => {setEditingCourseId(c.id); setCourseForm({...c, highlights: (c.highlights || []).join(', ')})}}><Edit2 className="w-4 h-4 mr-2" /> Edit</Button>
                            <Button type="button" variant="destructive" size="sm" className="h-10 w-10 p-0 rounded-lg" onClick={() => setItemToDelete({ path: 'courses', id: c.id })}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-accent text-primary p-10"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Users className="w-6 h-6" /> {editingMemberId ? 'Update' : 'Appoint'} Leadership Member</CardTitle></CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <form onSubmit={handleSaveTeam} className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="space-y-2"><Label>Full Name</Label><Input value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="rounded-xl h-12" required /></div>
                        <div className="space-y-2"><Label>Official Title / Role</Label><Input value={teamForm.role} onChange={e => setTeamForm({...teamForm, role: e.target.value})} className="rounded-xl h-12" required /></div>
                        <div className="space-y-2"><Label>Professional Profile (Bio)</Label><Textarea value={teamForm.bio} onChange={e => setTeamForm({...teamForm, bio: e.target.value})} className="rounded-xl h-24" /></div>
                        <div className="grid grid-cols-2 gap-6 items-center">
                          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border"><Switch checked={teamForm.isFounder} onCheckedChange={v => setTeamForm({...teamForm, isFounder: v})} /><Label className="font-bold">Founder Badge</Label></div>
                          <div className="space-y-2"><Label>Directory Order</Label><Input type="number" value={teamForm.order} onChange={e => setTeamForm({...teamForm, order: parseInt(e.target.value) || 0})} className="rounded-xl h-12" /></div>
                        </div>
                        <Button type="button" variant="outline" className="w-full rounded-xl h-12 border-dashed" onClick={() => teamFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> {selectedFiles['team'] ? 'Change Portrait' : 'Upload Portrait'}</Button>
                        <input type="file" ref={teamFileInputRef} onChange={e => handleFileChange(e, 'team')} accept="image/*" className="hidden" />
                        <div className="flex gap-4">
                          <Button type="submit" className="flex-1 h-14 rounded-xl font-bold text-lg" disabled={uploadProgress !== null}>{(editingMemberId ? 'Save Changes' : 'Add to Faculty')}</Button>
                          {editingMemberId && <Button type="button" variant="ghost" className="h-14 w-14 p-0 rounded-xl bg-slate-100" onClick={() => {setEditingMemberId(null); setTeamForm({id: '', name: '', role: '', bio: '', imageUrl: '', isFounder: false, order: 0})}}><XCircle className="w-6 h-6 text-slate-400" /></Button>}
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center p-10 border-4 border-slate-50 rounded-[2.5rem] bg-slate-50 finance-3d-shadow-inner">
                        <div className="relative w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-white">
                          {teamForm.imageUrl ? <Image src={teamForm.imageUrl} alt="m" fill className="object-cover" /> : <UserSquare className="w-full h-full text-slate-100 p-8" />}
                        </div>
                        <p className="mt-6 font-headline font-bold text-2xl text-primary">{teamForm.name || 'Full Name'}</p>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">{teamForm.role || 'Designation'}</p>
                      </div>
                    </form>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t">
                      {teamMembers?.map(m => (
                        <div key={m.id} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center text-center gap-2 group border relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden relative border-2 border-white shadow-md mb-2"><Image src={m.imageUrl || `https://picsum.photos/seed/${m.id}/100/100`} alt="m" fill className="object-cover" /></div>
                          <p className="text-xs font-bold truncate w-full">{m.name}</p>
                          <div className="flex gap-2 w-full relative z-30">
                            <Button type="button" variant="outline" size="sm" className="h-9 flex-1 rounded-lg" onClick={() => {setEditingMemberId(m.id); setTeamForm({...m})}}><Edit2 className="w-3 h-3" /></Button>
                            <Button type="button" variant="destructive" size="sm" className="h-9 w-9 p-0 rounded-lg" onClick={() => setItemToDelete({ path: 'team', id: m.id })}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="testimonials">
                <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-primary text-white p-10"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><MessageSquare className="w-6 h-6" /> Testimonials Manager</CardTitle></CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <form onSubmit={handleSaveReview} className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="space-y-2"><Label>Student/Parent Identity</Label><Input value={newReview.userName} onChange={e => setNewReview({...newReview, userName: e.target.value})} className="rounded-xl h-12" required /></div>
                        <div className="space-y-2"><Label>Shared Feedback</Label><Textarea value={newReview.content} onChange={e => setNewReview({...newReview, content: e.target.value})} className="rounded-xl min-h-[120px]" required /></div>
                        <div className="space-y-2"><Label>Satisfaction Rating (1-5)</Label><Input type="number" min="1" max="5" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value) || 0})} className="rounded-xl h-12" /></div>
                        <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-dashed" onClick={() => reviewFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> {selectedFiles['review'] ? 'Change Portrait' : 'Upload Portrait'}</Button>
                        <input type="file" ref={reviewFileInputRef} onChange={e => handleFileChange(e, 'review')} accept="image/*" className="hidden" />
                        <Button type="submit" className="w-full h-14 font-bold text-lg rounded-xl shadow-lg" disabled={uploadProgress !== null}>Save Testimonial</Button>
                      </div>
                      <div className="flex flex-col items-center justify-center p-10 border-4 border-slate-50 rounded-[2.5rem] bg-slate-50 finance-3d-shadow-inner">
                        <div className="flex items-center gap-6 mb-6">
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                            {newReview.userPhoto ? <Image src={newReview.userPhoto} alt="r" fill className="object-cover" /> : <UserSquare className="w-full h-full text-slate-100 p-4" />}
                          </div>
                          <div>
                            <p className="font-headline font-bold text-2xl text-primary">{newReview.userName || 'Person Name'}</p>
                            <div className="flex gap-1 mt-1">
                              {[...Array(isNaN(newReview.rating) ? 0 : Math.max(0, Math.min(5, newReview.rating)))].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic text-center max-w-[300px]">"{newReview.content || 'Testimonial content will appear here...'}"</p>
                      </div>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t">
                      {reviews?.map(r => (
                        <div key={r.id} className="p-6 bg-slate-50 rounded-[2rem] flex flex-col gap-4 border relative">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden relative border shadow-sm"><Image src={r.userPhoto || `https://picsum.photos/seed/${r.id}/100/100`} alt="r" fill className="object-cover" /></div>
                            <p className="text-[10px] font-bold truncate flex-1">{r.userName}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-3 italic">"{r.content}"</p>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            className="w-full rounded-xl relative z-30 font-bold" 
                            onClick={() => setItemToDelete({ path: 'reviews', id: r.id })}
                          >
                            <Trash2 className="w-3 h-3 mr-2" /> Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assets">
                <div className="grid md:grid-cols-2 gap-12">
                  <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-primary text-white p-8"><CardTitle className="flex items-center gap-3"><ImageIcon className="w-5 h-5" /> Homepage Slides</CardTitle></CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <form onSubmit={handleSaveSlide} className="space-y-4">
                        <Input placeholder="Heading Title" value={newSlide.title} onChange={e => setNewSlide({...newSlide, title: e.target.value})} className="rounded-xl h-12" required />
                        <Input placeholder="Description (Optional)" value={newSlide.description} onChange={e => setNewSlide({...newSlide, description: e.target.value})} className="rounded-xl h-12" />
                        <Input type="number" placeholder="Sequence (Order)" value={newSlide.order} onChange={e => setNewSlide({...newSlide, order: parseInt(e.target.value) || 0})} className="rounded-xl h-12" />
                        <Button type="button" variant="outline" className="w-full h-12 border-dashed" onClick={() => slideFileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" /> {selectedFiles['slide'] ? 'Change Slide Image' : 'Pick Slide Image'}
                        </Button>
                        <input type="file" ref={slideFileInputRef} onChange={e => handleFileChange(e, 'slide')} accept="image/*" className="hidden" />
                        <Button type="submit" className="w-full h-14 font-bold rounded-xl" disabled={uploadProgress !== null || (!selectedFiles['slide'] && !newSlide.imageUrl)}>
                          <PlusCircle className="w-4 h-4 mr-2" /> Add to Carousel
                        </Button>
                      </form>
                      <div className="grid grid-cols-3 gap-3 pt-6 border-t">
                        {slides?.map(s => (
                          <div key={s.id} className="relative aspect-video rounded-xl overflow-hidden group border shadow-sm">
                            <Image src={s.imageUrl} alt="s" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8 z-30 shadow-lg" 
                                onClick={() => setItemToDelete({ path: 'slides', id: s.id })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-accent text-primary p-8"><CardTitle className="flex items-center gap-3"><Layout className="w-5 h-5" /> Campus Memory Gallery</CardTitle></CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <form onSubmit={handleSaveGallery} className="space-y-4">
                        <Input placeholder="Short Narrative" value={newGalleryImg.description} onChange={e => setNewGalleryImg({...newGalleryImg, description: e.target.value})} className="rounded-xl h-12" />
                        <Button type="button" variant="outline" className="w-full h-12 border-dashed" onClick={() => galleryFileInputRef.current?.click()}>{selectedFiles['gallery'] ? 'Change Gallery Image' : 'Pick Gallery Image'}</Button>
                        <input type="file" ref={galleryFileInputRef} onChange={e => handleFileChange(e, 'gallery')} accept="image/*" className="hidden" />
                        <Button type="submit" className="w-full h-14 font-bold rounded-xl" disabled={uploadProgress !== null || (!selectedFiles['gallery'] && !newGalleryImg.imageUrl)}>Publish to Gallery</Button>
                      </form>
                      <div className="grid grid-cols-3 gap-3 pt-6 border-t">
                        {galleryItems?.map(g => (
                          <div key={g.id} className="relative aspect-square rounded-xl overflow-hidden group border shadow-sm">
                            <Image src={g.imageUrl} alt="g" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8 z-30 shadow-lg" 
                                onClick={() => setItemToDelete({ path: 'gallery', id: g.id })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="branding">
                <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white p-10"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Settings className="w-6 h-6" /> Platform-Wide Branding</CardTitle></CardHeader>
                  <CardContent className="p-10">
                    <form onSubmit={handleSaveBranding} className="max-w-2xl space-y-6">
                      <div className="space-y-2"><Label>Institutional Name (Global)</Label><Input value={brandingForm.appName} onChange={e => setBrandingForm({...brandingForm, appName: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label>Core Tagline / Mission Motto</Label><Input value={brandingForm.tagline} onChange={e => setBrandingForm({...brandingForm, tagline: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label>Branding Logo URL (PNG/SVG preferred)</Label><Input value={brandingForm.logoUrl} onChange={e => setBrandingForm({...brandingForm, logoUrl: e.target.value})} className="rounded-xl h-12" /></div>
                      <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg bg-slate-900 text-white">Save Institutional Profile</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-headline font-bold">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-lg">
                This action cannot be undone. This will permanently delete the selected item from our database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-4">
              <AlertDialogCancel className="rounded-xl h-12 font-bold">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="rounded-xl h-12 font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <Footer />
    </div>
  );
}
