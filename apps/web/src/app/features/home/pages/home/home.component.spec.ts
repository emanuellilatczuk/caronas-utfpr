import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { AuthService } from '../../../../core/services/auth.service';
import { Ride } from '../../../../core/models/ride.model';
import { User } from '../../../../core/models/user.model';
import { RideService } from '../../../../core/services/ride.service';
import { HomeComponent } from './home.component';

describe('HomeComponent - formulário de busca', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let rideServiceSpy: { searchRides: ReturnType<typeof vi.fn> };
  let authUser: ReturnType<typeof signal<User | null>>;

  const eligibleRide: Ride = {
    id: 'ride-1',
    driver_id: 'driver-1',
    vehicle_id: 'vehicle-1',
    origin: 'UTFPR',
    destination: 'Centro',
    departure_time: '2030-05-12T14:30:00',
    total_seats: 4,
    available_seats: 2,
    meeting_point: 'Portão principal',
    women_only: false,
    status: 'open',
    created_at: '2030-05-01T10:00:00',
    driver: {
      id: 'driver-1',
      name: 'Marina Oliveira',
      gender: 'female',
      avatar_url: 'https://example.test/marina.jpg',
      average_rating: 4.8,
    },
    vehicle: {
      id: 'vehicle-1',
      brand_model: 'Toyota Corolla',
      color: 'Prata',
    },
  };

  beforeEach(async () => {
    rideServiceSpy = {
      searchRides: vi.fn().mockResolvedValue([eligibleRide]),
    };
    authUser = signal<User | null>({
      id: 'user-1',
      name: 'Estudante Teste',
      email: 'estudante@alunos.utfpr.edu.br',
      gender: 'female',
      created_at: new Date().toISOString(),
    });

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: RideService, useValue: rideServiceSpy },
        {
          provide: AuthService,
          useValue: {
            currentUser: authUser,
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve exigir origem, destino, data e horário', () => {
    expect(component.searchForm.controls.origin.hasError('required')).toBe(true);
    expect(component.searchForm.controls.destination.hasError('required')).toBe(true);
    expect(component.searchForm.controls.date.hasError('required')).toBe(true);
    expect(component.searchForm.controls.time.hasError('required')).toBe(true);
  });

  it('deve invalidar origem e destino compostos apenas por espaços', () => {
    component.searchForm.controls.origin.setValue('   ');
    component.searchForm.controls.destination.setValue('\t  ');

    expect(component.searchForm.controls.origin.invalid).toBe(true);
    expect(component.searchForm.controls.origin.hasError('required')).toBe(true);
    expect(component.searchForm.controls.destination.invalid).toBe(true);
    expect(component.searchForm.controls.destination.hasError('required')).toBe(true);
  });

  it('não deve exibir erros antes da interação', () => {
    const errors = fixture.debugElement.queryAll(By.css('[data-testid^="error-"]'));
    expect(errors.length).toBe(0);
  });

  it('deve exibir mensagens em português após blur inválido', () => {
    const origin = fixture.debugElement.query(By.css('[data-testid="origin"]'));
    const destination = fixture.debugElement.query(By.css('[data-testid="destination"]'));
    const date = fixture.debugElement.query(By.css('[data-testid="date"]'));
    const time = fixture.debugElement.query(By.css('[data-testid="time"]'));

    origin.triggerEventHandler('blur', {});
    destination.triggerEventHandler('blur', {});
    date.triggerEventHandler('blur', {});
    time.triggerEventHandler('blur', {});
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('[data-testid="error-origin"]')).nativeElement.textContent,
    ).toContain('Origem é obrigatória');
    expect(
      fixture.debugElement.query(By.css('[data-testid="error-destination"]')).nativeElement
        .textContent,
    ).toContain('Destino é obrigatório');
    expect(
      fixture.debugElement.query(By.css('[data-testid="error-date"]')).nativeElement.textContent,
    ).toContain('Data é obrigatória');
    expect(
      fixture.debugElement.query(By.css('[data-testid="error-time"]')).nativeElement.textContent,
    ).toContain('Horário é obrigatório');
  });

  it('deve manter o botão de busca desabilitado enquanto o formulário estiver inválido', () => {
    const button = fixture.debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;

    expect(component.searchForm.invalid).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('deve associar mensagens de erro aos respectivos campos após interação', () => {
    const origin = fixture.debugElement.query(By.css('[data-testid="origin"]'));
    const destination = fixture.debugElement.query(By.css('[data-testid="destination"]'));
    const date = fixture.debugElement.query(By.css('[data-testid="date"]'));
    const time = fixture.debugElement.query(By.css('[data-testid="time"]'));

    origin.triggerEventHandler('blur', {});
    destination.triggerEventHandler('blur', {});
    date.triggerEventHandler('blur', {});
    time.triggerEventHandler('blur', {});
    fixture.detectChanges();

    expect(origin.nativeElement.getAttribute('aria-describedby')).toBe('error-origin');
    expect(origin.nativeElement.getAttribute('aria-invalid')).toBe('true');
    expect(destination.nativeElement.getAttribute('aria-describedby')).toBe('error-destination');
    expect(destination.nativeElement.getAttribute('aria-invalid')).toBe('true');
    expect(date.nativeElement.getAttribute('aria-describedby')).toBe('error-date');
    expect(date.nativeElement.getAttribute('aria-invalid')).toBe('true');
    expect(time.nativeElement.getAttribute('aria-describedby')).toBe('error-time');
    expect(time.nativeElement.getAttribute('aria-invalid')).toBe('true');
  });

  it('deve exibir o filtro Modo Elas por Elas para passageira com gênero feminino', () => {
    expect(fixture.debugElement.query(By.css('[data-testid="women-only-filter"]'))).toBeTruthy();
  });

  it('deve enviar o valor ativado do filtro na busca da passageira', async () => {
    component.searchForm.setValue({
      origin: 'UTFPR',
      destination: 'Centro',
      date: '2030-05-12',
      time: '14:00',
      womenOnly: false,
    });
    const filter = fixture.debugElement.query(By.css('[data-testid="women-only-filter"]'))
      .nativeElement as HTMLInputElement;
    filter.checked = true;
    filter.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.searchForm.controls.womenOnly.value).toBe(true);

    await component.onSearch();

    expect(rideServiceSpy.searchRides).toHaveBeenCalledWith({
      origin: 'UTFPR',
      destination: 'Centro',
      date: '2030-05-12',
      time: '14:00',
      passengerGender: 'female',
      womenOnly: true,
    });
  });

  it.each(['male', 'other'] as const)(
    'deve ocultar o filtro e forçá-lo desativado para gênero %s',
    async (gender) => {
      authUser.set({
        id: 'user-1',
        name: 'Estudante Teste',
        email: 'estudante@alunos.utfpr.edu.br',
        gender,
        created_at: new Date().toISOString(),
      });
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="women-only-filter"]'))).toBeNull();

      component.searchForm.setValue({
        origin: 'UTFPR',
        destination: 'Centro',
        date: '2030-05-12',
        time: '14:00',
        womenOnly: true,
      });
      await component.onSearch();

      expect(rideServiceSpy.searchRides).toHaveBeenCalledWith({
        origin: 'UTFPR',
        destination: 'Centro',
        date: '2030-05-12',
        time: '14:00',
        passengerGender: gender,
        womenOnly: false,
      });
    },
  );

  it('deve buscar com os critérios válidos e exibir os dados da carona elegível', async () => {
    component.searchForm.setValue({
      origin: ' UTFPR ',
      destination: ' Centro ',
      date: '2030-05-12',
      time: '14:00',
      womenOnly: false,
    });

    await component.onSearch();
    fixture.detectChanges();

    expect(rideServiceSpy.searchRides).toHaveBeenCalledWith({
      origin: ' UTFPR ',
      destination: ' Centro ',
      date: '2030-05-12',
      time: '14:00',
      passengerGender: 'female',
      womenOnly: false,
    });
    expect(
      fixture.debugElement.query(By.css('[data-testid="ride-driver-photo"]')).nativeElement.src,
    ).toBe('https://example.test/marina.jpg');
    expect(
      fixture.debugElement.query(By.css('[data-testid="ride-driver-name"]')).nativeElement
        .textContent,
    ).toContain('Marina Oliveira');
    expect(
      fixture.debugElement.query(By.css('[data-testid="ride-rating"]')).nativeElement.textContent,
    ).toContain('4.8');
    expect(
      fixture.debugElement.query(By.css('[data-testid="ride-vehicle"]')).nativeElement.textContent,
    ).toContain('Toyota Corolla');
    expect(
      fixture.debugElement.query(By.css('[data-testid="ride-vehicle"]')).nativeElement.textContent,
    ).toContain('Prata');
    expect(
      fixture.debugElement.query(By.css('[data-testid="ride-departure"]')).nativeElement
        .textContent,
    ).toContain('14:30');
    expect(
      fixture.debugElement.query(By.css('[data-testid="ride-seats"]')).nativeElement.textContent,
    ).toContain('2');
  });

  it('deve representar lista vazia sem exibi-la como erro', async () => {
    rideServiceSpy.searchRides.mockResolvedValue([]);
    component.searchForm.setValue({
      origin: 'UTFPR',
      destination: 'Centro',
      date: '2030-05-12',
      time: '14:00',
      womenOnly: false,
    });

    await component.onSearch();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="search-empty"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-testid="search-error"]'))).toBeNull();
  });
});
