import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Ride } from '../../../../core/models/ride.model';
import { RideService } from '../../../../core/services/ride.service';

const trimRequiredValidator: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length === 0
    ? { required: true }
    : null;

@Component({
  selector: 'app-home',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly rideService = inject(RideService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly canSeeWomenOnlyFilter = computed(() => this.currentUser()?.gender === 'female');
  readonly searchState = signal<'not-searched' | 'loading' | 'results' | 'empty' | 'error'>(
    'not-searched',
  );
  readonly searchResults = signal<Ride[]>([]);
  readonly searchError = signal<string | null>(null);

  readonly searchForm = this.fb.group({
    origin: ['', [Validators.required, trimRequiredValidator]],
    destination: ['', [Validators.required, trimRequiredValidator]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    womenOnly: this.fb.control(false),
  });

  async onSearch(): Promise<void> {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const user = this.currentUser();
    if (!user) {
      this.searchError.set('Não foi possível identificar o usuário para realizar a busca.');
      this.searchState.set('error');
      return;
    }

    const { origin, destination, date, time } = this.searchForm.getRawValue();
    this.searchState.set('loading');
    this.searchError.set(null);

    try {
      const rides = await this.rideService.searchRides({
        origin,
        destination,
        date,
        time,
        passengerGender: user.gender,
        womenOnly: this.canSeeWomenOnlyFilter() && this.searchForm.controls.womenOnly.value,
      });
      this.searchResults.set(rides);
      this.searchState.set(rides.length > 0 ? 'results' : 'empty');
    } catch {
      this.searchResults.set([]);
      this.searchError.set('Não foi possível buscar caronas. Tente novamente.');
      this.searchState.set('error');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
