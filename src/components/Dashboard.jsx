import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { calcMetrics, cliPaidARS, cliDebtARS } from "../utils/calculations.js";
import { fmt, fmtUSD, fmtDate, todayStr } from "../utils/format.js";
import { PAY_COLORS } from "../utils/constants.js";

export default function Dashboard({
  clients,
  cats,
  products,
  sales = [],
  cfg,
  rate,
  search,
  onTabChange,
  onSelectClient,
}) {
  const p = cfg.primaryColor;
  const sc = cfg.successColor;

  // ── Métricas — sales incluidas ────────────────────────
  const {
    allPays,
    incomeARS,
    incomeARSPedidos,
    incomeARSVentas,
    incomeUSD,
    incomeUSDinARS,
    totalIncome,
    totalExpenses,
    totalDebt,
    profit,
    byMethod,
    monthly,
  } = useMemo(
    () => calcMetrics({ clients, cats, rate, sales }),
    [clients, cats, rate, sales]
  );

  const today = todayStr();

  // Alertas entregas
  const dueAlerts = useMemo(
    () =>
      clients
        .flatMap((c) =>
          (c.orders || [])
            .filter((o) => o.dueDate && o.status !== "entregado")
            .map((o) => {
              const diff = Math.ceil(
                (new Date(o.dueDate) - new Date(today)) / (1000 * 60 * 60 * 24)
              );
              return { ...o, clientName: c.name, clientId: c.id, diff };
            })
        )
        .filter((o) => o.diff <= 5)
        .sort((a, b) => a.diff - b.diff),
    [clients]
  );

  // Búsqueda global
  const searchResults = useMemo(() => {
    if (!search || search.trim().length <= 1) return null;
    const q = search.toLowerCase();
    return {
      matchClients: clients.filter((c) => c.name.toLowerCase().includes(q)),
      matchOrders: clients.flatMap((c) =>
        (c.orders || [])
          .filter((o) => o.productName.toLowerCase().includes(q))
          .map((o) => ({ ...o, clientName: c.name, clientId: c.id }))
      ),
      matchProds: products.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          (x.category || "").toLowerCase().includes(q)
      ),
    };
  }, [search, clients, products]);

  const lowStock = products.filter(
    (x) => x.minStock > 0 && x.stock <= x.minStock
  );
  const recentSales = [...sales]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div
      className="fi"
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      {/* Búsqueda global */}
      {searchResults &&
        (() => {
          const total =
            searchResults.matchClients.length +
            searchResults.matchOrders.length +
            searchResults.matchProds.length;
          return (
            <div className="card" style={{ border: `1.5px solid ${p}55` }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#8B7355",
                  marginBottom: 10,
                }}
              >
                {total} resultado{total !== 1 ? "s" : ""} para "{search}"
              </p>
              {searchResults.matchClients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onTabChange("clientes");
                    onSelectClient(c.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "8px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: "#FDFAF7",
                    border: "1.5px solid #F0EBE3",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}
                    >
                      {c.name[0]}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</p>
                    <p style={{ fontSize: 10, color: "#8B7355" }}>Cliente</p>
                  </div>
                </div>
              ))}
              {searchResults.matchOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    onTabChange("clientes");
                    onSelectClient(o.clientId);
                  }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: "#FDFAF7",
                    border: "1.5px solid #F0EBE3",
                    marginBottom: 6,
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 600 }}>
                    {o.productName}
                  </p>
                  <p style={{ fontSize: 10, color: "#8B7355" }}>
                    {o.clientName} · {fmt(o.total)}
                  </p>
                </div>
              ))}
              {searchResults.matchProds.map((x) => (
                <div
                  key={x.id}
                  onClick={() => onTabChange("productos")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: "#FDFAF7",
                    border: "1.5px solid #F0EBE3",
                    marginBottom: 6,
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 600 }}>{x.name}</p>
                  <p style={{ fontSize: 10, color: "#8B7355" }}>
                    Stock: {x.stock} {x.unit} · {fmt(x.price)}
                  </p>
                </div>
              ))}
              {total === 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#B0A090",
                    textAlign: "center",
                    padding: 8,
                  }}
                >
                  Sin resultados
                </p>
              )}
            </div>
          );
        })()}

      {/* Alertas entregas */}
      {dueAlerts.length > 0 && (
        <div
          className="card"
          style={{ border: "1.5px solid #E07070", background: "#FFF5F5" }}
        >
          <h3
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 14,
              marginBottom: 10,
              color: "#C04E4E",
            }}
          >
            Entregas próximas o vencidas
          </h3>
          {dueAlerts.map((o) => (
            <div
              key={o.id}
              onClick={() => {
                onTabChange("clientes");
                onSelectClient(o.clientId);
              }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: 8,
                background: "#fff",
                marginBottom: 6,
                cursor: "pointer",
                border: `1.5px solid ${
                  o.diff < 0 ? "#E07070" : o.diff <= 2 ? "#C8956C" : "#F0EBE3"
                }`,
              }}
            >
              <div>
                <p style={{ fontSize: 12, fontWeight: 600 }}>{o.productName}</p>
                <p style={{ fontSize: 10, color: "#8B7355" }}>{o.clientName}</p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  color:
                    o.diff < 0
                      ? "#C04E4E"
                      : o.diff <= 2
                      ? "#C8956C"
                      : "#8B7355",
                  background:
                    o.diff < 0
                      ? "#FEE2E2"
                      : o.diff <= 2
                      ? "#FEF3EC"
                      : "#F0EBE3",
                }}
              >
                {o.diff < 0
                  ? `Venció hace ${-o.diff}d`
                  : o.diff === 0
                  ? "Vence hoy"
                  : `${o.diff}d`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Ventas directas recientes */}
      {sales.length > 0 && (
        <div
          className="card"
          style={{ border: `1.5px solid ${sc}44`, background: `${sc}08` }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "'Outfit',sans-serif",
                  fontSize: 15,
                  color: "#2C1810",
                }}
              >
                🛒 Ventas directas
              </h3>
              {incomeARSVentas > 0 && (
                <p style={{ fontSize: 10, color: "#8B7355", marginTop: 2 }}>
                  Incluidas en el total de ingresos
                </p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: sc,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {fmt(incomeARSVentas)}
              </span>
              <button
                className="btn-g"
                style={{ fontSize: 11, padding: "4px 10px" }}
                onClick={() => onTabChange("ventas")}
              >
                Ver todas
              </button>
            </div>
          </div>
          {recentSales.map((sale) => (
            <div
              key={sale.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 9px",
                borderRadius: 8,
                background: "#fff",
                border: "1px solid #F0EBE3",
                marginBottom: 5,
              }}
            >
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#2C1810" }}>
                  {sale.productName}
                </p>
                <p style={{ fontSize: 10, color: "#8B7355" }}>
                  {sale.qty} {sale.unit} · {fmtDate(sale.date)}
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: sc }}>
                {fmt(sale.total)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Gráfico mensual — ya incluye ventas directas en ingresosARS */}
      <div className="card">
        <h3
          style={{
            fontFamily: "'Outfit',sans-serif",
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          Evolución Mensual
        </h3>
        <p style={{ fontSize: 10, color: "#8B7355", marginBottom: 12 }}>
          Ingresos (pedidos + ventas directas) · Gastos en ARS
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="gARS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={sc} stopOpacity={0.35} />
                <stop offset="95%" stopColor={sc} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gUSD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gGas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={p} stopOpacity={0.3} />
                <stop offset="95%" stopColor={p} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#8B7355" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#8B7355" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v, n) => [
                fmt(v),
                n === "ingresosARS"
                  ? "🇦🇷 ARS (pedidos + ventas)"
                  : n === "ingresosUSD"
                  ? "💵 USD→ARS"
                  : "📋 Gastos",
              ]}
              contentStyle={{
                fontFamily: "DM Sans",
                borderRadius: 8,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,.1)",
              }}
            />
            <Legend
              formatter={(v) =>
                v === "ingresosARS"
                  ? "🇦🇷 ARS (pedidos + ventas)"
                  : v === "ingresosUSD"
                  ? "💵 USD→ARS"
                  : "📋 Gastos"
              }
            />
            <Area
              type="monotone"
              dataKey="ingresosARS"
              stroke={sc}
              strokeWidth={2}
              fill="url(#gARS)"
            />
            <Area
              type="monotone"
              dataKey="ingresosUSD"
              stroke="#1A73E8"
              strokeWidth={2}
              fill="url(#gUSD)"
            />
            <Area
              type="monotone"
              dataKey="gastos"
              stroke={p}
              strokeWidth={2}
              fill="url(#gGas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stock bajo */}
      {lowStock.length > 0 && (
        <div
          className="card"
          style={{ border: `1.5px solid ${p}44`, background: `${p}08` }}
        >
          <h3
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 15,
              marginBottom: 9,
              color: p,
            }}
          >
            Stock bajo
          </h3>
          {lowStock.map((x) => (
            <div
              key={x.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "7px 10px",
                borderRadius: 8,
                background: "#fff",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500 }}>{x.name}</span>
              <span style={{ fontSize: 11, color: p, fontWeight: 600 }}>
                {x.stock} {x.unit} (mín: {x.minStock})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Por método + Clientes */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        className="grid2"
      >
        <div className="card">
          <h3
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 15,
              marginBottom: 10,
            }}
          >
            Por Método
          </h3>
          <p style={{ fontSize: 9, color: "#8B7355", marginBottom: 8 }}>
            Pedidos + ventas directas
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {byMethod
              .filter((m) => m.ars > 0 || m.usd > 0)
              .map((m) => (
                <div
                  key={m.key}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "#FDFAF7",
                    border: "1.5px solid #F0EBE3",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: PAY_COLORS[m.key],
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#2C1810",
                        }}
                      >
                        {m.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#2C1810",
                      }}
                    >
                      {fmt(m.arsTotal)}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {m.ars > 0 && (
                      <span
                        style={{
                          fontSize: 9,
                          background: "#E8F5F0",
                          color: "#3D8C70",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        🇦🇷 {fmt(m.ars)}
                      </span>
                    )}
                    {m.usd > 0 && (
                      <span
                        style={{
                          fontSize: 9,
                          background: "#E8F0FE",
                          color: "#1A73E8",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        💵 {fmtUSD(m.usd)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            {byMethod.every((m) => m.ars === 0 && m.usd === 0) && (
              <p
                style={{
                  color: "#B0A090",
                  fontSize: 11,
                  textAlign: "center",
                  padding: 8,
                }}
              >
                Sin pagos
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <h3
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 15,
              marginBottom: 9,
            }}
          >
            Clientes
          </h3>
          {clients.length === 0 ? (
            <p
              style={{
                color: "#B0A090",
                fontSize: 12,
                textAlign: "center",
                padding: 10,
              }}
            >
              Sin clientes
            </p>
          ) : (
            clients.map((c) => {
              const paid = cliPaidARS(c, rate);
              const debt = cliDebtARS(c, rate);
              const total = paid + debt;
              const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
              return (
                <div
                  key={c.id}
                  style={{
                    padding: "7px 9px",
                    borderRadius: 8,
                    background: "#FDFAF7",
                    border: "1.5px solid #F0EBE3",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 600 }}>
                      {c.name}
                    </span>
                    {debt === 0 ? (
                      <span
                        className="badge"
                        style={{
                          background: "#E8F5F0",
                          color: "#3D8C70",
                          fontSize: 9,
                        }}
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        className="badge"
                        style={{ background: "#FEF3EC", color: p, fontSize: 9 }}
                      >
                        {fmt(debt)}
                      </span>
                    )}
                  </div>
                  <div className="pbar">
                    <div
                      className="pfill"
                      style={{ width: `${pct}%`, background: c.color }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontSize: 9, color: "#8B7355" }}>
                      {fmt(paid)}
                    </span>
                    <span style={{ fontSize: 9, color: "#8B7355" }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Últimos movimientos */}
      <div className="card">
        <h3
          style={{
            fontFamily: "'Outfit',sans-serif",
            fontSize: 15,
            marginBottom: 9,
          }}
        >
          Últimos Movimientos
        </h3>
        {allPays.length === 0 ? (
          <p
            style={{
              color: "#B0A090",
              fontSize: 12,
              textAlign: "center",
              padding: 10,
            }}
          >
            Sin pagos
          </p>
        ) : (
          [...allPays]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 6)
            .map((x, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 10px",
                  borderRadius: 7,
                  background: i % 2 === 0 ? "#FDFAF7" : "#fff",
                  marginBottom: 2,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: PAY_COLORS[x.method],
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500 }}>
                      {x.clientName}
                    </p>
                    <p style={{ fontSize: 9, color: "#8B7355" }}>
                      {x.orderName}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: sc }}>
                    {x.currency === "USD" ? fmtUSD(x.amount) : fmt(x.amount)}
                  </p>
                  <p style={{ fontSize: 9, color: "#B0A090" }}>
                    {fmtDate(x.date)}
                  </p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
