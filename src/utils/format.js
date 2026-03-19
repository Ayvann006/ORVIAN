export const fmt = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n || 0);

export const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

export const todayStr = () => new Date().toISOString().split("T")[0];
export const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
export const invNum = (n) => `FAC-${String(n).padStart(4, "0")}`;
