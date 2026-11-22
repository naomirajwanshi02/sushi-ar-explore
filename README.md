# Anatomy of Sushi: WebAR

**Live:** https://naomirajwanshi02.github.io/sushi-ar-explore/ (open it on your phone and tap **Allow camera**)

Three pieces of nigiri on a cypress serving board appear over the live camera, after the
painting you scan: a sweet omelette tied on with a seaweed belt, lean tuna, and salmon topped
with salmon roe. **Tap the sushi** and every piece comes apart, layer by layer, the way it was
made. **Tap any floating piece** (or its picture in the tray) for its name and a line about it.

It follows the same flow and look as the other NomAR explorers (Ramen Anatomy, Noh Masks):
the Anatomy kit in its sepia theme, plates, red pill buttons, a glass name card and a tray of parts.
There is no small text and no Japanese text anywhere.

## The flow

1. **Allow camera access.** One tap, the browser asks for the camera.
2. **Viewfinder.** Point the camera at the sushi picture ([`sushi_main.jpeg`](sushi_main.jpeg), printed or on
   another screen). This happens **once**: the picture is not needed again after that.
3. **Instructions** appear over the live camera, with the sushi already floating behind them. Tap **Start**.
4. **The sushi.**
   - **iPhone:** the sushi floats steady over the camera. Drag to turn it any way, pinch to zoom.
   - **Android** (Chrome with ARCore): Start opens room tracking (WebXR). Move over a table until a ring appears
     and tap to set the board down at real size (21 cm), then walk round it. If room tracking can't start, the
     sushi floats over the camera instead.
   - ✕ goes back to the instructions; Start brings the sushi back.

## The 8 parts

| Part | On the board | Apart |
|---|---|---|
| Serving board | a cypress plank on two feet | stays at the bottom |
| Sushi rice | three hand-pressed oval beds, grain by grain | lifts off the board |
| Wasabi | a dab hidden under the tuna and the salmon | floats between rice and fish |
| Seaweed belt | ties the omelette onto its rice | turns to show its loop |
| Sweet omelette | a layered block, browned on top | tips its top toward you |
| Tuna | a deep red slice cut at an angle | tips its top toward you |
| Salmon | orange, striped with white fat | tips its top toward you |
| Salmon roe | a little heap of pearls on the salmon | a loose ring of pearls at the top |

## Controls

- **Tap the sushi** or **Take it apart** to explode it, **Put it back together** to rebuild it
- **Tap a piece** or a tray picture: its name and one line appear on the card at the top
- **Pinch** to zoom (0.25× to 5×), **drag** in any direction to turn it; a flick keeps it turning for a moment
- Keyboard: Space / Enter explode, ← → step through the parts, Esc rebuild

## Print the picture

Print `sushi_main.jpeg` about **18 cm wide** on **matte** paper (glossy paper throws glare that hides it from the
camera). Don't crop it. A tablet or second screen showing it also works.

## URL options

- `?from=hub`: opened from the [Scan to Explore](https://github.com/naomirajwanshi02/Scan_To_Explore) hub; a ✕ on the
  first screens goes back to it. The hub also adds `?demo=1`, which skips the scan because the hub has already
  recognised the picture. Neither shows a button on screen.
- `?card=1`: float the sushi over the camera even where room tracking works
- `?apart=1`: open already apart; `?part=<id>`: open with that part picked (`board rice wasabi nori omelette tuna salmon roe`)
- `?preview=1`: development only, no camera

## Run locally

```
powershell -ExecutionPolicy Bypass -File tools/serve.ps1
```

Then open http://localhost:8140/. The camera needs https (or localhost), so use the live GitHub Pages link on a phone.

## Changing the picture

`assets/sushi-trigger.png` is the painting. `tools/make-target.html?build=1` (served by `tools/serve.ps1`) lays it
on white as `sushi_main.jpeg` and compiles `targets.mind` with MindAR's own compiler. If the picture changes, the
Scan to Explore hub's `targets.mind` must be rebuilt too, since it recognises the same picture.

## Files

- `js/sushi.js` builds the model in centimetres: both poses of every part and the explode timing
- `js/textures.js` paints the canvas textures (cypress grain, rice, tuna, salmon, omelette layers, nori)
- `js/stage.js` runs the three modes (picture scan then floating, WebXR room, preview), drag, pinch and tap picking, and the tray pictures
- `js/app.js` runs the screens and the UI; `js/data.js` holds the part names and lines; `js/look.js` is the shared lighting
- `css/anatomy-sepia.css` and `vendor/anatomy/iso.css` are the Anatomy design tokens; `css/app.css` is the UI
- mind-ar 1.2.5 and three 0.160.0 are pinned to match the other NomAR apps
