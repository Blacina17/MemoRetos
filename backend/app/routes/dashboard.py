from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend import db
from sqlalchemy import desc, asc
from collections import defaultdict
from app.models.user import User
from app.models.player_answer import PlayerAnswer
from app.models.memoreto import Memoreto


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/ranking")  # PDF endpoint 6: /dashboard/ranking
def ranking_global():
    page  = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    order = request.args.get("order", "desc").lower()

    offset     = (page - 1) * limit
    order_func = desc if order == "desc" else asc

    query       = User.query.filter(User.total_score.isnot(None))
    total_users = query.count()
    users       = query.order_by(order_func(User.total_score)).offset(offset).limit(limit).all()

    start_rank = offset + 1
    data = []
    for idx, user in enumerate(users):
        user_data = user.to_dict()
        user_data["rank"] = start_rank + idx
        data.append(user_data)

    total_pages = (total_users + limit - 1) // limit

    return jsonify({
        "ranking": data,
        "count":   len(data),
        "pagination": {
            "current_page": page,
            "per_page":     limit,
            "total_pages":  total_pages,
            "total_items":  total_users,
        },
        "_links": {
            "self":     {"href": f"/dashboard/ranking?page={page}&limit={limit}", "method": "GET"},
            "next":     {"href": f"/dashboard/ranking?page={page+1}&limit={limit}", "method": "GET"} if page < total_pages else None,
            "previous": {"href": f"/dashboard/ranking?page={page-1}&limit={limit}", "method": "GET"} if page > 1 else None,
        },
    }), 200


@dashboard_bp.get("/ranking/user/<int:user_id>")
def ranking_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": True, "message": "Usuario no encontrado", "code": 404}), 404

    higher_count = User.query.filter(User.total_score > user.total_score).count()
    rank = higher_count + 1

    return jsonify({
        "user": user.to_dict(),
        "rank": rank,
        "_links": {
            "self":       {"href": f"/dashboard/ranking/user/{user_id}", "method": "GET"},
            "collection": {"href": "/dashboard/ranking", "method": "GET"},
        },
    }), 200


@dashboard_bp.get("/ranking/me")
@jwt_required()
def ranking_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": True, "message": "Usuario no encontrado", "code": 404}), 404

    higher_count = User.query.filter(User.total_score > user.total_score).count()
    rank = higher_count + 1

    return jsonify({
        "user": user.to_dict(),
        "rank": rank,
        "_links": {
            "self":       {"href": "/dashboard/ranking/me", "method": "GET"},
            "collection": {"href": "/dashboard/ranking",   "method": "GET"},
        },
    }), 200


@dashboard_bp.get("/stats/scatter")
def stats_scatter():
    """Propuesta Gráfica: Scatter Plot — Tiempo vs Puntuación por Dificultad"""
    rows = (
        db.session.query(PlayerAnswer, User, Memoreto)
        .join(User, PlayerAnswer.user_id == User.id)
        .join(Memoreto, PlayerAnswer.memoreto_id == Memoreto.id)
        .filter(
            PlayerAnswer.resuelto == True,
            PlayerAnswer.time_seconds.isnot(None),
        )
        .all()
    )

    data = [
        {
            "username":     u.username,
            "score":        pa.score,
            "time_seconds": pa.time_seconds,
            "dificultad":   m.dificultad,
            "memoreto":     m.title,
            "intentos":     pa.intentos,
        }
        for pa, u, m in rows
    ]

    return jsonify({"data": data}), 200


@dashboard_bp.get("/stats/progreso")
def stats_progreso():
    """Propuesta Gráfica: Line Chart — Progreso acumulado de puntaje por estudiante"""
    rows = (
        db.session.query(
            User.username,
            PlayerAnswer.submitted_at,
            PlayerAnswer.score,
        )
        .join(User, PlayerAnswer.user_id == User.id)
        .filter(
            PlayerAnswer.resuelto == True,
            User.rol == "estudiante",
        )
        .order_by(User.username, PlayerAnswer.submitted_at)
        .all()
    )

    user_entries = defaultdict(list)
    for username, submitted_at, score in rows:
        date_str = submitted_at.strftime("%Y-%m-%d") if submitted_at else None
        if date_str:
            user_entries[username].append({"date": date_str, "score": score})

    result = {}
    for username, entries in user_entries.items():
        cumulative = 0
        seen = {}
        for entry in entries:
            cumulative += entry["score"]
            seen[entry["date"]] = cumulative
        result[username] = [{"date": d, "score_acumulado": s} for d, s in seen.items()]

    return jsonify({"data": result}), 200
