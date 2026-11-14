
import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.page')
        .then(m => m.LoginPage),
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register/register.page')
        .then(m => m.RegisterPage),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard.page')
        .then(m => m.DashboardPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/pages/profile.page')
        .then(m => m.ProfilePage),
  },
  {
  path: 'games/dice',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/games/dice/dice.page')
      .then(m => m.DicePage),
  },
  {
  path: 'games/roulette',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/games/roulette/roulette.page')
      .then(m => m.RoulettePage),
  },  
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
