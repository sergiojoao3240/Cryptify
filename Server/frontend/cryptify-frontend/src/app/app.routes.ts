import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { VerifyPin } from './pages/verify-pin/verify-pin';
import { Dashboard } from './pages/dashboard/dashboard';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'validate-pin', component: VerifyPin },
  { path: 'dashboard', component: Dashboard },
  { path: 'profile', component: Profile },
  { path: '**', redirectTo: 'login' },
 ]; 
