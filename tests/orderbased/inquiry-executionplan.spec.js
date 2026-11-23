import { test, expect } from '@playwright/test';

test.use({
  channel: 'chrome',
  headless: false,
});

const BASE_URL = 'https://visible-rosybrown-magpie-73.hostingersite.com';
const STEP_DELAY_MS = 500;

async function pace(page, ms = STEP_DELAY_MS) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

function getDateOffset(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

const workflowData = {
  email: 'super@vidhyafashion.com',
  password: 'Qwerty@123',
  inquiry: {
    qty1: '20',
    qty2: '200',
    rateOrFactor: '52',
    unitTarget: 'kg',
    extraValue: '20',
    secondNumber: '120',
    color: 'Orange (ORG)',
  },
  customer: {
    name: 'Rohan Mehra',
    type: 'B2C',
    phone: '9898456123',
    emailPrefix: 'rohan.mehra',
    gstin: '27ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    spin4: '20000',
    spin5: '20',
    address1: 'address 1',
    state: 'Andhra Pradesh',
    city: 'Akasahebpet',
    pincode: '985624',
  },
  quotation: {
    chargeOption: '1',
    chargeQty: '2',
    chargeAmount: '200',
  },
  routeText: 'Grey -> Mill -> Job Work ->QC',
};

test('Full flow: Lead to Inquiry, Quotation, Customer, Order & Execution Plan', async ({ page }) => {
  test.setTimeout(180000);

  const validUntilDate = getDateOffset(1);
  const dispatchDate = getDateOffset(0);
  const uniqueCustomerEmail = `${workflowData.customer.emailPrefix}.${Date.now()}@example.com`;

  // 1. Login
  await page.goto(`${BASE_URL}/`);
  await page.goto(`${BASE_URL}/login`);
  await pace(page);

  await page.getByRole('textbox', { name: 'Email' }).fill(workflowData.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(workflowData.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await pace(page, 1200);

  // 2. Navigate to Leads & Convert to Inquiry
  await page.getByRole('button').first().click();
  await pace(page, 400);
  await page.getByRole('link', { name: 'Leads', exact: true }).click();
  await pace(page, 1000);

  await page.getByRole('button', { name: 'View' }).nth(1).click();
  await pace(page, 600);
  await page.getByRole('tab', { name: 'Tasks' }).click();
  await pace(page, 400);
  await page.getByRole('textbox', { name: 'Follow up with customer' }).click();
  await pace(page, 300);

  await page.getByRole('button', { name: 'Convert to Inquiry' }).click();
  await pace(page, 1200);

  // 3. Edit Inquiry Details
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await pace(page, 700);

  await page.getByRole('button', { name: 'Add Customer' }).click();
  await pace(page, 300);
  await page.getByRole('button', { name: 'Add Customer' }).click();
  await pace(page, 500);

  // Broker & Product Catalog selections
  await page.getByRole('combobox').filter({ hasText: 'Select broker' }).click();
  await pace(page, 400);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await pace(page, 400);

  await page.getByRole('combobox').filter({ hasText: 'Pick from product catalog...' }).click();
  await pace(page, 400);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await pace(page, 400);

  // Unit & quantities
  await page.locator('div').filter({ hasText: /^Select\.\.\.$/ }).click();
  await pace(page, 400);
  await page.getByText('Meters').nth(3).click();
  await pace(page, 300);

  await page.getByRole('spinbutton', { name: '0' }).first().fill(workflowData.inquiry.qty1);
  await page.getByRole('spinbutton', { name: '0' }).first().press('Tab');
  await pace(page, 300);

  await page.getByRole('spinbutton', { name: '0' }).nth(1).fill(workflowData.inquiry.qty2);
  await page.getByRole('spinbutton', { name: '0' }).nth(1).press('Tab');
  await pace(page, 300);

  await page.getByRole('spinbutton', { name: '100' }).fill(workflowData.inquiry.rateOrFactor);
  await pace(page, 300);

  await page.locator('div').filter({ hasText: /^Meters$/ }).nth(1).click();
  await pace(page, 300);
  await page.locator('div').filter({ hasText: /^kg$/ }).click();
  await pace(page, 300);

  await page.getByText('200.00').click();
  await pace(page, 300);

  await page.getByRole('spinbutton', { name: '0.00' }).fill(workflowData.inquiry.extraValue);
  await pace(page, 300);

  // Clear item notes
  const itemNotes = page.getByRole('textbox', { name: 'Notes for this item' });
  await itemNotes.click();
  await itemNotes.press('ControlOrMeta+a');
  await itemNotes.fill('');
  await pace(page, 300);

  await page.getByRole('spinbutton', { name: '150' }).fill(workflowData.inquiry.secondNumber);
  await pace(page, 300);

  // Color selection
  await page.getByText('Select color', { exact: true }).nth(3).click();
  await pace(page, 400);
  await page.locator('div').filter({ hasText: /^Orange \(ORG\)$/ }).click();
  await pace(page, 400);

  // Update notes & save inquiry
  const updateNotes = page.getByRole('textbox', { name: 'Update notes...' });
  await updateNotes.click();
  await updateNotes.press('ControlOrMeta+a');
  await updateNotes.fill('\n');
  await pace(page, 300);

  await page.locator('div').filter({ hasText: 'Est. Total: ₹' }).nth(4).click();
  await pace(page, 300);
  await page.getByRole('button', { name: 'Update Inquiry' }).click();
  await pace(page, 1200);

  // Close open modals / inspect inquiry view
  await page.locator('.fixed.inset-0.z-50.flex > .relative.z-10 > .flex.items-start > .flex').click();
  await pace(page, 400);
  await page.getByRole('button', { name: 'View' }).first().click();
  await pace(page, 500);
  await page.locator('.fixed.inset-0.z-50.flex > .relative > .flex.items-start > .flex').click();
  await pace(page, 400);
  await page.getByRole('button', { name: 'View' }).first().click();
  await pace(page, 600);

  // 4. Create Quotation
  await page.getByRole('button', { name: 'Quotation' }).click();
  await pace(page, 500);
  await page
    .locator('form')
    .filter({ hasText: 'Valid UntilCancelCreate' })
    .getByRole('textbox')
    .fill(validUntilDate);
  await pace(page, 300);
  await page.getByRole('button', { name: 'Create Quotation' }).click();
  await pace(page, 1200);

  // 5. Open Quotations & Add Customer
  await page.getByRole('link', { name: 'Quotations' }).click();
  await pace(page, 1000);
  await page.getByRole('button', { name: 'View' }).first().click();
  await pace(page, 600);
  await page.locator('.h-8.px-3.rounded-lg.border').first().click();
  await pace(page, 500);
  await page.getByRole('button', { name: 'Add Customer' }).click();
  await pace(page, 600);

  const customerNameInput = page
    .locator(
      '.w-full.rounded-lg.border-\\[1px\\].border-gray-300.dark\\:border-input.bg-background.px-3.text-sm.text-foreground.placeholder\\:text-muted-foreground.focus\\:outline-none.focus\\:ring-1.focus\\:ring-ring.focus\\:border-primary.transition-colors.h-9.sm\\:h-10'
    )
    .first();

  await customerNameInput.fill(workflowData.customer.name);
  await customerNameInput.press('Tab');
  await pace(page, 300);

  const customerTypeSelect = page.locator(
    '.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3 > div:nth-child(2) > .mt-1 > .hidden > .rounded-lg'
  );
  await customerTypeSelect.press('Enter');
  await customerTypeSelect.selectOption(workflowData.customer.type);
  await customerTypeSelect.press('Tab');
  await pace(page, 300);

  await page.getByRole('textbox', { name: 'Primary contact name' }).press('Enter');
  await pace(page, 250);

  const phoneInput = page.getByRole('textbox', { name: 'Enter a valid 10-digit Indian' });
  await phoneInput.fill(workflowData.customer.phone);
  await phoneInput.press('Tab');
  await pace(page, 250);

  const customerEmailInput = page
    .locator('form')
    .filter({ hasText: 'Customer Name*Type*B2B —' })
    .locator('input[type="email"]');
  await customerEmailInput.fill(uniqueCustomerEmail);
  await customerEmailInput.press('Tab');
  await pace(page, 250);

  const gstinInput = page.getByRole('textbox', { name: 'Enter a valid 15-character' });
  await gstinInput.fill(workflowData.customer.gstin);
  await pace(page, 250);

  const panInput = page.getByRole('textbox', { name: 'Enter a valid 10-character' });
  await panInput.fill(workflowData.customer.pan);
  await pace(page, 250);

  await page.getByRole('spinbutton').nth(4).fill(workflowData.customer.spin4);
  await page.getByRole('spinbutton').nth(4).press('Tab');
  await pace(page, 250);

  await page.getByRole('spinbutton').nth(5).fill(workflowData.customer.spin5);
  await page.getByRole('spinbutton').nth(5).press('Tab');
  await pace(page, 250);

  await page.getByRole('textbox', { name: 'Address line' }).first().fill(workflowData.customer.address1);
  await pace(page, 300);

  await page.locator('div').filter({ hasText: /^Select state$/ }).first().click();
  await pace(page, 500);
  await page.locator('div').filter({ hasText: new RegExp(`^${workflowData.customer.state}$`) }).click();
  await pace(page, 600);

  await page.locator('div').filter({ hasText: /^Select city$/ }).click();
  await pace(page, 500);
  await page.locator('div').filter({ hasText: new RegExp(`^${workflowData.customer.city}$`) }).click();
  await pace(page, 400);

  const pincodeInput = page.getByRole('textbox', { name: 'Enter a valid 6-digit Indian' }).first();
  await pincodeInput.fill(workflowData.customer.pincode);
  await pace(page, 300);

  await page.getByText('Same as Address').click();
  await page.getByRole('checkbox', { name: 'Same as Address' }).check();
  await pace(page, 300);

  await page.getByRole('button', { name: 'Create Customer' }).click();
  await pace(page, 1200);

  // 6. Update Quotation (Dispatch Date, Transport, Charges)
  await page.locator('input[type="date"]').nth(4).fill(dispatchDate);
  await pace(page, 300);

  await page.getByRole('combobox').filter({ hasText: 'Search transport vendors...' }).click();
  await pace(page, 400);
  await page.getByRole('listbox', { name: 'Suggestions' }).click();
  await pace(page, 400);

  await page.getByRole('button', { name: 'Add charge' }).click();
  await pace(page, 400);
  await page.locator('.h-9.w-full.rounded-lg.border.border-border\\/80').first().selectOption(workflowData.quotation.chargeOption);
  await pace(page, 300);

  await page.getByRole('spinbutton').nth(4).fill(workflowData.quotation.chargeQty);
  await page.getByRole('spinbutton').nth(4).press('Tab');
  await pace(page, 250);

  await page.getByRole('spinbutton').nth(5).fill(workflowData.quotation.chargeAmount);
  await pace(page, 300);

  await page.getByRole('button', { name: 'Update Quotation' }).click();
  await pace(page, 1200);

  // 7. Approve Quotation & Convert to Order
  await page.getByRole('button', { name: 'View' }).first().click();
  await pace(page, 600);
  await page.getByRole('button', { name: 'Approve' }).click();
  await pace(page, 400);
  await page.locator('button').filter({ hasText: /^Approve$/ }).click();
  await pace(page, 1000);

  await page.getByRole('button', { name: 'View' }).first().click();
  await pace(page, 600);
  await page.getByRole('button', { name: 'To Order' }).click();
  await pace(page, 400);
  await page.getByRole('button', { name: 'Convert' }).click();
  await pace(page, 1200);

  // 8. Approve Order & Save Routes
  await page.getByRole('link', { name: 'Orders' }).click();
  await pace(page, 1000);
  await page.getByRole('button', { name: 'View' }).first().click();
  await pace(page, 600);
  await page.getByRole('button', { name: 'Approve' }).click();
  await pace(page, 400);
  await page.getByRole('button', { name: 'Approve' }).click();
  await pace(page, 800);

  await page.locator('span').filter({ hasText: 'Finish -> Job Work -> QC->' }).click();
  await pace(page, 400);
  await page.getByText(workflowData.routeText).nth(2).click();
  await pace(page, 400);
  await page.getByRole('button', { name: 'Save Routes' }).click();
  await pace(page, 1000);

  // 9. Approve Execution Plan
  await page.getByRole('link', { name: 'Execution Plans' }).click();
  await pace(page, 1000);
  await page.getByRole('button', { name: 'View' }).first().click();
  await pace(page, 600);
  await page.getByRole('button', { name: 'Approve Planning' }).click();
  await pace(page, 800);

  await page
    .locator('.relative.z-10.w-full.overflow-hidden.flex.flex-col.rounded-xl.border.border-border.bg-card.shadow-lg.max-w-8xl > .flex.items-start.justify-between.gap-4 > .flex')
    .click();
  await pace(page, 500);
});