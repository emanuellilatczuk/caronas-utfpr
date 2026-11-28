import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { ViaCepRawResponse } from '../models/saved-route.model';
import { ViaCepService } from './viacep.service';

describe('ViaCepService', () => {
  let service: ViaCepService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViaCepService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ViaCepService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('deve validar e rejeitar CEP com tamanho diferente de 8 dígitos sem chamar a API', async () => {
    const promise = firstValueFrom(service.getAddressByCep('1234'));
    httpTesting.expectNone('https://viacep.com.br/ws/1234/json/');
    await expect(promise).rejects.toThrow('Informe um CEP válido com 8 dígitos');
  });

  it('deve rejeitar CEP com caracteres não numéricos além do hífen', async () => {
    const promise = firstValueFrom(service.getAddressByCep('8001AB1010'));
    const rejection = expect(promise).rejects.toThrow('Informe um CEP válido com 8 dígitos');
    httpTesting.expectNone(() => true);

    await rejection;
  });

  it('deve higienizar CEP contendo hífen e caracteres especiais antes da requisição', async () => {
    const mockResponse: ViaCepRawResponse = {
      cep: '80010-010',
      logradouro: 'Rua Marechal Deodoro',
      bairro: 'Centro',
      localidade: 'Curitiba',
      uf: 'PR',
    };

    const promise = firstValueFrom(service.getAddressByCep('80010-010'));
    const req = httpTesting.expectOne('https://viacep.com.br/ws/80010010/json/');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const result = await promise;
    expect(result.logradouro).toBe('Rua Marechal Deodoro');
    expect(result.bairro).toBe('Centro');
    expect(result.localidade).toBe('Curitiba');
    expect(result.uf).toBe('PR');
    expect(result.address).toBe('Rua Marechal Deodoro, Centro - Curitiba');
  });

  it('deve formatar o endereço adequadamente caso logradouro ou bairro estejam ausentes', async () => {
    const mockResponse: ViaCepRawResponse = {
      cep: '85501-000',
      logradouro: '',
      bairro: '',
      localidade: 'Pato Branco',
      uf: 'PR',
    };

    const promise = firstValueFrom(service.getAddressByCep('85501000'));
    const req = httpTesting.expectOne('https://viacep.com.br/ws/85501000/json/');
    req.flush(mockResponse);

    const result = await promise;
    expect(result.localidade).toBe('Pato Branco');
    expect(result.address).toBe('Pato Branco - PR');
  });

  it('deve lançar erro "CEP não encontrado" quando a API retornar { erro: true }', async () => {
    const promise = firstValueFrom(service.getAddressByCep('99999999'));
    const req = httpTesting.expectOne('https://viacep.com.br/ws/99999999/json/');
    req.flush({ erro: true });

    await expect(promise).rejects.toThrow('CEP não encontrado');
  });

  it('deve lançar erro "Não foi possível buscar o CEP automaticamente" em caso de falha de rede/HTTP', async () => {
    const promise = firstValueFrom(service.getAddressByCep('80010010'));
    const req = httpTesting.expectOne('https://viacep.com.br/ws/80010010/json/');
    req.error(new ProgressEvent('Network error'));

    await expect(promise).rejects.toThrow('Não foi possível buscar o CEP automaticamente');
  });

  it('deve usar o mesmo fallback quando a API responder com erro HTTP', async () => {
    const promise = firstValueFrom(service.getAddressByCep('80010010'));
    const req = httpTesting.expectOne('https://viacep.com.br/ws/80010010/json/');
    req.flush('Serviço indisponível', {
      status: 503,
      statusText: 'Service Unavailable',
    });

    await expect(promise).rejects.toThrow('Não foi possível buscar o CEP automaticamente');
  });

  it('deve encerrar com fallback quando a API ultrapassar 3 segundos', async () => {
    vi.useFakeTimers();
    try {
      const promise = firstValueFrom(service.getAddressByCep('80010010'));
      const rejection = expect(promise).rejects.toThrow(
        'Não foi possível buscar o CEP automaticamente',
      );
      httpTesting.expectOne('https://viacep.com.br/ws/80010010/json/');

      await vi.advanceTimersByTimeAsync(3000);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });

  it('deve integrar com Signals e RxJS via toSignal e toObservable', async () => {
    expect(service.currentAddress()).toBeNull();

    service.setSearchCep('80010010');
    TestBed.flushEffects();

    const req = httpTesting.expectOne('https://viacep.com.br/ws/80010010/json/');
    req.flush({
      cep: '80010-010',
      logradouro: 'Rua Marechal Deodoro',
      bairro: 'Centro',
      localidade: 'Curitiba',
      uf: 'PR',
    });

    TestBed.flushEffects();
    const state = service.currentAddress();
    expect(state?.status).toBe('success');
    if (state?.status === 'success') {
      expect(state.address).toBe('Rua Marechal Deodoro, Centro - Curitiba');
    }
  });

  it('deve preservar o tipo e a mensagem do erro no estado reativo do CEP', () => {
    service.setSearchCep('99999999');
    TestBed.flushEffects();

    const req = httpTesting.expectOne('https://viacep.com.br/ws/99999999/json/');
    req.flush({ erro: true });
    TestBed.flushEffects();

    expect(service.currentAddress()).toEqual({
      status: 'error',
      kind: 'not-found',
      message: 'CEP não encontrado',
    });
  });

  it('deve classificar CEP inválido e falha de rede no estado reativo', () => {
    service.setSearchCep('1234');
    TestBed.flushEffects();
    httpTesting.expectNone(() => true);
    expect(service.currentAddress()).toEqual({
      status: 'error',
      kind: 'invalid-cep',
      message: 'Informe um CEP válido com 8 dígitos',
    });

    service.setSearchCep('80010010');
    TestBed.flushEffects();
    const req = httpTesting.expectOne('https://viacep.com.br/ws/80010010/json/');
    req.error(new ProgressEvent('Network error'));
    TestBed.flushEffects();
    expect(service.currentAddress()).toEqual({
      status: 'error',
      kind: 'network-error',
      message: 'Não foi possível buscar o CEP automaticamente',
    });
  });

  it('deve classificar timeout como erro distinto no estado reativo', async () => {
    vi.useFakeTimers();
    try {
      service.setSearchCep('80010010');
      TestBed.flushEffects();
      httpTesting.expectOne('https://viacep.com.br/ws/80010010/json/');

      await vi.advanceTimersByTimeAsync(3000);
      TestBed.flushEffects();

      expect(service.currentAddress()).toEqual({
        status: 'error',
        kind: 'timeout',
        message: 'Não foi possível buscar o CEP automaticamente',
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
