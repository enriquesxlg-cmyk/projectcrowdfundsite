import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatMoney } from '@/lib/format';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('title, goal_cents, raised_cents, hero_image_url')
    .eq('slug', slug)
    .single();

  const title = campaign?.title || 'Campaign';
  const goal = (campaign?.goal_cents ?? 0) / 100;
  const raised = (campaign?.raised_cents ?? 0) / 100;
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0ea5e9"/>
        <stop offset="100%" stop-color="#2563eb"/>
      </linearGradient>
      <style>
        .title { font: 700 48px 'Segoe UI', Roboto, sans-serif; fill: #0f172a; }
        .meta { font: 500 24px 'Segoe UI', Roboto, sans-serif; fill: #334155; }
      </style>
    </defs>
    <rect width="1200" height="630" fill="#f8fafc"/>
    <rect x="60" y="80" width="1080" height="200" rx="16" fill="#fff" stroke="#e5e7eb" />
    <text x="90" y="160" class="title">${escapeXml(title).slice(0, 80)}</text>
  <text x="90" y="210" class="meta">${formatMoney(raised)} raised of ${formatMoney(goal)} • ${progress}%</text>
    <rect x="90" y="235" width="960" height="20" rx="10" fill="#e5e7eb" />
    <rect x="90" y="235" width="${9.6 * progress}" height="20" rx="10" fill="url(#g)" />
    <text x="60" y="330" class="meta">Join others in supporting this campaign</text>
  </svg>`;

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=600' },
  });
}

function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
