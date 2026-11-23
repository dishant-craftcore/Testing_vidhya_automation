import { test, expect } from '@playwright/test';

test.use({
  channel: 'chrome',
  headless: false,
});

const BASE_URL = 'https://visible-rosybrown-magpie-73.hostingersite.com';

// Timing constants (in milliseconds)
const STEP_DELAY_MS = 700;      // Standard UI step pacing
const DROPDOWN_DELAY_MS = 2000; // Extra wait for async dropdown suggestions to load
const SAVE_DELAY_MS = 1800;     // Wait after form/modal saves

async function pace(page, ms = STEP_DELAY_MS) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

async function selectSuggestion(page, triggerLocator) {
  await triggerLocator.scrollIntoViewIfNeeded();
  await triggerLocator.click();
  // Give the dropdown extra time to fetch and render async options
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

const stockProcurementData = {
  email: 'super@vidhyafashion.com',
  password: 'Qwerty@123',
  orderType: 'STOCK_BASED',
  qtySpin2Initial: '20',
  qtySpin3: '300',
  qtySpin4: '20',
  imageFile: 'Nature Pic 4.jpg',
  qtySpin2Final: '5',
  receive: {
    millDocNo: '101',
    challanNo: '101',
    gatePassNo: '101',
    chargeOption: '2',
    chargeQty: '5',
  },
};

test('Stock-Based Grey Procurement Order and Mill Receipt in Chrome', async ({ page }) => {
  test.setTimeout(240000);

  const todayDate = getDateOffset(0);
  const tomorrowDate = getDateOffset(1);

  // 1. Navigate & Login
  await page.goto(`${BASE_URL}/`);
  await pace(page, STEP_DELAY_MS);
  await page.goto(`${BASE_URL}/login`);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('textbox', { name: 'Email' }).fill(stockProcurementData.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(stockProcurementData.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await pace(page, SAVE_DELAY_MS);

  // 2. Open Grey Procurement & New Procurement Order
  await page.getByRole('button').first().click();
  await pace(page, STEP_DELAY_MS);
  await page.getByRole('link', { name: 'Grey Procurement' }).click();
  await pace(page, SAVE_DELAY_MS);

  await page.getByRole('button', { name: 'New Procurement Order' }).click();
  await pace(page, SAVE_DELAY_MS);

  // Select STOCK_BASED procurement type
  const orderTypeSelect = page.getByRole('combobox').nth(2);
  await orderTypeSelect.selectOption(stockProcurementData.orderType);
  await pace(page, DROPDOWN_DELAY_MS);

  // 3. Async Dropdowns (Broker, Vendor, Product Catalog)
  await selectSuggestion(page, page.getByRole('combobox').filter({ hasText: 'Search broker...' }));
  await selectSuggestion(page, page.getByRole('combobox').filter({ hasText: 'Search vendors by name...' }));
  await selectSuggestion(page, page.getByRole('combobox').filter({ hasText: 'Pick from product catalog...' }));

  // 4. Fill Quantities, Upload File, Adjust Quantity & Create Order
  const spin2 = page.getByRole('spinbutton').nth(2);
  await spin2.scrollIntoViewIfNeeded();
  await spin2.fill(stockProcurementData.qtySpin2Initial);
  await spin2.press('Tab');
  await pace(page, STEP_DELAY_MS);

  const spin3 = page.getByRole('spinbutton').nth(3);
  await spin3.fill(stockProcurementData.qtySpin3);
  await pace(page, STEP_DELAY_MS);

  const spin4 = page.getByRole('spinbutton').nth(4);
  await spin4.fill(stockProcurementData.qtySpin4);
  await pace(page, STEP_DELAY_MS);

//   await page.getByRole('button', { name: 'Choose File' }).setInputFiles(stockProcurementData.imageFile);
//   await pace(page, SAVE_DELAY_MS);

  await spin2.dblclick();
  await spin2.fill(stockProcurementData.qtySpin2Final);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('button', { name: 'Create Procurement Order' }).click();
  await pace(page, SAVE_DELAY_MS);

  // 5. Receive Order into Mill
  await page.getByRole('button', { name: 'Receive' }).first().click();
  await pace(page, SAVE_DELAY_MS);

  await page.getByRole('textbox').nth(1).fill(tomorrowDate);
  await pace(page, STEP_DELAY_MS);

  // Switch destination from Warehouse to Mill
  await page.locator('div').filter({ hasText: /^Warehouse$/ }).last().click();
  await pace(page, DROPDOWN_DELAY_MS);
  await page.locator('div').filter({ hasText: /^Mill$/ }).last().click();
  await pace(page, DROPDOWN_DELAY_MS);

  // Select Mill from async dropdown
  await selectSuggestion(page, page.getByRole('combobox').filter({ hasText: 'Select mill' }));

  // Fill Document, Challan, and Gate Pass details
  await page.getByRole('textbox').nth(2).fill(stockProcurementData.receive.millDocNo);
  await pace(page, STEP_DELAY_MS);
  await page.getByRole('textbox').nth(3).fill(todayDate);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('textbox').nth(4).fill(stockProcurementData.receive.challanNo);
  await pace(page, STEP_DELAY_MS);
  await page.getByRole('textbox').nth(5).fill(todayDate);
  await pace(page, STEP_DELAY_MS);

  const gatePassNoInput = page.locator(
    '.space-y-4 > .grid.grid-cols-1.gap-4.md\\:grid-cols-2 > div:nth-child(5) > .mt-1 > .w-full'
  );
  await gatePassNoInput.scrollIntoViewIfNeeded();
  await gatePassNoInput.fill(stockProcurementData.receive.gatePassNo);
  await pace(page, STEP_DELAY_MS);

  const gatePassDateInput = page.locator(
    '.space-y-4 > .grid.grid-cols-1.gap-4.md\\:grid-cols-2 > div:nth-child(6) > .mt-1 > .w-full'
  );
  await gatePassDateInput.fill(todayDate);
  await pace(page, STEP_DELAY_MS);

  // Add Charge
  await page.getByRole('button', { name: 'Add Charge' }).click();
  await pace(page, DROPDOWN_DELAY_MS);

  await page
    .locator('.h-9.w-full.rounded-lg.border.border-border\\/80')
    .first()
    .selectOption(stockProcurementData.receive.chargeOption);
  await pace(page, STEP_DELAY_MS);

  await page.getByRole('spinbutton', { name: 'e.g.' }).fill(stockProcurementData.receive.chargeQty);
  await pace(page, STEP_DELAY_MS);

  // Save Receipt & Issue to Mill
  await page.getByRole('button', { name: 'Save Receipt' }).click();
  await pace(page, SAVE_DELAY_MS);

  await page.getByRole('button', { name: 'Issue to Mill' }).nth(1).click();
  await pace(page, SAVE_DELAY_MS);

  // Close modal
  await page
    .locator('.fixed.inset-0.z-50.flex > .relative > .flex.items-start.justify-between.gap-4 > .flex.h-8')
    .click();
  await pace(page, STEP_DELAY_MS);
});