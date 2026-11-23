import { test, expect } from '@playwright/test';

test.use({
  channel: 'chrome',
  headless: false,
});

const BASE_URL = 'https://visible-rosybrown-magpie-73.hostingersite.com';
const LOAD_DELAY_MS = 800;

async function waitForServer(page, ms = LOAD_DELAY_MS) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

const warehousesData = [
  {
    codePrefix: 'WH-5',
    name: 'ABC',
    defaultType: 'Raw Material',
    warehouseType: 'Grey Store',
    address: 'abc near xyz',
  },
  // Add more warehouse objects here to test multiple entries in one run:
  // {
  //   codePrefix: 'WH-5',
  //   name: 'Finished Goods Hub',
  //   defaultType: 'Raw Material',
  //   warehouseType: 'Finished Goods',
  //   address: 'Plot 12, Ring Road, Surat',
  // },
];

test('Create and verify Warehouses in Chrome', async ({ page }) => {
  test.setTimeout(120000);

  // 1. Login
  await page.goto(`${BASE_URL}/`);
  await waitForServer(page, 600);
  await page.goto(`${BASE_URL}/login`);
  await waitForServer(page, 600);

  await page.getByRole('textbox', { name: 'Email' }).fill('super@vidhyafashion.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Qwerty@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await waitForServer(page, 1500);

  // 2. Navigate to Warehouses
  await page.getByRole('button').first().click();
  await waitForServer(page, 600);
  await page.getByRole('link', { name: 'Warehouses' }).click();
  await waitForServer(page, 1200);

  // 3. Create each Warehouse and inspect via View
  for (const [index, warehouse] of warehousesData.entries()) {
    const uniqueSuffix = String(Date.now()).slice(-4);
    const warehouseCode = `${warehouse.codePrefix}-${uniqueSuffix}${index}`;
    const warehouseName = `${warehouse.name} ${uniqueSuffix}`;

    await page.getByRole('button', { name: 'New Warehouse' }).click();
    await waitForServer(page, 700);

    // Warehouse Code (placeholder: "e.g. WH-")
    await page.getByRole('textbox', { name: 'e.g. WH-' }).fill(warehouseCode);
    await waitForServer(page, 250);

    // Warehouse Name
    await page.getByRole('textbox').nth(2).fill(warehouseName);
    await waitForServer(page, 250);

    // Warehouse Type dropdown (using .last() to hit the clickable trigger)
    await page.locator('div').filter({ hasText: new RegExp(`^${warehouse.defaultType}$`) }).last().click();
    await waitForServer(page, 400);
    await page.locator('div').filter({ hasText: new RegExp(`^${warehouse.warehouseType}$`) }).click();
    await waitForServer(page, 300);

    // Address / Description
    await page.locator('textarea').fill(warehouse.address);
    await waitForServer(page, 300);

    // Save Warehouse
    await page.getByRole('button', { name: 'Save Warehouse' }).click();
    await waitForServer(page, 1200);

    // Confirm the newly created warehouse appears in the list
    await expect(page.getByText(warehouseName).first()).toBeVisible();

    // Open details modal and close it
    await page.getByRole('button', { name: 'View' }).first().click();
    await waitForServer(page, 600);
    await page.getByRole('button', { name: 'Close' }).click();
    await waitForServer(page, 500);
  }
});