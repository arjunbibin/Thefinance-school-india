"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, PlayCircle, Award, Users, Briefcase, BookOpen, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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

  const handleEnrollNow = (link: string) => {
    if (link) {
      router.push(`/register?url=${encodeURIComponent(link)}`);
    }
  };

  if (isLoading) return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 px-6 max-w-7xl mx-auto">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-[550px] w-full rounded-[2.5rem]" />)}
    </div>
  );

  return (
    <section className="py-12 md:py-16 px-6 max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4 text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50 uppercase tracking-widest font-bold">Academic Programs</Badge>
        <h2 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight">Courses Designed for <span className="text-primary underline decoration-accent underline-offset-8">Future Leaders</span></h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg italic">Programs consist of live interaction and pre recorded videos only.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {remoteCourses?.map((course: any, index: number) => {
          const IconComponent = CATEGORY_ICON_MAP[course.category] || BookOpen;
          return (
            <Card key={course.id} className="group finance-3d-card border-none bg-white finance-3d-shadow overflow-hidden flex flex-col h-full rounded-[2.5rem]">
              <div className="relative h-56 w-full overflow-hidden">
                <Image src={course.imageUrl} alt={course.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" draggable={false} />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                  <Badge className="bg-accent text-primary font-bold shadow-lg"><Star className="w-3 h-3 fill-primary mr-1" /> {course.rating}</Badge>
                  <span className="text-white text-sm font-semibold flex items-center gap-1.5 backdrop-blur-sm px-3 py-1 rounded-full bg-white/10"><PlayCircle className="w-4 h-4" /> {course.lessons}</span>
                </div>
              </div>
              <CardHeader className="flex-1 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-2xl bg-slate-50 finance-3d-shadow-inner text-primary group-hover:text-accent transition-colors"><IconComponent className="w-7 h-7" /></div>
                  <Badge variant="secondary" className="bg-primary text-white">{course.category}</Badge>
                </div>
                <CardTitle className="text-2xl font-headline font-bold tracking-tight mb-1">{course.title}</CardTitle>
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3">{course.subtitle}</p>
                <CardDescription className="line-clamp-3">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-2">
                  {course.highlights?.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> {item}</div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-8 px-6">
                <Button 
                  onClick={() => handleEnrollNow(course.buyLink)}
                  className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-5 h-5" /> Enroll Now <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
