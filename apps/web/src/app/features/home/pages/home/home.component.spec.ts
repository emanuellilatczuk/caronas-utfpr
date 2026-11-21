import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { HomeComponent } from './home.component';

describe('HomeComponent - formulário de busca', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: signal({
              id: 'user-1',
              name: 'Estudante Teste',
              email: 'estudante@alunos.utfpr.edu.br',
              gender: 'female',
              created_at: new Date().toISOString(),
            }),
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve exigir origem, destino, data e horário', () => {
    expect(component.searchForm.controls.origin.hasError('required')).toBe(true);
    expect(component.searchForm.controls.destination.hasError('required')).toBe(true);
    expect(component.searchForm.controls.date.hasError('required')).toBe(true);
    expect(component.searchForm.controls.time.hasError('required')).toBe(true);
  });

  it('deve invalidar origem e destino compostos apenas por espaços', () => {
    component.searchForm.controls.origin.setValue('   ');
    component.searchForm.controls.destination.setValue('\t  ');

    expect(component.searchForm.controls.origin.invalid).toBe(true);
    expect(component.searchForm.controls.origin.hasError('required')).toBe(true);
    expect(component.searchForm.controls.destination.invalid).toBe(true);
    expect(component.searchForm.controls.destination.hasError('required')).toBe(true);
  });

  it('não deve exibir erros antes da interação', () => {
    const errors = fixture.debugElement.queryAll(By.css('[data-testid^="error-"]'));
    expect(errors.length).toBe(0);
  });

  it('deve exibir mensagens em português após blur inválido', () => {
    const origin = fixture.debugElement.query(By.css('[data-testid="origin"]'));
    const destination = fixture.debugElement.query(By.css('[data-testid="destination"]'));
    const date = fixture.debugElement.query(By.css('[data-testid="date"]'));
    const time = fixture.debugElement.query(By.css('[data-testid="time"]'));

    origin.triggerEventHandler('blur', {});
    destination.triggerEventHandler('blur', {});
    date.triggerEventHandler('blur', {});
    time.triggerEventHandler('blur', {});
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('[data-testid="error-origin"]')).nativeElement.textContent,
    ).toContain('Origem é obrigatória');
    expect(
      fixture.debugElement.query(By.css('[data-testid="error-destination"]')).nativeElement
        .textContent,
    ).toContain('Destino é obrigatório');
    expect(
      fixture.debugElement.query(By.css('[data-testid="error-date"]')).nativeElement.textContent,
    ).toContain('Data é obrigatória');
    expect(
      fixture.debugElement.query(By.css('[data-testid="error-time"]')).nativeElement.textContent,
    ).toContain('Horário é obrigatório');
  });

  it('deve manter o botão de busca desabilitado enquanto o formulário estiver inválido', () => {
    const button = fixture.debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;

    expect(component.searchForm.invalid).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('deve associar mensagens de erro aos respectivos campos após interação', () => {
    const origin = fixture.debugElement.query(By.css('[data-testid="origin"]'));
    const destination = fixture.debugElement.query(By.css('[data-testid="destination"]'));
    const date = fixture.debugElement.query(By.css('[data-testid="date"]'));
    const time = fixture.debugElement.query(By.css('[data-testid="time"]'));

    origin.triggerEventHandler('blur', {});
    destination.triggerEventHandler('blur', {});
    date.triggerEventHandler('blur', {});
    time.triggerEventHandler('blur', {});
    fixture.detectChanges();

    expect(origin.nativeElement.getAttribute('aria-describedby')).toBe('error-origin');
    expect(origin.nativeElement.getAttribute('aria-invalid')).toBe('true');
    expect(destination.nativeElement.getAttribute('aria-describedby')).toBe('error-destination');
    expect(destination.nativeElement.getAttribute('aria-invalid')).toBe('true');
    expect(date.nativeElement.getAttribute('aria-describedby')).toBe('error-date');
    expect(date.nativeElement.getAttribute('aria-invalid')).toBe('true');
    expect(time.nativeElement.getAttribute('aria-describedby')).toBe('error-time');
    expect(time.nativeElement.getAttribute('aria-invalid')).toBe('true');
  });
});
