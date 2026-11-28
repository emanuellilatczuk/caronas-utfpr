import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  ComponentFixture,
  DeferBlockBehavior,
  DeferBlockState,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SavedRoutesComponent } from './saved-routes.component';
import { CepSearchInputComponent } from '../../components/cep-search-input/cep-search-input.component';
import { AuthService } from '../../../../core/services/auth.service';
import { RideService } from '../../../../core/services/ride.service';
import { SavedRouteService } from '../../../../core/services/saved-route.service';
import { ViaCepService } from '../../../../core/services/viacep.service';
import { User } from '../../../../core/models/user.model';
import { SavedRoute } from '../../../../core/models/saved-route.model';
import { Ride, RideReview, RideVehicle } from '../../../../core/models/ride.model';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('SavedRoutesComponent', () => {
  let fixture: ComponentFixture<SavedRoutesComponent>;
  let currentUser: ReturnType<typeof signal<User | null>>;
  let createSavedRoute: ReturnType<typeof vi.fn>;
  let updateSavedRoute: ReturnType<typeof vi.fn>;
  let deleteSavedRoute: ReturnType<typeof vi.fn>;
  let getSavedRoutes: ReturnType<typeof vi.fn>;
  let getMatchingRides: ReturnType<typeof vi.fn>;

  const female: User = {
    id: 'user-1',
    name: 'Maria',
    email: 'maria@utfpr.edu.br',
    gender: 'female',
    created_at: '2026-01-01',
  };

  beforeEach(async () => {
    currentUser = signal<User | null>(female);
    createSavedRoute = vi.fn().mockResolvedValue({
      id: 'route-1',
      user_id: 'user-1',
      name: 'Casa UTFPR',
      origin: 'Rua A',
      destination: 'UTFPR',
      preferred_time: '08:00',
      days_of_week: ['monday'],
      women_only: false,
      created_at: '2026-01-01',
    } satisfies SavedRoute);
    updateSavedRoute = vi.fn().mockResolvedValue({} as SavedRoute);
    getSavedRoutes = vi.fn().mockResolvedValue([]);
    deleteSavedRoute = vi.fn().mockResolvedValue(undefined);
    getMatchingRides = vi.fn().mockResolvedValue([]);

    await TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [SavedRoutesComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { currentUser, isAuthenticated: signal(true) },
        },
        {
          provide: SavedRouteService,
          useValue: {
            createSavedRoute,
            updateSavedRoute,
            deleteSavedRoute,
            getSavedRoutes,
            getMatchingRides,
          },
        },
        {
          provide: ViaCepService,
          useValue: {
            getAddressByCep: (): Observable<{ address: string }> =>
              of({ address: 'Rua das Flores, Centro - Curitiba' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedRoutesComponent);
    fixture.detectChanges();
  });

  it('valida campos obrigatórios, trim e desabilita o envio', () => {
    const form = fixture.componentInstance.savedRouteForm;
    expect(form.invalid).toBe(true);
    form.controls.name.setValue('   ');
    form.controls.origin.setValue(' ');
    form.controls.destination.setValue('');
    form.controls.preferredTime.setValue('');
    fixture.detectChanges();

    expect(form.controls.name.hasError('required')).toBe(true);
    expect(form.controls.origin.hasError('required')).toBe(true);
    expect(form.controls.destination.hasError('required')).toBe(true);
    expect(form.controls.days.hasError('required')).toBe(true);
    expect(form.controls.preferredTime.hasError('required')).toBe(true);

    const button = fixture.debugElement.query(By.css('[data-testid="save-saved-route"]'))
      .nativeElement as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('exibe o modo Elas por Elas apenas para gênero feminino', () => {
    expect(fixture.debugElement.query(By.css('[data-testid="women-only"]'))).toBeTruthy();

    currentUser.set({
      ...female,
      id: 'user-2',
      gender: 'male',
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-testid="women-only"]'))).toBeNull();

    currentUser.set({
      ...female,
      id: 'user-3',
      gender: 'other',
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-testid="women-only"]'))).toBeNull();
  });

  it('aplica o endereço emitido pela busca real de CEP em Origem e Destino e mantém os campos editáveis', () => {
    for (const field of ['origin', 'destination'] as const) {
      const searchTestId = field === 'origin' ? 'origin-cep-search' : 'destination-cep-search';
      const cepSearch = fixture.debugElement.query(By.css(`[data-testid="${searchTestId}"]`));
      const cepComponent = cepSearch.query(By.directive(CepSearchInputComponent));
      const cepInput = cepComponent.query(By.css('input')).nativeElement as HTMLInputElement;

      cepInput.value = '80000000';
      cepInput.dispatchEvent(new Event('input'));
      cepComponent.query(By.css('button')).nativeElement.click();
      fixture.detectChanges();

      const addressInput = fixture.debugElement.query(By.css(`[data-testid="${field}"]`))
        .nativeElement as HTMLInputElement;
      expect(addressInput.value).toBe('Rua das Flores, Centro - Curitiba');
      expect(addressInput.readOnly).toBe(false);

      addressInput.value = 'Endereço complementado manualmente';
      addressInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.componentInstance.savedRouteForm.controls[field].value).toBe(
        'Endereço complementado manualmente',
      );
    }
  });

  it('preenche origem, destino e horário via query params reativos', () => {
    fixture.componentRef.setInput('origin', 'Praça Central');
    fixture.componentRef.setInput('destination', 'UTFPR');
    fixture.componentRef.setInput('time', '07:30');
    fixture.detectChanges();

    expect(fixture.componentInstance.savedRouteForm.controls.origin.value).toBe('Praça Central');
    expect(fixture.componentInstance.savedRouteForm.controls.destination.value).toBe('UTFPR');
    expect(fixture.componentInstance.savedRouteForm.controls.preferredTime.value).toBe('07:30');
  });

  it('carrega uma rota para edição via id reativo', async () => {
    getSavedRoutes.mockResolvedValue([{
      id: 'route-9',
      user_id: 'user-1',
      name: 'Rota antiga',
      origin: 'Casa',
      destination: 'Campus',
      preferred_time: '06:45',
      days_of_week: ['monday', 'friday'],
      women_only: true,
      created_at: '2026-01-01',
    } satisfies SavedRoute]);

    fixture.componentRef.setInput('id', 'route-9');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.savedRouteForm.controls.name.value).toBe('Rota antiga');
    expect(fixture.componentInstance.selectedDays()).toEqual(['monday', 'friday']);
  });

  it('ignora a resposta de uma rota anterior quando a rota atual termina de carregar primeiro', async () => {
    const routeAResponse = deferred<SavedRoute[]>();
    const routeBResponse = deferred<SavedRoute[]>();
    getSavedRoutes
      .mockReturnValueOnce(routeAResponse.promise)
      .mockReturnValueOnce(routeBResponse.promise);

    fixture.componentRef.setInput('id', 'route-a');
    fixture.detectChanges();
    fixture.componentRef.setInput('id', 'route-b');
    fixture.detectChanges();

    routeBResponse.resolve([{
      id: 'route-b',
      user_id: 'user-1',
      name: 'Rota B',
      origin: 'Origem B',
      destination: 'Destino B',
      preferred_time: '09:00',
      days_of_week: ['tuesday'],
      women_only: false,
      created_at: '2026-01-01',
    }]);
    await routeBResponse.promise;
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.savedRouteForm.controls.name.value).toBe('Rota B');

    routeAResponse.resolve([{
      id: 'route-a',
      user_id: 'user-1',
      name: 'Rota A',
      origin: 'Origem A',
      destination: 'Destino A',
      preferred_time: '08:00',
      days_of_week: ['monday'],
      women_only: false,
      created_at: '2026-01-01',
    }]);
    await routeAResponse.promise;
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.componentInstance.savedRouteForm.controls.name.value).toBe('Rota B');
    expect(fixture.componentInstance.savedRouteForm.controls.origin.value).toBe('Origem B');
    await fixture.componentInstance.onSubmit();
    expect(updateSavedRoute).toHaveBeenCalledWith(
      'route-b',
      expect.objectContaining({
        name: 'Rota B',
        origin: 'Origem B',
        destination: 'Destino B',
      }),
    );
  });

  it('impede salvar dados ainda visíveis da rota anterior sob o novo id enquanto carrega', async () => {
    fixture.componentInstance.savedRouteForm.patchValue({
      name: 'Dados da rota A',
      origin: 'Origem A',
      destination: 'Destino A',
      preferredTime: '08:00',
    });
    fixture.componentInstance.selectedDays.set(['monday']);
    fixture.componentInstance.syncDaysToForm();

    const routeBResponse = deferred<SavedRoute[]>();
    getSavedRoutes.mockReturnValueOnce(routeBResponse.promise);
    fixture.componentRef.setInput('id', 'route-b');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('[data-testid="save-saved-route"]'))
      .nativeElement as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    await fixture.componentInstance.onSubmit();
    expect(updateSavedRoute).not.toHaveBeenCalled();

    routeBResponse.resolve([]);
    await routeBResponse.promise;
    await Promise.resolve();
  });

  it('expõe erros associados aos campos somente após interação ou envio inválido', async () => {
    const pristineName = fixture.debugElement.query(By.css('[data-testid="name"]'))
      .nativeElement as HTMLInputElement;
    expect(pristineName.getAttribute('aria-invalid')).toBe('false');

    await fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    for (const [field, errorTestId] of [
      ['name', 'error-name'],
      ['origin', 'error-origin'],
      ['destination', 'error-destination'],
      ['preferred-time', 'error-preferred-time'],
    ]) {
      const input = fixture.debugElement.query(By.css(`[data-testid="${field}"]`))
        .nativeElement as HTMLInputElement;
      const error = fixture.debugElement.query(By.css(`[data-testid="${errorTestId}"]`))
        .nativeElement as HTMLElement;

      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe(error.id);
      expect(error.id).not.toBe('');
    }

    const daysGroup = fixture.debugElement.query(By.css('[role="group"]'))
      .nativeElement as HTMLElement;
    const daysError = fixture.debugElement.query(By.css('[data-testid="error-days"]'))
      .nativeElement as HTMLElement;
    expect(daysGroup.getAttribute('aria-invalid')).toBe('true');
    expect(daysGroup.getAttribute('aria-describedby')).toBe(daysError.id);
  });

  it('mostra spinner acessível sem texto de carregamento e desativa hover durante o salvamento', async () => {
    fixture.componentInstance.savedRouteForm.patchValue({
      name: 'Casa UTFPR',
      origin: 'Rua A',
      destination: 'UTFPR',
      preferredTime: '08:00',
    });
    fixture.componentInstance.selectedDays.set(['monday']);
    fixture.componentInstance.syncDaysToForm();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('[data-testid="save-saved-route"]'))
      .nativeElement as HTMLButtonElement;
    expect(button.classList.contains('hover:bg-primaria-hover')).toBe(true);

    const pendingSave = deferred<SavedRoute>();
    createSavedRoute.mockReturnValueOnce(pendingSave.promise);
    const submit = fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('[data-testid="saving-spinner"]'))
      .nativeElement as HTMLElement;
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('hover:bg-primaria-hover')).toBe(false);
    expect(spinner.classList.contains('block')).toBe(true);
    expect(spinner.classList.contains('animate-spin')).toBe(true);
    expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.getAttribute('aria-label')).toBeTruthy();
    expect(button.textContent).not.toContain('Salvando...');

    pendingSave.resolve({} as SavedRoute);
    await submit;
  });

  it('não mantém o alias routeForm', () => {
    expect('routeForm' in fixture.componentInstance).toBe(false);
  });

  it('permite selecionar dias e envia uma rota válida', async () => {
    fixture.componentInstance.savedRouteForm.patchValue({
      name: 'Casa UTFPR',
      origin: 'Rua A',
      destination: 'UTFPR',
      preferredTime: '08:00',
      womenOnly: false,
    });
    fixture.componentInstance.selectedDays.set(['monday']);
    fixture.componentInstance.syncDaysToForm();
    fixture.detectChanges();

    expect(fixture.componentInstance.savedRouteForm.valid).toBe(true);
    await fixture.componentInstance.onSubmit();

    expect(createSavedRoute).toHaveBeenCalledWith({
      name: 'Casa UTFPR',
      origin: 'Rua A',
      destination: 'UTFPR',
      preferred_time: '08:00',
      days_of_week: ['monday'],
      women_only: false,
    });
  });

  it('lista apenas as rotas retornadas para a sessão autenticada e renderiza os dados completos', async () => {
    getSavedRoutes.mockResolvedValue([
      {
        id: 'route-owned',
        user_id: 'user-1',
        name: 'Casa — UTFPR',
        origin: 'Rua das Flores',
        destination: 'UTFPR Centro',
        preferred_time: '07:30',
        days_of_week: ['monday', 'wednesday'],
        women_only: true,
        created_at: '2026-01-01',
      } satisfies SavedRoute,
      {
        id: 'route-other-user',
        user_id: 'user-2',
        name: 'Rota privada',
        origin: 'Rua de outra pessoa',
        destination: 'Outro campus',
        preferred_time: '10:00',
        days_of_week: ['friday'],
        women_only: false,
        created_at: '2026-01-01',
      } satisfies SavedRoute,
    ]);

    await fixture.componentInstance.refreshSavedRoutes();
    fixture.detectChanges();

    expect(getSavedRoutes).toHaveBeenCalledTimes(2);
    expect(fixture.debugElement.queryAll(By.css('[data-testid="saved-route-card"]')))
      .toHaveLength(1);
    const card = fixture.debugElement.query(By.css('[data-testid="saved-route-card"]'));
    expect(card.nativeElement.textContent).toContain('Casa — UTFPR');
    expect(card.nativeElement.textContent).toContain('Rua das Flores');
    expect(card.nativeElement.textContent).toContain('UTFPR Centro');
    expect(card.nativeElement.textContent).toContain('07:30');
    expect(card.nativeElement.textContent).toContain('Segunda-feira');
    expect(card.nativeElement.textContent).toContain('Quarta-feira');
    expect(card.nativeElement.textContent).toContain('Modo Elas por Elas');
    expect(card.query(By.css('[data-testid="edit-saved-route"]'))).toBeTruthy();
    expect(card.query(By.css('[data-testid="delete-saved-route"]'))).toBeTruthy();
  });

  it('usa o token semântico desabilitado nas bordas dos cards e da lista de rotas', async () => {
    getSavedRoutes.mockResolvedValue([{
      id: 'route-1',
      user_id: 'user-1',
      name: 'Casa UTFPR',
      origin: 'Rua A',
      destination: 'UTFPR',
      preferred_time: '08:00',
      days_of_week: ['monday'],
      women_only: false,
      created_at: '2026-01-01',
    } satisfies SavedRoute]);
    await fixture.componentInstance.refreshSavedRoutes();
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('[data-testid="saved-route-card"]'));
    const routeDetails = card.query(By.css('.border-t')).nativeElement as HTMLElement;

    expect((card.nativeElement as HTMLElement).classList.contains('border-desabilitado'))
      .toBe(true);
    expect(routeDetails.classList.contains('border-desabilitado')).toBe(true);
  });

  it('mostra um estado vazio que orienta cadastrar a rota no formulário acima', async () => {
    getSavedRoutes.mockResolvedValue([]);
    await fixture.componentInstance.refreshSavedRoutes();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="saved-routes-empty"]')))
      .toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Cadastre sua primeira rota');
    expect(fixture.nativeElement.textContent).toContain('formulário acima');
  });

  it('mantém a rota quando a confirmação de exclusão é cancelada', async () => {
    const savedRoute = {
      id: 'route-1',
      user_id: 'user-1',
      name: 'Casa UTFPR',
      origin: 'Rua A',
      destination: 'UTFPR',
      preferred_time: '08:00',
      days_of_week: ['monday'],
      women_only: false,
      created_at: '2026-01-01',
    } satisfies SavedRoute;
    getSavedRoutes.mockResolvedValue([savedRoute]);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await fixture.componentInstance.refreshSavedRoutes();
    fixture.detectChanges();

    fixture.debugElement.query(By.css('[data-testid="delete-saved-route"]'))
      .nativeElement.click();

    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteSavedRoute).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Casa UTFPR');
    confirmSpy.mockRestore();
  });

  it('exclui após confirmação e atualiza a listagem', async () => {
    const savedRoute = {
      id: 'route-1',
      user_id: 'user-1',
      name: 'Casa UTFPR',
      origin: 'Rua A',
      destination: 'UTFPR',
      preferred_time: '08:00',
      days_of_week: ['monday'],
      women_only: false,
      created_at: '2026-01-01',
    } satisfies SavedRoute;
    getSavedRoutes.mockResolvedValue([savedRoute]);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await fixture.componentInstance.refreshSavedRoutes();
    getSavedRoutes.mockResolvedValueOnce([]);
    fixture.detectChanges();

    fixture.debugElement.query(By.css('[data-testid="delete-saved-route"]'))
      .nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(deleteSavedRoute).toHaveBeenCalledWith('route-1');
    expect(getSavedRoutes).toHaveBeenCalledTimes(3);
    expect(fixture.debugElement.query(By.css('[data-testid="saved-route-card"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="saved-routes-empty"]')))
      .toBeTruthy();
    confirmSpy.mockRestore();
  });

  it('mostra feedback explícito se a exclusão falhar', async () => {
    getSavedRoutes.mockResolvedValue([{
      id: 'route-1',
      user_id: 'user-1',
      name: 'Casa UTFPR',
      origin: 'Rua A',
      destination: 'UTFPR',
      preferred_time: '08:00',
      days_of_week: ['monday'],
      women_only: false,
      created_at: '2026-01-01',
    } satisfies SavedRoute]);
    deleteSavedRoute.mockRejectedValue(new Error('Falha'));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await fixture.componentInstance.refreshSavedRoutes();
    fixture.detectChanges();

    fixture.debugElement.query(By.css('[data-testid="delete-saved-route"]'))
      .nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Não foi possível excluir a rota. Tente novamente.',
    );
    expect(fixture.nativeElement.textContent).toContain('Casa UTFPR');
    confirmSpy.mockRestore();
  });

  it('salva a edição, atualiza os cards e retorna à listagem', async () => {
    const savedRoute: SavedRoute = {
      id: 'route-edit',
      user_id: 'user-1',
      name: 'Casa UTFPR',
      origin: 'Rua A',
      destination: 'UTFPR',
      preferred_time: '08:00',
      days_of_week: ['monday'],
      women_only: false,
      created_at: '2026-01-01',
    };
    const updatedRoute: SavedRoute = {
      ...savedRoute,
      name: 'Casa — Campus',
    };
    getSavedRoutes.mockResolvedValue([savedRoute]);
    fixture.componentRef.setInput('id', 'route-edit');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.savedRouteForm.patchValue({
      name: updatedRoute.name,
      origin: updatedRoute.origin,
      destination: updatedRoute.destination,
      preferredTime: updatedRoute.preferred_time,
    });
    fixture.componentInstance.selectedDays.set(updatedRoute.days_of_week);
    fixture.componentInstance.syncDaysToForm();
    updateSavedRoute.mockResolvedValue(updatedRoute);
    getSavedRoutes.mockResolvedValue([updatedRoute]);
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);

    await fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    expect(updateSavedRoute).toHaveBeenCalledWith(
      'route-edit',
      expect.objectContaining({ name: 'Casa — Campus' }),
    );
    expect(fixture.componentInstance.savedRoutes()[0]?.name).toBe('Casa — Campus');
    expect(navigateSpy).toHaveBeenCalledWith(['/profile/saved-routes']);
  });
});

