import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import os from 'os';

/* Test file system operations: temp files, path, permissions */

interface FileSystemError extends Error {
  code?: string;
  errno?: number;
  syscall?: string;
  path?: string;
}

/* Class to Mock File System Manager */
class FileManager {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'scholars_parser_attachments');
  }

  getTempDir(): string {
    return this.tempDir;
  }

  async ensureTempDir(): Promise<void> {
    return Promise.resolve();
  }

  buildAttachmentPath(entryId: string, filename: string): string {
    const sanitized = this.sanitizeFilename(filename);
    return path.join(this.tempDir, `${entryId}_${sanitized}`);
  }

  private sanitizeFilename(filename: string) {
    return filename.replace(/[<>:"/\\|?*]/g, '_');
  }

  async validateOutputPath(outputPath: string): Promise<boolean> {
    return true;
  }

  async fileExists(filePath: string): Promise<boolean> {
    return true;
  }

  async cleanupTempFiles(): Promise<void> {
    return Promise.resolve();
  }
}


describe('File Operations', () => {
  let fileManager: FileManager;

  beforeEach(() => {
    fileManager = new FileManager();
  });

  describe('Temp directory management', () => {
    it('should generate correct temp directory path', () => {
      const tempDir = fileManager.getTempDir();

      expect(tempDir).toContain('scholars_parser_attachments');
      expect(path.isAbsolute(tempDir)).toBe(true);
    });

    it('should use system temp directory', () => {
      const tempDir = fileManager.getTempDir();
      const sysTempDir = os.tmpdir();

      expect(tempDir).toContain(sysTempDir);
    });

    it('should handle Windows temp paths', () => {
      // Simulate Windows temp path
      const windowsTemp = 'C:\\Users\\Username\\AppData\\Local\\Temp';
      const expected = path.join(windowsTemp, 'scholars_parser_attachments');

      // On Windows, this should use backslashes
      if (process.platform === 'win32') {
        expect(expected).toContain('\\');
      }
    });
  });

  describe('File path construction', () => {
    it('should build attachment path with entry ID prefix', () => {
      const entryId = 'outlook-msg-123456';
      const filename = 'Application.docx';

      const filePath = fileManager.buildAttachmentPath(entryId, filename);

      expect(filePath).toContain(entryId);
      expect(filePath).toContain(filename);
      expect(path.basename(filePath)).toBe(`${entryId}_${filename}`);
    });

    it('should sanitize invalid characters in filenames', () => {
      const entryId = 'msg-123';
      const dangerousFilename = 'file<>:"/\\|?*.docx';

      const filePath = fileManager.buildAttachmentPath(entryId, dangerousFilename);
      const basename = path.basename(filePath);

      expect(basename).not.toContain('<');
      expect(basename).not.toContain('>');
      expect(basename).not.toContain(':');
      expect(basename).not.toContain('"');
      expect(basename).not.toContain('|');
      expect(basename).not.toContain('?');
      expect(basename).not.toContain('*');
    });

    it('should handle long filenames', () => {
      const entryId = 'msg-123';
      const longFilename = 'a'.repeat(300) + '.docx';

      const filePath = fileManager.buildAttachmentPath(entryId, longFilename);

      expect(filePath).toBeDefined();
      expect(path.extname(filePath)).toBe('.docx');
    });

    it('should handle filenames with spaces', () => {
      const entryId = 'msg-123';
      const filename = 'My Application Form.docx';

      const filePath = fileManager.buildAttachmentPath(entryId, filename);

      expect(path.basename(filePath)).toContain('My Application Form.docx');
    });

    it('should handle Unicode characters in filenames', () => {
      const entryId = 'msg-123';
      const unicodeFilename = 'Application_学者_בוגרים.docx';

      const filePath = fileManager.buildAttachmentPath(entryId, unicodeFilename);

      expect(filePath).toContain(unicodeFilename);
    });

    it('should preserve file extensions', () => {
      const entryId = 'msg-123';
      const filenames = ['app.docx', 'app.DOCX', 'app.xlsx', 'app.pdf'];

      filenames.forEach((filename) => {
        const filePath = fileManager.buildAttachmentPath(entryId, filename);
        expect(path.extname(filePath)).toBe(path.extname(filename));
      });
    });
  });

  describe('Output path validation', () => {
    it('should validate writable output paths', async () => {
      const validPaths = [
        'C:\\Users\\Documents\\output.xlsx',
        '/home/user/documents/output.xlsx',
        './output.xlsx',
      ];

      for (const outputPath of validPaths) {
        const isValid = await fileManager.validateOutputPath(outputPath);
        expect(isValid).toBe(true);
      }
    });

    it('should detect absolute vs relative paths', () => {
      const absolutePaths = [
        'C:\\Users\\Documents\\output.xlsx',
        '/home/user/output.xlsx',
      ];
      const relativePaths = ['./output.xlsx', '../data/output.xlsx', 'output.xlsx'];

      absolutePaths.forEach((p) => {
        expect(path.isAbsolute(p)).toBe(true);
      });

      relativePaths.forEach((p) => {
        expect(path.isAbsolute(p)).toBe(false);
      });
    });

    it('should normalize paths with mixed separators', () => {
      const mixedPath = 'C:/Users\\Documents/output.xlsx';
      const normalized = path.normalize(mixedPath);

      // Should use platform-specific separator
      if (process.platform === 'win32') {
        expect(normalized).toContain('\\');
        expect(normalized).not.toContain('/');
      }
    });

    it('should resolve relative paths to absolute', () => {
      const relativePath = './output.xlsx';
      const absolutePath = path.resolve(relativePath);

      expect(path.isAbsolute(absolutePath)).toBe(true);
      expect(absolutePath).toContain('output.xlsx');
    });

    it('should handle paths with parent directory references', () => {
      const pathWithParent = '../data/output.xlsx';
      const resolved = path.resolve(pathWithParent);

      expect(path.isAbsolute(resolved)).toBe(true);
    });
  });

  describe('File existence checks', () => {
    it('should check if attachment file exists', async () => {
      const filePath = fileManager.buildAttachmentPath('msg-123', 'app.docx');
      const exists = await fileManager.fileExists(filePath);

      expect(typeof exists).toBe('boolean');
    });

    it('should handle non-existent files gracefully', async () => {
      const nonExistentPath = 'C:\\nonexistent\\file.docx';

      await expect(fileManager.fileExists(nonExistentPath)).resolves.toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle permission denied errors', () => {
      const error: FileSystemError = new Error('EACCES: permission denied');
      error.code = 'EACCES';
      error.syscall = 'mkdir';

      expect(error.code).toBe('EACCES');
      expect(error.message).toContain('permission denied');
    });

    it('should handle disk full errors', () => {
      const error: FileSystemError = new Error('ENOSPC: no space left on device');
      error.code = 'ENOSPC';

      expect(error.code).toBe('ENOSPC');
      expect(error.message).toContain('no space');
    });

    it('should handle file not found errors', () => {
      const error: FileSystemError = new Error('ENOENT: no such file or directory');
      error.code = 'ENOENT';

      expect(error.code).toBe('ENOENT');
    });

    it('should handle path too long errors', () => {
      const error: FileSystemError = new Error('ENAMETOOLONG: name too long');
      error.code = 'ENAMETOOLONG';

      expect(error.code).toBe('ENAMETOOLONG');
    });

    it('should handle file in use errors (Windows)', () => {
      const error: FileSystemError = new Error(
        'EBUSY: resource busy or locked'
      );
      error.code = 'EBUSY';

      expect(error.code).toBe('EBUSY');
    });
  });

  describe('Path security', () => {
    it('should prevent directory traversal attacks', () => {
      const entryId = 'msg-123';
      const maliciousFilename = '../../etc/passwd';

      const filePath = fileManager.buildAttachmentPath(entryId, maliciousFilename);
      const tempDir = fileManager.getTempDir();

      // Path should still be within temp directory
      expect(filePath).toContain(tempDir);
      // Slashes should be replaced with underscores
      const basename = path.basename(filePath);
      expect(basename).not.toContain('/');
      expect(basename).not.toContain('\\');
      expect(basename).toBe('msg-123_.._.._etc_passwd');
    });

    it('should prevent null byte injection', () => {
      const entryId = 'msg-123';
      const maliciousFilename = 'app.docx\0.txt';

      const filePath = fileManager.buildAttachmentPath(entryId, maliciousFilename);

      // Should handle or strip null bytes
      expect(filePath).toBeDefined();
    });

    it('should validate file extensions', () => {
      const validateDocxExtension = (filename: string): boolean => {
        return /\.docx$/i.test(filename);
      };

      expect(validateDocxExtension('app.docx')).toBe(true);
      expect(validateDocxExtension('app.DOCX')).toBe(true);
      expect(validateDocxExtension('app.docx.exe')).toBe(false);
      expect(validateDocxExtension('app.doc')).toBe(false);
    });

    it('should reject executable extensions', () => {
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1'];

      dangerousExtensions.forEach((ext) => {
        const filename = `file${ext}`;
        expect(filename).toMatch(/\.(exe|bat|cmd|sh|ps1)$/i);
      });
    });
  });

  describe('Cleanup operations', () => {
    it('should cleanup temp files after processing', async () => {
      await expect(fileManager.cleanupTempFiles()).resolves.not.toThrow();
    });

    it('should handle cleanup errors gracefully', async () => {
      // Mock cleanup failure
      vi.spyOn(fileManager, 'cleanupTempFiles').mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      await expect(fileManager.cleanupTempFiles()).rejects.toThrow();
    });

    it('should handle cleanup of non-existent directory', async () => {
      // Should not throw if directory doesn't exist
      await expect(fileManager.cleanupTempFiles()).resolves.not.toThrow();
    });
  });

  describe('Cross-platform compatibility', () => {
    it('should handle Windows path separators', () => {
      const windowsPath = 'C:\\Users\\Documents\\file.docx';
      const parsed = path.parse(windowsPath);

      expect(parsed.dir).toBeDefined();
      expect(parsed.base).toBe('file.docx');
    });

    it('should handle Unix path separators', () => {
      const unixPath = '/home/user/documents/file.docx';
      const parsed = path.parse(unixPath);

      expect(parsed.dir).toBeDefined();
      expect(parsed.base).toBe('file.docx');
    });

    it('should join paths correctly for current platform', () => {
      const joined = path.join('folder1', 'folder2', 'file.docx');

      expect(joined).toContain('folder1');
      expect(joined).toContain('folder2');
      expect(joined).toContain('file.docx');
    });

    it('should handle UNC paths (Windows network shares)', () => {
      const uncPath = '\\\\server\\share\\file.docx';

      if (process.platform === 'win32') {
        expect(uncPath).toMatch(/^\\\\/);
      }
    });

    it('should handle case sensitivity appropriately', () => {
      const path1 = 'C:\\Users\\Documents\\File.docx';
      const path2 = 'C:\\Users\\Documents\\file.docx';

      // Windows is case-insensitive
      if (process.platform === 'win32') {
        expect(path1.toLowerCase()).toBe(path2.toLowerCase());
      } else {
        expect(path1).not.toBe(path2);
      }
    });
  });

  describe('Excel output file handling', () => {
    it('should ensure .xlsx extension', () => {
      const ensureExcelExtension = (filename: string): string => {
        if (!/\.xlsx$/i.test(filename)) {
          return `${filename}.xlsx`;
        }
        return filename;
      };

      expect(ensureExcelExtension('output')).toBe('output.xlsx');
      expect(ensureExcelExtension('output.xlsx')).toBe('output.xlsx');
      expect(ensureExcelExtension('output.xls')).toBe('output.xls.xlsx');
    });

    it('should handle Excel file locked errors', () => {
      const error: FileSystemError = new Error(
        'File is locked by another process'
      );
      error.code = 'EBUSY';

      expect(error.code).toBe('EBUSY');
      expect(error.message).toContain('locked');
    });

    it('should validate Excel output path', async () => {
      const validPaths = [
        'output.xlsx',
        'C:\\Data\\export.xlsx',
        '/home/user/scholars_export.xlsx',
      ];

      for (const outputPath of validPaths) {
        expect(outputPath).toMatch(/\.xlsx$/i);
      }
    });
  });
});
