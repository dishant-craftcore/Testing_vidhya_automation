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

const colorFamiliesData = [
  {
    name: 'Lemon Yellow',
    code: 'LEMON',
  },
  // Add more color families here to test multiple entries in one run:
  // {
  //   name: 'Emerald Green',
  //   code: 'EMERALD',
  // },
];

test('Create and verify Color Families in Chrome', async ({ page }) => {
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

  // 2. Navigate to Color Families
  await page.getByRole('button').first().click();
  await waitForServer(page, 600);
  await page.getByRole('link', { name: /Color Famil/i }).click();
  await waitForServer(page, 1200);

  // 3. Create each Color Family
  for (const family of colorFamiliesData) {
    // Append a short timestamp suffix if you plan to run this repeatedly without deleting old test rows
    const uniqueSuffix = String(Date.now()).slice(-4);
    const familyName = `${family.name} ${uniqueSuffix}`;
    const familyCode = `${family.code}_${uniqueSuffix}`;

    await page.getByRole('button', { name: 'Create Family' }).click();
    await waitForServer(page, 600);

    // Fill Family Name (placeholder: "Red")
    const nameInput = page.getByRole('textbox', { name: 'Red', exact: true });
    await nameInput.fill(familyName);
    await waitForServer(page, 250);

    // Fill Family Code (placeholder: "RED")
    const codeInput = page.getByRole('textbox', { name: 'RED', exact: true });
    await codeInput.fill(familyCode);
    await waitForServer(page, 300);

    // Save Color Family
    await page.getByRole('button', { name: 'Save Color Family' }).click();
    await waitForServer(page, 1200);

    // Verify the new Color Family appears on the page
    await expect(page.getByText(familyName).first()).toBeVisible();
    await waitForServer(page, 500);
  }
});