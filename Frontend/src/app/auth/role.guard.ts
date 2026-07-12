import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const ROLE_HOME: Record<string, string> = {
  VENUE_OWNER: '/venues',
  ADMIN: '/admin',
  USER: '/',
};

function getCurrentUserRole(): string | null {
  const raw = localStorage.getItem('current-user');
  if (!raw) return null;

  try {
    const user = JSON.parse(raw);
    return user?.role ?? null;
  } catch {
    return null;
  }
}

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const userRole = getCurrentUserRole();

  if (!userRole) {
    if (allowedRoles.includes('GUEST')) {
      return true;
    }
    router.navigate(['/'], { queryParams: { login: true, returnUrl: state.url } });
    return false;
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirect to THIS role's home, not a hardcoded '/' — avoids looping
  // when the blocked route IS '/'.
  const home = ROLE_HOME[userRole] ?? '/';
  if (state.url !== home) {
    router.navigate([home]);
  }
  return false;
};