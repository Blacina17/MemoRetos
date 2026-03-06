import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyMemoretos, deleteMemoreto, updateMemoreto } from "../api";
import TopBar from "../components/TopBar";

const DIF = { easy: "Fácil", medium: "Medio", hard: "Difícil" };
const DIF_C = { easy: "#4ade80", medium: "#fbbf24", hard: "#f87171" };

export default function Memoretos() {
  const { token } = useAuth();
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const fetch_ = () => {
    getMyMemoretos(token).then((r) => { setMemos(r.data.memoretos || []); setLoading(false); });
  };
  useEffect(fetch_, [token]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este memoreto?")) return;
    await deleteMemoreto(id, token);
    fetch_();
  };

  const togglePublish = async (m) => {
    await updateMemoreto(m.id, { is_published: !m.is_published }, token);
    fetch_();
  };

  return (
    <div className="page">
      <TopBar title="Mis Memoretos" />
      <div className="content">
        <button className="btn btn-full" onClick={() => nav("/memoretos/nuevo")} style={{ marginBottom: "1rem" }}>
          + Nuevo Memoreto
        </button>

        {loading ? <p className="empty">Cargando...</p> :
         memos.length === 0 ? <p className="empty">No has creado memoretos aún.</p> : (
          <div className="card-list">
            {memos.map((m) => (
              <div key={m.id} className="level-card">
                <div className="level-header">
                  <span className="level-title">{m.title}</span>
                  <span className="dif-badge" style={{ background: DIF_C[m.dificultad] }}>{DIF[m.dificultad]}</span>
                </div>
                <div className="level-meta">
                  <span>Nivel {m.nivel}</span>
                  {m.fase && <span> · Fase {m.fase}</span>}
                  <span> · {m.is_published ? "Publicado" : "📝 Borrador"}</span>
                </div>
                <div className="card-actions">
                  <button className="btn btn-sm" onClick={() => nav(`/memoretos/editar/${m.id}`)}>Editar</button>
                  <button className="btn btn-sm btn-outline" onClick={() => togglePublish(m)}>
                    {m.is_published ? "Despublicar" : "Publicar"}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>Borrar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
