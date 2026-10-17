import * as THREE from 'three';

const FLAVORS = [
  { name: 'Cola Blast', desc: 'Classic bold fizz', color: '#c4161c' },
  { name: 'Orange Zing', desc: 'Sun-ripened citrus', color: '#ff8a00' },
  { name: 'Lemon Ice', desc: 'Sharp, bright, cool', color: '#d8e83a' },
  { name: 'Mango Wave', desc: 'Tropical & smooth', color: '#ffb300' },
  { name: 'Blue Frost', desc: 'Arctic berry chill', color: '#1e90ff' },
];

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 700px)');
let flavor = FLAVORS[4];

// ---------- UI ----------
const cards = document.getElementById('cards');
FLAVORS.forEach((f, i) => {
  const b = document.createElement('button');
  b.className = 'card' + (f === flavor ? ' active' : '');
  b.style.setProperty('--c', f.color);
  b.innerHTML = `<i></i><b>${f.name}</b><small>${f.desc}</small>`;
  b.addEventListener('click', () => {
    flavor = f;
    cards.querySelectorAll('.card').forEach((c) => c.classList.remove('active'));
    b.classList.add('active');
    targetColor.set(f.color);
    pop = 1;
  });
  cards.appendChild(b);
});
document.getElementById('yr').textContent = new Date().getFullYear();
document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('status').textContent = 'Thanks! We\u2019ll be in touch soon. (Demo form – connect a backend to deliver messages.)';
  e.target.reset();
});

// ---------- 3D ----------
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 0, 9);

scene.add(new THREE.AmbientLight(0xbfdfff, 0.8));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(4, 5, 6);
scene.add(key);
const rim = new THREE.PointLight(0x66ccff, 40, 30);
rim.position.set(-5, 2, -3);
scene.add(rim);

// Can
const targetColor = new THREE.Color(flavor.color);
const bodyMat = new THREE.MeshStandardMaterial({ color: targetColor.clone(), metalness: 0.85, roughness: 0.25 });
const metal = new THREE.MeshStandardMaterial({ color: 0xdfe6ee, metalness: 1, roughness: 0.2 });
const can = new THREE.Group();
const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3.2, 48), bodyMat);
const top = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 1, 0.25, 48), metal);
top.position.y = 1.72;
const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.06, 48), metal);
lid.position.y = 1.87;
const bottom = top.clone();
bottom.rotation.x = Math.PI;
bottom.position.y = -1.72;
const tab = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 24), metal);
tab.rotation.x = Math.PI / 2;
tab.position.set(0.25, 1.92, 0);
const band = new THREE.Mesh(
  new THREE.CylinderGeometry(1.01, 1.01, 0.9, 48, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.4, transparent: true, opacity: 0.9 })
);
const logoCanvas = document.createElement('canvas');
logoCanvas.width = 512; logoCanvas.height = 256;
const g = logoCanvas.getContext('2d');
g.fillStyle = '#fff'; g.fillRect(0, 0, 512, 256);
g.fillStyle = '#0a2a55'; g.font = '900 120px system-ui,sans-serif';
g.textAlign = 'center'; g.textBaseline = 'middle';
g.fillText('JING', 256, 120);
g.font = '700 34px system-ui,sans-serif';
g.fillText('COLD DRINKS', 256, 205);
const logoTex = new THREE.CanvasTexture(logoCanvas);
logoTex.colorSpace = THREE.SRGBColorSpace;
band.material.map = logoTex;
can.add(body, top, lid, bottom, tab, band);
scene.add(can);

