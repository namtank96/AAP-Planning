/* =========================================================================
   AAP Domain Pack — 구매·조달 (procurement) · bake된 팩(N3 §E 오프라인 bake)
   ─────────────────────────────────────────────────────────────────────────
   출처: _harness_out/packs_baked/pack_procurement.json (하니스 → adapter).
   ★ 수렴 §4-1a 증명: surface(HTML 생성) 함수 0줄. 코어 일반 renderDataConsole 이
     caseModel.slots + STATE.verdict(evaluate) + knowledge.lookupTables + io.editable 만으로
     계약(contract_a)과 동형(single-case)의 조작형 결정 콘솔을 자동 표출한다.

   이 파일이 코어에 더하는 것 = "데이터" 뿐:
     · caseModel.slots            — 케이스 슬롯(값·출처·추출방식 · money/risk 메타 힌트)
     · knowledge.route            — 실행 가능 결정 DSL(evaluate 가 소비). bake JSON 의
                                    decisionTables(prose)를 같은 로직의 안전 DSL 로 인코딩.
     · knowledge.lookupTables     — 참조 룩업(결재선·3견적·증빙·벤더상태)
     · knowledge.thresholds       — 임계(참조)
     · io.editable                — 사람이 조정하는 임계(steering) → evalCase 재실행
     · seeds                      — 골든 11건(expectedRoute 검증 통과)
   surface / surfaceHooks 없음 → 코어 일반 콘솔·steerHook·cmodal·wire 가 대신 동작.
   ========================================================================= */
