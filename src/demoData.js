/**
 * Datos de ejemplo para mostrar el sistema en acción.
 * Se cargan solo cuando el usuario lo solicita explícitamente.
 * Se pueden limpiar con el botón "Limpiar datos de ejemplo".
 */

const hoy = new Date();
const fecha = (diasAtras) => {
  const d = new Date(hoy);
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().split("T")[0];
};
const fechaFutura = (diasAdelante) => {
  const d = new Date(hoy);
  d.setDate(d.getDate() + diasAdelante);
  return d.toISOString().split("T")[0];
};

export const DEMO_CLIENTS = [
  {
    id: "demo-cli-1",
    name: "Valentina Gómez",
    phone: "+54 11 4523-8891",
    email: "vale.gomez@gmail.com",
    color: "#C8956C",
    internalNote:
      "Prefiere comunicación por WhatsApp. Cliente frecuente desde hace 2 años.",
    orders: [
      {
        id: "demo-ord-1",
        productName: "Vestido de novia con bordados",
        total: 180000,
        currency: "ARS",
        status: "terminado",
        dueDate: fechaFutura(3),
        costEstimate: 95000,
        installments: 3,
        notes: "Bordados florales en mangas y escote. Tela importada.",
        payments: [
          {
            id: "demo-pay-1",
            date: fecha(30),
            amount: 60000,
            method: "transferencia",
            note: "Seña inicial",
          },
          {
            id: "demo-pay-2",
            date: fecha(15),
            amount: 60000,
            method: "transferencia",
            note: "2da cuota",
          },
        ],
        usedProducts: [
          {
            id: "demo-up-1",
            productId: "demo-prod-1",
            productName: "Tela seda importada",
            qty: 4,
            unit: "metros",
            price: 12000,
          },
          {
            id: "demo-up-2",
            productId: "demo-prod-2",
            productName: "Hilo de bordado",
            qty: 3,
            unit: "sets",
            price: 3500,
          },
        ],
        customItems: [],
      },
      {
        id: "demo-ord-2",
        productName: "Arreglo de vestido de fiesta",
        total: 25000,
        currency: "ARS",
        status: "cobrado",
        dueDate: fecha(5),
        costEstimate: 8000,
        installments: 0,
        notes: "Ajuste de talle y cambio de cierre.",
        payments: [
          {
            id: "demo-pay-3",
            date: fecha(8),
            amount: 25000,
            method: "efectivo",
            note: "Pago completo",
          },
        ],
        usedProducts: [],
        customItems: [],
      },
    ],
  },
  {
    id: "demo-cli-2",
    name: "Martín Rodríguez",
    phone: "+54 11 6734-2210",
    email: "martin.r@empresa.com",
    color: "#8B6F9E",
    internalNote:
      "Empresa de eventos. Paga siempre por transferencia. Requiere factura.",
    orders: [
      {
        id: "demo-ord-3",
        productName: "Uniformes para personal (x10)",
        total: 2200,
        currency: "USD",
        status: "en_proceso",
        dueDate: fechaFutura(12),
        costEstimate: 1400,
        installments: 2,
        notes: "10 uniformes con logo bordado. Colores: navy y blanco.",
        payments: [
          {
            id: "demo-pay-4",
            date: fecha(10),
            amount: 1100,
            method: "transferencia",
            note: "50% adelanto",
          },
        ],
        usedProducts: [
          {
            id: "demo-up-3",
            productId: "demo-prod-3",
            productName: "Tela gabardina",
            qty: 15,
            unit: "metros",
            price: 45,
          },
        ],
        customItems: [
          {
            id: "demo-ci-1",
            name: "Bordado de logo",
            notes: "10 prendas x logo",
            price: 300,
          },
        ],
      },
    ],
  },
  {
    id: "demo-cli-3",
    name: "Sofía Herrera",
    phone: "+54 9 351 4478-992",
    email: "sofi.herrera@hotmail.com",
    color: "#6B9E8B",
    internalNote:
      "Muy puntual con los pagos. Le gusta recibir fotos del avance.",
    orders: [
      {
        id: "demo-ord-4",
        productName: "Conjunto de bautismo",
        total: 65000,
        currency: "ARS",
        status: "presupuestado",
        dueDate: fechaFutura(21),
        costEstimate: 30000,
        installments: 0,
        notes: "Vestido + ajuar completo. Color blanco con detalles dorados.",
        payments: [],
        usedProducts: [],
        customItems: [],
      },
    ],
  },
  {
    id: "demo-cli-4",
    name: "Luciana Pinto",
    phone: "+54 11 5589-3341",
    email: "lu.pinto@gmail.com",
    color: "#C47A8A",
    internalNote: "",
    orders: [
      {
        id: "demo-ord-5",
        productName: "Tapizado de sillas (x6)",
        total: 48000,
        currency: "ARS",
        status: "cobrado",
        dueDate: fecha(2),
        costEstimate: 22000,
        installments: 0,
        notes: "Tela terciopelo color bordo. 6 sillas comedor.",
        payments: [
          {
            id: "demo-pay-5",
            date: fecha(20),
            amount: 24000,
            method: "efectivo",
            note: "50% adelanto",
          },
          {
            id: "demo-pay-6",
            date: fecha(3),
            amount: 24000,
            method: "transferencia",
            note: "Saldo al retirar",
          },
        ],
        usedProducts: [
          {
            id: "demo-up-4",
            productId: "demo-prod-4",
            productName: "Terciopelo bordo",
            qty: 6,
            unit: "metros",
            price: 3800,
          },
        ],
        customItems: [],
      },
    ],
  },
];

