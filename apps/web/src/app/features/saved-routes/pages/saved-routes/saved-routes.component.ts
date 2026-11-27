import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { SavedRouteService } from '../../../../core/services/saved-route.service';
import { SavedRoute } from '../../../../core/models/saved-route.model';
import { CepSearchInputComponent } from '../../components/cep-search-input/cep-search-input.component';
import { DaysSelectorComponent } from '../../components/days-selector/days-selector.component';

const trimRequiredValidator: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length === 0
    ? { required: true }
    : null;

@Component({
  selector: 'app-saved-routes',
  imports: [ReactiveFormsModule, CepSearchInputComponent, DaysSelectorComponent],
  templateUrl: './saved-routes.component.html',
})
export class SavedRoutesComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly savedRouteService = inject(SavedRouteService);

  readonly id = input<string>();
  readonly origin = input<string>();
  readonly destination = input<string>();
  readonly time = input<string>();
  readonly saved = output<SavedRoute>();

  readonly currentUser = this.authService.currentUser;
  readonly canSeeWomenOnly = computed(() => this.currentUser()?.gender === 'female');
  readonly selectedDays = signal<string[]>([]);
  readonly originCep = signal('');
  readonly destinationCep = signal('');
  readonly saving = signal(false);
  readonly loadingRoute = signal(false);
  readonly submitError = signal<string | null>(null);
  private routeLoadVersion = 0;

  readonly savedRouteForm = this.fb.group({
    name: ['', [Validators.required, trimRequiredValidator]],
    origin: ['', [Validators.required, trimRequiredValidator]],
    destination: ['', [Validators.required, trimRequiredValidator]],
    days: this.fb.control<string[]>([], [
      (control: AbstractControl<string[]>): ValidationErrors | null =>
        control.value.length > 0 ? null : { required: true },
    ]),
    preferredTime: ['', [Validators.required]],
    womenOnly: this.fb.control(false),
  });

  constructor() {
    effect(() => {
      this.savedRouteForm.controls.days.setValue(this.selectedDays());
    });

    effect(() => {
      const origin = this.origin();
      const destination = this.destination();
      const time = this.time();
      if (origin !== undefined) {
        this.savedRouteForm.controls.origin.setValue(origin);
      }
      if (destination !== undefined) {
        this.savedRouteForm.controls.destination.setValue(destination);
      }
      if (time !== undefined) {
        this.savedRouteForm.controls.preferredTime.setValue(time);
      }
    });

    effect(() => {
      const id = this.id();
      const requestVersion = ++this.routeLoadVersion;
      this.submitError.set(null);
      if (!id) {
        this.loadingRoute.set(false);
        return;
      }

      this.loadingRoute.set(true);
      this.savedRouteForm.reset({
        name: '',
        origin: '',
        destination: '',
        days: [],
        preferredTime: '',
        womenOnly: false,
      });
      this.selectedDays.set([]);
      void this.loadRouteForEditing(id, requestVersion);
    });
  }

  syncDaysToForm(): void {
    this.savedRouteForm.controls.days.setValue(this.selectedDays());
  }

  applyAddress(field: 'origin' | 'destination', address: string): void {
    this.savedRouteForm.controls[field].setValue(address);
  }

  async onSubmit(): Promise<void> {
    this.syncDaysToForm();
    if (this.savedRouteForm.invalid || this.loadingRoute()) {
      this.savedRouteForm.markAllAsTouched();
      return;
    }

    const routeId = this.id();
    const raw = this.savedRouteForm.getRawValue();
    const data = {
      name: raw.name.trim(),
      origin: raw.origin.trim(),
      destination: raw.destination.trim(),
      preferred_time: raw.preferredTime,
      days_of_week: [...raw.days],
      women_only: this.canSeeWomenOnly() ? raw.womenOnly : false,
    };

    this.saving.set(true);
    this.submitError.set(null);
    try {
      const savedRoute = routeId
        ? await this.savedRouteService.updateSavedRoute(routeId, data)
        : await this.savedRouteService.createSavedRoute(data);
      this.saved.emit(savedRoute);
    } catch {
      this.submitError.set('Não foi possível salvar a rota. Tente novamente.');
    } finally {
      this.saving.set(false);
    }
  }

  private async loadRouteForEditing(id: string, requestVersion: number): Promise<void> {
    try {
      const routes = await this.savedRouteService.getSavedRoutes();
      if (requestVersion !== this.routeLoadVersion || this.id() !== id) {
        return;
      }

      const route = routes.find(
        (savedRoute) => savedRoute.id === id,
      );
      if (!route) {
        return;
      }
      this.savedRouteForm.patchValue({
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        preferredTime: route.preferred_time,
        womenOnly: route.women_only,
      });
      this.selectedDays.set([...route.days_of_week]);
      this.syncDaysToForm();
    } catch {
      if (requestVersion === this.routeLoadVersion && this.id() === id) {
        this.submitError.set('Não foi possível carregar a rota para edição.');
      }
    } finally {
      if (requestVersion === this.routeLoadVersion && this.id() === id) {
        this.loadingRoute.set(false);
      }
    }
  }
}
