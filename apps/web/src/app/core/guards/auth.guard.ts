import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guarda funcional que protege rotas privadas:
 * Se o usuário não estiver autenticado, bloqueia o acesso e redireciona
 * para /login?returnUrl=<rota-solicitada> (CA7).
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Guarda funcional que protege rotas de visitantes (/login, /register):
 * Se o usuário já estiver autenticado, intercepta a navegação e o redireciona
 * para /home (CA8).
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
