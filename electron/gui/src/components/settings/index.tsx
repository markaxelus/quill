import { useState } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AppSettings {
  defaultFolder: string;
  defaultSubject: string;
  skipIncomplete: boolean;
  exportBehavior: string;
  outputPath: string;
}

interface SettingsProps {
  initialSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onBack: () => void;
}

export function Settings({ initialSettings, onSave, onBack }: SettingsProps) {
  const [defaultFolder, setDefaultFolder] = useState(initialSettings.defaultFolder);
  const [defaultSubject, setDefaultSubject] = useState(initialSettings.defaultSubject);
  const [skipIncomplete, setSkipIncomplete] = useState(initialSettings.skipIncomplete);
  const [exportBehavior, setExportBehavior] = useState(initialSettings.exportBehavior);

  const handleSave = () => {
    onSave({
      defaultFolder,
      defaultSubject,
      skipIncomplete,
      exportBehavior,
      outputPath: initialSettings.outputPath
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="size-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight text-neutral-900">Settings</h1>
            <p className="text-neutral-600">Configure default behavior and parsing options</p>
          </div>
        </div>

        {/* Default Values */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-neutral-900">Default Values</CardTitle>
            <CardDescription>
              These values will be pre-filled when you start a new scan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-folder">Default Email Folder</Label>
              <Select value={defaultFolder} onValueChange={setDefaultFolder}>
                <SelectTrigger id="default-folder" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inbox">Inbox</SelectItem>
                  <SelectItem value="Inbox/Scholars">Inbox / Scholars</SelectItem>
                  <SelectItem value="Inbox/Applications">Inbox / Applications</SelectItem>
                  <SelectItem value="Archive/2026">Archive / 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-subject">Default Subject Keyword</Label>
              <Input
                id="default-subject"
                value={defaultSubject}
                onChange={(e) => setDefaultSubject(e.target.value)}
                className="bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Parsing Options */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-neutral-900">Parsing Options</CardTitle>
            <CardDescription>
              Control how application forms are processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="skip-incomplete">Skip Incomplete Forms</Label>
                <p className="text-sm text-neutral-500">
                  Automatically skip applications missing required fields
                </p>
              </div>
              <Switch
                id="skip-incomplete"
                checked={skipIncomplete}
                onCheckedChange={setSkipIncomplete}
              />
            </div>
          </CardContent>
        </Card>

        {/* Export Behavior */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-neutral-900">Export Behavior</CardTitle>
            <CardDescription>
              Choose what happens when exporting to an existing file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="export-behavior">If output file exists</Label>
            <Select value={exportBehavior} onValueChange={setExportBehavior}>
              <SelectTrigger id="export-behavior" className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create new file with timestamp</SelectItem>
                <SelectItem value="overwrite">Overwrite existing file</SelectItem>
                <SelectItem value="append">Append to existing file</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2 bg-neutral-900 hover:bg-neutral-800">
            <Save className="size-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
