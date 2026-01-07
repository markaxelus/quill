import { useState } from "react";
import { Calendar, Folder, FileText, Settings, Shield } from "lucide-react";
import { Label } from '../ui/label';
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

type Props = {};

const Setup = () => {
  const [folder, setFolder] = useState("Inbox");
  const [subjectFilter, setSubjectFilter] = useState("scholars");
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [outputPath, setOutputPath] = useState("");

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
        

        
      </div>
    </div>
  );
};

export default Setup;
