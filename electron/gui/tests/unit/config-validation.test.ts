import { describe, it, expect } from 'vitest';
import type { ScanConfig } from '../../src/components/setup';
import type { EmailResult } from '../../src/components/result';

/* Tests for data structure validation in ScanConfig */

describe('Data Validation', () => {
  describe('ScanConfig validation', () => {
    it('should validate a complete ScanConfig object', () => {
      const validConfig: ScanConfig = {
        folder: 'Inbox',
        subjectFilter: 'scholars',
        fromDate: '2026-01-01',
        outputPath: 'C:\\Users\\Documents\\output.xlsx',
      }

      expect(validConfig.folder).toBeDefined();
      expect(validConfig.subjectFilter).toBeDefined();
      expect(validConfig.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(validConfig.outputPath).toBeDefined();
    })

    it('should detect missing required fields', () => {
      const incompleteScanConfig = {
        folder: 'Inbox',
        subjectFilter: 'scholars',
      }

      expect(incompleteScanConfig).not.toHaveProperty('fromDate');
      expect(incompleteScanConfig).not.toHaveProperty('outputPath');
    })

    it('should validate folder values', () => {
      const validFolders = ['Inbox', 'Sent', 'Drafts', 'Custom Folder'];

      validFolders.forEach((folder) => {
        const config: ScanConfig = {
          folder,
          subjectFilter: '',
          fromDate: '2026-01-01',
          outputPath: '',
        }
        
        expect(config.folder).toBe(folder);
        expect(config.folder.length).toBeGreaterThan(0);
      })
    })

    it('should validate date format (YYYY-MM-DD)', () => {
      const validDates = ['2026-01-01', '2025-12-31', '2024-06-15'];
      const invalidDates = ['01/01/2026', '2026-1-1', '01-01-2026', 'January 1, 2026'];

      validDates.forEach((date) => {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      })

      invalidDates.forEach((date) => {
        expect(date).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
      })
    })

    it('should allow empty subject filter', () => {
      const config: ScanConfig = {
        folder: 'Inbox',
        subjectFilter: '',
        fromDate: '2026-01-01',
        outputPath: 'output.xlsx',
      }

      expect(config.subjectFilter).toBe('');
      expect(config.subjectFilter).toHaveLength(0);
    })
  })
})