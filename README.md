# MemoRetos

Sistema educativo interactivo de puzzles matemáticos. Combina un **dashboard web** (React + Vite) para docentes con un **videojuego en Unity** para estudiantes, comunicados a través de una **API REST** en Flask.

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| conda (opcional) | cualquiera | `conda --version` |

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/SEBASidkk/MemoRetos.git
cd MemoRetos
```

### 2. Configurar el entorno Python

**Con conda (recomendado):**
```bash
conda create -n memoretos python=3.11 -y
conda activate memoretos
```

**O con venv:**
```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 3. Instalar dependencias Python

```bash
pip install flask flask-sqlalchemy flask-migrate flask-jwt-extended flask-cors python-dotenv pymysql
```

### 4. Instalar dependencias del frontend

```bash
cd frontend
npm install
cd ..
```

---

## Primer arranque

### 5. Poblar la base de datos con datos de prueba

Desde la raíz del proyecto:

```bash
python seed.py
```

Esto crea `backend/memoretos.db` con:
- 6 usuarios listos para usar
- 3 memoretos publicados
- 1 grupo con estudiantes asignados

Usuarios creados (contraseña para todos: `password123`):

| Usuario | Rol | Score |
|---|---|---|
| `profe_test` | docente | 0 |
| `sebas_cruz` | estudiante | 120 |
| `flor_rh` | estudiante | 4500 |
| `santi_lh` | estudiante | 3200 |
| `xime_cf` | estudiante | 2800 |
| `carlos_gm` | estudiante | 9850 |

---

## Ejecutar el sistema

Se necesitan **dos terminales abiertas en paralelo**.

### Terminal 1 — Backend (API Flask)

```bash
# Desde la raíz del proyecto
conda activate memoretos    # o source venv/bin/activate
python run.py
```

El servidor queda en: `http://127.0.0.1:5000`

Verificar que está corriendo:
```bash
curl http://127.0.0.1:5000/health
# → {"message": "MemoRetos API corriendo", "status": "ok"}
```

### Terminal 2 — Frontend (Dashboard Web)

```bash
cd frontend
npm run dev
```

El dashboard queda en: `http://localhost:5173`

Abrir en el navegador e iniciar sesión con `profe_test` / `password123`.

---

## Estructura del proyecto

```
MemoRetos/
├── run.py                  <- Punto de entrada del backend
├── seed.py                 <- Script para poblar la BD con datos de prueba
├── backend/
│   ├── __init__.py         <- Factory de la app Flask
│   ├── config.py           <- Configuracion (BD, JWT, CORS)
│   ├── memoretos.db        <- Base de datos SQLite (se crea con seed.py)
│   └── app/
│       ├── models/
│       │   ├── user.py
│       │   ├── memoreto.py
│       │   ├── game_session.py
│       │   ├── player_answer.py
│       │   └── group.py
│       └── routes/
│           ├── auth.py         /auth/login|register|logout|me
│           ├── game.py         /session/start|end  /game/session/event
│           ├── answers.py      /answers  /answer/history
│           ├── dashboard.py    /dashboard/ranking
│           ├── memoretos.py    /memoretos/...
│           └── groups.py       /groups/...
└── frontend/
    ├── package.json
    └── src/
        ├── pages/          <- Login, MemoEditor, Estadisticas, Grupos...
        ├── components/     <- TopBar, MemoCanvas
        ├── context/        <- AuthContext (JWT)
        ├── utils/          <- solver.js (CSP backtracking)
        └── api.js          <- Cliente HTTP centralizado
```

---

## Endpoints principales de la API

Todos los endpoints (excepto login, register y ranking global) requieren el header:
```
Authorization: Bearer <token>
```

El token se obtiene al hacer login:
```bash
curl -X POST http://127.0.0.1:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "profe_test", "password": "password123"}'
```

| Metodo | URL | Descripcion |
|---|---|---|
| POST | `/auth/register` | Crear cuenta |
| POST | `/auth/login` | Iniciar sesion, devuelve JWT |
| POST | `/auth/logout` | Cerrar sesion |
| GET | `/auth/me` | Perfil del usuario actual |
| POST | `/session/start` | Iniciar partida de un memoreto |
| POST | `/game/session/event` | Registrar evento en partida |
| POST | `/session/end` | Finalizar partida |
| POST | `/answers` | Enviar respuesta y obtener puntaje |
| GET | `/answer/history` | Historial de intentos |
| GET | `/dashboard/ranking` | Ranking global |
| GET | `/memoretos/published` | Lista de memoretos disponibles |
| GET | `/memoretos/mine` | Mis memoretos (docente) |
| POST | `/memoretos/` | Crear memoreto (docente) |
| PUT | `/memoretos/<id>` | Editar memoreto |
| DELETE | `/memoretos/<id>` | Eliminar memoreto |
| POST | `/groups/` | Crear grupo (docente) |
| GET | `/groups/mine` | Mis grupos |
| POST | `/groups/<code>/members` | Unirse a un grupo con codigo |
| GET | `/groups/<id>/students` | Ver estudiantes del grupo |
| POST | `/groups/<id>/memoretos` | Asignar memoreto a grupo |

---

## Probar los endpoints con Postman

1. Importar la URL base: `http://127.0.0.1:5000`
2. Usar `http://` (no `https://`)
3. Body: seleccionar **raw** y tipo **JSON**
4. Para endpoints protegidos: pestana **Authorization** > tipo **Bearer Token** > pegar el token del login

---

## Restablecer la base de datos

Si necesitas empezar desde cero:

```bash
rm backend/memoretos.db
python seed.py
```

---

## Variables de entorno (opcionales)

Crea un archivo `.env` en la raiz del proyecto para sobreescribir los valores por defecto:

```env
SECRET_KEY=tu-clave-secreta-aqui
JWT_SECRET_KEY=tu-clave-jwt-aqui
DATABASE_URL=sqlite:///backend/memoretos.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Sin este archivo el sistema funciona con valores por defecto seguros para desarrollo.

---

## Solucion de problemas comunes

**"Address already in use" en el puerto 5000**
```bash
lsof -ti :5000 | xargs kill -9
python run.py
```

**"Address already in use" en el puerto 5173**
```bash
lsof -ti :5173 | xargs kill -9
cd frontend && npm run dev
```

**Error 415 Unsupported Media Type en Postman**
- Body > raw > cambiar dropdown de "Text" a **JSON**

**Error SSL / WRONG_VERSION_NUMBER en Postman**
- Usar `http://` en lugar de `https://`

**"No such table" o error de base de datos**
```bash
python seed.py
```

---

## Equipo

| Nombre | Matricula |
|---|---|
| Ximena Itzel Camacho Flores | A01669596 |
| Flor Blacina Rodriguez Hernandez | A01668657 |
| Sebastian de Jesus Cruz Cruz | A01667857 |
| Santiago Heriberto Leon Herrera | A01786782 |

TC2005B · Construccion de Software y Toma de Decisiones · Tec de Monterrey · 2026-11
