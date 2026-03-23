// ─── Meses ───────────────────────────────────────────
export const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// ─── Métodos de pago ──────────────────────────────────
export const PAY_COLORS = {
  efectivo: "#6B9E8B",
  transferencia: "#8B6F9E",
  tarjeta: "#C8956C",
};
export const PAY_LABELS = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

// ─── Colores clientes ─────────────────────────────────
export const CLI_COLORS = [
  "#C8956C",
  "#8B6F9E",
  "#6B9E8B",
  "#D4B483",
  "#B07BAC",
  "#7AA8C4",
  "#C47A8A",
];

// ─── Opciones de íconos / colores para categorías ────
export const ICON_OPTS = [
  "📦",
  "⭐",
  "💡",
  "🔧",
  "🚗",
  "📱",
  "🏠",
  "💄",
  "🎨",
  "📷",
  "🛒",
  "💰",
  "📋",
  "🌿",
  "✈️",
  "🎭",
  "💻",
  "🧵",
  "🪡",
  "✂️",
];
export const COL_OPTS = [
  "#C8956C",
  "#8B6F9E",
  "#6B9E8B",
  "#E8A87C",
  "#D4B483",
  "#B07BAC",
  "#7AA8C4",
  "#C47A8A",
  "#4A6B8A",
  "#8B7340",
];
export const STOCK_UNITS = [
  "unidades",
  "horas",
  "kg",
  "metros",
  "litros",
  "rollos",
  "pares",
  "sets",
  "cajas",
  "servicios",
];

// ─── Estados del servicio ─────────────────────────────
// "entregado" es el estado final — saca el servicio de las alertas de entrega
export const ORDER_STAGES = [
  { key: "presupuestado", label: "Presupuestado", color: "#7AA8C4" },
  { key: "en_proceso", label: "En proceso", color: "#C8956C" },
  { key: "terminado", label: "Terminado", color: "#8B6F9E" },
  { key: "cobrado", label: "Cobrado", color: "#6B9E8B" },
  { key: "entregado", label: "Entregado", color: "#3D8C70" },
];

// ─── Configuración por defecto ────────────────────────
export const DEFAULT_CFG = {
  businessName: "Mi Negocio",
  businessAddress: "Ciudad, Provincia",
  businessPhone: "+54 11 0000-0000",
  businessEmail: "negocio@mail.com",
  primaryColor: "#C8956C",
  accentColor: "#8B6F9E",
  successColor: "#6B9E8B",
  dolarType: "blue",
  nextInvNum: 1,
};

// ─── Categorías de gasto por defecto ─────────────────
export const DEFAULT_CATS = [
  {
    id: "materiales",
    name: "Materiales",
    icon: "📦",
    color: "#C8956C",
    items: [],
  },
  { id: "insumos", name: "Insumos", icon: "⭐", color: "#8B6F9E", items: [] },
  {
    id: "servicios",
    name: "Servicios",
    icon: "🔧",
    color: "#E8A87C",
    items: [],
  },
  { id: "otros", name: "Otros", icon: "📋", color: "#6B9E8B", items: [] },
];

// ─── Formularios vacíos ───────────────────────────────
export const EMPTY_CLIENT = {
  name: "",
  phone: "",
  email: "",
  color: CLI_COLORS[0],
  internalNote: "",
};
export const EMPTY_ORDER = {
  productName: "",
  total: "",
  notes: "",
  currency: "ARS",
  status: "presupuestado",
  dueDate: "",
  installments: "",
  costEstimate: "",
};
export const EMPTY_PAYMENT = {
  date: new Date().toISOString().split("T")[0],
  amount: "",
  method: "efectivo",
  note: "",
};
export const EMPTY_EXPENSE = {
  date: new Date().toISOString().split("T")[0],
  desc: "",
  amount: "",
};
export const EMPTY_CAT = { name: "", icon: "📦", color: "#8B6F9E" };
export const EMPTY_PRODUCT = {
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  unit: "unidades",
  minStock: "",
};
export const EMPTY_CUSTOM_ITEM = { name: "", notes: "", price: "" };
export const EMPTY_SALE = {
  date: new Date().toISOString().split("T")[0],
  productId: "",
  qty: "1",
  price: "",
  method: "efectivo",
  note: "",
};

// ─── Temas de color predefinidos ─────────────────────
export const THEMES = [
  { name: "Ámbar cálido", p: "#C8956C", a: "#8B6F9E" },
  { name: "Lavanda", p: "#8B6F9E", a: "#C8956C" },
  { name: "Salvia", p: "#6B9E8B", a: "#C8956C" },
  { name: "Chocolate", p: "#8B5E3C", a: "#D4A96A" },
  { name: "Índigo", p: "#4A6B8A", a: "#C8956C" },
  { name: "Rosa antiguo", p: "#C47A8A", a: "#8B6F9E" },
];
