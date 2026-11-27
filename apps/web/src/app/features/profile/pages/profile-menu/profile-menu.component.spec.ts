import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { appConfig } from '../../../../app.config';
import { User } from '../../../../core/models/user.model';
import { SavedRoute } from '../../../../core/models/saved-route.model';
import { AuthService } from '../../../../core/services/auth.service';
import { SavedRouteService } from '../../../../core/services/saved-route.service';
import { ViaCepService } from '../../../../core/services/viacep.service';
import { ProfileMenuComponent } from './profile-menu.component';
import { ProfileLayoutComponent } from '../profile-layout/profile-layout.component';
import { SavedRoutesComponent } from '../../../saved-routes/pages/saved-routes/saved-routes.component';

describe('ProfileMenuComponent', () => {
  const loggedInUser: User = {
    id: 'user-1',
    name: 'Maria da Silva',
    email: 'maria@utfpr.edu.br',
    gender: 'female',
    avatar_url: 'https://example.test/avatar.png',
    created_at: '2026-01-01',
  };
  let fixture: ComponentFixture<ProfileMenuComponent>;
  let currentUser: ReturnType<typeof signal<User | null>>;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    currentUser = signal<User | null>(loggedInUser);

    await TestBed.configureTestingModule({
      imports: [ProfileMenuComponent],
      providers: [
        ...appConfig.providers,
        {
          provide: AuthService,
          useValue: { currentUser, isAuthenticated: signal(true), logout: vi.fn() },
        },
        {
          provide: SavedRouteService,
          useValue: {
            getSavedRoutes: vi.fn().mockResolvedValue([{
              id: 'example-route',
              user_id: 'user-1',
              name: 'Casa — UTFPR',
              origin: 'Casa',
              destination: 'Campus',
              preferred_time: '08:00',
              days_of_week: ['monday'],
              women_only: false,
              created_at: '2026-01-01',
            } satisfies SavedRoute]),
            createSavedRoute: vi.fn(),
            updateSavedRoute: vi.fn(),
            deleteSavedRoute: vi.fn(),
          },
        },
        {
          provide: ViaCepService,
          useValue: { getAddressByCep: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileMenuComponent);
    fixture.detectChanges();
  });

  it('mostra cabeçalho roxo, sino, logo, avatar e nome da sessão sem inventar curso', () => {
    const header = fixture.nativeElement.querySelector(
      '[data-testid="profile-header"]',
    ) as HTMLElement;
    const avatar = fixture.nativeElement.querySelector(
      '[data-testid="profile-avatar"]',
    ) as HTMLImageElement;
    const logo = fixture.nativeElement.querySelector(
      '[data-testid="profile-logo"]',
    ) as HTMLImageElement;

    expect(header.classList.contains('bg-primaria')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Maria da Silva');
    expect(fixture.nativeElement.querySelector('[aria-label="Notificações"]'))
      .toBeTruthy();
    expect(avatar.src).toContain('/avatar.png');
    expect(logo.getAttribute('src')).toBe('/assets/logo.png');
    expect(fixture.nativeElement.textContent).not.toContain('Curso:');
  });

  it('oferece fallback acessível de avatar quando não há imagem na sessão', () => {
    currentUser.set({ ...loggedInUser, avatar_url: undefined });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="profile-avatar"]'))
      .toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Avatar de Maria da Silva"]'))
      .toBeTruthy();
  });

  it('usa o token semântico desabilitado nas bordas do menu e da navegação inferior', () => {
    const menuList = fixture.nativeElement.querySelector(
      '[aria-label="Menu do perfil"] ul',
    ) as HTMLElement;
    const bottomNavigation = fixture.nativeElement.querySelector(
      '[aria-label="Navegação principal"]',
    ) as HTMLElement;

    expect(menuList.classList.contains('divide-desabilitado')).toBe(true);
    expect(bottomNavigation.classList.contains('border-desabilitado')).toBe(true);
  });

  it('navega pelo item Rotas Salvas até /profile/saved-routes', async () => {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/profile', ProfileLayoutComponent);
    const routeLink = harness.routeNativeElement?.querySelector(
      '[data-testid="saved-routes-link"]',
    ) as HTMLAnchorElement;
    expect(routeLink).toBeTruthy();
    routeLink.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/profile/saved-routes');
  });

  it('configura as páginas de perfil como rotas filhas e habilita binding de inputs do router', async () => {
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      '/profile/saved-routes/example-route/edit',
      ProfileLayoutComponent,
    );
    await harness.fixture.whenStable();

    const router = TestBed.inject(Router);
    const savedRoutes = harness.fixture.debugElement.query(
      By.directive(SavedRoutesComponent),
    ).componentInstance as SavedRoutesComponent;
    expect(router.url).toBe('/profile/saved-routes/example-route/edit');
    expect(router.config.some((route) =>
      route.path === 'profile' && route.children?.some(
        (child) => child.path === 'saved-routes/:id/edit',
      ),
    )).toBe(true);
    expect(savedRoutes.id()).toBe('example-route');
    expect(savedRoutes.savedRouteForm.controls.name.value).toBe('Casa — UTFPR');
  });
});
