
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, ChevronLeft, ChevronRight, X, Video } from 'lucide-react';
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
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Client Success Stories</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">The Success <span className="text-accent">Vault</span></h1>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Explore our curated video feedback in a futuristic 3D gallery. Swipe to navigate between success stories.
          </p>
        </div>

        {/* 3D Techy Carousel */}
        <div className="relative w-full max-w-[1600px] mx-auto perspective-1000 overflow-visible">
          {/* Background Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

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
                      "flex-[0_0_80%] md:flex-[0_0_40%] lg:flex-[0_0_25%] min-w-0 px-6 transition-all duration-700 ease-out preserve-3d",
                      isActive ? "scale-110 z-30 opacity-100 translate-y-0" : "scale-75 z-10 opacity-40 blur-[2px]",
                      !isActive && (diff > 0 || (index === 0 && selectedIndex === videos.length - 1)) ? "rotate-y-[-35deg] -translate-x-12" : "",
                      !isActive && (diff < 0 || (index === videos.length - 1 && selectedIndex === 0)) ? "rotate-y-[35deg] translate-x-12" : ""
                    )}
                  >
                    <div 
                      className={cn(
                        "relative aspect-[9/16] rounded-[3rem] overflow-hidden finance-3d-shadow bg-slate-900 group cursor-pointer transition-all duration-500",
                        isActivated ? "ring-4 ring-accent shadow-[0_0_50px_rgba(14,165,233,0.3)]" : "hover:ring-2 hover:ring-white/20"
                      )}
                      onClick={() => isActive && togglePlay(video.id)}
                    >
                      {/* Reflection Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10" />

                      {ytId ? (
                        <div className="w-full h-full relative">
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=${isActivated ? 1 : 0}&modestbranding=1&rel=0&controls=0&showinfo=0`}
                            className={cn(
                              "w-full h-full object-cover transition-opacity duration-500",
                              isActivated ? "opacity-100" : "opacity-60 grayscale-[0.5]"
                            )}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                          {!isActivated && <div className="absolute inset-0 z-20" />} 
                        </div>
                      ) : (
                        <video
                          ref={el => { videoRefs.current[video.id] = el; }}
                          src={video.videoUrl}
                          className={cn(
                            "w-full h-full object-cover transition-all duration-500",
                            isActivated ? "opacity-100" : "opacity-60 grayscale-[0.5]"
                          )}
                          playsInline
                          loop
                        />
                      )}
                      
                      {/* Play Button Overlay (Inactive or Not playing) */}
                      {!isActivated && isActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-30 group-hover:bg-black/20 transition-all">
                          <div className="w-24 h-24 bg-accent text-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.5)] finance-3d-shadow transform group-hover:scale-110 transition-transform">
                            <Play className="w-10 h-10 fill-primary ml-1" />
                          </div>
                          <div className="mt-6 px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                             <p className="text-white font-headline font-bold text-lg drop-shadow-md">{video.title || 'Play Story'}</p>
                          </div>
                        </div>
                      )}

                      {/* Close Button when active */}
                      {isActivated && (
                        <div className="absolute top-8 right-8 z-40">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveVideoId(null);
                              setIsPlaying(false);
                              if (!ytId) videoRefs.current[video.id]?.pause();
                            }}
                            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/40 transition-all border border-white/20"
                          >
                            <X className="w-8 h-8" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-4 md:px-12 z-40">
            <button onClick={() => emblaApi?.scrollPrev()} className="w-16 h-16 rounded-2xl bg-white/90 finance-3d-shadow flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all transform hover:-translate-x-2"><ChevronLeft className="w-10 h-10" /></button>
            <button onClick={() => emblaApi?.scrollNext()} className="w-16 h-16 rounded-2xl bg-white/90 finance-3d-shadow flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all transform hover:translate-x-2"><ChevronRight className="w-10 h-10" /></button>
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="flex gap-3">
            {videos?.map((_, i) => (
              <button 
                key={i} 
                onClick={() => emblaApi?.scrollTo(i)} 
                className={cn(
                  "h-2 rounded-full transition-all duration-500", 
                  selectedIndex === i ? "w-16 bg-primary shadow-[0_0_15px_rgba(79,70,229,0.4)]" : "w-4 bg-slate-300 hover:bg-slate-400"
                )} 
              />
            ))}
          </div>
          <div className="flex flex-col items-center">
            <Badge className="mb-2 bg-accent/20 text-primary border-none">Story {selectedIndex + 1} of {videos?.length}</Badge>
            <h2 className="font-headline font-bold text-primary text-3xl tracking-tight">{videos?.[selectedIndex]?.title || 'Financial Growth Story'}</h2>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
