"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";

interface Control {
  controlId: string;
  status: string;
  mainControlName: string;
  subControlName: string;
  mainDomainName: string;
  subDomainName: string;
}

interface Assessment {
  _id: string;
  name: string;
  owner: {
    firstName: string;
    lastName: string;
  };
  controls: Control[];
  date: string;
  dueDate: string;
}

interface GroupedAssessments {
  [key: string]: Assessment[];
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>("all");
  const [owners, setOwners] = useState<string[]>([]);
  const [groupedAssessments, setGroupedAssessments] =
    useState<GroupedAssessments>({});

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        // Fetch assessments with detailed control information
        const response = await fetch("/api/assessments/detailed");
        if (!response.ok) {
          throw new Error("Failed to fetch assessments");
        }
        const data = await response.json();
        setAssessments(data);

        // Extract unique owners
        const uniqueOwners = Array.from(
          new Set(
            data.map((assessment: Assessment) =>
              assessment.owner
                ? `${assessment.owner.firstName} ${assessment.owner.lastName}`
                : "Unassigned"
            )
          )
        ).sort() as string[];
        setOwners(uniqueOwners);

        // Group assessments by owner
        const grouped = data.reduce(
          (acc: GroupedAssessments, assessment: Assessment) => {
            const ownerName = assessment.owner
              ? `${assessment.owner.firstName} ${assessment.owner.lastName}`
              : "Unassigned";

            if (!acc[ownerName]) {
              acc[ownerName] = [];
            }
            acc[ownerName].push(assessment);
            return acc;
          },
          {}
        );

        setGroupedAssessments(grouped);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchAssessments();
    }
  }, [session]);

  const exportToExcel = () => {
    // Get the assessments to export based on selected owner
    const assessmentsToExport =
      selectedOwner === "all"
        ? Object.values(groupedAssessments).flat()
        : groupedAssessments[selectedOwner];

    // Prepare data for export with detailed control information
    const exportData = assessmentsToExport.flatMap((assessment) =>
      assessment.controls.map((control) => ({
        Owner: assessment.owner
          ? `${assessment.owner.firstName} ${assessment.owner.lastName}`
          : "Unassigned",
        "Assessment Name": assessment.name,
        "Assessment Date": new Date(assessment.date).toLocaleDateString(),
        "Assessment Due Date": new Date(
          assessment.dueDate
        ).toLocaleDateString(),
        "Main Domain": control.mainDomainName,
        "Sub Domain": control.subDomainName,
        "Main Control ID": control.controlId.split("-").slice(0, 4).join("-"),
        "Main Control": control.mainControlName,
        "Sub Control ID": control.controlId,
        "Sub Control": control.subControlName,
        Status: control.status,
      }))
    );

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assessment Details");

    // Save file
    const fileName =
      selectedOwner === "all"
        ? "Assessment_Report_All_Owners.xlsx"
        : `Assessment_Report_${selectedOwner.replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (!session?.user) {
    return <div>Please log in to access this page</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter assessments based on selected owner
  const displayAssessments =
    selectedOwner === "all"
      ? groupedAssessments
      : { [selectedOwner]: groupedAssessments[selectedOwner] };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Assessment Reports
          </h2>
          <p className="text-sm text-muted-foreground">
            View and export detailed assessment reports by owner
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedOwner} onValueChange={setSelectedOwner}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {owners.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} size="lg">
            Export to Excel
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(displayAssessments).map(
          ([ownerName, ownerAssessments]) => (
            <div
              key={ownerName}
              className="bg-card rounded-lg border shadow-sm"
            >
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{ownerName}</h3>
                <p className="text-sm text-muted-foreground">
                  {ownerAssessments.length} assessment
                  {ownerAssessments.length !== 1 ? "s" : ""}
                </p>
              </div>
              {ownerAssessments.map((assessment) => (
                <div
                  key={assessment._id}
                  className="p-4 border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-md font-medium">{assessment.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(assessment.date).toLocaleDateString()} |
                        Due: {new Date(assessment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        router.push(`/dashboard/assessment/${assessment._id}`)
                      }
                    >
                      View Details
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Main Domain</TableHead>
                        <TableHead>Sub Domain</TableHead>
                        <TableHead>Main Control</TableHead>
                        <TableHead>Sub Control</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessment.controls.map((control) => (
                        <TableRow key={control.controlId}>
                          <TableCell>{control.mainDomainName}</TableCell>
                          <TableCell>{control.subDomainName}</TableCell>
                          <TableCell>
                            {control.controlId.split("-").slice(0, 4).join("-")}
                            : {control.mainControlName}
                          </TableCell>
                          <TableCell>
                            {control.controlId}: {control.subControlName}
                          </TableCell>
                          <TableCell>{control.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
