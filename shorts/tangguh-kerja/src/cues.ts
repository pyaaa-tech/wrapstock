import { F } from "./lib/time";
import { DURATION, OUTRO_START } from "./theme";

/**
 * Every cue is a voice onset (CTC forced alignment), so cuts, slams and pops land ON the word.
 * Scene windows start exactly on the first word of each beat.
 */
export const S = {
  s1: 0, // "Yoo, yoo. Deadline esok doww."
  s2: F("tibatiba"), // "Tiba-tiba rasa nak mengemas bilik jadi best pulak."
  s3a: F("haa"), // "Haa, ni bukan sebab kau malas."
  s3b: F("kajian"), // "Kajian psikologi cadangkan tangguh kerja ..."
  s3c: F("tugasan"), // "Tugasan yang bosan ... mood jatuh. Jadi, otak kita pilih ... lega sekejap."
  s4: F("masalahnya"), // "Masalahnya, tugasan tu memang takkan hilang. Dia still tunggu. ... semakin besar."
  s5: F("kononnya"), // "Kononnya, lega sekarang, susah kemudian. Jadinya, bila kau rasa nak lari,"
  s5b: F("cuba"), // "cuba buat sikit-sikit dulu." (smash cut)
  s6: F("tak2"), // "Tak lama pun. Lima minit pun jadilah."
  s7: F("kau3"), // "Kau pun pernah siapkan assignment sebab deadline, kan? Dapat catch up? Sila komen!"
  outro: OUTRO_START, // brand outro: whip-pan lands, logo pops (right after "komen!")
  end: DURATION,
};

/** Frames that get the 6-frame screen shake. */
export const HITS = [
  F("deadline"),
  F("esok"),
  F("malas"),
  F("jatuh"),
  F("hilang"),
  F("besar"),
  F("susah"),
  F("cuba"),
  F("lima"),
];
