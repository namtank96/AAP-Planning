/* =========================================================================
   AAP Workflow Editor — 스튜디오 경량 워크플로우 편집기 (기획 §4-4 · 팔란티어식)
   ─────────────────────────────────────────────────────────────────────────
   스튜디오에서 워크플로우(도메인 팩)를 노드 그래프로 시각화 + 경량 편집한다.
     · 시각화: 8단계 캐논 레인 × 단계별 5타입 구성요소 노드 + HITL 게이트(amber) + 데이터 흐름 엣지
     · 경량 편집: 단계별 구성요소 추가/교체/삭제 · HITL 게이트 토글(게이트 0개 금지)
     · 캐논 8단계 자체의 순서/추가·삭제는 범위 밖(8단계 캐논 고정) — 단계 내 구성·게이트만.
   ─────────────────────────────────────────────────────────────────────────
   설계: 코어=도메인 무관. 편집기 로직은 일반(팩 데이터만 수정).
     · 편집 결과 = AAP_CORE 가 제공하는 packOverrides[packId](localStorage 영속).
     · normalizePack 직후 코어가 applyPackOverride 를 부르면 work.ops/compose/hitl 에 반영
       → 실행(run) 뷰의 근거 레일·8계층·compose 칩이 편집 결과를 그대로 반영.
   노드 그래프 스타일 = pipeline.js renderComposeGraph 와 동일 토큰(.plg-*) 재사용.
   file:// 동작 · 외부 라이브러리 0 · Lucide 인라인.
   ========================================================================= */
