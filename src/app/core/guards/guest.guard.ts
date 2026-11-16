import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
