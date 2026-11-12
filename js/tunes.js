// tunes.js — фонові мелодії стилів графіки; порядок = SKINS (немає — стиль без музики). Формат доріжок — parse у music.js.
// Мелодія: bpm, beat (кроків на долю, 4 — шістнадцяті), bar (кроків у такті — для перевірки в тестах),
// vol — до однакової гучності (−26 LUFS за гучності музики 0,2, як «За замовчуванням»; міряно офлайн-рендером),
// tracks: [{ i — інструмент (INST у music.js) і його поля на заміну, n — ноти, len — тривалість токена за замовчуванням }
//          | { d — ударний (DRUM), p — візерунок, vol }], echo? [с, повернення] — луна. Кожна доріжка повторюється за своєю довжиною.

// Такти за одним візерунком: X у ньому — акорд такту
const pat = (p, ...chords) => chords.map(c => p.replaceAll('X', c)).join(' | ');

// «За замовчуванням» — бадьорий чіптюн до мажору: C Am F G ×2, потім F G Em Am F G C G
const classic = {
  name: 'За замовчуванням', bpm: 150, beat: 4, bar: 16,
  tracks: [
    { i: 'lead', len: 2, n: `
      C5 E5 G5 C6 - G5 E5 G5 | A5 - E5 C5 A4 C5 E5 A5 | F5 A5 C6 A5 F5 - E5 F5 | G5 - B5 - D6 - B5 G5 |
      E6 - D6 C6 G5 - E5 G5 | A5 C6 B5 A5 E5 - C5 E5 | F5 - A5 C6 F6 - E6 D6 | D6 C6 B5 A5 G5 - . . |
      C6 - - - A5 - F5 - | D6 - - - B5 - G5 - | E6 - D6 - B5 - G5 - | C6 - - - A5 - - - |
      A5 C6 F6 - E6 - C6 - | D6 B5 G5 - A5 B5 D6 - | C6 - G5 - E5 - G5 - | F5 - D5 - B4 - G4 - ` },
    { i: 'pulse', len: 2, n: `
      . E4+G4 . E4+G4 . E4+G4 . E4+G4 | . E4+A4 . E4+A4 . E4+A4 . E4+A4 | . F4+A4 . F4+A4 . F4+A4 . F4+A4 | . D4+G4 . D4+G4 . D4+G4 . D4+G4 |
      . E4+G4 . E4+G4 . E4+G4 . E4+G4 | . E4+A4 . E4+A4 . E4+A4 . E4+A4 | . F4+A4 . F4+A4 . F4+A4 . F4+A4 | . D4+G4 . D4+G4 . D4+G4 . D4+G4 |
      . F4+A4 . F4+A4 . F4+A4 . F4+A4 | . D4+G4 . D4+G4 . D4+G4 . D4+G4 | . G4+B4 . G4+B4 . G4+B4 . G4+B4 | . E4+A4 . E4+A4 . E4+A4 . E4+A4 |
      . F4+A4 . F4+A4 . F4+A4 . F4+A4 | . D4+G4 . D4+G4 . D4+G4 . D4+G4 | . E4+G4 . E4+G4 . E4+G4 . E4+G4 | . D4+F4 . D4+F4 . D4+G4 . D4+G4 ` },
    { i: 'bass', len: 2, n: `
      C3 C4 C3 C4 C3 C4 G2 B2 | A2 A3 A2 A3 A2 A3 E3 G3 | F2 F3 F2 F3 F2 F3 C3 F3 | G2 G3 G2 G3 G2 G3 B2 D3 |
      C3 C4 C3 C4 C3 C4 G2 B2 | A2 A3 A2 A3 A2 A3 E3 G3 | F2 F3 F2 F3 F2 F3 C3 F3 | G2 G3 G2 G3 G2 G3 B2 D3 |
      F2 F3 F2 F3 F2 F3 C3 F3 | G2 G3 G2 G3 G2 G3 D3 G3 | E2 E3 E2 E3 E2 E3 B2 E3 | A2 A3 A2 A3 A2 A3 E3 A3 |
      F2 F3 F2 F3 F2 F3 C3 F3 | G2 G3 G2 G3 G2 G3 D3 G3 | C3 C4 C3 C4 C3 C4 G2 C3 | G2 G3 G2 G3 G2 G3 B2 D3 ` },
    { d: 'kick', p: 'x.......x.......' },
    { d: 'snare', p: '....x.......x...' },
    { d: 'hat', p: 'o.x.o.x.o.x.o.x.' },
  ],
};

