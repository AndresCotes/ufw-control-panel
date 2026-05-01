import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirewallApiService } from '../../core/services/firewall-api';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  loading = true;
  error = '';
  summary: any = null;

  constructor(private api: FirewallApiService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.error = '';
    this.api.getDashboard().subscribe({
      next: (res) => (this.summary = res.data),
      error: (err) => (this.error = err?.error?.message || 'No se pudo cargar dashboard'),
      complete: () => (this.loading = false)
    });
  }

  setFirewall(action: 'enable' | 'disable' | 'reload') {
    const call = action === 'enable' ? this.api.ufwEnable() : action === 'disable' ? this.api.ufwDisable() : this.api.ufwReload();
    call.subscribe({
      next: () => this.refresh(),
      error: (err) => (this.error = err?.error?.message || 'Falló la acción firewall')
    });
  }
}