(function(){

  /* ── caseModel.slots — bake JSON 슬롯 + money/risk 표시 메타 힌트(함수 ✕) ──
     quote_expired = 견적 유효기간 도과 여부(결정론 사전계산 슬롯) — evaluate 가 날짜산술 없이 소비. */
  const SLOTS=[
    {key:'case_id', label:'케이스 ID', type:'string', source:'전자조달', extract:'connector', group:'기본'},
    {key:'requester', label:'구매 요청자', type:'string', source:'전자조달', extract:'connector', group:'기본'},
    {key:'department', label:'요청 부서', type:'string', source:'전자조달', extract:'connector', group:'기본'},
    {key:'purchase_type', label:'구매유형', type:'enum', source:'전자조달', extract:'rule', group:'기본'},
    {key:'budget_code', label:'예산코드', type:'string', source:'전자조달', extract:'connector', group:'기본'},
    {key:'delivery_due', label:'납기일', type:'date', source:'전자조달', extract:'connector', group:'기본'},
    {key:'order_amount', label:'발주 예정 총액', type:'number', source:'전자조달', extract:'rule', group:'금액', money:true},
    {key:'vendor_id', label:'벤더 사업자번호', type:'string', source:'벤더마스터', extract:'connector', group:'벤더'},
    {key:'is_new_vendor', label:'신규 벤더', type:'boolean', source:'벤더마스터', extract:'rule', group:'벤더', risk:true},
    {key:'vendor_status', label:'벤더 상태', type:'enum', source:'벤더마스터', extract:'connector', group:'벤더', risk:true},
    {key:'vendor_credit_grade', label:'벤더 신용등급', type:'string', source:'벤더마스터', extract:'connector', group:'벤더'},
    {key:'vendor_biz_no_valid', label:'사업자번호 유효', type:'boolean', source:'국세청 대조', extract:'rule', group:'벤더', risk:true},
    {key:'quote_count', label:'첨부 견적 수', type:'number', source:'견적 첨부', extract:'doc', group:'증빙'},
    {key:'quote_amount', label:'견적 금액', type:'number', source:'견적 PDF', extract:'doc', group:'증빙', money:true},
    {key:'quote_valid_until', label:'견적 유효기간', type:'date', source:'견적 PDF', extract:'doc', group:'증빙'},
    {key:'quote_expired', label:'견적 만료', type:'boolean', source:'유효기간 대조', extract:'rule', group:'증빙', risk:true},
    {key:'quote_extract_confidence', label:'견적 추출 신뢰도', type:'number', source:'견적 OCR', extract:'doc', group:'증빙'},
    {key:'spec_attached', label:'사양서 첨부', type:'boolean', source:'전자조달', extract:'rule', group:'증빙', risk:true},
    {key:'spec_match', label:'사양 일치 적정성', type:'enum', source:'사양 대조', extract:'rule', group:'증빙'},
    {key:'unit_price_deviation_pct', label:'단가 편차율(%)', type:'number', source:'단가계약 대조', extract:'rule', group:'점검', unit:'%'},
    {key:'budget_remaining', label:'예산 잔액', type:'number', source:'SAP(FI)', extract:'connector', group:'예산', money:true},
    {key:'budget_after_order', label:'발주 후 예상 잔액', type:'number', source:'SAP(FI)', extract:'rule', group:'예산', money:true, risk:true},
    {key:'budget_usage_pct', label:'예산 소진율(%)', type:'number', source:'SAP(FI)', extract:'rule', group:'예산', unit:'%'},
    {key:'split_score', label:'쪼개기 의심 점수', type:'number', source:'발주이력 패턴', extract:'rule', group:'점검', risk:true},
    {key:'approval_line', label:'산정 결재선', type:'enum', source:'금액→위임전결표', extract:'rule', group:'결재'},
    {key:'route', label:'분기 판정', type:'enum', source:'evaluate', extract:'rule', group:'결재'},
    {key:'po_number', label:'생성 PO 번호', type:'string', source:'SAP(MM)', extract:'connector', group:'반영'},
    {key:'commitment_status', label:'FI 예산 약정 상태', type:'enum', source:'SAP(FI)', extract:'connector', group:'반영'},
  ];

  /* ── knowledge.route — 실행 DSL. decisionTables(prose) 와 동일 우선순위·로직.
     임계는 $th_* 슬롯 참조 → io.editable 조정이 verdict 를 가른다(보수 risk appetite). ── */
  const ROUTE={ rules:[
    {id:'r_reject_budget', outcome:'REJECT', label:'반려(예산 초과 발주)',
      basis:'발주 후 예산 잔액 음수 — 예산 초과 발주 금지(하드 가드레일)',
      when:{ '<':['$budget_after_order',0] }},
    {id:'r_reject_vendor', outcome:'REJECT', label:'반려(벤더 컴플라이언스 하드 차단)',
      basis:'벤더 제재/거래정지 또는 사업자번호 무효 → 자동 진행 불가',
      when:{ any:[ {in:['$vendor_status',['제재','거래정지']]}, {'==':['$vendor_biz_no_valid',false]} ] }},
    {id:'r_reject_3quote', outcome:'REJECT', label:'반려(3견적 의무 미충족)',
      basis:'발주액 ≥ $th_three_quote_amount · 단가계약 아님 · 견적 < $th_three_quote_count → 보완요청',
      when:{ all:[ {'>=':['$order_amount','$th_three_quote_amount']}, {'!=':['$purchase_type','단가계약']}, {'<':['$quote_count','$th_three_quote_count']} ] }},
    {id:'r_reject_evidence', outcome:'REJECT', label:'반려(증빙 미충족)',
      basis:'사양서 미첨부 또는 견적 유효기간 도과 → 보완요청',
      when:{ any:[ {'==':['$spec_attached',false]}, {'==':['$quote_expired',true]} ] }},
    {id:'r_rev_split', outcome:'LEGAL_REVIEW', label:'구매검토(쪼개기 의심)',
      basis:'쪼개기 의심 점수 ≥ $th_split_score → 자동승인 차단(구매팀장 의도 판정)',
      when:{ '>=':['$split_score','$th_split_score'] }},
    {id:'r_rev_newvendor', outcome:'LEGAL_REVIEW', label:'구매검토(신규 벤더 실사)',
      basis:'신규 벤더 → 실사 수기 확인(구매 담당자)',
      when:{ '==':['$is_new_vendor',true] }},
    {id:'r_rev_deviation', outcome:'LEGAL_REVIEW', label:'구매검토(단가 편차 초과)',
      basis:'단가계약 대비 편차율 > $th_unit_price_deviation → 편차 사유 정당성 판단',
      when:{ '>':['$unit_price_deviation_pct','$th_unit_price_deviation'] }},
    {id:'r_rev_budget', outcome:'LEGAL_REVIEW', label:'구매검토(예산 임박 승급)',
      basis:'예산 소진율 ≥ $th_budget_usage → 보수 risk appetite 로 검토 승급',
      when:{ '>=':['$budget_usage_pct','$th_budget_usage'] }},
    {id:'r_rev_quote', outcome:'LEGAL_REVIEW', label:'구매검토(견적 추출·사양 확인)',
      basis:'견적 추출 신뢰도 < $th_quote_confidence 또는 사양 일치 모호 → 사람 확인',
      when:{ any:[ {'<':['$quote_extract_confidence','$th_quote_confidence']}, {'==':['$spec_match','모호']} ] }},
    {id:'r_auto', outcome:'AUTO_APPROVE', label:'자동승인(저위험·소액·규정 충족)',
      basis:'전 점검 PASS · 발주액 ≤ $th_auto_approve_cap → 자동 진행',
      when:{ '<=':['$order_amount','$th_auto_approve_cap'] }},
  ], default:{ id:'r_rev_highamount', outcome:'LEGAL_REVIEW', label:'구매검토(고액·결재선 승인)',
      basis:'점검은 전부 PASS이나 발주액이 자동승인 상한 초과 → 결재선 승인 필요' } };

  /* ── lookupTables — bake JSON entries({match,result}) 를 코어 일반 룩업이 그대로 렌더 ── */
  const LOOKUPS=[
    {id:'lut_approval_line', label:'위임전결 결재선(발주액)', icon:'git-branch',
      entries:[ ['≤ 500만','팀장'], ['~ 5,000만','구매팀장'], ['~ 3억','본부장'], ['초과','CPO'] ]},
    {id:'lut_three_quote', label:'3견적 의무', icon:'list-checks',
      entries:[ ['일반구매 ≥ 500만','견적 3건 이상'], ['단가계약','면제'], ['MRO·소액','간소화'] ]},
    {id:'lut_evidence_set', label:'필수 증빙', icon:'receipt',
      entries:[ ['공통','사양서·견적서'], ['≥ 500만','견적 3건·비교표'], ['단가계약','단가표·편차 사유'] ]},
    {id:'lut_vendor_status', label:'벤더 상태 → 처리', icon:'shield',
      entries:[ ['정상','진행'], ['제재·거래정지','하드 반려'], ['신규','실사 HITL'] ]},
  ];

  /* ── io.editable — thresholds 중 사람이 조정하는 임계(steering). slot = route 가 참조하는 $th_* 키.
     코어 dcSteerHook 이 thresholdOv[slot] 갱신 → evalCase 재실행 → verdict 갱신. ── */
  const EDITABLE=[
    {key:'th_split_score', slot:'th_split_score', label:'쪼개기 의심 임계', type:'threshold', def:70,
      opts:[[60,'보수 60'],[70,'표준 70'],[85,'완화 85']], recompute:'evaluate(case,knowledge)',
      note:'쪼개기 점수가 이 값 이상이면 구매검토(HITL)로 승급'},
    {key:'th_budget_usage', slot:'th_budget_usage', label:'예산 임박 임계(%)', type:'threshold', def:90,
      opts:[[80,'보수 80'],[90,'표준 90'],[95,'완화 95']], recompute:'evaluate(case,knowledge)',
      note:'예산 소진율이 이 값 이상이면 검토 승급'},
    {key:'th_quote_confidence', slot:'th_quote_confidence', label:'견적 추출 신뢰도 임계', type:'threshold', def:0.8,
      opts:[[0.7,'완화 0.7'],[0.8,'표준 0.8'],[0.9,'엄격 0.9']], recompute:'evaluate(case,knowledge)',
      note:'이 값 미만이면 사람 수기 확인(검토)'},
    {key:'th_auto_approve_cap', slot:'th_auto_approve_cap', label:'자동승인 금액 상한', type:'threshold', def:5000000,
      opts:[[3000000,'보수 300만'],[5000000,'표준 500만'],[10000000,'완화 1,000만']], recompute:'evaluate(case,knowledge)',
      note:'전 점검 PASS여도 이 금액 초과는 결재선 승인(검토)'},
  ];

  /* 비편집 임계(route 가 참조 · seeds 에 기본 동봉) */
  const TH_FIXED={ th_three_quote_amount:5000000, th_three_quote_count:3, th_unit_price_deviation:10 };
  const TH_EDIT_DEF={}; EDITABLE.forEach(e=>TH_EDIT_DEF[e.slot]=e.def);
  const TH=Object.assign({}, TH_FIXED, TH_EDIT_DEF);

  /* ── flow — 단일 케이스형 결정 콘솔 4단계(접수·점검·판정·반영). 코어 strip/우측 레일이 ops 소비 ── */
  const FLOW=[
    {id:'intake', label:'구매 건 접수·증빙 추출', role:'요청', kind:'input', loopPhase:'Data',
      explain:'현업이 구매품의를 접수하면 전자조달에서 케이스를 채번하고, 견적 PDF·사양서에서 금액·견적·유효기간을 추출해 슬롯을 채웁니다.',
      ops:[
        {g:1, comp:'구매심사 오케스트레이터 Agent', feed:'접수 건·전자조달', out:'케이스 생성·슬롯 초기화', L:'L3', kind:'llm'},
        {g:1, comp:'견적 추출 Agent', feed:'견적 PDF·사양서', out:'금액·견적수·유효기간 추출', L:'L3', kind:'llm', badge:'추출'},
        {g:1, comp:'전자조달 커넥터', feed:'전자조달(자체구축 DB)', out:'품의 read', L:'L5', kind:'det'},
      ]},
    {id:'check', label:'예산·벤더·증빙·단가 점검', role:'AAP', kind:'auto', loopPhase:'Semantic', showCompose:true,
      explain:'예산 잔액·벤더 제재/신용·3견적 의무·사양 증빙·단가 편차·쪼개기 패턴을 결정론 규칙으로 점검하고 위험을 산정합니다.',
      ops:[
        {g:1, comp:'예산 점검 엔진', feed:'SAP(FI) 예산마스터 잔액', out:'발주 후 잔액·소진율', L:'L4', kind:'det', badge:'결정론'},
        {g:2, comp:'벤더 리스크 점검 Agent', feed:'벤더마스터·국세청 대조', out:'제재·신용·사업자 유효', L:'L3', kind:'llm'},
        {g:2, comp:'쪼개기 패턴 탐지 엔진', feed:'발주이력 근접 패턴', out:'쪼개기 의심 점수', L:'L4', kind:'det', badge:'결정론'},
        {g:3, comp:'SAP API 커넥터', feed:'ERP(MM/FI)', out:'예산·발주이력 read', L:'L5', kind:'det'},
        {g:3, comp:'3견적·증빙 점검 엔진', feed:'견적수·사양서·유효기간', out:'증빙 충족 산출', L:'L4', kind:'det', badge:'결정론'},
      ]},
    {id:'route_gate', label:'분기 판정(자동승인/구매검토/반려)', role:'결정', kind:'gate', loopPhase:'Decision',
      explain:'점검 결과를 evaluate(case,knowledge) 결정 룰로 종합해 자동승인·구매검토(HITL)·반려를 분기합니다. 보수 임계로 경계 건은 폭넓게 검토로 회부합니다.',
      gate:{ label:'분기 판정', decisions:[
        {key:'yes', label:'판정대로 진행', toast:'AAP 판정대로 진행합니다'},
        {key:'no', label:'구매 재검토 회부', toast:'구매 재검토로 회부합니다'} ]},
      ops:[
        {g:1, comp:'종합 분기 판정 엔진(route·임계)', feed:'슬롯+임계 → evaluate', out:'verdict(자동/검토/반려)', L:'L4', kind:'det', badge:'결정론'},
        {g:1, comp:'보수 리스크 임계 정책', feed:'riskAppetite=보수', out:'경계대역 HITL 회부', L:'L7', kind:'det', badge:'Policy'},
        {g:1, comp:'3견적·예산 하드 가드레일', feed:'예산 초과·견적 의무', out:'하드 반려 트리거', L:'L7', kind:'det', badge:'Policy'},
      ]},
    {id:'commit', label:'결재·발주·ERP 반영', role:'결정', kind:'gate', loopPhase:'Decision',
      explain:'확정 위임전결 결재선으로 전자결재를 상신·승인받고 SAP MM PO 생성·FI 예산 약정·전자조달 발주상태를 반영합니다(온프레미스 전용).',
      gate:{ label:'결재·발주', decisions:[
        {key:'yes', label:'상신·발주 진행', toast:'결재 상신·발주를 진행합니다'},
        {key:'no', label:'보류', toast:'발주를 보류합니다'} ]},
      ops:[
        {g:1, comp:'위임전결 결재선 산정 엔진', feed:'발주액→위임전결표', out:'결재선 자동구성', L:'L4', kind:'det', badge:'결정론'},
        {g:1, comp:'온프레미스 전자결재 커넥터', feed:'결재 상신·회신', out:'전자결재 상신', L:'L5', kind:'det'},
        {g:2, comp:'SAP MM 커넥터(read-write)', feed:'PO 생성', out:'PO 발번·발주', L:'L5', kind:'det', badge:'Antbot 반영'},
        {g:2, comp:'SAP FI 예산 약정 엔진', feed:'예산 commitment', out:'예산 약정', L:'L4', kind:'det'},
        {g:2, comp:'온프레미스 전용 가드레일', feed:'사내 경계 처리', out:'온프레미스 처리 보장', L:'L7', kind:'det', badge:'Policy'},
      ]},
  ];

  const COMPOSE=[
    {t:'Agent', sub:'전문 작업', cls:'tA', n:3, items:['구매심사 오케스트레이터 Agent','견적 추출 Agent','벤더 리스크 점검 Agent']},
    {t:'Module', sub:'재사용 기능', cls:'tM', n:5, items:['예산 점검 엔진','쪼개기 패턴 탐지 엔진','3견적·증빙 점검 엔진','위임전결 결재선 산정 엔진','종합 분기 판정 엔진']},
    {t:'기존 솔루션', sub:'Buy·Integrate', cls:'tS', n:2, items:['전자조달(자체구축)','SAP ERP(MM/FI)']},
    {t:'Connector', sub:'시스템 연동', cls:'tC', n:4, items:['전자조달 커넥터','SAP MM 커넥터','SAP FI 커넥터','벤더마스터 커넥터']},
    {t:'Policy', sub:'통제·권한', cls:'tP', n:4, items:['온프레미스 전용 가드레일','보수 리스크 임계 정책','3견적·예산 하드 가드레일','위임전결 권한 정책']},
  ];
  const COMPONENTS=[
    {type:'Agent', name:'구매심사 오케스트레이터 Agent', L:'L3'},
    {type:'Agent', name:'견적 추출 Agent', L:'L3'},
    {type:'Agent', name:'벤더 리스크 점검 Agent', L:'L3'},
    {type:'Module', name:'예산 점검 엔진', L:'L4'},
    {type:'Module', name:'쪼개기 패턴 탐지 엔진', L:'L4'},
    {type:'Module', name:'3견적·증빙 점검 엔진', L:'L4'},
    {type:'Module', name:'위임전결 결재선 산정 엔진', L:'L4'},
    {type:'Module', name:'종합 분기 판정 엔진', L:'L4'},
    {type:'기존 솔루션', name:'전자조달(자체구축)', L:'L5'},
    {type:'기존 솔루션', name:'SAP ERP(MM/FI)', L:'L5'},
    {type:'Connector', name:'전자조달 커넥터', L:'L5'},
    {type:'Connector', name:'SAP MM 커넥터', L:'L5'},
    {type:'Connector', name:'SAP FI 커넥터', L:'L5'},
    {type:'Connector', name:'벤더마스터 커넥터', L:'L5'},
    {type:'Policy', name:'온프레미스 전용 가드레일', L:'L7'},
    {type:'Policy', name:'보수 리스크 임계 정책', L:'L7'},
    {type:'Policy', name:'3견적·예산 하드 가드레일', L:'L7'},
    {type:'Policy', name:'위임전결 권한 정책', L:'L7'},
  ];

  /* ── seeds — bake JSON seeds(input[{slot,value}]) + 임계 기본 동봉 + quote_expired 사전계산.
     코어 coerceSlots 가 타입강제. atStep=route_gate 로 분기에서 멈춰 HITL 노출. ── */
  const RAW=[
    {title:'예산 초과 발주 — 생산기술팀', customer:'생산기술팀', vals:{case_id:'PR-2026-04412', requester:'김도현(생산기술팀)', department:'생산기술팀', purchase_type:'일반구매', budget_code:'BG-PRD-2026-018', delivery_due:'2026-07-31', order_amount:'42000000', vendor_id:'128-81-44021', is_new_vendor:'false', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'3', spec_attached:'true', quote_valid_until:'2026-07-15', quote_expired:'false', budget_remaining:'38000000', budget_after_order:'-4000000', budget_usage_pct:'81', split_score:'22', unit_price_deviation_pct:'3', quote_extract_confidence:'0.93', spec_match:'적정'}},
    {title:'벤더 거래정지 — 설비보전팀', customer:'설비보전팀', vals:{case_id:'PR-2026-04455', requester:'이서연(설비보전팀)', department:'설비보전팀', purchase_type:'MRO', budget_code:'BG-MNT-2026-007', delivery_due:'2026-07-10', order_amount:'3200000', vendor_id:'214-86-33910', is_new_vendor:'false', vendor_status:'거래정지', vendor_biz_no_valid:'true', quote_count:'1', spec_attached:'true', quote_valid_until:'2026-07-05', quote_expired:'false', budget_after_order:'11800000', budget_usage_pct:'40', split_score:'10', unit_price_deviation_pct:'0', quote_extract_confidence:'0.95'}},
    {title:'3견적 의무 미충족 — 품질보증팀', customer:'품질보증팀', vals:{case_id:'PR-2026-04478', requester:'박준호(품질팀)', department:'품질보증팀', purchase_type:'일반구매', budget_code:'BG-QA-2026-003', delivery_due:'2026-08-05', order_amount:'18500000', vendor_id:'305-81-77123', is_new_vendor:'false', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'2', spec_attached:'true', quote_valid_until:'2026-07-20', quote_expired:'false', budget_after_order:'41500000', budget_usage_pct:'55', split_score:'18', unit_price_deviation_pct:'2', quote_extract_confidence:'0.9', spec_match:'적정'}},
    {title:'증빙 미충족 — R&D센터', customer:'R&D센터', vals:{case_id:'PR-2026-04490', requester:'최민지(연구개발팀)', department:'R&D센터', purchase_type:'일반구매', budget_code:'BG-RND-2026-021', delivery_due:'2026-07-25', order_amount:'4200000', vendor_id:'117-81-20088', is_new_vendor:'false', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'1', spec_attached:'false', quote_valid_until:'2026-05-30', quote_expired:'true', budget_after_order:'17800000', budget_usage_pct:'48', split_score:'12', unit_price_deviation_pct:'1', quote_extract_confidence:'0.88'}},
    {title:'쪼개기 의심 — 생산관리팀', customer:'생산관리팀', vals:{case_id:'PR-2026-04501', requester:'정우성(생산관리팀)', department:'생산관리팀', purchase_type:'일반구매', budget_code:'BG-PRD-2026-009', delivery_due:'2026-07-18', order_amount:'4850000', vendor_id:'201-81-55340', is_new_vendor:'false', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'1', spec_attached:'true', quote_valid_until:'2026-07-31', quote_expired:'false', budget_after_order:'25150000', budget_usage_pct:'62', split_score:'82', unit_price_deviation_pct:'4', quote_extract_confidence:'0.91'}},
    {title:'신규 벤더 실사 — 구매2팀', customer:'구매2팀', vals:{case_id:'PR-2026-04518', requester:'한지민(구매2팀)', department:'구매2팀', purchase_type:'일반구매', budget_code:'BG-GEN-2026-014', delivery_due:'2026-08-12', order_amount:'3800000', vendor_id:'402-88-91200', is_new_vendor:'true', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'1', spec_attached:'true', quote_valid_until:'2026-07-28', quote_expired:'false', budget_after_order:'15200000', budget_usage_pct:'51', split_score:'15', unit_price_deviation_pct:'3', quote_extract_confidence:'0.9'}},
    {title:'단가 편차 초과 — 자재구매팀', customer:'자재구매팀', vals:{case_id:'PR-2026-04533', requester:'오세훈(자재팀)', department:'자재구매팀', purchase_type:'단가계약', budget_code:'BG-MAT-2026-006', delivery_due:'2026-07-09', order_amount:'12600000', vendor_id:'133-81-40277', is_new_vendor:'false', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'0', spec_attached:'true', quote_expired:'false', budget_after_order:'27400000', budget_usage_pct:'58', split_score:'20', unit_price_deviation_pct:'15', quote_extract_confidence:'0.95'}},
    {title:'예산 임박 승급 — 설비투자팀', customer:'설비투자팀', vals:{case_id:'PR-2026-04547', requester:'신영균(설비투자팀)', department:'설비투자팀', purchase_type:'단가계약', budget_code:'BG-CAPEX-2026-002', delivery_due:'2026-07-22', order_amount:'4500000', vendor_id:'506-81-12345', is_new_vendor:'false', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'0', spec_attached:'true', quote_expired:'false', budget_after_order:'500000', budget_usage_pct:'93', split_score:'25', unit_price_deviation_pct:'2', quote_extract_confidence:'0.94'}},
    {title:'견적 추출·사양 확인 — R&D구매팀', customer:'R&D구매팀', vals:{case_id:'PR-2026-04560', requester:'윤하늘(R&D구매팀)', department:'R&D구매팀', purchase_type:'일반구매', budget_code:'BG-RND-2026-030', delivery_due:'2026-08-20', order_amount:'4900000', vendor_id:'118-81-66501', is_new_vendor:'false', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'1', spec_attached:'true', quote_valid_until:'2026-08-01', quote_expired:'false', budget_after_order:'23100000', budget_usage_pct:'44', split_score:'19', unit_price_deviation_pct:'3', quote_extract_confidence:'0.62', spec_match:'모호'}},
    {title:'자동승인 소액 — 총무팀', customer:'총무팀', vals:{case_id:'PR-2026-04572', requester:'강민석(총무팀)', department:'총무팀', purchase_type:'MRO', budget_code:'BG-GA-2026-011', delivery_due:'2026-07-08', order_amount:'1850000', vendor_id:'129-81-30055', is_new_vendor:'false', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'1', spec_attached:'true', quote_valid_until:'2026-07-31', quote_expired:'false', budget_after_order:'22150000', budget_usage_pct:'36', split_score:'8', unit_price_deviation_pct:'1', quote_extract_confidence:'0.96', spec_match:'적정'}},
    {title:'전PASS·고액 결재선 — 생산기술팀', customer:'생산기술팀', vals:{case_id:'PR-2026-04588', requester:'임재현(생산기술팀)', department:'생산기술팀', purchase_type:'일반구매', budget_code:'BG-PRD-2026-024', delivery_due:'2026-08-30', order_amount:'68000000', vendor_id:'220-81-88440', is_new_vendor:'false', vendor_status:'정상', vendor_biz_no_valid:'true', quote_count:'3', spec_attached:'true', quote_valid_until:'2026-08-15', quote_expired:'false', budget_after_order:'82000000', budget_usage_pct:'50', split_score:'14', unit_price_deviation_pct:'2', quote_extract_confidence:'0.93', spec_match:'적정'}},
  ];
  function mkInput(o){ const all=Object.assign({}, TH, o); return Object.keys(all).map(k=>({slot:k, value:all[k]})); }
  const SEEDS=RAW.map(r=>({ title:r.title, customer:r.customer, icon:'🧾', atStep:'route_gate', input:mkInput(r.vals) }));

  const GOVERN=[
    {k:'Policy', v:'예산 초과·견적 의무 하드 가드레일 + 보수 임계 HITL 게이트.'},
    {k:'Run Trace', v:'접수→점검→판정→발주 반영 전 구간 기록.'},
    {k:'Evaluation', v:'evaluate(case,knowledge) 결정론 판정·근거(basis) 추적.'},
    {k:'Skill Library', v:'유형·룰·임계 재사용 자산화.'},
  ];
  const GATES=[
    '예산 초과 발주는 절대 규칙(하드 가드레일) — 자동 진행 차단·반려.',
    '신규 벤더는 실사 결과를 룰만으로 확정 불가 → 사람 수기 확인(HITL).',
    '쪼개기 의심은 의도 판단이 걸린 결정 → 구매팀장 판정으로 회부.',
    '견적 추출 신뢰도 임계 미만이면 핵심필드 정확성 미보장 → 사람 확인.',
    '전 점검 PASS여도 고액(자동승인 상한 초과)은 결재선 승인 필요.',
  ];

  const surfaceSpec={ icon:'🧾', title:'구매·조달', customer:'현업/구매', owner:'구매·재무 담당',
    tabs:['개요','판정','처리','기록'], status:{}, perStep:{}, ws:[], hitl:{}, done:{} };

  (window.AAP_PACKS=window.AAP_PACKS||{}).procurement={
    id:'procurement', label:'구매·조달',
    flow:FLOW, work:FLOW, components:COMPONENTS, compose:COMPOSE, gates:GATES, govern:GOVERN, seeds:SEEDS,
    /* ── 결정층 — 코어 evalCase 가 caseModel+knowledge 로 evaluate 실행. surface 함수 0줄 ── */
    caseModel:{ slots:SLOTS },
    knowledge:{ route:ROUTE, lookupTables:LOOKUPS, thresholds:EDITABLE },
    io:{ editable:EDITABLE },
    stepLoop:{ intake:'Data', check:'Semantic', route_gate:'Decision', commit:'Decision' },
    /* surface · surfaceHooks 없음 → 코어 일반 renderDataConsole/dcSteerHook/dcCmodal/dcWire 가 동작 */
    surfaceSpec,
    provenance:{ generatedBy:'harness', adapter:'harness_to_pack_v0.1', domain:'procurement', dataOnly:true },
  };
})();
