'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDateTime } from '@/lib/format';

type ReportItem = {
  id: string;
  campaign_id: string;
  reporter_id: string;
  reason: string;
  created_at: string;
  resolved: boolean;
  campaign: { id: string; title: string; slug: string } | null;
  reporter: { user_id: string; full_name: string | null } | null;
};

export default function AdminReportsPage() {
  const [token, setToken] = useState('');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) setToken(saved);
  }, []);

  const headers = useMemo(() => ({
    'x-admin-token': token,
  }), [token]);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/reports/list', { headers });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json = await res.json();
      setReports(json.reports || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load reports. Check your admin token.');
    } finally {
      setLoading(false);
    }
  }

  async function resolveReport(id: string) {
    setResolving(id);
    setError(null);
    try {
      const res = await fetch('/api/admin/reports/resolve', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ reportId: id }),
      });
      if (!res.ok) throw new Error('Failed to resolve');
      await loadReports();
    } catch (e) {
      console.error(e);
      setError('Failed to resolve report.');
    } finally {
      setResolving(null);
    }
  }

  function saveToken() {
    localStorage.setItem('admin_token', token);
    loadReports();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <div className="bg-gray-50 border rounded-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700">Admin token</label>
        <div className="mt-1 flex gap-2">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
            placeholder="Enter ADMIN_SECRET_TOKEN"
          />
          <button onClick={saveToken} className="bg-blue-600 text-white px-4 rounded-md">Save</button>
          <button onClick={loadReports} className="border px-3 rounded-md">Refresh</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Stored locally in this browser only.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-600">No reports.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Campaign</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Reason</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Reporter</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Created</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {r.campaign ? (
                      <a href={`/campaign/${r.campaign.slug}`} className="text-blue-600 hover:underline">{r.campaign.title}</a>
                    ) : (
                      <span className="text-gray-500">[deleted]</span>
                    )}
                  </td>
                  <td className="px-4 py-2 max-w-xl">
                    <p className="text-sm text-gray-800 line-clamp-2">{r.reason}</p>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    {r.reporter?.full_name || r.reporter?.user_id?.slice(0, 6) || 'Unknown'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    {formatDateTime(r.created_at)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    {r.resolved ? (
                      <span className="text-green-700 text-sm">Resolved</span>
                    ) : (
                      <button
                        onClick={() => resolveReport(r.id)}
                        disabled={resolving === r.id}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm disabled:opacity-50"
                      >
                        {resolving === r.id ? 'Resolving…' : 'Resolve'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
