import { useState, useEffect } from "react";

const IMG = {
  "neutro_M": "/digital-twin/corpo-homem-sobrepeso.jpg",
  "neutro_F": "/digital-twin/corpo-mulher-sobrepeso.jpg",
  "cardiovascular": "/digital-twin/sistema-cardiovascular.jpg",
  "respiratorio": "/digital-twin/sistema-respiratorio.jpg",
  "digestivo": "/digital-twin/sistema-digestivo.jpg",
  "neurologico": "/digital-twin/sistema-neurologico.jpg",
  "endocrino": "/digital-twin/sistema-endocrino.jpg",
  "renal": "/digital-twin/sistema-renal.jpg",
  "musculoesqueletico": "/digital-twin/sistema-musculoesqueletico.jpg",
  "imunologico": "/digital-twin/sistema-imunologico.jpg",
  "reprodutivo": "/digital-twin/sistema-feminino.jpg",
};

const SISTEMAS = [
  { id: "geral",              nome: "Visão geral",        icone: "body",   score: 70 },
  { id: "cardiovascular",     nome: "Cardiovascular",     icone: "heart",  score: 58 },
  { id: "respiratorio",       nome: "Respiratório",       icone: "lungs",  score: 88 },
  { id: "digestivo",          nome: "Digestivo",          icone: "gut",    score: 54 },
  { id: "neurologico",        nome: "Neurológico",        icone: "brain",  score: 78 },
  { id: "endocrino",          nome: "Endócrino",          icone: "gland",  score: 64 },
  { id: "renal",              nome: "Renal",              icone: "kidney", score: 82 },
  { id: "musculoesqueletico", nome: "Musculoesquelético", icone: "bone",   score: 66 },
  { id: "imunologico",        nome: "Imunológico",        icone: "shield", score: 76 },
];

const ORGAOS = SISTEMAS.filter(s => s.id !== "geral");

// Sistema reprodutivo feminino — só aparece quando o sexo F está selecionado.
// Fora de SISTEMAS/ORGAOS de propósito, para não alterar as contagens dos 8 sistemas.
const REPRODUTIVO = { id: "reprodutivo", nome: "Reprodutivo", icone: "female", score: 80 };

function statusDe(s) { return s >= 75 ? "verde" : s >= 55 ? "ambar" : "vermelho"; }
const COR = {
  verde:    { c: "#16A34A", bg: "rgba(22,163,74,0.13)",  label: "Saudável" },
  ambar:    { c: "#D97706", bg: "rgba(217,119,6,0.13)",  label: "Atenção" },
  vermelho: { c: "#DC2626", bg: "rgba(220,38,38,0.13)",  label: "Crítico" },
};
const HOTSPOT = { cardiovascular: 30, respiratorio: 28, digestivo: 44, neurologico: 10, endocrino: 22, renal: 46, musculoesqueletico: 40, imunologico: 34, reprodutivo: 50 };

