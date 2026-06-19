/* =========================================================================
   AAP Platform CORE — 도메인 무관 셸 · 실행 엔진 · 우측 8계층 · 구성/관리 뷰
   window.AAP_PACK (Domain Pack) 을 읽어 부팅한다. 좌측 고객 서비스 화면은 PACK.surface 가 렌더.
   ========================================================================= */
(function(){
const PACKS = window.AAP_PACKS || (window.AAP_PACK?{[window.AAP_PACK.id||'pack']:window.AAP_PACK}:null);
if(!PACKS){ document.body.innerHTML='<p style="padding:40px;font-family:sans-serif">Domain Pack(window.AAP_PACKS)을 찾을 수 없습니다. packs/*.js 적재 순서를 확인하세요.</p>'; return; }

/* 플랫폼 불변: 8계층 · Operating Loop · 추적 분류 (도메인 무관) */
const LK={L1:'경험·접근',L2:'설계·개발',L3:'에이전트 코어',L4:'지식·시맨틱',L5:'데이터·연동',L6:'AI 품질·평가',L7:'컨트롤·거버넌스',L8:'인프라'};
const LOOP=['Data','Semantic','Reasoning','Decision','Action','Learning'];
const LAYERS=[
 {id:'L1',ko:'경험·접근',cap:'시스템 반영'},
 {id:'L2',ko:'설계·개발',cap:'실행 구조 구성'},
 {id:'L3',ko:'에이전트 코어',cap:'실행'},
 {id:'L4',ko:'지식·시맨틱',cap:'업무 의미화',star:1},
 {id:'L5',ko:'데이터·연동',cap:'시스템 반영'},
 {id:'L6',ko:'AI 품질·평가',cap:'운영 학습'},
 {id:'L7',ko:'컨트롤·거버넌스',cap:'통제·권한',star:1},
 {id:'L8',ko:'인프라',cap:'시스템 반영'},
];
const KMAP={L1:'입력',L2:'설계',L3:'실행',L4:'의미화',L5:'연동',L6:'평가',L7:'통제',L8:'반영'};

/* =========================================================================
   X1 · 선언형 화면 디자인 계약 (Design Contract) — 코어가 색·타입을 강제
   ───────────────────────────────────────────────────────────────────────
   팩(특히 AI emit)은 자유 hex·자유 CSS 클래스를 쓸 수 없다.
   surfaceSpec/compose/components 의 색·타입 필드는 아래 enum 토큰으로만 선언하고,
   코어가 그 토큰을 디자인 토큰(5타입 색·상태 4색)에 매핑된 정규 CSS 클래스로 변환한다.
   미허용 값(오타·raw hex·임의 클래스)은 안전 폴백 + console.warn (위반 가시화).
   ※ 하위호환: 기존 3팩이 쓰는 정규 클래스명(tA/tyA/s-amber…)도 그대로 통과(별칭).
   ========================================================================= */
const DC={
  /* 구성요소 5타입 → 정규 클래스(.comp / .casm .ct2 = t*, .ag-type / .au-t = ty*) */
  type:{ map:{ agent:'A', module:'M', solution:'S', connector:'C', policy:'P' },
    /* 별칭(하위호환): 기존 팩 표기 + 한글 */
    alias:{ tA:'A',tM:'M',tS:'S',tC:'C',tP:'P', tyA:'A',tyM:'M',tyS:'S',tyC:'C',tyP:'P',
      'Agent':'A','Module':'M','기존 솔루션':'S','솔루션':'S','Solution':'S','Connector':'C','Policy':'P' },
    cls:k=>'t'+k, ty:k=>'ty'+k, fallback:'A' },
  /* 상태색 4종(+brand) → 헤더 status 배지 .s-* */
  status:{ map:{ info:'s-info', amber:'s-amber', green:'s-green', blue:'s-blue', red:'s-red' },
    alias:{ 's-info':'s-info','s-amber':'s-amber','s-green':'s-green','s-blue':'s-blue','s-red':'s-red',
      hitl:'s-amber', done:'s-green', working:'s-blue', block:'s-red', neutral:'s-info' },
    fallback:'s-info' },
  /* op-detail 값 강조색 토큰 (g/a/r) → 자유색 차단 */
  emph:{ ok:['g','green','good'], warn:['a','amber'], risk:['r','red','block'] },
};
function _dcWarn(field,val,fb){ if(window.console)console.warn(`[AAP Design Contract] 미허용 값 '${val}' (${field}) → 폴백 '${fb}'. enum 토큰만 허용됩니다.`); }
/* 타입 토큰 → 5타입 키(A/M/S/C/P). 위반 시 폴백+경고 */
function dcTypeKey(v,field){
  if(v==null)return DC.type.fallback;
  const s=String(v).trim();
  const k=DC.type.map[s.toLowerCase()]||DC.type.alias[s];
  if(k)return k;
  _dcWarn(field||'type',s,DC.type.fallback); return DC.type.fallback;
}
/* 상태 토큰 → .s-* 클래스. raw hex(#…)·임의 문자열 차단 */
function dcStatusCls(v){
  if(v==null)return DC.status.fallback;
  const s=String(v).trim();
  const c=DC.status.map[s.toLowerCase()]||DC.status.alias[s];
  if(c)return c;
  _dcWarn('status',s,DC.status.fallback); return DC.status.fallback;
}
/* op-detail 값 강조 토큰 정규화(g/a/r 외 차단) */
function dcEmph(v){
  if(!v)return '';
  const s=String(v).trim().toLowerCase();
  if(DC.emph.ok.includes(s))return 'g'; if(DC.emph.warn.includes(s))return 'a'; if(DC.emph.risk.includes(s))return 'r';
  _dcWarn('emph',s,''); return '';
}
/* 라벨에 hex 색·인라인 style 주입 차단(과밀·임의색 방지) */
const _HEX=/#[0-9a-fA-F]{3,8}\b/, _STYLEATTR=/style\s*=/i;
function dcText(v,field){
  if(typeof v!=='string')return v;
  if(_HEX.test(v)||_STYLEATTR.test(v)){ _dcWarn(field||'text','인라인 색/style 포함', '제거'); return v.replace(_HEX,'').replace(/style\s*=\s*("[^"]*"|'[^']*')/ig,''); }
  return v;
}
/* 밀도 규율: 주 액션(primary) ≤ MAX_PRIMARY. (현 surfaceSpec은 모달당 primary 1 → 정보성 가드) */
const MAX_PRIMARY=5;

/* loadPack 시 1회: surfaceSpec/compose/components 의 색·타입 필드를 정규화(인플레이스).
   값을 검증·치환만 하고 구조는 보존 → 기존 3팩 무회귀, AI emit 팩은 토큰만 허용됨. */
function normalizePack(pack){
  if(!pack||pack._dcDone)return pack;
  /* 1) compose 5타입 (cls) */
  (pack.compose||[]).forEach(c=>{ const k=dcTypeKey(c.cls||c.type,'compose.cls'); c.cls='t'+k; c._tk=k; });
  /* 2) components 타입 (ty) */
  (pack.components||[]).forEach(a=>{ const k=dcTypeKey(a.ty||a.type,'components.ty'); a.ty='ty'+k; a._tk=k; });
  /* 3) surfaceSpec.status 색 토큰 (배열 [label, cls, tab] · 함수는 런타임 정규화로 위임) */
  const SS=pack.surfaceSpec;
  if(SS&&SS.status){ Object.keys(SS.status).forEach(id=>{ const st=SS.status[id];
    if(Array.isArray(st)&&st.length>=2) st[1]=dcStatusCls(st[1]); }); }
  pack._dcDone=true; return pack;
}
/* 함수형 status(런타임 산출)도 코어를 거치게: headSpec 에서 결과 배열의 색 토큰 정규화 */
function dcStatusTriple(st){ if(Array.isArray(st)&&st.length>=2)st[1]=dcStatusCls(st[1]); return st; }

/* Pack 데이터 별칭 (loadPack 에서 활성 팩으로 갱신 — 팩 교체 가능) */
let PACK, WORK, COMPONENTS, COMPOSE, TIMES;
const idxOf=id=>WORK.findIndex(w=>w.id===id);
const W=id=>WORK.find(w=>w.id===id);
const groupsOf=w=>[...new Set(w.ops.map(o=>o.g))].sort((a,b)=>a-b);

/* =========================================================================
   영속성 (Phase 0) — localStorage 네임스페이스 aap.v1.*
   케이스 목록·진행상태·decisions·trace 를 저장/복원. 손상·없음 시 안전 초기화.
   ========================================================================= */
const LS_NS='aap.v1.';
function lsGet(k,fb){ try{const v=localStorage.getItem(LS_NS+k);return v==null?fb:JSON.parse(v);}catch(e){return fb;} }
function lsSet(k,v){ try{localStorage.setItem(LS_NS+k,JSON.stringify(v));}catch(e){} }

/* APP = 코어가 책임지는 인스턴스성 모델(도메인 무관). cases=인스턴스 배열, active=열린 케이스 id
   pack = 현재 런타임 컨텍스트(열린 케이스의 packId). 인박스는 전 팩 통합 → pack 은 '모드'가 아니라
   '실행 뷰가 렌더 중인 유형' 이다(케이스 열 때 그 케이스 packId 로 로드). typeFilter=인박스 유형 필터. */
const APP={cases:[], active:null, view:'inbox', pack:null, typeFilter:'all', catSel:null};
function saveApp(){ lsSet('cases',APP.cases); lsSet('active',APP.active); lsSet('view',APP.view); lsSet('pack',APP.pack); lsSet('typeFilter',APP.typeFilter); }
function loadApp(){
  const cs=lsGet('cases',null);
  if(Array.isArray(cs)) APP.cases=cs.filter(c=>c&&c.id&&c.packId);
  APP.active=lsGet('active',null);
  const v=lsGet('view',null); if(['inbox','run','govern','domain'].includes(v))APP.view=v;
  APP.pack=lsGet('pack',null);
  const tf=lsGet('typeFilter',null); if(typeof tf==='string')APP.typeFilter=tf;
}

/* =========================================================================
   유형(도메인) → 색/배지 토큰 매핑 (코어 책임 · 토큰 기반 · 임의 hex ✕)
   팩은 메타(label·id)만 제공. 색은 등록 순서에 안정적인 5타입 토큰 팔레트를 순환 배정.
   새 팩이 register 되면 자동으로 다음 토큰을 받음(카탈로그·인박스·필터 일관). */
const TYPE_TOKENS=['tA','tM','tS','tC','tP']; /* teal·violet·cyan·blue·amber (5타입 색 재사용) */
const _typeTok={};            /* packId → 토큰 클래스 */
let _typeTokSeq=0;
function typeTok(packId){
  if(_typeTok[packId])return _typeTok[packId];
  _typeTok[packId]=TYPE_TOKENS[(_typeTokSeq++)%TYPE_TOKENS.length];
  return _typeTok[packId];
}
function typeLabel(packId){ const p=PACKS[packId]; return p?p.label:packId; }
/* 유형 배지 HTML(인박스 행·카탈로그 공통) */
function typeBadge(packId){ return `<span class="ty-badge ${typeTok(packId)}">${dcText(typeLabel(packId),'pack.label')}</span>`; }

/* ===== STATE = 현재 열린 케이스의 런타임 슬라이스(엔진이 직접 읽고 쓰는 뷰) =====
   케이스를 열면 케이스 객체에서 hydrate, 변경 시 케이스로 persist 해 영속화한다. */
const STATE={view:'inbox', sel:null, playing:false, decisions:{}, pickedTime:null, meetPhase:'idle', previewK:null, baseOnly:false, opOpen:new Set(), trace:[], traced:new Set()};
const RUN={phase:'idle', reveal:0, timers:[], playTimer:null};
function clearRun(){RUN.timers.forEach(clearTimeout);RUN.timers=[];clearTimeout(RUN.playTimer);}
function extExcluded(){return PACK.extExcluded?PACK.extExcluded(STATE):false;}

/* ===== 케이스(인스턴스) 헬퍼 ===== */
function activeCase(){return APP.cases.find(c=>c.id===APP.active);}
function newId(){return 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
/* 팩 → 케이스 템플릿. 팩이 seeds/caseTemplate 를 안 줘도 workload/surfaceSpec 에서 자동 도출(코어 책임) */
function caseTemplate(pack,seed){
  const wl=pack.workload||{}, ss=pack.surfaceSpec||{};
  return {
    id:newId(), packId:pack.id,
    title:(seed&&seed.title)||ss.title||wl.type||pack.label,
    customer:(seed&&seed.customer)||ss.customer||'',
    icon:(seed&&seed.icon)||ss.icon||'📋',
    request:(seed&&seed.request)||wl.request||'',
    createdAt:Date.now(),
    /* 런타임 슬라이스(독립 진행상태) */
    sel:(seed&&seed.sel)||pack.work[0].id,
    decisions:(seed&&seed.decisions)||{},
    pickedTime:(seed&&seed.pickedTime)||(pack.times&&pack.times[0]?pack.times[0].t:null),
    meetPhase:'idle',
    trace:(seed&&seed.trace)||[],
    traced:(seed&&seed.traced)||[],
    done:(seed&&seed.done)||false,
  };
}
/* 케이스 진행 상태 라벨(상태 4종) — 인박스 그룹핑/배지 */
const STATUS={new:{k:'new',ko:'접수'},run:{k:'run',ko:'진행'},wait:{k:'wait',ko:'검토대기'},done:{k:'done',ko:'완료'}};
function caseStatus(c){
  const pack=PACKS[c.packId]; if(!pack)return 'new';
  if(c.done)return 'done';
  const w=pack.work.find(x=>x.id===c.sel)||pack.work[0];
  const i=pack.work.findIndex(x=>x.id===c.sel);
  /* 검토대기 = 현재 단계가 HITL 게이트(승인 대기) */
  if(w&&(w.hitl||w.meeting)&&!c.decisions[c.sel]&&!(w.meeting&&c.meetPhase==='done'))return 'wait';
  if(i>0||Object.keys(c.decisions).length)return 'run';
  return 'new';
}
function caseProgress(c){ const pack=PACKS[c.packId]; if(!pack)return 0; const i=pack.work.findIndex(x=>x.id===c.sel); const n=pack.work.length; return c.done?100:Math.round(((i+ (c.done?1:0))/n)*100); }

/* STATE ↔ case 동기화 */
function hydrateFromCase(c){
  STATE.sel=c.sel; STATE.decisions={...c.decisions}; STATE.pickedTime=c.pickedTime; STATE.meetPhase=c.meetPhase||'idle';
  STATE.trace=Array.isArray(c.trace)?c.trace.slice():[]; STATE.traced=new Set(c.traced||[]);
  STATE.previewK=null; STATE.baseOnly=false; STATE.opOpen=new Set(); STATE.playing=false;
}
function persistToCase(){
  const c=activeCase(); if(!c)return;
  c.sel=STATE.sel; c.decisions={...STATE.decisions}; c.pickedTime=STATE.pickedTime; c.meetPhase=STATE.meetPhase;
  c.trace=STATE.trace.slice(); c.traced=[...STATE.traced];
  const pack=PACKS[c.packId], last=pack.work[pack.work.length-1];
  if(STATE.sel===last.id && RUN.phase==='done') c.done=true;
  saveApp();
}

/* surface 컨텍스트 (코어→팩) */
function ctx(){return {S:STATE, R:RUN, idxOf, W, par:parTrack, times:TIMES, ex:extExcluded()};}
function resolveDlv(k,C){const d=PACK.products[k];return {ic:d.ic,title:d.title,sub:typeof d.sub==='function'?d.sub(C):d.sub,body:typeof d.body==='function'?d.body(C):d.body};}

/* ===== view 전환 (운영 콘솔 IA: inbox / run / govern / domain) ===== */
function setView(v){
  STATE.view=v; APP.view=v;
  document.querySelectorAll('#gnav .gnav-i').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  document.querySelectorAll('.view').forEach(s=>s.hidden=s.dataset.view!==v);
  if(v!=='run'&&STATE.playing)stopPlay();
  if(v==='inbox')renderInbox();
  if(v==='domain')renderDesign();
  if(v==='govern')renderGovern();
  updateCaseTitle();
  saveApp();
}
function updateCaseTitle(){
  const el=document.getElementById('caseTitle'); if(!el)return;
  const c=activeCase();
  el.textContent=(STATE.view==='run'&&c)?`${c.icon||''} ${c.title}`:'';
}

/* ===== Domain Pack 활성화 (같은 셸/엔진, 팩만 갈아끼움) =====
   팩 데이터 참조만 바꾼다. 케이스(인스턴스) 생성·열기는 분리(openCase/seedPack). */
function setPackRefs(key){
  PACK=normalizePack(PACKS[key]); WORK=PACK.work; COMPONENTS=PACK.components; COMPOSE=PACK.compose; TIMES=PACK.times;
  APP.pack=key;
}
/* 팩에 데모용 케이스가 없으면 시드(서로 다른 상태). 팩이 pack.seeds 를 주면 그걸, 없으면 단일 기본 케이스 */
function seedPack(key){
  if(APP.cases.some(c=>c.packId===key))return;
  const pack=PACKS[key];
  const seeds=pack.seeds||[{}];
  seeds.forEach(s=>{ const c=caseTemplate(pack,s);
    /* seed 의 atStep 으로 진행 위치를, status 로 완료여부 초기화 */
    if(s.atStep&&pack.work.some(w=>w.id===s.atStep))c.sel=s.atStep;
    if(s.status==='done'){c.done=true;c.sel=pack.work[pack.work.length-1].id;}
    APP.cases.push(c);
  });
  saveApp();
}
/* 케이스(인스턴스) 열기 → 런타임 STATE hydrate → 실행 뷰 */
function openCase(id){
  const c=APP.cases.find(x=>x.id===id); if(!c)return;
  if(!PACKS[c.packId]){ toast('이 유형은 현재 등록돼 있지 않습니다'); setView('inbox'); return; }
  if(c.packId!==APP.pack)setPackRefs(c.packId);
  APP.active=id; hydrateFromCase(c);
  clearRun(); setRunBtn(false);
  setView('run'); renderSeq(); restoreStep(); saveApp();
}
/* hydrate 된 STATE(sel/decisions/...) 로 화면을 '진행된 그 지점'에 복원(재생 ✕, 정지 상태) */
function restoreStep(){
  const w=W(STATE.sel); clearRun(); STATE.previewK=null; STATE.baseOnly=false; STATE.opOpen=new Set();
  if(w.meeting){ STATE.meetPhase=STATE.meetPhase==='done'?'done':'await_end'; RUN.phase=STATE.meetPhase==='done'?'done':'await'; }
  else if(w.hitl){ STATE.meetPhase='idle'; RUN.phase=STATE.decisions[w.id]?'done':'await'; }
  else { STATE.meetPhase='idle'; RUN.phase='done'; }
  RUN.reveal=groupsOf(w).length;
  if(!STATE.traced.has(w.id))traceStep(w);
  renderConsole(); renderRight(); afterStateChange();
}

/* ===== 업무 순서 (top bar · prev/current/next) ===== */
function renderSeq(){
  const ci=idxOf(STATE.sel);let html='';
  for(let d=-1;d<=1;d++){const i=ci+d; if(i<0||i>=WORK.length)continue;
    const w=WORK[i];let cls='snode'+(d===0?' active':' adj')+(w.gate?' gate':'');
    if(d>0||(d===0&&i>0))html+=`<span class="sarrow">${_ICO('chevron-right')}</span>`;
    html+=`<div class="${cls}" data-go="${w.id}"><span class="role">${w.role}</span><span class="lab"><span class="sn">${String(i+1).padStart(2,'0')}</span>${w.label}${w.gate?_ICO('star'):''}</span></div>`;}
  document.getElementById('seq').innerHTML=html;
  document.getElementById('seqProg').textContent=`${ci+1} / ${WORK.length}`;
  document.querySelectorAll('#seq .snode').forEach(e=>e.onclick=()=>setSel(e.dataset.go));
}

/* ===== 통합 업무 인박스 (Phase 1.5 · 코어 · 전 도메인 케이스 한 곳 · 도메인 무관) =====
   도메인 = 모드 ✕ → 케이스의 유형(packId) 속성 ✓. 상태 × 유형 2축.
   상단 유형 필터 칩(전체/유형별) + 각 행 유형 배지. 팩이 등록되면 자동 편입. */
const STATUS_ORDER=['wait','run','new','done'];
/* 케이스 상태/진행률은 그 케이스의 팩 기준으로 산출(활성 PACK 아님) */
function caseStatusFor(c){ return caseStatus(c); }
function renderInbox(){
  const list=document.getElementById('inboxList'); if(!list)return;
  /* 안전 폴백: 등록 안 된 유형(자동저작 팩은 비영속)의 케이스는 인박스에서 숨김(저장은 보존) */
  const all=APP.cases.filter(c=>PACKS[c.packId]);
  /* 등장 순서대로 토큰 안정 배정(필터 칩·배지 색 일관) */
  const presentPacks=[...new Set(all.map(c=>c.packId))].filter(id=>PACKS[id]);
  presentPacks.forEach(typeTok);
  /* 유형 필터 칩 */
  const fbar=document.getElementById('inboxFilter');
  if(fbar){
    const cnt=id=>all.filter(c=>c.packId===id).length;
    let fh=`<button class="ty-chip ${APP.typeFilter==='all'?'on':''}" data-tf="all">전체<span class="tc-n">${all.length}</span></button>`;
    fh+=presentPacks.map(id=>`<button class="ty-chip ${APP.typeFilter===id?'on':''} ${typeTok(id)}" data-tf="${id}"><span class="tc-dot"></span>${dcText(typeLabel(id),'pack.label')}<span class="tc-n">${cnt(id)}</span></button>`).join('');
    fbar.innerHTML=fh;
    fbar.querySelectorAll('[data-tf]').forEach(e=>e.onclick=()=>{APP.typeFilter=e.dataset.tf;saveApp();renderInbox();});
  }
  /* 유형 필터가 사라진 유형을 가리키면 전체로 폴백 */
  if(APP.typeFilter!=='all' && !presentPacks.includes(APP.typeFilter)){ APP.typeFilter='all'; saveApp(); }
  const cs=APP.typeFilter==='all'?all:all.filter(c=>c.packId===APP.typeFilter);
  const sub=document.getElementById('inboxSub');
  if(sub)sub.textContent=`${APP.typeFilter==='all'?`전 유형 ${presentPacks.length}종`:typeLabel(APP.typeFilter)} · ${cs.length}건`;
  /* 인박스 카운트 = 전 유형 검토대기 합(통합) */
  const navc=document.getElementById('navCnt'); if(navc){const w=all.filter(c=>caseStatusFor(c)==='wait').length;navc.textContent=w?String(w):'';}
  if(!cs.length){ list.innerHTML=`<div class="ibx-empty">${APP.typeFilter==='all'?'아직 들어온 업무 요청이 없습니다':'이 유형의 업무가 없습니다'} — <b>＋ 새 업무 요청</b>으로 시작하세요.</div>`; return; }
  const byStatus={}; cs.forEach(c=>{(byStatus[caseStatusFor(c)]=byStatus[caseStatusFor(c)]||[]).push(c);});
  let h='';
  STATUS_ORDER.forEach(s=>{ const arr=byStatus[s]; if(!arr||!arr.length)return;
    arr.sort((a,b)=>b.createdAt-a.createdAt);
    h+=`<div class="ibx-grp"><div class="ibx-gh"><span class="gh-dot st-${s}"></span>${STATUS[s].ko}<span class="gh-n">${arr.length}</span></div><div class="ibx-rows">`;
    arr.forEach(c=>{ const pg=caseProgress(c), st=caseStatusFor(c);
      h+=`<div class="ibx-row" data-open="${c.id}">
        <div class="ibx-ic">${c.icon||'📋'}</div>
        <div class="ibx-main"><div class="ibx-t">${dcText(c.title,'case.title')} ${typeBadge(c.packId)}</div><div class="ibx-meta">${c.customer||typeLabel(c.packId)}${c.request?` · ${String(c.request).replace(/^["“]|["”]$/g,'').slice(0,46)}…`:''}</div></div>
        <div class="ibx-prog"><div class="ibx-bar"><i style="width:${pg}%"></i></div><div class="ibx-pn">${pg}%</div></div>
        <span class="ibx-st st-${st}">${STATUS[st].ko}</span>
        <span class="ibx-go">${_ICO('chevron-right')}</span></div>`;
    });
    h+=`</div></div>`;
  });
  list.innerHTML=h;
  list.querySelectorAll('[data-open]').forEach(e=>e.onclick=()=>openCase(e.dataset.open));
}
/* 새 업무 요청 = 유형(팩)을 골라 그 workload 템플릿으로 새 케이스 생성 → 통합 인박스 편입 → 실행 투입.
   packId 미지정 시: 인박스 필터가 특정 유형이면 그 유형, 아니면 현재 런타임 팩(없으면 첫 팩). */
let _newSeq={};
function createCase(packId){
  let key=packId;
  if(!key) key=(APP.typeFilter!=='all'&&PACKS[APP.typeFilter])?APP.typeFilter:(APP.pack&&PACKS[APP.pack]?APP.pack:Object.keys(PACKS)[0]);
  const pack=PACKS[key]; if(!pack)return;
  const c=caseTemplate(pack);
  _newSeq[key]=(_newSeq[key]||0)+1;
  c.title=`${pack.workload&&pack.workload.type?pack.workload.type:pack.label} · 신규 #${_newSeq[key]}`;
  APP.cases.push(c); saveApp();
  openCase(c.id);
  toast(`새 ${pack.label} 업무 요청을 생성했습니다 — 실행 콘솔에 투입`);
}
/* ＋새 업무 요청 = 유형 선택 메뉴 표시(유형이 1개뿐이면 바로 생성) */
function promptNewCase(anchor){
  const keys=Object.keys(PACKS);
  if(keys.length<=1){ createCase(keys[0]); return; }
  let menu=document.getElementById('newCaseMenu');
  if(menu){ menu.remove(); return; } /* 토글 */
  menu=document.createElement('div'); menu.id='newCaseMenu'; menu.className='nc-menu';
  menu.innerHTML=`<div class="ncm-h">어떤 유형의 업무인가요?</div>`+keys.map(k=>`<button class="ncm-i" data-nc="${k}"><span class="ty-badge ${typeTok(k)}">${dcText(PACKS[k].label,'pack.label')}</span><span class="ncm-d">${(PACKS[k].workload&&PACKS[k].workload.type)||''}</span></button>`).join('');
  document.body.appendChild(menu);
  const r=(anchor||document.getElementById('newCaseBtn')).getBoundingClientRect();
  menu.style.top=(r.bottom+6)+'px'; menu.style.right=(window.innerWidth-r.right)+'px';
  menu.querySelectorAll('[data-nc]').forEach(e=>e.onclick=()=>{const k=e.dataset.nc;menu.remove();createCase(k);});
  setTimeout(()=>{const off=(ev)=>{if(!menu.contains(ev.target)){menu.remove();document.removeEventListener('mousedown',off);}};document.addEventListener('mousedown',off);},0);
}

/* ===== parallel track helper (코어 · RUN 상태 기반) ===== */
function parTrack(items){
  return `<div class="ptrack"><div class="pt-h">병렬 진행</div><div class="pt-items">`+
    items.map((t,i)=>{let s;
      if(RUN.phase==='done'||RUN.phase==='await')s='done';
      else if(RUN.phase==='working')s=(i<RUN.reveal?'done':(i===RUN.reveal?'doing':'wait'));
      else s='wait';
      const lbl=s==='wait'?'예정':s==='doing'?'진행 중':'완료';
      return `<div class="pt-i ${s}"><span class="pt-dot"></span><span class="pt-t">${t}</span><span class="pt-s">${lbl}</span></div>`;
    }).join('')+`</div></div>`;
}

/* ===== 좌측 surface: 함수형(PACK.surface) 또는 선언형(PACK.surfaceSpec) ===== */
/* 선언형 = 코드 없이 데이터만 → AI 자동 저작이 출력 가능한 형태 */
function surfHead(C){return PACK.surface?PACK.surface.head(C):headSpec(C);}
function surfBase(C){return PACK.surface?PACK.surface.base(C):baseSpec(C);}
function surfCmodal(kind,C){return PACK.surface?PACK.surface.cmodal(kind,C):cmodalSpec(kind,C);}

function headSpec(C){
  const SS=PACK.surfaceSpec,S=C.S,i=C.idxOf(S.sel),w=C.W(S.sel);
  let st=SS.status[w.id]||['','s-info',SS.tabs[0]];if(typeof st==='function')st=st(C);st=dcStatusTriple(st);const[stt,stc,tab]=st;
  const kf=SS.knownFrom&&C.W(SS.knownFrom)?C.idxOf(SS.knownFrom):0;const known=i>=kf;
  const mr=typeof SS.metaReady==='function'?SS.metaReady(C):SS.metaReady;
  const meta=SS.customer+((known&&mr)?' · '+mr:(SS.metaUnknown?' · '+SS.metaUnknown:''));
  let avs='';
  if(SS.avatars)avs=known?SS.avatars.map(x=>`<span class="hd-av">${x}</span>`).join('')+((SS.avatarsExt&&!C.ex)?`<span class="hd-av ext">${SS.avatarsExt}</span>`:''):(SS.avatarsEmpty?`<span class="hd-av-none">${SS.avatarsEmpty}</span>`:'');
  return `<div class="hd-top"><span class="hd-ic">${SS.icon}</span>
     <div class="hd-main"><div class="hd-title">${SS.title} <span class="hd-status ${stc}">${stt}</span></div>
     <div class="hd-meta">${meta}</div></div>
     ${avs?`<div class="hd-avs">${avs}</div>`:''}${SS.owner?`<div class="hd-user">${SS.owner}${_ICO('chevron-down')}</div>`:''}</div>
   <div class="hd-tabs">${SS.tabs.map(t=>`<span class="${t===tab?'on':''}">${t}</span>`).join('')}<span class="hd-replay" id="replay">${_ICO('rotate-ccw')}다시</span></div>`;
}
function wsListSpec(C){
  const SS=PACK.surfaceSpec,i=C.idxOf(C.S.sel);
  const rows=(SS.ws||[]).map(r=>({r,ready:i>=r.from}));
  if(!rows.some(x=>x.ready))return '';
  return `<div class="ws-list">`+rows.map(({r,ready})=>`<div class="wl-row"><span class="wl-k">${r.k}</span>`+
    (ready?`<span class="wl-v">${typeof r.v==='function'?r.v(C):r.v}</span><button class="wl-go" data-dlv="${r.dlv}">보기</button>`:`<span class="wl-na">준비 전</span>`)+`</div>`).join('')+`</div>`;
}
function baseSpec(C){
  const SS=PACK.surfaceSpec,S=C.S,R=C.R,w=C.W(S.sel),working=R.phase==='working';
  const ps=SS.perStep[w.id]||{};
  let b=`<div class="ws-status">${working?'<span class="spin"></span>':''}${working?(ps.work||'처리하고 있어요…'):(ps.done||'완료')}</div>`;
  const mode=ps.mode||'work';
  if(mode==='request')b+=`<div class="ws-req">${ps.text||''}</div>${ps.hint?`<div class="ws-hint">${ps.hint}</div>`:''}`;
  else if(mode==='overview')b+=`<div class="ws-overview ${working?'':'show'}">${(ps.rows||[]).map(r=>`<div class="ov-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>`;
  else{ if(working&&ps.track)b+=C.par(ps.track); b+=wsListSpec(C); }
  return b;
}
function reviewSpec(h,C){
  const SS=PACK.surfaceSpec;let r='<div class="rv">';
  if(h.avatars){const av=h.avatars.map(n=>`<span class="rv-av">${n}</span>`).join('')+((h.avatarsExt&&!C.ex)?`<span class="rv-av ext">${h.avatarsExt}</span>`:'');
    r+=`<div class="rv-sec"><div class="rv-k">${typeof h.avatarsLabel==='function'?h.avatarsLabel(C):(h.avatarsLabel||'대상')}${h.avatarsMore?`<button class="rv-more" data-dlv="${h.avatarsMore}">모두 보기</button>`:''}</div><div class="rv-avs">${av}</div>${(h.extLabel&&!C.ex)?`<div class="rv-extlb">${h.extLabel}</div>`:''}</div>`;}
  (h.rows||[]).forEach(row=>r+=`<div class="rv-sec"><div class="rv-k">${row.k}${row.dlv?`<button class="rv-more" data-dlv="${row.dlv}">보기</button>`:''}</div><div class="rv-sum">${typeof row.v==='function'?row.v(C):(row.v||'')}</div></div>`);
  if(h.showSelect){const times=C.times.map((t,i)=>`<button class="rv-time ${t.t===C.S.pickedTime?'sel':''}" data-time="${i}">${t.t}<span>${t.s||''}</span></button>`).join('');
    r+=`<div class="rv-sec"><div class="rv-k">${SS.select||'선택'} <span class="rv-hint">하나를 선택하세요</span></div><div class="rv-times">${times}</div></div>`;}
  if(h.files)r+=`<div class="rv-sec"><div class="rv-k">${h.filesLabel||'자료'}</div><div class="rv-files">${h.files.map(f=>`<button class="rv-file" data-dlv="${f.dlv}">${f.label}</button>`).join('')}</div></div>`;
  return r+'</div>';
}
function cmodalSpec(kind,C){
  const SS=PACK.surfaceSpec,sel=C.S.sel;
  if(kind==='hitl'){const h=(SS.hitl||{})[sel];if(!h)return '';
    return `<div class="cmodal-h">${h.title}</div>${h.sub?`<div class="cmodal-sub">${h.sub}</div>`:''}${reviewSpec(h,C)}<div class="cmodal-actions"><button class="cp-btn primary" data-yes>${h.yes||'승인'}</button><button class="cp-btn ghost" data-no>${h.no||'수정'}</button></div>`;}
  if(kind==='done'){const d=(SS.done||{})[sel];if(!d)return '';
    if(d.card){const c=d.card,when=typeof c.when==='function'?c.when(C):c.when,sum=typeof c.summary==='function'?c.summary(C):c.summary;
      return `<button class="cmodal-x" data-close>${_ICO('x')}</button><div class="cmodal-h done">${d.title} <span class="cp-check">${_ICO('check')}</span></div><div class="mtcard"><div class="mt-row"><span class="mt-ic">${c.ic||'📅'}</span><div><div class="mt-title">${c.title}</div><div class="mt-when">${when||''}</div></div></div>${sum?`<div class="rv-sum" style="line-height:1.9">${sum}</div>`:''}${c.foot?`<div class="mt-foot">${c.foot}</div>`:''}</div><div class="cmodal-actions"><button class="cp-btn primary" data-close>확인</button></div>`;}
    return `<button class="cmodal-x" data-close>${_ICO('x')}</button><div class="cmodal-h done">${d.title} <span class="cp-check">${_ICO('check')}</span></div><div class="done-list">${(d.lines||[]).map(l=>`<div class="dn-row"><span class="dn-ic">${l.ic||_ICO('check')}</span>${typeof l.t==='function'?l.t(C):l.t}${l.dlv?` <button class="wl-go" data-dlv="${l.dlv}" style="margin-left:6px">열기</button>`:''}</div>`).join('')}</div><div class="cmodal-actions"><button class="cp-btn primary" data-close>확인</button></div>`;}
  if(kind==='meetingStart'){const m=SS.meeting||{},s=m.start||{};return `<div class="cmodal-h">${m.startTitle||'진행'}</div><div class="meet-pre"><div class="mp-t">${s.text||''}</div><button class="cp-btn primary lg" data-mstart>${_ICO('play')}${s.btn||'시작'}</button></div>`;}
  if(kind==='meetingLive'){const lv=(SS.meeting||{}).live||{},ended=C.S.meetPhase==='done';
    return `<div class="cmodal-h">${ended?(lv.endedTitle||'종료됨')+' <span class="cp-check">'+_ICO('check')+'</span>':(lv.title||'진행 중')+' <span class="live"><span class="live-dot"></span>LIVE</span>'}</div>
      <div class="lm"><div class="lm-h"><span class="rec" ${ended?'style="background:#94a3b8;animation:none"':''}></span>${ended?(lv.recEnded||'정리됨'):(lv.rec||'실시간')}</div>
      ${(lv.lines||[]).map(l=>`<div class="lm-line"><b>${l.time}</b> ${l.t}</div>`).join('')}
      <div class="lm-tags">${lv.tags||''}${lv.tagsDlv?` <button class="wl-go" data-dlv="${lv.tagsDlv}" style="margin-left:4px">보기</button>`:''}</div></div>
      ${C.S.meetPhase==='await_end'?`<div class="cmodal-actions"><button class="cp-btn primary" data-mend>${lv.endBtn||'종료'}</button></div>`:''}`;}
  return '';
}

/* ===== 좌측 고객 서비스 화면 ===== */
function renderConsole(){
  const C=ctx();
  document.getElementById('custHead').innerHTML=surfHead(C);
  const rp=document.getElementById('replay');if(rp)rp.onclick=()=>runStep();
  const cb=document.getElementById('conBody');cb.innerHTML=surfBase(C);
  cb.querySelectorAll('[data-dlv]').forEach(e=>e.onclick=()=>openPreview(e.dataset.dlv));
  renderCModal();
}
function currentCM(){
  if(STATE.previewK)return 'preview';
  const w=W(STATE.sel);
  if(STATE.baseOnly && w.doneModal)return null;
  if(w.meeting){if(STATE.meetPhase==='await_start')return 'meetingStart';if(STATE.meetPhase!=='idle')return 'meetingLive';}
  if(w.hitl && RUN.phase==='await')return 'hitl';
  if(w.doneModal && RUN.phase==='done')return 'done';
  return null;
}
function renderCModal(){
  const cm=document.getElementById('cmodal'),kind=currentCM();
  if(!kind){cm.classList.remove('show');cm.innerHTML='';return;}
  const C=ctx();let html;
  if(kind==='preview'){const d=resolveDlv(STATE.previewK,C);
    html=`<button class="cmodal-back" data-back>${_ICO('chevron-left')}뒤로</button><div class="cmodal-h">${d.ic} ${d.title}</div><div class="cmodal-sub">${d.sub}</div>${d.body}`;
  } else html=surfCmodal(kind,C);
  cm.innerHTML=`<div class="cmodal-card">${html}</div>`;cm.classList.add('show');
  cm.querySelectorAll('[data-dlv]').forEach(e=>e.onclick=()=>openPreview(e.dataset.dlv));
  const bk=cm.querySelector('[data-back]');if(bk)bk.onclick=()=>{STATE.previewK=null;renderConsole();};
  const yes=cm.querySelector('[data-yes]');if(yes)yes.onclick=()=>decide('yes');
  const no=cm.querySelector('[data-no]');if(no)no.onclick=()=>decide('no');
  cm.querySelectorAll('[data-close]').forEach(e=>e.onclick=()=>{STATE.baseOnly=true;renderConsole();});
  cm.querySelectorAll('[data-time]').forEach(e=>e.onclick=()=>{STATE.pickedTime=TIMES[+e.dataset.time].t;renderConsole();});
  const ms=cm.querySelector('[data-mstart]');if(ms)ms.onclick=meetingStart;
  const me=cm.querySelector('[data-mend]');if(me)me.onclick=meetingEnd;
}
function openPreview(k){STATE.previewK=k;renderConsole();}

/* ===== 우측 8계층 흐름 (코어 · WORK.ops 데이터 기반) ===== */
function renderRight(){
  const w=W(STATE.sel),gs=groupsOf(w);let h='';
  const lb=PACK.stepLoop?`<div class="loopbadge">추론 루프 · ${PACK.stepLoop[w.id]||'—'}</div>`:'';
  if(w.meeting && STATE.meetPhase==='await_start'){
    document.getElementById('flow').innerHTML=lb+`<div class="op" style="opacity:.5">회의 시작 신호 대기 — 사람이 실시간 Agent 가동 시점을 통제합니다 (HITL ②)</div>`;document.getElementById('explain').innerHTML=w.explain;return;
  }
  gs.forEach((g,gi)=>{
    const ops=w.ops.filter(o=>o.g===g);const stt=gi<RUN.reveal?'done':(gi===RUN.reveal&&RUN.phase==='working'?'doing':'');
    if(gi>0)h+=`<div class="rarrow ${gi<=RUN.reveal?'on':''}">${_ICO('arrow-down')}</div>`;
    const par=ops.length>1;h+=`<div class="rstage ${par?'par':''}">`;if(par)h+=`<div class="rph">∥ 병렬 동시 실행</div>`;
    ops.forEach((o,oi)=>{const micro=o.micro?`<div class="op-micro">${o.micro.map(m=>`<span class="mc">${m}</span>`).join('')}</div>`:'';
      const badge=o.badge?`<span class="op-badge">${o.badge}</span>`:'';
      const key=`${w.id}-${gi}-${oi}`;const open=STATE.opOpen.has(key);
      const more=(stt==='done'&&o.detail)?`<div class="op-more" data-op="${key}">${_ICO(open?'chevron-down':'chevron-right')}${open?'결과 접기':'결과 보기'}</div>${open?o.detail:''}`:'';
      h+=`<div class="op ${stt} ${o.asset?'asset':''}"><div class="op-h"><span class="op-lay">${o.L} ${LK[o.L]}</span><span class="op-t">${o.comp}</span>${badge}</div><div class="op-out">${o.feed} · <b>${stt?o.out:'대기'}</b></div>${(stt?micro:'')}${more}</div>`;});
    h+=`</div>`;
  });
  let casm='';
  if(w.id==='compose'){const lit=RUN.phase==='done'||RUN.phase==='await'||RUN.reveal>2;
    casm=`<div class="casm"><div class="casm-h">AAP가 조합한 구성요소</div>${COMPOSE.map(c=>`<span class="ct2 ${c.cls} ${lit?'on':''}">${c.t} ${c.n}</span>`).join('')}</div>`;}
  const flow=document.getElementById('flow');flow.innerHTML=lb+h+casm;document.getElementById('explain').innerHTML=w.explain;
  flow.querySelectorAll('[data-op]').forEach(e=>e.onclick=()=>{const k=e.dataset.op;STATE.opOpen.has(k)?STATE.opOpen.delete(k):STATE.opOpen.add(k);renderRight();});
}

/* ===== Run Trace (코어 · 단계 완료 시 ops 누적 = 거버넌스 증거) ===== */
function traceStep(w){
  if(STATE.traced.has(w.id))return;STATE.traced.add(w.id);
  w.ops.forEach(o=>STATE.trace.push({st:w.label,t:`${o.feed} → ${o.out}`,L:o.L,k:KMAP[o.L]||''}));
}

/* ===== 자율 실행 엔진 (코어 · 도메인 무관) ===== */
function startWorking(){RUN.phase='working';RUN.reveal=0;renderConsole();renderRight();revealOps();}
function revealOps(){
  const w=W(STATE.sel),n=groupsOf(w).length;
  for(let i=1;i<=n;i++)RUN.timers.push(setTimeout(()=>{RUN.reveal=i;renderConsole();renderRight();},i*640));
  RUN.timers.push(setTimeout(()=>{
    RUN.reveal=n;traceStep(w);
    if(w.meeting&&STATE.meetPhase==='in_meeting'){STATE.meetPhase='await_end';RUN.phase='await';renderConsole();renderRight();}
    else if(w.hitl){RUN.phase='await';renderConsole();renderRight();}
    else{RUN.phase='done';renderConsole();renderRight();if(STATE.playing)RUN.playTimer=setTimeout(playNext,1700);}
    afterStateChange();
  },n*640+300));
}
/* 케이스 영속 + 인박스 카운트 갱신 (런타임 상태가 바뀐 직후) */
function afterStateChange(){ persistToCase(); const navc=document.getElementById('navCnt'); if(navc){const w=APP.cases.filter(c=>c.packId===APP.pack&&caseStatus(c)==='wait').length;navc.textContent=w?String(w):'';} }
function runStep(){
  clearRun();STATE.previewK=null;STATE.baseOnly=false;STATE.opOpen.clear();const w=W(STATE.sel);
  if(w.meeting){STATE.meetPhase='await_start';RUN.phase='await';RUN.reveal=0;renderConsole();renderRight();}
  else{STATE.meetPhase='idle';startWorking();}
}
function meetingStart(){STATE.meetPhase='in_meeting';startWorking();}
function meetingEnd(){STATE.meetPhase='done';RUN.phase='done';renderConsole();renderRight();afterStateChange();if(STATE.playing)RUN.playTimer=setTimeout(playNext,1700);}
function decide(v){
  const w=W(STATE.sel);STATE.decisions[w.id]=v;RUN.phase='done';
  STATE.trace.push({st:w.label,t:'담당자 결정 · '+(v==='yes'?'승인':(w.id==='approve'?'외부 제외':'수정 요청')),L:'L7',k:'HITL'});
  renderConsole();renderRight();afterStateChange();
  toast(v==='yes'?'승인 · 다음 단계로 진행합니다':(w.id==='approve'?'외부 고객 제외하고 진행':'수정 요청'));
  if(STATE.playing)RUN.playTimer=setTimeout(playNext,1500);
}
function setSel(id){STATE.sel=id;renderSeq();runStep();afterStateChange();}
function startPlay(){
  if(!activeCase()){ const cs=APP.cases.filter(c=>c.packId===APP.pack); if(cs.length){openCase(cs[0].id);} else {createCase();} }
  if(STATE.view!=='run')setView('run');
  STATE.playing=true;STATE.decisions={};STATE.pickedTime=TIMES[0].t;STATE.trace=[];STATE.traced=new Set();
  const c=activeCase();if(c)c.done=false;
  setRunBtn(true);setSel(WORK[0].id);}
function stopPlay(){STATE.playing=false;clearTimeout(RUN.playTimer);setRunBtn(false);}
function playNext(){const ci=idxOf(STATE.sel);if(ci<WORK.length-1)setSel(WORK[ci+1].id);else stopPlay();}

/* ===== 도메인 뷰 = 업무 유형 카탈로그/레지스트리 (Phase 1.5 · 모드 스위치 ✕) =====
   플랫폼이 처리 가능한 유형 목록(=등록된 팩). 항목 클릭 시 그 유형의 실행 구조 미리보기.
   '도메인'은 앱을 갈아타는 모드가 아니라, 처리 가능한 업무 유형의 레지스트리다. */
function catalogPack(){ const k=APP.catSel&&PACKS[APP.catSel]?APP.catSel:Object.keys(PACKS)[0]; APP.catSel=k; return PACKS[k]; }
function renderDesign(){
  /* 카탈로그 그리드 */
  const cat=document.getElementById('catGrid');
  if(cat){
    const keys=Object.keys(PACKS);
    cat.innerHTML=keys.map(k=>{ const p=normalizePack(PACKS[k]);
      const steps=(p.work||[]).length, gates=(p.gates||[]).length;
      const comps=(p.compose||[]).reduce((s,c)=>s+(+c.n||0),0);
      const seeds=APP.cases.filter(c=>c.packId===k).length;
      const on=k===APP.catSel;
      return `<button class="cat-card ${on?'on':''} ${typeTok(k)}" data-cat="${k}">
        <div class="cat-h"><span class="ty-badge ${typeTok(k)}">${dcText(p.label,'pack.label')}</span>${p.authored?'<span class="cat-auto">자동저작</span>':''}</div>
        <div class="cat-type">${(p.workload&&p.workload.type)||p.label}</div>
        <div class="cat-stats"><span>단계 <b>${steps}</b></span><span>구성요소 <b>${comps}</b></span><span>HITL <b>${gates}</b></span><span>인박스 <b>${seeds}</b>건</span></div>
      </button>`;
    }).join('');
    cat.querySelectorAll('[data-cat]').forEach(e=>e.onclick=()=>{APP.catSel=e.dataset.cat;saveApp();renderDesign();});
  }
  /* 선택된 유형의 실행 구조 미리보기(구 구성 뷰 콘텐츠를 카탈로그 항목으로 흡수) */
  const P=normalizePack(catalogPack());
  const prev=document.getElementById('catPrevTitle');
  if(prev)prev.innerHTML=`${typeBadge(P.id)} 실행 구조 미리보기`;
  const wl=P.workload;
  document.getElementById('waBox').innerHTML=
    `<div class="wa-row full"><span class="k">요청</span><span class="req">${wl.request}</span></div>
     <div class="wa-row"><span class="k">유형</span><span>${wl.type}</span></div>
     <div class="wa-row"><span class="k">목적</span><span>${wl.purpose}</span></div>
     <div class="wa-row full"><span class="k">필요 산출물</span><span class="chips">${wl.outputs.map(o=>`<span>${o}</span>`).join('')}</span></div>
     <div class="wa-row full"><span class="k">확인 지점</span><span>${wl.gates}</span></div>`;
  document.getElementById('composeGrid').innerHTML=P.compose.map(c=>`<div class="comp ${c.cls}"><div class="ct">${c.t}<span class="cn">${c.n}</span></div><div class="csub">${c.sub}</div><ul>${c.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`).join('');
  renderPlan(P);
  document.getElementById('gatebar').innerHTML=P.gates.map(g=>`<div class="g">${g}</div>`).join('');
  renderArchCoherence(P);
}
/* B-1: 아키텍처 정합 뷰 — 표준 런타임 = AAP 아키텍처(Loop·8계층·Trust), 도메인이 경유하는 계층 점등 */
function renderArchCoherence(P){
  P=P||PACK;
  const el=document.getElementById('archMap');if(!el)return;
  const usedL=new Set();P.work.forEach(w=>w.ops.forEach(o=>usedL.add(o.L)));
  const loop=LOOP.map((s,i)=>`${i>0?'<span class="lsep">→</span>':''}<span class="ls ${s==='Learning'?'lp':''}">${s}</span>`).join('');
  const layers=LAYERS.map(L=>`<div class="ac-lyr ${usedL.has(L.id)?'used':''} ${L.star?'star':''}"><span class="lc">${L.id}</span><span class="ln">${L.ko}</span>${L.star?'<span class="lkt">★ kt ds</span>':''}<span class="lcap">${L.cap}</span></div>`).join('');
  el.innerHTML=`<div class="ac-loop">${loop}</div><div class="ac-layers">${layers}</div>
    <div class="ac-trust">Trust · Security · Governance — 전 계층 공통 통제</div>
    <div class="ac-note">표준 런타임 = 이 아키텍처. <b>${dcText(P.label,'pack.label')} Pack</b>이 경유하는 계층이 점등됩니다(${usedL.size}/8). 산업이 바뀌어도 8계층·Operating Loop·Trust는 그대로, <b>Domain Pack만 교체</b>됩니다.</div>`;
}
function renderPlan(P){
  P=P||PACK;
  const PROD=P.planProduces;
  const sel=w=>w.meeting?`<span class="sel-human">${_ICO('flag')}시작·종료 신호</span>`:(w.hitl?`<span class="sel-hitl">${_ICO('flag')}담당자 확인</span>`:(w.actor==='human'?`<span class="sel-human">사람 요청</span>`:`<span class="sel-auto">자동</span>`));
  const makes=w=>{const o=PROD[w.id]||[];return o.length?o.map(x=>`<b>${x}</b>`).join(' · '):'<i style="color:#94a3b8;font-style:normal">중간 처리</i>';};
  const lays=w=>[...new Set(w.ops.map(o=>o.L))].map(l=>`<span>${l}</span>`).join('');
  let h=`<div class="plan-head"><div>#</div><div>단계</div><div>만드는 산출물</div><div>사람이 선택·확인</div><div>거치는 계층</div></div>`;
  P.work.forEach((w,i)=>{h+=`<div class="plan-row ${w.gate?'gate':''}"><div class="pr-n">${i+1}</div><div><div class="pr-label">${w.label}</div><div class="pr-sub">${w.role}</div></div><div class="pr-make">${makes(w)}</div><div class="pr-sel">${sel(w)}</div><div class="pr-lay">${lays(w)}</div></div>`;});
  document.getElementById('planTable').innerHTML=h;
}
/* ===== 관리 뷰 (코어 · 거버넌스 strip + Component Registry) ===== */
function renderGovern(){
  document.getElementById('govStrip').innerHTML=PACK.govern.map(c=>`<div class="gov-cell"><div class="gk">${c.k}</div><div class="gv">${c.v}</div></div>`).join('');
  renderTrace();
  document.getElementById('reg').innerHTML=COMPONENTS.map(a=>`<div class="ag ${a.asset?'asset':''}"><div class="ag-h"><div class="ag-ic">${a.ic}</div><div><span class="ag-type ${a.ty}">${a.type}</span><div class="ag-name">${a.name}</div></div><span class="ag-lay">${a.L} ${LK[a.L]}</span>${a.asset?'<span class="ag-kt">kt ds</span>':''}</div><div class="ag-desc">${a.desc}</div><div class="ag-meta"><div class="ag-m when"><div class="ag-mk">${_ICO('compass')}언제 쓰나</div><div class="ag-mv">${a.when}</div></div><div class="ag-m data"><div class="ag-mk">${_ICO('folder')}사용 데이터</div><div class="ag-mv">${a.data}</div></div><div class="ag-m how"><div class="ag-mk">${_ICO('settings')}수행 방식</div><div class="ag-mv">${a.how}</div></div></div></div>`).join('');
}

/* B-2: Run Trace · Decision Log (관리 뷰) — 실행 중 누적된 자율 판단·HITL·반영 */
function renderTrace(){
  const el=document.getElementById('traceLog');if(!el)return;
  if(!STATE.trace.length){el.innerHTML='<div class="tr-empty">아직 기록 없음 — Run 을 실행하거나 단계를 진행하면 자율 판단·HITL·반영이 여기 누적됩니다(감사·재현 가능).</div>';return;}
  el.innerHTML=STATE.trace.map(e=>`<div class="tr-line"><span class="tr-st">${e.st}</span><span class="tr-k ${e.k}">${e.k}</span><span class="tr-t">${e.t}</span><span class="tr-L">${e.L}</span></div>`).join('');
}

/* ===== misc ===== */
/* Run 버튼 상태(아이콘 유지) — 이모지 textContent 대체. play/stop SVG + 라벨 */
const _ICO=(n)=>window.AAP_ICON?window.AAP_ICON.svg(n):'';
function setRunBtn(running){
  const b=document.getElementById('runBtn'); if(!b)return;
  b.innerHTML=(running?_ICO('square'):_ICO('play'))+`<span class="btn-l">${running?'중지':'Run'}</span>`;
  b.classList.toggle('stop',!!running);
}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>t.classList.remove('show'),2200);}

/* ===== 외부 API (자동 저작 모듈이 새 팩을 등록·로드) =====
   register: 새 유형을 레지스트리에 편입 → 유형 토큰 배정 → 카탈로그/인박스/필터 자동 반영.
   load: 그 유형으로 케이스 시드 후 첫 케이스를 실행 콘솔에 연다(자동저작 데모 연속성). */
window.AAP_CORE={
  register:(pack)=>{PACKS[pack.id]=normalizePack(pack);typeTok(pack.id);
    if(document.getElementById('catGrid')&&STATE.view==='domain')renderDesign();
    if(STATE.view==='inbox')renderInbox();},
  load:(id)=>{if(!PACKS[id])return;setPackRefs(id);seedPack(id);const cs=APP.cases.filter(c=>c.packId===id);if(cs.length)openCase(cs[0].id);else createCase(id);},
  has:(id)=>!!PACKS[id],
  go:(id)=>{if(activeCase()&&W(id)){STATE.sel=id;renderSeq();runStep();}},
};

/* ===== wiring ===== */
document.querySelectorAll('#gnav .gnav-i').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.getElementById('runBtn').onclick=()=>STATE.playing?stopPlay():startPlay();
document.getElementById('devToggle').onchange=e=>document.body.classList.toggle('dev-on',e.target.checked);
const _nc=document.getElementById('newCaseBtn');if(_nc)_nc.onclick=()=>promptNewCase(_nc);
const _rb=document.getElementById('rtBack');if(_rb)_rb.onclick=()=>{if(STATE.playing)stopPlay();setView('inbox');};
const TIP=document.getElementById('tip');
document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-tip]');if(t){TIP.textContent=t.getAttribute('data-tip');TIP.style.display='block';const r=t.getBoundingClientRect();TIP.style.left=Math.min(r.left,window.innerWidth-320)+'px';let tp=r.bottom+8;if(tp+TIP.offsetHeight>window.innerHeight)tp=r.top-TIP.offsetHeight-8;TIP.style.top=Math.max(8,tp)+'px';}else if(!e.target.closest('#tip'))TIP.style.display='none';});

/* ===== boot (영속 복원 → 통합 인박스 중심) =====
   도메인 셀렉터(모드 전환) 폐지: 인박스는 전 유형 통합. 런타임 컨텍스트는 케이스 열 때 결정. */
(function(){
  const q=new URLSearchParams(location.search);
  if(q.get('dev')==='1'){document.body.classList.add('dev-on');document.getElementById('devToggle').checked=true;}
  loadApp();
  const keys=Object.keys(PACKS);
  /* 유형 토큰 안정 배정(등록 순서) — 카탈로그·인박스·필터 색 일관 */
  keys.forEach(typeTok);
  /* 런타임 컨텍스트 초기 팩: ?pack > 저장값 > 첫 팩 (열린 케이스 없을 때의 govern/도메인 기본) */
  const pk=q.get('pack');
  let initKey=(pk&&PACKS[pk])?pk:((APP.pack&&PACKS[APP.pack])?APP.pack:keys[0]);
  setPackRefs(initKey);
  APP.catSel=(APP.catSel&&PACKS[APP.catSel])?APP.catSel:initKey;
  /* 모든 팩에 시드 보장(통합 인박스가 비어보이지 않게 · 1회) */
  keys.forEach(seedPack);
  /* 뷰·케이스 복원 */
  let view=APP.view||'inbox';
  const qv=q.get('view'); if(qv&&['inbox','run','govern','domain'].includes(qv))view=qv;
  if(qv==='design')view='domain'; /* 하위호환 */
  const qtf=q.get('type'); if(qtf&&(qtf==='all'||PACKS[qtf]))APP.typeFilter=qtf;
  const qopen=q.get('open');
  if(qopen&&APP.cases.some(c=>c.id===qopen)){openCase(qopen);}
  else if(view==='run'&&APP.active&&APP.cases.some(c=>c.id===APP.active)){openCase(APP.active);}
  else { APP.active=null; setView(view==='run'?'inbox':view); }
})();
})();
