import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("workspace status deck stays visible outside the collapsed tools drawer", async () => {
  const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
  const statusStart = html.indexOf('<section class="status-deck"');
  const drawerStart = html.indexOf('<details class="workspace-tools-drawer main-workspace-tools" id="workspaceTools">');
  assert.ok(statusStart >= 0 && drawerStart > statusStart);
  const statusEnd = html.indexOf("</section>", statusStart);
  assert.ok(statusEnd > statusStart && statusEnd < drawerStart);
  const drawerEnd = html.indexOf("</details>", drawerStart);
  const drawer = html.slice(drawerStart, drawerEnd);
  assert.doesNotMatch(drawer, /class="status-deck"/);
  assert.match(drawer, /<summary class="workspace-tools-trigger"/);
  assert.match(drawer, /<section class="workspace-tools"/);
  assert.doesNotMatch(html, /<\/summary>\\n/);
});