describe('SavedRoutesComponent — aba Sugestões de Match integrada à camada de serviços', () => {
  let fixture: ComponentFixture<SavedRoutesComponent>;
  let httpTesting: HttpTestingController;
  let currentUser: ReturnType<typeof signal<User | null>>;

  const female: User = {
    id: 'user-1',
    name: 'Maria',
    email: 'maria@utfpr.edu.br',
    gender: 'female',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  const savedRouteRecord: SavedRoute = {
    id: 'route-1',
    user_id: 'user-1',
    name: 'Casa — UTFPR',
    origin: 'Rua das Flores',
    destination: 'UTFPR Centro',
    preferred_time: '08:00',
    days_of_week: ['sunday'],
    women_only: false,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  const normalizedRideRecord: Ride = {
    id: 'ride-match-1',
    driver_id: 'driver-1',
    vehicle_id: 'vehicle-1',
    origin: 'Rua das Flores, 120',
    destination: 'UTFPR Centro',
    departure_time: new Date(2030, 4, 12, 7, 45).toISOString(),
    total_seats: 4,
    available_seats: 3,
    meeting_point: 'Portão principal',
    women_only: false,
    status: 'open',
    created_at: '2030-05-01T10:00:00.000Z',
  };

  const driverUserRecord: User = {
    id: 'driver-1',
    name: 'Ana Souza',
    email: 'ana.souza@alunos.utfpr.edu.br',
    gender: 'female',
    avatar_url: 'https://example.test/ana.jpg',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  const vehicleRecord: RideVehicle = {
    id: 'vehicle-1',
    brand_model: 'Toyota Corolla',
    color: 'Prata',
  };

  const reviewRecords: RideReview[] = [
    {
      id: 'review-1',
      ride_id: 'ride-prev-1',
      reviewer_id: 'passenger-1',
      reviewed_id: 'driver-1',
      rating: 5,
      created_at: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 'review-2',
      ride_id: 'ride-prev-2',
      reviewer_id: 'passenger-2',
      reviewed_id: 'driver-1',
      rating: 4,
      created_at: '2026-02-02T00:00:00.000Z',
    },
  ];

  function flushNormalizedMatchRequests(rides: Ride[] = [normalizedRideRecord]): void {
    httpTesting
      .expectOne(`${environment.apiUrl}/saved_routes?user_id=user-1`)
      .flush([savedRouteRecord]);
    httpTesting.expectOne(`${environment.apiUrl}/rides`).flush(rides);
    httpTesting.expectOne(`${environment.apiUrl}/users`).flush([driverUserRecord]);
    httpTesting.expectOne(`${environment.apiUrl}/vehicles`).flush([vehicleRecord]);
    httpTesting.expectOne(`${environment.apiUrl}/reviews`).flush(reviewRecords);
  }

  beforeEach(async () => {
    currentUser = signal<User | null>(female);

    await TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [SavedRoutesComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        SavedRouteService,
        RideService,
        {
          provide: AuthService,
          useValue: { currentUser, isAuthenticated: signal(true) },
        },
        {
          provide: ViaCepService,
          useValue: {
            getAddressByCep: (): Observable<{ address: string }> =>
              of({ address: 'Rua das Flores, Centro - Curitiba' }),
          },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SavedRoutesComponent);
    fixture.detectChanges();
    httpTesting
      .expectOne(`${environment.apiUrl}/saved_routes?user_id=user-1`)
      .flush([savedRouteRecord]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('alterna entre as abas "Minhas Rotas" e "Sugestões de Match" com atributos ARIA', async () => {
    const routesTab = fixture.debugElement.query(By.css('[data-testid="tab-saved-routes"]'))
      .nativeElement as HTMLButtonElement;
    const matchesTab = fixture.debugElement.query(By.css('[data-testid="tab-match-suggestions"]'))
      .nativeElement as HTMLButtonElement;

    expect(routesTab.textContent).toContain('Minhas Rotas');
    expect(matchesTab.textContent).toContain('Sugestões de Match');
    expect(routesTab.getAttribute('aria-selected')).toBe('true');
    expect(matchesTab.getAttribute('aria-selected')).toBe('false');
    expect(fixture.debugElement.query(By.css('[data-testid="panel-saved-routes"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-testid="panel-match-suggestions"]'))).toBeNull();
    httpTesting.expectNone(`${environment.apiUrl}/rides`);

    matchesTab.click();
    flushNormalizedMatchRequests();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(routesTab.getAttribute('aria-selected')).toBe('false');
    expect(matchesTab.getAttribute('aria-selected')).toBe('true');
    expect(fixture.debugElement.query(By.css('[data-testid="panel-saved-routes"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="panel-match-suggestions"]'))).toBeTruthy();

    routesTab.click();
    fixture.detectChanges();

    expect(routesTab.getAttribute('aria-selected')).toBe('true');
    expect(matchesTab.getAttribute('aria-selected')).toBe('false');
    expect(fixture.debugElement.query(By.css('[data-testid="panel-saved-routes"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-testid="panel-match-suggestions"]'))).toBeNull();
  });

  it('carrega Sugestões de Match via @defer (on viewport) validando @placeholder, @loading e dados hidratados de motorista, nota média e veículo', async () => {
    fixture.debugElement.query(By.css('[data-testid="tab-match-suggestions"]'))
      .nativeElement.click();
    flushNormalizedMatchRequests();
    await fixture.whenStable();
    fixture.detectChanges();

    const [deferBlock] = await fixture.getDeferBlocks();
    expect(deferBlock).toBeDefined();

    await deferBlock.render(DeferBlockState.Placeholder);
    expect(
      fixture.debugElement.query(By.css('[data-testid="match-suggestions-placeholder"]')),
    ).toBeTruthy();
    expect(
      fixture.debugElement.query(By.css('[data-testid="match-suggestions-defer-loading"]')),
    ).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="match-ride-card"]'))).toBeNull();

    await deferBlock.render(DeferBlockState.Loading);
    const loadingBlock = fixture.debugElement.query(
      By.css('[data-testid="match-suggestions-defer-loading"]'),
    );
    expect(loadingBlock).toBeTruthy();
    expect(loadingBlock.nativeElement.getAttribute('role')).toBe('status');
    expect(loadingBlock.nativeElement.textContent).toContain('Carregando sugestões de carona...');
    expect(
      fixture.debugElement.query(By.css('[data-testid="match-suggestions-placeholder"]')),
    ).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="match-ride-card"]'))).toBeNull();

    await deferBlock.render(DeferBlockState.Complete);
    const card = fixture.debugElement.query(By.css('[data-testid="match-ride-card"]'));
    expect(card).toBeTruthy();
    expect(
      card.query(By.css('[data-testid="ride-driver-photo"]')).nativeElement.getAttribute('src'),
    ).toBe('https://example.test/ana.jpg');
    expect(card.nativeElement.textContent).toContain('Ana Souza');
    expect(card.nativeElement.textContent).toContain('★ 4.5');
    expect(card.nativeElement.textContent).toContain('Toyota Corolla');
    expect(card.nativeElement.textContent).toContain('Prata');
    expect(card.nativeElement.textContent).toContain('07:45');
    expect(card.nativeElement.textContent).toContain('3');
    expect(card.nativeElement.textContent).toContain('vagas restantes');
    expect(card.nativeElement.textContent).toContain('Ver Carona');
    expect(card.nativeElement.textContent).not.toContain('Sem avaliações');
    expect(card.nativeElement.textContent).not.toContain('Veículo indisponível');
  });

  it('exibe estado vazio na aba "Sugestões de Match" quando não há caronas compatíveis', async () => {
    fixture.debugElement.query(By.css('[data-testid="tab-match-suggestions"]'))
      .nativeElement.click();
    flushNormalizedMatchRequests([]);
    await fixture.whenStable();
    fixture.detectChanges();

    const [deferBlock] = await fixture.getDeferBlocks();
    await deferBlock.render(DeferBlockState.Complete);

    expect(fixture.debugElement.query(By.css('[data-testid="match-suggestions-empty"]'))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma carona compatível no momento');
    expect(fixture.debugElement.query(By.css('[data-testid="match-ride-card"]'))).toBeNull();
  });

  it('exibe erro inline na aba "Sugestões de Match" quando a busca de sugestões falha', async () => {
    fixture.debugElement.query(By.css('[data-testid="tab-match-suggestions"]'))
      .nativeElement.click();
    httpTesting
      .expectOne(`${environment.apiUrl}/saved_routes?user_id=user-1`)
      .flush([savedRouteRecord]);
    httpTesting.expectOne(`${environment.apiUrl}/users`).flush([driverUserRecord]);
    httpTesting.expectOne(`${environment.apiUrl}/vehicles`).flush([vehicleRecord]);
    httpTesting.expectOne(`${environment.apiUrl}/reviews`).flush(reviewRecords);
    httpTesting
      .expectOne(`${environment.apiUrl}/rides`)
      .flush('Falha na rede', { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    const [deferBlock] = await fixture.getDeferBlocks();
    await deferBlock.render(DeferBlockState.Complete);

    const errorEl = fixture.debugElement.query(By.css('[data-testid="match-suggestions-error"]'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain(
      'Não foi possível carregar as sugestões de carona. Tente novamente.',
    );
  });

  it('navega para /rides/:id ao clicar em "Ver Carona" na aba "Sugestões de Match"', async () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.debugElement.query(By.css('[data-testid="tab-match-suggestions"]'))
      .nativeElement.click();
    flushNormalizedMatchRequests();
    await fixture.whenStable();
    fixture.detectChanges();

    const [deferBlock] = await fixture.getDeferBlocks();
    await deferBlock.render(DeferBlockState.Complete);

    fixture.debugElement.query(By.css('[data-testid="view-ride-btn"]')).nativeElement.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/rides', 'ride-match-1']);
  });
});

describe('SavedRoutesComponent - atalho da Home via query params', () => {
  it('pré-preenche origem, destino e horário nos campos ao navegar com query params', async () => {
    await TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideRouter(
          [{ path: 'profile/saved-routes', component: SavedRoutesComponent }],
          withComponentInputBinding(),
        ),
        {
          provide: AuthService,
          useValue: { currentUser: signal<User | null>(null), isAuthenticated: signal(true) },
        },
        {
          provide: SavedRouteService,
          useValue: {
            createSavedRoute: vi.fn(),
            updateSavedRoute: vi.fn(),
            deleteSavedRoute: vi.fn(),
            getSavedRoutes: vi.fn().mockResolvedValue([]),
            getMatchingRides: vi.fn().mockResolvedValue([]),
          },
        },
        { provide: ViaCepService, useValue: { getAddressByCep: () => of({ address: '' }) } },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      '/profile/saved-routes?origin=UTFPR%20Campus&destination=Centro&time=14:00',
    );
    harness.detectChanges();

    const value = (testId: string): string =>
      (harness.routeDebugElement!.query(By.css(`[data-testid="${testId}"]`))
        .nativeElement as HTMLInputElement).value;
    expect(value('origin')).toBe('UTFPR Campus');
    expect(value('destination')).toBe('Centro');
    expect(value('preferred-time')).toBe('14:00');
  });
});
