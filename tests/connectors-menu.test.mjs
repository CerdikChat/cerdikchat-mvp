import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const icon = await readFile(new URL("../src/connector-hub.svg", import.meta.url), "utf8");

test("Connectors menu is reachable from desktop sidebar and mobile top bar", () => {
  assert.match(html, /id="connectorsOpenSide"/);
  assert.match(html, /id="connectorsOpenTop"/);
  assert.match(html, /aria-controls="connectorsDialog"/);
  assert.match(html, /class="connector-nav"/);
  assert.match(html, /class="connector-mobile"/);
});

test("Connectors panel has accessible dialog controls and close behavior", () => {
  assert.match(html, /<dialog class="connectors-dialog" id="connectorsDialog"/);
  assert.match(html, /aria-labelledby="connectorsTitle"/);
  assert.match(html, /id="connectorsClose"/);
  assert.match(html, /connectorsDialog\.showModal\(\)/);
  assert.match(html, /connectorsDialog\.close\(\)/);
});

test("Connector status copy does not falsely claim live connectivity", () => {
  assert.match(html, /Belum ada bukti koneksi runtime/);
  assert.match(html, /Ketersediaan binding dan inferensi harus diverifikasi/);
  assert.match(html, /Status hijau hanya boleh ditampilkan setelah health check berhasil/);
  assert.match(html, /Perlu verifikasi/);
});

test("Connector icon is a scalable, accessible SVG hub mark", () => {
  assert.match(icon, /<svg[^>]+viewBox="0 0 128 128"/);
  assert.match(icon, /central chain link|central chain/i);
  assert.match(icon, /linearGradient/);
  assert.match(html, /src="\/connector-hub\.svg"/);
});
