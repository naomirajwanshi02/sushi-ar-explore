# 🍣 Sushi AR Explorer

An educational WebAR experience. Point your phone at the printed sushi picture
and a 3D sushi appears on it: a maki roll with a piece of salmon nigiri, plus
wasabi and pickled ginger. Tap it to learn the history of sushi, then press
**See Inside** to take it apart and learn about each ingredient.

**Live:** https://naomirajwanshi02.github.io/sushi-ar-explore/
**Demo (no printout needed):** https://naomirajwanshi02.github.io/sushi-ar-explore/?demo=1

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app in one file: inline CSS and JS. three.js and MindAR load from a CDN, and every 3D model is built in code. No build step. |
| `sushi_main.jpeg` | The image target. Print this. |
| `targets.mind` | MindAR's compiled data for `sushi_main.jpeg`. Used as-is. |

## How to use it

1. Print the target (see below) and put it on a table.
2. Open the live link on your phone and tap **Start camera**. Allow camera access.
3. Point the camera at the picture. A "Point your camera at the sushi picture" hint shows until the picture is found.
4. **Tap the sushi** to open a short history of sushi, from fermented *narezushi* to Edo-period nigiri to sushi around the world.
5. Tap **See Inside** (bottom-right). The sushi splits into labelled layers: nori, sushi rice, salmon, cucumber, avocado, sesame seeds, wasabi and pickled ginger.
6. **Tap any piece or its label.** It glows and grows slightly, and a panel opens with what it is, how it's made, fun facts, and its history in Japanese cuisine.
7. Tap **Put Back Together** to reassemble it.

Info panels slide up from the bottom. Close them with the ✕ button. Only one panel is open at a time.

Works in Android Chrome and iPhone Safari (iOS 14.3+). The camera only works over
**HTTPS**, which GitHub Pages provides. All paths are relative, so the folder also
works from any other HTTPS host.

## Testing without the printout: `?demo=1`

Open `index.html?demo=1`. Tracking is skipped completely. The sushi floats in
front of you on a slate board, with the camera feed behind it if the camera is
allowed. Everything else works the same: tapping, See Inside, info panels.
In demo mode you can also drag sideways to spin the sushi around.

Local testing:

```bash
npx http-server -p 8080 .
# then open http://localhost:8080/?demo=1
```

`localhost` counts as a secure origin, so the camera works there too. To test on a
phone, use the HTTPS GitHub Pages URL.

## Printing the target

- Print `sushi_main.jpeg` about **18 cm wide**. It's 3:2, so about 18 × 12 cm.
- Use **matte paper**. Glossy paper reflects light, and glare breaks tracking.
- Don't crop it or change the proportions. `targets.mind` was compiled from the full image.
- Lay it flat with good, even light. Hold the phone about 20–40 cm away.
- A tablet or monitor showing the image works too, but less reliably, because screens reflect light.

## Stability tuning

The model should sit still on the picture and not wobble. That comes from three layers,
all explained in comments in `index.html` (search for `TRACKING` and `SMOOTH`):

1. **MindAR's One Euro filter.** `filterMinCF = 0.0001` gives very heavy smoothing
   when the picture is still. `filterBeta = 0.001` loosens that during real movement so the
   model keeps up.
2. **Per-frame smoothing.** Each render frame, the displayed model lerps (position/scale)
   and slerps (rotation) toward the tracked pose, instead of jumping there.
3. **Deadzone with hysteresis.** Movements under about 0.35% of the picture width (about 0.6 mm)
   or 0.4° are ignored, so leftover noise can't make the model shimmer.

`warmupTolerance = 8` stops the model popping in before tracking is steady.
`missTolerance = 15` holds the model for about half a second if tracking briefly drops.

To tune on a real device, override any value in the URL:

```
?mincf=0.0003&beta=0.005&warmup=5&miss=20
?smooth=0        # turn off the extra smoothing layer, to compare
```

## Tech notes

- **three.js 0.160.0** and **mind-ar 1.2.5**, pinned in an import map. MindAR 1.2.5 imports
  `sRGBEncoding`, which later versions of three.js removed, so don't upgrade either one alone.
- All models are made in code: lathed rings for the nori and rice, rounded bent slabs
  for the fish and fillings, instanced rice grains and sesame seeds, and canvas-generated
  textures. Lighting is a soft hemisphere, key, fill and rim setup plus a procedural room
  environment map, so the salmon has a gentle sheen. Nothing else needs downloading after the CDN scripts.
- Tap detection uses a three.js `Raycaster` with pointer events. It separates a tap from a
  drag and retries a few nearby points if the first ray misses, which helps with fingers
  on small pieces. Small pieces like sesame seeds and wasabi also have larger invisible hit areas.
