import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from './authservice';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authservice);
  const router = inject(Router);

  if (authService.loggedIn()) {
    return true;
  }

  router.navigate(['/'], { queryParams: { login: true, returnUrl: state.url } });
  return false;
};
