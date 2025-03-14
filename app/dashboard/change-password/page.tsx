"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Lock } from "lucide-react";

export default function ChangePasswordPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isResetRequired, setIsResetRequired] = useState(false);

  // Check if password reset is required
  useEffect(() => {
    if (status === "authenticated" && session?.user?.passwordResetRequired) {
      setIsResetRequired(true);
    }
  }, [session, status]);

  // Password strength checker
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;

    // Length check
    if (newPassword.length >= 8) strength += 1;

    // Character variety checks
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;

    setPasswordStrength(strength);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError("");
    setSuccess(false);

    console.log("Current session before password change:", session);

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordStrength < 3) {
      setError(
        "Password is not strong enough. Include uppercase, lowercase, numbers, and special characters."
      );
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting to change password for user:", session?.user?.id);

      const response = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Password change failed:", data);
        throw new Error(data.error || "Failed to change password");
      }

      console.log("Password change successful:", data);

      // Success
      setSuccess(true);

      // Update session with new passwordResetRequired status
      await update({
        ...session,
        user: {
          ...session?.user,
          passwordResetRequired: false,
        },
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error during password change:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-[#1a365d] p-3 rounded-full">
            <Lock className="h-6 w-6 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-[#1a365d] mb-6">
          {isResetRequired ? "Set New Password" : "Change Password"}
        </h1>

        {isResetRequired && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-6">
            Your password needs to be changed before continuing.
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            Password changed successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6"
        >
          <div className="mb-4">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
              placeholder={
                isResetRequired
                  ? "Enter your temporary password"
                  : "Enter your current password"
              }
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
              placeholder="Enter new password"
            />

            {/* Password strength indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex h-1 overflow-hidden bg-gray-200 rounded">
                  <div
                    className={`transition-all duration-300 ${
                      passwordStrength <= 1
                        ? "bg-red-500"
                        : passwordStrength <= 3
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-gray-500">
                  {passwordStrength <= 1
                    ? "Weak"
                    : passwordStrength <= 3
                    ? "Moderate"
                    : "Strong"}{" "}
                  password
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-[#1a365d] text-white rounded-md hover:bg-[#2d4a77] transition-colors disabled:opacity-50"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
