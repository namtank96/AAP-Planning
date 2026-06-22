/* =========================================================================
   AAP Pipeline — 프로세스 → 자율운영 격상 파이프라인 (로드맵 Phase 2)
   ─────────────────────────────────────────────────────────────────────────
   '업무 학습'(지식 축적)을 넘어, AI가 업무 프로세스를 분해하고 실제 자율 운영
   가능 수준으로 격상(HITL 필수 포함)시키는 5단계 파이프라인.
     ① 이해·분해(Breakdown)  텍스트 → 단계·작업·데이터·결정점·리스크
     ② 실행 구조 구성(Compose) 작업 → 5타입 구성요소 매핑(사람 수정 가능)
     ③ HITL 배치(Gate) ★필수★ 결정점에 인간 게이트 — 0개면 진행 불가
     ④ 격상·검증(Operationalize) 8계층 캐논 Pack 조립 + 거버넌스 + 검증 체크리스트
     ⑤ 시운전→승격(Promote) dry-run → 사람 검토 → AAP_CORE.register 로 운영 편입
   ─────────────────────────────────────────────────────────────────────────
   분해/구성/게이트 제안 = 결정론 시뮬(규칙·템플릿). 실제 LLM 은 Phase 3 에서
   proposeBreakdown / proposeCompose / proposeGates 자리를 그대로 교체한다.
   출력 = 기존 Domain Pack 스키마(genericAuthor 재사용) → 통합 인박스·카탈로그 편입.
   file:// 동작 · 외부 라이브러리 0 · Lucide 아이콘.
   ========================================================================= */
