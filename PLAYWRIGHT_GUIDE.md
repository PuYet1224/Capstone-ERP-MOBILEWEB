# Automation Testing Guide (Playwright E2E) - Hoai Minh ERP

This document summarizes the steps to set up and operate the automation test system for the MobileHM project.

## 1. Environment Setup

Run the following commands at the project root directory (`C:\MobileHM`):

```powershell
# Install Playwright (if not already installed)
npm init playwright@latest

# Install custom Excel export library
npm install exceljs
```

## 2. System Configuration (`playwright.config.ts`)

The configuration file has been optimized for Mobile Web:
- **Reporter:** Export to HTML (`e2e/report`) and JSON (`results.json`).
- **Devices:** Supports Desktop Chrome, Pixel 5 (Mobile Chrome), and iPhone 12 (Mobile Safari).
- **Video/Screenshot:** Always record video and take screenshots on failure.

## 3. Test Workflow

Always follow these 2 steps to get the latest results:

### Step 1: Run Test Scenarios
This command executes the robot and creates the result data file (`results.json`).
```powershell
npx playwright test
```

### Step 2: Export Premium Excel Report
This command reads data from Step 1 and generates an Excel file according to the company's standard template (Navy Blue color, with all columns: ID, Description, Steps...).
```powershell
npm run export:excel
```
*Result Excel file is located at: `e2e/report/HoaiMinh_TestReport.xlsx`*

---

## 4. Standard Test Scenario Writing (Annotations & Steps)

To ensure the Excel report displays full information as per the company template, use `testInfo.annotations` to declare metadata and `test.step` for the execution steps.

### Standard Scenario Example:
```typescript
test('TC001: Test Name', async ({}, testInfo) => {
  // 1. Declare Metadata (Displayed in Description and Pre-condition columns)
  testInfo.annotations.push({ type: 'Description', description: 'Detailed description of the test goal' });
  testInfo.annotations.push({ type: 'Pre-condition', description: 'Necessary conditions before running' });

  // 2. Write Execution Steps (Displayed in Test Steps column)
  await test.step('Step 1: Login', async () => {
    // Logic code...
  });

  await test.step('Step 2: Perform Action', async () => {
    // Logic code...
  });
});
```

*Note: If you want to override the automatically generated list of steps from `test.step`, you can add an annotation `{ type: 'Test Steps', description: 'Step 1...\nStep 2...' }`.*

---

## 5. Other Useful Commands

| Command | Effect |
|---|---|
| `npx playwright test --ui` | Open visual interface for Debugging (Close before running CLI) |
| `npx playwright show-report e2e/report` | View HTML report (includes video/screenshot) |
| `npx playwright show-trace path/to/trace.zip` | Review detailed millisecond actions of the robot |
npm run e2e:excel
---
**Important Note:** If you encounter `ERR_MODULE_NOT_FOUND` when running tests, ensure that the **Playwright UI Mode** window is completely closed before running CLI commands.
