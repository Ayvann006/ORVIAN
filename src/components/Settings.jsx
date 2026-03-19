import { useState } from "react";
import { Modal, ModalButtons, SecTitle } from "./Modals.jsx";
import { THEMES } from "../utils/constants.js";

/**
 * Modal de configuración del negocio.
 * Permite cambiar nombre, dirección, colores y contraseña.
 */
export default function Settings({
  cfg,
  user,
  onSave,
  onClose,
  onUpdatePassword,
  primary,
}) {
  const [f, setF] = useState({ ...cfg });
  const [np, setNp] = useState("");
  const [np2, setNp2] = useState("");
  const [pm, setPm] = useState("");

  const set = (key) => (e) =>
    setF((prev) => ({ ...prev, [key]: e.target.value }));

  const handlePasswordChange = async () => {
    if (!np || !np2) return setPm("Completá ambos campos.");
    if (np !== np2) return setPm("Las contraseñas no coinciden.");
    if (np.length < 6) return setPm("Mínimo 6 caracteres.");
    try {
      await onUpdatePassword(np);
      setPm("✅ Contraseña actualizada");
      setNp("");
      setNp2("");
    } catch (e) {
      setPm("❌ " + e.message);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 460, maxHeight: "92vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 19 }}>
            Configuración
          </h2>
          <button
            className="iBtn"
            style={{ fontSize: 18, opacity: 0.6 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Usuario */}
        <div
          style={{
            background: "#F5F0FF",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${primary},#8B6F9E)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#2C1810" }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 11, color: "#8B7355" }}>{user?.email}</p>
          </div>
        </div>

        {/* Datos del negocio */}
        <SecTitle>Datos del negocio</SecTitle>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {[
            ["Nombre del negocio", "businessName"],
            ["Dirección", "businessAddress"],
            ["Teléfono", "businessPhone"],
            ["Email", "businessEmail"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="lbl">{label}</label>
              <input className="inp" value={f[key]} onChange={set(key)} />
            </div>
          ))}
        </div>

        {/* Tema de color */}
        <SecTitle>Paleta de colores</SecTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 7,
            marginBottom: 10,
          }}
        >
          {THEMES.map((t) => (
            <label
              key={t.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 10px",
                borderRadius: 9,
                cursor: "pointer",
                border: `1.5px solid ${
                  f.primaryColor === t.p ? "#C8956C" : "#F0EBE3"
                }`,
                background: f.primaryColor === t.p ? "#FEF3EC" : "#FDFAF7",
              }}
            >
              <input
                type="radio"
                style={{ display: "none" }}
                checked={f.primaryColor === t.p}
                onChange={() =>
                  setF((prev) => ({
                    ...prev,
                    primaryColor: t.p,
                    accentColor: t.a,
                  }))
                }
              />
              <div style={{ display: "flex", gap: 3 }}>
                <div
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: t.p,
                  }}
                />
                <div
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: t.a,
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: "#2C1810" }}>{t.name}</span>
            </label>
          ))}
        </div>

        {/* Colores manuales */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {[
            ["Principal", "primaryColor"],
            ["Acento", "accentColor"],
            ["Éxito", "successColor"],
          ].map(([l, k]) => (
            <div key={k}>
              <label className="lbl">{l}</label>
              <input
                type="color"
                className="inp"
                style={{ height: 35, padding: 3, cursor: "pointer" }}
                value={f[k]}
                onChange={set(k)}
              />
            </div>
          ))}
        </div>

        {/* Tipo de dólar */}
        <SecTitle>Cotización dólar</SecTitle>
        <div style={{ marginBottom: 16 }}>
          <label className="lbl">Dólar a usar para conversiones</label>
          <select
            className="inp"
            value={f.dolarType}
            onChange={set("dolarType")}
          >
            <option value="blue">Blue</option>
            <option value="oficial">Oficial</option>
            <option value="mep">MEP / Bolsa</option>
          </select>
        </div>

        {/* Contraseña */}
        <SecTitle>Cambiar contraseña</SecTitle>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div>
            <label className="lbl">Nueva contraseña</label>
            <input
              className="inp"
              type="password"
              placeholder="••••••"
              value={np}
              onChange={(e) => setNp(e.target.value)}
            />
          </div>
          <div>
            <label className="lbl">Repetir</label>
            <input
              className="inp"
              type="password"
              placeholder="••••••"
              value={np2}
              onChange={(e) => setNp2(e.target.value)}
            />
          </div>
          {pm && (
            <p
              style={{
                fontSize: 12,
                color: pm.startsWith("✅") ? "#6B9E8B" : "#C04E4E",
                textAlign: "center",
              }}
            >
              {pm}
            </p>
          )}
          <button
            className="btn-g"
            style={{ fontSize: 12 }}
            onClick={handlePasswordChange}
          >
            Actualizar contraseña
          </button>
        </div>

        {/* Guardar / Cancelar */}
        <div style={{ display: "flex", gap: 9 }}>
          <button className="btn-g" style={{ flex: 1 }} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-p"
            style={{ flex: 2 }}
            onClick={() => {
              onSave(f);
              onClose();
            }}
          >
            Guardar configuración
          </button>
        </div>
      </div>
    </div>
  );
}
