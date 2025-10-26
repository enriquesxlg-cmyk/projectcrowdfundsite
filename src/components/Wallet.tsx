"use client";

import { useEffect, useState } from 'react';

function getStoredBalance(): number {
  try {
    const raw = localStorage.getItem('wallet_balance');
    if (!raw) return 0;
    const n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

function setStoredBalance(value: number) {
  try {
    localStorage.setItem('wallet_balance', value.toString());
  } catch {}
}

export function WalletMini({ className = '' }: { className?: string }) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    setBalance(getStoredBalance());
  }, []);

  function handleDeposit() {
    const v = parseFloat(amount);
    if (isNaN(v) || v <= 0) {
      setMessageType('error');
      setMessage('Enter a valid amount');
      return;
    }
    const next = balance + v;
    setBalance(next);
    setStoredBalance(next);
    setAmount('');
    setMessageType('success');
    setMessage('Deposited');
  }

  function handleWithdraw() {
    const v = parseFloat(amount);
    if (isNaN(v) || v <= 0) {
      setMessageType('error');
      setMessage('Enter a valid amount');
      return;
    }
    if (v > balance) {
      setMessageType('error');
      setMessage('Insufficient balance');
      return;
    }
    const next = balance - v;
    setBalance(next);
    setStoredBalance(next);
    setAmount('');
    setMessageType('success');
    setMessage('Withdrawn');
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs text-gray-500">Balance</span>
        <span className="text-lg font-semibold">${balance.toFixed(2)}</span>
      </div>
      <div>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (message) { setMessage(''); setMessageType(''); }
          }}
          placeholder="0.00"
          className="w-full px-2 py-1.5 border rounded-md text-sm"
        />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            className="w-full px-3 py-1.5 rounded-md text-sm bg-purple-600 text-white hover:bg-purple-700"
            onClick={handleDeposit}
          >
            Deposit
          </button>
          <button
            type="button"
            className="w-full px-3 py-1.5 rounded-md text-sm bg-rose-600 text-white hover:bg-rose-700"
            onClick={handleWithdraw}
          >
            Withdraw
          </button>
        </div>
      </div>
      {message && (
        <p className={`text-xs mt-2 ${messageType === 'error' ? 'text-red-600' : 'text-gray-500'}`}>{message}</p>
      )}
    </div>
  );
}

export function useWallet() {
  const [balance, setBalance] = useState(0);
  useEffect(() => setBalance(getStoredBalance()), []);
  function spend(amount: number): boolean {
    const b = getStoredBalance();
    if (amount > b) return false;
    const next = b - amount;
    setStoredBalance(next);
    setBalance(next);
    return true;
  }
  function deposit(amount: number) {
    const b = getStoredBalance();
    const next = b + amount;
    setStoredBalance(next);
    setBalance(next);
  }
  return { balance, spend, deposit };
}
