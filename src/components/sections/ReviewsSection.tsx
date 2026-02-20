
'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

export default function ReviewsSection() {
  const db = useFirestore();
  
  // Fetch all reviews added by admin (they are public once created)
  const reviewsQuery = useMemoFirebase(() => 
    query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), 
    [db]
  );
  const { data: reviews, isLoading } = useCollection(reviewsQuery);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Testimonials</Badge>
        <h2 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Voices of <span className="text-accent">Success</span></h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">Real stories and feedback from our community, curated by our leadership team.</p>
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
                  <Image 
                    src={review.userPhoto || `https://picsum.photos/seed/${review.id}/100/100`} 
                    alt={review.userName} 
                    fill 
                    className="object-cover" 
                  />
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
              Our testimonials will appear here soon.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
