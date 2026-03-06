import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createGroup } from "../api";
import TopBar from "../components/TopBar";

export default function NuevoGrupo() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const res = await createGroup(name.trim(), token);
    setLoading(false);
    if (res.data.success) {
      setMsg(`Grupo creado — Código: ${res.data.group.code}`);
      setTimeout(() => nav("/grupos"), 1500);
    } else {
      setMsg(res.data.message || "Error al crear grupo");
    }
  };

  return (
    <div className="page">
      <TopBar title="Nuevo Grupo" />
      <div className="content">
        <form onSubmit={handleCreate}>
          <div className="field">
            <label>Nombre del grupo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: TC2005B Gpo 441" autoFocus />
          </div>
          {msg && <p className="hint" style={{ color: "#4ade80" }}>{msg}</p>}
          <div className="row" style={{ gap: ".5rem", marginTop: "1rem" }}>
            <button className="btn btn-full" disabled={loading}>{loading ? "Creando..." : "Guardar"}</button>
            <button type="button" className="btn btn-outline btn-full" onClick={() => nav(-1)}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
