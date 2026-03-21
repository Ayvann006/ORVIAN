import { useState } from "react";
import { Modal, ModalButtons, Field } from "./Modals.jsx";
import { fmt, fmtDate } from "../utils/format.js";
import { PAY_LABELS, PAY_COLORS, EMPTY_SALE } from "../utils/constants.js";

/**
 * Tab "Ventas" — ventas directas de productos sin cliente asociado.
 * Descuenta stock automáticamente al registrar.
 */
export default function Sales({
  sales,
  products,
  cfg,
  onSaveSale,
  onDeleteSale,
}) {
  const p = cfg.primaryColor;
  const sc = cfg.successColor;

  const [addSale, setAddSale] = useState(false);
  const [form, setForm] = useState(EMPTY_SALE);
  const [delSale, setDelSale] = useState(null);

  const selectedProduct = products.find((x) => x.id === form.productId);

  // Totales
  const totalVentas = sales.reduce((s, x) => s + x.total, 0);
  const totalUnidades = sales.reduce((s, x) => s + x.qty, 0);

  // Agrupar por método de pago
  const porMetodo = ["efectivo", "transferencia", "tarjeta"]
    .map((m) => ({
      key: m,
      label: PAY_LABELS[m],
      color: PAY_COLORS[m],
      total: sales
        .filter((s) => s.method === m)
        .reduce((acc, s) => acc + s.total, 0),
    }))
    .filter((m) => m.total > 0);

  return (
    <div className="fi">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 9,
        }}
      >
        <div>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18 }}>
            Ventas Directas
          </h3>
          <p style={{ color: "#8B7355", fontSize: 12, marginTop: 2 }}>
            {sales.length} venta{sales.length !== 1 ? "s" : ""} · Total:{" "}
            <strong style={{ color: sc }}>{fmt(totalVentas)}</strong>
          </p>
        </div>
        <button
          className="btn-p"
          onClick={() => {
            setForm({
              ...EMPTY_SALE,
              date: new Date().toISOString().split("T")[0],
            });
            setAddSale(true);
          }}
        >
          + Nueva venta
        </button>
      </div>

      {/* KPIs */}
      {sales.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
            marginBottom: 14,
          }}
          className="grid4"
        >
          <div
            className="card"
            style={{ borderLeft: `4px solid ${sc}`, padding: 12 }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#8B7355",
                textTransform: "uppercase",
                letterSpacing: ".7px",
                marginBottom: 6,
              }}
            >
              Total cobrado
            </p>
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: sc,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {fmt(totalVentas)}
            </p>
          </div>
          <div
            className="card"
            style={{ borderLeft: `4px solid ${p}`, padding: 12 }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#8B7355",
                textTransform: "uppercase",
                letterSpacing: ".7px",
                marginBottom: 6,
              }}
            >
              Unidades vendidas
            </p>
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: p,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {totalUnidades}
            </p>
          </div>
          <div
            className="card"
            style={{ borderLeft: `4px solid #7AA8C4`, padding: 12 }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#8B7355",
                textTransform: "uppercase",
                letterSpacing: ".7px",
                marginBottom: 6,
              }}
            >
              Por método
            </p>
            {porMetodo.map((m) => (
              <div
                key={m.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span style={{ fontSize: 10, color: m.color, fontWeight: 600 }}>
                  {m.label}
                </span>
                <span
                  style={{ fontSize: 11, fontWeight: 700, color: "#2C1810" }}
                >
                  {fmt(m.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de ventas */}
      {sales.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>🛒</p>
          <p style={{ color: "#8B7355", fontSize: 13 }}>
            Sin ventas registradas todavía.
          </p>
          <p style={{ color: "#B0A090", fontSize: 12, marginTop: 4 }}>
            Usá "+ Nueva venta" para registrar una.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...sales]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((sale) => (
              <div
                key={sale.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "12px 16px",
                  boxShadow: "0 1px 8px rgba(44,24,16,.05)",
                  border: "1.5px solid #F0EBE3",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${p}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    🛒
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#2C1810",
                      }}
                    >
                      {sale.productName}
                    </p>
                    <p style={{ fontSize: 11, color: "#8B7355" }}>
                      {sale.qty} {sale.unit} · {fmtDate(sale.date)}
                      {sale.note && <span> · {sale.note}</span>}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: `${PAY_COLORS[sale.method]}22`,
                      color: PAY_COLORS[sale.method],
                      textTransform: "uppercase",
                    }}
                  >
                    {PAY_LABELS[sale.method]}
                  </span>
                  <p
                    style={{
                      fontFamily: "'Outfit',sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: sc,
                    }}
                  >
                    {fmt(sale.total)}
                  </p>
                  <button
                    className="iBtn"
                    title="Eliminar venta"
                    onClick={() => setDelSale(sale)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal nueva venta */}
      {addSale && (
        <Modal title="Nueva venta directa" onClose={() => setAddSale(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="Fecha">
              <input
                className="inp"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </Field>
            <Field label="Producto *">
              <select
                className="inp"
                value={form.productId}
                onChange={(e) => {
                  const prod = products.find((x) => x.id === e.target.value);
                  setForm((f) => ({
                    ...f,
                    productId: e.target.value,
                    price: prod ? String(prod.price) : "",
                  }));
                }}
              >
                <option value="">Seleccioná un producto...</option>
                {products
                  .filter((x) => x.stock > 0)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} (stock: {x.stock} {x.unit})
                    </option>
                  ))}
              </select>
            </Field>
            {selectedProduct && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 9,
                }}
              >
                <Field label={`Cantidad (${selectedProduct.unit}) *`}>
                  <input
                    className="inp"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={selectedProduct.stock}
                    value={form.qty}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, qty: e.target.value }))
                    }
                    style={{
                      borderColor:
                        parseFloat(form.qty) > selectedProduct.stock
                          ? "#E07070"
                          : "",
                    }}
                  />
                  {parseFloat(form.qty) > selectedProduct.stock && (
                    <p style={{ fontSize: 10, color: "#C04E4E", marginTop: 3 }}>
                      Máximo: {selectedProduct.stock} {selectedProduct.unit}
                    </p>
                  )}
                </Field>
                <Field label="Precio unitario *">
                  <input
                    className="inp"
                    type="number"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                  />
                </Field>
              </div>
            )}
            {selectedProduct && form.qty && form.price && (
              <div
                style={{
                  background: `${sc}18`,
                  borderRadius: 9,
                  padding: "10px 14px",
                  border: `1.5px solid ${sc}44`,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 12, color: "#4A3728" }}>
                    Total de la venta
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: sc,
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    {fmt(
                      (parseFloat(form.qty) || 0) *
                        (parseFloat(form.price) || 0)
                    )}
                  </span>
                </div>
                <p style={{ fontSize: 10, color: "#8B7355", marginTop: 4 }}>
                  Stock después:{" "}
                  <strong>
                    {Math.max(
                      0,
                      selectedProduct.stock - (parseFloat(form.qty) || 0)
                    )}{" "}
                    {selectedProduct.unit}
                  </strong>
                </p>
              </div>
            )}
            <Field label="Método de pago">
              <select
                className="inp"
                value={form.method}
                onChange={(e) =>
                  setForm((f) => ({ ...f, method: e.target.value }))
                }
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </Field>
            <Field label="Nota">
              <input
                className="inp"
                placeholder="Opcional"
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
              />
            </Field>
          </div>
          <ModalButtons
            onCancel={() => setAddSale(false)}
            onSave={() => {
              if (parseFloat(form.qty) > (selectedProduct?.stock || 0)) return;
              onSaveSale(form, () => {
                setAddSale(false);
                setForm(EMPTY_SALE);
              });
            }}
            label="Registrar venta"
          />
        </Modal>
      )}

      {/* Confirmar eliminar */}
      {delSale && (
        <Modal
          title="¿Eliminar venta?"
          sub={delSale.productName}
          onClose={() => setDelSale(null)}
        >
          <p style={{ fontSize: 13, color: "#4A3728", marginBottom: 6 }}>
            Se eliminará la venta de{" "}
            <strong>
              {delSale.qty} {delSale.unit}
            </strong>{" "}
            del {fmtDate(delSale.date)} y se restaurará el stock.
          </p>
          <p style={{ fontSize: 12, color: "#8B7355", marginBottom: 14 }}>
            Esta acción no se puede deshacer.
          </p>
          <div style={{ display: "flex", gap: 9 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={() => setDelSale(null)}
            >
              Cancelar
            </button>
            <button
              className="btn-d"
              style={{ flex: 1 }}
              onClick={() => {
                onDeleteSale(delSale.id);
                setDelSale(null);
              }}
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
