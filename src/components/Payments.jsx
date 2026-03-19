import { useMemo } from "react";
import { fmt, fmtUSD, fmtDate } from "../utils/format.js";
import { PAY_COLORS, PAY_LABELS } from "../utils/constants.js";

/**
 * Tab "Pagos" — vista global de todos los pagos registrados,
 * agrupados y con resumen por método.
 */
export default function Payments({ clients, cfg, rate }) {
  const p = cfg.primaryColor;
  const sc = cfg.successColor;

  // Aplanar todos los pagos con contexto de cliente/pedido/moneda
  const allPays = useMemo(
    () =>
      clients
        .flatMap((c) =>
          (c.orders || []).flatMap((o) =>
            (o.payments || []).map((pay) => ({
              ...pay,
              currency: o.currency || "ARS",
              clientName: c.name,
              clientColor: c.color,
              orderName: o.productName,
            }))
          )
        )
        .sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [clients]
  );

  // Totales por método
  const byMethod = useMemo(() => {
    const m = {
      efectivo: { ars: 0, usd: 0 },
      transferencia: { ars: 0, usd: 0 },
      tarjeta: { ars: 0, usd: 0 },
    };
    allPays.forEach((x) => {
      if (x.currency === "USD") m[x.method].usd += x.amount;
      else m[x.method].ars += x.amount;
    });
    return Object.entries(m).map(([k, v]) => ({
      key: k,
      label: PAY_LABELS[k],
      color: PAY_COLORS[k],
      ars: v.ars,
      usd: v.usd,
      arsTotal: v.ars + v.usd * rate,
    }));
  }, [allPays, rate]);

  const totalARS = allPays
    .filter((x) => x.currency === "ARS")
    .reduce((s, x) => s + x.amount, 0);
  const totalUSD = allPays
    .filter((x) => x.currency === "USD")
    .reduce((s, x) => s + x.amount, 0);
  const grandTotal = totalARS + totalUSD * rate;

  return (
    <div>
      {/* ── Resumen por método ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
          marginBottom: 14,
        }}
        className="grid4"
      >
        {byMethod.map((m) => (
          <div
            key={m.key}
            className="card"
            style={{ borderLeft: `4px solid ${m.color}` }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#8B7355",
                textTransform: "uppercase",
                letterSpacing: ".6px",
                marginBottom: 6,
              }}
            >
              {m.label}
            </p>
            {m.usd > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    background: "#E8F0FE",
                    color: "#1A73E8",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  USD
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#1A73E8" }}
                >
                  {fmtUSD(m.usd)}
                </span>
              </div>
            )}
            {m.ars > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    background: "#F0EBE3",
                    color: "#8B7355",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  ARS
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#2C1810" }}
                >
                  {fmt(m.ars)}
                </span>
              </div>
            )}
            <div
              style={{
                borderTop: "1px solid #F0EBE3",
                marginTop: 5,
                paddingTop: 5,
              }}
            >
              <p style={{ fontSize: 9, color: "#8B7355", marginBottom: 2 }}>
                Total ARS equiv.
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: m.color,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {fmt(m.arsTotal)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Total global ── */}
      <div
        className="card"
        style={{
          marginBottom: 14,
          background: "linear-gradient(135deg,#22263A,#1C1F2E)",
          border: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                color: "rgba(240,237,248,.5)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".6px",
              }}
            >
              Total cobrado
            </p>
            <p
              style={{
                fontFamily: "'Outfit',sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#F0EDF8",
                marginTop: 2,
              }}
            >
              {fmt(grandTotal)}
            </p>
            <p
              style={{
                fontSize: 10,
                color: "rgba(240,237,248,.4)",
                marginTop: 3,
              }}
            >
              ARS {fmt(totalARS)} · USD {fmtUSD(totalUSD)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "rgba(240,237,248,.5)" }}>
              {allPays.length} pago{allPays.length !== 1 ? "s" : ""} registrado
              {allPays.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Lista de pagos ── */}
      {allPays.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: "center", padding: "40px 20px" }}
        >
          <p style={{ fontSize: 32, marginBottom: 10 }}>💳</p>
          <p style={{ color: "#8B7355", fontSize: 13 }}>
            Sin pagos registrados aún
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allPays.map((pay) => (
            <div
              key={pay.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
                borderRadius: 10,
                padding: "11px 14px",
                boxShadow: "0 1px 6px rgba(44,24,16,.05)",
                border: "1.5px solid #F0EBE3",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Avatar cliente */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: `linear-gradient(135deg,${pay.clientColor},${pay.clientColor}88)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}
                  >
                    {pay.clientName[0]}
                  </span>
                </div>
                <div>
                  <p
                    style={{ fontSize: 13, fontWeight: 600, color: "#2C1810" }}
                  >
                    {pay.clientName}
                  </p>
                  <p style={{ fontSize: 11, color: "#8B7355" }}>
                    {pay.orderName}
                    {pay.note && <span> · {pay.note}</span>}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                {/* Método */}
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: `${PAY_COLORS[pay.method]}22`,
                    color: PAY_COLORS[pay.method],
                    textTransform: "uppercase",
                    letterSpacing: ".4px",
                  }}
                >
                  {PAY_LABELS[pay.method]}
                </span>

                {/* Moneda */}
                {pay.currency === "USD" && (
                  <span
                    style={{
                      fontSize: 9,
                      background: "#E8F0FE",
                      color: "#1A73E8",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    USD
                  </span>
                )}

                {/* Monto */}
                <p
                  style={{
                    fontFamily: "'Outfit',sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: sc,
                    minWidth: 80,
                    textAlign: "right",
                  }}
                >
                  {pay.currency === "USD"
                    ? fmtUSD(pay.amount)
                    : fmt(pay.amount)}
                </p>

                {/* Fecha */}
                <p
                  style={{
                    fontSize: 11,
                    color: "#8B7355",
                    minWidth: 60,
                    textAlign: "right",
                  }}
                >
                  {fmtDate(pay.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
