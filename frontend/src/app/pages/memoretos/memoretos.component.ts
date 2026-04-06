import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

const DIF: Record<string, string> = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
const DIF_C: Record<string, string> = { easy: '#15803d', medium: '#825500', hard: '#ba1a1a' };

@Component({
  selector: 'app-memoretos',
  standalone: true,
  imports: [NgStyle],
  template: `
    <div class="page-content" style="max-width:800px">
      <div>
        <button class="btn btn-full" style="margin-bottom:1.25rem;display:flex;align-items:center;gap:.5rem;justify-content:center"
                (click)="router.navigate(['/memoretos/nuevo'])">
          <span class="material-symbols-outlined">add_circle</span>
          Nuevo Memoreto
        </button>

        @if (loading) {
          <p class="empty">Cargando...</p>
        } @else if (memos.length === 0) {
          <p class="empty">No has creado memoretos aún.</p>
        } @else {
          <div class="card-list">
            @for (m of memos; track m.id) {
              <div class="level-card">
                <div class="level-header">
                  <span class="level-title">{{ m.title }}</span>
                  <span class="dif-badge" [ngStyle]="{ background: difColor(m.dificultad) }">{{ difLabel(m.dificultad) }}</span>
                </div>
                <div class="level-meta">
                  <span>Nivel {{ m.nivel }}</span>
                  @if (m.fase) { <span> · Fase {{ m.fase }}</span> }
                  <span> · {{ m.is_published ? '✅ Publicado en Unity' : '📝 Borrador' }}</span>
                </div>
                <div class="card-actions">
                  <button class="btn btn-sm" (click)="router.navigate(['/memoretos/editar', m.id])">Editar</button>
                  <button class="btn btn-sm btn-outline" (click)="togglePublish(m)">
                    {{ m.is_published ? 'Despublicar' : 'Publicar' }}
                  </button>
                  <button class="btn btn-sm btn-outline" (click)="toggleResults(m.id)">
                    📊 Resultados
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="handleDelete(m.id)">Borrar</button>
                </div>

                <!-- Panel de resultados expandible -->
                @if (openResultsId === m.id) {
                  @if (resultsLoading) {
                    <p style="margin:.75rem 0 0;color:#94a3b8;font-size:.85rem">Cargando resultados...</p>
                  } @else if (results) {
                    <div class="results-panel">
                      <div class="results-stats">
                        <div class="rstat">
                          <span class="rstat-val">{{ results.total_attempts }}</span>
                          <span class="rstat-lbl">intentos totales</span>
                        </div>
                        <div class="rstat">
                          <span class="rstat-val">{{ results.unique_solvers }}</span>
                          <span class="rstat-lbl">alumnos que lo resolvieron</span>
                        </div>
                        <div class="rstat">
                          <span class="rstat-val">{{ results.avg_score }}</span>
                          <span class="rstat-lbl">puntaje promedio</span>
                        </div>
                      </div>
                      @if (results.answers.length === 0) {
                        <p style="color:#64748b;font-size:.85rem;margin:.5rem 0 0">Nadie ha jugado este memoreto aún.</p>
                      } @else {
                        <table class="results-table">
                          <thead>
                            <tr>
                              <th>Alumno</th>
                              <th>Intentos</th>
                              <th>Puntaje</th>
                              <th>Resuelto</th>
                              <th>Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (a of results.answers.slice(0, 10); track $index) {
                              <tr>
                                <td>{{ a.name }}</td>
                                <td style="text-align:center">{{ a.intentos }}</td>
                                <td style="text-align:center">{{ a.score }}</td>
                                <td style="text-align:center">{{ a.resuelto ? '✅' : '❌' }}</td>
                                <td style="color:#64748b;font-size:.78rem">{{ a.submitted_at?.slice(0,16).replace('T',' ') }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                        @if (results.answers.length > 10) {
                          <p style="color:#64748b;font-size:.8rem;margin:.4rem 0 0">
                            Mostrando 10 de {{ results.answers.length }} resultados
                          </p>
                        }
                      }
                    </div>
                  }
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .results-panel {
      margin-top: .75rem;
      padding: .75rem;
      background: #0f172a;
      border-radius: 8px;
      border: 1px solid #1e293b;
    }
    .results-stats {
      display: flex;
      gap: 1.5rem;
      margin-bottom: .75rem;
    }
    .rstat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .rstat-val {
      font-size: 1.4rem;
      font-weight: 700;
      color: #38bdf8;
    }
    .rstat-lbl {
      font-size: .72rem;
      color: #64748b;
    }
    .results-table {
      width: 100%;
      border-collapse: collapse;
      font-size: .82rem;
    }
    .results-table th {
      text-align: left;
      color: #64748b;
      padding: .3rem .5rem;
      border-bottom: 1px solid #1e293b;
    }
    .results-table td {
      padding: .3rem .5rem;
      border-bottom: 1px solid #1e293b;
      color: #e2e8f0;
    }
    .results-table tr:last-child td { border-bottom: none; }
  `],
})
export class MemoretosComponent implements OnInit {
  memos: any[] = [];
  loading = true;

  openResultsId: number | null = null;
  resultsLoading = false;
  results: any = null;

  constructor(private auth: AuthService, private api: ApiService, public router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.fetch(); }

  async fetch() {
    try {
      const r = await this.api.getMyMemoretos(this.auth.token);
      this.memos = r.data.memoretos || [];
    } catch (e) {
      console.error('memoretos load error', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async handleDelete(id: number) {
    if (!confirm('¿Eliminar este memoreto?')) return;
    await this.api.deleteMemoreto(id, this.auth.token);
    this.fetch();
  }

  async togglePublish(m: any) {
    await this.api.updateMemoreto(m.id, { is_published: !m.is_published }, this.auth.token);
    this.fetch();
  }

  async toggleResults(id: number) {
    if (this.openResultsId === id) {
      this.openResultsId = null;
      this.results = null;
      return;
    }
    this.openResultsId = id;
    this.results = null;
    this.resultsLoading = true;
    this.cdr.detectChanges();
    try {
      const r = await this.api.getMemoretoAnswers(id, this.auth.token);
      this.results = r.data;
    } catch (e) {
      console.error('results load error', e);
    } finally {
      this.resultsLoading = false;
      this.cdr.detectChanges();
    }
  }

  difLabel(d: string): string { return DIF[d] || d; }
  difColor(d: string): string { return DIF_C[d] || '#94a3b8'; }
}
