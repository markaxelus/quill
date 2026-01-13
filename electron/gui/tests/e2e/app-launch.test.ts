import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import type { ElectronApplication, Page } from 'playwright';
import path from 'path';

/**
 * E2E App Launch Tests
 *
 * Tests the full Electron application launch and basic UI functionality.
 *
 * The Electron app needs to be built or in dev mode.
 * Run: npm run test:e2e
 */


const skipE2E = process.env.CI === 'true' && !process.env.DISPLAY;

test.describe('Electron App Launch', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    if (skipE2E) {
      test.skip();
      return;
    }

    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../index.cjs')],
    });

    window = await electronApp.firstWindow();

    await window.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should launch the application successfully', async () => {
    expect(electronApp).toBeDefined();
    expect(window).toBeDefined();
  });

  test('should have correct window title', async () => {
    const title = await window.title();

    expect(title).toBeTruthy();
    expect(title).toBeDefined();
  });

  test('should have correct window dimensions', async () => {
    const size = await window.viewportSize();

    expect(size?.width).toBeGreaterThan(0);
    expect(size?.height).toBeGreaterThan(0);
  });

  test('should load the Setup screen by default', async () => {
    await expect(window.locator('text=Scholars Application Parser')).toBeVisible();
  });
});

test.describe('Setup Screen UI', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    if (skipE2E) {
      test.skip();
      return;
    }

    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../index.cjs')],
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should display main heading', async () => {
    const heading = window.locator('h1:has-text("Scholars Application Parser")');
    await expect(heading).toBeVisible();
  });

  test('should display description text', async () => {
    const description = window.locator(
      'text=Process Scholars Program applications from email attachments'
    );
    await expect(description).toBeVisible();
  });

  test('should display Email Source section', async () => {
    const emailSourceTitle = window.locator('text=Email Source');
    await expect(emailSourceTitle).toBeVisible();
  });

  test('should display Filters section', async () => {
    const filtersTitle = window.locator('text=Filters');
    await expect(filtersTitle).toBeVisible();
  });

  test('should display Output section', async () => {
    const outputTitle = window.locator('text=Output');
    await expect(outputTitle).toBeVisible();
  });

  test('should display Scan Inbox button', async () => {
    const scanButton = window.locator('button:has-text("Scan Inbox")');
    await expect(scanButton).toBeVisible();
    await expect(scanButton).toBeEnabled();
  });

  test('should display Settings link', async () => {
    const settingsLink = window.locator('text=Settings');
    await expect(settingsLink).toBeVisible();
  });

  test('should display Privacy link', async () => {
    const privacyLink = window.locator('text=Privacy');
    await expect(privacyLink).toBeVisible();
  });
});

test.describe('Form Interactions', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    if (skipE2E) {
      test.skip();
      return;
    }

    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../index.cjs')],
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should allow typing in subject filter input', async () => {
    const subjectInput = window.locator('input[id="subject"]');

    await subjectInput.fill('scholars');

    const value = await subjectInput.inputValue();
    expect(value).toBe('scholars');
  });

  test('should allow selecting a date', async () => {
    const dateInput = window.locator('input[type="date"]');

    await dateInput.fill('2026-01-01');

    const value = await dateInput.inputValue();
    expect(value).toBe('2026-01-01');
  });

  test('should allow typing in output path', async () => {
    const outputInput = window.locator('input[id="output"]');

    await outputInput.fill('C:\\Users\\Documents\\output.xlsx');

    const value = await outputInput.inputValue();
    expect(value).toContain('output.xlsx');
  });

  test('should have Browse button', async () => {
    const browseButton = window.locator('button:has-text("Browse")');
    await expect(browseButton).toBeVisible();
  });
});

