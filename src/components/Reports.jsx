import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { calcMetrics, cliPaidARS, cliDebtARS } from "../utils/calculations.js";
import { fmt, fmtUSD } from "../utils/format.js";
import { exportCSV } from "../utils/calculations.js";

export default function Reports({ clients, cats, sales = [], cfg, rate }) {
  const p = cfg.primaryColor;
  const a = cfg.accentColor;
  const sc = cfg.successColor;

  // ── Métricas con ventas incluidas ─────────────────────
  const {
    incomeARS,
    incomeARSPedidos,
    incomeARSVentas,
    incomeUSD,
    incomeUSDinARS,
    totalIncome,
    totalExpenses,
    profit,
    monthly,
    expBreak,
  } = useMemo(
    () => calcMetrics({ clients, cats, rate, sales }),
    [clients, cats, rate, sales]
  );

  return (
    <div
      className="fi"
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      {/* Exportar */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn-g"
          onClick={() => exportCSV(clients, cats, sales)}
          style={{ fontSize: 12 }}
        >
          Exportar CSV/Excel
        </button>
      </div>

      {/* Desglose de ingresos */}
      {incomeARSVentas > 0 && (
        <div
          className="card"
          style={{ border: `1.5px solid ${sc}44`, background: `${sc}08` }}
        >
          <h3
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            Desglose de ingresos ARS
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {[
              {
                label: "Pedidos de clientes",
                value: incomeARSPedidos,
                color: p,
              },
              {
                label: "Ventas directas 🛒",
                value: incomeARSVentas,
                color: sc,
              },
              { label: "Total ARS", value: incomeARS, color: "#2C1810" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  textAlign: "center",
                  padding: "10px 8px",
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid #F0EBE3",
                }}
              >
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: "#8B7355",
                    textTransform: "uppercase",
                    letterSpacing: ".6px",
                    marginBottom: 5,
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: item.color,
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  {fmt(item.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico barras anual — ya incluye ventas */}
      <div className="card">
        <h3
          style={{
            fontFamily: "'Outfit',sans-serif",
            fontSize: 15,
            marginBottom: 4,
          }}
        >
          Ingresos · Gastos · Ganancia
        </h3>
        <p style={{ fontSize: 10, color: "#8B7355", marginBottom: 12 }}>
          Los ingresos ARS incluyen pedidos + ventas directas
        </p>
        <ResponsiveContainer width="100%" height={195}>
          <BarChart data={monthly} barGap={3}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F0EBE3"
              vertical={false}
            />
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
              formatter={(v, n) => [fmt(v), n]}
              contentStyle={{
                fontFamily: "DM Sans",
                borderRadius: 8,
                border: "none",
                boxShadow: "0 4px 14px rgba(0,0,0,.1)",
              }}
            />
            <Legend />
            <Bar
              dataKey="ingresosARS"
              name="🇦🇷 ARS"
              fill={sc}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="ingresosUSD"
              name="💵 USD→ARS"
              fill="#1A73E8"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="gastos"
              name="Gastos"
              fill={p}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="ganancia"
              name="Ganancia"
              fill={a}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gastos por categoría + Por cliente */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        className="grid2"
      >
        <div className="card">
          <h3
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            Gastos por categoría
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={expBreak}
                  cx="50%"
                  cy="50%"
                  innerRadius={34}
                  outerRadius={56}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expBreak.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => fmt(v)}
                  contentStyle={{
                    fontFamily: "DM Sans",
                    borderRadius: 8,
                    border: "none",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {expBreak.map((e) => (
                <div
                  key={e.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid #F5F0EA",
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
                        background: e.color,
                      }}
                    />
                    <span style={{ fontSize: 10, color: "#4A3728" }}>
                      {e.name}
                    </span>
                  </div>
                  <span
                    style={{ fontSize: 10, fontWeight: 600, color: e.color }}
                  >
                    {fmt(e.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 14,
              marginBottom: 9,
            }}
          >
            Por cliente
          </h3>
          {clients.map((c) => {
            const paid = cliPaidARS(c, rate);
            const debt = cliDebtARS(c, rate);
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 9px",
                  borderRadius: 8,
                  background: "#FDFAF7",
                  border: "1.5px solid #F0EBE3",
                  marginBottom: 5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div
                    style={{
                      width: 25,
                      height: 25,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,${c.color},${c.color}88)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{ color: "#fff", fontWeight: 700, fontSize: 10 }}
                    >
                      {c.name[0]}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600 }}>{c.name}</p>
                    <p style={{ fontSize: 9, color: "#8B7355" }}>
                      {(c.orders || []).length} pedidos
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: sc }}>
                    {fmt(paid)}
                  </p>
                  {debt > 0 && (
                    <p style={{ fontSize: 9, color: p }}>-{fmt(debt)}</p>
                  )}
                  {debt === 0 && <p style={{ fontSize: 9, color: sc }}>✓</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla anual */}
      <div className="card">
        <h3
          style={{
            fontFamily: "'Outfit',sans-serif",
            fontSize: 14,
            marginBottom: 10,
          }}
        >
          Tabla Anual
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 340 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #F0EBE3",
                  background: "#FDFAF7",
                }}
              >
                {[
                  "Mes",
                  "🇦🇷 ARS",
                  "💵 USD→ARS",
                  "Gastos",
                  "Ganancia",
                  "Margen",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "7px 9px",
                      textAlign: h === "Mes" ? "left" : "right",
                      fontSize: 9,
                      fontWeight: 600,
                      color: "#8B7355",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthly
                .filter(
                  (m) => m.ingresosARS > 0 || m.ingresosUSD > 0 || m.gastos > 0
                )
                .map((m, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F5F0EA" }}>
                    <td
                      style={{
                        padding: "7px 9px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {m.month}
                    </td>
                    <td
                      style={{
                        padding: "7px 9px",
                        fontSize: 11,
                        color: sc,
                        textAlign: "right",
                      }}
                    >
                      {m.ingresosARS > 0 ? fmt(m.ingresosARS) : "-"}
                    </td>
                    <td
                      style={{
                        padding: "7px 9px",
                        fontSize: 11,
                        color: "#1A73E8",
                        textAlign: "right",
                      }}
                    >
                      {m.ingresosUSD > 0 ? fmt(m.ingresosUSD) : "-"}
                    </td>
                    <td
                      style={{
                        padding: "7px 9px",
                        fontSize: 11,
                        color: p,
                        textAlign: "right",
                      }}
                    >
                      {fmt(m.gastos)}
                    </td>
                    <td
                      style={{
                        padding: "7px 9px",
                        fontSize: 11,
                        color: m.ganancia >= 0 ? sc : "#C04E4E",
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      {fmt(m.ganancia)}
                    </td>
                    <td
                      style={{
                        padding: "7px 9px",
                        fontSize: 11,
                        textAlign: "right",
                        color: "#8B7355",
                      }}
                    >
                      {m.ingresosTotalARS > 0
                        ? ((m.ganancia / m.ingresosTotalARS) * 100).toFixed(1)
                        : "-"}
                      %
                    </td>
                  </tr>
                ))}
              <tr
                style={{
                  borderTop: "2px solid #E8DDD0",
                  background: "#FDFAF7",
                  fontWeight: 700,
                }}
              >
                <td style={{ padding: "7px 9px", fontSize: 11 }}>TOTAL</td>
                <td
                  style={{
                    padding: "7px 9px",
                    fontSize: 11,
                    color: sc,
                    textAlign: "right",
                  }}
                >
                  {fmt(incomeARS)}
                  {incomeARSVentas > 0 && (
                    <span
                      style={{
                        fontSize: 8,
                        color: "#8B7355",
                        display: "block",
                        fontWeight: 400,
                      }}
                    >
                      🛒 {fmt(incomeARSVentas)} ventas
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "7px 9px",
                    fontSize: 11,
                    color: "#1A73E8",
                    textAlign: "right",
                  }}
                >
                  {fmt(incomeUSDinARS)}
                  {incomeUSD > 0 && (
                    <span
                      style={{
                        fontSize: 8,
                        color: "#8B7355",
                        display: "block",
                        fontWeight: 400,
                      }}
                    >
                      {fmtUSD(incomeUSD)}
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "7px 9px",
                    fontSize: 11,
                    color: p,
                    textAlign: "right",
                  }}
                >
                  {fmt(totalExpenses)}
                </td>
                <td
                  style={{
                    padding: "7px 9px",
                    fontSize: 11,
                    color: profit >= 0 ? sc : "#C04E4E",
                    textAlign: "right",
                  }}
                >
                  {fmt(profit)}
                </td>
                <td
                  style={{
                    padding: "7px 9px",
                    fontSize: 11,
                    textAlign: "right",
                    color: "#8B7355",
                  }}
                >
                  {totalIncome > 0
                    ? ((profit / totalIncome) * 100).toFixed(1)
                    : "-"}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
