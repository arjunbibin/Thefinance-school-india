
'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function ReviewsSection() {
  const db = useFirestore();
  
  // Fetch all reviews added by admin
  const reviewsQuery = useMemoFirebase(() => 
    query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), 
    [db]
  );
  const { data: reviews, isLoading } = useCollection(reviewsQuery);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden scroll-mt-24">
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
        <div className="relative px-4 md:px-12">
          {reviews && reviews.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[plugin.current]}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {reviews.map((review, index) => (
                  <CarouselItem key={review.id} className="pl-4 md:pl-6 basis-full md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full border-none bg-white finance-3d-shadow rounded-[2.5rem] overflow-hidden p-8 relative group animate-in slide-in-from-bottom-20 duration-1000" style={{ animationDelay: `${index * 100}ms` }}>
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
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-primary truncate">{review.userName}</h4>
                          <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1 truncate">
                            {review.designation || 'Student'}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-2.5 h-2.5 ${i < (review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic line-clamp-4">"{review.content}"</p>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="finance-3d-shadow border-none bg-white hover:bg-accent hover:text-primary -left-6" />
                <CarouselNext className="finance-3d-shadow border-none bg-white hover:bg-accent hover:text-primary -right-6" />
              </div>
            </Carousel>
          ) : (
            <div className="text-center py-12 text-muted-foreground italic">
              Our testimonials will appear here soon.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
