import { assertInboxCapacity } from "./bridge-inbox.js";

const ALLOWED_AGENTS = new Set(Array.from({ length: 9 }, (_, i) => `ATLAS-${String(i + 1).padStart(2, "0")}`));
const MAX_INTENT = 4000;
const inbox = [];

const byId = (id) => document.getElementById(id);
const status = byId("status");
const setStatus = (message, error = false) => {
  status.textContent = message;
  status.classList.toggle("error", error);
};

function validatePackage(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Format paket harus berupa objek JSON.");
  if (value.schema !== "cerdikgo.task.v1") throw new Error("Schema tidak didukung. Gunakan cerdikgo.task.v1.");
  const task = value.task;
  if (!task || typeof task !== "object" || Array.isArray(task)) throw new Error("Bagian task tidak valid.");
  if (typeof task.intent !== "string" || !task.intent.trim() || task.intent.length > MAX_INTENT) throw new Error("Instruksi kosong atau melebihi 4.000 karakter.");
  if (!Array.isArray(task.agents) || task.agents.length < 1 || task.agents.length > 9 || task.agents.some((id) => !ALLOWED_AGENTS.has(id)) || new Set(task.agents).size !== task.agents.length) throw new Error("Daftar spesialis tidak valid.");
  if (!["read_only", "controlled_action"].includes(task.action_class)) throw new Error("Kelas tugas tidak valid.");
  return {
    schema: "cerdikgo.task.v1",
    task: {
      id: typeof task.id === "string" && task.id.length <= 80 ? task.id : crypto.randomUUID(),
      intent: task.intent.trim(),
      agents: [...task.agents],
      action_class: task.action_class,
      created_at: typeof task.created_at === "string" ? task.created_at : new Date().toISOString(),
    },
  };
}

function packageFromForm() {
  const intent = byId("intent").value;
  const agents = [...byId("agents").selectedOptions].map((option) => option.value);
  return validatePackage({
    schema: "cerdikgo.task.v1",
    task: { id: crypto.randomUUID(), intent, agents, action_class: byId("actionClass").value, created_at: new Date().toISOString() },
  });
}

function renderInbox() {
  const root = byId("inbox");
  root.replaceChildren();
  if (!inbox.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Belum ada tugas dalam sesi ini.";
    root.append(empty);
    return;
  }
  for (const item of inbox) {
    const card = document.createElement("article");
    card.className = "task";
    const title = document.createElement("strong");
    title.textContent = item.task.action_class === "controlled_action" ? "Tugas — persetujuan manusia wajib" : "Tugas — read-only";
    const meta = document.createElement("small");
    meta.textContent = `${item.task.agents.join(", ")} · ${item.task.created_at}`;
    const body = document.createElement("p");
    body.textContent = item.task.intent;
    const planButton = document.createElement("button");
    planButton.type = "button";
    planButton.textContent = "Buat rencana lokal";
    planButton.addEventListener("click", () => {
      const plan = {
        schema: "cerdikgo.plan.v1",
        task_id: item.task.id,
        execution_mode: "plan_only",
        requires_human_approval: item.task.action_class === "controlled_action",
        agents: item.task.agents,
        intent: item.task.intent,
        external_calls_made: false,
        database_writes: false,
        generated_at: new Date().toISOString(),
      };
      const output = document.createElement("pre");
      output.className = "task";
      output.style.whiteSpace = "pre-wrap";
      output.textContent = JSON.stringify(plan, null, 2);
      card.querySelector("pre")?.remove();
      card.append(output);
      setStatus("Rencana lokal dibuat. Tidak ada agent yang dieksekusi atau data yang dikirim ke server.");
    });
    card.append(title, meta, body, planButton);
    root.append(card);
  }
}

let latestPackage = null;
byId("makePackage").addEventListener("click", () => {
  try {
    latestPackage = packageFromForm();
    byId("importJson").value = JSON.stringify(latestPackage, null, 2);
    for (const id of ["copyPackage", "sharePackage", "downloadPackage"]) byId(id).disabled = false;
    setStatus("Paket JSON berhasil dibuat. Periksa isinya sebelum dibagikan.");
  } catch (error) { setStatus(error.message, true); }
});

byId("copyPackage").addEventListener("click", async () => {
  if (!latestPackage) return;
  try { await navigator.clipboard.writeText(JSON.stringify(latestPackage, null, 2)); setStatus("Paket disalin ke clipboard."); }
  catch { setStatus("Clipboard tidak tersedia. Gunakan Ekspor .json.", true); }
});

byId("sharePackage").addEventListener("click", async () => {
  if (!latestPackage) return;
  const file = new File([JSON.stringify(latestPackage, null, 2)], "cerdikgo-task.json", { type: "application/json" });
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({ title: "CerdikGo Task Package", files: [file] });
      setStatus("Dialog berbagi perangkat dibuka.");
    } else {
      await navigator.clipboard.writeText(JSON.stringify(latestPackage, null, 2));
      setStatus("Berbagi file tidak didukung browser ini; JSON disalin sebagai alternatif.");
    }
  } catch (error) { if (error.name !== "AbortError") setStatus("Berbagi gagal atau dibatalkan.", true); }
});

byId("downloadPackage").addEventListener("click", () => {
  if (!latestPackage) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(latestPackage, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "cerdikgo-task.json"; anchor.click();
  URL.revokeObjectURL(url);
  setStatus("File JSON disiapkan untuk diunduh.");
});

byId("importFile").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 16000) { setStatus("Ukuran file melebihi batas 16 KB.", true); return; }
  byId("importJson").value = await file.text();
  setStatus("File dimuat. Tekan Validasi & masukkan Inbox.");
});

byId("importPackage").addEventListener("click", () => {
  try {
    const raw = byId("importJson").value;
    if (!raw || raw.length > 16000) throw new Error("JSON kosong atau melebihi batas 16 KB.");
    const item = validatePackage(JSON.parse(raw));
    if (inbox.some((entry) => entry.task.id === item.task.id)) throw new Error("Paket dengan ID ini sudah ada di Inbox.");
    assertInboxCapacity(inbox);
    inbox.push(item);
    renderInbox();
    setStatus("Paket tervalidasi dan masuk Inbox sesi ini. Belum ada eksekusi atau sinkronisasi server.");
  } catch (error) { setStatus(error instanceof SyntaxError ? "JSON tidak valid." : error.message, true); }
});

renderInbox();
