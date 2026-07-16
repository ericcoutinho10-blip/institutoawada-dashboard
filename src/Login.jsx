import { useState } from "react";
import { supabase, supabasePronto } from "./supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e?.preventDefault();
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    if (!supabasePronto) { setErro("Login ainda não configurado (falta a chave do Supabase)."); return; }
    setErro(""); setCarregando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) setErro("E-mail ou senha incorretos.");
      // Sucesso: o listener de sessão em AuthGate troca de tela automaticamente.
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const campo = {
    width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(63,123,217,0.22)",
    background: "#fff", fontSize: 14, fontFamily: "inherit", color: "#1F2937", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
      background: "radial-gradient(ellipse 60% 50% at 50% 30%, #EAF2F7 0%, rgba(234,242,247,0) 62%), linear-gradient(160deg,#E9F0FA 0%,#D5DFE6 100%)" }}>
      <div style={{ width: "100%", maxWidth: 900, display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 24,
        overflow: "hidden", boxShadow: "0 24px 70px rgba(31,58,110,0.18)", background: "#fff" }}>

        {/* Lado esquerdo — marca */}
        <div style={{ background: "linear-gradient(150deg,#3F7BD9,#6C9DE4 55%,#8E6CE0)", padding: "44px 38px",
          display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff", minHeight: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>A</div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Instituto Awada</span>
          </div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Seu Digital Twin<br />da saúde
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 14, lineHeight: 1.6, maxWidth: 300 }}>
              Exames, sistemas do corpo e plano integrativo — em um só lugar, com análise da IA.
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: i === 0 ? 22 : 7, height: 7, borderRadius: 99, background: "rgba(255,255,255,0.55)" }} />)}
          </div>
        </div>

        {/* Lado direito — formulário */}
        <form onSubmit={entrar} style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1F2937", letterSpacing: "-0.02em" }}>Bem-vindo de volta</div>
          <div style={{ fontSize: 13.5, color: "#6B7280", margintop: 4, marginBottom: 22 }}>Acesse sua conta para continuar</div>

          {erro && (
            <div style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626", fontSize: 12.5, fontWeight: 600,
              padding: "9px 12px", borderRadius: 10, marginBottom: 14 }}>{erro}</div>
          )}

          <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>E-mail</label>
          <input style={{ ...campo, marginBottom: 14 }} type="email" value={email} autoComplete="email"
            onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />

          <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Senha</label>
          <input style={{ ...campo, marginBottom: 22 }} type="password" value={senha} autoComplete="current-password"
            onChange={e => setSenha(e.target.value)} placeholder="••••••••" />

          <button type="submit" disabled={carregando}
            style={{ width: "100%", padding: 13, borderRadius: 13, border: "none", cursor: carregando ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg,#3F7BD9,#6C9DE4)", color: "#fff", fontSize: 14, fontWeight: 700,
              fontFamily: "inherit", opacity: carregando ? 0.6 : 1, boxShadow: "0 6px 20px rgba(63,123,217,0.35)" }}>
            {carregando ? "Entrando..." : "Entrar no Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}
