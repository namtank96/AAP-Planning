/* =========================================================================
   AAP_VIZ — 분해·재구성·온톨로지·Lineage 공용 렌더 모듈
   ─────────────────────────────────────────────────────────────────────────
   H 데모(03_프로토타입/H_분해시연)에서 검증된 4요소를 자기완결 모듈로 승격.
   app/ · 렌탈 콘솔 · standalone 어디서나 동일 데이터 shape로 재사용.
   · 외부 라이브러리 0 · 자체 CSS 1회 주입(.vd- 네임스페이스·자체 토큰)
   · 아이콘 = window.AAP_ICON.svg 우선, 없으면 인라인 폴백
   · 표준 데이터 shape(BREAKDOWN):
       { label, type, purpose,
         work:[{id,nm,can,actor:'human'|'aap'|'hitl',gate,actions[],data[],dec[],risk[],why,
                ops:[{ty:'A'|'M'|'S'|'C'|'P',L,nm,desc,reads,out,why}]}],
         compose:[{ty,n,items[]}], gates:[{stepId,reason}],
         ontology:{objects:[{k,name,kind:'entity'|'event'|'document'|'master',props[]}],
                   links:[[from,rel,to]] | [{from,rel,to}], touch:{stepId:[objKey]}},
         lineage:{output:{name}, chain:[{role:'source'|'transform'|'judgment'|'gate'|'output',label,note,det}]} }
   외부 노출: window.AAP_VIZ.mount(el, data) / .panes(data) / .engGraph(data) ...
   ========================================================================= */
