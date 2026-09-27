# 🍣 3D models guide

This guide explains where the sushi models come from, how to open them in a 3D editor,
and how to **change them, replace them with your own, or add new pieces**.

- [How the models work](#how-the-models-work)
- [The model files (`models/`)](#the-model-files-models)
- [Option 1 – Replace a piece with your own model](#option-1--replace-a-piece-with-your-own-model)
- [Option 2 – Add a brand-new piece](#option-2--add-a-brand-new-piece)
- [Option 3 – Tweak the built-in models in code](#option-3--tweak-the-built-in-models-in-code)
- [Making models in Blender](#making-models-in-blender)
- [Regenerating the .glb files](#regenerating-the-glb-files)
- [Troubleshooting](#troubleshooting)

---

## How the models work

Out of the box, every piece of sushi is **built in code** inside `index.html` (search for
`Build the sushi`). No model files need downloading, which keeps the app fast. The shapes
are made from simple building blocks:

| Piece | How it's built |
|---|---|
| Nori wrapper, maki rice | A rounded ring (a profile spun around a circle, `roundedRing`) |
| Salmon, cucumber, avocado | A box with rounded edges (`roundedSlab`), then bent or coloured |
| Nigiri rice | A squashed sphere with a flat bottom |
| Rice grains, sesame seeds | Hundreds of tiny squashed spheres (instanced meshes) |
| Wasabi | A spun profile with a wavy twist |
| Pickled ginger | Six thin curled discs |
| Textures | Drawn on a canvas in code: `riceTex`, `noriTex`, `salmonTex` |

The app is split into **10 pieces**. Each has an **id**, which is what you use to replace it:

| id | Ingredient (info panel) | Size (w × h × d) | Assembled position | Exploded position |
|---|---|---|---|---|
| `nori` | nori | 0.201 × 0.120 × 0.201 | −0.25, 0.06, 0.03 | −0.32, 0.20, −0.22 |
| `maki-rice` | rice | 0.194 × 0.123 × 0.194 | −0.25, 0.06, 0.03 | −0.30, 0.08, 0.00 |
| `maki-salmon` | salmon | 0.037 × 0.112 × 0.037 | −0.25, 0.057, 0.011 | −0.235, 0.13, 0.29 |
| `cucumber` | cucumber | 0.036 × 0.112 × 0.036 | −0.234, 0.057, 0.039 | −0.38, 0.10, 0.27 |
| `avocado` | avocado | 0.042 × 0.112 × 0.042 | −0.266, 0.057, 0.039 | −0.09, 0.10, 0.27 |
| `sesame` | sesame | 0.183 × 0.007 × 0.187 | −0.25, 0.121, 0.03 | −0.07, 0.36, −0.22 |
| `nigiri-rice` | rice | 0.267 × 0.082 × 0.131 | 0.07, 0.039, −0.01 | 0.15, 0.04, 0.10 |
| `nigiri-salmon` | salmon | 0.270 × 0.076 × 0.122 | 0.07, 0.089, −0.01 | 0.19, 0.27, −0.10 |
| `wasabi` | wasabi | 0.083 × 0.055 × 0.082 | 0.37, 0.028, 0.17 | 0.37, 0.10, 0.24 |
| `ginger` | ginger | 0.094 × 0.051 × 0.095 | 0.36, 0.00, −0.15 | 0.38, 0.08, −0.22 |

### Units and directions

**1 unit = the width of the printed picture.** On an 18 cm print, 0.1 units = 1.8 cm.

- **x**: left → right across the picture (the picture spans −0.5 to 0.5)
- **y**: up, out of the paper (0 = the paper's surface)
- **z**: toward the bottom edge of the picture (the picture spans about −0.33 to 0.33, since it's 3:2)

Each piece's position is its **centre point**. Its model is built around that centre (for
example, the maki rice's centre is halfway up the roll).

---

## The model files (`models/`)

Every built-in piece is also saved as a **.glb file** (the standard web 3D format) in `models/`:

```
models/
  nori.glb  maki-rice.glb  maki-salmon.glb  cucumber.glb  avocado.glb  sesame.glb
  nigiri-rice.glb  nigiri-salmon.glb  wasabi.glb  ginger.glb
  sushi-assembled.glb        ← everything together, in its assembled positions
```

Open them in **Blender** (free), or drag them into an online viewer such as
[gltf-viewer.donmccurdy.com](https://gltf-viewer.donmccurdy.com/) to look around.
Each file uses the same units as above, with the piece's centre at the origin. That's what makes
them the perfect **reference** for making your own replacement at the right size.

> The app doesn't load these files by default. It still builds the models in code.
> They're there so you can see and edit the shapes.

---

## Option 1 – Replace a piece with your own model

1. Make or find a model and export it as **.glb** (see [Making models in Blender](#making-models-in-blender)).
2. Put the file in the `models/` folder, e.g. `models/my-salmon.glb`.
3. Open `index.html`, search for **`CUSTOM_MODELS`**, and add a line using the piece's id:

   ```js
   const CUSTOM_MODELS = {
     'nigiri-salmon': { src: './models/my-salmon.glb' },
   };
   ```

4. Test with demo mode: open `index.html?demo=1` (see the README for running it locally),
   then tap **See Inside** to check it floats apart properly.
5. Commit and push. GitHub Pages updates in a minute or two.

Your model automatically:
- sits where the old piece was and floats to the same exploded position,
- keeps the label and info panel,
- glows when tapped, and gets a generous invisible tap area around it.

### Fine-tuning size and position

If your model comes out too big, too small, off-centre or facing the wrong way, add options:

```js
'wasabi': {
  src: './models/my-wasabi.glb',
  scale: 0.8,              // 80% size
  offset: [0, -0.02, 0],   // nudge down by 0.02 picture widths
  rotation: [0, 45, 0],    // turn 45° around the vertical axis (degrees)
},
```

To go back to the built-in model, delete or comment out the line (put `//` in front).
To compare quickly without editing, add `?custom=0` to the URL.

### Replacing a whole roll

A maki roll is 5 pieces: `nori`, `maki-rice`, `maki-salmon`, `cucumber` and `avocado`,
plus `sesame` on top. To get a nice exploded view, keep those as **separate models**,
one per layer, and replace each one. If you replace only the rice with a
whole roll, the old nori and fillings will still be drawn around it.

---

## Option 2 – Add a brand-new piece

You can add extra items too, like a soy sauce dish or a piece of tuna nigiri.

**Step 1: write its info panel.** In `index.html`, find `const INGREDIENTS = {` and add an entry,
copying the style of the others:

```js
soy: {
  name: 'Soy sauce', jp: '醤油 · shōyu', swatch: '#3b1f14',
  what: 'A salty, savoury sauce brewed from soybeans, wheat, salt and a mould called koji.',
  how: 'The ingredients are fermented for months, then pressed and filtered.',
  facts: [
    'Dip the fish side, not the rice side, so the rice doesn\'t fall apart.',
    'Japan makes hundreds of kinds, from pale usukuchi to thick tamari.',
  ],
  history: 'Soy sauce grew out of fermented pastes brought from China, and took its modern form in Japan around the 1500s–1600s.',
},
```

**Step 2: add the model** in `CUSTOM_MODELS` with a new id (anything not in the table above):

```js
'soy-dish': {
  src: './models/soy-dish.glb',
  ingredient: 'soy',          // the INGREDIENTS entry from step 1
  home: [0.3, 0, 0.28],       // where it sits when assembled [x, y, z]
  exploded: [0.3, 0.12, 0.3], // where it floats to in See Inside
  label: 'Soy sauce',         // its label in the exploded view
},
```

Remember to pick a `home` spot that doesn't overlap the other pieces (see the positions table),
and keep x between −0.5 and 0.5 so it stays on the picture.

---

## Option 3 – Tweak the built-in models in code

You don't need a 3D editor for small changes. All of these are in `index.html`:

| I want to… | Find this and change it |
|---|---|
| Change the salmon's colour (e.g. make it tuna) | `const salmonTex`: the `addColorStop` colours and the stripe `strokeStyle` |
| Make the maki roll taller or shorter | `const H = 0.12;` (maki height) |
| Move the maki roll or nigiri | `const MAKI = …` and `const NIGIRI = …` |
| Change wasabi or ginger colour | `color: 0x7ea03a` (wasabi) and `color: 0xea8c7c` (ginger) |
| More or fewer rice grains / sesame seeds | the numbers in `riceGrains(300, …)`, `riceGrains(420, …)`, `const n = 60;` |
| Change where pieces float in See Inside | each `addPiece(…)` call: the **second** `{ pos: … }` is the exploded position |
| Change label text or height | `label: 'Nori'` and `labelAt` in each `addPiece(…)` call |
| Change the info panel text | `const INGREDIENTS` and `const HISTORY` |

Colours are hex, like CSS but starting with `0x` instead of `#`: `#ff8800` → `0xff8800`.

---

## Making models in Blender

[Blender](https://www.blender.org/) is free. The easiest way to get the size and position right
is to **model on top of the existing piece**:

1. **File → Import → glTF 2.0** and open, e.g., `models/nigiri-salmon.glb`.
   You can also import `sushi-assembled.glb` to see the whole plate.
2. Model your new version so it fills the same space as the imported one.
   In Blender, 1 m = 1 picture width, so the salmon is about 27 cm long there. That's expected.
   - Blender's **Front view** (numpad 1) looks from the **bottom edge of the printed picture**.
     Up in Blender (Z) is up out of the paper.
   - Keep the object's **origin at the centre** of the piece, where the imported one's origin is.
3. Delete the imported reference piece.
4. Select your model and choose **File → Export → glTF 2.0**, with these settings:
   - **Format:** glTF Binary (`.glb`)
   - **Include → Limit to:** Selected Objects
   - **Transform → +Y Up:** ✅ (the default)
   - **Mesh → Apply Modifiers:** ✅
   - **Compression:** ❌ off (the app doesn't include the Draco decoder)
5. Save it into `models/` and add it to `CUSTOM_MODELS` (Option 1).

### Materials that look good

- Use the **Principled BSDF** shader (Blender's default). Base Color, Roughness, Metallic,
  Normal maps, Clearcoat, Sheen and Transmission all carry over to the web.
- Food looks best slightly glossy: roughness 0.3–0.5 for fish, 0.6–0.8 for rice.
- Don't rely on **Emission**, because the tap highlight takes over the emission colour.
- Procedural node textures (Noise, Voronoi…) **don't** export. Bake them to an image texture first.

### Keep it light (phones!)

- Aim for **under ~1–2 MB per model** and **under ~50,000 triangles** in total.
  Use Blender's **Decimate** modifier to cut triangles.
- Textures: **1024 × 1024 px or smaller**, JPG or PNG.
- Shrink a finished file without Draco:
  `npx @gltf-transform/cli optimize in.glb out.glb --compress false`

### Finding ready-made models

- [Poly Pizza](https://poly.pizza/): free low-poly models, many with no licence restrictions (CC0)
- [Sketchfab](https://sketchfab.com/search?q=sushi&type=models): filter by *Downloadable*. Check the
  licence: **CC-BY** means you must credit the author (add a line to the README).

Download as **glTF / .glb**, then open it in Blender to resize and centre it as above.

---

## Regenerating the .glb files

The files in `models/` are exported from the code. If you change the built-in models
(Option 3) and want fresh files:

1. Open the app with **`?export=1`**, for example
   `https://naomirajwanshi02.github.io/sushi-ar-explore/?export=1`
2. Download the files you want from the list, and replace them in `models/`.

Any models from `CUSTOM_MODELS` are included in the export, as they appear in the app.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| My model doesn't show, the old one is still there | Check the browser console for `Custom model "…" couldn't be loaded`. The path in `src` is probably wrong. It's case-sensitive and should start with `./models/`. |
| It's huge or tiny | Use `scale`, or re-export from Blender after checking its size against the reference .glb |
| It's floating or sunk into the table | Its origin isn't at its centre. Fix the origin in Blender (*Object → Set Origin → Origin to Geometry*) or use `offset` |
| It faces the wrong way | `rotation: [0, 90, 0]` (try 90 / 180 / 270) |
| It's black or has no colours | Materials must be Principled BSDF with image textures (not procedural nodes). Make sure textures were packed into the .glb. |
| It's slow on my phone | Too many triangles or big textures. See *Keep it light* above. |
| It works locally but not on the website | Did you commit and push the `.glb` file as well as `index.html`? |
