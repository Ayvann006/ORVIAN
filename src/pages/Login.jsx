import Auth from "../components/Auth.jsx";
import { DEFAULT_CFG } from "../utils/constants.js";

export default function Login({ onLogin, onRegister }) {
  return (
    <Auth
      onLogin={onLogin}
      onRegister={onRegister}
      primary={DEFAULT_CFG.primaryColor}
    />
  );
}
