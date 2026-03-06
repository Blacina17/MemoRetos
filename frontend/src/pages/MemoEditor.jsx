import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createMemoreto, updateMemoreto, getMemoreto } from "../api";
import TopBar from "../components/TopBar";
import MemoCanvas, { figuraToShapes } from "../components/MemoCanvas";

export default function MemoEditor() {
  const { id }   = useParams();
  const isEdit   = !!id;
  const { token } = useAuth();
  const nav       = useNavigate();

  const [form, setForm] = useState({
    title: "", nivel: 1, fase: 1, dificultad: "easy",
    number_set: "1, 2, 3, 4",
    is_published: false,
  });

  // Canvas output
  const [canvasFigures,  setCanvasFigures]  = useState([]);
  const [canvasSolution, setCanvasSolution] = useState(null);
  const [initialShapes,  setInitialShapes]  = useState([]);

  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saveErr, setSaveErr] = useState("");

  // Cargar memoreto existente (modo edición)
  useEffect(() => {
    if (isEdit) {
      getMemoreto(id, token).then((r) => {
        const m = r.data.memoreto;
        if (!m) return;
        setForm({
          title: m.title, nivel: m.nivel, fase: m.fase || 1,
          dificultad: m.dificultad, is_published: m.is_published,
          number_set: (m.number_set || []).join(", "),
        });
        // Reconstruir shapes desde _geo si existe
        if (m.figuras?.some(f => f._geo)) {
          setInitialShapes(figuraToShapes(m.figuras));
          setCanvasFigures(m.figuras);
        }
        setLoading(false);
      });
    }
  }, [id, token]);

  const set = k => e => setForm({
    ...form,
    [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
  });

  // Callback del canvas
  const onCanvasChange = useCallback((figures, _nodes, solution) => {
    setCanvasFigures(figures);
    setCanvasSolution(solution);
    setSaveErr("");
  }, []);

  // Número de conjunto parseado
  const parsedNumberSet = form.number_set
    .split(",")
    .map(n => Number(n.trim()))
    .filter(n => !isNaN(n) && n !== 0);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setSaveErr("El título es obligatorio"); return; }
    if (canvasFigures.length === 0) { setSaveErr("Dibuja al menos una figura en el canvas"); return; }

    setSaving(true);
    setSaveErr("");

    const body = {
      title:        form.title,
      nivel:        Number(form.nivel),
      fase:         Number(form.fase),
      dificultad:   form.dificultad,
      is_published: form.is_published,
      number_set:   parsedNumberSet,
      figuras:      canvasFigures,
      solution:     canvasSolution || {},
    };

    const res = isEdit
      ? await updateMemoreto(id, body, token)
      : await createMemoreto(body, token);

    setSaving(false);
    if (res.data.success) {
      nav("/memoretos");
    } else {
      setSaveErr(res.data.message || "Error al guardar");
    }
  };

  if (loading) return (
    <div className="page-wide">
      <TopBar title="Cargando..." />
      <p className="empty">...</p>
    </div>
  );

  const hasSolution = canvasSolution && Object.keys(canvasSolution).length > 0;

  return (
    <div className="page-wide">
      <TopBar title={isEdit ? "Editar Memoreto" : "Nuevo Memoreto"} />
      <div className="editor-layout">

        {/* ── Columna izquierda: metadatos ── */}
        <div className="editor-meta">
          <form onSubmit={handleSave} id="memo-form">

            <div className="field">
              <label htmlFor="me-title">Título</label>
              <input id="me-title" value={form.title} onChange={set("title")}
                placeholder="Nombre del memoreto" required />
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="me-nivel">Nivel</label>
                <input id="me-nivel" type="number" min={1} value={form.nivel} onChange={set("nivel")} />
              </div>
              <div className="field">
                <label htmlFor="me-fase">Fase</label>
                <input id="me-fase" type="number" min={1} value={form.fase} onChange={set("fase")} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="me-dif">Dificultad</label>
              <select id="me-dif" value={form.dificultad} onChange={set("dificultad")}>
                <option value="easy">Fácil</option>
                <option value="medium">Medio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="me-numset">Números disponibles (separados por coma)</label>
              <input id="me-numset" value={form.number_set} onChange={set("number_set")}
                placeholder="1, 2, 3, 4" />
              <span style={{ fontSize: ".7rem", color: "#64748b" }}>
                Conjunto actual: [{parsedNumberSet.join(", ")}]
              </span>
            </div>

            <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: ".5rem" }}>
              <input type="checkbox" checked={form.is_published}
                onChange={set("is_published")} id="pub" />
              <label htmlFor="pub" style={{ margin: 0 }}>
                Publicar — visible en Unity
              </label>
            </div>

            {/* Resumen de figuras del canvas */}
            {canvasFigures.length > 0 && (
              <div className="canvas-summary">
                <div className="cs-title">Figuras en el canvas</div>
                {canvasFigures.map((f, i) => (
                  <div key={f.id ?? `fig-${i}`} className="cs-row" style={{ borderLeft: `3px solid ${f.color}` }}>
                    <span>{f.type}</span>
                    <span style={{ color: "#64748b" }}>
                      {f.operacion === "suma" ? "Σ" : f.operacion === "multiplicacion" ? "×" : "−"}
                      ={f.target}
                    </span>
                    <span style={{ color: "#64748b", fontSize: ".75rem" }}>
                      nodos: [{f.nodos?.join(", ")}]
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Estado de solución */}
            {hasSolution && (
              <div className="solution-ready">
                ✅ Solución verificada — listo para guardar
              </div>
            )}
            {!hasSolution && canvasFigures.length > 0 && (
              <div className="solution-pending">
                ⚠️ Verifica la solución en el canvas antes de guardar
              </div>
            )}

            {saveErr && <p className="error-msg">{saveErr}</p>}

            <div className="row" style={{ gap: ".5rem", marginTop: ".5rem" }}>
              <button type="submit" form="memo-form" className="btn btn-full" disabled={saving}>
                {saving ? "Guardando..." : hasSolution ? "💾 Guardar con solución" : "Guardar borrador"}
              </button>
              <button type="button" className="btn btn-outline btn-full"
                onClick={() => nav("/memoretos")}>
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* ── Columna derecha: canvas ── */}
        <div className="editor-canvas-col">
          <div className="editor-canvas-title">
            Editor visual de figuras
            <span className="editor-canvas-sub">Arrastra para crear · Superpón para intersecciones · Verifica solución</span>
          </div>
          <MemoCanvas
            onChange={onCanvasChange}
            numberSet={parsedNumberSet}
            initialShapes={initialShapes}
            key={isEdit ? id : "new"}
          />
        </div>

      </div>
    </div>
  );
}
