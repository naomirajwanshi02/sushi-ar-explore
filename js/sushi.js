// Three pieces of nigiri on a cypress serving board, built procedurally in
// centimetres (y up, the board's feet at y = 0), after the trigger painting:
// a sweet omelette tied on with a nori belt, lean tuna, and salmon topped with roe.
//
// Every part is built twice: where it sits on the board (A) and where it floats in
// the exploded view (B). Each piece of nigiri comes apart as a column, layer by
// layer, the way it was built: rice, wasabi (or the nori belt), the topping, and
// the roe on top of the salmon. Rigid parts move as a whole; the roe pearls and
// the rice grains are instanced.

import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import * as TX from './textures.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const Q = (x = 0, y = 0, z = 0, order = 'YXZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, order));
const clamp = THREE.MathUtils.clamp;
const pose = (p, q = new THREE.Quaternion(), s = V(1, 1, 1)) => ({ p, q, s: typeof s === 'number' ? V(s, s, s) : s });

// ------------------------------------------------------------------ sizes (cm)
// A serving board for three pieces is a plank about 21 cm long on two feet; nigiri are about 6–7 cm long,
// 2.5–3 cm wide, on a bed of rice about 2 cm high, with a topping 5–7 mm thick.
const BOARD = { w: 21, h: 1.2, d: 11, footW: 1.8, footH: 1.6, footX: 7.4 };
export const TOP_Y = BOARD.footH + BOARD.h;            // the board's top surface
const RICE = { rx: 1.3, rz: 3.0, h: 2.0, cut: -0.5 };  // a hand-pressed oval mound
RICE.ry = RICE.h / (1 - RICE.cut);
const FISH = { w: 2.9, t: 0.6, d: 7.0 };
const EGG = { w: 3.0, h: 1.6, d: 6.8 };

