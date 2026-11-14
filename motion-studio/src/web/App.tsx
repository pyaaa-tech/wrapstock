import gsap from "gsap";
import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Film } from "../core/Film";
import { PlatformProvider } from "../core/platform";
import { CAPTIONS, SCENES } from "../core/storyboard";
import { STAGE } from "../core/tokens";
import { engine } from "./engine";
import { webPlatform } from "./platform";

const use = <T,>(snapshot: () => T) => useSyncExternalStore(engine.subscribe, snapshot);

const sceneIndexAt = (t: number) => {
  let i = 0;
  SCENES.forEach((s, k) => {
    if (t >= s.start) i = k;
  });
  return i;
};
const captionIndexAt = (t: number) => CAPTIONS.findIndex((c) => t >= c.start && t < c.end + 0.25);
const clock = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
/** the paused opening frame shown before playback */
const POSTER = 1.75;
const ACCENT: Record<string, string> = { Denyut: "var(--vermilion)", Tabiat: "var(--sage)", Amaran: "var(--vermilion)", Tenang: "var(--sage)", "Seri Lestari": "var(--gold)" };

/** The 1080×1920 stage, scaled to whatever space it is given. */
const Stage: React.FC<{ started: boolean; onStart: () => void }> = ({ started, onStart }) => {
  const wrap = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(0.3);
  const playing = use(engine.isPlaying);
  const ended = use(() => engine.getTime() >= engine.duration - 0.01);

  useLayoutEffect(() => {
    const el = wrap.current!;
    const fit = () => setScale(Math.min(el.clientWidth / STAGE.width, el.clientHeight / STAGE.height));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the play button breathes until the film starts
  useEffect(() => {
    if (!cover.current || started) return;
    const ctx = gsap.context(() => {
      gsap.to(".cover__ring", { scale: 1.5, opacity: 0, duration: 1.6, ease: "power2.out", repeat: -1 });
      gsap.from(".cover__inner", { y: 24, opacity: 0, duration: 1, ease: "expo.out", delay: 0.4 });
    }, cover);
    return () => ctx.revert();
  }, [started]);

  return (
    <div className="stage-wrap" ref={wrap}>
      <div className="stage-box" style={{ width: STAGE.width * scale, height: STAGE.height * scale }}>
        <div className="stage" style={{ width: STAGE.width, height: STAGE.height, transform: `scale(${scale})` }} onClick={() => started && engine.toggle()}>
          <PlatformProvider value={webPlatform}>
            <Film />
          </PlatformProvider>
        </div>
        {!started && (
          <button className="cover" ref={cover} onClick={onStart} aria-label="Main filem dengan suara">
            <span className="cover__inner">
              <span className="cover__btn">
                <span className="cover__ring" />
                <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>
              </span>
              <span className="cover__label">Main dengan suara · 1:10</span>
            </span>
          </button>
        )}
        {started && !playing && (
          <button className="resume" onClick={() => engine.play()} aria-label={ended ? "Main semula" : "Sambung"}>
            {ended ? "↺ Main semula" : "▶ Sambung"}
          </button>
        )}
      </div>
    </div>
  );
};

/** Play / scrub / sound. The bar is moved by GSAP on its ticker, not by React renders. */
const Transport: React.FC<{ onStart: () => void; started: boolean }> = ({ onStart, started }) => {
  const fill = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const playing = use(engine.isPlaying);
  const sfx = use(engine.isSfxOn);
  const second = use(() => Math.floor(engine.getTime()));

  useEffect(() => {
    const set = gsap.quickSetter(fill.current, "scaleX");
    const tick = () => set(engine.getTime() / engine.duration);
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const scrub = (e: React.PointerEvent) => {
    const r = bar.current!.getBoundingClientRect();
    engine.seek(((e.clientX - r.left) / r.width) * engine.duration);
  };

  return (
    <div className="transport">
      <button className="transport__play" onClick={() => (started ? engine.toggle() : onStart())} aria-label={playing ? "Jeda" : "Main"}>
        {playing ? (
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>
        )}
      </button>
      <div
        className="transport__bar"
        ref={bar}
        role="slider"
        tabIndex={0}
        aria-label="Kedudukan filem"
        aria-valuemin={0}
        aria-valuemax={Math.round(engine.duration)}
        aria-valuenow={second}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          scrub(e);
        }}
        onPointerMove={(e) => e.buttons === 1 && scrub(e)}
      >
        <div className="transport__track" />
        <div className="transport__fill" ref={fill} />
        {SCENES.slice(1).map((s) => (
          <span key={s.id} className="transport__tick" style={{ left: `${(s.start / engine.duration) * 100}%` }} />
        ))}
      </div>
      <span className="transport__time">{clock(second)} / {clock(engine.duration)}</span>
      <button className="transport__sfx" onClick={() => engine.setSfx(!sfx)} aria-pressed={sfx} title="Reka bunyi (sound design)">
        SFX {sfx ? "on" : "off"}
      </button>
    </div>
  );
};

const Caption: React.FC = () => {
  const i = use(() => captionIndexAt(engine.getTime()));
  const el = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (el.current && i >= 0) gsap.fromTo(el.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
  }, [i]);
  return (
    <div className="caption" aria-live="off">
      <span className="eyebrow">Suara latar</span>
      <p ref={el}>{i >= 0 ? CAPTIONS[i].text : "…"}</p>
    </div>
  );
};

const Chapters: React.FC<{ onPick: (id: string) => void }> = ({ onPick }) => {
  const active = use(() => sceneIndexAt(engine.getTime()));
  const list = useRef<HTMLOListElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const item = list.current?.children[active] as HTMLElement | undefined;
    if (item && marker.current) gsap.to(marker.current, { y: item.offsetTop, height: item.offsetHeight, duration: 0.5, ease: "expo.out" });
  }, [active]);
  return (
    <nav className="chapters" aria-label="Babak">
      <span className="eyebrow">Papan cerita · {SCENES.length} babak</span>
      <div className="chapters__scroll">
        <span className="chapters__marker" ref={marker} />
        <ol ref={list}>
          {SCENES.map((s, i) => (
            <li key={s.id} className={i === active ? "is-active" : ""}>
              <button onClick={() => onPick(s.id)}>
                <span className="chapters__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="chapters__t">{s.title}</span>
                <span className="chapters__a">{i === 0 || SCENES[i - 1].act !== s.act ? s.act : ""}</span>
                <span className="chapters__s">{clock(s.start)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const act = use(() => SCENES[sceneIndexAt(engine.getTime())].act);
  const site = useRef<HTMLDivElement>(null);
  const vo = useRef<HTMLAudioElement>(null);
  const sfx = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    engine.attachAudio(vo.current!, sfx.current!);
    engine.seek(POSTER); // hold on a composed frame until the viewer presses play
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("button, [role=slider]") && e.code === "Space") return;
      if (e.code === "Space") { e.preventDefault(); if (engine.getTime() === POSTER && !engine.isPlaying()) engine.seek(0); start(); engine.toggle(); }
      if (e.code === "ArrowRight") engine.seek(engine.getTime() + 5);
      if (e.code === "ArrowLeft") engine.seek(engine.getTime() - 5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // editorial panel rises in
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-rise]", { y: 28, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.07, delay: 0.15 });
    }, site);
    return () => ctx.revert();
  }, []);

  const start = () => setStarted(true);
  const play = () => { if (!started) engine.seek(0); start(); engine.play(); };
  const pick = (id: string) => { start(); engine.seekScene(id); engine.play(); };

  return (
    <div className="site" ref={site} style={{ "--accent": ACCENT[act] } as React.CSSProperties}>
      <section className="theatre">
        <Stage started={started} onStart={play} />
        <Transport started={started} onStart={play} />
      </section>

      <aside className="panel">
        <header data-rise>
          <span className="eyebrow">Seri Lestari Spa · Batu Pahat</span>
          <h1>
            <span className="h1__a">Denyut</span>
            <span className="h1__arrow" aria-hidden="true">→</span>
            <em className="h1__b">Tenang</em>
          </h1>
          <p className="lede">Tiga tabiat yang boleh membantu mengurangkan serangan migrain — dalam 70 saat.</p>
        </header>
        <div data-rise><Caption /></div>
        <div data-rise><Chapters onPick={pick} /></div>
        <footer data-rise>
          <p className="note">Perkongsian ini untuk tujuan pendidikan sahaja. Jika sakit kepala datang secara tiba-tiba dan terasa paling teruk pernah dialami, dapatkan rawatan perubatan dengan segera.</p>
          <p className="cta"><strong>PM kami sekarang</strong> untuk pertanyaan atau tempahan · khas untuk Muslimah</p>
        </footer>
      </aside>

      <audio ref={vo} src={webPlatform.asset("audio/vo.mp3")} preload="auto" />
      <audio ref={sfx} src={webPlatform.asset("audio/sfx.mp3")} preload="auto" />
    </div>
  );
};
