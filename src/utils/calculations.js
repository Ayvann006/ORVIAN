import { PAY_LABELS, MONTHS } from "./constants.js";
import { fmt, fmtDate, todayStr } from "./format.js";

// ─── Conversión de moneda ─────────────────────────────
export const toARS = (amount, currency, rate) =>
  currency === "USD" ? (amount || 0) * (rate || 1) : amount || 0;

// ─── Cálculos de pedidos ──────────────────────────────
export const orderPaid = (o) =>
  (o.payments || []).reduce((s, p) => s + p.amount, 0);

export const orderDebt = (o) => Math.max(0, o.total - orderPaid(o));

export const orderPaidARS = (o, rate) => toARS(orderPaid(o), o.currency, rate);
export const orderDebtARS = (o, rate) => toARS(orderDebt(o), o.currency, rate);
export const orderTotalARS = (o, rate) => toARS(o.total, o.currency, rate);

// ─── Cálculos de clientes ─────────────────────────────
export const cliPaid = (c) =>
  (c.orders || []).reduce((s, o) => s + orderPaid(o), 0);
export const cliDebt = (c) =>
  (c.orders || []).reduce((s, o) => s + orderDebt(o), 0);
export const cliTotal = (c) =>
  (c.orders || []).reduce((s, o) => s + o.total, 0);
export const cliPaidARS = (c, rate) =>
  (c.orders || []).reduce((s, o) => s + orderPaidARS(o, rate), 0);
export const cliDebtARS = (c, rate) =>
  (c.orders || []).reduce((s, o) => s + orderDebtARS(o, rate), 0);
export const cliTotalARS = (c, rate) =>
  (c.orders || []).reduce((s, o) => s + orderTotalARS(o, rate), 0);

// ─── Métricas globales ────────────────────────────────
// sales = ventas directas (siempre ARS, se suman a incomeARS y al gráfico mensual)
export const calcMetrics = ({ clients, cats, rate, sales = [] }) => {
  // Pagos de pedidos de clientes
  const allPays = clients.flatMap((c) =>
    (c.orders || []).flatMap((o) =>
      (o.payments || []).map((pay) => ({
        ...pay,
        currency: o.currency || "ARS",
        clientName: c.name,
        orderName: o.productName,
      }))
    )
  );

  // Ingresos de pedidos
  const incomeARSPedidos = allPays
    .filter((x) => x.currency === "ARS")
    .reduce((s, x) => s + x.amount, 0);
  const incomeUSD = allPays
    .filter((x) => x.currency === "USD")
    .reduce((s, x) => s + x.amount, 0);
  const incomeUSDinARS = incomeUSD * rate;

  // Ingresos de ventas directas (siempre ARS)
  const incomeARSVentas = (sales || []).reduce((s, x) => s + x.total, 0);

  // Totales combinados
  const incomeARS = incomeARSPedidos + incomeARSVentas;
  const totalIncome = incomeARS + incomeUSDinARS;

  const totalExpenses = cats.reduce(
    (s, cat) => s + cat.items.reduce((a, e) => a + e.amount, 0),
    0
  );

  const debtARS = clients.reduce(
    (s, c) =>
      s +
      (c.orders || [])
        .filter((o) => (o.currency || "ARS") === "ARS")
        .reduce((a, o) => a + orderDebt(o), 0),
    0
  );
  const debtUSD = clients.reduce(
    (s, c) =>
      s +
      (c.orders || [])
        .filter((o) => o.currency === "USD")
        .reduce((a, o) => a + orderDebt(o), 0),
    0
  );
  const totalDebt = debtARS + debtUSD * rate;

  const profit = totalIncome - totalExpenses;

  // Por método — suma pagos de pedidos Y ventas directas
  const byMethod = (() => {
    const m = {
      efectivo: { ars: 0, usd: 0 },
      transferencia: { ars: 0, usd: 0 },
      tarjeta: { ars: 0, usd: 0 },
    };

    // Pagos de pedidos
    allPays.forEach((x) => {
      if (x.currency === "USD") m[x.method].usd += x.amount;
      else m[x.method].ars += x.amount;
    });

    // Ventas directas (siempre ARS)
    (sales || []).forEach((x) => {
      if (m[x.method]) m[x.method].ars += x.total;
    });

    return Object.entries(m).map(([k, v]) => ({
      name: PAY_LABELS[k],
      ars: v.ars,
      usd: v.usd,
      arsTotal: v.ars + v.usd * rate,
      key: k,
    }));
  })();

  // Evolución mensual — suma ventas directas a ingresosARS del mes correspondiente
  const monthly = (() => {
    const d = MONTHS.map((m) => ({
      month: m,
      ingresosARS: 0,
      ingresosUSD: 0,
      gastos: 0,
    }));

    // Pagos de pedidos
    allPays.forEach((x) => {
      if (!x.date) return;
      const mi = parseInt(x.date.split("-")[1]) - 1;
      if (x.currency === "USD") d[mi].ingresosUSD += x.amount * rate;
      else d[mi].ingresosARS += x.amount;
    });

    // Ventas directas → suman a ingresosARS del mes
    (sales || []).forEach((x) => {
      if (!x.date) return;
      const mi = parseInt(x.date.split("-")[1]) - 1;
      d[mi].ingresosARS += x.total;
    });

    // Gastos
    cats.forEach((cat) =>
      cat.items.forEach((e) => {
        if (e.date) d[parseInt(e.date.split("-")[1]) - 1].gastos += e.amount;
      })
    );

    return d.map((x) => ({
      ...x,
      ingresosTotalARS: x.ingresosARS + x.ingresosUSD,
      ganancia: x.ingresosARS + x.ingresosUSD - x.gastos,
    }));
  })();

  const expBreak = cats
    .map((cat) => ({
      name: cat.name,
      key: cat.id,
      color: cat.color,
      value: cat.items.reduce((s, e) => s + e.amount, 0),
    }))
    .filter((e) => e.value > 0);

  return {
    allPays,
    incomeARS,
    incomeARSPedidos,
    incomeARSVentas,
    incomeUSD,
    incomeUSDinARS,
    totalIncome,
    totalExpenses,
    debtARS,
    debtUSD,
    totalDebt,
    profit,
    byMethod,
    monthly,
    expBreak,
  };
};

