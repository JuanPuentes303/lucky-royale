import { expect, test } from '@playwright/test';

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/games/dice',
  '/games/roulette',
  '/games/slots',
  '/games/blackjack',
  '/games/poker',
  '/games/baccarat',
];

test.describe('Lucky Royale - Acceso y autenticación', () => {
  test('la página principal redirige al inicio de sesión', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/auth\/login$/);

    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
  });

  test('permite acceder al registro sin iniciar sesión', async ({ page }) => {
    await page.goto('/auth/register');

    await expect(page).toHaveURL(/\/auth\/register$/);

    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
  });

  for (const route of protectedRoutes) {
    test(`protege la ruta ${route} sin autenticación`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/auth\/login$/);

      await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    });
  }

  test('permite navegar desde login hasta registro', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByRole('link', { name: 'Crear cuenta' }).click();

    await expect(page).toHaveURL(/\/auth\/register$/);

    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
  });
});

test.describe('Lucky Royale - Consentimiento legal', () => {
  test('exige aceptar ambos documentos para continuar', async ({ page }) => {
    await page.goto('/auth/register');

    await page.locator('ion-input[formcontrolname="name"] input').fill('Usuario Demo');

    await page.locator('ion-input[formcontrolname="email"] input').fill('demo@luckyroyale.test');

    await page.locator('ion-input[formcontrolname="password"] input').fill('Demo12345');

    await page.locator('ion-input[formcontrolname="confirmPassword"] input').fill('Demo12345');

    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page.getByText('Documentos legales')).toBeVisible();

    const checkboxes = page.locator('ion-checkbox');

    const acceptButton = page.getByRole('button', {
      name: 'Aceptar y continuar',
    });

    await expect(acceptButton).toBeDisabled();

    await checkboxes.nth(0).click();

    await expect(acceptButton).toBeDisabled();

    await checkboxes.nth(1).click();

    await expect(acceptButton).toBeEnabled();

    await acceptButton.click();

    await expect(page).toHaveURL(/\/dashboard$/);

    const data = await page.evaluate(() => {
      const users = JSON.parse(localStorage.getItem('lucky-royale.users') ?? '[]');

      const userId = users[0]?.id;

      return {
        users,
        consent: userId ? JSON.parse(localStorage.getItem(`lucky-royale.legal-consent.${userId}`) ?? 'null') : null,
      };
    });

    expect(data.users).toHaveLength(1);

    expect(data.consent).toMatchObject({
      termsVersion: '1.0',
      privacyVersion: '1.0',
    });

    expect(data.consent.termsAcceptedAt).toBeTruthy();
    expect(data.consent.dataProcessingAuthorizedAt).toBeTruthy();
  });

  test('no crea una cuenta si el usuario cancela', async ({ page }) => {
    await page.goto('/auth/register');

    await page.locator('ion-input[formcontrolname="name"] input').fill('Usuario Demo');

    await page.locator('ion-input[formcontrolname="email"] input').fill('cancelado@luckyroyale.test');

    await page.locator('ion-input[formcontrolname="password"] input').fill('Demo12345');

    await page.locator('ion-input[formcontrolname="confirmPassword"] input').fill('Demo12345');

    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page.getByText('Documentos legales')).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();

    const users = await page.evaluate(() => localStorage.getItem('lucky-royale.users'));

    expect(users).toBeNull();
  });
});
