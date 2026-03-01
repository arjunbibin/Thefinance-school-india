'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Play, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestimonialVideosPage() {
  const db = useFirestore();
  const videosQuery = useMemoFirebase(() => query(collection(db, 'testimonialVideos'), orderBy('order', 'asc')), [db]);
  const { data: videos, isLoading } = useCollection(videosQuery);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-32 max-w-7xl mx-auto px-6 w-full">
        <div className="mb-12 flex items-center gap-4 animate-in fade-in duration-700">
          <Link href="/#testimonials">
            <Button variant="ghost" className="rounded-xl flex items-center gap-2 font-bold hover:bg-white/50">
              <ChevronLeft className="w-5 h-5" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-16 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">The Success Vault</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">Student <span className="text-accent">Success</span></h1>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Watch real transformations directly in our student success gallery.
          </p>
        </div>

        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {videos.map((video, index) => {
              const ytId = getYoutubeId(video.videoUrl);
              const isActive = activeVideoId === video.id;

              return (
                <Card 
                  key={video.id} 
                  className="group border-none bg-white finance-3d-shadow rounded-[2.5rem] overflow-hidden finance-3d-card animate-in slide-in-from-bottom-20 duration-1000"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-[9/16] w-full bg-slate-900">
                    {isActive ? (
                      /* Active Player - Plays directly in grid with HD parameters */
                      <div className="w-full h-full">
                        {ytId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&vq=hd1080`}
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={video.videoUrl}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                            playsInline
                            preload="auto"
                          />
                        )}
                      </div>
                    ) : (
                      /* Thumbnail / Play Button Overlay */
                      <div 
                        className="w-full h-full cursor-pointer relative"
                        onClick={() => setActiveVideoId(video.id)}
                      >
                        {ytId ? (
                          <img 
                            src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} 
                            onError={(e) => {
                              // Fallback if maxres is not available
                              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                            }}
                            alt={video.title}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <video 
                            src={video.videoUrl} 
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        )}

                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                          <div className="w-16 h-16 bg-accent text-primary rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                            <Play className="w-8 h-8 fill-primary ml-1" />
                          </div>
                          <div className="mt-6 px-4 py-2 glass-morphism rounded-xl border border-white/30 transform translate-y-2 group-hover:translate-y-0 transition-all max-w-[85%]">
                             <p className="text-black font-headline font-bold text-sm text-center line-clamp-2">
                               {video.title || 'Watch Story'}
                             </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 text-muted-foreground italic bg-white/50 rounded-[3rem] finance-3d-shadow-inner">
             No testimonial videos have been shared yet.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
