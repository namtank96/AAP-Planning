/* =========================================================================
   AAP Auto-Authoring — 업무 소스를 스스로 분해(RFP→WBS식)해 Domain Pack 생성
   소스(업무 설명) → 분석 파이프라인(의미화·WBS·역할·데이터·HITL·산출물) → 선언형 Pack
   → window.AAP_CORE.register/load 로 플랫폼에 즉시 로드·실행 (코드 ✕ 데이터만 생성).
   ※ 데모: LLM 백엔드 없이 결정론적으로 시연(소스 1종 → 검증된 타깃 Pack).
   ========================================================================= */
(function(){
  if(!window.AAP_CORE)return;
  const od=(t,r)=>`<div class="op-detail"><div class="od-title">${t}</div>${r.map(x=>`<div class="od-row"><span class="od-k">${x[0]}</span><span class="od-v ${x[2]||''}">${x[1]}</span></div>`).join('')}</div>`;

  /* ---- 분석 파이프라인 (화면에 보이는 breakdown 단계) ---- */
  const PIPE=[
    {t:'업무 의미화',     d:'요청·문서에서 업무 유형·목적·필요 산출물 파악',          show:'workload'},
    {t:'작업 분해 (WBS)', d:'운영 가능한 실행 단계로 분해',                          show:'work'},
    {t:'역할·구성요소 매핑', d:'Agent·Module·기존 솔루션·Connector·정책 식별·배정',    show:'compose'},
    {t:'데이터·시스템 식별', d:'연결 대상·근거 데이터 파악',                          show:'data'},
    {t:'책임 지점(HITL) 식별', d:'되돌리기 어렵거나 책임이 걸린 지점 표시',            show:'gates'},
    {t:'산출물 정의',     d:'각 단계가 만들 산출물 정의',                            show:'products'},
    {t:'Domain Pack 생성·기억', d:'표준 스키마로 패키징 → 재사용 자산으로 저장',       show:'done'},
  ];

  /* ---- 예시 소스 → 생성 타깃 Pack ---- */
  const SOURCES={
    quality:{ label:'제조 품질 이슈 대응', icon:'🏭',
      src:`[업무 설명]\n대한정밀 2라인에서 가공 부품 치수 불량(공차 초과)이 반복 발생.\n현장에서 불량이 접수되면 원인을 분석하고(설비/공정/자재), 출하 보류 여부와 조치 수준을 정해\n작업지시를 내리고 QMS에 기록해야 함. 안전·출하에 영향이 커 책임자 승인이 필요.\n반복 불량은 패턴으로 축적해 재발을 줄이고 싶음.`,
      build:buildQuality },
    custom:{ label:'직접 입력', icon:'✍️', editable:1,
      src:`신규 거래처 등록 심사 업무.\n영업이 등록을 요청하면 사업자·신용·제재 리스트를 확인하고 리스크를 판단해\n등록 승인 여부를 정하고, 승인 시 ERP에 등록하고 영업에 통지한다.\n고액·고위험 건은 책임자 승인이 필요하고, 반복 패턴은 기준으로 축적하고 싶다.` },
  };
  /* 자유 소스 → 일반 골격 Pack (도메인 비특화 · 표준 7단계). 실제 분해 품질은 LLM 연동 시 향상 */
  function genericAuthor(text){
    const lines=(text||'').split('\n').map(s=>s.trim()).filter(Boolean);
    const title=(lines.find(l=>!l.startsWith('['))||'새 업무').replace(/\.$/,'').slice(0,30);
    const req=lines.join(' ').slice(0,120)||'업무 요청';
    const o=(g,feed,out,L,comp,x)=>Object.assign({g,feed,out,L,comp},x||{});
    const WORK=[
     {id:'request',label:'요청 접수',role:'요청',actor:'human',explain:`업무 요청을 <b>L1 경험·접근</b>이 접수하고 <b>L4 지식·시맨틱</b>이 핵심 신호를 추출합니다.`,
      ops:[o(0,'요청 수신','요청 접수','L1','챗·접수 UI'),o(1,'핵심 신호 추출','대상·요구 식별','L4','온톨로지·시맨틱')]},
     {id:'understand',label:'업무 이해',role:'AAP 분석',actor:'aap',explain:`<b>Semantic</b> 단계 — <b>L4</b>가 업무 유형·목적·산출물을 정의하고 <b>L7</b>이 정책을 답니다.`,
      ops:[o(0,'업무 유형 분류',title,'L4','온톨로지·시맨틱'),o(1,'목적·산출물 정의','산출물 정의','L4','컨텍스트 조합·근거'),o(2,'정책·제약 확인','정책 플래그','L7','정책 관리·통제')]},
     {id:'compose',label:'실행 구조 구성',role:'AAP 구성',actor:'aap',explain:`핵심 — 작업으로 분해하고 <b>L2·L3</b>에서 <b>Agent·모듈·기존 솔루션·Connector·정책</b>을 골라 실행 구조로 조합합니다.`,
      ops:[o(0,'작업 분해','작업 그래프','L2','설계·개발 환경'),o(1,'데이터·근거 식별','연결 대상','L5','연결·수집'),o(2,'구성요소 배정·조합','Agent·Module·솔루션·Connector·Policy','L3','코어·실행 엔진',{micro:['Agent','Module','Solution','Connector','Policy']}),o(3,'누락·리스크 점검','리스크 표시','L6','품질·근거 평가',{asset:1,badge:'Antbot'})]},
     {id:'approve',label:'계획 승인',role:'사람 확인 ①',actor:'hitl',gate:1,hitl:1,explain:`<b>L3 런타임 게이트</b>가 실행 전 멈춤 — AAP가 계획·옵션을 제시하고 <b>사람이 결정</b>합니다. (★ HITL ①)`,
      ops:[o(0,'계획안 제시','요약','L1','챗 UI'),o(1,'처리 옵션 산출','옵션 3안','L3','코어·실행 엔진'),o(2,'검토 게이트 보류','담당자 전달','L3','HITL 런타임 게이트')]},
     {id:'prepare',label:'처리 실행',role:'AAP 실행',actor:'aap',doneModal:1,explain:`승인대로 자율 실행 — <b>L5</b>가 근거를 조회하고 <b>L3</b>가 산출물을 만들며 <b>L8</b>이 시스템에 반영합니다.`,
      ops:[o(0,'근거 데이터 조회','근거 확보','L5','연결·수집'),o(1,'처리·산출물 생성','산출물 초안','L3','코어·실행 엔진'),o(2,'시스템 반영','기록','L8','스토리지·DB',{micro:['sys.write()']})]},
     {id:'commit',label:'최종 승인',role:'사람 확인 ②',actor:'hitl',gate:1,hitl:1,explain:`외부·되돌리기 어려운 행동 직전 <b>L7</b> 점검 후 <b>L3 게이트</b>가 멈춰 최종 확인을 받습니다. (★ HITL ②)`,
      ops:[o(0,'결과 취합','산출물','L3','코어·실행 엔진'),o(1,'발송·정책 점검','정책 통과','L7','정책 관리·통제'),o(2,'발송 게이트 보류','승인 대기','L3','HITL 런타임 게이트')]},
     {id:'share',label:'반영·기록·학습',role:'AAP 마무리',actor:'aap',doneModal:1,explain:`승인 후 결과를 전달·기록하고 패턴을 <b>L7 Self-Improving</b>으로 자산화합니다. (<b>Learning</b>)`,
      ops:[o(0,'결과 전달','전달 완료','L3','코어·실행 엔진'),o(0,'시스템 기록','기록 완료','L8','스토리지·DB'),o(1,'학습 자산화','패턴 저장','L7','Self-Improving',{asset:1,badge:'Self-Improving'})]},
    ];
    const SS={icon:'🗂️',title:title,customer:'신규 업무',owner:'담당자',knownFrom:'approve',metaUnknown:'분석 중',metaReady:'처리 진행',
      tabs:['개요','분석','처리','기록'],select:'처리 옵션',
      status:{request:['접수','s-info','개요'],understand:['분석 중','s-info','개요'],compose:['분석 중','s-info','개요'],approve:['검토 필요','s-amber','분석'],prepare:['처리 중','s-blue','처리'],commit:['승인 대기','s-amber','처리'],share:['완료','s-green','기록']},
      perStep:{request:{mode:'request',work:'요청을 접수하고 있어요…',done:'요청 접수됨',text:`"${req}"`,hint:'AAP가 업무를 분해·구성해 처리해 드려요.'},
        understand:{mode:'overview',work:'AAP가 업무를 분석하고 있어요',done:'업무 정리됨',rows:[['유형',title],['처리','분석 · 판단 · 실행']]},
        compose:{mode:'track',work:'AAP가 실행 구조를 구성하고 있어요',done:'실행 구조 준비됨',track:['데이터 식별','작업 분해','구성요소 조합']},
        approve:{mode:'work',work:'계획을 정리하고 있어요',done:'계획 확인 대기'},
        prepare:{mode:'work',work:'업무를 처리하고 있어요',done:'처리 완료',track:['근거 조회','산출물 생성','시스템 반영']},
        commit:{mode:'work',work:'결과를 정리하고 있어요',done:'승인 대기'},
        share:{mode:'work',work:'반영·기록하고 있어요',done:'완료',track:['결과 전달','기록','후속 등록']}},
      ws:[{k:'분석 결과',from:4,v:'완료',dlv:'result'},{k:'처리안',from:3,v:'초안',dlv:'plan'}],
      hitl:{approve:{title:'계획을 확인해 주세요',sub:'AAP가 분석·처리안을 준비했어요. 처리 옵션은 직접 정하세요.',yes:'이대로 처리',no:'옵션 변경',showSelect:true,rows:[{k:'처리안',v:'분석 기반 처리안',dlv:'plan'}],files:[{label:'📄 분석 결과',dlv:'result'}]},
        commit:{title:'결과를 반영·발송할까요?',sub:'되돌리기 어려운 마지막 단계예요.',yes:'승인·반영',no:'수정 요청',rows:[{k:'산출물',v:'처리 결과·기록안',dlv:'plan'},{k:'정책 점검',v:'통과'}]}},
      done:{prepare:{title:'처리 준비 완료',lines:[{ic:'📄',t:'분석 결과 · 처리안 생성'},{ic:'🗂️',t:'시스템 반영 준비'}]},
        share:{title:'반영·기록 완료',lines:[{ic:'📤',t:'결과 전달'},{ic:'🗂️',t:'시스템 기록',dlv:'plan'},{ic:'⏰',t:'후속·학습 등록'}]}},
    };
    return {
      id:'custom',label:title.slice(0,10)||'새 업무',authored:1,
      times:[{t:'표준 처리',s:'권장'},{t:'간소 처리',s:'최소'},{t:'정밀 처리',s:'고강도'}],
      products:{result:{ic:'📄',title:'분석 결과',sub:'초안',body:`<div class="doc"><h5>분석 결과</h5><div class="drow"><span class="dk">대상</span>${title}</div><div class="drow"><span class="dk">요약</span>요청을 분해·분석한 결과(골격)</div></div>`},
        plan:{ic:'📋',title:'처리안',sub:'초안',body:`<div class="doc"><h5>처리안</h5><div class="drow"><span class="dk">방향</span>표준 처리</div><div class="drow"><span class="dk">단계</span>분석 → 판단 → 실행 → 기록</div></div>`}},
      work:WORK,
      compose:[{t:'Agent',sub:'전문 작업',cls:'tA',n:4,items:['분류','분석','생성','처리']},{t:'Module',sub:'재사용 기능',cls:'tM',n:2,items:['평가(Antbot)','정책 매칭']},{t:'기존 솔루션',sub:'Buy·Integrate',cls:'tS',n:1,items:['기간계/ERP']},{t:'Connector',sub:'시스템 연동',cls:'tC',n:2,items:['데이터 소스','알림']},{t:'Policy',sub:'통제·권한',cls:'tP',n:2,items:['승인 정책','PII·보안']}],
      components:[{type:'Agent',ty:'tyA',ic:'🏷️',name:'분류 Agent',L:'L4',desc:'요청을 유형으로 분류합니다.',when:'요청 접수 시.',data:'요청, 유형 온톨로지',how:'의미 분류로 유형·요구 구조화.'},
        {type:'Agent',ty:'tyA',ic:'🔎',name:'분석 Agent',L:'L5',desc:'근거 데이터를 조회·분석합니다 (RAG).',when:'판단에 근거가 필요할 때.',data:'기간계·문서·이력',how:'검색·분석해 근거 제시.'},
        {type:'Agent',ty:'tyA',ic:'⚙️',name:'처리 Agent',L:'L3',desc:'산출물·처리안을 생성합니다.',when:'실행 산출물이 필요할 때.',data:'분석 결과, 템플릿',how:'결과를 템플릿에 채워 생성.'},
        {type:'Module',ty:'tyM',ic:'🧐',name:'품질 평가 모듈',L:'L6',asset:1,desc:'산출물 충족도를 검수합니다 (Antbot).',when:'산출물 생성 후.',data:'근거, 체크리스트',how:'근거 대조로 오류·누락 점검.'},
        {type:'기존 솔루션',ty:'tyS',ic:'🗄️',name:'기간계/ERP',L:'L8',desc:'사내 기간계를 연동합니다 (Integrate).',when:'조회·등록이 필요할 때.',data:'ERP API, 마스터',how:'기존 시스템 연동 — 조회·쓰기.'},
        {type:'Policy',ty:'tyP',ic:'🛡️',name:'승인·보안 정책',L:'L7',desc:'책임 행동 시 자동 실행을 막고 승인을 요구합니다.',when:'승인·외부 발송 등 책임 지점.',data:'승인 권한, 보안 정책',how:'책임 행동 감지 → 차단 후 HITL.'},
        {type:'Agent',ty:'tyA',ic:'📚',name:'지식 자산화 Agent',L:'L7',asset:1,desc:'패턴을 축적해 다음 처리를 개선합니다 (Self-Improving).',when:'종결 후 학습 되먹임 시.',data:'유형·처리·피드백',how:'패턴 정규화로 자산화.'}],
      workload:{request:req,type:title,purpose:'분석 · 판단 · 처리 · 기록',outputs:['분석 결과','처리안','기록'],gates:'계획 승인 · 최종 반영 (책임 지점만 사람 확인 · HITL 2회)'},
      planProduces:{request:[],understand:[],compose:['실행 구조(계획안)'],approve:['처리안','처리 옵션 3안'],prepare:['분석·산출물 초안'],commit:['반영안'],share:['반영·기록·학습 자산']},
      gates:['★ HITL ① 계획 승인 · 옵션 선택','★ HITL ② 최종 반영 승인'],
      govern:[{k:'Policy',v:'승인·외부 발송·보안 정책. 책임 지점은 <b>자동 실행 차단</b> 후 승인.'},{k:'Run Trace',v:'요청→판단→처리→승인→반영을 <b>전 구간 기록</b>.'},{k:'Evaluation',v:'근거 충족도·정책 준수를 <b>Antbot</b>이 평가.'},{k:'Skill Library',v:'업무 유형·처리 패턴을 <b>재사용 자산</b>으로 축적.'}],
      stepLoop:{request:'Data',understand:'Semantic',compose:'Reasoning',approve:'Decision',prepare:'Action',commit:'Decision',share:'Learning'},
      extExcluded:(S)=>S.decisions['approve']==='no',
      surfaceSpec:SS,
    };
  }

  function buildQuality(){
    const TIMES=[{t:'라인 정지·전수 검사',s:'최고 강도'},{t:'로트 격리·샘플 검사',s:'표준'},{t:'모니터링 강화',s:'최소'}];
    const PRODUCTS={
      log:{ic:'📈',title:'설비·검사 로그',sub:'LOT-7785',body:`<div class="dlv">
        <div class="row"><div style="flex:1"><div class="nm">치수 측정 23점 중 4점 공차 초과</div><div class="why">검사 DB · +0.03~0.05mm</div></div><span class="tag block">불량</span></div>
        <div class="row"><div style="flex:1"><div class="nm">3호기 스핀들 진동 상승</div><div class="why">설비 IoT · 임계 근접</div></div><span class="tag warn">의심</span></div></div>`},
      cause:{ic:'🧩',title:'원인 분석',sub:'근본 원인 후보',body:`<div class="dlv">
        <div class="row"><div style="flex:1"><div class="nm">3호기 공구 마모 (주원인)</div><div class="why">진동·치수 상관 · 교체 주기 초과</div></div><span class="tag block">확정</span></div>
        <div class="row"><div style="flex:1"><div class="nm">자재 로트 경도 편차 (부원인)</div><div class="why">입고 검사 데이터</div></div><span class="tag warn">기여</span></div></div>`},
      action:{ic:'📋',title:'조치안',sub:(C)=>C.ex?'축소 적용':'표준',body:(C)=>`<div class="doc"><h5>조치안 (${C.S.pickedTime})</h5>
        <div class="drow"><span class="dk">즉시</span>3호기 공구 교체 · 해당 로트 ${C.ex?'샘플 검사':'전수 검사'}</div>
        <div class="drow"><span class="dk">출하</span>${C.ex?'조건부 출하':'출하 보류'} · 재검사 통과 시 해제</div>
        <div class="drow"><span class="dk">예방</span>공구 교체 주기 단축 · 입고 경도 검사 강화</div></div>`},
      order:{ic:'🛠️',title:'작업지시',sub:'WO-3391',body:`<div class="doc"><h5>작업지시 WO-3391</h5>
        <div class="drow"><span class="dk">대상</span>2라인 3호기 · LOT-7785</div>
        <div class="drow"><span class="dk">작업</span>공구 교체 → 시운전 → 재검사</div>
        <div class="drow"><span class="dk">담당</span>설비 보전팀 · 품질 입회</div>
        <div class="drow"><span class="dk">기한</span>금일 18:00</div></div>`},
    };
    const WORK=[
     {id:'request',label:'이슈 접수',role:'현장 접수',actor:'human',
      explain:`품질 이슈 처리의 시작입니다. <b>L1 경험·접근</b>(현장 단말·알림)이 불량을 접수하고 <b>L4 지식·시맨틱</b>이 핵심 신호를 추출합니다.`,
      ops:[{g:0,feed:'불량 접수',out:'"2라인 치수 불량 반복 발생"',L:'L1',comp:'현장 단말·알림'},
       {g:1,feed:'핵심 신호 추출',out:'치수 불량 · 3호기 · LOT-7785',L:'L4',comp:'온톨로지·시맨틱'}]},
     {id:'understand',label:'이슈 이해',role:'AAP 분석',actor:'aap',
      explain:`<b>Semantic</b> 단계입니다. <b>L4</b>가 불량 유형을 해석하고 <b>L6</b>가 긴급도(이상 탐지)를, <b>L7</b>이 출하 보류 정책을 답니다.`,
      ops:[{g:0,feed:'불량 유형 분류',out:'치수(공차 초과) 불량',L:'L4',comp:'온톨로지·시맨틱',detail:od('유형 (신뢰도)',[['치수 불량','0.90','g'],['표면 결함','0.07']])},
       {g:1,feed:'긴급도·이상 탐지',out:'반복·확산 위험 중상',L:'L6',comp:'이상 탐지',asset:1,badge:'Antbot'},
       {g:2,feed:'출하 정책 확인',out:'출하 영향 → 보류·승인 필요',L:'L7',comp:'정책 관리·통제'}]},
     {id:'compose',label:'실행 구조 구성',role:'AAP 구성',actor:'aap',
      explain:`핵심 단계입니다. 업무를 작업으로 분해하고 <b>L2·L3</b>에서 <b>Agent·모듈·기존 솔루션·Connector·정책</b>을 골라 실행 구조로 조합합니다.`,
      ops:[{g:0,feed:'작업 분해',out:'로그·원인·조치·작업지시 그래프',L:'L2',comp:'설계·개발 환경',detail:od('작업 그래프 (4)',[['T1 로그 조회',''],['T2 원인 분석',''],['T3 조치 산정',''],['T4 작업지시','']])},
       {g:1,feed:'데이터·근거 식별',out:'MES·검사 DB·설비 로그 연결',L:'L5',comp:'연결·수집'},
       {g:2,feed:'구성요소 배정·조합',out:'Agent 5 · Module 2 · 솔루션 2 · Connector 3 · Policy 3',L:'L3',comp:'코어·실행 엔진',micro:['Agent','Module','Solution','Connector','Policy']},
       {g:3,feed:'누락·리스크 점검',out:'출하·안전 리스크 표시',L:'L6',comp:'품질·근거 평가',asset:1,badge:'Antbot'}]},
     {id:'approve',label:'조치안 승인',role:'사람 확인 ①',actor:'hitl',gate:1,hitl:1,
      explain:`<b>L3 런타임 게이트</b>가 조치 결정 전 멈춥니다. AAP가 원인·조치안·조치 수준 후보를 제시하고 <b>조치 수준은 사람이 결정</b>합니다. (★ HITL ①)`,
      ops:[{g:0,feed:'조치안 제시',out:'원인 2 · 조치안 · 작업지시 초안',L:'L1',comp:'현장 단말·알림'},
       {g:1,feed:'조치 수준 후보 산출',out:'정지 / 격리 / 모니터링',L:'L3',comp:'코어·실행 엔진',micro:['영향도 산정'],detail:od('조치 옵션',[['라인 정지','전수','a'],['로트 격리','표준'],['모니터링','최소','g']])},
       {g:2,feed:'검토 게이트 보류',out:'조치 수준 선택 담당자 전달',L:'L3',comp:'HITL 런타임 게이트'}]},
     {id:'prepare',label:'조치 실행',role:'AAP 실행',actor:'aap',doneModal:1,
      explain:`승인된 조치안대로 자율 실행합니다. <b>L5</b>가 설비·검사를 <b>병렬</b> 조회하고 <b>L3 코어</b>가 원인·조치를 산정하며 <b>L8</b>이 MES에 반영합니다.`,
      ops:[{g:0,feed:'설비·검사 조회',out:'측정 23점 · 진동 로그',L:'L5',comp:'연결·수집',micro:['검사 DB','설비 IoT']},
       {g:0,feed:'SPC 관리도 점검',out:'공정 능력 이탈 확인',L:'L6',comp:'SPC 관리도'},
       {g:1,feed:'원인 분석·조치 산정',out:'공구 마모 주원인 · 조치 확정',L:'L3',comp:'코어·실행 엔진',micro:['상관 분석'],detail:od('원인 (기여도)',[['공구 마모','0.7','r'],['자재 편차','0.3','a']])},
       {g:1,feed:'작업지시 초안',out:'WO-3391 초안',L:'L3',comp:'코어·실행 엔진'},
       {g:2,feed:'MES 반영',out:'로트 보류 · 상태 갱신',L:'L8',comp:'스토리지·DB',micro:['mes.hold()']}]},
     {id:'commit',label:'실행 승인',role:'사람 확인 ②',actor:'hitl',gate:1,hitl:1,
      explain:`작업지시 발행 직전, <b>L7</b>이 안전·출하 영향을 점검하고 <b>L3 게이트</b>가 발행을 멈춰 책임자 승인을 받습니다. (★ HITL ②)`,
      ops:[{g:0,feed:'작업지시 취합',out:'WO-3391 · 조치 내역',L:'L3',comp:'코어·실행 엔진'},
       {g:1,feed:'안전·출하 점검',out:'안전 절차 · 출하 보류 확인',L:'L7',comp:'정책 관리·통제',detail:od('발행 점검',[['안전 절차','적합','g'],['출하 보류','유지','a'],['승인 권한','확인','g']])},
       {g:2,feed:'발행 게이트 보류',out:'작업지시 발행 승인 대기',L:'L3',comp:'HITL 런타임 게이트'}]},
     {id:'share',label:'보고·기록·학습',role:'AAP 마무리',actor:'aap',doneModal:1,
      explain:`승인 후 AAP가 작업지시를 발행하고 결과를 <b>병렬</b> 기록하며, 반복 불량 패턴을 <b>L7 Self-Improving</b>으로 자산화해 재발을 줄입니다. (<b>Learning</b>)`,
      ops:[{g:0,feed:'작업지시 발행',out:'설비 보전팀 전달',L:'L3',comp:'코어·실행 엔진',micro:['wo.issue()']},
       {g:0,feed:'QMS·MES 기록',out:'부적합·조치 이력 등록',L:'L8',comp:'스토리지·DB',micro:['qms.write()']},
       {g:1,feed:'재발 방지 등록',out:'공구 주기 단축 · 입고 검사 강화',L:'L3',comp:'코어·실행 엔진'},
       {g:2,feed:'학습 자산화',out:'반복 불량 패턴 저장 · 룰 개선',L:'L7',comp:'Self-Improving',asset:1,badge:'Self-Improving',detail:od('학습 자산',[['치수 불량 패턴','저장','g'],['공구 주기 룰','개선','g']])}]},
    ];
    const COMPOSE=[
     {t:'Agent',sub:'전문 작업',cls:'tA',n:5,items:['이슈 분류','로그 조회(RAG)','원인 분석','조치 산정','작업지시']},
     {t:'Module',sub:'재사용 기능',cls:'tM',n:2,items:['이상 탐지 (Antbot)','SPC 관리도']},
     {t:'기존 솔루션',sub:'Buy·Integrate',cls:'tS',n:2,items:['MES','QMS']},
     {t:'Connector',sub:'시스템 연동',cls:'tC',n:3,items:['설비 IoT','검사 DB','작업지시 시스템']},
     {t:'Policy',sub:'통제·권한',cls:'tP',n:3,items:['출하 보류 정책','안전 승인','부적합 이력']},
    ];
    const COMPONENTS=[
     {type:'Agent',ty:'tyA',ic:'🏷️',name:'이슈 분류 Agent',L:'L4',desc:'불량을 유형·긴급도로 분류합니다.',when:'품질 이슈가 접수되어 경로를 정할 때.',data:'불량 접수, 유형 온톨로지, 과거 불량',how:'증상을 의미 분류 → 유형·긴급도 구조화.'},
     {type:'Agent',ty:'tyA',ic:'🔎',name:'로그 조회 Agent',L:'L5',desc:'설비·검사·MES 로그를 조회합니다 (RAG).',when:'원인 판단에 데이터가 필요할 때.',data:'설비 IoT, 검사 DB, MES 이력',how:'관련 로그 검색·요약해 제공.'},
     {type:'Agent',ty:'tyA',ic:'🧩',name:'원인 분석 Agent',L:'L3',desc:'증상-로그 상관으로 근본 원인을 추론합니다.',when:'복합·반복 불량일 때.',data:'증상, 설비·자재 로그, 과거 원인 사례',how:'상관 분석 → 원인 후보를 기여도와 함께 제시.'},
     {type:'Agent',ty:'tyA',ic:'🛠️',name:'조치 산정 Agent',L:'L3',desc:'원인·영향에 맞는 조치 수준을 산정합니다.',when:'조치 결정·작업지시 전.',data:'조치 정책, 영향도, 안전 기준',how:'원인·영향을 매칭 → 조치 옵션을 한도와 함께 산정.'},
     {type:'Module',ty:'tyM',ic:'📈',name:'이상 탐지 모듈',L:'L6',asset:1,desc:'설비·공정 데이터의 이상을 탐지합니다 (Antbot).',when:'긴급도·확산 위험 판단 시 — 공용.',data:'센서 시계열, 임계 기준',how:'시계열 이상 탐지 → 위험 점수화.'},
     {type:'Module',ty:'tyM',ic:'📊',name:'SPC 관리도 모듈',L:'L6',desc:'공정 능력·관리한계 이탈을 결정론적으로 점검합니다.',when:'공정 안정성 판단 시.',data:'측정값, 관리한계, 공정 능력 지수',how:'관리도 규칙 점검 → 이탈 여부 판정.'},
     {type:'기존 솔루션',ty:'tyS',ic:'🏭',name:'MES',L:'L8',desc:'제조 실행 시스템을 연동합니다 (Integrate).',when:'로트 상태·생산 이력 조회·갱신 시.',data:'로트, 공정 실적, 설비 상태',how:'기존 MES 연동 — 조회·상태 쓰기.'},
     {type:'기존 솔루션',ty:'tyS',ic:'📋',name:'QMS',L:'L8',desc:'품질관리 시스템을 연동해 부적합·조치를 기록합니다.',when:'부적합 등록·이력 보관 시.',data:'부적합 코드, 조치 이력, 검사 기준',how:'기존 QMS 연동 — 부적합·조치 기록.'},
     {type:'Connector',ty:'tyC',ic:'🔌',name:'설비·검사 Connector',L:'L5',desc:'설비 IoT·검사 DB·작업지시 시스템을 안전하게 연결합니다.',when:'데이터 수신·작업지시 발행 시(권한 범위).',data:'IoT 게이트웨이, 검사 DB API, 작업지시 API',how:'표준 커넥터로 권한 범위 내 조회·발행 중개.'},
     {type:'Policy',ty:'tyP',ic:'🛡️',name:'출하 보류·안전 정책',L:'L7',desc:'출하·작업지시 발행 시 자동 실행을 막고 승인을 요구합니다.',when:'출하 보류·작업지시 등 책임 지점.',data:'출하 정책, 안전 절차, 승인 권한',how:'책임 행동 감지 → 자동 차단 후 HITL 게이트로 보류.'},
     {type:'Agent',ty:'tyA',ic:'📚',name:'지식 자산화 Agent',L:'L7',asset:1,desc:'반복 불량·조치 패턴을 축적해 재발을 줄입니다 (Self-Improving).',when:'처리 종결 후 결과를 학습으로 되먹임할 때.',data:'불량 유형·원인·조치·피드백',how:'패턴 정규화 → 지식베이스·룰 개선 데이터로 축적.'},
    ];
    const SS={
      icon:'🏭', title:'품질 이슈 · 치수 불량', customer:'대한정밀 · 2라인', owner:'품질 김현장',
      knownFrom:'approve', metaReady:'LOT-7785 · 조치 진행', metaUnknown:'LOT-7785 · 분석 중',
      tabs:['개요','원인','조치','보고'], select:'조치 수준',
      status:{request:['접수','s-info','개요'],understand:['분석 중','s-info','개요'],compose:['분석 중','s-info','개요'],approve:['검토 필요','s-amber','조치'],prepare:['처리 중','s-blue','조치'],commit:['승인 대기','s-amber','조치'],share:['완료','s-green','보고']},
      perStep:{
        request:{mode:'request',work:'불량을 접수하고 있어요…',done:'이슈 접수됨 · 분석 시작',text:'"2라인 3호기 가공품 치수 불량이 또 발생했습니다. 원인 확인하고 조치해 주세요."',hint:'AAP가 로그·원인·조치를 확인해 작업지시까지 만들어 드려요.'},
        understand:{mode:'overview',work:'AAP가 이슈를 분석하고 있어요',done:'이슈 정리됨',rows:[['유형','치수(공차) 불량'],['긴급도','반복·확산 위험 중상'],['처리','원인 확인 · 조치 · 작업지시']]},
        compose:{mode:'track',work:'AAP가 조치 계획을 구성하고 있어요',done:'조치 계획 준비됨',track:['로그 조회','원인 분석','조치 산정','작업지시']},
        approve:{mode:'work',work:'조치안을 정리하고 있어요',done:'조치안 확인 대기'},
        prepare:{mode:'work',work:'조치를 처리하고 있어요',done:'조치 준비 완료',track:['설비·검사 조회','원인 분석','조치 산정','MES 반영']},
        commit:{mode:'work',work:'작업지시를 정리하고 있어요',done:'발행 승인 대기'},
        share:{mode:'work',work:'발행·기록하고 있어요',done:'처리 완료',track:['작업지시 발행','QMS 기록','재발 방지']},
      },
      ws:[{k:'로그',from:4,v:'측정 23점',dlv:'log'},{k:'원인',from:4,v:'복합 2건',dlv:'cause'},{k:'조치안',from:3,v:(C)=>C.ex?'축소':'표준',dlv:'action'},{k:'작업지시',from:5,v:'WO-3391',dlv:'order'}],
      hitl:{
        approve:{title:'조치안을 확인해 주세요',sub:'AAP가 원인·조치안을 준비했어요. 조치 수준은 직접 정하세요.',yes:'이대로 조치',no:'조치 축소',showSelect:true,rows:[{k:'원인',v:'공구 마모(주) + 자재 편차',dlv:'cause'}],files:[{label:'📋 조치안',dlv:'action'},{label:'📈 로그',dlv:'log'}]},
        commit:{title:'작업지시를 발행할까요?',sub:'안전·출하 영향이 있는 마지막 단계예요.',yes:'발행',no:'수정 요청',rows:[{k:'작업지시',v:'WO-3391 · 공구 교체·재검사',dlv:'order'},{k:'안전·출하',v:'안전 적합 · 출하 보류 유지'}]},
      },
      done:{
        prepare:{title:'조치 준비 완료',lines:[{ic:'🧩',t:'원인 확정 · 조치 산정 · 작업지시 초안'},{ic:'🏭',t:'MES 로트 보류 처리'}]},
        share:{title:'발행·기록 완료',lines:[{ic:'🛠️',t:'작업지시 발행 (설비 보전팀)',dlv:'order'},{ic:'📋',t:'QMS 부적합·조치 기록'},{ic:'⏰',t:'공구 주기 단축 · 입고 검사 강화 등록'}]},
      },
    };
    return {
      id:'quality', label:'제조 품질', authored:1,
      times:TIMES, products:PRODUCTS, work:WORK, components:COMPONENTS, compose:COMPOSE,
      workload:{request:'대한정밀 2라인 가공 부품 치수 불량(공차 초과) 반복 발생 — 원인 확인·조치·작업지시 요청.',type:'제조 품질 이슈 (치수 불량)',purpose:'원인 분석 · 조치 결정 · 작업지시·기록',outputs:['로그·검사','원인 분석','조치안','작업지시','후속 예방'],gates:'조치안 승인 · 작업지시 발행 (출하·안전 영향만 책임자 확인 · HITL 2회)'},
      planProduces:{request:[],understand:[],compose:['실행 구조(계획안)'],approve:['조치안','조치 수준 후보 3안'],prepare:['원인·조치·작업지시 초안'],commit:['작업지시(발행안)'],share:['발행·QMS 기록·학습 자산']},
      gates:['★ HITL ① 조치안 승인 · 조치 수준 선택','★ HITL ② 작업지시 발행 승인'],
      govern:[{k:'Policy',v:'출하 보류·작업지시 발행·안전 정책. 책임 지점은 <b>자동 실행 차단</b> 후 승인.'},{k:'Run Trace',v:'접수→원인→조치 판단→승인→발행을 <b>전 구간 기록</b>(품질 추적).'},{k:'Evaluation',v:'원인 정확도·공정 능력·조치 적합성을 <b>Antbot</b>이 평가.'},{k:'Skill Library',v:'반복 불량 유형·원인·조치 패턴을 <b>재사용 자산</b>으로 축적.'}],
      stepLoop:{request:'Data',understand:'Semantic',compose:'Reasoning',approve:'Decision',prepare:'Action',commit:'Decision',share:'Learning'},
      extExcluded:(S)=>S.decisions['approve']==='no',
      surfaceSpec:SS,
    };
  }

  /* ---- snippet (분석 단계별 미리보기) ---- */
  function snippet(show,pack){
    if(show==='workload')return `<b>${pack.workload.type}</b> · ${pack.workload.purpose}<div class="au-chips">${pack.workload.outputs.map(o=>`<span>${o}</span>`).join('')}</div>`;
    if(show==='work')return pack.work.map((w,i)=>`<span class="au-step">${String(i+1).padStart(2,'0')} ${w.label}${w.gate?' ★':''}</span>`).join('');
    if(show==='compose')return `<div class="au-chips">${pack.compose.map(c=>`<span class="au-t ${c.cls}">${c.t} ${c.n}</span>`).join('')}</div>`;
    if(show==='data'){const d=pack.compose.filter(c=>c.cls==='tC'||c.cls==='tS').flatMap(c=>c.items);return `<div class="au-chips">${d.map(x=>`<span>${x}</span>`).join('')}</div>`;}
    if(show==='gates')return pack.gates.map(g=>`<div class="au-gate">${g}</div>`).join('');
    if(show==='products')return `<div class="au-chips">${Object.values(pack.products).map(p=>`<span>${p.ic} ${p.title}</span>`).join('')}</div>`;
    if(show==='done')return `<b style="color:var(--aap-ink)">Domain Pack '${pack.label}' 생성 완료</b> · 단계 ${pack.work.length} · 구성요소 ${pack.compose.reduce((s,c)=>s+c.n,0)} · HITL ${pack.gates.length} · 산출물 ${Object.keys(pack.products).length}`;
    return '';
  }

  /* ---- UI ---- */
  let chosen='quality', built=null, timers=[];
  const $=id=>document.getElementById(id);
  function clearT(){timers.forEach(clearTimeout);timers=[];}
  function open(){$('authoring').hidden=false;chosen='quality';built=null;renderHome();}
  function close(){clearT();$('authoring').hidden=true;}
  function renderHome(){
    const s=SOURCES[chosen];
    $('authBody').innerHTML=`
      <div class="au-src">
        <div class="au-srch">업무 소스 <span>· AAP가 읽고 스스로 분해합니다</span></div>
        <div class="au-pills">${Object.keys(SOURCES).map(k=>`<button class="au-pill ${k===chosen?'on':''}" data-src="${k}">${SOURCES[k].icon} ${SOURCES[k].label}</button>`).join('')}</div>
        ${s.editable?`<textarea class="au-text au-input" id="auInput" rows="6">${s.src}</textarea><div class="au-hint2">자유 텍스트 → 일반 골격 Pack(표준 7단계)으로 분해. 도메인 깊이는 LLM 연동 시 향상.</div>`:`<pre class="au-text">${s.src}</pre>`}
        <button class="cp-btn primary lg" id="auGo">▶ 분석 시작 — 스스로 업무 분해</button>
      </div>
      <div class="au-pipe" id="auPipe"></div>`;
    $('authBody').querySelectorAll('[data-src]').forEach(e=>e.onclick=()=>{chosen=e.dataset.src;renderHome();});
    $('auGo').onclick=analyze;
  }
  function analyze(){
    clearT();const s=SOURCES[chosen];const pack=s.build?s.build():genericAuthor((document.getElementById('auInput')||{value:''}).value);built=pack;
    $('auGo').disabled=true;$('auGo').textContent='분석 중…';
    const pipe=$('auPipe');pipe.innerHTML=PIPE.map((p,i)=>`<div class="au-row" id="aur-${i}"><div class="au-rh"><span class="au-dot"></span><span class="au-rt">${p.t}</span><span class="au-rd">${p.d}</span></div><div class="au-rb" id="aurb-${i}"></div></div>`).join('');
    PIPE.forEach((p,i)=>{
      timers.push(setTimeout(()=>{
        const row=$('aur-'+i);row.classList.add('doing');
        timers.push(setTimeout(()=>{row.classList.remove('doing');row.classList.add('done');$('aurb-'+i).innerHTML=snippet(p.show,pack);
          if(i===PIPE.length-1)finish(pack);},520));
      },i*720));
    });
  }
  function finish(pack){
    const go=$('auGo');go.style.display='none';
    const foot=document.createElement('div');foot.className='au-foot';
    foot.innerHTML=`<div class="au-done">✓ AAP가 <b>'${pack.label}'</b> 업무를 분해·구성해 Domain Pack으로 기억했습니다. 같은 플랫폼에서 바로 작동합니다.</div>
      <button class="cp-btn primary lg" id="auLoad">＋ 이 업무로 전환 · 실행</button>`;
    $('authBody').appendChild(foot);
    $('auLoad').onclick=()=>{window.AAP_CORE.register(pack);window.AAP_CORE.load(pack.id);close();};
  }
  $('authBtn').onclick=open;
  $('authX').onclick=close;
  $('authoring').addEventListener('click',e=>{if(e.target.id==='authoring')close();});
  /* 검증/딥링크: ?author=1(오버레이) · ?author=run[&astep=approve](생성 팩 즉시 로드) */
  const q=new URLSearchParams(location.search);
  if(q.get('author')==='1')open();
  else if(q.get('author')==='run'){const p=SOURCES.quality.build();window.AAP_CORE.register(p);window.AAP_CORE.load(p.id);const as=q.get('astep');if(as)window.AAP_CORE.go(as);}
  else if(q.get('author')==='gen'){const p=genericAuthor(SOURCES.custom.src);window.AAP_CORE.register(p);window.AAP_CORE.load(p.id);const as=q.get('astep');if(as)window.AAP_CORE.go(as);}
})();
