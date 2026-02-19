
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';

const PRIMARY_ADMIN_UID = 'bfCiMYT33fNetne0TXaLYCIu7T03';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const validateAndSyncProfile = async (user: any) => {
    const docRef = doc(db, 'userProfiles', user.uid);
    const docSnap = await getDoc(docRef);
    
    // Auto-promote the primary admin UID if it's their first login or if they are currently a regular user
    if (user.uid === PRIMARY_ADMIN_UID) {
      const adminData = {
        id: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || 'Primary',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || 'Admin',
        role: 'admin',
        registrationDate: new Date().toISOString()
      };
      await setDoc(docRef, adminData, { merge: true });
      return true;
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.role === 'user') {
        await auth.signOut();
        throw new Error('Access Denied: Your account is pending authorization by the Primary Admin.');
      }
      return true;
    } else {
      // Create a base profile for new staff and sign them out until promoted
      await setDoc(docRef, {
        id: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        role: 'user',
        registrationDate: new Date().toISOString()
      });
      await auth.signOut();
      throw new Error('Staff Profile Created: Please contact the Primary Admin to authorize your specific position.');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      await validateAndSyncProfile(result.user);
      toast({ title: "Authorized", description: "Welcome to the Staff Portal." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Access Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await validateAndSyncProfile(userCredential.user);
      toast({ title: "Authorized", description: "Welcome to the Staff Portal." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Staff Access Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-24 px-6 flex items-center justify-center pt-16">
        <Card className="w-full max-w-md finance-3d-shadow border-none rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md">
          <CardHeader className="bg-primary text-white p-10 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="mx-auto w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 finance-3d-shadow transform -rotate-3 transition-transform">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold mb-2">
              Staff Portal Login
            </CardTitle>
            <CardDescription className="text-white/70 font-medium">
              Authorized School Personnel Only
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-10 space-y-6">
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-2 flex items-center justify-center gap-3 font-bold hover:bg-slate-50"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Staff SSO
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-muted-foreground font-bold italic flex items-center gap-1"><Lock className="w-3 h-3" /> Secure Access</span></div>
            </div>

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
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Security Key</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-xl mt-6 hover:scale-[1.02] transition-transform">
                {loading ? 'Verifying Authorization...' : 'Enter Staff Dashboard'}
              </Button>
            </form>
          </CardContent>
          
          <div className="p-10 pt-0 text-center">
             <p className="text-xs text-muted-foreground font-medium italic">
               Unauthorized access to internal school data is strictly monitored.
             </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
