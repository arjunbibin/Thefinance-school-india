
'use client';

import React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

const slides = [
  {
    id: 'slide-1',
    title: 'Interactive Workshops',
    description: 'Students getting hands-on experience with real-world financial scenarios.'
  },
  {
    id: 'slide-2',
    title: 'Leadership Seminars',
    description: 'Developing the next generation of confident CEOs and entrepreneurs.'
  },
  {
    id: 'slide-3',
    title: 'Modern Learning',
    description: 'Our digital-first approach ensures accessibility and engagement.'
  }
];

export default function ShowcaseSlideshow() {
  // Use a ref to maintain a stable plugin instance across renders
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Campus Life</Badge>
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary">Experience <span className="text-accent">The School</span></h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Take a glimpse into our interactive workshops and collaborative learning environment.</p>
      </div>

      <div className="px-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent>
            {slides.map((slide) => {
              const imageData = PlaceHolderImages.find(img => img.id === slide.id);
              return (
                <CarouselItem key={slide.id}>
                  <Card className="border-none bg-white finance-3d-shadow rounded-[3rem] overflow-hidden">
                    <CardContent className="p-0 relative aspect-[21/9] min-h-[400px]">
                      <Image
                        src={imageData?.imageUrl || ''}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        data-ai-hint={imageData?.imageHint || 'education'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                        <h3 className="text-3xl md:text-5xl font-headline font-bold text-white mb-4">{slide.title}</h3>
                        <p className="text-white/80 text-lg md:text-xl max-w-2xl">{slide.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="finance-3d-shadow border-none bg-white hover:bg-accent hover:text-primary transition-all -left-6 h-12 w-12" />
          <CarouselNext className="finance-3d-shadow border-none bg-white hover:bg-accent hover:text-primary transition-all -right-6 h-12 w-12" />
        </Carousel>
      </div>
    </section>
  );
}
