/* =========================================================================
   AAP Domain Pack — 계약 관리 (contract_a) · bake된 팩(N3 §E-A 오프라인 bake)
   ─────────────────────────────────────────────────────────────────────────
   출처: _harness_out/packs_baked/pack_contract_A.json (하니스 → adapter v0.1).
   ★ "채용은 예시일 뿐, 다른 도메인(계약)도 같은 조작형 결정 콘솔을 자동으로 가진다"를 증명.
   채용=리스트형(후보 랭킹), 계약=단일 케이스형(슬롯+판정) — 같은 프레임워크, 다른 모양.

   코어 일반 메커니즘만 소비(계약 전용 코어 분기 0):
     · caseModel.slots  → 케이스 슬롯 패널(값·출처·추출방식)
     · knowledge.route  → AAP_EVALUATE.evaluate 가 verdict 산출(STATE.verdict)
     · io.editable(thresholds) → steerHook 으로 임계 조정 → evalCase 재실행 → verdict 갱신
     · lookupTables     → 참조 룩업(필수조항·결재선·인지세) 보조 표시
     · surface.opstage  → 조작형 결정 콘솔(채용과 같은 척추: steering→재계산→근거→HITL)

   ★ knowledge.route 는 '실행 가능한 안전 DSL'(evaluate 가 소비). bake JSON 의 decisionTables 는
     prose(휴리스틱) 라 그대로 못 돌림 → 같은 로직을 DSL 로 인코딩, seeds 10건 골든 통과(검증).
     임계는 $th_riskScore / $th_pdfConf 슬롯으로 참조 → io.editable 조정이 verdict 를 가른다.
   ========================================================================= */
