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

const productsData = [
  {
    name: 'Silk 3.50',
    defaultCategory: 'Grey Fabric',
    category: 'Printed Fabric',
    hsnCode: '61548748',
    gstRate: '5',
    basePriceOrRate: '25',
    statuses: ['Finished FINISHED', 'Processed PROCESSED'],
    description: 'silk fabric',
  },
  // Add more product objects here to create multiple products in a single run:
  // {
  //   name: 'Cotton Twill 40x40',
  //   defaultCategory: 'Grey Fabric',
  //   category: 'Dyed Fabric',
  //   hsnCode: '52081200',
  //   gstRate: '5',
  //   basePriceOrRate: '140',
  //   statuses: ['Finished FINISHED'],
  //   description: '100% combed cotton twill',
  // },
];

test('Create and verify Products in Chrome', async ({ page }) => {
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

  // 2. Navigate to Products
  await page.getByRole('button').first().click();
  await waitForServer(page, 600);
  await page.getByRole('link', { name: 'Products' }).click();
  await waitForServer(page, 1200);

  // 3. Create each Product and inspect via View
  for (const product of productsData) {
    const uniqueSuffix = String(Date.now()).slice(-4);
    const productName = `${product.name} (${uniqueSuffix})`;

    await page.getByRole('button', { name: 'New Product' }).click();
    await waitForServer(page, 700);

    // Product Name
    await page.getByRole('textbox').nth(2).fill(productName);
    await waitForServer(page, 250);

    // Category dropdown (using .last() to hit the clickable trigger)
    await page
      .locator('div')
      .filter({ hasText: new RegExp(`^${product.defaultCategory}$`) })
      .last()
      .click();
    await waitForServer(page, 400);
    await page
      .locator('div')
      .filter({ hasText: new RegExp(`^${product.category}$`) })
      .click();
    await waitForServer(page, 300);

    // HSN / Product Code
    await page.getByRole('textbox').nth(3).fill(product.hsnCode);
    await waitForServer(page, 250);

    // Numeric fields (GST % and Price/Rate)
    await page.getByRole('spinbutton').first().fill(product.gstRate);
    await waitForServer(page, 250);

    await page.getByRole('spinbutton').nth(2).fill(product.basePriceOrRate);
    await waitForServer(page, 300);

    // Stage / Status Checkboxes
    for (const statusLabel of product.statuses) {
      const checkbox = page.getByRole('checkbox', { name: statusLabel });
      await checkbox.scrollIntoViewIfNeeded();
      await checkbox.check();
      await waitForServer(page, 200);
    }

    // Description
    const descriptionBox = page
      .locator('form')
      .filter({ hasText: 'General InformationProduct' })
      .locator('textarea');
    await descriptionBox.scrollIntoViewIfNeeded();
    await descriptionBox.fill(product.description);
    await waitForServer(page, 300);

    // Save Product
    await page.getByRole('button', { name: 'Save Product' }).click();
    await waitForServer(page, 1200);

    // Verify product appears in list, open View modal, and close it
    await expect(page.getByText(productName).first()).toBeVisible();
    await page.getByRole('button', { name: 'View' }).first().click();
    await waitForServer(page, 600);
    await page
      .locator('.fixed.inset-0.z-50.flex > .relative > .flex.items-start > .flex')
      .click();
    await waitForServer(page, 500);
  }
});