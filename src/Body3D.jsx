import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect, Component } from "react";
import * as THREE from "three";

// Posições 3D de cada órgão no espaço do modelo (modelo normalizado ~1.7 unidades de altura)
// Estes valores assumem modelo centralizado em Y=0 com cabeça ~+0.75 e pés ~-0.75
// Ajuste após carregar o GLB real se necessário
const HOTSPOT_POS = {
  neurologico:        [0,     0.72,  0.08],
  endocrino:          [0,     0.50,  0.12],
  cardiovascular:     [0.16,  0.36,  0.14],
  respiratorio:       [-0.18, 0.30,  0.12],
  imunologico:        [-0.22, 0.14,  0.10],
  musculoesqueletico: [0.34,  0.12,  0.09],
  digestivo:          [0.06,  0.04,  0.14],
  renal:              [0.18,  0.00, -0.12],
  reprodutivo:        [0,    -0.22,  0.12],
};

function corPorScore(score) {
  return score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
}

function Model({ url }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    scene.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) scene.scale.multiplyScalar(1.7 / maxDim);
    // Materiais: torna ligeiramente translúcido para estética digital
    scene.traverse(obj => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => { m.roughness = 0.55; m.metalness = 0.08; });
      }
    });
  }, [scene]);

  return <primitive ref={ref} object={scene} />;
}

function Hotspot({ orgao, ativo, onClick }) {
  const pos = HOTSPOT_POS[orgao.id];
  if (!pos) return null;
  const cor = corPorScore(orgao.score);
  const nome = orgao.nome.replace("Músculo-esquelético", "Musculoesq.");

  return (
    <Html position={pos} center distanceFactor={5.5} zIndexRange={[10, 0]}>
      <div
        onClick={(e) => { e.stopPropagation(); onClick(orgao.id); }}
        style={{
          display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
          background: ativo ? "rgba(255,255,255,0.97)" : "rgba(10,18,36,0.78)",
          border: `2px solid ${cor}`,
          borderRadius: 20, padding: "3px 9px 3px 5px",
          backdropFilter: "blur(8px)",
          boxShadow: ativo ? `0 0 0 3px ${cor}55, 0 4px 16px rgba(0,0,0,0.3)` : "0 2px 10px rgba(0,0,0,0.35)",
          transition: "all 0.15s",
          userSelect: "none", whiteSpace: "nowrap",
          pointerEvents: "auto",
        }}
      >
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: cor, flexShrink: 0,
          boxShadow: `0 0 7px ${cor}`,
        }} />
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: ativo ? "#1e293b" : "#f1f5f9",
        }}>
          {nome}
        </span>
        <span style={{ fontSize: 9, fontWeight: 800, color: cor, marginLeft: 2 }}>
          {orgao.score}
        </span>
      </div>
    </Html>
  );
}

function Cena({ modelUrl, orgaos, sistemaAtivo, onClickSistema }) {
  const [interacting, setInteracting] = useState(false);
  const timerRef = useRef(null);

  const onStart = () => { clearTimeout(timerRef.current); setInteracting(true); };
  const onEnd   = () => { timerRef.current = setTimeout(() => setInteracting(false), 3500); };

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.3} castShadow />
      <directionalLight position={[-2, 2, -2]} intensity={0.4} color="#aaccff" />
      <pointLight position={[0, -2, 1]} intensity={0.3} color="#ffffff" />

      <Suspense fallback={null}>
        <Model url={modelUrl} />
        {orgaos.map(o => (
          <Hotspot key={o.id} orgao={o} ativo={sistemaAtivo === o.id} onClick={onClickSistema} />
        ))}
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.8}
        maxDistance={5}
        autoRotate={!interacting}
        autoRotateSpeed={1.2}
        onStart={onStart}
        onEnd={onEnd}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.88}
      />
    </>
  );
}

class ErrBoundary extends Component {
  constructor(p) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

export default function Body3D({ sexo, orgaos, sistemaAtivo, onClickSistema, fallback }) {
  const modelUrl = `/digital-twin/corpo-${sexo === "F" ? "mulher" : "homem"}.glb`;
  const [glbOk, setGlbOk] = useState(null); // null=verificando | true=existe | false=não existe

  useEffect(() => {
    setGlbOk(null);
    fetch(modelUrl, { method: "HEAD" })
      .then(r => setGlbOk(r.ok))
      .catch(() => setGlbOk(false));
  }, [modelUrl]);

  if (glbOk === null) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#64748b", fontSize: 11, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>⟳</div>
          Carregando modelo 3D...
        </div>
      </div>
    );
  }

  // GLB não encontrado — mostra fallback (imagem 2D) com mensagem de instrução
  if (glbOk === false) {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {fallback}
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          background: "rgba(10,18,36,0.8)", color: "#94a3b8",
          fontSize: 10, padding: "5px 12px", borderRadius: 20, whiteSpace: "nowrap",
          backdropFilter: "blur(6px)",
        }}>
          Adicione corpo.glb em /public/digital-twin/ para ativar o 3D
        </div>
      </div>
    );
  }

  return (
    <ErrBoundary fallback={fallback}>
      <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 42 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: true, alpha: true }}
        >
          <Cena
            modelUrl={modelUrl}
            orgaos={orgaos}
            sistemaAtivo={sistemaAtivo}
            onClickSistema={onClickSistema}
          />
        </Canvas>
      </div>
    </ErrBoundary>
  );
}
