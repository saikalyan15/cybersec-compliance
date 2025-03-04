'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  mainDomain?: MainDomain;
}

interface NewSubDomain {
  mainDomainId: number;
  subDomainId: string;
  name: string;
}

export default function SubDomainsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subDomains, setSubDomains] = useState<SubDomain[]>([]);
  const [mainDomains, setMainDomains] = useState<MainDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingSubDomain, setEditingSubDomain] = useState<SubDomain | null>(
    null
  );
  const [newSubDomain, setNewSubDomain] = useState<NewSubDomain>({
    mainDomainId: 0,
    subDomainId: '',
    name: '',
  });

  const fetchMainDomains = async () => {
    try {
      const response = await fetch('/api/domains/main');
      if (!response.ok) throw new Error('Failed to fetch main domains');
      const data = await response.json();
      setMainDomains(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to fetch main domains'
      );
    }
  };

  const fetchSubDomains = async () => {
    try {
      const response = await fetch('/api/domains/sub');
      if (!response.ok) throw new Error('Failed to fetch sub domains');
      const data = await response.json();
      setSubDomains(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to fetch sub domains'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (
      !session ||
      !['admin', 'owner'].includes(session.user?.role as string)
    ) {
      router.push('/dashboard');
      return;
    }

    fetchMainDomains();
    fetchSubDomains();
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessage('');

      // Check for empty fields
      if (
        !newSubDomain.subDomainId.trim() ||
        !newSubDomain.name.trim() ||
        !newSubDomain.mainDomainId
      ) {
        throw new Error('All fields are required');
      }

      // Check if sub-domain ID already exists
      const duplicateSubDomain = subDomains.find(
        (sd) => sd.subDomainId === newSubDomain.subDomainId
      );
      if (duplicateSubDomain) {
        throw new Error(
          `Sub-Domain ID ${newSubDomain.subDomainId} already exists`
        );
      }

      // Validate sub-domain ID format (e.g., "1-1")
      const subDomainIdPattern = /^\d+-\d+$/;
      if (!subDomainIdPattern.test(newSubDomain.subDomainId)) {
        throw new Error('Invalid sub-domain ID format. Should be like "1-1"');
      }

      // Validate that main domain exists
      const mainDomain = mainDomains.find(
        (d) => d.domainId === newSubDomain.mainDomainId
      );
      if (!mainDomain) {
        throw new Error(
          `Main Domain ID ${newSubDomain.mainDomainId} not found`
        );
      }

      // Validate that sub-domain ID starts with main domain ID
      const [mainDomainPart] = newSubDomain.subDomainId.split('-');
      if (parseInt(mainDomainPart) !== newSubDomain.mainDomainId) {
        throw new Error(
          'Sub-Domain ID must start with the selected Main Domain ID'
        );
      }

      const response = await fetch('/api/domains/sub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubDomain),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create sub domain');
      }

      await fetchSubDomains();
      setShowNewForm(false);
      setNewSubDomain({
        mainDomainId: 0,
        subDomainId: '',
        name: '',
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to create sub-domain'
      );
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubDomain) return;

    try {
      setErrorMessage('');

      // Check for empty fields
      if (
        !editingSubDomain.subDomainId.trim() ||
        !editingSubDomain.name.trim() ||
        !editingSubDomain.mainDomainId
      ) {
        throw new Error('All fields are required');
      }

      // Check if the new sub-domain ID already exists (excluding the current sub-domain)
      const duplicateSubDomain = subDomains.find(
        (sd) =>
          sd.subDomainId === editingSubDomain.subDomainId &&
          sd._id !== editingSubDomain._id
      );
      if (duplicateSubDomain) {
        throw new Error(
          `Sub-Domain ID ${editingSubDomain.subDomainId} already exists`
        );
      }

      // Validate sub-domain ID format (e.g., "1-1")
      const subDomainIdPattern = /^\d+-\d+$/;
      if (!subDomainIdPattern.test(editingSubDomain.subDomainId)) {
        throw new Error('Invalid sub-domain ID format. Should be like "1-1"');
      }

      // Validate that main domain exists
      const mainDomain = mainDomains.find(
        (d) => d.domainId === editingSubDomain.mainDomainId
      );
      if (!mainDomain) {
        throw new Error(
          `Main Domain ID ${editingSubDomain.mainDomainId} not found`
        );
      }

      // Validate that sub-domain ID starts with main domain ID
      const [mainDomainPart] = editingSubDomain.subDomainId.split('-');
      if (parseInt(mainDomainPart) !== editingSubDomain.mainDomainId) {
        throw new Error(
          'Sub-Domain ID must start with the selected Main Domain ID'
        );
      }

      const response = await fetch(`/api/domains/sub/${editingSubDomain._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingSubDomain),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update sub domain');
      }

      await fetchSubDomains();
      setEditingSubDomain(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update sub-domain'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sub domain?')) {
      return;
    }

    try {
      const response = await fetch(`/api/domains/sub/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete sub domain');
      }

      await fetchSubDomains();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to delete sub domain'
      );
    }
  };

  const getMainDomainName = (mainDomainId: number) => {
    const mainDomain = mainDomains.find((d) => d.domainId === mainDomainId);
    return mainDomain ? mainDomain.name : 'Unknown';
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Sub Domain Management</h1>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Sub Domain
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {showNewForm && (
        <div className="mb-6 p-4 bg-white rounded-md shadow">
          <h2 className="text-xl mb-4">Add New Sub Domain</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Main Domain:</label>
              <select
                value={newSubDomain.mainDomainId}
                onChange={(e) =>
                  setNewSubDomain({
                    ...newSubDomain,
                    mainDomainId: parseInt(e.target.value),
                  })
                }
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Select Main Domain</option>
                {mainDomains.map((domain) => (
                  <option key={domain._id} value={domain.domainId}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Sub Domain ID:</label>
              <input
                type="text"
                value={newSubDomain.subDomainId}
                onChange={(e) =>
                  setNewSubDomain({
                    ...newSubDomain,
                    subDomainId: e.target.value,
                  })
                }
                placeholder="e.g., 1-1"
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Name:</label>
              <input
                type="text"
                value={newSubDomain.name}
                onChange={(e) =>
                  setNewSubDomain({
                    ...newSubDomain,
                    name: e.target.value,
                  })
                }
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Main Domain
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sub Domain ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subDomains.map((subDomain) => (
            <tr key={subDomain._id}>
              {editingSubDomain?._id === subDomain._id ? (
                <>
                  <td className="px-6 py-4">
                    <select
                      value={editingSubDomain.mainDomainId}
                      onChange={(e) =>
                        setEditingSubDomain({
                          ...editingSubDomain,
                          mainDomainId: parseInt(e.target.value),
                        })
                      }
                      className="border rounded px-2 py-1"
                    >
                      {mainDomains.map((domain) => (
                        <option key={domain._id} value={domain.domainId}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editingSubDomain.subDomainId}
                      onChange={(e) =>
                        setEditingSubDomain({
                          ...editingSubDomain,
                          subDomainId: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 w-20"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editingSubDomain.name}
                      onChange={(e) =>
                        setEditingSubDomain({
                          ...editingSubDomain,
                          name: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={handleEdit}
                      className="text-green-600 hover:text-green-900 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSubDomain(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4">
                    {getMainDomainName(subDomain.mainDomainId)}
                  </td>
                  <td className="px-6 py-4">{subDomain.subDomainId}</td>
                  <td className="px-6 py-4">{subDomain.name}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setEditingSubDomain(subDomain)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subDomain._id)}
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
  );
}
