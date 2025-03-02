'use client';

import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username || !password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (!result) {
        throw new Error('Authentication failed');
      }

      if (result.error) {
        setError('Invalid username or password');
        return;
      }

      if (result.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during sign in');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
      // Clear password field on error
      if (error) {
        setFormData((prev) => ({
          ...prev,
          password: '',
        }));
      }
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 justify-center items-center">
        <div className="max-w-md text-white p-8">
          <h1 className="text-4xl font-bold mb-6">Cybersec Compliance</h1>
          <p className="text-blue-100 text-lg">
            Manage your organization&apos;s cybersecurity compliance with ease.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome Back
            </h1>
            <h2 className="text-slate-500">Sign in to your account</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} method="POST">
            {error && (
              <div
                className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 p-3 rounded border border-red-200"
                role="alert"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-700"
                >
                  Username
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
