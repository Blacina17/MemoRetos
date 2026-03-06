import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ITEMS = [
  { label: "Estadísticas",    to: "/estadisticas" },
  { label: "Crear Memoreto",  to: "/memoretos" },
  { label: "Grupos",          to: "/grupos" },
  { label: "Configuración",   to: "/configuracion" },
];

export default function Menu() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav("/"); };

  return (
    <div className="page-center">
      <div className="menu-card">
        <h1>Menú</h1>
        <p className="subtitle">
          Hola, {user?.name} {user?.lastname}
          <span className="badge">{user?.rol}</span>
        </p>

        <div className="menu-grid">
          {ITEMS.map((item) => (
            <button key={item.to} className="menu-item" onClick={() => nav(item.to)}>
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="menu-bottom">
          <button className="btn btn-outline" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </div>
    </div>
  );
}
