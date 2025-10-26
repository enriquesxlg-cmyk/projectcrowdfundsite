import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function isAuthorized(request: NextRequest) {
  const adminToken = process.env.ADMIN_SECRET_TOKEN;
  const providedToken = request.headers.get('X-ADMIN-TOKEN');
  
  if (!adminToken || adminToken === 'your_admin_secret_here') {
    console.error('Admin token not properly configured');
    return false;
  }
  
  return adminToken === providedToken;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { campaignId, action } = await request.json();

    if (!campaignId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('campaigns')
      .update({ status: action === 'approve' ? 'approved' : 'rejected' })
      .eq('id', campaignId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
