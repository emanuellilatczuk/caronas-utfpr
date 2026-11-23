import { Gender } from './user.model';

export type RideStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface RideDriver {
  id: string;
  name: string;
  gender: Gender;
  avatar_url?: string;
  average_rating?: number;
}

export interface RideVehicle {
  id: string;
  brand_model: string;
  color: string;
}

export interface RideReview {
  id: string;
  ride_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Ride {
  id: string;
  driver_id: string;
  vehicle_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  total_seats: number;
  available_seats: number;
  meeting_point: string;
  women_only: boolean;
  status: RideStatus;
  created_at: string;
  driver?: RideDriver;
  vehicle?: RideVehicle;
}

export interface RideSearchCriteria {
  origin: string;
  destination: string;
  date: string;
  time: string;
  passengerGender: Gender;
  womenOnly: boolean;
}