// ─── Exportar CSV (incluye ventas directas) ───────────
export const exportCSV = (clients, cats, sales = []) => {
  const rows = [];
  rows.push(["REPORTE — " + new Date().toLocaleDateString("es-AR")]);
  rows.push([]);

  rows.push(["CLIENTES Y PEDIDOS"]);
  rows.push([
    "Cliente",
    "Pedido",
    "Producto",
    "Materiales",
    "Total",
    "Pagado",
    "Saldo",
  ]);
  clients.forEach((c) =>
    (c.orders || []).forEach((o, i) => {
      const paid = orderPaid(o);
      const mats = (o.usedProducts || [])
        .map((x) => `${x.qty}${x.unit} ${x.productName}`)
        .join(", ");
      rows.push([
        i === 0 ? c.name : "",
        i + 1,
        o.productName,
        mats,
        o.total,
        paid,
        Math.max(0, o.total - paid),
      ]);
    })
  );

  rows.push([]);
  rows.push(["PAGOS DE PEDIDOS"]);
  rows.push(["Fecha", "Cliente", "Pedido", "Monto", "Método", "Nota"]);
  clients.forEach((c) =>
    (c.orders || []).forEach((o) =>
      (o.payments || []).forEach((p) =>
        rows.push([
          fmtDate(p.date),
          c.name,
          o.productName,
          p.amount,
          PAY_LABELS[p.method],
          p.note || "",
        ])
      )
    )
  );

  if (sales.length > 0) {
    rows.push([]);
    rows.push(["VENTAS DIRECTAS"]);
    rows.push([
      "Fecha",
      "Producto",
      "Cantidad",
      "Unidad",
      "Precio Unit.",
      "Total",
      "Método",
      "Nota",
    ]);
    sales.forEach((s) =>
      rows.push([
        fmtDate(s.date),
        s.productName,
        s.qty,
        s.unit,
        s.price,
        s.total,
        PAY_LABELS[s.method],
        s.note || "",
      ])
    );
  }

  rows.push([]);
  rows.push(["GASTOS"]);
  rows.push(["Fecha", "Categoría", "Descripción", "Monto"]);
  cats.forEach((cat) =>
    cat.items.forEach((e) =>
      rows.push([fmtDate(e.date), cat.name, e.desc || "", e.amount])
    )
  );

  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atelier-${todayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
