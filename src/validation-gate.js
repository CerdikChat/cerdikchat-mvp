(() => {
  "use strict";
  const labels = {
    accepted: "ACCEPTED",
    rejected: "REJECTED",
    pending: "PENDING",
    unavailable: "NOT AVAILABLE",
    na: "NOT APPLICABLE"
  };
  const entries = [
    {id:"ai-core",name:"AI Core",status:"pending",reason:"Belum ada respons AI sukses yang diverifikasi pada sesi ini."},
    {id:"document-analysis",name:"Analisis dokumen & malware scan",status:"pending",reason:"Belum ada hasil pemindaian dan analisis file yang diverifikasi pada sesi ini."},
    {id:"wps-office",name:"WPS Office Android",status:"pending",reason:"Pembukaan dokumen melalui WPS pada perangkat Android belum diuji."},
    {id:"hybrid-connectivity",name:"Hybrid Connectivity",status:"pending",reason:"Tampilan saat ini menunjukkan SIMULATOR; koneksi mesh/LoRa nyata belum dibuktikan."},
    {id:"protection",name:"Protection Mode",status:"pending",reason:"Label ACTIVE · SERVER CHECK tersedia, tetapi bukti pemeriksaan sesi belum dilaporkan ke Validation Gate."}
  ];
  const host = document.createElement("section");
  host.id = "cerdikgoValidationGate";
  host.className = "cg-gate";
  host.setAttribute("aria-label","Validation Gate CerdikGo");
  host.innerHTML = `
    <button type="button" class="cg-gate-toggle" aria-expanded="true" aria-controls="cgGateDetails">
      <span class="cg-gate-symbol" aria-hidden="true">✓</span>
      <span class="cg-gate-heading"><strong>VALIDATION GATE</strong><small>Keputusan pemeriksaan, bukti, dan alasan penolakan</small></span>
      <span class="cg-gate-summary" id="cgGateSummary">PENDING · 5 pemeriksaan</span>
      <span aria-hidden="true">⌄</span>
    </button>
    <div id="cgGateDetails" class="cg-gate-details">
      <p class="cg-gate-note">PENDING berarti belum ada bukti. ACCEPTED hanya setelah pemeriksaan berhasil. REJECTED selalu menampilkan alasan dan tindakan berikutnya.</p>
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
  const deck = document.querySelector(".status-deck");
  if (deck) deck.insertAdjacentElement("afterend",host);
  else document.body.prepend(host);
  const rows = host.querySelector("#cgGateRows");
  function render(){
    rows.replaceChildren();
    for(const item of entries){
      const row=document.createElement("div");row.className="cg-gate-row";
      const name=document.createElement("span");name.className="cg-gate-name";name.textContent=item.name;
      const status=document.createElement("span");status.className="cg-gate-status";status.dataset.status=item.status;status.textContent=labels[item.status]||labels.pending;
      const reason=document.createElement("span");reason.className="cg-gate-reason";reason.textContent=(item.status==="rejected"?"Alasan penolakan: ":item.status==="accepted"?"Bukti: ":"Keterangan: ")+item.reason;
      row.append(name,status,reason);rows.append(row);
    }
    const counts=entries.reduce((a,e)=>(a[e.status]=(a[e.status]||0)+1,a),{});
    const summary=host.querySelector("#cgGateSummary");
    const parts=[];
    for(const key of ["rejected","pending","unavailable","accepted"])if(counts[key])parts.push(counts[key]+" "+labels[key]);
    summary.textContent=parts.join(" · ")||"BELUM ADA PEMERIKSAAN";
    summary.style.color=counts.rejected?"#c22d3a":counts.pending?"#9a6900":"#16804a";
  }
  host.querySelector(".cg-gate-toggle").addEventListener("click",event=>{
    const button=event.currentTarget,details=host.querySelector("#cgGateDetails");
    const expanded=button.getAttribute("aria-expanded")==="true";
    button.setAttribute("aria-expanded",String(!expanded));details.hidden=expanded;
  });
  window.CerdikGoValidationGate={
    report(id,status,reason){
      const item=entries.find(entry=>entry.id===id);
      if(!item||!Object.hasOwn(labels,status))return false;
      const explanation=String(reason||"");
      if((status==="rejected"||status==="unavailable")&&!explanation.trim())return false;
      item.status=status;item.reason=explanation.trim()||"Pemeriksaan dinyatakan tidak memerlukan tindakan.";
      render();return true;
    },
    snapshot(){return entries.map(({id,name,status,reason})=>({id,name,status,reason}));}
  };
  window.dispatchEvent(new CustomEvent("cerdikgo:validation-gate-ready"));
  render();
})();