import { createClient } from "@supabase/supabase-js";

// ⚠️ COLE AQUI os 2 valores do SEU projeto Supabase (Project Settings → API).
// A anon key é pública por design (protegida por Row Level Security no Supabase),
// então pode ficar no código do front-end.
//
// Preferência: se estas variáveis existirem no ambiente (Vercel → Settings →
// Environment Variables: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY), elas têm
// prioridade. Caso contrário, usa os valores fixos abaixo.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "COLE_AQUI_A_PROJECT_URL";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "COLE_AQUI_A_ANON_KEY";

export const supabasePronto =
  /^https?:\/\//.test(SUPABASE_URL) &&
  !SUPABASE_URL.includes("COLE_AQUI") &&
  !SUPABASE_ANON_KEY.includes("COLE_AQUI");

// Só cria o cliente quando as credenciais forem válidas. Com o placeholder, o
// createClient lançaria "Invalid supabaseUrl" e derrubaria o app inteiro.
export const supabase = supabasePronto
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
