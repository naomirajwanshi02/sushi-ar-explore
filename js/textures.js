// Painted canvas textures for the sushi: the cypress serving board, rice, lean
// tuna, salmon, the layered omelette and nori. Everything is drawn once at load,
// procedurally, so the app ships no image files for the models.

import * as THREE from 'three';

export function rng(seed = 1){
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

function canvas(w, h){
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
function tex(c, { srgb = true, repeat = false, aniso = 8 } = {}){
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat){ t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}
function speckle(g, w, h, n, colours, rMin, rMax, alpha, rand){
  for (let i = 0; i < n; i++){
    g.globalAlpha = alpha * (0.4 + rand() * 0.6);
    g.fillStyle = colours[(rand() * colours.length) | 0];
    const r = rMin + rand() * (rMax - rMin);
    g.beginPath(); g.ellipse(rand() * w, rand() * h, r, r * (0.6 + rand() * 0.6), rand() * 3, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
}

// ------------------------------------------------------------------ cypress board
// Pale straight-grained wood: long grain lines along u, a few darker growth rings.
export function woodTexture(seed = 5){
  const W = 2048, H = 512;
  const [c, g] = canvas(W, H);
  const rand = rng(seed);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#e2bf8a'); grad.addColorStop(0.5, '#d9b27a'); grad.addColorStop(1, '#e0bc86');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  // grain: long, slightly wandering lines
  for (let i = 0; i < 150; i++){
    const y0 = rand() * H, amp = 2 + rand() * 9, f = 0.002 + rand() * 0.004, ph = rand() * 6;
    const dark = rand() < 0.35;
    g.strokeStyle = dark ? `rgba(150,98,52,${0.18 + rand() * 0.22})` : `rgba(255,236,200,${0.12 + rand() * 0.18})`;
    g.lineWidth = dark ? 1 + rand() * 2.6 : 1 + rand() * 4;
    g.beginPath();
    for (let x = 0; x <= W; x += 16){
      const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1 + ph * 2) * amp * 0.3;
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }
  speckle(g, W, H, 400, ['#b88a55', '#c99c66'], 1, 3, 0.35, rand);
  return tex(c, { repeat: true });
}

// ------------------------------------------------------------------ rice
export function riceTexture(seed = 9){
  const S = 512;
  const [c, g] = canvas(S, S);
  const rand = rng(seed);
  g.fillStyle = '#eee6d6'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 1100; i++){
    const x = rand() * S, y = rand() * S, a = rand() * Math.PI;
    const rx = 9 + rand() * 6, ry = 4 + rand() * 2.5;
    for (const [dx, dy] of [[0, 0], [S, 0], [-S, 0], [0, S], [0, -S]]){
      g.save(); g.translate(x + dx, y + dy); g.rotate(a);
      g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      g.fillStyle = `hsl(40, ${22 + rand() * 18}%, ${90 + rand() * 7}%)`; g.fill();
      g.strokeStyle = 'rgba(150,125,95,0.28)'; g.lineWidth = 1.2; g.stroke();
      g.restore();
    }
  }
  return tex(c, { repeat: true });
}

// ------------------------------------------------------------------ lean tuna
// Deep red with lighter flecks (as in the painting) and faint pale sinew lines.
export function tunaTexture(seed = 11){
  const W = 1024, H = 512;
  const [c, g] = canvas(W, H);
  const rand = rng(seed);
  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#8f1124'); grad.addColorStop(0.5, '#a0172b'); grad.addColorStop(1, '#8a1022');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  speckle(g, W, H, 900, ['#b2263b', '#7e0c1d', '#bb3248'], 6, 30, 0.35, rand);
  // faint sinew lines running across the slice
  for (let i = -4; i < 22; i++){
    const x0 = i * 52 + rand() * 20;
    g.strokeStyle = `rgba(255,190,198,${0.10 + rand() * 0.12})`; g.lineWidth = 2 + rand() * 4;
    g.beginPath(); g.moveTo(x0, -10); g.bezierCurveTo(x0 + 60, H * 0.3, x0 + 20, H * 0.7, x0 + 90, H + 10); g.stroke();
  }
  // the pink flecks of the painting
  speckle(g, W, H, 220, ['#e58b96', '#eeaab2'], 1.5, 3.5, 0.6, rand);
  return tex(c);
}

// ------------------------------------------------------------------ salmon
export function salmonTexture(seed = 13){
  const W = 1024, H = 512;
  const [c, g] = canvas(W, H);
  const rand = rng(seed);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#f07a3c'); grad.addColorStop(0.5, '#ea6a2c'); grad.addColorStop(1, '#f2853f');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  speckle(g, W, H, 500, ['#f59055', '#e2602a'], 8, 30, 0.3, rand);
  // curved white bands of fat
  for (let i = -6; i < 18; i++){
    const x0 = i * 64 + rand() * 12;
    g.strokeStyle = `rgba(255,222,196,${0.62 + rand() * 0.22})`; g.lineWidth = 7 + rand() * 6;
    g.beginPath(); g.moveTo(x0, -10); g.bezierCurveTo(x0 + 70, H * 0.3, x0 + 30, H * 0.7, x0 + 110, H + 10); g.stroke();
    g.strokeStyle = 'rgba(255,240,226,0.35)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0 + 22, -10); g.bezierCurveTo(x0 + 92, H * 0.3, x0 + 52, H * 0.7, x0 + 132, H + 10); g.stroke();
  }
  return tex(c);
}

// ------------------------------------------------------------------ rolled omelette
// v runs from the bottom (0) to the top (1) of the block: thin cooked layers, each
// with a faint golden seam, and a browned top; u adds soft streaks along the block.
export function omeletteTexture(seed = 17){
  const W = 512, H = 512;
  const [c, g] = canvas(W, H);
  const rand = rng(seed);
  const layers = 7;
  for (let i = 0; i < layers; i++){
    const y0 = H - (i + 1) * H / layers, h = H / layers;
    g.fillStyle = `hsl(${44 + rand() * 4}, ${86 + rand() * 8}%, ${66 + rand() * 6}%)`;
    g.fillRect(0, y0, W, h + 1);
    g.fillStyle = 'rgba(214,140,40,0.55)';
    g.fillRect(0, y0, W, 3 + rand() * 2);   // the seam where two layers were rolled together
  }
  // browned top and bottom where they touched the pan
  const top = g.createLinearGradient(0, 0, 0, H * 0.16);
  top.addColorStop(0, 'rgba(214,128,34,0.85)'); top.addColorStop(1, 'rgba(214,128,34,0)');
  g.fillStyle = top; g.fillRect(0, 0, W, H * 0.16);
  const bot = g.createLinearGradient(0, H, 0, H * 0.9);
  bot.addColorStop(0, 'rgba(214,140,40,0.5)'); bot.addColorStop(1, 'rgba(214,140,40,0)');
  g.fillStyle = bot; g.fillRect(0, H * 0.9, W, H * 0.1);
  speckle(g, W, H, 300, ['#f8d36a', '#f2b544'], 3, 14, 0.3, rand);
  return tex(c);
}
// the browned top of the omelette, seen from above: golden with the orange swirl lines of the painting
export function omeletteTopTexture(seed = 19){
  const W = 512, H = 1024;
  const [c, g] = canvas(W, H);
  const rand = rng(seed);
  g.fillStyle = '#f6c552'; g.fillRect(0, 0, W, H);
  speckle(g, W, H, 500, ['#f2b23c', '#f9d777', '#eaa230'], 10, 40, 0.35, rand);
  for (let i = 0; i < 9; i++){
    g.strokeStyle = `rgba(228,128,34,${0.45 + rand() * 0.3})`; g.lineWidth = 5 + rand() * 5; g.lineCap = 'round';
    const x = 60 + rand() * (W - 120), y = 80 + rand() * (H - 160);
    g.beginPath(); g.moveTo(x - 90, y + 20); g.quadraticCurveTo(x, y - 40 - rand() * 30, x + 90, y + 10); g.stroke();
  }
  return tex(c);
}

// ------------------------------------------------------------------ nori
export function noriTexture(seed = 2){
  const S = 512;
  const [c, g] = canvas(S, S);
  g.fillStyle = '#1b2116'; g.fillRect(0, 0, S, S);
  const rand = rng(seed);
  speckle(g, S, S, 500, ['#2c3a22', '#3a4a26', '#232c1b', '#4a5a2c'], 4, 26, 0.55, rand);
  for (let i = 0; i < 260; i++){
    g.strokeStyle = `rgba(${90 + rand() * 40 | 0},${110 + rand() * 40 | 0},${50 + rand() * 30 | 0},${0.12 + rand() * 0.2})`;
    g.lineWidth = 1 + rand() * 3;
    const x = rand() * S, y = rand() * S, a = rand() * Math.PI;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20 + 8, x + Math.cos(a) * 40, y + Math.sin(a) * 40); g.stroke();
  }
  speckle(g, S, S, 120, ['#0d110b'], 1, 4, 0.6, rand);
  return tex(c, { repeat: true });
}
