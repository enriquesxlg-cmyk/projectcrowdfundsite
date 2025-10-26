"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WalletMini } from '@/components/Wallet';

export default function TopBar() {
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (!popRef.current) return;
      const target = e.target as Node;
      if (!popRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const isCampaignsActive = pathname === '/campaigns';
  const isSuccessStoriesActive = pathname === '/success-stories';
  const isMentorshipActive = pathname === '/mentorship' || pathname?.startsWith('/mentorship/');
  const isNetworkActive = pathname === '/network';

  return (
    <div className="border-b sticky top-0 z-20 bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">NexaFund</Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/campaigns" 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isCampaignsActive 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              Browse Campaigns
            </Link>
            <Link 
              href="/mentorship" 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isMentorshipActive 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              Mentorships
            </Link>
            <Link 
              href="/network" 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isNetworkActive 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              Network
            </Link>
            <Link 
              href="/success-stories" 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isSuccessStoriesActive 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              Success Stories
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 relative" ref={popRef}>
          <Link
            href="/campaign/new"
            className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1"
          >
            Start a Campaign
          </Link>
          <button
            type="button"
            aria-label="Wallet"
            onClick={() => setOpen(v => !v)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1"
            title="Wallet"
          >
            <span className="text-lg" aria-hidden>💼</span>
          </button>
          {open && (
            <div className="absolute right-0 top-11 w-80 max-w-[90vw] bg-white border rounded-lg shadow-lg p-3">
              <WalletMini />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
