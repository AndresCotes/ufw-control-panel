import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:4000/api';
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password });
  }

  setSession(token: string) {
    localStorage.setItem('token', token);
    this.isLoggedIn.set(true);
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
