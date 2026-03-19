import { useState } from "react";

/**
 * Pantalla de login / registro.
 * Recibe callbacks de useAuth — no llama a Supabase directamente.
 */
export default function Auth({ onLogin, onRegister, primary }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !pass)
      return setErr("Completá todos los campos.");
    if (pass !== pass2) return setErr("Las contraseñas no coinciden.");
    if (pass.length < 6)
      return setErr("La contraseña debe tener al menos 6 caracteres.");
    setLoading(true);
    setErr("");
    try {
      await onRegister(name, email, pass);
      setInfo(
        "Cuenta creada. Ya puedes iniciar sesión"
      );
      setMode("login");
      setPass("");
      setPass2("");
    } catch (e) {
      setErr(
        e.message === "User already registered"
          ? "Ya existe una cuenta con ese email."
          : e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !pass) return setErr("Completá email y contraseña.");
    setLoading(true);
    setErr("");
    try {
      await onLogin(email, pass);
    } catch (e) {
      setErr(
        e.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    setErr("");
    setInfo("");
    mode === "login" ? handleLogin() : handleRegister();
  };

  const inputStyle = {
    width: "100%",
    border: `1.5px solid rgba(180,170,200,.2)`,
    borderRadius: 10,
    padding: "12px 14px",
    fontFamily: "inherit",
    fontSize: 14,
    color: "#F0EDF8",
    background: "rgba(255,255,255,.07)",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#1C1E2A,#22263A 60%,#1A1E28)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans',sans-serif",
        padding: 20,
      }}
    >
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .auth-inp:focus{border-color:${primary} !important;}
        .auth-inp::placeholder{color:rgba(180,170,200,.4);}
        .btn-auth{background:linear-gradient(135deg,${primary},#8B6F9E);color:#fff;border:none;padding:12px;
          border-radius:8px;font-family:inherit;font-weight:600;font-size:14px;cursor:pointer;
          transition:opacity .2s;width:100%;display:block;}
        .btn-auth:hover{opacity:.87;} .btn-auth:disabled{opacity:.6;cursor:not-allowed;}
      `}</style>

      <div
        style={{ width: "100%", maxWidth: 370, animation: "fadeUp .5s ease" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              margin: "0 auto 14px",
              background: `linear-gradient(135deg,${primary},#8B6F9E)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🧵
          </div>
          <h1
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 24,
              color: "#F0EDF8",
              fontWeight: 700,
            }}
          >
            ORVIAN
          </h1>
          <p
            style={{
              color: "rgba(180,170,200,.5)",
              fontSize: 13,
              marginTop: 5,
            }}
          >
            {mode === "login"
              ? "Iniciá sesión para continuar"
              : "Creá tu cuenta gratis"}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,.04)",
            border: "1.5px solid rgba(180,170,200,.1)",
            borderRadius: 16,
            padding: 24,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,.05)",
              borderRadius: 10,
              padding: 3,
              marginBottom: 20,
            }}
          >
            {[
              ["login", "Iniciar sesión"],
              ["register", "Registrarse"],
            ].map(([m, l]) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErr("");
                  setInfo("");
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all .2s",
                  background:
                    mode === m ? "rgba(255,255,255,.1)" : "transparent",
                  color: mode === m ? "#F0EDF8" : "rgba(180,170,200,.5)",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Campos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mode === "register" && (
              <input
                className="auth-inp"
                style={inputStyle}
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              className="auth-inp"
              style={inputStyle}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <input
              className="auth-inp"
              style={inputStyle}
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {mode === "register" && (
              <input
                className="auth-inp"
                style={inputStyle}
                type="password"
                placeholder="Repetir contraseña"
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            )}
          </div>

          {err && (
            <p
              style={{
                color: "#E07070",
                fontSize: 12,
                margin: "10px 0 0",
                textAlign: "center",
              }}
            >
              {err}
            </p>
          )}
          {info && (
            <p
              style={{
                color: "#6B9E8B",
                fontSize: 12,
                margin: "10px 0 0",
                textAlign: "center",
              }}
            >
              {info}
            </p>
          )}

          <button
            className="btn-auth"
            style={{ marginTop: 16 }}
            onClick={submit}
            disabled={loading}
          >
            {loading ? "..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(180,170,200,.3)",
            marginTop: 16,
          }}
        >
          Tus datos se guardan de forma segura en la nube.
        </p>
      </div>
    </div>
  );
}