// «Кіберпанк» — синтвейв ля мінор: Am F C G, арпеджіо з луною, октавний бас, «пряма» бочка
const cyber = {
  name: 'Кіберпанк', vol: 2.02, bpm: 112, beat: 4, bar: 16, echo: [0.4, 0.35],
  tracks: [
    { i: 'saw', len: 2, n: `
      A5 - - - G5 - E5 - | F5 - - - E5 - C5 - | E5 - G5 - C6 - - - | B5 - - - D6 - B5 - |
      C6 - - B5 A5 - - - | A5 - C6 - F5 - - - | G5 - E5 - G5 - C6 - | B5 - - - - - . . ` },
    { i: 'arp', n: `
      A4 C5 E5 A5 E5 C5 A4 C5 E5 A5 E5 C5 A4 C5 E5 C5 | F4 A4 C5 F5 C5 A4 F4 A4 C5 F5 C5 A4 F4 A4 C5 A4 |
      C5 E5 G5 C6 G5 E5 C5 E5 G5 C6 G5 E5 C5 E5 G5 E5 | G4 B4 D5 G5 D5 B4 G4 B4 D5 G5 D5 B4 G4 B4 D5 B4 ` },
    { i: 'sbass', len: 2, n: `
      A2 A3 A2 A3 A2 A3 A2 A3 | F2 F3 F2 F3 F2 F3 F2 F3 | C3 C4 C3 C4 C3 C4 C3 C4 | G2 G3 G2 G3 G2 G3 G2 G3 ` },
    { i: 'pad', len: 16, n: 'A3+C4+E4 | F3+A3+C4 | E3+G3+C4 | D3+G3+B3' },
    { d: 'kick', p: 'x...x...x...x...' },
    { d: 'clap', p: '....x.......x...', vol: 0.8 },
    { d: 'hat', p: '..x...x...x...x.' },
  ],
};

// «Ретро 8-біт» — пригодницький NES: соль міксолідійський G F C D, два «квадрати», трикутний бас, ударні шумом
const retro = {
  name: 'Ретро 8-біт', vol: 1.16, bpm: 160, beat: 4, bar: 16,
  tracks: [
    { i: 'lead', len: 2, vib: null, n: `
      G5 - B5 D6 - B5 G5 - | F5 - A5 C6 - A5 F5 - | E5 G5 C6 - E6 - D6 C6 | D6 - - A5 F#5 - D5 - |
      G5 G5 . G5 B5 - G5 - | A5 A5 . A5 C6 - A5 - | G5 - E5 - C5 - E5 G5 | F#5 - A5 - D6 - . . ` },
    { i: 'pulse', len: 4, n: pat('. X . X', 'B4+D5', 'A4+C5', 'G4+C5', 'F#4+A4') },
    { i: 'bass', len: 2, n: `
      G2 . G2 D3 G2 . G2 D3 | F2 . F2 C3 F2 . F2 C3 | C3 . C3 G3 C3 . C3 G3 | D3 . D3 A3 D3 . D3 F#3 ` },
    { d: 'nkick', p: 'x.....x...x.....' },
    { d: 'nsnare', p: '....x.......x...' },
    { d: 'hat', p: 'o.o.o.o.o.o.o.o.', vol: 0.8 },
  ],
};

