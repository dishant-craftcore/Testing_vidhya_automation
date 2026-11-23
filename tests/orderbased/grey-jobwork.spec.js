import { test, expect } from '@playwright/test';

test.use({
  channel: 'chrome',
  headless: false,
});

const BASE_URL = 'https://visible-rosybrown-magpie-73.hostingersite.com';

// Server-friendly intervals (in milliseconds)
const LOAD_DELAY_MS = 1200; // Standard wait after API/navigation actions
const HEAVY_LOAD_MS = 2200; // Extra wait for heavy modals, dropdowns, or saves

async function waitForServer(page, ms = LOAD_DELAY_MS) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

function getDateOffset(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

const procurementData = {
  email: 'super@vidhyafashion.com',
  password: 'Qwerty@123',
  unit: 'KG',
  receive: {
    millDocNo: '101',
    challanNo: '101',
    gatePassNo: '101',
    chargeOption: '1',
    chargeQty: '2',
    item1Notes: 'item 1',
    item2Notes: 'item 2',
  },
  program: {
    qty: '20',
    programType: 'Printing Program',
    shade: 'peacheas',
    val1: '110',
    val2: '120',
    imageFile: 'Nature Pic 1.jpg',
    description: 'R 2 R',
  },
  receipt: {
    docNo: '1245',
    processType: 'Job Work',
    receiptUnit: 'MTR',
    qty1: '104',
    qty2: '950',
    chargeOption: '2',
    chargeAmount: '500',
  },
  jobWork: {
    processName: 'Printing',
    remarks: 'test remarks',
    colorOption: 'PEACH (PEACH)',
    designRef: 'D.1020',
  },
};

test('Grey Procurement, Mill Program, Receipt & Job Work Flow', async ({ page }) => {
  test.setTimeout(240000);

  const todayDate = getDateOffset(0);
  const tomorrowDate = getDateOffset(1);
  const dayAfterDate = getDateOffset(2);

  // 1. Login
  await page.goto(`${BASE_URL}/`);
  await waitForServer(page, LOAD_DELAY_MS);
  await page.goto(`${BASE_URL}/login`);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('textbox', { name: 'Email' }).fill(procurementData.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(procurementData.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  // 2. Navigate to Grey Procurement & Create Procurement Order
  await page.getByRole('button').first().click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('link', { name: 'Grey Procurement' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('button', { name: 'New Procurement Order' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('combobox').filter({ hasText: 'Search approved orders...' }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('combobox').filter({ hasText: 'Search broker...' }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('combobox').filter({ hasText: 'Search vendors by name...' }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

const selectTrigger = page.locator('div').filter({ hasText: /^Select\.\.\.$/ }).last();
await selectTrigger.scrollIntoViewIfNeeded();
await selectTrigger.click();
await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('div').filter({ hasText: new RegExp(`^${procurementData.unit}$`) }).nth(2).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('cell', { name: '104' }).getByRole('spinbutton').dblclick();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('combobox').filter({ hasText: 'Search transport vendors...' }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('button', { name: 'Create Procurement Order' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  // 3. Receive Grey Material
  await page.getByRole('button', { name: 'Receive' }).first().click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('textbox').nth(1).fill(todayDate);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.locator('div').filter({ hasText: /^Warehouse$/ }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('div').filter({ hasText: /^Mill$/ }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('combobox').filter({ hasText: 'Select mill' }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('textbox').nth(2).fill(procurementData.receive.millDocNo);
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('textbox').nth(3).fill(todayDate);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('textbox').nth(4).fill(procurementData.receive.challanNo);
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('textbox').nth(5).fill(todayDate);
  await waitForServer(page, LOAD_DELAY_MS);

  const gatePassInput = page.locator('.space-y-4 > .grid.grid-cols-1.gap-4.md\\:grid-cols-2 > div:nth-child(5) > .mt-1 > .w-full');
  await gatePassInput.fill(procurementData.receive.gatePassNo);
  await waitForServer(page, LOAD_DELAY_MS);

  const gatePassDateInput = page.locator('.space-y-4 > .grid.grid-cols-1.gap-4.md\\:grid-cols-2 > div:nth-child(6) > .mt-1 > .w-full');
  await gatePassDateInput.fill(todayDate);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('button', { name: 'Add Charge' }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('.h-9.w-full.rounded-lg.border.border-border\\/80').first().selectOption(procurementData.receive.chargeOption);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('spinbutton', { name: 'e.g.' }).fill(procurementData.receive.chargeQty);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('button', { name: 'Save Receipt' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  // Fill item notes
  await page.getByRole('textbox', { name: 'Notes' }).fill(procurementData.receive.item1Notes);
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('textbox').nth(3).fill(procurementData.receive.item2Notes);
  await waitForServer(page, LOAD_DELAY_MS);

  // 4. Issue to Mill & Add Program
  await page.getByRole('button', { name: 'Issue to Mill' }).nth(2).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('button', { name: 'Add Program' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('spinbutton', { name: '20' }).fill(procurementData.program.qty);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByText('Processing Program').nth(5).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('div').filter({ hasText: new RegExp(`^${procurementData.program.programType}$`) }).nth(4).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByText('Select color').nth(1).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('.max-h-\\[220px\\] > div:nth-child(4)').click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('textbox', { name: 'Shade' }).fill(procurementData.program.shade);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('spinbutton', { name: '0' }).nth(1).fill(procurementData.program.val1);
  await page.getByRole('spinbutton', { name: '0' }).nth(1).press('Tab');
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('spinbutton', { name: '0' }).nth(2).fill(procurementData.program.val2);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(procurementData.program.imageFile);
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.locator('.grid.gap-4.md\\:grid-cols-2 > div:nth-child(2) > .mt-1 > .w-full').fill(tomorrowDate);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('textbox', { name: 'Enter program description...' }).fill(procurementData.program.description);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('button', { name: 'Save Program' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  // 5. Add Receipt & Complete Process
  await page.getByRole('button', { name: 'Add Receipt' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('textbox').nth(5).fill(todayDate);
  await waitForServer(page, LOAD_DELAY_MS);

  const upperDocInput = page.locator('.h-9.w-full.rounded-lg.border-\\[1px\\].border-gray-300.dark\\:border-input.bg-background.px-3.text-sm.text-foreground.placeholder\\:text-muted-foreground.focus\\:outline-none.focus\\:ring-1.focus\\:ring-ring.focus\\:border-primary.transition-colors.uppercase');
  await upperDocInput.fill(procurementData.receipt.docNo);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.locator('div').filter({ hasText: /^Select\.\.\.$/ }).first().click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('div').filter({ hasText: new RegExp(`^${procurementData.receipt.processType}$`) }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.locator('.w-full.border-collapse.text-xs.min-w-\\[1200px\\] > tbody > .border-t > td:nth-child(8) > .relative > .h-9').click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('div').filter({ hasText: new RegExp(`^${procurementData.receipt.receiptUnit}$`) }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('spinbutton').nth(1).fill(procurementData.receipt.qty1);
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('spinbutton').nth(2).fill(procurementData.receipt.qty2);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('button', { name: 'Add charge' }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('.h-9.w-full.rounded-lg.border.border-border\\/80').first().selectOption(procurementData.receipt.chargeOption);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.locator('div').filter({ hasText: /^% of Amount$/ }).first().click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('div').filter({ hasText: /^Direct Amount$/ }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('spinbutton', { name: 'e.g.' }).fill(procurementData.receipt.chargeAmount);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.locator('form').filter({ hasText: 'Receipt Date*QC Status*' }).click();
  await page.getByRole('button', { name: 'Save Receipt' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('button', { name: 'Complete Process' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  // 6. Create Job Work & Edit Job Card
  await page.getByRole('button', { name: 'Create Job Work From Receipt' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('cell', { name: 'Add Vendor' }).getByRole('combobox').click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByText('Select process...').nth(1).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('div').filter({ hasText: new RegExp(`^${procurementData.jobWork.processName}$`) }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.locator('.min-w-\\[1320px\\] > tbody > .border-t > td:nth-child(11) > .h-9').fill(dayAfterDate);
  await waitForServer(page, LOAD_DELAY_MS);

  const remarksCell = page.locator('.min-w-\\[1320px\\] > tbody > .border-t > td:nth-child(12) > .h-9');
  await remarksCell.fill(procurementData.jobWork.remarks);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('button', { name: 'Create Job Work' }).nth(2).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  // Open & inspect Job Card
  await page.getByRole('button', { name: 'Edit Job Card' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('combobox').filter({ hasText: 'Search brokers by name...' }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.locator('form').filter({ hasText: 'Vendor*NIPAT TRENDS (JOB_WORK' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.locator('.fixed.inset-0.z-50.flex > .relative.z-10 > .flex-1.overflow-y-auto > .space-y-4 > .grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3 > div:nth-child(3) > .mt-1 > .relative > .h-9').click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.locator('div').filter({ hasText: /^Direct from Lot$/ }).first().click();
  await waitForServer(page, LOAD_DELAY_MS);

  // Close first modal/drawer
  await page.locator('.fixed.inset-0.z-50.flex > .relative.z-10 > .flex.items-start.justify-between.gap-4 > .flex').click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('.fixed.inset-0.z-50.flex > .relative > .flex.items-start.justify-between.gap-4 > .flex.h-8').click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('cell', { name: 'Issued: 20 Received: 0' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  // Re-open Job Card & set design + color
  await page.getByRole('button', { name: 'Edit Job Card' }).click();
  await waitForServer(page, HEAVY_LOAD_MS);

  await page.getByRole('combobox').filter({ hasText: 'Search brokers by name...' }).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByText('Choose the origin of material').nth(1).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByRole('textbox', { name: 'Design / pattern ref' }).fill(procurementData.jobWork.designRef);
  await waitForServer(page, LOAD_DELAY_MS);

  await page.getByText('Select color / shade').nth(3).click();
  await waitForServer(page, LOAD_DELAY_MS);
  await page.locator('div').filter({ hasText: new RegExp(`^${procurementData.jobWork.colorOption}$`) }).click();
  await waitForServer(page, LOAD_DELAY_MS);

  await expect(page.getByRole('button', { name: 'Required *' }).first()).toBeVisible();
});