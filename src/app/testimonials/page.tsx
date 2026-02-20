
'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Play, X, Clapperboard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function TestimonialVideosPage() {
  const db = useFirestore();
  const videosQuery = useMemoFirebase(() => query(collection(db, 'testimonialVideos'), orderBy('order', 'asc')), [db]);
  const { data: videos, isLoading } = useCollection(videosQuery);

  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    // Robust regex to handle standard, shorts, embed, and share links
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
        <div className="mb-16 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">The Success Vault</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-primary tracking-tight">Student <span className="text-accent">Success</span></h1>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Browse through real transformations from The Finance School India.
          </p>
        </div>

        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {videos.map((video, index) => {
              const ytId = getYoutubeId(video.videoUrl);
              return (
                <Card 
                  key={video.id} 
                  className="group border-none bg-white finance-3d-shadow rounded-[2.5rem] overflow-hidden finance-3d-card cursor-pointer animate-in slide-in-from-bottom-20 duration-1000"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-[9/16] w-full bg-slate-900">
                    {/* Thumbnail Preview */}
                    {ytId ? (
                      <img 
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                        alt={video.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <video 
                        src={video.videoUrl} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        muted
                        playsInline
                      />
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                      <div className="w-20 h-20 bg-accent text-primary rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                        <Play className="w-10 h-10 fill-primary ml-1" />
                      </div>
                      <div className="mt-8 px-6 py-2 glass-morphism rounded-2xl border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                         <p className="text-white font-headline font-bold text-lg">{video.title || 'Watch Story'}</p>
                      </div>
                    </div>

                    <div className="absolute top-6 left-6 z-30">
                       <Badge className="bg-primary/80 backdrop-blur-md text-white border-none py-1 px-3 flex items-center gap-2">
                          <Clapperboard className="w-3 h-3" /> 9:16 Shorts
                       </Badge>
                    </div>
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

        {/* Video Playback Modal */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-md w-[95vw] p-0 bg-transparent border-none rounded-none shadow-none flex items-center justify-center">
            <DialogTitle className="sr-only">Video Playback</DialogTitle>
            <div className="relative w-full aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10">
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>

              {selectedVideo && (
                getYoutubeId(selectedVideo.videoUrl) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo.videoUrl)}?autoplay=1&modestbranding=1&rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                )
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
