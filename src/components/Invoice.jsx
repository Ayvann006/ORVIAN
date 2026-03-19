import { useState, useEffect } from "react";
import { fmt, fmtUSD, fmtDate, invNum, todayStr } from "../utils/format.js";
import { orderPaid, orderDebt } from "../utils/calculations.js";
import { PAY_COLORS, PAY_LABELS } from "../utils/constants.js";

/**
 * Tab "Facturas" — idéntico al original.
 * Incluye: WhatsApp, Email, Copiar texto, vista previa y PDF.
 * Cálculo correcto de orderItems (trabajo base + ítems + materiales).
 */
export default function Invoice({ clients, cfg, onInvPrinted }) {
  const [selCli, setSelCli] = useState(clients[0]?.id ?? null);
  const [selOrd, setSelOrd] = useState(null);
  const [invDate, setInvDate] = useState(todayStr());
  const [shareToast, setShareToast] = useState("");

  // Sincronizar selOrd cuando cambia el cliente — igual al original
  const c = clients.find((x) => x.id === selCli);
  useEffect(() => {
    if (c && (c.orders || []).length) setSelOrd(c.orders[0].id);
  }, [selCli]);

  const o = c
    ? (c.orders || []).find((x) => x.id === selOrd) || (c.orders || [])[0]
    : null;
  const isUSD = (o?.currency || "ARS") === "USD";
  const paid = o ? orderPaid(o) : 0;
  const debt = o ? orderDebt(o) : 0;
  const sorted = [...(o?.payments || [])].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const curNum = cfg.nextInvNum || 1;
  const numStr = invNum(curNum);
  const fmtAmt = (v) => (isUSD ? fmtUSD(v) : fmt(v));

  if (!c || !o)
    return (
      <p style={{ color: "#8B7355", padding: 20 }}>Sin clientes o pedidos.</p>
    );

  // ── Cálculo de ítems — idéntico al original ───────────
  const customItemsTotal = (o.customItems || []).reduce(
    (s, x) => s + x.price,
    0
  );
  const stockTotal = (o.usedProducts || []).reduce(
    (s, x) => s + x.qty * x.price,
    0
  );
  const orderItems = [
    {
      desc: o.productName,
      detail: o.notes || "",
      qty: 1,
      unit: "",
      price: o.total - customItemsTotal - stockTotal,
      isMain: true,
    },
    ...(o.customItems || []).map((x) => ({
      desc: x.name,
      detail: x.notes || "Trabajo adicional",
      qty: 1,
      unit: "",
      price: x.price,
      isMain: false,
    })),
    ...(o.usedProducts || []).map((x) => ({
      desc: x.productName,
      detail: `Stock · ${x.qty} ${x.unit}`,
      qty: x.qty,
      unit: x.unit,
      price: x.price,
      isMain: false,
    })),
  ].filter((it) => it.price > 0 || it.isMain);

  // ── Mensaje texto (WhatsApp / Email / Copiar) ─────────
  const buildMessage = () => {
    const lines = [];
    lines.push(cfg.businessName);
    lines.push(`${cfg.businessAddress} · ${cfg.businessPhone}`);
    lines.push("");
    lines.push(`*Comprobante ${numStr}*`);
    lines.push(`Clienta: *${c.name}*`);
    lines.push(`Fecha: ${fmtDate(invDate)}`);
    lines.push("");
    lines.push("*Detalle del pedido*");
    orderItems.forEach((it) => {
      const sub = it.qty * it.price;
      lines.push(
        `  • ${it.desc}${it.qty > 1 ? ` x${it.qty} ${it.unit}` : ""} — ${fmtAmt(
          sub
        )}`
      );
    });
    lines.push("");
    if (sorted.length > 0) {
      lines.push("*Pagos realizados*");
      sorted.forEach((p) =>
        lines.push(
          `  • ${fmtDate(p.date)} · ${PAY_LABELS[p.method]} · *${fmtAmt(
            p.amount
          )}*${p.note ? ` (${p.note})` : ""}`
        )
      );
      lines.push("");
    }
    lines.push(`Total: *${fmtAmt(o.total)}*`);
    lines.push(`Abonado: *${fmtAmt(paid)}*`);
    lines.push(`Saldo: *${fmtAmt(debt)}*`);
    lines.push(
      debt === 0
        ? "\n_¡Gracias por tu confianza!_"
        : `\n_Consultas: ${cfg.businessPhone}_`
    );
    return lines.join("\n");
  };

  const shareWhatsApp = () => {
    const ph = (c.phone || "").replace(/\D/g, "");
    window.open(
      ph
        ? `https://wa.me/${ph}?text=${encodeURIComponent(buildMessage())}`
        : `https://wa.me/?text=${encodeURIComponent(buildMessage())}`,
      "_blank"
    );
  };

  const shareEmail = () => {
    const s = encodeURIComponent(`Comprobante ${numStr} — ${cfg.businessName}`);
    const b = encodeURIComponent(
      buildMessage().replace(/\*/g, "").replace(/_/g, "")
    );
    window.location.href = `mailto:${
      c.email ? encodeURIComponent(c.email) : ""
    }?subject=${s}&body=${b}`;
  };

  const copyText = () => {
    navigator.clipboard.writeText(buildMessage()).then(() => {
      setShareToast("Copiado");
      setTimeout(() => setShareToast(""), 2000);
    });
  };

  // ── PDF ───────────────────────────────────────────────
  const printPDF = () => {
    const itemRows = orderItems
      .map((it) => {
        const sub = it.qty * it.price;
        return `<tr><td>${it.desc}${
          it.detail
            ? `<div style="font-size:10px;color:#8B7355;margin-top:2px">${it.detail}</div>`
            : ""
        }</td><td style="text-align:center">${
          it.qty > 1 ? `${it.qty} ${it.unit}` : "-"
        }</td><td style="text-align:right">${fmtAmt(
          it.price
        )}</td><td style="text-align:right;font-weight:600;color:#C8956C">${fmtAmt(
          sub
        )}</td></tr>`;
      })
      .join("");

    let run = 0;
    const payRows = sorted
      .map((p, i) => {
        run += p.amount;
        const rest = Math.max(0, o.total - run);
        return `<tr><td>${i + 1}</td><td>${fmtDate(p.date)}</td><td>${
          p.note || "Pago"
        }</td><td><span style="background:${PAY_COLORS[p.method]}22;color:${
          PAY_COLORS[p.method]
        };padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600">${
          PAY_LABELS[p.method]
        }</span></td><td style="text-align:right;color:#6B9E8B;font-weight:600">${fmtAmt(
          p.amount
        )}</td><td style="text-align:right;color:${
          rest === 0 ? "#6B9E8B" : "#C8956C"
        }">${fmtAmt(rest)}</td></tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${numStr} — ${
      c.name
    }</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;color:#2C1810}
.pg{max-width:740px;margin:0 auto;padding:44px 50px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid #F0EBE3;margin-bottom:26px}
.brand{font-family:'Outfit',sans-serif;font-size:21px;font-weight:700;color:#2C1810}
.sub{font-size:11px;color:#8B7355;margin-top:5px;line-height:1.8}
.num{font-family:'Outfit',sans-serif;font-size:22px;color:${
      cfg.primaryColor
    };font-weight:700;text-align:right}
.cbox{background:#FDFAF7;border:1.5px solid #F0EBE3;border-radius:10px;padding:14px 18px;margin-bottom:20px}
.sec{font-size:10px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #F0EBE3}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
thead tr{background:#22263A}
thead th{padding:8px 11px;font-size:9px;color:#F0EDF8;text-align:left;text-transform:uppercase;letter-spacing:.5px}
tbody tr{border-bottom:1px solid #F0EBE3}tbody tr:nth-child(even){background:#FDFAF7}
td{padding:8px 11px;font-size:12px;color:#4A3728}
.tbox{background:#FDFAF7;border-radius:10px;padding:14px 18px;margin-bottom:20px}
.tr{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #F0EBE3}
.tr.total{border:none;font-size:15px;font-weight:700;padding-top:10px}
.foot{text-align:center;padding-top:16px;border-top:1px solid #F0EBE3}
.sb{display:inline-block;padding:3px 11px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase}
@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}@page{margin:.4in}.no-print{display:none}}</style></head>
<body><div class="pg">
<div class="hdr">
  <div><div class="brand">${cfg.businessName}</div><div class="sub">${
      cfg.businessAddress
    }<br/>${cfg.businessPhone} · ${cfg.businessEmail}</div></div>
  <div><div class="num">${numStr}</div>
  <div style="font-size:11px;color:#8B7355;text-align:right;margin-top:5px">Fecha: ${fmtDate(
    invDate
  )}</div>
  <div style="text-align:right;margin-top:8px"><span class="sb" style="background:${
    debt === 0 ? "#E8F5F0" : "#FEF3EC"
  };color:${debt === 0 ? "#3D8C70" : "#C8956C"}">${
      debt === 0 ? "SALDADO" : "PENDIENTE"
    }</span></div>
  ${
    isUSD
      ? `<div style="font-size:10px;color:#1A73E8;text-align:right;margin-top:5px">Moneda: USD</div>`
      : ""
  }
  </div>
</div>
<div class="cbox">
  <div class="sec">Cliente</div>
  <div style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:600">${
    c.name
  }</div>
  ${
    c.phone
      ? `<div style="font-size:12px;color:#8B7355;margin-top:4px">${c.phone}${
          c.email ? ` · ${c.email}` : ""
        }</div>`
      : ""
  }
</div>
<div class="sec">Detalle del pedido</div>
<table><thead><tr><th>Descripción</th><th style="text-align:center">Cant.</th><th style="text-align:right">P. Unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
<tbody>${itemRows}</tbody></table>
<div class="sec">Historial de pagos</div>
<table><thead><tr><th>#</th><th>Fecha</th><th>Concepto</th><th>Método</th><th style="text-align:right">Monto</th><th style="text-align:right">Saldo</th></tr></thead>
<tbody>${
      payRows ||
      `<tr><td colspan="6" style="text-align:center;color:#8B7355;padding:14px">Sin pagos registrados</td></tr>`
    }</tbody></table>
<div class="tbox">
  <div class="tr"><span>Total del pedido</span><span>${fmtAmt(
    o.total
  )}</span></div>
  <div class="tr"><span>Total abonado</span><span style="color:#6B9E8B">${fmtAmt(
    paid
  )}</span></div>
  <div class="tr total"><span>Saldo pendiente</span><span style="color:${
    debt === 0 ? "#6B9E8B" : "#C8956C"
  }">${fmtAmt(debt)}</span></div>
</div>
<div class="foot"><p style="font-size:12px;color:#8B7355">¡Gracias por tu confianza!</p><p style="font-size:10px;color:#C0B0A0;margin-top:4px">${
      cfg.businessName
    } · ${fmtDate(todayStr())}</p></div>
</div><script>window.onload=()=>{document.title="${numStr} — ${
      c.name
    }";window.print()}</script></body></html>`;

    const w = window.open("", "_blank", "width=820,height=920");
    w.document.write(html);
    w.document.close();
    onInvPrinted();
  };

  return (
    <div className="fi">
      {shareToast && <div className="toast">{shareToast}</div>}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20 }}>
            Factura Digital
          </h3>
          <p style={{ color: "#8B7355", fontSize: 13, marginTop: 2 }}>
            Próximo número:{" "}
            <strong style={{ color: cfg.primaryColor }}>{numStr}</strong>
          </p>
        </div>
        <button className="btn-p" onClick={printPDF}>
          Descargar PDF
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "210px 1fr",
          gap: 13,
          alignItems: "start",
        }}
        className="grid2"
      >
        {/* Selector cliente/pedido */}
        <div className="card" style={{ padding: 11 }}>
          <p className="lbl" style={{ marginBottom: 7 }}>
            Cliente
          </p>
          {clients.map((cl) => (
            <div
              key={cl.id}
              onClick={() => setSelCli(cl.id)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 5,
                border: `1.5px solid ${
                  selCli === cl.id ? cfg.primaryColor : "#F0EBE3"
                }`,
                background: selCli === cl.id ? "#FEF3EC" : "#FDFAF7",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${cl.color},${cl.color}88)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>
                  {cl.name[0]}
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#2C1810" }}>
                {cl.name}
              </span>
            </div>
          ))}
          {c && (c.orders || []).length > 1 && (
            <>
              <p className="lbl" style={{ margin: "10px 0 6px" }}>
                Pedido
              </p>
              {(c.orders || []).map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setSelOrd(ord.id)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    marginBottom: 5,
                    fontSize: 11,
                    color: "#2C1810",
                    border: `1.5px solid ${
                      selOrd === ord.id ? cfg.primaryColor : "#F0EBE3"
                    }`,
                    background: selOrd === ord.id ? "#FEF3EC" : "#FDFAF7",
                  }}
                >
                  {ord.productName}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Vista previa */}
        <div>
          {/* Header oscuro */}
          <div
            style={{
              background: "linear-gradient(160deg,#22263A,#1A1E28)",
              borderRadius: 13,
              padding: "17px 22px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'Outfit',sans-serif",
                    fontSize: 17,
                    color: "#F0EDF8",
                    fontWeight: 700,
                  }}
                >
                  {cfg.businessName}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: cfg.primaryColor,
                    marginTop: 3,
                    lineHeight: 1.7,
                  }}
                >
                  {cfg.businessAddress}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontFamily: "'Outfit',sans-serif",
                    fontSize: 19,
                    color: cfg.primaryColor,
                    fontWeight: 700,
                  }}
                >
                  {numStr}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 4,
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{ fontSize: 10, color: "rgba(240,237,248,.45)" }}
                  >
                    Fecha:
                  </span>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,.08)",
                      border: "1px solid rgba(200,149,108,.3)",
                      color: "#F0EDF8",
                      borderRadius: 5,
                      padding: "2px 6px",
                      fontSize: 11,
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div style={{ marginTop: 7 }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background:
                        debt === 0
                          ? "rgba(107,158,139,.3)"
                          : "rgba(200,149,108,.3)",
                      color: debt === 0 ? "#A8D8C8" : "#F0C09A",
                    }}
                  >
                    {debt === 0 ? "SALDADO" : "PENDIENTE"}
                  </span>
                  {isUSD && (
                    <span
                      style={{
                        marginLeft: 6,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        background: "rgba(26,115,232,.3)",
                        color: "#93C5FD",
                      }}
                    >
                      USD
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info cliente */}
          <div className="card" style={{ marginBottom: 12 }}>
            <p
              style={{
                fontFamily: "'Outfit',sans-serif",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {c.name}
            </p>
            {c.phone && (
              <p style={{ fontSize: 12, color: "#8B7355", marginTop: 2 }}>
                {c.phone}
                {c.email && ` · ${c.email}`}
              </p>
            )}
          </div>

          {/* Detalle ítems */}
          <div className="card" style={{ marginBottom: 12 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#8B7355",
                marginBottom: 8,
              }}
            >
              DETALLE
            </p>
            {orderItems.map((it, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid #F5F0EA",
                }}
              >
                <div>
                  <p style={{ fontSize: 12, color: "#2C1810" }}>{it.desc}</p>
                  {it.detail && (
                    <p style={{ fontSize: 10, color: "#8B7355" }}>
                      {it.detail}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: cfg.primaryColor,
                    whiteSpace: "nowrap",
                    marginLeft: 10,
                  }}
                >
                  {fmtAmt(it.qty * it.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 13 }}>Total</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {fmtAmt(o.total)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 13 }}>Pagado</span>
              <span style={{ fontSize: 13, color: "#6B9E8B", fontWeight: 600 }}>
                {fmtAmt(paid)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1.5px solid #F0EBE3",
                paddingTop: 8,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>Saldo</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: debt === 0 ? "#6B9E8B" : "#C8956C",
                }}
              >
                {fmtAmt(debt)}
              </span>
            </div>
          </div>

          {/* Botones compartir — restaurados del original */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn-g"
              style={{ fontSize: 12, flex: 1 }}
              onClick={shareWhatsApp}
            >
              💬 WhatsApp
            </button>
            {c.email && (
              <button
                className="btn-g"
                style={{ fontSize: 12, flex: 1 }}
                onClick={shareEmail}
              >
                ✉️ Email
              </button>
            )}
            <button
              className="btn-g"
              style={{ fontSize: 12, flex: 1 }}
              onClick={copyText}
            >
              📋 Copiar texto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
