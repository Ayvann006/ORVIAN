import { useState } from "react";
import { Modal, ModalButtons, Field } from "./Modals.jsx";
import { fmt, fmtDate } from "../utils/format.js";
import {
  ICON_OPTS,
  COL_OPTS,
  EMPTY_CAT,
  EMPTY_EXPENSE,
} from "../utils/constants.js";

/**
 * Tab "Gastos" — layout de grilla 3 columnas, idéntico al original.
 */
export default function Expenses({
  cats,
  cfg,
  onSaveCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSaveExpense,
  onUpdateExpense,
  onDeleteExpense,
}) {
  const p = cfg.primaryColor;

  const [addCat, setAddCat] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [addExp, setAddExp] = useState(null);
  const [editExp, setEditExp] = useState(null);

  const [fCat, setFCat] = useState(EMPTY_CAT);
  const [fECat, setFECat] = useState(EMPTY_CAT);
  const [fExp, setFExp] = useState(EMPTY_EXPENSE);
  const [fEExp, setFEExp] = useState(EMPTY_EXPENSE);

  const totalExpenses = cats.reduce(
    (s, c) => s + c.items.reduce((a, e) => a + e.amount, 0),
    0
  );

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
            Gastos
          </h3>
          <p style={{ color: "#8B7355", fontSize: 12, marginTop: 2 }}>
            Total: <strong style={{ color: p }}>{fmt(totalExpenses)}</strong>
          </p>
        </div>
        <button
          className="btn-p"
          style={{ fontSize: 12 }}
          onClick={() => {
            setFCat(EMPTY_CAT);
            setAddCat(true);
          }}
        >
          + Categoría
        </button>
      </div>

      {/* Grid 3 columnas — idéntico al original */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 11,
        }}
        className="grid4"
      >
        {cats.length === 0 && (
          <div
            className="card"
            style={{ gridColumn: "1/-1", textAlign: "center", padding: 22 }}
          >
            <p style={{ color: "#8B7355", fontSize: 13 }}>
              Agregá categorías para empezar
            </p>
          </div>
        )}
        {cats.map((cat) => {
          const total = cat.items.reduce((s, e) => s + e.amount, 0);
          return (
            <div key={cat.id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 9,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 27,
                      height: 27,
                      borderRadius: 6,
                      background: cat.color + "22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                    }}
                  >
                    {cat.icon}
                  </div>
                  <h4 style={{ fontSize: 12, fontWeight: 600 }}>{cat.name}</h4>
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  <button
                    className="iBtn"
                    onClick={() => {
                      setEditCat(cat);
                      setFECat({
                        name: cat.name,
                        icon: cat.icon,
                        color: cat.color,
                      });
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="iBtn"
                    onClick={() => onDeleteCategory(cat.id)}
                  >
                    🗑️
                  </button>
                  <button
                    className="btn-g"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                    onClick={() => {
                      setFExp(EMPTY_EXPENSE);
                      setAddExp(cat.id);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: cat.color,
                  fontFamily: "'Outfit',sans-serif",
                  marginBottom: 8,
                }}
              >
                {fmt(total)}
              </p>
              <div style={{ maxHeight: 165, overflowY: "auto" }}>
                {cat.items.length === 0 ? (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#B0A090",
                      textAlign: "center",
                      padding: "7px 0",
                    }}
                  >
                    Sin registros
                  </p>
                ) : (
                  [...cat.items]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((e) => (
                      <div
                        key={e.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 0",
                          borderBottom: "1px solid #F5F0EA",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#4A3728",
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {e.desc || "Sin desc."}
                          </p>
                          <p style={{ fontSize: 9, color: "#B0A090" }}>
                            {fmtDate(e.date)}
                          </p>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: p,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmt(e.amount)}
                        </p>
                        <button
                          className="iBtn"
                          onClick={() => {
                            setEditExp({ catId: cat.id, item: e });
                            setFEExp({
                              date: e.date,
                              desc: e.desc || "",
                              amount: String(e.amount),
                            });
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="iBtn"
                          onClick={() => onDeleteExpense(cat.id, e.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ MODALS ═══ */}

      {addCat && (
        <Modal title="Nueva Categoría" onClose={() => setAddCat(false)}>
          <CategoryForm form={fCat} setForm={setFCat} />
          <ModalButtons
            onCancel={() => setAddCat(false)}
            onSave={() =>
              onSaveCategory(fCat, () => {
                setAddCat(false);
                setFCat(EMPTY_CAT);
              })
            }
          />
        </Modal>
      )}

      {editCat && (
        <Modal title="Editar Categoría" onClose={() => setEditCat(null)}>
          <CategoryForm form={fECat} setForm={setFECat} />
          <ModalButtons
            onCancel={() => setEditCat(null)}
            onSave={() =>
              onUpdateCategory(editCat.id, fECat, () => setEditCat(null))
            }
          />
        </Modal>
      )}

      {addExp && (
        <Modal
          title="Nuevo Gasto"
          sub={`${cats.find((c) => c.id === addExp)?.icon} ${
            cats.find((c) => c.id === addExp)?.name
          }`}
          onClose={() => setAddExp(null)}
        >
          <ExpenseForm form={fExp} setForm={setFExp} />
          <ModalButtons
            onCancel={() => setAddExp(null)}
            onSave={() =>
              onSaveExpense(addExp, fExp, () => {
                setAddExp(null);
                setFExp(EMPTY_EXPENSE);
              })
            }
          />
        </Modal>
      )}

      {editExp && (
        <Modal
          title="Editar Gasto"
          sub={`${cats.find((c) => c.id === editExp.catId)?.icon} ${
            cats.find((c) => c.id === editExp.catId)?.name
          }`}
          onClose={() => setEditExp(null)}
        >
          <ExpenseForm form={fEExp} setForm={setFEExp} />
          <ModalButtons
            onCancel={() => setEditExp(null)}
            onSave={() =>
              onUpdateExpense(editExp.catId, editExp.item.id, fEExp, () =>
                setEditExp(null)
              )
            }
          />
        </Modal>
      )}
    </div>
  );
}

function CategoryForm({ form, setForm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Field label="Nombre *">
        <input
          className="inp"
          placeholder="Ej: Telas"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </Field>
      <Field label="Ícono">
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {ICON_OPTS.map((ic) => (
            <button
              key={ic}
              onClick={() => setForm((f) => ({ ...f, icon: ic }))}
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                border: `1.5px solid ${
                  form.icon === ic ? "#C8956C" : "#E8DDD0"
                }`,
                background: form.icon === ic ? "#FEF3EC" : "#FDFAF7",
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              {ic}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Color">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {COL_OPTS.map((c) => (
            <button
              key={c}
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: c,
                border:
                  form.color === c
                    ? "2.5px solid #2C1810"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </Field>
    </div>
  );
}

function ExpenseForm({ form, setForm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Field label="Fecha">
        <input
          className="inp"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
      </Field>
      <Field label="Descripción">
        <input
          className="inp"
          placeholder="Ej: Seda importada"
          value={form.desc}
          onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
        />
      </Field>
      <Field label="Monto ($) *">
        <input
          className="inp"
          type="number"
          placeholder="0"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
        />
      </Field>
    </div>
  );
}
