import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models/user.model';

describe('App Routes Integration', () => {
  let router: Router;
  let isAuthenticatedSignal: ReturnType<typeof signal<boolean>>;
  let currentUserSignal: ReturnType<typeof signal<User | null>>;

  const mockUser: User = {
    id: 'user-routes-1',
    name: 'Teste Rotas',
    email: 'teste@alunos.utfpr.edu.br',
    gender: 'female',
    created_at: new Date().toISOString(),
  };

  const setupTestingModule = (isAuth: boolean) => {
    isAuthenticatedSignal = signal<boolean>(isAuth);
    currentUserSignal = signal<User | null>(isAuth ? mockUser : null);

    const authServiceMock = {
      isAuthenticated: () => isAuthenticatedSignal(),
      currentUser: () => currentUserSignal(),
      logout: () => {
        isAuthenticatedSignal.set(false);
        currentUserSignal.set(null);
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    router = TestBed.inject(Router);
  };

  describe('Navegação como Visitante (Não Autenticado)', () => {
    beforeEach(() => {
      setupTestingModule(false);
    });

    it('deve redirecionar /home para /login?returnUrl=/home via authGuard (CA7)', async () => {
      await router.navigateByUrl('/home');
      expect(router.url).toBe('/login?returnUrl=%2Fhome');
    });

    it('deve permitir acesso à rota pública /login para visitantes', async () => {
      await router.navigateByUrl('/login');
      expect(router.url).toBe('/login');
    });

    it('deve permitir acesso à rota pública /register para visitantes', async () => {
      await router.navigateByUrl('/register');
      expect(router.url).toBe('/register');
    });

    it('deve redirecionar rota raiz para /home e em seguida para /login com returnUrl', async () => {
      await router.navigateByUrl('');
      expect(router.url).toBe('/login?returnUrl=%2Fhome');
    });
  });

  describe('Navegação como Usuário Autenticado', () => {
    beforeEach(() => {
      setupTestingModule(true);
    });

    it('deve permitir acesso à rota protegida /home (CA1, CA2)', async () => {
      await router.navigateByUrl('/home');
      expect(router.url).toBe('/home');
    });

    it('deve redirecionar /login para /home via guestGuard (CA8)', async () => {
      await router.navigateByUrl('/login');
      expect(router.url).toBe('/home');
    });

    it('deve redirecionar /register para /home via guestGuard (CA8)', async () => {
      await router.navigateByUrl('/register');
      expect(router.url).toBe('/home');
    });

    it('deve redirecionar rota desconhecida (wildcard) para /home', async () => {
      await router.navigateByUrl('/rota-inexistente');
      expect(router.url).toBe('/home');
    });
  });
});
