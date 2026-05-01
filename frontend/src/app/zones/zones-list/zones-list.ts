import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-zones-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './zones-list.html',
  styleUrl: './zones-list.css'
})
export class ZonesList implements OnInit {
  zones: any[] = [];
  error = '';
  name = '';
  description = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.http.get<any>('http://localhost:4000/api/zones').subscribe({
      next: (res) => (this.zones = res.data || []),
      error: (err) => (this.error = err?.error?.message || 'No se pudo cargar zonas')
    });
  }

  create() {
    this.http.post<any>('http://localhost:4000/api/zones', { name: this.name, description: this.description }).subscribe({
      next: () => {
        this.name = '';
        this.description = '';
        this.load();
      },
      error: (err) => (this.error = err?.error?.message || 'No se pudo crear zona')
    });
  }
}
