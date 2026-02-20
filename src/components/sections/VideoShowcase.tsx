
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause } from 'lucide-react';
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

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    if (videos && videos.length > 1) {
      const nextIndex = (currentIndex + 1) % videos.length;
      setCurrentIndex(nextIndex);
    } else if (videos && videos.length === 1) {
      // Replay if only one video
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Effect to automatically play the next video when currentIndex changes
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(() => {
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

      <div className="max-w-5xl mx-auto">
        {/* Main Video Player */}
        <Card className="relative aspect-video w-full overflow-hidden border-none bg-black finance-3d-shadow rounded-[2.5rem] group cursor-pointer">
          {activeVideo && (
            <>
              <video
                ref={videoRef}
                src={activeVideo.videoUrl}
                className="w-full h-full object-cover"
                onEnded={handleVideoEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
                // Security Attributes
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                disablePictureInPicture
                disableRemotePlayback
                playsInline
              />
              
              {/* Control Overlay - Always appears on hover or when paused */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-none",
                isPlaying ? "opacity-0 group-hover:opacity-100 bg-black/20" : "opacity-100"
              )}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-24 h-24 bg-accent text-primary rounded-full flex items-center justify-center finance-3d-shadow hover:scale-110 transition-transform pointer-events-auto shadow-2xl"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 fill-primary" />
                  ) : (
                    <Play className="w-10 h-10 fill-primary ml-1" />
                  )}
                </button>
              </div>

              {/* Info Overlay */}
              <div className={cn(
                "absolute bottom-8 left-8 right-8 flex items-end justify-between pointer-events-none transition-opacity duration-500",
                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}>
                <div className="bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 max-w-[80%]">
                  <h3 className="text-white font-headline font-bold text-2xl mb-1">{activeVideo.title || 'Workshop Highlights'}</h3>
                  <p className="text-white/60 text-sm">Playing Case Study {currentIndex + 1} of {videos.length}</p>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