(function(){
  const I=(n,c)=>window.AAP_ICON?window.AAP_ICON.svg(n,c?{cls:c}:undefined):'';
  const won=(n)=>{ n=Number(n)||0; return n.toLocaleString('ko-KR')+'원'; };
  const manwon=(n)=>{ n=Number(n)||0; return n>=10000?(Math.round(n/10000)).toLocaleString('ko-KR')+'만원':won(n); };

  /* ── verdict outcome → 표시 메타(green/amber/red). 도메인 무관 3분기 라벨화 ── */
  const OUTCOME={
    AUTO_APPROVE:{ko:'자동승인', cls:'ok',   ic:'check-circle', sub:'결재선 자동구성 → 상신 준비'},
    LEGAL_REVIEW:{ko:'법무검토', cls:'warn', ic:'user-check',   sub:'사람이 확정해야 하는 지점(HITL)'},
    REJECT:      {ko:'반려',     cls:'risk', ic:'alert-triangle', sub:'치명 결격 — 자동 진행 차단'},
  };

  /* =======================================================================
     caseModel — 결정 슬롯(값은 케이스 seed 가 채움). 출처·추출방식 표기로 '어떻게 알았나'를 보임.
     화면 슬롯 패널은 이 중 핵심만 노출(slotsPrimary) + 전체는 펼침.
     ======================================================================= */
  const SLOTS=[
    {key:'contractType', label:'계약유형', type:'enum', source:'계약마스터', extract:'rule', group:'기본'},
    {key:'contractNature', label:'신규/갱신/변경', type:'enum', source:'계약마스터', extract:'rule', group:'기본'},
    {key:'counterpartyId', label:'거래처', type:'string', source:'거래처마스터', extract:'rule', group:'기본'},
    {key:'contractAmount', label:'계약금액', type:'number', source:'계약마스터', extract:'rule', group:'기본', money:true},
    {key:'contractStartDate', label:'계약 시작일', type:'date', source:'계약서PDF', extract:'doc', group:'기간'},
    {key:'contractEndDate', label:'계약 만기일', type:'date', source:'계약서PDF', extract:'doc', group:'기간'},
    {key:'autoRenewal', label:'자동갱신', type:'boolean', source:'계약서PDF', extract:'doc', group:'기간'},
    {key:'renewalNoticeDays', label:'갱신거절 통지기한', type:'number', source:'계약서PDF', extract:'doc', group:'기간', unit:'일'},
    {key:'governingLaw', label:'준거법', type:'string', source:'계약서PDF', extract:'doc', group:'조항'},
    {key:'jurisdiction', label:'관할', type:'string', source:'계약서PDF', extract:'doc', group:'조항'},
    {key:'clausesPresent', label:'추출 조항', type:'array', source:'계약서PDF', extract:'doc', group:'조항'},
    {key:'missingMandatoryClauses', label:'필수조항 누락', type:'array', source:'필수조항표 대조', extract:'rule', group:'점검', risk:true},
    {key:'toxicClauseHits', label:'독소조항 매칭', type:'array', source:'독소패턴표 매칭', extract:'rule', group:'점검', risk:true},
    {key:'riskGrade', label:'위험등급', type:'enum', source:'독소·편차 종합', extract:'rule', group:'점검', risk:true},
    {key:'compositeRiskScore', label:'종합 위험점수', type:'number', source:'점검결과 가중합', extract:'rule', group:'점검', risk:true},
    {key:'pdfExtractConfidence', label:'추출 신뢰도', type:'number', source:'계약서PDF OCR', extract:'doc', group:'점검'},
    {key:'templateDigitalized', label:'표준템플릿 디지털화', type:'boolean', source:'gap', extract:'manual', group:'점검', gap:true},
    {key:'amountMatchesPo', label:'ERP 발주금액 정합', type:'boolean', source:'SAP(MM/FI) 대조', extract:'rule', group:'점검'},
    {key:'erpPoAmount', label:'ERP 발주금액', type:'number', source:'SAP(MM/FI)', extract:'connector', group:'점검', money:true},
    {key:'sanctionListHit', label:'제재리스트 해당', type:'boolean', source:'거래처마스터·SAP', extract:'rule', group:'거래처', risk:true},
    {key:'creditGrade', label:'신용등급', type:'enum', source:'SAP(FI)', extract:'connector', group:'거래처'},
    {key:'reputationRisk', label:'평판·간접 리스크', type:'enum', source:'gap', extract:'manual', group:'거래처', gap:true},
    {key:'approverLine', label:'위임전결 결재선', type:'array', source:'금액→위임전결표', extract:'rule', group:'결재'},
    {key:'stampTaxDue', label:'인지세 과세대상', type:'boolean', source:'계약유형·금액', extract:'rule', group:'결재'},
    {key:'stampTaxAmount', label:'인지세 세액', type:'number', source:'인지세 과세표', extract:'rule', group:'결재', money:true},
  ];
  const slotByKey={}; SLOTS.forEach(s=>slotByKey[s.key]=s);

  /* =======================================================================
     knowledge — route(실행 DSL · evaluate 소비) + lookupTables(참조) + thresholds(io.editable).
     route: 위→아래 첫 매칭. 임계는 $th_riskScore/$th_pdfConf 슬롯 참조 → 조정이 verdict 를 가름.
     보수 성향 = 임계 낮게·경계대역 넓게 법무검토(HITL).
     ======================================================================= */
  const TOXIC_HIGH=['무제한 손해배상 / 배상한도 미설정','상대방 일방 임의해지','과도한 위약벌(계약금액 20% 초과)'];
  const CORE_CLAUSES=['손해배상','해지','준거법','관할'];
  const ROUTE={ rules:[
    {id:'r_reject_sanction', outcome:'REJECT', label:'반려(치명 결격)',
      basis:'거래처 제재리스트/거래정지 또는 신용등급 E·F 해당 → 자동 진행 불가',
      when:{ any:[ {'==':['$sanctionListHit',true]}, {in:['$creditGrade',['E','F']]} ] }},
    {id:'r_reject_missing', outcome:'REJECT', label:'반려(핵심 필수조항 누락)',
      basis:'손해배상·해지·준거법·관할 등 핵심 필수조항 누락 → 보완 후 재상정',
      when:{ intersects:['$missingMandatoryClauses', CORE_CLAUSES] }},
    {id:'r_reject_amount', outcome:'REJECT', label:'반려(금액 정합 실패·요청자 보완)',
      basis:'계약금액과 ERP 발주금액 불일치 → 요청자 보완 필요',
      when:{ '==':['$amountMatchesPo',false] }},
    {id:'r_rev_pdf', outcome:'LEGAL_REVIEW', label:'법무검토(추출 신뢰도 저하·문서 보완)',
      basis:'PDF 추출 신뢰도가 임계 미만 → 핵심필드 정확성 미보장, 사람 원문 대조',
      when:{ '<':['$pdfExtractConfidence','$th_pdfConf'] }},
    {id:'r_rev_template', outcome:'LEGAL_REVIEW', label:'법무검토(템플릿 편차 자동대조 불가 갭)',
      basis:'표준템플릿 미디지털화(data gap) + 신규/변경 건 → 편차 수기 점검 필요',
      when:{ all:[ {'==':['$templateDigitalized',false]}, {in:['$contractNature',['신규','변경']]} ] }},
    {id:'r_rev_toxic', outcome:'LEGAL_REVIEW', label:'법무검토(독소조항 심층검토)',
      basis:'고위험 독소조항(무제한 배상·일방해지·과도 위약벌) 1건 이상 → 협상·수정 권한 결정',
      when:{ intersects:['$toxicClauseHits', TOXIC_HIGH] }},
    {id:'r_rev_risk', outcome:'LEGAL_REVIEW', label:'법무검토(보수 임계·경계대역 회부)',
      basis:'위험등급 중 또는 종합 위험점수가 임계 이상 → 보수 임계로 회부',
      when:{ any:[ {'==':['$riskGrade','중']}, {'>=':['$compositeRiskScore','$th_riskScore']} ] }},
    {id:'r_rev_rep', outcome:'LEGAL_REVIEW', label:'법무검토(평판·신용 간접 리스크)',
      basis:'거래처 평판 의심 이상 또는 신용 D등급 → 간접 리스크 사람 판단',
      when:{ any:[ {in:['$reputationRisk',['의심','위험']]}, {'==':['$creditGrade','D']} ] }},
    {id:'r_rev_toxic_unmatched', outcome:'LEGAL_REVIEW', label:'법무검토(보수 기본값: 모호 시 HITL)',
      basis:'독소 패턴 미매칭(신종/문맥의존) → 룰로 위험등급 확정 불가, 사람 해석',
      when:{ intersects:['$toxicClauseHits',['패턴 미매칭(신종/문맥의존)']] }},
    {id:'r_auto', outcome:'AUTO_APPROVE', label:'자동승인(결재선 자동구성→상신)',
      basis:'전 점검 통과(누락 0·독소 0·템플릿 OK·금액 정합·제재 무) + 위험점수·신뢰도 임계 내',
      when:{ all:[
        {empty:'$missingMandatoryClauses'}, {empty:'$toxicClauseHits'},
        {'==':['$templateDigitalized',true]}, {'==':['$amountMatchesPo',true]},
        {'==':['$sanctionListHit',false]}, {'<':['$compositeRiskScore','$th_riskScore']},
        {'>=':['$pdfExtractConfidence','$th_pdfConf']} ] }},
  ], default:{ id:'r_default_hitl', outcome:'LEGAL_REVIEW', label:'법무검토(보수 기본값: 모호 시 HITL)',
      basis:'어느 규칙에도 명확히 해당하지 않는 경계 건 → 보수 기본값으로 HITL' } };

  const LOOKUPS=[
    {id:'lt_mandatory_clauses', label:'계약유형별 필수조항', icon:'list-checks',
      entries:[ ['매매','손해배상·하자담보·해지·소유권이전·대금지급·관할·준거법'],
        ['용역','손해배상·해지·비밀유지·납품/검수·지재권귀속·관할·준거법'],
        ['임대','손해배상·해지·원상복구·보증금·차임·관할·준거법'],
        ['NDA','비밀유지·정보반환/파기·계약기간·손해배상·관할·준거법'],
        ['MOU','구속력범위·비밀유지·유효기간·관할·준거법'] ]},
    {id:'lt_approval_line', label:'위임전결 결재선(금액 구간)', icon:'git-branch',
      entries:[ ['≤ 1,000만','팀장'], ['~ 1억','본부장'], ['~ 5억','CFO'], ['초과','대표'] ]},
    {id:'lt_stamp_tax', label:'인지세 과세표(증서 1통)', icon:'receipt',
      entries:[ ['≤ 1,000만','비과세'], ['~ 3,000만','20,000원'], ['~ 5,000만','40,000원'],
        ['~ 1억','70,000원'], ['~ 10억','150,000원'], ['초과','350,000원'] ]},
  ];

  /* ── 위임전결 결재선 도출(금액→구간, 결정론) — 슬롯 미주입 시 표시용 ── */
  function approverOf(amt){ amt=Number(amt)||0; return amt<=10000000?'팀장':amt<=100000000?'본부장':amt<=500000000?'CFO':'대표'; }
  function stampOf(amt){ amt=Number(amt)||0; return amt<=10000000?0:amt<=30000000?20000:amt<=50000000?40000:amt<=100000000?70000:amt<=1000000000?150000:350000; }

  /* =======================================================================
     io.editable(thresholds) — 사람이 조정 → steerHook 이 STATE.thresholdOv 갱신 → evalCase 재실행.
     도메인 무관 코어가 io.editable.recompute='evaluate(case,knowledge)' 의 백엔드로 evalCase 를 씀.
     ======================================================================= */
  const EDITABLE=[
    {key:'th_pdfConf', label:'추출 신뢰도 임계', type:'threshold', recompute:'evaluate(case,knowledge)',
      slot:'th_pdfConf', def:0.7, opts:[[0.5,'완화 0.5'],[0.7,'표준 0.7'],[0.85,'엄격 0.85']],
      note:'이 값 미만이면 문서 보완(법무검토)으로 회부'},
    {key:'th_riskScore', label:'위험점수 임계(HITL 회부)', type:'threshold', recompute:'evaluate(case,knowledge)',
      slot:'th_riskScore', def:30, opts:[[20,'보수 20'],[30,'표준 30'],[45,'완화 45']],
      note:'종합 위험점수가 이 값 이상이면 법무검토로 회부'},
  ];
  const editByKey={}; EDITABLE.forEach(e=>editByKey[e.key]=e);
  /* 케이스 임계 현재값(thresholdOv 우선, 없으면 def) */
  function thOf(C,key){ const ov=C&&C.S&&C.S.thresholdOv; const e=editByKey[key]; if(!e)return null; return (ov&&key in ov)?ov[key]:e.def; }

  /* =======================================================================
     flow — bake JSON 단계 골격 + 코어가 요구하는 role/ops 보강(우측 근거 레일·trace·8계층).
     ops = {g(그룹),comp(구성요소),feed(근거),out(산출),L(계층),kind,badge?,micro?,detail?}.
     단계는 4개 핵심(접수·점검·판정·체결)으로 압축 — 단일 케이스형 결정 콘솔에 맞게.
     ======================================================================= */
  const FLOW=[
    {id:'intake', label:'계약 건 접수·문서 추출', role:'요청', kind:'input', actor:'aap', loopPhase:'Data',
      explain:'현업/구매가 계약 건을 접수하면 계약마스터에 케이스를 생성하고, SharePoint 계약서 PDF에서 금액·기간·자동갱신·조항을 추출해 슬롯을 채웁니다.',
      ops:[
        {g:1, comp:'계약심사 오케스트레이터 Agent', feed:'접수 건·계약마스터', out:'케이스 생성·슬롯 초기화', L:'L3', kind:'llm'},
        {g:1, comp:'문서 추출 Agent', feed:'SharePoint 계약서 PDF', out:'금액·기간·조항 메타 추출', L:'L3', kind:'llm', badge:'추출',
          micro:['금액·기간·자동갱신·통지기한','준거법·관할·조항 목록'], detail:'스캔/이미지 PDF는 추출 신뢰도 저하 가능 → 신뢰도 슬롯 기록'},
        {g:1, comp:'SharePoint 파일 커넥터', feed:'문서저장소(온프레미스)', out:'PDF read', L:'L5', kind:'det'},
      ]},
    {id:'check', label:'필수조항·독소·거래처·금액 점검', role:'AAP', kind:'auto', actor:'aap', loopPhase:'Semantic', showCompose:true,
      explain:'필수조항 누락·독소조항·표준템플릿 편차·거래처 제재/신용·ERP 발주금액 정합을 결정론 규칙으로 점검하고 종합 위험점수를 산정합니다.',
      ops:[
        {g:1, comp:'필수조항 누락 점검 엔진', feed:'유형별 필수조항표 대조', out:'누락 목록 산출', L:'L4', kind:'det', badge:'결정론',
          micro:['lt_mandatory_clauses 대조'], detail:'핵심조항(손해배상·해지·준거법·관할) 누락 시 반려 사유'},
        {g:2, comp:'독소조항·위험 탐지 Agent', feed:'독소 패턴표 매칭', out:'독소 hit·위험등급', L:'L3', kind:'llm', badge:'룰 1차',
          micro:['무제한배상·일방해지·과도위약벌','신종/문맥의존 → HITL'], detail:'패턴 미매칭은 룰로 확정 불가 → 법무 해석 회부'},
        {g:2, comp:'거래처 리스크 점검 Agent', feed:'거래처마스터·SAP 대조', out:'제재·신용·중복 점검', L:'L3', kind:'llm',
          micro:['제재리스트 매칭=결정론','평판·간접=HITL']},
        {g:3, comp:'SAP API 커넥터', feed:'ERP(MM/FI) 발주금액·신용', out:'발주금액·신용등급 read', L:'L5', kind:'det'},
        {g:3, comp:'종합 분기 판정 엔진', feed:'점검결과 가중합', out:'종합 위험점수 산정', L:'L4', kind:'det', badge:'결정론'},
      ]},
    {id:'route_gate', label:'분기 판정(자동승인/법무검토/반려)', role:'결정', kind:'gate', loopPhase:'Decision',
      explain:'점검 결과를 evaluate(case,knowledge) 결정 룰로 종합해 자동승인·법무검토(HITL)·반려를 분기합니다. 보수 임계로 경계 건은 폭넓게 법무검토로 회부합니다.',
      gate:{ label:'분기 판정', decisions:[
        {key:'yes', label:'판정대로 진행', toast:'AAP 판정대로 진행합니다'},
        {key:'no', label:'법무 재검토 회부', toast:'법무 재검토로 회부합니다'} ]},
      ops:[
        {g:1, comp:'종합 분기 판정 엔진(dt_route·임계)', feed:'슬롯+임계 → evaluate', out:'verdict(자동/검토/반려)', L:'L4', kind:'det', badge:'결정론',
          micro:['위→아래 첫 매칭 룰','basis 근거 추적'], detail:'임계(추출 신뢰도·위험점수)는 io.editable 로 조정 → verdict 재계산'},
        {g:1, comp:'보수 리스크 임계 정책', feed:'riskAppetite=보수', out:'경계대역 HITL 회부', L:'L7', kind:'det', badge:'Policy'},
        {g:1, comp:'HITL 법무 심층검토 라우팅 정책', feed:'템플릿갭·신종독소·평판', out:'법무 회부 트리거', L:'L7', kind:'det', badge:'Policy'},
      ]},
    {id:'commit', label:'결재·체결·대장 등록', role:'결정', kind:'gate', loopPhase:'Decision',
      explain:'확정 위임전결 결재선으로 전자결재를 상신·승인받고 서명·체결한 뒤 계약관리대장에 등록(read-write)하고 만기·갱신 알림을 활성화합니다.',
      gate:{ label:'결재·체결', decisions:[
        {key:'yes', label:'상신·체결 진행', toast:'결재 상신·체결을 진행합니다'},
        {key:'no', label:'보류', toast:'체결을 보류합니다'} ]},
      ops:[
        {g:1, comp:'위임전결 결재선 산정 엔진', feed:'금액→위임전결표', out:'결재선 자동구성', L:'L4', kind:'det', badge:'결정론'},
        {g:1, comp:'온프레미스 전자결재 커넥터', feed:'결재 상신·회신', out:'전자결재 상신', L:'L5', kind:'det'},
        {g:2, comp:'계약관리 DB 커넥터', feed:'계약관리대장', out:'대장 등록(read-write)', L:'L5', kind:'det', badge:'Antbot 반영'},
        {g:2, comp:'만기·자동갱신 통지기한 산정 엔진', feed:'만기일·통지기한 날짜 산술', out:'알림 일정 등록', L:'L4', kind:'det'},
        {g:2, comp:'온프레미스 전용·국외이전 금지 가드레일', feed:'개인정보 국외이전 금지', out:'온프레미스 처리 보장', L:'L7', kind:'det', badge:'Policy'},
      ]},
  ];

  /* compose — 5타입 조합(자산 카탈로그·드로어 칩). bake components 에서 정리. */
  const COMPOSE=[
    {t:'Agent', sub:'전문 작업', cls:'tA', n:4, items:['계약심사 오케스트레이터 Agent','문서 추출 Agent','독소조항·위험 탐지 Agent','거래처 리스크 점검 Agent']},
    {t:'Module', sub:'재사용 기능', cls:'tM', n:5, items:['필수조항 누락 점검 엔진','위임전결 결재선 산정 엔진','만기·자동갱신 통지기한 산정 엔진','인지세 과세·세액 산정 엔진','종합 분기 판정 엔진']},
    {t:'기존 솔루션', sub:'Buy·Integrate', cls:'tS', n:3, items:['자체구축 계약관리 시스템','SAP ERP(MM/FI)','SharePoint 문서저장소']},
    {t:'Connector', sub:'시스템 연동', cls:'tC', n:4, items:['SAP API 커넥터','계약관리 DB 커넥터(read-write)','SharePoint 파일 커넥터','온프레미스 전자결재 커넥터']},
    {t:'Policy', sub:'통제·권한', cls:'tP', n:4, items:['온프레미스 전용·국외이전 금지 가드레일','보수 리스크 임계 정책','위임전결 권한 정책','HITL 법무 심층검토 라우팅 정책']},
  ];
  const COMPONENTS=[
    {type:'Agent', name:'계약심사 오케스트레이터 Agent', L:'L3'},
    {type:'Agent', name:'문서 추출 Agent', L:'L3'},
    {type:'Agent', name:'독소조항·위험 탐지 Agent', L:'L3'},
    {type:'Agent', name:'거래처 리스크 점검 Agent', L:'L3'},
    {type:'Module', name:'필수조항 누락 점검 엔진', L:'L4'},
    {type:'Module', name:'위임전결 결재선 산정 엔진', L:'L4'},
    {type:'Module', name:'만기·자동갱신 통지기한 산정 엔진', L:'L4'},
    {type:'Module', name:'인지세 과세·세액 산정 엔진', L:'L4'},
    {type:'Module', name:'종합 분기 판정 엔진', L:'L4'},
    {type:'기존 솔루션', name:'자체구축 계약관리 시스템', L:'L5'},
    {type:'기존 솔루션', name:'SAP ERP(MM/FI)', L:'L5'},
    {type:'기존 솔루션', name:'SharePoint 문서저장소', L:'L5'},
    {type:'Connector', name:'SAP API 커넥터', L:'L5'},
    {type:'Connector', name:'계약관리 DB 커넥터(read-write)', L:'L5'},
    {type:'Connector', name:'SharePoint 파일 커넥터', L:'L5'},
    {type:'Connector', name:'온프레미스 전자결재 커넥터', L:'L5'},
    {type:'Policy', name:'온프레미스 전용·국외이전 금지 가드레일', L:'L7'},
    {type:'Policy', name:'보수 리스크 임계 정책', L:'L7'},
    {type:'Policy', name:'위임전결 권한 정책', L:'L7'},
    {type:'Policy', name:'HITL 법무 심층검토 라우팅 정책', L:'L7'},
  ];

  /* =======================================================================
     seeds — bake JSON seeds 를 인박스 케이스로. input[{slot,value}] 는 코어 coerceSlots 가 타입강제.
     임계 슬롯(th_*) 기본값을 caseData 에 주입(없으면 def). atStep 으로 분기 단계에서 멈춰 HITL 노출.
     ======================================================================= */
  function mkInput(o){ return Object.keys(o).map(k=>({slot:k, value:o[k]})); }
  /* 임계 기본 주입 헬퍼 — caseData 에 th_pdfConf/th_riskScore 기본값 동봉 */
  const TH={ th_pdfConf:0.7, th_riskScore:30 };
  function seed(title, customer, atStep, vals){
    return { title, customer, icon:'🗂️', atStep, input:mkInput(Object.assign({}, TH, vals)) };
  }
  const SEEDS=[
    seed('표준 매매계약 — (주)한성정밀소재', '플랫폼개발팀 구매', 'check', {
      contractType:'매매', contractNature:'신규', counterpartyId:'CP-10231 / (주)한성정밀소재', contractAmount:'42000000',
      contractStartDate:'2026-07-01', contractEndDate:'2027-06-30',
      clausesPresent:'손해배상·하자담보·해지·소유권이전·대금지급·관할·준거법', missingMandatoryClauses:'[]', toxicClauseHits:'[]',
      templateDigitalized:'true', amountMatchesPo:'true', erpPoAmount:'42000000', sanctionListHit:'false', creditGrade:'B',
      pdfExtractConfidence:'0.93', compositeRiskScore:'0', riskGrade:'저', approverLine:'본부장', stampTaxDue:'true', stampTaxAmount:'40000' }),
    seed('스캔 품질 저하 용역계약 — 동양엔지니어링(주)', '플랫폼개발팀 구매', 'intake', {
      contractType:'용역', contractNature:'신규', counterpartyId:'CP-15670 / 동양엔지니어링(주)', contractAmount:'55000000',
      clausesPresent:'손해배상·해지·비밀유지·납품/검수·관할·준거법', missingMandatoryClauses:'[]', toxicClauseHits:'[]',
      templateDigitalized:'true', amountMatchesPo:'true', erpPoAmount:'55000000', sanctionListHit:'false', creditGrade:'C',
      pdfExtractConfidence:'0.58', compositeRiskScore:'10' }),
    seed('무제한 배상 독소조항 — 글로벌오토파츠코리아(주)', '구매본부', 'route_gate', {
      contractType:'용역', contractNature:'신규', counterpartyId:'CP-12290 / 글로벌오토파츠코리아(주)', contractAmount:'210000000',
      clausesPresent:'손해배상·해지·비밀유지·납품/검수·지재권귀속·관할·준거법', missingMandatoryClauses:'[]',
      toxicClauseHits:'무제한 손해배상 / 배상한도 미설정', templateDigitalized:'true', templateDeviation:'배상한도 조항 삭제',
      amountMatchesPo:'true', erpPoAmount:'210000000', sanctionListHit:'false', creditGrade:'B',
      pdfExtractConfidence:'0.92', riskGrade:'고', compositeRiskScore:'40', approverLine:'CFO' }),
    seed('제재리스트 거래처 — 대성기공테크(주)', '구매본부', 'route_gate', {
      contractType:'용역', contractNature:'신규', counterpartyId:'CP-20887 / 대성기공테크(주)', contractAmount:'88000000',
      clausesPresent:'손해배상·해지·비밀유지·납품/검수·지재권귀속·관할·준거법', missingMandatoryClauses:'[]', toxicClauseHits:'[]',
      templateDigitalized:'true', amountMatchesPo:'true', erpPoAmount:'88000000', sanctionListHit:'true', creditGrade:'E',
      pdfExtractConfidence:'0.9', riskGrade:'고' }),
  ];

  /* govern · gates · stepLoop */
  const GOVERN=[
    {k:'Policy', v:'책임 지점 자동 차단 후 승인(HITL 게이트).'},
    {k:'Run Trace', v:'요청→판정→분기→반영 전 구간 기록.'},
    {k:'Evaluation', v:'evaluate(case,knowledge) 결정론 판정·근거(basis) 추적.'},
    {k:'Skill Library', v:'유형·룰·패턴 재사용 자산화.'},
  ];
  const GATES=[
    '독소 패턴 미매칭(신종/문맥의존) 조항은 룰로 위험등급 확정 불가 → 법무 해석 회부.',
    '표준템플릿 미디지털화(data gap)로 편차 자동대조 불가 → 신규·변경 건은 사람 수기 점검.',
    'reputationRisk(평판·간접 리스크)는 신용등급만으로 산출 불가 → 사람 판단 필요.',
    'PDF 추출 신뢰도 임계 미만이면 핵심필드 정확성 미보장 → 자동 판정 정지·문서 보완.',
    '고위험 독소조항은 협상·수정 권한이 걸린 결정 → 자동승인 불가, 법무 판단.',
  ];

  /* =======================================================================
     surface.opstage — 조작형 결정 콘솔(단일 케이스형). 채용 리스트형과 같은 척추:
       steering(io.editable 임계) → evalCase 재계산 → verdict·basis·라우팅 변화 → HITL.
       op-* 클래스 재사용(코어 일반 프레임워크) + 계약 전용 슬롯/판정 카드.
     ======================================================================= */
  /* 슬롯 값 표시(타입·money·array) */
  function slotVal(C,key){
    const cd=(C&&C.S&&C.S.caseData)||{}; let v=cd[key]; const s=slotByKey[key];
    if(v==null||v===''||(Array.isArray(v)&&!v.length))return null;
    if(s&&s.money)return manwon(v);
    if(s&&s.type==='boolean')return v?'예':'아니오';
    if(Array.isArray(v))return v.join('·');
    if(s&&s.unit)return v+s.unit;
    return String(v);
  }
  const EXKO={rule:'규칙', doc:'문서추출', connector:'커넥터', manual:'사람 보완'};
  /* 핵심 슬롯(요약 그리드) — 기본·점검 핵심 */
  const PRIMARY=['contractType','contractAmount','counterpartyId','creditGrade','compositeRiskScore','pdfExtractConfidence','templateDigitalized','amountMatchesPo'];

  function verdictCard(C){
    const v=C&&C.S&&C.S.verdict;
    if(!v){ return `<div class="ct-vd info"><div class="ct-vd-h">판정 준비 중</div><div class="ct-vd-b">접수·점검이 끝나면 결정 룰이 판정합니다.</div></div>`; }
    const m=OUTCOME[v.outcome]||{ko:v.outcome,cls:'info',ic:'info',sub:''};
    const reflow=!!(C&&C.S&&C.S.ctReflow);   /* 재판정 직후 1회 pulse (클리어는 코어가 애니 후) */
    const inputs=v.inputs?Object.keys(v.inputs):[];
    const chips=inputs.slice(0,6).map(k=>{ const s=slotByKey[k]; const lab=s?s.label:k; let val=v.inputs[k];
      if(Array.isArray(val))val=val.length?val.join('·'):'없음'; if(typeof val==='boolean')val=val?'예':'아니오';
      return `<span class="ct-vchip">${lab} <b>${val}</b></span>`; }).join('');
    return `<div class="ct-vd ${m.cls}${reflow?' reflow':''}">
      <div class="ct-vd-top"><span class="ct-vd-ic">${I(m.ic)}</span>
        <div><div class="ct-vd-h">${m.ko}<span class="ct-vd-tag">verdict</span></div><div class="ct-vd-sub">${m.sub}</div></div></div>
      <div class="ct-vd-basis"><span class="ct-vd-bk">근거(basis)</span>${v.basis||v.label}</div>
      <div class="ct-vd-rule">룰 <b>${v.ruleId}</b> · 결정론 재현 ${v.reproducible?'✓':''}</div>
      ${chips?`<div class="ct-vchips"><span class="ct-vchips-k">판정에 쓰인 슬롯</span>${chips}</div>`:''}</div>`;
  }

  /* 슬롯 패널(요약 + 펼침 전체) */
  function slotPanel(C){
    const open=!!(C&&C.S&&C.S.ctSlotsOpen);
    const cell=(key)=>{ const s=slotByKey[key]; if(!s)return ''; const val=slotVal(C,key);
      const cls=(s.risk&&val&&val!=='없음'&&val!=='아니오')?' risk':(s.gap?' gap':'');
      return `<div class="ct-slot${cls}"><div class="ct-slot-k">${s.label}<span class="ct-slot-src">${EXKO[s.extract]||s.extract}</span></div>
        <div class="ct-slot-v">${val==null?'<span class="ct-slot-na">미추출</span>':val}</div></div>`; };
    const prim=PRIMARY.map(cell).join('');
    const rest=SLOTS.filter(s=>!PRIMARY.includes(s.key)).map(s=>cell(s.key)).join('');
    return `<div class="ct-wh"><span class="op-t">계약 케이스 슬롯</span><span class="op-c">caseModel · 값·출처·추출방식</span>
        <button class="ct-slot-more" data-ctslots>${open?'접기':'전체 슬롯'}</button></div>
      <div class="ct-slots">${prim}</div>
      ${open?`<div class="ct-slots rest">${rest}</div>`:''}`;
  }

  /* 메인(왼쪽) = 슬롯 패널 + 판정 카드 + HITL 바 */
  function opMain(C){
    const v=C&&C.S&&C.S.verdict; const m=v?OUTCOME[v.outcome]:null;
    const atGate=C.W(C.S.sel).id==='route_gate';
    const hitl=v&&v.outcome!=='AUTO_APPROVE';
    return `${slotPanel(C)}
      <div class="ct-vd-wrap">${verdictCard(C)}</div>
      ${atGate?`<div class="op-hitlbar ${hitl?'':'auto'}">
        <div><div class="op-hi">${I(hitl?'user-check':'check-circle')}${hitl?'사람이 확정해야 하는 지점 (HITL)':'자동승인 가능 — 그래도 마지막 확인'}</div>
          <div class="op-hs">${hitl?'AAP가 결정·반려가 아니라, 책임 걸린 분기를 사람에게 넘겼습니다. 임계를 조정하면 판정이 다시 갈립니다.':'전 점검 통과·임계 내 — 결재선 자동구성 후 상신 준비.'}</div></div>
        <button class="op-hbtn" data-gate="route_gate">${hitl?'법무검토 큐로 확정':'판정 확인'}</button></div>`:''}`;
  }

  /* steering 바 = io.editable 임계(2종) */
  function opSteer(C){
    const grp=(e)=>{ const cur=thOf(C,e.key);
      const btns=e.opts.map(([val,lab])=>`<button class="op-opt ${cur===val?'on':''}" data-steer="${e.key}" data-steerval="${val}">${lab}</button>`).join('');
      return `<div class="op-sg"><span class="op-lab">${e.label}</span>${btns}</div>`; };
    return `<div class="op-steer">${EDITABLE.map(grp).join('')}
      <span class="op-snote">${I('info')}임계를 바꾸면 AAP가 다시 판정합니다 (chat 아님 · 직접 조종)</span></div>`;
  }

  /* aside(오른쪽) = 참조 룩업 + AAP가 한 일 흐름 */
  function lookupBlock(C){
    const cd=(C&&C.S&&C.S.caseData)||{}; const ctype=cd.contractType; const amt=cd.contractAmount;
    return LOOKUPS.map(lt=>{
      const rows=lt.entries.map(([k,vv])=>{ const hit=(lt.id==='lt_mandatory_clauses'&&k===ctype);
        return `<div class="ct-lk-r${hit?' hit':''}"><span class="ct-lk-k">${k}</span><span class="ct-lk-v">${vv}</span></div>`; }).join('');
      let foot='';
      if(lt.id==='lt_approval_line'&&amt)foot=`<div class="ct-lk-foot">이 케이스 ${manwon(amt)} → <b>${approverOf(amt)}</b> 전결</div>`;
      if(lt.id==='lt_stamp_tax'&&amt)foot=`<div class="ct-lk-foot">이 케이스 ${manwon(amt)} → 인지세 <b>${won(stampOf(amt))}</b></div>`;
      return `<div class="ct-lk"><div class="ct-lk-h">${I(lt.icon)}${lt.label}</div>${rows}${foot}</div>`;
    }).join('');
  }
  function fstep(ic,t,d,cls){ return `<div class="op-fstep ${cls||''}"><span class="op-fd">${I(ic)}</span><div class="op-ftx"><b>${t}</b><div class="op-fmono">${d}</div></div></div>`; }
  function opAside(C){
    const v=C&&C.S&&C.S.verdict; const cd=(C&&C.S&&C.S.caseData)||{};
    const miss=Array.isArray(cd.missingMandatoryClauses)?cd.missingMandatoryClauses.length:0;
    const toxic=Array.isArray(cd.toxicClauseHits)?cd.toxicClauseHits.length:0;
    return `<div class="op-sh">참조 룩업 <span>지식·시맨틱 L4</span></div>
      <div class="ct-lks">${lookupBlock(C)}</div>
      <div class="op-sh">AAP가 한 일 · 근거 <span>보조</span></div>
      <div class="op-flow">
        ${fstep('check','문서 추출·슬롯 채움', '추출 신뢰도 '+(cd.pdfExtractConfidence!=null?cd.pdfExtractConfidence:'—'))}
        ${fstep('check','필수조항·독소 점검', '누락 '+miss+'건 · 독소 '+toxic+'건')}
        ${fstep('check','거래처·금액 점검', '제재 '+(cd.sanctionListHit?'해당':'무')+' · 신용 '+(cd.creditGrade||'—')+' · 금액 '+(cd.amountMatchesPo?'정합':'불일치'))}
        ${fstep('arrow-right','결정 룰 판정', v?(OUTCOME[v.outcome].ko+' · '+v.ruleId):'대기','v')}
      </div>`;
  }

  /* opstage = 코어 조작형 콘솔이 호출. {steer,main,aside}. route_gate/check/intake/commit 모두 동형 콘솔. */
  function opstage(C){
    return { steer:opSteer(C), main:opMain(C), aside:opAside(C) };
  }
  function opStages(){ return ['intake','check','route_gate','commit']; }

  /* HITL/완료 모달(코어 currentCM 이 surfCmodal 으로 호출) — 단일 케이스형 결정 게이트.
     kind: hitl(분기·체결 게이트) / done(완료). 채용과 같은 코어 yes/no 디스패처(data-yes/data-no). */
  function cmodal(kind,C){
    const sel=C.S.sel, v=C.S.verdict, cd=(C.S.caseData)||{};
    if(kind==='hitl'){
      if(sel==='route_gate'){
        const m=v?OUTCOME[v.outcome]:null;
        const inputs=v&&v.inputs?Object.keys(v.inputs):[];
        const ev=inputs.slice(0,6).map(k=>{ const s=slotByKey[k]; let val=v.inputs[k];
          if(Array.isArray(val))val=val.length?val.join('·'):'없음'; if(typeof val==='boolean')val=val?'예':'아니오';
          return `<div class="ed-prev-r"><span class="ed-prev-nm">${s?s.label:k}</span><span class="ed-prev-mt">${val}</span></div>`; }).join('');
        return `<div class="cmodal-h">분기 판정을 확인해 주세요</div>
          <div class="cmodal-sub">AAP가 슬롯·임계로 결정 룰을 돌려 판정했습니다. 임계를 조정하면 판정이 다시 갈립니다(자동승인↔법무검토).</div>
          <div class="rv">
            <div class="rv-sec"><div class="rv-k">판정(verdict)</div><div class="rv-sum"><b class="ct-vd-inline ${m?m.cls:''}">${m?m.ko:'—'}</b> · ${v?v.basis:''}</div></div>
            <div class="rv-sec"><div class="rv-k">룰</div><div class="rv-sum">${v?v.ruleId:'—'} · 결정론 재현 ${v&&v.reproducible?'✓':''}</div></div>
          </div>
          <div class="ed-prev"><div class="ed-prev-h">판정에 쓰인 슬롯</div>${ev}</div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-yes>판정대로 진행</button><button class="cp-btn ghost" data-no>법무 재검토 회부</button></div>`;
      }
      if(sel==='commit'){
        const amt=cd.contractAmount;
        return `<div class="cmodal-h">결재·체결을 진행할까요?</div>
          <div class="cmodal-sub">확정 위임전결 결재선으로 전자결재를 상신·체결한 뒤 계약관리대장에 등록합니다(온프레미스·국외이전 금지).</div>
          <div class="rv">
            <div class="rv-sec"><div class="rv-k">결재선</div><div class="rv-sum">${amt?(manwon(amt)+' → '+approverOf(amt)+' 전결'):'금액 미정'}</div></div>
            <div class="rv-sec"><div class="rv-k">인지세</div><div class="rv-sum">${amt?won(stampOf(amt)):'—'}</div></div>
            <div class="rv-sec"><div class="rv-k">점검</div><div class="rv-sum">제재 ${cd.sanctionListHit?'해당':'무'} · 국외이전 금지 가드레일 통과</div></div>
          </div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-yes>상신·체결 진행</button><button class="cp-btn ghost" data-no>보류</button></div>`;
      }
    }
    return '';
  }

  /* surfaceHooks — steering(임계 조정)·HITL 결정 번역 */
  const SURF_HOOKS={
    steerHook:(S,key,val)=>{
      const e=editByKey[key]; if(!e)return {};
      const num=Number(val); S.thresholdOv=S.thresholdOv||{}; S.thresholdOv[key]=num;
      if(window.AAP_evalCase)window.AAP_evalCase();   /* io.editable.recompute = evaluate(case,knowledge) */
      const v=S.verdict, ko=v?(OUTCOME[v.outcome]?OUTCOME[v.outcome].ko:v.outcome):'—';
      const cd=(S.caseData)||{};
      const conf=cd.pdfExtractConfidence!=null?cd.pdfExtractConfidence:'—';
      const risk=cd.compositeRiskScore!=null?cd.compositeRiskScore:'—';
      const pdfTh=key==='th_pdfConf'?num:thOf({S},'th_pdfConf');
      const rkTh=key==='th_riskScore'?num:thOf({S},'th_riskScore');
      S.ctReflow=true;   /* 재렌더 후 verdict pulse 트리거(코어 FLIP 직후 1회) */
      /* evaluate 를 '슬롯 읽기 → 룩업 대조 → 임계 평가 → route 판정' 4단계로 펼침(지적 1·2) */
      const thStep = key==='th_pdfConf'
        ? {t:'임계 평가',tag:'평가',d:'추출 신뢰도 '+conf+' vs 임계 '+pdfTh,basis:'rule r_rev_pdf · $pdfExtractConfidence < $th_pdfConf ('+conf+(conf!=='—'&&conf<pdfTh?' < ':' ≥ ')+pdfTh+')'+(conf!=='—'&&conf<pdfTh?' → 법무검토':' → 통과')}
        : {t:'임계 평가',tag:'평가',d:'위험점수 '+risk+' vs 임계 '+rkTh,basis:'rule r_rev_risk / r_auto · $compositeRiskScore ≥ $th_riskScore ('+risk+(risk!=='—'&&risk>=rkTh?' ≥ ':' < ')+rkTh+')'+(risk!=='—'&&risk>=rkTh?' → 법무검토':' → 임계 내')};
      return { intent:e.label+' → '+val, mono:'evaluate 재실행 · '+ (e.key==='th_pdfConf'?'추출 신뢰도 임계':'위험점수 임계')+' '+val,
        steps:[
          {t:'슬롯 읽기',tag:'읽기',d:'caseData 슬롯 로드',basis:'$pdfExtractConfidence='+conf+' · $compositeRiskScore='+risk+' · 필수조항·독소·제재·금액정합'},
          {t:'룩업 대조',tag:'대조',d:'필수조항·결재선·인지세 참조표',basis:'lt_mandatory_clauses · lt_approval_line · lt_stamp_tax 대조'},
          thStep,
          {t:'route 판정',tag:'판정',d:'위→아래 첫 매칭 룰 → '+ko,basis:'evaluate(case,knowledge) · '+(v?v.ruleId:'—')+' · basis 추적 · 결정론 재현'+(v&&v.reproducible?' ✓':'')}
        ],
        trace:{st:'분기 판정', t:e.label+' 조정 → '+val+' · 판정 '+ko, L:'L7', k:'HITL'} };
    },
    decideHook:(S,v,sel)=>{
      if(sel==='route_gate' && v==='no'){ /* 법무 재검토 회부 = 임계 보수화(위험점수 20) */ S.thresholdOv=S.thresholdOv||{}; S.thresholdOv.th_riskScore=20; if(window.AAP_evalCase)window.AAP_evalCase(); }
    },
    persistKeys:[],   /* caseData·thresholdOv 는 코어가 직접 영속(전용 키 불필요) */
    transientKeys:['ctSlotsOpen','ctReflow'],
    reflowKeys:['ctReflow'],   /* 재분석 1회 pulse 플래그 — 코어가 애니 후 클리어 */
    wire:(root,S,rerender)=>{
      root.querySelectorAll('[data-ctslots]').forEach(e=>e.onclick=()=>{ S.ctSlotsOpen=!S.ctSlotsOpen; rerender(); });
      root.querySelectorAll('[data-gate]').forEach(e=>e.onclick=()=>{ if(window.AAP_CORE)window.AAP_CORE.go(e.dataset.gate); });
    },
  };

  const surfaceSpec={ icon:'🗂️', title:'계약 관리', customer:'현업/구매', owner:'법무·계약 담당',
    tabs:['개요','판정','처리','기록'], status:{}, perStep:{}, ws:[], hitl:{}, done:{} };

  /* workload — 워크로드 스튜디오 카탈로그 미리보기·운영 라벨(다른 팩과 동일 계약). */
  const WORKLOAD={
    request:'"이번 매매계약 건 리스크 검토하고 결재 올려줘"',
    type:'계약 심사·체결', purpose:'필수조항·독소조항·거래처·금액 리스크를 점검해 자동승인·법무검토·반려를 판정하고 결재·체결',
    outputs:['계약 추출 슬롯','리스크 판정','법무검토 회부','위임전결 결재선','계약관리대장 등록'],
    gates:'분기 판정·법무 회부 · 결재·체결 (책임이 걸린 곳만 담당자 확인 · HITL)',
  };
  /* planProduces — 단계별 산출물(워크로드 스튜디오 Execution Plan). stepId=work[].id. */
  const PLAN_PRODUCES={ intake:['계약 추출 슬롯'], check:['리스크 판정·위험점수'],
    route_gate:['분기 verdict(자동/검토/반려)'], commit:['결재·체결·대장 등록'] };

  /* 온톨로지(L4) — AAP가 계약 심사 업무를 어떻게 이해하는지(객체·관계·단계별 사용). 도메인 고유 객체. */
  const ONTOLOGY={
    objects:[
      {k:'Contract', n:'Contract(계약)', kind:'entity', a:['유형','금액','기간','자동갱신','상태'], on:['extract','register']},
      {k:'Counterparty', n:'Counterparty(거래처)', kind:'master', a:['거래처명','사업자번호','제재 여부','신용등급'], on:['screen_party']},
      {k:'Clause', n:'Clause(조항)', kind:'document', a:['필수조항','독소조항','준거법·관할'], on:['check_clause']},
      {k:'RiskFinding', n:'RiskFinding(위험판정)', kind:'event', a:['위험유형','위험점수','등급','verdict'], on:['score_risk','route']},
      {k:'LegalReview', n:'LegalReview(법무검토의견)', kind:'document', a:['회부 사유','검토의견','결론'], on:['legal_review']},
      {k:'Approval', n:'Approval(결재·체결)', kind:'event', a:['위임전결 결재선','전자결재 상신','체결·대장 등록'], on:['approve_line']},
    ],
    touch:{ intake:['Contract','Clause'], check:['Clause','Counterparty','RiskFinding'] },
    relations:[
      {from:'Contract', label:'between', to:'Counterparty', t:'Contract —<em>between</em>→ Counterparty'},
      {from:'Contract', label:'contains', to:'Clause', t:'Contract —<em>contains</em>→ Clause'},
      {from:'RiskFinding', label:'found-in', to:'Clause', t:'RiskFinding —<em>found-in</em>→ Clause'},
      {from:'RiskFinding', label:'triggers', to:'LegalReview', t:'RiskFinding —<em>triggers</em>→ LegalReview'},
      {from:'Approval', label:'authorizes', to:'Contract', t:'Approval —<em>authorizes</em>→ Contract'},
    ],
    actions:[
      {key:'extract', n:'계약서 추출·정규화', mode:'auto'},
      {key:'check_clause', n:'필수조항·독소조항 점검', mode:'auto'},
      {key:'screen_party', n:'거래처 제재·신용 점검', mode:'auto'},
      {key:'score_risk', n:'종합 위험점수 산정', mode:'auto'},
      {key:'route', n:'분기 판정(자동/검토/반려)', mode:'auto'},
      {key:'legal_review', n:'법무 심층검토', mode:'confirm'},
      {key:'approve_line', n:'위임전결 결재·체결·대장 등록', mode:'confirm'},
      {key:'register', n:'계약관리대장 등록', mode:'auto'},
    ],
  };

  (window.AAP_PACKS=window.AAP_PACKS||{}).contract_a={
    id:'contract_a', label:'계약 관리', ontology:ONTOLOGY, workload:WORKLOAD, planProduces:PLAN_PRODUCES,
    flow:FLOW, work:FLOW, components:COMPONENTS, compose:COMPOSE, gates:GATES, govern:GOVERN, seeds:SEEDS,
    /* ── 결정층(N3 §D) — 코어 evalCase 가 caseModel+knowledge 로 evaluate 실행 ── */
    caseModel:{ slots:SLOTS },
    knowledge:{ route:ROUTE, lookupTables:LOOKUPS, thresholds:EDITABLE },
    /* io.editable = 전체 임계 메타(slot·def·opts) → 코어 일반 steering 바가 직접 렌더(dcSteer) */
    io:{ editable:EDITABLE },
    stepLoop:{ intake:'Data', check:'Semantic', route_gate:'Decision', commit:'Decision' },
    /* ── 수렴 §4-1a: surface/surfaceHooks 제거 → 코어 일반 renderDataConsole 이 동일 콘솔을 그림.
       (이 파일의 opstage/cmodal/SURF_HOOKS 는 코어 추출 후 미사용 — 데이터만 남김) ── */
    surfaceSpec,
    provenance:{ generatedBy:'harness', adapter:'harness_to_pack_v0.1', domain:'contract' },
  };
})();
