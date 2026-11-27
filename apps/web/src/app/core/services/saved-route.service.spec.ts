import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Ride } from '../models/ride.model';
import { SavedRoute } from '../models/saved-route.model';
import { AuthService } from './auth.service';
import { SavedRouteService } from './saved-route.service';

describe('SavedRouteService', () => {
  let service: SavedRouteService;
  let httpTesting: HttpTestingController;
  let authService: AuthService;

  const savedRoute = (overrides: Partial<SavedRoute> = {}): SavedRoute => ({
    id: 'route-1',
    user_id: 'user-1',
    name: 'Casa ao Campus',
    origin: 'São João',
    destination: 'Centro',
    days_of_week: ['monday'],
    preferred_time: '09:00',
    women_only: false,
    created_at: '2099-01-01T00:00:00.000Z',
    ...overrides,
  });

  const ride = (id: string, overrides: Partial<Ride> = {}): Ride => ({
    id,
    driver_id: 'driver-1',
    vehicle_id: 'vehicle-1',
    origin: 'São João - UTFPR',
    destination: 'Centro Histórico',
    departure_time: timestamp('2099-05-11', '10:00'),
    total_seats: 4,
    available_seats: 2,
    meeting_point: 'Campus',
    women_only: false,
    status: 'open',
    created_at: '2099-01-01T00:00:00.000Z',
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SavedRouteService, AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SavedRouteService);
    authService = TestBed.inject(AuthService);
    authService.currentUser.set({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@alunos.utfpr.edu.br',
      gender: 'female',
      created_at: '2099-01-01T00:00:00.000Z',
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('lista somente as rotas do usuário autenticado, inclusive quando não há resultados', async () => {
    const result = service.getSavedRoutes();
    const request = httpTesting.expectOne(
      `${environment.apiUrl}/saved_routes?user_id=user-1`,
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);

    await expect(result).resolves.toEqual([]);
  });

  it('cria uma rota vinculada à sessão e aplica women_only false por padrão', async () => {
    const result = service.createSavedRoute({
      name: 'Casa ao Campus',
      origin: 'São João',
      destination: 'Centro',
      days_of_week: ['monday'],
      preferred_time: '09:00',
    });
    const request = httpTesting.expectOne(`${environment.apiUrl}/saved_routes`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({
      user_id: 'user-1',
      women_only: false,
      name: 'Casa ao Campus',
    });
    request.flush(savedRoute());

    await expect(result).resolves.toEqual(savedRoute());
  });

  it('não persiste uma rota inválida', async () => {
    const result = service.createSavedRoute({
      name: ' ',
      origin: 'São João',
      destination: 'Centro',
      days_of_week: [],
      preferred_time: '09:00',
    });

    await expect(result).rejects.toThrow();
    httpTesting.expectNone(`${environment.apiUrl}/saved_routes`);
  });

  it('aceita os sete dias da semana previstos no contrato', async () => {
    const daysOfWeek = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const result = service.createSavedRoute({
      name: 'Casa ao Campus',
      origin: 'São João',
      destination: 'Centro',
      days_of_week: daysOfWeek,
      preferred_time: '09:00',
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/saved_routes`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.days_of_week).toEqual(daysOfWeek);
    request.flush(savedRoute({ days_of_week: daysOfWeek }));

    await expect(result).resolves.toMatchObject({ days_of_week: daysOfWeek });
  });

  it('rejeita dias da semana inválidos sem persistir a rota', async () => {
    for (const daysOfWeek of [['qualquer'], ['monday', 'qualquer']]) {
      const result = service.createSavedRoute({
        name: 'Casa ao Campus',
        origin: 'São João',
        destination: 'Centro',
        days_of_week: daysOfWeek,
        preferred_time: '09:00',
      });
      const requests = httpTesting.match(`${environment.apiUrl}/saved_routes`);
      requests.forEach((request) => request.flush(savedRoute({ days_of_week: daysOfWeek })));

      expect(requests).toHaveLength(0);
      await expect(result).rejects.toThrow();
    }
  });

  it('localiza e atualiza uma rota pertencente ao usuário autenticado', async () => {
    const result = service.updateSavedRoute('route-1', { name: 'Casa à UTFPR' });
    const listRequest = httpTesting.expectOne(
      `${environment.apiUrl}/saved_routes?user_id=user-1`,
    );
    listRequest.flush([savedRoute()]);
    await Promise.resolve();
    await Promise.resolve();

    const updateRequest = httpTesting.expectOne(`${environment.apiUrl}/saved_routes/route-1`);
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toEqual({ name: 'Casa à UTFPR' });
    updateRequest.flush(savedRoute({ name: 'Casa à UTFPR' }));

    await expect(result).resolves.toMatchObject({ name: 'Casa à UTFPR' });
  });

  it('exclui uma rota pertencente ao usuário autenticado', async () => {
    const result = service.deleteSavedRoute('route-1');
    const listRequest = httpTesting.expectOne(
      `${environment.apiUrl}/saved_routes?user_id=user-1`,
    );
    listRequest.flush([savedRoute()]);
    await Promise.resolve();
    await Promise.resolve();

    const deleteRequest = httpTesting.expectOne(`${environment.apiUrl}/saved_routes/route-1`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);

    await expect(result).resolves.toBeUndefined();
  });

  it('cruza rotas por texto normalizado, dia e janela inclusiva de ±1 hora', async () => {
    const result = service.getMatchingRides();
    httpTesting
      .expectOne(`${environment.apiUrl}/saved_routes?user_id=user-1`)
      .flush([
        savedRoute({
          origin: '  SAO   JOAO ',
          destination: 'centro',
          days_of_week: ['monday'],
          preferred_time: '09:00',
        }),
      ]);
    httpTesting.expectOne(`${environment.apiUrl}/rides`).flush([
      ride('at-boundary'),
      ride('too-late', { departure_time: timestamp('2099-05-11', '10:01') }),
      ride('wrong-day', { departure_time: timestamp('2099-05-12', '09:00') }),
      ride('wrong-origin', { origin: 'Curitiba' }),
      ride('wrong-destination', { destination: 'Terminal' }),
      ride('closed', { status: 'cancelled' }),
      ride('full', { available_seats: 0 }),
    ]);

    await expect(result).resolves.toEqual([expect.objectContaining({ id: 'at-boundary' })]);
  });

  it('não trata a janela de horário como circular no mesmo dia', async () => {
    const result = service.getMatchingRides();
    httpTesting
      .expectOne(`${environment.apiUrl}/saved_routes?user_id=user-1`)
      .flush([
        savedRoute({
          days_of_week: ['sunday'],
          preferred_time: '23:30',
        }),
      ]);
    httpTesting
      .expectOne(`${environment.apiUrl}/rides`)
      .flush([
        ride('within-minus-one-hour', {
          departure_time: timestamp('2099-05-10', '22:30'),
        }),
        ride('same-day-00:30', { departure_time: timestamp('2099-05-10', '00:30') }),
      ]);

    await expect(result).resolves.toEqual([
      expect.objectContaining({ id: 'within-minus-one-hour' }),
    ]);
  });

  it('sugere caronas women-only somente para usuárias do gênero feminino', async () => {
    const getMatches = async (gender: 'female' | 'male' | 'other') => {
      authService.currentUser.set({
        id: 'user-1',
        name: 'Pessoa',
        email: 'pessoa@alunos.utfpr.edu.br',
        gender,
        created_at: '2099-01-01T00:00:00.000Z',
      });
      const result = service.getMatchingRides();
      httpTesting
        .expectOne(`${environment.apiUrl}/saved_routes?user_id=user-1`)
        .flush([savedRoute()]);
      httpTesting
        .expectOne(`${environment.apiUrl}/rides`)
        .flush([ride(`women-only-${gender}`, { women_only: true })]);
      return result;
    };

    await expect(getMatches('male')).resolves.toEqual([]);
    await expect(getMatches('other')).resolves.toEqual([]);
    await expect(getMatches('female')).resolves.toHaveLength(1);
  });
});

function timestamp(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}
