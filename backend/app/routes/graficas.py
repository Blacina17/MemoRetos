# -*- coding: utf-8 -*-
"""
Graficas standalone generadas con Plotly Python.
  /graficas  — Pagina unica con ambas graficas por integrante
"""
from flask import Blueprint
import plotly.graph_objects as go

graficas_bp = Blueprint("graficas", __name__)

# ---------------------------------------------------------------------------
# Datos ficticios
# ---------------------------------------------------------------------------
EASY_DATA = [
    ("ana_g",    45,  950, "Capitales de America"),
    ("luis_m",   60,  880, "Capitales de America"),
    ("mario_r",  30, 1000, "Capitales de America"),
    ("sofia_p",  75,  820, "Tabla del 7"),
    ("carlos_v", 55,  900, "Tabla del 7"),
    ("elena_s",  40,  970, "Tabla del 7"),
    ("pedro_n",  90,  760, "Capitales de America"),
    ("laura_t",  35,  990, "Tabla del 7"),
    ("jorge_f",  50,  930, "Capitales de America"),
    ("maria_l",  65,  860, "Tabla del 7"),
]
MEDIUM_DATA = [
    ("ana_g",     95,  750, "Elementos Quimicos"),
    ("luis_m",   110,  700, "Elementos Quimicos"),
    ("mario_r",   80,  800, "Sistema Solar"),
    ("sofia_p",  130,  640, "Sistema Solar"),
    ("carlos_v", 100,  730, "Elementos Quimicos"),
    ("elena_s",   85,  780, "Sistema Solar"),
    ("pedro_n",  145,  600, "Elementos Quimicos"),
    ("laura_t",   75,  820, "Sistema Solar"),
    ("jorge_f",  120,  670, "Elementos Quimicos"),
    ("maria_l",  105,  710, "Sistema Solar"),
]
HARD_DATA = [
    ("ana_g",    160,  500, "Historia Mundial"),
    ("luis_m",   190,  430, "Calculo Diferencial"),
    ("mario_r",  140,  560, "Historia Mundial"),
    ("sofia_p",  210,  380, "Calculo Diferencial"),
    ("carlos_v", 170,  480, "Historia Mundial"),
    ("elena_s",  155,  520, "Calculo Diferencial"),
    ("pedro_n",  230,  340, "Historia Mundial"),
    ("laura_t",  135,  580, "Calculo Diferencial"),
    ("jorge_f",  200,  410, "Historia Mundial"),
    ("maria_l",  175,  460, "Calculo Diferencial"),
]

STUDENTS = [
    {"name": "ana_g",    "color": "#38bdf8", "sesiones": [("2025-03-01", 950), ("2025-03-05", 880), ("2025-03-10", 800), ("2025-03-15", 750), ("2025-03-20", 500)]},
    {"name": "luis_m",   "color": "#4ade80", "sesiones": [("2025-03-02", 700), ("2025-03-07", 640), ("2025-03-12", 430), ("2025-03-17", 800), ("2025-03-22", 560)]},
    {"name": "mario_r",  "color": "#f472b6", "sesiones": [("2025-03-03", 1000), ("2025-03-08", 820), ("2025-03-13", 580), ("2025-03-18", 780), ("2025-03-23", 410)]},
    {"name": "sofia_p",  "color": "#fb923c", "sesiones": [("2025-03-01", 820), ("2025-03-06", 600), ("2025-03-11", 380), ("2025-03-16", 670), ("2025-03-21", 340)]},
    {"name": "carlos_v", "color": "#a78bfa", "sesiones": [("2025-03-04", 730), ("2025-03-09", 710), ("2025-03-14", 480), ("2025-03-19", 520), ("2025-03-24", 460)]},
]

