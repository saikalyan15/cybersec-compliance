'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface ILevelSetting {
  level: number;
  isRequired: boolean;
}

export interface LevelSettingsProps {
  controlId: string;
  initialSettings: ILevelSetting[];
  onUpdate?: (settings: ILevelSetting[]) => void;
}

export function LevelSettings({
  controlId,
  initialSettings,
  onUpdate,
}: LevelSettingsProps) {
  const [settings, setSettings] = useState<ILevelSetting[]>(
    initialSettings.sort((a, b) => a.level - b.level)
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = (level: number) => {
    const newSettings = settings.map((setting) =>
      setting.level === level
        ? { ...setting, isRequired: !setting.isRequired }
        : setting
    );
    setSettings(newSettings);
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/level-settings/${controlId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update level settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      onUpdate?.(updatedSettings);
      toast.success('Level settings updated successfully');
    } catch (error) {
      console.error('Error updating level settings:', error);
      toast.error('Failed to update level settings');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm font-medium mb-4 text-foreground">
        Note: Toggle OFF = Optional, Toggle ON = Mandatory
      </div>
      <div className="grid gap-4">
        {settings.map((setting) => (
          <div
            key={setting.level}
            className="flex items-center justify-between p-4 border rounded-lg bg-background"
          >
            <div className="space-y-0.5">
              <Label>Level {setting.level}</Label>
              <div className="text-sm text-muted-foreground">
                {setting.isRequired ? 'Mandatory' : 'Optional'}
              </div>
            </div>
            <Switch
              checked={setting.isRequired}
              onCheckedChange={() => handleToggle(setting.level)}
              aria-label={`Toggle Level ${setting.level} setting`}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={isUpdating} className="w-full">
        {isUpdating ? 'Updating...' : 'Save Level Settings'}
      </Button>
    </div>
  );
}
