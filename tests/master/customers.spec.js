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

const customersData = [
  {
    name: 'Kumar Verma',
    type: 'B2C',
    emailPrefix: 'kumar.verma',
    primaryContact: 'Kumar Shankar',
    phone: '9898456123',
    altPhone: '9898123456',
    refName: 'Kinjal Verma',
    refMobile: '9898756485',
    refEmailPrefix: 'kinjal.verma',
    address1: 'B, Jainam Building, Narola Street, Mumbai',
    address2: 'Narola Street',
    area: 'Narola',
    pincode: '356254',
    stateSearch: 'mah',
    stateExact: 'Maharashtra',
    citySearch: 'mum',
    cityExact: 'Mumbai',
    gstin: '27ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    creditLimit: '100000',
    creditDays: '10',
    discountOrRate: '5',
  },
  // Add more customer objects here to run multiple entries in a single loop
];

test('Create and verify Customers in Chrome', async ({ page }) => {
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

  // 2. Navigate to Customers
  await page.getByRole('button').first().click();
  await waitForServer(page, 600);
  await page.getByRole('link', { name: 'Customers' }).click();
  await waitForServer(page, 1200);

  // 3. Create each customer and inspect via View
  for (const [index, customer] of customersData.entries()) {
    const uniqueEmail = `${customer.emailPrefix}.${Date.now()}.${index}@gmail.com`;
    const uniqueRefEmail = `${customer.refEmailPrefix}.${Date.now()}.${index}@gmail.com`;

    await page.getByRole('button', { name: 'New Customer' }).click();
    await waitForServer(page, 800);

    // Basic Details
    await page.getByRole('textbox').nth(1).fill(customer.name);
    await waitForServer(page, 250);

    await page.getByRole('combobox').nth(1).selectOption(customer.type);
    await waitForServer(page, 250);

    await page.getByRole('textbox').nth(2).fill(uniqueEmail);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Primary contact name' }).fill(customer.primaryContact);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Enter a valid 10-digit Indian' }).first().fill(customer.phone);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Enter a valid 10-digit Indian' }).nth(1).fill(customer.altPhone);
    await waitForServer(page, 250);

    // Reference Details
    await page.getByRole('textbox', { name: 'Reference 1 name' }).fill(customer.refName);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: '-digit mobile' }).first().fill(customer.refMobile);
    await waitForServer(page, 250);

    await page.locator('input[type="email"]').nth(1).fill(uniqueRefEmail);
    await waitForServer(page, 300);

    // Address Details
    const addr1 = page.locator('textarea').first();
    await addr1.scrollIntoViewIfNeeded();
    await addr1.fill(customer.address1);
    await waitForServer(page, 250);

    const addr2 = page.locator('textarea').nth(1);
    await addr2.fill(customer.address2);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Limbayat' }).fill(customer.area);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Enter a valid 6-digit Indian' }).first().fill(customer.pincode);
    await waitForServer(page, 300);

    // State & City searchable dropdowns
    await page.locator('div').filter({ hasText: /^Select state$/ }).first().click();
    await waitForServer(page, 400);
    await page.getByRole('textbox', { name: 'Search state...' }).fill(customer.stateSearch);
    await waitForServer(page, 400);
    await page.getByText(customer.stateExact).nth(2).click();
    await waitForServer(page, 700); // Allow dependent city list to load

    await page.locator('span').filter({ hasText: 'Select city' }).click();
    await waitForServer(page, 400);
    await page.getByRole('textbox', { name: 'Search city...' }).fill(customer.citySearch);
    await waitForServer(page, 400);
    await page.locator('div').filter({ hasText: new RegExp(`^${customer.cityExact}$`) }).click();
    await waitForServer(page, 400);

    // Billing Address Checkbox
    const sameAsAddress = page.getByRole('checkbox', { name: 'Same as Address' });
    await sameAsAddress.scrollIntoViewIfNeeded();
    await sameAsAddress.check();
    await waitForServer(page, 300);

    // Tax & Financial Terms
    const gstinInput = page.getByRole('textbox', { name: 'Enter a valid 15-character' });
    await gstinInput.scrollIntoViewIfNeeded();
    await gstinInput.fill(customer.gstin);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Enter a valid 10-character' }).fill(customer.pan);
    await waitForServer(page, 250);

    await page.getByRole('spinbutton', { name: '100000' }).fill(customer.creditLimit);
    await waitForServer(page, 250);

    await page.getByRole('spinbutton', { name: '10', exact: true }).fill(customer.creditDays);
    await waitForServer(page, 250);

    await page.getByRole('spinbutton', { name: 'e.g.' }).fill(customer.discountOrRate);
    await waitForServer(page, 300);

    // Broker & Salesman comboboxes
    const brokerBox = page.getByRole('combobox').filter({ hasText: 'Search broker...' });
    await brokerBox.scrollIntoViewIfNeeded();
    await brokerBox.click();
    await waitForServer(page, 400);
    await page.getByRole('listbox', { name: 'Suggestions' }).click();
    await waitForServer(page, 300);

    const salesmanBox = page.getByRole('combobox').filter({ hasText: 'Search salesman...' });
    await salesmanBox.click();
    await waitForServer(page, 400);
    await page.getByRole('listbox', { name: 'Suggestions' }).click();
    await waitForServer(page, 400);

    // Save Customer
    await page.getByRole('button', { name: 'Save Customer' }).click();
    await waitForServer(page, 1500);

    // Verify customer appears in list, open View modal, and close it
    await expect(page.getByText(customer.name).first()).toBeVisible();
    await page.getByRole('button', { name: 'View' }).first().click();
    await waitForServer(page, 700);
    await page.locator('.fixed.inset-0.z-50.flex > .relative > .flex.items-start > .flex').click();
    await waitForServer(page, 500);
  }
});