(function(){
  "use strict";
  /* ---- 아이콘 (host AAP_ICON 우선, 폴백 인라인) ---- */
  var FALLBACK={
    'workflow':'<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    'box':'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    'git-commit':'<circle cx="12" cy="12" r="3"/><line x1="3" x2="9" y1="12" y2="12"/><line x1="15" x2="21" y1="12" y2="12"/>',
    'link-2':'<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
    'layers':'<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    'flag':'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    'arrow-down':'<path d="M12 5v14M19 12l-7 7-7-7"/>',
    'check':'<path d="M20 6 9 17l-5-5"/>',
    'info':'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    'x':'<path d="M18 6 6 18M6 6l12 12"/>',
    'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
    'list':'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    'database':'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    'split':'<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.17-2.83L3 3"/><path d="m21 3-7.83 7.83A4 4 0 0 0 12 13.7V22"/>',
    'alert-triangle':'<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
    'git-branch':'<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'
  };
  function ic(n){
    if(window.AAP_ICON&&window.AAP_ICON.svg){var s=window.AAP_ICON.svg(n);if(s)return s;}
    return '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">'+(FALLBACK[n]||'')+'</svg>';
  }
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  /* ---- 5타입 · 온톨로지 kind 메타 (자체 토큰; 신규 색 ✕ = 가이드 5타입 값) ---- */
  var TYPE={A:{c:'tyA',ty:'Agent'},M:{c:'tyM',ty:'Module'},S:{c:'tyS',ty:'기존 솔루션'},C:{c:'tyC',ty:'Connector'},P:{c:'tyP',ty:'Policy'}};
  var KIND={entity:{label:'엔티티',v:'--vd-agent'},event:{label:'이벤트',v:'--vd-connector'},
            document:{label:'문서',v:'--vd-module'},master:{label:'기준정보',v:'--vd-solution'}};
  var TYV={A:'--vd-agent',M:'--vd-module',S:'--vd-solution',C:'--vd-connector',P:'--vd-policy'};
  function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}

  /* ---- CSS 1회 주입 ---- */
  function injectCSS(){
    if(document.getElementById('aap-viz-css'))return;
    var st=document.createElement('style');st.id='aap-viz-css';
    st.textContent=
    ':root{--vd-agent:#0d9488;--vd-module:#7c3aed;--vd-solution:#0891b2;--vd-connector:#2563eb;--vd-policy:#d97706;'+
    '--vd-amber:#d97706;--vd-amber-ink:#92400e;--vd-green:#16a34a;--vd-ink:#0f172a;--vd-slate:#334155;--vd-muted:#64748b;--vd-faint:#94a3b8;'+
    '--vd-border:#e2e8f0;--vd-line:#eef2f7;--vd-surf:#f8fafc;--vd-surface:#fff;--vd-shadow:0 8px 24px rgba(15,23,42,.06);'+
    '--vd-eng:#0b1220;--vd-eng2:#111c30;--vd-eng-line:#243349;--vd-eng-ink:#e2e8f0;--vd-eng-muted:#7d8da3;}'+
    '.vd-root{font-family:"Pretendard","Inter","Noto Sans KR",system-ui,-apple-system,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:var(--vd-ink);font-size:14px;line-height:1.55;}'+
    '.vd-root .ic{display:inline-block;vertical-align:-0.14em;flex:0 0 auto;}'+
    '.vd-tabs{display:flex;gap:4px;margin:0 0 16px;border-bottom:1px solid var(--vd-border);}'+
    /* 탭 1개(결정론 폴백 = 분해만)면 탭바 숨김 — 호스트 섹션 헤더와 라벨 중복 ✕ */
    '.vd-tabs:has(.vd-tab:only-child){display:none;}'+
    '.vd-tab{display:flex;align-items:center;gap:7px;padding:10px 15px;border:none;background:transparent;font:inherit;font-size:13px;font-weight:600;color:var(--vd-muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;}'+
    '.vd-tab .ic{width:15px;height:15px;}.vd-tab:hover{color:var(--vd-ink);}'+
    '.vd-tab.on{color:var(--vd-agent);border-bottom-color:var(--vd-agent);}'+
    '.vd-tab:focus-visible{outline:2px solid var(--vd-agent);outline-offset:2px;}'+
    '.vd-pane{display:none;}.vd-pane.on{display:block;}'+
    '.vd-bh{margin:22px 0 4px;font-size:15px;font-weight:750;display:flex;align-items:center;gap:8px;}'+
    '.vd-bh:first-child{margin-top:4px;}.vd-bh .n{width:20px;height:20px;border-radius:6px;background:var(--vd-ink);color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;}'+
    '.vd-bh .ic{width:17px;height:17px;color:var(--vd-agent);}.vd-bsub{color:var(--vd-muted);font-size:12.5px;margin:2px 0 14px;}'+
    /* breakdown cards */
    '.vd-bk{border:1px solid var(--vd-border);border-radius:11px;background:var(--vd-surface);overflow:hidden;margin-bottom:10px;}'+
    '.vd-bk-top{display:flex;align-items:center;gap:9px;padding:11px 14px;border-bottom:1px solid var(--vd-line);background:var(--vd-surf);}'+
    '.vd-can{font-size:10.5px;font-weight:700;color:var(--vd-faint);text-transform:uppercase;letter-spacing:.5px;background:#fff;border:1px solid var(--vd-line);border-radius:5px;padding:2px 7px;}'+
    '.vd-bk-nm{font-weight:700;font-size:13.5px;}.vd-actor{margin-left:auto;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;}'+
    '.vd-actor.aap{color:var(--vd-agent);background:#f0fdfa;}.vd-actor.human{color:var(--vd-slate);background:var(--vd-surf);border:1px solid var(--vd-line);}'+
    '.vd-actor.hitl{color:var(--vd-amber-ink);background:#fffbeb;border:1px solid #fde68a;}'+
    '.vd-bk-body{display:grid;grid-template-columns:repeat(4,1fr);}@media(max-width:720px){.vd-bk-body{grid-template-columns:repeat(2,1fr);}}'+
    '.vd-bk-col{padding:11px 14px;border-right:1px solid var(--vd-line);}.vd-bk-col:last-child{border-right:none;}'+
    '.vd-bk-k{font-size:10.5px;font-weight:700;color:var(--vd-faint);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;display:flex;align-items:center;gap:5px;}'+
    '.vd-bk-k .ic{width:13px;height:13px;}.vd-bk-v{font-size:12px;color:var(--vd-slate);padding:3px 0;}.vd-bk-v.dec{font-weight:600;}.vd-bk-v.rsk{color:#dc2626;}.vd-na{font-size:12px;color:var(--vd-faint);}'+
    '.vd-why{padding:9px 14px;background:var(--vd-surf);border-top:1px solid var(--vd-line);font-size:12px;color:var(--vd-slate);}.vd-why b{font-weight:750;color:var(--vd-agent);}'+
    /* engine room */
    '.vd-eng{background:var(--vd-eng);border:1px solid var(--vd-eng-line);border-radius:13px;padding:18px;color:var(--vd-eng-ink);}'+
    '.vd-eh{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--vd-eng-muted);margin-bottom:4px;}.vd-eh .dot{width:7px;height:7px;border-radius:50%;background:var(--vd-agent);box-shadow:0 0 8px var(--vd-agent);}'+
    '.vd-enote{font-size:11.5px;color:var(--vd-eng-muted);margin-bottom:14px;}.vd-enote b{color:var(--vd-eng-ink);}'+
    '.vd-tnode{width:100%;background:var(--vd-eng2);border:1px solid var(--vd-eng-line);border-radius:10px;padding:11px 12px;}'+
    '.vd-tnh{display:flex;align-items:center;gap:7px;margin-bottom:9px;}.vd-tid{font-size:10px;font-weight:700;color:#0b1220;background:var(--vd-agent);border-radius:5px;padding:1px 6px;}'+
    '.vd-tnm{font-weight:700;font-size:12.5px;}.vd-tcn{margin-left:auto;font-size:9.5px;color:var(--vd-eng-muted);}'+
    '.vd-cmps{display:flex;flex-direction:column;gap:5px;}'+
    '.vd-cmp{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.025);border:1px solid var(--vd-eng-line);border-radius:7px;padding:6px 9px;cursor:pointer;font:inherit;color:inherit;width:100%;}'+
    '.vd-cmp:hover{background:rgba(255,255,255,.06);border-color:var(--c);}.vd-cmp:focus-visible{outline:2px solid var(--ct);outline-offset:2px;}'+
    '.vd-cdot{width:8px;height:8px;border-radius:2px;flex:0 0 auto;background:var(--c);}.vd-cty{font-size:10px;font-weight:700;flex:0 0 auto;color:var(--ct);}'+
    '.vd-cnm{font-size:11.5px;color:var(--vd-eng-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.vd-cL{margin-left:auto;font-size:9.5px;color:var(--vd-eng-muted);}'+
    '.vd-cmp .ic{width:13px;height:13px;color:var(--vd-eng-muted);margin-left:6px;}'+
    '.tyA{--c:var(--vd-agent);--ct:#2dd4bf;}.tyM{--c:var(--vd-module);--ct:#a78bfa;}.tyS{--c:var(--vd-solution);--ct:#22d3ee;}.tyC{--c:var(--vd-connector);--ct:#60a5fa;}.tyP{--c:var(--vd-policy);--ct:#fbbf24;}'+
    '.vd-arr{display:flex;justify-content:center;color:var(--vd-eng-muted);margin:3px 0;}.vd-arr .ic{width:16px;height:16px;}'+
    '.vd-gate{display:flex;align-items:center;gap:9px;background:rgba(217,119,6,.10);border:1px solid rgba(217,119,6,.35);border-radius:9px;padding:9px 13px;color:#fcd34d;}'+
    '.vd-gate .ic{color:#fbbf24;width:16px;height:16px;}.vd-gt{font-size:12px;font-weight:700;}.vd-gr{font-size:11px;color:var(--vd-eng-muted);margin-top:1px;}'+
    '.vd-leg{display:flex;gap:14px;flex-wrap:wrap;margin-top:16px;padding-top:13px;border-top:1px solid var(--vd-eng-line);}.vd-lg{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--vd-eng-muted);}.vd-lg .d{width:9px;height:9px;border-radius:2px;}'+
    /* ontology */
    '.kEntity{--kc:var(--vd-agent);}.kEvent{--kc:var(--vd-connector);}.kDocument{--kc:var(--vd-module);}.kMaster{--kc:var(--vd-solution);}'+
    '.vd-onto{display:grid;grid-template-columns:repeat(auto-fill,minmax(186px,1fr));gap:10px;}'+
    '.vd-obj{border:1px solid var(--vd-border);border-left:3px solid var(--kc);border-radius:10px;background:var(--vd-surface);padding:11px 13px;cursor:pointer;text-align:left;width:100%;font:inherit;}'+
    '.vd-obj:hover{box-shadow:var(--vd-shadow);}.vd-obj:focus-visible{outline:2px solid var(--kc);outline-offset:2px;}'+
    '.vd-oh{display:flex;align-items:center;gap:7px;margin-bottom:7px;}.vd-okind{font-size:9.5px;font-weight:700;color:var(--kc);background:var(--vd-surf);border:1px solid var(--vd-line);border-radius:5px;padding:1px 6px;text-transform:uppercase;letter-spacing:.4px;}'+
    '.vd-onm{font-weight:700;font-size:13px;}.vd-props{display:flex;flex-wrap:wrap;gap:4px;}.vd-props span{font-size:10.5px;color:var(--vd-muted);background:var(--vd-surf);border:1px solid var(--vd-line);border-radius:5px;padding:2px 6px;}'+
    '.vd-rels{display:flex;flex-direction:column;gap:6px;}.vd-rel{display:flex;align-items:center;gap:4px;font-size:12.5px;color:var(--vd-slate);background:var(--vd-surf);border:1px solid var(--vd-line);border-radius:8px;padding:8px 11px;}.vd-rel b{color:var(--vd-ink);font-weight:650;}.vd-rv{color:var(--vd-agent);font-weight:700;font-size:11.5px;padding:0 5px;}'+
    '.vd-touch{display:flex;flex-direction:column;gap:8px;}.vd-trow{display:flex;align-items:center;gap:11px;flex-wrap:wrap;}.vd-tstep{font-size:12px;font-weight:700;color:var(--vd-ink);min-width:96px;}.vd-tobjs{display:flex;gap:5px;flex-wrap:wrap;}.vd-tobjs span{font-size:11px;color:var(--kc,var(--vd-slate));border:1px solid var(--vd-line);border-left:2px solid var(--kc,var(--vd-line));border-radius:5px;padding:2px 8px;background:var(--vd-surf);}'+
    /* lineage */
    '.rSource{--hc:var(--vd-connector);}.rTransform{--hc:var(--vd-agent);}.rJudgment{--hc:var(--vd-module);}.rGate{--hc:var(--vd-amber);}.rOutput{--hc:var(--vd-agent);}'+
    '.vd-lout{display:flex;align-items:center;gap:9px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:11px 14px;font-size:13px;color:#0f766e;}.vd-lout b{font-weight:750;}.vd-lout .ic{width:16px;height:16px;}'+
    '.vd-lin{display:flex;flex-direction:column;}.vd-lhop{border:1px solid var(--vd-border);border-left:3px solid var(--hc);border-radius:10px;background:var(--vd-surface);padding:11px 13px;display:flex;align-items:center;gap:11px;}'+
    '.vd-lrole{font-size:9.5px;font-weight:700;color:var(--hc);background:var(--vd-surf);border:1px solid var(--vd-line);border-radius:5px;padding:2px 7px;white-space:nowrap;}.vd-lmain{flex:1;min-width:0;}.vd-llabel{font-weight:650;font-size:13px;}.vd-lnote{font-size:11.5px;color:var(--vd-muted);margin-top:1px;}'+
    '.vd-lrec{font-size:10px;font-weight:700;color:var(--vd-green);background:#f0fdf4;border-radius:20px;padding:3px 9px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;}.vd-lrec .ic{width:12px;height:12px;}'+
    '.vd-lfoot{margin-top:16px;font-size:12px;color:var(--vd-slate);background:var(--vd-surf);border:1px solid var(--vd-line);border-radius:10px;padding:12px 14px;line-height:1.6;}.vd-lfoot b{color:var(--vd-ink);}'+
    /* modal */
    '.vd-modal{position:fixed;inset:0;background:rgba(11,18,32,.55);display:none;align-items:center;justify-content:center;padding:20px;z-index:60;}.vd-modal.on{display:flex;}'+
    '.vd-mbox{background:var(--vd-surface);border-radius:15px;max-width:480px;width:100%;box-shadow:0 14px 36px rgba(15,23,42,.2);overflow:hidden;}'+
    '.vd-mtop{padding:16px 18px;border-bottom:1px solid var(--vd-line);display:flex;align-items:center;gap:10px;}.vd-mtdot{width:11px;height:11px;border-radius:3px;}.vd-mty{font-size:11px;font-weight:700;}.vd-mnm{font-weight:750;font-size:15px;}.vd-mL{margin-left:auto;font-size:11px;color:var(--vd-muted);background:var(--vd-surf);border:1px solid var(--vd-line);border-radius:6px;padding:2px 8px;}'+
    '.vd-mx{margin-left:8px;cursor:pointer;color:var(--vd-muted);display:grid;place-items:center;width:38px;height:38px;border-radius:8px;border:none;background:transparent;}.vd-mx:hover{background:var(--vd-surf);color:var(--vd-ink);}'+
    '.vd-mbody{padding:16px 18px;}.vd-mrow{margin-bottom:13px;}.vd-mrow:last-child{margin-bottom:0;}.vd-mk{font-size:10.5px;font-weight:700;color:var(--vd-faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;}.vd-mv{font-size:13px;color:var(--vd-slate);line-height:1.55;}'+
    '.vd-mwhy{background:#f0fdfa;border:1px solid #99f6e4;border-radius:9px;padding:11px 13px;font-size:12.5px;color:#0f766e;line-height:1.55;}.vd-mio{display:flex;gap:8px;}.vd-mio .b{flex:1;background:var(--vd-surf);border:1px solid var(--vd-line);border-radius:8px;padding:8px 10px;}.vd-mio .bl{font-size:10px;font-weight:700;color:var(--vd-faint);margin-bottom:3px;}.vd-mio .bv{font-size:12px;color:var(--vd-slate);}';
    document.head.appendChild(st);
  }

  /* ---- 모달(공용·1개) ---- */
  function ensureModal(){
    var m=document.getElementById('vd-modal');
    if(!m){m=document.createElement('div');m.id='vd-modal';m.className='vd-modal';m.innerHTML='<div class="vd-mbox" id="vd-mbox"></div>';
      document.body.appendChild(m);
      m.addEventListener('click',function(e){if(e.target===m)closeModal();});
      document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('on'))closeModal();});
    }
    return m;
  }
  var _lastFocus=null;
  function showModal(html){_lastFocus=document.activeElement;var m=ensureModal();document.getElementById('vd-mbox').innerHTML=html;m.classList.add('on');
    var x=document.getElementById('vd-mx');if(x){x.onclick=closeModal;x.focus();}}
  function closeModal(){var m=document.getElementById('vd-modal');if(m)m.classList.remove('on');
    if(_lastFocus&&_lastFocus.focus){try{_lastFocus.focus();}catch(e){}} _lastFocus=null;}

  /* ---- ① 분해 카드 ---- */
  function bkCard(w){
    function col(k,icn,arr,cls){return '<div class="vd-bk-col"><div class="vd-bk-k">'+ic(icn)+k+'</div>'+
      (arr&&arr.length?arr.map(function(x){return '<div class="vd-bk-v '+(cls||'')+'">'+esc(x)+'</div>';}).join(''):'<div class="vd-na">—</div>')+'</div>';}
    var actorLbl=w.actor==='human'?'사람':(w.actor==='hitl'?'사람 확인':'AAP');
    return '<div class="vd-bk"><div class="vd-bk-top"><span class="vd-can">'+esc(w.can||'')+'</span><span class="vd-bk-nm">'+esc(w.nm)+'</span>'+
      '<span class="vd-actor '+w.actor+'">'+actorLbl+'</span></div>'+
      '<div class="vd-bk-body">'+col('작업','list',w.actions)+col('필요 데이터','database',w.data)+col('결정점','split',w.dec,'dec')+col('리스크','alert-triangle',w.risk,'rsk')+'</div>'+
      '<div class="vd-why"><b>왜 이 단계?</b> '+esc(w.why||'')+'</div></div>';
  }

  /* ---- ① 재구성 그래프(순차·정직) ---- */
  function engGraph(d){
    var ti=0, parts=[];
    (d.work||[]).forEach(function(w){
      if(w.actor==='aap'){ ti++;
        var ops=(w.ops||[]).map(function(op,oi){var m=TYPE[op.ty]||TYPE.A;
          return '<button class="vd-cmp '+m.c+'" data-w="'+esc(w.id)+'" data-o="'+oi+'" aria-label="'+esc(m.ty+' '+op.nm+' — 근거 보기')+'">'+
            '<span class="vd-cdot"></span><span class="vd-cty">'+m.ty+'</span><span class="vd-cnm">'+esc(op.nm)+'</span><span class="vd-cL">'+esc(op.L||'')+'</span>'+ic('info')+'</button>';
        }).join('');
        parts.push('<div class="vd-tnode"><div class="vd-tnh"><span class="vd-tid">T'+ti+'</span><span class="vd-tnm">'+esc(w.nm)+'</span><span class="vd-tcn">구성요소 '+(w.ops||[]).length+'</span></div><div class="vd-cmps">'+ops+'</div></div>');
      } else if(w.actor==='hitl'&&w.gate){
        var g=(d.gates||[]).filter(function(x){return x.stepId===w.id;})[0]||{};
        parts.push('<div class="vd-gate">'+ic('flag')+'<div><div class="vd-gt">'+esc(w.nm)+' · HITL</div><div class="vd-gr">'+esc(g.reason||'')+'</div></div></div>');
      }
    });
    var flow=parts.join('<div class="vd-arr">'+ic('arrow-down')+'</div>');
    var legend=Object.keys(TYPE).map(function(k){var m=TYPE[k];return '<span class="vd-lg '+m.c+'"><span class="d" style="background:var(--c)"></span>'+m.ty+'</span>';}).join('');
    return '<div class="vd-eng"><div class="vd-eh"><span class="dot"></span>AAP 실행 흐름 · 작동 구조</div>'+
      '<div class="vd-enote">실행 단계(T#)가 순차로 이어지고, 각 단계 안에 배정된 <b>구성요소</b>가 데이터·근거→판단→실행을 담당합니다. ★는 사람 통제점(게이트). 색 = 5타입. 노드를 누르면 근거가 열립니다.</div>'+
      flow+'<div class="vd-leg">'+legend+'</div></div>';
  }

  /* ---- ② 온톨로지 ---- */
  function normLinks(links){ return (links||[]).map(function(l){return Array.isArray(l)?{from:l[0],rel:l[1],to:l[2]}:l;}); }
  function ontologyHtml(d){
    var o=d.ontology||{objects:[],links:[],touch:{}};
    function objName(k){var x=(o.objects||[]).filter(function(z){return z.k===k;})[0];return x?x.name:k;}
    function objKind(k){var x=(o.objects||[]).filter(function(z){return z.k===k;})[0];return x?x.kind:'entity';}
    var objs=(o.objects||[]).map(function(ob){
      return '<button class="vd-obj k'+cap(ob.kind)+'" data-ok="'+esc(ob.k)+'"><div class="vd-oh"><span class="vd-okind">'+(KIND[ob.kind]?KIND[ob.kind].label:ob.kind)+'</span><span class="vd-onm">'+esc(ob.name)+'</span></div>'+
        '<div class="vd-props">'+(ob.props||[]).map(function(p){return '<span>'+esc(p)+'</span>';}).join('')+'</div></button>';
    }).join('');
    var rels=normLinks(o.links).map(function(l){return '<div class="vd-rel"><b>'+esc(objName(l.from))+'</b><span class="vd-rv">—'+esc(l.rel)+'→</span><b>'+esc(objName(l.to))+'</b></div>';}).join('');
    var touch=(d.work||[]).filter(function(w){return w.actor==='aap';}).map(function(w){
      var ks=(o.touch&&o.touch[w.id])||[];
      return '<div class="vd-trow"><span class="vd-tstep">'+esc(w.nm)+'</span><div class="vd-tobjs">'+
        (ks.length?ks.map(function(k){return '<span class="k'+cap(objKind(k))+'">'+esc(objName(k))+'</span>';}).join(''):'<span style="border:none;color:var(--vd-faint)">—</span>')+'</div></div>';
    }).join('');
    return '<div class="vd-bh">'+ic('box')+'도메인 온톨로지 (L4)</div>'+
      '<div class="vd-bsub">분해가 딛고 선 객체·관계입니다. 업무가 다르면 온톨로지도 다릅니다 — 객체 클릭 → 속성·사용 단계.</div>'+
      '<div class="vd-onto">'+objs+'</div>'+
      '<div class="vd-bh" style="font-size:13px">'+ic('link-2')+'관계</div><div class="vd-rels">'+rels+'</div>'+
      '<div class="vd-bh" style="font-size:13px;margin-top:22px">'+ic('layers')+'이 분해가 만지는 온톨로지 — 단계별</div><div class="vd-touch">'+touch+'</div>';
  }

  /* ---- ③ Lineage ---- */
  var ROLE={source:'원천 데이터',transform:'결정론 변환',judgment:'LLM 판단',gate:'사람 통제점',output:'산출물'};
  function lineageHtml(d){
    var l=d.lineage||{output:{name:''},chain:[]};
    var hops=(l.chain||[]).map(function(h){
      return '<div class="vd-lhop r'+cap(h.role)+'"><span class="vd-lrole">'+(ROLE[h.role]||h.role)+'</span><div class="vd-lmain"><div class="vd-llabel">'+esc(h.label)+'</div><div class="vd-lnote">'+esc(h.note||'')+'</div></div><span class="vd-lrec">'+ic('check')+'기록됨</span></div>';
    }).join('<div class="vd-arr">'+ic('arrow-down')+'</div>');
    return '<div class="vd-bh">'+ic('git-commit')+'데이터 계보 (Lineage)</div>'+
      '<div class="vd-bsub">산출물이 <b>어떤 데이터·판단</b>에서 나왔는지 역추적합니다. <b style="color:var(--vd-module)">LLM 판단</b>과 <b style="color:var(--vd-agent)">결정론 실행</b>이 색으로 구분되고, 모든 홉이 기록됩니다 — \'재현·감사 가능\'의 실체입니다.</div>'+
      '<div class="vd-lout">'+ic('file-text')+'<span>추적 대상 산출물 <b>'+esc((l.output||{}).name||'')+'</b></span></div>'+
      '<div class="vd-arr">'+ic('arrow-down')+'</div><div class="vd-lin">'+hops+'</div>'+
      '<div class="vd-lfoot"><b>왜 중요한가</b> — Palantir류 data lineage가 데이터셋 변환을 추적하듯, AAP는 <b>요청→데이터→판단→게이트→산출물</b>을 전 구간 기록합니다. LLM이 판단한 지점과 결정론이 실행한 지점이 분리·표시되어, 결과를 신뢰하고 책임질 수 있습니다.</div>';
  }

  /* ---- 드릴: 구성요소 / 객체 ---- */
  function openCompModal(op,w){
    var m=TYPE[op.ty]||TYPE.A, cv=TYV[op.ty]||'--vd-agent';
    showModal('<div class="vd-mtop"><span class="vd-mtdot" style="background:var('+cv+')"></span><span class="vd-mty '+m.c+'" style="color:var('+cv+')">'+m.ty+'</span><span class="vd-mnm">'+esc(op.nm)+'</span>'+
      '<span class="vd-mL">'+esc(op.L||'')+' · '+esc(w.nm)+'</span><button class="vd-mx" id="vd-mx" aria-label="닫기">'+ic('x')+'</button></div>'+
      '<div class="vd-mbody"><div class="vd-mrow"><div class="vd-mk">하는 일</div><div class="vd-mv">'+esc(op.desc||'')+'</div></div>'+
      '<div class="vd-mrow"><div class="vd-mio"><div class="b"><div class="bl">읽는 데이터</div><div class="bv">'+esc(op.reads||'')+'</div></div><div class="b"><div class="bl">결과</div><div class="bv">'+esc(op.out||'')+'</div></div></div></div>'+
      (op.why?'<div class="vd-mrow"><div class="vd-mk">왜 '+m.ty+'인가</div><div class="vd-mwhy">'+esc(op.why)+'</div></div>':'')+'</div>');
  }
  function openObjModal(ob,d){
    var cv=KIND[ob.kind]?KIND[ob.kind].v:'--vd-agent';
    var using=(d.work||[]).filter(function(w){return w.actor==='aap'&&((d.ontology.touch&&d.ontology.touch[w.id])||[]).indexOf(ob.k)>=0;}).map(function(w){return w.nm;});
    showModal('<div class="vd-mtop"><span class="vd-mtdot" style="background:var('+cv+')"></span><span class="vd-mty" style="color:var('+cv+')">'+(KIND[ob.kind]?KIND[ob.kind].label:ob.kind)+'</span><span class="vd-mnm">'+esc(ob.name)+'</span>'+
      '<button class="vd-mx" id="vd-mx" aria-label="닫기">'+ic('x')+'</button></div>'+
      '<div class="vd-mbody"><div class="vd-mrow"><div class="vd-mk">속성</div><div class="vd-props">'+(ob.props||[]).map(function(p){return '<span>'+esc(p)+'</span>';}).join('')+'</div></div>'+
      '<div class="vd-mrow"><div class="vd-mk">이 객체를 만지는 단계</div><div class="vd-mv">'+(using.length?using.join(' · '):'—')+'</div></div></div>');
  }

  /* ---- 탭 셸 + 마운트 ---- */
  function panesHtml(d){
    /* 데이터 있는 탭만 노출(빈 탭 ✕). 분해·재구성은 항상, 온톨로지/Lineage는 데이터 있을 때만. */
    var hasOnt=!!(d.ontology&&(d.ontology.objects||[]).length);
    var hasLin=!!(d.lineage&&(d.lineage.chain||[]).length);
    var tabs=[{p:'decomp',ic:'workflow',t:'분해 · 재구성'}];
    if(hasOnt)tabs.push({p:'ontology',ic:'box',t:'온톨로지'});
    if(hasLin)tabs.push({p:'lineage',ic:'git-commit',t:'Lineage'});
    var nav='<div class="vd-tabs" role="tablist">'+tabs.map(function(x,i){
      return '<button class="vd-tab'+(i===0?' on':'')+'" role="tab" aria-selected="'+(i===0?'true':'false')+'" data-pane="'+x.p+'">'+ic(x.ic)+'<span>'+x.t+'</span></button>';
    }).join('')+'</div>';
    /* 헤더는 아이콘-led 무번호(호스트 위저드 스텝퍼가 유일 번호 소유 — 번호체계 충돌 ✕) */
    var decomp='<div class="vd-pane on" data-pane="decomp">'+
        '<div class="vd-bh">'+ic('layers')+'업무 분해 — 단계·작업·데이터·결정점·리스크</div><div class="vd-bsub">요청을 운영 가능한 단계로 쪼갰습니다. 입력마다 형태가 달라집니다.</div>'+
        (d.work||[]).map(bkCard).join('')+
        '<div class="vd-bh">'+ic('workflow')+'실행 구조 재구성 — 작업 → 5타입 배정·조립</div><div class="vd-bsub">결정론(Module·솔루션·Connector·Policy)과 추론(Agent)을 섞은 구조입니다. 노드 클릭 → 근거.</div>'+
        engGraph(d)+'</div>';
    var ont=hasOnt?'<div class="vd-pane" data-pane="ontology">'+ontologyHtml(d)+'</div>':'';
    var lin=hasLin?'<div class="vd-pane" data-pane="lineage">'+lineageHtml(d)+'</div>':'';
    return nav+decomp+ont+lin;
  }
  function mount(el,d){
    if(typeof el==='string')el=document.getElementById(el);
    if(!el)return;
    injectCSS(); ensureModal();
    if(el.className.indexOf('vd-root')<0)el.className+=' vd-root';
    el.innerHTML=panesHtml(d);
    /* 탭 */
    var tabs=Array.prototype.slice.call(el.querySelectorAll('.vd-tab'));
    function show(p){tabs.forEach(function(t){var on=t.dataset.pane===p;t.classList.toggle('on',on);t.setAttribute('aria-selected',on?'true':'false');});
      el.querySelectorAll('.vd-pane').forEach(function(pn){pn.classList.toggle('on',pn.dataset.pane===p);});}
    tabs.forEach(function(t,i){t.onclick=function(){show(t.dataset.pane);};
      t.onkeydown=function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var n=(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[n].focus();show(tabs[n].dataset.pane);}};});
    /* 드릴 */
    el.querySelectorAll('.vd-cmp').forEach(function(b){b.onclick=function(){var w=(d.work||[]).filter(function(x){return x.id===b.dataset.w;})[0];if(w)openCompModal(w.ops[+b.dataset.o],w);};});
    el.querySelectorAll('.vd-obj').forEach(function(b){b.onclick=function(){var ob=d.ontology.objects.filter(function(x){return x.k===b.dataset.ok;})[0];if(ob)openObjModal(ob,d);};});
  }

  window.AAP_VIZ={ mount:mount, panes:panesHtml, engGraph:engGraph, ontologyHtml:ontologyHtml, lineageHtml:lineageHtml, injectCSS:injectCSS, TYPE:TYPE, KIND:KIND };
})();
