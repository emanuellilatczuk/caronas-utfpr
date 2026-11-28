import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ViaCepAddress } from '../../../../core/models/saved-route.model';
import { ViaCepService } from '../../../../core/services/viacep.service';
import { CepSearchInputComponent } from './cep-search-input.component';

@Component({
  imports: [CepSearchInputComponent],
  template: ` <app-cep-search-input [(cep)]="cep" (addressFound)="address.set($event)" /> `,
})
class CepSearchHostComponent {
  readonly cep = signal('80010-010');
  readonly address = signal('');
}

describe('CepSearchInputComponent', () => {
  let fixture: ComponentFixture<CepSearchHostComponent>;
  let viaCepService: { getAddressByCep: ReturnType<typeof vi.fn> };

  const address: ViaCepAddress = {
    address: 'Rua Marechal Deodoro, Centro - Curitiba',
    logradouro: 'Rua Marechal Deodoro',
    bairro: 'Centro',
    localidade: 'Curitiba',
    uf: 'PR',
    cep: '80010010',
  };

  beforeEach(async () => {
    viaCepService = {
      getAddressByCep: vi.fn().mockReturnValue(of(address)),
    };

    await TestBed.configureTestingModule({
      imports: [CepSearchHostComponent],
      providers: [{ provide: ViaCepService, useValue: viaCepService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CepSearchHostComponent);
    fixture.detectChanges();
  });

  it('deve sincronizar o CEP por model() nos dois sentidos', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.value).toBe('80010-010');
    expect(input.classList).toContain('py-2');
    expect(input.classList).toContain('font-body');
    expect(input.classList).toContain('text-body');
    expect(input.classList).toContain('font-medium');

    input.value = '80010010';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.cep()).toBe('80010010');
  });

  it('deve usar tamanhos tipográficos semânticos nos elementos do formulário', () => {
    const label = fixture.debugElement.query(By.css('p')).nativeElement as HTMLParagraphElement;
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    expect(label.classList).toContain('font-label');
    expect(label.classList).toContain('text-label');
    expect(label.classList).toContain('font-semibold');
    expect(button.classList).toContain('font-button-primary');
    expect(button.classList).toContain('text-button-primary');
    expect(button.classList).toContain('font-semibold');
    expect(button.classList).toContain('py-2');
  });

  it('deve consultar ViaCepService e emitir o endereço encontrado via output()', () => {
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    fixture.detectChanges();

    expect(viaCepService.getAddressByCep).toHaveBeenCalledWith('80010-010');
    expect(fixture.componentInstance.address()).toBe(address.address);
  });

  it.each([
    ['CEP inválido', 'Informe um CEP válido com 8 dígitos'],
    ['CEP inexistente', 'CEP não encontrado'],
    ['falha de rede', 'Não foi possível buscar o CEP automaticamente'],
  ])('deve exibir alerta inline não bloqueante para %s', (_scenario, message) => {
    viaCepService.getAddressByCep.mockReturnValue(throwError(() => new Error(message)));

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(alert.nativeElement.textContent).toContain(message);
    expect(alert.nativeElement.classList).toContain('font-caption');
    expect(alert.nativeElement.classList).toContain('text-caption');
    expect(alert.nativeElement.classList).toContain('font-normal');
    expect(input.disabled).toBe(false);
  });

  it('deve cancelar a busca anterior quando o CEP é alterado', () => {
    const pendingAddress = new Subject<ViaCepAddress>();
    viaCepService.getAddressByCep.mockReturnValue(pendingAddress);

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    fixture.detectChanges();
    const status = fixture.debugElement.query(By.css('[role="status"]'))
      .nativeElement as HTMLParagraphElement;
    expect(status.classList).toContain('font-caption');
    expect(status.classList).toContain('text-caption');
    expect(status.classList).toContain('font-normal');

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    pendingAddress.next(address);
    fixture.detectChanges();

    expect(fixture.componentInstance.address()).toBe('');
    expect(fixture.debugElement.query(By.css('[role="status"]'))).toBeNull();
  });
});
