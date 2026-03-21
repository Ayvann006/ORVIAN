import { useState } from "react";
import { uid, todayStr } from "../utils/format.js";
import { DEFAULT_CATS } from "../utils/constants.js";

/**
 * Hook de inventario, categorías, gastos y ventas directas.
 */
export function useOrders(
  initialCats = DEFAULT_CATS,
  initialProducts = [],
  doToast,
  initialSales = []
) {
  const [cats, setCats] = useState(initialCats);
  const [products, setProducts] = useState(initialProducts);
  const [sales, setSales] = useState(initialSales);

  const hydrateCats = (data) => setCats(data);
  const hydrateProducts = (data) => setProducts(data);
  const hydrateSales = (data) => setSales(data);

  // ── Categorías ───────────────────────────────────────
  const saveCategory = (form, onDone) => {
    if (!form.name.trim()) return;
    setCats((prev) => [
      ...prev,
      {
        id: uid(),
        name: form.name.trim(),
        icon: form.icon,
        color: form.color,
        items: [],
      },
    ]);
    doToast("Categoría creada");
    onDone?.();
  };
  const updateCategory = (id, form, onDone) => {
    if (!form.name.trim()) return;
    setCats((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, name: form.name.trim(), icon: form.icon, color: form.color }
          : c
      )
    );
    doToast("Categoría actualizada");
    onDone?.();
  };
  const deleteCategory = (id) => {
    setCats((prev) => prev.filter((c) => c.id !== id));
    doToast("Categoría eliminada");
  };

  // ── Gastos ───────────────────────────────────────────
  const saveExpense = (catId, form, onDone) => {
    if (!form.date || !form.amount) return;
    setCats((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: [
                ...c.items,
                {
                  id: uid(),
                  date: form.date,
                  desc: form.desc,
                  amount: parseFloat(form.amount),
                },
              ],
            }
          : c
      )
    );
    doToast("Gasto guardado");
    onDone?.();
  };
  const updateExpense = (catId, itemId, form, onDone) => {
    setCats((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: c.items.map((e) =>
                e.id === itemId
                  ? { ...e, ...form, amount: parseFloat(form.amount) }
                  : e
              ),
            }
          : c
      )
    );
    doToast("Gasto actualizado");
    onDone?.();
  };
  const deleteExpense = (catId, itemId) => {
    setCats((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.filter((e) => e.id !== itemId) }
          : c
      )
    );
    doToast("Gasto eliminado");
  };

  // ── Productos / Stock ────────────────────────────────
  const saveProduct = (form, onDone) => {
    if (!form.name.trim()) return;
    setProducts((prev) => [
      ...prev,
      {
        id: uid(),
        name: form.name.trim(),
        description: form.description,
        category: form.category,
        price: parseFloat(form.price) || 0,
        stock: parseFloat(form.stock) || 0,
        unit: form.unit,
        minStock: parseFloat(form.minStock) || 0,
        history: [
          {
            date: todayStr(),
            type: "init",
            qty: parseFloat(form.stock) || 0,
            note: "Stock inicial",
          },
        ],
      },
    ]);
    doToast("Producto guardado");
    onDone?.();
  };
  const updateProduct = (id, form, onDone) => {
    setProducts((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              ...form,
              price: parseFloat(form.price) || 0,
              stock: parseFloat(form.stock) || 0,
              minStock: parseFloat(form.minStock) || 0,
            }
          : x
      )
    );
    doToast("Producto actualizado");
    onDone?.();
  };
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((x) => x.id !== id));
    doToast("Producto eliminado");
  };
  const adjustStock = (product, qty, type, onDone) => {
    const q = parseFloat(qty) || 0;
    if (!q) return;
    setProducts((prev) =>
      prev.map((x) =>
        x.id === product.id
          ? {
              ...x,
              stock: type === "add" ? x.stock + q : Math.max(0, x.stock - q),
              history: [
                ...(x.history || []),
                {
                  date: todayStr(),
                  type,
                  qty: q,
                  note: type === "add" ? `+${q} ${x.unit}` : `-${q} ${x.unit}`,
                },
              ],
            }
          : x
      )
    );
    doToast("Stock actualizado");
    onDone?.();
  };

  // ── Ventas directas ──────────────────────────────────
  const saveSale = (form, onDone) => {
    if (!form.productId || !form.qty || !form.price) return;
    const qty = parseFloat(form.qty);
    const price = parseFloat(form.price);
    const product = products.find((x) => x.id === form.productId);
    if (!product) return;

    // Descontar del stock
    setProducts((prev) =>
      prev.map((x) =>
        x.id === form.productId
          ? {
              ...x,
              stock: Math.max(0, x.stock - qty),
              history: [
                ...(x.history || []),
                {
                  date: form.date,
                  type: "sale",
                  qty,
                  note: `Venta directa · ${qty} ${x.unit}`,
                },
              ],
            }
          : x
      )
    );

    // Registrar la venta
    setSales((prev) => [
      ...prev,
      {
        id: uid(),
        date: form.date,
        productId: form.productId,
        productName: product.name,
        unit: product.unit,
        qty,
        price,
        total: qty * price,
        method: form.method,
        note: form.note,
      },
    ]);

    doToast(`Venta registrada · ${product.name}`);
    onDone?.();
  };

  const deleteSale = (saleId) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    // Restaurar stock
    setProducts((prev) =>
      prev.map((x) =>
        x.id === sale.productId
          ? {
              ...x,
              stock: x.stock + sale.qty,
              history: [
                ...(x.history || []),
                {
                  date: todayStr(),
                  type: "return",
                  qty: sale.qty,
                  note: "Venta eliminada",
                },
              ],
            }
          : x
      )
    );

    setSales((prev) => prev.filter((s) => s.id !== saleId));
    doToast("Venta eliminada · Stock restaurado");
  };

  return {
    cats,
    setCats,
    hydrateCats,
    products,
    setProducts,
    hydrateProducts,
    sales,
    setSales,
    hydrateSales,
    saveCategory,
    updateCategory,
    deleteCategory,
    saveExpense,
    updateExpense,
    deleteExpense,
    saveProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    saveSale,
    deleteSale,
  };
}
