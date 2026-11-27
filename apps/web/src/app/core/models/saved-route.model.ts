export interface SavedRoute {
  id: string;
  user_id: string;
  name: string;
  origin: string;
  destination: string;
  preferred_time: string;
  days_of_week: string[];
  women_only: boolean;
  created_at: string;
}

export type CreateSavedRouteDto = Omit<SavedRoute, 'id' | 'created_at'>;
export type UpdateSavedRouteDto = Partial<CreateSavedRouteDto>;

export interface ViaCepRawResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean | string;
}

export interface ViaCepAddress {
  address: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  cep?: string;
}

export type ViaCepErrorKind = 'invalid-cep' | 'not-found' | 'network-error';

export type ViaCepAddressState =
  | (ViaCepAddress & { status: 'success' })
  | { status: 'error'; kind: ViaCepErrorKind; message: string }
  | null;
