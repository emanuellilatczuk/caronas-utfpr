import { Component, DestroyRef, inject, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ViaCepService } from '../../../../core/services/viacep.service';

@Component({
  selector: 'app-cep-search-input',
  templateUrl: './cep-search-input.component.html',
})
export class CepSearchInputComponent {
  private readonly viaCepService = inject(ViaCepService);
  private readonly destroyRef = inject(DestroyRef);
  private lookupSubscription: Subscription | null = null;

  readonly cep = model<string>('');
  readonly addressFound = output<string>();
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  updateCep(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.cancelLookup();
    this.cep.set(target.value);
    this.errorMessage.set(null);
  }

  search(): void {
    this.cancelLookup();
    this.errorMessage.set(null);
    this.loading.set(true);

    this.lookupSubscription = this.viaCepService
      .getAddressByCep(this.cep())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          this.addressFound.emit(result.address);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.errorMessage.set(
            error instanceof Error
              ? error.message
              : 'Não foi possível buscar o CEP automaticamente',
          );
        },
      });
  }

  private cancelLookup(): void {
    this.lookupSubscription?.unsubscribe();
    this.lookupSubscription = null;
    this.loading.set(false);
  }
}
