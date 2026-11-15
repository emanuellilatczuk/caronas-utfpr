import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginComponent } from './login.component';
import { User } from '../../../../core/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let authServiceSpy: { login: ReturnType<typeof vi.fn> };
  let mockActivatedRoute: { snapshot: { queryParams: Record<string, string> } };

  const mockUser: User = {
    id: 'user-login-1',
    name: 'Estudante Teste',
    email: 'estudante@alunos.utfpr.edu.br',
    gender: 'male',
    created_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    authServiceSpy = {
      login: vi.fn().mockResolvedValue(mockUser),
    };

    mockActivatedRoute = {
      snapshot: { queryParams: {} },
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('deve inicializar com formulário limpo', () => {
    expect(component).toBeTruthy();
    expect(component.form.value.email).toBe('');
    expect(component.form.value.password).toBe('');
    expect(component.form.pristine).toBe(true);
  });

  it('deve manter o botão "Entrar" desabilitado enquanto o formulário for inválido', () => {
    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(component.form.invalid).toBe(true);
    expect(submitBtn.disabled).toBe(true);
  });

  it('deve exibir mensagem de erro sob o campo de e-mail quando inválido e tocado', () => {
    const emailControl = component.form.controls.email;
    emailControl.setValue('invalido@gmail.com');
    emailControl.markAsTouched();
    fixture.detectChanges();

    expect(emailControl.hasError('nonUtfprEmail')).toBe(true);
    const errorEl = fixture.debugElement.query(By.css('[data-testid="error-email"]'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('domínios institucionais da UTFPR');
  });

  it('deve habilitar o botão de login quando e-mail institucional e senha forem preenchidos', () => {
    component.form.setValue({
      email: 'estudante@alunos.utfpr.edu.br',
      password: 'minhaSenha123',
    });
    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(component.form.valid).toBe(true);
    expect(submitBtn.disabled).toBe(false);
  });

  it('deve autenticar com sucesso e navegar para /home quando não houver returnUrl (CA2)', async () => {
    component.form.setValue({
      email: 'estudante@alunos.utfpr.edu.br',
      password: 'minhaSenha123',
    });
    fixture.detectChanges();

    await component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'estudante@alunos.utfpr.edu.br',
      password: 'minhaSenha123',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('deve autenticar e redirecionar para returnUrl caso o parâmetro exista (CA2)', async () => {
    mockActivatedRoute.snapshot.queryParams = { returnUrl: '/rides/99' };

    component.form.setValue({
      email: 'estudante@alunos.utfpr.edu.br',
      password: 'minhaSenha123',
    });
    fixture.detectChanges();

    await component.onSubmit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/rides/99');
  });

  it('deve exibir mensagem opaca "E-mail ou senha inválidos" em falhas de credenciais (CA6 / RN03)', async () => {
    authServiceSpy.login.mockRejectedValue(new Error('E-mail ou senha inválidos'));

    component.form.setValue({
      email: 'estudante@alunos.utfpr.edu.br',
      password: 'senhaIncorreta',
    });
    fixture.detectChanges();

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('E-mail ou senha inválidos');
    const alertEl = fixture.debugElement.query(By.css('[data-testid="alert-error"]'));
    expect(alertEl).toBeTruthy();
    expect(alertEl.nativeElement.textContent).toContain('E-mail ou senha inválidos');

    // Limpa o campo de senha por segurança, mantém o e-mail
    expect(component.form.value.password).toBe('');
    expect(component.form.value.email).toBe('estudante@alunos.utfpr.edu.br');
  });

  it('deve exibir mensagem de servidor indisponível mantendo todos os campos preenchidos (CA9)', async () => {
    authServiceSpy.login.mockRejectedValue(
      new Error('Servidor indisponível. Verifique se a API está em execução')
    );

    component.form.setValue({
      email: 'servidor@utfpr.edu.br',
      password: 'minhaSenha123',
    });
    fixture.detectChanges();

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Servidor indisponível. Verifique se a API está em execução');
    const alertEl = fixture.debugElement.query(By.css('[data-testid="alert-error"]'));
    expect(alertEl).toBeTruthy();
    expect(alertEl.nativeElement.textContent).toContain('Servidor indisponível');

    // Preserva campos para nova tentativa
    expect(component.form.value.email).toBe('servidor@utfpr.edu.br');
    expect(component.form.value.password).toBe('minhaSenha123');
  });
});
