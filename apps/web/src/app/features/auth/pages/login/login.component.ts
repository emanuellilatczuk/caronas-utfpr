import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoginCredentials } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { utfprEmailValidator } from '../../../../core/validators/auth.validators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, utfprEmailValidator()]],
    password: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const formVal = this.form.getRawValue();
    const credentials: LoginCredentials = {
      email: formVal.email.trim(),
      password: formVal.password,
    };

    try {
      await this.authService.login(credentials);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao realizar login';
      this.errorMessage.set(msg);

      if (msg === 'E-mail ou senha inválidos') {
        this.form.controls.password.reset();
      }
    } finally {
      this.loading.set(false);
    }
  }
}
