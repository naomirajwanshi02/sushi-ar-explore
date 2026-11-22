// Anatomy of Sushi, in the same order as the other NomAR explorers:
//   0 · allow the camera → 1 · scan the sushi picture (once) → 2 · instructions → Start
//   → tap the sushi and it comes apart, layer by layer → tap a part for one line about it.
// After the scan the picture is never needed again: the sushi floats over the camera,
// steady in front of you; on Android, Start sets it down on a table with room
// tracking (WebXR) so you can walk round it.
//
// Every ✕ goes back to the Scan to Explore scanning page, the hub this experience is linked under.
// ?demo=1     the hub has already recognised the picture, so the scan is skipped
//             (no button for this on screen)
// ?preview=1  development only: no camera, a lit backdrop
// ?card=1     float over the camera even where room tracking works
// ?apart=1    open already apart      ?part=<id>  open with that part picked

import { PARTS, BY_ID, SUSHI_INFO } from './data.js';
import * as Stage from './stage.js';

const HUB = 'https://naomirajwanshi02.github.io/Scan_To_Explore/';
const $ = (id) => document.getElementById(id);
const q = new URLSearchParams(location.search);
const S = { phase: 'perm', part: null, hintTimer: 0, xr: false, mode: null, placing: false, ringSeen: false };

const overlay = (id, on) => $(id).classList.toggle('on', on);
const show = (id) => document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('on', s.id === id));
let toastT = 0;
function toast(html, ms = 3200){
  const t = $('toast');
  t.innerHTML = html; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms);
}
const buzz = (ms) => { try { if (navigator.userActivation?.hasBeenActive !== false) navigator.vibrate?.(ms); } catch { /* none */ } };
function fail(err){
  console.error(err);
  $('errText').textContent = String(err?.stack || err?.message || err);
  $('err').hidden = false;
}

// ------------------------------------------------------------ build the sushi (once)
let thumbs = {};
show('perm');
await new Promise((ok) => setTimeout(ok, 60)); // let the first plate paint
try {
  thumbs = Stage.init($('ar'), { onTap, onEnd, onPlacing, onFound, band });
} catch (e) { fail(e); }
$('introSushi').src = thumbs.whole || '';
buildTray();
S.xr = q.get('card') !== '1' && await Stage.xrSupported();
if (S.xr) $('stepMove').innerHTML = '<u>Turn:</u> walk round it';
$('permBtn').disabled = false;
$('permStatus').textContent = '';

// ------------------------------------------------------------ 0 · camera permission
async function cameraGranted(){
  try { return (await navigator.permissions?.query({ name: 'camera' }))?.state === 'granted'; } catch { return false; }
}
async function openPerm(){
  S.phase = 'perm';
  if (await cameraGranted()) return afterPermission();
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia){
    $('permStatus').textContent = 'This browser cannot use the camera here. Open the page over https in Safari or Chrome.';
    $('permBtn').disabled = true;
    return;
  }
  show('perm');
}
async function askCamera(){
  $('permBtn').disabled = true;
  $('permStatus').textContent = 'Waiting for you to tap “Allow”…';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    stream.getTracks().forEach((t) => t.stop());
    $('permStatus').textContent = '';
    afterPermission();
  } catch (err) {
    console.error(err);
    $('permStatus').textContent = err?.name === 'NotAllowedError'
      ? 'The camera was blocked. Tap the “aA” or lock icon next to the address, allow the camera for this site, then tap Allow camera again.'
      : 'The camera did not start. Close other apps that use the camera and try again.';
  } finally { $('permBtn').disabled = false; }
}
// the hub has already found the picture: go straight to the instructions over the camera
async function afterPermission(){
  if (!q.has('demo')) return openScan();
  show(null);
  try { await Stage.startFloat(); }
  catch (e){ console.error(e); }
  openIntro();
}

