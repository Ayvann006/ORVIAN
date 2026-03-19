import { useState, useEffect } from "react";
import { authApi } from "../services/api.js";

/**
 * Hook de autenticación.
 * Gestiona la sesión del usuario con Supabase Auth.
 * Expone helpers tipados para login, registro y logout.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restaurar sesión al montar ──────────────────────
  useEffect(() => {
    authApi.getSession().then((session) => {
      if (session) {
        const u = session.user;
        const name = u.user_metadata?.name || u.email.split("@")[0];
        setUser({ id: u.id, name, email: u.email });
      }
      setLoading(false);
    });

    const subscription = authApi.onAuthStateChange((_event, session) => {
      if (!session) setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Acciones ──────────────────────────────────────
  const login = async (email, password) => {
    const data = await authApi.signIn(email.trim(), password);
    const u = data.user;
    const name = u.user_metadata?.name || u.email.split("@")[0];
    const userData = { id: u.id, name, email: u.email };
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    await authApi.signUp(email.trim(), password, name.trim());
  };

  const logout = async () => {
    await authApi.signOut();
    setUser(null);
  };

  const updatePassword = async (newPassword) => {
    await authApi.updatePassword(newPassword);
  };

  return { user, loading, login, register, logout, updatePassword };
}