// «Зима» — вальс-скринька ре мажор з бубонцями: D D G D Bm E A A7, D D G D Bm E A D
const winter = {
  name: 'Зима', vol: 1.84, bpm: 160, beat: 4, bar: 12, echo: [0.28, 0.25],
  tracks: [
    { i: 'bell', len: 4, echo: 0.3, n: `
      A5_8 F#5 | D5 F#5 A5 | B5_8 G5 | A5_12 | F#5 B5 D6 | E6_8 D6 | C#6 B5 A5 | G5_8 E5 |
      F#5_8 A5 | D6 C#6 D6 | D6 B5 G5 | F#5_8 A5 | B5 A5 F#5 | E5 G#5 B5 | A5 C#6 E6 | D6_12 ` },
    { i: 'pizzb', len: 4, vol: 0.45, n: `
      D3 . . | A2 . . | G2 . . | D3 . . | B2 . . | E3 . . | A2 . . | A2 . . |
      D3 . . | A2 . . | G2 . . | D3 . . | B2 . . | E3 . . | A2 . . | D3 . . ` },
    { i: 'pizz', len: 4, n: pat('. X X', 'F#4+A4', 'F#4+A4', 'G4+B4', 'F#4+A4', 'F#4+B4', 'G#4+B4', 'A4+C#5', 'G4+C#5',
      'F#4+A4', 'F#4+A4', 'G4+B4', 'F#4+A4', 'F#4+B4', 'G#4+B4', 'A4+C#5', 'F#4+A4') },
    { d: 'sleigh', p: 'x...o...o...' },
  ],
};

// «Космос» — ембієнт ре мінор: пласти, скляне арпеджіо з довгою луною, «терменвокс»
const space = {
  name: 'Космос', vol: 1.1, bpm: 76, beat: 4, bar: 16, echo: [0.59, 0.45],
  tracks: [
    { i: 'pad2', len: 16, n: 'D3+F3+A3+C4 | Bb2+D3+F3+A3 | G2+Bb2+D3+F3 | A2+D3+E3+A3' },
    { i: 'glass', len: 2, n: `
      D5 A5 F5 C6 A5 F5 E5 A4 | D5 F5 A5 Bb5 A5 F5 D5 Bb4 | D5 G5 Bb5 D6 Bb5 G5 F5 D5 | E5 A5 D6 E6 D6 A5 E5 D5 ` },
    { i: 'theremin', n: 'A5_12 G5_4 | F5_16 | D5_8 F5_8 | E5_16 | A5_12 C6_4 | D6_16 | Bb5_8 G5_8 | A5_16' },
    { i: 'sub', len: 16, n: 'D3 | Bb2 | G2 | A2' },
    { d: 'kick', p: 'x.........x.....', vol: 0.5 },
  ],
};

// «Хелловін» — моторошний орган ре мінор (гармонічний), піцикато й годинник: Dm Dm Gm A7 Dm Bb Gm A7
const halloween = {
  name: 'Хелловін', vol: 1.84, bpm: 132, beat: 4, bar: 16,
  tracks: [
    { i: 'organ', len: 2, n: `
      D5 F5 A5 D6 C#6 D6 A5 F5 | E5 F5 E5 D5 C#5 D5 A4 - | G4 Bb4 D5 G5 F5 G5 D5 Bb4 | A4 C#5 E5 G5 - - F5 E5 |
      F5 - A5 - D6 - A5 - | Bb5 - A5 - G5 - F5 - | G5 F5 E5 D5 Bb4 - G4 - | A4 - C#5 - E5 - . . ` },
    { i: 'pizzb', len: 4, n: `
      D3 A2 D3 A2 | D3 A2 D3 A2 | G2 D3 G2 D3 | A2 E3 A2 C#3 | D3 A2 D3 A2 | Bb2 F3 Bb2 F3 | G2 D3 G2 Bb2 | A2 E3 A2 C#3 ` },
    { i: 'bell', len: 16, vol: 0.18, n: 'D4 | . | . | . | D4 | . | . | A3' },
    { d: 'tom', p: 'x.......x.......' },
    { d: 'tick', p: 'o.o.o.o.o.o.o.o.' },
  ],
};

