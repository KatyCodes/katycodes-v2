import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function luminance(hex: string) {
  const channels = hex.match(/[a-f\d]{2}/gi)!.map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("core text colors meet WCAG AA contrast", () => {
  assert.ok(contrast("#171b3a", "#fffdf4") >= 4.5);
  assert.ok(contrast("#67556c", "#ffffff") >= 4.5);
  assert.ok(contrast("#aeb4d1", "#171b3a") >= 4.5);
  assert.ok(contrast("#c9f65a", "#171b3a") >= 4.5);
  assert.ok(contrast("#f9fbff", "#18213d") >= 4.5);
  assert.ok(contrast("#d9def0", "#273154") >= 4.5);
  assert.ok(contrast("#171b3a", "#c9f65a") >= 4.5);
  assert.ok(contrast("#171b3a", "#ffe08a") >= 4.5);
});

test("page includes keyboard and screen-reader support", () => {
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /body\[data-theme="midnight"\] \.try-bubble/);
  assert.match(css, /body\[data-theme="midnight"\] \.command-line button/);
  assert.match(html, /property="og:image"/);
  assert.ok(existsSync(new URL("../public/og.png", import.meta.url)));
  assert.ok(existsSync(new URL("../public/Katy_Henning_Resume.pdf", import.meta.url)));
  assert.match(html, /Full-stack software engineer building reliable web applications, integrations, and practical AI-assisted workflows\./);
});

test("launch metadata and static fallbacks are present", () => {
  assert.match(html, /rel="canonical" href="https:\/\/katycodes\.com\/"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /name="theme-color"/);
  for (const asset of ["404.html", "robots.txt", "sitemap.xml", ".htaccess", "favicon.ico", "favicon-32.png", "apple-touch-icon.png"]) {
    assert.ok(existsSync(new URL(`../public/${asset}`, import.meta.url)), `${asset} should exist`);
  }
  const redirects = readFileSync(new URL("../public/.htaccess", import.meta.url), "utf8");
  assert.match(redirects, /ErrorDocument 404 \/404\.html/);
  assert.match(redirects, /https:\/\/katycodes\.com/);
});

test("terminal window controls are operable and named", () => {
  assert.match(html, /data-terminal-action="pause"[^>]+aria-label="Pause terminal session"/);
  assert.match(html, /data-terminal-action="minimize"[^>]+aria-label="Minimize terminal"/);
  assert.match(html, /data-terminal-action="expand"[^>]+aria-label="Expand terminal"/);
});

test("portfolio window controls are operable and status motion is accessible", () => {
  assert.match(html, /data-window-action="pause"[^>]+aria-label="Pause portfolio window"/);
  assert.match(html, /data-window-action="minimize"[^>]+aria-label="Minimize portfolio window"/);
  assert.match(html, /data-window-action="expand"[^>]+aria-label="Expand portfolio window"/);
  assert.match(css, /@keyframes status-pulse/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("geography map exposes named zoom controls", () => {
  const client = readFileSync(new URL("../app/client.ts", import.meta.url), "utf8");
  assert.match(client, /"Zoom map in"/);
  assert.match(client, /"Zoom map out"/);
  assert.match(client, /"Reset map zoom"/);
});
