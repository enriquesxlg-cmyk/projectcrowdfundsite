import { NextResponse } from 'next/server';

async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  // @ts-ignore
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

// Get connections for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const status = searchParams.get('status'); // pending, accepted, rejected

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const supabase = await getAdminClient();

    let query = supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey (
          user_id,
          full_name,
          avatar_url,
          bio,
          user_type,
          company_id
        ),
        recipient:profiles!connections_recipient_id_fkey (
          user_id,
          full_name,
          avatar_url,
          bio,
          user_type,
          company_id
        )
      `)
      .or(`requester_id.eq.${user_id},recipient_id.eq.${user_id}`);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching connections:', error);
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }

    return NextResponse.json({ connections: data || [] });
  } catch (err) {
    console.error('Connections route error:', err);
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }
}

// Create connection request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requester_id, recipient_id, message } = body;

    if (!requester_id || !recipient_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (requester_id === recipient_id) {
      return NextResponse.json({ error: 'Cannot connect with yourself' }, { status: 400 });
    }

    const supabase = await getAdminClient();

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('connections')
      .select('id, status')
      .or(`and(requester_id.eq.${requester_id},recipient_id.eq.${recipient_id}),and(requester_id.eq.${recipient_id},recipient_id.eq.${requester_id})`)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Connection already exists', status: existing.status }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('connections')
      .insert({
        requester_id,
        recipient_id,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating connection:', error);
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
    }

    return NextResponse.json({ connection: data });
  } catch (err) {
    console.error('Connection route error:', err);
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}

// Update connection status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { connection_id, status, user_id } = body;

    if (!connection_id || !status || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['accepted', 'rejected', 'blocked'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = await getAdminClient();

    // Verify user is the recipient
    const { data: connection } = await supabase
      .from('connections')
      .select('recipient_id')
      .eq('id', connection_id)
      .single();

    if (!connection || connection.recipient_id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('connections')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', connection_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating connection:', error);
      return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
    }

    return NextResponse.json({ connection: data });
  } catch (err) {
    console.error('Connection update error:', err);
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}