// «Гаваї» — укулеле й слайд-гітара фа мажор, шейкер: F F Bb F C7 C7 F C7
const F = 'A4+C5+F5', Bb = 'Bb4+D5+F5', C7 = 'G4+Bb4+E5';
const hawaii = {
  name: 'Гаваї', vol: 1.68, bpm: 96, beat: 4, bar: 16, echo: [0.47, 0.25],
  tracks: [
    { i: 'steel', len: 2, n: `
      C5 - F5 - A5 - - G5 | F5 - - - . . A4 C5 | D5 - F5 - Bb5 - A5 G5 | A5 - - - - - . . |
      G5 - - E5 G5 - Bb5 - | A5 G5 E5 - C5 - . . | F5 - A5 - C6 - A5 - | G5 - - - E5 - . . ` },
    { i: 'uke', len: 2, n: pat('X . X X . X X X', F, F, Bb, F, C7, C7, F, C7) },
    { i: 'pizzb', len: 4, vol: 0.45, n: `
      F2 . C3 . | F2 . C3 . | Bb2 . F3 . | F2 . C3 . | C3 . G2 . | C3 . G2 . | F2 . C3 . | C3 . G2 . ` },
    { d: 'shaker', p: 'o.x.o.x.o.x.o.xo' },
    { d: 'kick', p: 'x.......x.......', vol: 0.6 },
  ],
};

// «Зошит» — грайлива марімба до мажор: C Am Dm G7
const notebook = {
  name: 'Зошит', vol: 1.74, bpm: 124, beat: 4, bar: 16,
  tracks: [
    { i: 'marimba', len: 2, n: `
      E5 . G5 . C6 . G5 E5 | A5 . E5 . C5 . E5 A5 | F5 . A5 . D6 . A5 F5 | G5 . B5 . D6 C6 B5 G5 |
      C6 - B5 C6 G5 - E5 G5 | A5 - G5 A5 E5 - C5 E5 | D5 F5 A5 C6 B5 A5 G5 F5 | G5 - F5 - D5 - . . ` },
    { i: 'pizzb', len: 4, n: 'C3 G2 C3 G2 | A2 E3 A2 E3 | D3 A2 D3 A2 | G2 D3 G2 B2' },
    { i: 'pizz', len: 2, n: pat('. X . . . X . .', 'C4+E4', 'C4+E4', 'D4+F4', 'D4+F4') },
    { d: 'kick', p: 'x.......x.......', vol: 0.7 },
    { d: 'clap', p: '....x.......x...', vol: 0.5 },
    { d: 'shaker', p: '..x...x...x...x.' },
  ],
};

// «Українське село» — гопак на акордеоні ре мінор з підвищеним IV (українська дорійська), бас «умпа», бубон
const Dm = 'D4+F4+A4', A7 = 'C#4+E4+G4', Gm = 'D4+G4+Bb4';
const village = {
  name: 'Українське село', vol: 1.62, bpm: 144, beat: 4, bar: 8,
  tracks: [
    { i: 'accord', len: 2, n: `
      D5 F5 A5 F5 | G#5 A5 F5 D5 | E5 C#5 E5 A5 | F5 E5 D5 - | G5 Bb5 D6 Bb5 | A5 G#5 A5 F5 | E5 F5 G5 E5 | D5 - D5 . |
      A5_1 G#5_1 A5_1 B5_1 C6_1 B5_1 A5_1 G#5_1 | A5 F5 D5 . | E5_1 F5_1 G5_1 A5_1 G5_1 F5_1 E5_1 C#5_1 | D5_4 A4_4 |
      D5_1 E5_1 F5_1 G5_1 A5_1 Bb5_1 A5_1 G5_1 | F5 E5 D5 F5 | E5 A4 C#5 E5 | D5_4 ._4 ` },
    { i: 'accord', len: 2, vol: 0.06, gate: 0.6, vib: null, n: pat('. X . X', Dm, Dm, A7, Dm, Gm, Dm, A7, Dm) },
    { i: 'pizzb', len: 2, n: 'D3 . A2 . | D3 . A2 . | A2 . E3 . | D3 . A2 . | G2 . D3 . | D3 . A2 . | A2 . E3 . | D3 . A2 .' },
    { d: 'kick', p: 'x...x...', vol: 0.7 },
    { d: 'tamb', p: '..x...X.' },
  ],
};

