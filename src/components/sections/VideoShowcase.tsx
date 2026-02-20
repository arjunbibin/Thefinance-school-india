
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, SkipForward, Video as VideoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VideoShowcase() {
  const db = useFirestore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videosQuery = useMemoFirebase(() => 
    query(collection(db, 'videos'), orderBy('order', 'asc')), 
    [db]
  );
  const { data: videos, isLoading } = useCollection(videosQuery);

  const activeVideo = videos && videos.length > 0 ? videos[currentIndex] : null;

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    if (videos && videos.length > 1) {
      const nextIndex = (currentIndex + 1) % videos.length;
      setCurrentIndex(nextIndex);
      // Auto-play the next video after state update
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle potential play() interruption/failure
        setIsPlaying(false);
      });
    }
  }, [currentIndex, isPlaying]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!videos || videos.length === 0) return null;

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Showcase</Badge>
        <h2 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Our <span className="text-accent">Success Stories</span> in Action</h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">Watch our interactive workshops and the transformation of our students.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Main Video Player */}
        <div className="lg:col-span-2">
          <Card className="relative aspect-video w-full overflow-hidden border-none bg-black finance-3d-shadow rounded-[2.5rem] group">
            {activeVideo && (
              <>
                <video
                  ref={videoRef}
                  src={activeVideo.videoUrl}
                  className="w-full h-full object-cover"
                  onEnded={handleVideoEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all group-hover:bg-black/20">
                    <button 
                      onClick={handlePlayClick}
                      className="w-24 h-24 bg-accent text-primary rounded-full flex items-center justify-center finance-3d-shadow hover:scale-110 transition-transform"
                    >
                      <Play className="w-10 h-10 fill-primary ml-1" />
                    </button>
                  </div>
                )}

                <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 max-w-[80%]">
                    <h3 className="text-white font-headline font-bold text-2xl mb-1">{activeVideo.title || 'Workshop Highlights'}</h3>
                    <p className="text-white/60 text-sm">Now Playing: Video {currentIndex + 1} of {videos.length}</p>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Playlist / Next Up */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
             <VideoIcon className="w-5 h-5 text-accent" />
             <h4 className="font-headline font-bold text-primary text-xl">Playlist</h4>
          </div>
          
          <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(true);
                }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-all border-none finance-3d-shadow",
                  currentIndex === index 
                    ? "bg-primary text-white scale-[1.02]" 
                    : "bg-white text-muted-foreground hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  currentIndex === index ? "bg-white/20" : "bg-primary/10 text-primary"
                )}>
                  {currentIndex === index && isPlaying ? (
                    <div className="flex gap-1 items-end h-4">
                      <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <Play className={cn("w-5 h-5", currentIndex === index ? "fill-white" : "fill-primary")} />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm truncate">{video.title || `Video ${index + 1}`}</p>
                  <p className={cn("text-xs", currentIndex === index ? "text-white/60" : "text-muted-foreground")}>
                    {currentIndex === index ? 'Playing' : 'Up next'}
                  </p>
                </div>
                {currentIndex === index && <SkipForward className="w-4 h-4 opacity-50" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
