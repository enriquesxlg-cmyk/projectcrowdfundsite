'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Campaign } from '@/types/db';
import { useWallet } from './Wallet';

interface DonateWidgetProps {
  campaign: Campaign;
  className?: string;
}

export function DonateWidget({ campaign, className = '' }: DonateWidgetProps) {
  const [amount, setAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const wallet = useWallet();

  const presetAmounts = [5, 10, 25, 50, 100];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const donationAmount = parseFloat(amount);
    
    // Validation
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError('Please enter a valid amount');
      setIsSubmitting(false);
      return;
    }

    if (donationAmount < 1) {
      setError('Minimum donation amount is $1');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to donate');
        setIsSubmitting(false);
        return;
      }

      if (campaign.status !== 'approved') {
        setError('This campaign is not accepting donations');
        setIsSubmitting(false);
        return;
      }

      // Fake donation flow using local wallet balance
      const cents = Math.round(donationAmount * 100);
      const dollars = cents / 100;
      const ok = wallet.spend(dollars);
      if (!ok) {
        setError('Insufficient wallet balance. Deposit funds first.');
        setIsSubmitting(false);
        return;
      }

      // For real campaigns, call server route to update totals; for sample, just succeed
      const isSample = typeof campaign.id === 'string' && campaign.id.startsWith('sample-');
      if (!isSample) {
        try {
          const res = await fetch('/api/donations/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              slug: campaign.slug, 
              amount_cents: cents, 
              is_anonymous: isAnonymous,
              donor_id: user.id
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Donation failed');
          }
          setSuccessMessage('Thank you! Your donation has been recorded.');
          setAmount('');
          // Reload to show updated totals
          setTimeout(() => {
            if (typeof window !== 'undefined') window.location.reload();
          }, 800);
        } catch (err: any) {
          // Refund wallet on failure
          wallet.deposit(dollars);
          setError(err.message || 'Failed to process donation');
        }
      } else {
        setSuccessMessage('Thank you! Your donation has been recorded (demo).');
        setAmount('');
      }
      
    } catch (e) {
      console.error('Donation error:', e);
      setError('Failed to process donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePresetAmount(preset: number) {
    setAmount(preset.toString());
    setError('');
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value);
    if (error) setError('');
  }

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
  <h3 className="text-xl font-semibold mb-2">Make a Donation</h3>
  <p className="text-sm text-gray-600 mb-4">Wallet balance: ${wallet.balance.toFixed(2)} (demo)</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={handleAmountChange}
            min="1"
            step="0.01"
            required
            className="w-full px-3 py-2 border rounded-md"
            disabled={isSubmitting || campaign.status !== 'approved'}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetAmount(preset)}
              className="px-3 py-1 border rounded-md hover:bg-gray-50"
              disabled={isSubmitting || campaign.status !== 'approved'}
            >
              ${preset}
            </button>
          ))}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
            disabled={isSubmitting || campaign.status !== 'approved'}
          />
          <label htmlFor="anonymous" className="ml-2 text-sm text-gray-600">
            Donate anonymously
          </label>
        </div>
        <p className="text-xs text-gray-500 -mt-2 mb-2">
          When anonymous is selected, your name won’t be shown publicly. The campaign owner may see
          your donation amount for accounting, but not your name.
        </p>

        <button
          type="submit"
          disabled={isSubmitting || campaign.status !== 'approved'}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Donate'}
        </button>

        {campaign.status !== 'approved' && (
          <p className="text-sm text-center text-gray-600">
            This campaign is not currently accepting donations
          </p>
        )}
      </form>
    </div>
  );
}