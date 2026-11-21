import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida se o e-mail informado pertence aos domínios institucionais da UTFPR:
 * - @alunos.utfpr.edu.br
 * - @utfpr.edu.br
 */
export function utfprEmailValidator(): ValidatorFn {
  const UTFPR_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(alunos\.utfpr\.edu\.br|utfpr\.edu\.br)$/i;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || typeof value !== 'string' || value.trim() === '') {
      return null;
    }

    const isValid = UTFPR_EMAIL_REGEX.test(value.trim());
    return isValid ? null : { nonUtfprEmail: true };
  };
}

/**
 * Validação cruzada (cross-field) em formulários com senha e confirmação de senha.
 * Verifica se os dois campos são estritamente iguais e adiciona/remove o erro `passwordMismatch`
 * no controle de confirmação.
 */
export function passwordMatchValidator(
  passwordKey = 'password',
  confirmPasswordKey = 'confirmPassword'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordControl = control.get(passwordKey);
    const confirmControl = control.get(confirmPasswordKey);

    if (!passwordControl || !confirmControl) {
      return null;
    }

    const password = passwordControl.value;
    const confirmPassword = confirmControl.value;

    if (password !== confirmPassword) {
      const currentErrors = confirmControl.errors || {};
      confirmControl.setErrors({ ...currentErrors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmControl.errors) {
      const remainingErrors = { ...confirmControl.errors };
      delete remainingErrors['passwordMismatch'];
      const hasOtherErrors = Object.keys(remainingErrors).length > 0;
      confirmControl.setErrors(hasOtherErrors ? remainingErrors : null);
    }

    return null;
  };
}