// «Єгипет» — уд у ладі хіджаз від ре (D Eb F# G A Bb C) над бурдоном, дарбука — ритм максум
const egypt = {
  name: 'Єгипет', vol: 2.66, bpm: 100, beat: 4, bar: 16,
  tracks: [
    { i: 'oud', len: 2, n: `
      D5 Eb5 F#5 - G5 F#5 Eb5 D5 | F#5 G5 A5 - - - G5 F#5 | G5 A5 Bb5 A5 G5 F#5 G5 - | F#5 - Eb5 - D5 - . . |
      A5 - Bb5 A5 G5 A5 F#5 G5 | Eb5 - F#5 - D5 - - - | C5 D5 Eb5 D5 C5 Bb4 A4 - | Eb5 D5 C5 D5 - - . . ` },
    { i: 'drone', n: 'D3+A3_16 | -_16 | -_16 | -_16' },
    { i: 'oud', vol: 0.22, lp: 900, n: 'D3_6 D3_2 A2_8' },
    { d: 'dum', p: 'x.......x.......' },
    { d: 'tek', p: '..x.o.x...o.x.o.' },
  ],
};

// «Дикий Захід» — свист над галопом (тріолі), ля мінор: Am Am G Am F G E Am
const Am = 'A3+C4+E4', G = 'G3+B3+D4', Fw = 'F3+A3+C4', E = 'E3+G#3+B3';
const west = {
  name: 'Дикий Захід', vol: 1.29, bpm: 108, beat: 3, bar: 12, echo: [0.42, 0.3],
  tracks: [
    { i: 'whistle', len: 3, n: `
      E5_6 A5 B5 | C6_9 B5 | D6_6 B5 G5 | A5_12 | C6_6 A5 C6 | D6_6 B5 D6 | E6_6 D6_2 C6_2 B5_2 | A5_9 . ` },
    { i: 'twang', len: 3, n: pat('. X . X', Am, Am, G, Am, Fw, G, E, Am) },
    { i: 'pizzb', len: 3, n: `
      A2 E3 A2 E3 | A2 E3 A2 E3 | G2 D3 G2 D3 | A2 E3 A2 E3 | F2 C3 F2 C3 | G2 D3 G2 D3 | E2 B2 E2 G#2 | A2 E3 A2 E3 ` },
    { d: 'clop', p: 'X.xx.xX.xx.x' },
    { d: 'kick', p: 'x.....x.....', vol: 0.6 },
  ],
};

// «Солодощі» — дзвіночки фа мажор, пружний бас, плескання: F Dm Bb C
const candy = {
  name: 'Солодощі', vol: 1.48, bpm: 128, beat: 4, bar: 16, echo: [0.35, 0.25],
  tracks: [
    { i: 'bell', len: 2, echo: 0.25, n: `
      C6 A5 F5 A5 C6 - F6 - | D6 C6 A5 F5 D5 - F5 - | D6 - F6 D6 Bb5 - D6 - | C6 - E6 - G6 - - - |
      A5 C6 F6 C6 A5 C6 F6 - | F6 E6 D6 A5 F5 A5 D6 - | Bb5 D6 F6 D6 C6 Bb5 A5 G5 | E6 - C6 - . . . . ` },
    { i: 'bounce', len: 2, n: `
      F2 . F3 . F2 F3 . F3 | D2 . D3 . D2 D3 . D3 | Bb2 . Bb3 . Bb2 Bb3 . Bb3 | C3 . C4 . C3 C4 . E3 ` },
    { i: 'pulse', len: 2, vol: 0.08, n: pat('. X . X . X . X', 'F4+A4+C5', 'D4+F4+A4', 'D4+F4+Bb4', 'E4+G4+C5') },
    { d: 'kick', p: 'x.......x.......' },
    { d: 'clap', p: '....x.......x...', vol: 0.7 },
    { d: 'hat', p: '..x...x...x...x.' },
  ],
};