(function(){
  const ICO=(n)=>window.AAP_ICON?window.AAP_ICON.svg(n):'';
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* 5타입 토큰 (디자인 계약 준수 — 색은 .plg-comp.tX / .pl-t.tX 가 5타입 색 상속) */
  const TYPES=[
    {k:'Agent',     cls:'tA', ty:'tyA', L:'L3', ic:'sparkles'},
    {k:'Module',    cls:'tM', ty:'tyM', L:'L6', ic:'puzzle'},
    {k:'기존 솔루션', cls:'tS', ty:'tyS', L:'L8', ic:'database'},
    {k:'Connector', cls:'tC', ty:'tyC', L:'L5', ic:'folder'},
    {k:'Policy',    cls:'tP', ty:'tyP', L:'L7', ic:'shield'},
  ];
  const TYPE_KEYS=TYPES.map(t=>t.k);
  const typeMeta=k=>TYPES.find(t=>t.k===k)||TYPES[0];
  /* op.comp/badge → 5타입 키 추정(코어 evidType 와 동일 휴리스틱 · 도메인 무관) */
  function opType(o){
    const t=(o.comp||'')+' '+(o.badge||'');
    if(/정책|Policy|게이트|HITL|차단|승인|통제|마스킹|DLP|PII/.test(t))return 'Policy';
    if(/Connector|커넥터|연결|수집|연동/.test(t))return 'Connector';
    if(/솔루션|ATS|HRIS|KMS|그룹웨어|문서함|스토리지|DB/.test(t))return '기존 솔루션';
    if(/Module|모듈|OCR|정규화|검증|평가|Antbot|AI:ON-U|품질/.test(t))return 'Module';
    return 'Agent';
  }
  /* 캐논 단계 = 게이트 후보 식별. work 의 hitl/meeting/gate 플래그가 게이트.
     토글 가능 게이트 = approve(HITL①)·commit(HITL③)·hitl 형 meeting(채용 면접확인 등).
     단, '실시간 회의' 흐름(w.meeting)은 시작/종료 신호 통제 구조라 토글 대상에서 제외(고정 게이트). */
  function isGate(w){ return !!(w.hitl||w.meeting||w.gate); }
  function canGate(w){ if(w.meeting)return false; return w.id==='approve'||w.id==='commit'||w.id==='meeting'||!!w.hitl; }

  /* ═══════════════════════════════════════════════════════════════════════
     편집 모델(M) — 선택된 팩의 work[] 에서 단계별 {comps,hitl} 추출.
     comps = 사람이 편집하는 구성요소 목록(타입·이름). 저장 시 override 로 영속.
     ═══════════════════════════════════════════════════════════════════════ */
  let M=null;        /* { packId, label, steps:[{id,label,role,comps:[{type,name}],hitl,canGate,gate}] } */

  /* 팩(이미 override 적용된 런타임 팩) → 편집 모델. ops 의 comp 를 구성요소 카드로 추출. */
  function modelFromPack(pack){
    const steps=(pack.work||[]).map(w=>{
      /* 같은 comp 라벨 중복 제거(여러 op 가 같은 구성요소) */
      const seen=new Set(), comps=[];
      (w.ops||[]).forEach(o=>{ const name=o.comp||''; if(!name||seen.has(name))return; seen.add(name);
        comps.push({type:opType(o), name}); });
      return { id:w.id, label:w.label, role:w.role, comps, hitl:isGate(w), canGate:canGate(w), gate:!!w.gate };
    });
    return { packId:pack.id, label:pack.label, steps };
  }

  /* ── DOM ── */
  const $=id=>document.getElementById(id);

  /* 스튜디오에서 선택된 팩의 편집기 렌더(코어 renderDesign 이 호출).
     host = #wfEditor 컨테이너. pack = normalizePack+override 적용된 런타임 팩. */
  function renderEditor(pack){
    const host=$('wfEditor'); if(!host)return;
    M=modelFromPack(pack);
    const edited=window.AAP_CORE&&window.AAP_CORE.hasPackOverride&&window.AAP_CORE.hasPackOverride(pack.id);
    /* 타입별 합계(디자인 계약: 5타입 색 칩) */
    const cnt={}; M.steps.forEach(s=>s.comps.forEach(c=>{const k=typeMeta(c.type).k;cnt[k]=(cnt[k]||0)+1;}));
    const gateCount=M.steps.filter(s=>s.hitl).length;
    const view=host._wfView||'graph';
    host.innerHTML=`
      <div class="wf-bar">
        <div class="wf-bar-l">
          <span class="wf-typebar">${TYPES.map(t=>`<span class="pl-t ${t.cls}"><span class="pl-t-dot"></span>${t.k} ${cnt[t.k]||0}</span>`).join('')}</span>
          <span class="wf-gate-cnt ${gateCount?'':'zero'}">${ICO('flag')}HITL 게이트 ${gateCount}</span>
        </div>
        <div class="wf-bar-r">
          ${edited?`<button class="cp-btn ghost sm" id="wfReset">${ICO('rotate-ccw')}기본값 복원</button>`:''}
          <span class="pl-cmp-toggle">
            <button class="pl-cmp-tg ${view==='graph'?'on':''}" data-wv="graph">${ICO('git-branch')}노드 그래프</button>
            <button class="pl-cmp-tg ${view==='edit'?'on':''}" data-wv="edit">${ICO('list')}편집</button>
          </span>
        </div>
      </div>
      ${edited?`<div class="wf-edited">${ICO('check-circle')}이 워크플로우는 편집·저장됨 — 실행(run) 뷰의 근거 레일·8계층·구성요소 칩에 반영됩니다. 새로고침해도 유지됩니다.</div>`:''}
      ${gateCount?'':`<div class="wf-gate-block">${ICO('alert-triangle')}<div><b>HITL 게이트 0개 — 저장 차단</b><span>사람 통제점이 하나도 없는 자율 운영은 책임·되돌리기 위험이 있어 저장할 수 없습니다. 승인/회의/최종 단계 중 최소 1개의 게이트를 켜세요.</span></div></div>`}
      <div id="wfBody">${view==='graph'?renderGraph():renderEdit()}</div>`;
    host.querySelectorAll('[data-wv]').forEach(e=>e.onclick=()=>{ host._wfView=e.dataset.wv; renderEditor(pack); });
    const rs=$('wfReset'); if(rs)rs.onclick=()=>{ if(window.AAP_CORE.clearPackOverride)window.AAP_CORE.clearPackOverride(pack.id); };
    if(view==='edit')wireEdit(pack);
  }

  /* ── 노드 그래프 시각화 (8단계 캐논 레인 × 5타입 구성요소 노드 + HITL 게이트 + 엣지) ──
     pipeline.renderComposeGraph 와 동일 .plg-* 토큰. 좌 = 캐논 단계 노드, 우 = 그 단계 구성요소(타입색).
     HITL 게이트 단계는 단계 노드에 amber 플래그 + 게이트 노드. */
  function renderGraph(){
    const PADT=14, GAP=18;
    const compH=30, compW=210, taskW=168, taskH=46, colGap=130, gateW=128;
    let y=PADT, taskGeo=[], compGeo=[], gateGeo=[], edges=[];
    M.steps.forEach(s=>{
      const start=y;
      s.comps.forEach(c=>{ const m=typeMeta(c.type);
        compGeo.push({x:taskW+colGap, y, w:compW, h:compH, name:c.name, cls:m.cls}); y+=compH+7; });
      if(!s.comps.length)y+=compH; /* 빈 단계도 자리 차지 */
      const end=y-7;
      const ty=(start+Math.max(end,start+taskH)-taskH)/2;
      taskGeo.push({x:0,y:ty,w:taskW,h:taskH,label:s.label,gate:s.hitl});
      const cidxStart=compGeo.length-s.comps.length;
      s.comps.forEach((c,ci)=>{ const cg=compGeo[cidxStart+ci]; edges.push({tx:taskW,ty:ty+taskH/2,cx:taskW+colGap,cy:cg.y+compH/2,gate:s.hitl}); });
      if(s.hitl)gateGeo.push({x:taskW-gateW-2, y:ty+taskH+3, w:gateW, h:22});
      y+=GAP;
    });
    const W=taskW+colGap+compW+4, H=Math.max(y,160);
    const edgeP=edges.map(e=>{const mx=(e.tx+e.cx)/2;return `<path class="plg-edge ${e.gate?'g':''}" d="M${e.tx},${e.ty} C${mx},${e.ty} ${mx},${e.cy} ${e.cx},${e.cy}"/>`;}).join('');
    const taskN=taskGeo.map(g=>`<g class="plg-task ${g.gate?'gate':''}" transform="translate(${g.x},${g.y})"><rect width="${g.w}" height="${g.h}" rx="9"/><text class="plg-tl" x="13" y="${g.h/2+4}">${esc(g.label)}${g.gate?'  ⚑':''}</text></g>`).join('');
    const gateN=gateGeo.map(g=>`<g class="plg-gate" transform="translate(${g.x},${g.y})"><rect width="${g.w}" height="${g.h}" rx="6"/><text class="plg-gtl" x="${g.w/2}" y="15">HITL 게이트</text></g>`).join('');
    const compN=compGeo.map(g=>`<g class="plg-comp ${g.cls}" transform="translate(${g.x},${g.y})"><rect width="${g.w}" height="${g.h}" rx="8"/><circle class="plg-dot" cx="13" cy="${g.h/2}" r="4"/><text class="plg-cn" x="26" y="${g.h/2+4}">${esc(g.name)}</text></g>`).join('');
    return `<div class="plg-wrap">
      <div class="plg-canvas"><svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMinYMin meet">
        <g class="plg-edges">${edgeP}</g>${taskN}${gateN}${compN}</svg></div>
      <div class="plg-leg">${TYPES.map(t=>`<span class="plg-lg ${t.cls}"><span class="plg-lg-d"></span>${t.k}</span>`).join('')}<span class="plg-lg gate"><span class="plg-lg-d"></span>HITL 게이트</span><span class="plg-leg-note">캐논 단계(좌) → 가동 구성요소(우) · ⚑ = 사람 통제점</span></div>
    </div>`;
  }

  /* ── 편집 뷰 (단계별 구성요소 추가/교체/삭제 + HITL 게이트 토글) ── */
  function renderEdit(){
    const typeSel=(si,ci,cur)=>`<select class="pl-ty-sel" data-si="${si}" data-ci="${ci}">${TYPE_KEYS.map(k=>`<option ${k===cur?'selected':''}>${k}</option>`).join('')}</select>`;
    const stepCard=(s,si)=>`<div class="wf-step ${s.hitl?'gated':''}">
      <div class="wf-step-h">
        <span class="wf-step-n">${String(si+1).padStart(2,'0')}</span>
        <b>${esc(s.label)}</b><span class="wf-step-role">${esc(s.role||'')}</span>
        ${s.canGate?`<label class="wf-gate-tg ${s.hitl?'on':''}" title="HITL 게이트(사람 통제점) 토글">
          <input type="checkbox" data-gate="${si}" ${s.hitl?'checked':''}>${ICO('flag')}HITL 게이트</label>`
          :`<span class="wf-gate-na" title="캐논 게이트 후보 단계가 아닙니다(승인·회의·최종만 게이트 가능)">${s.hitl?ICO('flag')+'게이트':'—'}</span>`}
      </div>
      <div class="wf-comp-list">${s.comps.map((c,ci)=>{const m=typeMeta(c.type);
        return `<div class="pl-comp ${m.cls}"><span class="pl-comp-dot"></span>${typeSel(si,ci,c.type)}<div class="pl-comp-main"><input class="pl-comp-name" data-si="${si}" data-ci="${ci}" value="${esc(c.name)}"></div><button class="pl-comp-del" data-si="${si}" data-ci="${ci}" title="삭제">${ICO('trash')}</button></div>`;
      }).join('')||'<div class="wf-comp-empty">구성요소 없음 — 아래에서 추가하세요</div>'}
      <button class="pl-comp-add" data-add="${si}">${ICO('plus')}구성요소 추가</button></div>
    </div>`;
    return `<div class="wf-steps">${M.steps.map(stepCard).join('')}</div>`;
  }

  function wireEdit(pack){
    const root=$('wfBody'); if(!root)return;
    const save=()=>commit(pack);
    root.querySelectorAll('.pl-ty-sel').forEach(e=>e.onchange=()=>{ M.steps[+e.dataset.si].comps[+e.dataset.ci].type=e.value; save(); });
    root.querySelectorAll('.pl-comp-name').forEach(e=>e.onchange=()=>{ M.steps[+e.dataset.si].comps[+e.dataset.ci].name=e.value.trim()||'새 구성요소'; save(); });
    root.querySelectorAll('.pl-comp-del').forEach(e=>e.onclick=()=>{ M.steps[+e.dataset.si].comps.splice(+e.dataset.ci,1); save(); });
    root.querySelectorAll('[data-add]').forEach(e=>e.onclick=()=>{ M.steps[+e.dataset.add].comps.push({type:'Agent',name:'새 구성요소'}); save(); });
    root.querySelectorAll('[data-gate]').forEach(e=>e.onchange=()=>{
      const si=+e.dataset.gate, want=e.checked;
      if(!want){ /* 게이트 0개 금지 — 마지막 게이트는 끌 수 없음 */
        const others=M.steps.filter((s,i)=>i!==si&&s.hitl).length;
        if(others===0){ e.checked=true; if(window.AAP_CORE.toast)window.AAP_CORE.toast('HITL 게이트는 최소 1개가 필요합니다 — 자율 운영 안전 전제'); return; }
      }
      M.steps[si].hitl=want; save();
    });
  }

  /* ── 저장: 편집 모델 → override → AAP_CORE 영속·반영 ──
     override = { steps:{ [stepId]:{ comps:[{type,name}], hitl } } }. 코어가 적용·저장. */
  function commit(pack){
    const ov={steps:{}};
    M.steps.forEach(s=>{ ov.steps[s.id]={ comps:s.comps.map(c=>({type:c.type,name:c.name})), hitl:!!s.hitl }; });
    if(window.AAP_CORE&&window.AAP_CORE.setPackOverride)window.AAP_CORE.setPackOverride(pack.id, ov);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     OVERRIDE 적용 — 코어가 normalizePack 직후 호출(도메인 무관).
     override 의 단계별 comps/hitl 을 work.ops · work.hitl/gate · compose 에 인플레이스 반영.
     ops 는 기존 comp 라벨을 보존(feed/out/L/detail 유지)하고, 추가/삭제만 반영 →
     실행 뷰 근거 레일·8계층(o.L)·compose 칩이 편집 결과를 그대로 반영.
     ═══════════════════════════════════════════════════════════════════════ */
  function applyOverride(pack, ov){
    if(!pack||!ov||!ov.steps)return pack;
    (pack.work||[]).forEach(w=>{
      const so=ov.steps[w.id]; if(!so)return;
      /* 1) HITL 게이트 토글 → hitl/gate 플래그(런타임 currentCM/runStep 이 읽음). meeting 은 보존. */
      if('hitl' in so){
        if(w.meeting){ /* 회의 단계: 게이트 끄면 일반 실행 단계로(meeting 유지하되 gate만), 켜면 그대로 */
          w.gate=so.hitl?1:0;
        } else {
          w.hitl=so.hitl?1:0; w.gate=so.hitl?1:0;
          if(!so.hitl && w.actor==='hitl')w.actor='aap'; /* 게이트 해제 시 자동 실행 단계로 */
          if(so.hitl && (w.id==='approve'||w.id==='commit'))w.actor='hitl';
        }
      }
      /* 2) 구성요소 add/replace/delete → ops 재구성(기존 op 보존 우선) */
      if(Array.isArray(so.comps)){
        const oldOps=(w.ops||[]).slice();
        const byName={}; oldOps.forEach(o=>{ if(o.comp&&!(o.comp in byName))byName[o.comp]=o; });
        /* 보존: comp 라벨이 없는 op(흐름 op)는 그대로 유지 */
        const keepFlow=oldOps.filter(o=>!o.comp);
        const newOps=[];
        so.comps.forEach((c,i)=>{
          const m=typeMeta(c.type);
          if(byName[c.name]){ /* 기존 op 보존 + 타입 바뀌면 L 갱신은 하지 않음(원 L 유지=근거 충실) */
            newOps.push(byName[c.name]);
          } else { /* 신규 구성요소 op 합성(근거 레일·8계층 반영용 최소 필드) */
            newOps.push({ g:i, feed:`${c.name} 가동`, out:`${m.k} 처리`, L:m.L, comp:c.name });
          }
        });
        /* g(병렬 그룹) 재배치: 보존 op 의 g 를 유지하되 최소 그룹 보장 */
        const merged=newOps.concat(keepFlow);
        /* g 가 없으면 순번으로 */
        merged.forEach((o,i)=>{ if(typeof o.g!=='number')o.g=i; });
        w.ops=merged.length?merged:oldOps;
      }
    });
    /* 3) compose 칩 = 전 단계 comps 합계로 재계산(스튜디오 미리보기·run casm 반영) */
    const cnt={Agent:0,Module:0,'기존 솔루션':0,Connector:0,Policy:0};
    const items={Agent:[],Module:[],'기존 솔루션':[],Connector:[],Policy:[]};
    Object.keys(ov.steps).forEach(sid=>{ (ov.steps[sid].comps||[]).forEach(c=>{ const k=typeMeta(c.type).k; cnt[k]++; if(items[k].length<6&&!items[k].includes(c.name))items[k].push(c.name); }); });
    /* sub(타입 설명)은 원본 compose 에서 타입별로 보존(blank 방지) */
    const subMap={Agent:'전문 작업',Module:'재사용 기능','기존 솔루션':'Buy·Integrate',Connector:'시스템 연동',Policy:'통제·권한'};
    ((pack._base&&pack._base.compose)||pack.compose||[]).forEach(c=>{ if(c&&c.t&&c.sub)subMap[c.t]=c.sub; });
    pack.compose=TYPES.map(t=>({t:t.k,sub:subMap[t.k]||'',cls:t.cls,n:cnt[t.k],items:items[t.k]})).filter(c=>c.n>0);
    /* gates 라벨 = 켜진 게이트 단계로 재구성(스튜디오 gatebar·미리보기) */
    const gateSteps=(pack.work||[]).filter(w=>isGate(w));
    pack.gates=gateSteps.map((w,i)=>`★ HITL ${i+1} ${w.label}`);
    pack._dcDone=false; /* compose 재정규화 필요 */
    return pack;
  }

  /* ── 외부 노출(코어가 사용) ── */
  window.AAP_WFEDITOR={ renderEditor, applyOverride, modelFromPack };
})();
