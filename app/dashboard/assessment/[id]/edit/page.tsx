"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface SubDomain {
  subDomainId: string;
  name: string;
}

interface Control {
  controlId: string;
  name: string;
  type: "main" | "sub";
  domainId: string;
  domainName: string;
  uniqueId: string;
}

interface AssessmentControl {
  controlId: string;
  evidenceOwner: string;
  verifiedEvidence: string;
  missingEvidence: string;
  status: "Implemented" | "Partially Implemented" | "Not Implemented";
  comments: string;
  artifactLink: string;
}

interface SubDomainGroup {
  subDomainId: string;
  subDomainName: string;
  controls: Control[];
}

interface AddedControl extends Control, AssessmentControl {
  uniqueId: string;
}

interface ControlGroup {
  mainControl: Control;
  subControls: Control[];
}

interface ControlFormData {
  controlId: string;
  name: string;
  type: "main" | "sub";
  evidenceOwner: string;
  verifiedEvidence: string;
  missingEvidence: string;
  status: "Implemented" | "Partially Implemented" | "Not Implemented";
  comments: string;
  artifactLink: string;
}

export default function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [subDomains, setSubDomains] = useState<SubDomain[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedSubDomain, setSelectedSubDomain] = useState<string>("");
  const [selectedControl, setSelectedControl] = useState<string>("");
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [assessmentDueDate, setAssessmentDueDate] = useState("");
  const [assessmentOwner, setAssessmentOwner] = useState<string>("");
  const [assessmentControls, setAssessmentControls] = useState<
    AssessmentControl[]
  >([]);
  const [editingControl, setEditingControl] =
    useState<AssessmentControl | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [allControls, setAllControls] = useState<Control[]>([]);
  const [selectedMainControl, setSelectedMainControl] =
    useState<Control | null>(null);
  const [selectedSubControl, setSelectedSubControl] = useState<Control | null>(
    null
  );
  const [controlGroups, setControlGroups] = useState<ControlGroup[]>([]);
  const [formData, setFormData] = useState<ControlFormData | null>(null);
  const [controlsList, setControlsList] = useState<ControlFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users with role "user"
        const usersResponse = await fetch("/api/users");
        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        const usersData = await usersResponse.json();
        setUsers(usersData.filter((user: User) => user.role === "user"));

        // Fetch sub-domains first
        const subDomainsResponse = await fetch("/api/sub-domains");
        if (!subDomainsResponse.ok)
          throw new Error("Failed to fetch sub-domains");
        const subDomainsData = await subDomainsResponse.json();
        setSubDomains(subDomainsData);

        // Fetch controls
        const mainControlsResponse = await fetch("/api/controls/main");
        if (!mainControlsResponse.ok)
          throw new Error("Failed to fetch main controls");
        const mainControlsData = await mainControlsResponse.json();

        const subControlsResponse = await fetch("/api/controls/sub");
        if (!subControlsResponse.ok)
          throw new Error("Failed to fetch sub controls");
        const subControlsData = await subControlsResponse.json();

        // Group controls by main control
        const mainControls = mainControlsData.map((mainControl: Control) => {
          const parts = mainControl.controlId.split("-");
          const domainId = parts.length >= 3 ? `${parts[0]}-${parts[1]}` : "";
          const domainName =
            subDomainsData.find((d) => d.subDomainId === domainId)?.name || "";

          return {
            controlId: mainControl.controlId,
            name: mainControl.name,
            type: "main" as const,
            domainId,
            domainName,
            uniqueId: `main-${mainControl.controlId}`,
          };
        });

        const subControls = subControlsData.map((subControl: Control) => {
          const parts = subControl.controlId.split("-");
          const domainId = parts.length >= 3 ? `${parts[0]}-${parts[1]}` : "";
          const domainName =
            subDomainsData.find((d) => d.subDomainId === domainId)?.name || "";

          return {
            controlId: subControl.controlId,
            name: subControl.name,
            type: "sub" as const,
            domainId,
            domainName,
            uniqueId: `sub-${subControl.controlId}`,
            mainControlId: subControl.controlId
              .split("-")
              .slice(0, -1)
              .join("-"),
          };
        });

        // Create control groups
        const groups = mainControls.map((mainControl: Control) => ({
          mainControl,
          subControls: subControls.filter(
            (sub: Control) => sub.mainControlId === mainControl.controlId
          ),
        }));

        setControlGroups(groups);
        setAllControls(mainControls);

        // Fetch assessment data
        const assessmentResponse = await fetch(`/api/assessments/${id}`);
        if (!assessmentResponse.ok)
          throw new Error("Failed to fetch assessment");
        const assessmentData = await assessmentResponse.json();

        // Set assessment data
        setAssessmentName(assessmentData.name);
        setAssessmentDate(assessmentData.date);
        setAssessmentDueDate(assessmentData.dueDate);
        setAssessmentOwner(assessmentData.owner?._id || "");

        // Set controls list
        setControlsList(
          assessmentData.controls.map((control: any) => ({
            controlId: control.controlId,
            name: control.name,
            type: control.type || "main",
            evidenceOwner: control.evidenceOwner._id,
            verifiedEvidence: control.verifiedEvidence || "",
            missingEvidence: control.missingEvidence || "",
            status: control.status,
            comments: control.comments || "",
            artifactLink: control.artifactLink || "",
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session, id]);

  const handleMainControlSelect = (uniqueId: string) => {
    const control = allControls.find((c) => c.uniqueId === uniqueId);
    if (control) {
      setSelectedMainControl(control);
      setSelectedSubControl(null);
      const group = controlGroups.find(
        (g) => g.mainControl.controlId === control.controlId
      );
      if (group) {
        if (group.subControls.length > 0) {
          const subControl = group.subControls[0];
          setSelectedSubControl(subControl);
          setFormData({
            controlId: subControl.controlId,
            name: subControl.name,
            type: "sub",
            evidenceOwner: "",
            verifiedEvidence: "",
            missingEvidence: "",
            status: "Not Implemented",
            comments: "",
            artifactLink: "",
          });
        } else {
          setFormData({
            controlId: control.controlId,
            name: control.name,
            type: "main",
            evidenceOwner: "",
            verifiedEvidence: "",
            missingEvidence: "",
            status: "Not Implemented",
            comments: "",
            artifactLink: "",
          });
        }
      }
    }
  };

  const handleSubControlSelect = (uniqueId: string) => {
    const control = controlGroups
      .find((g) => g.mainControl.controlId === selectedMainControl?.controlId)
      ?.subControls.find((c) => c.uniqueId === uniqueId);

    if (control) {
      setSelectedSubControl(control);
      setFormData({
        controlId: control.controlId,
        name: control.name,
        type: "sub",
        evidenceOwner: "",
        verifiedEvidence: "",
        missingEvidence: "",
        status: "Not Implemented",
        comments: "",
        artifactLink: "",
      });
    }
  };

  const handleAddControl = () => {
    if (formData) {
      if (editingIndex !== null) {
        // Update existing control
        setControlsList((prev) =>
          prev.map((control, index) =>
            index === editingIndex ? formData : control
          )
        );
        setEditingIndex(null);
      } else {
        // Add new control
        setControlsList((prev) => [...prev, formData]);
      }
      // Clear form
      setFormData(null);
      setSelectedMainControl(null);
    }
  };

  const handleEditControl = (index: number) => {
    const control = controlsList[index];
    setFormData(control);
    setEditingIndex(index);
    // Find and set the main control
    const mainControl = allControls.find((c) =>
      control.type === "main"
        ? c.controlId === control.controlId
        : controlGroups.some(
            (g) =>
              g.mainControl.controlId === c.controlId &&
              g.subControls.some((sub) => sub.controlId === c.controlId)
          )
    );
    if (mainControl) {
      setSelectedMainControl(mainControl);
    }
  };

  const handleDeleteControl = (index: number) => {
    setControlsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormChange = (field: keyof ControlFormData, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const calculateProgress = () => {
    if (controlsList.length === 0) return 0;

    const completedControls = controlsList.filter(
      (control) => control.status === "Implemented"
    ).length;
    const partiallyCompletedControls = controlsList.filter(
      (control) => control.status === "Partially Implemented"
    ).length;

    return Math.round(
      ((completedControls + partiallyCompletedControls * 0.5) /
        controlsList.length) *
        100
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validate required fields
      if (!assessmentName.trim()) {
        setError("Assessment name is required");
        return;
      }

      if (!assessmentDate) {
        setError("Assessment date is required");
        return;
      }

      if (!assessmentDueDate) {
        setError("Assessment due date is required");
        return;
      }

      if (!assessmentOwner) {
        setError("Assessment owner is required");
        return;
      }

      if (controlsList.length === 0) {
        setError("At least one control is required");
        return;
      }

      // Validate each control has required fields
      for (const control of controlsList) {
        if (!control.evidenceOwner) {
          setError(`Evidence owner is required for control: ${control.name}`);
          return;
        }
      }

      // Prepare controls data with required fields
      const controlsData = controlsList.map((control) => {
        // Find the control in allControls to get domain info
        const mainControl = allControls.find(
          (c) => c.controlId === control.controlId
        );
        const subControl = controlGroups
          .find((g) => g.mainControl.controlId === control.controlId)
          ?.subControls.find((c) => c.controlId === control.controlId);

        // Extract domain ID from control ID
        const parts = control.controlId.split("-");
        const domainId = parts.length >= 3 ? `${parts[0]}-${parts[1]}` : "";
        const domainName =
          subDomains.find((d) => d.subDomainId === domainId)?.name || "";

        return {
          controlId: control.controlId,
          name: control.name,
          evidenceOwner: control.evidenceOwner,
          verifiedEvidence: control.verifiedEvidence || "",
          missingEvidence: control.missingEvidence || "",
          status: control.status,
          comments: control.comments || "",
          artifactLink: control.artifactLink || "",
          subDomainId: domainId,
          subDomainName: domainName,
        };
      });

      // Log the request body for debugging
      console.log("Sending assessment data:", {
        name: assessmentName,
        date: assessmentDate,
        dueDate: assessmentDueDate,
        owner: assessmentOwner,
        controls: controlsData,
      });

      const response = await fetch(`/api/assessments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: assessmentName,
          date: assessmentDate,
          dueDate: assessmentDueDate,
          owner: assessmentOwner,
          controls: controlsData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update assessment");
      }

      setSuccess("Assessment updated successfully!");
      setTimeout(() => {
        router.push(`/dashboard/assessment/${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error saving assessment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save assessment"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!session?.user) {
    return <div>Please log in to access this page</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Assessment</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

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

      {/* Assessment Details Card */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Assessment Details</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Assessment Name</Label>
            <Input
              id="name"
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              placeholder="Enter assessment name"
            />
          </div>
          <div className="space-y-2">
            <Label>Assessment Owner</Label>
            <Select
              value={assessmentOwner || "none"}
              onValueChange={(value) =>
                setAssessmentOwner(value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select owner</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Assessment Date</Label>
            <Input
              id="date"
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={assessmentDueDate}
              onChange={(e) => setAssessmentDueDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {/* Control Selection and Form */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Control Details</h2>
        <div className="space-y-4">
          <Select
            value={selectedMainControl?.uniqueId || ""}
            onValueChange={handleMainControlSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a main control" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {allControls
                .filter((control) => control.type === "main")
                .map((control) => (
                  <SelectItem
                    key={control.uniqueId}
                    value={control.uniqueId}
                    className="pl-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {control.controlId}
                      </span>
                      <span className="text-sm">{control.name}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {selectedMainControl && (
            <Select
              value={selectedSubControl?.uniqueId || ""}
              onValueChange={handleSubControlSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a sub-control" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {controlGroups
                  .find(
                    (g) =>
                      g.mainControl.controlId === selectedMainControl.controlId
                  )
                  ?.subControls.map((control) => (
                    <SelectItem
                      key={control.uniqueId}
                      value={control.uniqueId}
                      className="pl-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {control.controlId}
                        </span>
                        <span className="text-sm">{control.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          {formData && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Evidence Owner</Label>
                  <Select
                    value={formData.evidenceOwner || "none"}
                    onValueChange={(value) =>
                      handleFormChange(
                        "evidenceOwner",
                        value === "none" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select owner</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleFormChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Implemented">Implemented</SelectItem>
                      <SelectItem value="Partially Implemented">
                        Partially Implemented
                      </SelectItem>
                      <SelectItem value="Not Implemented">
                        Not Implemented
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        formData.status === "Implemented" && "bg-green-500",
                        formData.status === "Partially Implemented" &&
                          "bg-yellow-500",
                        formData.status === "Not Implemented" && "bg-red-500"
                      )}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Artifact Link</Label>
                <Textarea
                  value={formData.artifactLink}
                  onChange={(e) =>
                    handleFormChange("artifactLink", e.target.value)
                  }
                  placeholder="Enter artifact link"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Verified Evidence</Label>
                  <Textarea
                    value={formData.verifiedEvidence}
                    onChange={(e) =>
                      handleFormChange("verifiedEvidence", e.target.value)
                    }
                    placeholder="Enter verified evidence"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Missing Evidence</Label>
                  <Textarea
                    value={formData.missingEvidence}
                    onChange={(e) =>
                      handleFormChange("missingEvidence", e.target.value)
                    }
                    placeholder="Enter missing evidence"
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Comments</Label>
                <Textarea
                  value={formData.comments}
                  onChange={(e) => handleFormChange("comments", e.target.value)}
                  placeholder="Enter comments"
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={handleAddControl} className="w-full">
                {editingIndex !== null ? "Update Control" : "Add Control"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Controls List */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Controls List</h2>
        {controlsList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No controls added yet. Select a control and fill in the details
            above.
          </div>
        ) : (
          <div className="space-y-4">
            {controlsList.map((control, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-mono text-sm text-muted-foreground">
                    {control.controlId}
                  </div>
                  <div className="font-medium">{control.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {
                        users.find((u) => u._id === control.evidenceOwner)
                          ?.firstName
                      }{" "}
                      {
                        users.find((u) => u._id === control.evidenceOwner)
                          ?.lastName
                      }
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          control.status === "Implemented" && "bg-green-500",
                          control.status === "Partially Implemented" &&
                            "bg-yellow-500",
                          control.status === "Not Implemented" && "bg-red-500"
                        )}
                      />
                      <span>{control.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditControl(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteControl(index)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
