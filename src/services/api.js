import { supabase } from "./supabaseClient.js";

const notReady = () => {
  throw new Error("Supabase no configurado.");
};

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  async signIn(email, password) {
    if (!supabase) notReady();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },
  async signUp(email, password, name) {
    if (!supabase) notReady();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  },
  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },
  async getSession() {
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },
  onAuthStateChange(callback) {
    if (!supabase) return { unsubscribe: () => {} };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },
  async updatePassword(newPassword) {
    if (!supabase) notReady();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};

// ── Data (atelier_data) ───────────────────────────────
export const dataApi = {
  async load(userId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("atelier_data")
      .select("clients,cats,products,cfg,sales")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async save({ userId, clients, cats, products, cfg, sales }) {
    if (!supabase) return;
    const { error } = await supabase
      .from("atelier_data")
      .upsert(
        { user_id: userId, clients, cats, products, cfg, sales: sales || [] },
        { onConflict: "user_id" }
      );
    if (error) throw error;
  },
};

// ── Dólar API ─────────────────────────────────────────
export const dolarApi = {
  async fetch() {
    const res = await window.fetch("https://dolarapi.com/v1/dolares");
    const data = await res.json();
    const find = (casa) => data.find((d) => d.casa === casa);
    return {
      blue: find("blue")?.venta || 0,
      oficial: find("oficial")?.venta || 0,
      mep: find("bolsa")?.venta || 0,
      updatedAt: new Date(),
    };
  },
};
