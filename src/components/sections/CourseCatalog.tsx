"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, TrendingUp, ShieldCheck, PieChart, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

const courses = [
  {
    id: 1,
    title: "Market Fundamentals",
    description: "Master the psychology of trading and the mathematics of market dynamics in a rich 3D visualization.",
    image: PlaceHolderImages.find(img => img.id === 'course-1')?.imageUrl || '',
    category: "Beginner",
    icon: TrendingUp,
    lessons: 12,
    rating: 4.8
  },
  {
    id: 2,
    title: "Advanced Crypto Assets",
    description: "Explore the depths of decentralized finance, smart contracts, and liquid staking via interactive modules.",
    image: PlaceHolderImages.find(img => img.id === 'course-2')?.imageUrl || '',
    category: "Intermediate",
    icon: ShieldCheck,
    lessons: 24,
    rating: 4.9
  },
  {
    id: 3,
    title: "Wealth Architecture",
    description: "Design your long-term wealth roadmap using professional portfolio rebalancing tools and simulations.",
    image: PlaceHolderImages.find(img => img.id === 'course-3')?.imageUrl || '',
    category: "Professional",
    icon: PieChart,
    lessons: 18,
    rating: 5.0
  }
];

export default function CourseCatalog() {
  return (
    <section id="courses" className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-1/4 -right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-16 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50">Educational Paths</Badge>
        <h2 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight">Your <span className="text-primary underline decoration-accent underline-offset-8">Financial Frontier</span></h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Harness the power of 3D-enhanced education to visual complex financial systems with crystal clarity.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {courses.map((course, index) => (
          <Card key={course.id} 
            className="group finance-3d-card border-none bg-white finance-3d-shadow overflow-hidden flex flex-col h-full animate-in slide-in-from-bottom-20 duration-1000"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="relative h-56 w-full overflow-hidden">
              <Image 
                src={course.image} 
                alt={course.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                data-ai-hint="finance course"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                 <Badge className="bg-accent text-primary font-bold shadow-lg flex items-center gap-1">
                   <Star className="w-3 h-3 fill-primary" /> {course.rating}
                 </Badge>
                 <span className="text-white text-sm font-semibold drop-shadow-md flex items-center gap-1.5 backdrop-blur-sm px-3 py-1 rounded-full bg-white/10">
                   <PlayCircle className="w-4 h-4" /> {course.lessons} modules
                 </span>
              </div>
              
              <div className="absolute top-4 right-4 z-10 translate-y-[-100%] group-hover:translate-y-0 transition-transform">
                <Badge variant="secondary" className="bg-primary/90 text-white font-headline">{course.category}</Badge>
              </div>
            </div>

            <CardHeader className="flex-1 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-2xl bg-slate-50 finance-3d-shadow-inner text-primary group-hover:text-accent transition-colors duration-300">
                  <course.icon className="w-7 h-7" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                {course.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Course Completion</span>
                <span className="font-bold text-primary">0%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-primary/10 w-0 rounded-full group-hover:w-full transition-all duration-1000 ease-out" />
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold group rounded-xl transition-all shadow-xl hover:shadow-primary/20">
                Enroll in Course
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
