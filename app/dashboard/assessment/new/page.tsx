"use client";

import { useState, useEffect } from "react";
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
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
} from "lucide-react";
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

export default function NewAssessmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [subDomains, setSubDomains] = useState<Record<string, SubDomain>>({});
  const [subDomainGroups, setSubDomainGroups] = useState<SubDomainGroup[]>([]);
  const [assessmentData, setAssessmentData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
  });
  const [controlData, setControlData] = useState<
    Record<string, AssessmentControl>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [allControls, setAllControls] = useState<Control[]>([]);
  const [addedControls, setAddedControls] = useState<AddedControl[]>([]);
  const [selectedMainControl, setSelectedMainControl] =
    useState<Control | null>(null);
  const [selectedSubControl, setSelectedSubControl] = useState<Control | null>(
    null
  );
  const [controlGroups, setControlGroups] = useState<ControlGroup[]>([]);
  const [formData, setFormData] = useState<ControlFormData | null>(null);
  const [controlsList, setControlsList] = useState<ControlFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load draft from localStorage on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear any existing draft when creating a new assessment
      localStorage.removeItem("assessmentDraft");
    }
  }, []);

  // Save draft whenever data changes
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (assessmentData.name || addedControls.length > 0)
    ) {
      const draft = {
        assessmentData,
        addedControls,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem("assessmentDraft", JSON.stringify(draft));
    }
  }, [assessmentData, addedControls]);

  // Function to extract sub-domain ID from control code
  const extractSubDomainId = (controlId: string): string | null => {
    // Format: X-X-P-X where first two X's form the sub-domain ID
    const parts = controlId.split("-");
    if (parts.length >= 3) {
      return `${parts[0]}-${parts[1]}`;
    }
    return null;
  };

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
        const subDomainsMap = subDomainsData.reduce(
          (acc: Record<string, SubDomain>, subDomain: SubDomain) => {
            acc[subDomain.subDomainId] = subDomain;
            return acc;
          },
          {}
        );
        setSubDomains(subDomainsMap);

        // Fetch controls
        const mainControlsResponse = await fetch("/api/controls/main");
        if (!mainControlsResponse.ok)
          throw new Error("Failed to fetch main controls");
        const mainControlsData = await mainControlsResponse.json();

        const subControlsResponse = await fetch("/api/controls/sub");
        if (!subControlsResponse.ok)
          throw new Error("Failed to fetch sub controls");
        const subControlsData = await subControlsResponse.json();

        // Add debugging logs
        console.log(
          "Main Controls:",
          mainControlsData.map((c: any) => ({
            controlId: c.controlId,
            name: c.name,
          }))
        );
        console.log(
          "Sub Controls:",
          subControlsData.map((c: any) => ({
            controlId: c.controlId,
            name: c.name,
          }))
        );

        // Group controls by main control
        const mainControls = mainControlsData.map((control: any) => {
          // Extract domain ID from control ID (format: X-X-P-X)
          const parts = control.controlId.split("-");
          const domainId = parts.length >= 3 ? `${parts[0]}-${parts[1]}` : "";
          const domainName = subDomainsMap[domainId]?.name || "";

          return {
            controlId: control.controlId,
            name: control.name,
            type: "main" as const,
            domainId,
            domainName,
            uniqueId: `main-${control.controlId}`,
          };
        });

        const subControls = subControlsData.map((control: any) => {
          // Extract domain ID from sub-control ID (format: X-X-T-X-X)
          const parts = control.subControlId.split("-");
          const domainId = parts.length >= 3 ? `${parts[0]}-${parts[1]}` : "";
          const domainName = subDomainsMap[domainId]?.name || "";

          return {
            controlId: control.subControlId,
            name: control.name,
            type: "sub" as const,
            domainId,
            domainName,
            uniqueId: `sub-${control.subControlId}`,
            mainControlId: control.controlId,
          };
        });

        // Create control groups
        const groups = mainControls.map((mainControl) => ({
          mainControl,
          subControls: subControls.filter(
            (sub) => sub.mainControlId === mainControl.controlId
          ),
        }));

        setControlGroups(groups);
        setAllControls(mainControls);
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
  }, [session]);

  const handleMainControlSelect = (uniqueId: string) => {
    const control = allControls.find((c) => c.uniqueId === uniqueId);
    if (control) {
      setSelectedMainControl(control);
      setSelectedSubControl(null);
      const group = controlGroups.find(
        (g) => g.mainControl.controlId === control.controlId
      );
      if (group) {
        // If there are sub-controls, show the first one by default
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
          // If no sub-controls, show the main control
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
    const totalControls = subDomainGroups.reduce(
      (acc, group) => acc + group.controls.length,
      0
    );
    if (totalControls === 0) return 0;

    const completedControls = Object.values(controlData).filter(
      (control) => control.status === "Implemented"
    ).length;
    const partiallyCompletedControls = Object.values(controlData).filter(
      (control) => control.status === "Partially Implemented"
    ).length;

    return Math.round(
      ((completedControls + partiallyCompletedControls * 0.5) / totalControls) *
        100
    );
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast.error("Please log in to create an assessment");
      return;
    }

    if (
      !assessmentData.name ||
      !assessmentData.date ||
      !assessmentData.dueDate
    ) {
      toast.error("Please fill in all assessment details");
      return;
    }

    if (controlsList.length === 0) {
      toast.error("Please add at least one control to the assessment");
      return;
    }

    setSaving(true);
    try {
      // Prepare the controls data with proper domain information
      const controlsData = controlsList.map((control) => {
        // Find the control in allControls to get the domain info
        const mainControl = allControls.find(
          (c) => c.controlId === control.controlId
        );
        const subControl = controlGroups
          .find((g) => g.mainControl.controlId === control.controlId)
          ?.subControls.find((c) => c.controlId === control.controlId);

        // Extract domain ID from control ID if not found in main/sub control
        const parts = control.controlId.split("-");
        const domainId =
          mainControl?.domainId ||
          subControl?.domainId ||
          (parts.length >= 3 ? `${parts[0]}-${parts[1]}` : "");
        const domainName =
          mainControl?.domainName ||
          subControl?.domainName ||
          subDomains[domainId]?.name ||
          "";

        // Log the control data for debugging
        console.log("Control being processed:", {
          controlId: control.controlId,
          mainControl,
          subControl,
          domainId,
          domainName,
        });

        return {
          controlId: control.controlId,
          name: control.name,
          status: control.status,
          evidenceOwner: control.evidenceOwner,
          verifiedEvidence: control.verifiedEvidence,
          missingEvidence: control.missingEvidence,
          comments: control.comments,
          artifactLink: control.artifactLink,
          subDomainName: domainName,
          subDomainId: domainId,
        };
      });

      // Log the final request payload
      console.log("Sending assessment data:", {
        ...assessmentData,
        controls: controlsData,
      });

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...assessmentData,
          controls: controlsData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || "Failed to create assessment");
      }

      // Clear draft after successful save
      localStorage.removeItem("assessmentDraft");
      toast.success("Assessment created successfully");
      router.push("/dashboard/assessment");
    } catch (error) {
      console.error("Error creating assessment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create assessment"
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (subDomainId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(subDomainId)) {
        next.delete(subDomainId);
      } else {
        next.add(subDomainId);
      }
      return next;
    });
  };

  const filteredGroups = subDomainGroups
    .map((group) => ({
      ...group,
      controls: group.controls.filter(
        (control) =>
          control.controlId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          control.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.controls.length > 0);

  // Add auto-save indicator
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = localStorage.getItem("assessmentDraft");
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setLastSaved(parsedDraft.lastSaved);
        } catch (error) {
          console.error("Error parsing last saved:", error);
        }
      }
    }
  }, [assessmentData, addedControls]);

  if (!session?.user) {
    return <div>Please log in to access this page</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Assessment</h1>
          <p className="text-muted-foreground mt-1">
            Create a new compliance controls assessment
          </p>
          {lastSaved && (
            <p className="text-sm text-muted-foreground mt-1">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <span className="font-medium">{calculateProgress()}%</span>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? "Saving..." : "Save Assessment"}
          </Button>
        </div>
      </div>

      {/* Assessment Details Card */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Assessment Details</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="name">Assessment Name</Label>
            <Input
              id="name"
              value={assessmentData.name}
              onChange={(e) =>
                setAssessmentData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter assessment name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Assessment Date</Label>
            <Input
              id="date"
              type="date"
              value={assessmentData.date}
              onChange={(e) =>
                setAssessmentData((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={assessmentData.dueDate}
              onChange={(e) =>
                setAssessmentData((prev) => ({
                  ...prev,
                  dueDate: e.target.value,
                }))
              }
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
