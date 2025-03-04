'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { ILevel } from '@/app/models/Level';

export default function LevelsPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  const [levels, setLevels] = useState<ILevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLevel, setEditingLevel] = useState<ILevel | null>(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  async function fetchLevels() {
    try {
      const response = await fetch('/api/levels');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch levels');
      }
      const data = await response.json();
      setLevels(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load levels');
      setIsLoading(false);
    }
  }

  async function handleDelete(levelId: number) {
    if (!confirm('Are you sure you want to delete this level?')) return;

    try {
      const response = await fetch(`/api/levels/${levelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete level');
      }

      // Remove the deleted level from state
      setLevels(levels.filter((level) => level.levelId !== levelId));
      setError(null); // Clear any existing errors
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete level');
    }
  }

  async function handleEdit(level: ILevel) {
    setIsEditing(true);
    setEditingLevel(level);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLevel) return;

    try {
      const isNewLevel = !editingLevel._id;
      const url = isNewLevel
        ? '/api/levels'
        : `/api/levels/${editingLevel.levelId}`;

      const response = await fetch(url, {
        method: isNewLevel ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levelId: editingLevel.levelId,
          description: editingLevel.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save level');
      }

      const savedLevel = await response.json();

      if (isNewLevel) {
        setLevels([...levels, savedLevel]);
      } else {
        setLevels(
          levels.map((level) =>
            level.levelId === editingLevel.levelId ? savedLevel : level
          )
        );
      }

      setIsEditing(false);
      setEditingLevel(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save level');
    }
  }

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="rounded-md border">
        <div className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Classification Levels</h1>
          <button
            onClick={() =>
              handleEdit({ levelId: levels.length + 1, description: '' })
            }
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={16} />
            Add Level
          </button>
        </div>

        {isEditing && editingLevel && (
          <div className="p-4 border-b">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Level ID
                </label>
                <input
                  type="number"
                  value={editingLevel.levelId}
                  onChange={(e) =>
                    setEditingLevel({
                      ...editingLevel,
                      levelId: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                  max="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editingLevel.description}
                  onChange={(e) =>
                    setEditingLevel({
                      ...editingLevel,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingLevel(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                      >
                        Level
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {levels.map((level) => (
                      <tr key={level.levelId}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                          {level.levelId}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {level.description}
                        </td>
                        <td className="px-3 py-4 text-sm text-right space-x-2">
                          <button
                            onClick={() => handleEdit(level)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(level.levelId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
