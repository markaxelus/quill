import { ChevronLeft, HardDrive, Shield, Lock, FileCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface PrivacyProps {
  onBack: () => void;
}

export function Privacy({ onBack }: PrivacyProps) {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="size-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight text-neutral-900">Privacy & Local Processing</h1>
            <p className="text-neutral-600">How your data is handled</p>
          </div>
        </div>

        {/* Data Flow Diagram */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <div className="size-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="size-8 text-blue-600" />
                </div>
                <span className="text-sm text-neutral-900">Outlook Email</span>
              </div>

              <div className="flex-1 h-px bg-neutral-300 mx-4 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-neutral-300 border-y-4 border-y-transparent"></div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="size-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Shield className="size-8 text-emerald-600" />
                </div>
                <span className="text-sm text-neutral-900">Local App</span>
              </div>

              <div className="flex-1 h-px bg-neutral-300 mx-4 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-neutral-300 border-y-4 border-y-transparent"></div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="size-16 bg-violet-100 rounded-lg flex items-center justify-center">
                  <FileCheck className="size-8 text-violet-600" />
                </div>
                <span className="text-sm text-neutral-900">Excel File</span>
              </div>
            </div>

            <div className="text-center mt-6 text-sm text-neutral-600">
              All processing happens locally on your computer
            </div>
          </CardContent>
        </Card>

        {/* Privacy Principles */}
        <div className="space-y-4">
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <HardDrive className="size-5 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-neutral-900">Reads Local Outlook Data Only</CardTitle>
                  <CardDescription className="text-neutral-600">
                    The application accesses your Outlook mailbox stored on your computer. It only
                    reads emails matching your filter criteria and does not modify, delete, or send
                    any messages.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileCheck className="size-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-neutral-900">Processes Files in Memory</CardTitle>
                  <CardDescription className="text-neutral-600">
                    Word documents (.docx) are parsed in your computer's memory or temporary local
                    storage. No files are uploaded, transmitted, or stored externally.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Lock className="size-5 text-violet-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-neutral-900">Writes Excel Locally</CardTitle>
                  <CardDescription className="text-neutral-600">
                    The exported Excel file is written directly to a location you choose on your
                    computer. You maintain full control over where the data is saved.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Shield className="size-5 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-neutral-900">No Cloud, No Internet, No External Services</CardTitle>
                  <CardDescription className="text-neutral-600">
                    This application does not connect to the internet, use cloud services, or send
                    data to external servers. All operations are performed entirely offline on your
                    local machine.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Footer Note */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="text-center">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This application is designed for university administrative use.
              Ensure you have appropriate permissions to access and process application data in
              accordance with your institution's privacy policies and applicable regulations.
            </p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="size-4" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
