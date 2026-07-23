import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Tauri expects a fixed dev-server port and a relative asset base so the
// production bundle loads from the app's local filesystem inside the webview.
// The same Vite dev server is also what codeyam renders in the live preview.
const host = process.env.TAURI_DEV_HOST;

// index.html ships a strict `default-src 'self'` CSP. That is correct for the
// built app, but in a plain browser (codeyam's live preview / capture harness)
// it blocks the harness's injected inline instrumentation script, so no desktop
// scenario can be captured. Relax the CSP to allow inline scripts ONLY on the
// dev server: `apply: 'serve'` means the transform never touches the built
// `dist/index.html`, and the shipped Tauri webview is governed by
// `tauri.conf.json`'s CSP regardless — so production security is unchanged.
function devPreviewCsp(): Plugin {
  return {
    name: 'wellframe-dev-preview-csp',
    apply: 'serve',
    transformIndexHtml(html) {
      return html.replace(
        /(<meta http-equiv="Content-Security-Policy" content=")[^"]*(")/,
        "$1default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'$2",
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), devPreviewCsp()],
  base: './',
  clearScreen: false,
  // The desktop app uses plain CSS (no Tailwind/PostCSS). Pin an inline empty
  // PostCSS config so vite does NOT search up the tree and pick up the root
  // Next.js app's postcss.config.mjs (which needs @tailwindcss/postcss — a root
  // dep that isn't installed when CI only `npm ci`s the desktop app).
  css: { postcss: {} },
  server: {
    host: host || '127.0.0.1',
    // Honor the port codeyam's preview proxy injects via PORT; fall back to
    // Tauri's fixed 1420 for real local `tauri dev`.
    port: process.env.PORT ? Number(process.env.PORT) : 1420,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    target: 'es2021',
    sourcemap: true,
  },
});
