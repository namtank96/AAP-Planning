/* =========================================================================
   AAP Domain Pack — 채용 (recruiting) · PoC 타깃 (도메인 네이티브 surface)
   ─────────────────────────────────────────────────────────────────────────
   "회의 리스킨 ✕" 원칙: 좌측 화면을 회의 포털이 아니라 실제 ATS(채용관리시스템)
   처럼 — 후보 파이프라인 보드 · 이력서/JD 뷰 · 스코어카드 · 숏리스트 로 구성.
   구현 선택 = (b) PACK.surface 함수형 커스텀 렌더. (선언형 surfaceSpec 은
   avatars/rows/times/files/overview 만 표현 → ATS 보드/표/스코어카드 불가.)
   단계 안무도 채용 고유(meeting '시작/종료' 메커니즘 미사용). 코어 무변경.
   ========================================================================= */
(function(){
  const odTable=(title,rows)=>`<div class="op-detail"><div class="od-title">${title}</div>${rows.map(r=>`<div class="od-row"><span class="od-k">${r[0]}</span><span class="od-v ${r[2]||''}">${r[1]}</span></div>`).join('')}</div>`;
  /* 인라인 아이콘 헬퍼 — surface 는 코어가 innerHTML 로 주입(아이콘 하이드레이션 미적용)하므로 SVG 직접 삽입 */
  const I=(n,c)=>window.AAP_ICON?window.AAP_ICON.svg(n,c?{cls:c}:undefined):'';

  /* =======================================================================
     결정론 더미 데이터 — 직무 1건 · 후보 6명. 손해사정 PoC 패턴(숫자 합치).
     매칭%·스코어는 가중합으로 일관되게 산출(고정). 단계별 배치도 고정.
     ======================================================================= */
  const JOB={
    id:'JD-2041', title:'백엔드 개발자 (Java/Kotlin)', team:'플랫폼개발팀',
    headcount:2, level:'경력 4~8년', applicants:38, screened:6,
    must:['Java/Kotlin','Spring','MSA','RDB/SQL'], plus:['Kafka','AWS','대용량 트래픽'],
    owner:'채용담당 한지원', hiring:'플랫폼개발팀 리드 오세훈',
  };

  /* 스코어카드 평가 항목(가중치 합 100) — 직무 핵심 역량 */
  const RUBRIC=[
    {k:'기술 적합도', w:35}, {k:'경력 깊이', w:25}, {k:'협업/커뮤니케이션', w:15},
    {k:'성장 가능성', w:15}, {k:'조직 적합성', w:10},
  ];
  /* 후보 — 단계(stage): applied/screened/shortlist/interview/offer.
     scores=루브릭 5항목 점수(0~5). match=must/plus 충족 가중%. 결정론(고정값). */
  const CAND=[
    {id:'c1',name:'정유진',ini:'정',yrs:6,cur:'쿠팡 · 시니어 백엔드',edu:'컴퓨터공학 학사',
     skills:['Kotlin','Spring','Kafka','MSA','AWS'],match:94,stage:'shortlist',
     scores:[5,4,4,4,4],risk:null,
     resume:'대용량 주문 처리 MSA 설계·운영 6년. Kotlin/Spring 주력, Kafka 기반 이벤트 파이프라인 구축. 피크 트래픽 12k TPS 안정화 경험.',
     hi:'대용량 트래픽·MSA 직접 경험이 JD must/plus를 모두 충족',},
    {id:'c2',name:'박서준',ini:'박',yrs:5,cur:'토스 · 백엔드',edu:'전자공학 학사',
     skills:['Java','Spring','RDB','AWS'],match:88,stage:'shortlist',
     scores:[4,4,5,4,4],risk:null,
     resume:'금융 정산 시스템 백엔드 5년. Java/Spring, 트랜잭션·정합성 설계 강점. 코드리뷰 문화 주도, 멘토링 경험.',
     hi:'협업·커뮤니케이션 평가 최상위(5), 정합성 설계 강점',},
    {id:'c3',name:'이하늘',ini:'이',yrs:8,cur:'네이버 · 테크리드',edu:'컴퓨터공학 석사',
     skills:['Java','Kotlin','MSA','Kafka','대용량'],match:91,stage:'interview',
     scores:[5,5,3,3,3],risk:'리더 역할 선호 — 본 포지션은 IC(개인기여자)',
     resume:'검색 플랫폼 테크리드 8년. 아키텍처 설계·대용량 처리 깊이 최상. 다만 최근 3년 매니징 비중 높음.',
     hi:'기술 깊이 최상위지만 IC 포지션과 기대역할 차이 확인 필요',},
    {id:'c4',name:'최민수',ini:'최',yrs:4,cur:'배민 · 백엔드',edu:'정보통신 학사',
     skills:['Kotlin','Spring','RDB'],match:79,stage:'screened',
     scores:[4,3,4,5,4],risk:null,
     resume:'배달 주문 백엔드 4년. Kotlin/Spring 견고. Kafka·대용량은 학습 단계. 성장 의지·태도 우수.',
     hi:'성장 가능성 높으나 Kafka·대용량(plus) 미충족 — 경력 하한',},
    {id:'c5',name:'강지아',ini:'강',yrs:7,cur:'카카오 · 백엔드',edu:'컴퓨터공학 학사',
     skills:['Java','Spring','MSA','AWS'],match:85,stage:'screened',
     scores:[4,4,4,3,4],risk:null,
     resume:'커머스 백엔드 7년. Java/Spring/MSA 안정적. Kafka 경험은 보조적. 정량 성과 명확.',
     hi:'must 전부 충족·안정적이나 Kafka(plus) 경험 보조 수준',},
    {id:'c6',name:'윤도현',ini:'윤',yrs:9,cur:'프리랜서 · 백엔드',edu:'산업공학 학사',
     skills:['Java','Spring','RDB'],match:62,stage:'screened',
     scores:[3,4,2,2,2],risk:'최근 2년 공백 + 단기 계약 반복 — 안정성 검토',
     resume:'다양한 SI/스타트업 백엔드 9년. 경력 길지만 MSA·대용량 노출 적고 단기 계약 반복.',
     hi:'경력 길지만 JD 핵심(MSA·대용량) 미충족 + 재직 안정성 신호',},
  ];
  const cById=id=>CAND.find(c=>c.id===id);
  /* 루브릭 가중 종합점수(0~100, 결정론) */
  function totalScore(c){ let s=0; RUBRIC.forEach((r,i)=>s+=c.scores[i]*r.w); return Math.round(s/5); }
  /* 숏리스트 후보(추천 3) — match 상위 + 리스크 없음 우선(고정 결과) */
  const SHORTLIST=['c1','c2','c3'];
  const INTERVIEW=[
    {cid:'c1',slot:'6/24 (화) 14:00',panel:'오세훈·이서영',type:'1차 기술'},
    {cid:'c2',slot:'6/24 (화) 16:00',panel:'오세훈·이서영',type:'1차 기술'},
    {cid:'c3',slot:'6/25 (수) 10:00',panel:'오세훈·CTO',type:'1차 기술'},
  ];
  const OFFER={cid:'c1',base:'7,200만',sign:'500만',start:'7/15',band:'B2 상한 내'};

  /* approve 게이트의 '선택' 슬롯 = 숏리스트 기준(meeting의 회의 시각 자리 재사용) */
  const TIMES=[
    {t:'엄격 · match ≥ 90',s:'후보 2명 · 정밀'},
    {t:'표준 · match ≥ 85',s:'후보 3명 · 권장'},
    {t:'넓게 · match ≥ 80',s:'후보 4명 · 풀 확대'},
  ];

  /* =======================================================================
     산출물(DLV) 미리보기 — 스크리닝 리포트·후보 비교표·면접 일정·오퍼
     ======================================================================= */
  const PRODUCTS={
    jd:{ic:'briefcase',title:'직무 기술서 (JD)',sub:`${JOB.id} · ${JOB.headcount}명 채용`,body:`<div class="doc"><h5>${JOB.title}</h5>
      <div class="drow"><span class="dk">팀</span>${JOB.team} · ${JOB.level}</div>
      <div class="drow"><span class="dk">인원</span>${JOB.headcount}명</div>
      <div class="drow"><span class="dk">필수</span>${JOB.must.join(' · ')}</div>
      <div class="drow"><span class="dk">우대</span>${JOB.plus.join(' · ')}</div>
      <div class="drow"><span class="dk">지원</span>총 ${JOB.applicants}명 → 1차 스크리닝 통과 ${JOB.screened}명</div></div>`},
    report:{ic:'file-text',title:'스크리닝 리포트',sub:`지원 ${JOB.applicants} → 통과 ${JOB.screened}`,body:`<div class="dlv">
      <div class="dlv-sec">파싱·매칭 요약</div>
      <div class="row"><div style="flex:1"><div class="nm">이력서 파싱 ${JOB.applicants}건</div><div class="why">PDF·DOCX·이미지 OCR 정규화 완료</div></div><span class="tag ok">완료</span></div>
      <div class="row"><div style="flex:1"><div class="nm">JD 요건 매칭·랭킹</div><div class="why">must 4 · plus 3 가중 스코어링</div></div><span class="tag ok">완료</span></div>
      <div class="row"><div style="flex:1"><div class="nm">차별금지·PII 점검</div><div class="why">성별·연령·출신 등 보호속성 매칭 제외</div></div><span class="tag ok">통과</span></div>
      <div class="dlv-sec">결과</div>
      <div class="row"><div style="flex:1"><div class="nm">통과 ${JOB.screened}명 (match ≥ 80)</div><div class="why">탈락 ${JOB.applicants-JOB.screened}명 · 사유 기록</div></div><span class="tag ok">랭킹</span></div></div>`},
    compare:{ic:'list',title:'후보 비교표',sub:`상위 ${JOB.screened}명 · 스코어카드`,body:`<div class="cmp-table">
      <div class="cmp-h"><span>후보</span><span>경력</span><span>매칭</span><span>종합</span><span>신호</span></div>
      ${CAND.map(c=>`<div class="cmp-r"><span class="cmp-nm"><b class="recr-av sm">${c.ini}</b>${c.name}</span><span>${c.yrs}년</span><span class="cmp-mt"><b>${c.match}%</b></span><span class="cmp-sc">${totalScore(c)}</span><span class="cmp-rk">${c.risk?'<i class="dot-r"></i>검토':'<i class="dot-g"></i>해당없음'}</span></div>`).join('')}
    </div>`},
    schedule:{ic:'calendar',title:'면접 일정',sub:`${INTERVIEW.length}건 · 1차 기술`,body:`<div class="dlv">
      ${INTERVIEW.map(iv=>{const c=cById(iv.cid);return `<div class="row"><span class="recr-av sm">${c.ini}</span><div style="flex:1"><div class="nm">${c.name} · ${iv.type}</div><div class="why">${iv.slot} · 패널 ${iv.panel}</div></div><span class="tag ok">확정</span></div>`;}).join('')}
      <div class="dlv-sec">조율</div>
      <div class="row"><div style="flex:1"><div class="nm">캘린더 충돌 0 · 면접관 가용 확인</div><div class="why">후보·면접관 양측 캘린더 교차</div></div><span class="tag ok">완료</span></div></div>`},
    offer:{ic:'award',title:'오퍼 패키지',sub:(C)=>`${cById(OFFER.cid).name} · ${C.ex?'밴드 하한':'표준'}`,body:(C)=>`<div class="doc"><h5>오퍼 · ${cById(OFFER.cid).name}</h5>
      <div class="drow"><span class="dk">직무</span>${JOB.title} (${JOB.team})</div>
      <div class="drow"><span class="dk">기본급</span>${C.ex?'6,800만':OFFER.base} · ${OFFER.band}</div>
      <div class="drow"><span class="dk">사이닝</span>${C.ex?'0':OFFER.sign}</div>
      <div class="drow"><span class="dk">입사</span>${OFFER.start}</div>
      <div class="drow"><span class="dk">승인</span>보상밴드·헤드카운트 검증 통과</div></div>`},
  };

  /* =======================================================================
     WORK — 채용 8단계 안무 (캐논 id/actor/gate 구조 유지 · 라벨·ops=채용 고유)
     요건 접수 → 요건 분석 → 스크리닝 계획·구성 → ★숏리스트 기준 승인(HITL①)
     → 이력서 파싱·매칭·랭킹(병렬) → 면접 일정 조율(통제) → ★합격·오퍼 승인(HITL③)
     → 공유·기록·학습.  ※ meeting 의 '시작/종료' 메커니즘 미사용.
     ======================================================================= */
  const WORK=[
   {id:'request',label:'채용 요건 접수',role:'채용 요청',actor:'human',
    explain:`채용 요건 접수는 추론 루프의 시작입니다. <b>L1 경험·접근</b>(채용 요청 폼)이 현업의 채용 요청을 접수하고, <b>L4 지식·시맨틱</b>이 직무·인원·필수역량 신호를 추출합니다.`,
    ops:[{g:0,feed:'채용 요청 수신',out:'"백엔드 개발자 2명, 4~8년차로 충원해줘"',L:'L1',comp:'채용 요청 폼·챗 UI'},
     {g:1,feed:'핵심 신호 추출',out:'직무·인원·연차·필수 스택',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('추출된 신호',[['직무','백엔드 개발자'],['인원','2명'],['연차','경력 4~8년'],['필수 스택','Java/Kotlin·Spring·MSA']])},
     {g:2,feed:'정해진 것/빈 것 구분',out:'우대요건·스크리닝 기준 미정',L:'L4',comp:'컨텍스트 조합·근거',
      detail:odTable('미정 항목',[['우대요건','초안 필요','a'],['스크리닝 컷','미정','a'],['면접 패널','미정','a'],['보상밴드','승인 필요','a']])}]},

   {id:'understand',label:'요건 분석',role:'AAP 분석',actor:'aap',
    explain:`요건 분석은 추론 루프 <b>Semantic</b> 단계입니다. <b>L4</b>가 요청을 표준 직무 모델로 해석해 JD 초안을 만들고, <b>L7</b>이 채용 시 적용할 차별금지·개인정보 정책을 답니다. AAP가 자율 수행합니다.`,
    ops:[{g:0,feed:'직무 유형 매핑',out:'백엔드(서버) · 시니어',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('직무 매핑 (신뢰도)',[['백엔드 개발(서버)','0.93','g'],['플랫폼 엔지니어','0.05'],['풀스택','0.02']])},
     {g:1,feed:'JD·요건 정의',out:'필수 4 · 우대 3 · 스코어 항목 5',L:'L4',comp:'컨텍스트 조합·근거',
      detail:odTable('요건 정의',[['필수','Java/Kotlin·Spring·MSA·RDB','g'],['우대','Kafka·AWS·대용량'],['평가 항목','5개 (가중 100)']])},
     {g:2,feed:'채용 정책 확인',out:'차별금지·PII → 보호속성 평가 제외',L:'L7',comp:'정책 관리·통제',
      detail:odTable('정책 점검',[['보호속성(성·연령·출신)','평가 제외','a'],['개인정보','마스킹 처리','a'],['적용 정책','채용 차별금지 v2']])}]},

   {id:'compose',label:'스크리닝 계획·구성',role:'AAP 구성',actor:'aap',
    explain:`핵심 단계입니다. AAP는 Agent를 많이 띄우는 게 아니라, 채용 업무를 작업으로 분해하고 <b>L2 설계·개발</b>·<b>L3 코어</b>에서 필요한 <b>Agent·모듈·기존 ATS·Connector·정책</b>을 골라 운영 가능한 스크리닝 실행 구조로 조합합니다.`,
    ops:[{g:0,feed:'작업 분해',out:'파싱·매칭·랭킹·일정·평가취합 그래프',L:'L2',comp:'설계·개발 환경',
      detail:odTable('작업 그래프 (5)',[['T1 이력서 파싱',''],['T2 요건 매칭',''],['T3 랭킹·스코어',''],['T4 면접 일정',''],['T5 평가 취합·반영','']])},
     {g:1,feed:'데이터·근거 식별',out:'ATS·지원자 DB·캘린더 연결 대상',L:'L5',comp:'연결·수집'},
     {g:2,feed:'구성요소 배정·조합',out:'Agent 6 · Module 3 · ATS 2 · Connector 4 · Policy 3',L:'L3',comp:'코어·실행 엔진',micro:['Agent','Module','Solution','Connector','Policy'],
      detail:odTable('조합한 구성요소',[['Agent','6'],['Module','3'],['기존 ATS/HRIS','2'],['Connector','4'],['Policy','3']])},
     {g:3,feed:'누락·편향 점검',out:'편향·요건 누락 리스크 표시',L:'L6',comp:'품질·근거 평가',asset:1,badge:'Antbot',
      detail:odTable('리스크 (Antbot)',[['편향 신호','평가 제외 확인','g'],['요건 누락','없음','g'],['스코어 일관성','검증','g']])}]},

   {id:'approve',label:'숏리스트 기준 승인',role:'사람 확인 ①',actor:'hitl',gate:1,hitl:1,
    explain:`<b>L3 런타임 게이트</b>가 스크리닝 실행 전 책임 지점을 멈춥니다. AAP가 스크리닝 계획과 숏리스트 컷 후보를 제시하고, <b>숏리스트 기준(컷)은 채용담당이 결정</b>합니다. (★ HITL ①)`,
    ops:[{g:0,feed:'스크리닝 계획 제시',out:'파싱·매칭 방식 · 평가 항목 요약',L:'L1',comp:'채용 콘솔·챗 UI'},
     {g:1,feed:'숏리스트 컷 후보 산출',out:'엄격 2 / 표준 3 / 넓게 4',L:'L3',comp:'코어·실행 엔진',micro:['컷 시뮬레이션'],
      detail:odTable('컷 후보 (통과수)',[['match ≥ 90','2명','g'],['match ≥ 85','3명'],['match ≥ 80','4명']])},
     {g:2,feed:'검토 게이트 보류',out:'숏리스트 기준 선택 담당자 전달',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'prepare',label:'이력서 파싱·매칭·랭킹',role:'AAP 실행',actor:'aap',doneModal:1,
    explain:`승인된 기준대로 AAP가 Agent들을 자율 가동합니다. <b>L5</b>가 이력서를 <b>병렬</b> 수집·OCR 파싱하고(<span class="v">AI:ON-U</span>), <b>L3 코어</b>가 요건 매칭·스코어링·랭킹을 수행하며 <b>L6·L7</b>이 편향 점검·정규화합니다.`,
    ops:[{g:0,feed:'이력서 수집·OCR 파싱',out:`${JOB.applicants}건 파싱·정규화`,L:'L5',comp:'연결·수집',asset:1,badge:'AI:ON-U',micro:['ATS 커넥터','OCR'],
      detail:odTable('파싱 결과',[['이력서','38건'],['OCR 정규화','완료','g'],['경력·스킬 추출','완료','g'],['중복·스팸 제거','4건']])},
     {g:0,feed:'JD 요건 매칭',out:'must/plus 가중 매칭',L:'L3',comp:'코어·실행 엔진',micro:['요건 매칭']},
     {g:1,feed:'스코어링·랭킹',out:`상위 ${JOB.screened}명 랭킹`,L:'L3',comp:'코어·실행 엔진',micro:['루브릭 5항목'],
      detail:odTable('랭킹 (종합점수)',[['정유진','94 / '+totalScore(cById('c1')),'g'],['이하늘','91 / '+totalScore(cById('c3')),'g'],['박서준','88 / '+totalScore(cById('c2')),'g'],['강지아','85 / '+totalScore(cById('c5'))]])},
     {g:1,feed:'편향·PII 점검',out:'보호속성 평가 제외 · PII 마스킹',L:'L7',comp:'정책 관리·통제',
      detail:odTable('편향 점검',[['성별·연령·출신','평가 미반영','g'],['사진·신상','마스킹','g'],['스코어 근거','요건 기반만','g']])},
     {g:2,feed:'스코어카드·리포트 반영',out:'스코어카드 · 스크리닝 리포트',L:'L8',comp:'스토리지·DB',micro:['ats.write()'],
      detail:odTable('시스템 반영',[['스코어카드','6명 생성','g'],['스크리닝 리포트','생성','g'],['ATS 단계','스크리닝 통과','g']])}]},

   {id:'meeting',label:'면접 일정 조율',role:'사람 확인 ②',actor:'hitl',gate:1,hitl:1,
    explain:`숏리스트 후보의 면접을 잡습니다. <b>L5</b>가 후보·면접관 캘린더를 교차해 충돌 없는 슬롯을 산출하고, <b>L3 코어</b>가 초대를 구성합니다. 외부(후보)로 안내가 나가므로 <b>담당자가 일정·패널을 확인</b>합니다. (★ HITL ②)`,
    ops:[{g:0,feed:'면접관·후보 가용 조회',out:'양측 캘린더 교차',L:'L5',comp:'연결·수집',micro:['캘린더 Connector'],
      detail:odTable('가용 교차',[['후보 가용','3명 응답','g'],['면접관','오세훈·이서영·CTO','g'],['충돌','0','g']])},
     {g:1,feed:'면접 슬롯·패널 구성',out:`${INTERVIEW.length}슬롯 · 충돌 0`,L:'L3',comp:'코어·실행 엔진',micro:['슬롯 매칭'],
      detail:odTable('면접 슬롯',[['정유진','6/24 14:00','g'],['박서준','6/24 16:00','g'],['이하늘','6/25 10:00','g']])},
     {g:2,feed:'안내 게이트 보류',out:'일정·패널 확인 담당자 전달',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'commit',label:'합격·오퍼 승인',role:'사람 확인 ③',actor:'hitl',gate:1,hitl:1,
    explain:`후보에게 오퍼가 나가는 마지막 행동 직전, <b>L7</b>이 보상밴드·헤드카운트·차별금지를 점검하고 <b>L3 런타임 게이트</b>가 오퍼 발송을 멈춰 담당자·현업 리드의 최종 승인을 받습니다. (★ HITL ③)`,
    ops:[{g:0,feed:'면접 평가 취합',out:'합격 후보 · 오퍼 패키지',L:'L3',comp:'코어·실행 엔진',
      detail:odTable('평가 취합',[['최종 합격','정유진','g'],['종합 평가','우수','g'],['헤드카운트','1 / 2 충원']])},
     {g:1,feed:'오퍼 점검 (보상·정책)',out:'보상밴드 내 · 차별금지 통과',L:'L7',comp:'정책 관리·통제',
      detail:odTable('오퍼 점검',[['기본급','밴드 상한 내','g'],['헤드카운트','승인 범위','g'],['차별금지','통과','g'],['처우 형평','검증','g']])},
     {g:2,feed:'발송 게이트 보류',out:'오퍼 발송·기록 승인 대기',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'share',label:'공유·기록·학습',role:'AAP 마무리',actor:'aap',doneModal:1,
    explain:`승인 후 AAP가 결과를 <b>병렬</b> 전달·기록하고, 이번 채용 패턴을 <b>L7 Self-Improving</b>으로 학습 자산화해 다음 포지션의 매칭 정확도를 높입니다. (추론 루프 <b>Learning</b>)`,
    ops:[{g:0,feed:'오퍼·결과 발송',out:'합격 안내 · 불합격 통지',L:'L3',comp:'코어·실행 엔진',micro:['mail.send()'],
      detail:odTable('발송 결과',[['오퍼 레터','정유진 발송','g'],['면접 안내','3명 발송','g'],['불합격 통지','정중 안내','g']])},
     {g:0,feed:'ATS 기록·단계 갱신',out:'채용 파이프라인 단계 반영',L:'L8',comp:'스토리지·DB',micro:['ats.update()']},
     {g:1,feed:'온보딩 작업 등록',out:'입사 준비 · 리마인더',L:'L3',comp:'코어·실행 엔진'},
     {g:2,feed:'학습 자산화',out:'직무 매칭 패턴 저장 · 기준 개선',L:'L7',comp:'Self-Improving',asset:1,badge:'Self-Improving',
      detail:odTable('학습 자산',[['백엔드 매칭 패턴','저장','g'],['스코어 기준','갱신','g'],['다음 포지션 적용','준비','g']])}]},
  ];

  const COMPOSE=[
   {t:'Agent',sub:'전문 작업',cls:'tA',n:6,items:['이력서 파싱','요건 매칭(RAG)','랭킹·스코어','면접 일정 조율','평가 취합','후보 커뮤니케이션']},
   {t:'Module',sub:'재사용 기능',cls:'tM',n:3,items:['OCR·정규화 (AI:ON-U)','편향 점검 (Antbot)','보상밴드 검증']},
   {t:'기존 솔루션',sub:'Buy·Integrate',cls:'tS',n:2,items:['ATS(채용관리)','HRIS·조직/보상']},
   {t:'Connector',sub:'시스템 연동',cls:'tC',n:4,items:['지원자 DB','메일','캘린더 API','메신저']},
   {t:'Policy',sub:'통제·권한',cls:'tP',n:3,items:['차별금지 정책','PII·개인정보','오퍼 승인 게이트(HITL)']},
  ];

  const COMPONENTS=[
   {type:'Agent',ty:'tyA',ic:'file-text',name:'이력서 파싱 Agent',L:'L5',desc:'이력서를 구조화해 경력·스킬·학력을 추출합니다.',when:'지원자 이력서가 접수되어 정규화가 필요할 때.',data:'이력서(PDF·DOCX·이미지), 직무 스킬 사전',how:'OCR·NLP로 경력·스킬·기간을 구조화 → 매칭 입력으로 정규화.'},
   {type:'Agent',ty:'tyA',ic:'gauge',name:'요건 매칭 Agent',L:'L3',desc:'JD 필수·우대 요건과 후보 역량을 대조합니다 (RAG).',when:'파싱 직후 후보를 직무에 매칭할 때.',data:'JD 요건, 파싱된 후보 역량, 스킬 온톨로지',how:'must/plus 요건과 역량을 의미 매칭 → 충족도(%)를 근거와 함께 산출.'},
   {type:'Agent',ty:'tyA',ic:'trending-up',name:'랭킹·스코어 Agent',L:'L3',desc:'루브릭 가중 점수로 후보를 랭킹합니다.',when:'매칭 후 후보 우선순위를 정할 때.',data:'매칭 결과, 평가 루브릭(가중치), 직무 기준',how:'5개 항목 가중 합산 → 종합점수·랭킹·근거 코멘트 생성.'},
   {type:'Agent',ty:'tyA',ic:'calendar',name:'면접 일정 조율 Agent',L:'L3',desc:'후보·면접관 가용을 교차해 면접 슬롯을 잡습니다.',when:'숏리스트 확정 후 면접을 잡아야 할 때.',data:'후보·면접관 캘린더, 패널 구성 규칙',how:'양측 캘린더 교차로 충돌 0 슬롯 산출 → 사람 확인 후 초대 작성.'},
   {type:'Agent',ty:'tyA',ic:'list',name:'평가 취합 Agent',L:'L3',desc:'면접 평가를 모아 합격·오퍼안을 정리합니다.',when:'면접이 끝나 합격 판단이 필요할 때.',data:'면접관 스코어카드, 직무 기준, 보상밴드',how:'평가 취합·정합성 점검 → 합격 후보·오퍼 패키지 초안 생성.'},
   {type:'Agent',ty:'tyA',ic:'mail',name:'후보 커뮤니케이션 Agent',L:'L3',desc:'면접 안내·오퍼·불합격 통지를 작성합니다.',when:'후보에게 안내가 나가야 할 때.',data:'후보 상태, 안내 템플릿, 톤·정책 가이드',how:'단계별 템플릿·톤 가이드에 맞춰 안내 초안 생성(발송은 HITL 후).'},
   {type:'Module',ty:'tyM',ic:'file-text',name:'OCR·정규화 모듈',L:'L5',asset:1,desc:'비정형 이력서를 텍스트화·정규화합니다 (AI:ON-U).',when:'이력서가 이미지·비정형일 때 — 여러 Agent 공용.',data:'스캔 이력서, 표·양식, 첨부 문서',how:'OCR 디지털화 → 형식 정규화해 파싱 Agent에 공급.'},
   {type:'Module',ty:'tyM',ic:'shield-check',name:'편향 점검 모듈',L:'L6',asset:1,desc:'스코어링에 보호속성이 반영됐는지 점검합니다 (Antbot).',when:'매칭·랭킹 산출 직후 사람 제시 전.',data:'보호속성 목록, 스코어 근거, 차별금지 규칙',how:'근거가 요건 기반인지 검증 → 보호속성 영향 시 차단·재산출 요청.'},
   {type:'Module',ty:'tyM',ic:'gauge',name:'보상밴드 검증 모듈',L:'L7',desc:'오퍼 금액을 보상밴드·형평에 결정론적으로 검증합니다.',when:'오퍼안 산출 직전.',data:'직급 보상밴드, 사내 처우 분포, 헤드카운트',how:'밴드·형평·헤드카운트 규칙 점검 → 적정 여부·근거 산출.'},
   {type:'기존 솔루션',ty:'tyS',ic:'briefcase',name:'ATS (채용관리)',L:'L5',desc:'사내 채용관리 시스템을 연동합니다 (Integrate).',when:'지원자·파이프라인 단계 조회·갱신이 필요할 때.',data:'지원자 DB, 채용 공고, 파이프라인 단계',how:'기존 ATS 연동 — 후보 조회·단계 쓰기 호출(새로 만들지 않음).'},
   {type:'기존 솔루션',ty:'tyS',ic:'database',name:'HRIS · 조직/보상',L:'L8',desc:'인사정보·조직/보상 시스템을 연동합니다.',when:'보상밴드·헤드카운트·온보딩 처리가 필요할 때.',data:'보상밴드, 조직도, 헤드카운트, 온보딩 워크플로',how:'기존 HRIS 연동 — 밴드 조회·온보딩 작업 등록.'},
   {type:'Connector',ty:'tyC',ic:'briefcase',name:'지원자·캘린더 Connector',L:'L5',desc:'지원자 DB·캘린더·메일을 안전하게 연결합니다.',when:'외부 시스템에서 읽거나 쓸 때(권한 범위).',data:'지원자 API, 캘린더 API, 메일 API, 권한 토큰',how:'표준 커넥터로 권한 범위 안에서 조회·발송 중개.'},
   {type:'Policy',ty:'tyP',ic:'shield',name:'차별금지·오퍼 정책',L:'L7',desc:'보호속성 평가·밴드 초과·오퍼 발송 시 자동 실행을 막고 승인을 요구합니다.',when:'스코어링·오퍼 등 책임 지점.',data:'차별금지 규정, 보상밴드, 승인 권한 매트릭스',how:'책임 행동 감지 → 자동 차단 후 HITL 게이트로 보류.'},
   {type:'Policy',ty:'tyP',ic:'shield-check',name:'개인정보(PII) 정책',L:'L7',desc:'이력서·기록의 개인정보 노출을 점검·마스킹합니다.',when:'파싱·공유·기록 전.',data:'PII 패턴, 마스킹 규칙, 보존 정책',how:'PII 탐지 → 마스킹/차단 라벨을 정책 엔진에 전달.'},
   {type:'Agent',ty:'tyA',ic:'sparkles',name:'지식 자산화 Agent',L:'L7',asset:1,desc:'채용 패턴을 축적해 다음 포지션 매칭 정확도를 높입니다 (Self-Improving).',when:'채용 마무리 후 결과를 학습으로 되먹임할 때.',data:'직무·요건·합격자 프로필, 면접 결과, 피드백',how:'패턴 정규화 → 지식베이스·매칭 기준 개선 데이터로 축적.'},
  ];

  const WORKLOAD={
    request:'"백엔드 개발자 2명을 4~8년차로 충원해줘. 이력서 1차 스크리닝이랑 면접 일정까지 정리해줘."',
    type:'채용 스크리닝·코디네이션', purpose:'요건 정의 · 1차 스크리닝 · 면접 조율 · 오퍼',
    outputs:['직무 기술서(JD)','스크리닝 리포트','후보 비교표','면접 일정','오퍼 패키지'],
    gates:'숏리스트 기준 승인 · 면접 일정 확인 · 합격·오퍼 승인 (책임이 걸린 곳만 담당자 확인 · HITL 3회)',
  };
  const PLAN_PRODUCES={request:[],understand:['JD 초안'],compose:['실행 구조(계획안)'],approve:['스크리닝 계획','숏리스트 컷 후보 3안'],prepare:['스크리닝 리포트·스코어카드·후보 비교표'],meeting:['면접 일정'],commit:['합격 판정·오퍼 패키지'],share:['오퍼 발송·ATS 기록·학습 자산']};
  const GATES=['★ HITL ① 숏리스트 기준(컷) 승인','★ HITL ② 면접 일정·패널 확인','★ HITL ③ 합격·오퍼 발송 승인'];
  const GOVERN=[
    {k:'Policy',v:'차별금지·보상밴드·PII 정책. 책임 지점은 <b>자동 실행 차단</b> 후 담당자 확인.'},
    {k:'Run Trace',v:'요건→파싱→매칭·랭킹→담당자 확인→오퍼를 <b>전 구간 기록</b>(채용 공정성·감사 대비).'},
    {k:'Evaluation',v:'매칭 정확도·편향 신호·요건 충족도를 <b>Antbot</b>이 평가.'},
    {k:'Skill Library',v:'직무 매칭 패턴·스코어 기준·면접 질문 세트를 <b>재사용 자산</b>으로 축적.'},
  ];

  /* =======================================================================
     SURFACE — 좌측 ATS(채용관리시스템) 화면 · 함수형 커스텀 렌더 (회의 리스킨 ✕)
     C = {S:STATE, R:RUN, idxOf, W, par, times, ex}
     ex(외부 제외) = approve 에서 '컷 좁힘' → 숏리스트 축소(meeting 의 ex 자리 재사용)
     ======================================================================= */
  const STAGES=[
    {k:'screened',ko:'스크리닝 통과'},
    {k:'shortlist',ko:'숏리스트'},
    {k:'interview',ko:'면접'},
    {k:'offer',ko:'오퍼'},
  ];
  /* 현재 단계(sel)에 따라 후보 파이프라인 단계가 어디까지 채워졌는지(결정론) */
  function reached(C,stageK){
    const i=C.idxOf(C.S.sel);
    /* prepare(=파싱·매칭·랭킹, idx 4) 완료부터 스크리닝/숏리스트 가시화, meeting(면접조율)부터 interview, commit(오퍼승인)부터 offer */
    if(stageK==='screened'||stageK==='shortlist')return i>=4;
    if(stageK==='interview')return i>=5;
    if(stageK==='offer')return i>=6;
    return false;
  }
  /* ex(좁은 컷)면 숏리스트에서 c3(리스크 보유) 제외 — '담당자 결정'이 화면에 반영됨 */
  function shortlistIds(C){ return C.ex?['c1','c2']:SHORTLIST; }
  /* 후보의 표시 단계(파이프라인 컬럼 배치) — 진행 상태·ex 반영 */
  function colOf(C,c){
    const i=C.idxOf(C.S.sel);
    if(i>=6 && c.id===OFFER.cid)return 'offer';
    if(i>=5 && shortlistIds(C).includes(c.id))return 'interview';
    if(shortlistIds(C).includes(c.id))return 'shortlist';
    return 'screened';
  }
  function candCard(c,compact){
    const sc=totalScore(c);
    return `<button class="recr-card${c.risk?' risk':''}" data-dlv="compare">
      <div class="rc-top"><span class="recr-av">${c.ini}</span><div class="rc-id"><div class="rc-nm">${c.name}</div><div class="rc-cur">${c.yrs}년 · ${c.cur}</div></div><span class="rc-mt">${c.match}%</span></div>
      ${compact?'':`<div class="rc-skills">${c.skills.slice(0,4).map(s=>`<span>${s}</span>`).join('')}</div>`}
      <div class="rc-foot"><span class="rc-sc">${I('gauge')}종합 ${sc}</span>${c.risk?`<span class="rc-rk">검토 신호</span>`:`<span class="rc-ok">적합</span>`}</div>
    </button>`;
  }

  function head(C){
    const S=C.S,i=C.idxOf(S.sel),w=C.W(S.sel);
    const map={request:['요건 접수','s-info','파이프라인'],understand:['요건 분석','s-info','파이프라인'],compose:['계획 구성','s-info','파이프라인'],
      approve:['검토 필요','s-amber','파이프라인'],prepare:['스크리닝 완료','s-green','후보'],
      meeting:['일정 조율','s-blue','면접'],commit:['오퍼 검토','s-amber','후보'],share:['채용 완료','s-green','후보']};
    const [stt,stc,tab]=map[w.id];
    const known=i>=2; /* understand 부터 JD 확정 */
    const meta=`${JOB.id} · ${JOB.team} · ${known?`${JOB.headcount}명 채용 · 지원 ${JOB.applicants}`:'요건 정의 중'}`;
    const tabs=['파이프라인','후보','스코어카드','면접'].map(t=>`<span class="${t===tab?'on':''}">${t}</span>`).join('');
    return `<div class="hd-top"><span class="hd-ic">${I('briefcase')}</span>
       <div class="hd-main"><div class="hd-title">${JOB.title} <span class="hd-status ${stc}">${stt}</span></div>
       <div class="hd-meta">${meta}</div></div>
       <div class="hd-user">채용담당 한지원${I('chevron-down')}</div></div>
     <div class="hd-tabs">${tabs}<span class="hd-replay" id="replay">${I('rotate-ccw')}다시</span></div>`;
  }

  /* 파이프라인 보드(ATS) — 직무 슬롯 ↔ 단계별 후보 카드 */
  function board(C){
    const sids=shortlistIds(C);
    let cols=STAGES.map(st=>{
      const on=reached(C,st.k);
      const cards=on?CAND.filter(c=>colOf(C,c)===st.k):[];
      const n=on?cards.length:0;
      return `<div class="recr-col${on?'':' off'}">
        <div class="rcol-h"><span class="rcol-t">${st.ko}</span><span class="rcol-n">${on?n:'·'}</span></div>
        <div class="rcol-body">${on?(cards.length?cards.map(c=>candCard(c,true)).join(''):'<div class="rcol-empty">—</div>'):'<div class="rcol-empty">준비 전</div>'}</div>
      </div>`;
    }).join('');
    return `<div class="recr-board">${cols}</div>`;
  }

  function base(C){
    const S=C.S,R=C.R,w=C.W(S.sel),id=w.id,working=R.phase==='working';
    const stMap={request:working?'채용 요청을 받고 있어요…':'요건 접수됨 · 분석 시작',understand:working?'AAP가 요건을 분석하고 있어요':'JD·요건 정리됨',
      compose:working?'AAP가 스크리닝 계획을 구성하고 있어요':'스크리닝 계획 준비됨',approve:working?'스크리닝 계획을 정리하고 있어요':'숏리스트 기준 확인 대기',
      prepare:working?'이력서를 파싱·매칭·랭킹하고 있어요':'스크리닝 완료',meeting:working?'면접 일정을 조율하고 있어요':'면접 일정 확인 대기',
      commit:working?'평가를 취합하고 있어요':'오퍼 승인 대기',share:working?'결과를 발송·기록하고 있어요':'채용 완료'};
    let b=`<div class="ws-status">${working?'<span class="spin"></span>':''}${stMap[id]}</div>`;
    if(id==='request'){
      b+=`<div class="ws-req">${WORKLOAD.request}</div><div class="ws-hint">AAP가 이력서 스크리닝·매칭·면접 조율까지 실행 구조를 짜서 처리합니다.</div>`;
      b+=jdStrip(C,false);
    } else if(id==='understand'){
      const done=!working;
      b+=`<div class="ws-overview ${done?'show':''}"><div class="ov-row"><span>직무</span><b>${JOB.title}</b></div><div class="ov-row"><span>인원</span><b>${JOB.headcount}명 · ${JOB.level}</b></div><div class="ov-row"><span>필수</span><b>${JOB.must.join(' · ')}</b></div><div class="ov-row"><span>우대</span><b>${JOB.plus.join(' · ')}</b></div></div>`;
      b+=jdStrip(C,true);
    } else if(id==='compose'){
      b+=C.par(['이력서 파싱','요건 매칭','랭킹·스코어','면접 일정']);
      b+=board(C);
    } else {
      if((id==='prepare'||id==='share'||id==='meeting')&&working) b+=C.par(id==='prepare'?['이력서 파싱(38)','요건 매칭','스코어·랭킹','편향 점검']:(id==='meeting'?['후보 가용 조회','면접관 가용','슬롯 매칭']:['오퍼 발송','ATS 기록','온보딩 등록']));
      b+=jdStrip(C,true);
      b+=board(C);
    }
    return b;
  }
  /* JD 요약 스트립(상단 직무 슬롯) — ATS 상단 직무 카드 */
  function jdStrip(C,known){
    return `<div class="recr-jd"><div class="rjd-l"><span class="rjd-ic">${I('briefcase')}</span><div><div class="rjd-t">${JOB.title}</div><div class="rjd-s">${known?`필수 ${JOB.must.length} · 우대 ${JOB.plus.length} · 평가 5항목`:'요건 정의 중'}</div></div></div>
      <div class="rjd-r"><span class="rjd-stat"><b>${JOB.headcount}</b>채용</span><span class="rjd-stat"><b>${C.idxOf(C.S.sel)>=4?JOB.screened:JOB.applicants}</b>${C.idxOf(C.S.sel)>=4?'통과':'지원'}</span><button class="wl-go" data-dlv="jd">JD 보기</button></div></div>`;
  }

  /* 스코어카드 미리보기(HITL/리뷰 내부에서 사용) */
  function scorecard(c){
    return `<div class="recr-sccard"><div class="rsc-h"><span class="recr-av">${c.ini}</span><div><div class="rsc-nm">${c.name} <span class="rsc-mt">매칭 ${c.match}%</span></div><div class="rsc-cur">${c.yrs}년 · ${c.cur} · ${c.edu}</div></div><span class="rsc-tot">${totalScore(c)}</span></div>
      <div class="rsc-resume">${c.resume}</div>
      <div class="rsc-rows">${RUBRIC.map((r,i)=>`<div class="rsc-row"><span class="rsc-k">${r.k}</span><span class="rsc-bar"><i style="width:${c.scores[i]*20}%"></i></span><span class="rsc-v">${c.scores[i]}.0</span></div>`).join('')}</div>
      ${c.risk?`<div class="rsc-risk">${I('alert-triangle')}${c.risk}</div>`:`<div class="rsc-hi">${c.hi}</div>`}</div>`;
  }

  /* kind: hitl | done | preview(코어 처리). meetingStart/Live 미사용. */
  function cmodal(kind,C){
    const S=C.S,sel=S.sel,ex=C.ex;
    if(kind==='hitl'){
      if(sel==='approve'){
        const times=C.times.map((t,i)=>`<button class="rv-time ${t.t===S.pickedTime?'sel':''}" data-time="${i}">${t.t.split(' · ')[0]}<span>${t.t.split(' · ')[1]||''}</span></button>`).join('');
        return `<div class="cmodal-h">숏리스트 기준을 확인해 주세요</div><div class="cmodal-sub">AAP가 스크리닝 계획과 컷 후보를 준비했어요. 숏리스트 기준(컷)은 직접 정하세요.</div>
          <div class="rv">
            <div class="rv-sec"><div class="rv-k">스크리닝 계획<button class="rv-more" data-dlv="report">리포트 보기</button></div><div class="rv-sum">이력서 ${JOB.applicants}건 파싱 → must/plus 매칭 → 루브릭 5항목 스코어링 (편향·PII 점검 포함)</div></div>
            <div class="rv-sec"><div class="rv-k">숏리스트 기준 (컷) <span class="rv-hint">하나를 선택하세요</span></div><div class="rv-times">${times}</div></div>
            <div class="rv-sec"><div class="rv-k">미리 본 상위 후보<button class="rv-more" data-dlv="compare">비교표 보기</button></div><div class="rv-sum">정유진 94% · 이하늘 91% · 박서준 88% — <b>match ≥ 85 기준 3명</b></div></div>
          </div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-yes>이 기준으로 스크리닝</button><button class="cp-btn ghost" data-no>컷 좁히기(≥90)</button></div>`;
      }
      if(sel==='meeting'){
        return `<div class="cmodal-h">면접 일정을 확인해 주세요</div><div class="cmodal-sub">AAP가 후보·면접관 캘린더를 교차해 충돌 0 슬롯을 잡았어요. 일정·패널을 확인하세요.</div>
          <div class="rv">
            ${INTERVIEW.filter(iv=>shortlistIds(C).includes(iv.cid)).map(iv=>{const c=cById(iv.cid);return `<div class="rv-sec"><div class="rv-k"><span class="recr-av sm">${c.ini}</span>${c.name} · ${iv.type}</div><div class="rv-sum">${iv.slot} · 패널 ${iv.panel}</div></div>`;}).join('')}
            <div class="rv-sec"><div class="rv-k">조율 결과<button class="rv-more" data-dlv="schedule">일정 보기</button></div><div class="rv-sum">충돌 0 · 후보 안내 발송 대기</div></div>
          </div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-yes>일정 확정·안내 발송</button><button class="cp-btn ghost" data-no>일정 조정 요청</button></div>`;
      }
      if(sel==='commit'){
        const c=cById(OFFER.cid);
        return `<div class="cmodal-h">합격·오퍼를 승인할까요?</div><div class="cmodal-sub">후보에게 나가는 마지막 단계예요. 합격 후보·오퍼 처우를 확인하세요.</div>
          ${scorecard(c)}
          <div class="rv" style="margin-top:10px">
            <div class="rv-sec"><div class="rv-k">오퍼 패키지<button class="rv-more" data-dlv="offer">오퍼 보기</button></div><div class="rv-sum">기본급 ${ex?'6,800만':OFFER.base} · ${ex?'사이닝 없음':'사이닝 '+OFFER.sign} · ${OFFER.band}</div></div>
            <div class="rv-sec"><div class="rv-k">점검</div><div class="rv-sum">보상밴드 내 · 헤드카운트 승인 범위 · 차별금지 통과</div></div>
          </div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-yes>승인·오퍼 발송</button><button class="cp-btn ghost" data-no>처우 하향(밴드 하한)</button></div>`;
      }
    }
    if(kind==='done'){
      if(sel==='prepare'){
        const top=CAND.slice(0,3);
        return `<button class="cmodal-x" data-close>${I('x')}</button><div class="cmodal-h done">스크리닝이 끝났어요 <span class="cp-check">${I('check')}</span></div>
          <div class="mtcard"><div class="mt-row"><span class="mt-ic">${I('briefcase')}</span><div><div class="mt-title">${JOB.title}</div><div class="mt-when">지원 ${JOB.applicants} → 통과 ${JOB.screened}명 · 스코어카드 생성</div></div></div>
          <div class="recr-mini">${top.map(c=>`<div class="rm-r"><span class="recr-av sm">${c.ini}</span><span class="rm-nm">${c.name}</span><span class="rm-mt">${c.match}%</span><span class="rm-sc">${totalScore(c)}</span></div>`).join('')}</div>
          <div class="mt-foot">${I('check')} 편향·PII 점검 통과 · 스크리닝 리포트·후보 비교표 생성 <button class="wl-go" data-dlv="compare" style="margin-left:6px">비교표</button></div></div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-close>확인</button></div>`;
      }
      if(sel==='share'){
        const c=cById(OFFER.cid);
        return `<button class="cmodal-x" data-close>${I('x')}</button><div class="cmodal-h done">채용 처리 완료 <span class="cp-check">${I('check')}</span></div>
          <div class="done-list"><div class="dn-row"><span class="dn-ic">${I('award')}</span>${c.name} 합격 — 오퍼 레터 발송</div>
          <div class="dn-row"><span class="dn-ic">${I('mail')}</span>면접 후보 안내·불합격 정중 통지 발송</div>
          <div class="dn-row"><span class="dn-ic">${I('briefcase')}</span>ATS 단계 갱신 · 온보딩 작업 등록 <button class="wl-go" data-dlv="offer" style="margin-left:6px">오퍼</button></div></div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-close>확인</button></div>`;
      }
    }
    return '';
  }

  /* 데모용 시드 케이스(인스턴스) — 서로 다른 진행 상태 */
  const SEEDS=[
    {title:'백엔드 개발자 2명 채용', customer:'플랫폼개발팀 · JD-2041', icon:'💼', request:WORKLOAD.request, atStep:'approve'},
    {title:'프로덕트 디자이너 채용', customer:'디자인팀 · JD-2052', icon:'💼', request:'"프로덕트 디자이너 1명 채용해줘. 포트폴리오 1차 스크리닝부터."', atStep:'request'},
    {title:'데이터 분석가 채용 마감', customer:'데이터팀 · JD-2030', icon:'💼', request:'"데이터 분석가 1명, 오퍼까지 진행해줘."', status:'done'},
  ];

  (window.AAP_PACKS=window.AAP_PACKS||{}).recruiting={
    id:'recruiting', label:'채용',
    times:TIMES, products:PRODUCTS, work:WORK, components:COMPONENTS, compose:COMPOSE,
    workload:WORKLOAD, planProduces:PLAN_PRODUCES, gates:GATES, govern:GOVERN, seeds:SEEDS,
    stepLoop:{request:'Data',understand:'Semantic',compose:'Reasoning',approve:'Decision',prepare:'Action',meeting:'Decision',commit:'Decision',share:'Learning'},
    extExcluded:(S)=>S.decisions['approve']==='no',
    /* (b) 함수형 surface — ATS 화면을 코어 generic 렌더 대신 이 팩이 직접 그린다 */
    surface:{head, base, cmodal},
  };
})();
