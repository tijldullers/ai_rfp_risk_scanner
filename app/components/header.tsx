
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <Image
              src="/images/Hidden Connections_A.png"
              alt="Hidden Connections Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-gray-900">Hidden Connections</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {session?.user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
