/**
 * Componentes de modal reutilizables.
 * Ninguna lógica de negocio aquí — solo presentación y estructura.
 */

// ─── Overlay + Modal base ─────────────────────────────
export function Modal({ title, sub, onClose, wide, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        style={wide ? { maxWidth: 540 } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: sub ? 4 : 16,
          }}
        >
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 19 }}>
            {title}
          </h2>
          <button
            className="iBtn"
            style={{ fontSize: 18, opacity: 0.6 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {sub && (
          <p style={{ color: "#8B7355", fontSize: 13, marginBottom: 14 }}>
            {sub}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Botones Cancelar / Guardar ───────────────────────
export function ModalButtons({ onCancel, onSave, label = "Guardar" }) {
  return (
    <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
      <button className="btn-g" style={{ flex: 1 }} onClick={onCancel}>
        Cancelar
      </button>
      <button className="btn-p" style={{ flex: 1 }} onClick={onSave}>
        {label}
      </button>
    </div>
  );
}

// ─── Campo de formulario con label ───────────────────
export function Field({ label, children }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      {children}
    </div>
  );
}

// ─── Modal de confirmación de eliminación ─────────────
export function ConfirmModal({
  title,
  sub,
  description,
  note,
  cancelLabel = "Cancelar",
  confirmLabel = "Eliminar",
  onCancel,
  onConfirm,
  danger = true,
}) {
  return (
    <Modal title={title} sub={sub} onClose={onCancel}>
      {description && (
        <p style={{ fontSize: 13, color: "#4A3728", marginBottom: 6 }}>
          {description}
        </p>
      )}
      {note && (
        <p style={{ fontSize: 12, color: "#8B7355", marginBottom: 14 }}>
          {note}
        </p>
      )}
      <div style={{ display: "flex", gap: 9 }}>
        <button className="btn-g" style={{ flex: 1 }} onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          className={danger ? "btn-d" : "btn-p"}
          style={{ flex: 1 }}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ─── Título de sección ────────────────────────────────
export function SecTitle({ children }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#8B7355",
        textTransform: "uppercase",
        letterSpacing: ".8px",
        marginBottom: 9,
        borderBottom: "1px solid #F0EBE3",
        paddingBottom: 6,
      }}
    >
      {children}
    </p>
  );
}
