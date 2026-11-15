import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoginCredentials, RegisterData, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly apiUrl = 'http://localhost:3000/users';

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.restoreSession();
  }

  /**
   * Registra um novo usuário no sistema:
   * 1. Verifica se o e-mail institucional já existe na base (CA3);
   * 2. Persiste o usuário no mock/BaaS (CA1);
   * 3. Inicializa e salva a sessão no localStorage.
   */
  async register(data: RegisterData): Promise<User> {
    if (!this.http) {
      throw new Error('HttpClient não disponível');
    }

    try {
      const existing = await firstValueFrom(
        this.http.get<User[]>(this.apiUrl, {
          params: { email: data.email },
        })
      );

      if (existing && existing.length > 0) {
        throw new Error('Este e-mail já está em uso');
      }

      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `user-${Date.now()}`;

      const newRecord = {
        id,
        name: data.name,
        email: data.email,
        password: data.password,
        gender: data.gender,
        created_at: new Date().toISOString(),
      };

      const created = await firstValueFrom(
        this.http.post<User & { password?: string }>(this.apiUrl, newRecord)
      );

      const user: User = {
        id: created.id,
        name: created.name,
        email: created.email,
        gender: created.gender,
        avatar_url: created.avatar_url,
        created_at: created.created_at,
      };

      this.saveSession(`passai-token-${user.id}`, user);
      return user;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Valida credenciais e realiza o login:
   * 1. Localiza o usuário por e-mail e confere a senha;
   * 2. Emite mensagem opaca de erro caso falhe (CA6, RN03);
   * 3. Inicializa e salva a sessão em caso de sucesso (CA2).
   */
  async login(credentials: LoginCredentials): Promise<User> {
    if (!this.http) {
      throw new Error('HttpClient não disponível');
    }

    try {
      const users = await firstValueFrom(
        this.http.get<(User & { password?: string })[]>(this.apiUrl, {
          params: { email: credentials.email },
        })
      );

      const matchedUser = users?.[0];

      if (!matchedUser || matchedUser.password !== credentials.password) {
        throw new Error('E-mail ou senha inválidos');
      }

      const user: User = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        gender: matchedUser.gender,
        avatar_url: matchedUser.avatar_url,
        created_at: matchedUser.created_at,
      };

      this.saveSession(`passai-token-${user.id}`, user);
      return user;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Encerra a sessão do usuário, limpando o localStorage e o signal de estado.
   */
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('passai_token');
      localStorage.removeItem('passai_user');
    }
    this.currentUser.set(null);
  }

  private restoreSession(): void {
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('passai_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser) as User;
          this.currentUser.set(user);
        } catch {
          localStorage.removeItem('passai_user');
          localStorage.removeItem('passai_token');
        }
      }
    }
  }

  private saveSession(token: string, user: User): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('passai_token', token);
      localStorage.setItem('passai_user', JSON.stringify(user));
    }
    this.currentUser.set(user);
  }

  private handleError(error: unknown): never {
    if (error instanceof Error && (error.message === 'Este e-mail já está em uso' || error.message === 'E-mail ou senha inválidos')) {
      throw error;
    }

    if (error instanceof HttpErrorResponse || (typeof error === 'object' && error !== null && 'status' in error)) {
      const status = (error as { status?: number }).status;
      if (status === 0 || (typeof status === 'number' && status >= 500)) {
        throw new Error('Servidor indisponível. Verifique se a API está em execução');
      }
    }

    throw error;
  }
}
