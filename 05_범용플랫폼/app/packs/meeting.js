/* =========================================================================
   AAP Domain Pack — 회의 (meeting)
   window.AAP_PACK 으로 코어에 적재. 데이터 + 좌측 '고객 서비스 화면' 렌더러.
   (코어=셸·실행엔진·우측 8계층·구성/관리 뷰 / 팩=이 파일)
   ========================================================================= */
(function(){
  const odTable=(title,rows)=>`<div class="op-detail"><div class="od-title">${title}</div>${rows.map(r=>`<div class="od-row"><span class="od-k">${r[0]}</span><span class="od-v ${r[2]||''}">${r[1]}</span></div>`).join('')}</div>`;

  /* 회의 시각 후보 */
  const TIMES=[
    {t:'6/24 (화) 14:00–15:30',s:'가용 7/7 · A동 301'},
    {t:'6/25 (수) 10:00–11:30',s:'가용 6/7 · 회의실 B'},
    {t:'6/26 (목) 15:00–16:30',s:'가용 7/7 · 회의실 C'},
  ];

  /* 산출물 미리보기(모달). body/sub 가 함수면 컨텍스트 C 를 받음 */
  const PRODUCTS={
    parts:{ic:'👥',title:'참석자',sub:(C)=>`킥오프 회의 · ${C.ex?5:6}명`,body:(C)=>`<div class="dlv">
      <div class="dlv-sec">필수 참석자 · 5</div>
      <div class="row"><span class="av">김</span><div><div class="nm">김영업 · 영업대표</div><div class="why">대한제조 영업 총괄 · 고객 메일 8건 참여</div></div><span class="tag ok">참석</span></div>
      <div class="row"><span class="av">박</span><div><div class="nm">박지훈 · 프로젝트 매니저</div><div class="why">후속 제안 범위 담당</div></div><span class="tag ok">참석</span></div>
      <div class="row"><span class="av">이</span><div><div class="nm">이수민 · 솔루션 아키텍트</div><div class="why">4-2 아키텍처 자료 작성자</div></div><span class="tag ok">참석</span></div>
      <div class="row"><span class="av">최</span><div><div class="nm">최도현 · 데이터 리드</div><div class="why">데이터 연계 질의 담당</div></div><span class="tag ok">참석</span></div>
      <div class="row"><span class="av">정</span><div><div class="nm">정하은 · 보안 담당</div><div class="why">보안 검토 질의 수신자</div></div><span class="tag ok">참석</span></div>
      <div class="dlv-sec">외부 참석자 · ${C.ex?'제외':'포함'}</div>
      <div class="row"><span class="av">D</span><div><div class="nm">고객 DX팀장 · IT기획</div><div class="why">${C.ex?'담당자 결정으로 이번엔 제외':'계획 승인 시 초대 확인'}</div></div><span class="tag ${C.ex?'no':'warn'}">${C.ex?'제외':'초대'}</span></div></div>`},
    docs:{ic:'📎',title:'공유 자료',sub:'사전 배포 · 4건',body:`<div class="dlv">
      <div class="row"><span class="av">📄</span><div><div class="nm">AAP 선제안 자료 v3.2.pdf</div><div class="why">이전 회의 고객 재요청 · 민감도 2등급</div></div><span class="tag ok">공유</span></div>
      <div class="row"><span class="av">📄</span><div><div class="nm">AAP 4-2 아키텍처 설명.pdf</div><div class="why">고객 IT기획 질의 관련</div></div><span class="tag ok">공유</span></div>
      <div class="row"><span class="av">📄</span><div><div class="nm">2024-06-10 미팅 회의록.docx</div><div class="why">후속 맥락 연결 · 민감도 1등급</div></div><span class="tag ok">공유</span></div>
      <div class="row"><span class="av">🔒</span><div><div class="nm">내부 아키텍처 상세 설계.pptx</div><div class="why">보안 검토사항 포함 → 마스킹</div></div><span class="tag block">제한</span></div></div>`},
    invite:{ic:'✉️',title:'회의 초대장',sub:'발송 준비됨',body:(C)=>`<div class="doc"><h5>[초대] AAP 고객사 킥오프 회의</h5>
      <div class="drow"><span class="dk">일시</span><b>${C.S.pickedTime}</b></div>
      <div class="drow"><span class="dk">장소</span>A동 301 · 화상 meet.company.com/aap-kickoff</div>
      <div class="drow"><span class="dk">참석</span>김영업·박지훈·이수민·최도현·정하은${C.ex?'':' · 외부 DX팀장'}</div>
      <div class="drow"><span class="dk">안건</span>착수 범위·역할·일정·보안 조건 (6항)</div>
      <div class="drow"><span class="dk">첨부</span>선제안 자료 v3.2 · 4-2 아키텍처 · Q&A</div></div>`},
    agenda:{ic:'📋',title:'안건',sub:'킥오프 · 6항',body:`<div class="doc"><h5>킥오프 회의 안건</h5>
      <div class="drow"><span class="dk">1</span>목적 확인 — 착수 범위·기대 산출물</div>
      <div class="drow"><span class="dk">2</span>적용 후보 업무 — 우선순위</div>
      <div class="drow"><span class="dk">3</span>데이터·시스템 연계 범위</div>
      <div class="drow"><span class="dk">4</span>아키텍처 매핑 (4-2)</div>
      <div class="drow"><span class="dk">5</span>보안 조건 · 공유 기준</div>
      <div class="drow"><span class="dk">6</span>다음 액션 · 일정</div></div>`},
    minutes:{ic:'🗒️',title:'회의록 (초안)',sub:'결정 3 · 후속 3',body:`<div class="doc"><h5>AAP 고객사 킥오프 회의록</h5>
      <div class="dl">결정사항</div>
      <div class="drow">1 · 1차 데모 = 킥오프 준비·운영 시나리오</div>
      <div class="drow">2 · 연계 우선 = 캘린더·문서함·그룹웨어</div>
      <div class="drow">3 · 보안 = 외부 공유·권한 기준부터</div>
      <div class="dl">후속 할 일</div>
      <div class="drow">· 고객 IT기획 — 그룹웨어 API 목록 / 6·28</div>
      <div class="drow">· KT DS AI — 데모 초안 / 7·2</div>
      <div class="drow">· 보안 담당 — 공유 기준 / 6·30</div></div>`},
    action:{ic:'✅',title:'후속 할 일',sub:'3건 · 담당·기한',body:`<div class="dlv">
      <div class="row"><div style="flex:1"><div class="nm">1차 데모 = 킥오프 준비 시나리오</div><div class="why">담당 · KT DS AI</div></div><span class="tag ok">7·2</span></div>
      <div class="row"><div style="flex:1"><div class="nm">그룹웨어 API 목록 공유</div><div class="why">담당 · 고객 IT기획</div></div><span class="tag warn">6·28</span></div>
      <div class="row"><div style="flex:1"><div class="nm">외부 공유 기준 정리</div><div class="why">담당 · 보안</div></div><span class="tag warn">6·30</span></div></div>`},
  };

  /* ===== WORK — 8단계 (표준 런타임 문법에 매핑 · ops/detail = 회의 내용) ===== */
  const WORK=[
   {id:'request',label:'요청 접수',role:'사람 요청',actor:'human',
    explain:`회의 요청은 추론 루프의 시작입니다. <b>L1 경험·접근</b>(챗 UI)이 담당자의 한 줄 요청을 접수하고, <b>L4 지식·시맨틱</b>이 핵심 신호를 추출해 아직 정해지지 않은 정보를 식별합니다.`,
    ops:[{g:0,feed:'회의 요청 수신',out:'"다음주 AAP 고객사 킥오프 잡아줘"',L:'L1',comp:'코파일럿·챗 UI'},
     {g:1,feed:'핵심 신호 추출',out:'다음주·고객사·킥오프·관련 부서·제안 자료',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('추출된 신호',[['시점','다음 주'],['상대','AAP 고객사(대한제조)'],['유형 단서','킥오프'],['요구','참석자·일정·자료']])},
     {g:2,feed:'정해진 것/빈 것 구분',out:'참석자·일시·공유 승인 미정',L:'L4',comp:'컨텍스트 조합·근거',
      detail:odTable('미정 항목',[['참석자','미정','a'],['일시','미정','a'],['공유 자료 승인','미정','a'],['회의 목적','추정됨']])}]},

   {id:'understand',label:'업무 이해',role:'AAP 분석',actor:'aap',
    explain:`업무 이해는 추론 루프 <b>Semantic</b> 단계입니다. <b>L4</b>가 "킥오프"를 업무 유형으로 해석해 목적·산출물을 정의하고, <b>L7</b>이 외부 공유 정책을 답니다. AAP가 자율 수행합니다.`,
    ops:[{g:0,feed:'회의 유형 분류',out:'킥오프 회의',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('유형 후보 (신뢰도)',[['킥오프 회의','0.92','g'],['정기 점검','0.05'],['제안 발표','0.03']])},
     {g:1,feed:'목적·산출물 정의',out:'착수 범위·역할·일정·보안 / 참석자·자료·안건·회의록·후속',L:'L4',comp:'컨텍스트 조합·근거'},
     {g:2,feed:'외부 공유 정책 확인',out:'외부 고객 포함 → 공유 승인 필요',L:'L7',comp:'정책 관리·통제',
      detail:odTable('정책 점검',[['외부 참석','감지됨','a'],['자료 외부 공유','승인 필요','a'],['적용 정책','외부 공유 정책 v2']])}]},

   {id:'compose',label:'실행 구조 구성',role:'AAP 구성',actor:'aap',
    explain:`핵심 단계입니다. AAP는 Agent를 많이 띄우는 게 아니라, 업무를 작업으로 분해하고 <b>L2 설계·개발</b>·<b>L3 코어</b>에서 필요한 <b>Agent·모듈·기존 솔루션·Connector·정책</b>을 골라 운영 가능한 실행 구조로 조합합니다.`,
    ops:[{g:0,feed:'작업 분해',out:'참석자·일정·자료·안건·회의실 작업 그래프',L:'L2',comp:'설계·개발 환경',
      detail:odTable('작업 그래프 (5)',[['T1 참석자',''],['T2 일정·회의실',''],['T3 자료 수집',''],['T4 안건',''],['T5 반영·발송','']])},
     {g:1,feed:'데이터·근거 식별',out:'KMS·조직도·캘린더·메일 연결 대상',L:'L5',comp:'연결·수집'},
     {g:2,feed:'구성요소 배정·조합',out:'Agent 6 · Module 3 · 솔루션 2 · Connector 4 · Policy 3',L:'L3',comp:'코어·실행 엔진',micro:['Agent','Module','Solution','Connector','Policy'],
      detail:odTable('조합한 구성요소',[['Agent','6'],['Module','3'],['기존 솔루션','2'],['Connector','4'],['Policy','3']])},
     {g:3,feed:'누락·리스크 점검',out:'외부 초대·공유 리스크 표시',L:'L6',comp:'품질·근거 평가',asset:1,badge:'Antbot',
      detail:odTable('리스크 (Antbot)',[['외부 초대','검토 필요','a'],['자료 마스킹','1건','a'],['누락 Agent','없음','g']])}]},

   {id:'approve',label:'계획 승인',role:'사람 확인 ①',actor:'hitl',gate:1,hitl:1,
    explain:`<b>L3 런타임 게이트</b>가 실행 전 책임 지점을 멈춥니다. AAP가 계획안과 회의 시각 후보를 제시하고, 외부 초대·시각은 <b>사람이 결정</b>합니다. (★ HITL ①)`,
    ops:[{g:0,feed:'계획안 제시',out:'Agent·데이터·참석자·시각 후보 요약',L:'L1',comp:'코파일럿·챗 UI'},
     {g:1,feed:'회의 시각 후보 산출',out:'후보 3안 · 충돌 0',L:'L3',comp:'코어·실행 엔진',micro:['교집합','회의실 가용성'],
      detail:odTable('시각 후보 (가용)',[['6/24 14:00','7/7','g'],['6/25 10:00','6/7'],['6/26 15:00','7/7','g']])},
     {g:2,feed:'검토 게이트 보류',out:'계획 승인·시각 선택 담당자 전달',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'prepare',label:'준비 실행',role:'AAP 실행',actor:'aap',doneModal:1,
    explain:`승인된 계획대로 AAP가 Agent들을 자율 가동합니다. <b>L5</b>가 자료를 <b>병렬</b> 수집·OCR하고(<span class="v">AI:ON-U</span>), <b>L3 코어</b>가 참석자·일정·안건을 처리하며 <b>L7·L8</b>이 분류·반영합니다.`,
    ops:[{g:0,feed:'참석자 확정',out:'필수 5 · 외부 1',L:'L3',comp:'코어·실행 엔진'},
     {g:0,feed:'자료 수집·OCR',out:'메일 14 · 문서 6 · 정규화',L:'L5',comp:'연결·수집',asset:1,badge:'AI:ON-U',micro:['메일·문서함 커넥터'],
      detail:odTable('수집 결과',[['메일','14건'],['문서','6건'],['OCR 정규화','완료','g'],['중복 제거','3건']])},
     {g:0,feed:'회의실 예약',out:'A동 301 · ROOM-552',L:'L5',comp:'연결·수집',micro:['회의실 커넥터']},
     {g:1,feed:'자료 묶음 공유분류',out:'공유 3 · 제한 1 (마스킹)',L:'L7',comp:'정책 관리·통제',
      detail:odTable('공유 분류',[['선제안 v3.2','공유','g'],['4-2 아키텍처','공유','g'],['6/10 회의록','공유','g'],['상세 설계','제한·마스킹','r']])},
     {g:1,feed:'초대장·안건 초안',out:'초대장 발송 대기 · 안건 6항',L:'L3',comp:'코어·실행 엔진',micro:['논의 순서']},
     {g:2,feed:'캘린더·폴더·템플릿 반영',out:'CAL-3391 · 폴더 · 템플릿',L:'L8',comp:'스토리지·DB',micro:['calendar.create()','docs.folder()'],
      detail:odTable('시스템 반영',[['캘린더','CAL-3391','g'],['회의실','ROOM-552','g'],['자료 폴더','생성','g'],['회의록 템플릿','생성','g']])}]},

   {id:'meeting',label:'회의 진행',role:'사람 확인 ②',actor:'hitl',gate:1,meeting:1,
    explain:`회의가 진행됩니다. 담당자가 '시작/종료'를 직접 알려 실시간 Agent의 가동 시점을 통제합니다. <b>L5</b>가 발언을 수집하고 <b>L4·L3</b>가 결정·할 일을 실시간 정리합니다. (★ HITL ②)`,
    ops:[{g:0,feed:'발언·채팅 수집(STT)',out:'발언 23건',L:'L5',comp:'연결·수집',micro:['녹취·STT']},
     {g:1,feed:'결정·이슈 의미화',out:'결정 3 · 이슈 2',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('실시간 추출',[['결정','3건','g'],['이슈','2건','a'],['할 일 후보','3건']])},
     {g:2,feed:'회의록 실시간 정리',out:'결정·할 일 후보 추출',L:'L3',comp:'코어·실행 엔진',micro:['결정/의견 구분','액션 추출']}]},

   {id:'commit',label:'최종 승인',role:'사람 확인 ③',actor:'hitl',gate:1,hitl:1,
    explain:`외부로 나가는 마지막 행동 직전, <b>L7</b>이 수신자·민감정보를 점검하고 <b>L3 런타임 게이트</b>가 발송·기록을 멈춰 담당자 최종 확인을 받습니다. (★ HITL ③)`,
    ops:[{g:0,feed:'최종 산출물 취합',out:'회의록 · 액션아이템 · 후속',L:'L3',comp:'코어·실행 엔진'},
     {g:1,feed:'발송안·리스크 표시',out:'수신자·채널·민감정보 점검 통과',L:'L7',comp:'정책 관리·통제',
      detail:odTable('발송 점검',[['수신자','6명','g'],['외부 DX팀장','포함','a'],['민감정보','0건','g'],['마스킹 누락','없음','g']])},
     {g:2,feed:'발송 게이트 보류',out:'외부 발송·KMS 기록 승인 대기',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'share',label:'공유·기록',role:'AAP 마무리',actor:'aap',doneModal:1,
    explain:`승인 후 AAP가 결과를 <b>병렬</b> 전달·기록하고, 이번 패턴을 <b>L7 Self-Improving</b>으로 학습 자산화해 다음 회의 정확도를 높입니다. (추론 루프 <b>Learning</b>)`,
    ops:[{g:0,feed:'채널별 발송',out:'메일·메신저 발송',L:'L3',comp:'코어·실행 엔진',micro:['mail.send()'],
      detail:odTable('발송 결과',[['메일','6명 발송','g'],['메신저','3명 발송','g'],['실패','0','g']])},
     {g:0,feed:'KMS 기록',out:'KMS 페이지 등록·태깅',L:'L8',comp:'스토리지·DB',micro:['kms.write()']},
     {g:1,feed:'액션아이템 등록·리마인더',out:'할 일 3 · 마감 리마인더',L:'L3',comp:'코어·실행 엔진'},
     {g:2,feed:'학습 자산화',out:'재사용 패턴 저장 · 추천 개선',L:'L7',comp:'Self-Improving',asset:1,badge:'Self-Improving',
      detail:odTable('학습 자산',[['킥오프 준비 패턴','저장','g'],['참석자 추천 기준','갱신','g'],['다음 회의 적용','준비','g']])}]},
  ];

  const COMPOSE=[
   {t:'Agent',sub:'전문 작업',cls:'tA',n:6,items:['참석자 추천','자료 수집(RAG)','일정 조율','자료 패키지','안건 작성','회의록']},
   {t:'Module',sub:'재사용 기능',cls:'tM',n:3,items:['OCR·정규화 (AI:ON-U)','일정 충돌 검증','민감도 분류']},
   {t:'기존 솔루션',sub:'Buy·Integrate',cls:'tS',n:2,items:['그룹웨어 캘린더','사내 KMS·문서함']},
   {t:'Connector',sub:'시스템 연동',cls:'tC',n:4,items:['메일','문서함','조직도 DB','캘린더 API']},
   {t:'Policy',sub:'통제·권한',cls:'tP',n:3,items:['외부 공유 정책','PII·DLP','실행 승인 게이트(HITL)']},
  ];

  const COMPONENTS=[
   {type:'Agent',ty:'tyA',ic:'👥',name:'참석자 추천 Agent',L:'L3',desc:'회의 주제에 꼭 필요한 사람을 조직·역할 기준으로 추천합니다.',when:'주최자가 참석자를 특정하지 않았거나 필수 인원 누락이 의심될 때.',data:'인사·조직도, 역할(R&R) 매핑, 과거 참석 이력',how:'회의 목적을 조직도·역할·이력과 매칭 → 필수/선택/외부를 근거와 함께 추천.'},
   {type:'Agent',ty:'tyA',ic:'🔎',name:'자료 수집 Agent',L:'L5',desc:'KMS·과거 자료에서 회의 근거 자료를 찾아옵니다 (RAG).',when:'문서 작성·의사결정에 근거가 필요할 때.',data:'KMS 문서, 과거 제안서·회의록, 메일 첨부',how:'질의를 벡터 검색(RAG)으로 검색 → 관련도순 정렬·출처 제시.'},
   {type:'Agent',ty:'tyA',ic:'🗓️',name:'일정 조율 Agent',L:'L3',desc:'참석자 빈 시간을 찾아 시각 후보를 만들고 초대장을 작성합니다.',when:'회의를 열어야 할 때 가장 먼저.',data:'캘린더, 가용·근무시간, 회의실 가용, 초대장 템플릿',how:'일정 교차 비교로 후보 산출 → 사람이 선택 → 초대장 작성.'},
   {type:'Agent',ty:'tyA',ic:'📦',name:'자료 패키지 Agent',L:'L3',desc:'배포 자료를 민감도로 분류해 공유/제한으로 묶습니다.',when:'사전 자료를 외부 공유해야 할 때.',data:'수집 자료, 민감도·보안등급 정책, 마스킹 규칙',how:'민감도 분류 → 공유/제한·마스킹 후보 생성.'},
   {type:'Agent',ty:'tyA',ic:'📋',name:'안건 작성 Agent',L:'L3',desc:'회의 목적·고객 관심사로 안건 초안을 만듭니다.',when:'안건·논의 골격이 필요할 때.',data:'회의 유형 표준 안건, 이전 Q&A, 관심사',how:'표준 안건 의미화 + 이전 근거 결합 → 6항 안건 생성.'},
   {type:'Agent',ty:'tyA',ic:'🗒️',name:'회의록 Agent',L:'L3',desc:'회의 발언을 실시간 정리해 회의록·액션을 만듭니다.',when:'회의가 시작되어 발언이 발생할 때.',data:'STT 전사 텍스트, 안건, 참석자 R&R',how:'전사 텍스트를 안건·결정·미결·액션으로 구조화.'},
   {type:'Module',ty:'tyM',ic:'🔡',name:'OCR·정규화 모듈',L:'L5',asset:1,desc:'문서·이미지를 텍스트화·정규화합니다 (AI:ON-U).',when:'수집 자료가 비정형일 때 — 여러 Agent 공용.',data:'스캔 문서, 이미지 첨부, 표·양식',how:'OCR 디지털화 → 형식 정규화해 후속 Agent에 공급.'},
   {type:'Module',ty:'tyM',ic:'🧮',name:'일정 충돌 검증 모듈',L:'L6',desc:'후보 시각·회의실 충돌을 결정론적으로 검증합니다.',when:'후보 산출 직후 사람 제시 전.',data:'참석자 캘린더, 회의실 현황, 근무 규칙',how:'교집합·충돌 규칙 점검 → 충돌 0 후보만 통과.'},
   {type:'Module',ty:'tyM',ic:'🛡️',name:'민감도 분류 모듈',L:'L7',desc:'자료 민감도·보안등급을 분류합니다.',when:'외부로 나갈 자료를 묶기 전.',data:'보안등급 정책, 금칙 패턴, PII 규칙',how:'등급 분류 → 공유/제한/마스킹 라벨을 정책 엔진에 전달.'},
   {type:'기존 솔루션',ty:'tyS',ic:'🗓️',name:'그룹웨어 캘린더',L:'L5',desc:'사내 그룹웨어 캘린더를 연동합니다 (Integrate).',when:'가용 조회·회의 등록이 필요할 때.',data:'캘린더 API, 회의실 예약 시스템',how:'기존 솔루션 연동 — 새로 만들지 않고 조회·쓰기 호출.'},
   {type:'기존 솔루션',ty:'tyS',ic:'🗂️',name:'사내 KMS·문서함',L:'L8',desc:'사내 지식관리·문서함을 연동합니다.',when:'근거 조회·산출물 보관·자산화가 필요할 때.',data:'KMS 검색 인덱스, 문서함 폴더·권한',how:'기존 KMS 연동 — 검색 RAG·기록 분류 태깅.'},
   {type:'Connector',ty:'tyC',ic:'🔌',name:'메일·조직도 Connector',L:'L5',desc:'메일·조직도 DB를 안전하게 연결합니다.',when:'외부 시스템에서 읽거나 쓸 때(권한 범위).',data:'메일 API, 조직도 DB, 인증·권한 토큰',how:'표준 커넥터로 권한 범위 안에서 호출 중개.'},
   {type:'Policy',ty:'tyP',ic:'⚖️',name:'외부 공유·승인 정책',L:'L7',desc:'외부 발송·공유 시 자동 실행을 막고 승인을 요구합니다.',when:'외부 초대·공유·발송 등 책임 지점.',data:'공유 정책, 화이트리스트, 승인 권한 매트릭스',how:'책임 행동 감지 → 자동 차단 후 HITL 게이트로 보류.'},
   {type:'Policy',ty:'tyP',ic:'🧐',name:'품질 검증 정책',L:'L6',asset:1,desc:'산출물 충족도·일관성·누락을 검수합니다 (Antbot).',when:'산출물 생성 후 사람 검토·발송 전.',data:'원본 근거, 표준 체크리스트, 인용 출처',how:'근거 대조 → 오류·누락 점검·수정 제안.'},
   {type:'Agent',ty:'tyA',ic:'📚',name:'지식 자산화 Agent',L:'L7',asset:1,desc:'회의 패턴을 축적해 다음 회의 정확도를 높입니다 (Self-Improving).',when:'회의 마무리 후 결과를 학습으로 되먹임할 때.',data:'이번 회의 유형·요청·산출물, 사용자 피드백',how:'패턴 정규화 → 지식베이스·sLLM 학습 데이터로 축적.'},
  ];

  /* 구성 뷰 Workload Analysis */
  const WORKLOAD={
    request:'"다음 주 AAP 고객사 킥오프 회의 잡아줘. 참석자랑 일정, 자료까지 준비해줘."',
    type:'킥오프 회의 준비', purpose:'착수 범위·역할·일정·보안 조건 정리',
    outputs:['참석자','일정','자료 묶음','안건','회의록','후속 할 일'],
    gates:'계획 승인 · 회의 시작·종료 · 최종 발송 (책임이 걸린 곳만 담당자 확인 · HITL 3회)',
  };
  /* 구성 뷰 Execution Plan — 단계별 산출물 */
  const PLAN_PRODUCES={request:[],understand:[],compose:['실행 구조(계획안)'],approve:['참석자·자료·안건','회의 시각 후보 3안'],prepare:['초대장·회의실·캘린더 반영'],meeting:['회의록 초안'],commit:['회의록·후속 할 일'],share:['공유·KMS 기록·학습 자산']};
  const GATES=['★ HITL ① 계획 승인 · 회의 시각 선택','★ HITL ② 회의 시작·종료 신호','★ HITL ③ 최종 발송·기록 승인'];
  /* 관리 뷰 거버넌스 strip (플랫폼 기본을 회의 표현으로) */
  const GOVERN=[
    {k:'Policy',v:'외부 공유·접근 권한·실행 승인 정책. 책임 지점은 <b>자동 실행 차단</b> 후 담당자 확인.'},
    {k:'Run Trace',v:'입력→판단 근거→Tool 호출→담당자 확인→시스템 반영을 <b>전 구간 기록</b>.'},
    {k:'Evaluation',v:'근거 충족도·정책 위반·실행 성공률을 <b>Antbot</b>이 평가.'},
    {k:'Skill Library',v:'회의 준비 패턴·참석자 추천 기준·자료 묶음 기준을 <b>재사용 자산</b>으로 축적.'},
  ];

  /* =======================================================================
     SURFACE — 좌측 '고객이 보는 서비스 화면' (도메인 특화)
     C(컨텍스트) = {S:STATE, R:RUN, idxOf, W, par(parTrack), times, ex(외부제외 bool)}
     ======================================================================= */
  function head(C){
    const S=C.S, i=C.idxOf(S.sel), w=C.W(S.sel), ai=C.idxOf('approve'), ex=C.ex;
    const map={request:['요청 접수','s-info','개요'],understand:['준비 중','s-info','개요'],compose:['준비 중','s-info','개요'],
      approve:['검토 필요','s-amber','개요'],prepare:['준비 완료','s-green','개요'],
      meeting:[S.meetPhase==='done'?'회의 종료':'회의 중','s-blue','회의록'],commit:['공유 대기','s-amber','회의록'],share:['완료','s-green','회의록']};
    const [stt,stc,tab]=map[w.id];
    const known=i>=ai;
    const when=known?`${S.pickedTime} · A동 301`:'일정 미정';
    const avs=known?['김','박','이','최','정'].map(x=>`<span class="hd-av">${x}</span>`).join('')+(ex?'':'<span class="hd-av ext">D</span>'):'<span class="hd-av-none">참석자 구성 전</span>';
    const tabs=['개요','참석자','자료','회의록'].map(t=>`<span class="${t===tab?'on':''}">${t}</span>`).join('');
    return `<div class="hd-top"><span class="hd-ic">📅</span>
       <div class="hd-main"><div class="hd-title">AAP 고객사 킥오프 회의 <span class="hd-status ${stc}">${stt}</span></div>
       <div class="hd-meta">대한제조그룹 · ${when}</div></div>
       <div class="hd-avs">${avs}</div><div class="hd-user">홍길동 ▾</div></div>
     <div class="hd-tabs">${tabs}<span class="hd-replay" id="replay">↻ 다시</span></div>`;
  }

  function wsList(C){
    const S=C.S, i=C.idxOf(S.sel), ext=!C.ex;
    const rows=[
      {k:'참석자',ready:i>=3,v:`${ext?6:5}명`,dlv:'parts'},
      {k:'자료',ready:i>=3,v:'4건',dlv:'docs'},
      {k:'안건',ready:i>=3,v:'6항',dlv:'agenda'},
      {k:'초대장',ready:i>=4,v:'준비됨',dlv:'invite'},
      {k:'회의록',ready:i>=5,v:'초안',dlv:'minutes'},
    ];
    return `<div class="ws-list">`+rows.map(r=>`<div class="wl-row"><span class="wl-k">${r.k}</span>`+
      (r.ready?`<span class="wl-v">${r.v}</span><button class="wl-go" data-dlv="${r.dlv}">보기</button>`:`<span class="wl-na">준비 전</span>`)+`</div>`).join('')+`</div>`;
  }

  function base(C){
    const S=C.S,R=C.R, w=C.W(S.sel), id=w.id, working=R.phase==='working';
    const stMap={request:working?'요청을 받고 있어요…':'요청 접수됨 · 준비 시작',understand:working?'AAP가 회의를 이해하고 있어요':'회의 개요 정리됨',
      compose:working?'AAP가 회의 계획을 준비하고 있어요':'계획 초안 준비됨',approve:working?'계획을 정리하고 있어요':'계획 확인 대기',
      prepare:working?'회의를 준비하고 있어요':'회의 준비 완료',meeting:S.meetPhase==='done'?'회의 종료':(S.meetPhase==='await_start'?'회의 시작 대기':'회의 진행 중'),
      commit:working?'결과를 정리하고 있어요':'공유 확인 대기',share:working?'결과를 공유하고 있어요':'공유 완료'};
    let b=`<div class="ws-status">${working?'<span class="spin"></span>':''}${stMap[id]}</div>`;
    if(id==='request'){
      b+=`<div class="ws-req">"다음 주 AAP 고객사 킥오프 회의 잡아줘. 참석자랑 일정, 자료까지 준비해줘."</div><div class="ws-hint">AAP가 참석자·일정·자료를 모아 계획을 만들어 드려요.</div>`;
    } else if(id==='understand'){
      const done=!working;
      b+=`<div class="ws-overview ${done?'show':''}"><div class="ov-row"><span>유형</span><b>킥오프 회의</b></div><div class="ov-row"><span>목적</span><b>착수 범위·역할·일정·보안 조건 정리</b></div><div class="ov-row"><span>준비할 것</span><b>참석자 · 일정 · 자료 · 안건</b></div></div>`;
    } else if(id==='compose'){
      b+=C.par(['참석자 구성','자료 수집','일정 조율','안건 작성']);
    } else {
      if((id==='prepare'||id==='share')&&working) b+=C.par(id==='prepare'?['참석자 확정','자료 정리','회의실·캘린더','초대장']:['메일 발송','KMS 기록','후속 일정']);
      b+=wsList(C);
    }
    return b;
  }

  function review(forCommit,C){
    const ex=C.ex;
    if(!forCommit){
      const avatars=['김','박','이','최','정'].map(n=>`<span class="rv-av">${n}</span>`).join('')+(!ex?'<span class="rv-av ext">D</span>':'');
      const times=C.times.map((t,i)=>`<button class="rv-time ${t.t===C.S.pickedTime?'sel':''}" data-time="${i}">${t.t.split(' ').slice(0,2).join(' ')}<span>${t.t.split(' ').slice(2).join(' ')}</span></button>`).join('');
      return `<div class="rv">
        <div class="rv-sec"><div class="rv-k">참석자 ${!ex?6:5}<button class="rv-more" data-dlv="parts">모두 보기</button></div><div class="rv-avs">${avatars}</div>${!ex?'<div class="rv-extlb">+ 외부 고객 DX팀장 (초대 시 자료 공유 책임)</div>':''}</div>
        <div class="rv-sec"><div class="rv-k">회의 시각 <span class="rv-hint">하나를 선택하세요</span></div><div class="rv-times">${times}</div></div>
        <div class="rv-sec"><div class="rv-k">자료 · 안건</div><div class="rv-files"><button class="rv-file" data-dlv="docs">📎 공유 자료 4건</button><button class="rv-file" data-dlv="agenda">📋 안건 6항</button></div></div>
      </div>`;
    }
    return `<div class="rv">
      <div class="rv-sec"><div class="rv-k">회의록 (초안)<button class="rv-more" data-dlv="minutes">전체 보기</button></div><div class="rv-sum">결정 3 · 후속 할 일 3 · 리스크 1</div></div>
      <div class="rv-sec"><div class="rv-k">후속 할 일<button class="rv-more" data-dlv="action">보기</button></div><div class="rv-sum">3건 · 담당·기한 지정됨</div></div>
      <div class="rv-sec"><div class="rv-k">받는 사람</div><div class="rv-sum">참석자 ${ex?5:6}명${ex?'':' · <b>외부 DX팀장 포함</b>'}</div></div>
    </div>`;
  }

  /* kind: hitl | done | meetingStart | meetingLive (preview는 코어가 처리) */
  function cmodal(kind,C){
    const S=C.S, ex=C.ex, sel=S.sel;
    if(kind==='hitl'){
      if(sel==='approve') return `<div class="cmodal-h">회의 계획을 확인해 주세요</div><div class="cmodal-sub">AAP가 계획·시각 후보를 준비했어요. 외부 초대·시각은 직접 정하세요.</div>${review(false,C)}<div class="cmodal-actions"><button class="cp-btn primary" data-yes>이대로 준비할게요</button><button class="cp-btn ghost" data-no>외부 제외하고</button></div>`;
      if(sel==='commit') return `<div class="cmodal-h">회의 결과를 공유할까요?</div><div class="cmodal-sub">외부로 나가는 마지막 단계예요. 내용·받는 사람을 확인하세요.</div>${review(true,C)}<div class="cmodal-actions"><button class="cp-btn primary" data-yes>검토 후 공유하기</button><button class="cp-btn ghost" data-no>수정 요청</button></div>`;
    }
    if(kind==='done'){
      if(sel==='prepare') return `<button class="cmodal-x" data-close>×</button><div class="cmodal-h done">회의 준비가 끝났어요 <span class="cp-check">✓</span></div>
        <div class="mtcard"><div class="mt-row"><span class="mt-ic">📅</span><div><div class="mt-title">AAP 고객사 킥오프 회의</div><div class="mt-when">${S.pickedTime} · A동 301 · 화상</div></div></div>
        <div class="rv-sum" style="line-height:1.9">참석자 ${!ex?6:5}명 · 자료 4건 · 안건 6항 · 초대장 준비됨</div>
        <div class="mt-foot">✓ 캘린더 등록 (CAL-3391) · 회의실 ROOM-552 예약 완료</div></div>
        <div class="cmodal-actions"><button class="cp-btn primary" data-close>확인</button></div>`;
      if(sel==='share') return `<button class="cmodal-x" data-close>×</button><div class="cmodal-h done">공유 완료 <span class="cp-check">✓</span></div>
        <div class="done-list"><div class="dn-row"><span class="dn-ic">✉️</span>참석자 ${ex?5:6}명에게 회의록·후속 할 일 전달</div>
        <div class="dn-row"><span class="dn-ic">🗂️</span>KMS에 회의록 기록됨 <button class="wl-go" data-dlv="minutes" style="margin-left:6px">열기</button></div>
        <div class="dn-row"><span class="dn-ic">⏰</span>후속 일정·마감 리마인더 등록</div></div>
        <div class="cmodal-actions"><button class="cp-btn primary" data-close>확인</button></div>`;
    }
    if(kind==='meetingStart') return `<div class="cmodal-h">회의 진행</div><div class="meet-pre"><div class="mp-t">회의가 준비되었어요. 시작하면 녹취·회의록이 자동으로 작성됩니다.</div><button class="cp-btn primary lg" data-mstart>▶ 회의 시작</button></div>`;
    if(kind==='meetingLive'){
      const ended=S.meetPhase==='done';
      return `<div class="cmodal-h">${ended?'회의가 종료됐어요 <span class="cp-check">✓</span>':'회의 진행 중 <span class="live">● LIVE</span>'}</div>
        <div class="lm"><div class="lm-h"><span class="rec" ${ended?'style="background:#94a3b8;animation:none"':''}></span>${ended?'회의록 (정리됨)':'실시간 회의록'}</div>
        <div class="lm-line"><b>09:12</b> 박지훈 · 1차 데모는 킥오프 준비 시나리오로 합의</div>
        <div class="lm-line"><b>09:21</b> 최도현 · 연계 우선순위는 캘린더·문서함·그룹웨어</div>
        <div class="lm-line"><b>09:30</b> 정하은 · 외부 공유 기준부터 정리 필요</div>
        <div class="lm-tags">결정 3 · 할 일 3 · <button class="wl-go" data-dlv="minutes" style="margin-left:4px">회의록 보기</button></div></div>
        ${S.meetPhase==='await_end'?`<div class="cmodal-actions"><button class="cp-btn primary" data-mend>■ 회의 끝났습니다</button></div>`:''}`;
    }
    return '';
  }

  /* ===== SURFACE (선언형 surfaceSpec) ===== */
  const SS={
    icon:'📅', title:'AAP 고객사 킥오프 회의', customer:'대한제조그룹', owner:'홍길동',
    knownFrom:'approve', metaUnknown:'일정 미정', metaReady:(C)=>`${C.S.pickedTime} · A동 301`,
    avatars:['김','박','이','최','정'], avatarsExt:'D', avatarsEmpty:'참석자 구성 전',
    tabs:['개요','참석자','자료','회의록'], select:'회의 시각',
    status:{request:['요청 접수','s-info','개요'],understand:['준비 중','s-info','개요'],compose:['준비 중','s-info','개요'],approve:['검토 필요','s-amber','개요'],prepare:['준비 완료','s-green','개요'],meeting:(C)=>[C.S.meetPhase==='done'?'회의 종료':'회의 중','s-blue','회의록'],commit:['공유 대기','s-amber','회의록'],share:['완료','s-green','회의록']},
    perStep:{
      request:{mode:'request',work:'요청을 받고 있어요…',done:'요청 접수됨 · 준비 시작',text:'"다음 주 AAP 고객사 킥오프 회의 잡아줘. 참석자랑 일정, 자료까지 준비해줘."',hint:'AAP가 참석자·일정·자료를 모아 계획을 만들어 드려요.'},
      understand:{mode:'overview',work:'AAP가 회의를 이해하고 있어요',done:'회의 개요 정리됨',rows:[['유형','킥오프 회의'],['목적','착수 범위·역할·일정·보안 조건 정리'],['준비할 것','참석자 · 일정 · 자료 · 안건']]},
      compose:{mode:'track',work:'AAP가 회의 계획을 준비하고 있어요',done:'계획 초안 준비됨',track:['참석자 구성','자료 수집','일정 조율','안건 작성']},
      approve:{mode:'work',work:'계획을 정리하고 있어요',done:'계획 확인 대기'},
      prepare:{mode:'work',work:'회의를 준비하고 있어요',done:'회의 준비 완료',track:['참석자 확정','자료 정리','회의실·캘린더','초대장']},
      meeting:{mode:'work',work:'회의 진행 중',done:'회의 진행'},
      commit:{mode:'work',work:'결과를 정리하고 있어요',done:'공유 확인 대기'},
      share:{mode:'work',work:'결과를 공유하고 있어요',done:'공유 완료',track:['메일 발송','KMS 기록','후속 일정']},
    },
    ws:[{k:'참석자',from:3,v:(C)=>`${C.ex?5:6}명`,dlv:'parts'},{k:'자료',from:3,v:'4건',dlv:'docs'},{k:'안건',from:3,v:'6항',dlv:'agenda'},{k:'초대장',from:4,v:'준비됨',dlv:'invite'},{k:'회의록',from:5,v:'초안',dlv:'minutes'}],
    hitl:{
      approve:{title:'회의 계획을 확인해 주세요',sub:'AAP가 계획·시각 후보를 준비했어요. 외부 초대·시각은 직접 정하세요.',yes:'이대로 준비할게요',no:'외부 제외하고',avatars:['김','박','이','최','정'],avatarsExt:'D',avatarsLabel:(C)=>`참석자 ${C.ex?5:6}`,avatarsMore:'parts',extLabel:'+ 외부 고객 DX팀장 (초대 시 자료 공유 책임)',showSelect:true,files:[{label:'📎 공유 자료 4건',dlv:'docs'},{label:'📋 안건 6항',dlv:'agenda'}]},
      commit:{title:'회의 결과를 공유할까요?',sub:'외부로 나가는 마지막 단계예요. 내용·받는 사람을 확인하세요.',yes:'검토 후 공유하기',no:'수정 요청',rows:[{k:'회의록 (초안)',v:'결정 3 · 후속 할 일 3 · 리스크 1',dlv:'minutes'},{k:'후속 할 일',v:'3건 · 담당·기한 지정됨',dlv:'action'},{k:'받는 사람',v:(C)=>`참석자 ${C.ex?5:6}명${C.ex?'':' · 외부 DX팀장 포함'}`}]},
    },
    done:{
      prepare:{title:'회의 준비가 끝났어요',card:{title:'AAP 고객사 킥오프 회의',ic:'📅',when:(C)=>`${C.S.pickedTime} · A동 301 · 화상`,summary:(C)=>`참석자 ${C.ex?5:6}명 · 자료 4건 · 안건 6항 · 초대장 준비됨`,foot:'✓ 캘린더 등록 (CAL-3391) · 회의실 ROOM-552 예약 완료'}},
      share:{title:'공유 완료',lines:[{ic:'✉️',t:(C)=>`참석자 ${C.ex?5:6}명에게 회의록·후속 할 일 전달`},{ic:'🗂️',t:'KMS에 회의록 기록됨',dlv:'minutes'},{ic:'⏰',t:'후속 일정·마감 리마인더 등록'}]},
    },
    meeting:{startTitle:'회의 진행',start:{text:'회의가 준비되었어요. 시작하면 녹취·회의록이 자동으로 작성됩니다.',btn:'▶ 회의 시작'},
      live:{title:'회의 진행 중',endedTitle:'회의가 종료됐어요',rec:'실시간 회의록',recEnded:'회의록 (정리됨)',
        lines:[{time:'09:12',t:'박지훈 · 1차 데모는 킥오프 준비 시나리오로 합의'},{time:'09:21',t:'최도현 · 연계 우선순위는 캘린더·문서함·그룹웨어'},{time:'09:30',t:'정하은 · 외부 공유 기준부터 정리 필요'}],
        tags:'결정 3 · 할 일 3 ·',tagsDlv:'minutes',endBtn:'■ 회의 끝났습니다'}},
  };

  (window.AAP_PACKS=window.AAP_PACKS||{}).meeting={
    id:'meeting', label:'회의',
    times:TIMES, products:PRODUCTS, work:WORK, components:COMPONENTS, compose:COMPOSE,
    workload:WORKLOAD, planProduces:PLAN_PRODUCES, gates:GATES, govern:GOVERN,
    stepLoop:{request:'Data',understand:'Semantic',compose:'Reasoning',approve:'Decision',prepare:'Action',meeting:'Reasoning',commit:'Decision',share:'Learning'},
    extExcluded:(S)=>S.decisions['approve']==='no',
    surfaceSpec:SS,
  };
})();
