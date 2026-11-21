import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoginCredentials, RegisterData, User } from '../models/user.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const mockUser: User = {
    id: 'user-123',
    name: 'Estudante UTFPR',
    email: 'estudante@alunos.utfpr.edu.br',
    gender: 'female',
    created_at: '2026-11-15T12:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    try {
      httpTesting.verify();
    } finally {
      localStorage.clear();
      TestBed.resetTestingModule();
    }
  });

  it('deve inicializar desautenticado quando localStorage estiver vazio', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('deve restaurar a sessão do localStorage no momento da inicialização', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('passai_token', 'fake-jwt-token');
    localStorage.setItem('passai_user', JSON.stringify(mockUser));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const restoredService = TestBed.inject(AuthService);
    expect(restoredService.currentUser()).toEqual(mockUser);
    expect(restoredService.isAuthenticated()).toBe(true);
  });

  describe('register', () => {
    const registerData: RegisterData = {
      name: 'Estudante UTFPR',
      email: 'estudante@alunos.utfpr.edu.br',
      password: 'senhaSegura123',
      gender: 'female',
    };

    it('deve registrar usuário com sucesso e salvar sessão no localStorage (CA1)', async () => {
      const registerPromise = service.register(registerData);

      // 1. Verificação se e-mail já existe
      const checkReq = httpTesting.expectOne(
        (req) => req.url === 'http://localhost:3000/users' && req.params.get('email') === registerData.email
      );
      expect(checkReq.request.method).toBe('GET');
      checkReq.flush([]);

      // Permite que a Promise processe e dispare a requisição POST seguinte
      await Promise.resolve();

      // 2. Criação do usuário
      const createReq = httpTesting.expectOne('http://localhost:3000/users');
      expect(createReq.request.method).toBe('POST');
      expect(createReq.request.body.email).toBe(registerData.email);
      expect(createReq.request.body.name).toBe(registerData.name);
      createReq.flush(mockUser);

      const createdUser = await registerPromise;
      expect(createdUser).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('passai_token')).toBeTruthy();
      expect(JSON.parse(localStorage.getItem('passai_user')!)).toEqual(mockUser);
    });

    it('deve rejeitar cadastro com erro específico se o e-mail já estiver cadastrado (CA3)', async () => {
      const registerPromise = service.register(registerData);

      const checkReq = httpTesting.expectOne(
        (req) => req.url === 'http://localhost:3000/users' && req.params.get('email') === registerData.email
      );
      checkReq.flush([mockUser]); // E-mail já existe

      await expect(registerPromise).rejects.toThrow('Este e-mail já está em uso');
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('deve lançar erro amigável se a API estiver indisponível no cadastro (CA9)', async () => {
      const registerPromise = service.register(registerData);

      const checkReq = httpTesting.expectOne(
        (req) => req.url === 'http://localhost:3000/users' && req.params.get('email') === registerData.email
      );
      checkReq.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      await expect(registerPromise).rejects.toThrow('Servidor indisponível. Verifique se a API está em execução');
    });
  });

  describe('login', () => {
    const credentials: LoginCredentials = {
      email: 'estudante@alunos.utfpr.edu.br',
      password: 'senhaSegura123',
    };

    it('deve autenticar usuário com credenciais corretas e salvar sessão (CA2)', async () => {
      const loginPromise = service.login(credentials);

      const req = httpTesting.expectOne(
        (req) => req.url === 'http://localhost:3000/users' && req.params.get('email') === credentials.email
      );
      expect(req.request.method).toBe('GET');
      req.flush([{ ...mockUser, password: 'senhaSegura123' }]);

      const loggedUser = await loginPromise;
      expect(loggedUser).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('passai_token')).toBeTruthy();
    });

    it('deve rejeitar login com mensagem opaca se a senha estiver incorreta (CA6, RN03)', async () => {
      const loginPromise = service.login(credentials);

      const req = httpTesting.expectOne(
        (req) => req.url === 'http://localhost:3000/users' && req.params.get('email') === credentials.email
      );
      req.flush([{ ...mockUser, password: 'outraSenhaDiferente' }]);

      await expect(loginPromise).rejects.toThrow('E-mail ou senha inválidos');
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('deve rejeitar login com mensagem opaca se o e-mail não existir (CA6, RN03)', async () => {
      const loginPromise = service.login(credentials);

      const req = httpTesting.expectOne(
        (req) => req.url === 'http://localhost:3000/users' && req.params.get('email') === credentials.email
      );
      req.flush([]); // Nenhum usuário encontrado

      await expect(loginPromise).rejects.toThrow('E-mail ou senha inválidos');
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('deve lançar erro amigável se a API estiver indisponível no login (CA9)', async () => {
      const loginPromise = service.login(credentials);

      const req = httpTesting.expectOne(
        (req) => req.url === 'http://localhost:3000/users' && req.params.get('email') === credentials.email
      );
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      await expect(loginPromise).rejects.toThrow('Servidor indisponível. Verifique se a API está em execução');
    });
  });

  describe('logout', () => {
    it('deve limpar sessão e resetar signal de usuário logado', () => {
      service.currentUser.set(mockUser);
      localStorage.setItem('passai_token', 'token');
      localStorage.setItem('passai_user', JSON.stringify(mockUser));

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('passai_token')).toBeNull();
      expect(localStorage.getItem('passai_user')).toBeNull();
    });
  });
});
