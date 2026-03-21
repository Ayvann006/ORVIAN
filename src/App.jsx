import { useState, useEffect, useRef } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { useClients } from "./hooks/useClients.js";
import { useOrders } from "./hooks/useOrders.js";
import { dataApi } from "./services/api.js";
import { supabaseReady } from "./services/supabaseClient.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import { DEFAULT_CFG, DEFAULT_CATS } from "./utils/constants.js";
import "./styles/globals.css";

export default function App() {
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [toast, setToast] = useState("");
  const saveTimer = useRef(null);

  const doToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2100);
  };

  const { user, loading, login, register, logout, updatePassword } = useAuth();
  const clientsHook = useClients([], null, doToast);
  const ordersHook = useOrders(DEFAULT_CATS, [], doToast, []);
  const setProductsRef = ordersHook.setProducts;

  const loadData = async (userId) => {
    try {
      const data = await dataApi.load(userId);
      if (data) {
        if (data.clients) clientsHook.hydrateClients(data.clients);
        if (data.cats) ordersHook.hydrateCats(data.cats);
        if (data.products) ordersHook.hydrateProducts(data.products);
        if (data.cfg) setCfg(data.cfg);
        if (data.sales) ordersHook.hydrateSales(data.sales);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  const saveAll = (clients, cats, products, cfgData, sales, userId) => {
    if (!userId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await dataApi.save({
          userId,
          clients,
          cats,
          products,
          cfg: cfgData,
          sales,
        });
      } catch (err) {
        console.error("Error guardando:", err);
      }
    }, 800);
  };

  useEffect(() => {
    if (user)
      saveAll(
        clientsHook.clients,
        ordersHook.cats,
        ordersHook.products,
        cfg,
        ordersHook.sales,
        user.id
      );
  }, [
    clientsHook.clients,
    ordersHook.cats,
    ordersHook.products,
    cfg,
    ordersHook.sales,
  ]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const handleLogin = async (email, password) => {
    const userData = await login(email, password);
    await loadData(userData.id);
  };

  const handleLogout = async () => {
    await logout();
    clientsHook.hydrateClients([]);
    ordersHook.hydrateCats(DEFAULT_CATS);
    ordersHook.hydrateProducts([]);
    ordersHook.hydrateSales([]);
    setCfg(DEFAULT_CFG);
  };

  // ── Supabase no configurado ──────────────────────────
  if (!supabaseReady) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg,#1C1E2A,#22263A)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans',sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,.05)",
            border: "1.5px solid rgba(200,149,108,.4)",
            borderRadius: 18,
            padding: 32,
            maxWidth: 500,
            width: "100%",
          }}
        >
          <div style={{ fontSize: 40, textAlign: "center", marginBottom: 16 }}>
            ⚙️
          </div>
          <h2
            style={{
              color: "#F0EDF8",
              fontFamily: "'Outfit',sans-serif",
              fontSize: 22,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Configurá Supabase
          </h2>
          <p
            style={{
              color: "rgba(240,237,248,.6)",
              fontSize: 14,
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Necesitás configurar las variables de entorno para usar el
            dashboard.
          </p>
          <div
            style={{
              background: "rgba(0,0,0,.3)",
              borderRadius: 10,
              padding: "16px 20px",
              marginBottom: 16,
            }}
          >
            <p
              style={{
                color: "#C8956C",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: ".7px",
              }}
            >
              En CodeSandbox:
            </p>
            <ol
              style={{
                color: "rgba(240,237,248,.7)",
                fontSize: 13,
                lineHeight: 2,
                paddingLeft: 18,
              }}
            >
              <li>
                Click en el ícono{" "}
                <strong style={{ color: "#F0EDF8" }}>⚙️</strong> del panel
                izquierdo
              </li>
              <li>
                Seleccioná{" "}
                <strong style={{ color: "#F0EDF8" }}>"Env Variables"</strong>
              </li>
              <li>
                Agregá{" "}
                <code
                  style={{
                    background: "rgba(255,255,255,.1)",
                    padding: "1px 6px",
                    borderRadius: 4,
                    color: "#C8956C",
                  }}
                >
                  VITE_SUPABASE_URL
                </code>
              </li>
              <li>
                Agregá{" "}
                <code
                  style={{
                    background: "rgba(255,255,255,.1)",
                    padding: "1px 6px",
                    borderRadius: 4,
                    color: "#C8956C",
                  }}
                >
                  VITE_SUPABASE_KEY
                </code>
              </li>
              <li>
                Hacé click en{" "}
                <strong style={{ color: "#F0EDF8" }}>"Restart Sandbox"</strong>
              </li>
            </ol>
          </div>
          <div
            style={{
              background: "rgba(0,0,0,.3)",
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <p
              style={{
                color: "#6B9E8B",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: ".7px",
              }}
            >
              ¿Dónde obtengo esos valores?
            </p>
            <p
              style={{
                color: "rgba(240,237,248,.6)",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              Entrá a <strong style={{ color: "#F0EDF8" }}>supabase.com</strong>{" "}
              → tu proyecto → Settings → API.
              <br />
              Copiá el <strong style={{ color: "#F0EDF8" }}>
                Project URL
              </strong>{" "}
              y la clave{" "}
              <strong style={{ color: "#F0EDF8" }}>anon public</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg,#1C1E2A,#22263A)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            color: "rgba(240,237,248,.5)",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 14,
          }}
        >
          Cargando...
        </p>
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} onRegister={register} />;

  return (
    <Home
      user={user}
      cfg={cfg}
      setCfg={setCfg}
      clients={clientsHook.clients}
      cats={ordersHook.cats}
      products={ordersHook.products}
      setProducts={setProductsRef}
      sales={ordersHook.sales}
      toast={toast}
      doToast={doToast}
      onSaveClient={clientsHook.saveClient}
      onUpdateClient={clientsHook.updateClient}
      onDeleteClient={clientsHook.deleteClient}
      onSaveClientNote={clientsHook.saveClientNote}
      onSaveOrder={clientsHook.saveOrder}
      onUpdateOrder={clientsHook.updateOrder}
      onUpdateOrderStatus={clientsHook.updateOrderStatus}
      onDeleteOrder={(cid, oid, cb) => clientsHook.deleteOrder(cid, oid, cb)}
      onSavePayment={clientsHook.savePayment}
      onUpdatePayment={clientsHook.updatePayment}
      onDeletePayment={clientsHook.deletePayment}
      onSaveCustomItem={clientsHook.saveCustomItem}
      onDeleteCustomItem={clientsHook.deleteCustomItem}
      onAddProductToOrder={(args) =>
        clientsHook.addProductToOrder({ ...args, setProducts: setProductsRef })
      }
      onRemoveProductFromOrder={(args) =>
        clientsHook.removeProductFromOrder({
          ...args,
          setProducts: setProductsRef,
        })
      }
      onSaveProduct={ordersHook.saveProduct}
      onUpdateProduct={ordersHook.updateProduct}
      onDeleteProduct={ordersHook.deleteProduct}
      onAdjustStock={ordersHook.adjustStock}
      onSaveCategory={ordersHook.saveCategory}
      onUpdateCategory={ordersHook.updateCategory}
      onDeleteCategory={ordersHook.deleteCategory}
      onSaveExpense={ordersHook.saveExpense}
      onUpdateExpense={ordersHook.updateExpense}
      onDeleteExpense={ordersHook.deleteExpense}
      onSaveSale={ordersHook.saveSale}
      onDeleteSale={ordersHook.deleteSale}
      onLogout={handleLogout}
      onUpdatePassword={updatePassword}
    />
  );
}
