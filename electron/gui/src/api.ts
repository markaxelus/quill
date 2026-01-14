import type { EmailResult } from "./components/result";
import type { ProcessingSummary } from "./components/processing";
import type { ScanConfig } from "./components/setup";

// Define the interface for the exposed electron API
interface ElectronAPI {
  scanInbox: (config: ScanConfig) => Promise<any[]>;
  processJobs: (items: any[], options: any) => Promise<{ type: string; summary: ProcessingSummary }>;
  onProcessingUpdate: (callback: (progress: any) => void) => () => void;
  openFile: (path: string) => Promise<void>;
  openFolder: (path: string) => Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export const api = {
  scanInbox: async (config: ScanConfig): Promise<EmailResult[]> => {
    return window.electron.scanInbox(config);
  },
  
  processApplications: async (
    items: EmailResult[], 
    parsingOptions: { skipIncomplete: boolean; exportBehavior: string },
    onProgress: (progress: any) => void
  ): Promise<ProcessingSummary> => {
    
    // Set up listener
    const unsubscribe = window.electron.onProcessingUpdate(onProgress);
    
    try {
      const result = await window.electron.processJobs(items, parsingOptions);
      // Result is the 'complete' message payload which contains the summary
      return result.summary; 
    } finally {
      unsubscribe();
    }
  },

  openFile: (path: string) => window.electron.openFile(path),
  openFolder: (path: string) => window.electron.openFolder(path),
};
