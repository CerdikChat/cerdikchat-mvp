(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const section = $("#promptIntelligence");
  if (!section) return;
  const feed = $("#feed");
  const composerWrap = $(".composer-wrap");
  const chatInput = $("#message");
  const intent = $("#piIntent");
  const result = $("#piResult");
  const feedback = $("#piFeedback");
  const generate = $("#piGenerate");
  const optimize = $("#piOptimize");
  const evaluate = $("#piEvaluate");
  const scoreNode = $("#piScore");
  const rubricNode = $("#piRubric");
  const vaultNode = $("#piVault");
  const STORAGE_KEY = "cerdikgo-prompt-vault-v1";
  let currentLanguage = "id";

  const copy = {
    id: {
      nav:"Prompt Intelligence",home:"Ubah ide menjadi instruksi AI profesional, optimalkan, dan simpan.",back:"Kembali ke workspace",
      subtitle:"Sistem Rekayasa Prompt Profesional & Penjaminan Kualitas",intentLabel:"Apa yang ingin Anda capai dengan AI?",
      domainLabel:"Domain profesional",outputLabel:"Format hasil",generate:"Buat prompt",optimize:"Optimalkan prompt yang ada",
      evaluate:"Evaluasi kualitas",resultTitle:"Ruang kerja prompt",resultHint:"Tinjau dan edit prompt sebelum digunakan.",
      scoreLabel:"Skor kualitas / 100 · heuristik",copy:"Salin prompt",save:"Simpan ke Vault",send:"Gunakan di Chat",
      vaultTitle:"Prompt Vault",vaultHint:"Disimpan secara lokal di perangkat ini.",clear:"Kosongkan Vault",
      disclaimer:"Skor QA merupakan pemeriksaan heuristik desain prompt, bukan jaminan kebenaran hasil AI. Verifikasi sumber dan keputusan penting secara independen.",
      empty:"Belum ada prompt tersimpan.",needIntent:"Tuliskan tujuan atau prompt yang ingin diolah terlebih dahulu.",
      working:"Sedang memproses melalui CerdikGo AI…",done:"Prompt siap ditinjau. Periksa dan sesuaikan sebelum digunakan.",
      failed:"Prompt belum berhasil dibuat. Periksa sesi dan koneksi, lalu coba kembali.",copied:"Prompt disalin.",saved:"Prompt tersimpan di perangkat ini.",
      noResult:"Belum ada prompt untuk dievaluasi.",cleared:"Vault lokal telah dikosongkan.",loaded:"Prompt dimuat dari Vault.",
      source:"Prompt Intelligence",rubric:"Kejelasan tujuan",context:"Kelengkapan konteks",method:"Metodologi dan batasan",
      output:"Spesifikasi output",risk:"Verifikasi dan risiko",saveName:"Nama prompt"
    },
    en: {
      nav:"Prompt Intelligence",home:"Turn ideas into professional AI instructions, optimize and save them.",back:"Back to workspace",
      subtitle:"Professional Prompt Engineering & Quality System",intentLabel:"What do you want AI to accomplish?",
      domainLabel:"Professional domain",outputLabel:"Output format",generate:"Generate prompt",optimize:"Optimize existing prompt",
      evaluate:"Evaluate quality",resultTitle:"Prompt workspace",resultHint:"Review and edit the prompt before use.",
      scoreLabel:"Quality score / 100 · heuristic",copy:"Copy prompt",save:"Save to Vault",send:"Use in Chat",
      vaultTitle:"Prompt Vault",vaultHint:"Saved locally on this device.",clear:"Clear Vault",
      disclaimer:"QA score is a heuristic prompt-design check, not a guarantee of AI answer correctness. Independently verify sources and consequential decisions.",
      empty:"No saved prompts yet.",needIntent:"Enter a goal or prompt to work on first.",
      working:"Processing with CerdikGo AI…",done:"Prompt is ready for review. Check and adapt it before use.",
      failed:"Prompt generation failed. Check your session and connection, then retry.",copied:"Prompt copied.",saved:"Prompt saved on this device.",
      noResult:"There is no prompt to evaluate yet.",cleared:"Local Vault cleared.",loaded:"Prompt loaded from Vault.",
      source:"Prompt Intelligence",rubric:"Goal clarity",context:"Context completeness",method:"Methodology and constraints",
      output:"Output specification",risk:"Verification and risks",saveName:"Prompt name"
    },
    zh: {
      nav:"提示词智能",home:"将想法转化为专业 AI 指令，优化并保存。",back:"返回工作区",
      subtitle:"专业提示词工程与质量系统",intentLabel:"您希望 AI 完成什么任务？",
      domainLabel:"专业领域",outputLabel:"输出格式",generate:"生成提示词",optimize:"优化现有提示词",
      evaluate:"评估质量",resultTitle:"提示词工作区",resultHint:"使用前请检查并编辑提示词。",
      scoreLabel:"质量分数 / 100 · 启发式",copy:"复制提示词",save:"保存到 Vault",send:"用于聊天",
      vaultTitle:"提示词库",vaultHint:"保存在此设备本地。",clear:"清空 Vault",
      disclaimer:"QA 分数是提示词设计的启发式检查，不保证 AI 答案正确。请独立核实来源和重要决策。",
      empty:"暂无已保存的提示词。",needIntent:"请先输入目标或需要处理的提示词。",
      working:"正在通过 CerdikGo AI 处理…",done:"提示词已准备好，请检查并调整后使用。",
      failed:"生成失败。请检查会话和网络后重试。",copied:"提示词已复制。",saved:"提示词已保存在本设备。",
      noResult:"暂无可评估的提示词。",cleared:"本地提示词库已清空。",loaded:"已从 Vault 加载提示词。",
      source:"提示词智能",rubric:"目标清晰度",context:"上下文完整性",method:"方法与限制",
      output:"输出规范",risk:"验证与风险",saveName:"提示词名称"
    }
  };
  const domains = {
    blue:"Blue Economy & Aquaculture",
    research:"Strategic Research & Advisory",
    audit:"Audit, Governance & Quality",
    trade:"International Trade & Business",
    life:"Life Sciences & Clinical Research",
    creative:"Creative & Digital Productivity"
  };
  function setFeedback(message, isError = false) {
    feedback.textContent = message;
    feedback.style.color = isError ? "var(--danger)" : "var(--muted)";
  }
  function getVault() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value.filter(item => item && typeof item.prompt === "string").slice(0,50) : [];
    } catch { return []; }
  }
  function saveVault(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0,50))); return true; }
    catch { setFeedback("Penyimpanan lokal tidak tersedia atau penuh.", true); return false; }
  }
  function evaluatePrompt(text) {
    const checks = [
      [copy[currentLanguage].rubric, /tujuan|objective|goal|sasaran|target/i.test(text), 20],
      [copy[currentLanguage].context, /konteks|context|latar belakang|background|asumsi|assumption/i.test(text), 20],
      [copy[currentLanguage].method, /metodologi|method|langkah|step|framework|metode/i.test(text), 20],
      [copy[currentLanguage].output, /format|output|laporan|report|tabel|table|deliverable/i.test(text), 20],
      [copy[currentLanguage].risk, /verifikasi|verify|sumber|source|risiko|risk|ketidakpastian|uncertainty/i.test(text), 20]
    ];
    const total = checks.reduce((sum, item) => sum + (item[1] ? item[2] : 0), 0);
    scoreNode.textContent = String(total);
    rubricNode.textContent = checks.map(item => (item[1] ? "✓ " : "○ ") + item[0] + " (" + (item[1] ? item[2] : 0) + "/20)").join(" · ");
    return total;
  }
  async function askAI(mode) {
    const task = intent.value.trim();
    const existing = result.value.trim();
    const source = mode === "optimize" ? existing : task;
    if (!source) { setFeedback(copy[currentLanguage].needIntent, true); intent.focus(); return; }
    if (source.length > 5000) { setFeedback("Input maksimal 5.000 karakter.", true); return; }
    const domain = domains[$("#piDomain").value];
    const format = $("#piOutput").value;
    const instruction = mode === "optimize"
      ? "Optimalkan prompt berikut tanpa mengubah maksud pengguna. Perjelas tujuan, konteks, metodologi, batasan, kebutuhan bukti, format output, dan kriteria keberhasilan. Jangan mengarang data atau referensi."
      : "Rancang prompt profesional siap pakai berdasarkan kebutuhan pengguna. Jangan menjawab tugasnya; hasilkan instruksi yang akan diberikan kepada model AI lain.";
    const message = [
      "Anda adalah Prompt Architect profesional CerdikGo.",
      instruction,
      "Domain: " + domain,
      "Format output yang diminta: " + format,
      "Bahasa prompt mengikuti bahasa permintaan pengguna.",
      "Strukturkan prompt dengan bagian: ROLE, OBJECTIVE, CONTEXT, TASKS, METHOD, EVIDENCE & SOURCE RULES, OUTPUT FORMAT, QUALITY CRITERIA, LIMITATIONS & SAFETY.",
      "Gunakan hanya bagian yang relevan, hindari pengulangan, minta klarifikasi jika data kritis belum tersedia, pisahkan fakta/asumsi/estimasi, jangan membuat sumber atau standar palsu.",
      "Kebutuhan pengguna:\n" + source,
      mode === "optimize" ? "Kembalikan hanya prompt yang telah dioptimalkan." : "Kembalikan hanya prompt final, tanpa pengantar."
    ].join("\n\n");
    const button = mode === "optimize" ? optimize : generate;
    button.disabled = true;
    generate.disabled = true;
    optimize.disabled = true;
    setFeedback(copy[currentLanguage].working);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ message, history: [] })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const code = typeof payload.error === "string" ? payload.error : "";
        if (response.status === 401 || code === "AUTH_REQUIRED") throw new Error("AUTH_REQUIRED");
        if (response.status === 429 || code === "RATE_LIMIT_EXCEEDED") throw new Error("RATE_LIMIT_EXCEEDED");
        if (code === "AI_QUOTA_EXCEEDED") throw new Error("AI_QUOTA_EXCEEDED");
        if (code === "AI_MODEL_UNAVAILABLE") throw new Error("AI_MODEL_UNAVAILABLE");
        if (code === "AI_TIMEOUT") throw new Error("AI_TIMEOUT");
        if (code === "AI_BINDING_MISSING") throw new Error("AI_BINDING_MISSING");
        throw new Error("AI_REQUEST_FAILED");
      }
      if (typeof payload.reply !== "string" || !payload.reply.trim()) throw new Error("EMPTY_AI_RESPONSE");
      result.value = payload.reply.trim().slice(0,8000);
      evaluatePrompt(result.value);
      setFeedback(copy[currentLanguage].done);
    } catch (error) {
      const code = String(error.message || "");
      const messages = {
        AUTH_REQUIRED: "Silakan login terlebih dahulu untuk menggunakan Prompt Intelligence.",
        RATE_LIMIT_EXCEEDED: "Batas permintaan tercapai. Tunggu sebentar lalu coba kembali.",
        AI_QUOTA_EXCEEDED: "Kuota Workers AI sedang habis. Prompt Anda tetap tersimpan di editor; coba lagi setelah kuota pulih.",
        AI_MODEL_UNAVAILABLE: "Model AI yang dikonfigurasi belum tersedia. Hubungi administrator; prompt Anda tetap aman di editor.",
        AI_TIMEOUT: "Respons AI melewati batas waktu. Prompt Anda tetap aman di editor; silakan coba kembali.",
        AI_BINDING_MISSING: "Layanan AI belum terhubung pada environment ini. Hubungi administrator.",
        AI_REQUEST_FAILED: copy[currentLanguage].failed
      };
      setFeedback(messages[code] || messages.AI_REQUEST_FAILED, true);
    } finally {
      button.disabled = false;
      generate.disabled = false;
      optimize.disabled = false;
    }
  }
  function renderVault() {
    const items = getVault();
    vaultNode.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "pi-feedback";
      empty.textContent = copy[currentLanguage].empty;
      vaultNode.append(empty);
      return;
    }
    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "pi-vault-item";
      const title = document.createElement("span");
      title.textContent = item.name + " · " + item.domain;
      const actions = document.createElement("div");
      actions.className = "pi-row";
      const load = document.createElement("button");
      load.type = "button"; load.className = "pi-btn"; load.textContent = "Open";
      load.addEventListener("click", () => { result.value = item.prompt; evaluatePrompt(item.prompt); setFeedback(copy[currentLanguage].loaded); });
      const remove = document.createElement("button");
      remove.type = "button"; remove.className = "pi-btn"; remove.textContent = "×";
      remove.setAttribute("aria-label", "Delete " + item.name);
      remove.addEventListener("click", () => { const next = getVault(); next.splice(index,1); saveVault(next); renderVault(); });
      actions.append(load,remove); row.append(title,actions); vaultNode.append(row);
    });
  }
  function openModule(seed = "") {
    section.hidden = false;
    feed.hidden = true;
    composerWrap.hidden = true;
    if (seed && !intent.value.trim()) intent.value = seed;
    section.scrollIntoView({ block:"start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    intent.focus({ preventScroll:true });
    renderVault();
    if (document.querySelector(".app.nav-open")) $("#navToggle")?.click();
  }
  function closeModule() {
    section.hidden = true;
    feed.hidden = false;
    composerWrap.hidden = false;
    $("#welcome")?.scrollIntoView({ block:"start", behavior:"auto" });
  }
  document.addEventListener("click", event => {
    const opener = event.target.closest("[data-pi-open]");
    if (opener) { event.preventDefault(); openModule(chatInput?.value || ""); }
    if (event.target.closest("[data-pi-back]")) closeModule();
  });
  generate.addEventListener("click", () => askAI("generate"));
  optimize.addEventListener("click", () => askAI("optimize"));
  evaluate.addEventListener("click", () => {
    if (!result.value.trim()) { setFeedback(copy[currentLanguage].noResult, true); return; }
    evaluatePrompt(result.value);
    setFeedback("Evaluasi heuristik selesai. Lengkapi bagian yang belum terpenuhi.");
  });
  $("#piCopy").addEventListener("click", async () => {
    if (!result.value.trim()) return;
    try { await navigator.clipboard.writeText(result.value); setFeedback(copy[currentLanguage].copied); }
    catch { result.focus(); result.select(); setFeedback("Pilih teks lalu salin secara manual."); }
  });
  $("#piSave").addEventListener("click", () => {
    if (!result.value.trim()) return;
    const name = (window.prompt(copy[currentLanguage].saveName + ":") || "").trim();
    if (!name) return;
    const items = getVault().filter(item => item.name !== name);
    items.unshift({ name, domain:domains[$("#piDomain").value], prompt:result.value, updatedAt:new Date().toISOString() });
    if (saveVault(items)) { renderVault(); setFeedback(copy[currentLanguage].saved); }
  });
  $("#piSend").addEventListener("click", () => {
    if (!result.value.trim()) return;
    closeModule();
    chatInput.value = result.value;
    chatInput.dispatchEvent(new Event("input",{bubbles:true}));
    chatInput.focus();
    chatInput.scrollIntoView({block:"center",behavior:"smooth"});
  });
  $("#piClearVault").addEventListener("click", () => {
    if (!window.confirm("Hapus semua prompt yang tersimpan secara lokal di perangkat ini?")) return;
    localStorage.removeItem(STORAGE_KEY); renderVault(); setFeedback(copy[currentLanguage].cleared);
  });
  window.CerdikGoPromptI18n = (language) => {
    currentLanguage = copy[language] ? language : "id";
    const pack = copy[currentLanguage];
    document.querySelectorAll("[data-pi-text]").forEach(node => {
      const key = node.getAttribute("data-pi-text");
      if (pack[key]) node.textContent = pack[key];
    });
    renderVault();
  };
  window.CerdikGoPromptI18n(document.documentElement.lang === "zh-CN" ? "zh" : document.documentElement.lang);
})();