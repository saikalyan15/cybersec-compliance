'use client';

import { useSession } from 'next-auth/react';

export default function AssessmentPage() {
  const { data: session } = useSession();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Assessment</h1>
      <p>Welcome to the Assessment page, {session?.user?.firstName}</p>
    </div>
  );
}
