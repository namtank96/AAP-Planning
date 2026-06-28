/* =========================================================================
   AAP Domain Pack — 가전 렌탈 고객상담 (rental)
   거래성(해지·위약금=되돌릴 수 없는 결정) + 고객특정 + write-back + HITL 필연.
   voc.js 를 템플릿으로 리스킨 — 인터페이스 동일(데이터 5종 + surfaceSpec).
   좌측 surface = '실제로 일이 처리되는 상담 건 화면' 하나에 집중(운영관리 ✕).
   가드레일: 인박스·로그·거버넌스 UI는 좌측 시연 surface에서 제외(셸 다른 뷰 소관).
   ───────────────────────────────────────────────────────────────────────
   위약금 산정식 = 소비자분쟁해결기준: 의무 1년 초과 시 잔여월 임대료 × 10%(기본요금 기준).
   시나리오 B(합 검증): 안마의자 · 의무 60개월 · 18개월 사용 · 잔여 42개월 · 기본 79,000원/월.
     위약금 = 42 × 79,000 × 10% = 331,800원 / 등록비 면제분 100,000 / 철거비 30,000.
     표준 461,800 / 부분(위약금50%) 295,900 / 감면(이사 무관리지역 무위약) 30,000(철거비만).
   ========================================================================= */
(function(){
  const odTable=(title,rows)=>`<div class="op-detail"><div class="od-title">${title}</div>${rows.map(r=>`<div class="od-row"><span class="od-k">${r[0]}</span><span class="od-v ${r[2]||''}">${r[1]}</span></div>`).join('')}</div>`;

  /* approve 게이트의 '선택' 슬롯 = 정산 수준 3안 (voc 의 보상 수준과 동일 자리)
     extExcluded(approve='no'→하향) 패턴으로 '감면' 분기 연결. */
  const TIMES=[
    {t:'표준 정산 · 위약금 + 등록비 + 철거비',s:'규정 그대로 · 461,800원'},
    {t:'부분 감면 · 위약금 50% 적용',s:'사용이력 반영 · 295,900원'},
    {t:'무위약 · 철거비만',s:'이사 무관리지역 인정 · 30,000원'},
  ];

  const PRODUCTS={
    history:{ic:'📄',title:'계약·사용 이력',sub:'안마의자 · 18개월 사용 · 잔여 42',body:`<div class="dlv">
      <div class="dlv-sec">계약</div>
      <div class="row"><span class="av">정</span><div><div class="nm">정수아 · 안마의자 렌탈</div><div class="why">계약 R-2023-7841 · 의무 60개월 / 18개월 경과</div></div><span class="tag ok">정상</span></div>
      <div class="dlv-sec">요금·이력</div>
      <div class="row"><div style="flex:1"><div class="nm">기본요금 79,000원 (할인 후 69,000원)</div><div class="why">잔여 42개월 · 자동이체 정상</div></div><span class="tag ok">납부중</span></div>
      <div class="row"><div style="flex:1"><div class="nm">정기관리 6회 / 필터 교체 2회</div><div class="why">최근 방문 D-41 · 이상 없음</div></div><span class="tag warn">이사 예정</span></div></div>`},
    penalty:{ic:'🧮',title:'위약금 산정',sub:'소비자분쟁해결기준 적용',body:`<div class="dlv">
      <div class="row"><div style="flex:1"><div class="nm">위약금 = 42개월 × 79,000 × 10%</div><div class="why">의무 1년 초과 · 잔여월 임대료 10%(기본요금)</div></div><span class="tag block">331,800원</span></div>
      <div class="row"><div style="flex:1"><div class="nm">등록비 면제분 반환</div><div class="why">가입 시 면제분 · 약정 미충족</div></div><span class="tag block">100,000원</span></div>
      <div class="row"><div style="flex:1"><div class="nm">철거·수거비</div><div class="why">방문 철거 1회</div></div><span class="tag block">30,000원</span></div></div>`},
    settle:{ic:'💳',title:'정산안',sub:(C)=>C.ex?'감면 적용':'표준',body:(C)=>`<div class="doc"><h5>해지 정산안 (${C.S.pickedTime})</h5>
      <div class="drow"><span class="dk">근거</span>소비자분쟁해결기준 · 잔여월 임대료 10% ${C.ex?'+ 이사 무관리지역 무위약':''}</div>
      <div class="drow"><span class="dk">위약금</span>${C.ex?'면제 (무관리지역 인정)':'331,800원 (또는 50% 165,900원)'}</div>
      <div class="drow"><span class="dk">합계</span>${C.ex?'30,000원 (철거비만)':'461,800원 / 부분 295,900원'}</div></div>`},
    reply:{ic:'✉️',title:'안내 초안',sub:'고객 발송 대기',body:(C)=>`<div class="doc"><h5>[안내] 안마의자 렌탈 해지 정산 안내</h5>
      <div class="drow"><span class="dk">확인</span>해지 요청 접수 · 계약 R-2023-7841</div>
      <div class="drow"><span class="dk">정산</span>${C.ex?'무위약 처리 · 철거비 30,000원만':'위약금·등록비·철거비 합계 안내'}</div>
      <div class="drow"><span class="dk">일정</span>해지 예약 · 철거 방문 D+5 · 환불 산정 후 영업일 3일</div>
      <div class="drow"><span class="dk">채널</span>SMS + 앱 알림</div></div>`},
    ticket:{ic:'🎫',title:'시스템 반영·후속',sub:'CASE-RT-3120',body:`<div class="dlv">
      <div class="row"><div style="flex:1"><div class="nm">계약시스템 해지 예약 등록</div><div class="why">상태 · 해지대기 / 효력일 익월 1일</div></div><span class="tag ok">완료</span></div>
      <div class="row"><div style="flex:1"><div class="nm">철거 AS 티켓 발행</div><div class="why">방문 철거 D+5 · 기사 배정</div></div><span class="tag warn">후속</span></div>
      <div class="row"><div style="flex:1"><div class="nm">환불 산정 · 자동이체 해지</div><div class="why">결제시스템 반영 · 영업일 3일</div></div><span class="tag warn">후속</span></div></div>`},
  };

  /* FLOW — 렌탈 해지·계약변경 단계 그래프 (시나리오 B 기준 · 7단계 캐논) */
  const FLOW=[
   {id:'request',label:'상담 접수',role:'고객 문의',actor:'human',kind:'input',loopPhase:'Data',
    explain:`렌탈 상담은 추론 루프의 시작입니다. <b>L1 경험·접근</b>(상담 채널)이 고객 요청을 접수하고, <b>L4 지식·시맨틱</b>이 핵심 신호(요청 대상·의도)를 추출합니다.`,
    ops:[{g:0,feed:'고객 요청 수신',out:'"안마의자 해지하고 싶어요. 위약금 얼마예요?"',L:'L1',comp:'상담 채널·챗 UI'},
     {g:1,feed:'핵심 신호 추출',out:'해지 의향 · 위약금 문의 · 안마의자',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('추출된 신호',[['대상','안마의자 렌탈'],['의도','해지·위약금 확인'],['요구','정산 금액·절차']])},
     {g:2,feed:'정해진 것/빈 것 구분',out:'정산 금액·무위약 조건 미정',L:'L4',comp:'컨텍스트 조합·근거'}]},

   {id:'understand',label:'요청 이해',role:'AAP 분석',actor:'aap',kind:'auto',loopPhase:'Semantic',
    explain:`<b>Semantic</b> 단계입니다. <b>L4</b>가 요청을 유형(해지·위약금)으로 해석하고, <b>L6</b>가 긴급도·감정을 평가하며, <b>L7</b>이 위약금 한도·환불 승인 정책을 답니다.`,
    ops:[{g:0,feed:'문의 유형 분류',out:'해지·위약금 문의',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('유형 (신뢰도)',[['해지·위약금','0.91','g'],['요금·결제','0.06'],['단순조회','0.03']])},
     {g:1,feed:'감정·긴급도 평가',out:'결정 임박 · 중립',L:'L6',comp:'감정 분석',asset:1,badge:'Antbot'},
     {g:2,feed:'정책 플래그',out:'위약금 산정·환불 승인 게이트 적용',L:'L7',comp:'정책 관리·통제'}]},

   {id:'compose',label:'실행 구조 구성',role:'AAP 구성',actor:'aap',kind:'auto',loopPhase:'Reasoning',showCompose:1,
    explain:`핵심 단계입니다. AAP는 Agent를 많이 띄우는 게 아니라, 업무를 작업으로 분해하고 <b>L2·L3</b>에서 필요한 <b>Agent·모듈·기존 솔루션·Connector·정책</b>을 골라 실행 구조로 조합합니다.`,
    ops:[{g:0,feed:'작업 분해',out:'계약조회·위약금산정·정산작성·안내 작업 그래프',L:'L2',comp:'설계·개발 환경',
      detail:odTable('작업 그래프 (4)',[['T1 계약·이력 조회',''],['T2 위약금 산정',''],['T3 정산안 작성',''],['T4 안내 작성','']])},
     {g:1,feed:'데이터·근거 식별',out:'렌탈 계약·결제·사용이력 연결 대상',L:'L5',comp:'연결·수집'},
     {g:2,feed:'구성요소 배정·조합',out:'Agent 5 · Module 2 · 솔루션 2 · Connector 4 · Policy 3',L:'L3',comp:'코어·실행 엔진',micro:['Agent','Module','Solution','Connector','Policy'],
      detail:odTable('조합한 구성요소',[['Agent','5'],['Module','2'],['기존 솔루션','2'],['Connector','4'],['Policy','3']])},
     {g:3,feed:'누락·리스크 점검',out:'위약금 한도·환불·개인정보 리스크 표시',L:'L6',comp:'품질·근거 평가',asset:1,badge:'Antbot'}]},

   {id:'approve',label:'정산안 승인',role:'사람 확인 ①',actor:'hitl',hitl:1,kind:'gate',loopPhase:'Decision',
    gate:{label:'정산안 승인',decisions:[{key:'yes',label:'승인',toast:'승인 · 다음 단계로 진행합니다'},{key:'no',label:'위약금 감면',toast:'무위약(감면)으로 진행'}]},
    explain:`<b>L3 런타임 게이트</b>가 해지(되돌릴 수 없는 결정) 전 멈춥니다. AAP가 위약금 근거·정산 3안을 제시하고, <b>정산 수준은 사람이 결정</b>합니다. (★ HITL ①)`,
    ops:[{g:0,feed:'정산안 제시',out:'위약금 근거 · 정산 3안',L:'L1',comp:'상담 채널·챗 UI'},
     {g:1,feed:'정산 수준 후보 산출',out:'표준 / 부분 / 무위약',L:'L3',comp:'코어·실행 엔진',micro:['위약금 정책 매칭'],
      detail:odTable('정산 옵션 (규정)',[['표준 461,800','규정 그대로'],['부분 295,900','위약금 50%'],['무위약 30,000','무관리지역','g']])},
     {g:2,feed:'검토 게이트 보류',out:'정산 수준 선택 담당자 전달',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'prepare',label:'해지 처리',role:'AAP 실행',actor:'aap',doneModal:1,kind:'auto',loopPhase:'Action',
    explain:`승인된 정산안대로 AAP가 자율 실행합니다. <b>L5</b>가 계약·결제를 <b>병렬</b> 조회하고, <b>L3 코어</b>가 위약금 산정·정산 작성·안내 작성을 처리하며 <b>Antbot(RPA)</b>이 계약시스템에 반영합니다.`,
    ops:[{g:0,feed:'계약·이력 조회',out:'의무 60 · 경과 18 · 잔여 42',L:'L5',comp:'연결·수집',micro:['계약시스템 커넥터']},
     {g:0,feed:'결제·사용이력 조회',out:'자동이체 정상 · 정기관리 6회',L:'L5',comp:'연결·수집',micro:['결제 시스템','사용 로그'],
      detail:odTable('조회 결과',[['잔여월','42','a'],['기본요금','79,000','a'],['이사','무관리지역','a']])},
     {g:1,feed:'위약금 산정·정산 확정',out:'정산 합계 확정',L:'L3',comp:'코어·실행 엔진',micro:['위약금 계산','정산 작성']},
     {g:1,feed:'안내 문구 작성',out:'확인·정산·일정 초안',L:'L3',comp:'코어·실행 엔진',micro:['톤·정책 준수']},
     {g:2,feed:'계약시스템 반영(RPA)',out:'CASE-RT-3120 · 해지 예약',L:'L8',comp:'시스템 반영',micro:['rpa.book()'],asset:1,badge:'Antbot',
      detail:odTable('시스템 반영',[['계약','해지 예약','g'],['철거','AS 발행','g'],['환불','산정 예약','g']])}]},

   {id:'commit',label:'발송 승인',role:'사람 확인 ②',actor:'hitl',hitl:1,kind:'gate',loopPhase:'Decision',
    gate:{label:'발송 승인',decisions:[{key:'yes',label:'승인',toast:'승인 · 다음 단계로 진행합니다'},{key:'no',label:'수정 요청',toast:'수정 요청'}]},
    explain:`고객에게 나가는 마지막 행동 직전, <b>L7</b>이 안내 문구·개인정보·정산 금액을 점검하고 <b>L3 게이트</b>가 발송을 멈춰 담당자 최종 확인을 받습니다. (★ HITL ②)`,
    ops:[{g:0,feed:'안내안 취합',out:'안내 문구 · 정산 내역',L:'L3',comp:'코어·실행 엔진'},
     {g:1,feed:'발송 점검 (PII·문구·금액)',out:'개인정보 0 · 정산 금액 한도 내',L:'L7',comp:'정책 관리·통제',
      detail:odTable('발송 점검',[['수신','SMS+앱','g'],['개인정보','0건','g'],['정산 금액','한도 내','g'],['금칙어','없음','g']])},
     {g:2,feed:'발송 게이트 보류',out:'고객 발송 승인 대기',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'share',label:'발송·기록·학습',role:'AAP 마무리',actor:'aap',doneModal:1,kind:'auto',loopPhase:'Learning',
    explain:`승인 후 AAP가 안내를 <b>병렬</b> 발송·기록하고, 반복 해지 사유·무위약 판정 패턴을 <b>L7 Self-Improving</b>으로 학습 자산화해 다음 상담 정확도를 높입니다. (<b>Learning</b>)`,
    ops:[{g:0,feed:'안내 발송',out:'SMS·앱 알림 발송',L:'L3',comp:'코어·실행 엔진',micro:['notify.send()']},
     {g:0,feed:'케이스 종결·CRM 기록',out:'CASE-RT-3120 종결',L:'L8',comp:'스토리지·DB',micro:['crm.close()']},
     {g:1,feed:'철거·환불 후속 등록',out:'철거 방문 D+5 · 환불 산정',L:'L3',comp:'코어·실행 엔진'},
     {g:2,feed:'학습 자산화',out:'해지 사유·무위약 판정 패턴 저장',L:'L7',comp:'Self-Improving',asset:1,badge:'Self-Improving',
      detail:odTable('학습 자산',[['이사 무관리지역 판정','룰 개선','g'],['위약금 산정 기준','갱신','g'],['철거 일정 예측','등록','g']])}]},
  ];

  const COMPOSE=[
   {t:'Agent',sub:'전문 작업',cls:'tA',n:5,items:['문의 분류','계약 조회(RAG)','위약금 산정','정산 작성','안내 작성']},
   {t:'Module',sub:'재사용 기능',cls:'tM',n:2,items:['감정 분석 (Antbot)','위약금 정책 매칭']},
   {t:'기존 솔루션',sub:'Buy·Integrate',cls:'tS',n:2,items:['렌탈 계약시스템','결제 시스템']},
   {t:'Connector',sub:'시스템 연동',cls:'tC',n:4,items:['상담 채널','AS 티켓','SMS·앱 알림','철거 배정']},
   {t:'Policy',sub:'통제·권한',cls:'tP',n:3,items:['위약금 한도 정책','환불 승인 게이트(HITL)','PII·개인정보']},
  ];

  const COMPONENTS=[
   {type:'Agent',ty:'tyA',ic:'🏷️',name:'문의 분류 Agent',L:'L4',desc:'고객 요청을 유형·긴급도로 분류합니다.',when:'상담이 접수되어 처리 경로를 정해야 할 때.',data:'문의 텍스트, 유형 온톨로지, 과거 상담 패턴',how:'요청을 의미 분류 → 유형(해지·요금·AS·명의변경·조회)을 구조화.'},
   {type:'Agent',ty:'tyA',ic:'📄',name:'계약 조회 Agent',L:'L5',desc:'계약·사용·결제 이력을 조회합니다 (RAG).',when:'위약금 판단·정산에 계약 정보가 필요할 때.',data:'렌탈 계약, 결제 이력, 사용 로그, 정기관리 내역',how:'고객·계약 식별 → 관련 이력을 검색·요약해 제공.'},
   {type:'Agent',ty:'tyA',ic:'🧮',name:'위약금 산정 Agent',L:'L3',desc:'소비자분쟁해결기준에 따라 위약금을 산정합니다.',when:'해지·계약변경으로 정산이 필요할 때.',data:'잔여월, 기본요금, 등록비 면제분, 무위약 조건',how:'규정식(잔여월×기본요금×10%) + 등록비·철거비 결정론 계산.'},
   {type:'Agent',ty:'tyA',ic:'💳',name:'정산 작성 Agent',L:'L3',desc:'정산 3안(표준·부분·무위약)을 작성합니다.',when:'정산 옵션을 사람에게 제시하기 직전.',data:'위약금 결과, 감면 조건, 환불 산정 규칙',how:'규정·조건을 매칭 → 정산 옵션을 합계와 함께 산정.'},
   {type:'Agent',ty:'tyA',ic:'✍️',name:'안내 작성 Agent',L:'L3',desc:'확인·정산·일정을 담은 안내를 작성합니다.',when:'고객 회신이 필요할 때.',data:'정산 결과, 일정, 안내 템플릿, 톤 가이드',how:'결과를 템플릿·톤 가이드에 맞춰 안내 초안 생성.'},
   {type:'Module',ty:'tyM',ic:'😊',name:'감정 분석 모듈',L:'L6',asset:1,desc:'요청의 감정·긴급도를 평가합니다 (Antbot).',when:'우선순위·에스컬레이션 판단 시 — 여러 Agent 공용.',data:'문의 텍스트, 감정 사전, 강도 기준',how:'텍스트 감정 분석 → 강도·긴급도 점수화.'},
   {type:'Module',ty:'tyM',ic:'⚖️',name:'위약금 정책 매칭 모듈',L:'L7',desc:'사례를 위약금·환불 규정에 결정론적으로 매칭합니다.',when:'정산 옵션 산출 직전.',data:'소비자분쟁해결기준, 한도표, 무위약 조건',how:'잔여월·조건을 규정에 매칭 → 가능한 정산 옵션·한도 산출.'},
   {type:'기존 솔루션',ty:'tyS',ic:'🗂️',name:'렌탈 계약시스템',L:'L5',desc:'사내 계약시스템을 연동합니다 (Integrate).',when:'계약 조회, 해지 예약·상태 변경이 필요할 때.',data:'계약 API, 계약 마스터, 해지·변경 트랜잭션',how:'기존 계약시스템 연동 — 조회·해지 예약 쓰기 호출.'},
   {type:'기존 솔루션',ty:'tyS',ic:'🧾',name:'결제 시스템',L:'L8',desc:'결제·환불 시스템을 연동해 정산을 처리합니다.',when:'위약금 청구·환불 산정·자동이체 해지 시.',data:'결제 내역, 자동이체 상태, 환불 규칙',how:'기존 결제 시스템 연동 — 청구·환불·이체 해지 요청.'},
   {type:'Connector',ty:'tyC',ic:'🔌',name:'상담·AS·알림 Connector',L:'L5',desc:'상담 채널·AS 티켓·철거 배정·SMS/앱 알림을 안전하게 연결합니다.',when:'채널 수신·발송, AS 발행, 철거 배정 시(권한 범위).',data:'채널 API, AS 티켓 API, 배정·알림 게이트웨이',how:'표준 커넥터로 권한 범위 안에서 수신·발송·발행 중개.'},
   {type:'Policy',ty:'tyP',ic:'🛡️',name:'위약금 한도·환불 정책',L:'L7',desc:'위약금 감면·환불·해지 확정 시 자동 실행을 막고 승인을 요구합니다.',when:'정산 결정·고객 발송 등 책임 지점.',data:'위약금 한도, 승인 권한 매트릭스, 환불 정책',how:'책임 행동 감지 → 자동 차단 후 HITL 게이트로 보류.'},
   {type:'Policy',ty:'tyP',ic:'🔒',name:'개인정보(PII) 정책',L:'L7',desc:'안내·기록의 개인정보 노출을 점검·마스킹합니다.',when:'고객 발송·외부 공유·기록 전.',data:'PII 패턴, 마스킹 규칙, 보존 정책',how:'PII 탐지 → 마스킹/차단 라벨을 정책 엔진에 전달.'},
   {type:'Agent',ty:'tyA',ic:'📚',name:'지식 자산화 Agent',L:'L7',asset:1,desc:'반복 해지 사유·무위약 판정 패턴을 축적해 다음 상담 정확도를 높입니다 (Self-Improving).',when:'처리 종결 후 결과를 학습으로 되먹임할 때.',data:'이번 상담 유형·정산·판정·피드백',how:'패턴 정규화 → 지식베이스·룰 개선 데이터로 축적.'},
  ];

  const WORKLOAD={
    request:'고객이 "안마의자를 해지하고 싶은데 위약금이 얼마인지, 무위약으로 끝낼 방법은 없는지" 상담을 접수했습니다.',
    type:'해지·위약금 문의 (안마의자 렌탈)', purpose:'계약 확인 · 위약금 산정 · 해지 정산',
    outputs:['계약·사용 이력','위약금 산정','정산안','안내 문구','시스템 반영'],
    gates:'정산안 승인 · 최종 발송 (해지·환불만 담당자 확인 · HITL 2회)',
  };
  const PLAN_PRODUCES={request:[],understand:[],compose:['실행 구조(계획안)'],approve:['정산안','정산 수준 후보 3안'],prepare:['위약금 산정·정산·안내 초안'],commit:['안내·발송안'],share:['발송·시스템 반영·학습 자산']};
  const GATES=['★ HITL ① 정산안 승인 · 정산 수준 선택','★ HITL ② 최종 발송·반영 승인'];
  const GOVERN=[
    {k:'Policy',v:'위약금 한도·환불·해지 확정·PII 정책. 책임 지점은 <b>자동 실행 차단</b> 후 담당자 확인.'},
    {k:'Run Trace',v:'문의→위약금 산정→정산 결정→담당자 확인→해지 반영을 <b>전 구간 기록</b>(분쟁 대비).'},
    {k:'Evaluation',v:'위약금 산정 정확도·정책 준수·안내 품질을 <b>Antbot</b>이 평가.'},
    {k:'Skill Library',v:'반복 해지 사유·무위약 판정·정산 패턴을 <b>재사용 자산</b>으로 축적.'},
  ];

  /* ===== SURFACE (선언형) — 좌측 = 상담 건 처리 화면 하나(운영관리 ✕) ===== */
  const SS={
    icon:'🎧', title:'상담 · 안마의자 렌탈 해지·위약금', customer:'고객 정수아 · 계약 R-2023-7841', owner:'상담 한지민',
    knownFrom:'approve', metaUnknown:'정산 미정', metaReady:(C)=>`정산 ${C.ex?'무위약':'표준'}`,
    tabs:['개요','계약','정산','안내'], select:'정산 수준',
    status:{request:['접수','s-info','개요'],understand:['분석 중','s-info','개요'],compose:['분석 중','s-info','개요'],approve:['검토 필요','s-amber','정산'],prepare:['처리 중','s-blue','안내'],commit:['발송 대기','s-amber','안내'],share:['완료','s-green','안내']},
    perStep:{
      request:{mode:'request',work:'상담을 접수하고 있어요…',done:'상담 접수됨 · 분석 시작',text:'"안마의자 해지하고 싶어요. 위약금 얼마예요? 이사 가는데 무위약은 안 되나요?"',hint:'AAP가 계약·사용이력·위약금을 확인해 정산안을 만들어 드려요.'},
      understand:{mode:'overview',work:'AAP가 요청을 분석하고 있어요',done:'요청 유형 정리됨',rows:[['유형','해지·위약금 문의'],['계약','안마의자 · 잔여 42개월'],['처리','위약금 산정 · 정산 결정 · 안내']]},
      compose:{mode:'track',work:'AAP가 처리 계획을 구성하고 있어요',done:'처리 계획 준비됨',track:['계약 조회','위약금 산정','정산 작성','안내 작성']},
      approve:{mode:'work',work:'정산안을 정리하고 있어요',done:'정산안 확인 대기'},
      prepare:{mode:'work',work:'해지 건을 처리하고 있어요',done:'처리 완료',track:['계약·결제 조회','위약금 산정','정산 작성','안내 작성']},
      commit:{mode:'work',work:'안내를 정리하고 있어요',done:'발송 확인 대기'},
      share:{mode:'work',work:'결과를 발송·반영하고 있어요',done:'처리 완료',track:['안내 발송','시스템 반영','후속 등록']},
    },
    ws:[{k:'계약·사용 이력',from:4,v:'잔여 42',dlv:'history'},{k:'위약금',from:4,v:'331,800원',dlv:'penalty'},{k:'정산안',from:3,v:(C)=>C.ex?'무위약':'표준',dlv:'settle'},{k:'안내',from:4,v:'초안',dlv:'reply'},{k:'시스템 반영',from:6,v:'완료',dlv:'ticket'}],
    hitl:{
      approve:{title:'정산안을 확인해 주세요',sub:'AAP가 위약금 근거·정산안을 준비했어요. 정산 수준은 직접 정하세요. (해지는 되돌릴 수 없습니다)',yes:'이대로 처리할게요',no:'위약금 감면',showSelect:true,rows:[{k:'위약금 근거',v:'잔여 42개월 × 79,000 × 10% · 등록비·철거비',dlv:'penalty'}],files:[{label:'✉️ 안내 초안',dlv:'reply'},{label:'📄 계약 이력',dlv:'history'}]},
      commit:{title:'고객에게 발송할까요?',sub:'고객에게 나가는 마지막 단계예요. 문구·정산·받는 사람을 확인하세요.',yes:'검토 후 발송',no:'수정 요청',rows:[{k:'안내 문구',v:(C)=>`확인 · 정산 · 일정 · 정산(${C.ex?'무위약':'표준'})`,dlv:'reply'},{k:'정산 내역',v:(C)=>C.S.pickedTime,dlv:'settle'},{k:'받는 사람',v:'정수아 · SMS + 앱 알림'}]},
    },
    done:{
      prepare:{title:'해지 건 처리 완료',lines:[{ic:'🧮',t:(C)=>`위약금 산정 · 정산 작성 · 안내 초안 (${C.ex?'무위약 30,000원':'표준 461,800원'})`},{ic:'🎫',t:'계약시스템 해지 예약 (CASE-RT-3120)'}]},
      share:{title:'발송·반영 완료',lines:[{ic:'✉️',t:'정수아 고객에게 안내 발송 (SMS·앱)'},{ic:'🗂️',t:'계약 해지 예약 · 케이스 종결',dlv:'ticket'},{ic:'⏰',t:'철거 방문 D+5 · 환불 산정 등록'}]},
    },
  };

  /* 데모용 시드 케이스(인스턴스) — 서로 다른 진행 상태
     #1 시나리오 B(해지·위약금, HITL 필연) · #2 시나리오 A(단순조회·자동종결) · #3 done */
  const SEEDS=[
    {title:'정수아 안마의자 해지·위약금', customer:'고객 정수아 · R-2023-7841', icon:'🎧', request:WORKLOAD.request, atStep:'approve'},
    {title:'다음 결제일·약정 만료 조회', customer:'고객 윤재호 · R-2022-3315', icon:'🎧', request:'"다음 결제일이랑 약정 언제 끝나는지 알려줘."', atStep:'request'},
    {title:'정수기 명의변경 처리', customer:'고객 배수지 · R-2021-9920', icon:'🎧', request:'"정수기 명의를 가족으로 바꾸고 싶어요."', status:'done'},
  ];

  (window.AAP_PACKS=window.AAP_PACKS||{}).rental={
    id:'rental', label:'가전 렌탈 상담',
    times:TIMES, products:PRODUCTS, flow:FLOW, work:FLOW, components:COMPONENTS, compose:COMPOSE,
    workload:WORKLOAD, planProduces:PLAN_PRODUCES, gates:GATES, govern:GOVERN, seeds:SEEDS,
    io:{ inputs:[], editable:[], connectors:[] },   /* Pack Contract v2 · 2a 슬롯 예약(실동작 2c) */
    stepLoop:{request:'Data',understand:'Semantic',compose:'Reasoning',approve:'Decision',prepare:'Action',commit:'Decision',share:'Learning'},
    extExcluded:(S)=>S.decisions['approve']==='no',
    surfaceSpec:SS,
  };
})();
