import { test, expect } from '@playwright/test';

test.use({
  channel: 'chrome',
  headless: false,
});

const BASE_URL = 'https://visible-rosybrown-magpie-73.hostingersite.com';

// Timing constants (in milliseconds)
const STEP_DELAY_MS = 700;      // Standard UI step pacing
const DROPDOWN_DELAY_MS = 2000; // Extra wait for async dropdowns/suggestions to load
const SAVE_DELAY_MS = 1800;     // Wait after form/modal saves

async function pace(page, ms = STEP_DELAY_MS) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

function getDateOffset(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

const millProcessData = {
  email: 'super@vidhyafashion.com',
  password: 'Qwerty@123',
  program: {
    colorName: 'Emerald Green 6101',
    description: 'R to R',
  },
  receipt: {
    docNo: '212',
    nextStage: 'Job Work',
    spin5Val: '5',
    spin1Val: '300',
    spin2Val: '280',
    chargeOption: '1',
    chargeQty: '2',
  },
  jobWork: {
    processName: 'Printing',
  },
};

test('Mill Process Program, Receipt, Complete & Create Job Work in Chrome', async ({ page }) => {
  test.setTimeout(240000);

  const tomorrowDate = getDateOffset(1);
  const dueDateProgram = getDateOffset(2);
  const dueDateJobWork = getDateOffset(3);

  // 1. Navigate & Login
  await page.goto(`${BASE_URL}/`);
  await pace(page, STEP_DELAY_MS);
  await page.goto(`${BASE_URL}/login`);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('textbox', { name: 'Email' }).fill(millProcessData.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(millProcessData.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await pace(page, SAVE_DELAY_MS);

  // 2. Open Sidebar & Navigate to Mill Process
  await page.getByRole('button').first().click();
  await pace(page, STEP_DELAY_MS);
  await page.getByRole('link', { name: 'Mill Process', exact: true }).click();
  await pace(page, SAVE_DELAY_MS);

  // Click the latest Mill Process row in the table
  const firstProcessRow = page.locator('table tbody tr').first();
  await expect(firstProcessRow).toBeVisible({ timeout: 15000 });
  await firstProcessRow.click();
  await pace(page, SAVE_DELAY_MS);

  // 3. Add Program
  await page.getByRole('button', { name: 'Add Program' }).click();
  await pace(page, SAVE_DELAY_MS);

  const programDueDate = page.locator('.grid.gap-4.md\\:grid-cols-2 > div:nth-child(2) > .mt-1 > .w-full');
  await programDueDate.fill(dueDateProgram);
  await pace(page, STEP_DELAY_MS);

  await page.getByText('Select color').nth(1).click();
  await pace(page, DROPDOWN_DELAY_MS);
  await page
    .locator('div')
    .filter({ hasText: new RegExp(`^${millProcessData.program.colorName}$`) })
    .last()
    .click();
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('textbox', { name: 'Enter program description...' }).fill(millProcessData.program.description);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('button', { name: 'Save Program' }).click();
  await pace(page, SAVE_DELAY_MS);

  // 4. Add Receipt
  await page.getByRole('button', { name: 'Add Receipt' }).click();
  await pace(page, SAVE_DELAY_MS);

  await page.getByRole('textbox').nth(5).fill(tomorrowDate);
  await pace(page, STEP_DELAY_MS);

  const docNoInput = page.locator(
    '.h-9.w-full.rounded-lg.border-\\[1px\\].border-gray-300.dark\\:border-input.bg-background.px-3.text-sm.text-foreground.placeholder\\:text-muted-foreground.focus\\:outline-none.focus\\:ring-1.focus\\:ring-ring.focus\\:border-primary.transition-colors.uppercase'
  );
  await docNoInput.fill(millProcessData.receipt.docNo);
  await pace(page, STEP_DELAY_MS);

  // Select Next Process / Destination dropdown (using .last() to hit the clickable trigger)
  const nextStageDropdown = page.locator('div').filter({ hasText: /^Select\.\.\.$/ }).last();
  await nextStageDropdown.scrollIntoViewIfNeeded();
  await nextStageDropdown.click();
  await pace(page, DROPDOWN_DELAY_MS);

  await page
    .locator('div')
    .filter({ hasText: new RegExp(`^${millProcessData.receipt.nextStage}$`) })
    .last()
    .click();
  await pace(page, STEP_DELAY_MS);

  // Fill quantities
  await page.getByRole('spinbutton', { name: '5' }).fill(millProcessData.receipt.spin5Val);
  await pace(page, STEP_DELAY_MS);

  const spin1 = page.getByRole('spinbutton').nth(1);
  await spin1.fill(millProcessData.receipt.spin1Val);
  await spin1.press('Tab');
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('spinbutton').nth(2).fill(millProcessData.receipt.spin2Val);
  await pace(page, STEP_DELAY_MS);

  // Add Charge
  await page.getByRole('button', { name: 'Add charge' }).click();
  await pace(page, DROPDOWN_DELAY_MS);

  await page
    .locator('.h-9.w-full.rounded-lg.border.border-border\\/80')
    .first()
    .selectOption(millProcessData.receipt.chargeOption);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('spinbutton', { name: 'e.g.' }).fill(millProcessData.receipt.chargeQty);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('button', { name: 'Save Receipt' }).click();
  await pace(page, SAVE_DELAY_MS);

  // 5. Complete Process & Create Job Work From Receipt
  await page.getByRole('button', { name: 'Complete Process' }).click();
  await pace(page, SAVE_DELAY_MS);

  await page.getByRole('button', { name: 'Create Job Work From Receipt' }).click();
  await pace(page, SAVE_DELAY_MS);

  // Select Job Work Vendor from async combobox
  const vendorCellInput = page.getByRole('cell', { name: 'Add Vendor' }).getByRole('combobox');
  await vendorCellInput.scrollIntoViewIfNeeded();
  await vendorCellInput.click();
  await pace(page, DROPDOWN_DELAY_MS);

  const suggestionsList = page.getByRole('listbox', { name: 'Suggestions' });
  await expect(suggestionsList).toBeVisible({ timeout: 15000 });
  await suggestionsList.click();
  await pace(page, STEP_DELAY_MS);

  // Select Process (Printing)
  const selectProcessTrigger = page.locator('div').filter({ hasText: /^Select process\.\.\.$/ }).last();
  await selectProcessTrigger.scrollIntoViewIfNeeded();
  await selectProcessTrigger.click();
  await pace(page, DROPDOWN_DELAY_MS);

  await page
    .locator('div')
    .filter({ hasText: new RegExp(`^${millProcessData.jobWork.processName}$`) })
    .last()
    .click();
  await pace(page, STEP_DELAY_MS);

  // Set Job Work Due Date
  const jobWorkDueDate = page.locator('.min-w-\\[1320px\\] > tbody > .border-t > td:nth-child(11) > .h-9');
  await jobWorkDueDate.scrollIntoViewIfNeeded();
  await jobWorkDueDate.fill(dueDateJobWork);
  await pace(page, STEP_DELAY_MS);

  // Submit Create Job Work & Close Modal
  await page.getByRole('button', { name: 'Create Job Work' }).nth(2).click();
  await pace(page, SAVE_DELAY_MS);

  await page
    .locator('.fixed.inset-0.z-50.flex > .relative > .flex.items-start.justify-between.gap-4 > .flex.h-8')
    .click();
  await pace(page, STEP_DELAY_MS);
});