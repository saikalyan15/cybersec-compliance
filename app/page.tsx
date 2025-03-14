"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Lock,
  User,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (!result) {
        throw new Error("Authentication failed");
      }

      if (result.error) {
        setError("Invalid username or password");
        return;
      }

      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred during sign in");
      console.error("Sign in error:", err);
    } finally {
      setLoading(false);
      // Clear password field on error
      if (error) {
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#f8f4eb]">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[#0f2744] text-white flex-col justify-center relative overflow-hidden">
        {/* Arabic pattern background */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <pattern
              id="arabesque"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20 0C20 11.0457 11.0457 20 0 20C11.0457 20 20 31.0457 20 42C20 31.0457 31.0457 20 42 20C31.0457 20 20 11.0457 20 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="100" height="100" fill="url(#arabesque)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between py-12 px-12">
          <div>
            <div className="flex items-center mb-12">
              <div className="bg-[#e6c78b] p-4 rounded-xl shadow-md">
                <ShieldCheck size={40} className="text-[#0f2744]" />
              </div>
              <div className="ml-6">
                <h1 className="text-4xl font-bold text-[#e6c78b]">
                  Cybersec Compliance
                </h1>
                <p className="text-lg text-gray-300 mt-2">
                  Enterprise Security Management
                </p>
              </div>
            </div>

            <div className="space-y-8 mb-12">
              <div className="flex items-start bg-[#1a365d] p-6 rounded-xl">
                <CheckCircle2 className="h-8 w-8 text-[#e6c78b] mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl text-[#e6c78b]">
                    Enterprise Security
                  </h3>
                  <p className="text-gray-300 mt-2">
                    Advanced security framework aligned with ISO 27001 and
                    regional compliance standards
                  </p>
                </div>
              </div>

              <div className="flex items-start bg-[#1a365d] p-6 rounded-xl">
                <CheckCircle2 className="h-8 w-8 text-[#e6c78b] mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl text-[#e6c78b]">
                    Intelligent Analytics
                  </h3>
                  <p className="text-gray-300 mt-2">
                    Real-time monitoring and comprehensive security assessment
                    dashboards
                  </p>
                </div>
              </div>

              <div className="flex items-start bg-[#1a365d] p-6 rounded-xl">
                <CheckCircle2 className="h-8 w-8 text-[#e6c78b] mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl text-[#e6c78b]">
                    Regional Compliance
                  </h3>
                  <p className="text-gray-300 mt-2">
                    Specialized framework for Middle East regulatory
                    requirements
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-300">
            © {new Date().getFullYear()} Transcend Shuraa. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#f8f4eb]">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex items-center justify-center">
            <div className="bg-[#e6c78b] p-4 rounded-xl shadow-md">
              <ShieldCheck size={40} className="text-[#0f2744]" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-[#0f2744]">
                Cybersec Compliance
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Enterprise Security Management
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-[#0f2744] mb-8 text-center">
              Welcome Back
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-[#0f2744] mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#0f2744]" />
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
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e6c78b] focus:border-[#e6c78b] bg-gray-50"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#0f2744] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#0f2744]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e6c78b] focus:border-[#e6c78b] bg-gray-50"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-[#0f2744] bg-[#e6c78b] hover:bg-[#d4b77a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e6c78b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <LoadingSpinner size="sm" /> : "Sign in"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center text-[#0f2744]">
                <ShieldCheck className="h-5 w-5 mr-2" />
                <h3 className="text-sm font-medium">
                  Secure Enterprise Access
                </h3>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            By accessing this system, you agree to our{" "}
            <Link
              href="/terms"
              className="text-[#0f2744] hover:text-[#1a365d] font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[#0f2744] hover:text-[#1a365d] font-medium"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
