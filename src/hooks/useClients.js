import { useState } from "react";
import { uid, todayStr } from "../utils/format.js";
import {
  EMPTY_CLIENT,
  EMPTY_ORDER,
  EMPTY_CUSTOM_ITEM,
} from "../utils/constants.js";

/**
 * Hook de clientes y pedidos.
 * Toda la mutación de clientes/pedidos/pagos/ítems vive aquí.
 * Los componentes solo llaman a estas funciones; nunca tocan setClients directamente.
 */
export function useClients(initialClients = [], setProducts, doToast) {
  const [clients, setClients] = useState(initialClients);

  // Permite sincronizar desde fuera (ej: carga de Supabase)
  const hydrateClients = (data) => setClients(data);

  // ── Clientes ────────────────────────────────────────
  const saveClient = (form, onDone) => {
    if (!form.name.trim()) return;
    setClients((prev) => [
      ...prev,
      {
        id: uid(),
        name: form.name.trim(),
        phone: form.phone,
        email: form.email,
        color: form.color,
        orders: [],
      },
    ]);
    doToast("Cliente guardado");
    onDone?.();
  };

  const updateClient = (id, form, onDone) => {
    if (!form.name.trim()) return;
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...form } : c))
    );
    doToast("Cliente actualizado");
    onDone?.();
  };

  const deleteClient = (id, onDone) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    doToast("Cliente eliminado");
    onDone?.();
  };

  const saveClientNote = (clientId, note, onDone) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, internalNote: note } : c))
    );
    doToast("Nota guardada");
    onDone?.();
  };

  // ── Pedidos ─────────────────────────────────────────
  const saveOrder = (clientId, form, onDone) => {
    if (!form.productName.trim() || !form.total) return;
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: [
                ...(c.orders || []),
                {
                  id: uid(),
                  productName: form.productName.trim(),
                  total: parseFloat(form.total),
                  currency: form.currency || "ARS",
                  notes: form.notes,
                  status: form.status || "medidas",
                  dueDate: form.dueDate,
                  costEstimate: parseFloat(form.costEstimate) || 0,
                  installments: parseInt(form.installments) || 0,
                  payments: [],
                  usedProducts: [],
                  customItems: [],
                },
              ],
            }
          : c
      )
    );
    doToast("Pedido agregado");
    onDone?.();
  };

  const updateOrder = (clientId, orderId, form, onDone) => {
    if (!form.productName.trim() || !form.total) return;
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: (c.orders || []).map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      ...form,
                      total: parseFloat(form.total),
                      currency: form.currency || "ARS",
                      costEstimate: parseFloat(form.costEstimate) || 0,
                      installments: parseInt(form.installments) || 0,
                    }
                  : o
              ),
            }
          : c
      )
    );
    doToast("Pedido actualizado");
    onDone?.();
  };

  const updateOrderStatus = (clientId, orderId, status, ORDER_STAGES) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: (c.orders || []).map((o) =>
                o.id === orderId ? { ...o, status } : o
              ),
            }
          : c
      )
    );
    const label = ORDER_STAGES.find((s) => s.key === status)?.label;
    doToast(`Estado: ${label}`);
  };

  const deleteOrder = (clientId, orderId, onDone) => {
    // Restaurar stock de productos usados
    const cli = clients.find((c) => c.id === clientId);
    const ord = (cli?.orders || []).find((o) => o.id === orderId);
    if (ord && setProducts) {
      (ord.usedProducts || []).forEach((up) => {
        setProducts((prev) =>
          prev.map((x) =>
            x.id === up.productId
              ? {
                  ...x,
                  stock: x.stock + up.qty,
                  history: [
                    ...(x.history || []),
                    {
                      date: todayStr(),
                      type: "return",
                      qty: up.qty,
                      note: "Devuelto: pedido eliminado",
                    },
                  ],
                }
              : x
          )
        );
      });
    }
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, orders: (c.orders || []).filter((o) => o.id !== orderId) }
          : c
      )
    );
    doToast("Pedido eliminado (stock restaurado)");
    onDone?.();
  };

  // ── Pagos ───────────────────────────────────────────
  const savePayment = (clientId, orderId, form, onDone) => {
    if (!form.date || !form.amount) return;
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: (c.orders || []).map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      payments: [
                        ...(o.payments || []),
                        {
                          id: uid(),
                          date: form.date,
                          amount: parseFloat(form.amount),
                          method: form.method,
                          note: form.note,
                        },
                      ],
                    }
                  : o
              ),
            }
          : c
      )
    );
    doToast("Pago registrado");
    onDone?.();
  };

  const updatePayment = (clientId, orderId, paymentId, form, onDone) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: (c.orders || []).map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      payments: (o.payments || []).map((x) =>
                        x.id === paymentId
                          ? { ...x, ...form, amount: parseFloat(form.amount) }
                          : x
                      ),
                    }
                  : o
              ),
            }
          : c
      )
    );
    doToast("Pago actualizado");
    onDone?.();
  };

  const deletePayment = (clientId, orderId, paymentId) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: (c.orders || []).map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      payments: (o.payments || []).filter(
                        (x) => x.id !== paymentId
                      ),
                    }
                  : o
              ),
            }
          : c
      )
    );
    doToast("Pago eliminado");
  };

  // ── Ítems personalizados en pedido ───────────────────
  const saveCustomItem = (clientId, orderId, form, onDone) => {
    if (!form.name.trim() || !form.price) return;
    const cost = parseFloat(form.price);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: (c.orders || []).map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      total: o.total + cost,
                      customItems: [
                        ...(o.customItems || []),
                        {
                          id: uid(),
                          name: form.name.trim(),
                          notes: form.notes,
                          price: cost,
                        },
                      ],
                    }
                  : o
              ),
            }
          : c
      )
    );
    doToast(`"${form.name}" agregado a la factura`);
    onDone?.();
  };

  const deleteCustomItem = (clientId, orderId, item, onDone) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: (c.orders || []).map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      total: Math.max(0, o.total - item.price),
                      customItems: (o.customItems || []).filter(
                        (x) => x.id !== item.id
                      ),
                    }
                  : o
              ),
            }
          : c
      )
    );
    doToast("Ítem eliminado de la factura");
    onDone?.();
  };

  // ── Productos en pedido ──────────────────────────────
  const addProductToOrder = ({
    clientId,
    orderId,
    product,
    qty,
    setProducts: _sp,
  }) => {
    const sp = _sp || setProducts;
    // Descontar del stock
    if (sp) {
      sp((prev) =>
        prev.map((x) =>
          x.id === product.id
            ? {
                ...x,
                stock: x.stock - qty,
                history: [
                  ...(x.history || []),
                  {
                    date: todayStr(),
                    type: "use",
                    qty,
                    note: "Usado en pedido",
                  },
                ],
              }
            : x
        )
      );
    }
    const cost = qty * product.price;
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: (c.orders || []).map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      total: o.total + cost,
                      usedProducts: [
                        ...(o.usedProducts || []),
                        {
                          id: uid(),
                          productId: product.id,
                          productName: product.name,
                          qty,
                          unit: product.unit,
                          price: product.price,
                        },
                      ],
                    }
                  : o
              ),
            }
          : c
      )
    );
    doToast(`${product.name} agregado · Stock actualizado`);
  };

  const removeProductFromOrder = ({
    clientId,
    orderId,
    usedProduct,
    setProducts: _sp,
  }) => {
    const sp = _sp || setProducts;
    if (sp) {
      sp((prev) =>
        prev.map((x) =>
          x.id === usedProduct.productId
            ? {
                ...x,
                stock: x.stock + usedProduct.qty,
                history: [
                  ...(x.history || []),
                  {
                    date: todayStr(),
                    type: "return",
                    qty: usedProduct.qty,
                    note: "Devuelto al quitar del pedido",
                  },
                ],
              }
            : x
        )
      );
    }
    const cost = usedProduct.qty * usedProduct.price;
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              orders: (c.orders || []).map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      total: Math.max(0, o.total - cost),
                      usedProducts: (o.usedProducts || []).filter(
                        (x) => x.id !== usedProduct.id
                      ),
                    }
                  : o
              ),
            }
          : c
      )
    );
    doToast("Producto quitado · Stock restaurado");
  };

  return {
    clients,
    setClients,
    hydrateClients,
    saveClient,
    updateClient,
    deleteClient,
    saveClientNote,
    saveOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    savePayment,
    updatePayment,
    deletePayment,
    saveCustomItem,
    deleteCustomItem,
    addProductToOrder,
    removeProductFromOrder,
  };
}
