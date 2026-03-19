import { useState } from "react";
import { uid, todayStr } from "../utils/format.js";
import {
  DEFAULT_CATS,
  EMPTY_CAT,
  EMPTY_EXPENSE,
  EMPTY_PRODUCT,
} from "../utils/constants.js";

/**
 * Hook de inventario, categorías y gastos.
 * Gestiona products (stock) y cats (categorías de gasto con ítems).
 */
export function useOrders(
  initialCats = DEFAULT_CATS,
  initialProducts = [],
  doToast
) {
  const [cats, setCats] = useState(initialCats);
  const [products, setProducts] = useState(initialProducts);

  const hydrateCats = (data) => setCats(data);
  const hydrateProducts = (data) => setProducts(data);

  // ── Categorías de gastos ─────────────────────────────
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

  // ── Gastos ──────────────────────────────────────────
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

  return {
    cats,
    setCats,
    hydrateCats,
    products,
    setProducts,
    hydrateProducts,
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
  };
}
