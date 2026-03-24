import { useState, useEffect, useRef } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { useClients } from "./hooks/useClients.js";
import { useOrders } from "./hooks/useOrders.js";
import { dataApi } from "./services/api.js";
import { supabaseReady } from "./services/supabaseClient.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import { DEFAULT_CFG, DEFAULT_CATS } from "./utils/constants.js";
import {
  DEMO_CLIENTS,
  DEMO_CATS,
  DEMO_PRODUCTS,
  DEMO_SALES,
  DEMO_CFG,
  isDemoLoaded,
} from "./demoData.js";
import "./styles/globals.css";

const DEMO_USER = {
  id: "demo",
  name: "Usuario Demo",
  email: "demo@orvian.app",
};

export default function App() {
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [toast, setToast] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  
  // NUEVO: Estado para evitar que el auto-guardado pise los datos al iniciar
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  
  const saveTimer = useRef(null);

  const doToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2100);
  };

  const {
    user: authUser,
    loading,
    login,
    register,
    logout,
    updatePassword,
  } = useAuth();
  
  const clientsHook = useClients([], null, doToast);
  const ordersHook = useOrders(DEFAULT_CATS, [], doToast, []);
  const setProductsRef = ordersHook.setProducts;

  const user = demoMode ? DEMO_USER : authUser;

  // ── FUNCIÓN DE CARGA ────────────────────────────────
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
    } finally {
      // Importante: Marcamos que la carga terminó (con éxito o no)
      setIsInitialLoadDone(true);
    }
  };

  // ── FUNCIÓN DE GUARDADO ─────────────────────────────
  const saveAll = (clients, cats, products, cfgData, sales, userId) => {
    if (!userId || demoMode) return;
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

  // ── EFECTO 1: CARGA INICIAL (Soluciona el F5) ────────
  useEffect(() => {
    if (authUser && !demoMode) {
      loadData(authUser.id);
    }
  }, [authUser]); // Se dispara cuando useAuth recupera la sesión

  // ── EFECTO 2: AUTO-GUARDADO SEGURO ──────────────────
  useEffect(() => {
    // Solo guardamos si hay usuario Y si ya terminamos de cargar los datos iniciales
    if (authUser && !demoMode && isInitialLoadDone) {
      saveAll(
        clientsHook.clients,
        ordersHook.cats,
        ordersHook.products,
        cfg,
        ordersHook.sales,
        authUser.id
      );
    }
  }, [
    clientsHook.clients,
    ordersHook.cats,
    ordersHook.products,
    cfg,
    ordersHook.sales,
    isInitialLoadDone // Agregamos esta dependencia para seguridad
  ]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const handleLogin = async (email, password) => {
    if (email === "__demo__") {
      clientsHook.hydrateClients(DEMO_CLIENTS);
      ordersHook.hydrateCats(DEMO_CATS);
      ordersHook.hydrateProducts(DEMO_PRODUCTS);
      ordersHook.hydrateSales(DEMO_SALES);
      setCfg(DEMO_CFG);
      setDemoMode(true);
      doToast("Modo demo activado · Los datos no se guardan");
      return;
    }
    const userData = await login(email, password);
    if (userData) await loadData(userData.id);
  };

  const handleLogout = async () => {
    setIsInitialLoadDone(false); // Reseteamos el flag de carga
    if (demoMode) {
      setDemoMode(false);
    } else {
      await logout();
    }
    clientsHook.hydrateClients([]);
    ordersHook.hydrateCats(DEFAULT_CATS);
    ordersHook.hydrateProducts([]);
    ordersHook.hydrateSales([]);
    setCfg(DEFAULT_CFG);
  };

  const handleClearDemo = () => {
    clientsHook.hydrateClients([]);
    ordersHook.hydrateCats(DEFAULT_CATS);
    ordersHook.hydrateProducts([]);
    ordersHook.hydrateSales([]);
    setCfg(DEFAULT_CFG);
    doToast("Datos de ejemplo eliminados");
  };

  // Renderizado de carga y configuración (se mantiene igual)
  if (!supabaseReady && !demoMode && !user) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#1C1E2A,#22263A)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", padding: 24 }}>
        <div style={{ background: "rgba(255,255,255,.05)", border: "1.5px solid rgba(200,149,108,.4)", borderRadius: 18, padding: 32, maxWidth: 500, width: "100%" }}>
          <div style={{ fontSize: 40, textAlign: "center", marginBottom: 16 }}>⚙️</div>
          <h2 style={{ color: "#F0EDF8", fontFamily: "'Outfit',sans-serif", fontSize: 22, textAlign: "center", marginBottom: 10 }}>Configurá Supabase</h2>
          <p style={{ color: "rgba(240,237,248,.6)", fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>Necesitás configurar las variables de entorno para usar el dashboard.</p>
          <button onClick={() => handleLogin("__demo__", "__demo__")} style={{ width: "100%", background: "rgba(200,149,108,.15)", border: "1.5px solid rgba(200,149,108,.35)", color: "#C8956C", borderRadius: 9, padding: "11px 20px", cursor: "pointer", fontWeight: 600 }}>👀 Ver demo sin configurar Supabase</button>
        </div>
      </div>
    );
  }

  if (loading && !demoMode) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#1C1E2A,#22263A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(240,237,248,.5)", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>Cargando sesión...</p>
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
      demoMode={demoMode}
      onClearDemo={handleClearDemo}
      isDemoLoaded={isDemoLoaded(clientsHook.clients)}
      onSaveClient={clientsHook.saveClient}
      onUpdateClient={clientsHook.updateClient}
      onDeleteClient={clientsHook.deleteClient}
      onSaveClientNote={clientsHook.saveClientNote}
      onSaveOrder={clientsHook.saveOrder}
      onUpdateOrder={clientsHook.updateOrder}
      onUpdateOrderStatus={clientsHook.updateOrderStatus}
      onDeleteOrder={clientsHook.deleteOrder}
      onSavePayment={clientsHook.savePayment}
      onUpdatePayment={clientsHook.updatePayment}
      onDeletePayment={clientsHook.deletePayment}
      onSaveCustomItem={clientsHook.saveCustomItem}
      onDeleteCustomItem={clientsHook.deleteCustomItem}
      onAddProductToOrder={(args) => clientsHook.addProductToOrder({ ...args, setProducts: setProductsRef })}
      onRemoveProductFromOrder={(args) => clientsHook.removeProductFromOrder({ ...args, setProducts: setProductsRef })}
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