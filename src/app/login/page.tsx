'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small delay so the button state is visible
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        router.replace('/');
      } else {
        setError('Incorrect username or password.');
        setLoading(false);
      }
    }, 200);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 60% 30%, rgba(42,207,192,0.07) 0%, transparent 60%), #080f1c' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo / brand */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: 'rgba(42,207,192,0.12)', border: '1px solid rgba(42,207,192,0.25)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#2acfc0" strokeWidth="1.5" opacity="0.4" />
              <circle cx="14" cy="14" r="7"  stroke="#2acfc0" strokeWidth="2" />
              <circle cx="14" cy="14" r="2.5" fill="#2acfc0" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">OKR Platform</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5"
          style={{ background: 'rgba(14,26,50,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
        >
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Username</label>
            <input
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Enter your username"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(42,207,192,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(42,207,192,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs font-medium px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#2acfc0', color: '#080f1c' }}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn size={15} />
            )}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  );
}