// Bubbles (Points)
const BUBBLES = mobile.matches ? 120 : 260;
const bPos = new Float32Array(BUBBLES * 3);
const bSpeed = new Float32Array(BUBBLES);
const spawn = (i, anywhere) => {
  bPos[i * 3] = (Math.random() - 0.5) * 16;
  bPos[i * 3 + 1] = anywhere ? (Math.random() - 0.5) * 14 : -7;
  bPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
  bSpeed[i] = 0.3 + Math.random() * 0.9;
};
for (let i = 0; i < BUBBLES; i++) spawn(i, true);
const bGeo = new THREE.BufferGeometry();
bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
const bc = document.createElement('canvas');
bc.width = bc.height = 64;
const bg = bc.getContext('2d');
const grad = bg.createRadialGradient(24, 24, 2, 32, 32, 30);
grad.addColorStop(0, 'rgba(255,255,255,.9)');
grad.addColorStop(0.7, 'rgba(160,220,255,.15)');
grad.addColorStop(1, 'rgba(200,240,255,.6)');
bg.fillStyle = grad;
bg.beginPath(); bg.arc(32, 32, 30, 0, 7); bg.fill();
const bubbles = new THREE.Points(bGeo, new THREE.PointsMaterial({
  size: 0.22, map: new THREE.CanvasTexture(bc), transparent: true, depthWrite: false, opacity: 0.8,
}));
scene.add(bubbles);

// Ice cubes
const ice = [];
const iceMat = new THREE.MeshPhysicalMaterial({
  color: 0xcff1ff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0, clearcoat: 1,
});
const iceGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
for (let i = 0; i < (mobile.matches ? 6 : 10); i++) {
  const m = new THREE.Mesh(iceGeo, iceMat);
  const a = (i / 10) * Math.PI * 2;
  m.userData = { a, r: 3 + Math.random() * 2, y: (Math.random() - 0.5) * 5, s: 0.5 + Math.random() * 0.7, sp: 0.2 + Math.random() * 0.3 };
  m.scale.setScalar(m.userData.s);
  ice.push(m);
  scene.add(m);
}

// Interaction
let scrollP = 0, mx = 0, my = 0, pop = 0;
addEventListener('pointermove', (e) => {
  mx = (e.clientX / innerWidth - 0.5) * 2;
  my = (e.clientY / innerHeight - 0.5) * 2;
});
const updateScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  scrollP = max > 0 ? scrollY / max : 0;
};
addEventListener('scroll', updateScroll, { passive: true });

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize(); updateScroll();

let visible = true;
document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) { last = performance.now(); loop(last); } });

let last = performance.now(), t = 0;
function loop(now) {
  if (!visible) return;
  requestAnimationFrame(loop);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (!reduceMotion) t += dt;

  bodyMat.color.lerp(targetColor, 0.08);
  pop *= 0.92;

  // can: moves from right (hero) to left (about) to center (contact) as you scroll
  const side = mobile.matches ? 0 : 1;
  const x = side * 2.6 * Math.cos(scrollP * Math.PI * 1.5) * (1 - scrollP * 0.3);
  can.position.x += (x + mx * 0.3 - can.position.x) * 0.06;
  can.position.y = Math.sin(t * 1.4) * 0.2 - scrollP * 0.8 + (mobile.matches ? 1.2 : 0);
  can.rotation.y = t * 0.8 + scrollP * Math.PI * 4;
  can.rotation.z = 0.25 + Math.sin(t) * 0.05 + my * 0.1;
  can.rotation.x = my * 0.15;
  can.scale.setScalar((mobile.matches ? 0.75 : 1) * (1 + pop * 0.25));

  const p = bGeo.attributes.position;
  for (let i = 0; i < BUBBLES; i++) {
    bPos[i * 3 + 1] += bSpeed[i] * dt * (1 + scrollP * 2);
    bPos[i * 3] += Math.sin(t * 2 + i) * 0.003;
    if (bPos[i * 3 + 1] > 7) spawn(i, false);
  }
  p.needsUpdate = true;
  bubbles.position.y = -scrollP * 2;

  ice.forEach((m) => {
    const d = m.userData, a = d.a + t * d.sp;
    m.position.set(Math.cos(a) * d.r, d.y + Math.sin(t + d.a) * 0.4 - scrollP * 3, Math.sin(a) * d.r - 2);
    m.rotation.x = t * d.sp * 2;
    m.rotation.y = t * d.sp * 1.5;
  });

  renderer.render(scene, camera);
}
loop(performance.now());
