import { useState, useEffect, useRef } from "react";
import Dashboard from "../components/Dashboard.jsx";
import Clients from "../components/Clients.jsx";
import Inventory from "../components/Inventory.jsx";
import Expenses from "../components/Expenses.jsx";
import Payments from "../components/Payments.jsx";
import Invoice from "../components/Invoice.jsx";
import Reports from "../components/Reports.jsx";
import Settings from "../components/Settings.jsx";
import { dolarApi } from "../services/api.js";
import { exportCSV } from "../utils/calculations.js";
import { fmt } from "../utils/format.js";

/**
 * Página principal. Nombres de tabs idénticos al original:
 * resumen · clientes · gastos · productos · facturas · reportes
 * El estado selClient se eleva aquí para que Dashboard pueda redirigir.
 */
export default function Home({
  user,
  cfg,
  setCfg,
  clients,
  cats,
  products,
  setProducts,
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
  onSaveCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSaveExpense,
  onUpdateExpense,
  onDeleteExpense,
  onSaveProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock,
  onLogout,
  onUpdatePassword,
  doToast,
  toast,
}) {
  const [tab, setTab] = useState("resumen");
  const [selClient, setSelClient] = useState(null);
  const [search, setSearch] = useState("");
  const [showCfg, setShowCfg] = useState(false);
  const [dolar, setDolar] = useState({
    blue: 0,
    oficial: 0,
    mep: 0,
    updatedAt: null,
  });

  const p = cfg.primaryColor;
  const a = cfg.accentColor;
  const sc = cfg.successColor;

  // CSS custom properties para colores dinámicos
  const cssVars = { "--p": p, "--a": a, "--sc": sc };

  // ── Cotización dólar ────────────────────────────────
  const fetchDolar = async () => {
    try {
      setDolar(await dolarApi.fetch());
    } catch {
      /* sin conexión */
    }
  };
  useEffect(() => {
    fetchDolar();
    const t = setInterval(fetchDolar, 10 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const rate =
    cfg.dolarType === "oficial"
      ? dolar.oficial
      : cfg.dolarType === "mep"
      ? dolar.mep
      : dolar.blue;

  const handleInvPrinted = () =>
    setCfg((prev) => ({ ...prev, nextInvNum: (prev.nextInvNum || 1) + 1 }));

  // Tabs idénticos al original
  const TABS = [
    { key: "resumen", label: "Resumen" },
    { key: "clientes", label: "Clientes" },
    { key: "gastos", label: "Gastos" },
    { key: "productos", label: "Productos" },
    { key: "facturas", label: "Facturas" },
    { key: "reportes", label: "Reportes" },
  ];

  // KPIs globales para el header
  const totalIncome = clients
    .flatMap((c) =>
      (c.orders || []).flatMap((o) =>
        (o.payments || []).map((p) => ({
          amount: p.amount,
          currency: o.currency || "ARS",
        }))
      )
    )
    .reduce(
      (s, x) => s + (x.currency === "USD" ? x.amount * rate : x.amount),
      0
    );
  const totalExpenses = cats.reduce(
    (s, c) => s + c.items.reduce((a, e) => a + e.amount, 0),
    0
  );
  const totalDebt = clients.reduce(
    (s, c) =>
      s +
      (c.orders || []).reduce((a, o) => {
        const d = Math.max(
          0,
          o.total - (o.payments || []).reduce((p, x) => p + x.amount, 0)
        );
        return a + (o.currency === "USD" ? d * rate : d);
      }, 0),
    0
  );
  const profit = totalIncome - totalExpenses;

  // Ingresos desglosados para KPI cards
  const incomeARS = clients
    .flatMap((c) =>
      (c.orders || []).flatMap((o) =>
        (o.payments || [])
          .filter(() => (o.currency || "ARS") === "ARS")
          .map((p) => p.amount)
      )
    )
    .reduce((s, x) => s + x, 0);
  const incomeUSD = clients
    .flatMap((c) =>
      (c.orders || []).flatMap((o) =>
        (o.payments || [])
          .filter(() => o.currency === "USD")
          .map((p) => p.amount)
      )
    )
    .reduce((s, x) => s + x, 0);
  const debtARS = clients.reduce(
    (s, c) =>
      s +
      (c.orders || [])
        .filter((o) => (o.currency || "ARS") === "ARS")
        .reduce(
          (a, o) =>
            a +
            Math.max(
              0,
              o.total - (o.payments || []).reduce((p, x) => p + x.amount, 0)
            ),
          0
        ),
    0
  );
  const debtUSD = clients.reduce(
    (s, c) =>
      s +
      (c.orders || [])
        .filter((o) => o.currency === "USD")
        .reduce(
          (a, o) =>
            a +
            Math.max(
              0,
              o.total - (o.payments || []).reduce((p, x) => p + x.amount, 0)
            ),
          0
        ),
    0
  );

  return (
    <div
      style={{
        fontFamily: "'DM Sans',sans-serif",
        background: "#FAF7F2",
        minHeight: "100vh",
        color: "#2C1810",
        ...cssVars,
      }}
    >
      {toast && <div className="toast">{toast}</div>}

      {/* ── HEADER ── */}
      <div
        style={{
          background: "linear-gradient(160deg,#22263A 0%,#1C1F2E 100%)",
          padding: "13px 17px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 9,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div>
            <h1
              style={{
                fontFamily: "'Outfit',sans-serif",
                fontSize: 17,
                color: "#F0EDF8",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {cfg.businessName}
            </h1>
            <p style={{ color: p, fontSize: 10, marginTop: 1 }}>
              Hola, {user.name} ·{" "}
              {new Date().toLocaleDateString("es-AR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Buscador global */}
        <div style={{ flex: "1 1 180px", maxWidth: 260 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente, pedido, producto..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(180,170,200,.18)",
              color: "#F0EDF8",
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: 12,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>

        {/* Cotización dólar */}
        <div
          title="Clic para actualizar"
          onClick={fetchDolar}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(180,170,200,.15)",
            borderRadius: 9,
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 13 }}>💵</span>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {[
                ["blue", "Blue"],
                ["oficial", "Oficial"],
                ["mep", "MEP"],
              ].map(([k, l]) => {
                const active =
                  cfg.dolarType === k || (!cfg.dolarType && k === "blue");
                return (
                  <span
                    key={k}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCfg((c) => ({ ...c, dolarType: k }));
                    }}
                    style={{
                      fontSize: 10,
                      fontWeight: active ? 700 : 400,
                      color: active ? p : "rgba(180,170,200,.5)",
                      cursor: "pointer",
                      borderBottom: active ? `1px solid ${p}` : "none",
                    }}
                  >
                    {l}:{" "}
                    <strong style={{ color: "#F0EDF8" }}>
                      {fmt(dolar[k])}
                    </strong>
                  </span>
                );
              })}
            </div>
            {dolar.updatedAt && (
              <p
                style={{
                  fontSize: 8,
                  color: "rgba(180,170,200,.35)",
                  marginTop: 1,
                }}
              >
                ↻{" "}
                {dolar.updatedAt.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            className="btn-p"
            style={{ fontSize: 12, padding: "7px 12px" }}
            onClick={() => {
              setTab("clientes");
              setSelClient(null);
            }}
          >
            + Cliente
          </button>
          <button
            onClick={() => exportCSV(clients, cats)}
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(180,170,200,.18)",
              color: "#B8B4CC",
              padding: "7px 11px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          >
            Exportar
          </button>
          <button
            onClick={() => setShowCfg(true)}
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(180,170,200,.18)",
              color: "#B8B4CC",
              padding: "7px 11px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          >
            Config
          </button>
          <button
            onClick={onLogout}
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(180,170,200,.18)",
              color: "#B8B4CC",
              padding: "7px 11px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* ── KPI CARDS (globales, siempre visibles) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          padding: "12px 12px 0",
        }}
        className="grid4"
      >
        {/* Ingresos */}
        <div
          className="card fi"
          style={{ borderLeft: `4px solid ${sc}`, padding: "12px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "#8B7355",
                textTransform: "uppercase",
                letterSpacing: ".7px",
              }}
            >
              Ingresos
            </p>
          </div>
          {incomeUSD > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1A73E8" }}>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                }).format(incomeUSD)}
              </span>
            </div>
          )}
          {incomeARS > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  background: "#E8F5F0",
                  color: "#3D8C70",
                  padding: "1px 5px",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                ARS
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#3D8C70" }}>
                {fmt(incomeARS)}
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
              Total en ARS
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: sc,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {fmt(totalIncome)}
            </p>
          </div>
        </div>
        {/* Gastos */}
        <div
          className="card fi"
          style={{
            borderLeft: `4px solid ${p}`,
            padding: "12px",
            animationDelay: ".06s",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "#8B7355",
                textTransform: "uppercase",
                letterSpacing: ".7px",
              }}
            >
              Gastos
            </p>
            <span style={{ fontSize: 16, opacity: 0.6 }}>📋</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
            <span style={{ fontSize: 12, fontWeight: 700, color: p }}>
              {fmt(totalExpenses)}
            </span>
          </div>
          <div
            style={{
              borderTop: "1px solid #F0EBE3",
              marginTop: 5,
              paddingTop: 5,
            }}
          >
            <p style={{ fontSize: 9, color: "#8B7355", marginBottom: 2 }}>
              {cats.reduce((s, c) => s + c.items.length, 0)} egresos
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: p,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {fmt(totalExpenses)}
            </p>
          </div>
        </div>
        {/* Ganancia */}
        <div
          className="card fi"
          style={{
            borderLeft: `4px solid ${profit >= 0 ? sc : "#C04E4E"}`,
            padding: "12px",
            animationDelay: ".12s",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "#8B7355",
                textTransform: "uppercase",
                letterSpacing: ".7px",
              }}
            >
              Ganancia
            </p>
          </div>
          {incomeUSD > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
              <span style={{ fontSize: 11, color: "#1A73E8" }}>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                }).format(incomeUSD)}{" "}
                cobrado
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
              Ingreso−Gasto ARS
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: profit >= 0 ? sc : "#C04E4E",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {fmt(profit)}
            </p>
          </div>
        </div>
        {/* Por cobrar */}
        <div
          className="card fi"
          style={{
            borderLeft: `4px solid ${a}`,
            padding: "12px",
            animationDelay: ".18s",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "#8B7355",
                textTransform: "uppercase",
                letterSpacing: ".7px",
              }}
            >
              Por cobrar
            </p>
          </div>
          {debtUSD > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1A73E8" }}>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                }).format(debtUSD)}
              </span>
            </div>
          )}
          {debtARS > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  background: "#F5F0FF",
                  color: a,
                  padding: "1px 5px",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                ARS
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: a }}>
                {fmt(debtARS)}
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
              {
                clients.filter((c) =>
                  c.orders?.some(
                    (o) =>
                      Math.max(
                        0,
                        o.total -
                          (o.payments || []).reduce((s, p) => s + p.amount, 0)
                      ) > 0
                  )
                ).length
              }{" "}
              clientes
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: a,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {fmt(totalDebt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ padding: "12px 12px 0" }}>
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #E8DDD0",
            overflowX: "auto",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tbtn ${tab === t.key ? "on" : ""}`}
              onClick={() => {
                setTab(t.key);
                if (t.key !== "clientes") setSelClient(null);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ padding: "12px 12px 40px" }}>
        {tab === "resumen" && (
          <Dashboard
            clients={clients}
            cats={cats}
            products={products}
            cfg={cfg}
            rate={rate}
            search={search}
            onTabChange={(t) => setTab(t)}
            onSelectClient={(id) => {
              setTab("clientes");
              setSelClient(id);
            }}
          />
        )}

        {tab === "clientes" && (
          <Clients
            clients={clients}
            products={products}
            cfg={cfg}
            rate={rate}
            selClient={selClient}
            setSelClient={setSelClient}
            onSaveClient={onSaveClient}
            onUpdateClient={onUpdateClient}
            onDeleteClient={onDeleteClient}
            onSaveClientNote={onSaveClientNote}
            onSaveOrder={onSaveOrder}
            onUpdateOrder={onUpdateOrder}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onDeleteOrder={onDeleteOrder}
            onSavePayment={onSavePayment}
            onUpdatePayment={onUpdatePayment}
            onDeletePayment={onDeletePayment}
            onSaveCustomItem={onSaveCustomItem}
            onDeleteCustomItem={onDeleteCustomItem}
            onAddProductToOrder={onAddProductToOrder}
            onRemoveProductFromOrder={onRemoveProductFromOrder}
            setProducts={setProducts}
          />
        )}

        {tab === "gastos" && (
          <Expenses
            cats={cats}
            cfg={cfg}
            onSaveCategory={onSaveCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onSaveExpense={onSaveExpense}
            onUpdateExpense={onUpdateExpense}
            onDeleteExpense={onDeleteExpense}
          />
        )}

        {tab === "productos" && (
          <Inventory
            products={products}
            cfg={cfg}
            onSaveProduct={onSaveProduct}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onAdjustStock={onAdjustStock}
          />
        )}

        {tab === "facturas" && (
          <Invoice
            clients={clients}
            cfg={cfg}
            onInvPrinted={handleInvPrinted}
          />
        )}

        {tab === "reportes" && (
          <Reports clients={clients} cats={cats} cfg={cfg} rate={rate} />
        )}
      </div>

      {/* Settings */}
      {showCfg && (
        <Settings
          cfg={cfg}
          user={user}
          primary={p}
          onUpdatePassword={onUpdatePassword}
          onSave={(newCfg) => {
            setCfg(newCfg);
            doToast("Configuración guardada");
          }}
          onClose={() => setShowCfg(false)}
        />
      )}
    </div>
  );
}