const BIO = {
  cardiovascular: [
    { nome: "Colesterol total", valor: 219, unidade: "mg/dL", ref: "< 190", pos: 76, s: "vermelho" },
    { nome: "LDL", valor: 159.6, unidade: "mg/dL", ref: "< 130", pos: 78, s: "vermelho" },
    { nome: "HDL", valor: 41, unidade: "mg/dL", ref: "> 40", pos: 22, s: "ambar" },
    { nome: "Triglicérides", valor: 81, unidade: "mg/dL", ref: "< 150", pos: 35, s: "verde" },
    { nome: "VLDL", valor: 18.4, unidade: "mg/dL", ref: "< 30", pos: 42, s: "verde" },
    { nome: "Relação LDL/HDL", valor: 3.89, unidade: "", ref: "< 3.0", pos: 74, s: "ambar" },
  ],
  respiratorio: [
    { nome: "Hemoglobina", valor: 15.2, unidade: "g/dL", ref: "13.5–17.5", pos: 52, s: "verde" },
    { nome: "Hematócrito", valor: 45, unidade: "%", ref: "40–52", pos: 48, s: "verde" },
  ],
  digestivo: [
    { nome: "Blastocystis hominis", valor: "Presente", unidade: "", ref: "Ausente", pos: 82, s: "vermelho" },
    { nome: "Ferritina", valor: 433, unidade: "ng/mL", ref: "22–274", pos: 84, s: "vermelho" },
    { nome: "TGO", valor: 17, unidade: "U/L", ref: "< 40", pos: 25, s: "verde" },
    { nome: "TGP", valor: 21, unidade: "U/L", ref: "< 41", pos: 28, s: "verde" },
    { nome: "Gama-GT", valor: 29, unidade: "U/L", ref: "< 60", pos: 32, s: "verde" },
  ],
  neurologico: [
    { nome: "Vitamina B12", valor: 1096, unidade: "pg/mL", ref: "187–883", pos: 88, s: "ambar" },
    { nome: "Glicose", valor: 85, unidade: "mg/dL", ref: "70–99", pos: 45, s: "verde" },
    { nome: "HbA1c", valor: 5.4, unidade: "%", ref: "< 5.7", pos: 48, s: "verde" },
  ],
  endocrino: [
    { nome: "TSH", valor: 1.32, unidade: "µUI/mL", ref: "0.4–4.0", pos: 42, s: "verde" },
    { nome: "T4 livre", valor: 1.14, unidade: "ng/dL", ref: "0.9–1.7", pos: 48, s: "verde" },
    { nome: "Testosterona total", valor: 453.76, unidade: "ng/dL", ref: "220–870", pos: 28, s: "ambar" },
    { nome: "Vitamina D (25-OH)", valor: 35.9, unidade: "ng/mL", ref: "50–70 (ideal)", pos: 30, s: "ambar" },
    { nome: "PSA", valor: 0.42, unidade: "ng/mL", ref: "< 2.5", pos: 18, s: "verde" },
  ],
  renal: [
    { nome: "Creatinina", valor: 0.93, unidade: "mg/dL", ref: "0.7–1.2", pos: 48, s: "verde" },
    { nome: "TFG", valor: 90, unidade: "mL/min", ref: "> 90", pos: 72, s: "verde" },
    { nome: "Ureia", valor: 29, unidade: "mg/dL", ref: "15–45", pos: 45, s: "verde" },
    { nome: "Ácido úrico", valor: 5.1, unidade: "mg/dL", ref: "3.4–7.0", pos: 47, s: "verde" },
    { nome: "Densidade urinária", valor: 1030, unidade: "", ref: "1005–1025", pos: 85, s: "ambar" },
  ],
  musculoesqueletico: [
    { nome: "IMC", valor: 29.06, unidade: "kg/m²", ref: "18.5–24.9", pos: 78, s: "vermelho" },
    { nome: "Peso", valor: 89, unidade: "kg", ref: "Meta: 79–80", pos: 75, s: "ambar" },
    { nome: "Vitamina D", valor: 35.9, unidade: "ng/mL", ref: "50–70 (ideal)", pos: 30, s: "ambar" },
    { nome: "Cálcio", valor: 9.4, unidade: "mg/dL", ref: "8.5–10.2", pos: 50, s: "verde" },
  ],
  imunologico: [
    { nome: "FAN", valor: "Não reagente", unidade: "", ref: "Não reagente", pos: 20, s: "verde" },
    { nome: "Ferritina", valor: 433, unidade: "ng/mL", ref: "22–274", pos: 84, s: "vermelho" },
    { nome: "Eosinófilos", valor: 31, unidade: "/µL", ref: "50–500", pos: 15, s: "ambar" },
    { nome: "Leucócitos", valor: 6800, unidade: "/µL", ref: "4000–11000", pos: 45, s: "verde" },
  ],
  // Faixas de referência do sistema reprodutivo feminino (valores ilustrativos — o twin usa o sexo F como perfil corporal)
  reprodutivo: [
    { nome: "Estradiol", valor: 120, unidade: "pg/mL", ref: "30–400 (fase)", pos: 40, s: "verde" },
    { nome: "FSH", valor: 6.4, unidade: "mUI/mL", ref: "3.5–12.5", pos: 42, s: "verde" },
    { nome: "LH", valor: 7.1, unidade: "mUI/mL", ref: "2.4–12.6", pos: 46, s: "verde" },
    { nome: "Progesterona", valor: 8.2, unidade: "ng/mL", ref: "> 3 (lútea)", pos: 55, s: "verde" },
    { nome: "AMH", valor: 2.3, unidade: "ng/mL", ref: "1.0–4.0", pos: 48, s: "verde" },
  ],
};

const FRASE = {
  geral: "Homem de 33 anos, órgãos preservados e sem doença instalada. Quatro pontos de atenção reais: dislipidemia, testosterona no terço inferior, vitamina D subótima e ferritina elevada.",
  cardiovascular: "Dislipidemia com LDL 159,6 e HDL apenas 41. Relação LDL/HDL de 3,89 indica risco moderado.",
  respiratorio: "Hemograma dentro da normalidade. Sem alterações respiratórias relevantes.",
  digestivo: "Blastocystis hominis no parasitológico e ferritina elevada sugerindo inflamação subclínica. Fígado com função excelente.",
  neurologico: "Controle glicêmico preservado. B12 acima do limite superior — provável suplementação ou dieta.",
  endocrino: "Tireoide em equilíbrio. Testosterona em 453 ng/dL, no terço inferior para a idade. Vitamina D abaixo do alvo integrativo.",
  renal: "Função renal excelente (TFG > 90). Urina muito concentrada indica hidratação insuficiente.",
  musculoesqueletico: "IMC 29,06 (sobrepeso próximo da obesidade grau I). Meta: 79–80 kg em 6 meses.",
  imunologico: "Sem autoimunidade (FAN não reagente). Ferritina 433 sugere inflamação de baixo grau.",
  reprodutivo: "Útero, ovários e trompas em destaque. Faixas hormonais dentro da normalidade para a fase do ciclo.",
};