// «Під водою» — мрійливе арпеджіо з луною, пласти й «китовий» голос: Fmaj7 Em7 Dm7 Cmaj7, бульбашки
const ocean = {
  name: 'Під водою', vol: 1.11, bpm: 84, beat: 4, bar: 16, echo: [0.54, 0.45],
  tracks: [
    { i: 'glass', len: 2, n: `
      F4 A4 C5 E5 A5 E5 C5 A4 | E4 G4 B4 D5 G5 D5 B4 G4 | D4 F4 A4 C5 F5 C5 A4 F4 | C4 E4 G4 B4 E5 B4 G4 E4 ` },
    { i: 'pad2', len: 16, n: 'F3+A3+E4 | E3+G3+D4 | D3+F3+C4 | C3+G3+B3' },
    { i: 'theremin', vib: [3.5, 30, 0.4], n: 'C6_8 A5_8 | B5_12 G5_4 | A5_8 F5_8 | G5_16 | C6_8 E6_8 | D6_12 B5_4 | A5_8 C6_4 A5_4 | G5_16' },
    { i: 'sub', len: 16, n: 'F2 | E2 | D2 | C2' },
    { d: 'bub', p: '..x.....x..x....' },
  ],
};

// «Стімпанк» — механічний марш до мінор: мідні духові (мелодія й акорди), туба вісімками, «годинникове» арпеджіо,
// ковадло, пара: Cm Cm Ab Bb Fm Cm G G
const steampunk = {
  name: 'Стімпанк', vol: 2.15, bpm: 116, beat: 4, bar: 16,
  tracks: [
    { i: 'brass', len: 2, gate: 0.75, n: `
      G4 - C5 - Eb5 - G5 - | F5 Eb5 D5 Eb5 C5 - G4 - | Ab4 - C5 - Eb5 - Ab5 - | G5 F5 Eb5 F5 D5 - Bb4 - |
      C5 - F5 - Ab5 - C6 - | Bb5 Ab5 G5 Ab5 G5 - Eb5 - | D5 - G5 - F5 Eb5 D5 B4 | C5 - D5 - B4 - . . ` },
    { i: 'brass', len: 8, vol: 0.06, lp: 1100, n: pat('X X', 'G3+C4+Eb4', 'G3+C4+Eb4', 'Ab3+C4+Eb4', 'F3+Bb3+D4',
      'F3+Ab3+C4', 'G3+C4+Eb4', 'G3+B3+D4', 'G3+B3+F4') },
    { i: 'pizz', len: 2, n: `
      C4 G4 Eb4 G4 C4 G4 Eb4 G4 | C4 G4 Eb4 G4 C4 G4 Eb4 G4 | Ab3 Eb4 C4 Eb4 Ab3 Eb4 C4 Eb4 | Bb3 F4 D4 F4 Bb3 F4 D4 F4 |
      F3 C4 Ab3 C4 F3 C4 Ab3 C4 | C4 G4 Eb4 G4 C4 G4 Eb4 G4 | G3 D4 B3 D4 G3 D4 B3 D4 | G3 D4 B3 D4 G3 F4 D4 B3 ` },
    { i: 'tuba', len: 2, n: `
      C2 C2 C3 C2 G2 C2 Bb2 G2 | C2 C2 C3 C2 G2 C2 Bb2 G2 | Ab2 Ab2 Ab3 Ab2 Eb3 Ab2 G2 Eb2 | Bb2 Bb2 Bb3 Bb2 F3 Bb2 A2 F2 |
      F2 F2 F3 F2 C3 F2 Eb3 C3 | C2 C2 C3 C2 G2 C2 Bb2 G2 | G2 G2 G3 G2 D3 G2 F2 D2 | G2 G2 G3 G2 D3 G2 B2 D3 ` },
    { d: 'kick', p: 'x.......x.......', vol: 0.5 },
    { d: 'snare', p: '....x.......x... | ....x.......xoxx', vol: 0.8 },
    { d: 'anvil', p: '......x.......x.' },
    { d: 'hat', p: 'o.o.o.o.o.o.o.o.', vol: 0.6 },
    { d: 'hiss', p: '................ | ................ | ................ | ............x...' },
  ],
};

