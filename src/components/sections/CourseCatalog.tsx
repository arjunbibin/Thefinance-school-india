"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle, Award, Users, Briefcase, Star, CheckCircle2, BookOpen, ShoppingCart, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const DEFAULT_COURSES = [
  {
    id: 'course-1',
    title: "Finance for Life",
    subtitle: "Basic Financial Literacy & Entrepreneurship",
    description: "A foundational program introducing children to money, savings, smart spending, and entrepreneurial thinking.",
    imageUrl: PlaceHolderImages.find(img => img.id === 'course-1')?.imageUrl || '',
    category: "Foundational",
    lessons: "13+ Topics",
    rating: 4.8,
    highlights: ["Needs vs Wants", "Banking Basics", "Compounding Magic"],
    buyLink: "https://thefinschool.nurturecrm.in/publicwebform/0dd471d0-33bc-4a23-a83f-7881c4577842"
  },
  {
    id: 'course-2',
    title: "Rise and Lead",
    subtitle: "Leadership & Personality Development",
    description: "Skill-based training focused on confidence, communication, public speaking, and employability skills.",
    imageUrl: PlaceHolderImages.find(img => img.id === 'course-2')?.imageUrl || '',
    category: "Leadership",
    lessons: "18+ Topics",
    rating: 4.9,
    highlights: ["Public Speaking", "Emotional Intelligence", "Personal Branding"],
    buyLink: "https://thefinschool.nurturecrm.in/publicwebform/0dd471d0-33bc-4a23-a83f-7881c4577842"
  },
  {
    id: 'course-3',
    title: "Little CEO",
    subtitle: "Advanced Premium Program",
    description: "Our most comprehensive program teaching the inner workings of business, profit/loss, and strategic leadership.",
    imageUrl: PlaceHolderImages.find(img => img.id === 'course-3')?.imageUrl || '',
    category: "Premium",
    lessons: "Full Suite",
    rating: 5.0,
    highlights: ["Business Strategy", "Ethical Leadership", "Practical Case Studies"],
    buyLink: "https://thefinschool.nurturecrm.in/publicwebform/0dd471d0-33bc-4a23-a83f-7881c4577842"
  }
];

const CATEGORY_ICON_MAP: Record<string, any> = {
  "Foundational": Award,
  "Leadership": Users,
  "Premium": Briefcase
};

function CourseSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-none bg-white finance-3d-shadow overflow-hidden flex flex-col h-[550px] rounded-[2.5rem]">
          <Skeleton className="h-56 w-full" />
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full mt-auto rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function CourseCatalog() {
  const db = useFirestore();
  const router = useRouter();
  const coursesQuery = useMemoFirebase(() => query(collection(db, 'courses'), orderBy('order', 'asc')), [db]);
  const { data: remoteCourses, isLoading } = useCollection(coursesQuery);

  const courses = remoteCourses && remoteCourses.length > 0 ? remoteCourses : DEFAULT_COURSES;

  const handleBuyNow = (link: string) => {
    if (link) {
      router.push(`/register?url=${encodeURIComponent(link)}`);
    }
  };

  return (
    <section className="py-12 md:py-16 px-6 max-w-7xl mx-auto relative overflow-hidden min-h-[800px]">
      <div className="mb-12 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Our Programs</Badge>
        <h2 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight">Courses Designed for <span className="text-primary underline decoration-accent underline-offset-8">Future Leaders</span></h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg italic">"Building financial awareness and real-life readiness among children."</p>
      </div>

      {isLoading ? (
        <CourseSkeleton />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course: any, index: number) => {
            const IconComponent = CATEGORY_ICON_MAP[course.category] || BookOpen;
            
            return (
              <Card key={course.id} 
                className="group finance-3d-card border-none bg-white finance-3d-shadow overflow-hidden flex flex-col h-full animate-in slide-in-from-bottom-20 duration-1000 rounded-[2.5rem]"
                style={{ animationDelay: `${index * 150}ms` }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image 
                    src={course.imageUrl} 
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint="child education"
                    draggable={false}
                    priority={index < 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                    <Badge className="bg-accent text-primary font-bold shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-primary" /> {course.rating}
                    </Badge>
                    <span className="text-white text-sm font-semibold drop-shadow-md flex items-center gap-1.5 backdrop-blur-sm px-3 py-1 rounded-full bg-white/10">
                      <PlayCircle className="w-4 h-4" /> {course.lessons}
                    </span>
                  </div>
                </div>

                <CardHeader className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-2xl bg-slate-50 finance-3d-shadow-inner text-primary group-hover:text-accent transition-colors duration-300">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <Badge variant="secondary" className="bg-primary/90 text-white font-headline">{course.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl font-headline font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">{course.subtitle}</p>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 pb-4 space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {course.highlights?.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-8 px-6">
                  <Button 
                    onClick={() => handleBuyNow(course.buyLink)}
                    className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <ShoppingCart className="w-5 h-5" /> Buy Now <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}