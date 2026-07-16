import { useState, useEffect } from "react";
import { supabase, supabasePronto } from "./supabaseClient";
import Login from "./Login";
import App from "./App";

export default function AuthGate() {
  const [sessao, setSessao] = useState(undefined); // undefined = carregando; null = deslogado
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!supabasePronto) { setSessao(null); setPronto(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSessao(data.session); setPronto(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSessao(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setSessao(null);
  }

  if (!pronto || sessao === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif", color: "#6B7280", background: "#E9F0FA" }}>
        Carregando…
      </div>
    );
  }

  if (!sessao) return <Login />;
  return <App user={sessao.user} onLogout={logout} />;
}
