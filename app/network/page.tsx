'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Profile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  user_type: string;
  location: string | null;
  seeking_mentorship: boolean;
}

interface Connection {
  id: string;
  status: string;
  requester: Profile;
  recipient: Profile;
  message: string | null;
  created_at: string;
}

export default function NetworkPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please sign in to access networking features');
          setLoading(false);
          return;
        }

        setCurrentUser(user);

        // Fetch user's connections
        const connectionsRes = await fetch(`/api/connections?user_id=${user.id}`);
        const connectionsData = await connectionsRes.json();
        
        if (connectionsRes.ok) {
          const allConnections = connectionsData.connections || [];
          setConnections(allConnections.filter((c: Connection) => c.status === 'accepted'));
          setPendingRequests(allConnections.filter(
            (c: Connection) => c.status === 'pending' && c.recipient.user_id === user.id
          ));
        }

        // Fetch suggested profiles (seeking mentorship or companies)
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .neq('user_id', user.id)
          .or('seeking_mentorship.eq.true,user_type.eq.company')
          .limit(20);

        if (profilesData) {
          setProfiles(profilesData);
        }
      } catch (err) {
        setError('Failed to load network data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  async function sendConnectionRequest(recipientId: string) {
    if (!currentUser) return;

    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_id: currentUser.id,
          recipient_id: recipientId,
          message: "I'd like to connect with you on NexaFund",
        }),
      });

      if (res.ok) {
        alert('Connection request sent!');
        // Remove from suggested profiles
        setProfiles(profiles.filter(p => p.user_id !== recipientId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send connection request');
      }
    } catch (err) {
      alert('Failed to send connection request');
    }
  }

  async function respondToRequest(connectionId: string, status: 'accepted' | 'rejected') {
    if (!currentUser) return;

    try {
      const res = await fetch('/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_id: connectionId,
          status,
          user_id: currentUser.id,
        }),
      });

      if (res.ok) {
        setPendingRequests(pendingRequests.filter(r => r.id !== connectionId));
        if (status === 'accepted') {
          // Reload connections
          const connectionsRes = await fetch(`/api/connections?user_id=${currentUser.id}&status=accepted`);
          const connectionsData = await connectionsRes.json();
          if (connectionsRes.ok) {
            setConnections(connectionsData.connections || []);
          }
        }
      } else {
        alert('Failed to update connection');
      }
    } catch (err) {
      alert('Failed to update connection');
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Network</h1>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Connection Requests</h2>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-purple-200 bg-purple-50/30 p-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {request.requester.avatar_url ? (
                    <img
                      src={request.requester.avatar_url}
                      alt={request.requester.full_name}
                      className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white font-semibold flex-shrink-0">
                      {request.requester.full_name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/profile/${request.requester.user_id}`}
                      className="font-semibold hover:text-purple-600 block truncate"
                    >
                      {request.requester.full_name}
                    </Link>
                    <p className="text-sm text-gray-600 truncate">{request.message}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => respondToRequest(request.id, 'accepted')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToRequest(request.id, 'rejected')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Connections */}
      {connections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">My Connections ({connections.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((connection) => {
              const otherUser = connection.requester.user_id === currentUser?.id 
                ? connection.recipient 
                : connection.requester;
              
              return (
                <Link
                  key={connection.id}
                  href={`/profile/${otherUser.user_id}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  {otherUser.avatar_url ? (
                    <img
                      src={otherUser.avatar_url}
                      alt={otherUser.full_name}
                      className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white font-semibold flex-shrink-0">
                      {otherUser.full_name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{otherUser.full_name}</div>
                    {otherUser.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">{otherUser.bio}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Connections */}
      <div>
        <h2 className="text-2xl font-bold mb-4">People You May Know</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.user_id}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex flex-col items-center text-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-20 w-20 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white text-2xl font-bold mb-4">
                    {profile.full_name[0].toUpperCase()}
                  </div>
                )}
                
                <Link
                  href={`/profile/${profile.user_id}`}
                  className="font-bold text-lg hover:text-purple-600 mb-1"
                >
                  {profile.full_name}
                </Link>

                {profile.seeking_mentorship && (
                  <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mb-2">
                    Seeking Mentorship
                  </span>
                )}

                {profile.user_type === 'company' && (
                  <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mb-2">
                    Company
                  </span>
                )}

                {profile.location && (
                  <p className="text-sm text-gray-500 mb-2">📍 {profile.location}</p>
                )}

                {profile.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.bio}</p>
                )}

                <button
                  onClick={() => sendConnectionRequest(profile.user_id)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>

        {profiles.length === 0 && (
          <p className="text-center text-gray-600 py-12">No suggestions at this time</p>
        )}
      </div>
    </main>
  );
}
