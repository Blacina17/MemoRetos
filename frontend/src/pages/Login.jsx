import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login, register } from "../api";

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export default function Login() {
  const [mode, setMode] = useState("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regLastname, setRegLastname] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.data.token) {
      saveAuth(res.data.token, res.data.user);
      nav("/dashboard");
    } else {
      setError(res.data.message || "Credenciales incorrectas");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await register({
      name: regName,
      lastname: regLastname,
      username: regUsername,
      email: regEmail,
      password: regPassword,
      rol: "docente",
    });
    setLoading(false);
    if (res.data.token) {
      saveAuth(res.data.token, res.data.user);
      nav("/dashboard");
    } else {
      setError(res.data.message || "Error al registrar");
    }
  };

  const switchMode = (m) => { setMode(m); setError(""); };

  return (
    <div className="login-page">
      <div className="auth-wrap">
        <div className="auth-logos">
          <div className="logo-pill">
            <img src="/logo.png" alt="UNAE" />
          </div>
          <div className="logo-pill">
            <img src="/logotec.jpg" alt="Tec de Monterrey" />
          </div>
        </div>

        <h1 className="auth-title">MemoRetos</h1>
        <p className="auth-subtitle">Panel de Administración</p>

        <div className="auth-tabs">
          <button className={`auth-tab${mode === "login" ? " active" : ""}`} onClick={() => switchMode("login")}>
            Iniciar Sesión
          </button>
          <button className={`auth-tab${mode === "register" ? " active" : ""}`} onClick={() => switchMode("register")}>
            Registrarse
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <span className="auth-field-icon"><IconUser /></span>
              <input
                id="login-username"
                className="auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
              />
            </div>
            <div className="auth-field">
              <span className="auth-field-icon"><IconLock /></span>
              <input
                id="login-password"
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-btn" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="auth-row">
              <div className="auth-field">
                <input
                  className="auth-input auth-input-plain"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nombre"
                />
              </div>
              <div className="auth-field">
                <input
                  className="auth-input auth-input-plain"
                  value={regLastname}
                  onChange={(e) => setRegLastname(e.target.value)}
                  placeholder="Apellido"
                />
              </div>
            </div>
            <div className="auth-field">
              <span className="auth-field-icon"><IconUser /></span>
              <input
                className="auth-input"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Usuario"
              />
            </div>
            <div className="auth-field">
              <span className="auth-field-icon"><IconMail /></span>
              <input
                type="email"
                className="auth-input"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Correo electrónico"
              />
            </div>
            <div className="auth-field">
              <span className="auth-field-icon"><IconLock /></span>
              <input
                type="password"
                className="auth-input"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Contraseña"
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-btn" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
