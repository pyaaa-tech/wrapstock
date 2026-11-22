import { F } from "./lib/time";
import { DURATION, OUTRO_START } from "./theme";

/**
 * Every cue is a voice onset (CTC forced alignment), so cuts, slams and pops land ON the word.
 * Scene windows start exactly on the first word of each beat.
 */
export const S = {
  s1: 0, // "Kenapa lima minit tidur lagi... rasa macam hadiah?"
  s2: F("alarm"), // "Alarm bunyi, terus kau cakap, Lima minit je lagi." (smash cut)
  s3: F("sebenarnya"), // [whispers] "Sebenarnya, masa baru bangun, otak kau belum betul-betul on."
  s3b: F("orang"), // "Orang panggil sleep inertia... rasa mamai lepas bangun." (match cut)
  s4: F("lagi3"), // "Lagi teruk kalau kau terbangun masa tengah tidur nyenyak. Mamai tu ... lebih lama."
  s5: F("menariknya"), // "Menariknya, satu kajian kecil di Sweden jumpa, snooze sekejap tak nampak merosakkan."
  s5b: F("mungkin"), // "Mungkin sebab kau kurang terbangun dari tidur yang paling nyenyak."
  s6: F("tapi"), // "Tapi kajian tu kecil je... jadi belum muktamad."
  s7: F("lepas2"), // "Lepas bangun, buka langsir. Cahaya pagi bantu otak kau sedar."
  s8: F("dapat"), // "Dapat catch up? Sila komen!"
  outro: OUTRO_START, // brand outro: whip-pan lands, logo pops (right after "komen!")
  end: DURATION,
};

/** Frames that get the 6-frame screen shake. */
export const HITS = [F("alarm"), F("cakap"), F("sleep"), F("terbangun"), F("muktamad")];
