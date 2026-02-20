
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
import { LogOut, ShieldAlert, UserPlus, Users, Briefcase, Trash2, Upload, Eye, Image as ImageIcon, Camera, BookOpen, Star, Plus, Edit2, Check, Tag, ExternalLink, MessageSquare, X, Mail } from 'lucide-react';
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
  
  // Auth & Profile
  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Authorization flag - only show dashboard content if user is verified as staff/admin
  const isAuthorized = !!(user && profile && profile.role !== 'user');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (!isProfileLoading && profile && profile.role === 'user') {
      router.push('/');
      toast({ variant: "destructive", title: "Unauthorized", description: "This portal is for authorized staff only." });
    }
  }, [user, isUserLoading, router, profile, isProfileLoading, toast]);

  // Data Queries
  const slidesQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'slides'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: slides } = useCollection(slidesQuery);

  const galleryQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'gallery'), orderBy('createdAt', 'desc')) : null, [db, isAuthorized]);
  const { data: galleryItems } = useCollection(galleryQuery);

  const coursesQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'courses'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: courses } = useCollection(coursesQuery);

  const reviewsQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'reviews'), orderBy('createdAt', 'desc')) : null, [db, isAuthorized]);
  const { data: reviews } = useCollection(reviewsQuery);

  // --- REVIEW FORM STATE ---
  const [newReview, setNewReview] = useState({ userName: '', userEmail: '', content: '', rating: 5, userPhoto: '' });
  const [reviewPreview, setReviewPreview] = useState<string | null>(null);
  const [isReviewProcessing, setIsReviewProcessing] = useState(false);

  // Admin Role State
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [isAdminProcessing, setIsAdminProcessing] = useState(false);

  // Slideshow State
  const [newSlide, setNewSlide] = useState({ title: '', description: '', imageUrl: '', order: 0 });
  const [slidePreview, setSlidePreview] = useState<string | null>(null);
  const [isSlideProcessing, setIsProcessing] = useState(false);

  // Gallery State
  const [newGalleryImg, setNewGalleryImg] = useState({ description: '', imageUrl: '' });
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);
  const [isGalleryProcessing, setIsGalleryProcessing] = useState(false);

  // Course State
  const [courseForm, setCourseForm] = useState({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
  const [coursePreview, setCoursePreview] = useState<string | null>(null);
  const [isCourseProcessing, setIsCourseProcessing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) return;
    setIsAdminProcessing(true);
    try {
      await updateDoc(doc(db, 'userProfiles', targetUserId), { role: selectedRole });
      toast({ title: "Updated", description: "Role updated successfully." });
      setTargetUserId('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setIsAdminProcessing(false);
    }
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

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.content) {
      toast({ variant: "destructive", title: "Missing Data", description: "Name and content are required." });
      return;
    }
    setIsReviewProcessing(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...newReview,
        createdAt: serverTimestamp(),
        approved: true // Admins add pre-approved reviews
      });
      toast({ title: "Review Added", description: "Testimonial is now live on the homepage." });
      setNewReview({ userName: '', userEmail: '', content: '', rating: 5, userPhoto: '' });
      setReviewPreview(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setIsReviewProcessing(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCourseProcessing(true);
    try {
      const data = { ...courseForm, rating: Number(courseForm.rating), order: Number(courseForm.order), highlights: courseForm.highlights.split(',').map(h => h.trim()) };
      if (editingCourseId) await updateDoc(doc(db, 'courses', editingCourseId), data);
      else await addDoc(collection(db, 'courses'), { ...data, createdAt: serverTimestamp() });
      toast({ title: "Success", description: "Course saved." });
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

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pb-24 px-6 max-w-6xl mx-auto w-full pt-16">
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">Staff <span className="text-accent">Portal</span></h1>
          <Button onClick={handleLogout} variant="outline" className="border-destructive/20 text-destructive font-bold"><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
        </div>

        <div className="grid gap-12">
          {/* CURATED REVIEWS MANAGER */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-accent text-primary p-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl"><MessageSquare className="w-6 h-6" /></div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">Curated Reviews</CardTitle>
                  <CardDescription className="text-primary/70">Manually add and manage testimonials shown on the home page.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <form onSubmit={handleAddReview} className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={newReview.userName} onChange={(e) => setNewReview({...newReview, userName: e.target.value})} className="rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Rating (1-5)</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="5" 
                        value={newReview.rating} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setNewReview({...newReview, rating: isNaN(val) ? 0 : val});
                        }} 
                        className="rounded-xl" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Review Content</Label>
                    <Textarea value={newReview.content} onChange={(e) => setNewReview({...newReview, content: e.target.value})} className="rounded-xl min-h-[100px]" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Reviewer Photo (Optional)</Label>
                    <Button type="button" variant="outline" className="w-full rounded-xl border-dashed" onClick={() => reviewFileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" /> {newReview.userPhoto ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <input type="file" ref={reviewFileInputRef} onChange={(e) => handleFileChange(e, 'review')} accept="image/*" className="hidden" />
                  </div>
                  <Button type="submit" disabled={isReviewProcessing} className="w-full h-12 bg-primary text-white font-bold rounded-xl">
                    {isReviewProcessing ? 'Saving...' : 'Publish Review'}
                  </Button>
                </div>
                <div className="space-y-4">
                   <Label className="uppercase text-xs font-bold text-muted-foreground">Live Preview</Label>
                   <div className="border rounded-3xl p-6 bg-slate-50 relative">
                     <div className="flex items-center gap-4 mb-4">
                       <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200">
                         {reviewPreview && <Image src={reviewPreview} alt="p" fill className="object-cover" />}
                       </div>
                       <div>
                         <p className="font-bold text-primary">{newReview.userName || 'Student Name'}</p>
                         <div className="flex gap-1">
                           {/* Added safety check for valid rating length */}
                           {[...Array(Math.max(0, Math.min(5, newReview.rating || 0)))].map((_, i) => (
                             <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                           ))}
                         </div>
                       </div>
                     </div>
                     <p className="text-sm italic text-muted-foreground">"{newReview.content || 'Share the success story here...'}"</p>
                   </div>
                </div>
              </form>

              <div className="grid gap-4 pt-10 border-t">
                {reviews?.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                        <Image src={r.userPhoto || `https://picsum.photos/seed/${r.id}/100/100`} alt="p" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{r.userName}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{r.content}</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="icon" className="rounded-xl" onClick={() => handleDeleteDoc('reviews', r.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* OTHER MANAGERS - KEPT FOR FULL FUNCTIONALITY */}
          {isAdmin && (
            <>
              {/* Course Manager */}
              <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-primary text-white p-10">
                  <div className="flex items-center gap-4"><BookOpen className="w-6 h-6" /> <CardTitle>Courses</CardTitle></div>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="text-center py-4 text-muted-foreground italic">Course catalog is active. See below to edit.</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {courses?.map(c => (
                      <div key={c.id} className="p-4 border rounded-2xl flex flex-col items-center gap-2">
                        <span className="font-bold text-xs truncate w-full text-center">{c.title}</span>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteDoc('courses', c.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Roles Manager */}
              <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-destructive text-white p-10"><CardTitle>Staff Authorization</CardTitle></CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={handleUpdateRole} className="flex gap-4">
                    <Input placeholder="User UID" value={targetUserId} onChange={e => setTargetUserId(e.target.value)} className="rounded-xl" />
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" className="bg-destructive rounded-xl">Update</Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
