import { Component, inject } from '@angular/core';
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

const trimRequiredValidator: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length === 0
    ? { required: true }
    : null;

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  readonly searchForm = this.fb.group({
    origin: ['', [Validators.required, trimRequiredValidator]],
    destination: ['', [Validators.required, trimRequiredValidator]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
  });

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
