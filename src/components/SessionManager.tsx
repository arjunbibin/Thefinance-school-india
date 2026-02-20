'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth, useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

/**
 * SessionManager monitors user activity and enforces a session timeout.
 * It no longer signs out users when they navigate away from the dashboard.
 */
export default function SessionManager() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Interval for inactivity (e.g., 30 minutes)
  const INACTIVITY_LIMIT = 30 * 60 * 1000;

  const handleLogout = useCallback((reason?: string) => {
    if (auth.currentUser) {
      auth.signOut().then(() => {
        if (reason === 'inactivity') {
          router.push('/login');
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "You have been logged out due to inactivity. Please sign in again.",
          });
        }
      });
    }
  }, [auth, router, toast]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Only monitor inactivity while on the dashboard
    if (user && pathname === '/dashboard') {
      timeoutRef.current = setTimeout(() => handleLogout('inactivity'), INACTIVITY_LIMIT);
    }
  }, [user, pathname, handleLogout, INACTIVITY_LIMIT]);

  useEffect(() => {
    if (user && pathname === '/dashboard') {
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
  }, [user, pathname, resetTimeout]);

  return null;
}
