import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Profile({ user, onClose, onLogout, dark }) {
  const email = user?.email || "";
  const nomeInicial = user?.user_metadata?.full_name || email.split("@")[0] || "Usuário";
  const [nome, setNome] = useState(nomeInicial);
  const [novaSenha, setNovaSenha] = useState("");
  const [confSenha, setConfSenha] = useState("");
  const [msg, setMsg] = useState(null); // { tipo: "ok"|"erro", texto }
  const [salvando, setSalvando] = useState(false);

  const t = dark
    ? { card: "#121C2E", border: "rgba(120,160,220,0.16)", text: "#E8EEF8", dim: "#8FA4C4", input: "#0C1524" }
    : { card: "#FFFFFF", border: "rgba(63,123,217,0.16)", text: "#1F2937", dim: "#6B7280", input: "#F7FAFF" };

  async function salvarNome() {
    if (!nome.trim()) { setMsg({ tipo: "erro", texto: "Nome não pode ser vazio." }); return; }
    setSalvando(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ data: { full_name: nome.trim() } });
    setSalvando(false);
    setMsg(error ? { tipo: "erro", texto: error.message } : { tipo: "ok", texto: "Perfil atualizado!" });
  }

  async function trocarSenha() {
    if (!novaSenha || novaSenha.length < 6) { setMsg({ tipo: "erro", texto: "A senha precisa de no mínimo 6 caracteres." }); return; }
    if (novaSenha !== confSenha) { setMsg({ tipo: "erro", texto: "As senhas não coincidem." }); return; }
    setSalvando(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvando(false);
    if (error) { setMsg({ tipo: "erro", texto: error.message }); return; }
    setNovaSenha(""); setConfSenha("");
    setMsg({ tipo: "ok", texto: "Senha alterada!" });
  }

  const campo = { width: "100%", padding: "10px 13px", borderRadius: 10, border: `1.5px solid ${t.border}`,
    background: t.input, color: t.text, fontSize: 13.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const label = { fontSize: 12, fontWeight: 600, color: t.dim, marginBottom: 6, display: "block" };
  const secTitle = { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: t.dim, marginBottom: 12 };
  const btnSave = { border: "none", cursor: "pointer", background: "linear-gradient(135deg,#3F7BD9,#6C9DE4)", color: "#fff",
    fontSize: 13, fontWeight: 700, fontFamily: "inherit", padding: "9px 16px", borderRadius: 10, marginTop: 14 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(8,14,24,0.55)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 540, maxHeight: "90vh", overflow: "auto",
        background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
        fontFamily: "'Inter', system-ui, sans-serif", color: t.text }}>

        {/* Cabeçalho */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${t.border}` }}>
          <div><div style={{ fontSize: 16, fontWeight: 800 }}>Meu Perfil</div>
            <div style={{ fontSize: 12, color: t.dim }}>Gerencie suas informações</div></div>
          <button onClick={onClose} aria-label="Fechar" style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${t.border}`,
            background: "transparent", color: t.text, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: 22 }}>
          {/* Avatar + identidade */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 54, height: 54, borderRadius: 15, background: "linear-gradient(135deg,#3F7BD9,#6C9DE4)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22 }}>
              {nomeInicial[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{nome || nomeInicial}</div>
              <div style={{ fontSize: 12.5, color: t.dim }}>{email}</div>
            </div>
          </div>

          {msg && (
            <div style={{ fontSize: 12.5, fontWeight: 600, padding: "9px 12px", borderRadius: 10, marginBottom: 16,
              background: msg.tipo === "ok" ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
              color: msg.tipo === "ok" ? "#16A34A" : "#DC2626" }}>{msg.texto}</div>
          )}

          {/* Informações pessoais */}
          <div style={{ marginBottom: 24 }}>
            <div style={secTitle}>Informações pessoais</div>
            <label style={label}>Nome completo</label>
            <input style={{ ...campo, marginBottom: 12 }} value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" />
            <label style={label}>E-mail</label>
            <input style={{ ...campo, opacity: 0.65, cursor: "not-allowed" }} value={email} disabled />
            <button style={btnSave} onClick={salvarNome} disabled={salvando}>Salvar alterações</button>
          </div>

          {/* Redefinir senha */}
          <div>
            <div style={secTitle}>Redefinir senha</div>
            <label style={label}>Nova senha</label>
            <input style={{ ...campo, marginBottom: 12 }} type="password" value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
            <label style={label}>Confirmar senha</label>
            <input style={campo} type="password" value={confSenha}
              onChange={e => setConfSenha(e.target.value)} placeholder="Repita a senha" autoComplete="new-password" />
            <button style={btnSave} onClick={trocarSenha} disabled={salvando}>Alterar senha</button>
          </div>

          {/* Sair */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${t.border}` }}>
            <button onClick={onLogout} style={{ width: "100%", padding: 11, borderRadius: 11, cursor: "pointer",
              border: `1px solid rgba(220,38,38,0.3)`, background: "rgba(220,38,38,0.08)", color: "#DC2626",
              fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>Sair da conta</button>
          </div>
        </div>
      </div>
    </div>
  );
}
