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
  if(!pack)return pack;
  /* 0) 워크플로우 편집기 override 적용(있으면) — work.ops/hitl·compose 를 인플레이스 수정.
     applyPackOverride 가 _dcDone=false 로 되돌려 아래 디자인 계약을 재적용하게 한다. */
  if(!pack._ovApplied){ applyPackOverride(pack); pack._ovApplied=true; }
  if(pack._dcDone)return pack;
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

/* =========================================================================
   워크플로우 편집기 오버라이드 (스튜디오 경량 편집 · 영속) — 도메인 무관
   packOverrides[packId] = { steps:{ [stepId]:{ comps:[{type,name}], hitl } } }.
   normalizePack 직후 applyPackOverride 가 work.ops/hitl·compose 에 인플레이스 반영 →
   실행 뷰 근거 레일·8계층·compose 칩이 편집 결과를 그대로 반영. 코어는 저장·적용만,
   편집 UI·override 구성은 wfeditor.js(일반 로직). 팩 데이터만 수정 → 코어 도메인 무관 유지. */
let _packOverrides=null;
function loadOverrides(){ if(_packOverrides)return _packOverrides; _packOverrides=lsGet('packOverrides',{})||{}; return _packOverrides; }
function saveOverrides(){ lsSet('packOverrides',_packOverrides||{}); }

/* =========================================================================
   도메인 팩 배포 생애주기 (draft/deployed) — IA v0.2 §4-2 · 도메인 무관
   ───────────────────────────────────────────────────────────────────────
   packStatus[packId] = 'draft' | 'deployed'. localStorage 맵(aap.v1.packStatus).
   ★배포된 팩만 운영(인박스·On-Ramp 매칭·조합)에 편입. draft 는 스튜디오에서만 보임.
   시드 팩(meeting/voc/recruiting)=기본 deployed, 자동저작/격상/On-Ramp register=draft.
   packOverrides 와 동일한 persisted-map 패턴(코어가 저장·조회만). */
const SEED_PACK_IDS=['meeting','voc','recruiting'];   /* 시드 = 기본 deployed */
let _packStatus=null;
function loadPackStatus(){ if(_packStatus)return _packStatus; _packStatus=lsGet('packStatus',{})||{}; return _packStatus; }
function savePackStatus(){ lsSet('packStatus',_packStatus||{}); }
/* 팩 상태 — 미기록 폴백: 시드 팩=deployed, 그 외=draft(신규는 register 시 명시 기록). */
function packStatus(id){ const m=loadPackStatus(); if(m[id]==='draft'||m[id]==='deployed')return m[id]; return SEED_PACK_IDS.includes(id)?'deployed':'draft'; }
function setPackStatus(id,s){ if(s!=='draft'&&s!=='deployed')return; const m=loadPackStatus(); m[id]=s; savePackStatus(); }
function isDeployed(id){ return packStatus(id)==='deployed'; }
/* 시드 팩 deployed 기본을 1회 보장(스키마 가드 후 재시드 시점). 이미 기록된 값은 보존. */
function ensureSeedDeployed(){ const m=loadPackStatus(); let ch=false; SEED_PACK_IDS.forEach(id=>{ if(PACKS[id]&&m[id]!=='draft'&&m[id]!=='deployed'){ m[id]='deployed'; ch=true; } }); if(ch)savePackStatus(); }
/* 배포된 팩 id 집합(운영 편입 대상). 카탈로그·자산은 전 팩, 인박스·On-Ramp는 이 집합만. */
function deployedPackIds(){ return Object.keys(PACKS).filter(isDeployed); }
/* 원본 baseline 스냅샷(override 적용 전) — 재적용·복원이 원본에서 출발하도록(누적 방지) */
function snapshotPack(pack){ if(pack._base)return; pack._base={ work:JSON.parse(JSON.stringify(pack.work||[])), compose:JSON.parse(JSON.stringify(pack.compose||[])), gates:JSON.parse(JSON.stringify(pack.gates||[])) }; }
function restoreBase(pack){ if(!pack._base)return; pack.work=JSON.parse(JSON.stringify(pack._base.work)); pack.compose=JSON.parse(JSON.stringify(pack._base.compose)); pack.gates=JSON.parse(JSON.stringify(pack._base.gates)); }
/* normalizePack 내부에서 호출 — override 가 있으면 원본 baseline 위에 적용(편집기 모듈 위임) */
function applyPackOverride(pack){
  snapshotPack(pack);
  const ov=loadOverrides()[pack.id];
  restoreBase(pack); /* 항상 원본에서 출발 → override 누적·잔존 방지 */
  if(ov&&window.AAP_WFEDITOR&&window.AAP_WFEDITOR.applyOverride){ try{ window.AAP_WFEDITOR.applyOverride(pack,ov); }catch(e){ if(window.console)console.warn('[AAP] override 적용 실패',e); } }
  return pack;
}
/* override 저장/해제 후 활성 팩 재적용 + 영향 뷰 재렌더(스튜디오 미리보기·편집기·열린 run) */
function reapplyOverride(packId){
  const pack=PACKS[packId]; if(!pack)return;
  /* 원본 baseline 에서 override 재적용 → DC 재정규화(normalizePack 이 _ovApplied/_dcDone 가드로 1회 적용) */
  pack._ovApplied=false; pack._dcDone=false; pack._caseOv=false; normalizePack(pack);
  /* 활성 런타임 팩이면 참조 갱신(WORK/COMPOSE 등) */
  if(APP.pack===packId)setPackRefs(packId);
  if(STATE.view==='studio'||STATE.view==='domain'||STATE.view==='workflow')renderDesign();
  else if(STATE.view==='run'&&activeCase()&&activeCase().packId===packId){ renderSeq(); restoreStep(); }
}

/* =========================================================================
   P5 · 케이스 단위 튜닝 (case.overrides) — ★격리가 생명: 공유 PACK 오염 0
   ───────────────────────────────────────────────────────────────────────
   case.overrides = packOverrides 와 동일 구조 { steps:{ [stepId]:{comps,hitl} } } 의
   '케이스 단위 델타'. 케이스 객체 안에 영속(localStorage cases[]) → 공유 팩 저장소(packOverrides)
   와 완전 분리. 적용 순서 = 베이스라인(snapshotPack) → 팩 오버라이드(packOverrides)
   → 케이스 델타(case.overrides) 를 '그 케이스가 열린 동안의 활성 PACK 참조에만' 얹는다.
   케이스 전환/닫을 때 팩 레벨(베이스라인+packOverride)로 복원 → 누수 0.
   ★ packOverrides/PACKS/COMPONENTS/WORK 에는 케이스 델타를 절대 영구 기록하지 않는다.
   '정의 승격'(명시적 액션)일 때만 case.overrides → packOverrides 로 병합한다. */
let _caseOvActive=null;   /* 현재 케이스 델타가 얹힌 packId (없으면 null) — 복원 추적용 */
/* 팩을 '팩 레벨 상태'(베이스라인 + packOverrides, 케이스 델타 0)로 재구성. */
function rebuildPackLevel(pack){
  pack._ovApplied=false; pack._dcDone=false; pack._caseOv=false; normalizePack(pack); /* baseline+packOverride 재적용 */
}
/* 케이스 델타를 활성 팩 파생본에 얹는다(임시 — 떠나면 removeCaseOverlay 로 제거).
   격리: packOverrides 미수정. 팩 레벨로 먼저 되돌린 뒤 케이스 델타만 추가 적용 → DC 재정규화. */
function applyCaseOverlay(pack, caseOv){
  if(!pack)return;
  rebuildPackLevel(pack); /* 항상 팩 레벨에서 출발(이전 케이스 델타 잔존 0) */
  if(caseOv&&caseOv.steps&&Object.keys(caseOv.steps).length&&window.AAP_WFEDITOR&&window.AAP_WFEDITOR.applyOverride){
    try{ window.AAP_WFEDITOR.applyOverride(pack,caseOv); pack._caseOv=true; pack._dcDone=false; normalizePack(pack); /* 케이스 델타 후 DC 재정규화(_ovApplied 가드는 그대로 → packOverride 재적용 없음) */ }
    catch(e){ if(window.console)console.warn('[AAP] case override 적용 실패',e); }
  }
}
/* 케이스 델타 제거 → 팩 레벨로 복원(베이스라인 + packOverrides 만). 케이스 전환/닫을 때 호출. */
function removeCaseOverlay(pack){ if(!pack)return; rebuildPackLevel(pack); }
/* 활성 케이스 델타가 있으면 팩 레벨로 되돌리고 참조 갱신(케이스 전환 직전) — 누수 가드. */
function clearActiveCaseOverlay(){
  if(_caseOvActive&&PACKS[_caseOvActive]){ removeCaseOverlay(PACKS[_caseOvActive]); if(APP.pack===_caseOvActive)setPackRefs(_caseOvActive); }
  _caseOvActive=null;
}
/* 케이스 객체의 overrides(케이스 델타) — 없으면 null. */
function caseOverridesOf(c){ return (c&&c.overrides&&c.overrides.steps&&Object.keys(c.overrides.steps).length)?c.overrides:null; }
function hasCaseOverlay(c){ return !!caseOverridesOf(c); }

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
/* 스키마 버전 — 상태 모델이 바뀔 때마다 올린다. 저장본 버전이 다르거나(구버전 잔재) 없으면
   aap.v1.* 를 안전 초기화·재시드 → '옛 localStorage 가 새 코드를 깨는' 문제 방지. */
