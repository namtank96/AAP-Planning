/* =========================================================================
   AAP Maestro CORE — 도메인 무관 셸 · 실행 엔진 · 우측 8계층 · 구성/관리 뷰
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
const SEED_PACK_IDS=['meeting','voc','recruiting','contract_a','procurement','expense'];   /* 시드 = 기본 deployed (contract_a·procurement·expense = bake된 팩, N3 §E · 구매·경비는 surface 0줄 데이터 콘솔) */
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
/* 원본 baseline 스냅샷(override 적용 전) — 재적용·복원이 원본에서 출발하도록(누적 방지).
   v2: 단계 배열 baseline 은 flow(우선) 또는 work 에서 채취. */
function snapshotPack(pack){ if(pack._base)return; pack._base={ work:JSON.parse(JSON.stringify(pack.flow||pack.work||[])), compose:JSON.parse(JSON.stringify(pack.compose||[])), gates:JSON.parse(JSON.stringify(pack.gates||[])) }; }
function restoreBase(pack){ if(!pack._base)return; const w=JSON.parse(JSON.stringify(pack._base.work)); pack.work=w; if(pack.flow)pack.flow=w; /* flow·work 동일 참조 유지(override 인플레이스 변경이 둘 다에 반영) */ pack.compose=JSON.parse(JSON.stringify(pack._base.compose)); pack.gates=JSON.parse(JSON.stringify(pack._base.gates)); }
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
const groupsOf=w=>[...new Set((w&&w.ops||[]).map(o=>o.g))].sort((a,b)=>a-b);

/* =========================================================================
   Pack Contract v2 · 단계 메타 접근자 (도메인 무관 · 코어가 stage.kind/loopPhase/gate/live 로 구동)
   ───────────────────────────────────────────────────────────────────────
   "8단계 고정·특정 id 하드코딩" 제거. 코어는 어떤 stage id 도 리터럴로 가정하지 않고,
   아래 접근자로 단계 '종류'만 이해한다. legacy 플래그(actor·hitl·meeting·gate:1)는
   flow 미선언 팩(또는 wfeditor override 가 number 로 되돌린 gate)도 통과하도록 폴백.
   ========================================================================= */
function stKind(w){ if(!w)return 'auto';
  if(w.kind==='input'||w.kind==='auto'||w.kind==='gate')return w.kind;
  /* legacy 폴백: actor:'human'=input · gate성 플래그=gate · 그 외=auto */
  if(w.actor==='human')return 'input';
  if(w.hitl||w.meeting||w.gate)return 'gate';
  return 'auto'; }
function stIsGate(w){ return stKind(w)==='gate'; }
function stIsInput(w){ return stKind(w)==='input'; }
/* 실시간 세션(회의 진행·면접 진행 등) — meetPhase 상태머신 일반화(특정 id 종속 ✕) */
function stIsLive(w){ return !!(w&&(w.live||w.meeting)); }
/* 완료 결과 모달 표시 단계 */
function stHasDoneModal(w){ return !!(w&&w.doneModal); }
/* 단계가 시각적 게이트(★)인가 — renderSeq/plan 의 별 표식·gate 클래스용(object/number 모두 truthy) */
function stIsGateMark(w){ return !!(w&&(w.gate||stIsGate(w))); }
/* 운영 루프 phase — flow.loopPhase 우선, 없으면 stepLoop 맵 폴백 */
function stLoop(w){ if(!w)return ''; if(w.loopPhase)return w.loopPhase; return (PACK&&PACK.stepLoop&&PACK.stepLoop[w.id])||''; }
/* 게이트 결정 정의(decisions[]) — 코어 토스트·결정 라벨 리터럴 제거의 핵심.
   gate 가 object 면 그 decisions, 아니면(legacy/number) 표준 yes/no 폴백. */
const _GATE_FALLBACK=[{key:'yes',label:'승인',toast:'승인 · 다음 단계로 진행합니다'},{key:'no',label:'수정 요청',toast:'수정 요청'}];
function stDecisions(w){ const g=w&&w.gate; return (g&&typeof g==='object'&&Array.isArray(g.decisions)&&g.decisions.length)?g.decisions:_GATE_FALLBACK; }
function stDecision(w,key){ return stDecisions(w).find(d=>d.key===key)||{key,label:key==='yes'?'승인':'수정 요청',toast:''}; }
/* compose 류 '조합 구성요소(casm)' 노출 단계 표식(특정 id 하드코딩 제거) */
function stShowsCompose(w){ return !!(w&&w.showCompose); }
/* 단계 role 라벨 폴백(role 미선언 flow 단계 — bake된 팩 graceful). kind→역할 표기. 도메인 무관. */
function stRole(w){ const k=stKind(w); return k==='input'?'요청':k==='gate'?'결정':'AAP'; }

/* =========================================================================
   영속성 (Phase 0) — localStorage 네임스페이스 aap.v1.*
   케이스 목록·진행상태·decisions·trace 를 저장/복원. 손상·없음 시 안전 초기화.
   ========================================================================= */
const LS_NS='aap.v1.';
/* 스키마 버전 — 상태 모델이 바뀔 때마다 올린다. 저장본 버전이 다르거나(구버전 잔재) 없으면
   aap.v1.* 를 안전 초기화·재시드 → '옛 localStorage 가 새 코드를 깨는' 문제 방지. */
const SCHEMA_VER=7;   /* v7: 채용 콘솔 통일(정보성 단계 op-console·strip 9단계) + 시드 atStep 정정(백엔드=intake 시작) → 기존 캐시 케이스 재시드. v6: 결정 런타임 caseData/verdict/thresholdOv + contract_a 팩 시드(N3 §D·E) */
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
/* collapse = 레이아웃 패널 접힘 상태(도메인 무관 · UI). 기본 전부 펼침(false). localStorage 영속(SCHEMA_VER 정합). */
/* deletedSeeds = 사용자가 삭제한 시드 케이스의 안정 키('packId:seedIndex') 집합(좀비 방지) — 도메인 무관.
   seedPack 이 재부팅 시 이 집합의 시드를 다시 깔지 않는다. 영속(aap.v1.deletedSeeds). */
const APP={cases:[], projects:[], active:null, view:'inbox', pack:null, typeFilter:'all', catSel:null, projectsOn:false,
  collapse:{nav:false, evid:false, wfpal:false, wfrun:false, aapDrawer:false}, domTab:'overview', deletedSeeds:[], assetLinks:{}};
function saveApp(){ lsSet('schema',SCHEMA_VER); lsSet('cases',APP.cases); lsSet('projects',APP.projects); lsSet('active',APP.active); lsSet('view',APP.view); lsSet('pack',APP.pack); lsSet('typeFilter',APP.typeFilter); lsSet('projectsOn',APP.projectsOn); lsSet('collapse',APP.collapse); lsSet('domTab',APP.domTab); lsSet('deletedSeeds',APP.deletedSeeds); lsSet('assetLinks',APP.assetLinks); }
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
  const cl=lsGet('collapse',null); if(cl&&typeof cl==='object'){ ['nav','evid','wfpal','wfrun','aapDrawer'].forEach(k=>{ if(typeof cl[k]==='boolean')APP.collapse[k]=cl[k]; }); }
  const dt=lsGet('domTab',null); if(['overview','ontology','arch'].includes(dt))APP.domTab=dt;
  const ds=lsGet('deletedSeeds',null); if(Array.isArray(ds))APP.deletedSeeds=ds.filter(x=>typeof x==='string');
  const al=lsGet('assetLinks',null); if(al&&typeof al==='object'&&!Array.isArray(al))APP.assetLinks=al;
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
const STATE={view:'inbox', sel:null, playing:false, decisions:{}, pickedTime:null, meetPhase:'idle', previewK:null, baseOnly:false, opOpen:new Set(), trace:[], traced:new Set(),
  /* ── 워크스페이스 탭(코어 소유 · 도메인 무관 · transient) ──
     'mine' = 내 업무(결정 큐 워크스페이스) / 'progress' = 업무 진행(단계 프로세스·HITL·AAP 작동).
     wsStepOpen = 업무 진행 탭에서 펼친 단계 id 집합(세부 작업·근거). */
  wsTab:'mine', wsStepOpen:new Set(), ioDone:{},
  /* ── 결정 런타임(N3 §D) — caseData = 케이스 슬롯값 맵(caseModel.slots), verdict = evaluate 결과 ──
     thresholdOv = io.editable 로 사람이 조정한 임계 오버레이(케이스 격리). 도메인 무관(전부 데이터 주도). */
  caseData:{}, verdict:null, thresholdOv:{}};
const RUN={phase:'idle', reveal:0, timers:[], playTimer:null};
function clearRun(){RUN.timers.forEach(clearTimeout);RUN.timers=[];clearTimeout(RUN.playTimer);}
function extExcluded(){return PACK.extExcluded?PACK.extExcluded(STATE):false;}