// ------------------------------------------------------------ 1 · scan the picture (once)
async function openScan(){
  S.phase = 'scan';
  show(null); overlay('hud', false); overlay('guide', true);
  $('scanRetry').hidden = true;
  $('scanStatus').textContent = 'Starting camera…';
  try {
    await Stage.scanPicture({ onStatus: (t) => { if (S.phase === 'scan') $('scanStatus').textContent = t; } });
  } catch (err) {
    console.error(err);
    const msg = String(err?.message || err?.name || err || '');
    $('scanStatus').textContent = /mind|fetch|404/i.test(msg) ? `Could not load the picture data (${msg}).`
      : 'Camera not available. Allow camera access for this site, then tap Try again.';
    $('scanRetry').hidden = false;
  }
}
// found: the sushi is already floating over the camera; the instructions come up over it
function onFound(){
  if (S.phase !== 'scan') return;
  S.phase = 'found';
  overlay('guide', false);
  buzz(40);
  overlay('found', true);
  setTimeout(() => { overlay('found', false); openIntro(); }, 1300);
}

// ------------------------------------------------------------ 2 · instructions → Start
function openIntro(){
  S.phase = 'intro';
  $('goBtn').disabled = false; $('camStatus').textContent = '';
  overlay('hud', false);
  show('intro');
}
function start(){
  $('camStatus').textContent = '';
  if (S.xr){
    // room tracking: requestSession must run inside this tap, before anything is awaited
    $('goBtn').disabled = true;
    Stage.startXR().then(() => enter('xr')).catch((err) => {
      console.error(err);
      S.xr = false;
      $('stepMove').innerHTML = '<u>Turn:</u> drag one finger';
      $('camStatus').textContent = 'Room tracking did not start here. The sushi will float over the camera instead.';
      Stage.startFloat().then(() => { $('goBtn').disabled = false; }).catch((e) => { $('goBtn').disabled = false; $('camStatus').textContent = 'The camera did not start. Close other apps that use the camera and try again.'; console.error(e); });
    });
    return;
  }
  if (Stage.mode() !== 'float'){
    $('goBtn').disabled = true;
    Stage.startFloat().then(() => enter('float')).catch((e) => { console.error(e); $('goBtn').disabled = false; $('camStatus').textContent = 'The camera did not start. Close other apps that use the camera and try again.'; });
    return;
  }
  Stage.recentre();
  enter('float');
}

function enter(mode){
  S.mode = mode; S.phase = 'view';
  $('goBtn').disabled = false;
  document.body.classList.toggle('preview', mode === 'preview');
  document.body.classList.toggle('mode-xr', mode === 'xr');
  document.body.classList.toggle('mode-float', mode === 'float');
  show(null);
  overlay('hud', true);
  setApart(false, true);
  setCard(null);
  if (q.get('apart') === '1' || BY_ID[q.get('part')]) setApart(true, true);
  if (BY_ID[q.get('part')]) pick(q.get('part'), { quiet: true });
  setHint();
  hintLoop();
}

// XR: looking for a surface, then set down
function onPlacing(placing, ringSeen){
  S.placing = placing; S.ringSeen = ringSeen;
  document.body.classList.toggle('placing', placing);
  if (!placing) toast('The sushi is on the table. <b>Walk round it</b> to see every side.', 3800);
  setHint();
}
// the room-tracking session ended (system back gesture): back to the instructions
function onEnd(){
  if (S.phase !== 'view') return;
  leaveView();
  S.xr = true;
  openIntro();
}

// ------------------------------------------------------------ 3 · the sushi
function buildTray(){
  const tray = $('tray');
  tray.innerHTML = '';
  for (const p of PARTS){
    const b = document.createElement('button');
    b.className = 'chip';
    b.setAttribute('role', 'option');
    b.dataset.id = p.id;
    b.innerHTML = `<img alt="" ${thumbs[p.id] ? `src="${thumbs[p.id]}"` : ''}><b>${p.name}</b>`;
    b.addEventListener('click', () => pick(p.id));
    tray.appendChild(b);
  }
}

function setApart(on, quiet = false){
  Stage.setExploded(on);
  $('explodeBtn').classList.toggle('apart', on);
  $('explodeBtn').textContent = on ? 'Put it back together' : 'Take it apart';
  if (!on){ S.part = null; setCard(null); markTray(null); }
  if (!quiet) buzz(on ? 35 : 20);
  setHint();
}

function onTap(id){
  if (S.phase !== 'view') return;
  if (!Stage.isExploded()){
    if (id) setApart(true);
    return;
  }
  if (id) pick(id);
  else { S.part = null; Stage.select(null); setCard(null); markTray(null); setHint(); }
}

