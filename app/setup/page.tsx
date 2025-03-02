'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSetup = async () => {
    try {
      setStatus('Setting up...');
      setError('');

      const response = await fetch('/api/setup');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Setup failed');
      }

      await response.json();

      setStatus('Setup completed successfully');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error(
        'Setup error:',
        err instanceof Error ? err.message : String(err)
      );
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            System Setup
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleSetup}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Admin User
            </button>
          </div>
          {status && (
            <div className="text-sm text-center text-green-600">{status}</div>
          )}
          {error && (
            <div className="text-sm text-center text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
