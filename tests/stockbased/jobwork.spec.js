import { test, expect } from '@playwright/test';

test.use({
  channel: 'chrome',
  headless: false,
});

const BASE_URL = 'https://visible-rosybrown-magpie-73.hostingersite.com';

// Timing constants (in milliseconds)
const STEP_DELAY_MS = 700;      // Standard UI step pacing
const DROPDOWN_DELAY_MS = 2200; // Extra wait for async dropdowns/suggestions to load
const SAVE_DELAY_MS = 1800;     // Wait after form/modal saves or state transitions

async function pace(page, ms = STEP_DELAY_MS) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

async function selectSuggestion(page, triggerLocator) {
  await triggerLocator.scrollIntoViewIfNeeded();
  await triggerLocator.click();
  await pace(page, DROPDOWN_DELAY_MS);

  const listbox = page.getByRole('listbox', { name: 'Suggestions' });
  await expect(listbox).toBeVisible({ timeout: 15000 });
  await listbox.click();
  await pace(page, STEP_DELAY_MS);
}

function getDateOffset(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

const jobWorkData = {
  email: 'super@vidhyafashion.com',
  password: 'Qwerty@123',
  receipt: {
    challanNo: '504',
    billNo: '504',
    lrNo: '504',
    receivedPcs: '5',
    usedGrey: '280',
    finishedGrey: '280',
    dispositionOption: 'Move to Stitching',
    chargeOption: '2',
    chargeValue: '2',
  },
};

test('Job Work Card, Issue, Acknowledge, Receipt & Stitching Flow in Chrome', async ({ page }) => {
  test.setTimeout(240000);

  const receiptDate = getDateOffset(1);

  // 1. Navigate & Login
  await page.goto(`${BASE_URL}/`);
  await pace(page, STEP_DELAY_MS);
  await page.goto(`${BASE_URL}/login`);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('textbox', { name: 'Email' }).fill(jobWorkData.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(jobWorkData.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await pace(page, SAVE_DELAY_MS);

  // 2. Navigate to Job Work & Open First Record
  await page.getByRole('button').first().click();
  await pace(page, STEP_DELAY_MS);
  await page.getByRole('link', { name: 'Job Work', exact: true }).click();
  await pace(page, SAVE_DELAY_MS);

  await page.getByRole('button', { name: 'View' }).first().click();
  await pace(page, SAVE_DELAY_MS);

  // 3. Edit Job Card
  await page.getByRole('button', { name: 'Edit Job Card' }).click();
  await pace(page, SAVE_DELAY_MS);

  const brokerSearch = page.getByRole('combobox').filter({ hasText: 'Search brokers by name...' });
  await selectSuggestion(page, brokerSearch);

  await page.locator('form').filter({ hasText: 'Vendor*NIPAT TRENDS (JOB_WORK' }).click();
  await pace(page, STEP_DELAY_MS);

  const suggestionsList = page.getByRole('listbox', { name: 'Suggestions' });
  if (await suggestionsList.isVisible().catch(() => false)) {
    await suggestionsList.click();
    await pace(page, STEP_DELAY_MS);
  }

  const requiredBtn = page.getByRole('button', { name: 'Required *' }).first();
  if (await requiredBtn.isVisible().catch(() => false)) {
    await requiredBtn.scrollIntoViewIfNeeded();
    await requiredBtn.click();
    await pace(page, STEP_DELAY_MS);
  }

  // Close Edit Job Card modal
  await page
    .locator('div:nth-child(17) > .relative.z-10 > .flex.items-start.justify-between.gap-4 > .flex')
    .click();
  await pace(page, SAVE_DELAY_MS);

  // 4. Issue Job Work & Mark Acknowledged
  await page.getByRole('button', { name: 'Issue Job Work' }).click();
  await pace(page, SAVE_DELAY_MS);

  await page.getByRole('button', { name: 'Mark Acknowledged' }).click();
  await pace(page, SAVE_DELAY_MS);

  // 5. Open Receipt Form & Fill Receipt Details
  await page.getByRole('button', { name: 'Show Form' }).click();
  await pace(page, SAVE_DELAY_MS);

  await page.locator('#vendor-job-work-add-receipt-form input[type="date"]').fill(receiptDate);
  await pace(page, STEP_DELAY_MS);

  await selectSuggestion(page, page.getByRole('combobox').filter({ hasText: 'Search warehouses...' }));

  await page.getByRole('textbox', { name: 'Party Challan number' }).fill(jobWorkData.receipt.challanNo);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('textbox', { name: 'Bill number' }).fill(jobWorkData.receipt.billNo);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('textbox', { name: 'LR number' }).fill(jobWorkData.receipt.lrNo);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('spinbutton', { name: 'Received pcs' }).fill(jobWorkData.receipt.receivedPcs);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('spinbutton', { name: 'Used grey' }).fill(jobWorkData.receipt.usedGrey);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('spinbutton', { name: 'Finished grey' }).fill(jobWorkData.receipt.finishedGrey);
  await pace(page, STEP_DELAY_MS);

  // Select Disposition (Move to Stitching)
  const addToStockTrigger = page.getByText('Add to Stock').nth(3);
  await addToStockTrigger.scrollIntoViewIfNeeded();
  await addToStockTrigger.click();
  await pace(page, DROPDOWN_DELAY_MS);

  await page
    .locator('div')
    .filter({ hasText: new RegExp(`^${jobWorkData.receipt.dispositionOption}$`) })
    .last()
    .click();
  await pace(page, STEP_DELAY_MS);

  // Add Charge
  await page.getByRole('button', { name: 'Add charge' }).click();
  await pace(page, DROPDOWN_DELAY_MS);

  await page
    .getByRole('cell', { name: '— pick from catalog —' })
    .getByRole('combobox')
    .selectOption(jobWorkData.receipt.chargeOption);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('spinbutton', { name: 'e.g.' }).fill(jobWorkData.receipt.chargeValue);
  await pace(page, STEP_DELAY_MS);

  // Submit Receipt
  await page.getByRole('button', { name: 'Add Receipt' }).click();
  await pace(page, SAVE_DELAY_MS);

  // 6. Close Job Work & Proceed to Stitching
  await page.getByRole('button', { name: 'Close Job Work' }).click();
  await pace(page, SAVE_DELAY_MS);

  await page.getByRole('button', { name: 'Proceed to Stitching Anyway' }).click();
  await pace(page, SAVE_DELAY_MS);

  // Close outer Job Work modal
  await page
    .locator('.fixed.inset-0.z-50.flex > .relative > .flex.items-start > .flex.h-8')
    .click();
  await pace(page, STEP_DELAY_MS);
});