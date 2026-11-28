import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/pages/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
      path: 'profile',
      canActivate: [authGuard],
      loadComponent: () =>
        import('./features/profile/pages/profile-layout/profile-layout.component').then(
          (m) => m.ProfileLayoutComponent,
        ),
      children: [
        {
          path: '',
          pathMatch: 'full',
          loadComponent: () =>
            import('./features/profile/pages/profile-menu/profile-menu.component').then(
              (m) => m.ProfileMenuComponent,
            ),
        },
        {
          path: 'saved-routes',
          pathMatch: 'full',
          loadComponent: () =>
            import('./features/saved-routes/pages/saved-routes/saved-routes.component').then(
              (m) => m.SavedRoutesComponent,
            ),
        },
        {
          path: 'saved-routes/:id/edit',
          loadComponent: () =>
            import('./features/saved-routes/pages/saved-routes/saved-routes.component').then(
              (m) => m.SavedRoutesComponent,
            ),
        },
      ],
  },
  {
    path: 'saved-routes/new',
    pathMatch: 'full',
    redirectTo: '/home',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
