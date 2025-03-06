'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface MainControl {
  _id: string;
  controlId: string;
  name: string;
  levelSettings: {
    level: number;
    isRequired: boolean;
  }[];
}

export default function LevelMatrixPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [controls, setControls] = useState<MainControl[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
    fetchControls();
  }, []);

  const fetchControls = async () => {
    try {
      const response = await fetch('/api/controls/main');
      if (!response.ok) throw new Error('Failed to fetch controls');
      const data = await response.json();
      setControls(
        data.sort((a: MainControl, b: MainControl) =>
          a.controlId.localeCompare(b.controlId)
        )
      );
    } catch (error: unknown) {
      console.error('Error fetching controls:', error);
      toast.error('Failed to fetch controls');
    }
  };

  const handleSettingToggle = async (controlId: string, level: number) => {
    try {
      setIsUpdating(true);
      const control = controls.find((c) => c._id === controlId);
      if (!control) return;

      const updatedSettings = control.levelSettings.map((setting) =>
        setting.level === level
          ? { ...setting, isRequired: !setting.isRequired }
          : setting
      );

      const response = await fetch(`/api/level-settings/${controlId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) throw new Error('Failed to update level setting');

      setControls(
        controls.map((c) =>
          c._id === controlId ? { ...c, levelSettings: updatedSettings } : c
        )
      );
      toast.success('Level setting updated successfully');
    } catch (error: unknown) {
      console.error('Error updating level setting:', error);
      toast.error('Failed to update level setting');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredControls = controls.filter(
    (control) =>
      control.controlId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-sm font-medium text-foreground mb-4">
        Note: Toggle OFF = Optional, Toggle ON = Mandatory
      </div>
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search controls..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Control ID</TableHead>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead className="text-center">Level 1</TableHead>
              <TableHead className="text-center">Level 2</TableHead>
              <TableHead className="text-center">Level 3</TableHead>
              <TableHead className="text-center">Level 4</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredControls.map((control) => (
              <TableRow key={control._id}>
                <TableCell className="font-medium">
                  {control.controlId}
                </TableCell>
                <TableCell>{control.name}</TableCell>
                {[1, 2, 3, 4].map((level) => (
                  <TableCell key={level} className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={
                          control.levelSettings.find(
                            (setting) => setting.level === level
                          )?.isRequired || false
                        }
                        onCheckedChange={() =>
                          handleSettingToggle(control._id, level)
                        }
                        disabled={isUpdating}
                        aria-label={`Toggle Level ${level} for ${control.controlId}`}
                      />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