// ------------------------------------------------------------------ helpers
// A box with rounded edges that stays evenly subdivided, so it can be bent.
function roundedSlab(w, h, d, r, sx, sy, sz, { merge = true, along = 'x' } = {}){
  let g = new THREE.BoxGeometry(w, h, d, sx, sy, sz);
  const p = g.attributes.position, v = V(), inner = V();
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < p.count; i++){
    v.fromBufferAttribute(p, i);
    inner.set(clamp(v.x, -hx, hx), clamp(v.y, -hy, hy), clamp(v.z, -hz, hz));
    v.sub(inner);
    if (v.lengthSq() > 0) v.setLength(r);
    v.add(inner);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  if (merge){
    // smooth normals across the rounded edges; uv from the top view, u running along x or z
    g.deleteAttribute('normal'); g.deleteAttribute('uv');
    g = mergeVertices(g);
    const q = g.attributes.position, uv = new Float32Array(q.count * 2);
    for (let i = 0; i < q.count; i++){
      const ux = q.getX(i) / w + 0.5, uz = q.getZ(i) / d + 0.5;
      uv[i * 2] = along === 'x' ? ux : uz; uv[i * 2 + 1] = along === 'x' ? uz : ux;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  g.computeVertexNormals();
  return g;
}

// the rice mound: a squashed sphere, a little boxy like a hand-pressed bed, with a flat base
const boxy = (yu) => 1 + 0.16 * (1 - Math.abs(yu));
function riceHalfWidth(y){ // half-width of the mound's middle cross-section at height y
  const yu = clamp(y / RICE.ry + RICE.cut, RICE.cut, 1);
  return Math.sqrt(Math.max(0, 1 - yu * yu)) * boxy(yu) * RICE.rx;
}

// ------------------------------------------------------------------ materials
function mats(){
  const M = {};
  M.wood = new THREE.MeshStandardMaterial({ map: TX.woodTexture(), roughness: 0.62, metalness: 0, envMapIntensity: 0.5 });
  M.woodEnd = new THREE.MeshStandardMaterial({ color: '#c99a62', roughness: 0.7, envMapIntensity: 0.4 });
  const rt = TX.riceTexture(); rt.repeat.set(2, 3);
  M.rice = new THREE.MeshStandardMaterial({ map: rt, color: '#ffffff', roughness: 0.74, envMapIntensity: 0.45 });
  M.grain = new THREE.MeshPhysicalMaterial({ color: '#fbf6ea', roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.45, envMapIntensity: 0.5, sheen: 0.2, sheenColor: new THREE.Color('#fff7e6') });
  M.tuna = new THREE.MeshPhysicalMaterial({ map: TX.tunaTexture(), roughness: 0.36, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 0.45, sheen: 0.1, sheenColor: new THREE.Color('#ff8a96') });
  M.salmon = new THREE.MeshPhysicalMaterial({ map: TX.salmonTexture(), roughness: 0.36, clearcoat: 0.65, clearcoatRoughness: 0.25, envMapIntensity: 0.55, sheen: 0.25, sheenColor: new THREE.Color('#ffc09a') });
  M.roe = new THREE.MeshPhysicalMaterial({ color: '#f0441c', roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, transparent: true, opacity: 0.9, emissive: '#7a1400', emissiveIntensity: 0.35, ior: 1.4, envMapIntensity: 0.9 });
  M.yolk = new THREE.MeshStandardMaterial({ color: '#ff8a2a', roughness: 0.3, emissive: '#a33a00', emissiveIntensity: 0.4 });
  const side = TX.omeletteTexture(), top = TX.omeletteTopTexture();
  M.eggSide = new THREE.MeshPhysicalMaterial({ map: side, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.45, sheen: 0.3, sheenColor: new THREE.Color('#fff0b0') });
  M.eggTop = new THREE.MeshPhysicalMaterial({ map: top, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 0.45, sheen: 0.3, sheenColor: new THREE.Color('#fff0b0') });
  const nt = TX.noriTexture(); nt.repeat.set(2, 0.4);
  M.nori = new THREE.MeshStandardMaterial({ map: nt, roughness: 0.6, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.55 });
  M.wasabi = new THREE.MeshStandardMaterial({ color: '#8eab3d', roughness: 0.82, envMapIntensity: 0.4 });
  return M;
}

// ------------------------------------------------------------------ the serving board
function buildBoard(M){
  const g = new THREE.Group();
  const plank = new THREE.Mesh(roundedSlab(BOARD.w, BOARD.h, BOARD.d, 0.3, 40, 3, 16), M.wood);
  plank.position.y = BOARD.footH + BOARD.h / 2;
  g.add(plank);
  for (const s of [-1, 1]){
    const foot = new THREE.Mesh(roundedSlab(BOARD.footW, BOARD.footH + 0.2, BOARD.d - 0.6, 0.2, 4, 3, 12), M.woodEnd);
    foot.position.set(s * BOARD.footX, (BOARD.footH + 0.2) / 2, 0);
    g.add(foot);
  }
  return g;
}

// ------------------------------------------------------------------ rice
function buildRice(M, rand){
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 48, 28);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++){
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = boxy(y);
    p.setXYZ(i, x * k * RICE.rx, (Math.max(y, RICE.cut) - RICE.cut) * RICE.ry, z * k * RICE.rz);
  }
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, M.rice));
  // loose grains over the surface: real grains are about 5 × 2 mm
  const n = 420;
  const grains = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 5), M.grain, n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), spin = new THREE.Quaternion(), s = V(), pt = V(), nrm = V(), up = V(0, 1, 0);
  for (let i = 0; i < n; i++){
    const u = rand() * Math.PI * 2, yu = RICE.cut + 0.06 + rand() * (1 - RICE.cut - 0.06);
    const rr = Math.sqrt(1 - yu * yu), sx = rr * Math.cos(u), sz = rr * Math.sin(u), k = boxy(yu);
    pt.set(sx * k * RICE.rx, (yu - RICE.cut) * RICE.ry, sz * k * RICE.rz);
    nrm.set(sx / RICE.rx, yu / RICE.ry, sz / RICE.rz).normalize();
    pt.addScaledVector(nrm, -0.03);
    q.setFromUnitVectors(up, nrm).multiply(spin.setFromAxisAngle(up, rand() * Math.PI * 2));
    s.set(0.24 + rand() * 0.05, 0.085 + rand() * 0.025, 0.11 + rand() * 0.03);
    grains.setMatrixAt(i, m.compose(pt, q, s));
  }
  g.add(grains);
  return g;
}

