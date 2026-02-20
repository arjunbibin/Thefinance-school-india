'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, Maximize2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

export default function TestimonialVideosPage() {
  const db = useFirestore();
  const videosQuery = useMemoFirebase(() => query(collection(db, 'videos'), orderBy('order', 'asc')), [db]);
  const { data: videos, isLoading } = useCollection(videosQuery);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'center',
    skipSnaps: false 
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setIsPlaying(false);
    // Pause all other videos when switching
    Object.values(videoRefs.current).forEach(ref => ref?.pause());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (video) {
      if (isPlaying) video.pause();
      else video.play();
      setIsPlaying(!isPlaying);
    }
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
      
      <main className="flex-grow pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Immersive Showcase</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">Success <span className="text-accent">Stories</span></h1>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Step into the 3D gallery of our students' journeys. Real transformations, captured in action.
          </p>
        </div>

        {/* 3D Carousel Section */}
        <div className="relative w-full max-w-[1400px] mx-auto perspective-1000">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {videos?.map((video, index) => {
                const isActive = selectedIndex === index;
                return (
                  <div 
                    key={video.id} 
                    className={cn(
                      "flex-[0_0_85%] md:flex-[0_0_30%] min-w-0 px-4 transition-all duration-700 ease-out",
                      isActive ? "scale-105 z-10" : "scale-90 opacity-40 blur-[2px] rotate-y-12"
                    )}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="relative aspect-[9/16] rounded-[2.5rem] overflow-hidden finance-3d-shadow bg-black group cursor-pointer">
                      <video
                        ref={el => { videoRefs.current[video.id] = el; }}
                        src={video.videoUrl}
                        className="w-full h-full object-cover"
                        playsInline
                        loop
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                      
                      {/* Play/Pause Overlay */}
                      <div 
                        className={cn(
                          "absolute inset-0 flex items-center justify-center transition-all duration-300",
                          isPlaying && isActive ? "opacity-0 group-hover:opacity-100 bg-black/20" : "bg-black/40"
                        )}
                        onClick={() => isActive && togglePlay(video.id)}
                      >
                        {isActive && (
                          <button className="w-20 h-20 bg-accent text-primary rounded-full flex items-center justify-center shadow-2xl finance-3d-shadow transition-transform hover:scale-110">
                            {isPlaying ? <Pause className="w-8 h-8 fill-primary" /> : <Play className="w-8 h-8 fill-primary ml-1" />}
                          </button>
                        )}
                        {!isActive && (
                          <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-white/40" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none px-4">
            <button 
              onClick={() => emblaApi?.scrollPrev()} 
              className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md finance-3d-shadow flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all transform hover:-translate-x-2"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={() => emblaApi?.scrollNext()} 
              className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md finance-3d-shadow flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all transform hover:translate-x-2"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Dynamic Counter */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {videos?.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  selectedIndex === i ? "w-12 bg-primary" : "w-3 bg-slate-300"
                )} 
              />
            ))}
          </div>
          <p className="font-bold text-primary/60 uppercase tracking-widest text-sm">
            Story {selectedIndex + 1} of {videos?.length}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