// Relatório gerado pela IA (no sistema real vem do Supabase / WF2)
const RELATORIO_IA = {
  data: "10 de julho de 2026",
  modelo: "Claude Opus · Agente Integrativo 2.0",
  texto: `O quadro geral é o retrato de um jovem adulto de 33 anos que ainda está saudável, mas cujos exames já apontam para o início de um desvio metabólico — o clássico "está tudo bem, mas...". Se nada for feito, este é o perfil que em 5 a 10 anos evolui para síndrome metabólica, resistência à insulina e esteatose hepática.

Órgãos preservados: fígado (TGO 17, TGP 21, GGT 29), rins (TFG > 90), tireoide (TSH 1,32) e medula óssea estão funcionando bem. Sem doenças infecciosas nem autoimunidade (FAN não reagente). O controle glicêmico está excelente (glicose 85, HbA1c 5,4%) — ainda não há resistência à insulina detectável, o que é uma janela de oportunidade valiosa.

Quatro pontos de atenção reais: dislipidemia (colesterol 219, LDL 159,6, HDL apenas 41) associada ao IMC 29; testosterona em 453 ng/dL, no terço inferior para a idade; vitamina D em 35,9 ng/mL, abaixo do alvo integrativo (50–70); e ferritina em 433 ng/mL sugerindo inflamação subclínica, junto de hidratação insuficiente e Blastocystis hominis nas fezes.

Causa-raiz mais provável: excesso de gordura corporal + sedentarismo + hidratação insuficiente + padrão alimentar rico em gorduras saturadas, gerando inflamação de baixo grau que contribui para o LDL alto, o HDL baixo e a testosterona reduzida. É um ciclo — mas é um ciclo que se rompe.

A boa notícia é que absolutamente todos os achados alterados são reversíveis com mudanças de estilo de vida bem orientadas. Não há doença instalada. Há sinais precoces, identificados no momento certo.`,
};

const ATENCAO = [
  { nome: "LDL", valor: "159,6 mg/dL", sistema: "Cardiovascular", s: "vermelho" },
  { nome: "Ferritina", valor: "433 ng/mL", sistema: "Inflamação", s: "vermelho" },
  { nome: "IMC", valor: "29,06 kg/m²", sistema: "Metabólico", s: "vermelho" },
  { nome: "Testosterona", valor: "453 ng/dL", sistema: "Endócrino", s: "ambar" },
  { nome: "Vitamina D", valor: "35,9 ng/mL", sistema: "Endócrino", s: "ambar" },
  { nome: "HDL", valor: "41 mg/dL", sistema: "Cardiovascular", s: "ambar" },
];

