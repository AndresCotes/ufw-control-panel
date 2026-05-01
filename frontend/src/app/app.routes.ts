import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './dashboard/home/home';
import { RulesList } from './firewall/rules-list/rules-list';
import { ZonesList } from './zones/zones-list/zones-list';
import { AuditList } from './audit/audit-list/audit-list';
import { UsersList } from './users/users-list/users-list';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Home },
      { path: 'firewall/rules', component: RulesList },
      { path: 'zones', component: ZonesList },
      { path: 'audit', component: AuditList },
      { path: 'users', component: UsersList }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
