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

interface NewMainControl {
  controlId: string;
  name: string;
}

interface GroupedControls {
  [domainId: string]: {
    domain: MainDomain;
    controls: {
      [subDomainId: string]: {
        subdomain: SubDomain;
        controls: MainControl[];
      };
    };
  };
}

export default function ControlsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [controls, setControls] = useState<MainControl[]>([]);
  const [domains, setDomains] = useState<MainDomain[]>([]);
  const [subDomains, setSubDomains] = useState<SubDomain[]>([]);
  const [editingControl, setEditingControl] = useState<MainControl | null>(
    null
  );
  const [newControl, setNewControl] = useState<NewMainControl>({
    controlId: '',
    name: '',
  });
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [groupedControls, setGroupedControls] = useState<GroupedControls>({});
  const [recentlyAddedControl, setRecentlyAddedControl] =
    useState<MainControl | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<string>('');
  const [expandedSubDomains, setExpandedSubDomains] = useState<string[]>([]);
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

  // Group controls by domain and subdomain
  const groupControlsByDomain = (
    controls: MainControl[],
    domains: MainDomain[],
    subDomains: SubDomain[]
  ): GroupedControls => {
    const grouped: GroupedControls = {};

    // Initialize structure with domains
    domains.forEach((domain) => {
      grouped[domain.domainId] = {
        domain,
        controls: {},
      };
    });

    // Group controls by domain and subdomain
    controls.forEach((control) => {
      const domainId = control.mainDomainId;
      const subDomainId = control.subDomainId;

      if (!grouped[domainId]) return;

      if (!grouped[domainId].controls[subDomainId]) {
        const subdomain = subDomains.find(
          (sd) => sd.subDomainId === subDomainId
        );
        if (!subdomain) return;

        grouped[domainId].controls[subDomainId] = {
          subdomain,
          controls: [],
        };
      }

      grouped[domainId].controls[subDomainId].controls.push(control);
    });

    return grouped;
  };

  // Update useEffect to use grouping
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [controlsRes, domainsRes, subDomainsRes] = await Promise.all([
          fetch('/api/controls/main'),
          fetch('/api/domains/main'),
          fetch('/api/domains/sub'),
        ]);

        if (!controlsRes.ok || !domainsRes.ok || !subDomainsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [controlsData, domainsData, subDomainsData] = await Promise.all([
          controlsRes.json(),
          domainsRes.json(),
          subDomainsRes.json(),
        ]);

        setControls(controlsData);
        setDomains(domainsData);
        setSubDomains(subDomainsData);

        // Set grouped controls
        setGroupedControls(
          groupControlsByDomain(controlsData, domainsData, subDomainsData)
        );
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  // Filter controls based on search query
  const filteredGroupedControls = searchQuery
    ? Object.entries(groupedControls).reduce((acc, [domainId, domainData]) => {
        const filteredControls = Object.entries(domainData.controls).reduce(
          (subAcc, [subDomainId, subDomainData]) => {
            const filtered = subDomainData.controls.filter(
              (control) =>
                control.controlId
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                control.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length > 0) {
              subAcc[subDomainId] = {
                ...subDomainData,
                controls: filtered,
              };
            }
            return subAcc;
          },
          {} as GroupedControls[string]['controls']
        );

        if (Object.keys(filteredControls).length > 0) {
          acc[domainId] = {
            ...domainData,
            controls: filteredControls,
          };
        }
        return acc;
      }, {} as GroupedControls)
    : groupedControls;

  const handleCreate = async () => {
    try {
      // Check for empty fields
      if (!newControl.controlId.trim() || !newControl.name.trim()) {
        throw new Error('Control ID and Name are required');
      }

      // Check if control ID already exists
      const duplicateControl = controls.find(
        (c) => c.controlId === newControl.controlId
      );
      if (duplicateControl) {
        throw new Error(`Control ID ${newControl.controlId} already exists`);
      }

      // Validate control ID format
      const controlIdPattern = /^\d+-\d+-[A-Z]-\d+$/;
      if (!controlIdPattern.test(newControl.controlId)) {
        throw new Error('Invalid control ID format. Should be like "2-15-P-2"');
      }

      const res = await fetch('/api/controls/main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newControl),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create control');
      }

      const createdControl = await res.json();

      // Update controls state
      const updatedControls = [...controls, createdControl];
      setControls(updatedControls);
      setNewControl({ controlId: '', name: '' });
      setError('');

      // Set recently added control and expand its domain/subdomain
      setRecentlyAddedControl(createdControl);
      setExpandedDomain(createdControl.mainDomainId.toString());
      setExpandedSubDomains((prev) => [...prev, createdControl.subDomainId]);

      // Update grouped controls
      setGroupedControls(
        groupControlsByDomain(updatedControls, domains, subDomains)
      );

      // Close the dialog
      setShowAddDialog(false);

      // Scroll to the new control after a short delay
      setTimeout(() => {
        recentControlRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);

      // Clear the recently added state after animation
      setTimeout(() => {
        setRecentlyAddedControl(null);
      }, 5000);
    } catch (err) {
      console.error('Create error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create control');
    }
  };

  const handleEdit = async () => {
    if (!editingControl) return;

    try {
      // Check for empty fields
      if (!editingControl.controlId.trim() || !editingControl.name.trim()) {
        throw new Error('Control ID and Name are required');
      }

      // Check if the new control ID already exists (excluding the current control)
      const duplicateControl = controls.find(
        (c) =>
          c.controlId === editingControl.controlId &&
          c._id !== editingControl._id
      );
      if (duplicateControl) {
        throw new Error(
          `Control ID ${editingControl.controlId} already exists`
        );
      }

      // Validate control ID format
      const controlIdPattern = /^\d+-\d+-[A-Z]-\d+$/;
      if (!controlIdPattern.test(editingControl.controlId)) {
        throw new Error('Invalid control ID format. Should be like "2-15-P-2"');
      }

      const res = await fetch(`/api/controls/main/${editingControl._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingControl),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update control');
      }

      const updatedControl = await res.json();

      // Update controls state
      const updatedControls = controls.map((control) =>
        control._id === updatedControl._id ? updatedControl : control
      );
      setControls(updatedControls);

      // Update grouped controls
      setGroupedControls(
        groupControlsByDomain(updatedControls, domains, subDomains)
      );

      // Set recently added control to highlight the edited control
      setRecentlyAddedControl(updatedControl);
      setExpandedDomain(updatedControl.mainDomainId.toString());
      setExpandedSubDomains((prev) => [...prev, updatedControl.subDomainId]);

      // Clear the highlight after animation
      setTimeout(() => {
        setRecentlyAddedControl(null);
      }, 5000);

      setEditingControl(null);
      setError('');
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update control');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/controls/main/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete control');
      }

      setControls(controls.filter((control) => control._id !== id));
      setError('');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete control');
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
          <h1 className="text-2xl font-bold">Controls Management</h1>
          <p className="text-gray-600">
            {controls.length} controls across {domains.length} domains and{' '}
            {subDomains.length} sub-domains
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Control
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {recentlyAddedControl && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800">
            Successfully added control:
          </p>
          <p className="text-blue-700">
            {recentlyAddedControl.controlId} - {recentlyAddedControl.name}
          </p>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search controls..."
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
        {Object.entries(filteredGroupedControls).map(
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
                        (acc, sub) => acc + sub.controls.length,
                        0
                      )}{' '}
                      Controls
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
                            {subDomainData.controls.length}
                          </Badge>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="mt-2 space-y-2">
                            {subDomainData.controls.map((control) => (
                              <Card
                                key={control._id}
                                ref={
                                  recentlyAddedControl?._id === control._id
                                    ? recentControlRef
                                    : null
                                }
                                className={`${
                                  recentlyAddedControl?._id === control._id
                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                    : ''
                                } transition-all duration-500`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">
                                        {control.controlId}
                                      </p>
                                      <p className="text-gray-600">
                                        {control.name}
                                      </p>
                                    </div>
                                    <div className="space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setEditingControl(control)
                                        }
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleDelete(control._id)
                                        }
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
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
            <DialogTitle>Add New Control</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Control ID (e.g., 2-15-P-2)"
              value={newControl.controlId}
              onChange={(e) =>
                setNewControl({ ...newControl, controlId: e.target.value })
              }
            />
            <Input
              placeholder="Control Name"
              value={newControl.name}
              onChange={(e) =>
                setNewControl({ ...newControl, name: e.target.value })
              }
            />
            <Button
              onClick={() => {
                handleCreate();
                setShowAddDialog(false);
              }}
            >
              Add Control
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingControl}
        onOpenChange={() => setEditingControl(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Control</DialogTitle>
          </DialogHeader>
          {editingControl && (
            <div className="space-y-4 py-4">
              <Input
                placeholder="Control ID"
                value={editingControl.controlId}
                onChange={(e) =>
                  setEditingControl({
                    ...editingControl,
                    controlId: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Control Name"
                value={editingControl.name}
                onChange={(e) =>
                  setEditingControl({
                    ...editingControl,
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
