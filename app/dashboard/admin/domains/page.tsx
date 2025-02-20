'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MainDomain {
  _id: string;
  domainId: number;
  name: string;
}

interface NewMainDomain {
  domainId: number;
  name: string;
}

export default function DomainsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [domains, setDomains] = useState<MainDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewDomainForm, setShowNewDomainForm] = useState(false);
  const [editingDomain, setEditingDomain] = useState<MainDomain | null>(null);
  const [newDomain, setNewDomain] = useState<NewMainDomain>({
    domainId: 0,
    name: '',
  });

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains/main');
      if (!response.ok) {
        throw new Error('Failed to fetch domains');
      }
      const data = await response.json();
      setDomains(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to fetch domains'
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

    fetchDomains();
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      const response = await fetch('/api/domains/main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDomain),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create domain');
      }

      await fetchDomains();
      setShowNewDomainForm(false);
      setNewDomain({
        domainId: 0,
        name: '',
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to create domain'
      );
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomain) return;

    try {
      setErrorMessage('');
      const response = await fetch(`/api/domains/main/${editingDomain._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domainId: editingDomain.domainId,
          name: editingDomain.name,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update domain');
      }

      await fetchDomains();
      setEditingDomain(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update domain'
      );
    }
  };

  const handleDelete = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) {
      return;
    }

    try {
      const response = await fetch(`/api/domains/main/${domainId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete domain');
      }

      await fetchDomains();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to delete domain'
      );
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Domain Management</h1>
        <button
          onClick={() => setShowNewDomainForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Domain
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {showNewDomainForm && (
        <div className="mb-6 p-4 bg-white rounded-md shadow">
          <h2 className="text-xl mb-4">Add New Domain</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Domain ID:</label>
              <input
                type="number"
                value={newDomain.domainId}
                onChange={(e) =>
                  setNewDomain({
                    ...newDomain,
                    domainId: parseInt(e.target.value),
                  })
                }
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Name:</label>
              <input
                type="text"
                value={newDomain.name}
                onChange={(e) =>
                  setNewDomain({ ...newDomain, name: e.target.value })
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
                onClick={() => setShowNewDomainForm(false)}
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
              Domain ID
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
          {domains.map((domain) => (
            <tr key={domain._id}>
              {editingDomain?._id === domain._id ? (
                <>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={editingDomain.domainId}
                      onChange={(e) =>
                        setEditingDomain({
                          ...editingDomain,
                          domainId: parseInt(e.target.value),
                        })
                      }
                      className="border rounded px-2 py-1 w-20"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editingDomain.name}
                      onChange={(e) =>
                        setEditingDomain({
                          ...editingDomain,
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
                      onClick={() => setEditingDomain(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4">{domain.domainId}</td>
                  <td className="px-6 py-4">{domain.name}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setEditingDomain(domain)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(domain._id)}
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
