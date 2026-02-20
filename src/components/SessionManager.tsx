'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

/**
 * SessionManager enforces inactivity timeouts and monitors single-session integrity.
 */
export default function SessionManager() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inactivity limit (30 minutes)
  const INACTIVITY_LIMIT = 30 * 60 * 1000;

  // Monitor the user profile for session ID changes
  const profileRef = useMemoFirebase(() => user ? doc(db, 'userProfiles', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  const handleLogout = useCallback((reason?: string) => {
    if (auth.currentUser) {
      auth.signOut().then(() => {
        router.push('/login');
        if (reason) {
          toast({
            variant: "destructive",
            title: reason === 'inactivity' ? "Session Expired" : "Session Invalidated",
            description: reason === 'inactivity' 
              ? "You have been logged out due to inactivity." 
              : "A new login was detected on another device.",
          });
        }
      });
    }
  }, [auth, router, toast]);

  // Check for session ID mismatch (Single Session Enforcement)
  useEffect(() => {
    if (user && profile && pathname.startsWith('/dashboard')) {
      const localSessionId = localStorage.getItem('activeSessionId');
      if (profile.activeSessionId && localSessionId !== profile.activeSessionId) {
        handleLogout('multi-device');
      }
    }
  }, [user, profile, pathname, handleLogout]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (user && pathname.startsWith('/dashboard')) {
      timeoutRef.current = setTimeout(() => handleLogout('inactivity'), INACTIVITY_LIMIT);
    }
  }, [user, pathname, handleLogout, INACTIVITY_LIMIT]);

  useEffect(() => {
    if (user && pathname.startsWith('/dashboard')) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      const listener = () => resetTimeout();
      events.forEach(event => window.addEventListener(event, listener));
      resetTimeout();
      return () => {
        events.forEach(event => window.removeEventListener(event, listener));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [user, pathname, resetTimeout]);

  return null;
}