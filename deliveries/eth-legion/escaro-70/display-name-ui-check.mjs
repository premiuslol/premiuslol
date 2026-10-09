import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

// This runs against the local, source-pinned upstream preview only. It never
// authenticates GitHub, uses real payout addresses, or touches external UI.
const base = process.argv[2] ?? 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const key = 'parallax-preview-v1';
const alert = () => page.locator('[role="alert"]').filter({hasText: 'Display name cannot be empty.'});
const getStoredName = () => page.evaluate(k => {
  const raw = localStorage.getItem(k);
  return raw ? JSON.parse(raw)?.session?.contributor : null;
}, key);
const untilStored = name => page.waitForFunction(({ key, name }) => {
  const raw = localStorage.getItem(key);
  return !!raw && JSON.parse(raw)?.session?.contributor === name;
}, { key, name });

try {
  // Real contributor login flow, only inside the temporary localhost preview.
  await page.goto(base + '/login');
  const login = page.getByLabel('Display name');
  await login.waitFor();
  await login.fill('Original Contributor');
  await page.getByRole('button', { name: 'Continue' }).click();
  await untilStored('Original Contributor');

  await page.goto(base + '/me/settings');
  const name = page.getByLabel('Display name');
  const save = page.getByRole('button', { name: 'Save', exact: true });
  await name.waitFor();
  assert.equal(await name.inputValue(), 'Original Contributor');

  // Empty fails visibly and does not change the profile.
  await name.fill('');
  await save.click();
  await alert().waitFor({ state: 'visible' });
  assert.equal(await name.getAttribute('aria-invalid'), 'true');
  assert.equal(await getStoredName(), 'Original Contributor');

  // Whitespace-only must be rejected too.
  await name.fill('  \t  ');
  await save.click();
  await alert().waitFor({ state: 'visible' });
  assert.equal(await getStoredName(), 'Original Contributor');

  // Correcting the field clears the alert and accessible invalid state.
  await name.fill('  Updated Contributor  ');
  await alert().waitFor({ state: 'hidden' });
  assert.equal(await name.getAttribute('aria-invalid'), 'false');
  await save.click();
  await page.getByRole('status').getByText('Profile saved.').waitFor({ state: 'visible' });
  await untilStored('Updated Contributor');

  // The saved name survives an actual browser reload.
  await page.reload();
  await name.waitFor();
  assert.equal(await name.inputValue(), 'Updated Contributor');
  assert.equal(await getStoredName(), 'Updated Contributor');
  console.log('ESCARO_70_BROWSER_UI_ACCEPTANCE_PASS: blank refusal, whitespace refusal, visible alert, no profile mutation, valid save/toast, persistence');
} finally {
  await browser.close();
}
