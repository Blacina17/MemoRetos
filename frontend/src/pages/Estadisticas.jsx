import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { globalRanking, getMyMemoretos } from "../api";
import TopBar from "../components/TopBar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#38bdf8", "#818cf8", "#a78bfa", "#60a5fa", "#34d399", "#f472b6", "#fb923c", "#facc15", "#a3e635"];
const DIFS   = { easy: "Fácil", medium: "Medio", hard: "Difícil" };
const DIF_COLOR = { easy: "#4ade80", medium: "#fbbf24", hard: "#f87171" };

function StatCard({ icon, label, value, sub, trend, color = "#38bdf8" }) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-top">
        <span className="dash-stat-label">{label}</span>
        <span className="dash-stat-icon">{icon}</span>
      </div>
      <div className="dash-stat-value" style={{ color }}>{value}</div>
      <div className="dash-stat-foot">
        {trend !== undefined && (
          <span className={`dash-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%&nbsp;
          </span>
        )}
        {sub && <span className="dash-stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <p className="tt-name">{payload[0].payload.username}</p>
        <p className="tt-score">{payload[0].value.toLocaleString()} pts</p>
      </div>
    );
  }
  return null;
};

export default function Estadisticas() {
  const { token } = useAuth();
  const [users, setUsers]   = useState([]);
  const [memos, setMemos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("puntajes");

  useEffect(() => {
    Promise.all([globalRanking(token), getMyMemoretos(token)]).then(([rk, mm]) => {
      setUsers(rk.data.data || []);
      setMemos(mm.data.memoretos || []);
      setLoading(false);
    });
  }, [token]);

  const total     = users.length;
  const avg       = total ? Math.round(users.reduce((s, u) => s + u.total_score, 0) / total) : 0;
  const top       = users[0]?.total_score || 0;
  const published = memos.filter(m => m.is_published).length;

  const chartDataPuntajes = [...users]
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 10)
    .map(u => ({ username: u.username.slice(0, 8), score: u.total_score }));

  const difCount = memos.reduce((acc, m) => {
    acc[m.dificultad] = (acc[m.dificultad] || 0) + 1;
    return acc;
  }, {});
  const chartDataDif = Object.entries(difCount).map(([k, v]) => ({
    username: DIFS[k] || k, score: v, dif: k,
  }));

  const chartData = tab === "puntajes" ? chartDataPuntajes : chartDataDif;

  if (loading) return (
    <div className="page-wide">
      <TopBar title="Estadísticas" />
      <p className="empty">Cargando...</p>
    </div>
  );

  return (
    <div className="page-wide">
      <TopBar title="Estadísticas" />
      <div className="dash-content">

        {/* ── Tarjetas métricas ── */}
        <div className="dash-stats-row">
          <StatCard label="Jugadores totales"   value={total}
            sub={`Promedio ${avg.toLocaleString()} pts`} trend={0} />
          <StatCard label="Puntuación promedio" value={avg.toLocaleString()}
            sub="Global" color="#818cf8" />
          <StatCard label="Puntaje más alto"    value={top.toLocaleString()}
            sub={users[0] ? `@${users[0].username}` : "—"} color="#fbbf24" />
          <StatCard label="Mis memoretos"       value={memos.length}
            sub={`${published} publicados`} color="#4ade80" />
        </div>

        {/* ── Área principal ── */}
        <div className="dash-main">

          {/* Gráfica grande */}
          <div className="dash-chart-card">
            <div className="dash-chart-header">
              <div className="dash-tabs">
                <button className={tab === "puntajes"   ? "active" : ""} onClick={() => setTab("puntajes")}>Puntajes</button>
                <button className={tab === "dificultad" ? "active" : ""} onClick={() => setTab("dificultad")}>Por Dificultad</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="username" tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => tab === "puntajes" ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={52}>
                  {chartData.map((entry, i) => (
                    <Cell key={entry.name ?? `cell-${i}`}
                      fill={tab === "dificultad" ? (DIF_COLOR[entry.dif] || "#3b82f6") : COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {chartData.length === 0 && <p className="empty">Sin datos para mostrar</p>}
          </div>

          {/* Ranking lateral */}
          <div className="dash-ranking-card">
            <div className="dash-ranking-title">🏅 Ranking Global</div>
            <div className="dash-ranking-list">
              {users.slice(0, 7).map((u, i) => (
                <div key={u.id} className="dash-rank-row">
                  <span className="dash-rank-pos">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <div className="dash-rank-info">
                    <span className="dash-rank-name">{u.name} {u.lastname}</span>
                    <span className="dash-rank-user">@{u.username}</span>
                  </div>
                  <span className="dash-rank-score">{u.total_score.toLocaleString()}</span>
                </div>
              ))}
              {users.length === 0 && <p className="empty">Sin datos</p>}
            </div>
          </div>
        </div>

        {/* ── Fila inferior ── */}
        <div className="dash-bottom-row">

          <div className="dash-bottom-card">
            <div className="dash-card-title"> Memoretos por Dificultad</div>
            {Object.keys(difCount).length === 0
              ? <p className="empty">Sin memoretos</p>
              : Object.entries(difCount).map(([dif, cnt]) => {
                  const pct = Math.round((cnt / memos.length) * 100);
                  return (
                    <div key={dif} className="diff-row">
                      <span className="diff-label" style={{ color: DIF_COLOR[dif] }}>{DIFS[dif] || dif}</span>
                      <div className="diff-bar-track">
                        <div className="diff-bar-fill" style={{ width: `${pct}%`, background: DIF_COLOR[dif] }} />
                      </div>
                      <span className="diff-count">{cnt}</span>
                    </div>
                  );
                })}
          </div>

          <div className="dash-bottom-card">
            <div className="dash-card-title">Estado de Publicación</div>
            <div className="memo-status-grid">
              <div className="memo-status-item">
                <span className="memo-status-num" style={{ color: "#4ade80" }}>{published}</span>
                <span className="memo-status-lbl">Publicados</span>
              </div>
              <div className="memo-status-item">
                <span className="memo-status-num" style={{ color: "#fbbf24" }}>{memos.length - published}</span>
                <span className="memo-status-lbl">Borradores</span>
              </div>
              <div className="memo-status-item">
                <span className="memo-status-num" style={{ color: "#38bdf8" }}>{memos.length}</span>
                <span className="memo-status-lbl">Total</span>
              </div>
            </div>
            {memos.length > 0 && <>
              <div className="pub-progress-track">
                <div className="pub-progress-fill"
                  style={{ width: `${Math.round((published / memos.length) * 100)}%` }} />
              </div>
              <p className="pub-pct">{Math.round((published / memos.length) * 100)}% publicado</p>
            </>}
          </div>

        </div>
      </div>
    </div>
  );
}