(function(){
  if(!window.AAP_CORE||!window.AAP_AUTHOR){ if(window.console)console.warn('[AAP Pipeline] AAP_CORE/AAP_AUTHOR 미로드 — 파이프라인 비활성'); return; }
  const ICO=(n)=>window.AAP_ICON?window.AAP_ICON.svg(n):'';
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* 5타입 토큰 (디자인 계약 준수 — 색은 CSS .pl-t.tX 가 5타입 색 상속) */
  const TYPES=[
    {k:'Agent',   cls:'tA', ic:'sparkles', sub:'전문 작업(추론·생성)'},
    {k:'Module',  cls:'tM', ic:'puzzle',   sub:'재사용 기능(결정론)'},
    {k:'기존 솔루션',cls:'tS', ic:'database',  sub:'Buy·Integrate'},
    {k:'Connector',cls:'tC', ic:'folder',   sub:'시스템 연동'},
    {k:'Policy',  cls:'tP', ic:'shield',    sub:'통제·권한'},
  ];
  const TYPE_KEYS=TYPES.map(t=>t.k);
  const typeMeta=k=>TYPES.find(t=>t.k===k)||TYPES[0];

  /* 캐논 8단계 work step id (genericAuthor 와 정합) → 파이프라인 작업이 어느 캐논 단계로 가는지 */
  const CANON=[
    {id:'request',label:'요청 접수',cap:'입력'},
    {id:'understand',label:'업무 이해',cap:'의미화'},
    {id:'compose',label:'실행 구조 구성',cap:'구성'},
    {id:'approve',label:'계획 승인',cap:'HITL ①',gate:1},
    {id:'prepare',label:'처리 실행',cap:'실행'},
    {id:'commit',label:'최종 승인',cap:'HITL ②',gate:1},
    {id:'share',label:'반영·기록·학습',cap:'학습'},
  ];

  /* ═══════════════════════════════════════════════════════════════════════
     교체 가능한 제안 엔진 (결정론 시뮬) — Phase 3 에서 LLM 으로 교체
     각 함수는 순수 함수: 입력 → 제안 데이터. 부수효과 없음.
     ═══════════════════════════════════════════════════════════════════════ */

  /* 규칙용 키워드 사전 (한국어 업무 설명에서 신호 추출) */
  const KW={
    external:['발송','전송','통지','안내','공유','초대','메일','메시지','고객','대외','외부','공시','신고','제출'],
    write   :['등록','반영','기록','갱신','저장','입력','발행','확정','승인','처리','조치','지급','결제','정산'],
    risk    :['책임','승인','보안','리스크','위험','규정','제재','컴플라이언스','감사','개인정보','PII','법','계약','금액','고액'],
    data    :['조회','확인','검토','수집','분석','대조','검색','이력','데이터','시스템','DB','ERP','문서'],
    decide  :['판단','결정','선택','심사','평가','정한다','정해','여부','승인','분류'],
  };
  const hit=(text,arr)=>arr.filter(k=>text.includes(k));

  /* ── ① 분해: 텍스트 → {steps:[{id,label,actor,actions[],data[],decisions[],risks[]}], signals} ── */
  function proposeBreakdown(text){
    const t=(text||'');
    const lines=t.split(/[\n.。]/).map(s=>s.trim()).filter(Boolean);
    const title=(lines.find(l=>!l.startsWith('['))||'새 업무').replace(/\.$/,'').slice(0,30);
    const sExt=hit(t,KW.external), sWr=hit(t,KW.write), sRk=hit(t,KW.risk), sDt=hit(t,KW.data), sDc=hit(t,KW.decide);
    /* 캐논 단계 골격에 텍스트 신호를 입혀 '작업·데이터·결정점·리스크'를 도출 */
    const steps=[
      {id:'request',label:'요청 접수',actor:'human',
        actions:['업무 요청 수신','핵심 신호·대상 추출'],
        data:['요청 본문', sDt.length?`참조: ${sDt.slice(0,2).join('·')}`:'요청 메타'],
        decisions:[], risks:[]},
      {id:'understand',label:'업무 이해·분석',actor:'aap',
        actions:['업무 유형 분류','목적·필요 산출물 정의', sDt.length?'근거 데이터 식별':'맥락 정리'],
        data:sDt.length?sDt.slice(0,3):['업무 이력','유형 온톨로지'],
        decisions:sDc.length?['업무 유형·처리 경로 분류']:['처리 경로 분류'],
        risks:sRk.length?[`규정·책임 신호 감지(${sRk.slice(0,2).join('·')})`]:[]},
      {id:'compose',label:'처리·산출물 생성',actor:'aap',
        actions:['데이터 조회·대조', sDc.length?'판단·평가':'처리안 산정','산출물 초안 생성'],
        data:sDt.length?sDt.slice(0,3):['기간계/시스템','문서·이력'],
        decisions:sDc.length?sDc.slice(0,2).map(k=>`${k} 결정점`):['처리 수준 결정점'],
        risks:[ ...(sRk.length?['책임 판단 — 자동 확정 위험']:[]) ]},
      {id:'commit',label:'반영·발송·기록',actor:'aap',
        actions:[ sWr.length?'시스템 반영·기록':'결과 기록', sExt.length?'대외 발송·통지':'결과 전달','학습 패턴 축적'],
        data:[ sWr.length?`반영 대상: ${sWr.slice(0,2).join('·')}`:'기록 대상', sExt.length?`발송 대상: ${sExt.slice(0,2).join('·')}`:'전달 대상'],
        decisions:[],
        risks:[ ...(sExt.length?['외부 영향 — 되돌리기 어려움']:[]), ...(sWr.length?['시스템 반영 — 사후 정정 비용']:[]) ]},
    ];
    return {
      title, request:lines.join(' ').slice(0,140)||'업무 요청',
      signals:{external:sExt,write:sWr,risk:sRk,data:sDt,decide:sDc},
      steps,
    };
  }

  /* ── ② 구성: 분해 → 작업별 5타입 구성요소 매핑 제안 ──
     반환: [{taskId, taskLabel, comps:[{type,name,note}]}]  (사람이 type·항목 수정) */
  function proposeCompose(bd){
    const sig=bd.signals;
    const out=[];
    const add=(taskId,taskLabel,comps)=>out.push({taskId,taskLabel,comps});
    add('understand','업무 이해·분석',[
      {type:'Agent',name:'분류·이해 Agent',note:'요청을 유형·목적으로 구조화(L4)'},
      ...(sig.risk.length?[{type:'Policy',name:'규정 플래그 Policy',note:'규정·책임 신호 표시(L7)'}]:[]),
    ]);
    add('compose','처리·산출물 생성',[
      ...(sig.data.length?[{type:'기존 솔루션',name:'기간계/ERP 연동',note:'사내 시스템 조회(L8)'}]:[]),
      {type:'Connector',name:'데이터 Connector',note:'근거 데이터 수집(L5)'},
      {type:'Agent',name:'분석·생성 Agent',note:'근거 분석·산출물 생성(L3)'},
      {type:'Module',name:'품질 평가 모듈',note:'산출물 충족도 검수 · Antbot(L6)'},
    ]);
    add('commit','반영·발송·기록',[
      ...(sig.write.length?[{type:'기존 솔루션',name:'기간계 Writeback',note:'시스템 반영·기록(L8)'}]:[]),
      ...(sig.external.length?[{type:'Connector',name:'발송 Connector',note:'대외 통지·발송(L5)'}]:[]),
      {type:'Policy',name:'발송·반영 Policy',note:'책임 행동 차단·승인 요구(L7)'},
      {type:'Agent',name:'지식 자산화 Agent',note:'패턴 축적 · Self-Improving(L7)'},
    ]);
    return out;
  }

  /* ── ③ 게이트: 분해·구성 → HITL 게이트 자동 제안 ──
     반환: [{stepId, canonId, reason, kind:'required'|'suggested', auto:true}]
     규칙: 외부 영향·시스템 반영·책임 판단 결정점 → 게이트. */
  function proposeGates(bd){
    const sig=bd.signals, gates=[];
    /* 계획 승인 게이트(HITL ①) = 판단/처리 수준 결정이 있으면 권고 */
    if(sig.decide.length||sig.risk.length)
      gates.push({stepId:'approve',canonId:'approve',reason:'처리 수준·판단을 사람이 확정(책임 판단)',kind:'required',auto:true});
    /* 최종 반영 게이트(HITL ②) = 외부 영향 또는 시스템 반영 = 되돌리기 어려움 */
    if(sig.external.length)
      gates.push({stepId:'commit',canonId:'commit',reason:`대외 발송·통지 — 외부 영향(${sig.external.slice(0,2).join('·')})`,kind:'required',auto:true});
    else if(sig.write.length)
      gates.push({stepId:'commit',canonId:'commit',reason:`시스템 반영·기록 — 되돌리기 어려움(${sig.write.slice(0,2).join('·')})`,kind:'required',auto:true});
    return gates;
  }
  /* 게이트로 걸 수 있는 후보 캐논 단계(사람이 추가) */
  function gateCandidates(){ return CANON.filter(c=>c.id==='approve'||c.id==='commit'); }

  /* ── ④ 검증 체크리스트: 구성+게이트 → 자율 안전성 점검 ── */
  function buildChecklist(M){
    const ext=M.bd.signals.external.length, wr=M.bd.signals.write.length;
    const hasGate=M.gates.length>0;
    const commitGate=M.gates.some(g=>g.stepId==='commit');
    const compTypes=new Set(); M.compose.forEach(t=>t.comps.forEach(c=>compTypes.add(c.type)));
    const hasPolicy=compTypes.has('Policy');
    const hasData=compTypes.has('Connector')||compTypes.has('기존 솔루션');
    return [
      {ok:hasGate, k:'HITL 게이트', v:hasGate?`${M.gates.length}개 배치됨`:'게이트 0개 — 자율 격상 불가', hard:1},
      {ok:!( (ext||wr) && !commitGate), k:'외부 액션 통제', v:(ext||wr)?(commitGate?'반영·발송 직전 게이트 있음':'외부/반영 액션에 게이트 없음'):'외부 액션 없음'},
      {ok:hasPolicy||!(ext||wr), k:'Policy 연결', v:hasPolicy?'발송·반영 Policy 포함':((ext||wr)?'책임 액션에 Policy 권장':'해당 없음')},
      {ok:hasData, k:'데이터 출처 명시', v:hasData?'Connector/기존 솔루션으로 근거 수집':'데이터 소스 미지정'},
      {ok:true, k:'Run Trace', v:'전 구간 자동 기록(거버넌스 기본)'},
    ];
  }

  /* ═══════════════════════════════════════════════════════════════════════
     모델(M) — 파이프라인 진행 중 사람 수정이 누적되는 작업 메모리
     ═══════════════════════════════════════════════════════════════════════ */
  let M=null;       /* 현재 격상 작업 */
  let step=1;       /* 1..5 */
  let _seq=0;       /* 생성 팩 id 시퀀스 */

  const SAMPLE=`신규 거래처 등록 심사 업무.\n영업이 등록을 요청하면 사업자·신용·제재 리스트를 확인하고 리스크를 판단해\n등록 승인 여부를 정하고, 승인 시 ERP에 등록하고 영업에 통지한다.\n고액·고위험 건은 책임자 승인이 필요하고, 반복 패턴은 기준으로 축적하고 싶다.`;

  function initModel(text){
    const bd=proposeBreakdown(text);
    M={
      sourceText:text, bd,
      compose:proposeCompose(bd),
      gates:proposeGates(bd),
      pack:null, promoted:false,
    };
  }

  /* ── DOM ── */
  const $=id=>document.getElementById(id);
  function host(){ /* 기존 authoring 오버레이를 파이프라인 셸로 재사용 */
    return $('authoring');
  }
  /* open(seedText?) — 인박스 On-Ramp 가 매칭 실패한 업무 설명을 넘기면 그 텍스트로 분해 시작.
     인자 없으면 샘플로 시작(스튜디오 '＋ 신규 격상' 직접 진입). */
  function open(seedText){
    const txt=(typeof seedText==='string'&&seedText.trim())?seedText.trim():SAMPLE;
    initModel(txt); step=1;
    const h=host(); if(!h)return;
    h.hidden=false;
    h.innerHTML=`<div class="auth-box pl-box">
      <button class="auth-x" id="plX">${ICO('x')}</button>
      <div class="pl-head">
        <span class="pl-hic">${ICO('rocket')}</span>
        <div><div class="pl-htitle">프로세스 → 자율운영 격상</div>
        <div class="pl-hsub">AI가 업무를 분해·구성하고, 사람이 검토·수정·승인해 <b>실제 운영 가능한 자율 업무</b>로 올립니다 — HITL(사람 통제점) 정의가 격상의 전제입니다.</div></div>
      </div>
      <div class="pl-steps" id="plSteps"></div>
      <div class="pl-body" id="plBody"></div>
      <div class="pl-foot" id="plFoot"></div>
    </div>`;
    $('plX').onclick=close;
    h.onclick=e=>{ if(e.target.id==='authoring')close(); };
    render();
  }
  function close(){ const h=host(); if(h){h.hidden=true;h.innerHTML='';h.onclick=null;} M=null; step=1; }

  const STEP_DEFS=[
    {n:1,t:'이해·분해',ic:'layers'},
    {n:2,t:'실행 구조',ic:'puzzle'},
    {n:3,t:'HITL 배치',ic:'flag'},
    {n:4,t:'격상·검증',ic:'shield-check'},
    {n:5,t:'시운전·승격',ic:'rocket'},
  ];
  function renderStepper(){
    $('plSteps').innerHTML=STEP_DEFS.map(s=>{
      const st=s.n<step?'done':(s.n===step?'on':'');
      return `<div class="pl-stp ${st}"><span class="pl-stn">${st==='done'?ICO('check'):s.n}</span><span class="pl-stl">${s.t}</span></div>`;
    }).join('<span class="pl-stsep">'+ICO('chevron-right')+'</span>');
  }

  function render(){
    renderStepper();
    if(step===1)renderBreakdown();
    else if(step===2)renderCompose();
    else if(step===3)renderGate();
    else if(step===4)renderOperationalize();
    else if(step===5)renderPromote();
    renderFoot();
  }

  /* ── 공통 푸터(이전/다음) + ③ 게이트 강제 ── */
  function renderFoot(){
    const f=$('plFoot'); let next='', warn='';
    if(step===1)next='① 분해 확인 — 구성으로';
    else if(step===2)next='② 구성 확인 — HITL 배치로';
    else if(step===3){ next='③ HITL 배치 확인 — 격상·검증으로';
      if(!M.gates.length)warn='HITL 게이트가 0개입니다 — 자율 운영 격상의 안전 전제이므로 최소 1개를 배치해야 다음으로 진행됩니다.'; }
    else if(step===4)next='④ 검증 통과 — 시운전으로';
    else if(step===5)next='';
    const blocked=(step===3&&!M.gates.length)||(step===4&&!M._checkPass);
    const warnBlock=step===3&&!M.gates.length; /* 게이트 0 = red 차단 */
    f.innerHTML=`${step>1?`<button class="cp-btn ghost" id="plPrev">${ICO('chevron-left')}이전</button>`:'<span></span>'}
      ${warn?`<div class="pl-warn ${warnBlock?'block':''}">${ICO('alert-triangle')}${warn}</div>`:'<span class="pl-foot-sp"></span>'}
      ${next?`<button class="cp-btn primary ${blocked?'is-block':''}" id="plNext" ${blocked?'disabled':''}>${next}${ICO('arrow-right')}</button>`:'<span></span>'}`;
    const p=$('plPrev'); if(p)p.onclick=()=>{ step=Math.max(1,step-1); render(); };
    const n=$('plNext'); if(n)n.onclick=()=>{
      if(step===4){ assemblePack(); }
      step=Math.min(5,step+1); render();
    };
  }

  /* ── ① 이해·분해 ── */
  function renderBreakdown(){
    const bd=M.bd;
    const sigRow=(label,arr,cls)=>arr.length?`<span class="pl-sig ${cls}">${label} ${arr.slice(0,3).map(esc).join('·')}</span>`:'';
    const taskCard=s=>`<div class="pl-tk">
      <div class="pl-tk-h"><span class="pl-tk-can">${esc(CANON.find(c=>c.id===s.id)?CANON.find(c=>c.id===s.id).cap:'')}</span><b>${esc(s.label)}</b><span class="pl-actor ${s.actor}">${s.actor==='human'?'사람':'AAP'}</span></div>
      <div class="pl-tk-g">
        <div class="pl-tk-col"><div class="pl-tk-k">${ICO('list')}작업</div>${s.actions.map(a=>`<div class="pl-tk-v">${esc(a)}</div>`).join('')}</div>
        <div class="pl-tk-col"><div class="pl-tk-k">${ICO('database')}필요 데이터</div>${s.data.length?s.data.map(a=>`<div class="pl-tk-v">${esc(a)}</div>`).join(''):'<div class="pl-tk-na">—</div>'}</div>
        <div class="pl-tk-col"><div class="pl-tk-k">${ICO('split')}결정점</div>${s.decisions.length?s.decisions.map(a=>`<div class="pl-tk-v dec">${esc(a)}</div>`).join(''):'<div class="pl-tk-na">—</div>'}</div>
        <div class="pl-tk-col"><div class="pl-tk-k">${ICO('alert-triangle')}리스크</div>${s.risks.length?s.risks.map(a=>`<div class="pl-tk-v rsk">${esc(a)}</div>`).join(''):'<div class="pl-tk-na">—</div>'}</div>
      </div></div>`;
    $('plBody').innerHTML=`
      <div class="pl-src">
        <div class="pl-src-h">${ICO('file-text')}업무 설명 <span>· AI가 읽고 분해합니다 (결정론 시뮬 · LLM 연동 시 품질↑)</span></div>
        <textarea class="pl-ta" id="plText" rows="4">${esc(M.sourceText)}</textarea>
        <button class="cp-btn ghost sm" id="plRe">${ICO('sparkles')}다시 분해</button>
        <div class="pl-title-row">분해된 업무: <b>${esc(bd.title)}</b></div>
        <div class="pl-sigs">${sigRow('데이터',bd.signals.data,'dt')}${sigRow('판단',bd.signals.decide,'dc')}${sigRow('시스템 반영',bd.signals.write,'wr')}${sigRow('외부 영향',bd.signals.external,'ex')}${sigRow('책임·규정',bd.signals.risk,'rk')}</div>
      </div>
      <div class="pl-sech">${ICO('layers')}단계·작업·데이터·결정점·리스크 분해</div>
      <div class="pl-tks">${bd.steps.map(taskCard).join('')}</div>`;
    $('plRe').onclick=()=>{ M.sourceText=$('plText').value; initModel(M.sourceText); render(); };
  }

  /* ── ② 실행 구조 구성 (5타입 매핑 · 사람 수정) ──
     뷰 2종: graph(다크 엔진룸 노드 그래프 · 작동 증명) / list(편집). M._cmpView 로 토글 */
  function renderCompose(){
    if(!M._cmpView)M._cmpView='graph';
    /* 타입별 합계(디자인 계약: 5타입 색 칩) */
    const cnt={}; M.compose.forEach(t=>t.comps.forEach(c=>{const k=typeMeta(c.type).k;cnt[k]=(cnt[k]||0)+1;}));
    const view=M._cmpView;
    $('plBody').innerHTML=`
      <div class="pl-sech">${ICO('boxes')}작업별 구성요소 매핑 <span class="pl-secsub">AAP는 Agent만이 아니라 5타입을 골라 <b>조합</b>합니다 — Agent가 잔뜩 도는 그림이 아니라 <b>조합된 실행 구조</b></span>
        <span class="pl-cmp-toggle">
          <button class="pl-cmp-tg ${view==='graph'?'on':''}" data-cv="graph">${ICO('git-branch')}노드 그래프</button>
          <button class="pl-cmp-tg ${view==='list'?'on':''}" data-cv="list">${ICO('list')}편집</button>
        </span></div>
      <div class="pl-typebar">${TYPES.map(t=>`<span class="pl-t ${t.cls}"><span class="pl-t-dot"></span>${t.k} ${cnt[t.k]||0}</span>`).join('')}</div>
      ${view==='graph'?renderComposeGraph():renderComposeList()}`;
    $('plBody').querySelectorAll('.pl-cmp-tg').forEach(e=>e.onclick=()=>{ M._cmpView=e.dataset.cv; renderCompose(); });
    if(view==='list')wireComposeList();
  }
  /* ── ②-graph: 다크 엔진룸 SVG 노드 그래프(작업→구성요소) — 5타입 teal 색 정합 ── */
  function renderComposeGraph(){
    /* 레이아웃: 좌 = 작업(캐논 단계) 노드, 우 = 구성요소 노드(타입색). 곡선 엣지로 연결. */
    const tasks=M.compose; const PADT=14, GAP=12;
    /* 우측 컬럼 노드 = 작업별 comps 평면화(작업 묶음 간격) */
    const compH=34, compW=210, taskW=150, taskH=46, colGap=120;
    let compY=PADT, taskGeo=[], compGeo=[], edges=[];
    tasks.forEach((t,ti)=>{
      const start=compY;
      t.comps.forEach((c,ci)=>{ const m=typeMeta(c.type);
        compGeo.push({x:taskW+colGap, y:compY, w:compW, h:compH, name:c.name, cls:m.cls, ic:m.ic, note:c.note}); compY+=compH+8; });
      const end=compY-(t.comps.length?8:0);
      const ty=t.comps.length?(start+end-compH)/2:compY;
      taskGeo.push({x:0,y:ty,w:taskW,h:taskH,label:t.taskLabel,cap:(CANON.find(c=>c.id===t.taskId)||{}).cap||''});
      /* edges: this task → each of its comps */
      const cidxStart=compGeo.length-t.comps.length;
      t.comps.forEach((c,ci)=>{ const cg=compGeo[cidxStart+ci]; edges.push({tx:taskW,ty:ty+taskH/2,cx:taskW+colGap,cy:cg.y+compH/2}); });
      compY+=GAP;
    });
    const W=taskW+colGap+compW+4, H=Math.max(compY,160);
    const edgeP=edges.map(e=>{const mx=(e.tx+e.cx)/2;return `<path class="plg-edge" d="M${e.tx},${e.ty} C${mx},${e.ty} ${mx},${e.cy} ${e.cx},${e.cy}"/>`;}).join('');
    const taskN=taskGeo.map(g=>`<g class="plg-task" transform="translate(${g.x},${g.y})"><rect width="${g.w}" height="${g.h}" rx="9"/><text class="plg-cap" x="11" y="18">${esc(g.cap)}</text><text class="plg-tl" x="11" y="34">${esc(g.label)}</text></g>`).join('');
    const compN=compGeo.map(g=>`<g class="plg-comp ${g.cls}" transform="translate(${g.x},${g.y})"><rect width="${g.w}" height="${g.h}" rx="8"/><circle class="plg-dot" cx="13" cy="${g.h/2}" r="4"/><text class="plg-cn" x="26" y="${g.h/2+4}">${esc(g.name)}</text></g>`).join('');
    return `<div class="plg-wrap">
      <div class="plg-canvas"><svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMinYMin meet">
        <g class="plg-edges">${edgeP}</g>${taskN}${compN}</svg></div>
      <div class="plg-leg">${TYPES.map(t=>`<span class="plg-lg ${t.cls}"><span class="plg-lg-d"></span>${t.k}</span>`).join('')}<span class="plg-leg-note">작업(좌) → AAP가 배정한 구성요소(우) · 색 = 5타입</span></div>
    </div>`;
  }
  /* ── ②-list: 편집 가능한 매핑 목록(기존 골격) ── */
  function renderComposeList(){
    const typeSel=(ti,ci,cur)=>`<select class="pl-ty-sel" data-ti="${ti}" data-ci="${ci}">${TYPE_KEYS.map(k=>`<option ${k===cur?'selected':''}>${k}</option>`).join('')}</select>`;
    const compRow=(t,ti)=>`<div class="pl-cmp">
      <div class="pl-cmp-h"><span class="pl-cmp-can">${esc(CANON.find(c=>c.id===t.taskId)?CANON.find(c=>c.id===t.taskId).cap:'')}</span><b>${esc(t.taskLabel)}</b></div>
      <div class="pl-cmp-list">${t.comps.map((c,ci)=>{const m=typeMeta(c.type);
        return `<div class="pl-comp ${m.cls}"><span class="pl-comp-dot"></span>${typeSel(ti,ci,c.type)}<div class="pl-comp-main"><input class="pl-comp-name" data-ti="${ti}" data-ci="${ci}" value="${esc(c.name)}"><div class="pl-comp-note">${esc(c.note||'')}</div></div><button class="pl-comp-del" data-ti="${ti}" data-ci="${ci}" title="삭제">${ICO('trash')}</button></div>`;
      }).join('')}
      <button class="pl-comp-add" data-ti="${ti}">${ICO('plus')}구성요소 추가</button></div></div>`;
    return `<div class="pl-cmps">${M.compose.map(compRow).join('')}</div>`;
  }
  function wireComposeList(){
    $('plBody').querySelectorAll('.pl-ty-sel').forEach(e=>e.onchange=()=>{ M.compose[+e.dataset.ti].comps[+e.dataset.ci].type=e.value; renderCompose(); renderFoot(); });
    $('plBody').querySelectorAll('.pl-comp-name').forEach(e=>e.onchange=()=>{ M.compose[+e.dataset.ti].comps[+e.dataset.ci].name=e.value; });
    $('plBody').querySelectorAll('.pl-comp-del').forEach(e=>e.onclick=()=>{ M.compose[+e.dataset.ti].comps.splice(+e.dataset.ci,1); renderCompose(); renderFoot(); });
    $('plBody').querySelectorAll('.pl-comp-add').forEach(e=>e.onclick=()=>{ M.compose[+e.dataset.ti].comps.push({type:'Agent',name:'새 구성요소',note:''}); renderCompose(); renderFoot(); });
  }

  /* ── ③ HITL 배치 (★필수 강제) ── */
  function renderGate(){
    const gated=new Set(M.gates.map(g=>g.stepId));
    const gateCard=g=>{const c=CANON.find(x=>x.id===g.stepId)||{};
      return `<div class="pl-gate ${g.kind}"><span class="pl-gate-ic">${ICO('flag')}</span>
        <div class="pl-gate-main"><div class="pl-gate-t">${esc(c.label||g.stepId)} <span class="pl-gate-tag ${g.kind}">${g.kind==='required'?'필수':'권고'}</span>${g.auto?'<span class="pl-gate-auto">AI 제안</span>':'<span class="pl-gate-man">사람 추가</span>'}</div>
        <div class="pl-gate-r">${esc(g.reason)}</div></div>
        <button class="pl-gate-del" data-sid="${esc(g.stepId)}" title="게이트 제거">${ICO('trash')}</button></div>`;
    };
    const cand=gateCandidates().filter(c=>!gated.has(c.id));
    $('plBody').innerHTML=`
      <div class="pl-sech">${ICO('flag')}HITL 게이트 배치 <span class="pl-secsub">책임·되돌리기 어려운·외부 영향 결정점에 <b>사람 통제점</b>을 둡니다. <b style="color:var(--amber-ink)">자율=사람 통제점 정의가 전제 — 0개면 격상 불가</b></span></div>
      ${M.gates.length?'':`<div class="pl-gate-block">${ICO('alert-triangle')}<div><b>게이트 0개 — 자율 격상 차단</b><span>사람 통제점이 하나도 없는 자율 운영은 책임·되돌리기 위험이 있어 진행할 수 없습니다. 아래 후보에서 최소 1개를 배치하세요.</span></div></div>`}
      <div class="pl-gates ${M.gates.length?'':'is-empty'}">
        ${M.gates.length?M.gates.map(gateCard).join(''):''}
      </div>
      ${cand.length?`<div class="pl-sech sub">${ICO('plus')}게이트 추가 후보</div>
      <div class="pl-gcand">${cand.map(c=>`<button class="pl-gcand-i" data-add="${c.id}">${ICO('flag')}<b>${esc(c.label)}</b><span>${c.id==='approve'?'처리 전 계획·옵션 승인':'반영·발송 전 최종 승인'}</span></button>`).join('')}</div>`:''}
      <div class="pl-canon"><div class="pl-canon-h">8단계 캐논 매핑 — 게이트가 걸린 단계는 ${ICO('flag')} 표시</div>
        <div class="pl-canon-row">${CANON.map(c=>`<span class="pl-canon-n ${gated.has(c.id)?'gated':''}">${esc(c.label)}${gated.has(c.id)?ICO('flag'):''}</span>`).join('<span class="pl-canon-sep">›</span>')}</div></div>`;
    $('plBody').querySelectorAll('[data-add]').forEach(e=>e.onclick=()=>{ const id=e.dataset.add;const c=CANON.find(x=>x.id===id);
      M.gates.push({stepId:id,canonId:id,reason:id==='approve'?'처리 수준·계획을 사람이 승인':'반영·발송 직전 최종 승인',kind:'required',auto:false}); render(); });
    $('plBody').querySelectorAll('.pl-gate-del').forEach(e=>e.onclick=()=>{ M.gates=M.gates.filter(g=>g.stepId!==e.dataset.sid); render(); });
  }

  /* ── ④ 격상·검증 ── */
  function renderOperationalize(){
    const chk=buildChecklist(M);
    M._checkPass=chk.every(c=>c.ok||!c.hard); /* hard 항목(게이트)은 반드시 통과 */
    const allPass=chk.every(c=>c.ok);
    const compTotal=M.compose.reduce((s,t)=>s+t.comps.length,0);
    $('plBody').innerHTML=`
      <div class="pl-sech">${ICO('shield-check')}격상·검증 <span class="pl-secsub">구성 + 게이트를 <b>8단계 캐논 런타임</b>으로 조립하고, 자율 안전성 체크리스트를 통과시킵니다</span></div>
      <div class="pl-asm">
        <div class="pl-asm-i"><span class="pl-asm-k">캐논 런타임</span><b>8단계</b><span class="pl-asm-s">요청→이해→구성→HITL①→실행→HITL②→기록</span></div>
        <div class="pl-asm-i"><span class="pl-asm-k">구성요소</span><b>${compTotal}</b><span class="pl-asm-s">5타입 조합</span></div>
        <div class="pl-asm-i"><span class="pl-asm-k">HITL 게이트</span><b>${M.gates.length}</b><span class="pl-asm-s">사람 통제점</span></div>
        <div class="pl-asm-i"><span class="pl-asm-k">거버넌스</span><b>4종</b><span class="pl-asm-s">Policy·Run Trace·Eval·Skill</span></div>
      </div>
      <div class="pl-sech sub">${ICO('list')}자율 안전성 체크리스트</div>
      <div class="pl-chk">${chk.map(c=>`<div class="pl-chk-i ${c.ok?'ok':(c.hard?'fail':'warn')}"><span class="pl-chk-ic">${c.ok?ICO('check-circle'):(c.hard?ICO('alert-triangle'):ICO('alert-triangle'))}</span><span class="pl-chk-k">${esc(c.k)}</span><span class="pl-chk-v">${esc(c.v)}</span></div>`).join('')}</div>
      <div class="pl-gov">${[['Policy','책임 지점 자동 차단 후 승인'],['Run Trace','요청→판단→처리→승인→반영 전 구간 기록'],['Evaluation','근거 충족도·정책 준수 Antbot 평가'],['Skill Library','업무 유형·처리 패턴 재사용 자산화']].map(g=>`<div class="pl-gov-i"><b>${g[0]}</b><span>${g[1]}</span></div>`).join('')}</div>
      <div class="pl-verdict ${M._checkPass?(allPass?'pass':'warn'):'fail'}">${M._checkPass?(allPass?ICO('check-circle')+' 검증 통과 — 시운전 가능':ICO('check-circle')+' 핵심 안전 항목 통과(권고 항목은 운영 중 보완 가능) — 시운전 가능'):ICO('alert-triangle')+' HITL 게이트가 없어 격상할 수 없습니다 — 이전 단계에서 게이트를 배치하세요'}</div>`;
  }

  /* ── 최종 Pack 조립 (genericAuthor 재사용 · 사람 수정 반영) ──
     compose(5타입 합계) · components(레지스트리) · gates(라벨) · gateSteps(work 플래그) 를
     genericAuthor 오버라이드로 전달 → 기존 Domain Pack 스키마로 출력. */
  function assemblePack(){
    const cnt={Agent:0,Module:0,'기존 솔루션':0,Connector:0,Policy:0};
    const itemsBy={Agent:[],Module:[],'기존 솔루션':[],Connector:[],Policy:[]};
    M.compose.forEach(t=>t.comps.forEach(c=>{const k=typeMeta(c.type).k;cnt[k]++;itemsBy[k].push(c.name);}));
    const composeArr=TYPES.map(t=>({t:t.k,sub:t.sub,cls:t.cls,n:cnt[t.k],items:itemsBy[t.k].slice(0,5)})).filter(c=>c.n>0);
    /* 레지스트리(components): 매핑된 구성요소를 ty 토큰으로 (코어 normalizePack 이 정규화) */
    const TYIC={Agent:'🏷️',Module:'🧐','기존 솔루션':'🗄️',Connector:'🔌',Policy:'🛡️'};
    const TYL ={Agent:'L3',Module:'L6','기존 솔루션':'L8',Connector:'L5',Policy:'L7'};
    const seen=new Set(); const components=[];
    M.compose.forEach(t=>t.comps.forEach(c=>{ if(seen.has(c.name))return; seen.add(c.name);
      components.push({type:c.type, ty:'ty'+typeMeta(c.type).cls.slice(1), ic:TYIC[typeMeta(c.type).k], name:c.name, L:TYL[typeMeta(c.type).k]||'L3', desc:c.note||`${c.type} 구성요소.`, when:t.taskLabel+' 단계.', data:'업무 데이터·근거', how:'분해·구성에서 배정된 역할 수행.'}); }));
    const gateSteps=M.gates.map(g=>g.stepId);
    const gateLabels=M.gates.map((g,i)=>`★ HITL ${i+1} ${CANON.find(c=>c.id===g.stepId)?CANON.find(c=>c.id===g.stepId).label:g.stepId} — ${g.reason}`);
    const id='auth'+(Date.now().toString(36))+(_seq++);
    M.pack=window.AAP_AUTHOR.genericAuthor(M.sourceText,{
      id, label:M.bd.title.slice(0,12)||'새 업무', title:M.bd.title, request:M.bd.request,
      wlType:M.bd.title, outputs:M.bd.steps.find(s=>s.id==='compose')?['처리 산출물','기록']:['산출물'],
      compose:composeArr.length?composeArr:undefined,
      components:components.length?components:undefined,
      gates:gateLabels.length?gateLabels:undefined,
      gateSteps,
      gatesLabel:`${M.gates.map(g=>CANON.find(c=>c.id===g.stepId)?CANON.find(c=>c.id===g.stepId).label:g.stepId).join(' · ')} (사람 통제점 ${M.gates.length}회)`,
      seeds:[{title:`${M.bd.title} · 시운전 #1`, request:M.bd.request, status:undefined, atStep:'request'}],
    });
  }

  /* ── ⑤ 시운전 → 승격 ── */
  function renderPromote(){
    if(!M.pack)assemblePack();
    const pack=M.pack;
    const work=pack.work||[];
    M._dry=M._dry||{i:0,running:false};
    const dryRows=work.map((w,i)=>{const st=i<M._dry.i?'done':(i===M._dry.i&&M._dry.running?'doing':'wait');
      return `<div class="pl-dry-r ${st}"><span class="pl-dry-dot"></span><span class="pl-dry-n">${String(i+1).padStart(2,'0')}</span><span class="pl-dry-l">${esc(w.label)}${w.hitl?ICO('flag'):''}</span><span class="pl-dry-s">${st==='done'?'완료':st==='doing'?'실행 중':'대기'}</span></div>`;}).join('');
    const done=M._dry.i>=work.length;
    $('plBody').innerHTML=`
      <div class="pl-sech">${ICO('rocket')}시운전 → 승격 <span class="pl-secsub">샘플 케이스로 조립된 런타임을 <b>dry-run</b> 한 뒤, 사람이 검토하고 <b>"운영 중"</b>으로 승격합니다</span></div>
      <div class="pl-promo">
        <div class="pl-promo-card">
          <div class="pl-promo-h"><span class="pl-promo-bd">${esc(pack.label)}</span><span class="pl-promo-type">${esc(pack.workload.type)}</span></div>
          <div class="pl-promo-stat"><span>단계 <b>${work.length}</b></span><span>구성요소 <b>${(pack.compose||[]).reduce((s,c)=>s+(+c.n||0),0)}</b></span><span>HITL <b>${(pack.gates||[]).length}</b></span></div>
          <button class="cp-btn ${done?'ghost':'primary'} sm" id="plDry">${done?ICO('rotate-ccw')+'다시 시운전':ICO('play')+'샘플 케이스 dry-run'}</button>
        </div>
        <div class="pl-dry">${dryRows}</div>
      </div>
      ${done?`<div class="pl-promo-ok">${ICO('check-circle')}dry-run 완료 — 8단계 런타임이 정상 작동합니다(HITL 게이트 ${(pack.gates||[]).length}곳 포함). 검토 후 운영으로 올리세요.</div>
      <div class="pl-promo-act">
        <button class="cp-btn primary lg" id="plPromote">${ICO('rocket')}운영 중으로 승격 — 통합 인박스·카탈로그에 편입</button>
        <div class="pl-promo-note">승격 = <code>AAP_CORE.register</code>로 새 유형 등록 → 시드 케이스 1건 생성 → 통합 인박스에서 다른 유형과 함께 처리됩니다.</div>
      </div>`:`<div class="pl-promo-hint">${ICO('alert-triangle')}먼저 dry-run으로 런타임이 정상 작동하는지 확인하세요. 승격은 dry-run 완료 후 가능합니다.</div>`}`;
    const d=$('plDry'); if(d)d.onclick=()=>{ if(done){M._dry={i:0,running:false};renderPromote();return;} runDry(work.length); };
    const pr=$('plPromote'); if(pr)pr.onclick=promote;
  }
  function runDry(n){
    M._dry={i:0,running:true}; renderPromote();
    const tick=()=>{ M._dry.i++; if(M._dry.i>=n){M._dry.running=false;renderPromote();return;} renderPromote(); setTimeout(tick,420); };
    setTimeout(tick,420);
  }
  function promote(){
    const pack=M.pack; if(!pack)return;
    window.AAP_CORE.register(pack);  /* 새 유형 편입(typeTok 자동) */
    window.AAP_CORE.load(pack.id);   /* 시드 케이스 생성 + 첫 케이스 실행 콘솔로 */
    M.promoted=true;
    close();
  }

  /* ── 외부 노출 ── */
  window.AAP_PIPELINE={ open, close,
    /* 교체 가능 제안 엔진 경계(Phase 3 LLM 교체 지점) */
    proposeBreakdown, proposeCompose, proposeGates, buildChecklist };

  /* 검증/딥링크: ?pipeline=1 (오버레이 열기) */
  const q=new URLSearchParams(location.search);
  if(q.get('pipeline')==='1')open();
})();