# ---------------------------------------------------------------------------
# Ruta unica — ambas graficas en una sola pagina
# ---------------------------------------------------------------------------
@graficas_bp.get("/graficas")
def graficas():
    # ── Grafica 1: Scatter Plot ──────────────────────────────────────────────
    def scatter_trace(data, name, color):
        return go.Scatter(
            x=[d[1] for d in data],
            y=[d[2] for d in data],
            mode="markers",
            name=name,
            text=[f"{d[0]} - {d[3]}" for d in data],
            hovertemplate="<b>%{text}</b><br>Tiempo: %{x}s<br>Puntuacion: %{y}<extra></extra>",
            marker=dict(color=color, size=11, opacity=0.88,
                        line=dict(color="#0f172a", width=1)),
        )

    fig1 = go.Figure(data=[
        scatter_trace(EASY_DATA,   "Facil",   "#4ade80"),
        scatter_trace(MEDIUM_DATA, "Medio",   "#fbbf24"),
        scatter_trace(HARD_DATA,   "Dificil", "#f87171"),
    ])
    fig1.update_layout(
        title=dict(text="Tiempo empleado vs Puntuacion obtenida — por dificultad",
                   font=dict(color="#f1f5f9", size=15)),
        xaxis=dict(title="Tiempo (segundos)", gridcolor="#1e293b",
                   zerolinecolor="#334155", tickfont=dict(color="#64748b"),
                   title_font=dict(color="#94a3b8")),
        yaxis=dict(title="Puntuacion", gridcolor="#1e293b",
                   zerolinecolor="#334155", tickfont=dict(color="#64748b"),
                   title_font=dict(color="#94a3b8")),
        paper_bgcolor="#1e293b", plot_bgcolor="#0f172a",
        font=dict(color="#94a3b8", family="system-ui, sans-serif", size=11),
        legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color="#94a3b8")),
        margin=dict(t=55, r=20, b=55, l=60),
        height=440,
    )

    # ── Grafica 2: Line Chart ────────────────────────────────────────────────
    traces2 = []
    for est in STUDENTS:
        acum, xs, ys = 0, [], []
        for fecha, pts in est["sesiones"]:
            acum += pts
            xs.append(fecha)
            ys.append(acum)
        traces2.append(go.Scatter(
            x=xs, y=ys,
            mode="lines+markers",
            name=est["name"],
            line=dict(color=est["color"], width=2.5, shape="spline"),
            marker=dict(size=8, color=est["color"]),
            hovertemplate=f"<b>{est['name']}</b><br>%{{x}}<br>Acumulado: %{{y}} pts<extra></extra>",
        ))

    fig2 = go.Figure(data=traces2)
    fig2.update_layout(
        title=dict(text="Puntaje acumulado por estudiante a lo largo del tiempo",
                   font=dict(color="#f1f5f9", size=15)),
        xaxis=dict(title="Fecha", type="date", gridcolor="#1e293b",
                   zerolinecolor="#334155", tickfont=dict(color="#64748b"),
                   title_font=dict(color="#94a3b8")),
        yaxis=dict(title="Puntaje Acumulado", gridcolor="#1e293b",
                   zerolinecolor="#334155", tickfont=dict(color="#64748b"),
                   title_font=dict(color="#94a3b8")),
        paper_bgcolor="#1e293b", plot_bgcolor="#0f172a",
        font=dict(color="#94a3b8", family="system-ui, sans-serif", size=11),
        legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color="#94a3b8")),
        margin=dict(t=55, r=20, b=55, l=65),
        height=440,
    )

    c1 = fig1.to_html(full_html=False, include_plotlyjs="cdn")
    c2 = fig2.to_html(full_html=False, include_plotlyjs=False)

    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Graficas MomoRetos</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: #0f172a;
      color: #e2e8f0;
      font-family: system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 1.5rem;
      gap: 2rem;
    }}
    h1.page-title {{
      font-size: 1.6rem;
      font-weight: 800;
      color: #f1f5f9;
      text-align: center;
      letter-spacing: -0.01em;
    }}
    .card {{
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 1rem;
      padding: 2rem 2.5rem;
      width: 100%;
      max-width: 960px;
    }}
    .author {{
      font-size: 1.05rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }}
    .badge {{
      display: inline-block;
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }}
    h2 {{
      font-size: 1.35rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 0.75rem;
    }}
    p {{
      color: #94a3b8;
      font-size: 0.92rem;
      line-height: 1.65;
      margin-bottom: 1.5rem;
      max-width: 72ch;
    }}
    .divider {{
      width: 100%;
      max-width: 960px;
      border: none;
      border-top: 1px solid #1e293b;
    }}
  </style>
</head>
<body>
  <h1 class="page-title">Graficas MomoRetos</h1>

  <!-- Grafica 1 -->
  <div class="card">
    <p class="author" style="color:#38bdf8">Sebastian de Jesus Cruz Cruz</p>
    <span class="badge" style="background:#0c4a6e;color:#38bdf8">Scatter Plot · Plotly Python</span>
    <h2>Tiempo vs Puntuacion por Dificultad</h2>
    <p>
      Cada punto representa un intento resuelto. El eje X muestra el tiempo empleado en segundos
      y el eje Y la puntuacion obtenida. El color indica la dificultad del memoreto:
      verde Facil, amarillo Medio, rojo Dificil.
    </p>
    {c1}
  </div>

  <!-- Grafica 2 -->
  <div class="card">
    <p class="author" style="color:#a78bfa">Santiago Heriberto Leon Herrera</p>
    <span class="badge" style="background:#2e1065;color:#a78bfa">Line Chart · Plotly Python</span>
    <h2>Progreso de Puntaje Acumulado por Estudiante</h2>
    <p>
      Evolucion del puntaje acumulado de cada estudiante a lo largo del tiempo.
      Cada linea representa un estudiante y cada punto marca una sesion de juego.
      Permite identificar quien progresa mas rapido y detectar periodos de inactividad.
    </p>
    {c2}
  </div>

</body>
</html>"""
