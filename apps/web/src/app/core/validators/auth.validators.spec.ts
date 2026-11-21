import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator, utfprEmailValidator } from './auth.validators';

describe('AuthValidators', () => {
  describe('utfprEmailValidator', () => {
    it('deve aceitar e-mails com domínio @alunos.utfpr.edu.br', () => {
      const control = new FormControl('estudante@alunos.utfpr.edu.br');
      const result = utfprEmailValidator()(control);
      expect(result).toBeNull();
    });

    it('deve aceitar e-mails com domínio @utfpr.edu.br', () => {
      const control = new FormControl('servidor@utfpr.edu.br');
      const result = utfprEmailValidator()(control);
      expect(result).toBeNull();
    });

    it('deve rejeitar e-mails com domínios públicos ou de outras instituições', () => {
      const invalidEmails = [
        'usuario@gmail.com',
        'usuario@hotmail.com',
        'usuario@utfpr.com',
        'usuario@ufpr.br',
        'usuario@alunos.utfpr.com',
      ];

      for (const email of invalidEmails) {
        const control = new FormControl(email);
        const result = utfprEmailValidator()(control);
        expect(result).toEqual({ nonUtfprEmail: true });
      }
    });

    it('deve retornar null para valor vazio (deixando obrigatoriedade para Validators.required)', () => {
      const emptyControl = new FormControl('');
      expect(utfprEmailValidator()(emptyControl)).toBeNull();

      const nullControl = new FormControl(null);
      expect(utfprEmailValidator()(nullControl)).toBeNull();
    });
  });

  describe('passwordMatchValidator', () => {
    it('deve retornar null quando senha e confirmação forem idênticas', () => {
      const form = new FormGroup({
        password: new FormControl('senhaSegura123'),
        confirmPassword: new FormControl('senhaSegura123'),
      });

      const result = passwordMatchValidator('password', 'confirmPassword')(form);
      expect(result).toBeNull();
      expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBe(false);
    });

    it('deve retornar { passwordMismatch: true } e marcar erro no confirmPassword quando as senhas divergirem', () => {
      const form = new FormGroup({
        password: new FormControl('senhaSegura123'),
        confirmPassword: new FormControl('outraSenha999'),
      });

      const result = passwordMatchValidator('password', 'confirmPassword')(form);
      expect(result).toEqual({ passwordMismatch: true });
      expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
    });

    it('deve limpar o erro passwordMismatch quando as senhas passarem a coincidir', () => {
      const form = new FormGroup({
        password: new FormControl('senhaSegura123'),
        confirmPassword: new FormControl('outraSenha999'),
      });

      const validator = passwordMatchValidator('password', 'confirmPassword');
      validator(form);
      expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);

      form.get('confirmPassword')?.setValue('senhaSegura123');
      const updatedResult = validator(form);
      expect(updatedResult).toBeNull();
      expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBe(false);
    });
  });
});
