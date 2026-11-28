import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ride } from '../models/ride.model';
import { SavedRoute } from '../models/saved-route.model';
import { AuthService } from './auth.service';
import { RideService } from './ride.service';

type SavedRouteFields = Pick<
  SavedRoute,
  'name' | 'origin' | 'destination' | 'days_of_week' | 'preferred_time' | 'women_only'
>;
type NewSavedRoute = Omit<SavedRouteFields, 'women_only'> & { women_only?: boolean };
type SavedRouteChanges = Partial<SavedRouteFields>;

const WEEKDAYS: Record<number, string[]> = {
  0: ['sunday', 'domingo'],
  1: ['monday', 'segunda', 'segundafeira'],
  2: ['tuesday', 'terca', 'tercafeira'],
  3: ['wednesday', 'quarta', 'quartafeira'],
  4: ['thursday', 'quinta', 'quintafeira'],
  5: ['friday', 'sexta', 'sextafeira'],
  6: ['saturday', 'sabado'],
};

@Injectable({
  providedIn: 'root',
})
export class SavedRouteService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly rideService = inject(RideService);
  private readonly apiUrl = environment.apiUrl;

  getSavedRoutes(): Promise<SavedRoute[]> {
    const user = this.requireCurrentUser();
    return firstValueFrom(
      this.http.get<SavedRoute[]>(`${this.apiUrl}/saved_routes`, {
        params: { user_id: user.id },
      }),
    );
  }

  async createSavedRoute(data: NewSavedRoute): Promise<SavedRoute> {
    const user = this.requireCurrentUser();
    const savedRoute = {
      ...data,
      user_id: user.id,
      women_only: data.women_only ?? false,
    };
    this.validate(savedRoute);

    return firstValueFrom(
      this.http.post<SavedRoute>(`${this.apiUrl}/saved_routes`, savedRoute),
    );
  }

  async updateSavedRoute(id: string, changes: SavedRouteChanges): Promise<SavedRoute> {
    const existing = await this.findOwnedRoute(id);
    this.validate({ ...existing, ...changes });

    return firstValueFrom(
      this.http.patch<SavedRoute>(`${this.apiUrl}/saved_routes/${id}`, changes),
    );
  }

  async deleteSavedRoute(id: string): Promise<void> {
    await this.findOwnedRoute(id);
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/saved_routes/${id}`));
  }

  async getMatchingRides(): Promise<Ride[]> {
    const user = this.requireCurrentUser();
    const [savedRoutes, rides] = await Promise.all([
      this.getSavedRoutes(),
      this.rideService.getRides(),
    ]);

    const matches = new Map<string, Ride>();
    for (const ride of rides) {
      if (
        ride.status !== 'open' ||
        ride.available_seats <= 0 ||
        (ride.women_only && user.gender !== 'female')
      ) {
        continue;
      }

      const departure = new Date(ride.departure_time);
      if (!Number.isFinite(departure.getTime())) {
        continue;
      }

      for (const route of savedRoutes) {
        if (this.matchesRoute(ride, departure, route) && !matches.has(ride.id)) {
          matches.set(ride.id, ride);
          break;
        }
      }
    }

    return [...matches.values()];
  }

  private async findOwnedRoute(id: string): Promise<SavedRoute> {
    const savedRoutes = await this.getSavedRoutes();
    const route = savedRoutes.find((savedRoute) => savedRoute.id === id);
    if (!route) {
      throw new Error('Rota salva não encontrada');
    }
    return route;
  }

  private requireCurrentUser() {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    return user;
  }

  private validate(route: SavedRouteFields): void {
    if (
      !route.name.trim() ||
      !route.origin.trim() ||
      !route.destination.trim() ||
      route.days_of_week.length === 0 ||
      !route.days_of_week.every(isValidWeekday) ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(route.preferred_time)
    ) {
      throw new Error('Dados da rota salva inválidos');
    }
  }

  private matchesRoute(ride: Ride, departure: Date, route: SavedRoute): boolean {
    const origin = normalizeText(route.origin);
    const destination = normalizeText(route.destination);
    if (
      !origin ||
      !destination ||
      !normalizeText(ride.origin).includes(origin) ||
      !normalizeText(ride.destination).includes(destination) ||
      !route.days_of_week.some((day) => dayMatches(day, departure.getDay()))
    ) {
      return false;
    }

    const rideMinutes = departure.getHours() * 60 + departure.getMinutes();
    const [preferredHours, preferredMinutes] = route.preferred_time.split(':').map(Number);
    const preferredTime = preferredHours * 60 + preferredMinutes;
    const timeDifference = Math.abs(rideMinutes - preferredTime);
    return timeDifference <= 60;
  }
}

function normalizeText(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function dayMatches(day: string, weekDay: number): boolean {
  return WEEKDAYS[weekDay].includes(normalizeWeekday(day));
}

function isValidWeekday(day: string): boolean {
  const normalizedDay = normalizeWeekday(day);
  return Object.values(WEEKDAYS).some((weekdays) => weekdays.includes(normalizedDay));
}

function normalizeWeekday(day: string): string {
  return normalizeText(day).replace(/[\s-]/g, '');
}
