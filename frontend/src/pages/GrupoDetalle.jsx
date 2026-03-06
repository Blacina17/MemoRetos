import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getGroup, getGroupStudents, getGroupMemoretos,
  getMyMemoretos, assignMemoreto, removeMemoretoFromGroup,
} from "../api";
import TopBar from "../components/TopBar";

export default function GrupoDetalle() {
  const { id } = useParams();
  const { token } = useAuth();
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [memos, setMemos] = useState([]);
  const [allMemos, setAllMemos] = useState([]);
  const [tab, setTab] = useState("personas");
  const [selMemo, setSelMemo] = useState("");
  const [msg, setMsg] = useState("");

  const fetchData = () => {
    getGroup(id, token).then((r) => setGroup(r.data.group));
    getGroupStudents(id, token).then((r) => setStudents(r.data.students || []));
    getGroupMemoretos(id, token).then((r) => setMemos(r.data.memoretos || []));
    getMyMemoretos(token).then((r) => setAllMemos(r.data.memoretos || []));
  };
  useEffect(fetchData, [id, token]);

  const handleAssign = async () => {
    if (!selMemo) return;
    const res = await assignMemoreto(id, Number(selMemo), token);
    setMsg(res.data.success ? "Memoreto asignado" : res.data.message);
    fetchData();
  };

  const handleRemove = async (memoId) => {
    await removeMemoretoFromGroup(id, memoId, token);
    fetchData();
  };

  if (!group) return <div className="page"><TopBar title="Cargando..." /><p className="empty">...</p></div>;

  const available = allMemos.filter((m) => !memos.some((am) => am.id === m.id));

  return (
    <div className="page">
      <TopBar title={group.name} />
      <div className="content">
        <div className="group-code-bar">
          <span>Código de acceso:</span>
          <span className="code-display">{group.code}</span>
        </div>

        <div className="tab-bar">
          <button className={tab === "personas" ? "active" : ""} onClick={() => setTab("personas")}>
            Personas ({students.length})
          </button>
          <button className={tab === "tareas" ? "active" : ""} onClick={() => setTab("tareas")}>
            Tareas ({memos.length})
          </button>
        </div>

        {tab === "personas" && (
          <div className="card-list">
            {students.length === 0 ? <p className="empty">Sin estudiantes. Comparte el código para que se unan.</p> :
              students.map((s) => (
                <div key={s.id} className="simple-row">
                  <span>{s.name} {s.lastname}</span>
                  <span className="rank-user">@{s.username}</span>
                  <span className="rank-score">{s.total_score} pts</span>
                </div>
              ))
            }
          </div>
        )}

        {tab === "tareas" && (<>
          {/* Asignar memoreto */}
          <div className="assign-section">
            <h4>Asignar memoreto</h4>
            <div className="row" style={{ alignItems: "flex-end" }}>
              <div className="field" style={{ flex: 1 }}>
                <select value={selMemo} onChange={(e) => setSelMemo(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {available.map((m) => (
                    <option key={m.id} value={m.id}>{m.title} ({m.dificultad})</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-sm" onClick={handleAssign} disabled={!selMemo}>Asignar</button>
            </div>
            {msg && <p className="hint">{msg}</p>}
          </div>

          {/* Lista de memoretos asignados */}
          <div className="card-list" style={{ marginTop: ".75rem" }}>
            {memos.length === 0 ? <p className="empty">Sin memoretos asignados.</p> :
              memos.map((m) => (
                <div key={m.id} className="simple-row">
                  <span>{m.title}</span>
                  <span className="badge small">{m.dificultad}</span>
                  <button className="btn btn-sm btn-danger" onClick={() => handleRemove(m.id)}>Quitar</button>
                </div>
              ))
            }
          </div>
        </>)}
      </div>
    </div>
  );
}