const SCHEMA_VER=4;
function lsGet(k,fb){ try{const v=localStorage.getItem(LS_NS+k);return v==null?fb:JSON.parse(v);}catch(e){return fb;} }
function lsSet(k,v){ try{localStorage.setItem(LS_NS+k,JSON.stringify(v));}catch(e){} }
function lsClearAll(){ try{const rm=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(LS_NS)===0)rm.push(k);}rm.forEach(k=>localStorage.removeItem(k));}catch(e){} }
/* boot/loadApp 진입 시 1회: 버전 불일치(또는 미기록인데 기존 데이터 존재) → 초기화. 일치/완전 신규면 통과. */
function lsCheckSchema(){
  let stored=null; try{stored=localStorage.getItem(LS_NS+'schema');}catch(e){}
  if(stored!==null && String(JSON.parse(stored))===String(SCHEMA_VER))return; /* 정상 */
  let hadData=false; try{hadData=!!localStorage.getItem(LS_NS+'cases');}catch(e){}
  if(stored===null && !hadData){ lsSet('schema',SCHEMA_VER); return; } /* 완전 신규 */
  lsClearAll(); lsSet('schema',SCHEMA_VER); /* 구버전/불일치 → 안전 초기화 */
}

/* APP = 코어가 책임지는 인스턴스성 모델(도메인 무관). cases=인스턴스 배열, active=열린 케이스 id
   pack = 현재 런타임 컨텍스트(열린 케이스의 packId). 인박스는 전 팩 통합 → pack 은 '모드'가 아니라
   '실행 뷰가 렌더 중인 유형' 이다(케이스 열 때 그 케이스 packId 로 로드). typeFilter=인박스 유형 필터. */
/* projects[] = P4 프로젝트(케이스 묶음) 차원. 추가 레이어일 뿐 — 케이스의 projectId(옵셔널)로 느슨히 연결.
   projectsOn = '프로젝트별 보기' 토글(기본 OFF=현행 인박스 100% 유지). 둘 다 영속(도메인 무관). */
const APP={cases:[], projects:[], active:null, view:'inbox', pack:null, typeFilter:'all', catSel:null, projectsOn:false};
function saveApp(){ lsSet('schema',SCHEMA_VER); lsSet('cases',APP.cases); lsSet('projects',APP.projects); lsSet('active',APP.active); lsSet('view',APP.view); lsSet('pack',APP.pack); lsSet('typeFilter',APP.typeFilter); lsSet('projectsOn',APP.projectsOn); }
function loadApp(){
  lsCheckSchema();
  const cs=lsGet('cases',null);
  if(Array.isArray(cs)) APP.cases=cs.filter(c=>c&&c.id&&c.packId);
  const pj=lsGet('projects',null);
  if(Array.isArray(pj)) APP.projects=pj.filter(p=>p&&p.id&&p.name);
  APP.active=lsGet('active',null);
  let v=lsGet('view',null); if(v==='studio')v='domain'; if(['inbox','run','domain','workflow','assets','logs','govern','demo'].includes(v))APP.view=v;
  APP.pack=lsGet('pack',null);
  const tf=lsGet('typeFilter',null); if(typeof tf==='string')APP.typeFilter=tf;
  const po=lsGet('projectsOn',null); if(typeof po==='boolean')APP.projectsOn=po;
}
/* 프로젝트 헬퍼(도메인 무관) — id로 프로젝트 조회, 케이스의 projectId 정합성 폴백 */
function projectById(id){ return APP.projects.find(p=>p&&p.id===id)||null; }
/* 시드 프로젝트(데모용 · 1회, 비어있을 때만). 기존 시드 케이스 일부에 projectId 부여(없어도 무방=미배정) */
function seedProjects(){
  if(APP.projects.length)return;
  APP.projects=[
    {id:'pj-recruit-2026h1', name:'2026 상반기 채용'},
    {id:'pj-daehan-onboard', name:'대한제조 도입'},
  ];
  /* 기존 시드 케이스 일부를 프로젝트에 느슨히 배정(매칭되는 게 없으면 그대로 미배정) */
  let r=0;
  APP.cases.forEach(c=>{
    if(c.projectId)return;
    if(c.packId==='recruiting'){ c.projectId='pj-recruit-2026h1'; }
    else if(c.packId==='meeting' && r<1){ c.projectId='pj-daehan-onboard'; r++; }
  });
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
    projectId:(seed&&seed.projectId)||null,  /* P4 옵셔널 — 없으면 미배정(정상 동작) */
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
    packState:(seed&&seed.packState)||{},  /* 팩 선언 persistKeys 보관(도메인 무관) */
  };
}
/* 팩이 영속을 원하는 STATE 키 목록(없으면 빈 배열) — 도메인 무관 */
function packPersistKeys(){ const hk=PACK&&PACK.surfaceHooks; return (hk&&Array.isArray(hk.persistKeys))?hk.persistKeys:[]; }
/* 팩 transient 키 초기화(케이스/단계 전환 시 누수 방지) — 도메인 무관 */
function clearPackTransient(){ const hk=PACK&&PACK.surfaceHooks; if(hk&&Array.isArray(hk.transientKeys))hk.transientKeys.forEach(k=>{ delete STATE[k]; }); }
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
  /* 팩 선언 키 복원(도메인 무관) — 매번 초기화 후 저장된 값 주입(누수 방지) */
  packPersistKeys().forEach(k=>{ delete STATE[k]; });
  const ps=(c.packState&&typeof c.packState==='object')?c.packState:{};
  packPersistKeys().forEach(k=>{ if(k in ps)STATE[k]=ps[k]; });
  /* 팩 선언 transient 키 초기화(케이스 간 누수 방지 — 예: 열린 상세 모달) */
  clearPackTransient();
}
function persistToCase(){
  const c=activeCase(); if(!c)return;
  c.sel=STATE.sel; c.decisions={...STATE.decisions}; c.pickedTime=STATE.pickedTime; c.meetPhase=STATE.meetPhase;
  c.trace=STATE.trace.slice(); c.traced=[...STATE.traced];
  /* 팩 선언 키 영속(도메인 무관) */
  const ps={}; packPersistKeys().forEach(k=>{ if(k in STATE)ps[k]=STATE[k]; }); c.packState=ps;
  const pack=PACKS[c.packId], last=pack.work[pack.work.length-1];
  if(STATE.sel===last.id && RUN.phase==='done') c.done=true;
  saveApp();
}

/* surface 컨텍스트 (코어→팩) */
function ctx(){return {S:STATE, R:RUN, idxOf, W, par:parTrack, times:TIMES, ex:extExcluded()};}
function resolveDlv(k,C){const d=PACK.products[k];return {ic:d.ic,title:d.title,sub:typeof d.sub==='function'?d.sub(C):d.sub,body:typeof d.body==='function'?d.body(C):d.body};}

