import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client — compatible con CodeSandbox y Vite local.
 *
 * En CodeSandbox: configurá las variables en:
 *   Settings (ícono ⚙️ izquierdo) → Env Variables
 *     VITE_SUPABASE_URL  = https://tu-proyecto.supabase.co
 *     VITE_SUPABASE_KEY  = tu_anon_public_key
 *
 * En local: creá un archivo .env en la raíz con esas mismas claves.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

// Si las variables no están configuradas aún, exportamos null.
// La app lo detecta y muestra un aviso amigable en lugar de romper.
export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const supabaseReady = Boolean(supabaseUrl && supabaseKey);
