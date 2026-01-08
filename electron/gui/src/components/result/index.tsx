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

const index = () => {
  return (
    <div>
      

    </div>
  )
}

export default index