/* ===== view 전환 (운영 콘솔 IA: inbox / run / govern / domain) ===== */
function setView(v){
  /* ★P5 격리: 실행 뷰를 떠나면 케이스 델타를 팩 레벨로 복원 → 스튜디오/자산/로그는 공유 팩(케이스 델타 0) 기준. */
  if(v!=='run'&&STATE.view==='run'&&_caseOvActive)clearActiveCaseOverlay();
  STATE.view=v; APP.view=v;
  document.querySelectorAll('#gnav .gnav-i').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  document.querySelectorAll('.view').forEach(s=>s.hidden=s.dataset.view!==v);
  if(v!=='run'&&STATE.playing)stopPlay();
  /* 시연 모드: 가이드 투어는 운영 화면 위 오버레이. 시연 뷰를 떠나도(투어가 다른 뷰를 조작 중일 땐 유지) */
  if(window.AAP_DEMO){ if(v==='demo')window.AAP_DEMO.renderDemoView(); }
  if(v==='inbox')renderInbox();
  if(v==='studio'||v==='domain'||v==='workflow')renderDesign();
  if(v==='assets')renderAssets();
  if(v==='logs')renderLogs();
  if(v==='govern')renderGovern();
  updateCaseTitle();
  renderRunAction();   /* 실행 진입점 버튼은 run 뷰에서만 노출 — 그 외 뷰에서 숨김 */
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
/* 케이스(인스턴스) 열기 → 런타임 STATE hydrate → 실행 뷰
   ★P5 격리: 이전 케이스 델타를 팩 레벨로 되돌린 뒤, 이 케이스의 델타만 활성 팩 파생본에 얹는다. */
function openCase(id){
  const c=APP.cases.find(x=>x.id===id); if(!c)return;
  if(!PACKS[c.packId]){ toast('이 유형은 현재 등록돼 있지 않습니다'); setView('inbox'); return; }
  clearActiveCaseOverlay();              /* 이전 케이스 델타 제거(누수 가드) — packOverrides 미수정 */
  if(c.packId!==APP.pack)setPackRefs(c.packId);
  /* 적용 순서 = 베이스라인 → 팩 오버라이드 → 케이스 델타 (그 케이스 파생본에만) */
  const cov=caseOverridesOf(c);
  if(cov){ applyCaseOverlay(PACKS[c.packId], cov); _caseOvActive=c.packId; setPackRefs(c.packId); }
  APP.active=id; hydrateFromCase(c);
  clearRun(); setRunBtn(false);
  setView('run'); renderSeq(); restoreStep(); renderRunAction(); saveApp();
}
/* 케이스가 '이미 실행에 진입했는가' = 첫 단계가 아니거나 어떤 결정이 누적됐거나 완료됨.
   미진입(첫 단계 · 결정 0 · 미완료) = 요청 트리거 대기(요청 접수만 된 새 케이스) → '▶ 실행'. */
function caseStarted(c){
  if(!c)return false;
  const pack=PACKS[c.packId]; if(!pack)return true;
  if(c.done)return true;
  if(Object.keys(c.decisions||{}).length)return true;
  return c.sel!==pack.work[0].id;
}
/* 실행 뷰 이탈 시 케이스 델타 복원은 setView(v!=='run') 가드가 처리(rtBack→setView('inbox') 포함). */
/* hydrate 된 STATE(sel/decisions/...) 로 화면을 '진행된 그 지점'에 복원(재생 ✕, 정지 상태) */
function restoreStep(){
  /* 정지(비재생) 복원 = 단계를 '완료(정착)'로 보여 AAP 작동 흐름을 기본 노출(결과 모달이 흐름을 덮지 않게).
     HITL await 단계는 currentCM 이 baseOnly 와 무관하게 모달을 띄움(사람 승인 필요). */
  const w=W(STATE.sel); clearRun(); STATE.previewK=null; STATE.baseOnly=true; STATE.opOpen=new Set();
  if(w.meeting){ STATE.meetPhase=STATE.meetPhase==='done'?'done':'await_end'; RUN.phase=STATE.meetPhase==='done'?'done':'await'; }
  else if(w.hitl){ STATE.meetPhase='idle'; RUN.phase=STATE.decisions[w.id]?'done':'await'; }
  else { STATE.meetPhase='idle'; RUN.phase='done'; }
  RUN.reveal=groupsOf(w).length;
  if(!STATE.traced.has(w.id))traceStep(w);
  renderConsole(); renderRight(); afterStateChange();
}

/* ===== 업무 순서 (top bar · 직전/현재/다음 = 자동 진행 타임라인 · 클릭=되짚기) =====
   인터랙션 모델: 사용자가 클릭해 '진행'시키는 스테퍼 ✕ → 요청 트리거 후 AAP가 자동 진행하고,
   이 줄은 '어디까지 처리됐나'를 보여주는 타임라인. 노드 클릭 = 그 단계로 되짚기(탐색). */
function renderSeq(){
  const ci=idxOf(STATE.sel);let html='';
  /* 현재 단계가 작동 중(working)이면 active 노드에 '처리 중' 상태 표시(자동 운영 톤) */
  const working=RUN.phase==='working';
  for(let d=-1;d<=1;d++){const i=ci+d; if(i<0||i>=WORK.length)continue;
    const w=WORK[i];let cls='snode'+(d===0?' active':' adj')+(w.gate?' gate':'')+(d<0?' past':'')+(d===0&&working?' working':'');
    if(d>0||(d===0&&i>0))html+=`<span class="sarrow">${_ICO('chevron-right')}</span>`;
    const tag=d===0?`<span class="snode-st">${working?'처리 중…':(RUN.phase==='await'?'확인 대기':'완료')}</span>`:'';
    html+=`<div class="${cls}" data-go="${w.id}"><span class="role">${w.role}</span><span class="lab"><span class="sn">${String(i+1).padStart(2,'0')}</span>${w.label}${w.gate?_ICO('star'):''}</span>${tag}</div>`;}
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
  /* 안전 폴백: 등록 안 된 유형(자동저작 팩은 비영속)의 케이스는 인박스에서 숨김(저장은 보존).
     ★배포 생애주기: draft 팩 케이스는 인박스에서 숨김 — 배포(deployed)된 유형만 운영 편입. */
  const all=APP.cases.filter(c=>PACKS[c.packId]&&isDeployed(c.packId));
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
  /* P4 '프로젝트별 보기' 토글 — 프로젝트가 1개 이상 있을 때만 노출. OFF(기본)=현행 100% 유지 */
  const ptg=document.getElementById('inboxProjToggle');
  if(ptg){
    if(APP.projects.length){
      ptg.hidden=false;
      ptg.innerHTML=`<button class="proj-tg ${APP.projectsOn?'on':''}" id="projTgBtn" data-tip="프로젝트별로 케이스를 묶어 봅니다. 끄면 기존 상태별 보기로 돌아갑니다."><span class="ptg-sw"></span>프로젝트별 보기</button>`;
      const b=ptg.querySelector('#projTgBtn'); if(b)b.onclick=()=>{ APP.projectsOn=!APP.projectsOn; saveApp(); renderInbox(); };
    } else { ptg.hidden=true; ptg.innerHTML=''; }
  }
  if(!cs.length){ list.innerHTML=`<div class="ibx-empty">${APP.typeFilter==='all'?'아직 들어온 업무 요청이 없습니다':'이 유형의 업무가 없습니다'} — <b>＋ 새 업무 요청</b>으로 시작하세요.</div>`; return; }
  let h;
  if(APP.projectsOn && APP.projects.length){
    /* ON = 프로젝트별 그룹(미배정은 '미배정'). 프로젝트 안에서 기존 상태 그룹 유지 */
    h='';
    const groups=APP.projects.map(p=>({key:p.id,name:p.name,arr:cs.filter(c=>c.projectId===p.id)}))
      .filter(g=>g.arr.length);
    const unassigned=cs.filter(c=>!c.projectId||!projectById(c.projectId));
    if(unassigned.length)groups.push({key:'__none__',name:'미배정',arr:unassigned,none:true});
    groups.forEach(g=>{
      const wait=g.arr.filter(c=>caseStatusFor(c)==='wait').length;
      h+=`<div class="ibx-proj"><div class="ibx-ph"><span class="ph-ic ${g.none?'none':''}">${g.none?'·':'▣'}</span><span class="ph-name">${dcText(g.name,'project.name')}</span><span class="ph-n">${g.arr.length}</span>${wait?`<span class="ph-wait">검토대기 ${wait}</span>`:''}</div><div class="ibx-pbody">`;
      h+=_inboxStatusGroups(g.arr);
      h+=`</div></div>`;
    });
  } else {
    /* OFF(기본) = 현행 그대로(상태 그룹) */
    h=_inboxStatusGroups(cs);
  }
  list.innerHTML=h;
  list.querySelectorAll('[data-open]').forEach(e=>e.onclick=()=>openCase(e.dataset.open));
}
/* 상태(검토대기·진행·접수·완료) 그룹 마크업 — 현행 인박스 렌더를 그대로 헬퍼화(무회귀).
   토글 OFF=전체, ON=각 프로젝트 안에서 재사용. */
function _inboxStatusGroups(cs){
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
  return h;
}
/* 새 업무 요청 = 유형(팩)을 골라 그 workload 템플릿으로 새 케이스 생성 → 통합 인박스 편입 → 실행 투입.
   packId 미지정 시: 인박스 필터가 특정 유형이면 그 유형, 아니면 현재 런타임 팩(없으면 첫 팩).
   seed(옵션)={title,request} — On-Ramp 가 사용자가 입력한 업무 설명을 케이스로 실어 보낼 때 사용(도메인 무관). */
let _newSeq={};
function createCase(packId,seed){
  let key=packId;
  if(!key) key=(APP.typeFilter!=='all'&&PACKS[APP.typeFilter])?APP.typeFilter:(APP.pack&&PACKS[APP.pack]?APP.pack:Object.keys(PACKS)[0]);
  const pack=PACKS[key]; if(!pack)return;
  /* seed 에 request/projectId 가 있으면 caseTemplate 으로 전달(옵셔널 — 무회귀) */
  const tseed=(seed&&(seed.request||seed.projectId))?{request:seed.request,projectId:seed.projectId}:null;
  const c=caseTemplate(pack,tseed);
  _newSeq[key]=(_newSeq[key]||0)+1;
  c.title=(seed&&seed.title)?seed.title:`${pack.workload&&pack.workload.type?pack.workload.type:pack.label} · 신규 #${_newSeq[key]}`;
  APP.cases.push(c); saveApp();
  openCase(c.id);
  toast(`새 ${pack.label} 업무 요청을 생성했습니다 — 실행 콘솔에 투입`);
}
/* ===== On-Ramp: 업무 설명 텍스트 → 기존 등록 유형(팩) 매칭 (코어 · 도메인 무관 휴리스틱) =====
   유형 인식 = 팩 메타(label·workload.type·purpose·outputs)와 입력 텍스트의 토큰 겹침 점수.
   임계 미만이면 '신규 유형'으로 보고 격상 파이프라인으로 유도한다. 팩별 키워드 사전 ✕(도메인 무관). */
function _tokens(s){ return String(s||'').toLowerCase().replace(/[^0-9a-z가-힣\s]/g,' ').split(/\s+/).filter(t=>t.length>=2); }
function packKeywords(pack){
  const wl=pack.workload||{};
  return _tokens([pack.label,wl.type,wl.purpose,(wl.outputs||[]).join(' ')].join(' '));
}
/* 입력 텍스트 ↔ 각 팩 점수(겹친 토큰 수 / 팩 키워드 수, 0~1). 최고 점수 팩과 점수를 반환. */
function matchPackByText(text){
  const inTok=new Set(_tokens(text)); if(!inTok.size)return {packId:null,score:0,ranked:[]};
  /* ★배포된 팩만 매칭 대상 — draft 유형은 운영 인식에서 제외(배포해야 On-Ramp 편입) */
  const ranked=deployedPackIds().map(id=>{
    const kw=packKeywords(PACKS[id]); if(!kw.length)return {id,score:0,hits:0};
    let hits=0; const seen=new Set();
    kw.forEach(k=>{ if(inTok.has(k)&&!seen.has(k)){ hits++; seen.add(k); } });
    return {id,score:hits/Math.max(4,new Set(kw).size),hits};
  }).sort((a,b)=>b.score-a.score);
  /* 매칭 인정 = 겹친 토큰 ≥2 AND 점수 ≥0.14 (일반 동사 1~2개 우연 겹침은 신규로 흘려보냄 → 격상 유도) */
  const top=ranked[0];
  return {packId:(top&&top.hits>=2&&top.score>=0.14)?top.id:null, score:top?top.score:0, ranked};
}
/* ＋새 업무 요청 = On-Ramp 입구.
   유형을 미리 고르게 하지 ✕ → '업무 설명'을 입력받아 유형을 인식한다(정형화 완화).
   ① 입력이 기존 등록 유형과 매칭 → 그 유형으로 케이스 생성·실행(운영 루프).
   ② 매칭 안 됨(신규/비정형) → "AAP 흐름 없음 → 격상" 안내 + 격상 파이프라인 자동 진입(구성 루프).
   사용자가 인식 결과를 바꿀 수 있게(매칭 후보 칩 + 항상 '새 유형으로 격상' 선택지) 제공. */
let _ncMenu=null;
function closeNewCase(){ if(_ncMenu){ _ncMenu.remove(); _ncMenu=null; document.removeEventListener('mousedown',_ncOff,true); } }
function _ncOff(ev){ if(_ncMenu&&!_ncMenu.contains(ev.target)&&!ev.target.closest('#newCaseBtn'))closeNewCase(); }
function promptNewCase(anchor){
  if(_ncMenu){ closeNewCase(); return; } /* 토글 */
  const menu=document.createElement('div'); menu.id='newCaseMenu'; menu.className='nc-menu nc-onramp';
  _ncMenu=menu;
  menu.innerHTML=`
    <div class="ncm-h">어떤 업무를 맡기시겠어요?</div>
    <div class="ncm-sub">업무를 설명하면 AAP가 유형을 인식합니다. 흐름이 있으면 바로 실행, 없으면 격상으로 안내합니다.</div>
    <textarea class="nc-ta" id="ncText" rows="3" placeholder="예) 신규 거래처 등록 심사를 맡기고 싶어요. 사업자·신용·제재 리스트를 확인하고 리스크를 판단해 승인 여부를 정해줘."></textarea>
    <div class="nc-reco" id="ncReco"></div>
    <div class="nc-acts" id="ncActs"></div>`;
  document.body.appendChild(menu);
  const r=(anchor||document.getElementById('newCaseBtn')).getBoundingClientRect();
  menu.style.top=(r.bottom+6)+'px'; menu.style.left=Math.max(12,Math.min(r.left,window.innerWidth-440))+'px';
  const ta=menu.querySelector('#ncText');
  ta.oninput=()=>renderNcReco(ta.value);
  renderNcReco('');
  setTimeout(()=>{ ta.focus(); document.addEventListener('mousedown',_ncOff,true); },0);
}
/* 입력에 따라 인식 결과 + 액션을 실시간 갱신 */
function renderNcReco(text){
  if(!_ncMenu)return;
  const reco=_ncMenu.querySelector('#ncReco'), acts=_ncMenu.querySelector('#ncActs');
  const m=matchPackByText(text);
  const matched=m.packId?PACKS[m.packId]:null;
  if(!text.trim()){
    reco.innerHTML=`<div class="nc-hint">${_ICO('search')} 업무를 입력하면 인식된 유형이 여기 표시됩니다.</div>`;
    acts.innerHTML=`<button class="cp-btn ghost sm" id="ncPromoteEmpty">${_ICO('rocket')}새 유형으로 격상하기</button>`;
    _ncMenu.querySelector('#ncPromoteEmpty').onclick=()=>ncGoPromote(text);
    return;
  }
  if(matched){
    reco.innerHTML=`<div class="nc-reco-h">인식된 유형</div>
      <button class="nc-reco-i" id="ncMatched"><span class="ty-badge ${typeTok(matched.id)}">${dcText(matched.label,'pack.label')}</span><span class="ncm-d">${(matched.workload&&matched.workload.type)||''}</span><span class="nc-reco-go">이 유형으로 실행 ${_ICO('chevron-right')}</span></button>
      <div class="nc-alt">다른 유형으로 보거나, 흐름이 없으면 ↓</div>`;
    acts.innerHTML=`<button class="cp-btn ghost sm" id="ncPromote">${_ICO('rocket')}새 유형으로 격상하기</button>`;
    _ncMenu.querySelector('#ncMatched').onclick=()=>{ const seed=ncSeed(text); closeNewCase(); createCase(matched.id,seed); };
    _ncMenu.querySelector('#ncPromote').onclick=()=>ncGoPromote(text);
  } else {
    reco.innerHTML=`<div class="nc-noflow">${_ICO('alert-triangle')}<div><b>이 업무는 아직 AAP 흐름이 없습니다.</b><span>신규·비정형 업무로 보입니다 — 분해→구성→HITL→격상으로 운영 가능한 흐름을 만듭니다.</span></div></div>`;
    acts.innerHTML=`<button class="cp-btn primary sm" id="ncPromote">${_ICO('rocket')}격상 파이프라인으로 진행${_ICO('arrow-right')}</button>`;
    _ncMenu.querySelector('#ncPromote').onclick=()=>ncGoPromote(text);
  }
}
/* 입력 텍스트 → 케이스 seed(제목·요청) */
function ncSeed(text){ const t=String(text||'').trim(); if(!t)return null;
  return { title:t.replace(/\s+/g,' ').slice(0,40), request:t.slice(0,160) }; }
/* 격상 진입 — 파이프라인(있으면)에 업무 설명 전달, 없으면 자동저작 오버레이 폴백 */
function ncGoPromote(text){
  const t=String(text||'').trim();
  closeNewCase();
  if(window.AAP_PIPELINE&&window.AAP_PIPELINE.open){ window.AAP_PIPELINE.open(t||undefined); }
  else if(window.AAP_AUTHORING_OPEN){ window.AAP_AUTHORING_OPEN(); }
  else { toast('격상 파이프라인을 불러올 수 없습니다'); }
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

/* ===== 실행 콘솔 렌더 (run 뷰 = 업무가 돌아가는 도메인 화면이 메인) =====
   유저 정정(되돌림): 실행 뷰 메인 = 'AAP 작동 구조'가 아니라 '그 업무가 실제로 돌아가는 화면'.
   per-도메인 surface(PACK.surface=ATS 보드 / surfaceSpec)를 #surfHead/#surfBody 에 렌더하고,
   단계 진행(RUN.phase/STATE.sel)에 따라 살아 움직이게 한다(surface 가 C=ctx 의 S/R 을 읽어 반영).
   HITL/결과/미리보기 오버레이(#cmodal)는 그대로. AAP 작동은 우측 얇은 근거 레일(renderRight). */
function renderConsole(){
  const C=ctx();
  const sh=document.getElementById('surfHead'); if(sh){ sh.innerHTML=surfHead(C); wireSurface(sh); }
  const sb=document.getElementById('surfBody'); if(sb){ sb.innerHTML=surfBase(C); wireSurface(sb); }
  renderCModal();
}
/* surface 내 산출물 보기 버튼(data-dlv)·다시(replay)·탭 전환(data-surftab) 배선 — 코어 책임(도메인 무관) */
function wireSurface(root){
  root.querySelectorAll('[data-dlv]').forEach(e=>e.onclick=()=>openPreview(e.dataset.dlv));
  const rp=root.querySelector('#replay'); if(rp)rp.onclick=()=>{ if(STATE.playing)stopPlay(); setSel(WORK[0].id); };
  /* surface 탭 클릭 탐색(도메인 무관) — 팩 surface 가 STATE.activeTab 을 읽어 본문 렌더.
     탭 목록·라벨·본문은 팩 책임, 코어는 활성 탭 기록 + 재렌더만(자동 진행과 독립). */
  root.querySelectorAll('[data-surftab]').forEach(e=>e.onclick=()=>{ STATE.activeTab=e.dataset.surftab; renderConsole(); });
  wirePackHooks(root);
}
/* 팩이 선언한 surface 인터랙션 배선(도메인 무관 메커니즘) — 후보 카드 클릭·정렬·결정 등.
   rerender(opts?) 콜백 = 콘솔/모달 재렌더 + 선택적 영속/토스트/trace. 채용 전용 분기 0줄. */
function wirePackHooks(root){
  const hk=PACK.surfaceHooks; if(!hk||!hk.wire)return;
  const rerender=(opts)=>{
    opts=opts||{};
    if(opts.trace){ STATE.trace.push({st:W(STATE.sel).label, t:opts.trace.t, L:opts.trace.L||'L7', k:opts.trace.k||''}); }
    renderConsole(); renderRight();
    if(opts.persist)afterStateChange();
    if(opts.toast)toast(opts.toast);
  };
  hk.wire(root, STATE, rerender);
}
function currentCM(){
  if(STATE.previewK)return 'preview';
  /* 팩이 도메인 인터랙션 모달(예: 후보 상세)을 우선 표시하려면 hook 으로 kind 반환(도메인 무관) */
  const hk=PACK.surfaceHooks;
  if(hk&&hk.currentCM){ const k=hk.currentCM(STATE); if(k)return k; }
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
  wirePackHooks(cm);
  const bk=cm.querySelector('[data-back]');if(bk)bk.onclick=()=>{STATE.previewK=null;renderConsole();};
  const yes=cm.querySelector('[data-yes]');if(yes)yes.onclick=()=>decide('yes');
  const no=cm.querySelector('[data-no]');if(no)no.onclick=()=>decide('no');
  cm.querySelectorAll('[data-close]').forEach(e=>e.onclick=()=>{STATE.baseOnly=true;renderConsole();});
  cm.querySelectorAll('[data-time]').forEach(e=>e.onclick=()=>{STATE.pickedTime=TIMES[+e.dataset.time].t;renderConsole();});
  const ms=cm.querySelector('[data-mstart]');if(ms)ms.onclick=meetingStart;
  const me=cm.querySelector('[data-mend]');if(me)me.onclick=meetingEnd;
}
function openPreview(k){STATE.previewK=k;renderConsole();}

/* ===== 우측 얇은 'AAP 작동 근거' 레일 (코어 · WORK.ops 데이터 기반) =====
   유저 정정: 8계층 op 그래프를 메인에서 강등. 단계별로 어떤 구성요소(comp)가
   어떤 근거(feed)로 무엇을(out) 했는지 1~2줄로 축약. ▸펼침 = 관여 계층(L)·micro·detail.
   '코어 실행엔진 전시' ✕ → '그런 근거로 그렇게 돌아갔다'. 데이터는 w.ops(도메인 무관).
   구성요소 타입(5타입 색)은 comp 문자열에 매핑 휴리스틱(코어 토큰) — 도메인 분기 없음. */
/* op.comp 라벨 → 5타입 키(A/M/S/C/P) 추정(근거 칩 색). 토큰 기반·도메인 무관 휴리스틱. */
function evidType(o){
  const t=(o.comp||'')+' '+(o.badge||'');
  if(/정책|Policy|게이트|HITL|차단|승인|통제|마스킹|DLP|PII/.test(t))return 'P';
  if(/Connector|커넥터|연결|수집|연동/.test(t))return 'C';
  if(/솔루션|ATS|HRIS|KMS|그룹웨어|문서함|스토리지|DB/.test(t))return 'S';
  if(/Module|모듈|OCR|정규화|검증|평가|Antbot|AI:ON-U|품질/.test(t))return 'M';
  return 'A'; /* 기본 = Agent(전문 작업·코어 실행) */
}
const _TYKO={A:'Agent',M:'Module',S:'기존 솔루션',C:'Connector',P:'Policy'};
/* 결정론 Action(Module·Connector·Policy·기존솔루션 = 규칙/온톨로지 편집) vs 비결정론 LLM(Agent = 추론).
   op.kind 로 팩이 명시 override 가능. KEY MESSAGE: LLM은 온톨로지 통해 통제된 reasoning, 결정론은 규칙. */
function blockKind(o,tk){ if(o&&o.kind)return o.kind==='llm'?'llm':'det'; return tk==='A'?'llm':'det'; }
function renderRight(){
  const w=W(STATE.sel),gs=groupsOf(w);let h='';
  const lb=PACK.stepLoop?`<div class="loopbadge">추론 루프 · ${PACK.stepLoop[w.id]||'—'}</div>`:'';
  const flow=document.getElementById('flow'),exp=document.getElementById('explain');
  if(!flow)return;
  if(w.meeting && STATE.meetPhase==='await_start'){
    flow.innerHTML=lb+`<div class="evid-row wait">회의 시작 신호 대기 — 사람이 실시간 Agent 가동 시점을 통제합니다 (HITL ②)</div>`;
    if(exp)exp.innerHTML=w.explain;return;
  }
  gs.forEach((g,gi)=>{
    const ops=w.ops.filter(o=>o.g===g);
    const stt=gi<RUN.reveal?'done':(gi===RUN.reveal&&RUN.phase==='working'?'doing':'wait');
    const par=ops.length>1;
    ops.forEach((o,oi)=>{
      const tk=evidType(o);
      const key=`${w.id}-${gi}-${oi}`;const open=STATE.opOpen.has(key);
      const badge=o.badge?`<span class="ev-badge">${o.badge}</span>`:'';
      const parTag=(par&&oi===0)?`<span class="ev-par">∥ 병렬</span>`:'';
      /* 펼침 상세 = 관여 계층 + micro + detail(산출물 표) */
      const micro=o.micro?`<div class="ev-micro">${o.micro.map(m=>`<span class="mc">${m}</span>`).join('')}</div>`:'';
      const det=(o.detail||'');
      const canOpen=(stt==='done')&&(o.detail||o.micro);
      const more=canOpen?`<button class="ev-more" data-op="${key}">${_ICO(open?'chevron-down':'chevron-right')}${open?'근거 접기':'근거 펼침'}</button>${open?`<div class="ev-detail"><div class="ev-lay">관여 계층 · <b>${o.L} ${LK[o.L]}</b></div>${micro}${det}</div>`:''}`:'';
      const val=stt==='wait'?'<span class="ev-na">대기</span>':`<b>${o.out}</b>`;
      h+=`<div class="evid-row ${stt}">
        <span class="ev-dot ty${tk}"></span>
        <div class="ev-body">
          <div class="ev-h"><span class="ev-comp ty${tk} ev-link" data-asset="${dcText(o.comp,'op.comp')}" data-atk="${tk}" data-tip="자산 카탈로그에서 이 구성요소 보기">${dcText(o.comp,'op.comp')}</span><span class="ev-tag ty${tk}">${_TYKO[tk]}</span><span class="ev-kind ${blockKind(o,tk)}" data-tip="${blockKind(o,tk)==='llm'?'비결정론 — LLM 추론(온톨로지 통해 통제)':'결정론 — 규칙·온톨로지 편집(재현 가능)'}">${blockKind(o,tk)==='llm'?'LLM':'결정론'}</span>${badge}${parTag}</div>
          <div class="ev-line">${o.feed} → ${val}</div>
          ${more}
        </div></div>`;
    });
  });
  let casm='';
  if(w.id==='compose'){const lit=RUN.phase==='done'||RUN.phase==='await'||RUN.reveal>2;
    casm=`<div class="casm"><div class="casm-h">AAP가 조합한 구성요소</div>${COMPOSE.map(c=>`<span class="ct2 ${c.cls} ${lit?'on':''} ev-link" data-asset="${dcText(c.n,'compose.n')}" data-atk="${c._tk||dcTypeKey(c.cls,'compose.cls')}" data-tip="자산 카탈로그에서 보기">${c.t} ${c.n}</span>`).join('')}</div>`;}
  flow.innerHTML=lb+h+casm;
  if(exp)exp.innerHTML=w.explain;
  /* P5 케이스 튜닝 패널 갱신(케이스 맥락에서만 wfeditor 가 렌더 — 도메인 무관 위임) */
  if(window.AAP_WFEDITOR&&window.AAP_WFEDITOR.renderCaseTuner)window.AAP_WFEDITOR.renderCaseTuner(PACK,STATE.sel);
  flow.querySelectorAll('[data-op]').forEach(e=>e.onclick=()=>{const k=e.dataset.op;STATE.opOpen.has(k)?STATE.opOpen.delete(k):STATE.opOpen.add(k);renderRight();});
  /* Run→자산 양방향: 근거 레일 구성요소·조합 칩 클릭 → 자산 뷰 해당 항목 강조 */
  flow.querySelectorAll('[data-asset]').forEach(e=>e.onclick=()=>gotoAsset(e.dataset.asset,e.dataset.atk));
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
function afterStateChange(){ persistToCase(); const navc=document.getElementById('navCnt'); if(navc){const w=APP.cases.filter(c=>c.packId===APP.pack&&isDeployed(c.packId)&&caseStatus(c)==='wait').length;navc.textContent=w?String(w):'';} renderRunAction(); }
function runStep(){
  clearRun();STATE.previewK=null;STATE.baseOnly=false;STATE.opOpen.clear();clearPackTransient();const w=W(STATE.sel);
  if(w.meeting){STATE.meetPhase='await_start';RUN.phase='await';RUN.reveal=0;renderConsole();renderRight();}
  else{STATE.meetPhase='idle';startWorking();}
}
function meetingStart(){STATE.meetPhase='in_meeting';startWorking();}
function meetingEnd(){STATE.meetPhase='done';RUN.phase='done';renderConsole();renderRight();afterStateChange();if(STATE.playing)RUN.playTimer=setTimeout(playNext,1700);}
function decide(v){
  const w=W(STATE.sel);STATE.decisions[w.id]=v;RUN.phase='done';
  /* 팩이 HITL 결정을 도메인 surface 상태로 번역(도메인 무관 hook) — 예: 오퍼 승인→보드 offer 배치 */
  if(PACK.surfaceHooks&&PACK.surfaceHooks.decideHook){ try{PACK.surfaceHooks.decideHook(STATE,v,w.id);}catch(e){} }
  STATE.trace.push({st:w.label,t:'담당자 결정 · '+(v==='yes'?'승인':(w.id==='approve'?'외부 제외':'수정 요청')),L:'L7',k:'HITL'});
  renderConsole();renderRight();afterStateChange();
  toast(v==='yes'?'승인 · 다음 단계로 진행합니다':(w.id==='approve'?'외부 고객 제외하고 진행':'수정 요청'));
  if(STATE.playing)RUN.playTimer=setTimeout(playNext,1500);
}
function setSel(id){STATE.sel=id;renderSeq();runStep();afterStateChange();renderRunAction();}
/* ===== 요청 트리거 자동 운영 (Phase 1) — startPlay 의 자동 진행 로직 재사용, 단 '비파괴' =====
   startPlay = 시연/Run(처음부터 재생 · 결정 초기화). startRun = 운영 진입(현재 지점부터 자동 진행,
   누적된 결정·진행 보존). 둘 다 STATE.playing=true 로 revealOps/decide/meetingEnd 의 playNext 자동
   진행을 타고, HITL(await)·회의(meeting)에서만 멈춘다(사람 결정 필요). 도메인 무관. */
function startRun(){
  const c=activeCase(); if(!c)return;
  if(STATE.view!=='run')setView('run');
  STATE.playing=true; setRunBtn(true);
  const w=W(STATE.sel);
  /* 미진입(요청 접수만) = 첫 단계부터 자동 진행. 이미 진행 중이면 현재 지점에서 '이어서'.
     현재 단계가 HITL/회의 await 로 멈춰 있으면 다음 단계로 넘기지 않고 그 게이트 모달을 띄움(사람 결정 대기). */
  if(RUN.phase==='await'){ renderConsole(); renderRight(); renderRunAction(); return; }
  /* 그 외(완료/대기) = 현재 단계를 (재)실행해 자동 진행 시작. setSel 로 runStep 트리거. */
  setSel(STATE.sel);
}
function startPlay(){
  if(!activeCase()){ const cs=APP.cases.filter(c=>c.packId===APP.pack); if(cs.length){openCase(cs[0].id);} else {createCase();} }
  if(STATE.view!=='run')setView('run');
  STATE.playing=true;STATE.decisions={};STATE.pickedTime=TIMES[0].t;STATE.trace=[];STATE.traced=new Set();
  const c=activeCase();if(c)c.done=false;
  setRunBtn(true);setSel(WORK[0].id);}
function stopPlay(){STATE.playing=false;clearTimeout(RUN.playTimer);setRunBtn(false);renderRunAction();}
/* 실행 진입점(runtop) — 미진입=▶ 실행 / 진행중·정지=이어서 진행 / 자동진행중=처리 중(정지 가능) / 완료=완료.
   요청 트리거 자동 운영의 명확한 입구. 자동저작/안정 ID 무영향(런타임 전용 요소). */
function renderRunAction(){
  const el=document.getElementById('runAction'); if(!el)return;
  const c=activeCase();
  if(STATE.view!=='run'||!c){ el.innerHTML=''; el.hidden=true; return; }
  el.hidden=false;
  if(STATE.playing && RUN.phase==='working'){
    el.innerHTML=`<button class="run-act working" id="runActBtn"><span class="spin sm"></span>처리 중…</button>`;
  } else if(c.done){
    el.innerHTML=`<button class="run-act done" id="runActBtn" disabled>${_ICO('check')}처리 완료</button>`;
  } else if(RUN.phase==='await'){
    el.innerHTML=`<button class="run-act await" id="runActBtn">${_ICO('user-check')}확인이 필요합니다</button>`;
  } else {
    const started=caseStarted(c);
    el.innerHTML=`<button class="run-act go" id="runActBtn">${_ICO('play')}${started?'이어서 진행':'실행 / 처리 시작'}</button>`;
  }
  const b=el.querySelector('#runActBtn');
  if(b&&!b.disabled)b.onclick=()=>{
    if(STATE.playing && RUN.phase==='working'){ stopPlay(); return; }   /* 처리 중 클릭 = 정지(탐색 전환) */
    if(RUN.phase==='await'){ STATE.playing=true; setRunBtn(true); renderRunAction(); return; } /* 게이트로 시선 유도 */
    startRun();
  };
}
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
      const dep=isDeployed(k);  /* ★배포 생애주기 — deployed=운영 편입 / draft=스튜디오 한정 */
      return `<button class="cat-card ${on?'on':''} ${typeTok(k)} ${dep?'':'is-draft'}" data-cat="${k}">
        <div class="cat-h"><span class="ty-badge ${typeTok(k)}">${dcText(p.label,'pack.label')}</span>${p.authored?'<span class="cat-auto">자동저작</span>':''}<span class="cat-dep ${dep?'on':'off'}" data-tip="${dep?'배포됨 — 인박스·On-Ramp 운영에 편입':'미배포(draft) — 스튜디오에서만 보입니다. 배포해야 운영 편입'}">${dep?'배포됨':'미배포'}</span></div>
        <div class="cat-type">${(p.workload&&p.workload.type)||p.label}</div>
        <div class="cat-stats"><span>단계 <b>${steps}</b></span><span>구성요소 <b>${comps}</b></span><span>HITL <b>${gates}</b></span><span>인박스 <b>${seeds}</b>건</span></div>
        <div class="cat-depbar"><span class="cat-dep-act ${dep?'undeploy':'deploy'}" data-deploy="${k}">${_ICO(dep?'rotate-ccw':'rocket')}${dep?'배포 취소':'배포'}</span></div>
      </button>`;
    }).join('');
    cat.querySelectorAll('[data-cat]').forEach(e=>e.onclick=(ev)=>{ if(ev.target.closest('[data-deploy]'))return; APP.catSel=e.dataset.cat;saveApp();renderDesign();});
    /* 배포/배포취소 버튼 — setPackStatus 후 카탈로그·인박스 재렌더(운영 편입 토글) */
    cat.querySelectorAll('[data-deploy]').forEach(e=>e.onclick=(ev)=>{ ev.stopPropagation();
      const id=e.dataset.deploy, next=isDeployed(id)?'draft':'deployed';
      setPackStatus(id,next);
      toast(next==='deployed'?`${dcText(typeLabel(id),'pack.label')} 유형을 배포했습니다 — 인박스·On-Ramp에 편입`:`${dcText(typeLabel(id),'pack.label')} 유형 배포를 취소했습니다 — 운영에서 제외(draft)`);
      renderDesign(); if(document.getElementById('inboxList'))renderInbox();
    });
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
  /* 워크플로우 편집기(경량) — 선택된 팩의 노드 그래프 시각화 + 단계별 5타입/HITL 편집 */
  if(window.AAP_WFEDITOR)window.AAP_WFEDITOR.renderEditor(P);
  renderArchCoherence(P);
  renderOntology(P);
}
/* 온톨로지(L4) 섹션 — 객체·관계·Action(자동/사람확인). 팩이 ontology 없으면 generic 폴백(무회귀). */
function renderOntology(P){
  const el=document.getElementById('ontologyBox'); if(!el)return;
  const o=P&&P.ontology;
  if(!o){ el.innerHTML=`<div class="onto-col full"><div class="onto-k">온톨로지</div><div class="onto-rel">이 유형은 아직 명시 온톨로지가 없습니다 — 업무 이해의 산출물·확인 지점이 의미 레이어로 작동합니다.</div></div>`; return; }
  const objs=(o.objects||[]).map(x=>`<div class="onto-obj"><b>${dcText(x.n,'onto.obj')}</b>${(x.a||[]).map(a=>`<span>${dcText(a,'onto.attr')}</span>`).join('')}</div>`).join('');
  const rels=(o.relations||[]).map(r=>`<div class="onto-rel">${r.t}</div>`).join('');
  const acts=(o.actions||[]).map(a=>{const m=a.mode==='confirm'?'confirm':'auto';return `<div class="onto-act"><span class="oa-n">${dcText(a.n,'onto.act')}</span><span class="oa-m ${m}">${m==='confirm'?'사람 확인':'자동'}</span></div>`;}).join('');
  el.innerHTML=`<div class="onto-col"><div class="onto-k">객체 (Object)</div>${objs}</div>`+
    `<div class="onto-col"><div class="onto-k">관계 (Relation)</div>${rels}</div>`+
    `<div class="onto-col full"><div class="onto-k">Action · 객체 편집 (자동 / 사람 확인)</div>${acts}</div>`;
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
/* ===== 거버넌스·정책 뷰 (관리 · govStrip 만) ===== */
function renderGovern(){
  const gs=document.getElementById('govStrip'); if(gs)gs.innerHTML=PACK.govern.map(c=>`<div class="gov-cell"><div class="gk">${c.k}</div><div class="gv">${c.v}</div></div>`).join('');
}
/* ===== 로그·트레이스 뷰 (관리 · Run Trace · Decision Log) ===== */
function renderLogs(){ renderTrace(); }
/* ===== 자산 뷰 (스튜디오 · 5타입 레지스트리 · 전역 union 카탈로그) =====
   활성 팩 한정 ✕ → 전 팩(PACKS)의 components 를 합쳐 dedup 한 전역 자산 카탈로그.
   같은 자산(타입+이름)은 1개로 합치고 '쓰는 도메인 팩' 목록(usedBy)을 표기.
   스코프 칩(전역/유형/케이스) × 타입 필터(A/M/S/C/P). 코어 책임 · 도메인 무관(일반 union/dedup). */
const _ASSET_T={tyA:'Agent',tyM:'Module',tyS:'기존 솔루션',tyC:'Connector',tyP:'Policy'};
const _ASSET_ORDER=['tyA','tyM','tyS','tyC','tyP'];
let _assetFilter='all';        /* 타입 필터: all | tyA..tyP */
let _assetScope='global';      /* 스코프: global(전 팩) | pack:<id> | case(현재 열린 케이스 팩) */
let _assetHL=null;             /* Run→자산 양방향 하이라이트 대상 키(타입+이름) */
/* dedup 키 = 정규화 타입(A/M/S/C/P) + 정규화 이름(소문자·공백/괄호주석 제거).
   raw 이름은 표시용으로 첫 등장값을 유지. */
function _assetNorm(s){ return String(s||'').toLowerCase().replace(/\s+/g,'').replace(/\([^)]*\)/g,'').replace(/[·.,]/g,''); }
function assetKey(a){ const tk=dcTypeKey(a.ty||a.type,'asset.ty'); return tk+'|'+_assetNorm(a.name); }
/* 전 팩 union + dedup → [{key,tk,ty,type,ic,name,L,desc,when,data,how,asset,usedBy:[packId]}] */
function buildAssetCatalog(){
  const map=new Map();
  Object.keys(PACKS).forEach(pid=>{ const p=normalizePack(PACKS[pid]);
    (p.components||[]).forEach(a=>{ const k=assetKey(a);
      let e=map.get(k);
      if(!e){ const tk=dcTypeKey(a.ty||a.type,'asset.ty');
        e={key:k,tk,ty:'ty'+tk,type:a.type||_TYKO[tk],ic:a.ic,name:a.name,L:a.L,desc:a.desc,when:a.when,data:a.data,how:a.how,asset:a.asset,usedBy:[]};
        map.set(k,e); }
      if(!e.usedBy.includes(pid))e.usedBy.push(pid);
    });
  });
  return [...map.values()];
}
/* 스코프에 따라 카탈로그 필터 */
function assetCatalogScoped(){
  const all=buildAssetCatalog();
  if(_assetScope==='global')return all;
  if(_assetScope.startsWith('pack:')){ const pid=_assetScope.slice(5); return all.filter(a=>a.usedBy.includes(pid)); }
  if(_assetScope==='case'){ const c=activeCase(); return c?all.filter(a=>a.usedBy.includes(c.packId)):all; }
  return all;
}
function renderAssets(){
  const reg=document.getElementById('reg'); if(!reg)return;
  /* 스코프 칩(전역 / 팩별 / 현재 케이스) */
  const sbar=document.getElementById('assetScope');
  if(sbar){
    const c=activeCase();
    let sh=`<button class="asset-chip ${_assetScope==='global'?'on':''}" data-as="global">전역 · 전 팩</button>`;
    Object.keys(PACKS).forEach(pid=>{ sh+=`<button class="asset-chip ${typeTok(pid)} ${_assetScope==='pack:'+pid?'on':''}" data-as="pack:${pid}"><span class="ac-dot"></span>${dcText(typeLabel(pid),'pack.label')}</button>`; });
    if(c)sh+=`<button class="asset-chip ${_assetScope==='case'?'on':''}" data-as="case">현재 케이스 · ${dcText(typeLabel(c.packId),'pack.label')}</button>`;
    else if(_assetScope==='case')_assetScope='global';
    sbar.innerHTML=sh;
    sbar.querySelectorAll('[data-as]').forEach(e=>e.onclick=()=>{_assetScope=e.dataset.as;renderAssets();});
  }
  const scoped=assetCatalogScoped();
  /* 타입 필터 칩 */
  const fbar=document.getElementById('assetFilter');
  if(fbar){
    const cnt=t=>scoped.filter(a=>a.ty===t).length;
    const present=_ASSET_ORDER.filter(t=>cnt(t));
    if(_assetFilter!=='all' && !present.includes(_assetFilter))_assetFilter='all';
    let fh=`<button class="asset-chip ${_assetFilter==='all'?'on':''}" data-af="all">전체<span class="ac-n">${scoped.length}</span></button>`;
    fh+=present.map(t=>`<button class="asset-chip ${t} ${_assetFilter===t?'on':''}" data-af="${t}"><span class="ac-dot"></span>${_ASSET_T[t]}<span class="ac-n">${cnt(t)}</span></button>`).join('');
    fbar.innerHTML=fh;
    fbar.querySelectorAll('[data-af]').forEach(e=>e.onclick=()=>{_assetFilter=e.dataset.af;renderAssets();});
  }
  const shown=_assetFilter==='all'?scoped:scoped.filter(a=>a.ty===_assetFilter);
  reg.innerHTML=shown.map(a=>{
    const used=a.usedBy.map(pid=>`<span class="ag-use ${typeTok(pid)}"><span class="ac-dot"></span>${dcText(typeLabel(pid),'pack.label')}</span>`).join('');
    const hl=_assetHL&&_assetHL===a.key?' hl':'';
    return `<div class="ag ${a.asset?'asset':''}${hl}" data-akey="${a.key}"><div class="ag-h"><div class="ag-ic">${a.ic}</div><div><span class="ag-type ${a.ty}">${a.type}</span><div class="ag-name">${a.name}</div></div><span class="ag-lay">${a.L} ${LK[a.L]}</span>${a.asset?'<span class="ag-kt">kt ds</span>':''}</div><div class="ag-desc">${a.desc}</div><div class="ag-meta"><div class="ag-m when"><div class="ag-mk">${_ICO('compass')}언제 쓰나</div><div class="ag-mv">${a.when}</div></div><div class="ag-m data"><div class="ag-mk">${_ICO('folder')}사용 데이터</div><div class="ag-mv">${a.data}</div></div><div class="ag-m how"><div class="ag-mk">${_ICO('settings')}수행 방식</div><div class="ag-mv">${a.how}</div></div></div><div class="ag-used"><span class="agu-k">${_ICO('workflow')}쓰는 도메인 팩</span><span class="agu-v">${used||'—'}</span></div></div>`;
  }).join('');
  /* Run→자산 하이라이트로 진입했으면 스크롤 + 1회성 강조 후 해제 */
  if(_assetHL){ const t=reg.querySelector('.ag.hl'); if(t){ t.scrollIntoView({block:'center',behavior:'smooth'}); } }
}
/* Run 근거 레일/구성요소 → 자산 뷰로 점프(해당 자산 강조). 자산명으로 카탈로그 키 역추적(타입 무관 이름 매칭). */
function gotoAsset(name,tk){
  const cat=buildAssetCatalog(); const nn=_assetNorm(name);
  let hit=cat.find(a=>a.tk===tk&&_assetNorm(a.name)===nn) || cat.find(a=>_assetNorm(a.name)===nn)
        || cat.find(a=>a.tk===tk&&(_assetNorm(a.name).includes(nn)||nn.includes(_assetNorm(a.name))));
  _assetScope='global';
  if(!hit){ /* 이름 매칭 실패(근거 레일의 일반 역량 라벨) → 같은 타입으로 필터해 해당 유형 자산군으로 안내 */
    _assetHL=null; _assetFilter=tk&&_ASSET_T['ty'+tk]?('ty'+tk):'all';
    toast('해당 유형 자산으로 이동합니다');
  } else { _assetHL=hit.key; _assetFilter='all'; }
  setView('assets');
}

