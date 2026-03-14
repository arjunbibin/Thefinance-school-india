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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Trash2, 
  Upload, 
  Settings,
  Globe,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  GraduationCap,
  Trophy,
  School,
  MessageSquare,
  Presentation,
  Play,
  Activity,
  Smartphone,
  Apple
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  const handleLogout = async () => {
    localStorage.removeItem('activeSessionId');
    await auth.signOut();
    router.push('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if ((type === 'demo-video') && file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Videos are limited to 50MB." });
        return;
      }
      setSelectedFiles(prev => ({ ...prev, [type]: file }));
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
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-2 bg-slate-100 p-2 rounded-[2rem] mb-10 overflow-x-auto shadow-inner">
                <TabsTrigger value="branding" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Configuration</TabsTrigger>
                <TabsTrigger value="demo-class" className="rounded-full px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Demo Class</TabsTrigger>
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
                          ) : demoClassForm.videoUrl ? (
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
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