function pick(id, { quiet = false } = {}){
  if (!Stage.isExploded()) setApart(true, quiet);
  S.part = id;
  Stage.select(id);
  setCard(BY_ID[id]);
  markTray(id, quiet);
  if (!quiet) buzz(12);
  setHint();
}

function markTray(id, quiet = true){
  document.querySelectorAll('#tray .chip').forEach((c) => {
    const on = c.dataset.id === id;
    c.setAttribute('aria-selected', on);
    if (on) c.scrollIntoView({ behavior: quiet ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  });
}

function setCard(p){
  $('ncName').textContent = p ? p.name : SUSHI_INFO.name;
  $('ncBlurb').textContent = p ? p.line : SUSHI_INFO.blurb;
  $('namecard').classList.remove('pop'); void $('namecard').offsetWidth; $('namecard').classList.add('pop');
}

function setHint(){
  let h;
  if (S.mode === 'xr' && S.placing) h = S.ringSeen ? 'Tap to <b>set the sushi down</b> on the ring' : 'Move your phone slowly over a <b>table</b> until a ring appears';
  else if (!Stage.isExploded()) h = S.mode === 'xr' ? '<b>Tap the sushi</b> to take it apart. Walk round it to see every side' : '<b>Tap the sushi</b> to take it apart. <b>Drag</b> to turn it';
  else if (S.part) h = 'Tap another piece, or <b>Put it back together</b>';
  else h = 'Tap any <b>floating piece</b> to learn about it';
  $('hint').innerHTML = h;
}
function hintLoop(){
  clearInterval(S.hintTimer);
  let n = 0;
  S.hintTimer = setInterval(() => {
    if (S.phase !== 'view') return;
    n++;
    const busy = S.mode === 'xr' && S.placing;
    if (!busy && n % 3 === 2) $('hint').innerHTML = S.mode === 'xr' ? 'Walk round it, <b>drag</b> to turn it, <b>pinch</b> to zoom' : '<b>Drag</b> in any direction to turn it, <b>pinch</b> to zoom';
    else setHint();
  }, 7000);
}

// the free band between the top plates and the bottom buttons (framing of the floating sushi)
let bandCache = null, bandKey = '';
function band(){
  const key = `${innerWidth}x${innerHeight}|${$('ncBlurb').textContent.length}|${$('hint').textContent.length}`;
  if (key !== bandKey){
    bandKey = key;
    const top = Math.max($('namecard').getBoundingClientRect().bottom, $('hint').getBoundingClientRect().bottom) + 8;
    const bottom = $('explodeBtn').getBoundingClientRect().top - 8;
    bandCache = bottom - top > 120 ? { top, bottom } : null;
  }
  return bandCache;
}

// leaving the sushi view (the room-tracking session ended)
function leaveView(){
  clearInterval(S.hintTimer);
  setApart(false, true);
  overlay('hud', false);
  document.body.classList.remove('preview', 'mode-xr', 'mode-float', 'placing');
}
// ✕: back to the Scan to Explore scanning page
function toHub(){
  try { Stage.stop(); } catch { /* fine */ }
  location.href = HUB;
}

// ------------------------------------------------------------ wiring
$('permBtn').addEventListener('click', askCamera);
$('scanRetry').addEventListener('click', openScan);
$('goBtn').addEventListener('click', start);
$('explodeBtn').addEventListener('click', () => setApart(!Stage.isExploded()));
$('closeBtn').addEventListener('click', toHub);
$('hubBack').addEventListener('click', toHub);
$('errBtn').addEventListener('click', () => location.reload());
addEventListener('keydown', (e) => {
  if (S.phase !== 'view') return;
  if (e.key === ' ' || e.key === 'Enter'){ if (document.activeElement === document.body){ e.preventDefault(); setApart(!Stage.isExploded()); } }
  if (e.key === 'Escape') setApart(false);
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
    const i = PARTS.findIndex((p) => p.id === S.part);
    const j = (i + (e.key === 'ArrowRight' ? 1 : -1) + PARTS.length) % PARTS.length;
    pick(PARTS[j < 0 ? 0 : j].id);
  }
});
addEventListener('error', (e) => fail(e.error || e.message));
addEventListener('unhandledrejection', (e) => fail(e.reason));
if (q.get('preview') === '1'){ Stage.startPreview(); enter('preview'); }
else openPerm();