// «Лабораторія порталів» — дивний синт-фанк мі дорійський: Em7 A7 Cmaj7 B7, «квакаюча» пила з під'їздом і широким вібрато,
// пульсуючий октавний бас шістнадцятими, клавінет-стаби на слабкі долі, комп'ютерні «біпи», булькотіння колб
const lab = {
  name: 'Лабораторія порталів', vol: 2.21, bpm: 104, beat: 4, bar: 16, echo: [0.43, 0.3],
  tracks: [
    { i: 'saw', len: 2, gl: 0.07, vib: [7, 35, 0.12], lp: 1900, echo: 0.3, n: `
      E5 - G5 A5 B5 - . D6 | C#6 - B5 A5 G5 - E5 . | G5 - B5 - E6 - D6 B5 | D#6 - F#6 - - D#6 B5 . |
      E6 . E6 D6 B5 . G5 A5 | B5 - A5 G5 E5 - C#5 E5 | G5 E5 C6 - B5 G5 E5 C5 | B4 - D#5 F#5 A5 - B5 . ` },
    { i: 'sbass', len: 1, vol: 0.26, lp: 750, n: `
      E2 - E3 . . E2 . G2 A2 . E3 . D3 . B2 A2 | A2 - A3 . . A2 . C#3 E3 . A3 . G3 . E3 C#3 |
      C3 - C4 . . C3 . E3 G3 . C4 . B3 . G3 E3 | B2 - B3 . . B2 . D#3 F#3 . B3 . A3 . F#3 D#3 ` },
    { i: 'pulse', len: 1, w: 'pulse25', vol: 0.1, lp: 2600, n: pat('. . X . . X . . . . X . X . . .', 'G4+B4+D5', 'G4+C#5+E5', 'G4+B4+E5', 'F#4+A4+D#5') },
    { i: 'pulse', len: 2, w: 'square', vol: 0.05, lp: 4500, echo: 0.4, n: `
      . . . . . . B6 E7 | . . . . . . . . | . . . . G6 . . C7 | . . . . . . . . |
      . . . . . . E7 B6 | . . . . . . . . | . . C7 . G6 . . . | . . . . . . D#7 F#7 ` },
    { d: 'kick', p: 'x.....x...x..... | x.....x...x...x.' },
    { d: 'snare', p: '....x..o....x... | ....x..o....x.o.' },
    { d: 'hat', p: 'o.x.o.x.o.x.o.xo' },
    { d: 'bub', p: '..x.....x..x.... | ......x...x.x... | ..x..x......x... | ........x.x..x.x' },
  ],
};

// «Японія» — лад хірадзьоші від ля (A B C E F): кото перебором, флейта сякухачі з під'їздом і вібрато, низьке кото,
// тайко й дерев'яні клапачки
const japan = {
  name: 'Японія', vol: 1.39, bpm: 92, beat: 4, bar: 16, echo: [0.39, 0.3],
  tracks: [
    { i: 'shaku', n: `
      E5_8 F5_4 E5_4 | C5_12 B4_4 | A4_8 C5_4 F5_4 | E5_16 |
      A5_8 B5_4 A5_4 | F5_8 E5_4 C5_4 | B4_4 C5_4 E5_4 F5_4 | E5_12 ._4 ` },
    { i: 'koto', len: 2, n: `
      A4 E5 C5 E5 A5 E5 C5 E5 | A4 E5 C5 E5 B5 E5 C5 B4 | F4 C5 A4 C5 F5 C5 A4 C5 | E4 B4 F5 B4 E5 B4 F4 B4 |
      A4 E5 C5 E5 A5 E5 C5 E5 | C5 F5 E5 F5 A5 F5 E5 C5 | F4 C5 A4 C5 B4 C5 A4 F4 | E4 B4 E5 F5 E5 B4 A4 . ` },
    { i: 'koto', len: 4, vol: 0.3, lp: 900, dc: 0.9, echo: 0, n: `
      A2 . . E3 | A2 . . E3 | F2 . . C3 | E2 . . B2 | A2 . . E3 | C3 . . E3 | F2 . . C3 | E2 . B2 E2 ` },
    { d: 'dum', p: 'X.....x.x....... | X.....x.x...x.x.' },
    { d: 'tom', p: '....x.......x... | ....x.......x...', vol: 0.7 },
    { d: 'wood', p: '..o...o...o...o. | ..o...o...o...xx', vol: 0.5 },
  ],
};

