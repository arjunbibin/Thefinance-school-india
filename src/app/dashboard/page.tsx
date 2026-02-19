
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { LogOut, MessageSquare, Star, Send, User, ShieldAlert, UserPlus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Role Management State
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [isAdminProcessing, setIsAdminProcessing] = useState(false);

  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    setIsSubmitting(true);
    const reviewsRef = collection(db, 'reviews');
    
    addDocumentNonBlocking(reviewsRef, {
      userId: user?.uid,
      userName: profile?.firstName || user?.displayName || 'Anonymous User',
      userEmail: user?.email,
      content: reviewContent,
      rating: rating,
      createdAt: serverTimestamp(),
    });

    setReviewContent('');
    setIsSubmitting(false);
    toast({
      title: "Review Sent",
      description: "Thank you for sharing your thoughts with us!",
    });
  };

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) return;

    setIsAdminProcessing(true);
    const targetRef = doc(db, 'userProfiles', targetUserId.trim());
    
    updateDocumentNonBlocking(targetRef, {
      role: selectedRole
    });

    toast({
      title: "Role Updated",
      description: `User ${targetUserId} has been assigned the role: ${selectedRole}`,
    });
    setTargetUserId('');
    setIsAdminProcessing(false);
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const studentName = profile?.firstName || user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Member';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pb-24 px-6 max-w-4xl mx-auto w-full pt-16">
        {/* Personalized Greeting */}
        <div className="mb-12 space-y-4 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">
              Welcome back, <span className="text-accent underline decoration-accent/30 underline-offset-8">{studentName}</span>!
            </h1>
            {isAdmin && <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />}
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            We're glad to have you with us today. Your voice matters in our community.
          </p>
        </div>

        <div className="grid gap-10">
          {/* Admin Panel (Only visible to Admins) */}
          {isAdmin && (
            <Card className="finance-3d-shadow border-none bg-destructive/5 rounded-[2.5rem] overflow-hidden border-2 border-destructive/20">
              <CardHeader className="bg-destructive text-white p-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Staff Role Management</CardTitle>
                    <CardDescription className="text-white/70">
                      Assign professional roles to workers like Tech Head or Content Head.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleUpdateRole} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="targetUid">Worker UID</Label>
                      <Input 
                        id="targetUid"
                        placeholder="Paste User UID here..."
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="rounded-xl h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Select Position</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Regular Student</SelectItem>
                          <SelectItem value="admin">Primary Admin</SelectItem>
                          <SelectItem value="content_head">Content Head</SelectItem>
                          <SelectItem value="student_specialist">Student Engagement Specialist</SelectItem>
                          <SelectItem value="accounts_head">Accounts Head</SelectItem>
                          <SelectItem value="general_manager">General Manager</SelectItem>
                          <SelectItem value="tech_head">Tech Head</SelectItem>
                          <SelectItem value="operations_head">Operations Head</SelectItem>
                          <SelectItem value="strategy_manager">Strategy Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isAdminProcessing}
                    className="w-full h-14 bg-destructive text-white font-bold rounded-xl hover:bg-destructive/90 transition-all flex items-center justify-center gap-2"
                  >
                    {isAdminProcessing ? 'Processing...' : (
                      <>
                        Update Worker Access <UserPlus className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Review Submission Card */}
          <Card className="finance-3d-shadow border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary text-white p-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">Share Your Experience</CardTitle>
                  <CardDescription className="text-white/70">
                    Let us know how we're doing or share your suggestions.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSubmitReview} className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="review" className="text-lg font-bold text-primary">Your Message</Label>
                  <Textarea 
                    id="review"
                    placeholder="Tell us what you think about The Finance School India..."
                    className="min-h-[150px] rounded-2xl border-2 border-slate-100 focus:border-primary/30 transition-all p-6 text-lg"
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-bold text-primary">Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 transition-transform hover:scale-125 ${rating >= star ? 'text-accent' : 'text-slate-200'}`}
                      >
                        <Star className={`w-8 h-8 ${rating >= star ? 'fill-accent' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !reviewContent.trim()}
                  className="w-full h-16 bg-primary text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Submit Review <Send className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User Profile Summary */}
          <Card className="bg-white finance-3d-shadow border-none rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 finance-3d-shadow-inner flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-headline font-bold text-primary">
                  {studentName} 
                  {isAdmin && <span className="ml-2 text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-md uppercase tracking-widest">Admin</span>}
                  {!isAdmin && profile?.role !== 'user' && <span className="ml-2 text-xs bg-accent/10 text-accent px-2 py-1 rounded-md uppercase tracking-widest">{profile?.role?.replace('_', ' ')}</span>}
                </h3>
                <p className="text-muted-foreground font-medium">{user?.email}</p>
                <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">UID: {user?.uid}</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="h-14 px-8 rounded-2xl border-2 text-destructive border-destructive/10 hover:bg-destructive hover:text-white transition-all font-bold shadow-sm"
            >
              <LogOut className="w-5 h-5 mr-3" /> Sign Out
            </Button>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
