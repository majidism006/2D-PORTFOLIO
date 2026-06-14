// Cute 8-bit / chiptune background music generated live with the Web Audio API.
// No audio files needed — a Super Mario-inspired overworld bop: swung,
// staccato, leaping square-wave lead over a bouncy "oompah" bass in C major.
// (Original melody written to evoke that feel, not a copy of the real tune.)

let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let schedulerId = null;
let nextNoteTime = 0;
let step = 0;

const tempo = 100; // bpm — classic peppy platformer pace
const stepDur = 60 / tempo / 2; // straight eighth-note length (seconds)
const swing = 0.16; // shuffle: downbeats longer, offbeats shorter
const lookahead = 25; // scheduler tick (ms)
const scheduleAhead = 0.15; // how far to schedule ahead (seconds)

// Leaping, hoppy lead melody (eighth notes). `null` = rest.
const lead = [
  "C5", "E5", "G5", "E5", "C5", null, "E5", null,
  "D5", "F5", "A5", "F5", "D5", null, "G4", null,
  "E5", "G5", "C6", "G5", "E5", null, "C5", null,
  "G5", "F5", "E5", "D5", "C5", null, "G4", null,
];

// Bouncy "oompah" bass: low root on the beat, octave bounce on the offbeat.
const bass = [
  "C2", "C3", "C2", "C3", "C2", "C3", "C2", "C3", // C
  "F2", "C3", "F2", "C3", "F2", "C3", "F2", "C3", // F
  "C2", "G2", "C2", "G2", "C2", "G2", "C2", "G2", // C
  "G2", "D3", "G2", "D3", "G2", "D3", "G2", "D3", // G
];

function noteToFreq(note) {
  const offsets = {
    C: -9, "C#": -8, D: -7, "D#": -6, E: -5, F: -4,
    "F#": -3, G: -2, "G#": -1, A: 0, "A#": 1, B: 2,
  };
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 440;
  const semis = offsets[match[1]] + (parseInt(match[2], 10) - 4) * 12;
  return 440 * Math.pow(2, semis / 12);
}

function playTone(note, time, dur, type, vol) {
  if (!note) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(noteToFreq(note), time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(gain).connect(masterGain);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

// Swung step length: downbeats (even) ride a bit longer, offbeats snap shorter.
function stepLength(s) {
  const beat = stepDur * 2;
  return s % 2 === 0 ? beat * (0.5 + swing) : beat * (0.5 - swing);
}

function scheduleStep(time) {
  const i = step % lead.length;
  const len = stepLength(step);
  playTone(lead[i], time, len * 0.55, "square", 0.075); // staccato hoppy lead
  playTone(bass[i], time, len * 0.7, "triangle", 0.12); // plucky oompah bass
}

function scheduler() {
  while (nextNoteTime < audioCtx.currentTime + scheduleAhead) {
    scheduleStep(nextNoteTime);
    nextNoteTime += stepLength(step);
    step++;
  }
  schedulerId = setTimeout(scheduler, lookahead);
}

function ensureCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.45;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

// One-shot UI blip, independent of the music master so SFX play even when
// the music is toggled off.
function blip(freq, dur, type, vol, delay = 0) {
  ensureCtx();
  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Cheery rising two-note "boop" when a popup appears.
export function playOpenSound() {
  blip(740, 0.07, "square", 0.09, 0);
  blip(1109, 0.09, "square", 0.08, 0.06);
}

// Short, soft descending "blip" when a popup closes.
export function playCloseSound() {
  blip(620, 0.06, "square", 0.08, 0);
  blip(440, 0.07, "square", 0.07, 0.04);
}

// Triumphant rising arpeggio for finishing the whole checklist.
export function playFanfare() {
  const notes = ["C5", "E5", "G5", "C6", "E6", "C6", "G5", "C6"];
  notes.forEach((n, i) => {
    blip(noteToFreq(n), 0.16, "square", 0.09, i * 0.09);
  });
  blip(noteToFreq("E6"), 0.6, "triangle", 0.06, notes.length * 0.09 + 0.05);
}

export function startMusic() {
  ensureCtx();
  if (isPlaying) return;
  isPlaying = true;
  nextNoteTime = audioCtx.currentTime + 0.1;
  scheduler();
}

export function stopMusic() {
  isPlaying = false;
  if (schedulerId) clearTimeout(schedulerId);
  schedulerId = null;
}

export function toggleMusic() {
  if (isPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
  return isPlaying;
}

export function isMusicPlaying() {
  return isPlaying;
}