/* B-2: Run Trace · Decision Log (관리 뷰 · 전역) — 전 케이스(APP.cases[].trace) 집계.
   trace 는 이미 케이스별 영속(persistToCase) → 전역 로그는 새 저장소 없이 집계만(도메인 무관).
   상단 전역 KPI(런/단계 기록·HITL·차단·케이스·유형) + 케이스 드릴다운(선택 케이스 trace, 전체=통합 타임라인). */
let _logCase='all';   /* 로그 드릴다운: all(통합) | <caseId> */
/* trace 항목 분류 — HITL/차단(통제)/학습 집계 키(k·t 기반·도메인 무관) */
function _trIsHITL(e){ return e.k==='HITL'; }
function _trIsBlock(e){ return e.k==='통제' || /차단|보류|제외|거부/.test(e.t||''); }
function renderTrace(){
  const el=document.getElementById('traceLog');if(!el)return;
  /* 활성 케이스의 in-flight trace 를 그 케이스에 합산(아직 persist 전일 수 있음) */
  const ac=activeCase();
  const cases=APP.cases.filter(c=>PACKS[c.packId]).map(c=>{
    const tr=(ac&&c.id===ac.id)?STATE.trace:(Array.isArray(c.trace)?c.trace:[]);
    return {c, tr};
  });
  /* 전역 KPI 집계 */
  let runs=0,hitl=0,block=0,steps=0; const typeSet=new Set();
  cases.forEach(({c,tr})=>{ if(tr.length){runs++;typeSet.add(c.packId);} steps+=tr.length; tr.forEach(e=>{ if(_trIsHITL(e))hitl++; if(_trIsBlock(e))block++; }); });
  const kpi=document.getElementById('logKpi');
  if(kpi){
    kpi.innerHTML=[
      ['실행된 케이스',runs,'기록이 있는 케이스 수'],
      ['누적 기록',steps,'전 케이스 trace 항목 합'],
      ['HITL 판단',hitl,'담당자 승인·확인 지점'],
      ['차단·보류',block,'정책·거버넌스가 멈춘 지점'],
      ['업무 유형',typeSet.size,'기록이 있는 도메인 팩 수'],
    ].map(([k,v,t])=>`<div class="log-kpi" data-tip="${t}"><div class="lk-v">${v}</div><div class="lk-k">${k}</div></div>`).join('');
  }
  /* 케이스 드릴다운 필터(통합 + 기록 있는 케이스) */
  const fbar=document.getElementById('logCaseFilter');
  const withTrace=cases.filter(x=>x.tr.length);
  if(fbar){
    if(_logCase!=='all' && !withTrace.some(x=>x.c.id===_logCase))_logCase='all';
    let fh=`<button class="asset-chip ${_logCase==='all'?'on':''}" data-lc="all">통합 타임라인<span class="ac-n">${steps}</span></button>`;
    fh+=withTrace.map(({c,tr})=>`<button class="asset-chip ${typeTok(c.packId)} ${_logCase===c.id?'on':''}" data-lc="${c.id}"><span class="ac-dot"></span>${dcText(c.title,'case.title')}<span class="ac-n">${tr.length}</span></button>`).join('');
    fbar.innerHTML=fh;
    fbar.querySelectorAll('[data-lc]').forEach(e=>e.onclick=()=>{_logCase=e.dataset.lc;renderTrace();});
  }
  /* 타임라인 — 통합이면 전 케이스(케이스 라벨 포함), 특정 케이스면 그것만 */
  const rows=[];
  cases.forEach(({c,tr})=>{ if(_logCase!=='all'&&c.id!==_logCase)return;
    tr.forEach(e=>rows.push({c,e})); });
  if(!rows.length){el.innerHTML='<div class="tr-empty">아직 기록 없음 — Run 을 실행하거나 단계를 진행하면 자율 판단·HITL·반영이 전 케이스에 걸쳐 여기 누적됩니다(감사·재현 가능).</div>';return;}
  el.innerHTML=rows.map(({c,e})=>`<div class="tr-line">${_logCase==='all'?`<span class="tr-case ${typeTok(c.packId)}">${dcText(c.title,'case.title')}</span>`:''}<span class="tr-st">${e.st}</span><span class="tr-k ${e.k}">${e.k}</span><span class="tr-t">${e.t}</span><span class="tr-L">${e.L}</span></div>`).join('');
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
    /* ★신규 register(자동저작·격상·On-Ramp) = draft 기본 — 배포해야 인박스·운영 편입.
       이미 상태가 기록된 팩(재등록)은 보존. 시드 ID는 deployed 폴백(packStatus). */
    const _ps=loadPackStatus(); if(_ps[pack.id]!=='draft'&&_ps[pack.id]!=='deployed'&&!SEED_PACK_IDS.includes(pack.id))setPackStatus(pack.id,'draft');
    if(document.getElementById('catGrid')&&(STATE.view==='studio'||STATE.view==='domain'||STATE.view==='workflow'))renderDesign();
    if(STATE.view==='assets')renderAssets();
    if(STATE.view==='inbox')renderInbox();},
  load:(id)=>{if(!PACKS[id])return;setPackRefs(id);seedPack(id);const cs=APP.cases.filter(c=>c.packId===id);if(cs.length)openCase(cs[0].id);else createCase(id);},
  has:(id)=>!!PACKS[id],
  go:(id)=>{if(activeCase()&&W(id)){STATE.sel=id;renderSeq();runStep();}},
  /* 워크플로우 편집기(wfeditor.js)용 — override 저장·조회·해제(영속) + 즉시 반영 */
  setPackOverride:(packId,ov)=>{ loadOverrides()[packId]=ov; saveOverrides(); reapplyOverride(packId); },
  getPackOverride:(packId)=>loadOverrides()[packId]||null,
  hasPackOverride:(packId)=>!!loadOverrides()[packId],
  clearPackOverride:(packId)=>{ delete loadOverrides()[packId]; saveOverrides(); reapplyOverride(packId); if(window.AAP_CORE)toast('기본값으로 복원했습니다'); },
  /* ── P5 케이스 단위 튜닝 API (★격리: case.overrides 만 수정, packOverrides 미터치) ──
     wfeditor 가 케이스 맥락(run 뷰·활성 케이스)에서 편집할 때 호출. setPackOverride 와 시그니처 동형. */
  setCaseOverride:(ov)=>{ const c=activeCase(); if(!c)return;
    c.overrides=ov; saveApp();                       /* 케이스 객체 안에 영속(공유 팩 저장소 분리) */
    if(PACKS[c.packId]){ applyCaseOverlay(PACKS[c.packId], caseOverridesOf(c)); _caseOvActive=caseOverridesOf(c)?c.packId:null; if(c.packId===APP.pack)setPackRefs(c.packId); }
    if(STATE.view==='run')restoreStep();             /* 실행 뷰 근거 레일·8계층·surface 갱신 */
  },
  getCaseOverride:()=>{ const c=activeCase(); return c?(c.overrides||null):null; },
  hasCaseOverride:()=>hasCaseOverlay(activeCase()),
  /* 케이스 튜닝 = 케이스 맥락(run 뷰 + 활성 케이스)에서만 가능. 스튜디오는 팩 레벨. */
  isCaseContext:()=>STATE.view==='run'&&!!activeCase(),
  activeCasePackId:()=>{ const c=activeCase(); return c?c.packId:null; },
  /* 케이스 델타 비우기('이 케이스만 기본값으로 복원') — packOverrides 무영향. */
  clearCaseOverride:()=>{ const c=activeCase(); if(!c)return;
    delete c.overrides; saveApp();
    if(PACKS[c.packId]){ removeCaseOverlay(PACKS[c.packId]); _caseOvActive=null; if(c.packId===APP.pack)setPackRefs(c.packId); }
    if(STATE.view==='run')restoreStep();
    toast('이 케이스를 유형 기본값으로 되돌렸습니다');
  },
  /* ★정의 승격 — 명시적 액션일 때만 케이스 델타를 packOverrides(공유 팩 기본)로 병합. 병합 후 케이스 델타 비움. */
  promoteCaseOverride:()=>{ const c=activeCase(); const cov=caseOverridesOf(c); if(!c||!cov){ toast('이 케이스에 적용된 변경이 없습니다'); return; }
    /* 케이스 델타 = packOverrides 와 동형(steps) → 그대로 팩 기본으로 승격(setPackOverride 재사용) */
    const merged={ steps:{ ...((loadOverrides()[c.packId]||{}).steps||{}), ...cov.steps } };
    loadOverrides()[c.packId]=merged; saveOverrides();
    delete c.overrides; saveApp();                   /* 승격 후 케이스 델타 비움(이제 팩 기본이 됨) */
    _caseOvActive=null;
    reapplyOverride(c.packId);                        /* 팩 레벨 재적용(케이스 델타 0 상태) + 영향 뷰 재렌더 */
    if(STATE.view==='run')restoreStep();
    toast('이 변경을 유형(팩) 기본으로 승격했습니다 — 같은 유형의 모든 케이스에 적용됩니다');
  },
  /* 워크플로우 빌더(wfeditor.js) 블록 팔레트용 — 전 팩 union·dedup 한 5타입 자산 카탈로그(도메인 무관).
     [{key,tk,ty,type,ic,name,L,desc,usedBy}]. 코어가 이미 buildAssetCatalog 로 dedup·정규화. */
  getAssetCatalog:()=>{ try{ return buildAssetCatalog(); }catch(e){ return []; } },
  /* 5타입 메타(라벨·계층) — 빌더 팔레트가 임의 hex 없이 토큰만 쓰게 */
  typeKeyOf:(v)=>dcTypeKey(v,'wf.type'),
  toast:(m)=>toast(m),
};