// ------------------------------------------------------------------ toppings
// A slice cut at an angle, draped over the rice: thinner at the ends, which hang down.
function buildFish(mat, droop = 0.95){
  const { w, t, d } = FISH;
  const geo = roundedSlab(w, t, d, 0.2, 10, 4, 40, { along: 'z' }); // fat lines run across the slice
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++){
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const u = z / (d / 2);
    const thin = 1 - 0.35 * u * u;
    const drape = -droop * u * u - 0.09 * x * x;
    p.setXYZ(i, x * (1 - 0.06 * Math.abs(u)), y * thin + drape, z + y * 0.6); // slanted cut ends
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = t / 2;   // the slice's underside at the centre sits at y = 0
  const g = new THREE.Group(); g.add(mesh);
  return g;
}

// the rolled omelette: a block of thin layers, browned on top, slightly arched
function buildOmelette(M){
  const { w, h, d } = EGG;
  const geo = roundedSlab(w, h, d, 0.28, 12, 8, 30, { merge: false });
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++){
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const u = z / (d / 2), top = (y + h / 2) / h;
    p.setXYZ(i, x, y - 0.35 * u * u + 0.1 * top * (1 - (x / (w / 2)) ** 2), z);
  }
  geo.computeVertexNormals();
  // BoxGeometry faces: +x, −x, +y (top), −y, +z, −z
  const mesh = new THREE.Mesh(geo, [M.eggSide, M.eggSide, M.eggTop, M.eggSide, M.eggSide, M.eggSide]);
  mesh.position.y = h / 2;
  const g = new THREE.Group(); g.add(mesh);
  return g;
}

// a dab of grated wasabi
function buildWasabi(M, rand){
  const geo = new THREE.SphereGeometry(1, 28, 14);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++){
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + 0.08 * Math.sin(x * 9 + z * 5) + 0.05 * (rand() - 0.5);
    p.setXYZ(i, x * 0.6 * k, (Math.max(y, -0.25) + 0.25) * 0.3 * k, z * 0.95 * k);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, M.wasabi);
  const g = new THREE.Group(); g.add(mesh);
  return g;
}

