import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersList implements OnInit {
  users: any[] = [];
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:4000/api/users').subscribe({
      next: (res) => (this.users = res.data || []),
      error: (err) => (this.error = err?.error?.message || 'No se pudo cargar usuarios (requiere admin)')
    });
  }
}
