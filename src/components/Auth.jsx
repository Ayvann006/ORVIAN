import { useState } from "react";

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
      setInfo("Cuenta creada. Ya puedes iniciar sesión.");
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
        .btn-auth{background:linear-gradient(135deg,${primary},#8B6F9E);color:#fff;border:none;padding:12px;border-radius:8px;font-family:inherit;font-weight:600;font-size:14px;cursor:pointer;transition:opacity .2s;width:100%;display:block;}
        .btn-auth:hover{opacity:.87;} .btn-auth:disabled{opacity:.6;cursor:not-allowed;}
        .tab-auth{flex:1;background:none;border:none;padding:"9px 0";font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
      `}</style>

      <div
        style={{ width: "100%", maxWidth: 380, animation: "fadeUp .5s ease" }}
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
            }}
          >
            <img
              src="/logo-b.png"
              alt="Logo"
              style={{
                width: 45,
                height: 45,
                objectFit: "contain",
                borderRadius: 8,
              }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = "🧵";
              }}
            />
          </div>
          <h1
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 24,
              color: "#F0EDF8",
              fontWeight: 700,
            }}
          >
            Orvian
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
            marginBottom: 12,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(180,170,200,.15)",
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
                  background: "none",
                  border: "none",
                  padding: "9px 0",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: mode === m ? primary : "rgba(180,170,200,.45)",
                  borderBottom: `2px solid ${
                    mode === m ? primary : "transparent"
                  }`,
                  transition: "all .2s",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Campos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {mode === "register" && (
              <div>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(180,170,200,.55)",
                    textTransform: "uppercase",
                    letterSpacing: ".7px",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Nombre
                </label>
                <input
                  className="auth-inp"
                  style={{
                    width: "100%",
                    border: "1.5px solid rgba(180,170,200,.2)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontFamily: "inherit",
                    fontSize: 14,
                    color: "#F0EDF8",
                    background: "rgba(255,255,255,.07)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(180,170,200,.55)",
                  textTransform: "uppercase",
                  letterSpacing: ".7px",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Email
              </label>
              <input
                className="auth-inp"
                style={{
                  width: "100%",
                  border: "1.5px solid rgba(180,170,200,.2)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "#F0EDF8",
                  background: "rgba(255,255,255,.07)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(180,170,200,.55)",
                  textTransform: "uppercase",
                  letterSpacing: ".7px",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Contraseña
              </label>
              <input
                className="auth-inp"
                style={{
                  width: "100%",
                  border: "1.5px solid rgba(180,170,200,.2)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "#F0EDF8",
                  background: "rgba(255,255,255,.07)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                type="password"
                placeholder="••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            {mode === "register" && (
              <div>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(180,170,200,.55)",
                    textTransform: "uppercase",
                    letterSpacing: ".7px",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Repetir contraseña
                </label>
                <input
                  className="auth-inp"
                  style={{
                    width: "100%",
                    border: "1.5px solid rgba(180,170,200,.2)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontFamily: "inherit",
                    fontSize: 14,
                    color: "#F0EDF8",
                    background: "rgba(255,255,255,.07)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  type="password"
                  placeholder="••••••"
                  value={pass2}
                  onChange={(e) => setPass2(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </div>
            )}
            {err && (
              <p
                style={{
                  color: "#E06B6B",
                  fontSize: 12,
                  textAlign: "center",
                  background: "rgba(224,107,107,.1)",
                  padding: "8px",
                  borderRadius: 7,
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
                  textAlign: "center",
                  background: "rgba(107,158,139,.1)",
                  padding: "8px",
                  borderRadius: 7,
                }}
              >
                {info}
              </p>
            )}
            <button
              className="btn-auth"
              style={{ marginTop: 3 }}
              onClick={submit}
              disabled={loading}
            >
              {loading
                ? "Cargando..."
                : mode === "login"
                ? "Entrar →"
                : "Crear cuenta"}
            </button>
          </div>
        </div>

        {/* ── Botón demo ── */}
        <div
          style={{
            background: "rgba(255,255,255,.03)",
            border: "1.5px solid rgba(180,170,200,.1)",
            borderRadius: 14,
            padding: "16px 20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "rgba(180,170,200,.6)",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            ¿Querés ver cómo funciona antes de registrarte?
          </p>
          <button
            onClick={() => onLogin("__demo__", "__demo__")}
            style={{
              background: "rgba(200,149,108,.15)",
              border: "1.5px solid rgba(200,149,108,.35)",
              color: "#C8956C",
              borderRadius: 9,
              padding: "9px 20px",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
              transition: "all .2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(200,149,108,.25)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "rgba(200,149,108,.15)")
            }
          >
            👀 Ver demo con datos de ejemplo
          </button>
          <p
            style={{
              color: "rgba(180,170,200,.3)",
              fontSize: 10,
              marginTop: 8,
            }}
          >
            Sin registrarte · Datos ficticios · Podés limpiarlos cuando quieras
          </p>
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
