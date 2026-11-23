import { test, expect } from '@playwright/test';

test.use({
  channel: 'chrome',
  headless: false,
});

const BASE_URL = 'https://visible-rosybrown-magpie-73.hostingersite.com';
const LOAD_DELAY_MS = 1000;

async function waitForServer(page, ms = LOAD_DELAY_MS) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

const chargesData = [
  {
    name: 'IT Charges',
    code: '61580201',
    rate: '02',
    description: 'IT Department Charges',
  },
  // Add more charge objects here if you want to test multiple entries in one run:
  // {
  //   name: 'Packaging Charges',
  //   code: '9985',
  //   rate: '5',
  //   description: 'Export carton and poly packing',
  // },
];

test('Create and verify Additional Charges in Chrome', async ({ page }) => {
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

  // 2. Navigate to Additional Charges
  await page.getByRole('button').first().click();
  await waitForServer(page, 600);
  await page.getByRole('link', { name: 'Additional Charges' }).click();
  await waitForServer(page, 1200);

  // 3. Create each charge, inspect via View, and close modal
  for (const charge of chargesData) {
    await page.getByRole('button', { name: 'New Charge' }).click();
    await waitForServer(page, 600);

    await page.getByRole('textbox', { name: 'e.g. Freight Charges' }).fill(charge.name);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'e.g. 9965' }).fill(charge.code);
    await waitForServer(page, 250);

    await page.getByRole('spinbutton', { name: 'e.g.' }).fill(charge.rate);
    await waitForServer(page, 250);

    await page.getByRole('textbox', { name: 'Optional description...' }).fill(charge.description);
    await waitForServer(page, 300);

    await page.getByRole('button', { name: 'Save Charge' }).click();
    await waitForServer(page, 1200);

    // Confirm the newly created charge appears in the list
    await expect(page.getByText(charge.name).first()).toBeVisible();

    // Open details modal and close it
    await page.getByRole('button', { name: 'View' }).first().click();
    await waitForServer(page, 600);
    await page.getByRole('button', { name: 'Close' }).click();
    await waitForServer(page, 500);
  }
});