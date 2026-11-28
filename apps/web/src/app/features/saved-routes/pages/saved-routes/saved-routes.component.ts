import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { Ride } from '../../../../core/models/ride.model';
import { CepSearchInputComponent } from '../../components/cep-search-input/cep-search-input.component';
import { DaysSelectorComponent } from '../../components/days-selector/days-selector.component';
import { MatchSuggestionsComponent } from '../../components/match-suggestions/match-suggestions.component';

const trimRequiredValidator: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length === 0
    ? { required: true }
    : null;

const WEEKDAY_LABELS: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

@Component({
  selector: 'app-saved-routes',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CepSearchInputComponent,
    DaysSelectorComponent,
    MatchSuggestionsComponent,
  ],
  templateUrl: './saved-routes.component.html',
})
export class SavedRoutesComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly savedRouteService = inject(SavedRouteService);
  private readonly router = inject(Router);

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
  readonly savedRoutes = signal<SavedRoute[]>([]);
  readonly loadingSavedRoutes = signal(true);
  readonly savedRoutesError = signal<string | null>(null);
  readonly deleteError = signal<string | null>(null);
  readonly activeTab = signal<'routes' | 'matches'>('routes');
  readonly matchingRides = signal<Ride[]>([]);
  readonly loadingMatches = signal(false);
  readonly matchesError = signal<string | null>(null);
  readonly savedRoutesState = computed(() => {
    if (this.loadingSavedRoutes()) {
      return 'loading';
    }
    if (this.savedRoutesError()) {
      return 'error';
    }
    return this.savedRoutes().length ? 'loaded' : 'empty';
  });
  private routeLoadVersion = 0;
  private matchesLoadVersion = 0;

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

  ngOnInit(): void {
    void this.refreshSavedRoutes();
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
      await this.refreshSavedRoutes();
      if (this.activeTab() === 'matches') {
        await this.refreshMatchingRides();
      }
      if (routeId) {
        await this.router.navigate(['/profile/saved-routes']);
      }
    } catch {
      this.submitError.set('Não foi possível salvar a rota. Tente novamente.');
    } finally {
      this.saving.set(false);
    }
  }

  formatDays(days: string[]): string {
    return days
      .map((day) => WEEKDAY_LABELS[day.toLocaleLowerCase('pt-BR')] ?? day)
      .join(', ');
  }

  async deleteRoute(route: SavedRoute): Promise<void> {
    const confirmed = window.confirm(`Deseja excluir a rota "${route.name}"?`);
    if (!confirmed) {
      return;
    }

    this.deleteError.set(null);
    try {
      await this.savedRouteService.deleteSavedRoute(route.id);
      await this.refreshSavedRoutes();
      if (this.activeTab() === 'matches') {
        await this.refreshMatchingRides();
      }
    } catch {
      this.deleteError.set('Não foi possível excluir a rota. Tente novamente.');
    }
  }

  selectTab(tab: 'routes' | 'matches'): void {
    this.activeTab.set(tab);
    if (tab === 'matches') {
      void this.refreshMatchingRides();
    }
  }

  navigateToRide(rideId: string): void {
    void this.router.navigate(['/rides', rideId]);
  }

  async refreshMatchingRides(): Promise<void> {
    const requestVersion = ++this.matchesLoadVersion;
    this.loadingMatches.set(true);
    this.matchesError.set(null);
    try {
      const rides = await this.savedRouteService.getMatchingRides();
      if (requestVersion !== this.matchesLoadVersion) {
        return;
      }
      this.matchingRides.set(rides);
    } catch {
      if (requestVersion === this.matchesLoadVersion) {
        this.matchingRides.set([]);
        this.matchesError.set(
          'Não foi possível carregar as sugestões de carona. Tente novamente.',
        );
      }
    } finally {
      if (requestVersion === this.matchesLoadVersion) {
        this.loadingMatches.set(false);
      }
    }
  }

  async refreshSavedRoutes(): Promise<void> {
    this.loadingSavedRoutes.set(true);
    this.savedRoutesError.set(null);
    try {
      const currentUserId = this.currentUser()?.id;
      const routes = await this.savedRouteService.getSavedRoutes();
      this.savedRoutes.set(
        routes.filter((route) => route.user_id === currentUserId),
      );
    } catch {
      this.savedRoutesError.set('Não foi possível carregar suas rotas. Tente novamente.');
    } finally {
      this.loadingSavedRoutes.set(false);
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