// the nori belt: a strip of seaweed around the omelette and the rice, across the middle
function buildBelt(M){
  const width = 1.1, gap = 0.04;
  const top = RICE.h + EGG.h + gap, half = EGG.w / 2 + gap, cr = 0.4;
  // one side of the loop, from the middle of the underside up to the middle of the top
  const side = [];
  const flat = riceHalfWidth(0) * 0.92;
  for (let i = 0; i <= 6; i++) side.push([flat * i / 6, -0.06]);
  // over the rice it stands off a little more, clear of the loose grains on the surface
  for (let i = 1; i <= 16; i++){ const y = RICE.h * i / 16; side.push([riceHalfWidth(y) + 0.16, y]); }
  side.push([half, RICE.h + 0.05]);
  for (let i = 0; i <= 8; i++){ const a = (i / 8) * Math.PI / 2; side.push([half - cr + Math.cos(a) * cr, top - cr + Math.sin(a) * cr]); }
  for (let i = 1; i <= 6; i++) side.push([(half - cr) * (1 - i / 6), top]);
  const loop = [...side.map(([x, y]) => V(x, y, 0)), ...side.slice(1, -1).reverse().map(([x, y]) => V(-x, y, 0))];
  const curve = new THREE.CatmullRomCurve3(loop, true, 'centripetal');
  const pts = curve.getSpacedPoints(160);
  const n = pts.length - 1;
  const pos = [], uv = [], idx = [];
  let len = 0;
  for (let i = 0; i <= n; i++){
    if (i) len += pts[i].distanceTo(pts[i - 1]);
    for (const s of [-1, 1]){ pos.push(pts[i].x, pts[i].y, s * width / 2); uv.push(len / 3, (s + 1) / 2); }
  }
  for (let i = 0; i < n; i++){ const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const g = new THREE.Group(); g.add(new THREE.Mesh(geo, M.nori));
  return g;
}

// ------------------------------------------------------------------ assembly
export function buildSushi(){
  const rand = TX.rng(7);
  const M = mats();
  const model = new THREE.Group();
  model.name = 'sushi';
  const parts = {};
  const rigid = [], inst = [];

  const part = (id, delay) => {
    const root = new THREE.Group();
    root.userData.part = id;
    model.add(root);
    parts[id] = { id, root, delay, pin: V(), focus: 0, thumb: null };
    return parts[id];
  };
  const addRigid = (pt, obj, A, B) => { pt.root.add(obj); rigid.push({ pt, obj, A, B }); };

  // where each piece sits on the board: long side across, in a row from front-left to
  // back-right like the painting (local x across a piece, local z along it)
  const YAW = Math.PI / 2 + 0.12;
  const N = {
    egg: { p: V(-4.4, TOP_Y, 3.2), yaw: YAW },
    tuna: { p: V(0, TOP_Y, 0), yaw: YAW },
    salmon: { p: V(4.4, TOP_Y, -3.2), yaw: YAW },
  };
  // apart: three columns side by side over the board
  const E = {
    egg: { p: V(-7.8, TOP_Y, 1.0), yaw: Math.PI / 2 },
    tuna: { p: V(0, TOP_Y, 0), yaw: Math.PI / 2 },
    salmon: { p: V(7.8, TOP_Y, -1.0), yaw: Math.PI / 2 },
  };
  const at = (f, lp, lq = new THREE.Quaternion(), lift = 0) => {
    const q = Q(0, f.yaw, 0);
    return pose(lp.clone().applyQuaternion(q).add(f.p).add(V(0, lift, 0)), q.multiply(lq));
  };
  const SHOW = Q(0, 0, 0.38);            // apart, a topping tips its top toward you
  const UP = { rice: 2.4, mid: 6.0, top: 9.6, roe: 13.6 };
  const fishY = RICE.h - 0.06;
  const pinAt = (k, y) => V(E[k].p.x, TOP_Y + y, E[k].p.z);

  // 1 · the board: stays put
  const board = part('board', 0);
  board.root.add(buildBoard(M));
  board.pin.set(0, TOP_Y, 0);

  // 2 · rice: three hand-pressed beds, lifting off the board
  const rice = part('rice', 0.02);
  for (const k of ['egg', 'tuna', 'salmon']){
    if (k === 'tuna') rice.thumb = rice.root.children.length; // the tray shows one bed
    addRigid(rice, buildRice(M, rand), at(N[k], V()), at(E[k], V(), Q(0, 0, 0.12), UP.rice));
  }
  rice.pin.copy(pinAt('tuna', UP.rice + 1));

  // 3 · wasabi: a dab on the rice under the tuna and the salmon
  const wasabi = part('wasabi', 0.1);
  wasabi.thumb = 0;
  for (const k of ['tuna', 'salmon']){
    addRigid(wasabi, buildWasabi(M, rand), at(N[k], V(0, RICE.h - 0.14, 0)), at(E[k], V(), SHOW, UP.mid + 0.6));
  }
  wasabi.pin.copy(pinAt('tuna', UP.mid + 0.8)).lerp(pinAt('salmon', UP.mid + 0.8), 0.5);

  // 4 · the nori belt around the omelette and its rice
  const nori = part('nori', 0.12);
  // apart it turns to face you, so you see the loop it makes
  addRigid(nori, buildBelt(M), at(N.egg, V()), at(E.egg, V(), Q(0.2, -1.25, 0), UP.mid - 1.4));
  nori.pin.copy(pinAt('egg', UP.mid + 1.5));

  // 5 · the sweet rolled omelette
  const omelette = part('omelette', 0.2);
  addRigid(omelette, buildOmelette(M), at(N.egg, V(0, RICE.h - 0.05, 0)), at(E.egg, V(), SHOW, UP.top + 0.4));
  omelette.pin.copy(pinAt('egg', UP.top + 0.8));

  // 6 · lean tuna
  const tuna = part('tuna', 0.24);
  addRigid(tuna, buildFish(M.tuna, 1.0), at(N.tuna, V(0, fishY, 0)), at(E.tuna, V(), SHOW, UP.top + 0.6));
  tuna.pin.copy(pinAt('tuna', UP.top + 1));

  // 7 · salmon
  const salmon = part('salmon', 0.28);
  addRigid(salmon, buildFish(M.salmon, 0.9), at(N.salmon, V(0, fishY, 0)), at(E.salmon, V(), SHOW, UP.top + 0.6));
  salmon.pin.copy(pinAt('salmon', UP.top + 1));

  // 8 · salmon roe: a little heap of pearls on the salmon; a loose ring of pearls when apart
  const roe = part('roe', 0.38);
  const pearls = 11, R = 0.34;
  const heap = [[0, 0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * 0.66, 0, Math.sin(i * Math.PI / 3) * 0.66]),
    [0.33, 0.52, 0.2], [-0.35, 0.5, -0.12], [0.05, 0.5, -0.5], [0, 0.95, 0.05]];
  const roeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 24, 16), M.roe, pearls);
  const yolks = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), M.yolk, pearls);
  const rA = [], rB = [], yA = [], yB = [];
  const salmonTop = fishY + FISH.t;
  for (let i = 0; i < pearls; i++){
    const [hx, hy, hz] = heap[i];
    const s = R * (0.92 + rand() * 0.16);
    const a = at(N.salmon, V(hx, salmonTop + s * 0.85 + hy, hz + 0.2));
    const ang = (i / pearls) * Math.PI * 2;
    const b = at(E.salmon, V(Math.sin(ang) * 1.1, Math.cos(ang) * 0.5, Math.cos(ang) * 1.7), undefined, UP.roe + (i % 3) * 0.3);
    rA.push(pose(a.p, a.q, s)); rB.push(pose(b.p, b.q, s * 1.25));
    // the darker eye inside each pearl, a little off-centre toward its top
    yA.push(pose(a.p.clone().add(V(0, s * 0.2, 0)), a.q, s * 0.32)); yB.push(pose(b.p.clone().add(V(0, s * 0.25, 0)), b.q, s * 0.4));
  }
  roe.root.add(yolks, roeMesh);
  inst.push({ pt: roe, mesh: roeMesh, A: rA, B: rB }, { pt: roe, mesh: yolks, A: yA, B: yB });
  roe.pin.copy(pinAt('salmon', UP.roe + 0.5));

  // set every part to rest
  for (const r of rigid){ r.obj.position.copy(r.A.p); r.obj.quaternion.copy(r.A.q); r.obj.scale.copy(r.A.s); }
  const tmp = new THREE.Matrix4(), tp = V(), tq = new THREE.Quaternion(), ts = V();
  for (const I of inst){
    I.A.forEach((a, k) => I.mesh.setMatrixAt(k, tmp.compose(a.p, a.q, a.s)));
    I.mesh.instanceMatrix.needsUpdate = true;
    // instanced bounds must cover both poses
    const box = new THREE.Box3();
    for (const P of [...I.A, ...I.B]) box.expandByPoint(P.p);
    I.mesh.boundingSphere = box.getBoundingSphere(new THREE.Sphere()); I.mesh.boundingSphere.radius += 1;
  }

  const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  const progress = (pt, u) => ease(clamp((u - pt.delay) / 0.56, 0, 1));

  // u: 0 = on the board, 1 = apart. Pieces hold still once apart (no bobbing).
  function setExplode(u){
    for (const r of rigid){
      const k = progress(r.pt, u);
      r.obj.position.lerpVectors(r.A.p, r.B.p, k);
      r.obj.position.z += Math.sin(k * Math.PI) * 1.2;   // a small arc toward you on the way up
      r.obj.quaternion.slerpQuaternions(r.A.q, r.B.q, k);
      r.obj.scale.lerpVectors(r.A.s, r.B.s, k);
    }
    for (const I of inst){
      const k = progress(I.pt, u);
      for (let i = 0; i < I.A.length; i++){
        tp.lerpVectors(I.A[i].p, I.B[i].p, k); tq.slerpQuaternions(I.A[i].q, I.B[i].q, k); ts.lerpVectors(I.A[i].s, I.B[i].s, k);
        I.mesh.setMatrixAt(i, tmp.compose(tp, tq, ts));
      }
      I.mesh.instanceMatrix.needsUpdate = true;
    }
    // the picked part grows a little and comes toward you
    for (const id in parts){
      const pt = parts[id];
      const k = id === 'board' ? 1 : progress(pt, u);
      const s = 1 + 0.08 * pt.focus;
      const pv = pt.pin;
      pt.root.scale.setScalar(s);
      pt.root.position.set(pv.x * (1 - s), pv.y * (1 - s), pv.z * (1 - s) + 1.4 * pt.focus * k);
    }
  }
  setExplode(0);

  return { model, parts, setExplode, materials: M };
}
