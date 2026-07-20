import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense, useRef, useState, useEffect, useMemo, Component } from "react";
import * as THREE from "three";

// ── Fresnel shader — cria o efeito azul translúcido com brilho nas bordas ──────
const fresnelVert = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vec4 mvp  = modelViewMatrix * vec4(position, 1.0);
    vViewDir  = normalize(-mvp.xyz);
    gl_Position = projectionMatrix * mvp;
  }
`;
const fresnelFrag = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform vec3  uColor;
  uniform float uPower;
  uniform float uMin;
  uniform float uMax;
  void main() {
    float cosA  = abs(dot(normalize(vNormal), normalize(vViewDir)));
    float fres  = 1.0 - cosA;
    fres = clamp(pow(fres, uPower), 0.0, 1.0);
    float alpha = mix(uMin, uMax, fres);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function FresnelBody({ geometry }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   fresnelVert,
    fragmentShader: fresnelFrag,
    uniforms: {
      uColor: { value: new THREE.Color(0x1a8fff) },
      uPower: { value: 2.8 },
      uMin:   { value: 0.02 },
      uMax:   { value: 0.88 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  return <mesh geometry={geometry} material={mat} />;
}

// ── Perfil do corpo (LatheGeometry) — rotação em torno do eixo Y ────────────────
function buildBodyGeometry() {
  const pts = [
    [0.01, -0.84],
    [0.08, -0.80],
    [0.07, -0.72],
    [0.11, -0.60],
    [0.15, -0.46],
    [0.13, -0.42],
    [0.19, -0.26],
    [0.22, -0.10],
    [0.27,  0.00],
    [0.30,  0.10],
    [0.29,  0.20],
    [0.27,  0.30],
    [0.25,  0.38],
    [0.26,  0.46],
    [0.27,  0.50],
    [0.11,  0.55],
    [0.09,  0.60],
    [0.14,  0.64],
    [0.18,  0.70],
    [0.17,  0.77],
    [0.12,  0.82],
    [0.01,  0.86],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 48);
}

// ── Geometria de braço simples ───────────────────────────────────────────────────
function Arm({ side }) {
  const x = side * 0.34;
  return (
    <group position={[x, 0.40, 0]} rotation={[0, 0, side * 0.22]}>
      <mesh>
        <capsuleGeometry args={[0.065, 0.55, 8, 16]} />
        <meshPhysicalMaterial
          color="#1a8fff" transparent opacity={0.18}
          roughness={0.1} side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── Órgãos individuais ───────────────────────────────────────────────────────────
function Organ({ position, scale = [1,1,1], color, emissive, opacity = 1, geometry = "sphere", children }) {
  const geo = useMemo(() => {
    if (geometry === "sphere") return new THREE.SphereGeometry(1, 20, 14);
    if (geometry === "tube")   return null;
    return new THREE.SphereGeometry(1, 20, 14);
  }, [geometry]);

  if (!geo) return children || null;

  return (
    <mesh position={position} scale={scale} geometry={geo}>
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={0.25}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={0.55}
        metalness={0.05}
      />
    </mesh>
  );
}

// Intestino delgado — tubo enrolado
function IntestineDelgado() {
  const geo = useMemo(() => {
    const pts = [];
    const turns = 5;
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2 * turns;
      const r = 0.055 + Math.sin(t * Math.PI * 3) * 0.015;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * r,
        -0.08 - t * 0.12,
        Math.sin(angle) * r * 0.6 + 0.07,
      ));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.016, 7, false);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#f0a88a" emissive="#f0a88a" emissiveIntensity={0.2} roughness={0.6} />
    </mesh>
  );
}

// Intestino grosso — U em volta do delgado
function IntestineGrosso() {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector3(-0.09, -0.03, 0.07),
      new THREE.Vector3(-0.11, -0.08, 0.07),
      new THREE.Vector3(-0.10, -0.18, 0.07),
      new THREE.Vector3(-0.07, -0.24, 0.08),
      new THREE.Vector3( 0.00, -0.27, 0.09),
      new THREE.Vector3( 0.07, -0.24, 0.08),
      new THREE.Vector3( 0.10, -0.18, 0.07),
      new THREE.Vector3( 0.11, -0.08, 0.07),
      new THREE.Vector3( 0.09, -0.03, 0.07),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.025, 8, false);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#c87858" emissive="#c87858" emissiveIntensity={0.15} roughness={0.65} />
    </mesh>
  );
}

// Rede de vasos sanguíneos
function BloodVessels() {
  const geo = useMemo(() => {
    const paths = [
      // Aorta
      [ [0.01, 0.22, 0.06], [0.01, 0.10, 0.07], [0.01, -0.05, 0.07], [0.00, -0.20, 0.06] ],
      // Veias pulmonares
      [ [0.08, 0.30, 0.06], [0.04, 0.20, 0.08], [0.02, 0.14, 0.08] ],
      [ [-0.06, 0.30, 0.06], [-0.04, 0.20, 0.08], [-0.02, 0.14, 0.08] ],
      // Ramificações
      [ [0.01, 0.05, 0.07], [0.10, 0.00, 0.05], [0.14, -0.08, 0.04] ],
      [ [0.01, 0.05, 0.07], [-0.10, 0.00, 0.05], [-0.14, -0.08, 0.04] ],
    ];
    const geos = paths.map(path => {
      const pts = path.map(([x,y,z]) => new THREE.Vector3(x,y,z));
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.006, 5, false);
    });
    return mergeGeometries(geos);
  }, []);
  if (!geo) return null;
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#cc1111" emissive="#cc1111" emissiveIntensity={0.5} roughness={0.4} />
    </mesh>
  );
}

function mergeGeometries(geos) {
  try {
    const { mergeGeometries: mg } = require("three/examples/jsm/utils/BufferGeometryUtils.js");
    return mg(geos);
  } catch {
    return geos[0];
  }
}

// Coluna vertebral
function Spine() {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 0.48, -0.10),
      new THREE.Vector3(0, 0.25, -0.12),
      new THREE.Vector3(0, 0.00, -0.13),
      new THREE.Vector3(0, -0.20, -0.12),
      new THREE.Vector3(0, -0.32, -0.10),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.022, 7, false);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#f0e8d0" emissive="#f0e8d0" emissiveIntensity={0.1} roughness={0.7} />
    </mesh>
  );
}

// ── Cena anatômica completa ──────────────────────────────────────────────────────
function AnatomyScene({ orgaos, sistemaAtivo, onClickSistema, glbUrl, glbOk }) {
  const [interacting, setInteracting] = useState(false);
  const timerRef = useRef(null);
  const bodyGeo = useMemo(() => buildBodyGeometry(), []);

  const onStart = () => { clearTimeout(timerRef.current); setInteracting(true); };
  const onEnd   = () => { timerRef.current = setTimeout(() => setInteracting(false), 3500); };

  return (
    <>
      {/* Iluminação */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#6699ff" />
      <pointLight position={[0, 0, 2]} intensity={0.6} color="#aaddff" />

      {/* Corpo externo — Fresnel azul */}
      <group>
        {glbOk ? <GlbBody url={glbUrl} /> : (
          <>
            <FresnelBody geometry={bodyGeo} />
            <Arm side={1} />
            <Arm side={-1} />
          </>
        )}

        {/* Órgãos internos */}
        <Spine />

        {/* Coração */}
        <Organ position={[0.06, 0.25, 0.09]} scale={[0.065, 0.07, 0.065]} color="#dd1111" emissive="#ff2200" />
        <Organ position={[-0.01, 0.27, 0.08]} scale={[0.055, 0.062, 0.055]} color="#cc1111" emissive="#ff2200" />

        {/* Pulmões */}
        <Organ position={[0.145, 0.26, 0.04]} scale={[0.10, 0.15, 0.07]} color="#f08080" emissive="#ff8080" opacity={0.88} />
        <Organ position={[-0.155, 0.26, 0.04]} scale={[0.09, 0.14, 0.065]} color="#f08080" emissive="#ff8080" opacity={0.88} />

        {/* Fígado */}
        <Organ position={[0.09, 0.08, 0.07]} scale={[0.15, 0.075, 0.10]} color="#c49020" emissive="#d4a022" />

        {/* Estômago */}
        <Organ position={[-0.07, 0.07, 0.07]} scale={[0.075, 0.085, 0.07]} color="#d4b0a0" emissive="#e0c0b0" />

        {/* Rins */}
        <Organ position={[ 0.13, 0.02, -0.05]} scale={[0.055, 0.078, 0.055]} color="#b03322" emissive="#cc4433" />
        <Organ position={[-0.13, 0.02, -0.05]} scale={[0.055, 0.078, 0.055]} color="#b03322" emissive="#cc4433" />

        {/* Intestinos */}
        <IntestineDelgado />
        <IntestineGrosso />

        {/* Bexiga */}
        <Organ position={[0, -0.23, 0.09]} scale={[0.055, 0.065, 0.055]} color="#90b8e0" emissive="#90c0ff" opacity={0.85} />

        {/* Vasos */}
        <BloodVessels />
      </group>

      {/* Hotspots 3D */}
      {orgaos.map(o => <Hotspot3D key={o.id} orgao={o} ativo={sistemaAtivo === o.id} onClick={onClickSistema} />)}

      {/* Bloom glow */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.5} intensity={1.2} radius={0.7} />
      </EffectComposer>

      <OrbitControls
        enablePan={false}
        minDistance={1.6}
        maxDistance={5.5}
        autoRotate={!interacting}
        autoRotateSpeed={1.1}
        onStart={onStart}
        onEnd={onEnd}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
      />
    </>
  );
}

// ── Corpo via GLB (quando disponível) — aplica Fresnel sobre o mesh importado ───
function GlbBody({ url }) {
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
    if (maxDim > 0) scene.scale.multiplyScalar(1.72 / maxDim);
    scene.traverse(obj => {
      if (!obj.isMesh) return;
      obj.material = new THREE.ShaderMaterial({
        vertexShader: fresnelVert,
        fragmentShader: fresnelFrag,
        uniforms: {
          uColor: { value: new THREE.Color(0x1a8fff) },
          uPower: { value: 2.8 },
          uMin:   { value: 0.02 },
          uMax:   { value: 0.88 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
    });
  }, [scene]);
  return <primitive ref={ref} object={scene} />;
}

// ── Hotspot labels 3D ─────────────────────────────────────────────────────────────
const HOTSPOT_POS = {
  neurologico:        [0,     0.73,  0.09],
  endocrino:          [0,     0.52,  0.14],
  cardiovascular:     [0.14,  0.28,  0.16],
  respiratorio:       [-0.20, 0.28,  0.12],
  imunologico:        [-0.24, 0.12,  0.12],
  musculoesqueletico: [0.36,  0.10,  0.10],
  digestivo:          [0.08,  0.02,  0.17],
  renal:              [0.22,  0.00, -0.08],
  reprodutivo:        [0,    -0.25,  0.15],
};

function corScore(s) { return s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444"; }

function Hotspot3D({ orgao, ativo, onClick }) {
  const pos = HOTSPOT_POS[orgao.id];
  if (!pos) return null;
  const cor = corScore(orgao.score);
  const nome = orgao.nome.replace("Músculo-esquelético", "Musculoesq.");
  return (
    <Html position={pos} center distanceFactor={5.5} zIndexRange={[10, 0]}>
      <div onClick={(e) => { e.stopPropagation(); onClick(orgao.id); }}
        style={{
          display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
          background: ativo ? "rgba(255,255,255,0.97)" : "rgba(8,16,32,0.80)",
          border: `2px solid ${cor}`, borderRadius: 20,
          padding: "3px 9px 3px 5px",
          backdropFilter: "blur(8px)",
          boxShadow: ativo ? `0 0 0 3px ${cor}55, 0 4px 14px rgba(0,0,0,0.4)` : "0 2px 8px rgba(0,0,0,0.4)",
          transition: "all 0.15s", userSelect: "none", whiteSpace: "nowrap",
        }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: cor, flexShrink: 0, boxShadow: `0 0 6px ${cor}` }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: ativo ? "#1e293b" : "#f1f5f9" }}>{nome}</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: cor, marginLeft: 2 }}>{orgao.score}</span>
      </div>
    </Html>
  );
}

// ── Error boundary ────────────────────────────────────────────────────────────────
class ErrBoundary extends Component {
  constructor(p) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

// ── Componente principal ──────────────────────────────────────────────────────────
export default function Body3D({ sexo, orgaos, sistemaAtivo, onClickSistema, fallback }) {
  const glbUrl = `/digital-twin/corpo-${sexo === "F" ? "mulher" : "homem"}.glb`;
  const [glbOk, setGlbOk] = useState(false);

  useEffect(() => {
    fetch(glbUrl, { method: "HEAD" })
      .then(r => setGlbOk(r.ok))
      .catch(() => setGlbOk(false));
  }, [glbUrl]);

  return (
    <ErrBoundary fallback={fallback}>
      <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0, background: "transparent" }}>
        <Canvas
          camera={{ position: [0, 0, 2.9], fov: 44 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <AnatomyScene
              orgaos={orgaos}
              sistemaAtivo={sistemaAtivo}
              onClickSistema={onClickSistema}
              glbUrl={glbUrl}
              glbOk={glbOk}
            />
          </Suspense>
        </Canvas>
      </div>
    </ErrBoundary>
  );
}
