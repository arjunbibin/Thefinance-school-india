
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Quote, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ReviewsSection() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const reviewsQuery = useMemoFirebase(() => 
    query(collection(db, 'reviews'), where('approved', '==', true), orderBy('createdAt', 'desc')), 
    [db]
  );
  const { data: reviews, isLoading } = useCollection(reviewsQuery);

  const handleSubmitReview = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!content.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please write something in your review." });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous Student',
        userEmail: user.email,
        userPhoto: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        content: content.trim(),
        rating,
        approved: false, // Moderation queue
        createdAt: serverTimestamp()
      });
      toast({ title: "Review Submitted", description: "Thank you! Your review has been sent for moderation." });
      setContent('');
      setRating(5);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Testimonials</Badge>
        <h2 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Voices of <span className="text-accent">Success</span></h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">See what our students and parents have to say about their journey towards financial literacy.</p>
        
        <div className="mt-8">
           <Button 
            onClick={handleWriteReviewClick}
            className="h-14 px-8 rounded-2xl bg-primary text-white font-bold finance-3d-shadow hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
           >
             <Plus className="w-5 h-5" /> Write a Review
           </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reviews?.map((review, index) => (
            <Card key={review.id} className="border-none bg-white finance-3d-shadow rounded-[2.5rem] overflow-hidden p-8 relative group animate-in slide-in-from-bottom-20 duration-1000" style={{ animationDelay: `${index * 100}ms` }}>
              <Quote className="absolute top-6 right-8 w-12 h-12 text-primary/5 group-hover:text-primary/10 transition-colors" />
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden finance-3d-shadow-inner border-2 border-white">
                  <Image src={review.userPhoto} alt={review.userName} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-primary">{review.userName}</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed italic">"{review.content}"</p>
            </Card>
          ))}
          {(!reviews || reviews.length === 0) && (
            <div className="col-span-full text-center py-12 text-muted-foreground italic">
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>
      )}

      {/* Write Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2rem] p-8 max-w-lg border-none finance-3d-shadow bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary">Share Your Story</DialogTitle>
            <DialogDescription>Your feedback helps us grow. Once submitted, our team will review and post it shortly.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Rate your experience</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-125">
                    <Star className={`w-8 h-8 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Your Feedback</label>
              <Textarea 
                placeholder="What did you learn? How has your financial outlook changed?" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="rounded-2xl min-h-[120px] focus:ring-accent border-slate-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitReview} disabled={isSubmitting} className="w-full h-14 bg-primary text-white font-bold rounded-xl finance-3d-shadow">
              {isSubmitting ? 'Sending...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
