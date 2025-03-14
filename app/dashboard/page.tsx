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

interface Assessment {
  _id: string;
  name: string;
  createdAt: string;
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

interface DashboardStats {
  totalAssessments: number;
  dueAssessments: number;
  totalMainDomains: number;
  totalDomains: number;
  totalSubDomains: number;
  totalMainControls: number;
  totalSubControls: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    dueAssessments: 0,
    totalMainDomains: 0,
    totalDomains: 0,
    totalSubDomains: 0,
    totalMainControls: 0,
    totalSubControls: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assessments
        const assessmentsResponse = await fetch("/api/assessments");
        if (!assessmentsResponse.ok) {
          throw new Error("Failed to fetch assessments");
        }
        const assessmentsData = await assessmentsResponse.json();

        // Get 5 most recent assessments
        const sortedAssessments = [...assessmentsData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentAssessments(sortedAssessments.slice(0, 5));

        // Fetch domains
        const domainsResponse = await fetch("/api/domains/main");
        const domainsData = (await domainsResponse.ok)
          ? await domainsResponse.json()
          : [];

        // Calculate main domains (domains without a parentDomainId)
        const mainDomains = domainsData.filter(
          (domain: any) => !domain.parentDomainId
        );

        // Fetch sub-domains
        const subDomainsResponse = await fetch("/api/sub-domains");
        const subDomainsData = (await subDomainsResponse.ok)
          ? await subDomainsResponse.json()
          : [];

        // Fetch main controls
        const mainControlsResponse = await fetch("/api/controls/main");
        const mainControlsData = (await mainControlsResponse.ok)
          ? await mainControlsResponse.json()
          : [];

        // Fetch sub controls
        const subControlsResponse = await fetch("/api/controls/sub");
        const subControlsData = (await subControlsResponse.ok)
          ? await subControlsResponse.json()
          : [];

        // Calculate due assessments (due within next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        const dueAssessments = assessmentsData.filter(
          (assessment: Assessment) => {
            const dueDate = new Date(assessment.dueDate);
            return dueDate >= now && dueDate <= thirtyDaysFromNow;
          }
        );

        setStats({
          totalAssessments: assessmentsData.length,
          dueAssessments: dueAssessments.length,
          totalMainDomains: mainDomains.length,
          totalDomains: domainsData.length,
          totalSubDomains: subDomainsData.length,
          totalMainControls: mainControlsData.length,
          totalSubControls: subControlsData.length,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

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
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of your compliance assessment system
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/assessment/new")}
          size="lg"
        >
          Create New Assessment
        </Button>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-lg border shadow-sm p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Assessments
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.totalAssessments}</span>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <span className="font-medium text-orange-600">
              {stats.dueAssessments}
            </span>
            <span className="text-muted-foreground">Due in next 30 days</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Main Domains
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.totalMainDomains}</span>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <span className="font-medium text-blue-600">
              {stats.totalDomains}
            </span>
            <span className="text-muted-foreground">Domains</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Sub Domains
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.totalSubDomains}</span>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Controls
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {stats.totalMainControls}
            </span>
            <span className="text-sm text-muted-foreground">Main Controls</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <span className="font-medium text-green-600">
              {stats.totalSubControls}
            </span>
            <span className="text-muted-foreground">Sub-controls</span>
          </div>
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Assessments</h3>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/assessment")}
          >
            View All
          </Button>
        </div>

        {recentAssessments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No assessments found. Create your first assessment to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAssessments.map((assessment) => (
                <TableRow key={assessment._id}>
                  <TableCell className="font-medium">
                    {assessment.name}
                  </TableCell>
                  <TableCell>
                    {assessment.owner?.firstName} {assessment.owner?.lastName}
                  </TableCell>
                  <TableCell>
                    {new Date(assessment.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {
                      assessment.controls.filter(
                        (c) => c.status === "Implemented"
                      ).length
                    }{" "}
                    / {assessment.controls.length} implemented
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        router.push(`/dashboard/assessment/${assessment._id}`)
                      }
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
