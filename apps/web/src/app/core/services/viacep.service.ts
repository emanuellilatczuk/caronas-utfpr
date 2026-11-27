import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  map,
  Observable,
  of,
  switchMap,
  TimeoutError,
  throwError,
  timeout,
} from 'rxjs';
import {
  ViaCepAddress,
  ViaCepErrorKind,
  ViaCepRawResponse,
} from '../models/saved-route.model';

type ViaCepReactiveState =
  | (ViaCepAddress & { status: 'success' })
  | { status: 'error'; kind: ViaCepErrorKind | 'timeout'; message: string }
  | null;

class ViaCepLookupError extends Error {
  constructor(
    readonly kind: 'network-error' | 'timeout',
    message: string,
  ) {
    super(message);
  }
}

@Injectable({
  providedIn: 'root',
})
export class ViaCepService {
  private readonly http = inject(HttpClient);

  // Sinais e ponte reativa RxJS (ID20, ID25)
  private readonly selectedCep = signal<string>('');
  readonly selectedCep$ = toObservable(this.selectedCep);

  readonly currentAddress = toSignal(
    this.selectedCep$.pipe(
      switchMap((cep) => {
        if (!cep) {
          return of(null);
        }
        return this.getAddressByCep(cep).pipe(
          map((address): ViaCepReactiveState => ({ status: 'success', ...address })),
          catchError((error: unknown) => of(this.toErrorState(error))),
        );
      }),
    ),
    { initialValue: null },
  );

  /**
   * Atualiza o CEP gerenciado pelo serviço, disparando a busca reativa via toObservable/toSignal
   */
  setSearchCep(cep: string): void {
    this.selectedCep.set(cep);
  }

  /**
   * Consulta a API pública do ViaCEP de forma assíncrona com validação, timeout e resiliência (RN16, RN17, RNF04)
   */
  getAddressByCep(cep: string): Observable<ViaCepAddress> {
    const formattedCep = cep || '';

    if (!/^\d{5}-?\d{3}$/.test(formattedCep)) {
      return throwError(() => new Error('Informe um CEP válido com 8 dígitos'));
    }

    const cleanCep = formattedCep.replace('-', '');
    const url = `https://viacep.com.br/ws/${cleanCep}/json/`;

    return this.http.get<ViaCepRawResponse>(url).pipe(
      timeout(3000),
      map((response) => {
        if (response.erro === true || response.erro === 'true') {
          throw new Error('CEP não encontrado');
        }

        const logradouro = response.logradouro?.trim() || '';
        const bairro = response.bairro?.trim() || '';
        const localidade = response.localidade?.trim() || '';
        const uf = response.uf?.trim() || '';

        return {
          address: this.formatAddress(logradouro, bairro, localidade, uf),
          logradouro,
          bairro,
          localidade,
          uf,
          cep: cleanCep,
        };
      }),
      catchError((error: unknown) => {
        if (error instanceof Error) {
          if (
            error.message === 'Informe um CEP válido com 8 dígitos' ||
            error.message === 'CEP não encontrado'
          ) {
            return throwError(() => error);
          }
          if (error instanceof TimeoutError) {
            return throwError(
              () =>
                new ViaCepLookupError(
                  'timeout',
                  'Não foi possível buscar o CEP automaticamente',
                ),
            );
          }
        }
        return throwError(
          () =>
            new ViaCepLookupError(
              'network-error',
              'Não foi possível buscar o CEP automaticamente',
            ),
        );
      }),
    );
  }

  private formatAddress(
    logradouro: string,
    bairro: string,
    localidade: string,
    uf: string,
  ): string {
    if (logradouro && bairro) {
      return `${logradouro}, ${bairro} - ${localidade}`;
    }
    if (logradouro) {
      return `${logradouro} - ${localidade}`;
    }
    if (bairro) {
      return `${bairro} - ${localidade}`;
    }
    if (localidade && uf) {
      return `${localidade} - ${uf}`;
    }
    return localidade;
  }

  private toErrorState(error: unknown): Extract<ViaCepReactiveState, { status: 'error' }> {
    if (error instanceof ViaCepLookupError) {
      return { status: 'error', kind: error.kind, message: error.message };
    }

    let message =
      error instanceof Error
        ? error.message
        : 'Não foi possível buscar o CEP automaticamente';

    let kind: ViaCepErrorKind;
    if (message === 'Informe um CEP válido com 8 dígitos') {
      kind = 'invalid-cep';
    } else if (message === 'CEP não encontrado') {
      kind = 'not-found';
    } else {
      kind = 'network-error';
      message = 'Não foi possível buscar o CEP automaticamente';
    }

    return { status: 'error', kind, message };
  }
}
