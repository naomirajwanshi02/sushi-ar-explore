// The parts of three pieces of nigiri on a serving board, bottom to top as they come apart.
// Plain English only: no Japanese script anywhere. Facts are cross-checked in SOURCES.md.

export const SUSHI_INFO = {
  name: 'Three pieces of nigiri',
  blurb: 'Nigiri is a small bed of rice pressed by hand, with a topping laid on it. Tap the sushi to take it apart.',
};

export const PARTS = [
  { id: 'board', name: 'Serving board',
    line: 'Sushi is served on a low wooden board on two feet, shaped like a wooden sandal. The wood soaks up moisture, so the rice never goes soggy.' },
  { id: 'rice', name: 'Sushi rice',
    line: 'Short-grain rice mixed with rice vinegar, sugar and salt, then pressed by hand into a small oval bed. It is served close to body warmth.' },
  { id: 'wasabi', name: 'Wasabi',
    line: 'A dab of grated wasabi hides between the rice and the fish. Its sharp heat rushes up your nose, then fades in seconds.' },
  { id: 'nori', name: 'Seaweed belt',
    line: 'A strip of toasted seaweed ties the omelette onto its rice, so the soft topping stays in place.' },
  { id: 'omelette', name: 'Sweet omelette',
    line: 'Eggs, a little sugar and fish stock are cooked in thin layers in a square pan, each one rolled up over the last into a soft block.' },
  { id: 'tuna', name: 'Tuna',
    line: 'Lean red tuna, the meat along the back of the fish, is the classic topping. Old Tokyo sushi stalls soaked it in soy sauce to keep it fresh.' },
  { id: 'salmon', name: 'Salmon',
    line: 'Rich, buttery salmon, striped with white fat. It became a favourite in Japan only in the 1980s and 90s, when Norway began selling raw salmon there.' },
  { id: 'roe', name: 'Salmon roe',
    line: 'Salmon eggs, cured in soy sauce or salt. Each shiny pearl pops in your mouth with a burst of salty, sea-fresh flavour.' },
];

export const BY_ID = Object.fromEntries(PARTS.map((p, i) => [p.id, { ...p, n: i + 1 }]));
PARTS.forEach((p, i) => { p.n = i + 1; });
