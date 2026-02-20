
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { doc, updateDoc, collection, addDoc, deleteDoc, query, orderBy, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { LogOut, ShieldAlert, UserPlus, Users, Briefcase, Trash2, Upload, Eye, Image as ImageIcon, Camera, BookOpen, Star, Plus, Edit2, Check, Tag, ExternalLink, MessageSquare, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const slideFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const courseFileInputRef = useRef<HTMLInputElement>(null);
  const reviewFileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile Fetching
  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Authorization flag
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

  // Data Queries (Management Level)
  const slidesQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'slides'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: slides } = useCollection(slidesQuery);

  const galleryQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'gallery'), orderBy('createdAt', 'desc')) : null, [db, isAuthorized]);
  const { data: galleryItems } = useCollection(galleryQuery);

  const coursesQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'courses'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: courses } = useCollection(coursesQuery);

  const reviewsQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'reviews'), orderBy('createdAt', 'desc')) : null, [db, isAuthorized]);
  const { data: reviews } = useCollection(reviewsQuery);

  // --- STATES ---
  const [newReview, setNewReview] = useState({ userName: '', content: '', rating: 5, userPhoto: '' });
  const [reviewPreview, setReviewPreview] = useState<string | null>(null);
  const [isReviewProcessing, setIsReviewProcessing] = useState(false);

  const [newSlide, setNewSlide] = useState({ title: '', description: '', imageUrl: '', order: 0 });
  const [slidePreview, setSlidePreview] = useState<string | null>(null);
  const [isSlideProcessing, setIsSlideProcessing] = useState(false);

  const [newGalleryImg, setNewGalleryImg] = useState({ description: '', imageUrl: '' });
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);
  const [isGalleryProcessing, setIsGalleryProcessing] = useState(false);

  const [courseForm, setCourseForm] = useState({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
  const [coursePreview, setCoursePreview] = useState<string | null>(null);
  const [isCourseProcessing, setIsCourseProcessing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'slide' | 'gallery' | 'course' | 'review') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'slide') { setSlidePreview(base64); setNewSlide({ ...newSlide, imageUrl: base64 }); }
        else if (type === 'gallery') { setGalleryPreview(base64); setNewGalleryImg({ ...newGalleryImg, imageUrl: base64 }); }
        else if (type === 'course') { setCoursePreview(base64); setCourseForm({ ...courseForm, imageUrl: base64 }); }
        else if (type === 'review') { setReviewPreview(base64); setNewReview({ ...newReview, userPhoto: base64 }); }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ACTIONS ---

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.imageUrl) return toast({ variant: "destructive", title: "Required", description: "Image is required." });
    setIsSlideProcessing(true);
    try {
      await addDoc(collection(db, 'slides'), { ...newSlide, order: Number(newSlide.order), createdAt: serverTimestamp() });
      toast({ title: "Slide Added" });
      setNewSlide({ title: '', description: '', imageUrl: '', order: 0 });
      setSlidePreview(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally { setIsSlideProcessing(false); }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryImg.imageUrl) return toast({ variant: "destructive", title: "Required", description: "Image is required." });
    setIsGalleryProcessing(true);
    try {
      await addDoc(collection(db, 'gallery'), { ...newGalleryImg, createdAt: serverTimestamp() });
      toast({ title: "Memory Added" });
      setNewGalleryImg({ description: '', imageUrl: '' });
      setGalleryPreview(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally { setIsGalleryProcessing(false); }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewProcessing(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...newReview,
        createdAt: serverTimestamp(),
        approved: true
      });
      toast({ title: "Review Published" });
      setNewReview({ userName: '', content: '', rating: 5, userPhoto: '' });
      setReviewPreview(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally { setIsReviewProcessing(false); }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourseId(course.id);
    setCourseForm({
      id: course.id,
      title: course.title || '',
      subtitle: course.subtitle || '',
      description: course.description || '',
      imageUrl: course.imageUrl || '',
      category: course.category || 'Foundational',
      rating: course.rating || 5.0,
      lessons: course.lessons || '',
      highlights: Array.isArray(course.highlights) ? course.highlights.join(', ') : '',
      buyLink: course.buyLink || '',
      order: course.order || 0
    });
    setCoursePreview(course.imageUrl || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCourseProcessing(true);
    try {
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
        await updateDoc(doc(db, 'courses', editingCourseId), data);
        toast({ title: "Course Updated" });
      } else {
        await addDoc(collection(db, 'courses'), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Course Added" });
      }
      
      // Reset
      setCourseForm({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
      setCoursePreview(null);
      setEditingCourseId(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setIsCourseProcessing(false);
    }
  };

  const handleDeleteDoc = async (path: string, id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, path, id));
      toast({ title: "Deleted" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    }
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
          {/* COURSE EDITOR */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary text-white p-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><BookOpen className="w-6 h-6" /></div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">{editingCourseId ? 'Edit' : 'Add New'} Course</CardTitle>
                  <CardDescription className="text-white/70">Create or update academic programs.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSaveCourse} className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input value={courseForm.subtitle} onChange={e => setCourseForm({...courseForm, subtitle: e.target.value})} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} className="rounded-xl min-h-[100px]" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={courseForm.category} onValueChange={v => setCourseForm({...courseForm, category: v})}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Foundational">Foundational</SelectItem>
                          <SelectItem value="Leadership">Leadership</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Lessons Count (e.g. 13+ Topics)</Label>
                      <Input value={courseForm.lessons} onChange={e => setCourseForm({...courseForm, lessons: e.target.value})} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Highlights (Comma separated)</Label>
                    <Input value={courseForm.highlights} onChange={e => setCourseForm({...courseForm, highlights: e.target.value})} placeholder="Feature 1, Feature 2" className="rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><Label>Rating</Label><Input type="number" step="0.1" max="5" value={courseForm.rating} onChange={e => setCourseForm({...courseForm, rating: parseFloat(e.target.value) || 0})} className="rounded-xl" /></div>
                     <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={courseForm.order} onChange={e => setCourseForm({...courseForm, order: parseInt(e.target.value) || 0})} className="rounded-xl" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Buy Now Link</Label>
                    <Input type="url" value={courseForm.buyLink} onChange={e => setCourseForm({...courseForm, buyLink: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Course Image</Label>
                    <Button type="button" variant="outline" className="w-full rounded-xl border-dashed" onClick={() => courseFileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" /> {coursePreview ? 'Change Image' : 'Upload Image'}
                    </Button>
                    <input type="file" ref={courseFileInputRef} onChange={e => handleFileChange(e, 'course')} accept="image/*" className="hidden" />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isCourseProcessing} className="flex-1 h-12 bg-primary text-white font-bold rounded-xl shadow-lg">
                      {isCourseProcessing ? 'Processing...' : (editingCourseId ? 'Update Course' : 'Publish Course')}
                    </Button>
                    {editingCourseId && (
                      <Button type="button" variant="ghost" className="h-12 rounded-xl" onClick={() => {
                        setEditingCourseId(null);
                        setCourseForm({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
                        setCoursePreview(null);
                      }}><XCircle className="w-4 h-4 mr-2" /> Cancel</Button>
                    )}
                  </div>
                </div>
                <div>
                   <Label className="uppercase text-xs font-bold text-muted-foreground mb-4 block">Preview</Label>
                   <div className="border rounded-[2rem] overflow-hidden bg-slate-50 finance-3d-shadow-inner relative aspect-video">
                     {coursePreview && <Image src={coursePreview} alt="p" fill className="object-cover" />}
                     {!coursePreview && <div className="absolute inset-0 flex items-center justify-center text-slate-300"><ImageIcon className="w-12 h-12" /></div>}
                   </div>
                   <div className="mt-4 p-4 bg-slate-100 rounded-2xl">
                     <p className="font-bold text-primary">{courseForm.title || 'Course Title'}</p>
                     <p className="text-xs text-accent font-bold uppercase">{courseForm.subtitle || 'Subtitle'}</p>
                   </div>
                </div>
              </form>
            </CardContent>
            <CardContent className="px-10 pb-10 border-t pt-10">
               <Label className="uppercase text-xs font-bold text-muted-foreground mb-6 block">Current Courses</Label>
               <div className="grid md:grid-cols-3 gap-6">
                 {courses?.map(c => (
                   <div key={c.id} className="flex flex-col p-4 bg-slate-50 rounded-2xl finance-3d-shadow-inner group relative">
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-10 h-10 rounded-lg bg-white finance-3d-shadow relative overflow-hidden shrink-0">
                         <Image src={c.imageUrl || `https://picsum.photos/seed/${c.id}/100/100`} alt="c" fill className="object-cover" />
                       </div>
                       <div className="overflow-hidden">
                         <p className="font-bold text-sm truncate">{c.title}</p>
                         <p className="text-[10px] text-muted-foreground uppercase">{c.category}</p>
                       </div>
                     </div>
                     <div className="flex gap-2">
                       <Button variant="outline" size="sm" className="flex-1 rounded-lg h-8" onClick={() => handleEditCourse(c)}><Edit2 className="w-3 h-3 mr-1" /> Edit</Button>
                       <Button variant="destructive" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDeleteDoc('courses', c.id)}><Trash2 className="w-3 h-3" /></Button>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>

          {/* CURATED REVIEWS */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-accent text-primary p-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl"><MessageSquare className="w-6 h-6" /></div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">Manage Testimonials</CardTitle>
                  <CardDescription className="text-primary/70">Curate reviews shown on the homepage.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleAddReview} className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Student Name</Label>
                      <Input value={newReview.userName} onChange={(e) => setNewReview({...newReview, userName: e.target.value})} className="rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Rating (1-5)</Label>
                      <Input type="number" min="1" max="5" value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value) || 0})} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Review Content</Label>
                    <Textarea value={newReview.content} onChange={(e) => setNewReview({...newReview, content: e.target.value})} className="rounded-xl min-h-[100px]" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Student Photo (Optional)</Label>
                    <Button type="button" variant="outline" className="w-full rounded-xl border-dashed" onClick={() => reviewFileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" /> {newReview.userPhoto ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <input type="file" ref={reviewFileInputRef} onChange={(e) => handleFileChange(e, 'review')} accept="image/*" className="hidden" />
                  </div>
                  <Button type="submit" disabled={isReviewProcessing} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg">
                    {isReviewProcessing ? 'Saving...' : 'Publish Testimonial'}
                  </Button>
                </div>
                <div className="space-y-4">
                   <Label className="uppercase text-xs font-bold text-muted-foreground block">Live Preview</Label>
                   <div className="border rounded-3xl p-6 bg-slate-50 relative finance-3d-shadow-inner">
                     <div className="flex items-center gap-4 mb-4">
                       <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm">
                         {reviewPreview && <Image src={reviewPreview} alt="p" fill className="object-cover" />}
                       </div>
                       <div>
                         <p className="font-bold text-primary">{newReview.userName || 'Student Name'}</p>
                         <div className="flex gap-1">
                           {[...Array(Math.max(0, newReview.rating || 0))].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                         </div>
                       </div>
                     </div>
                     <p className="text-sm italic">"{newReview.content || 'Share the student experience here...'}"</p>
                   </div>
                </div>
              </form>

              <div className="grid gap-4 pt-10 border-t mt-10">
                {reviews?.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative shadow-sm">
                        <Image src={r.userPhoto || `https://picsum.photos/seed/${r.id}/100/100`} alt="p" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{r.userName}</p>
                        <div className="flex gap-1">
                          {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-2 h-2 fill-yellow-400 text-yellow-400" />)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDeleteDoc('reviews', r.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ASSET MANAGEMENT (SLIDES & GALLERY) */}
          <div className="grid md:grid-cols-2 gap-12">
             {/* SLIDESHOW */}
             <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-primary text-white p-8">
                  <div className="flex items-center gap-3"><ImageIcon className="w-5 h-5" /><CardTitle>Homepage Slides</CardTitle></div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <form onSubmit={handleSaveSlide} className="space-y-4">
                    <Input placeholder="Slide Title" value={newSlide.title} onChange={e => setNewSlide({...newSlide, title: e.target.value})} className="rounded-xl" />
                    <Input type="number" placeholder="Order" value={newSlide.order} onChange={e => setNewSlide({...newSlide, order: parseInt(e.target.value) || 0})} className="rounded-xl" />
                    <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => slideFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> {slidePreview ? 'Image Ready' : 'Upload Slide'}</Button>
                    <input type="file" ref={slideFileInputRef} onChange={e => handleFileChange(e, 'slide')} accept="image/*" className="hidden" />
                    <Button type="submit" disabled={isSlideProcessing} className="w-full rounded-xl bg-primary text-white font-bold">{isSlideProcessing ? 'Saving...' : 'Add Slide'}</Button>
                  </form>
                  <div className="grid grid-cols-2 gap-3">
                    {slides?.map(s => (
                      <div key={s.id} className="relative aspect-video rounded-xl overflow-hidden group">
                        <Image src={s.imageUrl} alt="s" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteDoc('slides', s.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
             </Card>

             {/* GALLERY */}
             <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-accent text-primary p-8">
                  <div className="flex items-center gap-3"><Camera className="w-5 h-5" /><CardTitle>Memory Gallery</CardTitle></div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <form onSubmit={handleSaveGallery} className="space-y-4">
                    <Input placeholder="Description" value={newGalleryImg.description} onChange={e => setNewGalleryImg({...newGalleryImg, description: e.target.value})} className="rounded-xl" />
                    <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => galleryFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> {galleryPreview ? 'Photo Ready' : 'Select Photo'}</Button>
                    <input type="file" ref={galleryFileInputRef} onChange={e => handleFileChange(e, 'gallery')} accept="image/*" className="hidden" />
                    <Button type="submit" disabled={isGalleryProcessing} className="w-full rounded-xl bg-primary text-white font-bold">{isGalleryProcessing ? 'Adding...' : 'Add Memory'}</Button>
                  </form>
                  <div className="grid grid-cols-3 gap-3">
                    {galleryItems?.map(g => (
                      <div key={g.id} className="relative aspect-square rounded-xl overflow-hidden group">
                        <Image src={g.imageUrl} alt="g" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteDoc('gallery', g.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    ))}
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
