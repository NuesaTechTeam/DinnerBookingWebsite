const { test, expect } = require('@playwright/test');

test('admin check-in flow', async ({ page }) => {
  // Login
  await page.goto('https://dinner.nuesaabuad.ng/admin');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'Nuesaispeak123!');
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/admin*', { timeout: 10000 });
  
  // Wait for dashboard to load
  await page.waitForSelector('text=Check-in Station', { timeout: 10000 });
  
  // Use the Check-in Station with 6-digit code
  const codeInput = page.locator('input[placeholder*="6-digit code"]');
  await codeInput.fill('857778');
  await page.click('button:has-text("Find")');
  
  // Wait for booking to be found
  await page.waitForSelector('text=Found booking for', { timeout: 10000 });
  
  // Click the "+" button on first unchecked seat
  const seatButton = page.locator('button:has-text("+")').first();
  await expect(seatButton).toBeVisible();
  await seatButton.click();
  
  // Wait for success toast
  await page.waitForSelector('text=Seat checked in', { timeout: 10000 });
  
  // Verify seat shows as checked in (green badge)
  await expect(page.locator('text=Attended').first()).toBeVisible({ timeout: 5000 });
  
  console.log('✅ Check-in test passed');
});

test('admin check-in all', async ({ page }) => {
  await page.goto('https://dinner.nuesaabuad.ng/admin');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'Nuesaispeak123!');
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/admin*', { timeout: 10000 });
  await page.waitForSelector('text=Check-in Station', { timeout: 10000 });
  
  // Create a fresh booking first (or use existing unchecked)
  const codeInput = page.locator('input[placeholder*="6-digit code"]');
  await codeInput.fill('857778');
  await page.click('button:has-text("Find")');
  await page.waitForSelector('text=Found booking for', { timeout: 10000 });
  
  // Click "Check in all"
  const checkInAllBtn = page.locator('button:has-text("Check in all")');
  await expect(checkInAllBtn).toBeVisible();
  await checkInAllBtn.click();
  
  // Wait for success toast
  await page.waitForSelector('text=All seats checked in', { timeout: 10000 });
  
  // Verify all seats show as checked in
  await expect(page.locator('text=All seats have been checked in')).toBeVisible({ timeout: 5000 });
  
  console.log('✅ Check-in all test passed');
});