import { useState } from 'react';
import { CheckCircle2, FileSpreadsheet, FolderOpen, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { ProcessingSummary } from '../processing';

import { api } from '../../api';

interface CompletionProps {
  summary: ProcessingSummary;
  onRunAgain: () => void;
}

export function Completion({ summary, onRunAgain }: CompletionProps) {
  const [showSkipped, setShowSkipped] = useState(false);

  const handleOpenExcel = async () => {
    try {
      await api.openFile(summary.outputPath);
    } catch (e) {
      console.error("Failed to open file:", e);
      alert("Failed to open file: " + e);
    }
  };

  const handleOpenFolder = async () => {
    try {
      // Open the folder containing the output file
      const folderPath = summary.outputPath.substring(0, summary.outputPath.lastIndexOf('\\'));
      await api.openFolder(folderPath || summary.outputPath);
    } catch (e) {
      console.error("Failed to open folder:", e);
      alert("Failed to open folder: " + e);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center size-16 bg-emerald-100 rounded-full">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl tracking-tight text-neutral-900">
              Export Complete
            </h1>
            <p className="text-neutral-600">
              Successfully processed {summary.successful} applications and exported to Excel
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Total Processed</CardDescription>
              <CardTitle className="text-3xl text-neutral-900">{summary.totalProcessed}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Successfully Parsed</CardDescription>
              <CardTitle className="text-3xl text-emerald-600">{summary.successful}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Skipped</CardDescription>
              <CardTitle className="text-3xl text-amber-600">{summary.skipped}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Output File */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <FileSpreadsheet className="size-6 text-emerald-600" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-sm text-neutral-500">Output file saved to</div>
                <div className="text-neutral-900 font-medium break-all">{summary.outputPath}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleOpenExcel}
            size="lg"
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 gap-2"
          >
            <FileSpreadsheet className="size-5" />
            Open Excel File
          </Button>
          <Button
            onClick={handleOpenFolder}
            variant="outline"
            size="lg"
            className="flex-1 gap-2"
          >
            <FolderOpen className="size-5" />
            Open Folder
          </Button>
        </div>

        {/* Skipped Items */}
        {summary.skippedItems.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="cursor-pointer" onClick={() => setShowSkipped(!showSkipped)}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-amber-900 flex items-center gap-2">
                    Skipped Items ({summary.skippedItems.length})
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    These items were not included in the export
                  </CardDescription>
                </div>
                {showSkipped ? (
                  <ChevronUp className="size-5 text-amber-700" />
                ) : (
                  <ChevronDown className="size-5 text-amber-700" />
                )}
              </div>
            </CardHeader>
            {showSkipped && (
              <CardContent className="space-y-3">
                {summary.skippedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="text-sm text-neutral-900 font-medium">{item.name}</div>
                      <div className="text-sm text-neutral-600">{item.reason}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        {/* Run Again */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onRunAgain}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="size-4" />
            Process More Applications
          </Button>
        </div>
      </div>
    </div>
  );
}
