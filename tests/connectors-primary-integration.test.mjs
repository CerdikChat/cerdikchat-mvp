import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const icon = await readFile(new URL("../src/connector-hub.svg", import.meta.url), "utf8");

test("Primary Connectors menu is reachable from sidebar and mobile header", () => {
  assert.match(html, /id="connectorsOpenSide"/);
  assert.match(html, /id="connectorsOpenTop"/);
  assert.match(html, /aria-controls="connectorsDialog"/);
});

test("Primary Connectors dialog is accessible and closable", () => {
  assert.match(html, /<dialog class="connectors-dialog" id="connectorsDialog"/);
  assert.match(html, /aria-labelledby="connectorsTitle"/);
  assert.match(html, /connectorsDialog\.showModal\(\)/);
  assert.match(html, /connectorsDialog\.close\(\)/);
});

test("Connector status remains honest and does not claim live health", () => {
  assert.match(html, /Belum ada bukti koneksi runtime/);
  assert.match(html, /Ketersediaan binding dan inferensi harus diverifikasi/);
  assert.match(html, /Status hijau hanya boleh ditampilkan setelah health check berhasil/);
});

test("Primary Connectors icon is a scalable SVG asset", () => {
  assert.match(icon, /<svg[^>]+viewBox="0 0 128 128"/);
  assert.match(html, /src="\/connector-hub\.svg"/);
});

test("Connectors menu remains responsive on narrow Android screens", () => {
  assert.match(html, /\.top-actions\s*\{[\s\S]*?flex-wrap:\s*wrap/);
  assert.match(html, /\.connector-mobile\s*\{[\s\S]*?display:\s*inline-flex\s*!important/);
  assert.match(html, /@media\s*\(max-width:\s*380px\)/);
});
