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
In demo mode you can drag sideways to spin the sushi. If your phone has a gyroscope, the sushi stays put in space as you turn the phone.

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

## Keeping the model locked to the picture

Once the sushi appears, it stays fixed to the picture. You can move and turn your phone
to look at it from any side, like the AR apps used for architecture. That works in three layers,
all explained in comments in `index.html` (search for `TRACKING` and `FUSION`):

1. **Gyroscope.** The phone's motion sensor measures turning instantly. Turning the phone
   moves the model on screen by exactly the opposite amount, with no waiting for camera
   tracking, so it doesn't drag behind the picture.
2. **Camera tracking (MindAR)** corrects the position: where the picture is and how far
   you've walked. Tracking results are lined up with the gyroscope reading from the moment
   their camera frame was taken, so the tracking delay doesn't show.
3. **Adaptive smoothing with a deadzone.** Jitter-sized differences are smoothed heavily or
   ignored, so the model is still at rest. Big differences, such as walking around the picture,
   are followed quickly.

If tracking drops for a moment (steep angle, glare, a hand in the way), the gyroscope
holds the model in place for about 1.5 s. On iPhone, Safari asks for **motion access**
when you tap Start. Allow it, or the model won't stay as steady.

Tracking needs the picture in view. Very steep angles (almost edge-on) lose it, so move
around the picture rather than down to table level. A bigger print tracks from further away.

### Tuning on a device

Override values in the URL:

```
?mincf=0.01&beta=0.02    # MindAR's own filter (default 0.005 / 0.01, deliberately light)
?warmup=5&miss=15        # frames before showing / frames of dropout tolerated
?lat=60                  # camera latency in ms used to line up gyro and video (default 45)
?gyro=0                  # turn off the gyroscope, to compare
?smooth=0                # turn off all extra smoothing, to compare
```

## Tech notes

- Font: **Urbanist** (Google Fonts), falling back to the system font offline.
- **three.js 0.160.0** and **mind-ar 1.2.5**, pinned in an import map. MindAR 1.2.5 imports
  `sRGBEncoding`, which later versions of three.js removed, so don't upgrade either one alone.
- All models are made in code: lathed rings for the nori and rice, rounded bent slabs
  for the fish and fillings, instanced rice grains and sesame seeds, and canvas-generated
  textures. Lighting is a soft hemisphere, key, fill and rim setup plus a procedural room
  environment map, so the salmon has a gentle sheen. Nothing else needs downloading after the CDN scripts.
- Tap detection uses a three.js `Raycaster` with pointer events. It separates a tap from a
  drag and retries a few nearby points if the first ray misses, which helps with fingers
  on small pieces. Small pieces like sesame seeds and wasabi also have larger invisible hit areas.
