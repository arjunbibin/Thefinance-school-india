
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle, Award, Users, Briefcase, Star, CheckCircle2, BookOpen, ShoppingCart, ArrowRight } from 'lucide-react';
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

export default function CourseCatalog() {
  const db = useFirestore();
  const router = useRouter();
  const coursesQuery = useMemoFirebase(() => query(collection(db, 'courses'), orderBy('order', 'asc')), [db]);
  const { data: remoteCourses, isLoading } = useCollection(coursesQuery);

  const courses = remoteCourses && remoteCourses.length > 0 ? remoteCourses : DEFAULT_COURSES;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 min-h-[500px]">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleBuyNow = (link: string) => {
    if (link) {
      router.push(`/register?url=${encodeURIComponent(link)}`);
    }
  };

  return (
    <section className="py-12 md:py-16 px-6 max-w-7xl mx-auto relative overflow-hidden min-h-[600px]">
      <div className="absolute top-1/4 -right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-12 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Our Programs</Badge>
        <h2 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight">Courses Designed for <span className="text-primary underline decoration-accent underline-offset-8">Future Leaders</span></h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg italic">"Building financial awareness and real-life readiness among children."</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {courses.map((course: any, index: number) => {
          const IconComponent = CATEGORY_ICON_MAP[course.category] || BookOpen;
          
          return (
            <Card key={course.id} 
              className="group finance-3d-card border-none bg-white finance-3d-shadow overflow-hidden flex flex-col h-full animate-in slide-in-from-bottom-20 duration-1000"
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
    </section>
  );
}
