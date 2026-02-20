
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
import { doc, updateDoc, collection, addDoc, deleteDoc, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { LogOut, ShieldAlert, UserPlus, Users, Briefcase, Trash2, Upload, Eye, Image as ImageIcon, Camera, BookOpen, Star, Plus, Edit2, Check, Tag } from 'lucide-react';
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
  
  // Auth & Profile
  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Lists
  const slidesQuery = useMemoFirebase(() => query(collection(db, 'slides'), orderBy('order', 'asc')), [db]);
  const { data: slides } = useCollection(slidesQuery);

  const galleryQuery = useMemoFirebase(() => query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), [db]);
  const { data: galleryItems } = useCollection(galleryQuery);

  const coursesQuery = useMemoFirebase(() => query(collection(db, 'courses'), orderBy('order', 'asc')), [db]);
  const { data: courses } = useCollection(coursesQuery);

  // Admin Role State
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [isAdminProcessing, setIsAdminProcessing] = useState(false);

  // Slideshow State
  const [newSlide, setNewSlide] = useState({ title: '', description: '', imageUrl: '', order: 0 });
  const [slidePreview, setSlidePreview] = useState<string | null>(null);
  const [isSlideProcessing, setIsSlideProcessing] = useState(false);

  // Gallery State
  const [newGalleryImg, setNewGalleryImg] = useState({ description: '', imageUrl: '' });
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);
  const [isGalleryProcessing, setIsGalleryProcessing] = useState(false);

  // Course State
  const [courseForm, setCourseForm] = useState({ 
    id: '', 
    title: '', 
    subtitle: '', 
    description: '', 
    imageUrl: '', 
    category: 'Foundational', 
    rating: 5.0, 
    lessons: '', 
    highlights: '', 
    order: 0 
  });
  const [coursePreview, setCoursePreview] = useState<string | null>(null);
  const [isCourseProcessing, setIsCourseProcessing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

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
    if (!targetUserId) {
      toast({ variant: "destructive", title: "Missing UID", description: "Please enter the user's Unique ID." });
      return;
    }
    setIsAdminProcessing(true);
    try {
      const userRef = doc(db, 'userProfiles', targetUserId);
      await updateDoc(userRef, { role: selectedRole });
      toast({ title: "Authorization Updated", description: `User role changed to ${selectedRole}.` });
      setTargetUserId('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setIsAdminProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'slide' | 'gallery' | 'course') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Please upload an image under 1MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'slide') {
          setSlidePreview(base64String);
          setNewSlide(prev => ({ ...prev, imageUrl: base64String }));
        } else if (type === 'gallery') {
          setGalleryPreview(base64String);
          setNewGalleryImg(prev => ({ ...prev, imageUrl: base64String }));
        } else {
          setCoursePreview(base64String);
          setCourseForm(prev => ({ ...prev, imageUrl: base64String }));
        }
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
        ...newSlide,
        order: Number(newSlide.order),
        imageHint: "school highlights",
        createdAt: serverTimestamp()
      });
      toast({ title: "Slide Added", description: "Homepage slideshow updated." });
      setNewSlide({ title: '', description: '', imageUrl: '', order: slides ? slides.length + 1 : 0 });
      setSlidePreview(null);
      if (slideFileInputRef.current) slideFileInputRef.current.value = '';
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Add Slide", description: error.message });
    } finally {
      setIsSlideProcessing(false);
    }
  };

  const handleAddGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryImg.imageUrl) {
      toast({ variant: "destructive", title: "Missing Image", description: "Please select an image." });
      return;
    }
    setIsGalleryProcessing(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        ...newGalleryImg,
        imageHint: "school memory",
        createdAt: serverTimestamp()
      });
      toast({ title: "Memory Added", description: "New image added to the School Memories gallery." });
      setNewGalleryImg({ description: '', imageUrl: '' });
      setGalleryPreview(null);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Add Image", description: error.message });
    } finally {
      setIsGalleryProcessing(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.imageUrl) {
      toast({ variant: "destructive", title: "Missing Info", description: "Title and Image are required." });
      return;
    }
    setIsCourseProcessing(true);
    try {
      const highlightsArray = courseForm.highlights.split(',').map(h => h.trim()).filter(h => h !== '');
      const courseData = {
        ...courseForm,
        rating: Number(courseForm.rating),
        order: Number(courseForm.order),
        highlights: highlightsArray,
        imageHint: "course cover",
        updatedAt: serverTimestamp()
      };

      if (editingCourseId) {
        await updateDoc(doc(db, 'courses', editingCourseId), courseData);
        toast({ title: "Course Updated", description: `${courseForm.title} has been updated.` });
      } else {
        await addDoc(collection(db, 'courses'), { ...courseData, createdAt: serverTimestamp() });
        toast({ title: "Course Added", description: `${courseForm.title} has been added to the catalog.` });
      }
      
      setCourseForm({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', order: courses ? courses.length + 1 : 0 });
      setCoursePreview(null);
      setEditingCourseId(null);
      if (courseFileInputRef.current) courseFileInputRef.current.value = '';
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    } finally {
      setIsCourseProcessing(false);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourseId(course.id);
    setCourseForm({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle || '',
      description: course.description || '',
      imageUrl: course.imageUrl,
      category: course.category || 'Foundational',
      rating: course.rating || 5.0,
      lessons: course.lessons || '',
      highlights: course.highlights?.join(', ') || '',
      order: course.order || 0
    });
    setCoursePreview(course.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDoc = async (path: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteDoc(doc(db, path, id));
      toast({ title: "Deleted", description: "Item removed successfully." });
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
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">
                Staff <span className="text-accent">Portal</span>
              </h1>
              {isAdmin && <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />}
            </div>
            <p className="text-muted-foreground text-lg font-medium mt-2">
              Managing <span className="font-bold text-primary">{staffName}</span>'s Department.
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="h-12 px-6 rounded-xl border-2 text-destructive border-destructive/10 hover:bg-destructive hover:text-white transition-all font-bold">
            <LogOut className="w-5 h-5 mr-3" /> Secure Logout
          </Button>
        </div>

        <div className="grid gap-12">
          {/* Course Manager */}
          {isAdmin && (
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary text-white p-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl"><BookOpen className="w-6 h-6" /></div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Course Catalog Manager</CardTitle>
                    <CardDescription className="text-white/70">Add, edit, or remove school programs.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <form onSubmit={handleSaveCourse} className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} className="rounded-xl" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input 
                          placeholder="e.g. Foundational, Premium, New Category" 
                          value={courseForm.category} 
                          onChange={(e) => setCourseForm({...courseForm, category: e.target.value})} 
                          className="rounded-xl" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input value={courseForm.subtitle} onChange={(e) => setCourseForm({...courseForm, subtitle: e.target.value})} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} className="rounded-xl min-h-[80px]" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Lessons</Label>
                        <Input placeholder="e.g. 13+ Topics" value={courseForm.lessons} onChange={(e) => setCourseForm({...courseForm, lessons: e.target.value})} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <Input type="number" step="0.1" value={courseForm.rating} onChange={(e) => setCourseForm({...courseForm, rating: parseFloat(e.target.value)})} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input type="number" value={courseForm.order} onChange={(e) => setCourseForm({...courseForm, order: parseInt(e.target.value)})} className="rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Highlights (comma separated)</Label>
                      <Input placeholder="e.g. Needs vs Wants, Banking Basics" value={courseForm.highlights} onChange={(e) => setCourseForm({...courseForm, highlights: e.target.value})} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Course Image</Label>
                      <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-dashed border-2" onClick={() => courseFileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" /> {courseForm.imageUrl ? 'Change Image' : 'Select Image'}
                      </Button>
                      <input type="file" ref={courseFileInputRef} onChange={(e) => handleFileChange(e, 'course')} accept="image/*" className="hidden" />
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" disabled={isCourseProcessing} className="flex-1 h-14 bg-primary text-white font-bold rounded-xl mt-4">
                        {isCourseProcessing ? 'Saving...' : editingCourseId ? 'Update Course' : 'Add Course'}
                      </Button>
                      {editingCourseId && (
                        <Button type="button" variant="outline" onClick={() => { setEditingCourseId(null); setCourseForm({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', order: 0 }); setCoursePreview(null); }} className="h-14 rounded-xl mt-4">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="uppercase tracking-widest text-xs font-bold text-muted-foreground">Catalog Card Preview</Label>
                    <div className="border rounded-3xl p-4 bg-slate-50/50">
                       <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-200">
                          {coursePreview ? (
                            <Image src={coursePreview} alt="Preview" fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400"><ImageIcon className="w-12 h-12" /></div>
                          )}
                       </div>
                       <h3 className="text-xl font-bold text-primary">{courseForm.title || 'Course Title'}</h3>
                       <p className="text-sm text-accent font-bold uppercase">{courseForm.subtitle || 'Course Subtitle'}</p>
                       <div className="mt-2 flex items-center gap-2">
                         <Tag className="w-3 h-3 text-muted-foreground" />
                         <span className="text-xs font-medium text-muted-foreground">{courseForm.category}</span>
                       </div>
                    </div>
                  </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 border-t">
                  {courses?.map((course) => (
                    <div key={course.id} className="group relative rounded-2xl overflow-hidden finance-3d-shadow bg-white flex flex-col">
                      <div className="relative aspect-video">
                        <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                      </div>
                      <div className="p-4 flex-grow">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">{course.category}</span>
                           <div className="flex items-center text-yellow-500 font-bold text-sm"><Star className="w-3 h-3 fill-yellow-500 mr-1" /> {course.rating}</div>
                        </div>
                        <h4 className="font-bold text-lg leading-tight line-clamp-1">{course.title}</h4>
                      </div>
                      <div className="p-4 pt-0 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => handleEditCourse(course)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="rounded-lg" onClick={() => handleDeleteDoc('courses', course.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slideshow Manager */}
          {isAdmin && (
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary text-white p-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl"><ImageIcon className="w-6 h-6" /></div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Homepage Slideshow</CardTitle>
                    <CardDescription className="text-white/70">Dynamic headers for the main landing page.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <form onSubmit={handleAddSlide} className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={newSlide.title} onChange={(e) => setNewSlide({...newSlide, title: e.target.value})} className="rounded-xl h-12" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newSlide.description} onChange={(e) => setNewSlide({...newSlide, description: e.target.value})} className="rounded-xl min-h-[100px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input type="number" value={newSlide.order} onChange={(e) => setNewSlide({...newSlide, order: parseInt(e.target.value)})} className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Image</Label>
                        <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-dashed border-2" onClick={() => slideFileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" /> Upload
                        </Button>
                        <input type="file" ref={slideFileInputRef} onChange={(e) => handleFileChange(e, 'slide')} accept="image/*" className="hidden" />
                      </div>
                    </div>
                    <Button type="submit" disabled={isSlideProcessing || !newSlide.imageUrl} className="w-full h-14 bg-primary text-white font-bold rounded-xl mt-4">
                      {isSlideProcessing ? 'Uploading...' : 'Publish Slide'}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Label className="uppercase tracking-widest text-xs font-bold text-muted-foreground">Original Aspect Ratio Preview</Label>
                    <div className="relative aspect-[21/9] bg-slate-100 rounded-2xl overflow-hidden finance-3d-shadow-inner flex items-center justify-center">
                      {slidePreview ? (
                        <Image src={slidePreview} alt="Preview" fill className="object-cover" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                        <h4 className="text-white font-bold">{newSlide.title || 'Slide Title'}</h4>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 border-t">
                  {slides?.map((slide) => (
                    <div key={slide.id} className="relative group rounded-2xl overflow-hidden finance-3d-shadow aspect-video bg-slate-100">
                      <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                        <span className="bg-white/20 px-2 py-1 rounded-md text-white text-xs self-start">Order: {slide.order}</span>
                        <Button size="icon" variant="destructive" className="self-end rounded-xl" onClick={() => handleDeleteDoc('slides', slide.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gallery Manager */}
          {isAdmin && (
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-accent text-primary p-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl"><Camera className="w-6 h-6" /></div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">School Memories Gallery</CardTitle>
                    <CardDescription className="text-primary/70">Manage images shown on the gallery page. Latest uploads appear first.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <form onSubmit={handleAddGalleryImage} className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Caption / Description</Label>
                      <Textarea value={newGalleryImg.description} onChange={(e) => setNewGalleryImg({...newGalleryImg, description: e.target.value})} className="rounded-xl min-h-[100px]" placeholder="e.g. Students celebrating workshop success" />
                    </div>
                    <div className="space-y-2">
                      <Label>Select Image</Label>
                      <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-dashed border-2" onClick={() => galleryFileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" /> Select Photo
                      </Button>
                      <input type="file" ref={galleryFileInputRef} onChange={(e) => handleFileChange(e, 'gallery')} accept="image/*" className="hidden" />
                    </div>
                    <Button type="submit" disabled={isGalleryProcessing || !newGalleryImg.imageUrl} className="w-full h-14 bg-accent text-primary font-bold rounded-xl mt-4">
                      {isGalleryProcessing ? 'Adding Memory...' : 'Add to Gallery'}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Label className="uppercase tracking-widest text-xs font-bold text-muted-foreground">Gallery Grid Preview</Label>
                    <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden finance-3d-shadow-inner flex items-center justify-center">
                      {galleryPreview ? (
                        <Image src={galleryPreview} alt="Preview" fill className="object-cover" />
                      ) : (
                        <Camera className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                  </div>
                </form>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 pt-10 border-t">
                  {galleryItems?.map((item) => (
                    <div key={item.id} className="relative group rounded-2xl overflow-hidden finance-3d-shadow aspect-square bg-slate-100">
                      <Image src={item.imageUrl} alt="Memory" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end justify-end">
                        <Button size="icon" variant="destructive" className="rounded-xl h-8 w-8" onClick={() => handleDeleteDoc('gallery', item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!galleryItems || galleryItems.length === 0) && (
                    <div className="col-span-full py-12 text-center text-muted-foreground font-medium bg-slate-50 rounded-3xl border-2 border-dashed">
                      No images in gallery yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role Manager */}
          {isAdmin && (
            <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-destructive text-white p-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl"><UserPlus className="w-6 h-6" /></div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Authorize Staff Position</CardTitle>
                    <CardDescription className="text-white/70">Promote user accounts to management roles.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleUpdateRole} className="flex flex-col md:flex-row gap-6">
                  <div className="flex-grow space-y-2">
                    <Label>User Unique ID (UID)</Label>
                    <Input placeholder="Enter UID" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} className="rounded-xl h-12" required />
                  </div>
                  <div className="w-full md:w-64 space-y-2">
                    <Label>Department Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select" /></SelectTrigger>
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
                  <Button type="submit" disabled={isAdminProcessing} className="h-12 md:h-20 px-10 bg-destructive text-white font-bold rounded-xl mt-auto transition-transform hover:scale-105 active:scale-95">
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
