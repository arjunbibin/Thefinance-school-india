'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

/**
 * SessionManager monitors user activity and enforces a session timeout.
 * If the user is inactive for a set interval, they are logged out.
 */
export default function SessionManager() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Interval for inactivity (e.g., 30 minutes)
  const INACTIVITY_LIMIT = 30 * 60 * 1000;

  const handleLogout = useCallback(() => {
    if (auth.currentUser) {
      auth.signOut().then(() => {
        router.push('/login');
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "You have been logged out due to inactivity. Please sign in again.",
        });
      });
    }
  }, [auth, router, toast]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (user) {
      timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
    }
  }, [user, handleLogout, INACTIVITY_LIMIT]);

  useEffect(() => {
    if (user) {
      // List of events to track as "activity"
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      const listener = () => resetTimeout();
      
      events.forEach(event => window.addEventListener(event, listener));
      
      // Initialize the first timeout
      resetTimeout();

      return () => {
        events.forEach(event => window.removeEventListener(event, listener));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [user, resetTimeout]);

  return null;
}
