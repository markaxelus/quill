import { useState } from 'react';
import { Search, ChevronLeft, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export interface EmailResult {
  id: string;
  date: string;
  sender: string;
  subject: string;
  attachment: string;
  status: 'ready' | 'warning' | 'error';
}

interface ScanResultsProps {
  results: EmailResult[];
  /* onParse: (selected: EmailResult[]) => void;
  onBack: () => void;
  onRescan: () => void; */
}

const index = ({ results }: ScanResultsProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className='text-3xl tracking-tight text-neutral-900'>Scan Results</h1>
            <p className="">Review and select email to process</p>
          </div>
          <Button
            variant="default"
            /* onClick={} */
            className='gap-2'
          >
            Rescan
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-neutral-200 shadow-sm py-4 gap-2">
            <CardHeader className="pb-2">
              <CardDescription>Emails Scanned</CardDescription>
              <CardTitle className="text-3xl text-neutral-900">
                123
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-neutral-200 shadow-sm py-4 gap-2">
            <CardHeader className="pb-2">
              <CardDescription>Matches Found</CardDescription>
              <CardTitle className="text-3xl text-neutral-900">
                12
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-neutral-200 shadow-sm py-4 gap-2">
            <CardHeader className="pb-2">
              <CardDescription>Attachments Found</CardDescription>
              <CardTitle className="text-3xl text-neutral-900">
                12
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search & Controls */}
        <Card className="border-neutral-200 shadow-sm py-4 gap-2">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  placeholder="Search by sender, subject, or attachment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white shadow-none "
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Select All
                </Button>
                <span className="text-sm text-neutral-600">
                  11 of 12 selected
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="border-neutral-200 shadow-sm py-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-200">
                <TableHead className="w-12"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {results.map((result) => (
                <TableRow className="border-neutral-200">
                  <TableCell className="">
                    <Checkbox 
                      className=' border-neutral-200 bg-neutral-100'
                    />
                  </TableCell>
                  <TableCell className="text-neutral-600 text-sm">
                    {new Date(result.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day:'numeric'
                    })}
                  </TableCell>
                  <TableCell className="">{result.sender}</TableCell>
                  <TableCell className="">{result.subject}</TableCell>
                  <TableCell className="text-neutral-900 flex items-center gap-2">
                    <FileText className='size-4 text-neutral-400' />
                    {result.attachment}
                  </TableCell>
                  <TableCell className="text-right">
                    {result.status === 'ready' && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-sm">
                        <CheckCircle2 className='size-4'/>
                        Ready
                      </span>
                    )}
                    {result.status === 'warning' && (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
                        <AlertCircle className='size-4' />
                        Warning
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <Button className="gap-2" variant="outline">
            <ChevronLeft className='size-4' />
            Back to setup
          </Button>
            
          <Button
            size="lg"        
            className="px-8 bg-neutral-900 hover:bg-neutral-800"
          >
            Parse & Export
          </Button>
        </div>
      </div>
    </div>
  )
}

export default index
