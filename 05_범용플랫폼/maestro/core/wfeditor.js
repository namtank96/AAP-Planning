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
  /* 제어 블록 메타(타입 색 중립 = Policy 계열 회색톤 재사용 안 함 → 자체 ctl 클래스). L2(설계·개발)=흐름 로직. */
  const CTL_META={cls:'tCtl', ty:'tyCtl', L:'L2', ic:'git-branch'};
  const TYPE_KEYS=TYPES.map(t=>t.k);
  function typeMeta(k){ if(k==='Conditional'||k==='Loop')return {k, cls:CTL_META.cls, ty:CTL_META.ty, L:CTL_META.L, ic:(CONTROL.find(c=>c.k===k)||{}).ic||CTL_META.ic}; return TYPES.find(t=>t.k===k)||TYPES[0]; }
  /* 블록 종류(결정론 Action vs 비결정론 Use LLM) — core.blockKind 와 동일 규약(Agent=LLM, 그 외=결정론).
     팔레트·dry-run 이 일관된 라벨/색을 쓰게 한다(온톨로지 L4 정합). */
  function blockKind(typeKey){ return typeKey==='Agent'?'llm':'det'; }
  function kindLabel(kind){ return kind==='llm'?'Use LLM':'Action'; }
  /* 제어 블록(Conditional·Loop) — 결정론 흐름 제어. 캐논 단계 안에 얹는 논리 블록(타입 색 중립). */
  const CONTROL=[
    {k:'Conditional', ic:'git-branch', desc:'조건 분기 — 값에 따라 경로를 나눕니다(결정론).'},
    {k:'Loop',        ic:'repeat',     desc:'반복 — 목록·재시도 루프를 돕니다(결정론).'},
  ];
  const isControl=k=>CONTROL.some(c=>c.k===k);
  /* op.comp/badge → 타입 키 추정(코어 evidType 와 동일 휴리스틱 · 도메인 무관).
     빌더가 추가한 블록은 o.wfType 에 명시 타입(제어 블록 포함)을 보존 → 라운드트립 정확. */
  function opType(o){
    if(o&&o.wfType&&(TYPE_KEYS.includes(o.wfType)||isControl(o.wfType)))return o.wfType;
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
    /* 캔버스 노드 클릭 = 단계 선택(팔레트 추가 대상) — 그래프/편집 공통 */
    if(view==='graph')wireGraphSelect(pack);
    /* 3패널 빌더: 좌 팔레트 · 우 Run/디버거 (호스트 있으면 함께 렌더) */
    renderPalette(pack);
    renderRun(pack);
  }
  /* 현재 팔레트 추가 대상 단계 인덱스(없으면 0). 캔버스에서 단계 클릭으로 변경. */
  let _selStep=0;
  function selStepIdx(){ if(!M||!M.steps.length)return 0; return Math.min(Math.max(_selStep,0),M.steps.length-1); }
  function wireGraphSelect(pack){
    const host=$('wfEditor'); if(!host)return;
    const si=selStepIdx();
    host.querySelectorAll('.plg-task').forEach((g,i)=>{ g.style.cursor='pointer';
      if(i===si)g.classList.add('sel');
      g.onclick=()=>{ _selStep=i; renderPalette(pack); renderEditor(pack); }; });
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
    /* 제어 블록(Conditional·Loop) 등 5타입 외 현재값도 옵션에 포함(편집 시 의도치 않게 타입 바뀜 방지) */
    const selKeys=(cur)=>TYPE_KEYS.includes(cur)?TYPE_KEYS:TYPE_KEYS.concat([cur]);
    const typeSel=(si,ci,cur)=>`<select class="pl-ty-sel" data-si="${si}" data-ci="${ci}">${selKeys(cur).map(k=>`<option ${k===cur?'selected':''}>${k}</option>`).join('')}</select>`;
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
     override = { steps:{ [stepId]:{ comps:[{type,name}], hitl } } }. 코어가 적용·저장.
     ★스튜디오(팩 맥락) = setPackOverride(공유 팩 기본). 케이스 맥락은 setCaseOverride(케이스 델타)로 분리. */
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
          if(byName[c.name]){ /* 기존 op 보존 + 빌더 명시 타입 기록(라운드트립). 원 L 유지=근거 충실 */
            const ex=byName[c.name]; ex.wfType=c.type; newOps.push(ex);
          } else { /* 신규 구성요소 op 합성(근거 레일·8계층 반영용 최소 필드). 제어 블록도 op 로 가시화 */
            const ctl=isControl(c.type);
            newOps.push({ g:i, feed:ctl?`${c.name}`:`${c.name} 가동`, out:ctl?'흐름 제어':`${m.k} 처리`, L:m.L, comp:c.name, wfType:c.type });
          }
        });
        /* g(병렬 그룹) 재배치: 보존 op 의 g 를 유지하되 최소 그룹 보장 */
        const merged=newOps.concat(keepFlow);
        /* g 가 없으면 순번으로 */
        merged.forEach((o,i)=>{ if(typeof o.g!=='number')o.g=i; });
        w.ops=merged.length?merged:oldOps;
      }
    });
    /* 3) compose 칩 = 전 단계 comps 합계로 재계산(스튜디오 미리보기·run casm 반영).
       ★ov.steps 가 아니라 '적용 후 현재 work 전체'에서 집계 → 부분 델타(케이스 단위 튜닝)에서도
         건드리지 않은 단계의 구성요소가 compose 에서 사라지지 않게(케이스 델타 = 1단계만 가질 수 있음). */
    const cnt={Agent:0,Module:0,'기존 솔루션':0,Connector:0,Policy:0};
    const items={Agent:[],Module:[],'기존 솔루션':[],Connector:[],Policy:[]};
    /* 편집기가 보여주는 것과 동일하게 '적용 후 현재 work 전체'의 단계별 구성요소에서 집계
       (modelFromPack = 단계 내 comp 라벨 중복 제거). 부분 델타에서도 미편집 단계 보존. */
    modelFromPack(pack).steps.forEach(s=>{ s.comps.forEach(c=>{ const k=typeMeta(c.type).k; if(!(k in cnt))return; /* 제어 블록은 5타입 compose 칩 집계 제외 */ cnt[k]++; if(items[k].length<6&&!items[k].includes(c.name))items[k].push(c.name); }); });
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

  /* ═══════════════════════════════════════════════════════════════════════
     좌 패널 · 블록 팔레트 (풀 3패널 빌더) — 5타입 자산(전 팩 union) + 제어 블록
     ───────────────────────────────────────────────────────────────────────
     클릭 = 현재 선택 단계(_selStep)에 블록 추가 → 편집 모델 M 갱신 → commit(영속) → 캔버스 반영.
     자산 = AAP_CORE.getAssetCatalog()(코어가 전 팩 dedup·정규화). 결정론 Action / 비결정론 Use LLM 분리.
     ═══════════════════════════════════════════════════════════════════════ */
  let _palOpen=null;   /* 펼친 타입 그룹 키(아코디언) */
  function paletteAssets(){
    const all=(window.AAP_CORE&&window.AAP_CORE.getAssetCatalog&&window.AAP_CORE.getAssetCatalog())||[];
    /* ty(tyA..tyP) → 5타입 키로 그룹핑 */
    const byKey={Agent:[],Module:[],'기존 솔루션':[],Connector:[],Policy:[]};
    all.forEach(a=>{ const tk=(window.AAP_CORE&&window.AAP_CORE.typeKeyOf)?window.AAP_CORE.typeKeyOf(a.ty||a.type):'A';
      const kmap={A:'Agent',M:'Module',S:'기존 솔루션',C:'Connector',P:'Policy'}; const k=kmap[tk]||'Agent';
      byKey[k].push({name:a.name, ic:a.ic, desc:a.desc, L:a.L}); });
    return byKey;
  }
  function renderPalette(pack){
    const host=$('wfPalette'); if(!host)return;
    if(!M)M=modelFromPack(pack);
    const si=selStepIdx(); const cur=M.steps[si];
    const assets=paletteAssets();
    const grp=(t)=>{ const list=assets[typeMeta(t).k]||[]; const open=_palOpen===t;
      const head=`<button class="wfp-grp-h ${open?'on':''} ${typeMeta(t).cls}" data-pg="${t}">
        <span class="wfp-dot"></span><span class="wfp-grp-n">${t}</span>
        <span class="wfp-kind ${blockKind(t)}">${kindLabel(blockKind(t))}</span>
        <span class="wfp-grp-c">${list.length}</span><span class="wfp-car">${ICO(open?'chevron-down':'chevron-right')}</span></button>`;
      const body=open?`<div class="wfp-items">${list.length?list.map(a=>`<button class="wfp-item ${typeMeta(t).cls}" data-add-name="${esc(a.name)}" data-add-type="${t}" data-tip="${esc(a.desc||'')}">${ICO(typeMeta(t).ic)}<span>${esc(a.name)}</span><span class="wfp-L">${a.L||''}</span></button>`).join(''):'<div class="wfp-empty">등록된 자산 없음</div>'}
        <button class="wfp-item custom ${typeMeta(t).cls}" data-add-name="새 ${t}" data-add-type="${t}">${ICO('plus')}<span>새 ${t} 블록</span></button></div>`:'';
      return `<div class="wfp-grp">${head}${body}</div>`;
    };
    const ctlGrp=()=>{ const open=_palOpen==='__ctl__';
      const head=`<button class="wfp-grp-h ctl ${open?'on':''}" data-pg="__ctl__"><span class="wfp-dot"></span><span class="wfp-grp-n">제어</span><span class="wfp-kind det">결정론</span><span class="wfp-grp-c">${CONTROL.length}</span><span class="wfp-car">${ICO(open?'chevron-down':'chevron-right')}</span></button>`;
      const body=open?`<div class="wfp-items">${CONTROL.map(c=>`<button class="wfp-item ctl" data-add-name="${c.k}" data-add-type="${c.k}" data-tip="${esc(c.desc)}">${ICO(c.ic)}<span>${c.k}</span></button>`).join('')}</div>`:'';
      return `<div class="wfp-grp">${head}${body}</div>`;
    };
    host.innerHTML=`
      <button class="panel-fold" id="wfPalFold" data-tip="팔레트 접기 — 캔버스 확대">${ICO('panel-left-close')}</button>
      <div class="wfp-head">${ICO('layers')}블록 팔레트</div>
      <div class="wfp-target">추가 대상 단계 · <b>${cur?esc(cur.label):'—'}</b><span class="wfp-target-sub">캔버스에서 단계를 클릭해 바꿉니다</span></div>
      <div class="wfp-legend"><span class="wfp-lg det">Action = 결정론</span><span class="wfp-lg llm">Use LLM = 비결정론(온톨로지 경유)</span></div>
      ${TYPE_KEYS.map(grp).join('')}
      ${ctlGrp()}
      <div class="wfp-note">${ICO('info')}Action 블록은 온톨로지 Action(자동/사람 확인)과, Use LLM 블록은 온톨로지를 통한 데이터 접근과 연결됩니다.</div>`;
    host.querySelectorAll('[data-pg]').forEach(e=>e.onclick=()=>{ const k=e.dataset.pg; _palOpen=_palOpen===k?null:k; renderPalette(pack); });
    host.querySelectorAll('[data-add-name]').forEach(e=>e.onclick=()=>addBlock(pack, e.dataset.addType, e.dataset.addName));
  }
  /* 팔레트 블록 추가 = 선택 단계 comps 에 push → commit(영속). 중복 이름은 ' (2)' 부여. */
  function addBlock(pack, type, name){
    if(!M)M=modelFromPack(pack);
    const si=selStepIdx(); const s=M.steps[si]; if(!s)return;
    let nm=name||('새 '+type); let n=nm, i=2;
    while(s.comps.some(c=>c.name===n)){ n=nm+' ('+(i++)+')'; }
    s.comps.push({type, name:n});
    commit(pack);   /* override 저장 → 코어 reapply → renderDesign 재호출(캔버스·요약·run 갱신) */
    if(window.AAP_CORE&&window.AAP_CORE.toast)window.AAP_CORE.toast(`'${s.label}' 단계에 ${kindLabel(blockKind(type))} 블록 추가: ${n}`);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     우 패널 · Run / 디버거 (풀 3패널 빌더) — 선택 워크플로우 dry-run(결정론 시뮬)
     ───────────────────────────────────────────────────────────────────────
     단계별 블록 실행 흐름을 순차 시뮬: 블록 결정론/LLM 표시 + 합성 산출물 + HITL 게이트 멈춤.
     실제 LLM 은 Phase3 — 지금은 결정론 시뮬(재현 가능). 테스트 입력 + 실행 히스토리.
     ═══════════════════════════════════════════════════════════════════════ */
  let _runInput='';
  let _runHist=[];   /* [{ts, ok, steps, blocks}] */
  function dryRun(pack){
    if(!M)M=modelFromPack(pack);
    const trace=[]; let blocks=0, llm=0, det=0, gates=0, paused=false;
    M.steps.forEach((s,si)=>{
      const stepBlocks=s.comps.map(c=>{ const kind=blockKind(c.type); blocks++; if(kind==='llm')llm++; else det++;
        return { type:c.type, name:c.name, kind, ctl:isControl(c.type),
          out: isControl(c.type)?'경로 분기/반복 평가' : (kind==='llm'?`${c.name} 추론 결과(온톨로지 경유)`:`${c.name} 처리 결과(규칙)`) };
      });
      const gate=s.hitl; if(gate)gates++;
      trace.push({ idx:si+1, label:s.label, gate, blocks:stepBlocks, paused:gate });
      if(gate)paused=true;  /* HITL 게이트 = 사람 확인 멈춤(시뮬에선 표시만) */
    });
    return { trace, blocks, llm, det, gates, ok:gates>0 };
  }
  function renderRun(pack){
    const host=$('wfRun'); if(!host)return;
    if(!M)M=modelFromPack(pack);
    const r=dryRun(pack);
    const stepHtml=r.trace.map(t=>`
      <div class="wfr-step ${t.gate?'gate':''}">
        <div class="wfr-step-h"><span class="wfr-n">${String(t.idx).padStart(2,'0')}</span><b>${esc(t.label)}</b>${t.gate?`<span class="wfr-gate">${ICO('flag')}HITL 멈춤</span>`:''}</div>
        ${t.blocks.length?t.blocks.map(b=>`<div class="wfr-blk ${b.ctl?'ctl':typeMeta(b.type).cls}">
          <span class="wfr-blk-kind ${b.kind}">${b.ctl?'제어':kindLabel(b.kind)}</span>
          <span class="wfr-blk-n">${esc(b.name)}</span>
          <span class="wfr-blk-out">→ ${esc(b.out)}</span></div>`).join(''):'<div class="wfr-empty">블록 없음 — 팔레트에서 추가</div>'}
      </div>`).join('');
    const histHtml=_runHist.length?_runHist.slice(-4).reverse().map(h=>`<div class="wfr-hist-i ${h.ok?'ok':'block'}">${ICO(h.ok?'check-circle':'alert-triangle')}${h.ts} · ${h.blocks}블록 · LLM ${h.llm}/결정론 ${h.det} · HITL ${h.gates}</div>`).join(''):'<div class="wfr-empty">아직 실행 기록 없음</div>';
    host.innerHTML=`
      <button class="panel-fold" id="wfRunFold" data-tip="Run 접기 — 캔버스 확대">${ICO('panel-right-close')}</button>
      <div class="wfr-head">${ICO('play')}Run · 디버거<span class="wfr-sub">결정론 dry-run · 실제 LLM은 Phase3</span></div>
      <div class="wfr-input">
        <label>테스트 입력</label>
        <textarea id="wfrIn" rows="2" placeholder="예: 6월 정기 회의 요청 / 손해사정 신규 접수 …">${esc(_runInput)}</textarea>
      </div>
      <div class="wfr-stat">
        <span class="wfr-st">블록 <b>${r.blocks}</b></span>
        <span class="wfr-st llm">LLM <b>${r.llm}</b></span>
        <span class="wfr-st det">결정론 <b>${r.det}</b></span>
        <span class="wfr-st gate">HITL <b>${r.gates}</b></span>
      </div>
      ${r.gates?'':`<div class="wfr-block-warn">${ICO('alert-triangle')}HITL 게이트 0개 — 저장·실행 차단(자율 운영 안전 전제)</div>`}
      <button class="cp-btn primary sm wfr-go" id="wfrGo" ${r.gates?'':'disabled'}>${ICO('play')}dry-run 실행</button>
      <div class="wfr-flow" id="wfrFlow">${stepHtml}</div>
      <div class="wfr-hist-h">실행 히스토리</div>
      <div class="wfr-hist">${histHtml}</div>`;
    const ta=$('wfrIn'); if(ta)ta.onchange=()=>{ _runInput=ta.value; };
    const go=$('wfrGo'); if(go&&!go.disabled)go.onclick=()=>{
      const rr=dryRun(pack);
      _runHist.push({ ts:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}), ok:rr.ok, blocks:rr.blocks, llm:rr.llm, det:rr.det, gates:rr.gates });
      if(window.AAP_CORE&&window.AAP_CORE.toast)window.AAP_CORE.toast(`dry-run 완료 — ${rr.blocks}블록(LLM ${rr.llm}/결정론 ${rr.det}) · HITL ${rr.gates}관문`);
      renderRun(pack);
      const fl=$('wfrFlow'); if(fl)fl.classList.add('ran'); setTimeout(()=>{ const f=$('wfrFlow'); if(f)f.classList.remove('ran'); },700);
    };
  }

  /* ═══════════════════════════════════════════════════════════════════════
     P5 · 케이스 단위 튜닝 패널 (run 뷰 우측 레일 · "⚑ 이 케이스 한정")
     ───────────────────────────────────────────────────────────────────────
     코어 renderRight 이 매 렌더 호출. 케이스 맥락(run 뷰 + 활성 케이스)에서만 펼침 UI 노출.
     편집 = 현재 단계(selStepId)의 구성요소 add/replace/delete + HITL 토글 → 케이스 델타로 저장
     (setCaseOverride — packOverrides 미터치). 케이스 델타가 있는 단계엔 ⚑ 배지.
     액션: '이 케이스만 기본값 복원'(clearCaseOverride) · '이 유형 기본으로 승격'(promoteCaseOverride).
     pack = 코어가 넘긴 '케이스 오버레이까지 적용된 활성 팩 파생본'. ═══════════════════════════════════════════════════════════════════════ */
  let _ctOpen=false;   /* 패널 펼침 상태(케이스 간 유지 무방 — UI only) */
  function caseSteps(pack){ return modelFromPack(pack).steps; }
  /* 케이스 델타가 걸린 단계 id 집합 */
  function tunedStepIds(){
    const cov=(window.AAP_CORE&&window.AAP_CORE.getCaseOverride&&window.AAP_CORE.getCaseOverride())||null;
    return new Set(cov&&cov.steps?Object.keys(cov.steps):[]);
  }
  function renderCaseTuner(pack, selStepId){
    const host=$('caseTune'); if(!host)return;
    const inCase=window.AAP_CORE&&window.AAP_CORE.isCaseContext&&window.AAP_CORE.isCaseContext();
    if(!inCase){ host.innerHTML=''; host._ct=null; return; }   /* 케이스 맥락 아님 → 미표시 */
    const steps=caseSteps(pack);
    const cur=steps.find(s=>s.id===selStepId)||steps[0]; if(!cur){ host.innerHTML=''; return; }
    const tuned=tunedStepIds();
    const anyTuned=tuned.size>0;
    const curTuned=tuned.has(cur.id);
    /* 헤더 — 펼침 토글 + 케이스 한정 상태 */
    let h=`<div class="ct-head ${anyTuned?'on':''}" id="ctToggle">
        <span class="ct-flag">${ICO('flag')}</span><b>케이스 단위 튜닝</b>
        ${anyTuned?`<span class="ct-badge">⚑ 이 케이스 한정 ${tuned.size}단계</span>`:`<span class="ct-sub">이 케이스에만 적용</span>`}
        <span class="ct-caret">${ICO(_ctOpen?'chevron-down':'chevron-right')}</span></div>`;
    if(_ctOpen){
      h+=`<div class="ct-body">
        <div class="ct-note">${ICO('info')}여기서 바꾸면 <b>이 케이스에만</b> 적용됩니다(같은 유형의 다른 케이스·팩 기본은 그대로). 변경된 단계엔 ⚑ 표시됩니다.</div>
        <div class="ct-step ${curTuned?'tuned':''}">
          <div class="ct-step-h"><span class="ct-step-n">${String(steps.indexOf(cur)+1).padStart(2,'0')}</span><b>${esc(cur.label)}</b>${curTuned?'<span class="ct-mini">⚑ 이 케이스 한정</span>':''}
            ${cur.canGate?`<label class="wf-gate-tg ${cur.hitl?'on':''}" title="이 케이스에 한해 HITL 게이트 토글"><input type="checkbox" id="ctGate" ${cur.hitl?'checked':''}>${ICO('flag')}HITL</label>`:`<span class="wf-gate-na">${cur.hitl?ICO('flag')+'게이트':'—'}</span>`}
          </div>
          <div class="wf-comp-list">${cur.comps.map((c,ci)=>{const m=typeMeta(c.type);
            return `<div class="pl-comp ${m.cls}"><span class="pl-comp-dot"></span><select class="pl-ty-sel" data-ci="${ci}">${TYPE_KEYS.map(k=>`<option ${k===c.type?'selected':''}>${k}</option>`).join('')}</select><div class="pl-comp-main"><input class="pl-comp-name" data-ci="${ci}" value="${esc(c.name)}"></div><button class="pl-comp-del" data-ci="${ci}" title="이 케이스에서 삭제">${ICO('trash')}</button></div>`;
          }).join('')||'<div class="wf-comp-empty">구성요소 없음 — 아래에서 추가</div>'}
          <button class="pl-comp-add" id="ctAdd">${ICO('plus')}구성요소 추가</button></div>
        </div>
        <div class="ct-acts">
          ${anyTuned?`<button class="cp-btn ghost sm" id="ctReset">${ICO('rotate-ccw')}이 케이스만 기본값</button>
          <button class="cp-btn primary sm" id="ctPromote">${ICO('arrow-up')}이 유형 기본으로 승격</button>`:`<span class="ct-empty-hint">아직 이 케이스 변경 없음 — 위에서 구성/게이트를 바꾸면 이 케이스에만 저장됩니다.</span>`}
        </div></div>`;
    }
    host.innerHTML=h;
    /* ── 와이어링 ── */
    const tg=$('ctToggle'); if(tg)tg.onclick=()=>{ _ctOpen=!_ctOpen; renderCaseTuner(pack,selStepId); };
    if(!_ctOpen)return;
    /* 편집 = 현재 단계 모델을 케이스 델타로 머지 후 저장(setCaseOverride). pack 은 코어가 즉시 재오버레이. */
    const saveCur=()=>{
      const cov=(window.AAP_CORE.getCaseOverride()||{steps:{}});
      const steps2=cov.steps?{...cov.steps}:{};
      steps2[cur.id]={ comps:cur.comps.map(c=>({type:c.type,name:c.name})), hitl:!!cur.hitl };
      window.AAP_CORE.setCaseOverride({steps:steps2});  /* 코어가 overlay 재적용 + restoreStep → renderRight → 이 함수 재호출 */
    };
    host.querySelectorAll('.pl-ty-sel').forEach(e=>e.onchange=()=>{ cur.comps[+e.dataset.ci].type=e.value; saveCur(); });
    host.querySelectorAll('.pl-comp-name').forEach(e=>e.onchange=()=>{ cur.comps[+e.dataset.ci].name=e.value.trim()||'새 구성요소'; saveCur(); });
    host.querySelectorAll('.pl-comp-del').forEach(e=>e.onclick=()=>{ cur.comps.splice(+e.dataset.ci,1); saveCur(); });
    const add=$('ctAdd'); if(add)add.onclick=()=>{ cur.comps.push({type:'Agent',name:'새 구성요소'}); saveCur(); };
    const g=$('ctGate'); if(g)g.onchange=()=>{
      if(!g.checked){ const others=steps.filter(s=>s.id!==cur.id&&s.hitl).length; if(others===0){ g.checked=true; if(window.AAP_CORE.toast)window.AAP_CORE.toast('HITL 게이트는 최소 1개가 필요합니다'); return; } }
      cur.hitl=g.checked; saveCur();
    };
    const rs=$('ctReset'); if(rs)rs.onclick=()=>{ if(window.AAP_CORE.clearCaseOverride)window.AAP_CORE.clearCaseOverride(); };
    const pr=$('ctPromote'); if(pr)pr.onclick=()=>{ if(window.AAP_CORE.promoteCaseOverride)window.AAP_CORE.promoteCaseOverride(); };
  }

  /* ── 외부 노출(코어가 사용) ── */
  window.AAP_WFEDITOR={ renderEditor, applyOverride, modelFromPack, renderCaseTuner, renderPalette, renderRun };
})();
