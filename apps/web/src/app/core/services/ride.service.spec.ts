import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Gender } from '../models/user.model';
import { Ride, RideReview, RideSearchCriteria, RideVehicle } from '../models/ride.model';
import { RideService } from './ride.service';

describe('RideService', () => {
  let service: RideService;
  let httpTesting: HttpTestingController;

  const driver = (id: string, gender: Gender, name = `Driver ${id}`) => ({
    id,
    name,
    email: `${id}@alunos.utfpr.edu.br`,
    gender,
    created_at: '2026-01-01T00:00:00.000Z',
  });

  const ride = (id: string, overrides: Partial<Ride> = {}): Ride => ({
    id,
    driver_id: 'driver-female',
    vehicle_id: 'vehicle-1',
    origin: 'São João',
    destination: 'Centro',
    departure_time: localTimestamp('2099-05-10', '09:00'),
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
      providers: [RideService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RideService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  async function search(
    criteria: RideSearchCriteria,
    rides: Ride[],
    users = [driver('driver-female', 'female')],
    vehicles: RideVehicle[] = [{ id: 'vehicle-1', brand_model: 'Toyota Corolla', color: 'Prata' }],
    reviews: RideReview[] = [
      {
        id: 'review-1',
        ride_id: 'ride-reviewed-1',
        reviewer_id: 'passenger-1',
        reviewed_id: 'driver-female',
        rating: 4,
        created_at: '2099-01-01T00:00:00.000Z',
      },
      {
        id: 'review-2',
        ride_id: 'ride-reviewed-2',
        reviewer_id: 'passenger-2',
        reviewed_id: 'driver-female',
        rating: 5,
        created_at: '2099-01-02T00:00:00.000Z',
      },
    ],
  ): Promise<Ride[]> {
    const result = service.searchRides(criteria);
    httpTesting.expectOne(`${environment.apiUrl}/rides`).flush(rides);
    httpTesting.expectOne(`${environment.apiUrl}/users`).flush(users);
    httpTesting.expectOne(`${environment.apiUrl}/vehicles`).flush(vehicles);
    httpTesting.expectOne(`${environment.apiUrl}/reviews`).flush(reviews);
    return result;
  }

  const criteria = (overrides: Partial<RideSearchCriteria> = {}): RideSearchCriteria => ({
    origin: 'sao joao',
    destination: 'centro',
    date: '2099-05-10',
    time: '09:00',
    passengerGender: 'female',
    womenOnly: false,
    ...overrides,
  });

  function localTimestamp(date: string, time: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes).toISOString();
  }

  it('normaliza maiúsculas, acentos, espaços e usa correspondência parcial em origem e destino', async () => {
    const results = await search(
      criteria({
        origin: '  SAO   JOAO ',
        destination: '  das flores ',
      }),
      [
        ride('matching', {
          origin: '  São   João - UTFPR ',
          destination: 'Jardim das Flores',
        }),
        ride('wrong-origin', { origin: 'Curitiba' }),
        ride('wrong-destination', { destination: 'Terminal' }),
      ],
    );

    expect(results.map(({ id }) => id)).toEqual(['matching']);
  });

  it('aceita somente a data exata e partidas no horário informado ou depois', async () => {
    const results = await search(criteria({ date: '2099-05-10', time: '10:00' }), [
      ride('same-time', { departure_time: localTimestamp('2099-05-10', '10:00') }),
      ride('later', { departure_time: localTimestamp('2099-05-10', '10:30') }),
      ride('earlier', { departure_time: localTimestamp('2099-05-10', '09:59') }),
      ride('other-date', { departure_time: localTimestamp('2099-05-11', '11:00') }),
    ]);

    expect(results.map(({ id }) => id)).toEqual(['same-time', 'later']);
  });

  it('exclui partidas já passadas no momento da busca, status diferente de open e vagas esgotadas', async () => {
    const results = await search(
      criteria({
        date: '2020-05-10',
        time: '08:00',
      }),
      [
        ride('past', { departure_time: localTimestamp('2020-05-10', '09:00') }),
        ride('cancelled', {
          departure_time: localTimestamp('2099-05-10', '09:00'),
          status: 'cancelled',
        }),
        ride('full', {
          departure_time: localTimestamp('2099-05-10', '09:00'),
          available_seats: 0,
        }),
      ],
    );

    expect(results).toEqual([]);
  });

  it('omite caronas women-only para passageiros masculinos e other', async () => {
    const womenOnlyRide = ride('women-only', { women_only: true });

    for (const passengerGender of ['male', 'other'] as const) {
      const results = await search(criteria({ passengerGender }), [womenOnlyRide]);
      expect(results).toEqual([]);
    }
  });

  it('com o filtro women-only ativo aceita apenas carona exclusiva com motorista mulher', async () => {
    const results = await search(
      criteria({ womenOnly: true }),
      [
        ride('eligible', { women_only: true }),
        ride('not-exclusive', { women_only: false }),
        ride('male-driver', {
          id: 'male-driver-ride',
          driver_id: 'driver-male',
          women_only: true,
        }),
      ],
      [driver('driver-female', 'female'), driver('driver-male', 'male')],
    );

    expect(results.map(({ id }) => id)).toEqual(['eligible']);
  });

  it('inclui veículo e avaliação média do motorista nos resultados', async () => {
    const results = await search(criteria(), [ride('with-details')]);

    expect(results[0]).toMatchObject({
      driver: { average_rating: 4.5 },
      vehicle: { brand_model: 'Toyota Corolla', color: 'Prata' },
    });
  });

  it('hidrata motorista com nome, foto e média de avaliações derivada de reviews e veículo em getRides', async () => {
    const resultPromise = service.getRides();
    httpTesting.expectOne(`${environment.apiUrl}/rides`).flush([
      ride('rated-ride', { driver_id: 'driver-female', vehicle_id: 'vehicle-1' }),
      ride('unrated-ride', { driver_id: 'driver-male', vehicle_id: 'vehicle-2' }),
    ]);
    httpTesting.expectOne(`${environment.apiUrl}/users`).flush([
      {
        ...driver('driver-female', 'female', 'Ana Souza'),
        avatar_url: 'https://example.com/ana.jpg',
      },
      driver('driver-male', 'male', 'João Lima'),
    ]);
    httpTesting.expectOne(`${environment.apiUrl}/vehicles`).flush([
      { id: 'vehicle-1', brand_model: 'Toyota Corolla', color: 'Prata' },
      { id: 'vehicle-2', brand_model: 'Honda Civic', color: 'Preto' },
    ]);
    httpTesting.expectOne(`${environment.apiUrl}/reviews`).flush([
      {
        id: 'review-1',
        ride_id: 'ride-reviewed-1',
        reviewer_id: 'passenger-1',
        reviewed_id: 'driver-female',
        rating: 4,
        created_at: '2099-01-01T00:00:00.000Z',
      },
      {
        id: 'review-2',
        ride_id: 'ride-reviewed-2',
        reviewer_id: 'passenger-2',
        reviewed_id: 'driver-female',
        rating: 5,
        created_at: '2099-01-02T00:00:00.000Z',
      },
    ]);

    const results = await resultPromise;
    expect(results[0]).toMatchObject({
      id: 'rated-ride',
      driver: {
        id: 'driver-female',
        name: 'Ana Souza',
        gender: 'female',
        avatar_url: 'https://example.com/ana.jpg',
        average_rating: 4.5,
      },
      vehicle: { id: 'vehicle-1', brand_model: 'Toyota Corolla', color: 'Prata' },
    });
    expect(results[1]).toMatchObject({
      id: 'unrated-ride',
      driver: {
        id: 'driver-male',
        name: 'João Lima',
        gender: 'male',
      },
      vehicle: { id: 'vehicle-2', brand_model: 'Honda Civic', color: 'Preto' },
    });
    expect(results[1]?.driver?.average_rating).toBeUndefined();
  });
});
