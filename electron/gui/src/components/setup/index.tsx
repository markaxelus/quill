import { useState, useEffect } from "react";
import { api } from "../../api";
import { Calendar, Folder, FileText, Settings, Shield, Filter } from "lucide-react";
import { Label } from '../ui/label';
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from "../ui/input";

type SetupProps = {
  onScan: (config: ScanConfig) => void;
  onNavigate: (screen: string) => void;
  defaults?: {
    folder: string;
    subject: string;
  }
};

export interface ScanConfig {
  folder: string;
  subjectFilter: string;
  fromDate: string;
  outputPath: string;
}

const Setup = ({ onNavigate, onScan, defaults }: SetupProps) => {
  const [folder, setFolder] = useState(defaults?.folder || "Inbox");
  const [subjectFilter, setSubjectFilter] = useState(defaults?.subject || "");
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [outputPath, setOutputPath] = useState("");
  const [currentUser, setCurrentUser] = useState("Loading...");

  useEffect(() => {
    api.getUser().then(setCurrentUser).catch(() => setCurrentUser("Unknown"));
  }, []);

  const handleBrowse = async () => {
    try {
      const path = await api.selectDirectory();
      if (path) {
        setOutputPath(path);
      }
    } catch (e) {
      console.error("Failed to select directory:", e);
    }
  };
  
  const handleScan = () => {
    onScan({
      folder,
      subjectFilter,
      fromDate,
      outputPath
    })
  }
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl text-neutral-900 tracking-tight">
            Scholars Application Parser
          </h1>
          <p className="text-neutral-600">
            Process Scholars Program applications from email attachments into a
            structured Excel file. All processing happens locally on your
            computer.
          </p>
        </div>

        {/* Email Source */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-neutral-900">
                <Folder className="size-5" />
                Email Source
              </CardTitle>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50/50 rounded-full border border-emerald-100">
                <div className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-medium text-emerald-700">
                  Connected: <span className="text-neutral-900 ml-0.5">{currentUser}</span>
                </span>
              </div>
            </div>
            <CardDescription>Select which Outlook folder to scan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select value={folder} onValueChange={setFolder}>
                <SelectTrigger id="folder" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inbox">Inbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-900">
              <Filter className="size-5" />
              Filters
            </CardTitle>
            <CardDescription>Narrow down which emails to process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Contains</Label>
              <Input 
                id="subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                placeholder="scholars"
                className="bg-white"
              />
              <p className="text-sm text-neutral-500">
                Only process emails with this keyword in the subject line
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">From Date</Label>
              <Input 
                id="date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="scholars"
                className="bg-white"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
              <p className="text-sm text-neutral-500">
                Only include emails received on or after this date
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-900">
              <FileText className="size-5" />
              Output
            </CardTitle>
            <CardDescription>Select the folder where the Excel file will be saved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="output">Export Path</Label>
              <div className="flex gap-2">
                <Input
                  id="output"
                  value={outputPath}
                  onChange={(e) => setOutputPath(e.target.value)}
                  className="bg-white flex-1"
                />
                <Button variant="outline" className="px-4" onClick={handleBrowse}>
                  Browse
                </Button>
              </div>
              <p className="text-sm text-neutral-500">
                Filename: <span className="text-neutral-700 font-medium">scholars_export.xlsx</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-4">
            <button 
              onClick={() => onNavigate('settings')}
              className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors"
            >
              <Settings className="size-4" />
              Settings
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors"
            >
              <Shield className="size-4" />
              Privacy
            </button>
          </div>
          <Button
            onClick={handleScan}
            size="lg"
            className="px-8 bg-neutral-900 hover:bg-neutral-800"
            disabled={!outputPath}
            title={!outputPath ? "Please select an export folder first" : ""}
          >
            Scan Inbox
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Setup;
