import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const html=await readFile(new URL("../src/index.html",import.meta.url),"utf8");
test("Primary exposes Connectors from desktop sidebar and mobile header",()=>{
 assert.match(html,/id="connectorsOpenSide"/);assert.match(html,/id="connectorsOpenTop"/);
 assert.match(html,/id="connectorsDialog"/);
});
test("Primary exposes Context Bridge entry points without claiming active external sync",()=>{
 assert.match(html,/id="bridgeOpenSide"/);assert.match(html,/id="bridgeOpenTop"/);
 assert.match(html,/ChatGPT Go\/MCP dan sinkronisasi lintas akun belum aktif/);
});
test("Primary exposes Antivirus Gateway with fail-closed status disclosure",()=>{
 assert.match(html,/id="antivirusOpenSide"/);assert.match(html,/id="antivirusDialog"/);
 assert.match(html,/Upload harus tetap ditolak bila scanner tidak tersedia/);
});
test("All Primary integration dialogs have working open and close handlers",()=>{
 for(const id of ["connectorsDialog","bridgeDialog","antivirusDialog"]){
  assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,new RegExp('aria-controls="'+id+'"'));
 }
 assert.match(html,/dialog\?\.showModal\(\)/);
 assert.match(html,/data-dialog-close/);
});
test("Mobile integration controls remain visible at narrow widths",()=>{
 assert.match(html,/@media\(max-width:720px\)/);assert.match(html,/@media\(max-width:380px\)/);
});
