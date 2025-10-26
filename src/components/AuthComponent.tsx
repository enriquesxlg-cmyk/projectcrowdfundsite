'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export function AuthComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then((res: unknown) => {
      const session = (res as { data?: { session?: { user?: { email?: string } } | null } }).data?.session ?? null;
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || '');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: unknown, session: unknown) => {
      const s = session as { user?: { email?: string } } | null;
      setIsAuthenticated(!!s);
      setUserEmail(s?.user?.email || '');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated) {
    return (
      <div className="text-sm">
        Signed in as {userEmail}
        <button
          onClick={() => supabase.auth.signOut()}
          className="ml-4 text-red-600 hover:text-red-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#404040',
                brandAccent: '#52525b'
              }
            }
          }
        }}
        providers={['google']}
      />
    </div>
  );
}