const ABAS = [
  { id: "resumo",      nome: "Resumo clínico" },
  { id: "suplementos", nome: "Suplementação" },
  { id: "alimentar",   nome: "Plano alimentar" },
  { id: "terapia",     nome: "Terapia" },
  { id: "treino",      nome: "Treino 90 dias" },
];
const SUPLEMENTOS = [
  { nome: "Vitamina D3", dose: "5.000 UI/dia", quando: "Com refeição gordurosa, 1x/dia", motivo: "Vitamina D em 35,9 ng/mL — abaixo do alvo integrativo (50–70). Favorece testosterona, imunidade e perfil lipídico." },
  { nome: "Ômega-3 (EPA+DHA)", dose: "2.000–3.000 mg/dia", quando: "Dividir em 2 tomadas, com refeições", motivo: "LDL 159,6 e HDL apenas 41. Reduz triglicérides, melhora HDL e reduz inflamação (ferritina 433)." },
  { nome: "Magnésio bisglicinato", dose: "300–400 mg/dia", quando: "À noite, 1h antes de dormir", motivo: "Suporte ao sono, sensibilidade à insulina, função muscular e produção de testosterona." },
  { nome: "Zinco quelato", dose: "20–30 mg/dia", quando: "Pela manhã, longe de cálcio e ferro", motivo: "Testosterona 453 ng/dL (terço inferior). Zinco é cofator essencial na esteroidogênese testicular." },
  { nome: "Coenzima Q10 (ubiquinol)", dose: "100–200 mg/dia", quando: "Café da manhã, com gordura", motivo: "Suporte cardiovascular e mitocondrial, relevante com LDL 159,6." },
  { nome: "Berberina", dose: "500 mg, 2x/dia", quando: "20 min antes do almoço e do jantar", motivo: "Controle lipídico (LDL 159,6) e modulação da microbiota — útil frente ao Blastocystis hominis." },
  { nome: "Complexo B ativado (sem B12)", dose: "1 cápsula/dia", quando: "Café da manhã", motivo: "Suporte energético. Não adicionar B12 extra — já está em 1096 pg/mL (acima do limite)." },
  { nome: "Probiótico multicepa", dose: "mín. 20 bilhões UFC/dia", quando: "Em jejum ou antes de dormir", motivo: "Blastocystis hominis no parasitológico. Modular microbiota e reduzir impacto do protozoário." },
  { nome: "Curcumina + piperina", dose: "500 mg, 2x/dia", quando: "Com as refeições principais", motivo: "Ferritina 433 ng/mL indica inflamação subclínica. Anti-inflamatório com benefício hepático." },
];
const ALIMENTAR = {
  objetivos: [
    "Reduzir LDL de 159,6 para menos de 130 mg/dL — fibras solúveis e gorduras boas",
    "Elevar HDL de 41 para mais de 50 mg/dL — ômega-3, azeite e atividade física",
    "Reduzir gordura corporal — IMC 29,06. Perder 8 a 10 kg leva ao IMC 25",
    "Reduzir inflamação (ferritina 433) — cortar ultraprocessados, álcool e excesso de carne vermelha",
    "Hidratação: meta de 3,1 litros/dia — urina com densidade acima de 1030",
  ],
  priorizar: ["Peixes gordurosos (sardinha, salmão) 3–4x/semana", "Oleaginosas: castanha-do-pará, nozes", "Azeite extravirgem, 2–3 colheres/dia", "Vegetais verde-escuros, 2 porções/dia", "Aveia (beta-glucana reduz LDL)", "Leguminosas 3–4x/semana", "Frutas de baixo índice glicêmico", "Alho e cebola crus (prebióticos)"],
  evitar: ["Carne vermelha — máx. 1–2x/semana (ferritina 433)", "Embutidos: bacon, salsicha, presunto", "Frituras e gordura trans", "Doces, refrigerantes, sucos industriais", "Ultraprocessados em geral", "Álcool — impacta testosterona e fígado", "Queijos amarelos gordurosos", "Pão branco, arroz branco, massas refinadas"],
};
const TERAPIA = [
  { titulo: "Sono restaurador", sub: "Testosterona é produzida no sono profundo", itens: ["Deitar entre 22h e 23h", "7 a 8 horas contínuas", "Blackout total no quarto", "Temperatura entre 18–21°C", "Sem telas 1h antes de dormir", "Sem cafeína após 14h", "Sem álcool à noite"] },
  { titulo: "Respiração diafragmática", sub: "Reduz cortisol e apoia controle abdominal", itens: ["5 minutos, 2x ao dia", "Inspirar 4s, segurar 4s, expirar 6s", "Ao acordar e antes de dormir"] },
  { titulo: "Banho de sol", sub: "Vitamina D em 35,9 — abaixo do ideal", itens: ["15–20 minutos por dia", "Antes das 10h ou após 16h", "Sol nas pernas e braços", "Otimiza ritmo circadiano e sono"] },
  { titulo: "Contato com a natureza", sub: "Redução de cortisol comprovada", itens: ["2x por semana, mínimo 30 min", "Parque, praça ou trilha", "Caminhada 10–15 min após refeições"] },
];
const TREINO = [
  { fase: "Fase 1 — Adaptação", dias: "Dias 1–30", meta: "Criar hábito · perder 2 a 3 kg",
    itens: ["3 dias de musculação ABC leve ou full body", "2 dias de cardio zona 2 — 30 a 40 min", "2 dias descanso ativo (mobilidade)", "Cargas moderadas, foco em execução", "Zona 2: 130–145 bpm — consegue conversar"] },
  { fase: "Fase 2 — Progressão", dias: "Dias 31–60", meta: "Mais 2–3 kg · total 4–6 kg",
    itens: ["4 dias musculação (ABCD ou upper/lower)", "1 dia HIIT — 30s forte / 90s leve x8", "1 cardio zona 2 longo — 50 a 60 min", "Cargas 20–30% maiores que Fase 1", "Falhar entre 8 e 12 reps com boa forma"] },
  { fase: "Fase 3 — Intensificação", dias: "Dias 61–90", meta: "Total 6–10 kg · LDL < 130 · Testo > 550",
    itens: ["4 dias musculação com progressão de carga", "2 dias HIIT — 25 a 30 min (40s/60s)", "Drop sets no último exercício de cada grupo", "Superséries antagonistas", "Sprints em inclinação 1x/semana — 10x20s"] },
];

