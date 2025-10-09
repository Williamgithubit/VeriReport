'use client';

import { ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useAuthState } from '@/hooks/useAuthState';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { user, loading } = useAuthState();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>VeriReport</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>VeriReport</span>
        </Link>
        
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/verify"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Verify
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">Portal Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
