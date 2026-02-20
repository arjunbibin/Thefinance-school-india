
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Play, X, Clapperboard, ChevronLeft, ChevronRight } from 'lucide-react';
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
    duration: 40
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setActiveVideoId(null);
    Object.values(videoRefs.current).forEach(ref => {
      if (ref) {
        ref.pause();
        ref.currentTime = 0;
      }
    });
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

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    const videoData = videos?.find(v => v.id === id);
    const ytId = getYoutubeId(videoData?.videoUrl || '');

    if (activeVideoId !== id) {
      setActiveVideoId(id);
      if (video && !ytId) {
        video.play().catch(() => {
          console.warn("Autoplay blocked by browser");
        });
      }
    } else {
      setActiveVideoId(null);
      if (video && !ytId) {
        video.pause();
      }
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
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">The Success Vault</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">Student <span className="text-accent">Success</span></h1>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Browse through our interactive 3D story cards to see real transformations.
          </p>
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto perspective-1000 overflow-visible px-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="overflow-visible" ref={emblaRef}>
            <div className="flex touch-pan-y py-12 items-center">
              {videos?.map((video, index) => {
                const isActive = selectedIndex === index;
                const isActivated = activeVideoId === video.id;
                const ytId = getYoutubeId(video.videoUrl);
                const diff = index - selectedIndex;

                return (
                  <div 
                    key={video.id} 
                    className={cn(
                      "flex-[0_0_85%] md:flex-[0_0_35%] lg:flex-[0_0_22%] min-w-0 px-4 transition-all duration-700 ease-out preserve-3d",
                      isActive ? "scale-110 z-30 opacity-100 translate-z-20" : "scale-75 z-10 opacity-30 blur-[4px] translate-z-0",
                      !isActive && (diff > 0 || (index === 0 && selectedIndex === videos.length - 1)) ? "rotate-y-[-45deg] -translate-x-12" : "",
                      !isActive && (diff < 0 || (index === videos.length - 1 && selectedIndex === 0)) ? "rotate-y-[45deg] translate-x-12" : ""
                    )}
                  >
                    <div 
                      className={cn(
                        "relative aspect-[9/16] rounded-[3rem] overflow-hidden finance-3d-shadow bg-slate-900 group cursor-pointer transition-all duration-500 border-4",
                        isActive ? "border-white/20" : "border-transparent",
                        isActivated ? "ring-8 ring-accent/40 shadow-[0_0_60px_rgba(14,165,233,0.4)]" : "hover:ring-4 hover:ring-white/10"
                      )}
                      onClick={() => isActive && togglePlay(video.id)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none z-20" />

                      {ytId ? (
                        <div className="w-full h-full relative" key={`yt-${video.id}`}>
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=${isActivated ? 1 : 0}&modestbranding=1&rel=0&controls=0&showinfo=0&mute=${isActivated ? 0 : 1}`}
                            className={cn(
                              "w-full h-full object-cover transition-opacity duration-500",
                              isActivated ? "opacity-100" : "opacity-40 grayscale"
                            )}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                          {!isActivated && <div className="absolute inset-0 z-30 bg-transparent" />} 
                        </div>
                      ) : (
                        <video
                          key={`mp4-${video.id}`}
                          ref={el => { videoRefs.current[video.id] = el; }}
                          src={video.videoUrl}
                          className={cn(
                            "w-full h-full object-cover transition-all duration-500",
                            isActivated ? "opacity-100" : "opacity-40 grayscale"
                          )}
                          playsInline
                          loop
                          muted={!isActivated}
                        />
                      )}
                      
                      {!isActivated && isActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[4px] z-40 group-hover:bg-black/20 transition-all">
                          <div className="w-20 h-20 bg-accent text-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.6)] finance-3d-shadow transform group-hover:scale-110 transition-transform">
                            <Play className="w-10 h-10 fill-primary ml-1" />
                          </div>
                          <div className="mt-8 px-6 py-2 glass-morphism rounded-2xl border border-white/30 animate-in fade-in slide-in-from-bottom-2">
                             <p className="text-white font-headline font-bold text-lg">{video.title || 'Play Story'}</p>
                          </div>
                        </div>
                      )}

                      {isActivated && (
                        <div className="absolute top-6 right-6 z-50">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveVideoId(null);
                              if (!ytId) {
                                videoRefs.current[video.id]?.pause();
                              }
                            }}
                            className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20 shadow-2xl"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      )}

                      <div className="absolute bottom-6 left-6 z-40">
                         <Badge className="bg-primary/80 backdrop-blur-md text-white border-none py-1 px-3 flex items-center gap-2">
                            <Clapperboard className="w-3 h-3" /> HQ Video
                         </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-2 md:px-8 z-50">
            <button onClick={() => emblaApi?.scrollPrev()} className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md finance-3d-shadow flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all transform hover:-translate-x-1"><ChevronLeft className="w-8 h-8" /></button>
            <button onClick={() => emblaApi?.scrollNext()} className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md finance-3d-shadow flex items-center justify-center text-primary pointer-events-auto hover:bg-primary hover:text-white transition-all transform hover:translate-x-1"><ChevronRight className="w-8 h-8" /></button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-8">
          <div className="flex gap-4">
            {videos?.map((_, i) => (
              <button 
                key={i} 
                onClick={() => emblaApi?.scrollTo(i)} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500", 
                  selectedIndex === i ? "w-12 bg-primary shadow-[0_0_10px_rgba(79,70,229,0.5)]" : "w-3 bg-slate-300 hover:bg-slate-400"
                )} 
              />
            ))}
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
             <h2 className="font-headline font-bold text-primary text-3xl md:text-4xl text-center px-6">{videos?.[selectedIndex]?.title || 'Success Story'}</h2>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
