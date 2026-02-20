
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
  deleteDocumentNonBlocking 
} from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { LogOut, ShieldAlert, Users, Trash2, Upload, BookOpen, XCircle, UserSquare, Star, Video, Play, AlertCircle } from 'lucide-react';
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

  // --- STATES ---
  const [courseForm, setCourseForm] = useState({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [teamForm, setTeamForm] = useState({ id: '', name: '', role: '', bio: '', imageUrl: '', isFounder: false, order: 0 });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [newSlide, setNewSlide] = useState({ title: '', description: '', imageUrl: '', order: 0 });
  const [newGalleryImg, setNewGalleryImg] = useState({ description: '', imageUrl: '' });
  const [newReview, setNewReview] = useState({ userName: '', userPhoto: '', content: '', rating: 5 });
  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', order: 0 });
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'slide' | 'gallery' | 'course' | 'team' | 'review' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'video') {
        if (file.size > 30 * 1024 * 1024) {
          toast({ variant: "destructive", title: "File Too Large", description: "Videos are limited to 30MB." });
          return;
        }
        setVideoFile(file);
        setNewVideo({ ...newVideo, videoUrl: URL.createObjectURL(file) });
        return;
      }

      if (file.size > 700 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Images must be smaller than 700KB." });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'slide') setNewSlide({ ...newSlide, imageUrl: base64 });
        else if (type === 'gallery') setNewGalleryImg({ ...newGalleryImg, imageUrl: base64 });
        else if (type === 'course') setCourseForm({ ...courseForm, imageUrl: base64 });
        else if (type === 'team') setTeamForm({ ...teamForm, imageUrl: base64 });
        else if (type === 'review') setNewReview({ ...newReview, userPhoto: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const highlightsArray = courseForm.highlights ? courseForm.highlights.split(',').map(h => h.trim()).filter(h => h !== '') : [];
    const data = { 
      title: courseForm.title,
      subtitle: courseForm.subtitle,
      description: courseForm.description,
      imageUrl: courseForm.imageUrl,
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
      toast({ title: "Course Update Initiated" });
    } else {
      const colRef = collection(db, 'courses');
      addDocumentNonBlocking(colRef, { ...data, createdAt: serverTimestamp() });
      toast({ title: "Course Creation Initiated" });
    }
    setCourseForm({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
    setEditingCourseId(null);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: teamForm.name,
      role: teamForm.role,
      bio: teamForm.bio,
      imageUrl: teamForm.imageUrl,
      isFounder: teamForm.isFounder,
      order: Number(teamForm.order)
    };

    if (editingMemberId) {
      const docRef = doc(db, 'team', editingMemberId);
      updateDocumentNonBlocking(docRef, data);
      toast({ title: "Member Update Initiated" });
    } else {
      const colRef = collection(db, 'team');
      addDocumentNonBlocking(colRef, { ...data, createdAt: serverTimestamp() });
      toast({ title: "Member Creation Initiated" });
    }
    setTeamForm({ id: '', name: '', role: '', bio: '', imageUrl: '', isFounder: false, order: 0 });
    setEditingMemberId(null);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.imageUrl) return toast({ variant: "destructive", title: "Required", description: "Image is required." });
    
    const colRef = collection(db, 'slides');
    const data = { ...newSlide, order: Number(newSlide.order), createdAt: serverTimestamp() };
    addDocumentNonBlocking(colRef, data);
    toast({ title: "Slide Addition Initiated" });
    setNewSlide({ title: '', description: '', imageUrl: '', order: 0 });
  };

  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryImg.imageUrl) return toast({ variant: "destructive", title: "Required", description: "Image is required." });
    
    const colRef = collection(db, 'gallery');
    const data = { ...newGalleryImg, createdAt: serverTimestamp() };
    addDocumentNonBlocking(colRef, data);
    toast({ title: "Memory Addition Initiated" });
    setNewGalleryImg({ description: '', imageUrl: '' });
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const colRef = collection(db, 'reviews');
    const data = { ...newReview, createdAt: serverTimestamp() };
    addDocumentNonBlocking(colRef, data);
    toast({ title: "Review Addition Initiated" });
    setNewReview({ userName: '', userPhoto: '', content: '', rating: 5 });
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return toast({ variant: "destructive", title: "Required", description: "Video file is required." });
    
    setUploadProgress(0);
    const storageRef = ref(storage, `videos/${Date.now()}_${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        toast({ variant: "destructive", title: "Upload Failed", description: error.message });
        setUploadProgress(null);
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const data = { 
            title: newVideo.title, 
            videoUrl: downloadURL, 
            order: Number(newVideo.order), 
            createdAt: serverTimestamp() 
          };
          const colRef = collection(db, 'videos');
          addDocumentNonBlocking(colRef, data);
          
          setUploadProgress(null);
          setVideoFile(null);
          setNewVideo({ title: '', videoUrl: '', order: 0 });
          toast({ title: "Video Publication Initiated" });
        });
      }
    );
  };

  const handleDeleteDoc = (path: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    const docRef = doc(db, path, id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Delete Requested" });
  };

  if (isUserLoading || isProfileLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pb-24 px-6 max-w-6xl mx-auto w-full pt-16">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Staff <span className="text-accent">Portal</span></h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-accent" /> Authenticated as {profile?.role}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-destructive/20 text-destructive font-bold h-12 rounded-xl"><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
        </div>

        <div className="grid gap-12">
          {/* VIDEO MANAGEMENT */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary text-white p-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><Video className="w-6 h-6" /></div>
                <CardTitle className="text-2xl font-headline font-bold">Video Gallery Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 flex items-start gap-3 text-sm text-slate-600">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p><strong>Capacity:</strong> Videos up to 30MB are supported via Firebase Storage. For optimal playback, use compressed MP4 files.</p>
              </div>
              
              <form onSubmit={handleSaveVideo} className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Video Title</Label><Input value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="rounded-xl" placeholder="e.g. Student Success Story" /></div>
                  <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={newVideo.order} onChange={e => setNewVideo({...newVideo, order: parseInt(e.target.value) || 0})} className="rounded-xl" /></div>
                  
                  <div className="space-y-4 pt-2">
                    <Button type="button" variant="outline" className="w-full rounded-xl border-dashed h-14" onClick={() => videoFileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" /> {videoFile ? 'Change Video' : 'Select Video (max 30MB)'}
                    </Button>
                    <input type="file" ref={videoFileInputRef} onChange={e => handleFileChange(e, 'video')} accept="video/*" className="hidden" />
                    
                    {uploadProgress !== null && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-primary">
                          <span>Uploading...</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    <Button type="submit" className="w-full h-14 rounded-xl shadow-lg" disabled={uploadProgress !== null}>
                      {uploadProgress !== null ? 'Uploading to Cloud...' : 'Publish Video'}
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-[2rem] overflow-hidden bg-slate-900 finance-3d-shadow-inner flex items-center justify-center relative aspect-video">
                  {newVideo.videoUrl ? (
                    <video key={newVideo.videoUrl} src={newVideo.videoUrl} className="w-full h-full object-cover" controls />
                  ) : (
                    <div className="text-white/20 flex flex-col items-center gap-2">
                      <Play className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-bold">Video Preview</p>
                    </div>
                  )}
                  {uploadProgress !== null && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                       <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                       <p className="font-bold">Syncing High-Quality Video</p>
                       <p className="text-xs opacity-60">This may take a minute for larger files</p>
                    </div>
                  )}
                </div>
              </form>

              <div className="grid md:grid-cols-4 gap-4 mt-10">
                {videoGallery?.map(v => (
                  <div key={v.id} className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-2 group relative">
                    <p className="font-bold text-xs truncate pr-6">{v.title || 'Untitled'}</p>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2">
                       <video src={v.videoUrl} className="w-full h-full object-cover" />
                    </div>
                    <Button variant="destructive" size="sm" className="h-8 w-full rounded-lg" onClick={() => handleDeleteDoc('videos', v.id)}><Trash2 className="w-3 h-3 mr-2" /> Remove</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* COURSE EDITOR */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary text-white p-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><BookOpen className="w-6 h-6" /></div>
                <CardTitle className="text-2xl font-headline font-bold">{editingCourseId ? 'Edit' : 'Add New'} Course</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSaveCourse} className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Title</Label><Input value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="rounded-xl" required /></div>
                    <div className="space-y-2"><Label>Subtitle</Label><Input value={courseForm.subtitle} onChange={e => setCourseForm({...courseForm, subtitle: e.target.value})} className="rounded-xl" /></div>
                  </div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} className="rounded-xl min-h-[100px]" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={courseForm.category} onValueChange={v => setCourseForm({...courseForm, category: v})}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Foundational">Foundational</SelectItem><SelectItem value="Leadership">Leadership</SelectItem><SelectItem value="Premium">Premium</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Lessons Count</Label><Input value={courseForm.lessons} onChange={e => setCourseForm({...courseForm, lessons: e.target.value})} className="rounded-xl" /></div>
                  </div>
                  <div className="space-y-2"><Label>Highlights (Comma separated)</Label><Input value={courseForm.highlights} onChange={e => setCourseForm({...courseForm, highlights: e.target.value})} className="rounded-xl" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Rating</Label><Input type="number" step="0.1" value={courseForm.rating} onChange={e => setCourseForm({...courseForm, rating: parseFloat(e.target.value) || 0})} className="rounded-xl" /></div>
                    <div className="space-y-2"><Label>Order</Label><Input type="number" value={courseForm.order} onChange={e => setCourseForm({...courseForm, order: parseInt(e.target.value) || 0})} className="rounded-xl" /></div>
                  </div>
                  <Button type="button" variant="outline" className="w-full rounded-xl border-dashed" onClick={() => courseFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> {courseForm.imageUrl ? 'Change Image' : 'Upload Image'}</Button>
                  <input type="file" id="courseImg" ref={courseFileInputRef} onChange={e => handleFileChange(e, 'course')} accept="image/*" className="hidden" />
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 h-12 rounded-xl">{(editingCourseId ? 'Update' : 'Publish')}</Button>
                    {editingCourseId && <Button type="button" variant="ghost" onClick={() => {setEditingCourseId(null); setCourseForm({id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0})}}><XCircle className="w-4 h-4" /></Button>}
                  </div>
                </div>
                <div className="border rounded-[2rem] overflow-hidden bg-slate-50 finance-3d-shadow-inner relative aspect-video">
                  {courseForm.imageUrl && <Image src={courseForm.imageUrl} alt="p" fill className="object-cover" />}
                </div>
              </form>
              <div className="grid md:grid-cols-4 gap-4 mt-10">
                {courses?.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-2">
                    <p className="font-bold text-xs truncate">{c.title}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg flex-1" onClick={() => {setEditingCourseId(c.id); setCourseForm({...c, highlights: (c.highlights || []).join(', ')})}}><Edit2 className="w-3 h-3" /></Button>
                      <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteDoc('courses', c.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* TEAM MANAGEMENT */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-accent text-primary p-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl"><Users className="w-6 h-6" /></div>
                <CardTitle className="text-2xl font-headline font-bold">{editingMemberId ? 'Edit' : 'Add New'} Team Member</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSaveTeam} className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="rounded-xl" required /></div>
                  <div className="space-y-2"><Label>Role</Label><Input value={teamForm.role} onChange={e => setTeamForm({...teamForm, role: e.target.value})} className="rounded-xl" required /></div>
                  <div className="space-y-2"><Label>Short Bio</Label><Textarea value={teamForm.bio} onChange={e => setTeamForm({...teamForm, bio: e.target.value})} className="rounded-xl" /></div>
                  <div className="grid grid-cols-2 gap-6 items-center">
                    <div className="flex items-center space-x-2"><Switch checked={teamForm.isFounder} onCheckedChange={v => setTeamForm({...teamForm, isFounder: v})} /><Label>Founder Role</Label></div>
                    <div className="space-y-2"><Label>Order</Label><Input type="number" value={teamForm.order} onChange={e => setTeamForm({...teamForm, order: parseInt(e.target.value) || 0})} className="rounded-xl" /></div>
                  </div>
                  <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => teamFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Upload Portrait</Button>
                  <input type="file" id="teamImg" ref={teamFileInputRef} onChange={e => handleFileChange(e, 'team')} accept="image/*" className="hidden" />
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 h-12 rounded-xl">{(editingMemberId ? 'Update' : 'Add Member')}</Button>
                    {editingMemberId && <Button type="button" variant="ghost" onClick={() => {setEditingMemberId(null); setTeamForm({id: '', name: '', role: '', bio: '', imageUrl: '', isFounder: false, order: 0})}}><XCircle className="w-4 h-4" /></Button>}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-6 border rounded-[2rem] bg-slate-50 finance-3d-shadow-inner">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    {teamForm.imageUrl ? <Image src={teamForm.imageUrl} alt="m" fill className="object-cover" /> : <UserSquare className="w-full h-full text-slate-200" />}
                  </div>
                  <p className="mt-4 font-bold text-primary">{teamForm.name || 'Member Name'}</p>
                  <p className="text-sm text-muted-foreground">{teamForm.role || 'Position'}</p>
                </div>
              </form>
              <div className="grid md:grid-cols-4 gap-4 mt-10">
                {teamMembers?.map(m => (
                  <div key={m.id} className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative border shadow-sm"><Image src={m.imageUrl || `https://picsum.photos/seed/${m.id}/100/100`} alt="m" fill className="object-cover" /></div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold truncate">{m.name}</p>
                      <div className="flex gap-1 mt-1">
                        <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => {setEditingMemberId(m.id); setTeamForm({...m})}}><Edit2 className="w-2 h-2" /></Button>
                        <Button variant="destructive" size="sm" className="h-6 w-6 p-0" onClick={() => handleDeleteDoc('team', m.id)}><Trash2 className="w-2 h-2" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ASSETS */}
          <div className="grid md:grid-cols-2 gap-12">
             <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-primary text-white p-8"><CardTitle>Homepage Slides</CardTitle></CardHeader>
                <CardContent className="p-8 space-y-4">
                  <form onSubmit={handleSaveSlide} className="space-y-4">
                    <Input placeholder="Title" value={newSlide.title} onChange={e => setNewSlide({...newSlide, title: e.target.value})} className="rounded-xl" />
                    <Input type="number" placeholder="Order" value={newSlide.order} onChange={e => setNewSlide({...newSlide, order: parseInt(e.target.value) || 0})} className="rounded-xl" />
                    <Button type="button" variant="outline" className="w-full" onClick={() => slideFileInputRef.current?.click()}>Select Slide</Button>
                    <input type="file" id="slideImg" ref={slideFileInputRef} onChange={e => handleFileChange(e, 'slide')} accept="image/*" className="hidden" />
                    <Button type="submit" className="w-full h-12">Add Slide</Button>
                  </form>
                  <div className="grid grid-cols-3 gap-2">
                    {slides?.map(s => <div key={s.id} className="relative aspect-video rounded-lg overflow-hidden group"><Image src={s.imageUrl} alt="s" fill className="object-cover" /><Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteDoc('slides', s.id)}><Trash2 className="w-3 h-3" /></Button></div>)}
                  </div>
                </CardContent>
             </Card>
             <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-accent text-primary p-8"><CardTitle>Memory Gallery</CardTitle></CardHeader>
                <CardContent className="p-8 space-y-4">
                  <form onSubmit={handleSaveGallery} className="space-y-4">
                    <Input placeholder="Description" value={newGalleryImg.description} onChange={e => setNewGalleryImg({...newGalleryImg, description: e.target.value})} className="rounded-xl" />
                    <Button type="button" variant="outline" className="w-full" onClick={() => galleryFileInputRef.current?.click()}>Select Memory</Button>
                    <input type="file" id="galImg" ref={galleryFileInputRef} onChange={e => handleFileChange(e, 'gallery')} accept="image/*" className="hidden" />
                    <Button type="submit" className="w-full h-12">Add Memory</Button>
                  </form>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryItems?.map(g => <div key={g.id} className="relative aspect-square rounded-lg overflow-hidden group"><Image src={g.imageUrl} alt="g" fill className="object-cover" /><Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteDoc('gallery', g.id)}><Trash2 className="w-3 h-3" /></Button></div>)}
                  </div>
                </CardContent>
             </Card>
          </div>

          {/* ADD REVIEW FORM */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary text-white p-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><Star className="w-6 h-6" /></div>
                <CardTitle className="text-2xl font-headline font-bold">Add Student Review</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSaveReview} className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Student Name</Label><Input value={newReview.userName} onChange={e => setNewReview({...newReview, userName: e.target.value})} className="rounded-xl" required /></div>
                  <div className="space-y-2"><Label>Feedback Content</Label><Textarea value={newReview.content} onChange={e => setNewReview({...newReview, content: e.target.value})} className="rounded-xl min-h-[100px]" required /></div>
                  <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value) || 0})} className="rounded-xl" /></div>
                  <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => reviewFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Upload Photo</Button>
                  <input type="file" id="revImg" ref={reviewFileInputRef} onChange={e => handleFileChange(e, 'review')} accept="image/*" className="hidden" />
                  <Button type="submit" className="w-full h-12 rounded-xl">Save Review</Button>
                </div>
                <div className="flex flex-col items-center justify-center p-6 border rounded-[2rem] bg-slate-50 finance-3d-shadow-inner">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-white">
                        {newReview.userPhoto ? <Image src={newReview.userPhoto} alt="r" fill className="object-cover" /> : <UserSquare className="w-full h-full text-slate-200" />}
                      </div>
                      <div>
                         <p className="font-bold text-primary">{newReview.userName || 'Student Name'}</p>
                         <div className="flex gap-1">
                           {[...Array(isNaN(newReview.rating) ? 0 : Math.max(0, Math.min(5, newReview.rating)))].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                         </div>
                      </div>
                   </div>
                   <p className="text-xs text-muted-foreground italic text-center max-w-[200px]">"{newReview.content || 'Great workshop, learned a lot about money management!'}"</p>
                </div>
              </form>
              <div className="grid md:grid-cols-4 gap-4 mt-10">
                {reviews?.map(r => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-2">
                    <p className="text-xs font-bold truncate flex-1">{r.userName}</p>
                    <Button variant="destructive" size="sm" className="h-6 w-6 p-0" onClick={() => handleDeleteDoc('reviews', r.id)}><Trash2 className="w-2 h-2" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
