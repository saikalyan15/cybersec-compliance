'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
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
      setControls([...controls, createdControl]);
      setNewControl({ controlId: '', name: '' });
      setError('');
    } catch (err) {
      console.error('Create error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create control');
    }
  };

  const handleEdit = async () => {
    if (!editingControl) return;

    try {
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
      setControls(
        controls.map((control) =>
          control._id === updatedControl._id ? updatedControl : control
        )
      );
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

  const getDomainName = (domainId: number) => {
    const domain = domains.find((d) => d.domainId === domainId);
    return domain?.name || 'Not Available';
  };

  const getSubDomainName = (subDomainId: string) => {
    const subDomain = subDomains.find((sd) => sd.subDomainId === subDomainId);
    return subDomain?.name || 'Not Available';
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
      <h1 className="text-2xl font-bold mb-6">Manage Controls</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Control</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Control ID (e.g., 2-15-P-2)"
            value={newControl.controlId}
            onChange={(e) =>
              setNewControl({ ...newControl, controlId: e.target.value })
            }
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Control Name"
            value={newControl.name}
            onChange={(e) =>
              setNewControl({ ...newControl, name: e.target.value })
            }
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Control
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Control ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subdomain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {controls.map((control) => (
              <tr key={control._id}>
                {editingControl?._id === control._id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editingControl.controlId}
                        onChange={(e) =>
                          setEditingControl({
                            ...editingControl,
                            controlId: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editingControl.name}
                        onChange={(e) =>
                          setEditingControl({
                            ...editingControl,
                            name: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {getDomainName(editingControl.mainDomainId)}
                    </td>
                    <td className="px-6 py-4">
                      {getSubDomainName(editingControl.subDomainId)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={handleEdit}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingControl(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">{control.controlId}</td>
                    <td className="px-6 py-4">{control.name}</td>
                    <td className="px-6 py-4">
                      {getDomainName(control.mainDomainId)}
                    </td>
                    <td className="px-6 py-4">
                      {getSubDomainName(control.subDomainId)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setEditingControl(control)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(control._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
