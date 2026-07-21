import { useState, useEffect } from "react";
import { supabase, supabasePronto } from "./supabaseClient";
import Login from "./Login";
import App from "./App";

export default function AuthGate() {
  const [sessao, setSessao] = useState(undefined);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    // Dev bypass: VITE_DEV_PASS env var + ?devpass=<valor> na URL
    const devPass = import.meta.env.VITE_DEV_PASS;
    const urlPass = new URLSearchParams(window.location.search).get("devpass");
    if (devPass && urlPass === devPass) {
      setSessao({ user: { email: "dev@awada.com", user_metadata: { full_name: "Dev" } } });
      setPronto(true);
      return;
    }
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
