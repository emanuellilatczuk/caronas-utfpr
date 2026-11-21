import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Gender, RegisterData } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { passwordMatchValidator, utfprEmailValidator } from '../../../../core/validators/auth.validators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, utfprEmailValidator()]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      gender: ['' as Gender, [Validators.required]],
    },
    {
      validators: [passwordMatchValidator('password', 'confirmPassword')],
    }
  );

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const formVal = this.form.getRawValue();
    const data: RegisterData = {
      name: formVal.name.trim(),
      email: formVal.email.trim(),
      password: formVal.password,
      gender: formVal.gender as Gender,
    };

    try {
      await this.authService.register(data);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao realizar cadastro';
      this.errorMessage.set(msg);

      if (msg === 'Este e-mail já está em uso') {
        this.form.controls.password.reset();
        this.form.controls.confirmPassword.reset();
      }
    } finally {
      this.loading.set(false);
    }
  }
}
