import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyGroups } from "../api";
import TopBar from "../components/TopBar";

export default function Grupos() {
  const { token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    getMyGroups(token).then((r) => { setGroups(r.data.groups || []); setLoading(false); });
  }, [token]);

  return (
    <div className="page">
      <TopBar title="Grupos" />
      <div className="content">
        <button className="btn btn-full" onClick={() => nav("/grupos/nuevo")} style={{ marginBottom: "1rem" }}>
          + Nuevo Grupo
        </button>

        {loading ? <p className="empty">Cargando...</p> :
         groups.length === 0 ? <p className="empty">No has creado grupos.</p> : (
          <div className="card-list">
            {groups.map((g) => (
              <div key={g.id} className="level-card" onClick={() => nav(`/grupos/${g.id}`)}>
                <div className="level-header">
                  <span className="level-title">{g.name}</span>
                  <span className="badge small">Código: {g.code}</span>
                </div>
                <div className="level-meta">
                  <span>{g.student_count} estudiantes · {g.memoreto_count} memoretos</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
