// The parts of three kinds of sushi on a serving board, bottom to top as they come apart:
// a roll, a tuna nigiri and a salmon nigiri with salmon roe.
// Plain English only: no Japanese script anywhere. Facts are cross-checked in SOURCES.md.

export const SUSHI_INFO = {
  name: 'Three kinds of sushi',
  blurb: 'A roll, a tuna nigiri and a salmon nigiri topped with roe. Tap the sushi to take it apart.',
};

export const PARTS = [
  { id: 'board', name: 'Serving board',
    line: 'Sushi is served on a low wooden board on two feet, shaped like a wooden sandal. The wood soaks up moisture, so the rice never goes soggy.' },
  { id: 'rice', name: 'Sushi rice',
    line: 'Short-grain rice mixed with rice vinegar, sugar and salt. For nigiri it is pressed by hand into a small bed; for a roll it is spread on seaweed and rolled up.' },
  { id: 'nori', name: 'Seaweed wrapper',
    line: 'A sheet of toasted seaweed is rolled round the rice and fillings with a bamboo mat, then the long roll is cut into pieces.' },
  { id: 'wasabi', name: 'Wasabi',
    line: 'A dab of grated wasabi hides between the rice and the fish. Its sharp heat rushes up your nose, then fades in seconds.' },
  { id: 'cucumber', name: 'Cucumber',
    line: 'Crisp batons of cucumber give the middle of the roll a cool, fresh crunch.' },
  { id: 'avocado', name: 'Avocado',
    line: 'Creamy avocado came into sushi in Los Angeles in the 1960s and 70s, standing in for rich, fatty tuna.' },
  { id: 'tuna', name: 'Tuna',
    line: 'Lean red tuna, the meat along the back of the fish, is the classic topping. Old Tokyo sushi stalls soaked it in soy sauce to keep it fresh.' },
  { id: 'salmon', name: 'Salmon',
    line: 'Rich, buttery salmon, striped with white fat, on the nigiri and in the roll. It became a favourite in Japan only in the 1980s and 90s.' },
  { id: 'roe', name: 'Salmon roe',
    line: 'Salmon eggs, cured in soy sauce or salt. Each shiny pearl pops in your mouth with a burst of salty, sea-fresh flavour.' },
];

export const BY_ID = Object.fromEntries(PARTS.map((p, i) => [p.id, { ...p, n: i + 1 }]));
PARTS.forEach((p, i) => { p.n = i + 1; });
