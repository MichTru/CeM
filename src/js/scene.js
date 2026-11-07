// Modulo d'arredo su misura: base cucina con anta e cassetti.
// Rovere, laccato opaco e maniglie in ottone. Caricato solo quando serve.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BoxGeometry, CylinderGeometry, PlaneGeometry,
  MeshStandardMaterial, MeshPhysicalMaterial, ShadowMaterial, MeshBasicMaterial, DirectionalLight, HemisphereLight,
  CanvasTexture, SRGBColorSpace, PMREMGenerator, ACESFilmicToneMapping, PCFShadowMap, RepeatWrapping, Vector3, MathUtils,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const W = 1.2;   // larghezza
const H = 0.76;  // altezza del corpo
const D = 0.58;  // profondità
const T = 0.018; // spessore pannelli
const PL = 0.1;  // zoccolo
const GAP = 0.004;

const smooth = (x) => { const t = MathUtils.clamp(x, 0, 1); return t * t * (3 - 2 * t); };

// Venatura del rovere disegnata su canvas
function oakTexture(vertical = false) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, '#9a6d45'); grd.addColorStop(0.5, '#8d623d'); grd.addColorStop(1, '#9c7049');
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 512);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    const y0 = rnd() * 512;
    const amp = 2 + rnd() * 9;
    const freq = 0.002 + rnd() * 0.006;
    const ph = rnd() * 10;
    g.strokeStyle = `rgba(${70 + rnd() * 30},${44 + rnd() * 20},${24 + rnd() * 12},${0.05 + rnd() * 0.16})`;
    g.lineWidth = 0.6 + rnd() * 2.2;
    g.beginPath();
    for (let x = 0; x <= 1024; x += 8) {
      const y = y0 + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 3.1 + ph) * amp * 0.25;
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  // raggi midollari tipici del rovere
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(214,176,128,${0.05 + rnd() * 0.08})`;
    g.fillRect(rnd() * 1024, rnd() * 512, 10 + rnd() * 40, 1 + rnd() * 2);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  if (vertical) { tex.center.set(0.5, 0.5); tex.rotation = Math.PI / 2; }
  tex.anisotropy = 8;
  return tex;
}

function blobTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  r.addColorStop(0, 'rgba(0,0,0,0.75)');
  r.addColorStop(0.55, 'rgba(0,0,0,0.3)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  return new CanvasTexture(c);
}

export function createScene(canvas, { pixelRatio = Math.min(devicePixelRatio || 1, 1.75), preserve = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: preserve, powerPreference: 'high-performance' });
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(30, 1, 0.1, 30);

  // Materiali
  const oak = new MeshPhysicalMaterial({ map: oakTexture(false), roughness: 0.58, clearcoat: 0.18, clearcoatRoughness: 0.6 });
  const oakV = new MeshPhysicalMaterial({ map: oakTexture(true), roughness: 0.58, clearcoat: 0.18, clearcoatRoughness: 0.6 });
  const lacquer = new MeshStandardMaterial({ color: '#cdc2b3', roughness: 0.86, metalness: 0 });
  const lacquerIn = new MeshStandardMaterial({ color: '#b9ad9d', roughness: 0.9 });
  const plinthMat = new MeshStandardMaterial({ color: '#2a201a', roughness: 0.7 });
  const brass = new MeshStandardMaterial({ color: '#c9a06a', metalness: 1, roughness: 0.28 });

  const box = (w, h, d, mat) => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  const module = new Group();
  scene.add(module);
  const parts = []; // { obj, base: Vector3, dir: Vector3 }
  const add = (obj, pos, dir, parent = module) => {
    obj.position.copy(pos);
    parent.add(obj);
    parts.push({ obj, base: pos.clone(), dir: dir.clone() });
    return obj;
  };

  const y0 = PL;
  // Corpo in laccato opaco
  add(box(T, H, D, lacquer), new Vector3(-W / 2 + T / 2, y0 + H / 2, 0), new Vector3(-0.34, 0.02, 0));
  add(box(T, H, D, lacquer), new Vector3(W / 2 - T / 2, y0 + H / 2, 0), new Vector3(0.34, 0.02, 0));
  add(box(W - 2 * T, T, D - 0.02, lacquerIn), new Vector3(0, y0 + T / 2, -0.01), new Vector3(0, -0.14, 0));
  add(box(T, H - T, D - 0.03, lacquerIn), new Vector3(0, y0 + T + (H - T) / 2, -0.015), new Vector3(0, 0.04, -0.16));
  add(box(W / 2 - 1.5 * T, T, D - 0.05), new Vector3(-W / 4, y0 + H * 0.5, -0.02), new Vector3(-0.12, 0.02, 0.2)).material = lacquerIn;
  add(box(W - 0.002, H, 0.008, lacquerIn), new Vector3(0, y0 + H / 2, -D / 2 + 0.004), new Vector3(0, 0, -0.36));
  add(box(W - 0.06, PL, 0.02, plinthMat), new Vector3(0, PL / 2, D / 2 - 0.06), new Vector3(0, -0.24, 0.05));
  // Top in rovere
  add(box(W + 0.02, 0.04, D + 0.03, oak), new Vector3(0, y0 + H + 0.02, 0.015), new Vector3(0, 0.36, 0));

  // Maniglia in ottone: barra con due distanziali
  const handle = (len, vertical) => {
    const g = new Group();
    const bar = new Mesh(new CylinderGeometry(0.0065, 0.0065, len, 24), brass);
    bar.castShadow = true;
    if (!vertical) bar.rotation.z = Math.PI / 2;
    g.add(bar);
    [-1, 1].forEach((s) => {
      const st = new Mesh(new CylinderGeometry(0.004, 0.004, 0.026, 16), brass);
      st.rotation.x = Math.PI / 2;
      st.position.set(vertical ? 0 : s * len * 0.38, vertical ? s * len * 0.38 : 0, -0.013);
      g.add(st);
    });
    return g;
  };

  // Anta a sinistra, incernierata sul bordo esterno
  const zFront = D / 2 + 0.011;
  const doorW = W / 2 - GAP * 1.5;
  const doorH = H - GAP * 2;
  const door = new Group();
  const doorPanel = box(doorW, doorH, 0.02, oakV);
  doorPanel.position.x = doorW / 2;
  door.add(doorPanel);
  const dh = handle(0.18, true);
  dh.position.set(doorW - 0.05, 0.12, 0.024);
  door.add(dh);
  add(door, new Vector3(-W / 2 + GAP, y0 + H / 2, zFront), new Vector3(-0.08, 0, 0.5));
  const handleParts = [{ obj: dh, base: dh.position.clone() }];

  // Tre cassetti a destra
  const drawers = [];
  const dw = W / 2 - GAP * 1.5;
  const dhh = (H - GAP * 4) / 3;
  for (let k = 0; k < 3; k++) {
    const dr = new Group();
    const front = box(dw, dhh, 0.02, oak);
    dr.add(front);
    const depth = D - 0.1;
    const sideH = dhh * 0.62;
    const bottom = box(dw - 0.05, 0.012, depth, lacquerIn);
    bottom.position.set(0, -sideH / 2, -depth / 2 - 0.01);
    dr.add(bottom);
    [-1, 1].forEach((s) => {
      const side = box(0.012, sideH, depth, lacquerIn);
      side.position.set(s * (dw / 2 - 0.03), 0, -depth / 2 - 0.01);
      dr.add(side);
    });
    const back = box(dw - 0.05, sideH, 0.012, lacquerIn);
    back.position.set(0, 0, -depth - 0.01);
    dr.add(back);
    const h = handle(0.16, false);
    h.position.set(0, dhh / 2 - 0.045, 0.024);
    dr.add(h);
    handleParts.push({ obj: h, base: h.position.clone() });
    const y = y0 + H - GAP - dhh / 2 - k * (dhh + GAP);
    add(dr, new Vector3(W / 4 + GAP / 2, y, zFront), new Vector3(0.06, (1 - k) * 0.07, 0.42 + k * 0.08));
    drawers.push(dr);
  }

  // Pavimento: ombre morbide e ombra di contatto
  const floor = new Mesh(new PlaneGeometry(8, 8), new ShadowMaterial({ opacity: 0.32 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const blob = new Mesh(new PlaneGeometry(W * 1.7, D * 2.4), new MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.001;
  scene.add(blob);

  // Luci morbide e calde
  const key = new DirectionalLight('#ffd8ae', 2.4);
  key.position.set(-2.2, 3.4, 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -1.6; key.shadow.camera.right = 1.6;
  key.shadow.camera.top = 1.6; key.shadow.camera.bottom = -1.6;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new DirectionalLight('#ffb98a', 0.9);
  rim.position.set(2.5, 1.6, -2.2);
  scene.add(rim);
  scene.add(new HemisphereLight('#f5e6d3', '#2a1d15', 0.35));

  // Inquadrature
  const VIEWS = {
    scroll: { pos: new Vector3(2.05, 1.45, 3.2), look: new Vector3(-0.12, 0.46, 0) },
    hero: { pos: new Vector3(1.75, 1.0, 2.45), look: new Vector3(-0.62, 0.5, 0) },
    detail: { pos: new Vector3(0.75, 0.82, 0.95), look: new Vector3(0.3, 0.6, 0.29) },
  };
  let view = 'scroll';
  let aspect = 1;
  let progress = 0;

  function place() {
    const v = VIEWS[view];
    camera.position.copy(v.pos);
    if (view === 'scroll') {
      // su schermi stretti la camera si allontana
      const k = aspect < 1 ? 1 + (1 - aspect) * 0.9 : 1;
      camera.position.multiplyScalar(k);
      camera.position.y = v.pos.y * (0.9 + 0.1 * k);
    }
    camera.lookAt(v.look);
  }

  function update(p) {
    // 0–0,25 l'idea · 0,25–0,5 vista esplosa · 0,5–0,75 si riassembla · 0,75–1 ante e cassetti si aprono
    const e = p < 0.5 ? smooth((p - 0.25) / 0.25) : 1 - smooth((p - 0.5) / 0.25);
    const o = smooth((p - 0.76) / 0.22);
    parts.forEach(({ obj, base, dir }) => obj.position.copy(base).addScaledVector(dir, e));
    handleParts.forEach(({ obj, base }) => { obj.position.z = base.z + e * 0.09; });
    door.rotation.y = -o * 1.72;
    drawers.forEach((dr, k) => {
      const ok = smooth((o - k * 0.18) / 0.64);
      dr.position.z += ok * (0.34 - k * 0.06);
    });
    module.rotation.y = view === 'scroll' ? -0.5 + p * 0.55 + e * 0.12 : view === 'hero' ? -0.18 : -0.1;
    module.position.y = e * 0.05;
    if (view === 'scroll') { place(); camera.position.multiplyScalar(1 + e * 0.1); }
  }

  function resize(w, h) {
    aspect = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    place();
    render();
  }

  function render() { renderer.render(scene, camera); }

  return {
    renderer,
    resize,
    render,
    setView(v) { view = v; place(); update(progress); render(); },
    setProgress(p) { progress = p; update(p); render(); },
    dispose() { renderer.dispose(); pmrem.dispose(); },
  };
}
