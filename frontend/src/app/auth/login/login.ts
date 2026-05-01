import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = 'admin@local';
  password = 'Admin123!';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.auth.setSession(res.data.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo iniciar sesión';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
