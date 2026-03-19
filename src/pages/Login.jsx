import Auth from "../components/Auth.jsx";
import { DEFAULT_CFG } from "../utils/constants.js";

/**
 * Página de login.
 * Wrapper delgado sobre el componente Auth.
 * Recibe las funciones de useAuth como props.
 */
export default function Login({ onLogin, onRegister }) {
  return (
    <Auth
      onLogin={onLogin}
      onRegister={onRegister}
      primary={DEFAULT_CFG.primaryColor}
    />
  );
}
