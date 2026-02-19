
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Initialize user profile with default 'user' role
        await setDoc(doc(db, 'userProfiles', user.uid), {
          id: user.uid,
          email: user.email,
          role: 'user',
          registrationDate: new Date().toISOString(),
        });

        toast({
          title: "Account Created",
          description: "Welcome to FinanceVerse 3D!",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome back!",
          description: "Login successful.",
        });
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24 px-6 flex items-center justify-center">
        <Card className="w-full max-w-md finance-3d-shadow border-none rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary text-white p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
              {isSignUp ? <UserPlus className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <CardTitle className="text-3xl font-headline font-bold">
              {isSignUp ? 'Join the School' : 'Access Terminal'}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {isSignUp ? 'Begin your journey to financial freedom' : 'Authorized Personnel Only'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@financeschool.in" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Security Key</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg mt-4">
                {loading ? 'Processing...' : isSignUp ? 'Create Profile' : 'Authenticate'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="p-8 pt-0 flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-bold">Alternative</span></div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full text-slate-500 font-bold"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have a profile?' : 'Need to create a profile?'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
