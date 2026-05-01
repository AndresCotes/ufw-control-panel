import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-audit-list',
  imports: [CommonModule],
  templateUrl: './audit-list.html',
  styleUrl: './audit-list.css'
})
export class AuditList implements OnInit {
  logs: any[] = [];
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:4000/api/audit').subscribe({
      next: (res) => (this.logs = res.data || []),
      error: (err) => (this.error = err?.error?.message || 'No se pudo cargar auditoría')
    });
  }
}