export const DEMO_CATS = [
  {
    id: "demo-cat-1",
    name: "Materiales",
    icon: "📦",
    color: "#C8956C",
    items: [
      {
        id: "demo-exp-1",
        date: fecha(45),
        desc: "Compra telas para temporada",
        amount: 85000,
      },
      {
        id: "demo-exp-2",
        date: fecha(28),
        desc: "Hilos y avíos varios",
        amount: 18500,
      },
      {
        id: "demo-exp-3",
        date: fecha(12),
        desc: "Tela importada pedido especial",
        amount: 42000,
      },
    ],
  },
  {
    id: "demo-cat-2",
    name: "Insumos",
    icon: "⭐",
    color: "#8B6F9E",
    items: [
      {
        id: "demo-exp-4",
        date: fecha(35),
        desc: "Agujas y accesorios máquina",
        amount: 4200,
      },
      {
        id: "demo-exp-5",
        date: fecha(18),
        desc: "Aceite y mantenimiento",
        amount: 2800,
      },
    ],
  },
  {
    id: "demo-cat-3",
    name: "Servicios",
    icon: "🔧",
    color: "#E8A87C",
    items: [
      {
        id: "demo-exp-6",
        date: fecha(40),
        desc: "Servicio técnico máquina overlock",
        amount: 15000,
      },
      {
        id: "demo-exp-7",
        date: fecha(22),
        desc: "Alquiler local mes anterior",
        amount: 55000,
      },
      {
        id: "demo-exp-8",
        date: fecha(7),
        desc: "Alquiler local mes actual",
        amount: 55000,
      },
    ],
  },
  {
    id: "demo-cat-4",
    name: "Otros",
    icon: "📋",
    color: "#6B9E8B",
    items: [
      {
        id: "demo-exp-9",
        date: fecha(50),
        desc: "Publicidad Instagram",
        amount: 8000,
      },
      {
        id: "demo-exp-10",
        date: fecha(15),
        desc: "Packaging y bolsas",
        amount: 5500,
      },
    ],
  },
];

export const DEMO_PRODUCTS = [
  {
    id: "demo-prod-1",
    name: "Tela seda importada",
    description: "Seda natural, varios colores",
    category: "Telas",
    price: 12000,
    stock: 8,
    unit: "metros",
    minStock: 3,
    history: [
      { date: fecha(60), type: "init", qty: 15, note: "Stock inicial" },
      { date: fecha(20), type: "use", qty: 7, note: "Usado en pedido" },
    ],
  },
  {
    id: "demo-prod-2",
    name: "Hilo de bordado",
    description: "Set 12 colores premium",
    category: "Insumos",
    price: 3500,
    stock: 9,
    unit: "sets",
    minStock: 3,
    history: [
      { date: fecha(60), type: "init", qty: 12, note: "Stock inicial" },
      { date: fecha(15), type: "use", qty: 3, note: "Usado en pedido" },
    ],
  },
  {
    id: "demo-prod-3",
    name: "Tela gabardina",
    description: "Gabardina doble faz",
    category: "Telas",
    price: 45,
    stock: 22,
    unit: "metros",
    minStock: 10,
    history: [
      { date: fecha(60), type: "init", qty: 30, note: "Stock inicial" },
      { date: fecha(10), type: "use", qty: 8, note: "Usado en pedido" },
    ],
  },
  {
    id: "demo-prod-4",
    name: "Terciopelo bordo",
    description: "Terciopelo pesado decoración",
    category: "Telas",
    price: 3800,
    stock: 2,
    unit: "metros",
    minStock: 4,
    history: [
      { date: fecha(60), type: "init", qty: 10, note: "Stock inicial" },
      { date: fecha(5), type: "use", qty: 8, note: "Usado en pedido" },
    ],
  },
  {
    id: "demo-prod-5",
    name: "Cierre invisible 60cm",
    description: "Cierres de calidad importados",
    category: "Insumos",
    price: 850,
    stock: 18,
    unit: "unidades",
    minStock: 10,
    history: [
      { date: fecha(60), type: "init", qty: 20, note: "Stock inicial" },
    ],
  },
];

export const DEMO_SALES = [
  {
    id: "demo-sale-1",
    date: fecha(25),
    productId: "demo-prod-5",
    productName: "Cierre invisible 60cm",
    unit: "unidades",
    qty: 2,
    price: 1200,
    total: 2400,
    method: "efectivo",
    note: "Venta mostrador",
  },
  {
    id: "demo-sale-2",
    date: fecha(18),
    productId: "demo-prod-2",
    productName: "Hilo de bordado",
    unit: "sets",
    qty: 1,
    price: 4200,
    total: 4200,
    method: "transferencia",
    note: "",
  },
  {
    id: "demo-sale-3",
    date: fecha(8),
    productId: "demo-prod-5",
    productName: "Cierre invisible 60cm",
    unit: "unidades",
    qty: 3,
    price: 1200,
    total: 3600,
    method: "efectivo",
    note: "Cliente frecuente",
  },
];

export const DEMO_CFG = {
  businessName: "Mi Negocio",
  businessAddress: "Ciudad, Provincia",
  businessPhone: "+54 11 0000-0000",
  businessEmail: "negocio@mail.com",
  primaryColor: "#C8956C",
  accentColor: "#8B6F9E",
  successColor: "#6B9E8B",
  dolarType: "blue",
  nextInvNum: 7,
};

// ── Helper: detectar si hay datos demo cargados ───────
export const isDemoLoaded = (clients) =>
  (clients || []).some((c) => c.id?.startsWith("demo-"));
