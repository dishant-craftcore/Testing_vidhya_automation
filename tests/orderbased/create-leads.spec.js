import { test, expect } from '@playwright/test';

// Force Playwright to use installed Google Chrome
test.use({
  channel: 'chrome',
  headless: false, // Opens browser visibly so you can watch Chrome run
});

const STEP_DELAY_MS = 800; // Adjust this (in ms) to speed up or slow down between steps

async function pace(page, ms = STEP_DELAY_MS) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

const randomLeads = [
  {
    name: 'Rohan Mehta',
    phone: '9825011223',
    altPhone: '9825011224',
    email: `rohan.mehta.${Date.now()}@example.com`,
    company: 'Mehta Fabrics Pvt Ltd',
    category: 'textile',
    productRequest: '500 meters cotton',
    tags: 'cotton, yarn',
    source: 'Instagram',
    address1: '102 Ring Road',
    address2: 'Textile Market',
    address3: 'Near Sahara Darwaja',
    state: 'Andaman and Nicobar Islands',
    city: 'Bamboo Flat',
    pincode: '744107',
    notes: 'Automated entry 1 - Bulk cotton inquiry',
  },
  {
    name: 'Priya Desai',
    phone: '9879044556',
    altPhone: '9879044557',
    email: `priya.desai.${Date.now()}@example.com`,
    company: 'Desai Creations',
    category: 'apparel',
    productRequest: '200 rolls dyed yarn',
    tags: 'yarn, dyes',
    source: 'Instagram',
    address1: 'Plot 45, GIDC',
    address2: 'Pandesara',
    address3: 'Phase 2',
    state: 'Andaman and Nicobar Islands',
    city: 'Bamboo Flat',
    pincode: '744107',
    notes: 'Automated entry 2 - Urgent sample needed',
  },
  {
    name: 'Vikram Joshi',
    phone: '9909077889',
    altPhone: '9909077890',
    email: `vikram.joshi.${Date.now()}@example.com`,
    company: 'Joshi Handlooms',
    category: 'wholesale',
    productRequest: '1000 meters raw silk',
    tags: 'cotton, silk',
    source: 'Instagram',
    address1: '14 Mill Compound',
    address2: 'Station Road',
    address3: 'Block B',
    state: 'Andaman and Nicobar Islands',
    city: 'Bamboo Flat',
    pincode: '744107',
    notes: 'Automated entry 3 - Repeat seasonal buyer',
  },
];

test('Add 3 random leads in Chrome', async ({ page }) => {
    test.setTimeout(120000);
  // 1. Login
  await page.goto('https://visible-rosybrown-magpie-73.hostingersite.com/login');
  await pace(page);

  await page.getByRole('textbox', { name: 'Email' }).fill('super@vidhyafashion.com');
  await pace(page, 400);

  await page.getByRole('textbox', { name: 'Password' }).fill('Qwerty@123');
  await pace(page, 400);

  await page.getByRole('button', { name: 'Sign in' }).click();
  await pace(page, 1200);

  // 2. Navigate to Leads
  await page.getByRole('button').first().click();
  await pace(page, 500);

  await page.getByRole('link', { name: 'Leads', exact: true }).click();
  await pace(page, 1000);

  // 3. Loop through the 3 leads and create each one
  for (const lead of randomLeads) {
    await page.getByRole('button', { name: 'New Lead' }).click();
    await pace(page, 700);

    await page.getByRole('textbox').nth(1).fill(lead.name);
    await pace(page, 300);

    await page.getByRole('textbox').nth(2).fill(lead.phone);
    await pace(page, 300);

    await page.getByRole('textbox').nth(3).fill(lead.altPhone);
    await pace(page, 300);

    await page.locator('input[type="email"]').fill(lead.email);
    await pace(page, 300);

    await page.getByRole('textbox').nth(5).fill(lead.company);
    await pace(page, 300);

    await page.locator('div:nth-child(6) > .mt-1 > .h-9').fill(lead.category);
    await pace(page, 300);

    await page.getByRole('textbox', { name: 'Free-text product request' }).fill(lead.productRequest);
    await pace(page, 300);

    await page.getByRole('textbox', { name: 'e.g. Cotton fabric, Yarn, Dyes' }).fill(lead.tags);
    await pace(page, 400);

    // Source dropdown
    await page.locator('div').filter({ hasText: /^Select source\.\.\.$/ }).click();
    await pace(page, 500);
    await page.locator('div').filter({ hasText: new RegExp(`^${lead.source}$`) }).click();
    await pace(page, 400);

    // Address fields
    await page.locator('div:nth-child(10) > .mt-1 > .h-9').fill(lead.address1);
    await pace(page, 250);

    await page.locator('div:nth-child(11) > .mt-1 > .h-9').fill(lead.address2);
    await pace(page, 250);

    await page.locator('div:nth-child(12) > .mt-1 > .h-9').fill(lead.address3);
    await pace(page, 400);

    // State & City dropdowns
    await page.locator('div:nth-child(13) > .mt-1 > .relative > .h-9 > .lucide').click();
    await pace(page, 600);
    await page.locator('div').filter({ hasText: new RegExp(`^${lead.state}$`) }).click();
    await pace(page, 700); // Extra pause so dependent city options finish loading

    await page.locator('div').filter({ hasText: /^Select city$/ }).click();
    await pace(page, 600);
    await page.locator('div').filter({ hasText: new RegExp(`^${lead.city}$`) }).click();
    await pace(page, 400);

    await page.locator('div:nth-child(15) > .mt-1 > .h-9').fill(lead.pincode);
    await pace(page, 300);

    // Assignee & Notes
    await page.getByRole('button', { name: 'Select users...' }).click();
    await pace(page, 500);
    await page.getByRole('listbox', { name: 'Suggestions' }).click();
    await pace(page, 400);

    await page.locator('textarea').fill(lead.notes);
    await pace(page, 400);

    await page.getByRole('button', { name: 'Create Lead' }).click();
    await pace(page, 1200);

    // Wait for the newly created lead to appear before starting the next one
    await expect(page.getByText(lead.name).first()).toBeVisible();
    await pace(page, 800);
  }
});