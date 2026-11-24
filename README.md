# Anatomy of Sushi: WebAR

**Live:** https://naomirajwanshi02.github.io/sushi-ar-explore/ (open it on your phone and tap **Allow camera**)

Three kinds of sushi on a cypress serving board appear over the live camera: a roll (seaweed
outside, rice, then salmon, cucumber and avocado in the middle), a tuna nigiri, and a salmon
nigiri topped with salmon roe. **Tap the sushi** and every piece comes apart, layer by layer, the way it was
made. **Tap any floating piece** (or its picture in the tray) for its name and a line about it.

It has the same screens, flow and look as **Ramen Anatomy**: the Anatomy kit in its sepia theme, Zen Maru Gothic, plates,
red pill buttons, a name card with its own ✕ and an **i** button, and a tray of parts. Touch a part and it keeps its colour
and glows while the rest fade toward paper (touch it again, or empty space, to let go). There is no backdrop (the live
camera is the only background), no text under 14px and no Japanese text anywhere.

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
   - The ✕ (on the instructions, and above the **i** button) goes back to scanning: to the
     [Scan to Explore](https://naomirajwanshi02.github.io/Scan_To_Explore/) hub's scanner when opened from it, otherwise to this app's own.
   - The name card's small ✕ hides it; the **i** button brings it back.

## The 9 parts

| Part | On the board | Apart |
|---|---|---|
| Serving board | a cypress plank on two feet | stays at the bottom |
| Sushi rice | the roll's ring of rice and two hand-pressed nigiri beds | lifts off the board, the ring tipped so you see into it |
| Seaweed wrapper | the tube round the outside of the roll | floats above the rice ring |
| Wasabi | a dab hidden under the tuna and the salmon | floats between rice and fish |
| Cucumber | a baton in the middle of the roll | stands at the top of the roll's column |
| Avocado | a baton in the middle of the roll | stands at the top of the roll's column |
| Tuna | a deep red slice cut at an angle | tips its top toward you |
| Salmon | the nigiri slice, and a baton in the roll | tips toward you / stands beside the cucumber |
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

- `?from=hub` (and `?demo=1`): added by the [Scan to Explore](https://github.com/naomirajwanshi02/Scan_To_Explore) hub, which has
  already recognised the picture. The instructions open straight away with the camera starting behind them, and the crosses
  go back to the hub's scanner. There is no button for this on screen.
- `?card=1`: float the sushi over the camera even where room tracking works
- `?apart=1`: open already apart; `?part=<id>`: open with that part picked (`board rice nori wasabi cucumber avocado tuna salmon roe`)
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
- `js/textures.js` paints the canvas textures (cypress grain, rice, tuna, salmon, nori)
- `js/stage.js` runs the three modes (picture scan then floating, WebXR room, preview), drag, pinch and tap picking, and the tray pictures
- `js/app.js` runs the screens and the UI; `js/data.js` holds the part names and lines; `js/look.js` is the shared lighting
- `css/anatomy-sepia.css` and `vendor/anatomy/iso.css` are the Anatomy design tokens; `css/app.css` is the UI
- Font: Zen Maru Gothic, as in the other NomAR apps; mind-ar 1.2.5 and three 0.160.0 are pinned to match them too
