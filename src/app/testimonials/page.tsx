
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, ChevronLeft, ChevronRight, X } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

export default function TestimonialVideosPage() {
  const db = useFirestore();
  const videosQuery = useMemoFirebase(() => query(collection(db, 'testimonialVideos'), orderBy('order', 'asc')), [db]);
  const { data: videos, isLoading } = useCollection(videosQuery);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'center',
    skipSnaps: false,
    duration: 35
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    // Auto-stop playback when switching context
    setIsPlaying(false);
    setActiveVideoId(null);
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
    const isYt = !!getYoutubeId(videos?.find(v => v.id === id)?.videoUrl || '');

    if (activeVideoId !== id) {
      setActiveVideoId(id);
      setIsPlaying(true);
      if (video && !isYt) video.play();
    } else {
      if (!isYt && video) {
        if (isPlaying) video.pause();
        else video.play();
        setIsPlaying(!isPlaying);
      } else if (isYt) {
        setIsPlaying(!isPlaying);
      }
    }
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Video Testimonials</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">Our <span className="text-accent">Success Hub</span></h1>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Browse through real experiences in our mobile-app switcher carousel. Swipe to navigate.
          </p>
        </div>

        {/* 3D App Switcher Carousel */}
        <div className="relative w-full max-w-[1600px] mx-auto perspective-1000 overflow-visible">
          <div className="overflow-visible" ref={emblaRef}>
            <div className="flex touch-pan-y py-12">
              {videos?.map((video, index) => {
                const isActive = selectedIndex === index;
                const isActivated = activeVideoId === video.id;
                const ytId = getYoutubeId(video.videoUrl);
                const diff = index - selectedIndex;

                return (
                  <div 
                    key={video.id} 
                    className={cn(
                      "flex-[0_0_80%] md:flex-[0_0_35%] lg:flex-[0_0_22%] min-w-0 px-4 transition-all duration-700 ease-out preserve-3d",
                      isActive ? "scale-110 z-30 opacity-100 translate-y-0" : "scale-90 z-10 opacity-40 blur-[1px]",
                      !isActive && diff > 0 ? "rotate-y-[-20deg] -translate-x-6" : "",
                      !isActive && diff < 0 ? "rotate-y-[20deg] translate-x-6" : ""
                    )}
                  >
                    <div 
                      className={cn(
                        "relative aspect-[9/16] rounded-[2.5rem] overflow-hidden finance-3d-shadow bg-black group cursor-pointer transition-all duration-500",
                        isActivated ? "ring-4 ring-accent shadow-2xl" : "hover:ring-2 hover:ring-white/20"
                      )}
                      onClick={() => isActive && togglePlay(video.id)}
                    >
                      {ytId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=${isActivated ? 1 : 0}&modestbranding=1&rel=0`}
                          className="w-full h-full object-cover pointer-events-auto"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          ref={el => { videoRefs.current[video.id] = el; }}
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          playsInline
                          loop
                        />
                      )}
                      
                      {!isActivated && isActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                          <button className="w-20 h-20 bg-accent text-primary rounded-full flex items-center justify-center shadow-2xl finance-3d-shadow transform group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 fill-primary ml-1" />
                          </button>
                          <p className="mt-4 text-white font-headline font-bold text-lg drop-shadow-md">{video.title || 'Play Story'}</p>
                        </div>
                      )}

                      {isActivated && (
                        <div className="absolute top-6 right-6 z-40">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveVideoId(null);
                              setIsPlaying(false);
                              if (!ytId) videoRefs.current[video.id]?.pause();
                            }}
                            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all border border-white/10"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-4 md:px-12 z-40">
            <button onClick={() => emblaApi?.scrollPrev()} className="w-14 h-14 rounded-full bg-white/90 finance-3d-shadow flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all"><ChevronLeft className="w-8 h-8" /></button>
            <button onClick={() => emblaApi?.scrollNext()} className="w-14 h-14 rounded-full bg-white/90 finance-3d-shadow flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all"><ChevronRight className="w-8 h-8" /></button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {videos?.map((_, i) => (
              <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={cn("h-2 rounded-full transition-all duration-500", selectedIndex === i ? "w-12 bg-primary" : "w-3 bg-slate-300 hover:bg-slate-400")} />
            ))}
          </div>
          <p className="font-headline font-bold text-primary text-xl">{videos?.[selectedIndex]?.title || 'Success Story'}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
