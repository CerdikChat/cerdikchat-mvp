(() => {
  "use strict";
  const labels = {
    accepted: "ACCEPTED",
    rejected: "REJECTED",
    pending: "PENDING",
    unavailable: "NOT AVAILABLE",
    na: "NOT APPLICABLE"
  };
  const copy = {
    id: {
      aria:"Validation Gate CerdikGo", heading:"Keputusan pemeriksaan, bukti, dan alasan penolakan",
      note:"PENDING berarti belum ada bukti. ACCEPTED hanya setelah pemeriksaan berhasil. REJECTED selalu menampilkan alasan dan tindakan berikutnya.",
      names:["AI Core","Analisis dokumen & malware scan","WPS Office Android","Hybrid Connectivity","Protection Mode"],
      reasons:[
        "Belum ada respons AI sukses yang diverifikasi pada sesi ini.",
        "Belum ada hasil pemindaian dan analisis file yang diverifikasi pada sesi ini.",
        "Pembukaan dokumen melalui WPS pada perangkat Android belum diuji.",
        "Tampilan saat ini menunjukkan SIMULATOR; koneksi mesh/LoRa nyata belum dibuktikan.",
        "Label ACTIVE · SERVER CHECK tersedia, tetapi bukti pemeriksaan sesi belum dilaporkan ke Validation Gate."
      ],
      evidence:"Bukti: ", rejected:"Alasan penolakan: ", info:"Keterangan: ",
      pendingSummary:"PENDING · {count} pemeriksaan", empty:"BELUM ADA PEMERIKSAAN"
    },
    en: {
      aria:"CerdikGo Validation Gate", heading:"Verification decisions, evidence and rejection reasons",
      note:"PENDING means evidence has not been provided. ACCEPTED is shown only after a successful check. REJECTED always includes a reason and next action.",
      names:["AI Core","Document analysis & malware scan","WPS Office for Android","Hybrid connectivity","Protection mode"],
      reasons:[
        "No successful AI response has been verified in this session.",
        "No verified file scan and analysis result is available in this session.",
        "Opening a document through WPS on the Android device has not been tested.",
        "The current display shows SIMULATOR; a real mesh/LoRa connection has not been demonstrated.",
        "The ACTIVE · SERVER CHECK label is present, but session-check evidence has not been reported to the Validation Gate."
      ],
      evidence:"Evidence: ", rejected:"Rejection reason: ", info:"Details: ",
      pendingSummary:"PENDING · {count} checks", empty:"NO CHECKS REPORTED"
    },
    zh: {
      aria:"CerdikGo 验证关卡", heading:"检查决定、证据与拒绝原因",
      note:"PENDING 表示尚未提供证据。只有检查成功后才会显示 ACCEPTED。REJECTED 必须说明原因和后续措施。",
      names:["AI 核心","文档分析与恶意软件扫描","Android WPS Office","混合连接","保护模式"],
      reasons:[
        "本次会话尚未验证成功的 AI 响应。",
        "本次会话尚无经过验证的文件扫描与分析结果。",
        "尚未在 Android 设备上测试通过 WPS 打开文档。",
        "当前显示为 SIMULATOR；尚未证明真实的 mesh/LoRa 连接。",
        "界面显示 ACTIVE · SERVER CHECK，但尚未向验证关卡提交本次会话的检查证据。"
      ],
      evidence:"证据：", rejected:"拒绝原因：", info:"说明：",
      pendingSummary:"待验证 · {count} 项", empty:"尚无检查记录"
    }
  };
  const entries = [
    {id:"ai-core",name:"AI Core",status:"pending",reason:""},
    {id:"document-analysis",name:"Analisis dokumen & malware scan",status:"pending",reason:""},
    {id:"wps-office",name:"WPS Office Android",status:"pending",reason:""},
    {id:"hybrid-connectivity",name:"Hybrid Connectivity",status:"pending",reason:""},
    {id:"protection",name:"Protection Mode",status:"pending",reason:""}
  ];
  let language = ["id","en","zh"].includes(window.CerdikGoUiLanguage) ? window.CerdikGoUiLanguage : "id";
  const host = document.createElement("section");
  host.id = "cerdikgoValidationGate";
  host.className = "cg-gate";
  host.setAttribute("aria-label",copy[language].aria);
  host.innerHTML = `
    <div class="cg-gate-toggle">
      <span class="cg-gate-symbol" aria-hidden="true">i</span>
      <span class="cg-gate-heading"><strong>VALIDATION GATE</strong><small></small></span>
      <span class="cg-gate-summary" id="cgGateSummary" role="status" aria-live="polite"></span>
    </div>
    <div id="cgGateDetails" class="cg-gate-details">
      <p class="cg-gate-note"></p>
      <div id="cgGateRows"></div>
    </div>`;
  const style = document.createElement("style");
  style.textContent = `
    .cg-gate{margin:10px 14px 0;border:1px solid #8ca9c2;border-radius:13px;background:var(--panel,#f8fbff);color:var(--text,#17324b);overflow:hidden}
    .cg-gate-toggle{display:flex;align-items:center;gap:10px;width:100%;padding:11px 13px;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer}
    .cg-gate-symbol{display:grid;place-items:center;flex:0 0 30px;width:30px;height:30px;border-radius:9px;background:#dceeff;color:#145b94;font-weight:900}
    .cg-gate-heading{display:flex;flex-direction:column;gap:2px;min-width:0}
    .cg-gate-heading strong{font-size:12px;letter-spacing:.5px}
    .cg-gate-heading small,.cg-gate-note{font-size:11px;opacity:.78}
    .cg-gate-summary{margin-left:auto;font-size:11px;font-weight:800;color:#8a5b00;text-align:right}
    .cg-gate-details{padding:0 12px 12px}
    .cg-gate-note{margin:0 0 9px;line-height:1.5}
    .cg-gate-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;padding:9px 0;border-top:1px solid #8ca9c244}
    .cg-gate-name{font-size:12px;font-weight:750}
    .cg-gate-status{font-size:10px;font-weight:850;letter-spacing:.3px}
    .cg-gate-reason{grid-column:1/-1;font-size:11px;line-height:1.45;overflow-wrap:anywhere;opacity:.85}
    .cg-gate-status[data-status="accepted"]{color:#16804a}
    .cg-gate-status[data-status="rejected"]{color:#c22d3a}
    .cg-gate-status[data-status="pending"]{color:#9a6900}
    .cg-gate-status[data-status="unavailable"]{color:#a34d18}
    .cg-gate-status[data-status="na"]{color:#64748b}
    @media(max-width:520px){.cg-gate{margin-left:10px;margin-right:10px}.cg-gate-toggle{gap:7px;padding:10px}.cg-gate-summary{max-width:104px;font-size:10px}}
  `;
  document.head.append(style);
  const mount = document.getElementById("validationGateMount");
  if (mount) mount.append(host);
  else document.body.prepend(host);
  const rows = host.querySelector("#cgGateRows");
  function render(){
    const p = copy[language];
    host.setAttribute("aria-label",p.aria);
    host.querySelector(".cg-gate-heading small").textContent = p.heading;
    host.querySelector(".cg-gate-note").textContent = p.note;
    rows.replaceChildren();
    for(let index=0;index<entries.length;index++){
      const item=entries[index];
      const row=document.createElement("div");row.className="cg-gate-row";
      const name=document.createElement("span");name.className="cg-gate-name";name.textContent=p.names[index];
      const status=document.createElement("span");status.className="cg-gate-status";status.dataset.status=item.status;status.textContent=labels[item.status]||labels.pending;
      const reason=document.createElement("span");reason.className="cg-gate-reason";
      const prefix=item.status==="rejected"?p.rejected:item.status==="accepted"?p.evidence:p.info;
      reason.textContent=prefix+item.reason;
      row.append(name,status,reason);rows.append(row);
    }
    const counts=entries.reduce((a,e)=>(a[e.status]=(a[e.status]||0)+1,a),{});
    const summary=host.querySelector("#cgGateSummary");
    const parts=[];
    for(const key of ["rejected","pending","unavailable","accepted"])if(counts[key])parts.push(counts[key]+" "+labels[key]);
    summary.textContent=parts.join(" · ")||p.empty;
    if(entries.every(e=>e.status==="pending")) summary.textContent=p.pendingSummary.replace("{count}",String(counts.pending||0));
    summary.style.color=counts.rejected?"#c22d3a":counts.pending?"#9a6900":"#16804a";
  }
  function applyLanguage(code){
    if(!copy[code])return false;
    language=code;
    render();
    return true;
  }
  window.addEventListener("cerdikgo:ui-language-changed",event=>applyLanguage(event.detail?.language));
  window.CerdikGoValidationGate={
    report(id,status,reason){
      const item=entries.find(entry=>entry.id===id);
      if(!item||!Object.hasOwn(labels,status))return false;
      if (typeof reason !== "string") return false;
      const explanation = reason.trim();
      if (["accepted", "rejected", "unavailable"].includes(status) && !explanation) return false;
      if (explanation.length > 500) return false;
      item.status = status;
      item.reason = explanation || (status === "pending"
        ? copy[language].reasons[entries.indexOf(item)]
        : "No further action required.");
      render();return true;
    },
    snapshot(){return entries.map(({id,name,status,reason})=>({id,name,status,reason}));}
  };
  window.dispatchEvent(new CustomEvent("cerdikgo:validation-gate-ready"));
  render();
})();