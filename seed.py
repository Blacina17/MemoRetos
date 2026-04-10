"""
python seed.py
"""
import sys, os, json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from backend import create_app, db
from app.models.user import User
from app.models.memoreto import Memoreto
from app.models.game_session import GameSession, SessionEvent
from app.models.player_answer import PlayerAnswer
from app.models.group import Group

app = create_app("development")

with app.app_context():
    # Borrar y recrear tablas
    db.drop_all()
    db.create_all()
    print("Tablas creadas.")

    docente = User(
        name="Profe", lastname="Test",
        username="profe_test", email="profe@tec.mx",
        rol="docente", group="441", total_score=0,
    )
    docente.set_password("password123")

    sebas = User(
        name="Sebas", lastname="Cruz",
        username="sebas_cruz", email="sebas@tec.mx",
        rol="estudiante", group="111", total_score=120,
        tutorial_completed=True,
    )
    sebas.set_password("password123")

    flor = User(
        name="Flor", lastname="Rodriguez",
        username="flor_rh", email="flor@tec.mx",
        rol="estudiante", group="111", total_score=4500,
    )
    flor.set_password("password123")

    santiago = User(
        name="Santiago", lastname="Leon",
        username="santi_lh", email="santi@tec.mx",
        rol="estudiante", group="111", total_score=3200,
    )
    santiago.set_password("password123")

    ximena = User(
        name="Ximena", lastname="Camacho",
        username="xime_cf", email="xime@tec.mx",
        rol="estudiante", group="111", total_score=2800,
    )
    ximena.set_password("password123")

    carlos = User(
        name="Carlos", lastname="Gomez",
        username="carlos_gm", email="carlos@tec.mx",
        rol="estudiante", group="111", total_score=9850,
    )
    carlos.set_password("password123")

    users = [docente, sebas, flor, santiago, ximena, carlos]
    db.session.add_all(users)
    db.session.commit()
    print(f"{len(users)} usuarios creados.")

    # ── Memoretos en formato server.py: shapes + nodos con posiciones explícitas ─

    # Memoreto 1: 3 circulos entrelazados, 6 puntos de interseccion
    memo1 = Memoreto(
        title="Tres Circulos Entrelazados",
        nivel=1, fase=1, dificultad="easy",
        figuras_json=json.dumps({
            "shapes": [
                {"id": 1, "type": "circulo", "color": "#3366E6", "operacion": "suma", "target": 14,
                 "center": [-1.0,  1.0, 0], "size": [2.5, 2.5, 1]},
                {"id": 2, "type": "circulo", "color": "#3366E6", "operacion": "suma", "target": 14,
                 "center": [ 1.0,  1.0, 0], "size": [2.5, 2.5, 1]},
                {"id": 3, "type": "circulo", "color": "#3366E6", "operacion": "suma", "target": 14,
                 "center": [ 0.0, -0.5, 0], "size": [2.5, 2.5, 1]},
            ],
        }),
        number_set=json.dumps([1, 2, 3, 4, 5, 6]),
        solution_json=json.dumps({
            "Nodo_1_2_0": 6, "Nodo_1_2_1": 1,
            "Nodo_1_3_0": 3, "Nodo_1_3_1": 4,
            "Nodo_2_3_0": 2, "Nodo_2_3_1": 5,
        }),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    # Memoreto 2: 1 triangulo, 1 elipse, 1 rectangulo — 14 puntos de interseccion
    # T∩E=6, T∩R=4, E∩R=4. Suma 1..14=105. 3×target=2×105 → target=70
    # Solución: T∩E{1,2,3,4,11,14}=35, T∩R{5,7,10,13}=35, E∩R{6,8,9,12}=35
    memo2 = Memoreto(
        title="Triangulo Elipse y Rectangulo",
        nivel=1, fase=2, dificultad="medium",
        figuras_json=json.dumps({
            "shapes": [
                {"id": 1, "type": "triangulo",  "color": "#F59E0B", "operacion": "suma", "target": 70,
                 "center": [ 0.0,  0.0, 0], "size": [2.5, 3, 1]},
                {"id": 2, "type": "elipse",     "color": "#8B5CF6", "operacion": "suma", "target": 70,
                 "center": [ 0.0, -0.3, 0], "size": [1.6, 3.2, 1]},
                {"id": 3, "type": "rectangulo", "color": "#10B981", "operacion": "suma", "target": 70,
                 "center": [ 0.0, -0.4, 0], "size": [3, 1.5, 1]},
            ],
        }),
        number_set=json.dumps(list(range(1, 15))),
        solution_json=json.dumps({
            "Nodo_1_2_0":  1, "Nodo_1_2_1":  2, "Nodo_1_2_2":  3,
            "Nodo_1_2_3":  4, "Nodo_1_2_4": 11, "Nodo_1_2_5": 14,
            "Nodo_1_3_0":  5, "Nodo_1_3_1":  7, "Nodo_1_3_2": 10, "Nodo_1_3_3": 13,
            "Nodo_2_3_0":  6, "Nodo_2_3_1":  8, "Nodo_2_3_2":  9, "Nodo_2_3_3": 12,
        }),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    # Memoreto 3: 3 circulos y 1 triangulo — 12 puntos de interseccion, desierto
    # Cada par de figuras tiene 2 intersecciones → 6 pares × 2 = 12 nodos
    # Cada figura toca 6 nodos. Suma 1..12 = 78. 4×target = 2×78 → target=39
    # Solución: pares (1,12),(2,11),(3,10),(4,9),(5,8),(6,7) → cada par suma 13, cada figura suma 3×13=39
    memo3 = Memoreto(
        title="Tres Circulos y Triangulo",
        nivel=2, fase=1, dificultad="medium",
        figuras_json=json.dumps({
            "shapes": [
                {"id": 1, "type": "circulo",   "color": "#3B82F6", "operacion": "suma", "target": 39,
                 "center": [-0.5, -0.8, 0], "size": [2, 2, 1]},
                {"id": 2, "type": "circulo",   "color": "#A855F7", "operacion": "suma", "target": 39,
                 "center": [ 0.5, -0.8, 0], "size": [2, 2, 1]},
                {"id": 3, "type": "circulo",   "color": "#06B6D4", "operacion": "suma", "target": 39,
                 "center": [ 0.0,  0.5, 0], "size": [2, 2, 1]},
                {"id": 4, "type": "triangulo", "color": "#EF4444", "operacion": "suma", "target": 39,
                 "center": [ 0.0,  0.0, 0], "size": [2, 2, 1]},
            ],
        }),
        number_set=json.dumps(list(range(1, 13))),
        solution_json=json.dumps({
            "Nodo_1_2_0":  1, "Nodo_1_2_1": 12,
            "Nodo_1_3_0":  2, "Nodo_1_3_1": 11,
            "Nodo_1_4_0":  3, "Nodo_1_4_1": 10,
            "Nodo_2_3_0":  4, "Nodo_2_3_1":  9,
            "Nodo_2_4_0":  5, "Nodo_2_4_1":  8,
            "Nodo_3_4_0":  6, "Nodo_3_4_1":  7,
        }),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    # Memoreto 4: 1 circulo, 2 rectangulos (cruz) — 12 puntos de interseccion
    # C∩R_v=4, C∩R_h=4, R_v∩R_h=4. Suma 1..12=78. 3×target=2×78 → target=52
    # Solución: cada par suma 26: C∩R_v{1,5,8,12}, C∩R_h{2,6,7,11}, R_v∩R_h{3,4,9,10}
    memo4 = Memoreto(
        title="Circulo y Cruz",
        nivel=2, fase=2, dificultad="hard",
        figuras_json=json.dumps({
            "shapes": [
                {"id": 1, "type": "circulo",    "color": "#3B82F6", "operacion": "suma", "target": 52,
                 "center": [0.0, 0.0, 0], "size": [3.5, 3.5, 1]},
                {"id": 2, "type": "rectangulo", "color": "#10B981", "operacion": "suma", "target": 52,
                 "center": [0.0, 0.0, 0], "size": [1.8, 3.1, 1]},
                {"id": 3, "type": "rectangulo", "color": "#EF4444", "operacion": "suma", "target": 52,
                 "center": [0.0, 0.0, 0], "size": [3.1, 1.8, 1]},
            ],
        }),
        number_set=json.dumps(list(range(1, 13))),
        solution_json=json.dumps({
            "Nodo_1_2_0":  1, "Nodo_1_2_1":  5, "Nodo_1_2_2":  8, "Nodo_1_2_3": 12,
            "Nodo_1_3_0":  2, "Nodo_1_3_1":  6, "Nodo_1_3_2":  7, "Nodo_1_3_3": 11,
            "Nodo_2_3_0":  3, "Nodo_2_3_1":  4, "Nodo_2_3_2":  9, "Nodo_2_3_3": 10,
        }),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    # ── Nivel 3 Tundra ────────────────────────────────────────────────────────
    memo5 = Memoreto(
        title="Triangulo Pentagono",
        nivel=3, fase=1, dificultad="medium",
        figuras_json=json.dumps([
            {"id": 1, "type": "triangulo",  "color": "#8B5CF6",
             "operacion": "suma", "target": 15, "nodos": [1, 2, 3]},
            {"id": 2, "type": "pentagono",  "color": "#06B6D4",
             "operacion": "suma", "target": 20, "nodos": [2, 3, 4, 5, 6]},
        ]),
        number_set=json.dumps([1, 2, 3, 4, 5, 6, 7]),
        solution_json=json.dumps({"1": 6, "2": 5, "3": 4, "4": 3, "5": 2, "6": 6}),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    memo6 = Memoreto(
        title="Tres Figuras Medio",
        nivel=3, fase=2, dificultad="hard",
        figuras_json=json.dumps([
            {"id": 1, "type": "triangulo",  "color": "#EC4899",
             "operacion": "suma", "target": 12, "nodos": [1, 2, 3]},
            {"id": 2, "type": "circulo",    "color": "#F59E0B",
             "operacion": "suma", "target": 11, "nodos": [2, 4, 5]},
            {"id": 3, "type": "rectangulo", "color": "#10B981",
             "operacion": "suma", "target": 13, "nodos": [3, 5, 6, 7]},
        ]),
        number_set=json.dumps([1, 2, 3, 4, 5, 6, 7]),
        solution_json=json.dumps({"1": 5, "2": 4, "3": 3, "4": 2, "5": 5, "6": 3, "7": 2}),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    # ── Nivel 4 Agua ──────────────────────────────────────────────────────────
    memo7 = Memoreto(
        title="Circulo y Pentagono",
        nivel=4, fase=1, dificultad="medium",
        figuras_json=json.dumps([
            {"id": 1, "type": "circulo",   "color": "#3B82F6",
             "operacion": "suma", "target": 18, "nodos": [1, 2, 3, 4]},
            {"id": 2, "type": "pentagono", "color": "#A855F7",
             "operacion": "suma", "target": 25, "nodos": [3, 4, 5, 6, 7]},
        ]),
        number_set=json.dumps([1, 2, 3, 4, 5, 6, 7, 8]),
        solution_json=json.dumps({"1": 5, "2": 6, "3": 4, "4": 3, "5": 7, "6": 8, "7": 3}),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    memo8 = Memoreto(
        title="Cuatro Figuras",
        nivel=4, fase=2, dificultad="hard",
        figuras_json=json.dumps([
            {"id": 1, "type": "triangulo",  "color": "#EF4444",
             "operacion": "suma", "target": 12, "nodos": [1, 2, 3]},
            {"id": 2, "type": "rectangulo", "color": "#10B981",
             "operacion": "suma", "target": 14, "nodos": [2, 3, 4, 5]},
            {"id": 3, "type": "circulo",    "color": "#6366F1",
             "operacion": "suma", "target": 10, "nodos": [4, 5, 6]},
            {"id": 4, "type": "triangulo",  "color": "#F59E0B",
             "operacion": "suma", "target": 11, "nodos": [5, 6, 7]},
        ]),
        number_set=json.dumps([1, 2, 3, 4, 5, 6, 7, 8]),
        solution_json=json.dumps({"1": 4, "2": 5, "3": 3, "4": 2, "5": 4, "6": 1, "7": 6}),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    # ── Nivel 5 Volcan ────────────────────────────────────────────────────────
    memo9 = Memoreto(
        title="Gran Desafio I",
        nivel=5, fase=1, dificultad="hard",
        figuras_json=json.dumps([
            {"id": 1, "type": "pentagono",  "color": "#DC2626",
             "operacion": "suma", "target": 30, "nodos": [1, 2, 3, 4, 5]},
            {"id": 2, "type": "triangulo",  "color": "#F97316",
             "operacion": "suma", "target": 18, "nodos": [3, 4, 6]},
            {"id": 3, "type": "circulo",    "color": "#FBBF24",
             "operacion": "suma", "target": 15, "nodos": [5, 6, 7]},
        ]),
        number_set=json.dumps([1, 2, 3, 4, 5, 6, 7, 8, 9]),
        solution_json=json.dumps({"1": 7, "2": 8, "3": 6, "4": 5, "5": 4, "6": 7, "7": 4}),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    memo10 = Memoreto(
        title="Gran Desafio II",
        nivel=5, fase=2, dificultad="hard",
        figuras_json=json.dumps([
            {"id": 1, "type": "triangulo",  "color": "#7C3AED",
             "operacion": "suma", "target": 21, "nodos": [1, 2, 3]},
            {"id": 2, "type": "pentagono",  "color": "#DB2777",
             "operacion": "suma", "target": 35, "nodos": [2, 3, 4, 5, 6]},
            {"id": 3, "type": "rectangulo", "color": "#059669",
             "operacion": "suma", "target": 22, "nodos": [5, 6, 7, 8]},
            {"id": 4, "type": "circulo",    "color": "#D97706",
             "operacion": "suma", "target": 16, "nodos": [7, 8, 9]},
        ]),
        number_set=json.dumps([1, 2, 3, 4, 5, 6, 7, 8, 9]),
        solution_json=json.dumps({"1": 8, "2": 7, "3": 6, "4": 9, "5": 8, "6": 5, "7": 4, "8": 7, "9": 5}),
        is_validated=True, is_published=True,
        created_by=docente.id,
    )

    all_memos = [memo1, memo2, memo3, memo4, memo5, memo6, memo7, memo8, memo9, memo10]
    db.session.add_all(all_memos)
    db.session.commit()
    print(f"{len(all_memos)} memoretos creados.")

    group = Group(name="TC2005B Gpo 441", code="TC441A", teacher_id=docente.id)
    db.session.add(group)
    db.session.commit()

    group.students.extend([sebas, flor, santiago, ximena, carlos])
    group.memoretos.extend(all_memos)
    db.session.commit()
    print("Grupo creado con 5 estudiantes y 10 memoretos asignados.")

    from datetime import date, timedelta
    estudiantes = [sebas, flor, santiago, ximena, carlos]
    memos = all_memos
    import random
    random.seed(42)
    answers = []
    base_date = date(2025, 3, 1)
    for i, est in enumerate(estudiantes):
        for j, memo in enumerate(memos):
            for k in range(4):
                day_offset = i * 3 + j * 5 + k * 7
                score_map = {"easy": random.randint(800, 1000), "medium": random.randint(600, 800), "hard": random.randint(350, 600)}
                time_map  = {"easy": random.randint(30, 90),    "medium": random.randint(80, 150),  "hard": random.randint(130, 230)}
                answers.append(PlayerAnswer(
                    user_id=est.id,
                    memoreto_id=memo.id,
                    respuesta_json="{}",
                    resuelto=True,
                    score=score_map[memo.dificultad],
                    time_seconds=time_map[memo.dificultad],
                    intentos=random.randint(1, 3),
                    submitted_at=base_date + timedelta(days=day_offset % 30),
                ))
    db.session.add_all(answers)
    db.session.commit()
    print(f"{len(answers)} player_answers creados.")

    print("\n=== DATOS DE PRUEBA LISTOS ===")

    print("Usuarios (password: password123):")
    for u in users:
        print(f"  {u.rol:12s}  {u.username:16s}  score={u.total_score}")
    print(f"\nMemoretos publicados: {Memoreto.query.filter_by(is_published=True).count()} (2 por mapa, 5 mapas)")
    print(f"Grupo: {group.name} (code={group.code})")
    print("\nEjecuta:  python run.py")
