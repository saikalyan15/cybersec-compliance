'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

interface SubControl {
  _id: string;
  subControlId: string; // Format: 1-4-P-2-1
  name: string;
  mainDomainId: number;
  subDomainId: string;
  controlId: string; // Reference to parent control
}

interface MainControl {
  _id: string;
  controlId: string;
  name: string;
  mainDomainId: number;
  subDomainId: string;
}

interface MainDomain {
  _id: string;
  domainId: number;
  name: string;
}

interface SubDomain {
  _id: string;
  mainDomainId: number;
  subDomainId: string;
  name: string;
}

interface NewSubControl {
  subControlId: string;
  name: string;
  controlId: string;
}

interface GroupedSubControls {
  [domainId: string]: {
    domain: MainDomain;
    controls: {
      [subDomainId: string]: {
        subdomain: SubDomain;
        parentControls: {
          [controlId: string]: {
            control: MainControl;
            subControls: SubControl[];
          };
        };
      };
    };
  };
}

// Add helper function to derive parent control ID
function deriveParentControlId(subControlId: string): string {
  // Split by hyphens and remove the last segment
  const segments = subControlId.split('-');
  return segments.slice(0, -1).join('-');
}

export default function SubControlsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subControls, setSubControls] = useState<SubControl[]>([]);
  const [controls, setControls] = useState<MainControl[]>([]);
  const [domains, setDomains] = useState<MainDomain[]>([]);
  const [subDomains, setSubDomains] = useState<SubDomain[]>([]);
  const [editingSubControl, setEditingSubControl] = useState<SubControl | null>(
    null
  );
  const [newSubControl, setNewSubControl] = useState<NewSubControl>({
    subControlId: '',
    name: '',
    controlId: '', // This will be auto-derived
  });
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [groupedSubControls, setGroupedSubControls] =
    useState<GroupedSubControls>({});
  const [recentlyAddedSubControl, setRecentlyAddedSubControl] =
    useState<SubControl | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<string>('');
  const [expandedSubDomains, setExpandedSubDomains] = useState<string[]>([]);
  const [expandedControls, setExpandedControls] = useState<string[]>([]);
  const recentControlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== 'admin' && session?.user?.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Group sub-controls by domain, subdomain, and parent control
  const groupSubControlsByHierarchy = (
    subControls: SubControl[],
    controls: MainControl[],
    domains: MainDomain[],
    subDomains: SubDomain[]
  ): GroupedSubControls => {
    const grouped: GroupedSubControls = {};

    // Initialize structure with domains
    domains.forEach((domain) => {
      grouped[domain.domainId] = {
        domain,
        controls: {},
      };
    });

    // Group sub-controls by domain, subdomain, and parent control
    subControls.forEach((subControl) => {
      const domainId = subControl.mainDomainId;
      const subDomainId = subControl.subDomainId;
      const parentControlId = subControl.controlId;

      if (!grouped[domainId]) return;

      if (!grouped[domainId].controls[subDomainId]) {
        const subdomain = subDomains.find(
          (sd) => sd.subDomainId === subDomainId
        );
        if (!subdomain) return;

        grouped[domainId].controls[subDomainId] = {
          subdomain,
          parentControls: {},
        };
      }

      const parentControl = controls.find(
        (c) => c.controlId === parentControlId
      );
      if (!parentControl) return;

      if (
        !grouped[domainId].controls[subDomainId].parentControls[parentControlId]
      ) {
        grouped[domainId].controls[subDomainId].parentControls[
          parentControlId
        ] = {
          control: parentControl,
          subControls: [],
        };
      }

      grouped[domainId].controls[subDomainId].parentControls[
        parentControlId
      ].subControls.push(subControl);
    });

    return grouped;
  };

  // Update useEffect to use grouping
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subControlsRes, controlsRes, domainsRes, subDomainsRes] =
          await Promise.all([
            fetch('/api/controls/sub'),
            fetch('/api/controls/main'),
            fetch('/api/domains/main'),
            fetch('/api/domains/sub'),
          ]);

        if (
          !subControlsRes.ok ||
          !controlsRes.ok ||
          !domainsRes.ok ||
          !subDomainsRes.ok
        ) {
          throw new Error('Failed to fetch data');
        }

        const [subControlsData, controlsData, domainsData, subDomainsData] =
          await Promise.all([
            subControlsRes.json(),
            controlsRes.json(),
            domainsRes.json(),
            subDomainsRes.json(),
          ]);

        setSubControls(subControlsData);
        setControls(controlsData);
        setDomains(domainsData);
        setSubDomains(subDomainsData);

        // Set grouped sub-controls
        setGroupedSubControls(
          groupSubControlsByHierarchy(
            subControlsData,
            controlsData,
            domainsData,
            subDomainsData
          )
        );
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  // Filter sub-controls based on search query
  const filteredGroupedSubControls = searchQuery
    ? Object.entries(groupedSubControls).reduce(
        (acc, [domainId, domainData]) => {
          const filteredControls = Object.entries(domainData.controls).reduce(
            (subAcc, [subDomainId, subDomainData]) => {
              const filteredParentControls = Object.entries(
                subDomainData.parentControls
              ).reduce((controlAcc, [controlId, controlData]) => {
                const filtered = controlData.subControls.filter(
                  (subControl) =>
                    subControl.subControlId
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    subControl.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                );
                if (filtered.length > 0) {
                  controlAcc[controlId] = {
                    ...controlData,
                    subControls: filtered,
                  };
                }
                return controlAcc;
              }, {} as GroupedSubControls[string]['controls'][string]['parentControls']);

              if (Object.keys(filteredParentControls).length > 0) {
                subAcc[subDomainId] = {
                  ...subDomainData,
                  parentControls: filteredParentControls,
                };
              }
              return subAcc;
            },
            {} as GroupedSubControls[string]['controls']
          );

          if (Object.keys(filteredControls).length > 0) {
            acc[domainId] = {
              ...domainData,
              controls: filteredControls,
            };
          }
          return acc;
        },
        {} as GroupedSubControls
      )
    : groupedSubControls;

  const handleCreate = async () => {
    try {
      // Check for empty fields
      if (!newSubControl.subControlId.trim() || !newSubControl.name.trim()) {
        throw new Error('Sub-Control ID and Name are required');
      }

      // Check if sub-control ID already exists
      const duplicateSubControl = subControls.find(
        (sc) => sc.subControlId === newSubControl.subControlId
      );
      if (duplicateSubControl) {
        throw new Error(
          `Sub-Control ID ${newSubControl.subControlId} already exists`
        );
      }

      // Derive parent control ID from sub control ID
      const derivedControlId = deriveParentControlId(
        newSubControl.subControlId
      );

      // Validate that parent control exists
      const parentControl = controls.find(
        (c) => c.controlId === derivedControlId
      );
      if (!parentControl) {
        throw new Error(
          `Parent control ${derivedControlId} not found. Please check the Sub-Control ID format.`
        );
      }

      // Get domain and subdomain from parent control
      const subControlToCreate = {
        ...newSubControl,
        controlId: derivedControlId,
        mainDomainId: parentControl.mainDomainId,
        subDomainId: parentControl.subDomainId,
      };

      const res = await fetch('/api/controls/sub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subControlToCreate),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create sub-control');
      }

      const createdSubControl = await res.json();

      // Update sub-controls state
      const updatedSubControls = [...subControls, createdSubControl];
      setSubControls(updatedSubControls);
      setNewSubControl({ subControlId: '', name: '', controlId: '' });
      setError('');

      // Set recently added sub-control and expand its domain/subdomain/control
      setRecentlyAddedSubControl(createdSubControl);
      setExpandedDomain(createdSubControl.mainDomainId.toString());
      setExpandedSubDomains((prev) => [...prev, createdSubControl.subDomainId]);
      setExpandedControls((prev) => [...prev, createdSubControl.controlId]);

      // Update grouped sub-controls
      setGroupedSubControls(
        groupSubControlsByHierarchy(
          updatedSubControls,
          controls,
          domains,
          subDomains
        )
      );

      // Close the dialog
      setShowAddDialog(false);

      // Scroll to the new sub-control after a short delay
      setTimeout(() => {
        recentControlRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);

      // Clear the recently added state after animation
      setTimeout(() => {
        setRecentlyAddedSubControl(null);
      }, 5000);
    } catch (err) {
      console.error('Create error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create sub-control'
      );
    }
  };

  const handleEdit = async () => {
    if (!editingSubControl) return;

    try {
      // Check for empty fields
      if (
        !editingSubControl.subControlId.trim() ||
        !editingSubControl.name.trim()
      ) {
        throw new Error('Sub-Control ID and Name are required');
      }

      // Check if the new sub-control ID already exists (excluding the current sub-control)
      const duplicateSubControl = subControls.find(
        (sc) =>
          sc.subControlId === editingSubControl.subControlId &&
          sc._id !== editingSubControl._id
      );
      if (duplicateSubControl) {
        throw new Error(
          `Sub-Control ID ${editingSubControl.subControlId} already exists`
        );
      }

      // Derive parent control ID from sub control ID
      const derivedControlId = deriveParentControlId(
        editingSubControl.subControlId
      );

      // Validate that parent control exists
      const parentControl = controls.find(
        (c) => c.controlId === derivedControlId
      );
      if (!parentControl) {
        throw new Error(
          `Parent control ${derivedControlId} not found. Please check the Sub-Control ID format.`
        );
      }

      // Update the sub-control with derived parent control info
      const subControlToUpdate = {
        ...editingSubControl,
        controlId: derivedControlId,
        mainDomainId: parentControl.mainDomainId,
        subDomainId: parentControl.subDomainId,
      };

      const res = await fetch(`/api/controls/sub/${editingSubControl._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subControlToUpdate),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update sub-control');
      }

      const updatedSubControl = await res.json();

      // Update sub-controls state
      const updatedSubControls = subControls.map((subControl) =>
        subControl._id === updatedSubControl._id
          ? updatedSubControl
          : subControl
      );
      setSubControls(updatedSubControls);

      // Update grouped sub-controls
      setGroupedSubControls(
        groupSubControlsByHierarchy(
          updatedSubControls,
          controls,
          domains,
          subDomains
        )
      );

      // Set recently added sub-control to highlight the edited sub-control
      setRecentlyAddedSubControl(updatedSubControl);
      setExpandedDomain(updatedSubControl.mainDomainId.toString());
      setExpandedSubDomains((prev) => [...prev, updatedSubControl.subDomainId]);
      setExpandedControls((prev) => [...prev, updatedSubControl.controlId]);

      // Clear the highlight after animation
      setTimeout(() => {
        setRecentlyAddedSubControl(null);
      }, 5000);

      setEditingSubControl(null);
      setError('');
    } catch (err) {
      console.error('Update error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to update sub-control'
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/controls/sub/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete sub-control');
      }

      setSubControls(subControls.filter((subControl) => subControl._id !== id));
      setError('');
    } catch (err) {
      console.error('Delete error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to delete sub-control'
      );
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (
    !session ||
    (session.user?.role !== 'admin' && session.user?.role !== 'owner')
  ) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sub-Controls Management</h1>
          <p className="text-gray-600">
            {subControls.length} sub-controls under{' '}
            {Array.from(new Set(subControls.map((sc) => sc.controlId))).length}{' '}
            controls across {domains.length} domains and {subDomains.length}{' '}
            sub-domains
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Sub-Control
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {recentlyAddedSubControl && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800">
            Successfully added sub-control:
          </p>
          <p className="text-blue-700">
            {recentlyAddedSubControl.subControlId} -{' '}
            {recentlyAddedSubControl.name}
          </p>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sub-controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        className="space-y-4"
        value={expandedDomain}
        onValueChange={setExpandedDomain}
      >
        {Object.entries(filteredGroupedSubControls).map(
          ([domainId, domainData]) => (
            <AccordionItem
              key={domainId}
              value={domainId}
              className="bg-white rounded-lg border"
            >
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {domainData.domain.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {Object.values(domainData.controls).reduce(
                        (acc, sub) =>
                          acc +
                          Object.values(sub.parentControls).reduce(
                            (controlAcc, control) =>
                              controlAcc + control.subControls.length,
                            0
                          ),
                        0
                      )}{' '}
                      Sub-Controls
                    </p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-4 p-4">
                  {Object.entries(domainData.controls).map(
                    ([subDomainId, subDomainData]) => (
                      <Collapsible
                        key={subDomainId}
                        open={expandedSubDomains.includes(subDomainId)}
                        onOpenChange={(isOpen) => {
                          setExpandedSubDomains(
                            isOpen
                              ? [...expandedSubDomains, subDomainId]
                              : expandedSubDomains.filter(
                                  (id) => id !== subDomainId
                                )
                          );
                        }}
                      >
                        <CollapsibleTrigger className="flex justify-between w-full p-2 hover:bg-gray-50 rounded-md">
                          <span className="font-medium">
                            {subDomainData.subdomain.name}
                          </span>
                          <Badge variant="secondary">
                            {Object.values(subDomainData.parentControls).reduce(
                              (acc, control) =>
                                acc + control.subControls.length,
                              0
                            )}
                          </Badge>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="mt-2 space-y-2">
                            {Object.entries(subDomainData.parentControls).map(
                              ([controlId, controlData]) => (
                                <Collapsible
                                  key={controlId}
                                  open={expandedControls.includes(controlId)}
                                  onOpenChange={(isOpen) => {
                                    setExpandedControls(
                                      isOpen
                                        ? [...expandedControls, controlId]
                                        : expandedControls.filter(
                                            (id) => id !== controlId
                                          )
                                    );
                                  }}
                                >
                                  <CollapsibleTrigger className="flex justify-between w-full p-2 hover:bg-gray-50 rounded-md ml-4">
                                    <div>
                                      <span className="font-medium">
                                        {controlData.control.controlId}
                                      </span>
                                      <span className="text-gray-600 ml-2">
                                        {controlData.control.name}
                                      </span>
                                    </div>
                                    <Badge variant="secondary">
                                      {controlData.subControls.length}
                                    </Badge>
                                  </CollapsibleTrigger>

                                  <CollapsibleContent>
                                    <div className="mt-2 space-y-2 ml-8">
                                      {controlData.subControls.map(
                                        (subControl) => (
                                          <Card
                                            key={subControl._id}
                                            ref={
                                              recentlyAddedSubControl?._id ===
                                              subControl._id
                                                ? recentControlRef
                                                : null
                                            }
                                            className={`${
                                              recentlyAddedSubControl?._id ===
                                              subControl._id
                                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                                : ''
                                            } transition-all duration-500`}
                                          >
                                            <CardContent className="p-4">
                                              <div className="flex justify-between items-center">
                                                <div>
                                                  <p className="font-medium">
                                                    {subControl.subControlId}
                                                  </p>
                                                  <p className="text-gray-600">
                                                    {subControl.name}
                                                  </p>
                                                </div>
                                                <div className="space-x-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                      setEditingSubControl(
                                                        subControl
                                                      )
                                                    }
                                                  >
                                                    Edit
                                                  </Button>
                                                  <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleDelete(
                                                        subControl._id
                                                      )
                                                    }
                                                  >
                                                    Delete
                                                  </Button>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        )
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              )
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        )}
      </Accordion>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Sub-Control</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Sub-Control ID (e.g., 1-4-P-2-1)"
                value={newSubControl.subControlId}
                onChange={(e) => {
                  const subControlId = e.target.value;
                  setNewSubControl({
                    ...newSubControl,
                    subControlId,
                  });
                }}
              />
              <p className="text-sm text-gray-500">
                Parent Control ID will be automatically derived from Sub-Control
                ID
              </p>
            </div>
            <Input
              placeholder="Sub-Control Name"
              value={newSubControl.name}
              onChange={(e) =>
                setNewSubControl({ ...newSubControl, name: e.target.value })
              }
            />
            <Button onClick={handleCreate}>Add Sub-Control</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingSubControl}
        onOpenChange={() => setEditingSubControl(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sub-Control</DialogTitle>
          </DialogHeader>
          {editingSubControl && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Sub-Control ID"
                  value={editingSubControl.subControlId}
                  onChange={(e) =>
                    setEditingSubControl({
                      ...editingSubControl,
                      subControlId: e.target.value,
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  Parent Control ID will be automatically derived from
                  Sub-Control ID
                </p>
              </div>
              <Input
                placeholder="Sub-Control Name"
                value={editingSubControl.name}
                onChange={(e) =>
                  setEditingSubControl({
                    ...editingSubControl,
                    name: e.target.value,
                  })
                }
              />
              <Button onClick={handleEdit}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
