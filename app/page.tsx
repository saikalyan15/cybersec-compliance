'use client';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Lock,
  User,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
    <main className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rtl:font-[Tajawal]">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[#1a365d] text-white p-8 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* <Image
            src="/logo-white.png"
            alt="Company Logo"
            width={180}
            height={60}
            className="mb-10"
          /> */}

          <h1 className="text-3xl font-bold mb-4">
            Welcome to Cybersec Compliance
          </h1>
          <p className="text-lg opacity-90 mb-8 max-w-md">
            Your comprehensive solution for business management and analytics.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 mb-10">
            <div className="flex items-start">
              <CheckCircle2 className="h-6 w-6 text-[#90cdf4] mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Secure Management</h3>
                <p className="opacity-80 text-sm">
                  Enterprise-grade security with ISO 27001 compliance
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="h-6 w-6 text-[#90cdf4] mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Real-time Analytics</h3>
                <p className="opacity-80 text-sm">
                  Comprehensive dashboards with actionable insights
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="h-6 w-6 text-[#90cdf4] mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Middle East Optimized</h3>
                <p className="opacity-80 text-sm">
                  Tailored for regional business requirements
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          {/* <div className="bg-[#2d4a77] p-5 rounded-lg mt-6 max-w-md">
            <p className="italic text-sm opacity-90 mb-3">
              "This platform has transformed how we manage our operations,
              providing us with the insights and tools we need to grow our
              business."
            </p>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#90cdf4] rounded-full flex items-center justify-center text-[#1a365d] font-bold mr-2">
                AM
              </div>
              <div>
                <p className="text-sm font-semibold">Ahmed Mohammed</p>
                <p className="text-xs opacity-75">CEO, Gulf Enterprises</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Decorative image */}
        {/* <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20">
          <Image
            src="/dashboard-illustration.png"
            alt="Dashboard Illustration"
            width={256}
            height={256}
            className="object-contain"
          />
        </div> */}

        <div className="relative z-10 text-sm opacity-70">
          © {new Date().getFullYear()} Transcend Shuraa. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex justify-center">
            <Image src="/logo.png" alt="Company Logo" width={150} height={50} />
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#1a365d] mb-6 text-center">
              Sign In
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1a365d] focus:border-[#1a365d]"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1a365d] focus:border-[#1a365d]"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1a365d] hover:bg-[#2d4a77] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a365d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
                </button>
              </div>
            </form>

            {/* Cybersecurity compliance information */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center text-[#1a365d]">
                <ShieldCheck className="h-5 w-5 mr-2" />
                <h3 className="text-sm font-medium">Secure Access Portal</h3>
              </div>
              {/* <p className="mt-2 text-xs text-gray-600">
                This system is for authorized users only and complies with ISO
                27001 and GDPR standards. All activities are monitored and
                logged for security purposes.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span>End-to-end encryption</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span>Multi-factor ready</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span>Brute force protection</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span>Session timeout</span>
                </div>
              </div> */}
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            By accessing this system, you agree to our{' '}
            <Link href="/terms" className="text-[#1a365d] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#1a365d] hover:underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </main>
  );
}
