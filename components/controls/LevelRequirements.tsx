'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface ILevelRequirement {
  level: number;
  isRequired: boolean;
}

export interface LevelRequirementsProps {
  controlId: string;
  initialRequirements: ILevelRequirement[];
  onUpdate?: (requirements: ILevelRequirement[]) => void;
}

export function LevelRequirements({
  controlId,
  initialRequirements,
  onUpdate,
}: LevelRequirementsProps) {
  const [requirements, setRequirements] = useState<ILevelRequirement[]>(
    initialRequirements.sort((a, b) => a.level - b.level)
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = (level: number) => {
    const newRequirements = requirements.map((req) =>
      req.level === level ? { ...req, isRequired: !req.isRequired } : req
    );
    setRequirements(newRequirements);
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/controls/${controlId}/requirements`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requirements),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update requirements');
      }

      const updatedRequirements = await response.json();
      setRequirements(updatedRequirements);
      onUpdate?.(updatedRequirements);
      toast.success('Requirements updated successfully');
    } catch (error) {
      console.error('Error updating requirements:', error);
      toast.error('Failed to update requirements');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {requirements.map((req) => (
          <div
            key={req.level}
            className="flex items-center justify-between p-4 border rounded-lg bg-background"
          >
            <div className="space-y-0.5">
              <Label>Level {req.level}</Label>
              <div className="text-sm text-muted-foreground">
                {req.isRequired ? 'Mandatory' : 'Optional'}
              </div>
            </div>
            <Switch
              checked={req.isRequired}
              onCheckedChange={() => handleToggle(req.level)}
              aria-label={`Toggle Level ${req.level} requirement`}
            />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={isUpdating} className="w-full">
        {isUpdating ? 'Updating...' : 'Save Requirements'}
      </Button>
    </div>
  );
}
