'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gymSlug, setGymSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(phone, password, gymSlug || undefined);
      router.push('/dashboard');
    } catch {
      setError('Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-[400px] card stagger-1">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-card bg-primary text-white font-medium text-section-heading mb-4">
            G
          </div>
          <h1 className="text-page-title text-text-primary">GymOS</h1>
          <p className="text-body text-text-secondary mt-2">Sign in to your gym dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Gym Code */}
          <div>
            <label htmlFor="login-gym-code" className="input-label">Gym Code</label>
            <input
              id="login-gym-code"
              type="text"
              value={gymSlug}
              onChange={(e) => setGymSlug(e.target.value)}
              placeholder="e.g. goldensgym"
              className="input"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="login-phone" className="input-label">Phone Number</label>
            <input
              id="login-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit phone number"
              maxLength={10}
              required
              className="input"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="input-label">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="input"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-danger-bg text-danger text-caption px-4 py-3 rounded-btn border border-danger-border">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full h-input"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" strokeWidth={1.5} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
