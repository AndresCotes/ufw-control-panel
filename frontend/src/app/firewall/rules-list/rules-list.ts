import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirewallApiService } from '../../core/services/firewall-api';

@Component({
  selector: 'app-rules-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './rules-list.html',
  styleUrl: './rules-list.css'
})
export class RulesList implements OnInit {
  loading = true;
  saving = false;
  error = '';
  success = '';
  backendWarning = '';
  rules: any[] = [];
  interfaces: string[] = [];
  preview = '';

  form = {
    action: 'allow',
    direction: 'in',
    interfaceName: '',
    sourceIp: 'any',
    destinationIp: 'any',
    port: '22',
    protocol: 'tcp',
    comment: ''
  };

  constructor(private api: FirewallApiService) {}

  ngOnInit(): void {
    this.load();
    this.loadInterfaces();
  }

  loadInterfaces() {
    this.api.getInterfaces().subscribe({
      next: (res) => (this.interfaces = res.data || []),
      error: () => (this.interfaces = [])
    });
  }

  load() {
    this.loading = true;
    this.error = '';
    this.backendWarning = '';
    this.api.getRules().subscribe({
      next: (res) => {
        this.rules = res.data.rules || [];
        if (!res.data.ufwOk) {
          this.backendWarning = res.data.stderr || 'No se pudo consultar UFW; revisa sudoers.';
        }
      },
      error: (err) => (this.error = err?.error?.message || 'No se pudieron cargar reglas'),
      complete: () => (this.loading = false)
    });
  }

  makePreview() {
    this.preview = '';
    this.error = '';
    this.api.previewRule(this.form).subscribe({
      next: (res) => (this.preview = res.data.commandPreview),
      error: (err) => (this.error = err?.error?.message || 'No se pudo generar preview')
    });
  }

  createRule() {
    this.saving = true;
    this.success = '';
    this.error = '';
    this.api.createRule(this.form).subscribe({
      next: (res) => {
        this.success = res.message || 'Regla creada';
        this.load();
      },
      error: (err) => (this.error = err?.error?.message || 'No se pudo crear regla'),
      complete: () => (this.saving = false)
    });
  }

  deleteRule(ruleNumber: number) {
    if (!confirm(`¿Eliminar regla #${ruleNumber}?`)) return;
    this.api.deleteRule(ruleNumber).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err?.error?.message || 'No se pudo eliminar')
    });
  }
}
