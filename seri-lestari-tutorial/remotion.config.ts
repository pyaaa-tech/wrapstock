/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import fs from "fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Persekitaran awan tanpa akses muat turun Chrome: guna Chromium sedia ada jika wujud.
// (Chromium penuh, bukan headless-shell, supaya stor sijil sistem dihormati untuk Google Fonts.)
const LOCAL_CHROME = "/opt/pw-browsers/chromium";
if (fs.existsSync(LOCAL_CHROME)) {
  Config.setBrowserExecutable(LOCAL_CHROME);
  Config.setChromeMode("chrome-for-testing");
}
