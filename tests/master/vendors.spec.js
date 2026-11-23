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

const vendorsData = [
  {
    name: 'Nilam Textiles',
    defaultType: 'Job Work',
    vendorType: 'Weaver',
    emailPrefix: 'nilam.textiles',
    primaryContact: 'Nilam Parmar',
    phone: '9898456123',
    refName: 'Nilesh Parmar',
    refMobile: '9898456789',
    address1: 'abc, xyz street',
    address2: 'Wagodia circle, vadodara',
    stateSearch: 'guj',
    stateExact: 'Gujarat',
    citySearch: 'sura',
    cityExact: 'Dhansura',
    pincode: '456789',
    gstin: '27ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    bankName: 'SBI BANK',
    accountNumber: '3154678954125478',
    ifscCode: 'SBI01234U',
    branchName: 'BARODA',
    spin3: '3',
    spin5: '4',
    spin1: '2',
  },
  // Add more vendor objects here to create multiple vendors in one loop
];

test('Create and verify Vendors in Chrome', async ({ page }) => {
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

  // 2. Navigate to Vendors
  await page.getByRole('button').first().click();
  await waitForServer(page, 600);
  await page.getByRole('link', { name: 'Vendors' }).click();
  await waitForServer(page, 1200);

  // 3. Create each vendor and inspect via View
  for (const [index, vendor] of vendorsData.entries()) {
    const uniqueEmail = `${vendor.emailPrefix}.${Date.now()}.${index}@gmail.com`;

    await page.getByRole('button', { name: 'New Vendor' }).click();
    await waitForServer(page, 800);

    // Basic Info & Vendor Type
    await page.getByRole('textbox').nth(1).fill(vendor.name);
    await waitForServer(page, 250);

    await page.locator('div').filter({ hasText: new RegExp(`^${vendor.defaultType}$`) }).last().click();
    await waitForServer(page, 400);
    await page.locator('div').filter({ hasText: new RegExp(`^${vendor.vendorType}$`) }).click();
    await waitForServer(page, 300);

    await page.locator('input[type="email"]').fill(uniqueEmail);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Primary contact name' }).fill(vendor.primaryContact);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Enter a valid 10-digit Indian' }).fill(vendor.phone);
    await waitForServer(page, 250);

    // Reference Details
    await page.getByRole('textbox', { name: 'Reference name' }).first().fill(vendor.refName);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: '-digit mobile' }).first().fill(vendor.refMobile);
    await waitForServer(page, 300);

    // Address Details
    const addr1 = page.locator('textarea').first();
    await addr1.scrollIntoViewIfNeeded();
    await addr1.fill(vendor.address1);
    await waitForServer(page, 250);

    await page.locator('textarea').nth(1).fill(vendor.address2);
    await waitForServer(page, 300);

    // State & City searchable dropdowns
    await page.locator('div').filter({ hasText: /^Select state$/ }).last().click();
    await waitForServer(page, 400);
    await page.getByRole('textbox', { name: 'Search state...' }).fill(vendor.stateSearch);
    await waitForServer(page, 400);
    await page.getByText(vendor.stateExact, { exact: true }).nth(1).click();
    await waitForServer(page, 700); // Allow dependent city list to load

    await page.locator('span').filter({ hasText: 'Select city' }).click();
    await waitForServer(page, 400);
    await page.getByRole('textbox', { name: 'Search city...' }).fill(vendor.citySearch);
    await waitForServer(page, 400);
    await page.locator('div').filter({ hasText: new RegExp(`^${vendor.cityExact}$`) }).click();
    await waitForServer(page, 400);

    await page.getByRole('textbox', { name: 'Enter a valid 6-digit Indian' }).fill(vendor.pincode);
    await waitForServer(page, 300);

    // Tax & Bank Details
    const gstinInput = page.getByRole('textbox', { name: 'Enter a valid 15-character' });
    await gstinInput.scrollIntoViewIfNeeded();
    await gstinInput.fill(vendor.gstin);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Enter a valid 10-character' }).fill(vendor.pan);
    await waitForServer(page, 250);

    const bankNameInput = page.locator('div:nth-child(4) > .grid > div:nth-child(3) > .mt-1 > .w-full');
    await bankNameInput.scrollIntoViewIfNeeded();
    await bankNameInput.fill(vendor.bankName);
    await waitForServer(page, 250);

    await page.locator('div:nth-child(4) > .grid > div:nth-child(4) > .mt-1 > .w-full').fill(vendor.accountNumber);
    await waitForServer(page, 250);

    await page.locator('div:nth-child(4) > .grid > div:nth-child(5) > .mt-1 > .w-full').fill(vendor.ifscCode);
    await waitForServer(page, 250);

    await page.locator('div:nth-child(6) > .mt-1 > .w-full').fill(vendor.branchName);
    await waitForServer(page, 300);

    // Terms & Broker Selection
    const spin3 = page.getByRole('spinbutton', { name: 'e.g. 3' });
    await spin3.scrollIntoViewIfNeeded();
    await spin3.fill(vendor.spin3);
    await waitForServer(page, 250);

    await page.getByRole('spinbutton', { name: 'e.g. 5' }).fill(vendor.spin5);
    await waitForServer(page, 250);

    await page.getByRole('spinbutton', { name: 'e.g. 1' }).fill(vendor.spin1);
    await waitForServer(page, 300);

    const brokerBox = page.getByRole('combobox').filter({ hasText: 'Type broker name...' });
    await brokerBox.scrollIntoViewIfNeeded();
    await brokerBox.click();
    await waitForServer(page, 400);
    await page.getByRole('listbox', { name: 'Suggestions' }).click();
    await waitForServer(page, 400);

    // Save Vendor
    await page.getByRole('button', { name: 'Save Vendor' }).click();
    await waitForServer(page, 1500);

    // Verify vendor appears in list, open View modal, and close it
    await expect(page.getByText(vendor.name).first()).toBeVisible();
    await page.getByRole('button', { name: 'View' }).first().click();
    await waitForServer(page, 700);
    await page.getByRole('button', { name: 'Close' }).click();
    await waitForServer(page, 500);
  }
});