'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function GalleryPage() {
  const db = useFirestore();
  
  // Fetch dynamic gallery images ordered by creation time (latest first)
  const galleryQuery = useMemoFirebase(() => query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), [db]);
  const { data: remoteImages, isLoading } = useCollection(galleryQuery);

  // Fallback to placeholders if no images are uploaded yet
  const defaultImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-') || img.id.startsWith('slide-'));
  const galleryImages = remoteImages && remoteImages.length > 0 ? remoteImages : defaultImages;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">The School Memories</Badge>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Experience Our <span className="text-accent">Journey</span></h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">A glimpse into the workshops, celebrations, and life-changing moments at The Finance School India.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {galleryImages.map((image: any, index: number) => (
              <Card 
                key={image.id || index} 
                className="group border-none bg-white finance-3d-shadow rounded-[2.5rem] overflow-hidden finance-3d-card animate-in slide-in-from-bottom-20 duration-1000"
                style={{ animationDelay: `${index * 100}ms` }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={image.description || "School Memory"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint={image.imageHint || "school memory"}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                    <p className="text-white font-headline font-bold text-xl">{image.description || "Campus Moment"}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