function Icon({ name, size = 20 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "body":   return <svg {...p}><circle cx="12" cy="4.5" r="2.2"/><path d="M12 7v8M12 15l-2.5 6M12 15l2.5 6M7 10h10"/></svg>;
    case "heart":  return <svg {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>;
    case "lungs":  return <svg {...p}><path d="M12 4v8M8 21c-2 0-3-1-3-3 0-3 1-6 2-8 .5-1 2-1 2 0v8c0 2-1 3-3 3zM16 21c2 0 3-1 3-3 0-3-1-6-2-8-.5-1-2-1-2 0v8c0 2 1 3 3 3z"/></svg>;
    case "gut":    return <svg {...p}><path d="M6 4c0 4 3 4 3 8s-3 4-3 8M18 4c0 4-3 4-3 8s3 4 3 8M9 8h6M9 16h6"/></svg>;
    case "brain":  return <svg {...p}><path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 0V4a3 3 0 0 0-3-1zM15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3"/></svg>;
    case "gland":  return <svg {...p}><circle cx="12" cy="7" r="2.5"/><path d="M8 12c-1 2-1 5 1 7M16 12c1 2 1 5-1 7M12 9.5V13"/></svg>;
    case "kidney": return <svg {...p}><path d="M9 5c-3 0-4 3-4 6s1 8 4 8c2 0 2-3 2-5M15 5c3 0 4 3 4 6s-1 8-4 8c-2 0-2-3-2-5"/></svg>;
    case "bone":   return <svg {...p}><path d="M6 6a2 2 0 1 0-1 3l6 6a2 2 0 1 0 3 1 2 2 0 1 0-1-3l-6-6a2 2 0 0 0-1-1z"/></svg>;
    case "shield": return <svg {...p}><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"/></svg>;
    case "spark":  return <svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>;
    case "female": return <svg {...p}><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>;
    default:       return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>;
  }
}

function useCount(target, dur = 1000, dep) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, t0;
    const step = (ts) => { if (!t0) t0 = ts; const p = Math.min((ts - t0) / dur, 1);
      setV(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [target, dep]);
  return v;
}

// Gauge de ponteiro (semicírculo com faixas vermelho/âmbar/verde)
function Gauge({ valor, t }) {
  const v = useCount(valor, 1300, "gauge");
  const ang = -90 + (v / 100) * 180;
  const R = 74, cx = 100, cy = 100;
  const arco = (a1, a2, cor) => {
    const p = (a) => [cx + R * Math.cos((a - 90) * Math.PI / 180), cy + R * Math.sin((a - 90) * Math.PI / 180)];
    const [x1, y1] = p(a1), [x2, y2] = p(a2);
    return <path d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} stroke={cor} strokeWidth="15" fill="none" strokeLinecap="butt" />;
  };
  const st = statusDe(valor);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="200" height="118" viewBox="0 0 200 118">
        {arco(-90, -33, "#DC2626")}
        {arco(-31, 13, "#D97706")}
        {arco(15, 90, "#16A34A")}
        <line x1={cx} y1={cy} x2={cx + (R - 16) * Math.cos((ang - 90) * Math.PI / 180)} y2={cy + (R - 16) * Math.sin((ang - 90) * Math.PI / 180)}
          stroke={t.text} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="7" fill={t.text} />
        <circle cx={cx} cy={cy} r="3" fill={t.panelSolid} />
      </svg>
      <div style={{ marginTop: -6, textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: COR[st].c, lineHeight: 1 }}>{Math.round(v)}<span style={{ fontSize: 16, color: t.textDim }}>%</span></div>
        <div style={{ fontSize: 12, color: t.textDim, marginTop: 2 }}>Saúde geral · {COR[st].label}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [sistema, setSistema] = useState("geral");
  const [dark, setDark] = useState(false);
  const [sexo, setSexo] = useState("M");
  const [aba, setAba] = useState("resumo");

  const t = dark ? {
    bg: "#080E18", panel: "rgba(18,28,46,0.68)", panelSolid: "#121C2E", border: "rgba(120,160,220,0.16)",
    text: "#E8EEF8", textDim: "#8FA4C4", track: "rgba(255,255,255,0.08)",
  } : {
    bg: "#E9F0FA", panel: "rgba(255,255,255,0.7)", panelSolid: "#FFFFFF", border: "rgba(63,123,217,0.16)",
    text: "#1F2937", textDim: "#6B7280", track: "rgba(31,41,55,0.06)",
  };
  const glass = { background: t.panel, border: `1px solid ${t.border}`, borderRadius: 16, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" };
  const PALCO = "radial-gradient(ellipse 55% 45% at 50% 42%, #EAF2F7 0%, rgba(234,242,247,0) 62%), linear-gradient(to bottom, #D5DFE6 0%, #DFE6ED 35%, #DEE6EE 60%, #EEF8FC 82%, #D8DEE6 100%)";

  const sis = [...SISTEMAS, REPRODUTIVO].find(s => s.id === sistema) || SISTEMAS[0];
  const st = statusDe(sis.score);
  const isGeral = sistema === "geral";
  const bio = BIO[sistema] || [];
  const scoreGeral = Math.round(ORGAOS.reduce((a, s) => a + s.score, 0) / ORGAOS.length);
  const cont = { verde: 0, ambar: 0, vermelho: 0 };
  ORGAOS.forEach(s => cont[statusDe(s.score)]++);
  const pct = (n) => Math.round((n / ORGAOS.length) * 100);

  const imgKey = isGeral ? `neutro_${sexo}` : sistema;
  const imgSrc = IMG[imgKey] || IMG[`neutro_${sexo}`];
  const scoreAnim = Math.round(useCount(sis.score, 900, sistema));

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: t.bg, minHeight: "100vh", color: t.text, transition: "background 0.4s" }}>
      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", minHeight: "100vh" }}>

        <nav style={{ ...glass, borderRadius: 0, border: "none", borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 5 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#3F7BD9,#6C9DE4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: "0 4px 12px rgba(63,123,217,0.4)" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>A</span>
          </div>
          {SISTEMAS.map(s => {
            const ativo = s.id === sistema; const ss = statusDe(s.score);
            return (
              <button key={s.id} onClick={() => setSistema(s.id)} title={s.nome}
                style={{ position: "relative", width: 46, height: 46, borderRadius: 13, border: "none", cursor: "pointer",
                  background: ativo ? "linear-gradient(135deg,#3F7BD9,#6C9DE4)" : "transparent",
                  color: ativo ? "#fff" : t.textDim, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: ativo ? "0 4px 14px rgba(63,123,217,0.4)" : "none", transition: "all 0.2s",
                  marginBottom: s.id === "geral" ? 8 : 0 }}>
                <Icon name={s.icone} />
                {!ativo && s.id !== "geral" && <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: "50%", background: COR[ss].c }} />}
              </button>
            );
          })}
          {sexo === "F" && (() => {
            const ativo = sistema === REPRODUTIVO.id; const ss = statusDe(REPRODUTIVO.score);
            return (
              <button key={REPRODUTIVO.id} onClick={() => setSistema(REPRODUTIVO.id)} title={REPRODUTIVO.nome}
                style={{ position: "relative", width: 46, height: 46, borderRadius: 13, border: "none", cursor: "pointer",
                  background: ativo ? "linear-gradient(135deg,#D14D8F,#E87DB0)" : "transparent",
                  color: ativo ? "#fff" : t.textDim, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: ativo ? "0 4px 14px rgba(209,77,143,0.4)" : "none", transition: "all 0.2s" }}>
                <Icon name={REPRODUTIVO.icone} />
                {!ativo && <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: "50%", background: COR[ss].c }} />}
              </button>
            );
          })()}
        </nav>

        <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }}>Instituto Awada</div>
              <div style={{ fontSize: 12, color: t.textDim }}>Digital Twin · Eric Coutinho, 33 anos</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ ...glass, display: "flex", gap: 16, padding: "8px 16px", borderRadius: 13 }}>
                <div><div style={{ fontSize: 10, color: t.textDim }}>Idade biológica</div><div style={{ fontSize: 16, fontWeight: 800 }}>36</div></div>
                <div style={{ width: 1, background: t.border }} />
                <div><div style={{ fontSize: 10, color: t.textDim }}>Cronológica</div><div style={{ fontSize: 16, fontWeight: 800 }}>33</div></div>
              </div>
              <div style={{ ...glass, display: "flex", padding: 4, borderRadius: 11 }}>
                {["M", "F"].map(x => (
                  <button key={x} onClick={() => { setSexo(x); if (x === "M" && sistema === "reprodutivo") setSistema("geral"); }} style={{ border: "none", cursor: "pointer", padding: "5px 11px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: sexo === x ? "#3F7BD9" : "transparent", color: sexo === x ? "#fff" : t.textDim }}>{x}</button>
                ))}
              </div>
              <button onClick={() => setDark(!dark)} style={{ ...glass, width: 40, height: 40, borderRadius: 11, cursor: "pointer", color: t.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {dark ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" strokeLinecap="round"/></svg>
                       : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" strokeLinejoin="round"/></svg>}
              </button>
            </div>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.28fr", gap: 14, flex: 1, minHeight: 0 }}>

            {/* Palco */}
            <div style={{ ...glass, position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", background: PALCO, height: "100%", minHeight: 620 }}>
              <div style={{ position: "absolute", top: 14, left: 16, zIndex: 2 }}>
                <div style={{ fontSize: 10, color: "#7A8899", textTransform: "uppercase", letterSpacing: "0.1em" }}>Digital Twin</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1F2937" }}>{sis.nome}</div>
              </div>
              <img key={imgKey} src={imgSrc} alt={sis.nome}
                style={{ height: "100%", width: "auto", maxWidth: "100%", objectFit: "contain", animation: "fade 0.5s ease" }} />
              {!isGeral && (
                <div style={{ position: "absolute", top: `${HOTSPOT[sistema]}%`, left: "50%", transform: "translateX(-50%)", zIndex: 3 }}>
                  <div style={{ background: COR[st].c, color: "#fff", fontSize: 13, fontWeight: 800, padding: "4px 12px", borderRadius: 20, boxShadow: `0 4px 18px ${COR[st].c}`, whiteSpace: "nowrap", animation: "pop 0.4s ease" }}>
                    {scoreAnim}<span style={{ fontSize: 10, opacity: 0.85 }}>/100</span>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna direita */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "auto" }}>

              {/* Barra de abas */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ABAS.map(a => (
                  <button key={a.id} onClick={() => setAba(a.id)}
                    style={{ border: `1px solid ${aba === a.id ? "transparent" : t.border}`, cursor: "pointer",
                      padding: "7px 15px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: aba === a.id ? "linear-gradient(135deg,#3F7BD9,#6C9DE4)" : "transparent",
                      color: aba === a.id ? "#fff" : t.textDim, transition: "all 0.2s" }}>
                    {a.nome}
                  </button>
                ))}
              </div>

              {aba === "suplementos" ? (
                <div style={{ ...glass, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: t.textDim, marginBottom: 12 }}>Protocolo de suplementação · validar com seu médico</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {SUPLEMENTOS.map((s, i) => (
                      <div key={i} style={{ border: `1px solid ${t.border}`, borderRadius: 11, padding: "11px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{s.nome}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#3F7BD9", whiteSpace: "nowrap" }}>{s.dose}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#3F7BD9", marginBottom: 5 }}>{s.quando}</div>
                        <div style={{ fontSize: 12, color: t.textDim, lineHeight: 1.5 }}>{s.motivo}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 11, color: "#92400E", background: "rgba(217,119,6,0.12)", padding: "10px 13px", borderRadius: 9, lineHeight: 1.5 }}>
                    Protocolo educativo — não substitui prescrição médica. Introduzir gradualmente, começando pelos 4 primeiros na primeira semana. Reavaliar em 90 dias com novos exames.
                  </div>
                </div>
              ) : aba === "alimentar" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ ...glass, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: t.textDim, marginBottom: 12 }}>Objetivos do plano alimentar</div>
                    {ALIMENTAR.objetivos.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9, fontSize: 12.5, lineHeight: 1.55 }}>
                        <span style={{ color: "#3F7BD9", fontWeight: 800, minWidth: 14 }}>{i + 1}</span>
                        <span style={{ color: t.textDim }}>{p}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ ...glass, padding: 15 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", marginBottom: 10 }}>Priorizar</div>
                      {ALIMENTAR.priorizar.map((x, i) => (
                        <div key={i} style={{ fontSize: 12, color: t.textDim, padding: "5px 0", borderBottom: i < ALIMENTAR.priorizar.length - 1 ? `1px solid ${t.border}` : "none", lineHeight: 1.4 }}>{x}</div>
                      ))}
                    </div>
                    <div style={{ ...glass, padding: 15 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#DC2626", marginBottom: 10 }}>Reduzir ou eliminar</div>
                      {ALIMENTAR.evitar.map((x, i) => (
                        <div key={i} style={{ fontSize: 12, color: t.textDim, padding: "5px 0", borderBottom: i < ALIMENTAR.evitar.length - 1 ? `1px solid ${t.border}` : "none", lineHeight: 1.4 }}>{x}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : aba === "terapia" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {TERAPIA.map((b, i) => (
                    <div key={i} style={{ ...glass, padding: 15 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 2 }}>{b.titulo}</div>
                      <div style={{ fontSize: 11, color: "#3F7BD9", marginBottom: 10 }}>{b.sub}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                        {b.itens.map((x, j) => (
                          <div key={j} style={{ fontSize: 12, color: t.textDim, display: "flex", gap: 7, lineHeight: 1.4 }}>
                            <span style={{ color: "#3F7BD9", flexShrink: 0 }}>•</span>{x}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : aba === "treino" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {TREINO.map((f, i) => (
                    <div key={i} style={{ ...glass, padding: 15 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800 }}>{f.fase}</span>
                        <span style={{ fontSize: 11, color: t.textDim }}>{f.dias}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#3F7BD9", fontWeight: 700, marginBottom: 10 }}>Meta: {f.meta}</div>
                      {f.itens.map((x, j) => (
                        <div key={j} style={{ fontSize: 12, color: t.textDim, display: "flex", gap: 7, padding: "3px 0", lineHeight: 1.4 }}>
                          <span style={{ color: "#3F7BD9", flexShrink: 0 }}>•</span>{x}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : isGeral ? (
                <>
                  {/* Gauge + distribuição */}
                  <div style={{ ...glass, padding: 16, display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center" }}>
                    <Gauge valor={scoreGeral} t={t} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: t.textDim, marginBottom: 10 }}>Equilíbrio dos sistemas</div>
                      {[["verde", cont.verde], ["ambar", cont.ambar], ["vermelho", cont.vermelho]].map(([k, n]) => (
                        <div key={k} style={{ marginBottom: 9 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                            <span style={{ color: t.textDim }}>{COR[k].label}</span>
                            <span style={{ fontWeight: 700, color: COR[k].c }}>{pct(n)}% <span style={{ color: t.textDim, fontWeight: 400 }}>({n} de {ORGAOS.length})</span></span>
                          </div>
                          <div style={{ height: 7, borderRadius: 4, background: t.track, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct(n)}%`, background: COR[k].c, borderRadius: 4, transition: "width 1s ease" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pontos de maior atenção */}
                  <div style={{ ...glass, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: t.textDim, marginBottom: 12 }}>Pontos de maior atenção</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 8 }}>
                      {ATENCAO.map((a, i) => (
                        <div key={i} style={{ background: COR[a.s].bg, borderRadius: 10, padding: "8px 11px" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: COR[a.s].c }}>{a.nome}</div>
                          <div style={{ fontSize: 13, fontWeight: 800 }}>{a.valor}</div>
                          <div style={{ fontSize: 10, color: t.textDim }}>{a.sistema}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Relatório da IA */}
                  <div style={{ ...glass, padding: 16, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#3F7BD9,#6C9DE4)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="spark" size={15} /></div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800 }}>Análise integrativa da IA</div>
                          <div style={{ fontSize: 10, color: t.textDim }}>{RELATORIO_IA.modelo} · {RELATORIO_IA.data}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#16A34A", background: "rgba(22,163,74,0.12)", padding: "3px 9px", borderRadius: 20 }}>Revisado</span>
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.65, color: t.textDim, whiteSpace: "pre-line" }}>{RELATORIO_IA.texto}</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ ...glass, padding: 15 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: COR[st].bg, color: COR[st].c, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={sis.icone} size={18} /></div>
                        <div><div style={{ fontSize: 15, fontWeight: 800 }}>Sistema {sis.nome}</div><div style={{ fontSize: 11, color: t.textDim }}>{bio.length} índices avaliados</div></div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: COR[st].c, background: COR[st].bg, padding: "5px 13px", borderRadius: 20 }}>{COR[st].label}</div>
                    </div>
                    <div style={{ fontSize: 12.5, color: t.textDim, lineHeight: 1.55 }}>{FRASE[sistema]}</div>
                  </div>

                  <div style={{ ...glass, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: t.textDim, marginBottom: 14 }}>Índices laboratoriais</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 15 }}>
                      {bio.map((it, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{it.nome}</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: COR[it.s].c }}>{it.valor}<span style={{ fontSize: 10, color: t.textDim, fontWeight: 400 }}> {it.unidade}</span></span>
                          </div>
                          <div style={{ position: "relative", height: 6, borderRadius: 4, background: t.track, marginBottom: 4 }}>
                            <div style={{ position: "absolute", top: -1, bottom: -1, left: `${it.pos}%`, width: 3, borderRadius: 2, background: COR[it.s].c, transform: "translateX(-50%)", boxShadow: `0 0 6px ${COR[it.s].c}` }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.textDim }}>
                            <span>Ref: {it.ref}</span><span style={{ color: COR[it.s].c, fontWeight: 600 }}>{COR[it.s].label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Relatório da IA também nos sistemas — preenche o vazio */}
                  <div style={{ ...glass, padding: 16, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg,#3F7BD9,#6C9DE4)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="spark" size={14} /></div>
                      <div style={{ fontSize: 12.5, fontWeight: 800 }}>Leitura da IA para este sistema</div>
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.65, color: t.textDim }}>
                      {RELATORIO_IA.texto.split("\n\n")[0]}
                    </div>
                    <button onClick={() => setSistema("geral")} style={{ marginTop: 12, background: "transparent", border: `1px solid ${t.border}`, color: "#3F7BD9", fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 9, cursor: "pointer" }}>
                      Ver análise completa
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fade{from{opacity:0}to{opacity:1}}@keyframes pop{0%{transform:translateX(-50%) scale(0.6);opacity:0}100%{transform:translateX(-50%) scale(1);opacity:1}}`}</style>
    </div>
  );
}
