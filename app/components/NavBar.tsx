'use client';

import { AuthComponent } from '@/components/AuthComponent';

export default function NavBar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-xl font-bold">
                NexaFund
              </a>
            </div>
          </div>
          <div className="flex items-center">
            <AuthComponent />
          </div>
        </div>
      </div>
    </nav>
  );
}