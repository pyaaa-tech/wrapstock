import React from "react";
import { createRoot } from "react-dom/client";
import { loadFonts } from "../core/fonts";
import { color, font } from "../core/tokens";
import { App } from "./App";
import { webPlatform } from "./platform";
import "./styles.css";

// The site's CSS reads the same design tokens as the film.
const root = document.documentElement;
Object.entries(color).forEach(([k, v]) => root.style.setProperty(`--${k}`, v));
Object.entries(font).forEach(([k, v]) => root.style.setProperty(`--font-${k}`, v));

loadFonts(webPlatform.asset)
  .catch(() => undefined) // fall back to system fonts rather than a blank page
  .then(() => createRoot(document.getElementById("root")!).render(<App />));
