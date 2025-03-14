"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Control {
  controlId: string;
  name: string;
  evidenceOwner: User;
  verifiedEvidence: string;
  missingEvidence: string;
  status: "Implemented" | "Partially Implemented" | "Not Implemented";
  comments: string;
  artifactLink: string;
  subDomainName: string;
  subDomainId: string;
}

interface Assessment {
  _id: string;
  name: string;
  createdAt: string;
  createdBy: User;
  owner: User;
  controls: Control[];
  date: string;
  dueDate: string;
}

export default function AssessmentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch assessment");
        }
        const data = await response.json();
        setAssessment(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast.error("Failed to load assessment");
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchAssessment();
    }
  }, [session, id]);

  if (!session?.user) {
    return <div>Please log in to access this page</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!assessment) {
    return <div>Assessment not found</div>;
  }

  const implementedControls = assessment.controls.filter(
    (c) => c.status === "Implemented"
  ).length;
  const totalControls = assessment.controls.length;
  const progress = Math.round((implementedControls / totalControls) * 100);

  const handleDelete = async () => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/assessments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete assessment");
      }

      setSuccess("Assessment deleted successfully!");
      setTimeout(() => {
        router.push("/dashboard/assessments");
      }, 1500);
    } catch (error) {
      console.error("Error deleting assessment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete assessment"
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 bg-card rounded-lg border shadow-sm p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {assessment.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Owner: {assessment.owner?.firstName} {assessment.owner?.lastName} •
            Assessment Date: {new Date(assessment.date).toLocaleDateString()} •
            Due Date: {new Date(assessment.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/dashboard/assessment/${id}/edit`)}
            >
              Edit Assessment
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Assessment
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/assessment")}
            >
              Back to Assessments
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete this assessment? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Controls List */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Controls</h2>
        <div className="space-y-4">
          {assessment.controls.map((control, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm text-muted-foreground">
                    {control.controlId}
                  </div>
                  <div className="font-medium">{control.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {control.subDomainName}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "px-2 py-1 rounded-full text-sm",
                      control.status === "Implemented" &&
                        "bg-green-100 text-green-800",
                      control.status === "Partially Implemented" &&
                        "bg-yellow-100 text-yellow-800",
                      control.status === "Not Implemented" &&
                        "bg-red-100 text-red-800"
                    )}
                  >
                    {control.status}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Evidence Owner
                  </div>
                  <div>
                    {control.evidenceOwner.firstName}{" "}
                    {control.evidenceOwner.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Artifact Link
                  </div>
                  <div className="break-all">
                    {control.artifactLink || "No link provided"}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Verified Evidence
                  </div>
                  <div className="whitespace-pre-wrap">
                    {control.verifiedEvidence || "No verified evidence"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Missing Evidence
                  </div>
                  <div className="whitespace-pre-wrap">
                    {control.missingEvidence || "No missing evidence"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Comments
                </div>
                <div className="whitespace-pre-wrap">
                  {control.comments || "No comments"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
