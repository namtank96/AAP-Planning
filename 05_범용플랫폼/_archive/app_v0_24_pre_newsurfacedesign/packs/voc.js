/* =========================================================================
   AAP Domain Pack — VOC 대응 (voc)  · 2번째 팩 (표준화 검증용)
   같은 플랫폼 코어 위에서 '회의'와 다른 도메인이 도는지 입증.
   인터페이스는 meeting.js 와 동일: 데이터 + surface(head/base/cmodal/review).
   ========================================================================= */
(function(){
  const odTable=(title,rows)=>`<div class="op-detail"><div class="od-title">${title}</div>${rows.map(r=>`<div class="od-row"><span class="od-k">${r[0]}</span><span class="od-v ${r[2]||''}">${r[1]}</span></div>`).join('')}</div>`;

  /* approve 게이트의 '선택' 슬롯 = 보상 수준 (meeting의 회의 시각과 동일 자리) */
  const TIMES=[
    {t:'전액 보상 · 2개월 요금 감면',s:'정책 한도 내 · 약 6.4만'},
    {t:'부분 보상 · 1개월 감면',s:'표준 처리 · 약 3.2만'},
    {t:'요금 정정만 · 과금 오류분',s:'최소 · 약 1.1만'},
  ];

  const PRODUCTS={
    history:{ic:'👤',title:'고객 정보·이력',sub:'VIP 2년차 · 직전 VOC 1건',body:`<div class="dlv">
      <div class="dlv-sec">고객</div>
      <div class="row"><span class="av">김</span><div><div class="nm">김하늘 · 5G 프리미엄</div><div class="why">가입 2년 1개월 · 등급 VIP</div></div><span class="tag ok">정상</span></div>
      <div class="dlv-sec">최근 이력</div>
      <div class="row"><div style="flex:1"><div class="nm">데이터 속도 저하 문의</div><div class="why">3개월 전 · 기지국 점검 후 해소</div></div><span class="tag warn">재발</span></div>
      <div class="row"><div style="flex:1"><div class="nm">이번 달 요금 78,400원</div><div class="why">평균 대비 +21,000원</div></div><span class="tag warn">과다</span></div></div>`},
    cause:{ic:'🔎',title:'원인 분석',sub:'복합 원인 2건',body:`<div class="dlv">
      <div class="row"><div style="flex:1"><div class="nm">속도 저하 · 셀 혼잡(거주지 기지국)</div><div class="why">망 품질 로그 · 피크시간 임계 초과</div></div><span class="tag block">확인</span></div>
      <div class="row"><div style="flex:1"><div class="nm">요금 과다 · 부가서비스 자동연장</div><div class="why">과금 시스템 · 프로모션 종료 미고지</div></div><span class="tag block">과금 오류</span></div></div>`},
    comp:{ic:'💳',title:'보상안',sub:(C)=>C.ex?'하향 적용':'표준',body:(C)=>`<div class="doc"><h5>보상안 (${C.S.pickedTime})</h5>
      <div class="drow"><span class="dk">근거</span>과금 오류 + 망 품질 재발 · 보상 정책 §3-2</div>
      <div class="drow"><span class="dk">요금</span>과다 청구분 정정 ${C.ex?'(감면 제외)':'+ 1~2개월 감면'}</div>
      <div class="drow"><span class="dk">한도</span>VIP 보상 한도 내 · 승인 권한 확인됨</div></div>`},
    reply:{ic:'✉️',title:'응답 초안',sub:'고객 발송 대기',body:(C)=>`<div class="doc"><h5>[안내] 문의 주신 건 처리 결과</h5>
      <div class="drow"><span class="dk">사과</span>불편을 드려 죄송합니다.</div>
      <div class="drow"><span class="dk">원인</span>기지국 혼잡 + 부가서비스 자동연장 과금 확인</div>
      <div class="drow"><span class="dk">조치</span>과금 정정${C.ex?'':' 및 요금 감면'} · 기지국 증설 요청 등록</div>
      <div class="drow"><span class="dk">채널</span>SMS + 앱 알림</div></div>`},
    ticket:{ic:'🎫',title:'티켓·후속',sub:'VOC-20461',body:`<div class="dlv">
      <div class="row"><div style="flex:1"><div class="nm">CRM 티켓 종결 처리</div><div class="why">유형 · 요금+품질 복합</div></div><span class="tag ok">완료</span></div>
      <div class="row"><div style="flex:1"><div class="nm">기지국 증설 검토 요청</div><div class="why">담당 · 망운영팀 / D+7</div></div><span class="tag warn">후속</span></div>
      <div class="row"><div style="flex:1"><div class="nm">프로모션 종료 고지 룰 개선</div><div class="why">반복 VOC 예방</div></div><span class="tag warn">학습</span></div></div>`},
  };

  const WORK=[
   {id:'request',label:'문의 접수',role:'고객 문의',actor:'human',
    explain:`VOC 처리는 추론 루프의 시작입니다. <b>L1 경험·접근</b>(상담 채널)이 고객 불만을 접수하고, <b>L4 지식·시맨틱</b>이 핵심 신호(불만 대상·요구)를 추출합니다.`,
    ops:[{g:0,feed:'고객 불만 수신',out:'"속도도 느린데 요금까지 과다 청구됐어요"',L:'L1',comp:'상담 채널·챗 UI'},
     {g:1,feed:'핵심 신호 추출',out:'속도 저하 · 요금 과다 · 보상 요구',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('추출된 신호',[['대상','데이터 속도·요금'],['감정','불만/실망'],['요구','원인 설명·보상']])},
     {g:2,feed:'정해진 것/빈 것 구분',out:'원인·보상 가능 여부 미정',L:'L4',comp:'컨텍스트 조합·근거'}]},

   {id:'understand',label:'문의 이해',role:'AAP 분석',actor:'aap',
    explain:`<b>Semantic</b> 단계입니다. <b>L4</b>가 불만을 유형(요금·품질 복합)으로 해석하고, <b>L6</b>가 감정·긴급도를 평가하며, <b>L7</b>이 보상 한도 정책을 답니다.`,
    ops:[{g:0,feed:'문의 유형 분류',out:'요금 + 품질 복합 불만',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('유형 (신뢰도)',[['요금+품질 복합','0.88','g'],['단순 요금','0.09'],['해지 요청','0.03']])},
     {g:1,feed:'감정·긴급도 평가',out:'불만 강도 중상 · VIP',L:'L6',comp:'감정 분석',asset:1,badge:'Antbot'},
     {g:2,feed:'보상 정책 플래그',out:'VIP 보상 한도 적용 · 승인 필요',L:'L7',comp:'정책 관리·통제'}]},

   {id:'compose',label:'실행 구조 구성',role:'AAP 구성',actor:'aap',
    explain:`핵심 단계입니다. AAP는 Agent를 많이 띄우는 게 아니라, 업무를 작업으로 분해하고 <b>L2·L3</b>에서 필요한 <b>Agent·모듈·기존 솔루션·Connector·정책</b>을 골라 실행 구조로 조합합니다.`,
    ops:[{g:0,feed:'작업 분해',out:'이력·원인·보상·응답 작업 그래프',L:'L2',comp:'설계·개발 환경',
      detail:odTable('작업 그래프 (4)',[['T1 이력 조회',''],['T2 원인 분석',''],['T3 보상 산정',''],['T4 응답 작성','']])},
     {g:1,feed:'데이터·근거 식별',out:'CRM·과금·망품질 로그 연결 대상',L:'L5',comp:'연결·수집'},
     {g:2,feed:'구성요소 배정·조합',out:'Agent 5 · Module 2 · 솔루션 2 · Connector 3 · Policy 3',L:'L3',comp:'코어·실행 엔진',micro:['Agent','Module','Solution','Connector','Policy'],
      detail:odTable('조합한 구성요소',[['Agent','5'],['Module','2'],['기존 솔루션','2'],['Connector','3'],['Policy','3']])},
     {g:3,feed:'누락·리스크 점검',out:'보상 한도·개인정보 리스크 표시',L:'L6',comp:'품질·근거 평가',asset:1,badge:'Antbot'}]},

   {id:'approve',label:'대응안 승인',role:'사람 확인 ①',actor:'hitl',gate:1,hitl:1,
    explain:`<b>L3 런타임 게이트</b>가 보상 결정 전 멈춥니다. AAP가 원인·보상안·보상 수준 후보를 제시하고, <b>보상 수준은 사람이 결정</b>합니다. (★ HITL ①)`,
    ops:[{g:0,feed:'대응안 제시',out:'원인 2건 · 보상안 · 응답 초안',L:'L1',comp:'상담 채널·챗 UI'},
     {g:1,feed:'보상 수준 후보 산출',out:'전액 / 부분 / 정정만',L:'L3',comp:'코어·실행 엔진',micro:['보상 정책 매칭'],
      detail:odTable('보상 옵션 (한도)',[['전액 감면','한도 내','g'],['부분 감면','표준'],['정정만','최소']])},
     {g:2,feed:'검토 게이트 보류',out:'보상 수준 선택 담당자 전달',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'prepare',label:'대응 실행',role:'AAP 실행',actor:'aap',doneModal:1,
    explain:`승인된 보상안대로 AAP가 자율 실행합니다. <b>L5</b>가 이력·과금을 <b>병렬</b> 조회하고, <b>L3 코어</b>가 원인 분석·보상 산정·응답 작성을 처리하며 <b>L8</b>이 CRM에 반영합니다.`,
    ops:[{g:0,feed:'고객 이력 조회',out:'VIP 2년 · 직전 VOC 1',L:'L5',comp:'연결·수집',micro:['CRM 커넥터']},
     {g:0,feed:'과금·망품질 조회',out:'과금 오류 1 · 셀 혼잡 1',L:'L5',comp:'연결·수집',micro:['과금 시스템','망품질 로그'],
      detail:odTable('조회 결과',[['과금 오류','+21,000원','a'],['셀 혼잡','임계 초과','a'],['직전 VOC','재발','a']])},
     {g:1,feed:'원인 분석·보상 산정',out:'복합 원인 2 · 보상 확정',L:'L3',comp:'코어·실행 엔진',micro:['원인 추론','보상 계산']},
     {g:1,feed:'응답 문구 작성',out:'사과·원인·조치 초안',L:'L3',comp:'코어·실행 엔진',micro:['톤·정책 준수']},
     {g:2,feed:'CRM 반영·티켓 갱신',out:'TCK-20461 · 처리중',L:'L8',comp:'스토리지·DB',micro:['crm.update()'],
      detail:odTable('시스템 반영',[['티켓','TCK-20461','g'],['상태','처리중','g'],['과금 정정','예약','g']])}]},

   {id:'commit',label:'발송 승인',role:'사람 확인 ②',actor:'hitl',gate:1,hitl:1,
    explain:`고객에게 나가는 마지막 행동 직전, <b>L7</b>이 응답 문구·개인정보·보상 금액을 점검하고 <b>L3 게이트</b>가 발송을 멈춰 담당자 최종 확인을 받습니다. (★ HITL ②)`,
    ops:[{g:0,feed:'응답안 취합',out:'응답 문구 · 보상 내역',L:'L3',comp:'코어·실행 엔진'},
     {g:1,feed:'발송 점검 (PII·문구)',out:'개인정보 0 · 정책 문구 통과',L:'L7',comp:'정책 관리·통제',
      detail:odTable('발송 점검',[['수신','SMS+앱','g'],['개인정보','0건','g'],['보상 금액','한도 내','g'],['금칙어','없음','g']])},
     {g:2,feed:'발송 게이트 보류',out:'고객 발송 승인 대기',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'share',label:'처리·기록·학습',role:'AAP 마무리',actor:'aap',doneModal:1,
    explain:`승인 후 AAP가 응답을 <b>병렬</b> 발송·기록하고, 반복 VOC 패턴을 <b>L7 Self-Improving</b>으로 학습 자산화해 다음 대응 정확도를 높입니다. (<b>Learning</b>)`,
    ops:[{g:0,feed:'응답 발송',out:'SMS·앱 알림 발송',L:'L3',comp:'코어·실행 엔진',micro:['notify.send()']},
     {g:0,feed:'티켓 종결·CRM 기록',out:'TCK-20461 종결',L:'L8',comp:'스토리지·DB',micro:['crm.close()']},
     {g:1,feed:'후속 조치 등록',out:'기지국 증설 요청 · 리마인더',L:'L3',comp:'코어·실행 엔진'},
     {g:2,feed:'학습 자산화',out:'반복 VOC 패턴 저장 · 룰 개선',L:'L7',comp:'Self-Improving',asset:1,badge:'Self-Improving',
      detail:odTable('학습 자산',[['프로모션 고지 룰','개선 후보','g'],['보상 기준','갱신','g'],['재발 알림','등록','g']])}]},
  ];

  const COMPOSE=[
   {t:'Agent',sub:'전문 작업',cls:'tA',n:5,items:['문의 분류','이력 조회(RAG)','원인 분석','보상 산정','응답 작성']},
   {t:'Module',sub:'재사용 기능',cls:'tM',n:2,items:['감정 분석 (Antbot)','보상 정책 매칭']},
   {t:'기존 솔루션',sub:'Buy·Integrate',cls:'tS',n:2,items:['CRM·상담 이력','과금 시스템']},
   {t:'Connector',sub:'시스템 연동',cls:'tC',n:3,items:['상담 채널','티켓 시스템','SMS·앱 알림']},
   {t:'Policy',sub:'통제·권한',cls:'tP',n:3,items:['보상 한도 정책','PII·개인정보','발송 승인 게이트(HITL)']},
  ];

  const COMPONENTS=[
   {type:'Agent',ty:'tyA',ic:'🏷️',name:'문의 분류 Agent',L:'L4',desc:'고객 불만을 유형·긴급도로 분류합니다.',when:'VOC가 접수되어 처리 경로를 정해야 할 때.',data:'문의 텍스트, 유형 온톨로지, 과거 VOC 패턴',how:'문의를 의미 분류 → 유형·긴급도·요구를 구조화.'},
   {type:'Agent',ty:'tyA',ic:'🔎',name:'이력 조회 Agent',L:'L5',desc:'고객·과금·상담 이력을 조회합니다 (RAG).',when:'원인 판단·보상 결정에 이력이 필요할 때.',data:'CRM, 과금 이력, 상담 로그, 망 품질 로그',how:'고객 식별 → 관련 이력을 검색·요약해 제공.'},
   {type:'Agent',ty:'tyA',ic:'🧩',name:'원인 분석 Agent',L:'L3',desc:'복합 불만의 근본 원인을 추론합니다.',when:'증상이 복합적이거나 재발일 때.',data:'증상, 시스템 로그, 과거 동일 원인 사례',how:'증상-로그 상관 분석 → 원인 후보를 근거와 함께 제시.'},
   {type:'Agent',ty:'tyA',ic:'💳',name:'보상 산정 Agent',L:'L3',desc:'정책 한도 내 보상안을 산정합니다.',when:'과금 오류·서비스 장애로 보상이 필요할 때.',data:'보상 정책, 고객 등급, 손해 추정',how:'정책·등급·원인을 매칭 → 보상 옵션을 한도와 함께 산정.'},
   {type:'Agent',ty:'tyA',ic:'✍️',name:'응답 작성 Agent',L:'L3',desc:'사과·원인·조치를 담은 응답을 작성합니다.',when:'고객 회신이 필요할 때.',data:'원인·보상 결과, 응답 템플릿, 톤 가이드',how:'결과를 템플릿·톤 가이드에 맞춰 응답 초안 생성.'},
   {type:'Module',ty:'tyM',ic:'😊',name:'감정 분석 모듈',L:'L6',asset:1,desc:'문의의 감정·불만 강도를 평가합니다 (Antbot).',when:'우선순위·에스컬레이션 판단 시 — 여러 Agent 공용.',data:'문의 텍스트, 감정 사전, 강도 기준',how:'텍스트 감정 분석 → 강도·긴급도 점수화.'},
   {type:'Module',ty:'tyM',ic:'⚖️',name:'보상 정책 매칭 모듈',L:'L7',desc:'사례를 보상 정책에 결정론적으로 매칭합니다.',when:'보상 옵션 산출 직전.',data:'보상 정책 규정, 한도표, 등급 규칙',how:'원인·등급을 규정에 매칭 → 가능한 옵션·한도 산출.'},
   {type:'기존 솔루션',ty:'tyS',ic:'🗂️',name:'CRM·상담 이력',L:'L5',desc:'사내 CRM·상담 이력 시스템을 연동합니다 (Integrate).',when:'고객·이력 조회, 티켓 갱신이 필요할 때.',data:'CRM API, 상담 티켓, 고객 마스터',how:'기존 CRM 연동 — 조회·티켓 쓰기 호출.'},
   {type:'기존 솔루션',ty:'tyS',ic:'🧾',name:'과금 시스템',L:'L8',desc:'요금·과금 시스템을 연동해 오류를 확인합니다.',when:'요금 불만·과금 오류 점검이 필요할 때.',data:'과금 내역, 프로모션·부가서비스 상태',how:'기존 과금 시스템 연동 — 청구 내역 조회·정정 요청.'},
   {type:'Connector',ty:'tyC',ic:'🔌',name:'상담·알림 Connector',L:'L5',desc:'상담 채널·티켓·SMS/앱 알림을 안전하게 연결합니다.',when:'채널 수신·발송, 티켓 연동 시(권한 범위).',data:'채널 API, 티켓 API, 알림 게이트웨이',how:'표준 커넥터로 권한 범위 안에서 수신·발송 중개.'},
   {type:'Policy',ty:'tyP',ic:'🛡️',name:'보상 한도·발송 정책',L:'L7',desc:'보상 한도 초과·외부 발송 시 자동 실행을 막고 승인을 요구합니다.',when:'보상 결정·고객 발송 등 책임 지점.',data:'보상 한도, 승인 권한 매트릭스, 발송 정책',how:'책임 행동 감지 → 자동 차단 후 HITL 게이트로 보류.'},
   {type:'Policy',ty:'tyP',ic:'🔒',name:'개인정보(PII) 정책',L:'L7',desc:'응답·기록의 개인정보 노출을 점검·마스킹합니다.',when:'고객 발송·외부 공유·기록 전.',data:'PII 패턴, 마스킹 규칙, 보존 정책',how:'PII 탐지 → 마스킹/차단 라벨을 정책 엔진에 전달.'},
   {type:'Agent',ty:'tyA',ic:'📚',name:'지식 자산화 Agent',L:'L7',asset:1,desc:'반복 VOC·해결 패턴을 축적해 다음 대응 정확도를 높입니다 (Self-Improving).',when:'처리 종결 후 결과를 학습으로 되먹임할 때.',data:'이번 VOC 유형·원인·보상·피드백',how:'패턴 정규화 → 지식베이스·룰 개선 데이터로 축적.'},
  ];

  const WORKLOAD={
    request:'고객이 "데이터 속도가 너무 느린데 이번 달 요금까지 과다 청구된 것 같다"며 불만을 접수했습니다.',
    type:'요금·품질 복합 불만 (VIP)', purpose:'원인 확인 · 보상 판단 · 고객 응답',
    outputs:['고객 이력','원인 분석','보상안','응답 문구','후속 조치'],
    gates:'대응안 승인 · 최종 발송 (보상·외부 발송만 담당자 확인 · HITL 2회)',
  };
  const PLAN_PRODUCES={request:[],understand:[],compose:['실행 구조(계획안)'],approve:['보상안','보상 수준 후보 3안'],prepare:['원인 분석·보상·응답 초안'],commit:['응답·발송안'],share:['발송·CRM 기록·학습 자산']};
  const GATES=['★ HITL ① 대응안 승인 · 보상 수준 선택','★ HITL ② 최종 발송·기록 승인'];
  const GOVERN=[
    {k:'Policy',v:'보상 한도·외부 발송·PII 정책. 책임 지점은 <b>자동 실행 차단</b> 후 담당자 확인.'},
    {k:'Run Trace',v:'문의→원인→보상 판단→담당자 확인→발송을 <b>전 구간 기록</b>(분쟁 대비).'},
    {k:'Evaluation',v:'원인 정확도·정책 준수·응답 품질을 <b>Antbot</b>이 평가.'},
    {k:'Skill Library',v:'반복 VOC 유형·보상 기준·응답 패턴을 <b>재사용 자산</b>으로 축적.'},
  ];

  /* ===== SURFACE — 좌측 VOC 대응 콘솔 ===== */
  function head(C){
    const S=C.S,i=C.idxOf(S.sel),w=C.W(S.sel),ai=C.idxOf('approve');
    const map={request:['접수','s-info','개요'],understand:['분석 중','s-info','개요'],compose:['분석 중','s-info','개요'],
      approve:['검토 필요','s-amber','보상'],prepare:['처리 중','s-blue','응답'],commit:['발송 대기','s-amber','응답'],share:['완료','s-green','응답']};
    const [stt,stc,tab]=map[w.id];
    const comp=i>=ai?`보상 ${C.ex?'정정만':'표준'}`:'보상 미정';
    const tabs=['개요','이력','보상','응답'].map(t=>`<span class="${t===tab?'on':''}">${t}</span>`).join('');
    return `<div class="hd-top"><span class="hd-ic">🎧</span>
       <div class="hd-main"><div class="hd-title">VOC · 요금·품질 복합 불만 <span class="hd-status ${stc}">${stt}</span></div>
       <div class="hd-meta">고객 김하늘 (VIP) · 티켓 VOC-20461 · ${comp}</div></div>
       <div class="hd-user">상담 이서연 ▾</div></div>
     <div class="hd-tabs">${tabs}<span class="hd-replay" id="replay">↻ 다시</span></div>`;
  }
  function wsList(C){
    const i=C.idxOf(C.S.sel);
    const rows=[
      {k:'고객 이력',ready:i>=4,v:'VIP · 재발',dlv:'history'},
      {k:'원인',ready:i>=4,v:'복합 2건',dlv:'cause'},
      {k:'보상안',ready:i>=3,v:C.ex?'정정만':'표준',dlv:'comp'},
      {k:'응답',ready:i>=4,v:'초안',dlv:'reply'},
      {k:'티켓',ready:i>=6,v:'종결',dlv:'ticket'},
    ];
    return `<div class="ws-list">`+rows.map(r=>`<div class="wl-row"><span class="wl-k">${r.k}</span>`+
      (r.ready?`<span class="wl-v">${r.v}</span><button class="wl-go" data-dlv="${r.dlv}">보기</button>`:`<span class="wl-na">준비 전</span>`)+`</div>`).join('')+`</div>`;
  }
  function base(C){
    const S=C.S,R=C.R,w=C.W(S.sel),id=w.id,working=R.phase==='working';
    const stMap={request:working?'문의를 접수하고 있어요…':'문의 접수됨 · 분석 시작',understand:working?'AAP가 불만을 분석하고 있어요':'문의 유형 정리됨',
      compose:working?'AAP가 대응 계획을 구성하고 있어요':'대응 계획 준비됨',approve:working?'대응안을 정리하고 있어요':'대응안 확인 대기',
      prepare:working?'고객 건을 처리하고 있어요':'처리 완료',commit:working?'응답을 정리하고 있어요':'발송 확인 대기',share:working?'결과를 발송·기록하고 있어요':'처리 완료'};
    let b=`<div class="ws-status">${working?'<span class="spin"></span>':''}${stMap[id]}</div>`;
    if(id==='request'){
      b+=`<div class="ws-req">"속도도 너무 느린데 이번 달 요금까지 과다 청구된 것 같아요. 확인하고 보상해 주세요."</div><div class="ws-hint">AAP가 이력·원인·보상을 확인해 대응안을 만들어 드려요.</div>`;
    } else if(id==='understand'){
      b+=`<div class="ws-overview ${working?'':'show'}"><div class="ov-row"><span>유형</span><b>요금 + 품질 복합</b></div><div class="ov-row"><span>고객</span><b>VIP · 직전 VOC 재발</b></div><div class="ov-row"><span>처리</span><b>원인 확인 · 보상 판단 · 응답</b></div></div>`;
    } else if(id==='compose'){
      b+=C.par(['이력 조회','원인 분석','보상 산정','응답 작성']);
    } else {
      if((id==='prepare'||id==='share')&&working) b+=C.par(id==='prepare'?['이력·과금 조회','원인 분석','보상 산정','응답 작성']:['응답 발송','CRM 기록','후속 등록']);
      b+=wsList(C);
    }
    return b;
  }
  function review(forCommit,C){
    if(!forCommit){
      const times=C.times.map((t,i)=>`<button class="rv-time ${t.t===C.S.pickedTime?'sel':''}" data-time="${i}">${t.t.split(' · ')[0]}<span>${(t.t.split(' · ')[1]||'')}</span></button>`).join('');
      return `<div class="rv">
        <div class="rv-sec"><div class="rv-k">원인<button class="rv-more" data-dlv="cause">분석 보기</button></div><div class="rv-sum">과금 오류 + 기지국 혼잡 · <b>복합 2건</b></div></div>
        <div class="rv-sec"><div class="rv-k">보상 수준 <span class="rv-hint">하나를 선택하세요</span></div><div class="rv-times">${times}</div></div>
        <div class="rv-sec"><div class="rv-k">응답</div><div class="rv-files"><button class="rv-file" data-dlv="reply">✉️ 응답 초안</button><button class="rv-file" data-dlv="history">👤 고객 이력</button></div></div>
      </div>`;
    }
    return `<div class="rv">
      <div class="rv-sec"><div class="rv-k">응답 문구<button class="rv-more" data-dlv="reply">전체 보기</button></div><div class="rv-sum">사과 · 원인 · 조치 · 보상(${C.ex?'정정만':'표준'})</div></div>
      <div class="rv-sec"><div class="rv-k">보상 내역<button class="rv-more" data-dlv="comp">보기</button></div><div class="rv-sum">${C.S.pickedTime}</div></div>
      <div class="rv-sec"><div class="rv-k">받는 사람</div><div class="rv-sum">김하늘 (VIP) · SMS + 앱 알림</div></div>
    </div>`;
  }
  function cmodal(kind,C){
    const S=C.S,sel=S.sel;
    if(kind==='hitl'){
      if(sel==='approve') return `<div class="cmodal-h">대응안을 확인해 주세요</div><div class="cmodal-sub">AAP가 원인·보상안을 준비했어요. 보상 수준은 직접 정하세요.</div>${review(false,C)}<div class="cmodal-actions"><button class="cp-btn primary" data-yes>이대로 처리할게요</button><button class="cp-btn ghost" data-no>보상 하향</button></div>`;
      if(sel==='commit') return `<div class="cmodal-h">고객에게 발송할까요?</div><div class="cmodal-sub">고객에게 나가는 마지막 단계예요. 문구·보상·받는 사람을 확인하세요.</div>${review(true,C)}<div class="cmodal-actions"><button class="cp-btn primary" data-yes>검토 후 발송</button><button class="cp-btn ghost" data-no>수정 요청</button></div>`;
    }
    if(kind==='done'){
      if(sel==='prepare') return `<button class="cmodal-x" data-close>×</button><div class="cmodal-h done">고객 건 처리 완료 <span class="cp-check">✓</span></div>
        <div class="mtcard"><div class="mt-row"><span class="mt-ic">🎫</span><div><div class="mt-title">VOC-20461 · 김하늘 (VIP)</div><div class="mt-when">요금·품질 복합 · 보상 ${C.ex?'정정만':'표준'}</div></div></div>
        <div class="rv-sum" style="line-height:1.9">원인 2건 확인 · 보상 산정 · 응답 초안 · CRM 처리중</div>
        <div class="mt-foot">✓ 과금 정정 예약 · 기지국 증설 요청 등록</div></div>
        <div class="cmodal-actions"><button class="cp-btn primary" data-close>확인</button></div>`;
      if(sel==='share') return `<button class="cmodal-x" data-close>×</button><div class="cmodal-h done">발송·종결 완료 <span class="cp-check">✓</span></div>
        <div class="done-list"><div class="dn-row"><span class="dn-ic">✉️</span>김하늘 고객에게 응답 발송 (SMS·앱)</div>
        <div class="dn-row"><span class="dn-ic">🗂️</span>CRM 티켓 종결 <button class="wl-go" data-dlv="ticket" style="margin-left:6px">열기</button></div>
        <div class="dn-row"><span class="dn-ic">⏰</span>기지국 증설 검토 · 룰 개선 등록</div></div>
        <div class="cmodal-actions"><button class="cp-btn primary" data-close>확인</button></div>`;
    }
    return '';
  }

  /* ===== SURFACE (선언형) ===== */
  const SS={
    icon:'🎧', title:'VOC · 요금·품질 복합 불만', customer:'고객 김하늘 (VIP) · 티켓 VOC-20461', owner:'상담 이서연',
    knownFrom:'approve', metaUnknown:'보상 미정', metaReady:(C)=>`보상 ${C.ex?'정정만':'표준'}`,
    tabs:['개요','이력','보상','응답'], select:'보상 수준',
    status:{request:['접수','s-info','개요'],understand:['분석 중','s-info','개요'],compose:['분석 중','s-info','개요'],approve:['검토 필요','s-amber','보상'],prepare:['처리 중','s-blue','응답'],commit:['발송 대기','s-amber','응답'],share:['완료','s-green','응답']},
    perStep:{
      request:{mode:'request',work:'문의를 접수하고 있어요…',done:'문의 접수됨 · 분석 시작',text:'"속도도 너무 느린데 이번 달 요금까지 과다 청구된 것 같아요. 확인하고 보상해 주세요."',hint:'AAP가 이력·원인·보상을 확인해 대응안을 만들어 드려요.'},
      understand:{mode:'overview',work:'AAP가 불만을 분석하고 있어요',done:'문의 유형 정리됨',rows:[['유형','요금 + 품질 복합'],['고객','VIP · 직전 VOC 재발'],['처리','원인 확인 · 보상 판단 · 응답']]},
      compose:{mode:'track',work:'AAP가 대응 계획을 구성하고 있어요',done:'대응 계획 준비됨',track:['이력 조회','원인 분석','보상 산정','응답 작성']},
      approve:{mode:'work',work:'대응안을 정리하고 있어요',done:'대응안 확인 대기'},
      prepare:{mode:'work',work:'고객 건을 처리하고 있어요',done:'처리 완료',track:['이력·과금 조회','원인 분석','보상 산정','응답 작성']},
      commit:{mode:'work',work:'응답을 정리하고 있어요',done:'발송 확인 대기'},
      share:{mode:'work',work:'결과를 발송·기록하고 있어요',done:'처리 완료',track:['응답 발송','CRM 기록','후속 등록']},
    },
    ws:[{k:'고객 이력',from:4,v:'VIP · 재발',dlv:'history'},{k:'원인',from:4,v:'복합 2건',dlv:'cause'},{k:'보상안',from:3,v:(C)=>C.ex?'정정만':'표준',dlv:'comp'},{k:'응답',from:4,v:'초안',dlv:'reply'},{k:'티켓',from:6,v:'종결',dlv:'ticket'}],
    hitl:{
      approve:{title:'대응안을 확인해 주세요',sub:'AAP가 원인·보상안을 준비했어요. 보상 수준은 직접 정하세요.',yes:'이대로 처리할게요',no:'보상 하향',showSelect:true,rows:[{k:'원인',v:'과금 오류 + 기지국 혼잡 · 복합 2건',dlv:'cause'}],files:[{label:'✉️ 응답 초안',dlv:'reply'},{label:'👤 고객 이력',dlv:'history'}]},
      commit:{title:'고객에게 발송할까요?',sub:'고객에게 나가는 마지막 단계예요. 문구·보상·받는 사람을 확인하세요.',yes:'검토 후 발송',no:'수정 요청',rows:[{k:'응답 문구',v:(C)=>`사과 · 원인 · 조치 · 보상(${C.ex?'정정만':'표준'})`,dlv:'reply'},{k:'보상 내역',v:(C)=>C.S.pickedTime,dlv:'comp'},{k:'받는 사람',v:'김하늘 (VIP) · SMS + 앱 알림'}]},
    },
    done:{
      prepare:{title:'고객 건 처리 완료',lines:[{ic:'🧩',t:'원인 2건 · 보상 산정 · 응답 초안'},{ic:'🎫',t:'CRM 처리중 (TCK-20461)'}]},
      share:{title:'발송·종결 완료',lines:[{ic:'✉️',t:'김하늘 고객에게 응답 발송 (SMS·앱)'},{ic:'🗂️',t:'CRM 티켓 종결',dlv:'ticket'},{ic:'⏰',t:'기지국 증설 검토 · 룰 개선 등록'}]},
    },
  };

  /* 데모용 시드 케이스(인스턴스) — 서로 다른 진행 상태 */
  const SEEDS=[
    {title:'김하늘(VIP) 요금·품질 복합 불만', customer:'고객 김하늘 (VIP) · VOC-20461', icon:'🎧', request:WORKLOAD.request, atStep:'approve'},
    {title:'신규 가입 개통 지연 문의', customer:'고객 박서준 · VOC-20488', icon:'🎧', request:'"개통한다더니 사흘째 안 돼요. 확인 부탁해요."', atStep:'request'},
    {title:'데이터 차단 오작동 항의', customer:'고객 이도윤 · VOC-20455', icon:'🎧', request:'"한도 남았는데 데이터가 끊겼어요. 보상해 주세요."', status:'done'},
  ];

  (window.AAP_PACKS=window.AAP_PACKS||{}).voc={
    id:'voc', label:'VOC 대응',
    times:TIMES, products:PRODUCTS, work:WORK, components:COMPONENTS, compose:COMPOSE,
    workload:WORKLOAD, planProduces:PLAN_PRODUCES, gates:GATES, govern:GOVERN, seeds:SEEDS,
    stepLoop:{request:'Data',understand:'Semantic',compose:'Reasoning',approve:'Decision',prepare:'Action',commit:'Decision',share:'Learning'},
    extExcluded:(S)=>S.decisions['approve']==='no',
    surfaceSpec:SS,
  };
})();
