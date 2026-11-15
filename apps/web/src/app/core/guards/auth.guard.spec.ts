import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard, guestGuard } from './auth.guard';

describe('Auth Guards', () => {
  let router: Router;
  let authService: { isAuthenticated: () => boolean };

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const createMockState = (url: string): RouterStateSnapshot => ({ url } as RouterStateSnapshot);

  const setupTestingModule = (isAuthenticated: boolean) => {
    authService = {
      isAuthenticated: () => isAuthenticated,
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    });

    router = TestBed.inject(Router);
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('authGuard', () => {
    it('deve permitir acesso (retornar true) quando usuário estiver autenticado', () => {
      setupTestingModule(true);

      const result = TestBed.runInInjectionContext(() =>
        authGuard(dummyRoute, createMockState('/home'))
      );

      expect(result).toBe(true);
    });

    it('deve bloquear acesso e redirecionar para /login com returnUrl quando visitante não autenticado (CA7)', () => {
      setupTestingModule(false);

      const result = TestBed.runInInjectionContext(() =>
        authGuard(dummyRoute, createMockState('/home'))
      );

      expect(result instanceof UrlTree).toBe(true);
      const urlTree = result as UrlTree;
      const serialized = router.serializeUrl(urlTree);
      expect(serialized).toBe('/login?returnUrl=%2Fhome');
    });

    it('deve preservar parâmetros de rota protegida original em returnUrl (CA7)', () => {
      setupTestingModule(false);

      const result = TestBed.runInInjectionContext(() =>
        authGuard(dummyRoute, createMockState('/rides/123'))
      );

      expect(result instanceof UrlTree).toBe(true);
      const urlTree = result as UrlTree;
      const serialized = router.serializeUrl(urlTree);
      expect(serialized).toBe('/login?returnUrl=%2Frides%2F123');
    });
  });

  describe('guestGuard', () => {
    it('deve permitir acesso (retornar true) para visitantes não autenticados', () => {
      setupTestingModule(false);

      const result = TestBed.runInInjectionContext(() =>
        guestGuard(dummyRoute, createMockState('/login'))
      );

      expect(result).toBe(true);
    });

    it('deve bloquear acesso e redirecionar para /home quando usuário já estiver autenticado (CA8)', () => {
      setupTestingModule(true);

      const result = TestBed.runInInjectionContext(() =>
        guestGuard(dummyRoute, createMockState('/login'))
      );

      expect(result instanceof UrlTree).toBe(true);
      const urlTree = result as UrlTree;
      const serialized = router.serializeUrl(urlTree);
      expect(serialized).toBe('/home');
    });
  });
});
