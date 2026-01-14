import { useEffect, useState, useRef } from 'react';
import { FileText, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

interface ProcessingProps {
  items: Array<{ id: string; attachment: string; sender: string }>;
  onComplete: (summary: ProcessingSummary) => void;
  onCancel: () => void;
  startProcessing: (onProgress: (progress: any) => void) => Promise<ProcessingSummary>;
}

export interface ProcessingSummary {
  totalProcessed: number;
  successful: number;
  skipped: number;
  errors: number;
  outputPath: string;
  skippedItems: Array<{ name: string; reason: string }>;
}

interface LogEntry {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

export function Processing({ items, onComplete, onCancel, startProcessing }: ProcessingProps) {
  const totalItems = items.length;
  const [currentItem, setCurrentItem] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs((prev) => [...prev, { type, message, timestamp: new Date() }]);
  };

  useEffect(() => {
    let active = true;

    addLog('info', 'Starting local processing...');
    addLog('info', `Processing ${totalItems} applications`);

    startProcessing((progress) => {
      if (!active) return;
      
      const { current, item } = progress;
      // Update state
      setCurrentItem(current);
      if (item) {
        setCurrentFile(item.attachment || '');
        setCurrentEmail(item.sender || '');
        addLog('info', `Processing ${item.attachment}...`);
      }
    })
    .then((summary) => {
      if (!active) return;
      addLog('success', 'Processing complete!');
      // Short delay to show 100%
      setTimeout(() => onComplete(summary), 1000);
    })
    .catch((error) => {
      if (!active) return;
      addLog('error', `Processing failed: ${error}`);
    });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    // Auto-scroll logs
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const progress = (currentItem / totalItems) * 100;

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight text-neutral-900">Processing Applications</h1>
          <p className="text-neutral-600">Extracting data from attachments and exporting to Excel</p>
        </div>

        {/* Progress */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl text-neutral-900">
                {currentItem} of {totalItems}
              </span>
              <span className="text-neutral-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Current Item */}
        <Card className="border-neutral-200 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-neutral-100 rounded-lg">
                <FileText className="size-6 text-neutral-600" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-sm text-neutral-500">Currently processing</div>
                <div className="text-lg text-neutral-900">{currentFile}</div>
                <div className="text-sm text-neutral-600">From: {currentEmail}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-neutral-900">Activity Log</h3>
              <span className="text-sm text-neutral-500">{logs.length} events</span>
            </div>

            <ScrollArea className="h-64 rounded-md border border-neutral-200 bg-neutral-50">
              <div ref={scrollRef} className="p-4 space-y-2">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-neutral-400 font-mono text-xs mt-0.5">
                      {log.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <span
                      className={`flex-1 ${
                        log.type === 'success'
                          ? 'text-emerald-700'
                          : log.type === 'warning'
                            ? 'text-amber-600'
                            : log.type === 'error'
                              ? 'text-red-600'
                              : 'text-neutral-600'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Local Processing Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 py-4">
          <Shield className="size-4" />
          <span>Running locally — no data leaves this computer</span>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={onCancel} disabled={currentItem === totalItems}>
            Cancel Processing
          </Button>
        </div>
      </div>
    </div>
  );
}
