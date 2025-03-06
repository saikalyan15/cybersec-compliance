'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface SubControl {
  _id: string;
  subControlId: string;
  controlId: string;
  name: string;
}

export default function LevelSubMatrixPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subControls, setSubControls] = useState<SubControl[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    fetchSubControls();
  }, []);

  const fetchSubControls = async () => {
    try {
      const response = await fetch('/api/controls/sub');
      if (!response.ok) throw new Error('Failed to fetch sub-controls');

      const data = await response.json();
      setSubControls(
        data.sort((a: SubControl, b: SubControl) =>
          a.subControlId.localeCompare(b.subControlId)
        )
      );
    } catch (error) {
      console.error('Error fetching sub-controls:', error);
      toast.error('Failed to fetch sub-controls');
    }
  };

  const filteredControls = subControls.filter(
    (control) =>
      control.subControlId.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          placeholder="Search sub-controls..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Sub-Control ID</TableHead>
              <TableHead className="w-[180px]">Parent Control</TableHead>
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
                  {control.subControlId}
                </TableCell>
                <TableCell>{control.controlId}</TableCell>
                <TableCell>{control.name}</TableCell>
                {[1, 2, 3, 4].map((level) => (
                  <TableCell key={level} className="text-center">
                    <div className="flex justify-center">
                      {/* Toggles will be added in next step */}
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
