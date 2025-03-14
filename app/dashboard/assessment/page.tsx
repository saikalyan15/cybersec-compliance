"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Assessment {
  _id: string;
  name: string;
  createdAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  owner: {
    firstName: string;
    lastName: string;
  };
  controls: {
    controlId: string;
    status: string;
  }[];
  date: string;
  dueDate: string;
}

export default function AssessmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await fetch("/api/assessments");
        if (!response.ok) {
          throw new Error("Failed to fetch assessments");
        }
        const data = await response.json();
        setAssessments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        toast.error("Failed to load assessments");
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchAssessments();
    }
  }, [session]);

  const handleDeleteClick = (assessmentId: string) => {
    setAssessmentToDelete(assessmentId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete assessment");
      }

      // Remove the assessment from the list
      setAssessments(assessments.filter((a) => a._id !== assessmentId));
      toast.success("Assessment deleted successfully");
      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete assessment"
      );
    }
  };

  if (!session?.user) {
    return <div>Please log in to access this page</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Assessments</h2>
          <p className="text-sm text-muted-foreground">
            Manage your compliance controls assessments
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/assessment/new")}
          size="lg"
        >
          Create New Assessment
        </Button>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No assessments found. Click the "Create New Assessment" button above
            to get started.
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Controls</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment._id}>
                  <TableCell className="font-medium">
                    {assessment.name}
                  </TableCell>
                  <TableCell>
                    {assessment.owner?.firstName} {assessment.owner?.lastName}
                  </TableCell>
                  <TableCell>
                    {new Date(assessment.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(assessment.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{assessment.controls.length} controls</TableCell>
                  <TableCell>
                    {
                      assessment.controls.filter(
                        (c) => c.status === "Implemented"
                      ).length
                    }{" "}
                    / {assessment.controls.length} implemented
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          router.push(`/dashboard/assessment/${assessment._id}`)
                        }
                      >
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(assessment._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assessment? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                assessmentToDelete && handleDelete(assessmentToDelete)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