// «Доба динозаврів» — кістяна флейта ля мінор (пентатоніка) над бас-марімбою, племінні барабани: Am Am C G Am F G Am
const dino = {
  name: 'Доба динозаврів', vol: 1.2, bpm: 112, beat: 4, bar: 16, echo: [0.4, 0.3],
  tracks: [
    { i: 'bone', len: 2, n: `
      A4 - C5 D5 E5 - - - | G5 - E5 D5 E5 - . . | A5 - G5 E5 D5 - C5 D5 | E5 - - - . . . . |
      C5 D5 E5 - G5 - E5 D5 | C5 - A4 - C5 D5 - - | E5 G5 A5 - G5 E5 D5 C5 | A4 - - - . . . . ` },
    { i: 'marimba', len: 2, vol: 0.5, n: `
      A2 . A2 E3 . A2 G2 . | A2 . A2 E3 . A2 G2 . | C3 . C3 G3 . C3 E3 . | G2 . G2 D3 . G2 B2 . |
      A2 . A2 E3 . A2 G2 . | F2 . F2 C3 . F2 A2 . | G2 . G2 D3 . G2 B2 . | A2 . A2 E3 . A2 G2 . ` },
    { i: 'marimba', len: 2, vol: 0.12, n: pat('. . X . . . X .', 'A4+E5', 'A4+E5', 'G4+C5', 'G4+D5', 'A4+E5', 'A4+C5', 'G4+D5', 'A4+E5') },
    { d: 'dum', p: 'X.......x..x....' },
    { d: 'tom', p: '....x..x....x.xx', vol: 0.8 },
    { d: 'wood', p: 'x..x..x...x.x...', vol: 0.7 },
    { d: 'shaker', p: 'o.x.o.x.o.x.o.x.' },
  ],
};

// «Іграшкова кімната» — іграшкове піаніно (розстроєне, з «металевими» обертонами) і ксилофон соль мажор (акорди на слабких
// долях), бас піцикато, дерев'яна коробочка: G C D G Em C A7 D
const toys = {
  name: 'Іграшкова кімната', vol: 1.46, bpm: 132, beat: 4, bar: 16, echo: [0.34, 0.2],
  tracks: [
    { i: 'toypiano', len: 2, n: `
      D5 G5 B5 G5 D6 - B5 G5 | E5 G5 C6 - E6 - C6 G5 | F#5 A5 D6 - C6 B5 A5 F#5 | G5 - B5 - G5 - . . |
      E5 G5 B5 E6 D6 B5 G5 E5 | C6 - E6 - G6 - E6 C6 | C#6 - E6 - A5 - G5 - | F#5 E5 D5 E5 F#5 - A5 - ` },
    { i: 'xylo', len: 2, n: `
      . G4 . B4 . D5 . B4 | . G4 . C5 . E5 . C5 | . F#4 . A4 . D5 . A4 | . G4 . B4 . D5 . B4 |
      . G4 . B4 . E5 . B4 | . G4 . C5 . E5 . C5 | . G4 . C#5 . E5 . C#5 | . F#4 . A4 . D5 . A4 ` },
    { i: 'pizzb', len: 4, n: 'G2 D3 G2 D3 | C3 G2 C3 G2 | D3 A2 D3 A2 | G2 D3 G2 B2 | E2 B2 E3 B2 | C3 G2 C3 E3 | A2 E3 A2 C#3 | D3 A2 D3 F#3' },
    { d: 'wood', p: 'x...o...x...o.oo', vol: 0.7 },
    { d: 'kick', p: 'x.......x.......', vol: 0.6 },
    { d: 'shaker', p: '..x...x...x...x.' },
  ],
};

export const TUNES = [classic, cyber, retro, winter, space, halloween, hawaii, notebook, village, egypt, west, candy, ocean,
  steampunk, lab, japan, dino, toys];