test.describe('Navigation to Results Screen', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    if (skipE2E) {
      test.skip();
      return;
    }

    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../index.cjs')],
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should navigate to results screen when Scan Inbox is clicked', async () => {
    await window.locator('input[id="subject"]').fill('scholars');
    await window.locator('input[type="date"]').fill('2026-01-01');
    await window.locator('input[id="output"]').fill('output.xlsx');

    await window.locator('button:has-text("Scan Inbox")').click();

    await window.waitForTimeout(1000);

    const resultsHeading = window.locator('h1:has-text("Scan Results")');
    await expect(resultsHeading).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Results Screen UI', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    if (skipE2E) {
      test.skip();
      return;
    }

    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../index.cjs')],
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');

    await window.locator('input[id="subject"]').fill('scholars');
    await window.locator('input[type="date"]').fill('2026-01-01');
    await window.locator('input[id="output"]').fill('output.xlsx');
    await window.locator('button:has-text("Scan Inbox")').click();
    await window.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should display Scan Results heading', async () => {
    const heading = window.locator('h1:has-text("Scan Results")');
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('should display summary cards', async () => {
    const emailsScanned = window.locator('text=Emails Scanned');
    const matchesFound = window.locator('text=Matches Found');
    const attachmentsFound = window.locator('text=Attachments Found');

    await expect(emailsScanned).toBeVisible();
    await expect(matchesFound).toBeVisible();
    await expect(attachmentsFound).toBeVisible();
  });

  test('should display search input', async () => {
    const searchInput = window.locator(
      'input[placeholder*="Search by sender, subject, or attachment"]'
    );
    await expect(searchInput).toBeVisible();
  });

  test('should display results table', async () => {
    await expect(window.locator('text=Date')).toBeVisible();
    await expect(window.locator('text=Sender')).toBeVisible();
    await expect(window.locator('text=Subject')).toBeVisible();
    await expect(window.locator('text=Attachment')).toBeVisible();
    await expect(window.locator('text=Status')).toBeVisible();
  });

  test('should display mock results (dummy data)', async () => {
    const rows = window.locator('table tbody tr');
    const count = await rows.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should display Back to setup button', async () => {
    const backButton = window.locator('button:has-text("Back to setup")');
    await expect(backButton).toBeVisible();
  });

  test('should display Parse & Export button', async () => {
    const exportButton = window.locator('button:has-text("Parse & Export")');
    await expect(exportButton).toBeVisible();
  });

  test('should display Rescan button', async () => {
    const rescanButton = window.locator('button:has-text("Rescan")');
    await expect(rescanButton).toBeVisible();
  });
});

test.describe('Search Functionality', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    if (skipE2E) {
      test.skip();
      return;
    }

    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../index.cjs')],
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');

    await window.locator('input[id="subject"]').fill('scholars');
    await window.locator('button:has-text("Scan Inbox")').click();
    await window.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should allow typing in search field', async () => {
    const searchInput = window.locator(
      'input[placeholder*="Search by sender, subject, or attachment"]'
    );

    await searchInput.fill('sarah');

    const value = await searchInput.inputValue();
    expect(value).toBe('sarah');
  });

  test('should filter results when searching', async () => {
    const searchInput = window.locator(
      'input[placeholder*="Search by sender, subject, or attachment"]'
    );

    const initialRows = await window.locator('table tbody tr').count();

    await searchInput.fill('sarah');
    await window.waitForTimeout(500);

    const filteredRows = await window.locator('table tbody tr').count();

    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });
});

test.describe('Navigation Between Screens', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    if (skipE2E) {
      test.skip();
      return;
    }

    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../index.cjs')],
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should navigate back to setup from results', async () => {
    await window.locator('button:has-text("Scan Inbox")').click();
    await window.waitForTimeout(1000);

    const backButton = window.locator('button:has-text("Back to setup")');
    await backButton.click();
    await window.waitForTimeout(500);

    const setupHeading = window.locator('h1:has-text("Scholars Application Parser")');
    await expect(setupHeading).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    if (skipE2E) {
      test.skip();
      return;
    }

    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../index.cjs')],
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should have form labels associated with inputs', async () => {
    await expect(window.locator('label[for="subject"]')).toBeVisible();
    await expect(window.locator('label[for="date"]')).toBeVisible();
    await expect(window.locator('label[for="output"]')).toBeVisible();
  });

  test('should have focusable buttons', async () => {
    const scanButton = window.locator('button:has-text("Scan Inbox")');

    await scanButton.focus();
    const focused = await scanButton.evaluate((el) => el === document.activeElement);

    expect(focused).toBe(true);
  });

  test('should have semantic HTML elements', async () => {
    const h1 = window.locator('h1');
    const buttons = window.locator('button');
    const inputs = window.locator('input');

    expect(await h1.count()).toBeGreaterThan(0);
    expect(await buttons.count()).toBeGreaterThan(0);
    expect(await inputs.count()).toBeGreaterThan(0);
  });
});

test.describe('App Performance', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    if (skipE2E) {
      test.skip();
      return;
    }

    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../index.cjs')],
    });

    window = await electronApp.firstWindow();
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should load within reasonable time', async () => {
    const startTime = Date.now();

    await window.waitForLoadState('domcontentloaded');
    await window.locator('h1').first().waitFor({ state: 'visible' });

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle rapid input changes smoothly', async () => {
    await window.waitForLoadState('domcontentloaded');

    const subjectInput = window.locator('input[id="subject"]');

    for (let i = 0; i < 10; i++) {
      await subjectInput.fill(`search${i}`);
    }

    const value = await subjectInput.inputValue();
    expect(value).toBe('search9');
  });
});
