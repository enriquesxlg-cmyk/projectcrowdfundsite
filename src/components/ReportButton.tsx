"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ReportButtonProps {
  campaignId: string;
}

export function ReportButton({ campaignId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitReport = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in to report a campaign.");
        setSubmitting(false);
        return;
      }

      // Ensure reporter profile exists to satisfy FK
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        await supabase.from('profiles').insert({ user_id: user.id });
      }

      const { error: insertError } = await supabase.from('reports').insert({
        campaign_id: campaignId,
        reporter_id: user.id,
        reason: reason.trim() || 'No reason provided',
      });

      if (insertError) throw insertError;

      setMessage("Thanks! Your report has been submitted.");
      setReason("");
      setOpen(false);
    } catch (e) {
      console.error('Report submit error', e);
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-red-600 hover:text-red-700 underline"
      >
        Report this campaign
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Report campaign</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded mb-3">{error}</div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-2 rounded mb-3">{message}</div>
            )}
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Describe what seems off or violates the rules"
              disabled={submitting}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-sm border rounded-md"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Misuse of reporting may result in account action.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
