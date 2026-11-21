import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterComponent } from './register.component';
import { User } from '../../../../core/models/user.model';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  let authServiceSpy: { register: ReturnType<typeof vi.fn> };
  let mockActivatedRoute: { snapshot: { queryParams: Record<string, string> } };

  const mockUser: User = {
    id: 'user-1',
    name: 'Ana UTFPR',
    email: 'ana@alunos.utfpr.edu.br',
    gender: 'female',
    created_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    authServiceSpy = {
      register: vi.fn().mockResolvedValue(mockUser),
    };

    mockActivatedRoute = {
      snapshot: { queryParams: {} },
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('deve criar o componente e inicializar com formulário limpo (CA10)', () => {
    expect(component).toBeTruthy();
    expect(component.form.pristine).toBe(true);
    expect(component.form.value.name).toBe('');
    expect(component.form.value.email).toBe('');
    expect(component.form.value.password).toBe('');
    expect(component.form.value.confirmPassword).toBe('');
    expect(component.form.value.gender).toBe('');
  });

  it('deve manter o botão de submissão desabilitado quando o formulário for inválido (CA4)', () => {
    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(component.form.invalid).toBe(true);
    expect(submitBtn.disabled).toBe(true);
  });

  it('deve exibir mensagem de erro para e-mail não institucional (CA4)', () => {
    const emailControl = component.form.controls.email;
    emailControl.setValue('usuario@gmail.com');
    emailControl.markAsTouched();
    fixture.detectChanges();

    expect(emailControl.hasError('nonUtfprEmail')).toBe(true);
    const errorEl = fixture.debugElement.query(By.css('[data-testid="error-email"]'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('domínios institucionais da UTFPR');
  });

  it('deve exibir erro para senha com menos de 8 caracteres (CA5)', () => {
    const passControl = component.form.controls.password;
    passControl.setValue('12345');
    passControl.markAsTouched();
    fixture.detectChanges();

    expect(passControl.hasError('minlength')).toBe(true);
    const errorEl = fixture.debugElement.query(By.css('[data-testid="error-password"]'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('mínimo 8 caracteres');
  });

  it('deve exibir erro quando a confirmação de senha divergir da senha (CA5)', () => {
    component.form.controls.password.setValue('senhaForte123');
    const confirmControl = component.form.controls.confirmPassword;
    confirmControl.setValue('senhaDiferente');
    confirmControl.markAsTouched();
    component.form.updateValueAndValidity();
    fixture.detectChanges();

    expect(confirmControl.hasError('passwordMismatch')).toBe(true);
    const errorEl = fixture.debugElement.query(By.css('[data-testid="error-confirmPassword"]'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('senhas não coincidem');
  });

  it('deve habilitar o botão de submissão quando todos os campos forem válidos (CA1)', () => {
    component.form.setValue({
      name: 'Ana UTFPR',
      email: 'ana@alunos.utfpr.edu.br',
      password: 'senhaSegura123',
      confirmPassword: 'senhaSegura123',
      gender: 'female',
    });
    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(component.form.valid).toBe(true);
    expect(submitBtn.disabled).toBe(false);
  });

  it('deve cadastrar com sucesso e navegar para /home quando não houver returnUrl (CA1)', async () => {
    component.form.setValue({
      name: 'Ana UTFPR',
      email: 'ana@alunos.utfpr.edu.br',
      password: 'senhaSegura123',
      confirmPassword: 'senhaSegura123',
      gender: 'female',
    });
    fixture.detectChanges();

    await component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      name: 'Ana UTFPR',
      email: 'ana@alunos.utfpr.edu.br',
      password: 'senhaSegura123',
      gender: 'female',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('deve redirecionar para returnUrl após cadastro com sucesso caso parâmetro exista (CA1)', async () => {
    mockActivatedRoute.snapshot.queryParams = { returnUrl: '/rides/42' };

    component.form.setValue({
      name: 'Ana UTFPR',
      email: 'ana@alunos.utfpr.edu.br',
      password: 'senhaSegura123',
      confirmPassword: 'senhaSegura123',
      gender: 'female',
    });
    fixture.detectChanges();

    await component.onSubmit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/rides/42');
  });

  it('deve exibir "Este e-mail já está em uso" e limpar apenas os campos de senha (CA3)', async () => {
    authServiceSpy.register.mockRejectedValue(new Error('Este e-mail já está em uso'));

    component.form.setValue({
      name: 'Ana UTFPR',
      email: 'ana@alunos.utfpr.edu.br',
      password: 'senhaSegura123',
      confirmPassword: 'senhaSegura123',
      gender: 'female',
    });
    fixture.detectChanges();

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Este e-mail já está em uso');
    const alertEl = fixture.debugElement.query(By.css('[data-testid="alert-error"]'));
    expect(alertEl).toBeTruthy();
    expect(alertEl.nativeElement.textContent).toContain('Este e-mail já está em uso');

    // Campos de senha limpos
    expect(component.form.value.password).toBe('');
    expect(component.form.value.confirmPassword).toBe('');
    // Demais dados mantidos
    expect(component.form.value.name).toBe('Ana UTFPR');
    expect(component.form.value.email).toBe('ana@alunos.utfpr.edu.br');
    expect(component.form.value.gender).toBe('female');
  });

  it('deve exibir mensagem de servidor indisponível e manter todos os campos preenchidos (CA9)', async () => {
    authServiceSpy.register.mockRejectedValue(
      new Error('Servidor indisponível. Verifique se a API está em execução')
    );

    component.form.setValue({
      name: 'Carlos UTFPR',
      email: 'carlos@utfpr.edu.br',
      password: 'senhaSegura123',
      confirmPassword: 'senhaSegura123',
      gender: 'male',
    });
    fixture.detectChanges();

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Servidor indisponível. Verifique se a API está em execução');
    const alertEl = fixture.debugElement.query(By.css('[data-testid="alert-error"]'));
    expect(alertEl).toBeTruthy();
    expect(alertEl.nativeElement.textContent).toContain('Servidor indisponível');

    // Todos os campos mantidos
    expect(component.form.value.name).toBe('Carlos UTFPR');
    expect(component.form.value.email).toBe('carlos@utfpr.edu.br');
    expect(component.form.value.password).toBe('senhaSegura123');
    expect(component.form.value.confirmPassword).toBe('senhaSegura123');
    expect(component.form.value.gender).toBe('male');
  });
});
