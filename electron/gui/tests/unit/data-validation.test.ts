import { describe, it, expect } from 'vitest';
import type { ScanConfig } from '../../src/components/setup';
import type { EmailResult } from '../../src/components/result';

/* Tests for data structure validation in ScanConfig and EmailResult */

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

    
  })
})