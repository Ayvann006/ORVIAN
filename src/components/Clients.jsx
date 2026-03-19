import { useState } from "react";
import { Modal, ModalButtons, Field, ConfirmModal } from "./Modals.jsx";
import { fmt, fmtUSD, fmtDate, todayStr } from "../utils/format.js";
import {
  CLI_COLORS,
  ORDER_STAGES,
  EMPTY_CLIENT,
  EMPTY_ORDER,
  EMPTY_PAYMENT,
  EMPTY_CUSTOM_ITEM,
} from "../utils/constants.js";
import {
  orderPaid,
  orderDebt,
  orderPaidARS,
  orderDebtARS,
  orderTotalARS,
  cliPaidARS,
  cliDebtARS,
  cliTotalARS,
} from "../utils/calculations.js";
import { PAY_COLORS, PAY_LABELS } from "../utils/constants.js";

/**
 * Tab "Clientes" — master/detail idéntico al original.
 * Lista → click → detalle del cliente con todos sus pedidos expandidos.
 */
export default function Clients({
  clients,
  products,
  cfg,
  rate,
  selClient,
  setSelClient,
  onSaveClient,
  onUpdateClient,
  onDeleteClient,
  onSaveClientNote,
  onSaveOrder,
  onUpdateOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSavePayment,
  onUpdatePayment,
  onDeletePayment,
  onSaveCustomItem,
  onDeleteCustomItem,
  onAddProductToOrder,
  onRemoveProductFromOrder,
  setProducts,
}) {
  const p = cfg.primaryColor;
  const a = cfg.accentColor;
  const sc = cfg.successColor;

  // Modals
  const [addClient, setAddClient] = useState(false);
  const [editCli, setEditCli] = useState(null);
  const [addOrder, setAddOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [addPay, setAddPay] = useState(null);
  const [editPay, setEditPay] = useState(null);
  const [addCustomItem, setAddCustomItem] = useState(null);
  const [removeCustom, setRemoveCustom] = useState(null);
  const [addStockProd, setAddStockProd] = useState(null);
  const [removeUsed, setRemoveUsed] = useState(null);
  const [editNote, setEditNote] = useState(null);

  // Forms
  const [fCli, setFCli] = useState(EMPTY_CLIENT);
  const [fECli, setFECli] = useState(EMPTY_CLIENT);
  const [fOrd, setFOrd] = useState(EMPTY_ORDER);
  const [fEOrd, setFEOrd] = useState(EMPTY_ORDER);
  const [fPay, setFPay] = useState(EMPTY_PAYMENT);
  const [fEPay, setFEPay] = useState(EMPTY_PAYMENT);
  const [fCI, setFCI] = useState(EMPTY_CUSTOM_ITEM);

  const c = clients.find((x) => x.id === selClient);

  return (
    <div className="fi">
      {/* ── VISTA LISTA ── */}
      {selClient === null ? (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <p style={{ color: "#8B7355", fontSize: 13 }}>
              {clients.length} clientas
            </p>
            <button
              className="btn-p"
              onClick={() => {
                setFCli(EMPTY_CLIENT);
                setAddClient(true);
              }}
            >
              + Nueva
            </button>
          </div>
          {clients.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: 30 }}>
              <p style={{ color: "#8B7355", fontSize: 14 }}>
                Agregá tu primer cliente con "+ Nueva".
              </p>
            </div>
          )}
          {clients.map((cl) => {
            const paid = cliPaidARS(cl, rate);
            const debt = cliDebtARS(cl, rate);
            const total = cliTotalARS(cl, rate);
            const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
            return (
              <div
                key={cl.id}
                className="crow"
                onClick={() => setSelClient(cl.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,${cl.color},${cl.color}88)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}
                    >
                      {cl.name[0]}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cl.name}
                        </h4>
                        <p
                          style={{
                            fontSize: 10,
                            color: "#8B7355",
                            marginTop: 1,
                          }}
                        >
                          {(cl.orders || []).length} pedido
                          {(cl.orders || []).length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          flexShrink: 0,
                          marginLeft: 9,
                        }}
                      >
                        <p style={{ fontSize: 12, fontWeight: 700 }}>
                          {fmt(total)}
                        </p>
                        <span
                          className="badge"
                          style={{
                            background: debt === 0 ? "#E8F5F0" : "#FEF3EC",
                            color: debt === 0 ? "#3D8C70" : p,
                            marginTop: 2,
                            fontSize: 9,
                          }}
                        >
                          {debt === 0 ? "✓ Saldada" : `Debe ${fmt(debt)}`}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <div className="pbar" style={{ flex: 1 }}>
                        <div
                          className="pfill"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg,${cl.color},${cl.color}aa)`,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 9,
                          color: "#8B7355",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmt(paid)}/{fmt(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── VISTA DETALLE ── */
        c && (
          <div className="fi">
            <button
              className="btn-g"
              style={{ marginBottom: 12 }}
              onClick={() => setSelClient(null)}
            >
              ← Volver
            </button>

            {/* Header cliente */}
            <div
              className="card"
              style={{
                marginBottom: 11,
                background: `linear-gradient(135deg,${c.color}12,#fff)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 9,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,${c.color},${c.color}88)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}
                    >
                      {c.name[0]}
                    </span>
                  </div>
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Outfit',sans-serif",
                        fontSize: 17,
                      }}
                    >
                      {c.name}
                    </h2>
                    {c.phone && (
                      <p
                        style={{ color: "#8B7355", fontSize: 12, marginTop: 2 }}
                      >
                        📱 {c.phone}
                        {c.email && ` · ✉️ ${c.email}`}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <button
                    className="btn-g"
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      setEditCli(c);
                      setFECli({
                        name: c.name,
                        phone: c.phone || "",
                        email: c.email || "",
                        color: c.color,
                      });
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-d"
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      onDeleteClient(c.id, () => setSelClient(null));
                    }}
                  >
                    🗑️
                  </button>
                  <button
                    className="btn-g"
                    style={{ fontSize: 11 }}
                    onClick={() =>
                      setEditNote({
                        clientId: c.id,
                        note: c.internalNote || "",
                      })
                    }
                  >
                    Nota interna
                  </button>
                  <button
                    className="btn-p"
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      setFOrd(EMPTY_ORDER);
                      setAddOrder(c.id);
                    }}
                  >
                    + Pedido
                  </button>
                </div>
              </div>

              {/* Nota interna */}
              {c.internalNote && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#FFFBF0",
                    border: "1.5px solid #F0DFA0",
                    fontSize: 12,
                    color: "#6B5C20",
                    fontStyle: "italic",
                  }}
                >
                  {c.internalNote}
                </div>
              )}

              {/* KPIs del cliente */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 8,
                  marginTop: 12,
                }}
                className="grid4"
              >
                {[
                  {
                    l: "Total (ARS)",
                    v: fmt(cliTotalARS(c, rate)),
                    col: "#2C1810",
                  },
                  { l: "Pagado", v: fmt(cliPaidARS(c, rate)), col: sc },
                  {
                    l: "Saldo",
                    v: fmt(cliDebtARS(c, rate)),
                    col: cliDebtARS(c, rate) === 0 ? sc : p,
                  },
                ].map((x, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: "center",
                      padding: "9px",
                      borderRadius: 8,
                      background: "#fff",
                      boxShadow: "0 1px 5px rgba(0,0,0,.05)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: "#8B7355",
                        textTransform: "uppercase",
                        letterSpacing: ".7px",
                        marginBottom: 3,
                      }}
                    >
                      {x.l}
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: x.col,
                        fontFamily: "'Outfit',sans-serif",
                      }}
                    >
                      {x.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {(c.orders || []).length === 0 && (
              <div
                className="card"
                style={{ textAlign: "center", padding: 22, marginBottom: 11 }}
              >
                <p style={{ color: "#8B7355", fontSize: 13 }}>
                  Sin pedidos todavía. Usá "+ Pedido" para agregar.
                </p>
              </div>
            )}

            {/* Pedidos */}
            {(c.orders || []).map((o) => {
              const isUSD = (o.currency || "ARS") === "USD";
              const opaid = orderPaid(o);
              const odebt = orderDebt(o);
              const opaidARS = orderPaidARS(o, rate);
              const odebtARS = orderDebtARS(o, rate);
              const ototalARS = orderTotalARS(o, rate);
              const matTotal = (o.usedProducts || []).reduce(
                (s, x) => s + x.qty * x.price,
                0
              );
              const costEst = o.costEstimate || 0;
              const margin =
                o.total > 0 && costEst > 0
                  ? Math.round(((o.total - costEst) / o.total) * 100)
                  : null;
              const stage =
                ORDER_STAGES.find((s) => s.key === (o.status || "medidas")) ||
                ORDER_STAGES[0];
              const today = todayStr();
              const dueDiff = o.dueDate
                ? Math.ceil(
                    (new Date(o.dueDate) - new Date(today)) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;
              const installAmt =
                o.installments > 0 && o.total > 0
                  ? o.total / o.installments
                  : null;
              const fmtAmt = (v) => (isUSD ? fmtUSD(v) : fmt(v));

              return (
                <div
                  key={o.id}
                  className="card"
                  style={{
                    marginBottom: 11,
                    borderTop: `3px solid ${stage.color}`,
                  }}
                >
                  {/* Selector de estado + fecha entrega */}
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      marginBottom: 10,
                      overflowX: "auto",
                      paddingBottom: 2,
                    }}
                  >
                    {ORDER_STAGES.map((s) => (
                      <button
                        key={s.key}
                        onClick={() =>
                          onUpdateOrderStatus(c.id, o.id, s.key, ORDER_STAGES)
                        }
                        style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          border: `1.5px solid ${
                            o.status === s.key ? s.color : "#E8DDD0"
                          }`,
                          background:
                            o.status === s.key ? s.color + "22" : "#FDFAF7",
                          color: o.status === s.key ? s.color : "#8B7355",
                          fontSize: 10,
                          fontWeight: o.status === s.key ? 700 : 400,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                    {o.dueDate && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 10,
                          padding: "4px 9px",
                          borderRadius: 20,
                          background:
                            dueDiff < 0
                              ? "#FEE2E2"
                              : dueDiff <= 2
                              ? "#FEF3EC"
                              : "#F0EBE3",
                          color:
                            dueDiff < 0
                              ? "#C04E4E"
                              : dueDiff <= 2
                              ? "#C8956C"
                              : "#8B7355",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        Entrega: {fmtDate(o.dueDate)}
                        {dueDiff !== null &&
                          ` (${
                            dueDiff < 0
                              ? `-${-dueDiff}d`
                              : dueDiff === 0
                              ? "hoy"
                              : `${dueDiff}d`
                          })`}
                      </span>
                    )}
                  </div>

                  {/* Header del pedido */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 11,
                      flexWrap: "wrap",
                      gap: 7,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          marginBottom: 2,
                        }}
                      >
                        <h4
                          style={{
                            fontFamily: "'Outfit',sans-serif",
                            fontSize: 15,
                          }}
                        >
                          {o.productName}
                        </h4>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 20,
                            background: isUSD ? "#E8F0FE" : "#F0EBE3",
                            color: isUSD ? "#1A73E8" : "#8B7355",
                          }}
                        >
                          {isUSD ? "💵 USD" : "🇦🇷 ARS"}
                        </span>
                      </div>
                      {o.notes && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#8B7355",
                            marginTop: 2,
                            fontStyle: "italic",
                          }}
                        >
                          {o.notes}
                        </p>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 5,
                          flexWrap: "wrap",
                        }}
                      >
                        {isUSD ? (
                          <>
                            <span
                              style={{
                                fontSize: 11,
                                color: "#1A73E8",
                                fontWeight: 600,
                              }}
                            >
                              {fmtUSD(o.total)}{" "}
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 400,
                                  color: "#8B7355",
                                }}
                              >
                                ≈ {fmt(ototalARS)}
                              </span>
                            </span>
                            <span style={{ fontSize: 11, color: sc }}>
                              Pagado: <strong>{fmtUSD(opaid)}</strong>
                            </span>
                            {odebt > 0 && (
                              <span style={{ fontSize: 11, color: p }}>
                                Saldo:{" "}
                                <strong>
                                  {fmtUSD(odebt)} ≈ {fmt(odebtARS)}
                                </strong>
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: 11, color: "#4A3728" }}>
                              Total: <strong>{fmt(o.total)}</strong>
                            </span>
                            <span style={{ fontSize: 11, color: sc }}>
                              Pagado: <strong>{fmt(opaid)}</strong>
                            </span>
                            {odebt > 0 && (
                              <span style={{ fontSize: 11, color: p }}>
                                Saldo: <strong>{fmt(odebt)}</strong>
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {/* Margen e instalamentos */}
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        {margin !== null && (
                          <span
                            style={{
                              fontSize: 10,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background:
                                margin >= 50
                                  ? "#E8F5F0"
                                  : margin >= 30
                                  ? "#FEF3EC"
                                  : "#FEE2E2",
                              color:
                                margin >= 50
                                  ? "#3D8C70"
                                  : margin >= 30
                                  ? "#C8956C"
                                  : "#C04E4E",
                              fontWeight: 600,
                            }}
                          >
                            Margen: {margin}%
                          </span>
                        )}
                        {installAmt && (
                          <span
                            style={{
                              fontSize: 10,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: "#F0EBFF",
                              color: "#6A4E8A",
                              fontWeight: 600,
                            }}
                          >
                            {o.installments} cuotas de{" "}
                            {isUSD ? fmtUSD(installAmt) : fmt(installAmt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        className="badge"
                        style={{
                          background: odebt === 0 ? "#E8F5F0" : "#FEF3EC",
                          color: odebt === 0 ? "#3D8C70" : p,
                          fontSize: 9,
                        }}
                      >
                        {odebt === 0 ? "Saldado" : "Pendiente"}
                      </span>
                      <button
                        className="iBtn"
                        onClick={() => {
                          setEditOrder({ clientId: c.id, order: o });
                          setFEOrd({
                            productName: o.productName,
                            total: String(o.total),
                            notes: o.notes || "",
                            currency: o.currency || "ARS",
                            costEstimate: String(o.costEstimate || ""),
                            installments: String(o.installments || ""),
                            dueDate: o.dueDate || "",
                            status: o.status || "medidas",
                          });
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="iBtn"
                        onClick={() => onDeleteOrder(c.id, o.id)}
                      >
                        🗑️
                      </button>
                      <button
                        className="btn-g"
                        style={{ fontSize: 11, padding: "4px 9px" }}
                        onClick={() => {
                          setFPay(EMPTY_PAYMENT);
                          setAddPay({ clientId: c.id, orderId: o.id });
                        }}
                      >
                        + Pago
                      </button>
                      <button
                        className="btn-g"
                        style={{
                          fontSize: 11,
                          padding: "4px 9px",
                          borderColor: a,
                          color: a,
                        }}
                        onClick={() =>
                          setAddStockProd({ clientId: c.id, orderId: o.id })
                        }
                      >
                        + Stock
                      </button>
                      <button
                        className="btn-g"
                        style={{
                          fontSize: 11,
                          padding: "4px 9px",
                          borderColor: "#7AA8C4",
                          color: "#4A6B8A",
                        }}
                        onClick={() => {
                          setFCI(EMPTY_CUSTOM_ITEM);
                          setAddCustomItem({ clientId: c.id, orderId: o.id });
                        }}
                      >
                        + Ítem
                      </button>
                    </div>
                  </div>

                  {/* Materiales de stock */}
                  {(o.usedProducts || []).length > 0 && (
                    <div
                      style={{
                        marginBottom: 12,
                        padding: "10px 12px",
                        borderRadius: 9,
                        background: "#FDFAF7",
                        border: `1.5px solid ${a}33`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#8B7355",
                            textTransform: "uppercase",
                            letterSpacing: ".6px",
                          }}
                        >
                          Materiales de stock
                        </p>
                        <span
                          style={{ fontSize: 11, fontWeight: 700, color: a }}
                        >
                          {fmt(matTotal)}
                        </span>
                      </div>
                      {(o.usedProducts || []).map((up) => (
                        <div
                          key={up.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 0",
                            borderBottom: "1px solid #F0EBE3",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#2C1810",
                              }}
                            >
                              {up.productName}
                            </p>
                            <p style={{ fontSize: 10, color: "#8B7355" }}>
                              {up.qty} {up.unit} · {fmt(up.price)}/{up.unit}
                            </p>
                          </div>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: a,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmt(up.qty * up.price)}
                          </p>
                          <button
                            className="iBtn"
                            title="Quitar y devolver al stock"
                            onClick={() =>
                              setRemoveUsed({
                                clientId: c.id,
                                orderId: o.id,
                                usedProduct: up,
                              })
                            }
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ítems adicionales */}
                  {(o.customItems || []).length > 0 && (
                    <div
                      style={{
                        marginBottom: 12,
                        padding: "10px 12px",
                        borderRadius: 9,
                        background: "#F5F0FF",
                        border: "1.5px solid #C8B8E833",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#6A4E8A",
                            textTransform: "uppercase",
                            letterSpacing: ".6px",
                          }}
                        >
                          Trabajos adicionales
                        </p>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#6A4E8A",
                          }}
                        >
                          {fmt(
                            (o.customItems || []).reduce(
                              (s, x) => s + x.price,
                              0
                            )
                          )}
                        </span>
                      </div>
                      {(o.customItems || []).map((ci) => (
                        <div
                          key={ci.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 0",
                            borderBottom: "1px solid #E8DDF5",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#2C1810",
                              }}
                            >
                              {ci.name}
                            </p>
                            {ci.notes && (
                              <p style={{ fontSize: 10, color: "#8B7355" }}>
                                {ci.notes}
                              </p>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#6A4E8A",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmt(ci.price)}
                          </p>
                          <button
                            className="iBtn"
                            title="Quitar ítem"
                            onClick={() =>
                              setRemoveCustom({
                                clientId: c.id,
                                orderId: o.id,
                                item: ci,
                              })
                            }
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tabla de pagos */}
                  {(o.payments || []).length > 0 && (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          minWidth: 280,
                        }}
                      >
                        <thead>
                          <tr style={{ borderBottom: "2px solid #F0EBE3" }}>
                            {["Fecha", "Monto", "Método", "Nota", ""].map(
                              (h) => (
                                <th
                                  key={h}
                                  style={{
                                    padding: "6px 7px",
                                    textAlign: "left",
                                    fontSize: 9,
                                    fontWeight: 600,
                                    color: "#8B7355",
                                    textTransform: "uppercase",
                                    letterSpacing: ".5px",
                                  }}
                                >
                                  {h}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {[...(o.payments || [])]
                            .sort((a, b) => a.date.localeCompare(b.date))
                            .map((x) => (
                              <tr
                                key={x.id}
                                style={{ borderBottom: "1px solid #F5F0EA" }}
                              >
                                <td
                                  style={{
                                    padding: "6px 7px",
                                    fontSize: 11,
                                    color: "#4A3728",
                                  }}
                                >
                                  {fmtDate(x.date)}
                                </td>
                                <td
                                  style={{
                                    padding: "6px 7px",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: sc,
                                  }}
                                >
                                  {fmtAmt(x.amount)}
                                </td>
                                <td style={{ padding: "6px 7px" }}>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "1px 6px",
                                      borderRadius: 20,
                                      fontSize: 9,
                                      fontWeight: 600,
                                      background: PAY_COLORS[x.method] + "22",
                                      color: PAY_COLORS[x.method],
                                    }}
                                  >
                                    {PAY_LABELS[x.method]}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "6px 7px",
                                    fontSize: 11,
                                    color: "#8B7355",
                                  }}
                                >
                                  {x.note || "-"}
                                </td>
                                <td
                                  style={{
                                    padding: "5px 5px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <button
                                    className="iBtn"
                                    onClick={() => {
                                      setEditPay({
                                        clientId: c.id,
                                        orderId: o.id,
                                        payment: x,
                                      });
                                      setFEPay({
                                        date: x.date,
                                        amount: String(x.amount),
                                        method: x.method,
                                        note: x.note || "",
                                      });
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="iBtn"
                                    onClick={() =>
                                      onDeletePayment(c.id, o.id, x.id)
                                    }
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ═══ MODALS ═══ */}

      {addClient && (
        <Modal title="Nueva Cliente" onClose={() => setAddClient(false)}>
          <ClientForm form={fCli} setForm={setFCli} />
          <ModalButtons
            onCancel={() => setAddClient(false)}
            onSave={() =>
              onSaveClient(fCli, () => {
                setAddClient(false);
                setFCli(EMPTY_CLIENT);
              })
            }
          />
        </Modal>
      )}

      {editCli && (
        <Modal title="Editar Cliente" onClose={() => setEditCli(null)}>
          <ClientForm form={fECli} setForm={setFECli} />
          <ModalButtons
            onCancel={() => setEditCli(null)}
            onSave={() =>
              onUpdateClient(editCli.id, fECli, () => setEditCli(null))
            }
          />
        </Modal>
      )}

      {addOrder !== null && (
        <Modal
          title="Nuevo Pedido"
          sub={clients.find((cl) => cl.id === addOrder)?.name}
          onClose={() => setAddOrder(null)}
          wide
        >
          <OrderForm form={fOrd} setForm={setFOrd} p={p} />
          <ModalButtons
            onCancel={() => setAddOrder(null)}
            onSave={() =>
              onSaveOrder(addOrder, fOrd, () => {
                setAddOrder(null);
                setFOrd(EMPTY_ORDER);
              })
            }
          />
        </Modal>
      )}

      {editOrder && (
        <Modal
          title="Editar Pedido"
          sub={clients.find((cl) => cl.id === editOrder.clientId)?.name}
          onClose={() => setEditOrder(null)}
          wide
        >
          <OrderForm form={fEOrd} setForm={setFEOrd} p={p} />
          <ModalButtons
            onCancel={() => setEditOrder(null)}
            onSave={() =>
              onUpdateOrder(editOrder.clientId, editOrder.order.id, fEOrd, () =>
                setEditOrder(null)
              )
            }
          />
        </Modal>
      )}

      {addPay && (
        <Modal
          title="Registrar Pago"
          sub={clients.find((cl) => cl.id === addPay.clientId)?.name}
          onClose={() => setAddPay(null)}
        >
          <PaymentForm form={fPay} setForm={setFPay} />
          <ModalButtons
            onCancel={() => setAddPay(null)}
            onSave={() =>
              onSavePayment(addPay.clientId, addPay.orderId, fPay, () => {
                setAddPay(null);
                setFPay(EMPTY_PAYMENT);
              })
            }
          />
        </Modal>
      )}

      {editPay && (
        <Modal title="Editar Pago" onClose={() => setEditPay(null)}>
          <PaymentForm form={fEPay} setForm={setFEPay} />
          <ModalButtons
            onCancel={() => setEditPay(null)}
            onSave={() =>
              onUpdatePayment(
                editPay.clientId,
                editPay.orderId,
                editPay.payment.id,
                fEPay,
                () => setEditPay(null)
              )
            }
          />
        </Modal>
      )}

      {addCustomItem && (
        <Modal
          title="Agregar ítem a la factura"
          sub={clients.find((cl) => cl.id === addCustomItem.clientId)?.name}
          onClose={() => setAddCustomItem(null)}
        >
          <p style={{ fontSize: 12, color: "#8B7355", marginBottom: 12 }}>
            Agregá un trabajo adicional que no está en el stock. Se sumará al
            total del pedido y aparecerá en la factura.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="Nombre del ítem *">
              <input
                className="inp"
                placeholder="Ej: Vestido corto para el Civil"
                value={fCI.name}
                onChange={(e) =>
                  setFCI((x) => ({ ...x, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Detalle / Descripción">
              <input
                className="inp"
                placeholder="Ej: Sin mangas, color marfil"
                value={fCI.notes}
                onChange={(e) =>
                  setFCI((x) => ({ ...x, notes: e.target.value }))
                }
              />
            </Field>
            <Field label="Precio *">
              <input
                className="inp"
                type="number"
                placeholder="0"
                value={fCI.price}
                onChange={(e) =>
                  setFCI((x) => ({ ...x, price: e.target.value }))
                }
              />
            </Field>
            <div
              style={{
                background: "#F5F0FF",
                borderRadius: 9,
                padding: "10px 12px",
                border: "1.5px solid #C8B8E855",
              }}
            >
              <p style={{ fontSize: 12, color: "#6A4E8A" }}>
                Este ítem aparecerá como una línea separada en la factura junto
                con el pedido principal.
              </p>
            </div>
          </div>
          <ModalButtons
            onCancel={() => setAddCustomItem(null)}
            onSave={() =>
              onSaveCustomItem(
                addCustomItem.clientId,
                addCustomItem.orderId,
                fCI,
                () => {
                  setAddCustomItem(null);
                  setFCI(EMPTY_CUSTOM_ITEM);
                }
              )
            }
            label="Agregar al pedido"
          />
        </Modal>
      )}

      {removeCustom && (
        <ConfirmModal
          title="¿Quitar ítem?"
          sub={removeCustom.item.name}
          description={`Se eliminará ${removeCustom.item.name} (${fmt(
            removeCustom.item.price
          )}) del pedido.`}
          note="El total del pedido se reducirá en ese monto."
          confirmLabel="Quitar ítem"
          onCancel={() => setRemoveCustom(null)}
          onConfirm={() => {
            onDeleteCustomItem(
              removeCustom.clientId,
              removeCustom.orderId,
              removeCustom.item,
              () => setRemoveCustom(null)
            );
          }}
        />
      )}

      {/* Modal agregar producto del stock — fiel al original */}
      {addStockProd && (
        <AddStockProductModal
          products={products}
          primary={p}
          onClose={() => setAddStockProd(null)}
          onAdd={(sel, qty) => {
            onAddProductToOrder({
              clientId: addStockProd.clientId,
              orderId: addStockProd.orderId,
              product: sel,
              qty,
              setProducts,
            });
            setAddStockProd(null);
          }}
        />
      )}

      {removeUsed && (
        <ConfirmModal
          title="¿Quitar material?"
          sub={removeUsed.usedProduct.productName}
          description={`Se quitará ${removeUsed.usedProduct.qty} ${removeUsed.usedProduct.unit} del pedido y se devolverán al stock.`}
          note="Esta acción no se puede deshacer."
          confirmLabel="Quitar y devolver stock"
          onCancel={() => setRemoveUsed(null)}
          onConfirm={() => {
            onRemoveProductFromOrder({
              clientId: removeUsed.clientId,
              orderId: removeUsed.orderId,
              usedProduct: removeUsed.usedProduct,
              setProducts,
            });
            setRemoveUsed(null);
          }}
        />
      )}

      {editNote && (
        <Modal
          title="Nota interna"
          sub="Solo visible para vos, no aparece en facturas"
          onClose={() => setEditNote(null)}
        >
          <textarea
            className="inp"
            rows={4}
            style={{ resize: "vertical", fontFamily: "inherit" }}
            placeholder="Observaciones, preferencias, historial..."
            value={editNote.note}
            onChange={(e) =>
              setEditNote((n) => ({ ...n, note: e.target.value }))
            }
          />
          <ModalButtons
            onCancel={() => setEditNote(null)}
            onSave={() =>
              onSaveClientNote(editNote.clientId, editNote.note, () =>
                setEditNote(null)
              )
            }
          />
        </Modal>
      )}
    </div>
  );
}

// ── AddStockProductModal — idéntico al original ────────
function AddStockProductModal({ products, onAdd, onClose, primary }) {
  const [selId, setSelId] = useState(null);
  const [qty, setQty] = useState("1");
  const available = products.filter((x) => x.stock > 0);
  const sel = available.find((x) => x.id === selId);

  const confirm = () => {
    if (!sel || !parseFloat(qty) || parseFloat(qty) <= 0) return;
    const q = parseFloat(qty);
    if (q > sel.stock) return;
    onAdd(sel, q);
  };

  return (
    <Modal title="Agregar producto del stock" onClose={onClose} wide>
      {available.length === 0 ? (
        <p
          style={{
            color: "#8B7355",
            textAlign: "center",
            padding: 20,
            fontSize: 13,
          }}
        >
          No hay productos con stock disponible.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 12, color: "#8B7355", marginBottom: 12 }}>
            Seleccioná un producto del catálogo. Se descontará del stock al
            confirmar.
          </p>
          <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 14 }}>
            {available.map((prod) => {
              const low = prod.minStock > 0 && prod.stock <= prod.minStock;
              return (
                <div
                  key={prod.id}
                  className={`prod-row${selId === prod.id ? " sel" : ""}`}
                  onClick={() => {
                    setSelId(prod.id);
                    setQty("1");
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#2C1810",
                      }}
                    >
                      {prod.name}
                    </p>
                    {prod.category && (
                      <p style={{ fontSize: 10, color: "#8B7355" }}>
                        {prod.category}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: low ? "#C04E4E" : primary,
                      }}
                    >
                      {prod.stock} {prod.unit}
                    </p>
                    <p style={{ fontSize: 10, color: "#8B7355" }}>
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      }).format(prod.price)}
                      /{prod.unit}
                    </p>
                  </div>
                  {selId === prod.id && (
                    <span style={{ color: primary, fontSize: 16 }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
          {sel && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                background: "#FDFAF7",
                border: "1.5px solid #F0EBE3",
                marginBottom: 14,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#2C1810",
                  marginBottom: 8,
                }}
              >
                {sel.name}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 9,
                }}
              >
                <Field label={`Cantidad (${sel.unit}) *`}>
                  <input
                    className="inp"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={sel.stock}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    style={{
                      borderColor: parseFloat(qty) > sel.stock ? "#E07070" : "",
                    }}
                  />
                  {parseFloat(qty) > sel.stock && (
                    <p style={{ fontSize: 10, color: "#C04E4E", marginTop: 3 }}>
                      Máximo: {sel.stock} {sel.unit}
                    </p>
                  )}
                </Field>
                <div
                  style={{
                    padding: "10px",
                    borderRadius: 8,
                    background: "#fff",
                    border: "1.5px solid #F0EBE3",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: "#8B7355",
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    Subtotal
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: primary,
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      maximumFractionDigits: 0,
                    }).format((parseFloat(qty) || 0) * sel.price)}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 10, color: "#8B7355", marginTop: 8 }}>
                Stock después:{" "}
                <strong>
                  {Math.max(0, sel.stock - (parseFloat(qty) || 0))} {sel.unit}
                </strong>
              </p>
            </div>
          )}
          <ModalButtons
            onCancel={onClose}
            onSave={confirm}
            label="Agregar al pedido"
          />
        </>
      )}
    </Modal>
  );
}

// ── Formularios ────────────────────────────────────────
function ClientForm({ form, setForm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Field label="Nombre *">
        <input
          className="inp"
          placeholder="Ej: María González"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <Field label="Teléfono">
          <input
            className="inp"
            placeholder="11-0000"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </Field>
        <Field label="Email">
          <input
            className="inp"
            placeholder="mail@..."
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </Field>
      </div>
      <Field label="Color">
        <div
          style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}
        >
          {CLI_COLORS.map((col) => (
            <button
              key={col}
              onClick={() => setForm((f) => ({ ...f, color: col }))}
              style={{
                width: 25,
                height: 25,
                borderRadius: "50%",
                background: col,
                border: `3px solid ${
                  form.color === col ? "#2C1810" : "transparent"
                }`,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </Field>
    </div>
  );
}

function OrderForm({ form, setForm, p }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Field label="Descripción del trabajo *">
        <input
          className="inp"
          placeholder="Ej: Vestido de novia"
          value={form.productName}
          onChange={(e) =>
            setForm((f) => ({ ...f, productName: e.target.value }))
          }
        />
      </Field>
      <Field label="Moneda">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          {[
            ["ARS", "Pesos ARS"],
            ["USD", "Dólares USD"],
          ].map(([cur, lbl]) => (
            <button
              key={cur}
              onClick={() => setForm((f) => ({ ...f, currency: cur }))}
              style={{
                padding: "9px",
                borderRadius: 8,
                border: `2px solid ${form.currency === cur ? p : "#E8DDD0"}`,
                background: form.currency === cur ? "#FEF3EC" : "#FDFAF7",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: form.currency === cur ? 700 : 400,
                color: form.currency === cur ? p : "#8B7355",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <Field label="Total *">
          <input
            className="inp"
            type="number"
            placeholder="0"
            value={form.total}
            onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
          />
        </Field>
        <Field label="Costo estimado">
          <input
            className="inp"
            type="number"
            placeholder="0"
            value={form.costEstimate}
            onChange={(e) =>
              setForm((f) => ({ ...f, costEstimate: e.target.value }))
            }
          />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <Field label="Fecha de entrega">
          <input
            className="inp"
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, dueDate: e.target.value }))
            }
          />
        </Field>
        <Field label="Cuotas (0=contado)">
          <input
            className="inp"
            type="number"
            placeholder="0"
            value={form.installments}
            onChange={(e) =>
              setForm((f) => ({ ...f, installments: e.target.value }))
            }
          />
        </Field>
      </div>
      <Field label="Estado">
        <select
          className="inp"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        >
          {ORDER_STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notas / Detalle">
        <textarea
          className="inp"
          rows={2}
          style={{ resize: "vertical" }}
          placeholder="Detalles, medidas, preferencias..."
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </Field>
    </div>
  );
}

function PaymentForm({ form, setForm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Field label="Fecha">
        <input
          className="inp"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
      </Field>
      <Field label="Monto *">
        <input
          className="inp"
          type="number"
          placeholder="0"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
        />
      </Field>
      <Field label="Método">
        <select
          className="inp"
          value={form.method}
          onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
        >
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="tarjeta">Tarjeta</option>
        </select>
      </Field>
      <Field label="Nota">
        <input
          className="inp"
          placeholder="Opcional"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />
      </Field>
    </div>
  );
}