/* ===== wiring ===== */
document.querySelectorAll('#gnav .gnav-i').forEach(b=>b.onclick=()=>setView(b.dataset.view));
const _runb=document.getElementById('runBtn');if(_runb)_runb.onclick=()=>STATE.playing?stopPlay():startPlay();
document.getElementById('devToggle').onchange=e=>document.body.classList.toggle('dev-on',e.target.checked);
const _nc=document.getElementById('newCaseBtn');if(_nc)_nc.onclick=()=>promptNewCase(_nc);
/* 스튜디오 '＋ 신규 격상' → 격상 파이프라인(없으면 자동저작 오버레이) — 상단 '업무 격상' 버튼 흡수 */
const _np=document.getElementById('newPromoteBtn');if(_np)_np.onclick=()=>{ if(window.AAP_PIPELINE)window.AAP_PIPELINE.open(); else if(window.AAP_AUTHORING_OPEN)window.AAP_AUTHORING_OPEN(); };
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
  /* ★배포 생애주기: 시드 팩(meeting/voc/recruiting)=기본 deployed 보장(미기록일 때만) */
  ensureSeedDeployed();
  /* 모든 팩에 시드 보장(통합 인박스가 비어보이지 않게 · 1회) */
  keys.forEach(seedPack);
  /* P4 프로젝트 시드(1회, 비어있을 때만) — 시드 케이스 생성 후라야 일부에 projectId 배정 가능 */
  seedProjects(); saveApp();
  /* 뷰·케이스 복원 */
  let view=APP.view||'inbox';
  let qv=q.get('view'); if(qv==='studio'||qv==='design')qv='domain'; /* 하위호환: 구 스튜디오/디자인 → 도메인 */
  if(qv&&['inbox','run','domain','workflow','assets','logs','govern','demo'].includes(qv))view=qv;
  const qtf=q.get('type'); if(qtf&&(qtf==='all'||PACKS[qtf]))APP.typeFilter=qtf;
  const qopen=q.get('open');
  if(qopen&&APP.cases.some(c=>c.id===qopen)){openCase(qopen);}
  else if(view==='run'&&APP.active&&APP.cases.some(c=>c.id===APP.active)){openCase(APP.active);}
  else { APP.active=null; setView(view==='run'?'inbox':view); }
})();
})();
