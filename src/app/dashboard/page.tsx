
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
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { doc, updateDoc, collection, addDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { LogOut, ShieldAlert, Users, Trash2, Upload, BookOpen, Plus, Edit2, XCircle, UserSquare, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const teamFileInputRef = useRef<HTMLInputElement>(null);
  const reviewFileInputRef = useRef<HTMLInputElement>(null);
  
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

  // --- STATES ---
  const [courseForm, setCourseForm] = useState({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isCourseProcessing, setIsCourseProcessing] = useState(false);

  const [teamForm, setTeamForm] = useState({ id: '', name: '', role: '', bio: '', imageUrl: '', isFounder: false, order: 0 });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isTeamProcessing, setIsTeamProcessing] = useState(false);

  const [newSlide, setNewSlide] = useState({ title: '', description: '', imageUrl: '', order: 0 });
  const [isSlideProcessing, setIsSlideProcessing] = useState(false);

  const [newGalleryImg, setNewGalleryImg] = useState({ description: '', imageUrl: '' });
  const [isGalleryProcessing, setIsGalleryProcessing] = useState(false);

  const [newReview, setNewReview] = useState({ userName: '', userPhoto: '', content: '', rating: 5 });
  const [isReviewProcessing, setIsReviewProcessing] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'slide' | 'gallery' | 'course' | 'team' | 'review') => {
    const file = e.target.files?.[0];
    if (file) {
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
      setCourseForm({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
      setEditingCourseId(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally { setIsCourseProcessing(false); }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTeamProcessing(true);
    try {
      const data = {
        name: teamForm.name,
        role: teamForm.role,
        bio: teamForm.bio,
        imageUrl: teamForm.imageUrl,
        isFounder: teamForm.isFounder,
        order: Number(teamForm.order)
      };

      if (editingMemberId) {
        await updateDoc(doc(db, 'team', editingMemberId), data);
        toast({ title: "Member Updated" });
      } else {
        await addDoc(collection(db, 'team'), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Member Added" });
      }
      setTeamForm({ id: '', name: '', role: '', bio: '', imageUrl: '', isFounder: false, order: 0 });
      setEditingMemberId(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally { setIsTeamProcessing(false); }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.imageUrl) return toast({ variant: "destructive", title: "Required", description: "Image is required." });
    setIsSlideProcessing(true);
    try {
      await addDoc(collection(db, 'slides'), { ...newSlide, order: Number(newSlide.order), createdAt: serverTimestamp() });
      toast({ title: "Slide Added" });
      setNewSlide({ title: '', description: '', imageUrl: '', order: 0 });
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
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally { setIsGalleryProcessing(false); }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewProcessing(true);
    try {
      await addDoc(collection(db, 'reviews'), { ...newReview, createdAt: serverTimestamp() });
      toast({ title: "Review Added" });
      setNewReview({ userName: '', userPhoto: '', content: '', rating: 5 });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally { setIsReviewProcessing(false); }
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
                    <div className="space-y-2"><Label>Rating</Label><Input type="number" step="0.1" value={courseForm.rating} onChange={e => setCourseForm({...courseForm, rating: parseFloat(e.target.value)})} className="rounded-xl" /></div>
                    <div className="space-y-2"><Label>Order</Label><Input type="number" value={courseForm.order} onChange={e => setCourseForm({...courseForm, order: parseInt(e.target.value)})} className="rounded-xl" /></div>
                  </div>
                  <Button type="button" variant="outline" className="w-full rounded-xl border-dashed" onClick={() => courseFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> {courseForm.imageUrl ? 'Change Image' : 'Upload Image'}</Button>
                  <input type="file" ref={courseFileInputRef} onChange={e => handleFileChange(e, 'course')} accept="image/*" className="hidden" />
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isCourseProcessing} className="flex-1 h-12 rounded-xl">{isCourseProcessing ? 'Processing...' : (editingCourseId ? 'Update' : 'Publish')}</Button>
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
                      <Button variant="outline" size="sm" className="h-8 rounded-lg flex-1" onClick={() => {setEditingCourseId(c.id); setCourseForm({...c, highlights: c.highlights.join(', ')})}}><Edit2 className="w-3 h-3" /></Button>
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
                    <div className="space-y-2"><Label>Order</Label><Input type="number" value={teamForm.order} onChange={e => setTeamForm({...teamForm, order: parseInt(e.target.value)})} className="rounded-xl" /></div>
                  </div>
                  <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => teamFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Upload Portrait</Button>
                  <input type="file" ref={teamFileInputRef} onChange={e => handleFileChange(e, 'team')} accept="image/*" className="hidden" />
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isTeamProcessing} className="flex-1 h-12 rounded-xl">{isTeamProcessing ? 'Saving...' : (editingMemberId ? 'Update' : 'Add Member')}</Button>
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

          {/* REVIEW ADDER */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary text-white p-10"><CardTitle>Review & Success Story Curation</CardTitle></CardHeader>
            <CardContent className="p-10">
               <form onSubmit={handleSaveReview} className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Input placeholder="Name" value={newReview.userName} onChange={e => setNewReview({...newReview, userName: e.target.value})} className="rounded-xl" required />
                    <Textarea placeholder="Testimonial Content" value={newReview.content} onChange={e => setNewReview({...newReview, content: e.target.value})} className="rounded-xl min-h-[100px]" required />
                    <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})} className="rounded-xl" /></div>
                    <Button type="button" variant="outline" className="w-full" onClick={() => reviewFileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Upload User Photo</Button>
                    <input type="file" ref={reviewFileInputRef} onChange={e => handleFileChange(e, 'review')} accept="image/*" className="hidden" />
                    <Button type="submit" disabled={isReviewProcessing} className="w-full h-12">{isReviewProcessing ? 'Saving...' : 'Publish Review'}</Button>
                  </div>
                  <div className="p-6 border rounded-[2rem] bg-slate-50 finance-3d-shadow-inner flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 finance-3d-shadow bg-white relative">
                      {newReview.userPhoto && <Image src={newReview.userPhoto} alt="u" fill className="object-cover" />}
                    </div>
                    <p className="font-bold text-primary">{newReview.userName || 'Student Name'}</p>
                    <div className="flex gap-1">
                      {[...Array(isNaN(newReview.rating) ? 0 : Math.max(0, Math.min(5, newReview.rating)))].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
               </form>
               <div className="grid md:grid-cols-4 gap-4 mt-10">
                 {reviews?.map(r => (
                   <div key={r.id} className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center">
                     <p className="text-xs font-bold truncate">{r.userName}</p>
                     <Button variant="destructive" size="sm" className="h-6 w-6 p-0" onClick={() => handleDeleteDoc('reviews', r.id)}><Trash2 className="w-2 h-2" /></Button>
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
                    <Input type="number" placeholder="Order" value={newSlide.order} onChange={e => setNewSlide({...newSlide, order: parseInt(e.target.value)})} className="rounded-xl" />
                    <Button type="button" variant="outline" className="w-full" onClick={() => slideFileInputRef.current?.click()}>Select Slide</Button>
                    <input type="file" ref={slideFileInputRef} onChange={e => handleFileChange(e, 'slide')} accept="image/*" className="hidden" />
                    <Button type="submit" disabled={isSlideProcessing} className="w-full h-12">{isSlideProcessing ? 'Saving...' : 'Add Slide'}</Button>
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
                    <input type="file" ref={galleryFileInputRef} onChange={e => handleFileChange(e, 'gallery')} accept="image/*" className="hidden" />
                    <Button type="submit" disabled={isGalleryProcessing} className="w-full h-12">{isGalleryProcessing ? 'Adding...' : 'Add Memory'}</Button>
                  </form>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryItems?.map(g => <div key={g.id} className="relative aspect-square rounded-lg overflow-hidden group"><Image src={g.imageUrl} alt="g" fill className="object-cover" /><Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteDoc('gallery', g.id)}><Trash2 className="w-3 h-3" /></Button></div>)}
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
