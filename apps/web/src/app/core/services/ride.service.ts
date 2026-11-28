import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import {
  Ride,
  RideDriver,
  RideReview,
  RideSearchCriteria,
  RideVehicle,
} from '../models/ride.model';

@Injectable({
  providedIn: 'root',
})
export class RideService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  async getRides(): Promise<Ride[]> {
    const { rides, users, vehicles, reviews } = await firstValueFrom(
      forkJoin({
        rides: this.http.get<Ride[]>(`${this.apiUrl}/rides`),
        users: this.http.get<User[]>(`${this.apiUrl}/users`),
        vehicles: this.http.get<RideVehicle[]>(`${this.apiUrl}/vehicles`),
        reviews: this.http.get<RideReview[]>(`${this.apiUrl}/reviews`),
      }),
    );
    const ratingsByDriver = new Map<string, number[]>();
    reviews.forEach(({ reviewed_id, rating }) => {
      const ratings = ratingsByDriver.get(reviewed_id) ?? [];
      ratings.push(rating);
      ratingsByDriver.set(reviewed_id, ratings);
    });
    const drivers = new Map<string, RideDriver>(
      users.map((user) => {
        const ratings = ratingsByDriver.get(user.id) ?? [];
        return [
          user.id,
          {
            id: user.id,
            name: user.name,
            gender: user.gender,
            avatar_url: user.avatar_url,
            ...(ratings.length > 0
              ? {
                  average_rating: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
                }
              : {}),
          },
        ];
      }),
    );
    const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

    return rides.map((ride) => ({
      ...ride,
      driver: drivers.get(ride.driver_id),
      vehicle: vehicleById.get(ride.vehicle_id),
    }));
  }

  async searchRides(criteria: RideSearchCriteria): Promise<Ride[]> {
    const rides = await this.getRides();
    const origin = normalizeText(criteria.origin);
    const destination = normalizeText(criteria.destination);

    return rides.filter((ride) => {
      const departure = new Date(ride.departure_time);
      const driver = ride.driver;

      if (
        !origin ||
        !destination ||
        !Number.isFinite(departure.getTime()) ||
        departure.getTime() <= Date.now() ||
        getLocalDate(departure) !== criteria.date ||
        getLocalTime(departure) < criteria.time ||
        ride.status !== 'open' ||
        ride.available_seats <= 0 ||
        !normalizeText(ride.origin).includes(origin) ||
        !normalizeText(ride.destination).includes(destination)
      ) {
        return false;
      }

      if (criteria.womenOnly) {
        return (
          criteria.passengerGender === 'female' && ride.women_only && driver?.gender === 'female'
        );
      }

      return criteria.passengerGender === 'female' || !ride.women_only;
    });
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

function getLocalDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalTime(value: Date): string {
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