/* ===== 케이스(인스턴스) 헬퍼 ===== */
function activeCase(){return APP.cases.find(c=>c.id===APP.active);}
function newId(){return 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
/* 팩 → 케이스 템플릿. 팩이 seeds/caseTemplate 를 안 줘도 workload/surfaceSpec 에서 자동 도출(코어 책임) */
/* 시드 input[{slot,value}] (또는 평면 객체) → caseModel.slots 타입으로 강제한 caseData 맵.
   결정 런타임(evaluate)이 바로 소비할 결정론 입력. 팩이 caseModel 없으면 빈 객체(graceful). 도메인 무관. */
function coerceSlots(pack,seed){
  const cm=pack&&pack.caseModel; if(!cm||!Array.isArray(cm.slots))return {};
  const byKey={}; cm.slots.forEach(s=>byKey[s.key]=s);
  /* seed.input = [{slot,value}] (bake된 팩) 또는 seed.caseData = 평면 객체 */
  const raw={};
  if(seed&&Array.isArray(seed.input))seed.input.forEach(p=>{ if(p&&p.slot!=null)raw[p.slot]=p.value; });
  if(seed&&seed.caseData&&typeof seed.caseData==='object')Object.assign(raw,seed.caseData);
  const out={};
  Object.keys(raw).forEach(k=>{ out[k]=coerceVal(raw[k], byKey[k]&&byKey[k].type); });
  return out;
}
function coerceVal(v,type){
  if(v==null)return v;
  if(type==='number'){ const n=typeof v==='number'?v:Number(String(v).replace(/[, _]/g,'')); return isNaN(n)?v:n; }
  if(type==='boolean'){ if(typeof v==='boolean')return v; const s=String(v).trim().toLowerCase(); return s==='true'||s==='참'||s==='y'; }
  if(type==='array'){ if(Array.isArray(v))return v; const s=String(v).trim();
    if(s===''||s==='[]'||s==='없음')return []; return s.split(/[·,]/).map(x=>x.trim()).filter(Boolean); }
  return v; /* string·enum·date = 원문 */
}
function caseTemplate(pack,seed){
  const wl=pack.workload||{}, ss=pack.surfaceSpec||{};
  return {
    caseData:coerceSlots(pack,seed),   /* 결정 런타임 입력(슬롯값) — 케이스에 영속 */
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
  if(w&&stIsGate(w)&&!c.decisions[c.sel]&&!(stIsLive(w)&&c.meetPhase==='done'))return 'wait';
  if(i>0||Object.keys(c.decisions).length)return 'run';
  return 'new';
}
function caseProgress(c){ const pack=PACKS[c.packId]; if(!pack)return 0; const i=pack.work.findIndex(x=>x.id===c.sel); const n=pack.work.length; return c.done?100:Math.round(((i+ (c.done?1:0))/n)*100); }

/* STATE ↔ case 동기화 */
function hydrateFromCase(c){
  STATE.sel=c.sel; STATE.decisions={...c.decisions}; STATE.pickedTime=c.pickedTime; STATE.meetPhase=c.meetPhase||'idle';
  /* graceful: 팩 flow 가 바뀌어 저장된 sel 이 현재 단계에 없으면 첫 단계로 폴백(도메인 무관 · 구버전 케이스 보호) */
  if(!c.sel || !(PACK&&PACK.work||[]).some(w=>w.id===c.sel)){ STATE.sel=(PACK&&PACK.work&&PACK.work[0]&&PACK.work[0].id)||c.sel; }
  STATE.trace=Array.isArray(c.trace)?c.trace.slice():[]; STATE.traced=new Set(c.traced||[]);
  STATE.previewK=null; STATE.baseOnly=false; STATE.opOpen=new Set(); STATE.playing=false;
  STATE.wsTab='mine'; STATE.wsStepOpen=new Set(); STATE.artK=null;   /* 케이스 전환 시 워크스페이스 탭/펼침/열린 산출물 초기화(transient) */
  /* 팩 선언 키 복원(도메인 무관) — 매번 초기화 후 저장된 값 주입(누수 방지) */
  packPersistKeys().forEach(k=>{ delete STATE[k]; });
  const ps=(c.packState&&typeof c.packState==='object')?c.packState:{};
  packPersistKeys().forEach(k=>{ if(k in ps)STATE[k]=ps[k]; });
  /* io 활성화 기록(코어 일반 · 케이스 영속) */
  STATE.ioDone=(c.ioDone&&typeof c.ioDone==='object')?{...c.ioDone}:{};
  /* ── 결정 런타임 hydrate(N3 §D) — 케이스 슬롯값·임계 오버레이 복원 후 evaluate 실행 ── */
  STATE.caseData=(c.caseData&&typeof c.caseData==='object')?{...c.caseData}:{};
  STATE.thresholdOv=(c.thresholdOv&&typeof c.thresholdOv==='object')?{...c.thresholdOv}:{};
  STATE.verdict=null; evalCase();
  /* 팩 선언 transient 키 초기화(케이스 간 누수 방지 — 예: 열린 상세 모달) */
  clearPackTransient();
}
/* ── 결정 런타임 실행(코어 일반 · 도메인 무관) — N3 §D 표준 ──
   팩이 caseModel+knowledge.route 를 주면 evaluate(caseData', knowledge) 실행 → STATE.verdict.
   caseData' = 슬롯값 + 사람이 조정한 임계 오버레이(thresholdOv) 병합 → io.editable.recompute 의 백엔드.
   knowledge·caseModel 없는 팩(회의·VOC)은 no-op(graceful). 결정론.
   ★ scored-list shape(채용)은 단일케이스 판정이 아니라 항목별 판정 → 여기서는 skip(팩이 evaluate per-item). */
function evalCase(){
  STATE.verdict=null;
  if(!PACK||!PACK.knowledge||!PACK.knowledge.route||!window.AAP_EVALUATE)return null;
  if(PACK.caseModel&&PACK.caseModel.shape==='scored-list')return null;   /* 항목별 판정 — 단일케이스 evalCase 부적용 */
  const data={...(STATE.caseData||{}), ...(STATE.thresholdOv||{})};
  try{ STATE.verdict=window.AAP_EVALUATE.evaluate(data, PACK.knowledge); }
  catch(e){ if(window.console)console.warn('[AAP] evaluate 실패',e); STATE.verdict=null; }
  return STATE.verdict;
}
window.AAP_evalCase=evalCase;
function persistToCase(){
  const c=activeCase(); if(!c)return;
  c.sel=STATE.sel; c.decisions={...STATE.decisions}; c.pickedTime=STATE.pickedTime; c.meetPhase=STATE.meetPhase;
  c.trace=STATE.trace.slice(); c.traced=[...STATE.traced];
  /* 팩 선언 키 영속(도메인 무관) */
  const ps={}; packPersistKeys().forEach(k=>{ if(k in STATE)ps[k]=STATE[k]; }); c.packState=ps;
  c.ioDone=(STATE.ioDone&&typeof STATE.ioDone==='object')?{...STATE.ioDone}:{};   /* io 활성화 기록 */
  c.caseData=(STATE.caseData&&typeof STATE.caseData==='object')?{...STATE.caseData}:{};   /* 결정 슬롯값 영속 */
  c.thresholdOv=(STATE.thresholdOv&&typeof STATE.thresholdOv==='object')?{...STATE.thresholdOv}:{};   /* 임계 오버레이 영속 */
  const pack=PACKS[c.packId], last=pack.work[pack.work.length-1];
  if(STATE.sel===last.id && RUN.phase==='done') c.done=true;
  saveApp();
}

/* =========================================================================
   결정 큐 (Decision Queue) — 코어 일반 도출 (도메인 무관)
   ───────────────────────────────────────────────────────────────────────
   flow 의 모든 게이트 단계(stIsGate) 중 '아직 결정되지 않은(미decided)' 단계를
   '사람이 결정할 것'으로 모은다. 표현(라벨·설명)은 팩 surface 가 채운다 →
   채용·회의·VOC 모두 같은 프레임. live 세션 게이트는 meetPhase 미완료도 미결정으로 본다.
   상태: pending(현재 도달·확인 대기) / upcoming(아직 도달 전) / done(결정됨).
   ========================================================================= */
function gateDecided(c, w){
  if(!w)return false;
  if(c.decisions && c.decisions[w.id])return true;
  /* live 세션 게이트는 진행 완료(meetPhase==='done')도 '결정됨' 취급 */
  if(stIsLive(w) && c.meetPhase==='done')return true;
  return false;
}
/* 케이스 기준 미결정 게이트 목록(도메인 무관). 활성 케이스/STATE 와 무관하게 케이스 객체로 산출. */
function pendingGatesFor(c){
  const pack=c&&PACKS[c.packId]; if(!pack)return [];
  const flow=pack.flow||pack.work||[];
  const ci=flow.findIndex(w=>w.id===c.sel);
  const dec={decisions:c.decisions||{}, meetPhase:c.meetPhase};
  return flow.map((w,i)=>({w,i})).filter(({w})=>stIsGate(w)&&!gateDecided(dec,w))
    .map(({w,i})=>({ id:w.id, label:w.label, role:w.role, reached:i<=ci,
      state:i<=ci?'pending':'upcoming' }));
}
/* 활성 STATE 기준(실행 뷰 surface 용) — STATE.decisions/meetPhase/sel 로 산출. */
function pendingGates(){
  if(!PACK)return [];
  const flow=WORK||[];
  const ci=idxOf(STATE.sel);
  const dec={decisions:STATE.decisions||{}, meetPhase:STATE.meetPhase};
  return flow.map((w,i)=>({w,i})).filter(({w})=>stIsGate(w)&&!gateDecided(dec,w))
    .map(({w,i})=>({ id:w.id, label:w.label, role:w.role, reached:i<=ci,
      state:i<=ci?'pending':'upcoming' }));
}

/* surface 컨텍스트 (코어→팩) */
function ctx(){return {S:STATE, R:RUN, idxOf, W, par:parTrack, times:TIMES, ex:extExcluded(),
  gates:pendingGates, openGate:gotoGate, gateDecided:(id)=>!!STATE.decisions[id] };}
/* 결정 큐 아이템 클릭 → 그 게이트 단계로 이동(HITL 모달 자동 노출). 도메인 무관. */
function gotoGate(id){ if(!W(id))return; setSel(id); }
function resolveDlv(k,C){const d=PACK.products[k];return {ic:d.ic,title:d.title,sub:typeof d.sub==='function'?d.sub(C):d.sub,body:typeof d.body==='function'?d.body(C):d.body};}

/* ===== view 전환 (운영 콘솔 IA: inbox / run / govern / domain) ===== */
function setView(v){
  if(typeof closeNewCase==='function')closeNewCase();   /* 새 업무 팝오버는 뷰 전환 시 닫음(다른 장면에 잔존 ✕) */
  /* ★P5 격리: 실행 뷰를 떠나면 케이스 델타를 팩 레벨로 복원 → 스튜디오/자산/로그는 공유 팩(케이스 델타 0) 기준. */
  if(v!=='run'&&STATE.view==='run'&&_caseOvActive)clearActiveCaseOverlay();
  STATE.view=v; APP.view=v;
  document.querySelectorAll('#gnav .gnav-i').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  /* topbar 부제 = 현재 view 라벨 동기화(텍스트만 · run 은 부제 숨김). inbox=통합 인박스 톤 유지 */
  {const bs=document.querySelector('.brand-sub'),onb=document.querySelector('#gnav .gnav-i.on');
   if(bs&&onb)bs.textContent=(v==='inbox')?'운영 콘솔 · 통합 인박스':onb.getAttribute('data-label');}
  document.querySelectorAll('.view').forEach(s=>s.hidden=s.dataset.view!==v);
  /* run 뷰 = 고객 업무 워크스페이스 → 운영자 글로벌 nav 숨김(좌측 nav 분리). run 외에서는 정상 노출. */
  document.body.classList.toggle('run-active', v==='run');
  if(typeof applyCollapse==='function')applyCollapse();   /* 드로어 노출을 run 한정으로 재적용 */
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
  PACK=normalizePack(PACKS[key]);
  /* Pack Contract v2: 런타임 단계 배열은 flow 우선(없으면 legacy work 폴백).
     PACK.work 는 wfeditor/snapshotPack/eval 의 기존 참조 호환을 위해 같은 배열로 정렬. */
  WORK=PACK.flow||PACK.work; if(!PACK.work)PACK.work=WORK;
  COMPONENTS=PACK.components; COMPOSE=PACK.compose; TIMES=PACK.times;
  APP.pack=key;
}
/* 팩에 데모용 케이스가 없으면 시드(서로 다른 상태). 팩이 pack.seeds 를 주면 그걸, 없으면 단일 기본 케이스.
   ★시드 좀비 방지: 시드마다 안정 키('packId:index')를 케이스에 stamp(c.seedKey)하고,
   이미 그 키의 케이스가 있거나 사용자가 삭제(APP.deletedSeeds)한 시드는 다시 깔지 않는다. */
function seedPack(key){
  const pack=PACKS[key];
  if(!APP.demo)return;   /* 더미 시드 케이스는 데모 모드(?demo=1)에서만 — 기본 부팅=빈 인박스(제품감), 케이스는 '새 업무 요청'으로 라이브 생성 */
  const seeds=pack.seeds||[{}];
  let added=false;
  seeds.forEach((s,i)=>{
    const seedKey=key+':'+i;
    if(APP.deletedSeeds.includes(seedKey))return;            /* 사용자가 삭제한 시드 — 부활 금지 */
    if(APP.cases.some(c=>c.seedKey===seedKey))return;        /* 이미 깔려있음 */
    const c=caseTemplate(pack,s); c.seedKey=seedKey;
    /* seed 의 atStep 으로 진행 위치를, status 로 완료여부 초기화 */
    if(s.atStep&&pack.work.some(w=>w.id===s.atStep))c.sel=s.atStep;
    if(s.status==='done'){c.done=true;c.sel=pack.work[pack.work.length-1].id;}
    APP.cases.push(c); added=true;
  });
  if(added)saveApp();
}
/* 케이스(인스턴스) 열기 → 런타임 STATE hydrate → 실행 뷰
   ★P5 격리: 이전 케이스 델타를 팩 레벨로 되돌린 뒤, 이 케이스의 델타만 활성 팩 파생본에 얹는다. */
function openCase(id){
  if(typeof closeNewCase==='function')closeNewCase();   /* 케이스 진입 시 새 업무 팝오버 닫음 */
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
  autoAdvanceOnOpen();   /* ★ 업무를 열면 AAP가 자동으로 단계를 흘려보냄(스테퍼 수동 진행 없음) — 게이트에서만 멈춤 */
}
/* 업무 열기 직후 자동 진행: 현재 단계가 사람 결정(게이트·라이브 await)·완료가 아니면 자동 재생을 시작해
   다음 게이트까지 스스로 흘러간다(playNext 가 게이트/회의에서 자동 정지). 도메인 무관. */
function autoAdvanceOnOpen(){
  const c=activeCase(); if(!c||c.done)return;
  const w=W(STATE.sel);
  if(stIsGate(w)||stIsLive(w))return;            /* 이미 게이트/라이브 대기 = 그 자리에서 멈춰 모달(사람 결정) */
  STATE.playing=true; setRunBtn(true);
  setSel(STATE.sel);                             /* 현재 단계 (재)실행 → revealOps → 자동 다음 단계 → … 게이트에서 정지 */
}
/* ===== 케이스(인스턴스) 삭제 — 코어 · 도메인 무관 =====
   해당 케이스 + 그 케이스 객체에 격리된 P5 델타(case.overrides)·trace·런타임 슬라이스를 함께 제거한다
   (델타·trace·packState 가 모두 케이스 객체 내부에 있어 case 제거로 정리됨 — 별도 전역 저장소 없음).
   활성 케이스면 런타임 델타를 팩 레벨로 되돌리고 인박스로 복귀. 시드 케이스면 deletedSeeds 에 등록(좀비 방지). */
function deleteCase(id){
  const c=APP.cases.find(x=>x.id===id); if(!c)return false;
  const wasActive=(APP.active===id);
  /* 활성 케이스 삭제 → 얹힌 케이스 델타를 팩 레벨로 복원하고 실행 오버레이 해제 후 인박스 복귀 */
  if(wasActive){ clearActiveCaseOverlay(); APP.active=null; }
  /* 시드 케이스였다면 그 안정 키를 삭제 집합에 기록(재부팅 시 seedPack 이 다시 깔지 않게) */
  if(c.seedKey && !APP.deletedSeeds.includes(c.seedKey)) APP.deletedSeeds.push(c.seedKey);
  /* 케이스 제거(객체 내부의 overrides/trace/packState 도 함께 사라짐) */
  APP.cases=APP.cases.filter(x=>x.id!==id);
  saveApp();
  if(wasActive){ setView('inbox'); }   /* setView 가 run 이탈 시 clearActiveCaseOverlay 보강 + 인박스 렌더 */
  else if(STATE.view==='inbox'){ renderInbox(); }
  return true;
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
  if(stIsLive(w)){ STATE.meetPhase=STATE.meetPhase==='done'?'done':'await_end'; RUN.phase=STATE.meetPhase==='done'?'done':'await'; }
  else if(stIsGate(w)){ STATE.meetPhase='idle'; RUN.phase=STATE.decisions[w.id]?'done':'await'; }
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
    const w=WORK[i],gm=stIsGateMark(w);let cls='snode'+(d===0?' active':' adj')+(gm?' gate':'')+(d<0?' past':'')+(d===0&&working?' working':'');
    if(d>0||(d===0&&i>0))html+=`<span class="sarrow">${_ICO('chevron-right')}</span>`;
    const tag=d===0?`<span class="snode-st">${working?'처리 중…':(RUN.phase==='await'?'확인 대기':'완료')}</span>`:'';
    html+=`<div class="${cls}" data-go="${w.id}"><span class="role">${w.role||stRole(w)}</span><span class="lab"><span class="sn">${String(i+1).padStart(2,'0')}</span>${w.label}${gm?_ICO('star'):''}</span>${tag}</div>`;}
  document.getElementById('seq').innerHTML=html;
  document.getElementById('seqProg').textContent=`${ci+1} / ${WORK.length}`;
  /* 노드 클릭(되짚기)은 #seq 위임(initStageNav)으로 처리 — 매 렌더 재바인딩 ✕(자동재생 중 재렌더로 핸들러 유실 방지) */
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
  list.querySelectorAll('[data-open]').forEach(e=>e.onclick=(ev)=>{
    /* 삭제 버튼/인라인 확인 영역 클릭은 행 열기로 전파시키지 않음 */
    if(ev.target.closest('[data-del],[data-confirm],[data-delyes],[data-delno]'))return;
    openCase(e.dataset.open);
  });
  /* 휴지통 → 행 내 인라인 확인(삭제/취소) 노출 */
  list.querySelectorAll('[data-del]').forEach(b=>b.onclick=(ev)=>{ ev.stopPropagation();
    const row=b.closest('.ibx-row'); if(!row)return;
    row.classList.add('confirming');
    const cf=row.querySelector('[data-confirm]'); if(cf)cf.hidden=false;
  });
  list.querySelectorAll('[data-delno]').forEach(b=>b.onclick=(ev)=>{ ev.stopPropagation();
    const row=b.closest('.ibx-row'); if(!row)return;
    row.classList.remove('confirming');
    const cf=row.querySelector('[data-confirm]'); if(cf)cf.hidden=true;
  });
  list.querySelectorAll('[data-delyes]').forEach(b=>b.onclick=(ev)=>{ ev.stopPropagation();
    if(deleteCase(b.dataset.delyes)) toast('업무를 삭제했습니다');
  });
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
        <button class="ibx-del" data-del="${c.id}" title="이 업무 삭제" aria-label="이 업무 삭제">${_ICO('trash')}</button>
        <span class="ibx-confirm" data-confirm="${c.id}" hidden>삭제할까요?<button class="ibc-yes" data-delyes="${c.id}">삭제</button><button class="ibc-no" data-delno="${c.id}">취소</button></span>
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
  /* ① 입력 다양화 · ② 명확화: seed.ioLines(파일·필드·명확화 답) 를 요청 텍스트에 mock 합류(실파싱 ✕). */
  let req=(seed&&seed.request)||'';
  if(seed&&Array.isArray(seed.ioLines)&&seed.ioLines.length){ req=(req?req+' · ':'')+seed.ioLines.join(' · '); }
  /* seed 에 request/projectId 가 있으면 caseTemplate 으로 전달(옵셔널 — 무회귀) */
  const tseed=(req||(seed&&seed.projectId))?{request:req,projectId:seed&&seed.projectId}:null;
  const c=caseTemplate(pack,tseed);
  _newSeq[key]=(_newSeq[key]||0)+1;
  c.title=(seed&&seed.title)?seed.title:`${pack.workload&&pack.workload.type?pack.workload.type:pack.label} · 신규 #${_newSeq[key]}`;
  APP.cases.push(c); saveApp();
  openCase(c.id);
  toast(`새 ‘${c.title}’ 업무를 시작했습니다 — 실행 콘솔에 투입`);
}
/* On-Ramp 토크나이저 — 입력/팩 키워드를 공통 토큰으로(2자 이상, 한·영·숫자). */
function _tokens(s){ return String(s||'').toLowerCase().replace(/[^0-9a-z가-힣\s]/g,' ').split(/\s+/).filter(t=>t.length>=2); }
/* 팩의 매칭 키워드 — label·workload(type/purpose/outputs)에서 추출. */
function packKeywords(pack){
  const wl=pack.workload||{};
  return _tokens([pack.label,wl.type,wl.purpose,(wl.outputs||[]).join(' ')].join(' '));
}
/* 매칭 인정 임계 — 겹친 토큰 ≥2 AND 점수 ≥0.14 (일반 동사 1~2개 우연 겹침은 신규로 흘려보냄). */
const NC_MIN_HITS=2, NC_MIN_SCORE=0.14;
function matchPackByText(text){
  const inTok=new Set(_tokens(text)); if(!inTok.size)return {packId:null,score:0,ranked:[]};
  /* ★배포된 팩만 매칭 대상 — draft 유형은 운영 인식에서 제외(배포해야 On-Ramp 편입) */
  const ranked=deployedPackIds().map(id=>{
    const kw=packKeywords(PACKS[id]); if(!kw.length)return {id,score:0,hits:0,hitToks:[]};
    let hits=0; const seen=new Set(); const hitToks=[];
    kw.forEach(k=>{ if(inTok.has(k)&&!seen.has(k)){ hits++; seen.add(k); hitToks.push(k); } });
    return {id,score:hits/Math.max(4,new Set(kw).size),hits,hitToks};
  }).sort((a,b)=>b.score-a.score);
  const top=ranked[0];
  return {packId:(top&&top.hits>=NC_MIN_HITS&&top.score>=NC_MIN_SCORE)?top.id:null, score:top?top.score:0, ranked};
}
/* 후보가 매칭 임계를 통과했는가(top-N 표시 시 '실행' 가능 후보 판별). */
function ncCandQualifies(r){ return !!(r&&r.hits>=NC_MIN_HITS&&r.score>=NC_MIN_SCORE); }
/* ＋새 업무 요청 = On-Ramp 입구.
   유형을 미리 고르게 하지 ✕ → '업무 설명'을 입력받아 유형을 인식한다(정형화 완화).
   ① 입력이 기존 등록 유형과 매칭 → 그 유형으로 케이스 생성·실행(운영 루프).
   ② 매칭 안 됨(신규/비정형) → "AAP 흐름 없음 → 격상" 안내 + 격상 파이프라인 자동 진입(구성 루프).
   사용자가 인식 결과를 바꿀 수 있게(매칭 후보 칩 + 항상 '새 유형으로 격상' 선택지) 제공. */
let _ncMenu=null, _ncBack=null, _ncTrigger=null;
function closeNewCase(){ if(_ncBack){ _ncBack.remove(); _ncBack=null; }
  if(_ncMenu){ _ncMenu.remove(); _ncMenu=null; document.removeEventListener('keydown',_ncEsc,true); document.removeEventListener('keydown',_ncTrap,true); _ncIO={}; _ncClarifyAns={}; }
  /* Y5 a11y: 닫을 때 포커스를 트리거(＋새 업무 요청 버튼)로 복귀 — 키보드 흐름 유지 */
  if(_ncTrigger&&_ncTrigger.focus){ try{ _ncTrigger.focus(); }catch(e){} } _ncTrigger=null; }
function _ncEsc(ev){ if(ev.key==='Escape')closeNewCase(); }
/* Y5 a11y: 포커스 트랩 — Tab 이 모달 안에서만 순환(첫↔끝 wrap) */
function _ncFocusables(){ if(!_ncMenu)return [];
  return Array.prototype.slice.call(_ncMenu.querySelectorAll('a[href],button:not([disabled]),textarea:not([disabled]),input:not([type=hidden]):not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'))
    .filter(el=>el.offsetWidth>0||el.offsetHeight>0||el===document.activeElement); }
function _ncTrap(ev){ if(ev.key!=='Tab'||!_ncMenu)return;
  const f=_ncFocusables(); if(!f.length)return;
  const first=f[0], last=f[f.length-1], a=document.activeElement, inside=_ncMenu.contains(a);
  if(ev.shiftKey){ if(a===first||!inside){ ev.preventDefault(); last.focus(); } }
  else { if(a===last||!inside){ ev.preventDefault(); first.focus(); } } }
function promptNewCase(anchor){
  if(_ncMenu){ closeNewCase(); return; } /* 토글 */
  /* (1) 중앙 모달 — 백드롭 + 화면 중앙(앵커 팝오버 ✕). 백드롭 클릭 = 닫기. */
  const back=document.createElement('div'); back.id='ncBackdrop'; back.className='nc-backdrop'; _ncBack=back;
  const menu=document.createElement('div'); menu.id='newCaseMenu'; menu.className='nc-menu nc-onramp nc-modal';
  /* Y5 a11y: 모달 role + 헤더 라벨 연결 */
  menu.setAttribute('role','dialog'); menu.setAttribute('aria-modal','true'); menu.setAttribute('aria-labelledby','ncHead');
  _ncMenu=menu;
  /* 닫을 때 복귀할 트리거(＋새 업무 요청 버튼/앵커) 기억 */
  _ncTrigger=anchor||document.activeElement;
  /* On-Ramp 세션 상태(이 패널이 열린 동안) — io 입력값 · 명확화 답 · 사용자가 고른 유사 팩 후보. */
  _ncIO={}; _ncClarifyAns={}; _ncPick=null;
  menu.innerHTML=`
    <button class="ncm-x" id="ncClose" aria-label="닫기">${_ICO('x')}</button>
    <div class="ncm-h" id="ncHead">어떤 업무를 맡기시겠어요?</div>
    <div class="ncm-sub">업무를 설명하면 AAP가 실행 구조로 분해합니다. 비슷한 도메인 팩이 있으면 후보로 안내하고, 없으면 새 업무 유형으로 바로 만들 수 있어요.</div>
    <textarea class="nc-ta" id="ncText" rows="3" placeholder="예) 신규 거래처 등록 심사를 맡기고 싶어요. 사업자·신용·제재 리스트를 확인하고 리스크를 판단해 승인 여부를 정해줘."></textarea>
    <div class="nc-decomp-wrap" id="ncDecompWrap" hidden>
      <div class="nc-decomp-h">${_ICO('workflow')}<span class="nc-dh-t">AAP 분해 · 실행 구조</span><span class="nc-dh-s">업무 설명을 단계·구성요소·게이트로 쪼갰습니다 · 프록시 없으면 결정론</span></div>
      <div class="nc-decomp" id="ncDecomp"></div>
    </div>
    <div class="nc-reco" id="ncReco"></div>
    <div class="nc-acts" id="ncActs"></div>`;
  back.appendChild(menu); document.body.appendChild(back);
  back.onclick=(e)=>{ if(e.target===back)closeNewCase(); };   /* 백드롭(빈 영역) 클릭 = 닫기 */
  const ta=menu.querySelector('#ncText');
  ta.oninput=()=>renderNcReco(ta.value);
  const xb=menu.querySelector('#ncClose'); if(xb)xb.onclick=closeNewCase;   /* (1) 명시적 닫기 */
  renderNcReco('');
  setTimeout(()=>{ ta.focus(); document.addEventListener('keydown',_ncEsc,true); document.addEventListener('keydown',_ncTrap,true); },0);
}
/* On-Ramp 세션 누적값 — ① io 입력(파일명·필드값) · ② 명확화 답 */
let _ncIO={}, _ncClarifyAns={};
/* ③ 후보 항목 1개 markup (top-N · 신뢰도 바 score% · 근거 hitToks). qualifies=임계 통과 후보(실행 가능). */
function _ncRecoItem(r,primary){
  const p=PACKS[r.id]; if(!p)return '';
  const pct=Math.round(r.score*100);
  const why=(r.hitToks&&r.hitToks.length)?`매칭 근거: '${r.hitToks.slice(0,4).join('·')}' 토큰 ${r.hits}`:'근거 토큰 없음';
  return `<button class="nc-reco-i${primary?'':' alt'}" data-pick="${r.id}">
    <span class="ty-badge ${typeTok(r.id)}">${dcText(p.label,'pack.label')}</span>
    <span class="nc-conf"><i style="width:${pct}%"></i></span><span class="nc-conf-n">${pct}%</span>
    <span class="nc-reco-go">이 유형으로 실행 ${_ICO('chevron-right')}</span>
    <span class="nc-why">${why}</span>
  </button>`;
}
/* ② 결정론 명확화 규칙 — 매칭 신뢰도 낮음(미통과)·근소 경합 시 1~2개 보완 질문(선택형 칩).
   답은 _ncClarifyAns 에 누적 → seed.ioLines·재매칭 텍스트에 합류(실제 LLM 되묻기 ✕=Phase3). */
function _ncClarifyQuestions(text,m){
  const qs=[]; const top=m.ranked&&m.ranked[0], second=m.ranked&&m.ranked[1];
  /* 규칙1: 임계 미통과(매칭 불명) → 업무 성격을 직접 물어 후보 라벨로 유도 */
  if(!m.packId && top){
    qs.push({key:'kind', q:'어떤 성격의 업무에 가까운가요?',
      opts:deployedPackIds().slice(0,4).map(id=>({v:PACKS[id].label, pack:id}))});
  }
  /* 규칙2: 1·2위 점수가 근소(경합) → 둘 중 무엇인지 확인 */
  else if(top&&second&&ncCandQualifies(second)&&(top.score-second.score)<0.08){
    qs.push({key:'pick', q:'두 유형이 비슷해요. 어느 쪽인가요?',
      opts:[{v:PACKS[top.id].label,pack:top.id},{v:PACKS[second.id].label,pack:second.id}]});
  }
  /* 규칙3: 입력이 너무 짧음 → 규모/목표 보완(매칭과 무관하게 seed 풍부화) */
  if(_tokens(text).length<3){ qs.push({key:'scale', q:'규모나 목표를 한 가지만 알려주세요',
    opts:[{v:'소규모(1~2건)'},{v:'정기·반복'},{v:'대량·일괄'}]}); }
  return qs.slice(0,2);
}
/* 입력에 따라 [분해 뷰] + [유사 도메인 팩 후보(보조)] + [생성 액션 2종]을 실시간 갱신.
   ── 2차 표준화: '키워드 매칭'을 주(主)에서 보조로 격하 → 라이브/결정론 분해(AAP_VIZ_BRIDGE)가 주.
   버튼: 기존 Pack으로 생성(매칭 팩 재사용) / 새 업무 유형으로 생성(분해 결과로 신규 팩·createCase). */
let _ncPick=null, _ncDecompTimer=null;
function renderNcReco(text){
  if(!_ncMenu)return;
  const reco=_ncMenu.querySelector('#ncReco'), acts=_ncMenu.querySelector('#ncActs');
  try{ _renderNcRecoBody(text,reco,acts); }
  catch(_e){ if(reco)reco.setAttribute('data-err',(_e&&(_e.message+' @ '+(_e.stack||'').split('\n')[1]))||'x'); }
}
function _renderNcRecoBody(text,reco,acts){
  const menu=_ncMenu;
  const dwrap=menu.querySelector('#ncDecompWrap');
  const t=String(text||'').trim();
  /* ── 빈 상태 — 자주 맡기는 업무 칩(클릭=바로 시작). 분해 뷰는 숨김. ── */
  if(!t){
    menu.classList.remove('nc-modal-wide');
    if(dwrap)dwrap.hidden=true;
    if(_ncDecompTimer){ clearTimeout(_ncDecompTimer); _ncDecompTimer=null; }
    _ncPick=null;
    const chips=deployedPackIds().map(id=>`<button class="nc-chip ${typeTok(id)}" data-pick="${id}"><span class="tc-dot"></span>${dcText(PACKS[id].label,'pack.label')}</button>`).join('');
    reco.innerHTML=`<div class="nc-reco-h">자주 맡기는 업무 <span class="nc-reco-sub">클릭해서 바로 시작</span></div>
      <div class="nc-chips">${chips}</div>
      <div class="nc-hint">${_ICO('search')} 또는 위에 업무를 설명하면 AAP가 실행 구조로 분해합니다.</div>`;
    acts.innerHTML='';
    reco.querySelectorAll('.nc-chip').forEach(b=>{ b.onclick=()=>{ const id=b.dataset.pick; const seed=ncSeed('',id); closeNewCase(); createCase(id,seed); }; });
    return;
  }
  /* ── 입력 있음 — 분해 뷰(주) + 유사 팩 후보(보조) + 생성 액션 ── */
  menu.classList.add('nc-modal-wide');
  if(dwrap)dwrap.hidden=false;
  /* (a) 분해 뷰 = 라이브 LLM 우선 → 결정론 detViz 폴백(AAP_VIZ_BRIDGE). 키 입력마다 재마운트는 비용 → 디바운스. */
  if(_ncDecompTimer)clearTimeout(_ncDecompTimer);
  _ncDecompTimer=setTimeout(()=>{
    const el=menu.querySelector('#ncDecomp');
    if(el&&window.AAP_VIZ_BRIDGE&&window.AAP_VIZ_BRIDGE.analyze){ try{ window.AAP_VIZ_BRIDGE.analyze(t, el); }catch(e){ if(window.console)console.warn('[AAP] 분해 렌더 실패',e); } }
    else if(el){ el.innerHTML=`<div class="nc-hint">${_ICO('info')} 분해 모듈을 불러오지 못했습니다. 새 업무 유형으로 생성은 계속 가능합니다.</div>`; }
  }, 340);
  /* (b) 유사 도메인 팩 후보(보조) — matchPackByText. 주가 아니라 '재사용 안내'.
     Y3: score>0(우연 1토큰 6% 등)까지 노출하던 것을 임계(ncCandQualifies: hits≥2·score≥0.14) 통과만 후보로.
     미달이면 후보를 비워 nc-noflow(신규 유형 안내)로 일원화. */
  const m=matchPackByText(t);
  const cands=(m.ranked||[]).filter(ncCandQualifies).slice(0,3);
  /* 사용자가 후보를 클릭했으면 그 선택, 아니면 임계 통과 best, 그것도 없으면 최상위 후보(보조 재사용). */
  const useId=(_ncPick && cands.some(c=>c.id===_ncPick))?_ncPick:(m.packId||(cands[0]&&cands[0].id)||null);
  if(cands.length){
    reco.innerHTML=`<div class="nc-reco-h">유사 도메인 팩 후보 <span class="nc-reco-sub">보조 · 비슷한 기존 유형이 있으면 재사용</span></div>`+
      cands.map(r=>_ncRecoItem(r, r.id===(useId||cands[0].id))).join('');
    reco.querySelectorAll('.nc-reco-i').forEach(b=>{ b.onclick=()=>{ _ncPick=b.dataset.pick; renderNcReco(t); }; });
  } else {
    reco.innerHTML=`<div class="nc-noflow">${_ICO('info')}<div><b>비슷한 도메인 팩이 없습니다.</b><span>새 업무 유형으로 만들면 위 분해 구조 그대로 실행 콘솔이 구성됩니다.</span></div></div>`;
  }
  /* (c) 액션 — 기존 Pack으로 생성(매칭 있을 때만) / 새 업무 유형으로 생성(항상).
     Y4: 강매칭(top 후보가 임계 통과 = m.packId 확정)이면 '○○ 팩으로 생성'을 primary, '새 유형'을 ghost로 스왑.
     매칭이 약하거나 없으면(현행) '새 유형'이 primary. primary 는 flex-end 기준 우측(마지막)에 배치. */
  const strong=!!(useId && m.packId);
  const existBtn=useId?`<button class="cp-btn ${strong?'primary':'ghost'} sm" id="ncUseExisting">${_ICO('boxes')}‘${dcText(PACKS[useId].label,'pack.label')}’ 팩으로 생성${strong?_ICO('arrow-right'):''}</button>`:'';
  const newBtn=`<button class="cp-btn ${strong?'ghost':'primary'} sm" id="ncNewType">${_ICO('rocket')}새 업무 유형으로 생성${strong?'':_ICO('arrow-right')}</button>`;
  acts.innerHTML= strong ? (newBtn+existBtn) : (existBtn+newBtn);
  const be=menu.querySelector('#ncUseExisting'); if(be)be.onclick=()=>{ const seed=ncSeed(t,useId); closeNewCase(); createCase(useId,seed); };
  const bn=menu.querySelector('#ncNewType'); if(bn)bn.onclick=()=>ncCreateNewType(t);
}
/* 명확화 답을 텍스트에 합류해 매칭 보강(② 가 ③ 인식을 실제로 끌어올림) */
function _ncAugText(text){ const ans=Object.values(_ncClarifyAns||{}).filter(Boolean); return ans.length?(text+' '+ans.join(' ')):text; }
/* ① io.inputs 동적 렌더(type:file=mock 파일명·건수만 / type:field·기타=텍스트 필드). 값→_ncIO. */
function _renderNcInputs(el,pack){
  if(!el)return;
  const ins=(pack&&pack.io&&Array.isArray(pack.io.inputs))?pack.io.inputs:[];
  if(!ins.length){ el.hidden=true; el.innerHTML=''; return; }
  el.hidden=false;
  el.innerHTML=`<div class="nc-in-h">${_ICO('upload')}이 유형이 받는 입력 <span class="nc-in-sub">선택 입력 · 실제 파싱은 실행에서</span></div>`+
    ins.map(io=>{
      const k=io.key||io.label;
      const cur=_ncIO[k];
      if(io.type==='file'){
        return `<label class="nc-drop" data-iok="${k}">${_ICO('file-text')}<span class="nc-drop-l">${dcText(io.label,'io.label')}</span><span class="nc-drop-v">${cur?cur:(io.hint||'파일 선택')}</span><input type="file" hidden multiple data-iofile="${k}"></label>`;
      }
      return `<div class="nc-field"><span class="nc-fl">${dcText(io.label,'io.label')}</span><input class="nc-fi" data-iofield="${k}" value="${cur?String(cur).replace(/"/g,'&quot;'):''}" placeholder="${io.hint||'입력'}"></div>`;
    }).join('');
  /* 파일 = mock(파일명·건수만 기록, 실파싱 ✕) */
  el.querySelectorAll('input[type=file]').forEach(fi=>{ fi.onchange=()=>{ const k=fi.dataset.iofile; const n=fi.files.length;
    _ncIO[k]= n? (n>1? `${fi.files[0].name} 외 ${n-1}건` : fi.files[0].name) : '';
    const lab=el.querySelector(`.nc-drop[data-iok="${k}"] .nc-drop-v`); if(lab&&_ncIO[k])lab.textContent=_ncIO[k]; }; });
  el.querySelectorAll('input.nc-fi').forEach(fe=>{ fe.oninput=()=>{ _ncIO[fe.dataset.iofield]=fe.value.trim(); }; });
}
/* ② 명확화 질문 칩 렌더 — 답 클릭 시 _ncClarifyAns 누적 + (pack 지정 칩이면) 그 유형으로 직접 실행 가능 */
function _renderNcClarify(el,text,m){
  if(!el)return;
  const qs=_ncClarifyQuestions(text,m);
  if(!qs.length){ el.hidden=true; el.innerHTML=''; return; }
  el.hidden=false;
  el.innerHTML=`<div class="nc-cl-h">${_ICO('help-circle')}몇 가지만 확인할게요</div>`+
    qs.map(q=>`<div class="nc-cl-q" data-clq="${q.key}"><span class="nc-cl-qt">${q.q}</span><span class="nc-cl-opts">`+
      q.opts.map(o=>`<button class="nc-cl-opt${_ncClarifyAns[q.key]===o.v?' on':''}" data-clk="${q.key}" data-clv="${o.v}"${o.pack?` data-clpack="${o.pack}"`:''}>${o.v}</button>`).join('')+
    `</span></div>`).join('');
  el.querySelectorAll('.nc-cl-opt').forEach(b=>{ b.onclick=()=>{
    _ncClarifyAns[b.dataset.clk]=b.dataset.clv;
    const ta=_ncMenu&&_ncMenu.querySelector('#ncText'); const txt=ta?ta.value:text;
    renderNcReco(txt);   /* 답을 반영해 재매칭·재렌더 */
  }; });
}
/* 입력 텍스트(+명확화·io) → 케이스 seed(제목·요청·ioLines). pickId=사용자가 고른 유형(옵셔널). */
function ncSeed(text,pickId){ const t=String(text||'').trim(); if(!t&&!Object.keys(_ncIO||{}).length)return null;
  const ioLines=[];
  Object.keys(_ncIO||{}).forEach(k=>{ if(_ncIO[k])ioLines.push(`${k}: ${_ncIO[k]}`); });
  Object.keys(_ncClarifyAns||{}).forEach(k=>{ if(_ncClarifyAns[k])ioLines.push(_ncClarifyAns[k]); });
  return { title:(t||ioLines[0]||'새 업무').replace(/\s+/g,' ').slice(0,40), request:t.slice(0,160), ioLines }; }
/* =========================================================================
   분해 결과 → 신규 Domain Pack 자동 생성 (코어 일반 · 도메인 무관)
   ───────────────────────────────────────────────────────────────────────
   '새 업무 유형으로 생성' = AAP_VIZ_BRIDGE.detViz(text)(결정론) 분해를 받아,
   런타임이 렌더할 '최소 surfaceSpec 팩'을 만들어 PACKS 에 등록·deployed 한다.
   생성물 = ① 작업 타임라인(work 단계 진행) ② 산출물(products/outputs) ③ HITL 게이트(gates).
   도메인별 rich 슬롯(caseModel·온톨로지·전용 surface)은 후속 — 이 범위 ✕.
   더미 SEEDS 없이도 createCase → 인박스 편입 → 스트림 런타임이 그대로 작동한다. */
const _NC_LOOP={request:'Data',understand:'Semantic',compose:'Reasoning',approve:'Decision',prepare:'Action',commit:'Decision',share:'Learning'};
function _ncEscHtml(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
/* detViz op.ty(A/M/S/C/P) → evidType 가 같은 타입으로 분류하도록 comp 라벨에 키워드 보장(색 정합). */
function _ncCompLabel(ty,nm){
  nm=String(nm||'').trim()||'구성요소';
  if(ty==='P')return /정책|Policy|게이트|HITL|차단|승인|통제|마스킹|PII|규정/.test(nm)?nm:nm+' 정책';
  if(ty==='C')return /Connector|커넥터|연결|수집|연동/.test(nm)?nm:nm+' Connector';
  if(ty==='S')return /솔루션|ATS|HRIS|KMS|그룹웨어|문서함|스토리지|DB/.test(nm)?nm:nm+' (기존 솔루션)';
  if(ty==='M')return /Module|모듈|OCR|정규화|검증|평가|Antbot|품질/.test(nm)?nm:nm+' 모듈';
  return nm; /* A = Agent(기본) */
}
let _ncBuildSeq=0;
function buildPackFromDecomp(decomp, text){
  if(!decomp||!Array.isArray(decomp.work)||!decomp.work.length)return null;
  const work=decomp.work;
  const dwById={}; work.forEach((w,wi)=>{ dwById[w.id||('step'+wi)]=w; });   /* 단계 id → 원본 분해 항목(게이트 dec·data·risk 표면화용) */
  const id='nc_'+Date.now().toString(36)+(++_ncBuildSeq);
  const label=_ncEscHtml((decomp.label||decomp.type||'새 업무 유형')).slice(0,24);
  /* ── flow/work — detViz 단계를 팩 단계 스키마로 매핑(타임라인·게이트) ── */
  const flow=work.map((w,wi)=>{
    const kind=(w.actor==='human')?'input':((w.actor==='hitl'||w.gate)?'gate':'auto');
    const role=kind==='input'?'요청':kind==='gate'?'사람 확인':'AAP';
    const ops=(Array.isArray(w.ops)?w.ops:[]).map((o,oi)=>{
      /* detViz op = {ty,L,nm,desc,reads,out,why}. desc·reads 를 더미 팩과 동일한
         op-detail 밀도 요소로 표면화(과소밀도 해소) — 새 사실 ✕, 분해 데이터 재배치. */
      const dRows=[];
      if(o.desc)dRows.push(['하는 일',_ncEscHtml(o.desc)]);
      if(o.reads)dRows.push(['읽는 자료',_ncEscHtml(o.reads)]);
      const detail=dRows.length?`<div class="op-detail"><div class="od-title">${(o.L||'L3')+' '+(LK[o.L]||'')}</div>${dRows.map(r=>`<div class="od-row"><span class="od-k">${r[0]}</span><span class="od-v">${r[1]}</span></div>`).join('')}</div>`:'';
      return { g:oi, feed:_ncEscHtml(o.nm||'작업'), out:_ncEscHtml(o.out||'—'),
        L:o.L||'L3', comp:_ncEscHtml(_ncCompLabel(o.ty,o.nm)),
        micro:o.why?[_ncEscHtml(String(o.why))]:undefined, detail };
    });
    const step={ id:w.id||('step'+wi), label:_ncEscHtml(w.nm||('단계 '+(wi+1))),
      role, actor:w.actor||'aap', kind, explain:_ncEscHtml(w.why||''),
      loopPhase:_NC_LOOP[w.id]||'', ops };
    if(kind==='gate'){
      step.hitl=1;
      step.gate={ label:_ncEscHtml(w.nm||'사람 확인'), decisions:[
        {key:'yes',label:'승인',toast:'승인 · 다음 단계로 진행합니다'},
        {key:'no',label:'수정 요청',toast:'수정 요청 · 검토로 돌립니다'}]};
    }
    return step;
  });
  /* 마지막 자동 단계 = 완료 결과 모달 */
  for(let i=flow.length-1;i>=0;i--){ if(flow[i].kind==='auto'){ flow[i].doneModal=1; break; } }
  /* ── products — 자동 단계마다 1개(작업 내역 = AAP가 만든 산출물). readyAt=단계 id. ── */
  const products={};
  flow.forEach(step=>{
    if(step.kind!=='auto')return;
    const rows=(step.ops||[]).map(o=>`<div class="row"><div style="flex:1"><div class="nm">${o.feed}</div><div class="why">${o.L} · ${o.comp}</div></div><span class="tag ok">${o.out}</span></div>`).join('');
    products[step.id]={ ic:'📄', title:step.label, sub:'AAP 생성', readyAt:step.id,
      body:`<div class="dlv"><div class="dlv-sec">${step.label} · AAP 작업 내역</div>${rows||`<div class="row"><div style="flex:1"><div class="nm">${step.label}</div></div></div>`}</div>` };
  });
  /* ── compose / components — 분해 compose 집계를 5타입 카드·자산으로(스튜디오·자산 카탈로그용) ── */
  const TYSUB={A:'전문 작업',M:'재사용 기능',S:'Buy·Integrate',C:'시스템 연동',P:'통제·권한'};
  const compose=(Array.isArray(decomp.compose)?decomp.compose:[]).map(c=>({
    t:_TYKO[c.ty]||'Agent', sub:TYSUB[c.ty]||'', cls:'t'+c.ty, n:c.n||0,
    items:(c.items||[]).map(_ncEscHtml) }));
  const components=[];
  (Array.isArray(decomp.compose)?decomp.compose:[]).forEach(c=>{
    (c.items||[]).forEach(it=>components.push({ type:_TYKO[c.ty]||'Agent', ty:'ty'+c.ty,
      ic:'🧩', name:_ncEscHtml(it), L:'L3', desc:_ncEscHtml(it)+' — 분해로 배정된 '+(_TYKO[c.ty]||'Agent')+'.',
      when:'이 업무 흐름에서 해당 작업이 필요할 때.', data:'업무 입력·근거', how:'분해 결과에 따라 자동 배정.' }));
  });
  /* ── surfaceSpec(최소) — 스트림 런타임이 읽는 perStep·status·hitl·done ── */
  const SS={ icon:'🗂️', title:label, customer:'신규 업무 요청', owner:'담당자',
    tabs:['개요','진행','산출물'], status:{}, perStep:{}, hitl:{}, done:{} };
  flow.forEach(step=>{
    if(step.kind==='input'){ SS.status[step.id]=['접수','s-info','개요'];
      SS.perStep[step.id]={mode:'request',work:'요청을 접수하고 있어요…',done:'요청 접수됨 · 분석 시작',text:(decomp.work[0]&&decomp.work[0].why)||'',hint:'AAP가 실행 구조로 분해해 처리합니다.'};
    } else if(step.kind==='gate'){ SS.status[step.id]=['검토 필요','s-amber','진행'];
      /* 게이트 단계는 ops 가 없음(사람 결정) → 분해의 dec·data·risk 를 HITL 리뷰 행으로 표면화
         (더미 팩 HITL 카드와 동일 밀도 · 새 사실 ✕). */
      const dw=dwById[step.id]||{};
      const gj=a=>Array.isArray(a)?a.filter(Boolean).join(' · '):'';
      const gRows=[];
      if(gj(dw.dec))gRows.push({k:'확인·결정',v:gj(dw.dec)});
      if(gj(dw.data))gRows.push({k:'검토 자료',v:gj(dw.data)});
      if(gj(dw.risk))gRows.push({k:'책임·리스크',v:gj(dw.risk)});
      const opRows=(step.ops||[]).slice(0,3).map(o=>({k:o.feed,v:o.out}));
      const rows=gRows.length?gRows:opRows;
      /* 게이트는 ops 가 없어 좌측이 휑함 → 동일 dec·data·risk 를 overview 표로 게이트 카드에 표면화. */
      SS.perStep[step.id]=rows.length
        ?{mode:'overview',rows:rows.map(r=>[r.k,r.v]),work:'확인 항목을 정리하고 있어요…',done:'확인 대기'}
        :{mode:'work',work:'확인 항목을 정리하고 있어요…',done:'확인 대기'};
      SS.hitl[step.id]={ title:step.label+' — 확인해 주세요', sub:(step.explain||'여기서 사람이 확정해야 합니다 (HITL)'),
        yes:'승인', no:'수정 요청', rows };
    } else { SS.status[step.id]=['처리 중','s-blue','진행'];
      const track=(step.ops||[]).map(o=>o.feed).slice(0,4);
      SS.perStep[step.id]={mode:track.length?'track':'work',work:'AAP가 처리하고 있어요…',done:'처리 완료',track};
    }
  });
  /* 마지막 자동 단계 status=완료 + 완료 결과 모달 */
  for(let i=flow.length-1;i>=0;i--){ if(flow[i].kind==='auto'){ const s=flow[i];
    SS.status[s.id]=['완료','s-green','산출물'];
    SS.done[s.id]={ title:s.label+' 완료', lines:Object.keys(products).map(k=>({ic:'📄',t:products[k].title,dlv:k})) };
    break; } }
  /* ── workload / 거버넌스 메타(스튜디오·도메인 뷰) ── */
  const outputs=Object.keys(products).map(k=>products[k].title);
  const gateLabels=flow.filter(s=>s.kind==='gate').map((s,i)=>`★ HITL ${i+1} ${s.label}`);
  const workload={ request:_ncEscHtml(String(text||'').slice(0,200)), type:label,
    purpose:_ncEscHtml(decomp.purpose||'분석 · 판단 · 처리 · 기록'), outputs,
    gates:gateLabels.join(' · ')||'자동 처리(게이트 없음)' };
  const planProduces={}; flow.forEach(s=>{ planProduces[s.id]=(s.kind==='auto'&&products[s.id])?[products[s.id].title]:[]; });
  const stepLoop={}; flow.forEach(s=>{ if(s.loopPhase)stepLoop[s.id]=s.loopPhase; });
  const govern=[
    {k:'Policy',v:'책임 지점은 <b>자동 실행 차단</b> 후 사람 확인(HITL).'},
    {k:'Run Trace',v:'요청→분해→실행→확인→반영을 <b>전 구간 기록</b>.'},
    {k:'Evaluation',v:'처리 정확도·정책 준수·산출물 품질을 평가.'},
    {k:'Skill Library',v:'반복 패턴을 <b>재사용 자산</b>으로 축적.'},
  ];
  const pack={ id, label, _autoNew:true,
    flow, work:flow, products, compose, components,
    workload, planProduces, govern, gates:gateLabels, seeds:[],
    io:{ inputs:[], editable:[], connectors:[] },
    stepLoop, surfaceSpec:SS };
  (window.AAP_PACKS=window.AAP_PACKS||{})[id]=pack;
  PACKS[id]=pack;
  setPackStatus(id,'deployed');   /* 운영 편입(인박스·매칭·자산) */
  return id;
}
/* '새 업무 유형으로 생성' — 결정론 분해(detViz)로 신규 팩 생성 → 케이스 생성·실행 진입. */
function ncCreateNewType(text){
  const t=String(text||'').trim(); if(!t)return;
  const VB=window.AAP_VIZ_BRIDGE;
  const decomp=(VB&&VB.detViz)?VB.detViz(t):null;
  const id=buildPackFromDecomp(decomp,t);
  if(!id){ toast('업무 분해에 실패했습니다 — 설명을 조금 더 적어 주세요'); return; }
  const seed=ncSeed(t,id);
  closeNewCase();
  createCase(id,seed);
}
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
function surfCmodal(kind,C){
  if(PACK.surface&&PACK.surface.cmodal)return PACK.surface.cmodal(kind,C);
  if(hasDataConsole()){ const h=dcCmodal(kind,C); if(h)return h; }   /* 코어 일반 데이터 콘솔 모달(HITL) */
  return cmodalSpec(kind,C);
}

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

/* =========================================================================
   조작형 surface 종합 프레임워크 (코어 일반 · 도메인 무관) — 목업 v0.1 3종 기준
   ───────────────────────────────────────────────────────────────────────
   "정적 화면 ✕ → 사람 의도에 따라 결과·흐름이 곳곳에서 갈라지는 조작형 작업 화면."
   ① 인라인 의도 steering(재가중·필터·재지시·분기) — chat ✕.
   ② 라이브 재분석 = 상단 비침투 작은 카드(전체 덮기 ✕) + 진행바 + spinner→✓ + 구체 수치 + 연속 클릭 잠금.
   ③ FLIP = 행이 옛→새 위치로 활강(innerHTML 통째 교체로 인한 깜빡임 제거).
   ④ SVG 매칭 그래프 컨테이너(인라인 SVG · 외부 라이브러리 0).
   엔진은 도메인 무관. 채용 전용 컨트롤·recompute·그래프 데이터는 recruiting.js 의 surface 가 제공.
   ========================================================================= */
/* ── ② 라이브 재분석 엔진 — 비침투 오버레이(#reov, .run-surface 마운트). 연속 클릭 잠금. ──
   사용자 지적 1·2: "휙 지나감 / 중간에 무엇을·어떤 근거로 작동하는지 안 보임".
   → 각 단계가 충분히 머무르며(dwell↑) '작동 중'(파랑 펄스) → '완료'(체크)로 전이하고,
     단계마다 mono 근거(basis: 어떤 슬롯/룩업/임계/식을 읽고·계산·판정했는지)를 노출한다.
   step 스키마 = {t(제목), d(한 줄), basis(근거 mono 라인 — 무엇을 읽고/계산/판정), tag('읽기'|'대조'|'평가'|'판정')}.
   결과로 점프(✕) → 중간 작동을 근거와 함께 펼쳐 보여준다(시간은 도메인 무관 코어가 통제). */
var _LIVE_BUSY=false;
function liveBusy(){ return _LIVE_BUSY; }
/* 단계 진행 타이밍(코어 일반 — 너무 빠르지 않게). reveal=등장, work=작동중 머무름, gap=다음까지. */
const RE_T={ reveal:60, work:860, gap:180, done:420 };
const RE_TAG={'읽기':'slot','대조':'lk','평가':'th','판정':'route'};
/* opts = {intent, mono, steps:[{t,d,basis,tag}], onDone, busyEl} — steps 작동중→✓ 후 onDone() 호출(결정론 recompute). */
function runReanalysis(opts){
  opts=opts||{};
  if(_LIVE_BUSY)return; _LIVE_BUSY=true;
  const rs=document.querySelector('.run-surface'); if(!rs){ _LIVE_BUSY=false; if(opts.onDone)opts.onDone(); return; }
  /* busy = 메인 본문만 살짝 흐림(전체 덮기 ✕) */
  const busyEl=opts.busyEl||document.querySelector('.run-surface .con-body'); if(busyEl)busyEl.classList.add('live-busy');
  /* 오버레이 1회 보장 */
  let ov=document.getElementById('reov');
  if(!ov){ ov=document.createElement('div'); ov.id='reov'; ov.className='reov';
    ov.innerHTML=`<div class="recard"><div class="reh">${_ICO('zap')}<span>AAP가 다시 분석 중</span><span class="reph" id="reph"></span></div><div class="resub" id="reint"></div><div class="reprog"><i id="reprog"></i></div><div id="resteps"></div></div>`;
    rs.appendChild(ov);
  }
  const intEl=ov.querySelector('#reint'); if(intEl)intEl.textContent=opts.intent||'의도 변경 반영';
  const prog=ov.querySelector('#reprog'); if(prog)prog.style.width='0%';
  const cont=ov.querySelector('#resteps'); if(cont)cont.innerHTML='';
  const phEl=ov.querySelector('#reph'); if(phEl)phEl.textContent='';
  ov.classList.add('show');
  const steps=(opts.steps&&opts.steps.length)?opts.steps:[
    {t:'의도 해석', d:opts.intent||'', tag:'읽기'},
    {t:'재계산', d:opts.mono||'', tag:'평가'},
    {t:'재랭킹·근거 갱신', d:'순위 비교 중…', tag:'판정'},
  ];
  const n=steps.length;
  let i=0;
  function finish(){
    if(prog)prog.style.width='100%';
    if(phEl)phEl.textContent='반영';
    setTimeout(()=>{ ov.classList.remove('show'); if(busyEl)busyEl.classList.remove('live-busy'); _LIVE_BUSY=false;
      if(opts.onDone)opts.onDone();
    }, RE_T.done);
  }
  function next(){
    if(i>=n){ finish(); return; }
    const s=steps[i];
    const tagCls=RE_TAG[s.tag]||'';
    /* 작동중 상태로 등장(파랑 펄스 spinner) — 충분히 머무름 → basis 노출 */
    cont.insertAdjacentHTML('beforeend',
      `<div class="rstep doing" id="rs${i}"><div class="rsi spin" id="rsi${i}"></div>`+
      `<div class="rstx"><div class="rst">${s.t}${s.tag?`<span class="rtag ${tagCls}">${s.tag}</span>`:''}</div>`+
      `<div class="rsd" id="rsd${i}">${s.d||''}</div>`+
      `${s.basis?`<div class="rsb" id="rsb${i}">${s.basis}</div>`:''}</div></div>`);
    if(phEl)phEl.textContent=`${i+1}/${n} · ${s.t}`;
    setTimeout(()=>{ const e=document.getElementById('rs'+i); if(e)e.classList.add('vis'); },RE_T.reveal);
    /* basis 가 뒤따라 타이핑되듯 등장(중간 작동 강조) */
    if(s.basis)setTimeout(()=>{ const b=document.getElementById('rsb'+i); if(b)b.classList.add('on'); },RE_T.reveal+260);
    setTimeout(()=>{
      const e=document.getElementById('rs'+i); if(e){ e.classList.remove('doing'); e.classList.add('ok'); }
      const icon=document.getElementById('rsi'+i); if(icon){ icon.classList.remove('spin'); icon.classList.add('done'); icon.innerHTML=_ICO('check'); }
      if(prog)prog.style.width=Math.round((i+1)/n*100)+'%';
      i++; setTimeout(next,RE_T.gap);
    }, RE_T.work);
  }
  next();
}
window.AAP_LIVE={ run:runReanalysis, busy:liveBusy };

/* ── 수치 트윈(깜빡임 제거 보강) — data-numtween="키" 의 옛값→새값으로 숫자만 부드럽게 모핑.
   재렌더 직후 oldVals(capture)와 비교해 변한 값만 카운트업/다운. 깜빡 스냅 ✕. ── */
function numCapture(container){ const m={}; if(!container)return m;
  container.querySelectorAll('[data-numtween]').forEach(el=>{ m[el.dataset.numtween]=parseFloat((el.textContent||'').replace(/[^\d.\-]/g,'')); }); return m; }
function numPlay(container, oldVals){ if(!container||!oldVals)return;
  container.querySelectorAll('[data-numtween]').forEach(el=>{
    const k=el.dataset.numtween, to=parseFloat((el.textContent||'').replace(/[^\d.\-]/g,'')), from=oldVals[k];
    if(from==null||isNaN(from)||isNaN(to)||from===to)return;
    const suf=el.dataset.numsuf||'', dec=el.textContent.indexOf('.')>=0?1:0, t0=performance.now(), dur=520;
    el.classList.add('num-live');
    function step(now){ const p=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-p,3), v=from+(to-from)*e;
      el.textContent=(dec?v.toFixed(1):Math.round(v))+suf;
      if(p<1)requestAnimationFrame(step); else { el.textContent=(dec?to.toFixed(1):Math.round(to))+suf; el.classList.remove('num-live'); } }
    requestAnimationFrame(step);
  });
}
window.AAP_NUM={ capture:numCapture, play:numPlay };

/* ── ③ FLIP — data-flip 키로 옛 위치 기록 → 재렌더 후 옛→새 위치 활강(깜빡임 제거). ──
   capture(container) = 재렌더 직전 호출(맵 반환). play(container, map) = 재렌더 직후 호출. */
function flipCapture(container){
  const m={}; if(!container)return m;
  container.querySelectorAll('[data-flip]').forEach(el=>{ m[el.dataset.flip]=el.getBoundingClientRect().top; });
  return m;
}
function flipPlay(container, oldTop){
  if(!container||!oldTop)return;
  container.querySelectorAll('[data-flip]').forEach(el=>{
    const k=el.dataset.flip;
    if(oldTop[k]!=null){
      const dy=oldTop[k]-el.getBoundingClientRect().top;
      if(dy){ el.style.transition='none'; el.style.transform='translateY('+dy+'px)';
        requestAnimationFrame(()=>{ el.style.transition='transform .5s cubic-bezier(.4,0,.2,1)'; el.style.transform=''; }); }
    } else { el.style.opacity='0'; requestAnimationFrame(()=>{ el.style.transition='opacity .4s'; el.style.opacity=''; }); }
  });
}
window.AAP_FLIP={ capture:flipCapture, play:flipPlay };

/* =========================================================================
   코어 일반 "데이터→콘솔" 렌더 (renderDataConsole) — 수렴 §3 표준 (single-case shape)
   ───────────────────────────────────────────────────────────────────────
   팩 surface 함수 없이 데이터만으로 조작형 결정 콘솔을 그린다:
     · caseModel.slots          → 케이스 슬롯 패널(값·출처·추출방식 · money/risk 메타 힌트)
     · STATE.verdict(evaluate)  → 판정 카드(outcome·basis·ruleId · OUTCOME 색 매핑은 코어)
     · knowledge.lookupTables   → 참조 룩업(보조 표)
     · io.editable(임계)        → steering 바 → evalCase 재실행 → verdict 갱신
   계약(contract_a)이 손코딩했던 opstage 를 코어로 추출 — 구매·경비는 surface 0줄로 동일 콘솔.
   ct-/op- 클래스 재사용. 갱신은 renderOpConsole 의 opSection 부분갱신(통째 교체 ✕ · 깜빡임 0).
   ========================================================================= */
/* outcome → 표시 메타(green/amber/red). 도메인 무관 3분기(AUTO_APPROVE/LEGAL_REVIEW/REJECT). */
const DC_OUTCOME={
  AUTO_APPROVE:{ko:'자동승인', cls:'ok',   ic:'check-circle',   sub:'자동 진행 가능 — 마지막 확인'},
  LEGAL_REVIEW:{ko:'검토(HITL)', cls:'warn', ic:'user-check',    sub:'사람이 확정해야 하는 지점(HITL)'},
  REJECT:      {ko:'반려',     cls:'risk', ic:'alert-triangle', sub:'치명 결격 — 자동 진행 차단'},
};
function dcOutcome(o){ return DC_OUTCOME[o]||{ko:o||'—',cls:'info',ic:'info',sub:''}; }
const DC_EXKO={rule:'규칙', doc:'문서추출', connector:'커넥터', manual:'사람 보완', model:'모델'};
function dcWon(n){ n=Number(n); if(isNaN(n))return null; return n.toLocaleString('ko-KR')+'원'; }
function dcManwon(n){ n=Number(n); if(isNaN(n))return null; return n>=10000?(Math.round(n/10000)).toLocaleString('ko-KR')+'만원':dcWon(n); }
/* 슬롯 메타 헬퍼 — caseModel.slots 인덱스(현 팩) */
function dcSlots(){ const cm=PACK&&PACK.caseModel; return (cm&&Array.isArray(cm.slots))?cm.slots:[]; }
function dcSlotByKey(){ if(!PACK)return {}; if(PACK._dcSlotIdx)return PACK._dcSlotIdx; const idx={}; dcSlots().forEach(s=>idx[s.key]=s); PACK._dcSlotIdx=idx; return idx; }
function dcIsMoney(s){ return !!(s&&(s.money||s.type==='money')); }
/* 슬롯 표시값(타입·money·array·boolean·unit) */
function dcSlotVal(C,key){
  const cd=(C&&C.S&&C.S.caseData)||{}; let v=cd[key]; const s=dcSlotByKey()[key];
  if(v==null||v===''||(Array.isArray(v)&&!v.length))return null;
  if(dcIsMoney(s)){ const m=dcManwon(v); if(m!=null)return m; }
  if(s&&s.type==='boolean')return v?'예':'아니오';
  if(Array.isArray(v))return v.join('·');
  if(s&&s.unit)return v+s.unit;
  return String(v);
}
/* 요약 그리드 슬롯(primary) — 팩 caseModel.primary 우선, 없으면 휴리스틱(앞쪽 + money/risk + verdict.inputs) */
function dcPrimary(C){
  const cm=PACK&&PACK.caseModel; if(cm&&Array.isArray(cm.primary)&&cm.primary.length)return cm.primary;
  const slots=dcSlots(); const v=C&&C.S&&C.S.verdict; const used=v&&v.inputs?Object.keys(v.inputs):[];
  const pick=[]; const add=k=>{ if(k&&!pick.includes(k)&&dcSlotByKey()[k])pick.push(k); };
  used.forEach(add);                                  /* 판정에 쓰인 슬롯 우선 */
  slots.forEach(s=>{ if(pick.length<8&&(dcIsMoney(s)||s.risk))add(s.key); });
  slots.forEach(s=>{ if(pick.length<8)add(s.key); }); /* 앞쪽 채움 */
  return pick.slice(0,8);
}
/* 판정 카드 — verdict(outcome/basis/ruleId/inputs) 일반 렌더 */
function dcVerdictCard(C){
  const v=C&&C.S&&C.S.verdict, slotIdx=dcSlotByKey();
  if(!v){ return `<div class="ct-vd info"><div class="ct-vd-h">판정 준비 중</div><div class="ct-vd-b">접수·점검이 끝나면 결정 룰이 판정합니다.</div></div>`; }
  const m=dcOutcome(v.outcome);
  const reflow=!!(C&&C.S&&C.S.dcReflow);
  const inputs=v.inputs?Object.keys(v.inputs):[];
  const chips=inputs.slice(0,6).map(k=>{ const s=slotIdx[k]; const lab=s?s.label:k; let val=v.inputs[k];
    if(Array.isArray(val))val=val.length?val.join('·'):'없음'; if(typeof val==='boolean')val=val?'예':'아니오';
    if(dcIsMoney(s)){ const mm=dcManwon(val); if(mm!=null)val=mm; }
    return `<span class="ct-vchip">${lab} <b>${val}</b></span>`; }).join('');
  return `<div class="ct-vd ${m.cls}${reflow?' reflow':''}">
    <div class="ct-vd-top"><span class="ct-vd-ic">${_ICO(m.ic)}</span>
      <div><div class="ct-vd-h">${m.ko}<span class="ct-vd-tag">AAP 판단<span class="dc-tech"> · verdict</span></span></div><div class="ct-vd-sub">${dcText(v.label,'verdict.label')||m.sub}</div></div></div>
    <div class="ct-vd-basis"><span class="ct-vd-bk">근거</span>${v.basis||v.label}</div>
    <div class="ct-vd-rule"><span class="dc-tech">규칙 <b>${v.ruleId}</b> · </span>같은 입력이면 늘 같은 결정 ${v.reproducible?'✓':''}</div>
    ${chips?`<div class="ct-vchips"><span class="ct-vchips-k">판정에 쓰인 슬롯</span>${chips}</div>`:''}</div>`;
}
/* 슬롯 상태 분류(도메인 무관) — red(.crit)=판정이 실제로 쓴 결격 슬롯(REJECT inputs)만 / amber(.attn)=주의(gap·검토 inputs) / 그 외 중립.
   risk:true 라도 verdict 가 인용하지 않았거나 자동승인이면 중립 → "슬롯 절반이 분홍" 경보 과잉 제거. */
function dcSlotTone(C,key){
  const s=dcSlotByKey()[key]; if(!s)return '';
  const v=C&&C.S&&C.S.verdict; const used=(v&&v.inputs)?v.inputs:null; const inUse=!!(used&&key in used);
  if(v&&v.outcome==='REJECT'&&inUse)return ' crit';            /* 치명: 반려 판정이 실제 인용 → red */
  if(s.gap)return ' attn';                                     /* 미정·보완 필요 → amber */
  if(v&&v.outcome==='LEGAL_REVIEW'&&inUse&&s.risk)return ' attn'; /* 검토로 회부된 위험 슬롯 → amber(주의, 경보 ✕) */
  return '';
}
/* 슬롯 패널(요약 + 펼침 전체) — primary 는 group 으로 묶어 소제목+여백(콩나물 ✕) */
function dcSlotPanel(C){
  const open=!!(C&&C.S&&C.S.dcSlotsOpen); const slotIdx=dcSlotByKey();
  const cell=(key)=>{ const s=slotIdx[key]; if(!s)return ''; const val=dcSlotVal(C,key);
    return `<div class="ct-slot${dcSlotTone(C,key)}"><div class="ct-slot-k">${s.label}<span class="ct-slot-src">${DC_EXKO[s.extract]||s.extract||''}</span></div>
      <div class="ct-slot-v">${val==null?'<span class="ct-slot-na">미추출</span>':val}</div></div>`; };
  const prim=dcPrimary(C); const primSet=new Set(prim);
  /* primary 를 슬롯 group 순서대로 묶음 — group 메타 없으면 단일 그리드(graceful) */
  const groups=[]; const gidx={};
  prim.forEach(k=>{ const s=slotIdx[k]; if(!s)return; const g=s.group||''; if(!(g in gidx)){ gidx[g]=groups.length; groups.push({g,keys:[]}); } groups[gidx[g]].keys.push(k); });
  const multiGroup=groups.length>1;
  const primHtml=multiGroup
    ? groups.map(gr=>`${gr.g?`<div class="ct-grp">${gr.g}</div>`:''}<div class="ct-slots">${gr.keys.map(cell).join('')}</div>`).join('')
    : `<div class="ct-slots">${prim.map(cell).join('')}</div>`;
  const rest=dcSlots().filter(s=>!primSet.has(s.key)).map(s=>cell(s.key)).join('');
  return `<div class="ct-wh"><span class="op-t">이 건의 정보</span><span class="op-c">값 · 출처 · 확인 방식<span class="dc-tech"> · caseModel</span></span>
      <button class="ct-slot-more" data-dcslots>${open?'접기':'전체 슬롯'}</button></div>
    ${primHtml}
    ${open?`<div class="ct-grp">전체 슬롯</div><div class="ct-slots rest">${rest}</div>`:''}`;
}
/* 좌 main = 이 건의 정보(슬롯)만. 결정(판정카드+HITL바)은 우측 aside 로 이동(전 유형 셸 통일:
   좌=도메인 정보·작업 / 우=결정·근거 레일). steer(임계)는 renderDataConsole 가 main 상단에 흡수. */
function dcMain(C){ return dcSlotPanel(C); }
/* 결정 블록(판정카드 + HITL바) — aside 상단에 둠(회의 streamHitlCard 와 같은 자리). */
function dcDecision(C){
  const v=C&&C.S&&C.S.verdict;
  const w=C.W(C.S.sel); const atGate=stIsGate(w);
  const hitl=v&&v.outcome!=='AUTO_APPROVE';
  return `<div class="ct-vd-wrap">${dcVerdictCard(C)}</div>
    ${atGate?`<div class="op-hitlbar ${hitl?'':'auto'}">
      <div><div class="op-hi">${_ICO(hitl?'user-check':'check-circle')}${hitl?'사람이 확정해야 하는 지점 (HITL)':'자동 진행 가능 — 마지막 확인'}</div>
        <div class="op-hs">${hitl?'책임 걸린 분기를 사람에게 넘겼습니다. 임계를 조정하면 판정이 다시 갈립니다.':'전 점검 통과·임계 내 — 자동 진행 준비.'}</div></div>
      <button class="op-hbtn" data-dcgate="${w.id}">${hitl?'검토 큐로 확정':'판정 확인'}</button></div>`:''}`;
}
/* io.editable(임계) 현재값 */
function dcEditable(){ const io=PACK&&PACK.io; return (io&&Array.isArray(io.editable))?io.editable:[]; }
function dcThOf(C,e){ const ov=C&&C.S&&C.S.thresholdOv; const k=e.slot||e.key; return (ov&&k in ov)?ov[k]:e.def; }
/* steering 바 = io.editable 임계(opts 있는 항목만) */
function dcSteer(C){
  const eds=dcEditable().filter(e=>Array.isArray(e.opts)&&e.opts.length);
  if(!eds.length)return '';
  const grp=(e)=>{ const cur=dcThOf(C,e); const key=e.slot||e.key;
    const btns=e.opts.map(o=>{ const val=Array.isArray(o)?o[0]:o.val; const lab=Array.isArray(o)?o[1]:o.label;
      return `<button class="op-opt ${cur===val?'on':''}" data-steer="${key}" data-steerval="${val}">${lab}</button>`; }).join('');
    return `<div class="op-sg"><span class="op-lab">${e.label}</span><div class="op-opts">${btns}</div></div>`; };
  return `<div class="op-steer"><span class="op-steer-h">${_ICO('sliders-horizontal')}조정 가능한 임계</span>
    <div class="op-sgs">${eds.map(grp).join('')}</div>
    <span class="op-snote">${_ICO('info')}임계를 바꾸면 AAP가 다시 판정합니다 (chat 아님 · 직접 조종)</span></div>`;
}
/* 참조 룩업 — knowledge.lookupTables 일반 렌더(두 shape 호환: entries=[[k,v]] 또는 [{match,result}]) */
function dcLookups(C){
  const kn=PACK&&PACK.knowledge; const lts=(kn&&Array.isArray(kn.lookupTables))?kn.lookupTables:[];
  if(!lts.length)return '';
  return lts.map(lt=>{
    const ents=(lt.entries||[]).map(e=>Array.isArray(e)?{k:e[0],v:e[1]}:{k:e.match||e.k||'',v:e.result||e.v||''});
    const rows=ents.map(({k,v})=>`<div class="ct-lk-r"><span class="ct-lk-k">${k}</span><span class="ct-lk-v">${v}</span></div>`).join('');
    return `<div class="ct-lk"><div class="ct-lk-h">${_ICO(lt.icon||'list-checks')}${lt.label||lt.description||lt.id}</div>${rows}</div>`;
  }).join('');
}
function dcFstep(ic,t,d,cls){ return `<div class="op-fstep ${cls||''}"><span class="op-fd">${_ICO(ic)}</span><div class="op-ftx"><b>${t}</b><div class="op-fmono">${d}</div></div></div>`; }
/* aside = 결정(판정카드+HITL) + 'AAP가 한 일' 흐름 + 참조 룩업. 결정·근거 레일(전 유형 통일). */
function dcAside(C){
  const v=C&&C.S&&C.S.verdict; const m=v?dcOutcome(v.outcome):null;
  const lks=dcLookups(C);
  const inputs=v&&v.inputs?Object.keys(v.inputs):[];
  const evRows=inputs.slice(0,4).map(k=>{ const val=dcSlotVal(C,k); return dcFstep('check', (dcSlotByKey()[k]?dcSlotByKey()[k].label:k), val==null?'—':val); }).join('');
  return `${dcDecision(C)}
    <div class="op-sh">AAP가 한 일 · 근거 <span>보조</span></div>
    <div class="op-flow">
      ${evRows||dcFstep('check','정보 확인','문서·연결 시스템·규칙으로 채움')}
      ${dcFstep('arrow-right','AAP 판단', v?(m.ko+'<span class="dc-tech"> · '+v.ruleId+'</span>'):'대기','v')}
    </div>
    ${lks?`<div class="op-sh">참조 기준 <span>제도·규정<span class="dc-tech"> · 지식·시맨틱 L4</span></span></div><div class="ct-lks">${lks}</div>`:''}`;
}
/* opstage 산출 = {steer,main,aside} — 팩 surface 가 없을 때 코어가 동일 콘솔을 일반 렌더 */
function renderDataConsole(C){ return { steer:dcSteer(C), main:dcMain(C), aside:dcAside(C) }; }   /* steer=renderOpConsole 가 main 상단 흡수 · 결정=aside */

/* 코어 일반 HITL/완료 모달 — 팩 surface.cmodal 없을 때(데이터 주도). verdict·결재 일반 렌더. */
function dcCmodal(kind,C){
  const sel=C.S.sel, v=C.S.verdict, slotIdx=dcSlotByKey();
  if(kind==='hitl'){
    const m=v?dcOutcome(v.outcome):null;
    const inputs=v&&v.inputs?Object.keys(v.inputs):[];
    const ev=inputs.slice(0,6).map(k=>{ const s=slotIdx[k]; let val=v.inputs[k];
      if(Array.isArray(val))val=val.length?val.join('·'):'없음'; if(typeof val==='boolean')val=val?'예':'아니오';
      if(dcIsMoney(s)){ const mm=dcManwon(val); if(mm!=null)val=mm; }
      return `<div class="ed-prev-r"><span class="ed-prev-nm">${s?s.label:k}</span><span class="ed-prev-mt">${val}</span></div>`; }).join('');
    return `<div class="cmodal-h">분기 판정을 확인해 주세요</div>
      <div class="cmodal-sub">AAP가 슬롯·임계로 결정 룰을 돌려 판정했습니다. 임계를 조정하면 판정이 다시 갈립니다.</div>
      <div class="rv">
        <div class="rv-sec"><div class="rv-k">판정(verdict)</div><div class="rv-sum"><b class="ct-vd-inline ${m?m.cls:''}">${m?m.ko:'—'}</b> · ${v?v.basis:''}</div></div>
        <div class="rv-sec"><div class="rv-k">룰</div><div class="rv-sum">${v?v.ruleId:'—'} · 결정론 재현 ${v&&v.reproducible?'✓':''}</div></div>
      </div>
      ${ev?`<div class="ed-prev"><div class="ed-prev-h">판정에 쓰인 슬롯</div>${ev}</div>`:''}
      <div class="cmodal-actions"><button class="cp-btn primary" data-yes>판정대로 진행</button><button class="cp-btn ghost" data-no>재검토 회부</button></div>`;
  }
  return '';
}
/* 코어 일반 steering 핸들러 — 팩 surfaceHooks.steerHook 없을 때. 임계 오버레이 갱신 → evalCase 재실행. */
function dcSteerHook(S,key,val){
  const eds=dcEditable(); const e=eds.find(x=>(x.slot||x.key)===key)||{}; const num=Number(val);
  S.thresholdOv=S.thresholdOv||{}; S.thresholdOv[key]=isNaN(num)?val:num;
  if(window.AAP_evalCase)window.AAP_evalCase();
  const v=S.verdict, ko=v?dcOutcome(v.outcome).ko:'—';
  S.dcReflow=true;
  return { intent:(e.label||key)+' → '+val, mono:'evaluate 재실행 · '+(e.label||key)+' '+val,
    steps:[
      {t:'슬롯 읽기',tag:'읽기',d:'caseData 슬롯 로드',basis:'결정 슬롯값 + 임계 오버레이 병합'},
      {t:'임계 평가',tag:'평가',d:(e.label||key)+' = '+val,basis:(e.note||'임계 조정 → 분기 경계 이동')},
      {t:'route 판정',tag:'판정',d:'위→아래 첫 매칭 룰 → '+ko,basis:'evaluate(case,knowledge) · '+(v?v.ruleId:'—')+' · basis 추적'+(v&&v.reproducible?' · 결정론 재현 ✓':'')}
    ],
    trace:{st:'분기 판정', t:(e.label||key)+' 조정 → '+val+' · 판정 '+ko, L:'L7', k:'HITL'} };
}
/* 코어 일반 surface 배선 — [data-dcslots] 슬롯 펼침 / [data-dcgate] 게이트 이동(팩 wire 없을 때) */
function dcWire(root){
  root.querySelectorAll('[data-dcslots]').forEach(el=>el.onclick=()=>{ STATE.dcSlotsOpen=!STATE.dcSlotsOpen; renderOpConsole(); });
  root.querySelectorAll('[data-dcgate]').forEach(el=>el.onclick=()=>{ if(window.AAP_CORE)window.AAP_CORE.go(el.dataset.dcgate); });
}
/* 팩이 결정 데이터(caseModel.slots + knowledge.route)를 갖췄는지 — 코어 일반 콘솔 자격 */
function hasDataConsole(){ return !!(PACK&&PACK.caseModel&&Array.isArray(PACK.caseModel.slots)&&PACK.caseModel.slots.length
  &&PACK.knowledge&&PACK.knowledge.route&&window.AAP_EVALUATE); }
/* opstage 산출자 — 팩 surface.opstage 우선, 없으면 코어 일반 renderDataConsole,
   둘 다 없어도 flow 만 있으면 stream 콘텐츠를 op-골격(상단 strip + 좌 main/우 aside)에 담아 통일.
   → 전 유형이 같은 프레임(B): 결정형=슬롯·판정 / 진행형(회의·VOC)=작업흐름·산출물. 위>아래 스트림 레이아웃 폐기. */
function opstageOf(C){
  if(PACK.surface&&PACK.surface.opstage)return PACK.surface.opstage(C);
  if(hasDataConsole())return renderDataConsole(C);
  if((WORK||[]).length)return { main:streamFocus(C), aside:streamArts(C), _stream:true };
  return null;
}

/* 조작형 surface 활성 여부 — flow 가 있는 모든 팩은 op-골격으로 렌더(stream 폴백 포함).
   flow 조차 없는 팩만 false → 기존 streamSplit 셸로 graceful(무회귀). */
function hasOpSurface(C){ return !!opstageOf(C); }

/* ── 의도 steering 핸들러(코어 일반) — [data-steer] 컨트롤 클릭 → 팩 steerHook 으로 STATE 갱신 →
   라이브 재분석 애니 → FLIP 으로 조작형 본문 재렌더. recompute 는 팩(결정론)이 소유. ──
   data-steer = 그룹키, data-steerval = 값. 팩 steerHook(S,key,val)→{intent,mono,steps?,instant?} 반환. */
function wireSteer(root){
  const hk=PACK.surfaceHooks;
  const steerHook=(hk&&hk.steerHook)?hk.steerHook:(hasDataConsole()?dcSteerHook:null);
  if(!steerHook)return;
  const reflowKeys=(hk&&Array.isArray(hk.reflowKeys))?hk.reflowKeys:['dcReflow'];
  root.querySelectorAll('[data-steer]').forEach(b=>b.onclick=()=>{
    if(_LIVE_BUSY)return;   /* 연속 클릭 잠금 */
    const key=b.dataset.steer, val=b.dataset.steerval;
    const meta=steerHook(STATE,key,val)||{};
    afterStateChange();
    if(meta.instant){ /* 즉시 반영(재분석 없이) = 분기 등 — FLIP/트윈은 renderOpConsole 섹션 모핑이 처리(통째 교체 ✕) */
      renderOpConsole();
      if(meta.trace)STATE.trace.push(meta.trace); if(meta.toast)toast(meta.toast); return;
    }
    if(meta.trace)STATE.trace.push(meta.trace);
    runReanalysis({ intent:meta.intent, mono:meta.mono, steps:meta.steps, onDone:()=>{
      /* ★ 재분석 결과를 모달로 명시(옵션 변경이 '먹혔다' + 전/후 + 로직·근거) — 값 변화·판단을 자세히 */
      if(meta.diff||meta.steps){ STATE.reResult={ intent:meta.intent, mono:meta.mono, steps:meta.steps, diff:meta.diff }; }
      else if(meta.toast){ toast(meta.toast); }
      renderOpConsole();   /* 섹션 모핑 + renderCModal(결과 모달 표출) */
      /* pack 선언 reflow 키 = 1회 pulse 후 클리어(애니 끝난 뒤) → 다음 렌더부터 정상 */
      if(reflowKeys&&reflowKeys.length)setTimeout(()=>{ reflowKeys.forEach(k=>{ delete STATE[k]; }); },1200);
      afterStateChange();
    }});
  });
}

/* ===== 실행 콘솔 렌더 (run 뷰 = 업무가 돌아가는 도메인 화면이 메인) =====
   유저 정정(되돌림): 실행 뷰 메인 = 'AAP 작동 구조'가 아니라 '그 업무가 실제로 돌아가는 화면'.
   per-도메인 surface(PACK.surface=ATS 보드 / surfaceSpec)를 #surfHead/#surfBody 에 렌더하고,
   단계 진행(RUN.phase/STATE.sel)에 따라 살아 움직이게 한다(surface 가 C=ctx 의 S/R 을 읽어 반영).
   HITL/결과/미리보기 오버레이(#cmodal)는 그대로. AAP 작동은 우측 얇은 근거 레일(renderRight). */
/* run 메인 = 조작형 surface(opstage) ▷ 폴백 = 작업 스트림 + 산출물 뷰어 (목업 v0.3).
   안정 ID 보존: #surfHead(숨김)·#surfBody(컨테이너)·#flow/#explain(숨김 마운트, renderRight·demo 호환). */
function renderConsole(){
  const C=ctx();
  if(hasOpSurface(C)){ renderOpConsole(); return; }
  /* 워크스페이스 탭 바·헤더는 스트림 모델에서 사용 안 함(빈 채로 두고 CSS 로 접음) */
  const tb=document.getElementById('wsTabs'); if(tb)tb.innerHTML='';
  const sh=document.getElementById('surfHead'); if(sh){ sh.innerHTML=''; const rs=sh.closest('.run-surface'); if(rs){rs.classList.add('ws-on-stream'); rs.classList.remove('ws-on-progress'); rs.classList.remove('ws-on-op');} }
  const sb=document.getElementById('surfBody');
  if(sb){ sb.classList.add('stream-body'); sb.classList.remove('ws-progress-body'); sb.classList.remove('op-body');
    sb.innerHTML=streamSplit(C); wireSurface(sb); wireStream(sb); }
  renderCModal();
}
/* ── 조작형 콘솔(opstage) — 상단 단계 strip + 의도 steering 바 + 조작형 본문(메인) + 보조 레이어 ──
   레이아웃은 코어 일반(도메인 무관). strip/steer/main/aside HTML 은 팩 surface 가 제공.
   안정 ID(#surfHead/#surfBody/#flow/#explain) 보존: surfHead=strip+steer, surfBody=main+aside.

   ★ 완성 기준 §2-D(깜빡임 0) — 부분 갱신 구조:
   - 뼈대(strip 래퍼·steer 슬롯·op-split·op-main·op-aside·hidden-mount·그래프 컨테이너)는
     케이스/구조 진입 시 ★1회만 마운트. 이후 어떤 갱신도 surfHead/surfBody 를 통째 innerHTML 교체하지 않는다.
   - 갱신은 섹션 단위 메모 모핑(opSection): 새 HTML 이 직전과 동일하면 DOM 을 아예 건드리지 않고(재생성 0),
     달라진 섹션만 FLIP 활강 + 수치 트윈 + 그래프 엣지/노드 트랜지션으로 제자리 갱신.
   - revealOps 의 단계 진행 틱(같은 단계 내 reveal 증가)은 op-surface HTML 이 사실상 불변 → 전 섹션 skip(번쩍임 0).
   - steering(섹션 HTML 변경)만 해당 섹션이 부드럽게 모핑. strip/steer 바/그래프 컨테이너는 재생성 안 됨. */
function _opSig(html){ /* 가벼운 서명(djb2) — 섹션 변경 감지(통째 비교 비용 절감) */
  html=html||''; let h=5381; for(let i=0;i<html.length;i++){ h=((h<<5)+h+html.charCodeAt(i))|0; } return h+'#'+html.length;
}
/* 조작형 콘솔 뼈대를 1회 마운트(이미 있으면 재사용). 섹션 슬롯·hidden-mount·그래프 컨테이너를 안정 ID 로 고정. */
function ensureOpSkeleton(sh,sb){
  let mounted=true;
  if(sh && !sh.querySelector('#opStripSlot')){
    sh.innerHTML=`<div class="op-strip-wrap" id="opStripSlot"></div>`;   /* steer 밴드 폐지 → main 상단 흡수(renderOpConsole) */
    mounted=false; delete sh.dataset.opStripSig;
  }
  if(sb && !sb.querySelector('.op-split')){
    sb.classList.add('op-body'); sb.classList.remove('stream-body','ws-progress-body');
    /* hidden-mount(#explain/#caseTune/#flow)는 섹션 모핑에 영향받지 않도록 op-aside 안의 영구 형제로 둔다(renderRight·demo 호환). */
    sb.innerHTML=`<div class="op-split">`+
      `<section class="op-main" id="opMainSlot"></section>`+
      `<aside class="op-aside"><div class="op-aside-slot" id="opAsideSlot"></div>`+
      `<div class="op-hidden-mount"><div id="explain"></div><div class="case-tune" id="caseTune"></div><div class="flow" id="flow"></div></div>`+
      `</aside></div>`;
    mounted=false; delete sb.dataset.opMainSig; delete sb.dataset.opAsideSig;
  } else if(sb){ sb.classList.add('op-body'); sb.classList.remove('stream-body','ws-progress-body'); }
  return mounted;
}
/* 섹션 1개 제자리 갱신 — 동일하면 skip(재생성 0), 다르면 FLIP/트윈으로 모핑. owner=서명 저장 dataset 보유 요소. */
function opSection(slot, html, owner, sigKey, opts){
  if(!slot)return false;
  html=html||''; opts=opts||{};
  const sig=_opSig(html);
  if(owner.dataset[sigKey]===sig)return false;   /* ★ 변경 없음 → DOM 미접촉(통째 교체 0·번쩍임 0) */
  const animate=opts.animate && owner.dataset[sigKey]!==undefined && owner.dataset[sigKey]!=='';
  let cap=null,num=null;
  if(animate){ cap=flipCapture(slot); num=numCapture(slot); }
  slot.innerHTML=html;
  owner.dataset[sigKey]=sig;
  if(animate){ requestAnimationFrame(()=>{ flipPlay(slot,cap); numPlay(slot,num); }); }
  return true;
}
function renderOpConsole(){
  const C=ctx();
  const tb=document.getElementById('wsTabs'); if(tb)tb.innerHTML='';
  const rs=document.querySelector('.run-surface'); if(rs){ rs.classList.add('ws-on-op'); rs.classList.remove('ws-on-stream','ws-on-progress'); }
  const sh=document.getElementById('surfHead');
  const sb=document.getElementById('surfBody');
  const op=opstageOf(C)||{};
  const wasMounted=ensureOpSkeleton(sh,sb);   /* 뼈대 1회 마운트 — 이후엔 섹션만 갱신(통째 교체 ✕) */
  /* ── 섹션별 부분 갱신: 변경된 슬롯만 모핑(strip/steer/main/aside) ── */
  if(sh){
    const stripSlot=sh.querySelector('#opStripSlot');
    opSection(stripSlot, opStageStrip(C), sh, 'opStripSig', {animate:false});
  }
  if(sb){
    const mainSlot=sb.querySelector('#opMainSlot');
    const asideSlot=sb.querySelector('#opAsideSlot');
    /* steer(임계 튜너)는 main 상단에 흡수 — 떠있는 밴드 폐지(전 유형 셸 통일). op-main 안 op-steer = 인라인 카드(CSS). */
    const mainChanged=opSection(mainSlot, (op.steer||'')+(op.main||''), sb, 'opMainSig', {animate:true});
    const asideChanged=opSection(asideSlot, op.aside||'', sb, 'opAsideSig', {animate:true});
    if(mainChanged||asideChanged||!wasMounted){ wireSurface(sb); wireSteer(sb); wireStream(sb); }
    /* 그래프 = aside 슬롯이 새로 그려졌을 때만 재배선(불변이면 컨테이너·엣지 유지 → 재생성 0) */
    if((asideChanged||!wasMounted) && PACK.surface&&PACK.surface.opgraph)PACK.surface.opgraph(C, sb.querySelector('#opGraph'));
  }
  renderCModal();
}
/* 단계 strip(코어 일반) — 직전·현재·다음 3노드 윈도(8단 전체 나열 ✕ · 옛 renderSeq 패턴).
   클릭=그 단계로 탐색(setSel). 같은 줄 우측에 케이스 요약(요청·진행) 인라인 → 상단 밴드 1줄로 압축. */
function opStageStrip(C){
  const flow=WORK||[]; const ci=idxOf(STATE.sel);
  let nodes='';
  for(let d=-1;d<=1;d++){ const i=ci+d; if(i<0||i>=flow.length)continue;
    const w=flow[i]; if(!w)continue;
    const st=i<ci?'done':(i===ci?'on':'wait'); const gate=stIsGate(w);
    if(d>0||(d===0&&i>0))nodes+=`<span class="op-sar">${_ICO('chevron-right')}</span>`;
    nodes+=`<button class="op-snode ${st}${gate?' gate':''}" data-opstep="${w.id}">
      <span class="op-sn">${st==='done'?_ICO('check'):(gate?_ICO('user-check'):i+1)}</span>
      <span class="op-sl">${dcText(w.label,'step.label')}</span></button>`;
  }
  return `<div class="op-strip">${nodes}</div>${opCaseSummary(C)}`;
}
/* 케이스 요약 인라인(코어 일반) — strip 같은 줄 우측. 제목·아이콘은 상단바(caseTitle)로 이동했으니
   여기선 요청 원문 + 진행(완료/총)만. 도메인 무관(case.request + flow 길이). */
function opCaseSummary(C){
  const c=activeCase()||{}; const flow=WORK||[]; const ci=idxOf(STATE.sel);
  const total=flow.length; const doneN=Math.max(0,Math.min(ci,total));
  const req=c.request?`<span class="op-cs-req">${_ICO('flag')}"${String(c.request).replace(/^["'“”]+|["'“”]+$/g,'')}"</span>`:'';
  return `<div class="op-cs-inline">${req}<span class="op-cs-prog">${doneN}/${total} 단계</span></div>`;
}
/* =========================================================================
   작업 스트림 + 산출물 뷰어 (코어 일반 · 도메인 무관) — 목업 v0.3
   ───────────────────────────────────────────────────────────────────────
   좌 = flow 단계를 자동 누적하는 스트림(완료/진행/대기 · 5타입 구성요소 배지 · 산출물 링크 ·
        게이트=결정 대기 amber 카드, 클릭→#cmodal 모달). 우 = PACK.products 산출물 뷰어.
   채용 전용 분기 0 — flow/ops/products 에서 일반 도출. 회의·VOC 도 같은 셸(products 있으면 표시).
   ========================================================================= */
/* 스트림 단계 상태(done/cur/wait). 게이트는 결정 여부로 done/wait 보강. */
function strState(i,ci,w){
  if(stIsGate(w)){ const dec=gateDecided({decisions:STATE.decisions||{},meetPhase:STATE.meetPhase},w); if(dec)return 'done'; return i<=ci?'cur':'wait'; }
  if(i<ci)return 'done'; if(i===ci)return (RUN.phase==='working'?'cur':'done'); return 'wait';
}
/* 단계 라벨 시각(결정론 더미 · TIMES 무관) — flow 순서로 09:00+분 누적. 표시용. */
function strWhen(i){ const m=1+i*2; const hh=9+Math.floor(m/60), mm=m%60; return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'); }
/* 단계 설명 1줄 = explain(태그 제거) 우선, 없으면 첫 op feed→out. */
function strDesc(w){
  if(w._strDesc!==undefined)return w._strDesc;
  let d='';
  const op0=(w.ops&&w.ops[0])||null;
  if(op0)d=`${dcText(op0.feed,'op.feed')} → <b>${dcText(op0.out,'op.out')}</b>`;
  else if(w.explain)d=String(w.explain).replace(/<[^>]+>/g,'').slice(0,90);
  return d;
}
/* 단계에 배정된 구성요소 5타입 집합(ops 에서 dedupe, 최대 4) — 스트림 카드 배지. */
function strComps(w){
  const seen=new Set(), out=[];
  (w.ops||[]).forEach(o=>{ const tk=evidType(o); const k=tk+'|'+(o.comp||''); if(seen.has(k))return; seen.add(k);
    out.push({tk, nm:dcText(o.comp,'op.comp')}); });
  return out.slice(0,4);
}
/* ── 산출물(products) 일반 도출 — 팩 products[k].readyAt(stepId)로 '생성 시점' 결정.
   readyAt 없으면 products 등장 순서를 flow 길이에 균등 배치(graceful 폴백). 도메인 무관. */
function artKeys(){ return PACK&&PACK.products?Object.keys(PACK.products):[]; }
function artReadyStepIdx(k,ki,total){
  const d=PACK.products[k];
  if(d&&d.readyAt){ const j=idxOf(d.readyAt); if(j>=0)return j; }
  const n=(WORK||[]).length; return Math.min(n-1, Math.round(((ki+1)/Math.max(1,total))*n)-1);
}
function artReady(k,ki,total){ return idxOf(STATE.sel)>=artReadyStepIdx(k,ki,total) || RUN.phase==='done'&&idxOf(STATE.sel)>=artReadyStepIdx(k,ki,total); }
/* 단계에 연결된 산출물 키(있으면) — products[k].readyAt===step.id 인 첫 항목. 스트림 카드 '열기' 링크. */
function artForStep(wid){ const ks=artKeys(); for(const k of ks){ const d=PACK.products[k]; if(d&&d.readyAt===wid)return k; } return null; }
/* 현재 열린 산출물 키(transient) — 기본 = ready 된 마지막 것. */
function curArtK(){
  const ks=artKeys(); if(!ks.length)return null;
  if(STATE.artK&&ks.includes(STATE.artK)&&artReady(STATE.artK,ks.indexOf(STATE.artK),ks.length))return STATE.artK;
  let last=null; ks.forEach((k,i)=>{ if(artReady(k,i,ks.length))last=k; });
  return last||ks[0];
}
function streamSplit(C){
  return `<div class="strm-split">${streamLeft(C)}${streamArts(C)}</div>`;
}
/* ── 현재 단계 초점 main (stream 팩=회의·VOC) — 결정콘솔 dcMain 과 같은 밀도·척추 ──
   ① 지금 단계 카드(ct-vd 톤 + 단계별 작업뷰 perStep: overview/track/hint)
   ② 이 건의 산출물 그리드(surfaceSpec.ws → ct-slots, 계약 슬롯과 동일 밀도)
   회의·VOC 의 풍부한 데이터(perStep·ws·products)를 살려 휑한 카드 ✕ → 계약 콘솔과 같은 밀도.
   strip 중복 '전 단계 나열' 폐기 · HITL=우측 aside(streamHitlCard) · 요약=코어 밴드(opCaseSummary).
   새 CSS 0(기존 ct-/op-/od-/wl- 재사용). */
function streamFocus(C){
  const flow=WORK||[]; const ci=idxOf(STATE.sel); const w=W(STATE.sel)||{};
  const total=flow.length;
  const running=RUN.phase==='working';
  const atGate=stIsGate(w);
  const decided=atGate&&gateDecided({decisions:STATE.decisions||{},meetPhase:STATE.meetPhase},w);
  const comps=strComps(w).map(cc=>`<span class="comp ty${cc.tk}">${cc.nm}</span>`).join('');
  const SS=PACK.surfaceSpec||{}; const ps=(SS.perStep&&SS.perStep[w.id])||{};
  /* ① 지금 단계 — ct-vd 카드(결정콘솔 판정카드와 동일 톤) + 단계별 작업뷰(perStep: overview/track/hint) */
  const tone=atGate?(decided?'ok':'warn'):'info';
  const icoH=atGate?(decided?_ICO('check-circle'):_ICO('user-check')):(running?'<span class="spin sm"></span>':_ICO('arrow-right'));
  const sub=atGate?(decided?'결정 완료 — AAP가 이어서 진행했어요':'여기서 사람이 확정해야 합니다 (HITL)')
                  :(running?(ps.work||'AAP가 처리하고 있어요…'):(ps.done||w.role||'AAP 자동 처리'));
  let psBody='';
  if(ps.mode==='overview'&&Array.isArray(ps.rows))
    psBody=`<div class="op-detail">${ps.rows.map(r=>`<div class="od-row"><span class="od-k">${r[0]}</span><span class="od-v">${r[1]}</span></div>`).join('')}</div>`;
  else if(Array.isArray(ps.track)&&ps.track.length)
    psBody=`<div class="ct-vchips">${ps.track.map(t=>`<span class="comp">${running?'<span class="spin sm"></span>':_ICO('check')} ${t}</span>`).join('')}</div>`;
  else if(ps.hint)psBody=`<div class="ct-vd-sub" style="margin-top:7px">${ps.hint}</div>`;
  const cur=`<div class="ct-vd-wrap"><div class="ct-vd ${tone}">
    <div class="ct-vd-top"><span class="ct-vd-ic">${icoH}</span>
      <div><div class="ct-vd-h">${dcText(w.label,'step.label')}<span class="ct-vd-tag">${Math.min(ci+1,total)}/${total} 단계</span></div>
      <div class="ct-vd-sub">${sub}</div></div></div>
    ${strDesc(w)?`<div class="ct-vd-basis"><span class="ct-vd-bk">하는 일</span>${strDesc(w)}</div>`:''}
    ${psBody}
    ${comps?`<div class="ct-vchips">${comps}</div>`:''}</div></div>`;
  /* ② 좌 = 이 단계 작업 내역(ops: 구성요소 타입 · feed→out · detail 표). "지금 AAP가 하는 일".
     산출물(결과물)은 우측 aside(streamArts 탭·뷰어)에 있음 → 좌(작업)/우(산출물) 분리 · 중복 ✕. */
  const ops=(w.ops||[]).map(o=>{ const tk=evidType(o);
    return `<div class="se-op"><span class="se-op-ty ty${tk}">${_TYKO[tk]}</span>
      <div><span class="se-op-nm">${dcText(o.comp,'op.comp')}</span>
      <div class="se-op-d">${dcText(o.feed,'op.feed')} → <b>${dcText(o.out,'op.out')}</b></div>
      ${o.detail||''}</div></div>`; }).join('');
  const workPanel=ops?`<div class="ct-wh" style="margin-top:16px"><span class="op-t">이 단계 작업 내역</span><span class="op-c">AAP가 이 단계에서 하는 일 · 근거</span></div>
    <div class="se-ops">${ops}</div>`:'';
  return `${cur}${workPanel}`;
}
/* 우측 aside 상단 HITL 요약 카드(코어 generic surface 공통) — 게이트 미결정 시. 클릭=data-strgate→결정 모달. */
function streamHitlCard(C){
  const w=W(STATE.sel)||{}; if(!stIsGate(w))return '';
  const decided=gateDecided({decisions:STATE.decisions||{},meetPhase:STATE.meetPhase},w);
  if(decided)return '';
  return `<button class="op-hitlcard" data-strgate="${w.id}">
    <div class="op-hc-h">${_ICO('user-check')}<span class="op-hc-t">결정하기</span><span class="op-hitl-tag">결정 필요</span></div>
    <div class="op-hc-s">${strDesc(w)||w.role||'여기서 사람이 확정해야 합니다'}</div>
    <div class="op-hc-go">${_ICO('arrow-right')}클릭해 결정·근거 확인</div></button>`;
}
function streamLeft(C){
  const flow=WORK||[]; const ci=idxOf(STATE.sel); const total=artKeys().length;
  const running=RUN.phase==='working';
  let cards='';
  flow.forEach((w,i)=>{
    const st=strState(i,ci,w);
    const gate=stIsGate(w);
    const open=STATE.wsStepOpen&&STATE.wsStepOpen.has(w.id);
    const ic=st==='done'?_ICO('check'):(gate&&st!=='done'?_ICO('shield'):'');
    if(gate){
      const decided=st==='done';
      cards+=`<div class="st hitl ${st}" style="animation-delay:${Math.min(i*.05,.4)}s"><span class="nodeic">${ic||_ICO('shield')}</span>
        <button class="hitl-card ${decided?'done':''}" data-strgate="${w.id}">
          <div class="hc-k">${decided?_ICO('check'):_ICO('alert-circle')}${decided?'확인 완료':'여기서 결정이 필요해요'}</div>
          <div class="hc-t">${dcText(w.label,'gate.label')}</div>
          <div class="hc-d">${strDesc(w)||w.role||''}</div>
          ${decided?`<span class="hc-done">${_ICO('check')}결정됨 — AAP가 이어서 진행했어요</span>`:(st==='cur'?`<span class="hc-cta">${_ICO('arrow-right')}결정하기</span>`:'')}
        </button></div>`;
      return;
    }
    const comps=strComps(w).map(c=>`<span class="comp ty${c.tk}">${c.nm}</span>`).join('');
    const ak=artForStep(w.id);
    const artLink=(ak&&st==='done')?`<button class="open-art" data-strart="${ak}">${_ICO('file-text')}${PACK.products[ak].title} 열기</button>`:'';
    const hasDetail=(w.explain||(w.ops&&w.ops.length>1));
    const exp=hasDetail?`<button class="st-exp" data-strexp="${w.id}">${_ICO(open?'chevron-down':'chevron-right')}${open?'접기':'자세히'}</button>`:'';
    const spin=(st==='cur'&&running)?`<div class="st-spin"><span class="spin sm"></span>처리하고 있어요…</div>`:'';
    cards+=`<div class="st ${st}" style="animation-delay:${Math.min(i*.05,.4)}s"><span class="nodeic">${ic}</span>
      <div class="st-card">
        <div class="st-top"><span class="st-role">${w.role||''}</span><span class="st-t">${dcText(w.label,'step.label')}</span><span class="st-when">${st==='wait'?'':strWhen(i)}</span></div>
        ${st==='wait'?`<div class="st-d">${strDesc(w)}</div>`:`<div class="st-d">${strDesc(w)}</div>${spin}
        <div class="st-foot">${comps}${artLink}${exp}</div>${open?strDetail(w):''}`}
      </div></div>`;
  });
  const prog=`${Math.min(ci+1,flow.length)}/${flow.length}`;
  return `<section class="strm-left">
    <div class="strm-h">${_ICO('zap')}AAP 작업 흐름</div>
    <div class="strm-sub">AAP가 요청을 받아 스스로 처리하고 있어요. <b>결정이 필요한 곳에서만 멈춥니다.</b> · ${prog}</div>
    <div class="sline">${cards}</div>
  </section>`;
}
/* 단계 펼침 세부(explain + ops 5타입) — 스트림 카드 내부. 도메인 무관. */
function strDetail(w){
  const ex=w.explain?`<div class="se-ex">${w.explain}</div>`:'';
  const ops=(w.ops||[]).map(o=>{ const tk=evidType(o);
    return `<div class="se-op"><span class="se-op-ty ty${tk}">${_TYKO[tk]}</span><div><span class="se-op-nm">${dcText(o.comp,'op.comp')}</span><div class="se-op-d">${dcText(o.feed,'op.feed')} → <b>${dcText(o.out,'op.out')}</b></div></div></div>`;
  }).join('');
  return `<div class="st-detail">${ex}${ops}</div>`;
}
function streamArts(C){
  const ks=artKeys();
  const hitl=streamHitlCard(C);   /* (옵션B) HITL 요약 카드 우측 상단 */
  if(!ks.length)return `<aside class="strm-arts">${hitl}<div class="arts-h"><span class="at">산출물</span></div><div class="strm-doc"><div class="strm-doc-wait">${_ICO('file-text')}이 업무에는 표시할 산출물이 없습니다.</div></div></aside>`;
  const cur=curArtK();
  const tabs=ks.map((k,i)=>{ const ready=artReady(k,i,ks.length); const on=k===cur;
    return `<button class="file ${on?'on':''} ${ready?'':'wait'}" ${ready?`data-strartk="${k}"`:''}><span class="fdot"></span>${PACK.products[k].title}</button>`;
  }).join('');
  let doc;
  const curReady=cur&&artReady(cur,ks.indexOf(cur),ks.length);
  if(cur&&curReady){ const d=resolveDlv(cur,C);
    doc=`<div class="strm-doc"><div class="strm-doc-h"><span class="strm-doc-ic">${typeof d.ic==='string'&&d.ic.length<=2?d.ic:_ICO(d.ic)}</span>
      <div><h3>${d.title}</h3><div class="dm">${d.sub||''}</div></div><span class="dl">AAP 생성</span></div>
      ${d.body}
      <div class="strm-dl"><button data-strdl="open">${_ICO('external-link')}열기</button><button data-strdl="dl">${_ICO('download')}다운로드</button></div></div>`;
  } else {
    doc=`<div class="strm-doc"><div class="strm-doc-wait">${_ICO('clock')}아직 생성 전이에요.<br>AAP가 단계를 진행하면 여기에서 열립니다.</div></div>`;
  }
  return `<aside class="strm-arts">
    ${hitl}
    <div class="arts-h"><span class="at">산출물</span><span class="ac">AAP가 만든 문서 · 열어서 확인</span></div>
    <div class="files">${tabs}</div>
    ${doc}
  </aside>`;
}
/* 스트림 배선(코어 일반) — 게이트 카드→게이트 단계 이동(모달), 산출물 링크→우측 열기, 세부 펼침, 다운로드 stub. */
function wireStream(root){
  /* HITL 카드 클릭 — 이미 그 게이트 await면 즉시 결정 모달(openGate), 아니면 그 게이트로 이동 */
  root.querySelectorAll('[data-strgate]').forEach(e=>e.onclick=()=>{ const id=e.dataset.strgate; if(STATE.sel===id&&stIsGate(W(id))&&RUN.phase==='await'){ openGate(); } else { gotoGate(id); } });
  root.querySelectorAll('[data-strart]').forEach(e=>e.onclick=()=>{ STATE.artK=e.dataset.strart; renderConsole(); });
  root.querySelectorAll('[data-strartk]').forEach(e=>e.onclick=()=>{ STATE.artK=e.dataset.strartk; renderConsole(); });
  root.querySelectorAll('[data-strexp]').forEach(e=>e.onclick=()=>{ const id=e.dataset.strexp; STATE.wsStepOpen=STATE.wsStepOpen||new Set(); STATE.wsStepOpen.has(id)?STATE.wsStepOpen.delete(id):STATE.wsStepOpen.add(id); renderConsole(); });
  root.querySelectorAll('[data-strdl]').forEach(e=>e.onclick=()=>toast(e.dataset.strdl==='dl'?'다운로드를 시작합니다 (데모)':'산출물을 열었습니다 (데모)'));
}

/* 현재 워크스페이스 탭(기본 mine). 도메인 무관 surface state — STATE 소유. */
function wsTab(){ return STATE.wsTab==='progress'?'progress':'mine'; }
function setWsTab(t){ STATE.wsTab=(t==='progress')?'progress':'mine'; renderConsole(); }
window.AAP_setWsTab=setWsTab;
/* 2탭 바 — 「내 업무」(결정 큐) / 「업무 진행」(단계 프로세스·HITL·AAP 작동). 미결정 게이트 수 배지. */
function wsTabBar(){
  const tab=wsTab();
  const pend=pendingGates().filter(g=>g.state==='pending').length;
  return `<button class="ws-tab ${tab==='mine'?'on':''}" data-wstab="mine" data-tip="결정할 일과 AAP가 해둔 일 — 내 업무 워크스페이스">${_ICO('inbox')}내 업무${pend?`<span class="ws-tab-c">${pend}</span>`:''}</button>
    <button class="ws-tab ${tab==='progress'?'on':''}" data-wstab="progress" data-tip="단계별 진행·사람 확인(HITL)·AAP가 어떻게 처리했는지">${_ICO('git-branch')}업무 진행</button>`;
}
/* =========================================================================
   「업무 진행」 탭 — 코어 일반 도출(채용 분기 0). 세 묶음:
   ① 업무 단계 프로세스 = WORK(flow) 전체를 타임라인 카드로(완료/진행/대기 + role + ops 요약 + loopPhase).
   ② 사람 확인(HITL) 상태 = stIsGate 단계를 amber 로(대기/완료/예정).
   ③ AAP 작동 = #explain/#caseTune/#flow 마운트 — renderRight 가 5타입 분해·통제점·로그를 채움.
   회의·VOC 도 같은 도출(특수 슬롯 없으면 graceful). 라벨·ops·loopPhase 는 팩 데이터, 렌더는 일반.
   ========================================================================= */
function wsProgress(C){
  const flow=WORK||[]; const ci=idxOf(STATE.sel);
  /* ── ① 단계 프로세스 타임라인 ── */
  let steps='';
  flow.forEach((w,i)=>{
    const st=i<ci?'done':(i===ci?'cur':'wait');
    const gate=stIsGate(w);
    const decided=gate&&gateDecided({decisions:STATE.decisions||{},meetPhase:STATE.meetPhase},w);
    const lp=stLoop(w);
    const open=STATE.wsStepOpen&&STATE.wsStepOpen.has(w.id);
    /* ops 요약 = feed→out 의 첫 줄(읽고/한 것) */
    const op0=(w.ops&&w.ops[0])||null;
    const sum=op0?`${dcText(op0.feed,'op.feed')} → <b>${dcText(op0.out,'op.out')}</b>`:(w.role||'');
    const stKo=st==='done'?'완료':(st==='cur'?'진행 중':'예정');
    const gateBadge=gate?`<span class="wp-gate ${decided?'done':(st==='cur'?'now':'')}">${_ICO('user-check')}${decided?'확인됨':(st==='cur'?'확인 대기':'사람 확인')}</span>`:'';
    /* 펼침 = 세부 작업·근거(ops 전체: comp 5타입 배지 + feed→out + micro + detail) + explain */
    const detail=open?wsStepDetail(w):'';
    steps+=`<div class="wp-step ${st}${gate?' gate':''}${open?' open':''}">
      <div class="wp-rail"><span class="wp-dot">${st==='done'?_ICO('check'):(st==='cur'?'':i+1)}</span>${i<flow.length-1?'<span class="wp-line"></span>':''}</div>
      <button class="wp-card" data-wsstep="${w.id}" data-tip="세부 작업·근거 펼치기">
        <div class="wp-card-h"><span class="wp-lab">${dcText(w.label,'step.label')}</span>${lp?`<span class="wp-lp">${lp}</span>`:''}<span class="wp-state ${st}">${stKo}</span></div>
        <div class="wp-sub"><span class="wp-role">${w.role||''}</span>${gateBadge}</div>
        <div class="wp-sum">${sum}</div>
        <span class="wp-more">${_ICO(open?'chevron-down':'chevron-right')}${open?'세부 접기':'세부 작업·근거'}</span>
      </button>
      ${detail}
    </div>`;
  });
  const proc=`<div class="wp-sec-h">${_ICO('git-branch')}업무 단계 진행 <span class="wp-sec-s">${flow.length}단계 · ${Math.min(ci+1,flow.length)}/${flow.length}</span></div><div class="wp-steps">${steps}</div>`;
  /* ── ② 사람 확인(HITL) 상태 ── */
  const gates=flow.map((w,i)=>({w,i})).filter(({w})=>stIsGate(w));
  let hitl='';
  if(gates.length){
    const dec={decisions:STATE.decisions||{},meetPhase:STATE.meetPhase};
    hitl=`<div class="wp-sec-h amber">${_ICO('user-check')}사람이 확인할 통제점 (HITL) <span class="wp-sec-s">${gates.length}회</span></div>
      <div class="wp-gates">`+gates.map(({w,i})=>{
        const done=gateDecided(dec,w), cur=i===ci&&!done;
        const sub=(w.gate&&typeof w.gate==='object'&&w.gate.label)?w.gate.label:(w.role||'');
        return `<button class="wp-gate-row ${done?'done':(cur?'now':'')}" data-wsgate="${w.id}" data-tip="이 게이트 단계로 이동">
          <span class="wp-gd"></span><span class="wp-gl">${dcText(w.label,'gate.label')}${sub&&sub!==w.label?` — ${dcText(sub,'gate.sub')}`:''}</span>
          <span class="wp-gx">${done?'확인됨':(cur?'대기 중':'예정')}</span></button>`;
      }).join('')+`</div>`;
  }
  /* ── ③ AAP 작동(옛 토글 드로어 흡수) = 다크 엔진룸 마운트(#explain/#caseTune/#flow) — renderRight 가 채움 ── */
  const aap=`<div class="wp-sec-h">${_ICO('sparkles')}AAP가 어떻게 처리했는지 <span class="wp-sec-s">구성요소 배정 · 통제점 · 로그</span></div>
    <div class="wp-aap run-evid">
      <div class="dw-sub" id="explain"></div>
      <div class="case-tune" id="caseTune"></div>
      <div class="flow" id="flow"></div>
    </div>`;
  return `<div class="wp">${proc}${hitl}${aap}</div>`;
}
/* 단계 펼침 세부 — ops 전체(comp 5타입 배지 · feed→out · micro · detail) + explain. 도메인 무관. */
function wsStepDetail(w){
  const ops=(w.ops||[]).map(o=>{
    const tk=evidType(o);
    const micro=o.micro?`<div class="wp-micro">${o.micro.map(m=>`<span class="mc">${m}</span>`).join('')}</div>`:'';
    const det=o.detail||'';
    return `<div class="wp-op ty${tk}">
      <div class="wp-op-h"><span class="wp-op-ty ty${tk}">${_TYKO[tk]}</span><span class="wp-op-nm">${dcText(o.comp,'op.comp')}</span><span class="wp-op-l">${o.L} ${LK[o.L]||''}</span></div>
      <div class="wp-op-d">${dcText(o.feed,'op.feed')} → <b>${dcText(o.out,'op.out')}</b></div>${micro}${det}</div>`;
  }).join('');
  const ex=w.explain?`<div class="wp-explain">${w.explain}</div>`:'';
  return `<div class="wp-detail">${ex}<div class="wp-ops">${ops}</div></div>`;
}
/* surface 내 산출물 보기 버튼(data-dlv)·다시(replay)·탭 전환(data-surftab) 배선 — 코어 책임(도메인 무관) */
function wireSurface(root){
  root.querySelectorAll('[data-dlv]').forEach(e=>e.onclick=()=>openPreview(e.dataset.dlv));
  const rp=root.querySelector('#replay'); if(rp)rp.onclick=()=>{ if(STATE.playing)stopPlay(); setSel(WORK[0].id); };
  /* surface 탭 클릭 탐색(도메인 무관) — 팩 surface 가 STATE.activeTab 을 읽어 본문 렌더.
     탭 목록·라벨·본문은 팩 책임, 코어는 활성 탭 기록 + 재렌더만(자동 진행과 독립). */
  root.querySelectorAll('[data-surftab]').forEach(e=>e.onclick=()=>{ STATE.activeTab=e.dataset.surftab; renderConsole(); });
  /* 워크스페이스 2탭 전환(코어 일반) */
  root.querySelectorAll('[data-wstab]').forEach(e=>e.onclick=()=>setWsTab(e.dataset.wstab));
  /* 업무 진행 탭: 단계 세부 펼침/접기 */
  root.querySelectorAll('[data-wsstep]').forEach(e=>e.onclick=()=>{ const id=e.dataset.wsstep; STATE.wsStepOpen=STATE.wsStepOpen||new Set(); STATE.wsStepOpen.has(id)?STATE.wsStepOpen.delete(id):STATE.wsStepOpen.add(id); renderConsole(); });
  /* 업무 진행 탭: HITL 통제점 클릭 → 그 게이트 단계로 이동(HITL 모달 자동 노출) */
  root.querySelectorAll('[data-wsgate]').forEach(e=>e.onclick=()=>{ gotoGate(e.dataset.wsgate); });
  /* io.inputs(자료 업로드) · io.connectors(외부 시스템 소싱) — 코어 일반 결정론 핸들러 */
  root.querySelectorAll('[data-ioinput]').forEach(e=>e.onclick=()=>ioActivate('input',e.dataset.ioinput));
  root.querySelectorAll('[data-ioconn]').forEach(e=>e.onclick=()=>ioActivate('connector',e.dataset.ioconn));
  /* 조작형 콘솔: 단계 strip 클릭 → 그 단계로 탐색(setSel) */
  /* 전체 단계 strip([data-opstep]) 되짚기도 .run-surface 위임(initStageNav)으로 처리 — 재렌더 무관 항상 동작 */
  /* 코어 일반 데이터 콘솔 배선(팩 surface.wire 없을 때) — 슬롯 펼침·게이트 이동 */
  if(hasDataConsole()&&!(PACK.surface&&PACK.surface.opstage))dcWire(root);
  wirePackHooks(root);
}
/* ===== io 슬롯(코어 일반 · 도메인 무관) — Pack Contract v2 §3.2 inputs·connectors =====
   팩이 io.inputs/connectors 를 선언하면 「내 업무」 탭 상단에 업로드·소싱 affordance 를 렌더한다.
   클릭 = 결정론 핸들러: 활성 키를 STATE.ioDone(케이스 영속)에 기록 + entry.setKey 로 도메인 상태 갱신 +
   trace 누적 → 팩 surface 가 그 STATE 를 읽어 카운트를 결정론적으로 반영. 미선언 팩은 미표시(graceful). */
function packIo(){ return (PACK&&PACK.io)||{}; }
function ioInputs(){ const a=packIo().inputs; return Array.isArray(a)?a:[]; }
function ioConnectors(){ const a=packIo().connectors; return Array.isArray(a)?a:[]; }
function ioDone(k){ return !!(STATE.ioDone&&STATE.ioDone[k]); }
/* 활성화(결정론) — 멱등(이미 활성이면 무시). 도메인 효과는 entry.setKey/setVal(데이터)로만. */
function ioActivate(kind,key){
  const list=kind==='input'?ioInputs():ioConnectors();
  const e=list.find(x=>(kind==='input'?x.key:x.id)===key); if(!e)return;
  STATE.ioDone=STATE.ioDone||{}; if(STATE.ioDone[key])return; STATE.ioDone[key]=true;
  /* 도메인 상태 반영 — entry.setKey 에 setVal(없으면 true) 기록(케이스 격리: 팩 persistKeys 권장) */
  if(e.setKey){ if(typeof e.setVal!=='undefined')STATE[e.setKey]=e.setVal;
    else { STATE[e.setKey]=(typeof STATE[e.setKey]==='number'?STATE[e.setKey]:0)+(+e.delta||1); } }
  STATE.trace.push({st:W(STATE.sel).label, t:(kind==='input'?'자료 반영 · ':'외부 소싱 · ')+(e.label||key)+(e.note?(' · '+e.note):''), L:e.L||'L5', k:kind==='input'?'Connector':'Connector'});
  renderConsole(); afterStateChange();
  if(e.toast)toast(e.toast);
}
/* 「내 업무」 탭 io 바 — 업로드(inputs) + 외부 채용사이트 소싱(connectors). 없으면 ''(graceful). */
function wsIoBar(C){
  const ins=ioInputs(), conns=ioConnectors();
  if(!ins.length&&!conns.length)return '';
  /* stage 게이팅: entry.stage 가 있으면 그 단계 도달 시에만 노출(없으면 항상) */
  const reached=(stage)=>!stage||idxOf(STATE.sel)>=idxOf(stage);
  const insV=ins.filter(e=>reached(e.stage)), connsV=conns.filter(e=>reached(e.stage));
  if(!insV.length&&!connsV.length)return '';
  const up=insV.map(e=>{const done=ioDone(e.key);
    return `<button class="io-chip ${done?'done':''}" data-ioinput="${e.key}" data-tip="${done?'반영됨':'클릭하면 결정론적으로 반영됩니다'}">${_ICO(done?'check':'upload')}<span>${e.label}</span>${e.hint?`<em>${e.hint}</em>`:''}</button>`;}).join('');
  const so=connsV.map(e=>{const done=ioDone(e.id);
    return `<button class="io-chip conn ${done?'done':''}" data-ioconn="${e.id}" data-tip="${done?'소싱 완료':'외부 채용사이트에서 후보를 가져옵니다'}">${_ICO(done?'check':'plug')}<span>${e.label}</span>${e.hint?`<em>${e.hint}</em>`:''}</button>`;}).join('');
  return `<div class="io-bar">
    ${up?`<div class="io-grp"><span class="io-grp-k">${_ICO('upload')}자료 업로드</span><div class="io-chips">${up}</div></div>`:''}
    ${so?`<div class="io-grp"><span class="io-grp-k">${_ICO('plug')}채용 사이트 연계</span><div class="io-chips">${so}</div></div>`:''}
  </div>`;
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
  /* ★ 옵션(steering) 변경 결과 모달 — 값 변화 전/후 + 판단 로직·근거를 모달로(도메인 무관) */
  if(STATE.reResult)return 'reresult';
  /* 팩이 도메인 인터랙션 모달(예: 후보 상세)을 우선 표시하려면 hook 으로 kind 반환(도메인 무관) */
  const hk=PACK.surfaceHooks;
  if(hk&&hk.currentCM){ const k=hk.currentCM(STATE); if(k)return k; }
  const w=W(STATE.sel);
  if(STATE.baseOnly && stHasDoneModal(w))return null;
  if(stIsLive(w)){if(STATE.meetPhase==='await_start')return 'meetingStart';if(STATE.meetPhase!=='idle')return 'meetingLive';}
  /* 게이트 HITL 모달 = baseOnly(닫기·조용한 진입)면 자동으로 띄우지 않는다(§2-C). 사람이 콘솔을
     보고 '결정하기'로 직접 열거나, 자동 진행이 게이트에 막 도달(baseOnly=false)했을 때만 표출 →
     진입 즉시 모달로 갇히는 문제 해소. 재open = renderRunAction 의 '결정하기' / 단계 클릭. */
  /* ★ #4 인라인 HITL — 팩이 suppressGateModal(S)=true 를 반환하면 게이트 결정을 본 화면 인라인으로
     렌더하고 모달은 자동으로 띄우지 않는다(세부 기준은 '세부 보기'로만 모달). 훅 없으면 기존대로 모달. */
  if(stIsGate(w) && RUN.phase==='await' && !STATE.baseOnly && !(hk&&hk.suppressGateModal&&hk.suppressGateModal(STATE)))return 'hitl';
  if(stHasDoneModal(w) && RUN.phase==='done')return 'done';
  return null;
}
function renderCModal(){
  const cm=document.getElementById('cmodal'),kind=currentCM();
  if(!kind){cm.classList.remove('show');cm.innerHTML='';return;}
  const C=ctx();let html;
  if(kind==='preview'){const d=resolveDlv(STATE.previewK,C);
    html=`<button class="cmodal-back" data-back>${_ICO('chevron-left')}뒤로</button><div class="cmodal-h">${d.ic} ${d.title}</div><div class="cmodal-sub">${d.sub}</div>${d.body}`;
  } else if(kind==='reresult'){ html=reResultModalHtml(); }
  else html=surfCmodal(kind,C);
  /* HITL 결정·결과 모달은 넓게(전/후 비교·로직·근거 수용) — 차분 톤 유지 */
  const wide=(kind==='hitl'||kind==='reresult')?' wide':'';
  /* 게이트 HITL 모달엔 공통 닫기 X 를 코어가 주입(도메인 surface.cmodal 마다 안 넣어도 됨) →
     닫으면 baseOnly=true 로 콘솔 복귀(line 1749 data-close 핸들러). '갇힘' 해소(§2-C). */
  const closeX=(kind==='hitl')?`<button class="cmodal-x" data-close aria-label="닫기">${_ICO('x')}</button>`:'';
  cm.innerHTML=`<div class="cmodal-card${wide}">${closeX}${html}</div>`;cm.classList.add('show');
  cm.querySelectorAll('[data-dlv]').forEach(e=>e.onclick=()=>openPreview(e.dataset.dlv));
  wirePackHooks(cm);
  const bk=cm.querySelector('[data-back]');if(bk)bk.onclick=()=>{STATE.previewK=null;renderConsole();};
  const yes=cm.querySelector('[data-yes]');if(yes)yes.onclick=()=>decide('yes');
  const no=cm.querySelector('[data-no]');if(no)no.onclick=()=>decide('no');
  cm.querySelectorAll('[data-close]').forEach(e=>e.onclick=()=>{STATE.baseOnly=true;renderConsole();});
  cm.querySelectorAll('[data-time]').forEach(e=>e.onclick=()=>{STATE.pickedTime=TIMES[+e.dataset.time].t;renderConsole();});
  const ms=cm.querySelector('[data-mstart]');if(ms)ms.onclick=meetingStart;
  const me=cm.querySelector('[data-mend]');if(me)me.onclick=meetingEnd;
  cm.querySelectorAll('[data-rrclose]').forEach(e=>e.onclick=()=>{STATE.reResult=null;renderConsole();});
}
/* ★ 옵션 변경 결과 모달 — 값 전/후 비교 + 판단 로직(단계별 근거). steering 결과를 모달로 명시. */
function reResultModalHtml(){
  const r=STATE.reResult; if(!r)return '';
  const diffRows=(r.diff||[]).map(d=>`<div class="rr-d"><span class="rr-dl">${d.label}</span><span class="rr-dv"><b class="rr-from">${d.from}</b>${_ICO('arrow-right')}<b class="rr-to">${d.to}</b></span></div>`).join('');
  const stepRows=(r.steps||[]).map(s=>`<div class="rr-s"><div class="rr-sh"><span class="rr-st">${s.t}</span>${s.tag?`<span class="rr-tag">${s.tag}</span>`:''}</div>${s.d?`<div class="rr-sd">${s.d}</div>`:''}${s.basis?`<div class="rr-sb">${s.basis}</div>`:''}</div>`).join('');
  return `<button class="cmodal-x" data-rrclose aria-label="닫기">${_ICO('x')}</button>
    <div class="cmodal-h">${_ICO('zap')}기준 변경 결과</div>
    <div class="cmodal-sub">${r.intent||'의도 변경'} — AAP가 다시 분석해 반영했습니다 (chat 아님 · 결정론 재계산)</div>
    ${diffRows?`<div class="rr-diff-h">무엇이 바뀌었나</div><div class="rr-diff">${diffRows}</div>`:''}
    ${stepRows?`<div class="rr-logic-h">어떻게 판단했나 · 단계별 근거</div><div class="rr-logic">${stepRows}</div>`:''}
    <div class="cmodal-actions"><button class="cp-btn primary" data-rrclose>확인</button></div>`;
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
/* AAP 작동 드로어 토글 상태(영속) — 기본 닫힘. 운영자 nav 와 분리된 '필요할 때만' 패널. */
function aapDrawerOn(){ return !!APP.collapse.aapDrawer; }
function setAapDrawer(on){ APP.collapse.aapDrawer=!!on; applyCollapse(); saveApp(); }
function toggleAapDrawer(){ setAapDrawer(!aapDrawerOn()); }
window.AAP_toggleAapDrawer=toggleAapDrawer;
/* 호환 별칭 — 옛 'AAP 작동 보기' 진입점은 이제 「업무 진행」 탭으로 전환(드로어 흡수). */
window.AAP_showAapWork=function(){ if(typeof setWsTab==='function')setWsTab('progress'); };
function renderRight(){
  const w=W(STATE.sel),gs=groupsOf(w);let h='';
  const _lp=stLoop(w);
  const lb=_lp?`<div class="dw-loop">추론 루프 · ${_lp}</div>`:'';
  const flow=document.getElementById('flow'),exp=document.getElementById('explain');
  if(!flow)return;
  /* ── 드로어 = 다크 엔진룸: 업무 분해·구성요소 배정(5타입 색+범례) / 통제점(HITL amber) / 처리 로그 ── */
  /* 5타입 범례 */
  const LEG=[['A','Agent'],['M','Module'],['S','솔루션'],['C','Connector'],['P','Policy']];
  const legend=`<div class="dw-leg">${LEG.map(([k,ko])=>`<span class="dw-lg ty${k}"><i></i>${ko}</span>`).join('')}</div>`;
  /* (1) 업무 분해 · 구성요소 배정 — 현재 단계 ops 를 5타입 배지로 */
  if(stIsLive(w) && STATE.meetPhase==='await_start'){
    flow.innerHTML=lb+legend+`<div class="dw-wait">실시간 세션 시작 대기 — 사람이 가동 시점을 통제합니다 (HITL)</div>`+drawerGates(w)+drawerLog();
    if(exp)exp.innerHTML=w.explain;return;
  }
  let assign='';
  gs.forEach((g,gi)=>{
    const ops=(w.ops||[]).filter(o=>o.g===g);
    const stt=gi<RUN.reveal?'done':(gi===RUN.reveal&&RUN.phase==='working'?'doing':'wait');
    const par=ops.length>1;
    ops.forEach((o,oi)=>{
      const tk=evidType(o);
      const key=`${w.id}-${gi}-${oi}`;const open=STATE.opOpen.has(key);
      const badge=o.badge?`<span class="dt-badge">${o.badge}</span>`:'';
      const parTag=(par&&oi===0)?`<span class="dt-par">∥ 병렬</span>`:'';
      /* 펼침 상세 = 관여 계층 + micro + detail(산출물 표) */
      const micro=o.micro?`<div class="ev-micro">${o.micro.map(m=>`<span class="mc">${m}</span>`).join('')}</div>`:'';
      const det=(o.detail||'');
      const canOpen=(stt==='done')&&(o.detail||o.micro);
      const more=canOpen?`<button class="ev-more" data-op="${key}">${_ICO(open?'chevron-down':'chevron-right')}${open?'근거 접기':'근거 펼침'}</button>${open?`<div class="ev-detail"><div class="ev-lay">관여 계층 · <b>${o.L} ${LK[o.L]}</b></div>${micro}${det}</div>`:''}`:'';
      const val=stt==='wait'?'<span class="ev-na">대기</span>':`<b>${o.out}</b>`;
      assign+=`<div class="dt ty${tk} ${stt}">
        <div class="dt-h"><span class="dt-nm ev-link" data-asset="${dcText(o.comp,'op.comp')}" data-atk="${tk}" data-tip="자산 카탈로그에서 이 구성요소 보기">${dcText(o.comp,'op.comp')}</span>
          <span class="dt-own"><span class="dw-ty ty${tk}">${_TYKO[tk]}</span><span class="dw-kind ${blockKind(o,tk)}" data-tip="${blockKind(o,tk)==='llm'?'비결정론 — LLM 추론(온톨로지 통해 통제)':'결정론 — 규칙·온톨로지 편집(재현 가능)'}">${blockKind(o,tk)==='llm'?'LLM':'결정론'}</span>${badge}${parTag}</span></div>
        <div class="dt-d">${o.feed} → ${val}</div>
        ${more}</div>`;
    });
  });
  let casm='';
  if(stShowsCompose(w)){const lit=RUN.phase==='done'||RUN.phase==='await'||RUN.reveal>2;
    casm=`<div class="dw-sec">AAP가 조합한 구성요소</div><div class="casm">${COMPOSE.map(c=>`<span class="ct2 ${c.cls} ${lit?'on':''} ev-link" data-asset="${dcText(c.n,'compose.n')}" data-atk="${c._tk||dcTypeKey(c.cls,'compose.cls')}" data-tip="자산 카탈로그에서 보기">${c.t} ${c.n}</span>`).join('')}</div>`;}
  flow.innerHTML=lb+legend+`<div class="dw-sec">업무 분해 · 구성요소 배정</div>`+assign+casm+drawerGates(w)+drawerLog();
  if(exp)exp.innerHTML=w.explain;
  /* P5 케이스 튜닝 패널 갱신(케이스 맥락에서만 wfeditor 가 렌더 — 도메인 무관 위임) */
  if(window.AAP_WFEDITOR&&window.AAP_WFEDITOR.renderCaseTuner)window.AAP_WFEDITOR.renderCaseTuner(PACK,STATE.sel);
  flow.querySelectorAll('[data-op]').forEach(e=>e.onclick=()=>{const k=e.dataset.op;STATE.opOpen.has(k)?STATE.opOpen.delete(k):STATE.opOpen.add(k);renderRight();});
  /* Run→자산 양방향: 드로어 구성요소·조합 칩 클릭 → 자산 뷰 해당 항목 강조 */
  flow.querySelectorAll('[data-asset]').forEach(e=>e.onclick=()=>gotoAsset(e.dataset.asset,e.dataset.atk));
}
/* 통제점(HITL) 섹션 — flow 의 게이트 단계를 amber 로 나열(미결정=대기 강조). 도메인 무관. */
function drawerGates(){
  const flow=WORK||[]; const ci=idxOf(STATE.sel);
  const gates=flow.map((w,i)=>({w,i})).filter(({w})=>stIsGate(w));
  if(!gates.length)return '';
  const dec={decisions:STATE.decisions||{}, meetPhase:STATE.meetPhase};
  return `<div class="dw-sec amber">사람이 결정할 통제점 (HITL)</div>`+gates.map(({w,i})=>{
    const done=gateDecided(dec,w), cur=i===ci&&!done;
    const sub=w.gate&&typeof w.gate==='object'&&w.gate.label?w.gate.label:(w.role||'');
    return `<div class="dw-gate ${done?'done':(cur?'now':'')}"><span class="gd"></span><span class="gl">${dcText(w.label,'gate.label')}${sub&&sub!==w.label?` — ${dcText(sub,'gate.sub')}`:''}</span><span class="gx">${done?'결정됨':(cur?'대기 중':'예정')}</span></div>`;
  }).join('');
}
/* 처리 로그 섹션 — Run Trace 누적(최근 6) 을 실행형으로. 도메인 무관. */
function drawerLog(){
  const tr=(STATE.trace||[]).slice(-6);
  if(!tr.length)return `<div class="dw-sec">처리 로그</div><div class="dw-log empty">아직 기록이 없습니다 — 실행을 시작하면 단계별로 남습니다.</div>`;
  return `<div class="dw-sec">처리 로그</div>`+tr.map(r=>`<div class="dw-log"><b>${r.L||''}</b><span>${r.t}</span></div>`).join('');
}

/* ===== Run Trace (코어 · 단계 완료 시 ops 누적 = 거버넌스 증거) ===== */
function traceStep(w){
  if(STATE.traced.has(w.id))return;STATE.traced.add(w.id);
  (w.ops||[]).forEach(o=>STATE.trace.push({st:w.label,t:`${o.feed} → ${o.out}`,L:o.L,k:KMAP[o.L]||''}));
}

/* ===== 자율 실행 엔진 (코어 · 도메인 무관) ===== */
/* 자동 진행 타이밍(완성 기준 §2-A) — 각 단계가 '무엇을·무엇으로·어떤 근거로'를 보여준 뒤 다음으로.
   휙 지나가지 않도록 단계당 머무름에 바닥(floor)을 둔다: reveal 그룹 간격 + 단계 최소 dwell + 다음까지 hold.
   reveal=그룹 등장 간격, settleFloor=단계 본문(근거)이 정착해 보이는 최소 시간, hold=다음 단계로 넘어가기 전 hold. */
const OP_T={ reveal:680, settleFloor:1250, hold:1100 };
function startWorking(){RUN.phase='working';RUN.reveal=0;renderConsole();renderRight();revealOps();}
function revealOps(){
  const w=W(STATE.sel),n=groupsOf(w).length;
  for(let i=1;i<=n;i++)RUN.timers.push(setTimeout(()=>{RUN.reveal=i;renderConsole();renderRight();},i*OP_T.reveal));
  /* 단계 정착 시점 = 그룹 다 등장한 시각과 단계 최소 dwell(근거 노출) 중 늦은 쪽 → '근거 없이 휙' 방지 */
  const settleAt=Math.max(n*OP_T.reveal+260, OP_T.settleFloor);
  RUN.timers.push(setTimeout(()=>{
    RUN.reveal=n;traceStep(w);
    if(stIsLive(w)&&STATE.meetPhase==='in_meeting'){STATE.meetPhase='await_end';RUN.phase='await';renderConsole();renderRight();}
    else if(stIsGate(w)){RUN.phase='await';STATE.baseOnly=true;renderConsole();renderRight();}  /* (옵션B) 게이트 자동 모달 ✕ — 우측 HITL 카드 클릭 시에만 결정 모달 */
    else{RUN.phase='done';renderConsole();renderRight();if(STATE.playing)RUN.playTimer=setTimeout(playNext,OP_T.hold);}
    afterStateChange();
  },settleAt));
}
/* 케이스 영속 + 인박스 카운트 갱신 (런타임 상태가 바뀐 직후) */
function afterStateChange(){ persistToCase(); const navc=document.getElementById('navCnt'); if(navc){const w=APP.cases.filter(c=>c.packId===APP.pack&&isDeployed(c.packId)&&caseStatus(c)==='wait').length;navc.textContent=w?String(w):'';} renderRunAction(); }
function runStep(){
  clearRun();STATE.previewK=null;STATE.reResult=null;STATE.baseOnly=false;STATE.opOpen.clear();if(STATE.wsStepOpen)STATE.wsStepOpen.clear();clearPackTransient();const w=W(STATE.sel);
  if(stIsLive(w)){STATE.meetPhase='await_start';RUN.phase='await';RUN.reveal=0;renderConsole();renderRight();}
  else{STATE.meetPhase='idle';startWorking();}
}
function meetingStart(){STATE.meetPhase='in_meeting';startWorking();}
function meetingEnd(){STATE.meetPhase='done';RUN.phase='done';renderConsole();renderRight();afterStateChange();if(STATE.playing)RUN.playTimer=setTimeout(playNext,1700);}
function decide(v){
  const w=W(STATE.sel);STATE.decisions[w.id]=v;RUN.phase='done';
  /* 팩이 HITL 결정을 도메인 surface 상태로 번역(도메인 무관 hook) — 예: 오퍼 승인→보드 offer 배치 */
  if(PACK.surfaceHooks&&PACK.surfaceHooks.decideHook){ try{PACK.surfaceHooks.decideHook(STATE,v,w.id);}catch(e){} }
  /* 결정 라벨·토스트는 단계 gate.decisions 에서(코어 리터럴 id 참조 제거 — Pack Contract v2) */
  const dec=stDecision(w,v);
  STATE.trace.push({st:w.label,t:'담당자 결정 · '+(dec.label||v),L:'L7',k:'HITL'});
  /* ★ 결정 후 AAP가 다시 자동으로 이어서 진행(스트림이 멈춤 없이 흐르게) — 마지막 단계면 멈춤. */
  STATE.playing=true; setRunBtn(true);
  renderConsole();renderRight();afterStateChange();
  toast(dec.toast||dec.label||'');
  RUN.playTimer=setTimeout(playNext,1500);
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
/* 자동 작동 표시(스테퍼 대체) — '처리 중' / '확인 필요' / '완료'. 작업 스트림이 진행을 보여주므로
   수동 실행 버튼은 두지 않는다(자동 진행). await 면 게이트 모달이 떠 있음(클릭 = 그 게이트로 스크롤 유도). */
function renderRunAction(){
  const el=document.getElementById('runAction'); if(!el)return;
  const c=activeCase();
  if(STATE.view!=='run'||!c){ el.innerHTML=''; el.hidden=true; return; }
  el.hidden=false;
  const ci=idxOf(STATE.sel), n=(WORK||[]).length, prog=`${Math.min(ci+1,n)}/${n} 단계`;
  if(c.done){
    el.innerHTML=`<span class="rt-running done"><span class="pls"></span>처리 완료 · ${n}/${n} 단계</span>`;
  } else if(RUN.phase==='await'){
    /* 게이트 = 클릭하면 결정 모달을 (다시) 연다(baseOnly 해제) — 닫은 뒤 재open 경로(§2-C). */
    const isGate=stIsGate(W(STATE.sel));
    el.innerHTML=`<button class="rt-running await${isGate?' rt-act':''}"${isGate?' data-opengate':''}><span class="pls"></span>여기서 결정이 필요해요${isGate?' · 결정하기':''}</button>`;
    const og=el.querySelector('[data-opengate]'); if(og)og.onclick=openGate;
  } else {
    el.innerHTML=`<span class="rt-running"><span class="pls"></span>AAP 작업 중 · ${prog}</span>`;
  }
  renderRunNav();
}
/* ── 워크스루 네비(처음·이전·재생/정지·다음) — BD·고객 설명용 단계 이동(완성기준 외 발표 컨트롤).
   이전/다음 = 자동재생 멈추고 그 단계로 이동해 그 단계 작업만 재생 후 정지(차근차근 설명). 도메인 무관. */
function renderRunNav(){
  const el=document.getElementById('runNav'); if(!el)return;
  const c=activeCase();
  if(STATE.view!=='run'||!c){ el.innerHTML=''; el.hidden=true; return; }
  el.hidden=false;
  const ci=idxOf(STATE.sel), n=(WORK||[]).length, playing=STATE.playing;
  el.innerHTML=
    `<button class="rt-nav" data-walk="restart" data-tip="처음 단계부터 다시">${_ICO('rotate-ccw')}처음</button>`+
    `<button class="rt-nav" data-walk="prev"${ci<=0?' disabled':''} data-tip="이전 단계">${_ICO('chevron-left')}이전</button>`+
    `<button class="rt-nav rt-nav-play" data-walk="play" data-tip="${playing?'자동 재생 정지':'현재 단계부터 자동 재생'}">${_ICO(playing?'square':'play')}</button>`+
    `<button class="rt-nav" data-walk="next"${ci>=n-1?' disabled':''} data-tip="다음 단계">다음${_ICO('chevron-right')}</button>`;
  el.querySelectorAll('[data-walk]').forEach(b=>b.onclick=()=>walkNav(b.dataset.walk));
}
function walkNav(k){
  const ci=idxOf(STATE.sel), n=(WORK||[]).length;
  if(k==='restart'){ stopPlay(); setSel(WORK[0].id); }
  else if(k==='prev'){ if(ci>0){ stopPlay(); setSel(WORK[ci-1].id); } }
  else if(k==='next'){ if(ci<n-1){ stopPlay(); setSel(WORK[ci+1].id); } }
  else if(k==='play'){ if(STATE.playing)stopPlay(); else startRun(); }
}
window.AAP_walkNav=walkNav;
/* 게이트 결정 모달 열기 — baseOnly 해제 후 모달 표출(콘솔→모달 전환). 단계 클릭/결정하기 버튼 공통 진입. */
function openGate(){ const w=W(STATE.sel); if(!stIsGate(w))return; STATE.baseOnly=false; renderConsole(); renderRunAction(); }
window.AAP_openGate=openGate;
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
     <div class="wa-row full"><span class="k">유형</span><span>${wl.type}</span></div>
     <div class="wa-row full"><span class="k">목적</span><span>${wl.purpose}</span></div>
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
/* 온톨로지(L4) 섹션 — 'AAP가 이 업무를 어떻게 이해하는가'.
   기본 = 객체 카드 뷰(kind 색·관계·단계별 만지는 객체·객체 클릭 드릴 = AAP_VIZ.ontologyHtml 급).
   그래프 = Palantir 톤 노드 그래프(토글 보존). 팩이 ontology 없으면 graceful(무회귀). */
let _ontoView='cards';
let _ontoSelK=null;   /* 카드 뷰 드릴 선택 객체 키 */
/* 객체 kind → 색·라벨(신규 색 ✕ = 5타입 토큰 재사용). entity 핵심대상 / event 사건 / document 문서 / master 기준정보. */
const KIND_M={
  entity:{ko:'핵심 대상',cls:'kEntity',v:'--type-agent'},
  event:{ko:'사건·이벤트',cls:'kEvent',v:'--type-connector'},
  document:{ko:'문서',cls:'kDocument',v:'--type-module'},
  master:{ko:'기준정보',cls:'kMaster',v:'--type-solution'},
};
function _ontoKey(x){ return x.k || String(x.n||'').replace(/\(.*$/,'').trim(); }   /* 'Candidate(후보)' → 'Candidate' */
function renderOntology(P){
  const el=document.getElementById('ontologyBox'); if(!el)return;
  const o=P&&P.ontology;
  if(!o){
    /* graceful — 명시 온톨로지 없음(예: 자동저작 팩). 산출물·확인 지점을 의미 레이어 단서로만 노출(허위 객체 ✕). */
    const wl=(P&&P.workload)||{}; const outs=(wl.outputs||[]);
    el.innerHTML=`<div class="onto-graceful"><div class="onto-g-h">${_ICO('boxes')}아직 명시 온톨로지가 없습니다</div>`+
      `<div class="onto-g-b">이 유형은 객체·관계가 아직 정의되지 않았습니다. 그동안 <b>업무 이해의 산출물·확인 지점</b>이 의미 레이어로 작동합니다 — 온톨로지를 정의하면 이 자리에 객체 카드·관계·단계별 사용이 채워집니다.</div>`+
      (outs.length?`<div class="onto-g-sub">산출물 단서</div><div class="onto-g-chips">${outs.map(x=>`<span>${x}</span>`).join('')}</div>`:'')+
      `</div>`;
    return;
  }
  const objs=o.objects||[], rels=o.relations||[], acts=o.actions||[];
  const actByKey={}; acts.forEach(a=>{ if(a.key)actByKey[a.key]=a; });
  /* ── 결정론적 원형 레이아웃: 객체 노드를 원 위에 균등 배치(노드 ≥1) ── */
  const N=objs.length;
  const W=520, H=Math.max(300, 230+N*8), cx=W/2, cy=H/2, R=Math.min(W,H)/2-90;
  const NW=132, NH=46;
  const pos={}; const nodes=objs.map((x,i)=>{
    const ang=(-Math.PI/2)+(i*2*Math.PI/Math.max(1,N));
    const x0=N===1?cx:cx+R*Math.cos(ang), y0=N===1?cy:cy+R*Math.sin(ang);
    const k=_ontoKey(x);
    pos[k]={x:x0,y:y0};
    return {k,x:x0,y:y0,obj:x};
  });
  /* ── 엣지: from/to(핵심 키) → 좌표. 사각 노드 경계에서 출발하도록 중심선 단축 ── */
  const edgeP=rels.map(r=>{
    const a=pos[r.from], b=pos[r.to]; if(!a||!b)return '';
    const dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy)||1, ux=dx/len, uy=dy/len;
    const ax=a.x+ux*(NW/2*0.55), ay=a.y+uy*(NH/2+6);
    const bx=b.x-ux*(NW/2*0.55), by=b.y-uy*(NH/2+6);
    const mx=(ax+bx)/2, my=(ay+by)/2;
    const lbl=dcText(r.label||r.t||'','onto.rel');
    return `<g class="onto-edge"><path d="M${ax.toFixed(1)},${ay.toFixed(1)} L${bx.toFixed(1)},${by.toFixed(1)}" marker-end="url(#ontoArrow)"/>`+
      `<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" class="onto-elbl">${lbl}</text></g>`;
  }).join('');
  /* ── 노드: 객체명 + 속성 수 + Action 배지(green=auto / amber=confirm) ── */
  const nodeN=nodes.map((nd,i)=>{
    const x=nd.x, y=nd.y;
    const onAct=(nd.obj.on||[]).map(k=>actByKey[k]).filter(Boolean);
    const badges=onAct.map((a,j)=>{ const m=a.mode==='confirm'?'confirm':'auto';
      return `<circle class="onto-badge ${m}" cx="${(x-NW/2+12+j*13).toFixed(1)}" cy="${(y+NH/2-7).toFixed(1)}" r="4"/>`; }).join('');
    const nm=dcText(nd.obj.n,'onto.obj');
    return `<g class="onto-node" data-onode="${i}" tabindex="0">`+
      `<rect x="${(x-NW/2).toFixed(1)}" y="${(y-NH/2).toFixed(1)}" width="${NW}" height="${NH}" rx="10"/>`+
      `<text class="onto-ntl" x="${x.toFixed(1)}" y="${(y-3).toFixed(1)}">${nm}</text>`+
      `<text class="onto-nattr" x="${x.toFixed(1)}" y="${(y+12).toFixed(1)}">속성 ${(nd.obj.a||[]).length} · Action ${onAct.length}</text>`+
      badges+`</g>`;
  }).join('');
  /* ── 보조: 목록형(토글 보존) ── */
  const listObjs=objs.map(x=>`<div class="onto-obj"><b>${dcText(x.n,'onto.obj')}</b>${(x.a||[]).map(a=>`<span>${dcText(a,'onto.attr')}</span>`).join('')}</div>`).join('');
  const listRels=rels.map(r=>`<div class="onto-rel">${r.t||(dcText(r.from,'onto.rel')+' —<em>'+dcText(r.label,'onto.rel')+'</em>→ '+dcText(r.to,'onto.rel'))}</div>`).join('');
  const listActs=acts.map(a=>{const m=a.mode==='confirm'?'confirm':'auto';return `<div class="onto-act"><span class="oa-n">${dcText(a.n,'onto.act')}</span><span class="oa-m ${m}">${m==='confirm'?'사람 확인':'자동'}</span></div>`;}).join('');
  const listHtml=`<div class="onto-list"><div class="onto-col"><div class="onto-k">객체 (Object)</div>${listObjs}</div>`+
    `<div class="onto-col"><div class="onto-k">관계 (Relation)</div>${listRels}</div>`+
    `<div class="onto-col full"><div class="onto-k">Action · 객체 편집 (자동 / 사람 확인)</div>${listActs}</div></div>`;
  const graphHtml=`<div class="onto-graph plg-wrap"><div class="plg-canvas onto-canvas"><svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet">`+
    `<defs><marker id="ontoArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" fill="#2dd4bf" opacity="0.55"/></marker></defs>`+
    `<g class="onto-edges">${edgeP}</g>${nodeN}</svg></div>`+
    `<div class="onto-detail" id="ontoDetail"><span class="onto-hint">노드를 누르면 속성·Action 상세가 표시됩니다.</span></div>`+
    `<div class="plg-leg"><span class="plg-lg"><span class="onto-badge-leg auto"></span>자동</span><span class="plg-lg"><span class="onto-badge-leg confirm"></span>사람 확인</span><span class="plg-leg-note">객체=노드 · 관계=엣지 · 배지=객체에 걸린 Action</span></div></div>`;
  /* ── 카드 뷰(기본) — 업무 객체 카드(kind 색)·관계·단계별 만지는 객체·객체 드릴(AAP_VIZ.ontologyHtml 급) ── */
  const objByKey=k=>objs.filter(x=>_ontoKey(x)===k)[0];
  const objName=k=>{ const x=objByKey(k); return x?dcText(x.n,'onto.obj'):k; };
  const kindOf=x=>KIND_M[x.kind]?x.kind:'entity';
  const aapSteps=(P.work||[]).filter(w=>w.actor==='aap');
  const touchMap=o.touch||{}; const hasTouch=Object.keys(touchMap).length>0;
  const cardsObjs=objs.map(x=>{ const km=KIND_M[kindOf(x)], k=_ontoKey(x);
    const onAct=(x.on||[]).map(a=>actByKey[a]).filter(Boolean);
    return `<button class="onto-card ${km.cls}${_ontoSelK===k?' sel':''}" data-ok="${k}">`+
      `<div class="oc-h"><span class="oc-kind">${km.ko}</span><span class="oc-nm">${dcText(x.n,'onto.obj')}</span></div>`+
      `<div class="oc-props">${(x.a||[]).map(a=>`<span>${dcText(a,'onto.attr')}</span>`).join('')||'<span class="oc-na">속성 미정</span>'}</div>`+
      (onAct.length?`<div class="oc-acts">${onAct.map(a=>{const m=a.mode==='confirm'?'confirm':'auto';return `<span class="oc-act ${m}">${dcText(a.n,'onto.act')}</span>`;}).join('')}</div>`:'')+
      `</button>`;
  }).join('');
  const cardRels=rels.map(r=>`<div class="onto-crel"><b>${objName(r.from)}</b><span class="oc-rv">—${dcText(r.label,'onto.rel')}→</span><b>${objName(r.to)}</b></div>`).join('');
  const touchRows=aapSteps.map(w=>{ const ks=touchMap[w.id]||[];
    return `<div class="onto-trow"><span class="onto-tstep">${w.label}</span><div class="onto-tobjs">${ks.length?ks.map(k=>{const ob=objByKey(k),km=KIND_M[ob?kindOf(ob):'entity'];return `<span class="${km.cls}">${ob?dcText(ob.n,'onto.obj'):k}</span>`;}).join(''):'<span class="onto-tnone">—</span>'}</div></div>`;
  }).join('');
  /* 카드 드릴 — 선택 객체의 속성·사용 단계·Action·관계(인라인·라이트) */
  let cardDetail='';
  const selObj=_ontoSelK?objByKey(_ontoSelK):null;
  if(selObj){ const km=KIND_M[kindOf(selObj)];
    const onAct=(selObj.on||[]).map(a=>actByKey[a]).filter(Boolean);
    const relTxt=rels.filter(r=>r.from===_ontoSelK||r.to===_ontoSelK).map(r=>`<span class="onto-crel sm"><b>${objName(r.from)}</b><span class="oc-rv">—${dcText(r.label,'onto.rel')}→</span><b>${objName(r.to)}</b></span>`).join('');
    const usedSteps=aapSteps.filter(w=>(touchMap[w.id]||[]).indexOf(_ontoSelK)>=0).map(w=>w.label);
    cardDetail=`<div class="onto-cdetail ${km.cls}"><div class="ocd-h"><span class="ocd-dot"></span><span class="ocd-kind">${km.ko}</span><span class="ocd-nm">${dcText(selObj.n,'onto.obj')}</span></div>`+
      `<div class="ocd-row"><span class="ocd-k">속성</span><span class="ocd-v">${(selObj.a||[]).map(a=>`<span class="ocd-attr">${dcText(a,'onto.attr')}</span>`).join('')||'—'}</span></div>`+
      `<div class="ocd-row"><span class="ocd-k">사용 단계</span><span class="ocd-v">${usedSteps.length?usedSteps.map(s=>`<span class="ocd-step">${s}</span>`).join(''):'<span class="onto-tnone">이 분해에서 직접 만지지 않음</span>'}</span></div>`+
      (onAct.length?`<div class="ocd-row"><span class="ocd-k">Action</span><span class="ocd-v">${onAct.map(a=>{const m=a.mode==='confirm'?'confirm':'auto';return `<span class="oc-act ${m}">${dcText(a.n,'onto.act')} · ${m==='confirm'?'사람 확인':'자동'}</span>`;}).join('')}</span></div>`:'')+
      (relTxt?`<div class="ocd-row"><span class="ocd-k">관계</span><span class="ocd-v">${relTxt}</span></div>`:'')+`</div>`;
  } else {
    cardDetail=`<div class="onto-cdetail empty"><span class="onto-hint">${_ICO('info')} 객체 카드를 누르면 속성·사용 단계·관계가 펼쳐집니다.</span></div>`;
  }
  const kindLeg=Object.keys(KIND_M).map(k=>`<span class="okl ${KIND_M[k].cls}"><span class="okl-d"></span>${KIND_M[k].ko}</span>`).join('');
  const cardsHtml=`<div class="onto-cards-wrap">`+
    `<div class="onto-csub">AAP가 이 업무를 어떻게 이해하는지 — 다루는 <b>업무 객체</b>와 <b>관계</b>입니다. 업무가 다르면 객체도 다릅니다.<span class="onto-dev"> · L4 Ontology</span></div>`+
    `<div class="onto-cards">${cardsObjs}</div>`+ cardDetail+
    `<div class="onto-blk-h">${_ICO('git-branch')}관계</div><div class="onto-crels">${cardRels||'<span class="onto-tnone">정의된 관계 없음</span>'}</div>`+
    `<div class="onto-blk-h">${_ICO('layers')}이 업무가 만지는 객체 — 단계별</div>`+
    (hasTouch?`<div class="onto-ctouch">${touchRows}</div>`:`<div class="onto-tnone pad">단계별 사용 매핑이 아직 없습니다 — 객체·관계만 정의됨.</div>`)+
    `<div class="onto-kindleg">${kindLeg}</div></div>`;
  el.innerHTML=`<div class="onto-toolbar"><button class="onto-tg ${_ontoView==='cards'?'on':''}" data-ov="cards">객체 카드</button><button class="onto-tg ${_ontoView==='graph'?'on':''}" data-ov="graph">그래프</button></div>`+
    (_ontoView==='graph'?graphHtml:cardsHtml);
  /* 토글 */
  el.querySelectorAll('.onto-tg').forEach(b=>b.onclick=()=>{ _ontoView=b.dataset.ov; renderOntology(P); });
  /* 카드 클릭 → 드릴(재렌더로 sel·상세 갱신) */
  el.querySelectorAll('.onto-card').forEach(b=>b.onclick=()=>{ _ontoSelK=(_ontoSelK===b.dataset.ok?null:b.dataset.ok); renderOntology(P); });
  /* 그래프 노드 클릭 → 상세(하단 패널) */
  const detEl=()=>document.getElementById('ontoDetail');
  function showDetail(i){
    const d=detEl(); if(!d)return; const nd=nodes[i]; if(!nd)return;
    const onAct=(nd.obj.on||[]).map(k=>actByKey[k]).filter(Boolean);
    el.querySelectorAll('.onto-node').forEach(g=>g.classList.toggle('sel', +g.dataset.onode===i));
    const relTxt=rels.filter(r=>r.from===nd.k||r.to===nd.k)
      .map(r=>`<span class="onto-d-rel">${dcText(r.from,'onto.rel')} <em>${dcText(r.label,'onto.rel')}</em> ${dcText(r.to,'onto.rel')}</span>`).join('');
    d.innerHTML=`<div class="onto-d-h">${dcText(nd.obj.n,'onto.obj')}</div>`+
      `<div class="onto-d-row"><span class="onto-d-k">속성</span><span class="onto-d-v">${(nd.obj.a||[]).map(a=>`<span class="onto-d-attr">${dcText(a,'onto.attr')}</span>`).join('')||'—'}</span></div>`+
      `<div class="onto-d-row"><span class="onto-d-k">Action</span><span class="onto-d-v">${onAct.map(a=>{const m=a.mode==='confirm'?'confirm':'auto';return `<span class="onto-d-act ${m}">${dcText(a.n,'onto.act')} · ${m==='confirm'?'사람 확인':'자동'}</span>`;}).join('')||'<span class="onto-hint">이 객체에 직접 걸린 Action 없음</span>'}</span></div>`+
      `<div class="onto-d-row"><span class="onto-d-k">관계</span><span class="onto-d-v">${relTxt||'—'}</span></div>`;
  }
  el.querySelectorAll('.onto-node').forEach(g=>{ g.style.cursor='pointer';
    g.onclick=()=>showDetail(+g.dataset.onode);
    g.onkeydown=(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); showDetail(+g.dataset.onode); } };
  });
}
/* B-1: 아키텍처 정합 뷰 — 표준 런타임 = AAP 아키텍처(Loop·8계층·Trust), 도메인이 경유하는 계층 점등 */
function renderArchCoherence(P){
  P=P||PACK;
  const el=document.getElementById('archMap');if(!el)return;
  const usedL=new Set();P.work.forEach(w=>(w.ops||[]).forEach(o=>usedL.add(o.L)));
  const loop=LOOP.map((s,i)=>`${i>0?'<span class="lsep">→</span>':''}<span class="ls ${s==='Learning'?'lp':''}">${s}</span>`).join('');
  const layers=LAYERS.map(L=>`<div class="ac-lyr ${usedL.has(L.id)?'used':''} ${L.star?'star':''}"><span class="lc">${L.id}</span><span class="ln">${L.ko}</span>${L.star?'<span class="lkt">★ kt ds</span>':''}<span class="lcap">${L.cap}</span></div>`).join('');
  el.innerHTML=`<div class="ac-loop">${loop}</div><div class="ac-layers">${layers}</div>
    <div class="ac-trust">Trust · Security · Governance — 전 계층 공통 통제</div>
    <div class="ac-note">표준 런타임 = 이 아키텍처. <b>${dcText(P.label,'pack.label')} Pack</b>이 경유하는 계층이 점등됩니다(${usedL.size}/8). 산업이 바뀌어도 8계층·Operating Loop·Trust는 그대로, <b>Domain Pack만 교체</b>됩니다.</div>`;
}
function renderPlan(P){
  P=P||PACK;
  const PROD=P.planProduces;
  const sel=w=>stIsLive(w)?`<span class="sel-human">${_ICO('flag')}시작·종료 신호</span>`:(stIsGate(w)?`<span class="sel-hitl">${_ICO('flag')}담당자 확인</span>`:(stIsInput(w)?`<span class="sel-human">사람 요청</span>`:`<span class="sel-auto">자동</span>`));
  const makes=w=>{const o=PROD[w.id]||[];return o.length?o.map(x=>`<b>${x}</b>`).join(' · '):'<i style="color:#94a3b8;font-style:normal">중간 처리</i>';};
  const lays=w=>[...new Set((w.ops||[]).map(o=>o.L))].map(l=>`<span>${l}</span>`).join('');
  let h=`<div class="plan-head"><div>#</div><div>단계</div><div>만드는 산출물</div><div>사람이 선택·확인</div><div>거치는 계층</div></div>`;
  P.work.forEach((w,i)=>{h+=`<div class="plan-row ${stIsGateMark(w)?'gate':''}"><div class="pr-n">${i+1}</div><div><div class="pr-label">${w.label}</div><div class="pr-sub">${w.role||stRole(w)}</div></div><div class="pr-make">${makes(w)}</div><div class="pr-sel">${sel(w)}</div><div class="pr-lay">${lays(w)}</div></div>`;});
  document.getElementById('planTable').innerHTML=h;
}
/* =========================================================================
   거버넌스·정책 뷰 → 운영 콘솔 (Eval · RBAC · Agent Ops · 배포 연결) — 도메인 무관
   ───────────────────────────────────────────────────────────────────────
   벤치마크: SK AX Agent Ops(성능·품질·비용·HITL·감사 한 화면) + 메가존 RBAC·ISO42001.
   ★전부 결정론 도출 — 새 저장소 0. APP.cases[].trace(persistToCase 산출) + 팩 work 정의에서
   집계. govStrip(거버넌스4)은 유지·맨 위. 코어 책임 · 도메인 무관(팩별 분기 0).
   ========================================================================= */
/* trace 분류 보조: 단계가 '완료(정착)'됐는가 = 그 단계 라벨의 trace 항목이 존재.
   trace 는 traceStep 이 단계 완료 시 ops 를 누적 → trace 에 등장한 단계 = 처리 완료 단계. */
function _opsClamp(n){ return Math.max(0,Math.min(100,Math.round(n))); }
function _opsTone(p){ return p>=85?'green':(p>=60?'amber':'red'); }
/* ── Eval(평가) 지표 — 배포된 팩 케이스의 trace 에서 결정론 도출(케이스별/전역) ──
   각 케이스에 대해 그 팩 work 정의를 기준선으로:
   · 근거 충족도 = trace 가 닿은 단계 수 / 도달한(현재 sel 까지) 단계 수 — 각 처리 단계가 근거(ops)를 남겼나
   · 정책 준수율 = HITL 게이트(도달분) 중 결정/완료된 비율 — 책임 지점을 사람이 처리했나
   · 실행 성공률 = 완료(done)면 100, 진행 중이면 진행률 — 끝까지 갔나
   · HITL 적시 = HITL 도달 게이트가 모두 처리됐으면 100, 미처리 대기 있으면 비례 차감 */
function _caseEval(c){
  const pack=PACKS[c.packId]; if(!pack)return null;
  const ac=activeCase();
  const tr=(ac&&c.id===ac.id)?STATE.trace:(Array.isArray(c.trace)?c.trace:[]);
  const work=pack.work||[];
  const selIdx=Math.max(0,work.findIndex(w=>w.id===c.sel));
  const reached=work.slice(0,selIdx+1);                 /* 현재 지점까지 도달한 단계 */
  const reachedN=reached.length||1;
  /* 처리(완료) 단계 = trace 에 그 단계 라벨이 등장(traceStep 누적) */
  const tracedLabels=new Set(tr.map(e=>e.st));
  const stepsRan=work.filter(w=>tracedLabels.has(w.label)).length;
  /* 근거 충족도 = 도달 단계 중 근거(trace ops)를 남긴 비율 */
  const evidence=_opsClamp(stepsRan/reachedN*100);
  /* HITL 게이트(도달분) — work.hitl/meeting/gate, 처리 = decisions 또는 done */
  const hitlReached=reached.filter(w=>stIsGate(w));
  const hitlDone=hitlReached.filter(w=>(c.decisions&&c.decisions[w.id])||(stIsLive(w)&&c.meetPhase==='done')||c.done).length;
  const policy=hitlReached.length?_opsClamp(hitlDone/hitlReached.length*100):100;
  /* 실행 성공률 = 완료면 100, 아니면 진행률 */
  const exec=c.done?100:_opsClamp(caseProgress(c));
  /* HITL 적시 = 처리된 HITL / 도달 HITL (미처리 대기 = 적시 미달) */
  const hitlTimely=hitlReached.length?_opsClamp(hitlDone/hitlReached.length*100):100;
  const score=_opsClamp((evidence+policy+exec+hitlTimely)/4);
  return {evidence,policy,exec,hitlTimely,score,hitlReached:hitlReached.length,hitlDone};
}
function _evalMetrics(){
  const cases=APP.cases.filter(c=>PACKS[c.packId]&&isDeployed(c.packId));
  const evals=cases.map(c=>({c,e:_caseEval(c)})).filter(x=>x.e);
  const ran=evals.filter(x=>{ const ac=activeCase(); const tr=(ac&&x.c.id===ac.id)?STATE.trace:(x.c.trace||[]); return tr.length; });
  const avg=k=>ran.length?_opsClamp(ran.reduce((s,x)=>s+x.e[k],0)/ran.length):0;
  return { evals, ran, global:{ evidence:avg('evidence'), policy:avg('policy'), exec:avg('exec'), hitlTimely:avg('hitlTimely'), score:avg('score') } };
}
/* ── Agent Ops 지표 — 성능(단계·진행)·비용(실행/토큰 추정 결정론 시뮬)·품질(Eval) ──
   비용 추정(결정론): 단계당 결정론 op=1단위, LLM(Agent) op=4단위(추론 토큰 가중). 토큰≈단위×420. */
function _agentOpsKpi(em){
  const cases=APP.cases.filter(c=>PACKS[c.packId]&&isDeployed(c.packId));
  let costUnits=0, llmOps=0, detOps=0, runSteps=0;
  em.ran.forEach(({c})=>{
    const pack=PACKS[c.packId]; if(!pack)return;
    const ac=activeCase();
    const tr=(ac&&c.id===ac.id)?STATE.trace:(c.trace||[]);
    const tracedLabels=new Set(tr.map(e=>e.st));
    (pack.work||[]).forEach(w=>{ if(!tracedLabels.has(w.label))return; runSteps++;
      (w.ops||[]).forEach(o=>{ const tk=evidType(o); const llm=blockKind(o,tk)==='llm';
        if(llm){ llmOps++; costUnits+=4; } else { detOps++; costUnits+=1; } });
    });
  });
  const tokens=costUnits*420;
  const avgSteps=em.ran.length?Math.round(runSteps/em.ran.length):0;
  const avgProg=em.ran.length?_opsClamp(em.ran.reduce((s,x)=>s+caseProgress(x.c),0)/em.ran.length):0;
  return { runs:em.ran.length, totalCases:cases.length, avgSteps, avgProg,
    costUnits, tokens, llmOps, detOps, quality:em.global.score };
}
/* ── 운영 요약(거버넌스 상단) — 전 배포 케이스 trace + work 정의에서 결정론 집계 ──
   승인 대기 = 현재 단계가 HITL 게이트인데 아직 결정/완료 안 된 케이스 수(도달·대기).
   정책 위반 차단 = trace 중 통제/차단(_trIsBlock) 항목 수(정책·거버넌스가 멈춘 지점).
   자동 실행 = trace 중 AAP 자동 단계(비-HITL·비-차단) 항목 수(자율 처리 기록).
   사람 확인 전환 = trace 중 HITL(_trIsHITL) 항목 수(책임 지점을 사람에게 넘긴 횟수).
   실패/재시도 = 현 모델에 실패·재시도 기록 없음 → 0(graceful, 허위 수치 ✕).
   소스는 logs(renderTrace) KPI 와 동일(APP.cases[].trace)이되 '배포된 팩 케이스로 한정'(isDeployed 필터) —
   거버넌스=운영(배포) 대상만, 실행추적=전체. 미배포(draft) trace 가 있으면 두 뷰 수치가 갈릴 수 있음(정상). */
function _govSummaryMetrics(){
  const ac=activeCase();
  const cases=APP.cases.filter(c=>PACKS[c.packId]&&isDeployed(c.packId));
  let approvalWait=0, block=0, autoRun=0, hitlSwitch=0;
  cases.forEach(c=>{
    const pack=PACKS[c.packId]; if(!pack)return;
    const tr=(ac&&c.id===ac.id)?STATE.trace:(Array.isArray(c.trace)?c.trace:[]);
    /* 승인 대기: 현재 단계가 게이트 & 미결정 & 미완료 (활성 케이스는 RUN.phase=await 도 인정) */
    const w=(pack.work||[]).find(x=>x.id===c.sel);
    const decided=w&&((c.decisions&&c.decisions[w.id])||(stIsLive(w)&&c.meetPhase==='done'));
    const awaiting=(ac&&c.id===ac.id)?(RUN.phase==='await'):false;
    if(!c.done && w && stIsGate(w) && (!decided||awaiting))approvalWait++;
    tr.forEach(e=>{ if(_trIsBlock(e))block++; else if(_trIsHITL(e))hitlSwitch++; else autoRun++; });
  });
  return { approvalWait, block, autoRun, hitlSwitch, failRetry:0, runs:cases.filter(c=>{ const tr=(ac&&c.id===ac.id)?STATE.trace:(c.trace||[]); return tr.length; }).length };
}
function renderGovern(){
  const gs=document.getElementById('govStrip');
  if(gs)gs.innerHTML=PACK.govern.map(c=>`<div class="gov-cell"><div class="gk">${c.k}</div><div class="gv">${c.v}</div></div>`).join('');
  /* ── 운영 요약 카드(상단) — 결정론 집계 ── */
  const sumEl=document.getElementById('govSummary');
  if(sumEl){
    const S=_govSummaryMetrics();
    const card=(ic,grp,v,k,sub,tip)=>`<div class="gsm ${grp}" data-tip="${tip}"><div class="gsm-ic">${_ICO(ic)}</div><div class="gsm-b"><div class="gsm-v">${v}</div><div class="gsm-k">${k}</div><div class="gsm-sub">${sub}</div></div></div>`;
    sumEl.innerHTML=
      card('clock','wait',S.approvalWait,'승인 대기','HITL 게이트에서 사람 확인 대기','현재 단계가 HITL 게이트인데 아직 결정·완료되지 않은 배포 케이스 수')+
      card('shield','block',S.block,'정책 위반 차단','정책·거버넌스가 멈춘 지점','전 케이스 Run Trace 중 통제·차단으로 분류된 항목 수')+
      card('zap','auto',S.autoRun,'자동 실행','AAP가 자율 처리한 단계','전 케이스 Run Trace 중 사람 개입 없이 자동 처리된(비-HITL·비-차단) 항목 수')+
      card('user-check','hitl',S.hitlSwitch,'사람 확인 전환','책임 지점을 사람에게 넘김','전 케이스 Run Trace 중 HITL(사람 확인)로 전환된 항목 수')+
      card('rotate-ccw','retry',S.failRetry,'실패 · 재시도','현재 기록된 실패·재시도 없음','실행 실패·재시도 기록(현 데이터에 없음 → 0)');
  }
  const em=_evalMetrics();
  /* ── 배포 연결 표기 — deployed 팩만 운영 거버넌스 대상 ── */
  const depEl=document.getElementById('opsDeploy');
  if(depEl){
    const dep=deployedPackIds(), all=Object.keys(PACKS);
    depEl.innerHTML=`<span class="opd-k">운영 거버넌스 대상</span>`+
      `<span class="opd-v"><b>${dep.length}</b> / ${all.length} 유형 배포됨</span>`+
      dep.map(id=>`<span class="opd-chip ${typeTok(id)}">${dcText(typeLabel(id),'pack.label')}</span>`).join('')+
      (all.length>dep.length?`<span class="opd-note">미배포 ${all.length-dep.length}종은 스튜디오 한정(운영 평가·권한 대상 아님)</span>`:'');
  }
  /* ── ① Eval(평가) — 전역 점수 + 4지표 게이지 + 케이스별 ── */
  const evGl=document.getElementById('opsEvalGlobal');
  if(evGl){
    /* 실행 케이스 0이면 0점/0%를 red(_opsTone)로 알람처럼 칠하지 않고 muted 빈상태로 — 케이스 블록(opsEvalCases)과 동일 톤(.ops-empty=--faint) */
    if(!em.ran.length){ evGl.innerHTML=`<div class="ops-empty">아직 실행된 케이스가 없어 평가 점수가 없습니다 — 인박스에서 케이스를 진행하면 Run Trace에서 지표가 산출됩니다.</div>`; }
    else{
    const G=em.global;
    const gauge=(k,v,tip)=>`<div class="eval-m" data-tip="${tip}"><div class="em-h"><span class="em-k">${k}</span><span class="em-v ${_opsTone(v)}">${v}<i>%</i></span></div><div class="em-bar"><span class="${_opsTone(v)}" style="width:${v}%"></span></div></div>`;
    evGl.innerHTML=`<div class="eval-score ${_opsTone(G.score)}"><div class="es-v">${G.score}</div><div class="es-k">종합 Eval 점수</div><div class="es-sub">배포 유형 ${em.ran.length}개 실행 케이스 평균</div></div>`+
      `<div class="eval-ms">`+
      gauge('근거 충족도',G.evidence,'도달한 단계가 근거(Run Trace ops)를 남긴 비율 — 판단마다 증거가 있나')+
      gauge('정책 준수율',G.policy,'도달한 HITL·게이트 중 사람이 처리한 비율 — 책임 지점이 통제됐나')+
      gauge('실행 성공률',G.exec,'케이스가 끝까지 진행된 비율(완료=100, 진행=진행률)')+
      gauge('HITL 적시 처리율',G.hitlTimely,'도달한 HITL 게이트가 적시에 처리된 비율(미처리 대기=차감)')+
      `</div>`;
    }
  }
  const evCa=document.getElementById('opsEvalCases');
  if(evCa){
    if(!em.ran.length){ evCa.innerHTML=`<div class="ops-empty">실행된 케이스가 없습니다 — 인박스에서 케이스를 진행하면 평가 지표가 trace 에서 산출됩니다.</div>`; }
    else evCa.innerHTML=`<div class="evc-head"><div>케이스</div><div>근거</div><div>정책</div><div>실행</div><div>HITL</div><div>종합</div></div>`+
      em.ran.map(({c,e})=>`<div class="evc-row"><div class="evc-t">${typeBadge(c.packId)}<span>${dcText(c.title,'case.title')}</span></div>`+
        [e.evidence,e.policy,e.exec,e.hitlTimely].map(v=>`<div class="evc-c ${_opsTone(v)}">${v}</div>`).join('')+
        `<div class="evc-c sc ${_opsTone(e.score)}">${e.score}</div></div>`).join('');
  }
  /* ── ② RBAC(권한) — 역할 × 권한 매트릭스 (일반 모델 · 도메인 무관) ── */
  const rb=document.getElementById('opsRbac');
  if(rb){
    const ROLES=[
      {id:'agent',ko:'담당자',d:'업무 처리·요청'},
      {id:'reviewer',ko:'검토자',d:'HITL 검토·승인'},
      {id:'approver',ko:'승인자',d:'최종 승인·배포'},
      {id:'admin',ko:'관리자',d:'정책·전체 운영'},
    ];
    const PERMS=[
      {id:'case',ko:'케이스 처리',d:'업무 실행·진행'},
      {id:'hitl',ko:'HITL 승인',d:'게이트 결정·확인'},
      {id:'deploy',ko:'배포(deploy)',d:'유형 운영 편입',gate:1},
      {id:'policy',ko:'정책·워크플로우 변경',d:'팩/규칙 편집'},
    ];
    /* 권한 매트릭스(불리언) — 일반 RBAC. 배포·정책은 승인자/관리자 한정(배포 생애주기 연결). */
    const M={
      agent:    {case:1,hitl:0,deploy:0,policy:0},
      reviewer: {case:1,hitl:1,deploy:0,policy:0},
      approver: {case:1,hitl:1,deploy:1,policy:0},
      admin:    {case:1,hitl:1,deploy:1,policy:1},
    };
    let h=`<div class="rbac-grid" style="grid-template-columns:160px repeat(${PERMS.length},1fr)">`;
    h+=`<div class="rb-corner">역할 \\ 권한</div>`+PERMS.map(p=>`<div class="rb-ph ${p.gate?'gate':''}" data-tip="${p.d}">${p.ko}${p.gate?_ICO('shield'):''}</div>`).join('');
    ROLES.forEach(r=>{ h+=`<div class="rb-rh" data-tip="${r.d}"><b>${r.ko}</b></div>`+
      PERMS.map(p=>{ const ok=M[r.id][p.id]; return `<div class="rb-cell ${ok?'ok':'no'}">${ok?_ICO('check'):'—'}</div>`; }).join(''); });
    h+=`</div><div class="rbac-note">배포(deploy)·정책 변경은 <b>승인자·관리자</b> 권한 — 배포 생애주기(draft→deployed)와 연결. 배포된 유형만 운영 평가·권한 대상.</div>`;
    rb.innerHTML=h;
  }
  /* ── ③ Agent Ops 지표 — 성능·비용·품질 KPI 한 화면(logs 전역 KPI 보완) ── */
  const ao=document.getElementById('opsAgentKpi');
  if(ao){
    const K=_agentOpsKpi(em);
    const card=(grp,k,v,unit,tip)=>`<div class="ao-card ${grp}" data-tip="${tip}"><div class="ao-grp">${grp==='perf'?'성능':grp==='cost'?'비용':'품질'}</div><div class="ao-v">${v}<i>${unit||''}</i></div><div class="ao-k">${k}</div></div>`;
    ao.innerHTML=
      card('perf',K.avgSteps+'단계','평균 처리 단계','','케이스당 완료된 처리 단계 수(trace 기준)')+
      card('perf',K.avgProg+'%','평균 진행률','','실행 케이스 평균 진행률')+
      card('cost',K.costUnits,'실행 비용(단위)','','결정론 op=1·LLM op=4 가중 추정(결정론 시뮬)')+
      card('cost','≈'+(K.tokens>=1000?(K.tokens/1000).toFixed(1)+'k':K.tokens),'추정 토큰','','비용 단위×420 토큰 추정(LLM op 가중)')+
      card('cost',K.llmOps+' / '+K.detOps,'LLM / 결정론 op','','비결정론(Agent)·결정론 op 실행 수')+
      card('qual',K.quality,'품질(Eval 종합)','','①Eval 섹션 종합 점수와 동일 소스');
  }
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
  /* 사용자가 카탈로그에서 직접 연결(connect)한 워크로드를 병합 — 네이티브 usedBy 와 구분(linked). */
  const links=APP.assetLinks||{};
  const out=[...map.values()];
  out.forEach(e=>{ const ls=links[e.key]||[]; e.linked=ls.filter(pid=>PACKS[pid]&&!e.usedBy.includes(pid)); });
  return out;
}
/* 자산 카탈로그 connect — 이 자산을 어느 워크로드(도메인 팩)에 연결할 수 있나(사용 가능한 업무 유형).
   이미 쓰는(usedBy)·이미 연결된(linked) 팩 제외한 나머지 배포 팩 목록(graceful: 없으면 빈 배열). */
function assetAvailablePacks(a){
  return deployedPackIds().filter(pid=>!a.usedBy.includes(pid)&&!(a.linked||[]).includes(pid));
}
function connectAsset(key,pid){
  if(!PACKS[pid])return;
  const ls=(APP.assetLinks[key]=APP.assetLinks[key]||[]);
  if(!ls.includes(pid))ls.push(pid);
  saveApp();
  toast(`‘${dcText(typeLabel(pid),'pack.label')}’ 워크로드에 연결했습니다`);
  closeAssetConnect();
  if(STATE.view==='assets')renderAssets();
}
function disconnectAsset(key,pid){
  const ls=APP.assetLinks[key]; if(!ls)return;
  APP.assetLinks[key]=ls.filter(x=>x!==pid); saveApp();
  if(STATE.view==='assets')renderAssets();
  const back=document.getElementById('acBackdrop'); if(back){ const a=buildAssetCatalog().find(x=>x.key===key); if(a)openAssetConnect(key); }
}
let _acBack=null, _acMenu=null, _acTrigger=null;
function closeAssetConnect(){ if(_acBack){ _acBack.remove(); _acBack=null; _acMenu=null; document.removeEventListener('keydown',_acEsc,true); document.removeEventListener('keydown',_acTrap,true);
    if(_acTrigger&&_acTrigger.focus){ try{ _acTrigger.focus(); }catch(e){} } _acTrigger=null; } }
function _acEsc(ev){ if(ev.key==='Escape')closeAssetConnect(); }
/* 자산 연결 모달 포커스 트랩 — new-case _ncTrap 과 동일 패턴(Tab 순환) */
function _acFocusables(){ if(!_acMenu)return [];
  return Array.prototype.slice.call(_acMenu.querySelectorAll('a[href],button:not([disabled]),textarea:not([disabled]),input:not([type=hidden]):not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'))
    .filter(el=>el.offsetWidth>0||el.offsetHeight>0||el===document.activeElement); }
function _acTrap(ev){ if(ev.key!=='Tab'||!_acMenu)return;
  const f=_acFocusables(); if(!f.length)return;
  const first=f[0], last=f[f.length-1], a=document.activeElement, inside=_acMenu.contains(a);
  if(ev.shiftKey){ if(a===first||!inside){ ev.preventDefault(); last.focus(); } }
  else { if(a===last||!inside){ ev.preventDefault(); first.focus(); } } }
function openAssetConnect(key){
  closeAssetConnect();
  const a=buildAssetCatalog().find(x=>x.key===key); if(!a)return;
  const avail=assetAvailablePacks(a);
  const back=document.createElement('div'); back.id='acBackdrop'; back.className='nc-backdrop'; _acBack=back;
  const usedChips=a.usedBy.map(pid=>`<span class="ac-pk ${typeTok(pid)}"><span class="ac-dot"></span>${dcText(typeLabel(pid),'pack.label')}<i>내장</i></span>`).join('');
  const linkChips=(a.linked||[]).map(pid=>`<span class="ac-pk linked ${typeTok(pid)}"><span class="ac-dot"></span>${dcText(typeLabel(pid),'pack.label')}<button class="ac-unlink" data-unlink="${pid}" aria-label="연결 해제">${_ICO('x')}</button></span>`).join('');
  const availRows=avail.length?avail.map(pid=>{
    const p=PACKS[pid];
    return `<div class="ac-row"><span class="ac-pk ${typeTok(pid)}"><span class="ac-dot"></span>${dcText(typeLabel(pid),'pack.label')}</span><span class="ac-row-sub">${(p.workload&&p.workload.purpose)||dcText((p.tagline||''),'pack.tagline')||'워크로드'}</span><button class="ac-link" data-link="${pid}">${_ICO('plug')}연결</button></div>`;
  }).join(''):`<div class="ac-empty">${_ICO('check-circle')}연결 가능한 다른 배포 워크로드가 없습니다 — 이미 모든 배포 유형에 쓰이거나 연결돼 있습니다.</div>`;
  _acTrigger=document.activeElement;   /* 닫을 때 복귀할 트리거(연결 버튼) */
  back.innerHTML=`<div class="ac-modal" role="dialog" aria-modal="true" aria-labelledby="acHead">
    <button class="ncm-x" id="acClose" aria-label="닫기">${_ICO('x')}</button>
    <div class="ac-h"><span class="ag-type ${a.ty}">${a.type}</span><div class="ac-h-nm" id="acHead">${a.name}</div><span class="ac-h-L">${a.L} ${LK[a.L]||''}</span></div>
    <div class="ac-h-desc">${a.desc||''}</div>
    <div class="ac-sec-k">${_ICO('workflow')}현재 쓰는 워크로드</div>
    <div class="ac-pks">${usedChips||'<span class="ac-none">내장 사용 없음</span>'}${linkChips}</div>
    <div class="ac-sec-k">${_ICO('plug')}이 자산을 연결할 수 있는 업무 유형 <span class="ac-sec-n">선택 → 연결</span></div>
    <div class="ac-avail">${availRows}</div></div>`;
  document.body.appendChild(back);
  _acMenu=back.querySelector('.ac-modal');
  back.onclick=e=>{ if(e.target===back)closeAssetConnect(); };
  back.querySelector('#acClose').onclick=closeAssetConnect;
  back.querySelectorAll('[data-link]').forEach(b=>b.onclick=()=>connectAsset(key,b.dataset.link));
  back.querySelectorAll('[data-unlink]').forEach(b=>b.onclick=()=>disconnectAsset(key,b.dataset.unlink));
  document.addEventListener('keydown',_acEsc,true);
  /* a11y: 포커스 트랩 + 초기 포커스(첫 연결 버튼 → 없으면 닫기) — new-case 패턴 재사용 */
  document.addEventListener('keydown',_acTrap,true);
  setTimeout(()=>{ const first=back.querySelector('.ac-link')||back.querySelector('#acClose'); if(first)first.focus(); },0);
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
    const linked=(a.linked||[]).map(pid=>`<span class="ag-use linked ${typeTok(pid)}"><span class="ac-dot"></span>${dcText(typeLabel(pid),'pack.label')}<i>연결됨</i></span>`).join('');
    const hl=_assetHL&&_assetHL===a.key?' hl':'';
    return `<div class="ag ${a.asset?'asset':''}${hl}" data-akey="${a.key}"><div class="ag-h"><div class="ag-ic">${a.ic}</div><div><span class="ag-type ${a.ty}">${a.type}</span><div class="ag-name">${a.name}</div></div><span class="ag-lay">${a.L} ${LK[a.L]}</span>${a.asset?'<span class="ag-kt">kt ds</span>':''}</div><div class="ag-desc">${a.desc}</div><div class="ag-meta"><div class="ag-m when"><div class="ag-mk">${_ICO('compass')}언제 쓰나</div><div class="ag-mv">${a.when}</div></div><div class="ag-m data"><div class="ag-mk">${_ICO('folder')}사용 데이터</div><div class="ag-mv">${a.data}</div></div><div class="ag-m how"><div class="ag-mk">${_ICO('settings')}수행 방식</div><div class="ag-mv">${a.how}</div></div></div><div class="ag-used"><span class="agu-k">${_ICO('workflow')}쓰는 도메인 팩</span><span class="agu-v">${used||'—'}${linked}</span><button class="ag-connect" data-connect="${a.key}" data-tip="이 자산을 다른 업무 유형(워크로드)에 연결">${_ICO('plug')}연결</button></div></div>`;
  }).join('');
  reg.querySelectorAll('[data-connect]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); openAssetConnect(b.dataset.connect); });
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
let _logSel=null;     /* 선택 step: '<caseId>|<idx>' — 우측 근거 패널 대상 */
/* trace 항목 분류 — HITL/차단(통제)/학습 집계 키(k·t 기반·도메인 무관) */
function _trIsHITL(e){ return e.k==='HITL'; }
function _trIsBlock(e){ return e.k==='통제' || /차단|보류|제외|거부/.test(e.t||''); }
/* provenance 역할 분류(viz_decomp lineage 모델과 동일 taxonomy) — 색으로 '왜 이 결과인가' 분리.
   분류 기준은 '실행 모드(LLM/결정론)'가 아니라 '계층(L)' — 그래서 judgment 라벨은 모드 중립(추론 계층).
   원천(source)·결정론 처리(transform)·추론 계층 L3·L4(judgment)·사람 통제점(gate). 도메인 무관(k·L 기반).
   ※ L3·L4 는 결정론 규칙 또는 LLM 으로 처리될 수 있으므로 'LLM 판단'으로 단정하지 않는다(정직 표기). */
const _TR_ROLE={
  source:{ko:'원천 데이터',en:'Source',cls:'rSource'},
  transform:{ko:'결정론 처리',en:'Deterministic',cls:'rTransform'},
  judgment:{ko:'추론 계층(L3·L4)',en:'Reasoning Layer',cls:'rJudgment'},
  gate:{ko:'사람 통제점',en:'Human Gate',cls:'rGate'},
};
function _trRole(e){
  if(_trIsHITL(e)||_trIsBlock(e)||e.L==='L7')return 'gate';
  if(e.k==='Connector'||e.L==='L5'||e.L==='L1')return 'source';
  if(e.L==='L3'||e.L==='L4')return 'judgment';
  return 'transform';
}
/* 재현 ID — 케이스 식별자에서 결정론 해시(FNV-1a). 같은 케이스=항상 같은 ID(감사·재현). */
function _runId(id){ let h=2166136261>>>0; const s=String(id||'');
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
  return 'RUN-'+(h.toString(36).toUpperCase().replace(/[^A-Z0-9]/g,'')+'00000').slice(0,5); }
/* trace 항목 → 근거 패널 데이터(입력·산출·승인·계층). t='feed → out' 패턴을 분해(결정론). */
function _trEvi(c,e,idx){
  const role=_TR_ROLE[_trRole(e)], rid=_runId(c.id);
  const parts=String(e.t||'').split('→');
  const inp=parts.length>1?parts[0].trim():(_trRole(e)==='gate'?'담당자 판단 대기':'—');
  const out=parts.length>1?parts.slice(1).join('→').trim():String(e.t||'').trim();
  const approver=_trRole(e)==='gate'?'담당자 · 현업 승인':'자동 · 시스템 기록';
  return {role,rid,inp,out,approver};
}
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
  /* ── 타임라인/계보 — 케이스별 입력→판단→승인→실행→결과 흐름 + provenance 색 분리 + 재현 ID ──
     통합이면 전 케이스(그룹 헤더), 특정 케이스면 그것만. 단순 로그 목록 ✕ → '왜 이 결과인가' 추적. */
  const groups=cases.filter(({c,tr})=>tr.length && (_logCase==='all'||c.id===_logCase));
  if(!groups.length){el.innerHTML='<div class="tr-empty">아직 기록 없음 — Run 을 실행하거나 단계를 진행하면 입력→판단→승인→실행→결과가 케이스별로 누적되고, 재현 ID로 다시 추적할 수 있습니다(감사·재현 가능).</div>';return;}
  /* 선택 step 해석(없거나 무효면 첫 그룹 첫 단계) */
  let selC=null,selE=null,selI=-1;
  if(_logSel){ const sp=_logSel.split('|'), g=groups.filter(x=>x.c.id===sp[0])[0];
    if(g&&g.tr[+sp[1]]){ selC=g.c; selI=+sp[1]; selE=g.tr[selI]; } }
  if(!selE){ selC=groups[0].c; selI=0; selE=groups[0].tr[0]; _logSel=selC.id+'|0'; }
  /* 스트림(좌) — 케이스 그룹 → provenance dot + 단계 + '기록됨' */
  const stream=groups.map(({c,tr})=>{
    const rid=_runId(c.id);
    const head=`<div class="tl-ghead"><span class="tl-case ${typeTok(c.packId)}"><span class="ac-dot"></span>${dcText(c.title,'case.title')}</span>`+
      `<span class="tl-rid" data-tip="재현 ID — 이 케이스 실행을 동일 입력·룰·결과로 다시 추적하는 식별자">${rid}</span>`+
      `<span class="tl-gn">${tr.length}단계 기록됨</span></div>`;
    const nodes=tr.map((e,i)=>{ const role=_TR_ROLE[_trRole(e)], key=c.id+'|'+i, sel=_logSel===key;
      return `<button class="tl-node ${role.cls}${sel?' sel':''}" data-tk="${key}">`+
        `<span class="tl-dot"></span>`+
        `<div class="tl-main"><div class="tl-top"><span class="tl-step">${e.st||''}</span>`+
        `<span class="tl-role">${role.ko}<span class="tl-en"> · ${role.en}</span></span>`+
        `<span class="tl-rec">${_ICO('check')}기록됨</span></div>`+
        `<div class="tl-t">${e.t||''}</div></div>`+
        `<span class="tl-L">${e.L||''} ${KMAP[e.L]||''}</span></button>`;
    }).join('');
    return `<div class="tl-grp">${head}${nodes}</div>`;
  }).join('');
  /* 근거 패널(우) — 선택 단계의 입력·룰·승인·결과·재현 ID */
  const v=_trEvi(selC,selE,selI);
  const row=(k,val)=>`<div class="tl-evi-row"><span class="tl-evi-k">${k}</span><span class="tl-evi-v">${val||'—'}</span></div>`;
  const evi=`<div class="tl-evi-head"><span class="tl-evi-dot ${v.role.cls}"></span><span class="tl-evi-role">${v.role.ko}</span>`+
    `<span class="tl-evi-rid">${v.rid} · #${selI+1}</span></div>`+
    `<div class="tl-evi-step">${selE.st||''}</div>`+
    row('처리 방식',v.role.ko+'<span class="tl-en"> · '+v.role.en+'</span>')+
    row('입력 · 근거',v.inp)+
    row('적용 · 산출',v.out)+
    row('승인 · 책임',v.approver)+
    row('거치는 계층',(selE.L||'')+' '+(KMAP[selE.L]||''))+
    `<div class="tl-evi-foot">${_ICO('check')}<span>이 단계는 거버넌스 로그에 기록되어, 재현 ID <b>${v.rid}</b>로 동일 입력·룰·결과를 다시 추적할 수 있습니다. 색은 <b style="color:var(--violet-300)">추론 계층(L3·L4)</b>·<b style="color:var(--teal-300)">결정론 처리</b>를 <b>계층</b> 기준으로 구분합니다(L3·L4는 결정론 규칙 또는 LLM으로 처리될 수 있습니다).</span></div>`;
  el.innerHTML=`<div class="tl-wrap"><div class="tl-stream">${stream}</div><aside class="tl-evi-wrap">${evi}</aside></div>`;
  el.querySelectorAll('.tl-node').forEach(b=>b.onclick=()=>{ _logSel=b.dataset.tk; renderTrace(); });
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
  /* HITL 게이트 결정(yes/no) — 본 화면 인라인 결정 바가 호출(#4: 결정은 모달 ✕ 본 화면). */
  decide:(v)=>{ const w=W(STATE.sel); if(stIsGate(w)&&RUN.phase==='await')decide(v); },
  /* 특정 시드 케이스로 진입(deep-link · 결정론) — seedKey='packId:index'. 없으면 무시(graceful). */
  openSeed:(seedKey)=>{ const c=APP.cases.find(x=>x.seedKey===seedKey); if(c)openCase(c.id); },
  /* 현재 케이스 verdict 스냅샷(결정론 검증·deep-link 용 · 읽기전용) */
  verdict:()=>STATE.verdict?{outcome:STATE.verdict.outcome,ruleId:STATE.verdict.ruleId,reproducible:STATE.verdict.reproducible}:null,
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

/* =========================================================================
   AI FDE 전역 패널 (플랫폼 설계 보조) — 모든 화면에서 topbar 버튼으로 토글
   ───────────────────────────────────────────────────────────────────────
   챗봇 ✕ → 실무형 액션 어시스턴트. 제안 결과가 분해 뷰·생성·온톨로지로 반영.
   ① 이 업무 구조화: AAP_VIZ_BRIDGE.analyze(분해뷰) + ncCreateNewType(생성) 재사용
   ② 근거 설명: 현재 화면·케이스 맥락 결정론 요약  ③ 온톨로지 초안: 현재 팩 객체
   결정론(프록시 없어도 detViz 폴백). 코어 일반 · 도메인 무관. */
const _FDE_VIEWL={inbox:'인박스 · 요청·검토 업무 입구',domain:'지식 라이브러리 · 도메인 팩',workflow:'워크로드 스튜디오 · 실행 구조 분해',assets:'자산 카탈로그 · 5타입 조합 재료',logs:'실행 추적 · Run Trace·계보',govern:'거버넌스 · 정책·평가·권한',run:'업무 실행 · 런타임 콘솔',demo:'시연 · Guided Tour'};
function _fdeEsc(ev){ if(ev.key==='Escape')toggleFde(false); }
function toggleFde(force){
  const on=(typeof force==='boolean')?force:!document.body.classList.contains('fde-on');
  document.body.classList.toggle('fde-on',on);
  const p=document.getElementById('fdePanel'); if(p)p.setAttribute('aria-hidden',on?'false':'true');
  const tb=document.getElementById('fdeToggle'); if(tb)tb.classList.toggle('on',on);
  document.removeEventListener('keydown',_fdeEsc,true);
  if(on){ document.addEventListener('keydown',_fdeEsc,true); setTimeout(()=>{ const ta=document.getElementById('fdeText'); if(ta)ta.focus(); },0); }
}
function fdeRunDecomp(){
  const ta=document.getElementById('fdeText'), el=document.getElementById('fdeDecomp');
  if(!ta||!el)return; const t=ta.value.trim();
  if(!t){ toast('업무를 한 줄 설명해 주세요'); ta.focus(); return; }
  el.hidden=false;
  if(window.AAP_VIZ_BRIDGE&&window.AAP_VIZ_BRIDGE.analyze){ try{ window.AAP_VIZ_BRIDGE.analyze(t,el); }catch(e){ el.innerHTML='<div class="fde-note">분해 모듈을 불러오지 못했습니다. 생성은 계속 가능합니다.</div>'; } }
  else el.innerHTML='<div class="fde-note">분해 모듈을 불러오지 못했습니다.</div>';
}
function fdeCreate(){
  const ta=document.getElementById('fdeText'); if(!ta)return; const t=ta.value.trim();
  if(!t){ toast('업무를 한 줄 설명해 주세요'); ta.focus(); return; }
  toggleFde(false);              /* 패널 닫고 신규 유형 생성(분해 결과로 Pack·인박스 편입) */
  if(typeof ncCreateNewType==='function')ncCreateNewType(t);
}
function fdeCtx(){
  const el=document.getElementById('fdeCtx'); if(!el)return; el.hidden=false;
  const c=activeCase(), dep=deployedPackIds().length, all=Object.keys(PACKS).length;
  const row=(k,v)=>`<div class="fde-ctx-row"><span class="fde-ck">${k}</span><span class="fde-cv">${v}</span></div>`;
  let narr, rows='';
  if(STATE.view==='run'&&c){
    const pack=PACKS[c.packId], w=pack&&(pack.work||[]).find(x=>x.id===c.sel), gate=w&&stIsGate(w);
    narr=`지금 <b>${dcText(typeLabel(c.packId),'pack.label')}</b> 유형의 업무 <b>${dcText(c.title,'case.title')}</b>를 실행 중입니다. `+
      (gate?'현재 단계는 사람 확인(HITL) 게이트입니다 — AAP가 옵션을 제시하고 결정은 사람이 합니다.':'AAP가 단계를 자율로 진행하며, 되돌리기 어려운 행동 직전에만 멈춰 확인을 받습니다.');
    rows=row('현재 화면',_FDE_VIEWL.run)+row('업무 유형',dcText(typeLabel(c.packId),'pack.label'))+row('현재 단계',`${w?(w.label||w.id):'-'}${gate?' · HITL 게이트':''}`)+row('진행률',`${caseProgress(c)}%`);
  } else {
    narr=`현재 <b>${_FDE_VIEWL[STATE.view]||STATE.view}</b> 화면입니다. 이 플랫폼은 업무를 이해해 <b>Agent·Module·기존 솔루션·Connector·Policy</b>를 조합하고, 사람 확인(HITL)과 거버넌스로 운영합니다 — Agent를 많이 띄우는 구조가 아닙니다.`;
    rows=row('현재 화면',_FDE_VIEWL[STATE.view]||STATE.view)+row('활성 업무 유형',dcText(typeLabel(APP.pack),'pack.label'))+row('배포 워크로드',`${dep} / ${all} 유형`)+row('등록 업무',`${APP.cases.length}건`);
  }
  el.innerHTML=`<div class="fde-ctx-narr">${narr}</div>${rows}`;
}
function fdeOnto(){
  const el=document.getElementById('fdeOnto'); if(!el)return; el.hidden=false;
  const c=activeCase(), pid=(STATE.view==='run'&&c)?c.packId:APP.pack, pack=PACKS[pid], o=pack&&pack.ontology;
  const KINDL={entity:'엔티티',event:'이벤트',document:'문서',master:'기준정보'};
  if(o&&(o.objects||[]).length){
    const objs=o.objects.map(x=>{ const k=x.kind||'entity'; return `<span class="fde-ob k${k}"><i></i>${KINDL[k]||k} · ${dcText(x.n||x.name||'',  'onto.obj')}</span>`; }).join('');
    const nrel=(o.relations||[]).length;
    el.innerHTML=`<div class="fde-onto-h">${dcText(typeLabel(pid),'pack.label')} · 객체 ${o.objects.length}종${nrel?` · 관계 ${nrel}`:''}</div><div class="fde-obs">${objs}</div><div class="fde-note">전체 객체·관계·단계별 사용은 <b>지식 라이브러리 → 온톨로지(L4)</b> 탭에서 봅니다.</div>`;
  } else {
    const outs=(pack&&pack.workload&&pack.workload.outputs)||[];
    el.innerHTML=`<div class="fde-note"><b>${dcText(typeLabel(pid),'pack.label')}</b>은 아직 명시 온톨로지가 없습니다. 위에 업무를 설명해 <b>분해</b>하면 라이브 LLM이 온톨로지 초안을 함께 제시합니다(프록시 가동 시).`+(outs.length?` 현재 산출물 단서: ${outs.join(' · ')}`:'')+`</div>`;
  }
}

/* ===== wiring ===== */
{ const _ft=document.getElementById('fdeToggle'); if(_ft)_ft.onclick=()=>toggleFde();
  const _fx=document.getElementById('fdeClose'); if(_fx)_fx.onclick=()=>toggleFde(false);
  const _fd=document.getElementById('fdeDecompBtn'); if(_fd)_fd.onclick=fdeRunDecomp;
  const _fc=document.getElementById('fdeCreateBtn'); if(_fc)_fc.onclick=fdeCreate;
  const _fctx=document.getElementById('fdeCtxBtn'); if(_fctx)_fctx.onclick=fdeCtx;
  const _fo=document.getElementById('fdeOntoBtn'); if(_fo)_fo.onclick=fdeOnto; }
document.querySelectorAll('#gnav .gnav-i').forEach(b=>b.onclick=()=>setView(b.dataset.view));
const _runb=document.getElementById('runBtn');if(_runb)_runb.onclick=()=>STATE.playing?stopPlay():startPlay();
document.getElementById('devToggle').onchange=e=>document.body.classList.toggle('dev-on',e.target.checked);
const _nc=document.getElementById('newCaseBtn');if(_nc)_nc.onclick=()=>promptNewCase(_nc);
/* 스튜디오 '＋ 신규 격상' → 격상 파이프라인(없으면 자동저작 오버레이) — 상단 '업무 격상' 버튼 흡수 */
const _np=document.getElementById('newPromoteBtn');if(_np)_np.onclick=()=>{ if(window.AAP_PIPELINE)window.AAP_PIPELINE.open(); else if(window.AAP_AUTHORING_OPEN)window.AAP_AUTHORING_OPEN(); };
const _rb=document.getElementById('rtBack');if(_rb)_rb.onclick=()=>{if(STATE.playing)stopPlay();setView('inbox');};
const _tb=document.getElementById('tbBack');if(_tb)_tb.onclick=()=>{if(STATE.playing)stopPlay();setView('inbox');};   /* 상단 통합 '내 업무' (runtop 폐지) */
/* ── 단계 되짚기 = 안정 조상에 클릭 위임 1회 바인딩(매 렌더 재바인딩 ✕) ──
   자동재생(autoAdvanceOnOpen) 중엔 strip/seq 가 매 reveal 틱마다 재생성되어 per-element onclick 이
   유실됐다(클릭 무반응 → 자동전진 계속 → '직전 단계로 이동 안 됨'). 위임은 재렌더 무관 항상 동작.
   클릭 시 stopPlay 로 자동재생을 멈추고 그 단계에 정착(안 멈추면 runStep 이 다시 앞 게이트로 전진). */
function navToStep(id){ if(!id||liveBusy()||!W(id))return; if(STATE.playing)stopPlay(); setSel(id); }
(function initStageNav(){
  const seq=document.getElementById('seq');
  if(seq)seq.addEventListener('click',e=>{ const n=e.target.closest('.snode[data-go]'); if(n)navToStep(n.dataset.go); });
  const surf=document.querySelector('.run-surface');
  if(surf)surf.addEventListener('click',e=>{ const s=e.target.closest('[data-opstep]'); if(s)navToStep(s.dataset.opstep); });
})();
/* (옛 'AAP 작동 보기' 토글 드로어는 「업무 진행」 탭으로 흡수 — aapTg/aapTgX 제거. 호환 함수만 유지) */

/* =========================================================================
   [COLLAPSE] 레이아웃 패널 접기 (좌 nav · run 근거 레일 · workflow 팔레트/Run)
   상태는 APP.collapse 단일 소스에 영속(localStorage · SCHEMA_VER 정합). body 클래스로 CSS 구동.
   접힘 토글이 demo.js 의 '#gnav [data-view]' 클릭을 막지 않게 — nav 는 폭만 줄고 버튼은 그대로 클릭 가능.
   ========================================================================= */
const _COL_CLS={nav:'nav-collapsed', evid:'evid-collapsed', wfpal:'wfpal-collapsed', wfrun:'wfrun-collapsed'};
function applyCollapse(){
  Object.keys(_COL_CLS).forEach(k=>document.body.classList.toggle(_COL_CLS[k], !!APP.collapse[k]));
  /* AAP 작동 드로어는 run 뷰에서만 펼침(운영자 패널과 분리). 토글 상태는 영속하되 노출은 run 한정. */
  document.body.classList.toggle('aap-drawer-on', !!APP.collapse.aapDrawer && APP.view==='run');
  const tg=document.getElementById('aapTg'); if(tg)tg.classList.toggle('on', !!APP.collapse.aapDrawer);
}
function toggleCollapse(k){ if(!(k in APP.collapse))return; APP.collapse[k]=!APP.collapse[k]; applyCollapse(); saveApp(); }
window.AAP_toggleCollapse=toggleCollapse;
/* 정적/동적 버튼 공통 위임 — 팔레트·Run fold 는 매 렌더 재생성되므로 document 위임으로 안정 바인딩 */
document.addEventListener('click',e=>{
  const b=e.target.closest('#navToggle,#evidFold,#evidHandle,#wfPalFold,#wfPalHandle,#wfRunFold,#wfRunHandle'); if(!b)return;
  const map={navToggle:'nav', evidFold:'evid', evidHandle:'evid', wfPalFold:'wfpal', wfPalHandle:'wfpal', wfRunFold:'wfrun', wfRunHandle:'wfrun'};
  e.preventDefault(); toggleCollapse(map[b.id]);
});

/* [DOMAIN-TABS] 도메인 뷰 탭 전환(개요/온톨로지/아키텍처) — 세로 스택 → 1뷰포트 탭. 상태 영속. */
function applyDomTab(){
  document.querySelectorAll('#domTabs .dom-tab').forEach(t=>t.classList.toggle('on',t.dataset.domtab===APP.domTab));
  document.querySelectorAll('.dom-pane').forEach(p=>p.classList.toggle('on',p.dataset.dompane===APP.domTab));
}
document.querySelectorAll('#domTabs .dom-tab').forEach(t=>t.onclick=()=>{ APP.domTab=t.dataset.domtab; applyDomTab(); saveApp(); });

const TIP=document.getElementById('tip');
document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-tip]');if(t){TIP.textContent=t.getAttribute('data-tip');TIP.style.display='block';const r=t.getBoundingClientRect();TIP.style.left=Math.min(r.left,window.innerWidth-320)+'px';let tp=r.bottom+8;if(tp+TIP.offsetHeight>window.innerHeight)tp=r.top-TIP.offsetHeight-8;TIP.style.top=Math.max(8,tp)+'px';}else if(!e.target.closest('#tip'))TIP.style.display='none';});

/* ===== boot (영속 복원 → 통합 인박스 중심) =====
   도메인 셀렉터(모드 전환) 폐지: 인박스는 전 유형 통합. 런타임 컨텍스트는 케이스 열 때 결정. */
(function(){
  const q=new URLSearchParams(location.search);
  if(q.get('dev')==='1'){document.body.classList.add('dev-on');document.getElementById('devToggle').checked=true;}
  APP.demo=q.get('demo')==='1';   /* ?demo=1 일 때만 더미 시드 케이스 로드 — 기본은 빈 인박스 */
  loadApp();
  if(!APP.demo)APP.cases=APP.cases.filter(c=>!c.seedKey);  /* 비데모 부팅: 이전 데모서 영속된 더미 시드 제거(사용자 생성 케이스=seedKey 없음=보존) */
  applyCollapse(); applyDomTab();  /* 레이아웃 접힘·도메인 탭 영속 복원 */
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
  const qseed=q.get('seed');   /* 시드 케이스 안정키(packId:index) 딥링크 — 공유·데모·검증용(id 는 비결정적이라 seedKey 로) */
  const seedCase=qseed?APP.cases.find(c=>c.seedKey===qseed):null;
  if(qopen&&APP.cases.some(c=>c.id===qopen)){openCase(qopen);}
  else if(seedCase){openCase(seedCase.id);}
  else if(view==='run'&&APP.active&&APP.cases.some(c=>c.id===APP.active)){openCase(APP.active);}
  else { APP.active=null; setView(view==='run'?'inbox':view); }
  /* ?step=<stepId> — 열린 케이스를 특정 단계로 이동(게이트면 await 정지). 데모·헤드리스 게이트 검증용. */
  const qstep=q.get('step');
  if(qstep&&APP.active&&W(qstep)){ if(STATE.playing)stopPlay(); setSel(qstep); }
})();
})();
