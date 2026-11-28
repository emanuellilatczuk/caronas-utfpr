import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Ride } from '../../../../core/models/ride.model';
import { MatchSuggestionsComponent } from './match-suggestions.component';

describe('MatchSuggestionsComponent', () => {
  let fixture: ComponentFixture<MatchSuggestionsComponent>;

  const rideWithFullDetails: Ride = {
    id: 'ride-1',
    driver_id: 'driver-1',
    vehicle_id: 'vehicle-1',
    origin: 'UTFPR Centro',
    destination: 'Jardim das Flores',
    departure_time: '2030-05-12T08:15:00',
    total_seats: 4,
    available_seats: 2,
    meeting_point: 'Entrada principal',
    women_only: true,
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

  const rideWithFallbacks: Ride = {
    id: 'ride-2',
    driver_id: 'driver-2',
    vehicle_id: 'vehicle-2',
    origin: 'Praça Tiradentes',
    destination: 'UTFPR Campus',
    departure_time: '2030-05-12T18:05:00',
    total_seats: 3,
    available_seats: 1,
    meeting_point: 'Ponto central',
    women_only: false,
    status: 'open',
    created_at: '2030-05-01T10:00:00',
    driver: {
      id: 'driver-2',
      name: 'Carlos Mendes',
      gender: 'male',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchSuggestionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchSuggestionsComponent);
    fixture.detectChanges();
  });

  it('renderiza os cards de caronas sugeridas com foto, nota, veículo, horário, vagas e tokens da Home', () => {
    fixture.componentRef.setInput('rides', [rideWithFullDetails, rideWithFallbacks]);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('[data-testid="match-ride-card"]'));
    expect(cards).toHaveLength(2);

    const firstCard = cards[0];
    const cardElement = firstCard.nativeElement as HTMLElement;
    expect(cardElement.classList.contains('bg-superficie')).toBe(true);
    expect(cardElement.classList.contains('rounded-2xl')).toBe(true);
    expect(cardElement.classList.contains('border-desabilitado')).toBe(true);

    const photo = firstCard.query(By.css('[data-testid="ride-driver-photo"]'))
      .nativeElement as HTMLImageElement;
    expect(photo.src).toBe('https://example.test/marina.jpg');
    expect(photo.alt).toBe('Foto de Marina Oliveira');

    expect(
      firstCard.query(By.css('[data-testid="ride-driver-name"]')).nativeElement.textContent,
    ).toContain('Marina Oliveira');
    expect(
      firstCard.query(By.css('[data-testid="ride-rating"]')).nativeElement.textContent,
    ).toContain('★ 4.8');
    expect(
      firstCard.query(By.css('[data-testid="ride-vehicle"]')).nativeElement.textContent,
    ).toContain('Toyota Corolla');
    expect(
      firstCard.query(By.css('[data-testid="ride-vehicle"]')).nativeElement.textContent,
    ).toContain('Prata');
    expect(firstCard.nativeElement.textContent).toContain('UTFPR Centro');
    expect(firstCard.nativeElement.textContent).toContain('Jardim das Flores');
    expect(
      firstCard.query(By.css('[data-testid="ride-departure"]')).nativeElement.textContent,
    ).toContain('08:15');
    expect(
      firstCard.query(By.css('[data-testid="ride-seats"]')).nativeElement.textContent,
    ).toContain('2');
    expect(
      firstCard.query(By.css('[data-testid="ride-seats"]')).nativeElement.textContent,
    ).toContain('vagas restantes');
    expect(
      firstCard.query(By.css('[data-testid="ride-women-only-badge"]')).nativeElement.textContent,
    ).toContain('Modo Elas por Elas');
    expect(
      firstCard.query(By.css('[data-testid="view-ride-btn"]')).nativeElement.textContent,
    ).toContain('Ver Carona');

    const secondCard = cards[1];
    expect(secondCard.query(By.css('[data-testid="ride-driver-photo"]'))).toBeNull();
    expect(
      secondCard.query(By.css('[data-testid="ride-driver-initial"]')).nativeElement.textContent,
    ).toContain('C');
    expect(
      secondCard.query(By.css('[data-testid="ride-rating"]')).nativeElement.textContent,
    ).toContain('Sem avaliações');
    expect(
      secondCard.query(By.css('[data-testid="ride-vehicle"]')).nativeElement.textContent,
    ).toContain('Veículo indisponível');
    expect(
      secondCard.query(By.css('[data-testid="ride-seats"]')).nativeElement.textContent,
    ).toContain('1');
    expect(
      secondCard.query(By.css('[data-testid="ride-seats"]')).nativeElement.textContent,
    ).toContain('vaga restante');
    expect(secondCard.query(By.css('[data-testid="ride-women-only-badge"]'))).toBeNull();
  });

  it('exibe estado vazio em português quando não há caronas compatíveis', () => {
    fixture.componentRef.setInput('rides', []);
    fixture.detectChanges();

    const empty = fixture.debugElement.query(By.css('[data-testid="match-suggestions-empty"]'));
    expect(empty).toBeTruthy();
    expect(empty.nativeElement.textContent).toContain('Nenhuma carona compatível no momento');
    expect(fixture.debugElement.query(By.css('[data-testid="match-ride-card"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="match-suggestions-loading"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="match-suggestions-error"]'))).toBeNull();
  });

  it('alterna entre estados de carregamento e erro inline em português via @switch', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const loading = fixture.debugElement.query(By.css('[data-testid="match-suggestions-loading"]'));
    expect(loading).toBeTruthy();
    expect(loading.nativeElement.getAttribute('role')).toBe('status');
    expect(loading.nativeElement.textContent).toContain('Buscando caronas compatíveis...');
    expect(fixture.debugElement.query(By.css('[data-testid="match-suggestions-empty"]'))).toBeNull();

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput(
      'error',
      'Não foi possível carregar as sugestões de carona. Tente novamente.',
    );
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('[data-testid="match-suggestions-error"]'));
    expect(error).toBeTruthy();
    expect(error.nativeElement.getAttribute('role')).toBe('alert');
    expect(error.nativeElement.textContent).toContain(
      'Não foi possível carregar as sugestões de carona. Tente novamente.',
    );
    expect(fixture.debugElement.query(By.css('[data-testid="match-suggestions-loading"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="match-suggestions-empty"]'))).toBeNull();
  });

  it('emite o identificador da carona pelo output viewRide ao clicar em "Ver Carona"', () => {
    fixture.componentRef.setInput('rides', [rideWithFullDetails]);
    fixture.detectChanges();

    const spy = vi.fn();
    fixture.componentInstance.viewRide.subscribe(spy);

    fixture.debugElement.query(By.css('[data-testid="view-ride-btn"]')).nativeElement.click();

    expect(spy).toHaveBeenCalledWith('ride-1');
  });
});
