
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
    <section className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-24 pb-4 md:pb-8">
      <div className="mb-10 text-center px-4">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-4 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest text-[10px] md:text-xs font-bold">Campus Life</Badge>
        <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary tracking-tight">Experience <span className="text-accent">The School</span></h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm md:text-lg opacity-80">Take a glimpse into our interactive workshops and collaborative learning environment.</p>
      </div>

      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {slides.map((slide) => {
              const imageData = PlaceHolderImages.find(img => img.id === slide.id);
              return (
                <CarouselItem key={slide.id} className="pl-2 md:pl-4">
                  <Card className="border-none bg-white finance-3d-shadow rounded-[2rem] md:rounded-[3rem] overflow-hidden">
                    <CardContent className="p-0 relative aspect-[16/9] md:aspect-[21/9]">
                      <Image
                        src={imageData?.imageUrl || ''}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        data-ai-hint={imageData?.imageHint || 'education'}
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-12">
                        <h3 className="text-xl md:text-5xl font-headline font-bold text-white mb-2 md:mb-4">{slide.title}</h3>
                        <p className="text-white/80 text-xs md:text-xl max-w-2xl leading-relaxed">{slide.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden xl:flex finance-3d-shadow border-none bg-white hover:bg-accent hover:text-primary transition-all -left-16 h-12 w-12" />
          <CarouselNext className="hidden xl:flex finance-3d-shadow border-none bg-white hover:bg-accent hover:text-primary transition-all -right-16 h-12 w-12" />
        </Carousel>
      </div>
    </section>
  );
}
