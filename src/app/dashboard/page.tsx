'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
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
  setDocumentNonBlocking,
  errorEmitter,
  FirestorePermissionError
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
  Video, 
  Play, 
  Edit2,
  Settings,
  ImageIcon,
  Globe,
  Layout,
  Clapperboard,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  PlusCircle,
  RotateCcw,
  GraduationCap,
  Star,
  Quote,
  Briefcase,
  Crown,
  Trophy,
  Activity,
  School,
  MessageSquare,
  Presentation,
  Link2,
  Smartphone,
  Apple
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
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const testimonialVideoFileInputRef = useRef<HTMLInputElement>(null);
  const reviewFileInputRef = useRef<HTMLInputElement>(null);
  const demoVideoFileInputRef = useRef<HTMLInputElement>(null);
  
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

  const teamQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'team'), orderBy('createdAt', 'desc')) : null, [db, isAuthorized]);
  const { data: teamMembers } = useCollection(teamQuery);

  const videoQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'videos'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: videoGallery } = useCollection(videoQuery);

  const testimonialVideosQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'testimonialVideos'), orderBy('order', 'asc')) : null, [db, isAuthorized]);
  const { data: testimonialVideoGallery } = useCollection(testimonialVideosQuery);

  const reviewsQuery = useMemoFirebase(() => isAuthorized ? query(collection(db, 'reviews'), orderBy('createdAt', 'desc')) : null, [db, isAuthorized]);
  const { data: reviews } = useCollection(reviewsQuery);

  const brandingRef = useMemoFirebase(() => doc(db, 'config', 'branding'), [db]);
  const { data: branding } = useDoc(brandingRef);

  const demoClassRef = useMemoFirebase(() => doc(db, 'system_settings', 'demo_class'), [db]);
  const { data: demoClass } = useDoc(demoClassRef);

  const [demoClassForm, setDemoClassForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    isActive: false,
    isYoutube: true
  });

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  useEffect(() => {
    if (demoClass) {
      setDemoClassForm({
        title: demoClass.title || '',
        description: demoClass.description || '',
        videoUrl: demoClass.videoUrl || '',
        isActive: demoClass.isActive || false,
        isYoutube: !!getYoutubeId(demoClass.videoUrl)
      });
    }
  }, [demoClass]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(['Foundational', 'Leadership', 'Premium']);
    courses?.forEach(c => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats);
  }, [courses]);

  const [brandingForm, setBrandingForm] = useState({ 
    appName: '', 
    logoUrl: '', 
    tagline: '',
    whatsappUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    emailAddress: '',
    quizUrl: '',
    statsStudents: '',
    statsWorkshops: '',
    statsTestimonials: '',
    showNo1Badge: false,
    showAppDownload: false,
    playStoreUrl: '',
    appStoreUrl: ''
  });

  useEffect(() => { 
    if (branding) {
      setBrandingForm({ 
        appName: branding.appName || '', 
        logoUrl: branding.logoUrl || '', 
        tagline: branding.tagline || '',
        whatsappUrl: branding.whatsappUrl || '',
        facebookUrl: branding.facebookUrl || '',
        instagramUrl: branding.instagramUrl || '',
        youtubeUrl: branding.youtubeUrl || '',
        emailAddress: branding.emailAddress || '',
        quizUrl: branding.quizUrl || '',
        statsStudents: branding.statsStudents || '',
        statsWorkshops: branding.statsWorkshops || '',
        statsTestimonials: branding.statsTestimonials || '',
        showNo1Badge: branding.showNo1Badge || false,
        showAppDownload: branding.showAppDownload || false,
        playStoreUrl: branding.playStoreUrl || '',
        appStoreUrl: branding.appStoreUrl || ''
      }); 
    }
  }, [branding]);

  const [courseForm, setCourseForm] = useState({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [teamForm, setTeamForm] = useState({ id: '', name: '', role: '', bio: '', imageUrl: '', leadershipType: 'team', order: 0 });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [reviewForm, setReviewForm] = useState({ id: '', userName: '', userPhoto: '', designation: 'Student', content: '', rating: 5 });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const [newSlide, setNewSlide] = useState({ title: '', description: '', imageUrl: '', order: 0 });
  const [newGalleryImg, setNewGalleryImg] = useState({ description: '', imageUrl: '' });
  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', order: 0, isYoutube: false });
  const [newTestimonialVideo, setNewTestimonialVideo] = useState({ title: '', videoUrl: '', order: 0, isYoutube: false });
  
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
      if ((type === 'video' || type === 'testimonialVideo' || type === 'slide' || type === 'demo-video') && file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Videos are limited to 50MB." });
        return;
      }
      if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Images must be smaller than 5MB." });
        return;
      }

      setSelectedFiles(prev => ({ ...prev, [type]: file }));
      
      const previewUrl = URL.createObjectURL(file);
      if (type === 'slide') setNewSlide(prev => ({ ...prev, imageUrl: previewUrl }));
      else if (type === 'gallery') setNewGalleryImg(prev => ({ ...prev, imageUrl: previewUrl }));
      else if (type === 'course') setCourseForm(prev => ({ ...prev, imageUrl: previewUrl }));
      else if (type === 'team') setTeamForm(prev => ({ ...prev, imageUrl: previewUrl }));
      else if (type === 'review') setReviewForm(prev => ({ ...prev, userPhoto: previewUrl }));
      else if (type === 'video') setNewVideo(prev => ({ ...prev, videoUrl: previewUrl, isYoutube: false }));
      else if (type === 'testimonialVideo') setNewTestimonialVideo(prev => ({ ...prev, videoUrl: previewUrl, isYoutube: false }));
      else if (type === 'demo-video') setDemoClassForm(prev => ({ ...prev, videoUrl: previewUrl, isYoutube: false }));
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
    if (brandingRef) {
      setDocumentNonBlocking(brandingRef, brandingForm, { merge: true });
      toast({ title: "Configuration Updated" });
    }
  };

  const handleSaveDemoClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demoClassRef) {
      let finalVideoUrl = demoClassForm.videoUrl;
      try {
        if (!demoClassForm.isYoutube && selectedFiles['demo-video']) {
          finalVideoUrl = await uploadFile(selectedFiles['demo-video'], 'demo_class');
        }
        setDocumentNonBlocking(demoClassRef, { 
          title: demoClassForm.title,
          description: demoClassForm.description,
          videoUrl: finalVideoUrl,
          isActive: demoClassForm.isActive,
          id: 'demo_class', 
          lastUpdated: new Date().toISOString() 
        }, { merge: true });
        
        setUploadProgress(null);
        setSelectedFiles(prev => ({ ...prev, 'demo-video': null }));
        toast({ title: "Demo Class Settings Saved" });
      } catch (err: any) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: demoClassRef.path,
          operation: 'write',
          requestResourceData: demoClassForm
        }));
      }
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = courseForm.imageUrl;
    const finalCategory = isCustomCategory ? customCategoryInput : courseForm.category;

    if (!finalCategory) {
      toast({ variant: "destructive", title: "Category Required" });
      return;
    }

    try {
      if (selectedFiles['course']) finalImageUrl = await uploadFile(selectedFiles['course'], 'courses');
      const highlightsArray = typeof courseForm.highlights === 'string' ? courseForm.highlights.split(',').map(h => h.trim()).filter(h => h !== '') : (courseForm.highlights || []);
      const data = { 
        title: courseForm.title, 
        subtitle: courseForm.subtitle, 
        description: courseForm.description, 
        imageUrl: finalImageUrl, 
        category: finalCategory, 
        rating: Number(courseForm.rating), 
        lessons: courseForm.lessons, 
        highlights: highlightsArray, 
        buyLink: courseForm.buyLink, 
        order: Number(courseForm.order) 
      };

      if (editingCourseId) {
        updateDocumentNonBlocking(doc(db, 'courses', editingCourseId), data);
        toast({ title: "Course Updated" });
      } else {
        addDocumentNonBlocking(collection(db, 'courses'), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Course Added" });
      }

      setCourseForm({ id: '', title: '', subtitle: '', description: '', imageUrl: '', category: 'Foundational', rating: 5.0, lessons: '', highlights: '', buyLink: '', order: 0 });
      setEditingCourseId(null);
      setIsCustomCategory(false);
      setCustomCategoryInput('');
      setSelectedFiles(prev => ({ ...prev, course: null }));
      setUploadProgress(null);
    } catch (err: any) { toast({ variant: "destructive", title: "Operation Failed", description: err.message }); }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = teamForm.imageUrl;
    try {
      if (selectedFiles['team']) finalImageUrl = await uploadFile(selectedFiles['team'], 'team');
      const data = { 
        name: teamForm.name, 
        role: teamForm.role, 
        bio: teamForm.bio, 
        imageUrl: finalImageUrl, 
        leadershipType: teamForm.leadershipType, 
        order: Number(teamForm.order) 
      };
      if (editingMemberId) {
        updateDocumentNonBlocking(doc(db, 'team', editingMemberId), data);
        toast({ title: "Team Member Updated" });
      } else {
        addDocumentNonBlocking(collection(db, 'team'), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Team Member Added" });
      }
      setTeamForm({ id: '', name: '', role: '', bio: '', imageUrl: '', leadershipType: 'team', order: 0 });
      setEditingMemberId(null);
      setSelectedFiles(prev => ({ ...prev, team: null }));
      setUploadProgress(null);
    } catch (err: any) { toast({ variant: "destructive", title: "Operation Failed", description: err.message }); }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = reviewForm.userPhoto;
    try {
      if (selectedFiles['review']) finalImageUrl = await uploadFile(selectedFiles['review'], 'reviews');
      const data = { 
        userName: reviewForm.userName, 
        userPhoto: finalImageUrl, 
        designation: reviewForm.designation,
        content: reviewForm.content, 
        rating: Number(reviewForm.rating) 
      };
      if (editingReviewId) {
        updateDocumentNonBlocking(doc(db, 'reviews', editingReviewId), data);
        toast({ title: "Testimonial Updated" });
      } else {
        addDocumentNonBlocking(collection(db, 'reviews'), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Testimonial Added" });
      }
      setReviewForm({ id: '', userName: '', userPhoto: '', designation: 'Student', content: '', rating: 5 });
      setEditingReviewId(null);
      setSelectedFiles(prev => ({ ...prev, review: null }));
      setUploadProgress(null);
    } catch (err: any) { toast({ variant: "destructive", title: "Operation Failed", description: err.message }); }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles['slide'] && !newSlide.imageUrl) return toast({ variant: "destructive", title: "Required", description: "Image or GIF/Video is required." });
    try {
      let finalImageUrl = newSlide.imageUrl;
      if (selectedFiles['slide']) finalImageUrl = await uploadFile(selectedFiles['slide'], 'slides');
      addDocumentNonBlocking(collection(db, 'slides'), { title: newSlide.title, description: newSlide.description, imageUrl: finalImageUrl, order: Number(newSlide.order), createdAt: serverTimestamp() });
      toast({ title: "Slide Added Successfully" });
      setNewSlide({ title: '', description: '', imageUrl: '', order: 0 });
      setSelectedFiles(prev => ({ ...prev, slide: null }));
      setUploadProgress(null);
    } catch (err: any) { toast({ variant: "destructive", title: "Operation Failed", description: err.message }); }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles['gallery'] && !newGalleryImg.imageUrl) return toast({ variant: "destructive", title: "Required", description: "Image is required." });
    try {
      let finalImageUrl = newGalleryImg.imageUrl;
      if (selectedFiles['gallery']) finalImageUrl = await uploadFile(selectedFiles['gallery'], 'gallery');
      addDocumentNonBlocking(collection(db, 'gallery'), { description: newGalleryImg.description, imageUrl: finalImageUrl, createdAt: serverTimestamp() });
      toast({ title: "Memory Image Added" });
      setNewGalleryImg({ description: '', imageUrl: '' });
      setSelectedFiles(prev => ({ ...prev, gallery: null }));
      setUploadProgress(null);
    } catch (err: any) { toast({ variant: "destructive", title: "Operation Failed", description: err.message }); }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.isYoutube && !selectedFiles['video']) return toast({ variant: "destructive", title: "Required", description: "Video file is required." });
    try {
      let finalUrl = newVideo.videoUrl;
      if (!newVideo.isYoutube && selectedFiles['video']) finalUrl = await uploadFile(selectedFiles['video'], 'videos');
      addDocumentNonBlocking(collection(db, 'videos'), { title: newVideo.title, videoUrl: finalUrl, order: Number(newVideo.order), createdAt: serverTimestamp() });
      setUploadProgress(null);
      setSelectedFiles(prev => ({ ...prev, video: null }));
      setNewVideo({ title: '', videoUrl: '', order: 0, isYoutube: false });
      toast({ title: "Showcase Video Published" });
    } catch (err: any) { toast({ variant: "destructive", title: "Operation Failed", description: err.message }); }
  };

  const handleSaveTestimonialVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonialVideo.isYoutube && !selectedFiles['testimonialVideo']) return toast({ variant: "destructive", title: "Required", description: "Video file is required." });
    try {
      let finalUrl = newTestimonialVideo.videoUrl;
      if (!newTestimonialVideo.isYoutube && selectedFiles['testimonialVideo']) finalUrl = await uploadFile(selectedFiles['testimonialVideo'], 'testimonialVideos');
      addDocumentNonBlocking(collection(db, 'testimonialVideos'), { title: newTestimonialVideo.title, videoUrl: finalUrl, order: Number(newTestimonialVideo.order), createdAt: serverTimestamp() });
      setUploadProgress(null);
      setSelectedFiles(prev => ({ ...prev, testimonialVideo: null }));
      setNewTestimonialVideo({ title: '', videoUrl: '', order: 0, isYoutube: false });
      toast({ title: "Testimonial Video Published" });
    } catch (err: any) { toast({ variant: "destructive", title: "Operation Failed", description: err.message }); }
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteDocumentNonBlocking(doc(db, itemToDelete.path, itemToDelete.id));
    toast({ title: "Item Removed Successfully" });
    setItemToDelete(null);
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase().split('?')[0];
    return (
      lowerUrl.endsWith('.mp4') || 
      lowerUrl.endsWith('.webm') || 
      lowerUrl.endsWith('.ogg') || 
      lowerUrl.endsWith('.mov') ||
      url.includes('contentType=video')
    );
  };

  if (isUserLoading || isProfileLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
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
          <Button onClick={handleLogout} variant="outline" className="border-destructive/20 text-destructive font-bold h-12 rounded-xl bg-white finance-3d-shadow hover:bg-destructive hover:text-white transition-all"><LogOut className="w-4 h-4 mr-2" /> End Session</Button>
        </div>

        <Tabs defaultValue="web-edit" className="w-full">
          <TabsList className="grid grid-cols-1 h-auto gap-4 bg-transparent p-0 mb-12">
            <TabsTrigger value="web-edit" className="data-[state=active]:bg-primary data-[state=active]:text-white h-16 rounded-3xl finance-3d-shadow border-none font-bold text-xl flex gap-3"><Globe className="w-6 h-6" /> Website Content Manager (Web Edit)</TabsTrigger>
          </TabsList>

          <TabsContent value="web-edit" className="space-y-12">
            <Tabs defaultValue="testimonials-video" className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-2 bg-slate-100 p-2 rounded-[2rem] mb-10 overflow-x-auto shadow-inner">
                <TabsTrigger value="testimonials-video" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Testimonial Videos</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Text Testimonials</TabsTrigger>
                <TabsTrigger value="videos" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Success Stories</TabsTrigger>
                <TabsTrigger value="courses" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Academic Courses</TabsTrigger>
                <TabsTrigger value="team" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Leadership Team</TabsTrigger>
                <TabsTrigger value="assets" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Slides & Gallery</TabsTrigger>
                <TabsTrigger value="demo-class" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Demo Class</TabsTrigger>
                <TabsTrigger value="branding" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Configuration</TabsTrigger>
              </TabsList>

              {uploadProgress !== null && (
                <Card className="mb-10 p-6 border-none finance-3d-shadow bg-primary text-white animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4"><span className="font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> Processing Cloud Upload...</span><span className="font-headline font-bold">{Math.round(uploadProgress)}%</span></div>
                  <Progress value={uploadProgress} className="h-3 bg-white/20" />
                </Card>
              )}

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
                        
                        <h3 className="font-headline font-bold text-xl text-primary border-b pb-2 pt-4">Impact & Metrics</h3>
                        <div className="p-6 rounded-3xl bg-slate-50 border space-y-4 finance-3d-shadow-inner">
                          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border mb-2">
                            <Label className="flex items-center gap-2 font-bold text-primary"><Trophy className="w-4 h-4 text-yellow-500" /> Show No.1 Badge</Label>
                            <Switch checked={brandingForm.showNo1Badge} onCheckedChange={v => setBrandingForm({...brandingForm, showNo1Badge: v})} />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-semibold"><GraduationCap className="w-4 h-4 text-primary" /> Total Students</Label>
                            <Input value={brandingForm.statsStudents} onChange={e => setBrandingForm({...brandingForm, statsStudents: e.target.value})} className="rounded-xl h-12" placeholder="e.g. 5000+" />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-semibold"><School className="w-4 h-4 text-accent" /> Workshops Conducted</Label>
                            <Input value={brandingForm.statsWorkshops} onChange={e => setBrandingForm({...brandingForm, statsWorkshops: e.target.value})} className="rounded-xl h-12" placeholder="e.g. 150+" />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-semibold"><MessageSquare className="w-4 h-4 text-primary" /> Testimonials</Label>
                            <Input value={brandingForm.statsTestimonials} onChange={e => setBrandingForm({...brandingForm, statsTestimonials: e.target.value})} className="rounded-xl h-12" placeholder="e.g. 200+" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="font-headline font-bold text-xl text-primary border-b pb-2">Social & Contact</h3>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp Link</Label>
                          <Input value={brandingForm.whatsappUrl} onChange={e => setBrandingForm({...brandingForm, whatsappUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://wa.me/..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook URL</Label>
                          <Input value={brandingForm.facebookUrl} onChange={e => setBrandingForm({...brandingForm, facebookUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://facebook.com/..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram URL</Label>
                          <Input value={brandingForm.instagramUrl} onChange={e => setBrandingForm({...brandingForm, instagramUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://instagram.com/..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Youtube className="w-4 h-4" /> YouTube Channel URL</Label>
                          <Input value={brandingForm.youtubeUrl} onChange={e => setBrandingForm({...brandingForm, youtubeUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://youtube.com/..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Support Email</Label>
                          <Input value={brandingForm.emailAddress} onChange={e => setBrandingForm({...brandingForm, emailAddress: e.target.value})} className="rounded-xl h-12" placeholder="support@..." />
                        </div>
                        
                        <h3 className="font-headline font-bold text-xl text-primary border-b pb-2 pt-4">App Presence</h3>
                        <div className="p-6 rounded-3xl bg-slate-50 border space-y-4 finance-3d-shadow-inner">
                          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border mb-2">
                            <Label className="flex items-center gap-2 font-bold text-primary"><Smartphone className="w-4 h-4 text-accent" /> Enable App Section</Label>
                            <Switch checked={brandingForm.showAppDownload} onCheckedChange={v => setBrandingForm({...brandingForm, showAppDownload: v})} />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-semibold"><Smartphone className="w-4 h-4" /> Google Play Store URL</Label>
                            <Input value={brandingForm.playStoreUrl} onChange={e => setBrandingForm({...brandingForm, playStoreUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://play.google.com/store/..." />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-semibold"><Apple className="w-4 h-4" /> Apple App Store URL</Label>
                            <Input value={brandingForm.appStoreUrl} onChange={e => setBrandingForm({...brandingForm, appStoreUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://apps.apple.com/..." />
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 pt-6">
                        <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg bg-slate-900 text-white">Save Configuration</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other Tabs content remains same... */}
              <TabsContent value="demo-class">
                <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-primary text-white p-10"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Presentation className="w-6 h-6" /> Demo Class Management</CardTitle></CardHeader>
                  <CardContent className="p-10">
                    <form onSubmit={handleSaveDemoClass} className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border mb-6">
                          <Label className="font-bold text-primary flex items-center gap-2"><Activity className="w-4 h-4" /> Enable Demo Class Section</Label>
                          <Switch checked={demoClassForm.isActive} onCheckedChange={v => setDemoClassForm({...demoClassForm, isActive: v})} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Display Title</Label>
                          <Input value={demoClassForm.title} onChange={e => setDemoClassForm({...demoClassForm, title: e.target.value})} className="rounded-xl h-12" placeholder="e.g. Join Our Free Demo Class" required />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border space-y-4">
                          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border">
                            <Switch checked={demoClassForm.isYoutube} onCheckedChange={v => setDemoClassForm({...demoClassForm, isYoutube: v, videoUrl: ''})} />
                            <Label className="font-bold">Use YouTube Link</Label>
                          </div>

                          {demoClassForm.isYoutube ? (
                            <div className="space-y-2">
                              <Label>YouTube URL</Label>
                              <Input value={demoClassForm.videoUrl} onChange={e => setDemoClassForm({...demoClassForm, videoUrl: e.target.value})} className="rounded-xl h-12" placeholder="https://www.youtube.com/watch?v=..." />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <Label>Upload Video File</Label>
                              <Button type="button" variant="outline" className="w-full rounded-xl border-dashed h-14 bg-white" onClick={() => demoVideoFileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" /> {selectedFiles['demo-video'] ? 'Change File' : 'Select Video (max 50MB)'}
                              </Button>
                              <input type="file" ref={demoVideoFileInputRef} onChange={e => handleFileChange(e, 'demo-video')} accept="video/*" className="hidden" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Description (Optional)</Label>
                          <Textarea value={demoClassForm.description} onChange={e => setDemoClassForm({...demoClassForm, description: e.target.value})} className="rounded-xl min-h-[150px]" placeholder="Explain what users will learn in this demo..." />
                        </div>

                        <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg" disabled={uploadProgress !== null}>Save Demo Settings</Button>
                      </div>
                      <div className="space-y-4">
                        <Label className="font-bold">Player Preview</Label>
                        <div className="border-4 border-slate-50 rounded-[2rem] overflow-hidden bg-slate-900 flex items-center justify-center relative aspect-video w-full finance-3d-shadow">
                          {demoClassForm.isYoutube && getYoutubeId(demoClassForm.videoUrl) ? (
                            <iframe src={`https://www.youtube.com/embed/${getYoutubeId(demoClassForm.videoUrl)}?rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&controls=1`} className="w-full h-full" />
                          ) : demoClassForm.videoUrl && isVideoUrl(demoClassForm.videoUrl) ? (
                            <video key={demoClassForm.videoUrl} src={demoClassForm.videoUrl} className="w-full h-full object-cover" controls />
                          ) : (
                            <div className="text-white/20 flex flex-col items-center gap-2"><Play className="w-12 h-12 opacity-20" /><p className="text-sm font-bold">No Content Loaded</p></div>
                          )}
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* ... Rest of the tabs content remains as in previous version ... */}
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
