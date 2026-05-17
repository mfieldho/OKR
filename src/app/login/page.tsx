'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Form3Logo } from '@/components/ui/Form3Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (success) {
      router.push('/');
    } else {
      setError('Invalid username or password.');
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'rgb(8,16,30)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/[0.08] p-8"
        style={{ background: 'rgba(13,26,46,0.97)' }}
      >
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <Form3Logo height={32} />
          <p className="text-slate-400 text-sm mt-1">OKR Platform</p>
        </div>

        <h1 className="text-white text-xl font-semibold mb-6 text-center">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-slate-400 mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(42,207,192,0.5)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(42,207,192,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="admin"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-400 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(42,207,192,0.5)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(42,207,192,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              className="text-sm px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80 mt-2"
            style={{
              background: '#2acfc0',
              color: 'rgb(8,16,30)',
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
