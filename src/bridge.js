import { TASK_SCHEMA, validateTaskEnvelope, makeTaskEnvelope, isDuplicateTask } from "./bridge-core.js";

const $ = (id) => document.getElementById(id);
const intent = $("intent"), agents = $("agents"), actionClass = $("actionClass");
const importJson = $("importJson"), importFile = $("importFile"), inbox = $("inbox"), status = $("status");
const PACKAGE_KEY = "cerdikgo-context-bridge-inbox-v1";
let currentEnvelope = null;
let tasks = readInbox();

function readInbox() {
  try { const value = JSON.parse(sessionStorage.getItem(PACKAGE_KEY) || "[]"); return Array.isArray(value) ? value.slice(0,30) : []; }
  catch { return []; }
}
function saveInbox() {
  try { sessionStorage.setItem(PACKAGE_KEY, JSON.stringify(tasks.slice(0,30))); }
  catch { setStatus("Penyimpanan sesi browser tidak tersedia. Tugas hanya tersimpan selama halaman terbuka.", true); }
}
function setStatus(message, error = false) { status.textContent = message; status.classList.toggle("error", error); }
function selectedAgents() { return [...agents.selectedOptions].map((option) => option.value); }
function makeId() { return "cg_" + crypto.randomUUID().replaceAll("-",""); }
function envelopeText(envelope = currentEnvelope) { return JSON.stringify(envelope, null, 2); }
function renderInbox() {
  inbox.replaceChildren();
  if (!tasks.length) { const empty=document.createElement("p"); empty.className="muted"; empty.textContent="Belum ada tugas dalam sesi ini."; inbox.append(empty); return; }
  for (const item of tasks) {
    const card=document.createElement("article"); card.className="task";
    const heading=document.createElement("strong"); heading.textContent=item.task.intent.slice(0,120);
    const meta=document.createElement("small"); meta.textContent=item.task.task_id+" · "+item.task.source+" · "+item.task.action_class;
    const body=document.createElement("p"); body.textContent=item.plan ? "Rencana: "+item.plan.status+" · "+item.plan.execution_mode : "Tervalidasi · belum dikirim ke endpoint rencana";
    const actions=document.createElement("div"); actions.className="actions";
    const planButton=document.createElement("button"); planButton.className="primary"; planButton.textContent=item.plan ? "Rencana dibuat" : "Buat rencana Preview"; planButton.disabled=Boolean(item.plan); planButton.addEventListener("click",()=>createPlan(item.task.task_id));
    const exportButton=document.createElement("button"); exportButton.textContent="Ekspor"; exportButton.addEventListener("click",()=>download(item));
    actions.append(planButton,exportButton); card.append(heading,meta,body,actions); inbox.append(card);
  }
}
function download(value) {
  const blob=new Blob([JSON.stringify(makeTaskEnvelope(value.task),null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="cerdikgo-task-"+(value.task?.task_id||"export")+".json"; a.click(); URL.revokeObjectURL(url);
}
function parseAndValidate(raw) {
  if (typeof raw!=="string" || raw.length>20000) throw new Error("File JSON melebihi batas 20 KB.");
  let value; try { value=JSON.parse(raw); } catch { throw new Error("JSON tidak valid."); }
  const result=validateTaskEnvelope(value); if(!result.ok) throw new Error("Paket ditolak: "+result.error);
  return makeTaskEnvelope(result.task, value.exported_at || new Date().toISOString());
}
function addToInbox(envelope) {
  if(isDuplicateTask(envelope.task.task_id,tasks)) throw new Error("Task ID duplikat; paket tidak dimasukkan.");
  tasks.unshift({schema:TASK_SCHEMA,task:envelope.task,plan:null}); tasks=tasks.slice(0,30); saveInbox(); renderInbox();
}
$("makePackage").addEventListener("click",()=>{
  try {
    const selected=selectedAgents();
    const task={task_id:makeId(),created_at:new Date().toISOString(),source:"chatgpt_go",intent:intent.value.trim(),agents:selected,action_class:actionClass.value};
    currentEnvelope=makeTaskEnvelope(task);
    importJson.value=envelopeText(); $("copyPackage").disabled=false; $("sharePackage").disabled=false; $("downloadPackage").disabled=false;
    setStatus("Paket JSON berhasil dibuat dan siap disalin, dibagikan, atau diekspor.");
  } catch(error) { setStatus("Paket belum dibuat: "+error.message,true); }
});
$("copyPackage").addEventListener("click",async()=>{
  try { await navigator.clipboard.writeText(envelopeText()); setStatus("JSON disalin ke clipboard."); }
  catch { importJson.value=envelopeText(); importJson.focus(); importJson.select(); setStatus("Clipboard tidak tersedia. JSON dipilih agar dapat disalin manual.",true); }
});
$("sharePackage").addEventListener("click",async()=>{
  if(!currentEnvelope) return;
  try { if(navigator.share) { await navigator.share({title:"CerdikGo task",text:envelopeText()}); setStatus("Dialog berbagi dibuka."); } else { await navigator.clipboard.writeText(envelopeText()); setStatus("Berbagi native tidak tersedia; JSON disalin."); } }
  catch(error) { if(error.name!=="AbortError") setStatus("Berbagi tidak tersedia pada browser ini.",true); }
});
$("downloadPackage").addEventListener("click",()=>{if(currentEnvelope){download(currentEnvelope);setStatus("File JSON diekspor.");}});
importFile.addEventListener("change",async()=>{
  const file=importFile.files?.[0]; if(!file) return;
  if(file.size>20000){setStatus("File terlalu besar (maksimum 20 KB).",true);return;}
  importJson.value=await file.text();
});
$("importPackage").addEventListener("click",()=>{
  try { const envelope=parseAndValidate(importJson.value); addToInbox(envelope); setStatus("Paket tervalidasi dan masuk ke Task Inbox sesi ini."); }
  catch(error) { setStatus(error.message,true); }
});
async function createPlan(taskId) {
  const item=tasks.find((entry)=>entry.task.task_id===taskId); if(!item || item.plan) return;
  const button=[...inbox.querySelectorAll("button")].find((node)=>node.textContent==="Buat rencana Preview");
  if(button) button.disabled=true;
  setStatus("Meminta rencana ke endpoint Preview…");
  try {
    const response=await fetch("/api/agents/plan",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({intent:item.task.intent,agents:item.task.agents,action_class:item.task.action_class})});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(payload.message||payload.error||("HTTP "+response.status));
    if(payload.execution_mode!=="plan_only" || payload.permission!=="read_only" || payload.external_calls_made!==false || payload.database_writes!==false || !Array.isArray(payload.tools_invoked) || payload.tools_invoked.length!==0) throw new Error("Respons tidak memenuhi kontrak plan-only; hasil tidak disimpan.");
    item.plan=payload; saveInbox(); renderInbox(); setStatus("Rencana diterima. Status: "+payload.status+". Tidak ada eksekusi atau database write.");
  } catch(error) { if(button) button.disabled=false; setStatus("Rencana tidak dibuat: "+error.message+". Periksa login dan konfigurasi Preview.",true); }
}
renderInbox();
