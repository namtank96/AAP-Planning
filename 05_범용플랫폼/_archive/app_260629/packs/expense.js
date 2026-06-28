/* =========================================================================
   AAP Domain Pack — 경비·지출 (expense) · bake된 팩(N3 §E 오프라인 bake)
   ─────────────────────────────────────────────────────────────────────────
   출처: _harness_out/packs_baked/pack_expense.json (하니스 → adapter).
   ★ 수렴 §4-1a 증명: surface(HTML 생성) 함수 0줄. 코어 일반 renderDataConsole 이
     caseModel.slots + STATE.verdict(evaluate) + knowledge.lookupTables + io.editable 만으로
     계약·구매와 동형(single-case)의 조작형 결정 콘솔을 자동 표출한다.

   이 파일이 코어에 더하는 것 = "데이터" 뿐(구매 팩과 동일 패턴):
     · caseModel.slots / knowledge.route(실행 DSL) / lookupTables / thresholds / io.editable / seeds
   surface / surfaceHooks 없음 → 코어 일반 콘솔·steerHook·cmodal·wire 가 대신 동작.
   ========================================================================= */
(function(){

  /* ── caseModel.slots — 결정에 쓰이는 핵심 슬롯 + money/risk 표시 메타(함수 ✕) ── */
  const SLOTS=[
    {key:'claimId', label:'지출결의 번호', type:'string', source:'경비시스템', extract:'connector', group:'기본'},
    {key:'claimantId', label:'청구자 사번', type:'string', source:'경비시스템', extract:'connector', group:'기본'},
    {key:'claimantGrade', label:'청구자 직급', type:'enum', source:'HRIS', extract:'connector', group:'기본'},
    {key:'claimantDept', label:'청구자 부서', type:'string', source:'HRIS', extract:'connector', group:'기본'},
    {key:'claimPurpose', label:'청구 목적', type:'string', source:'경비시스템', extract:'connector', group:'기본'},
    {key:'expenseType', label:'비용 유형', type:'enum', source:'경비시스템', extract:'rule', group:'기본'},
    {key:'claimTotalAmount', label:'청구 총액', type:'number', source:'경비시스템', extract:'rule', group:'금액', money:true},
    {key:'lineAmount', label:'라인 금액', type:'number', source:'경비시스템', extract:'rule', group:'금액', money:true},
    {key:'paymentMethod', label:'결제수단', type:'enum', source:'경비시스템', extract:'rule', group:'금액'},
    {key:'expenseDate', label:'지출 일자', type:'date', source:'영수증', extract:'doc', group:'기간'},
    {key:'submitDate', label:'청구 일자', type:'date', source:'경비시스템', extract:'connector', group:'기간'},
    {key:'periodGapDays', label:'지출-청구 경과일수', type:'number', source:'날짜 산술', extract:'rule', group:'기간', risk:true, unit:'일'},
    {key:'evidenceAttached', label:'증빙 첨부', type:'boolean', source:'경비시스템', extract:'rule', group:'증빙', risk:true},
    {key:'evidenceType', label:'증빙 유형', type:'enum', source:'영수증 분류', extract:'doc', group:'증빙'},
    {key:'isQualifiedEvidence', label:'적격증빙 충족', type:'boolean', source:'적격증빙표 대조', extract:'rule', group:'증빙', risk:true},
    {key:'ocrAmount', label:'OCR 추출 금액', type:'number', source:'영수증 OCR', extract:'doc', group:'증빙', money:true},
    {key:'ocrConfidence', label:'OCR 추출 신뢰도', type:'number', source:'영수증 OCR', extract:'doc', group:'증빙'},
    {key:'amountMismatch', label:'영수증-청구 불일치액', type:'number', source:'금액 대조', extract:'rule', group:'증빙', money:true, risk:true},
    {key:'merchantCategory', label:'가맹점 업종', type:'enum', source:'카드 명세', extract:'connector', group:'점검'},
    {key:'accountCode', label:'계정과목', type:'enum', source:'계정 매핑', extract:'rule', group:'점검'},
    {key:'accountMismatchFlag', label:'계정 오분류 의심', type:'boolean', source:'계정 매핑 대조', extract:'rule', group:'점검', risk:true},
    {key:'taxAdvisoryFlag', label:'세무 자문 필요', type:'boolean', source:'세무 민감 계정', extract:'rule', group:'점검', risk:true},
    {key:'gradeLimitAmount', label:'직급별 한도', type:'number', source:'직급한도표', extract:'rule', group:'한도', money:true},
    {key:'limitExcessAmount', label:'한도 초과액', type:'number', source:'한도 대조', extract:'rule', group:'한도', money:true, risk:true},
    {key:'tripRegion', label:'출장 지역', type:'enum', source:'경비시스템', extract:'rule', group:'한도'},
    {key:'prohibitedItemFlag', label:'정책 위반(주류·개인·금지)', type:'boolean', source:'금지품목표 탐지', extract:'rule', group:'점검', risk:true},
    {key:'duplicateFlag', label:'중복 청구 의심', type:'boolean', source:'중복 패턴 탐지', extract:'rule', group:'점검', risk:true},
    {key:'splitFlag', label:'분할 청구 의심', type:'boolean', source:'분할 패턴 탐지', extract:'rule', group:'점검', risk:true},
    {key:'cardReconStatus', label:'법인카드 대사 결과', type:'enum', source:'카드 명세 대사', extract:'rule', group:'점검', risk:true},
    {key:'riskScore', label:'위험 점수', type:'number', source:'점검결과 가중합', extract:'rule', group:'점검', risk:true},
    {key:'routeDecision', label:'1차 라우팅 판정', type:'enum', source:'evaluate', extract:'rule', group:'결재'},
    {key:'erpDocNo', label:'ERP 전표 번호', type:'string', source:'ERP(FI)', extract:'connector', group:'반영'},
    {key:'writebackStatus', label:'경비시스템 반영 결과', type:'enum', source:'경비시스템', extract:'connector', group:'반영'},
  ];

  /* ── knowledge.route — 실행 DSL. decisionTables(prose) 와 동일 우선순위·로직.
     임계는 $th_* 슬롯 참조 → io.editable 조정이 verdict 를 가른다(중도 risk appetite). ── */
  const ROUTE={ rules:[
    {id:'r_reject_evidence', outcome:'REJECT', label:'반려(필수증빙 누락)',
      basis:'증빙 미첨부 또는 적격증빙 미충족·증빙없음 → 인정 불가',
      when:{ any:[ {'==':['$evidenceAttached',false]}, {all:[ {'==':['$isQualifiedEvidence',false]}, {'==':['$evidenceType','증빙없음']} ]} ] }},
    {id:'r_reject_prohibited', outcome:'REJECT', label:'반려(정책 위반)',
      basis:'주류·개인경비·금지업종 등 정책 위반 탐지 → 자동 진행 차단',
      when:{ '==':['$prohibitedItemFlag',true] }},
    {id:'r_reject_period', outcome:'REJECT', label:'반려(청구 기간 도과)',
      basis:'지출-청구 경과일수 > $th_period_deadline → 청구 기간 도과(정책상 불가)',
      when:{ '>':['$periodGapDays','$th_period_deadline'] }},
    {id:'r_reject_dup', outcome:'REJECT', label:'반려(명백 중복 청구)',
      basis:'청구자·일자·가맹점·금액 완전일치 중복 → 명백 중복',
      when:{ '==':['$duplicateFlag',true] }},
    {id:'r_rev_limit', outcome:'LEGAL_REVIEW', label:'검토(한도 초과액 삭감/예외)',
      basis:'직급 한도 초과액 발생 → 삭감/예외 사람 판단(HITL)',
      when:{ '>':['$limitExcessAmount',0] }},
    {id:'r_rev_account', outcome:'LEGAL_REVIEW', label:'검토(계정·세무 확정)',
      basis:'계정 오분류 의심 또는 세무 자문 필요 → 계정·세무 사람 확정',
      when:{ any:[ {'==':['$accountMismatchFlag',true]}, {'==':['$taxAdvisoryFlag',true]} ] }},
    {id:'r_rev_ocr', outcome:'LEGAL_REVIEW', label:'검토(OCR 저신뢰·금액 불일치)',
      basis:'OCR 신뢰도 < $th_ocr_confidence 또는 영수증-청구 불일치액 > $th_amount_tolerance → 수기 확인',
      when:{ any:[ {'<':['$ocrConfidence','$th_ocr_confidence']}, {'>':['$amountMismatch','$th_amount_tolerance']} ] }},
    {id:'r_rev_split', outcome:'LEGAL_REVIEW', label:'검토(중복/분할/대사 소명)',
      basis:'분할 청구 의심 또는 법인카드 대사 불일치(명세없음·청구없음) → 소명 필요',
      when:{ any:[ {'==':['$splitFlag',true]}, {in:['$cardReconStatus',['명세없음','청구없음']]} ] }},
    {id:'r_rev_highrisk', outcome:'LEGAL_REVIEW', label:'검토(고액·고위험)',
      basis:'위험점수 ≥ $th_risk_review 또는 청구총액 > $th_high_amount → 재무 검토',
      when:{ any:[ {'>=':['$riskScore','$th_risk_review']}, {'>':['$claimTotalAmount','$th_high_amount']} ] }},
    {id:'r_auto', outcome:'AUTO_APPROVE', label:'자동승인(정상)',
      basis:'전 점검 미해당 · 적격증빙 · 청구총액 ≤ $th_high_amount → 자동 진행',
      when:{ all:[ {'==':['$isQualifiedEvidence',true]}, {'<=':['$claimTotalAmount','$th_high_amount']} ] }},
  ], default:{ id:'r_default_hitl', outcome:'LEGAL_REVIEW', label:'검토(보수 기본값: 모호 시 HITL)',
      basis:'어느 규칙에도 명확히 해당하지 않는 경계 건 → 보수 기본값으로 HITL' } };

  /* ── lookupTables — bake JSON entries({match,result}) 를 코어 일반 룩업이 그대로 렌더 ── */
  const LOOKUPS=[
    {id:'lt_grade_limit', label:'직급별 한도(국내·1일)', icon:'list-checks',
      entries:[ ['임원·식대','100,000원'], ['임원·숙박','200,000원'], ['팀장·식대','50,000원'], ['사원/대리·숙박','100,000원'] ]},
    {id:'lt_qualified_evidence', label:'적격증빙 기준', icon:'receipt',
      entries:[ ['세금계산서','적격(전액 인정)'], ['법인카드 매출전표','적격(전액 인정)'], ['현금영수증(지출증빙)','적격'], ['간이영수증','3만 초과 시 미달'], ['증빙없음','불인정(반려)'] ]},
    {id:'lt_approval_line', label:'결재 위임전결', icon:'git-branch',
      entries:[ ['≤ 50만·예외없음','팀장 전결'], ['~ 200만','팀장→부서장'], ['초과·예외','부서장→재무'] ]},
    {id:'lt_account_mapping', label:'업종 → 계정과목', icon:'shield',
      entries:[ ['음식점(임직원)','복리후생비/여비교통비'], ['음식점(거래처 동반)','접대비(세무 민감)'], ['주점/유흥','금지(정책 위반)'] ]},
  ];

  /* ── io.editable — thresholds 중 사람이 조정하는 임계(steering). slot = route 가 참조하는 $th_* 키 ── */
  const EDITABLE=[
    {key:'th_high_amount', slot:'th_high_amount', label:'고액 검토 임계', type:'threshold', def:2000000,
      opts:[[1000000,'보수 100만'],[2000000,'표준 200만'],[3000000,'완화 300만']], recompute:'evaluate(case,knowledge)',
      note:'청구총액이 이 값 초과면 재무 검토 필수(HITL)'},
    {key:'th_risk_review', slot:'th_risk_review', label:'위험점수 검토 임계', type:'threshold', def:60,
      opts:[[50,'보수 50'],[60,'표준 60'],[75,'완화 75']], recompute:'evaluate(case,knowledge)',
      note:'위험점수가 이 값 이상이면 HITL 검토로 승격'},
    {key:'th_ocr_confidence', slot:'th_ocr_confidence', label:'OCR 신뢰도 임계', type:'threshold', def:0.8,
      opts:[[0.7,'완화 0.7'],[0.8,'표준 0.8'],[0.9,'엄격 0.9']], recompute:'evaluate(case,knowledge)',
      note:'이 값 미만이면 수기 확인 큐(간이영수증 gap)'},
    {key:'th_period_deadline', slot:'th_period_deadline', label:'청구 기한(일)', type:'threshold', def:90,
      opts:[[60,'보수 60'],[90,'표준 90'],[120,'완화 120']], recompute:'evaluate(case,knowledge)',
      note:'경과일수가 이 값 초과면 청구 기간 도과(반려)'},
  ];

  /* 비편집 임계(route 참조 · seeds 동봉) */
  const TH_FIXED={ th_amount_tolerance:1000 };
  const TH_EDIT_DEF={}; EDITABLE.forEach(e=>TH_EDIT_DEF[e.slot]=e.def);
  const TH=Object.assign({}, TH_FIXED, TH_EDIT_DEF);

  /* ── flow — 단일 케이스형 결정 콘솔 4단계(접수·점검·판정·반영) ── */
  const FLOW=[
    {id:'intake', label:'지출결의 접수·영수증 OCR', role:'요청', kind:'input', loopPhase:'Data',
      explain:'직원이 지출결의를 제출하면 경비시스템에서 케이스를 생성하고, 영수증 OCR로 금액·가맹점·일자를 추출해 슬롯을 채웁니다.',
      ops:[
        {g:1, comp:'경비심사 오케스트레이터 Agent', feed:'접수 건·경비시스템', out:'케이스 생성·슬롯 초기화', L:'L3', kind:'llm'},
        {g:1, comp:'영수증 OCR Agent', feed:'영수증 이미지', out:'금액·가맹점·일자 추출', L:'L3', kind:'llm', badge:'추출'},
        {g:1, comp:'경비시스템 커넥터', feed:'경비시스템(SaaS)', out:'결의 read', L:'L5', kind:'det'},
      ]},
    {id:'check', label:'증빙·한도·중복·계정 점검', role:'AAP', kind:'auto', loopPhase:'Semantic', showCompose:true,
      explain:'적격증빙·직급 한도·중복/분할·법인카드 대사·계정 분류·정책 금지품목·청구 기한을 결정론 규칙으로 점검하고 위험점수를 산정합니다.',
      ops:[
        {g:1, comp:'적격증빙 점검 엔진', feed:'적격증빙 기준표 대조', out:'적격 여부·증빙 충족', L:'L4', kind:'det', badge:'결정론'},
        {g:2, comp:'한도·중복 탐지 엔진', feed:'직급한도표·중복 패턴', out:'한도 초과액·중복/분할', L:'L4', kind:'det', badge:'결정론'},
        {g:2, comp:'계정·세무 분류 Agent', feed:'업종↔계정 매핑', out:'계정 오분류·세무 민감', L:'L3', kind:'llm'},
        {g:3, comp:'법인카드 대사 커넥터', feed:'카드 명세 대사', out:'대사 결과 read', L:'L5', kind:'det'},
        {g:3, comp:'위험점수 산정 엔진', feed:'점검결과 가중합', out:'위험점수 산정', L:'L4', kind:'det', badge:'결정론'},
      ]},
    {id:'route_gate', label:'분기 판정(자동승인/검토/반려)', role:'결정', kind:'gate', loopPhase:'Decision',
      explain:'점검 결과를 evaluate(case,knowledge) 결정 룰로 종합해 자동승인·검토(HITL)·반려를 분기합니다. 한도 초과·중복·고액·고위험은 사람 판단으로 회부합니다.',
      gate:{ label:'분기 판정', decisions:[
        {key:'yes', label:'판정대로 진행', toast:'AAP 판정대로 진행합니다'},
        {key:'no', label:'재무 재검토 회부', toast:'재무 재검토로 회부합니다'} ]},
      ops:[
        {g:1, comp:'종합 분기 판정 엔진(route·임계)', feed:'슬롯+임계 → evaluate', out:'verdict(자동/검토/반려)', L:'L4', kind:'det', badge:'결정론'},
        {g:1, comp:'정책 금지·기한 하드 가드레일', feed:'금지품목·청구 기한', out:'하드 반려 트리거', L:'L7', kind:'det', badge:'Policy'},
        {g:1, comp:'HITL 검토 라우팅 정책', feed:'한도·중복·고액·고위험', out:'검토 회부 트리거', L:'L7', kind:'det', badge:'Policy'},
      ]},
    {id:'commit', label:'결재·ERP 전표·반영', role:'결정', kind:'gate', loopPhase:'Decision',
      explain:'확정 위임전결 결재선으로 승인받고 ERP(FI) 전표를 생성·세무코드를 적용한 뒤 경비시스템에 지급 상태를 반영합니다.',
      gate:{ label:'결재·반영', decisions:[
        {key:'yes', label:'결재·전표 진행', toast:'결재·전표 생성을 진행합니다'},
        {key:'no', label:'보류', toast:'전표 생성을 보류합니다'} ]},
      ops:[
        {g:1, comp:'위임전결 결재선 산정 엔진', feed:'청구액·예외→위임전결표', out:'결재선 자동구성', L:'L4', kind:'det', badge:'결정론'},
        {g:1, comp:'전자결재 커넥터', feed:'결재 상신·회신', out:'전자결재 상신', L:'L5', kind:'det'},
        {g:2, comp:'ERP(FI) 전표 커넥터', feed:'전표 생성·세무코드', out:'전표 생성(read-write)', L:'L5', kind:'det', badge:'Antbot 반영'},
        {g:2, comp:'경비시스템 반영 커넥터', feed:'지급 상태 반영', out:'상태 writeback', L:'L5', kind:'det'},
        {g:2, comp:'적격증빙·세무 가드레일', feed:'세무 요건 준수', out:'세무 적격 보장', L:'L7', kind:'det', badge:'Policy'},
      ]},
  ];

  const COMPOSE=[
    {t:'Agent', sub:'전문 작업', cls:'tA', n:3, items:['경비심사 오케스트레이터 Agent','영수증 OCR Agent','계정·세무 분류 Agent']},
    {t:'Module', sub:'재사용 기능', cls:'tM', n:5, items:['적격증빙 점검 엔진','한도·중복 탐지 엔진','위험점수 산정 엔진','위임전결 결재선 산정 엔진','종합 분기 판정 엔진']},
    {t:'기존 솔루션', sub:'Buy·Integrate', cls:'tS', n:2, items:['경비시스템(SaaS)','SAP ERP(FI)']},
    {t:'Connector', sub:'시스템 연동', cls:'tC', n:4, items:['경비시스템 커넥터','법인카드 대사 커넥터','ERP(FI) 전표 커넥터','전자결재 커넥터']},
    {t:'Policy', sub:'통제·권한', cls:'tP', n:4, items:['정책 금지·기한 하드 가드레일','적격증빙·세무 가드레일','HITL 검토 라우팅 정책','위임전결 권한 정책']},
  ];
  const COMPONENTS=[
    {type:'Agent', name:'경비심사 오케스트레이터 Agent', L:'L3'},
    {type:'Agent', name:'영수증 OCR Agent', L:'L3'},
    {type:'Agent', name:'계정·세무 분류 Agent', L:'L3'},
    {type:'Module', name:'적격증빙 점검 엔진', L:'L4'},
    {type:'Module', name:'한도·중복 탐지 엔진', L:'L4'},
    {type:'Module', name:'위험점수 산정 엔진', L:'L4'},
    {type:'Module', name:'위임전결 결재선 산정 엔진', L:'L4'},
    {type:'Module', name:'종합 분기 판정 엔진', L:'L4'},
    {type:'기존 솔루션', name:'경비시스템(SaaS)', L:'L5'},
    {type:'기존 솔루션', name:'SAP ERP(FI)', L:'L5'},
    {type:'Connector', name:'경비시스템 커넥터', L:'L5'},
    {type:'Connector', name:'법인카드 대사 커넥터', L:'L5'},
    {type:'Connector', name:'ERP(FI) 전표 커넥터', L:'L5'},
    {type:'Connector', name:'전자결재 커넥터', L:'L5'},
    {type:'Policy', name:'정책 금지·기한 하드 가드레일', L:'L7'},
    {type:'Policy', name:'적격증빙·세무 가드레일', L:'L7'},
    {type:'Policy', name:'HITL 검토 라우팅 정책', L:'L7'},
    {type:'Policy', name:'위임전결 권한 정책', L:'L7'},
  ];

  /* ── seeds — bake JSON seeds(input[{slot,value}]) + 임계 기본 동봉. 코어 coerceSlots 가 타입강제 ── */
  const RAW=[{"title":"필수증빙 누락 — 구매2팀","customer":"구매2팀","vals":{"claimId":"EXP-2406-1001","claimantId":"E10432","claimantGrade":"사원/대리","claimantDept":"구매2팀","claimPurpose":"협력사 미팅 식대","claimTotalAmount":"38000","expenseType":"식대","lineAmount":"38000","paymentMethod":"개인선지출","evidenceAttached":"false","evidenceType":"증빙없음","isQualifiedEvidence":"false","routeDecision":"반려","routeReasons":"[\"EVIDENCE_MISSING\"]"}},{"title":"정책 위반(금지품목) — 영업1팀","customer":"영업1팀","vals":{"claimId":"EXP-2406-1002","claimantId":"E20815","claimantGrade":"팀장","claimantDept":"영업1팀","claimPurpose":"거래처 접대","claimTotalAmount":"180000","expenseType":"접대","lineAmount":"180000","paymentMethod":"법인카드","merchantCategory":"주점/유흥","evidenceAttached":"true","evidenceType":"신용카드매출전표(법인카드)","isQualifiedEvidence":"true","prohibitedItemFlag":"true","routeDecision":"반려","routeReasons":"[\"PROHIBITED_ALCOHOL\"]"}},{"title":"청구 기간 도과 — 생산관리팀","customer":"생산관리팀","vals":{"claimId":"EXP-2406-1003","claimantId":"E11290","claimantGrade":"사원/대리","claimantDept":"생산관리팀","claimPurpose":"지방 출장 교통비","claimTotalAmount":"45000","expenseType":"일비","lineAmount":"45000","expenseDate":"2026-02-10","submitDate":"2026-06-15","periodGapDays":"125","paymentMethod":"법인카드","evidenceAttached":"true","evidenceType":"신용카드매출전표(법인카드)","isQualifiedEvidence":"true","routeDecision":"반려","routeReasons":"[\"PERIOD_DEADLINE_EXCEEDED\"]"}},{"title":"명백 중복 청구 — 품질보증팀","customer":"품질보증팀","vals":{"claimId":"EXP-2406-1004","claimantId":"E13571","claimantGrade":"사원/대리","claimantDept":"품질보증팀","claimPurpose":"출장 식대","claimTotalAmount":"32000","expenseType":"식대","lineAmount":"32000","expenseDate":"2026-06-03","submitDate":"2026-06-10","periodGapDays":"7","ocrMerchant":"한솥도시락 화성점","paymentMethod":"개인선지출","evidenceAttached":"true","evidenceType":"현금영수증(지출증빙용)","isQualifiedEvidence":"true","duplicateFlag":"true","routeDecision":"반려","routeReasons":"[\"DUPLICATE_EXACT\"]"}},{"title":"한도 초과 삭감 — 경영기획","customer":"경영기획","vals":{"claimId":"EXP-2406-1005","claimantId":"E00231","claimantGrade":"임원","claimantDept":"경영기획","claimPurpose":"서울 출장 숙박","claimTotalAmount":"260000","expenseType":"숙박","lineAmount":"260000","tripRegion":"국내","gradeLimitAmount":"200000","limitExcessAmount":"60000","paymentMethod":"법인카드","evidenceAttached":"true","evidenceType":"세금계산서","isQualifiedEvidence":"true","routeDecision":"검토","routeReasons":"[\"LIMIT_EXCESS\"]"}},{"title":"계정·세무 확정 — 영업1팀","customer":"영업1팀","vals":{"claimId":"EXP-2406-1006","claimantId":"E20815","claimantGrade":"팀장","claimantDept":"영업1팀","claimPurpose":"임직원 회식(거래처 동반)","claimTotalAmount":"150000","expenseType":"식대","lineAmount":"150000","merchantCategory":"음식점(거래처 동반·접대 성격)","accountCode":"복리후생비","accountMismatchFlag":"true","taxAdvisoryFlag":"true","paymentMethod":"법인카드","evidenceAttached":"true","evidenceType":"신용카드매출전표(법인카드)","isQualifiedEvidence":"true","routeDecision":"검토","routeReasons":"[\"ACCOUNT_MISMATCH\",\"TAX_ADVISORY\"]"}},{"title":"OCR 저신뢰·금액 불일치 — 연구개발팀","customer":"연구개발팀","vals":{"claimId":"EXP-2406-1007","claimantId":"E14802","claimantGrade":"사원/대리","claimantDept":"연구개발팀","claimPurpose":"출장 식대","claimTotalAmount":"28000","expenseType":"식대","lineAmount":"28000","evidenceType":"간이영수증","evidenceAttached":"true","isQualifiedEvidence":"true","ocrAmount":"23000","ocrConfidence":"0.62","amountMismatch":"5000","paymentMethod":"현금","routeDecision":"검토","routeReasons":"[\"OCR_LOW_CONFIDENCE\",\"AMOUNT_MISMATCH\"]"}},{"title":"중복/분할/대사 소명 — 구매1팀","customer":"구매1팀","vals":{"claimId":"EXP-2406-1008","claimantId":"E15643","claimantGrade":"팀장","claimantDept":"구매1팀","claimPurpose":"거래처 식사(2건 분할)","claimTotalAmount":"118000","expenseType":"식대","lineAmount":"118000","gradeLimitAmount":"50000","paymentMethod":"법인카드","splitFlag":"true","cardReconStatus":"명세없음","evidenceAttached":"true","evidenceType":"신용카드매출전표(법인카드)","isQualifiedEvidence":"true","routeDecision":"검토","routeReasons":"[\"SPLIT_SUSPECT\",\"CARD_RECON_MISMATCH\"]"}},{"title":"고액·고위험 — 경영기획","customer":"경영기획","vals":{"claimId":"EXP-2406-1009","claimantId":"E00231","claimantGrade":"임원","claimantDept":"경영기획","claimPurpose":"해외 출장 정산(종합)","claimTotalAmount":"3200000","expenseType":"일비","lineAmount":"3200000","tripRegion":"해외","tripDays":"5","riskScore":"68","paymentMethod":"법인카드","evidenceAttached":"true","evidenceType":"세금계산서","isQualifiedEvidence":"true","routeDecision":"검토","routeReasons":"[\"HIGH_AMOUNT\",\"RISK_SCORE_OVER\"]"}},{"title":"자동승인 소액 — 총무팀","customer":"총무팀","vals":{"claimId":"EXP-2406-1010","claimantId":"E16720","claimantGrade":"사원/대리","claimantDept":"총무팀","claimPurpose":"야근 식대","claimTotalAmount":"12000","expenseType":"식대","lineAmount":"12000","gradeLimitAmount":"40000","limitExcessAmount":"0","periodGapDays":"3","paymentMethod":"법인카드","evidenceAttached":"true","evidenceType":"신용카드매출전표(법인카드)","isQualifiedEvidence":"true","ocrConfidence":"0.96","riskScore":"8","routeDecision":"자동승인","routeReasons":"[]"}},{"title":"자동승인 중액 — 구매1팀","customer":"구매1팀","vals":{"claimId":"EXP-2406-1011","claimantId":"E15643","claimantGrade":"팀장","claimantDept":"구매1팀","claimPurpose":"부산 출장 숙박","claimTotalAmount":"550000","expenseType":"숙박","lineAmount":"110000","tripRegion":"국내","tripDays":"5","gradeLimitAmount":"120000","limitExcessAmount":"0","periodGapDays":"6","paymentMethod":"법인카드","evidenceAttached":"true","evidenceType":"세금계산서","isQualifiedEvidence":"true","ocrConfidence":"0.93","riskScore":"22","routeDecision":"자동승인","routeReasons":"[]"}}];
  function mkInput(o){ const all=Object.assign({}, TH, o); return Object.keys(all).map(k=>({slot:k, value:all[k]})); }
  /* 인박스 상태 분산(접수·진행·검토대기) — 검토대기로만 평평해지지 않게. 열면 autoAdvance 가 route_gate 까지 흘려보내 게이트 demo 보존. */
  const _SEED_STAGES=['route_gate','check','intake'];   /* wait · run · new */
  const SEEDS=RAW.map((r,i)=>({ title:r.title, customer:r.customer, icon:'💳', atStep:_SEED_STAGES[i%3], input:mkInput(r.vals) }));

  const GOVERN=[
    {k:'Policy', v:'정책 금지품목·청구 기한 하드 가드레일 + 한도·고위험 HITL 게이트.'},
    {k:'Run Trace', v:'접수→점검→판정→전표 반영 전 구간 기록.'},
    {k:'Evaluation', v:'evaluate(case,knowledge) 결정론 판정·근거(basis) 추적.'},
    {k:'Skill Library', v:'유형·룰·임계·증빙 기준 재사용 자산화.'},
  ];
  const GATES=[
    '필수증빙 누락·정책 금지품목·청구 기한 도과는 하드 가드레일 — 자동 진행 차단·반려.',
    '직급 한도 초과액은 삭감/예외 판단이 걸린 결정 → 사람 판단(HITL).',
    '계정 오분류·세무 자문 필요는 세무 책임이 걸림 → 사람 확정.',
    'OCR 신뢰도 임계 미만·금액 불일치는 정확성 미보장 → 수기 확인.',
    '고액·고위험·중복/분할/대사 불일치는 재무 검토로 회부.',
  ];

  const surfaceSpec={ icon:'💳', title:'경비·지출', customer:'임직원/재무', owner:'재무·경비 담당',
    tabs:['개요','판정','처리','기록'], status:{}, perStep:{}, ws:[], hitl:{}, done:{} };

  (window.AAP_PACKS=window.AAP_PACKS||{}).expense={
    id:'expense', label:'경비·지출',
    flow:FLOW, work:FLOW, components:COMPONENTS, compose:COMPOSE, gates:GATES, govern:GOVERN, seeds:SEEDS,
    /* ── 결정층 — 코어 evalCase 가 caseModel+knowledge 로 evaluate 실행. surface 함수 0줄 ── */
    caseModel:{ slots:SLOTS },
    knowledge:{ route:ROUTE, lookupTables:LOOKUPS, thresholds:EDITABLE },
    io:{ editable:EDITABLE },
    stepLoop:{ intake:'Data', check:'Semantic', route_gate:'Decision', commit:'Decision' },
    /* surface · surfaceHooks 없음 → 코어 일반 renderDataConsole/dcSteerHook/dcCmodal/dcWire 가 동작 */
    surfaceSpec,
    provenance:{ generatedBy:'harness', adapter:'harness_to_pack_v0.1', domain:'expense', dataOnly:true },
  };
})();
