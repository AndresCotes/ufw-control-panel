import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FirewallApiService {
  private apiUrl = 'http://localhost:4000/api';
  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<any>(`${this.apiUrl}/dashboard/summary`);
  }

  getRules() {
    return this.http.get<any>(`${this.apiUrl}/rules`);
  }

  getInterfaces() {
    return this.http.get<any>(`${this.apiUrl}/firewall/interfaces`);
  }

  previewRule(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/rules/preview`, payload);
  }

  createRule(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/rules`, payload);
  }

  deleteRule(ufwNumber: number) {
    return this.http.delete<any>(`${this.apiUrl}/rules/${ufwNumber}`);
  }

  ufwStatus() {
    return this.http.get<any>(`${this.apiUrl}/firewall/status`);
  }

  ufwEnable() {
    return this.http.post<any>(`${this.apiUrl}/firewall/enable`, {});
  }

  ufwDisable() {
    return this.http.post<any>(`${this.apiUrl}/firewall/disable`, {});
  }

  ufwReload() {
    return this.http.post<any>(`${this.apiUrl}/firewall/reload`, {});
  }
}
