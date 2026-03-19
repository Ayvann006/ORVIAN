import { useState } from "react";
import { Modal, ModalButtons, Field } from "./Modals.jsx";
import { fmt, fmtDate } from "../utils/format.js";
import { STOCK_UNITS, EMPTY_PRODUCT } from "../utils/constants.js";

/**
 * Tab "Productos" — grilla 3 columnas idéntica al original.
 * Botones Entrada/Salida separados. Últimos 3 movimientos inline.
 */
export default function Inventory({
  products,
  cfg,
  onSaveProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock,
}) {
  const p = cfg.primaryColor;
  const sc = cfg.successColor;

  const [addProd, setAddProd] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [adjStock, setAdjStock] = useState(null);
  const [adjType, setAdjType] = useState("add");
  const [adjQty, setAdjQty] = useState("");

  const [fProd, setFProd] = useState(EMPTY_PRODUCT);
  const [fEProd, setFEProd] = useState(EMPTY_PRODUCT);

  return (
    <div className="fi">
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
            Catálogo y Stock
          </h3>
          <p style={{ color: "#8B7355", fontSize: 12, marginTop: 2 }}>
            {products.length} productos ·{" "}
            {
              products.filter((x) => x.stock <= x.minStock && x.minStock > 0)
                .length
            }{" "}
            con stock bajo
          </p>
        </div>
        <button
          className="btn-p"
          style={{ fontSize: 12 }}
          onClick={() => {
            setFProd(EMPTY_PRODUCT);
            setAddProd(true);
          }}
        >
          + Producto
        </button>
      </div>

      {products.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 30 }}>
          <p style={{ color: "#8B7355", fontSize: 14 }}>
            ¡Agregá tu primer producto!
          </p>
        </div>
      )}

      {/* Grilla 3 columnas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 11,
        }}
        className="grid4"
      >
        {products.map((prod) => {
          const low = prod.minStock > 0 && prod.stock <= prod.minStock;
          return (
            <div
              key={prod.id}
              className="card"
              style={{
                border: low ? `1.5px solid ${p}55` : "1.5px solid transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 9,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {prod.name}
                  </h4>
                  {prod.category && (
                    <p style={{ fontSize: 10, color: "#8B7355", marginTop: 1 }}>
                      {prod.category}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 3,
                    flexShrink: 0,
                    marginLeft: 6,
                  }}
                >
                  <button
                    className="iBtn"
                    onClick={() => {
                      setEditProd(prod);
                      setFEProd({
                        name: prod.name,
                        description: prod.description || "",
                        category: prod.category || "",
                        price: String(prod.price),
                        stock: String(prod.stock),
                        unit: prod.unit,
                        minStock: String(prod.minStock),
                      });
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="iBtn"
                    onClick={() => onDeleteProduct(prod.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {prod.description && (
                <p
                  style={{
                    fontSize: 11,
                    color: "#8B7355",
                    marginBottom: 9,
                    lineHeight: 1.4,
                  }}
                >
                  {prod.description}
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                  marginBottom: 9,
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderRadius: 7,
                    background: "#FDFAF7",
                    border: "1.5px solid #F0EBE3",
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: "#8B7355",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    Precio
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: p,
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    {fmt(prod.price)}
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderRadius: 7,
                    background: low ? "#FEF3EC" : "#FDFAF7",
                    border: `1.5px solid ${low ? p + "55" : "#F0EBE3"}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: low ? p : "#8B7355",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    Stock
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: low ? p : sc,
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    {prod.stock}{" "}
                    <span style={{ fontSize: 9, fontWeight: 400 }}>
                      {prod.unit}
                    </span>
                  </p>
                </div>
              </div>

              {low && (
                <p
                  style={{
                    fontSize: 10,
                    color: p,
                    textAlign: "center",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Mínimo: {prod.minStock} {prod.unit}
                </p>
              )}

              {/* Botones Entrada / Salida separados — idéntico al original */}
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  className="btn-g"
                  style={{ flex: 1, fontSize: 11, padding: "5px" }}
                  onClick={() => {
                    setAdjStock(prod);
                    setAdjQty("");
                    setAdjType("add");
                  }}
                >
                  Entrada
                </button>
                <button
                  className="btn-g"
                  style={{
                    flex: 1,
                    fontSize: 11,
                    padding: "5px",
                    borderColor: "#E07070",
                    color: "#C04E4E",
                  }}
                  onClick={() => {
                    setAdjStock(prod);
                    setAdjQty("");
                    setAdjType("remove");
                  }}
                >
                  Salida
                </button>
              </div>

              {/* Últimos 3 movimientos inline — idéntico al original */}
              {(prod.history || []).length > 0 && (
                <div
                  style={{
                    marginTop: 9,
                    borderTop: "1px solid #F0EBE3",
                    paddingTop: 7,
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: "#8B7355",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                      marginBottom: 4,
                    }}
                  >
                    Últimos movimientos
                  </p>
                  {[...(prod.history || [])]
                    .reverse()
                    .slice(0, 3)
                    .map((h, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "3px 0",
                          borderBottom: "1px solid #F5F0EA",
                        }}
                      >
                        <span style={{ fontSize: 10, color: "#4A3728" }}>
                          {fmtDate(h.date)}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color:
                              h.type === "add" ||
                              h.type === "init" ||
                              h.type === "return"
                                ? sc
                                : p,
                            fontWeight: 500,
                          }}
                        >
                          {h.note}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ MODALS ═══ */}

      {(addProd || editProd) && (
        <Modal
          title={addProd ? "Nuevo Producto" : "Editar Producto"}
          wide
          onClose={() => {
            setAddProd(false);
            setEditProd(null);
          }}
        >
          <ProductForm
            form={addProd ? fProd : fEProd}
            setForm={addProd ? setFProd : setFEProd}
          />
          <ModalButtons
            onCancel={() => {
              setAddProd(false);
              setEditProd(null);
            }}
            onSave={() => {
              if (addProd)
                onSaveProduct(fProd, () => {
                  setAddProd(false);
                  setFProd(EMPTY_PRODUCT);
                });
              else
                onUpdateProduct(editProd.id, fEProd, () => setEditProd(null));
            }}
          />
        </Modal>
      )}

      {adjStock && (
        <Modal
          title={adjType === "add" ? "Entrada de Stock" : "Salida de Stock"}
          sub={adjStock.name}
          onClose={() => setAdjStock(null)}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 9,
              }}
            >
              {[
                ["add", "Entrada", sc],
                ["remove", "Salida", p],
              ].map(([type, label, color]) => (
                <button
                  key={type}
                  onClick={() => setAdjType(type)}
                  style={{
                    padding: "9px",
                    borderRadius: 8,
                    border: `2px solid ${adjType === type ? color : "#E8DDD0"}`,
                    background: adjType === type ? `${color}15` : "#FDFAF7",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "inherit",
                    fontWeight: 600,
                    color: adjType === type ? color : "#8B7355",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <Field label={`Cantidad (${adjStock.unit})`}>
              <input
                className="inp"
                type="number"
                placeholder="0"
                value={adjQty}
                onChange={(e) => setAdjQty(e.target.value)}
              />
            </Field>
            <div
              style={{
                padding: "9px 12px",
                borderRadius: 8,
                background: "#FDFAF7",
                border: "1.5px solid #F0EBE3",
              }}
            >
              <p style={{ fontSize: 12, color: "#4A3728" }}>
                Stock actual:{" "}
                <strong>
                  {adjStock.stock} {adjStock.unit}
                </strong>
              </p>
              {adjQty && (
                <p
                  style={{
                    fontSize: 12,
                    color: adjType === "add" ? sc : p,
                    marginTop: 3,
                  }}
                >
                  Resultado:{" "}
                  <strong>
                    {adjType === "add"
                      ? adjStock.stock + parseFloat(adjQty || 0)
                      : Math.max(
                          0,
                          adjStock.stock - parseFloat(adjQty || 0)
                        )}{" "}
                    {adjStock.unit}
                  </strong>
                </p>
              )}
            </div>
            <ModalButtons
              onCancel={() => setAdjStock(null)}
              onSave={() =>
                onAdjustStock(adjStock, adjQty, adjType, () =>
                  setAdjStock(null)
                )
              }
              label="Confirmar"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function ProductForm({ form, setForm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Field label="Nombre *">
        <input
          className="inp"
          placeholder="Ej: Seda natural importada"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </Field>
      <Field label="Descripción">
        <input
          className="inp"
          placeholder="Opcional"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </Field>
      <Field label="Categoría">
        <input
          className="inp"
          placeholder="Ej: Telas, Insumos, Herramientas..."
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <Field label="Precio ($)">
          <input
            className="inp"
            type="number"
            placeholder="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </Field>
        <Field label="Stock actual">
          <input
            className="inp"
            type="number"
            placeholder="0"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <Field label="Unidad">
          <select
            className="inp"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          >
            {STOCK_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Stock mínimo">
          <input
            className="inp"
            type="number"
            placeholder="0 = sin alerta"
            value={form.minStock}
            onChange={(e) =>
              setForm((f) => ({ ...f, minStock: e.target.value }))
            }
          />
        </Field>
      </div>
    </div>
  );
}
