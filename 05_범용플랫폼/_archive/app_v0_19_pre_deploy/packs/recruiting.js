/* =========================================================================
   AAP Domain Pack — 채용 (recruiting) · PoC 타깃 (도메인 네이티브 surface)
   ─────────────────────────────────────────────────────────────────────────
   "회의 리스킨 ✕" 원칙: 좌측 화면을 회의 포털이 아니라 실제 ATS(채용관리시스템)
   처럼 — 후보 파이프라인 보드 · 이력서/JD 뷰 · 스코어카드 · 숏리스트 로 구성.
   구현 선택 = (b) PACK.surface 함수형 커스텀 렌더. 단계 안무도 채용 고유.

   v0.11 고도화: 후보 6→10명 · 점수 가중 분해(스킬·경력·도메인) · 플래그 ·
   JD 요건(필수/우대 가중) · 산출물 실내용 · 보드 인터랙션(후보 상세·정렬·필터) ·
   HITL 결정이 실제 보드 상태를 바꿈(decideHook → ex/advance/reject 영속).
   코어는 도메인 무관 유지 — 채용 전용 로직은 전부 이 파일에.
   ========================================================================= */
(function(){
  const odTable=(title,rows)=>`<div class="op-detail"><div class="od-title">${title}</div>${rows.map(r=>`<div class="od-row"><span class="od-k">${r[0]}</span><span class="od-v ${r[2]||''}">${r[1]}</span></div>`).join('')}</div>`;
  /* 인라인 아이콘 헬퍼 — surface 는 코어가 innerHTML 로 주입(아이콘 하이드레이션 미적용)하므로 SVG 직접 삽입 */
  const I=(n,c)=>window.AAP_ICON?window.AAP_ICON.svg(n,c?{cls:c}:undefined):'';

  /* =======================================================================
     직무 요건(JD) — 필수/우대 스킬 · 경력 밴드 · 도메인 · 인원
     매칭 점수가 이 요건으로 '설명'되도록 가중치를 명시(스킬/경력/도메인).
     ======================================================================= */
  const JOB={
    id:'JD-2041', title:'백엔드 개발자 (Java/Kotlin)', team:'플랫폼개발팀',
    headcount:2, level:'경력 4~8년', minYrs:4, maxYrs:8,
    applicants:38, screened:10,
    must:['Java/Kotlin','Spring','MSA','RDB/SQL'], plus:['Kafka','AWS','대용량 트래픽'],
    domain:'커머스·핀테크 등 대용량 트랜잭션',
    owner:'채용담당 한지원', hiring:'플랫폼개발팀 리드 오세훈',
    /* 매칭 점수 가중(합 100) — 후보 match% 산출 근거 */
    weight:{skill:50, career:30, domain:20},
  };

  /* 스코어카드 평가 항목(가중치 합 100) — 면접/심층 평가용 루브릭 */
  const RUBRIC=[
    {k:'기술 적합도', w:35}, {k:'경력 깊이', w:25}, {k:'협업/커뮤니케이션', w:15},
    {k:'성장 가능성', w:15}, {k:'조직 적합성', w:10},
  ];

  /* =======================================================================
     후보 10명 — 결정론 더미.
     sk(스킬매치 0~100)·ca(경력적합 0~100)·dm(도메인적합 0~100) 3축 →
     match = round(sk*.5 + ca*.3 + dm*.2)  (가중합=총점, 일관).
     flags = 결정론 신호(스킬매치 높음/경력 부족/도메인 불일치/중복지원/안정성/IC 미스매치).
     scores = 루브릭 5항목(0~5, 면접 스코어카드용).
     ======================================================================= */
  const FLAG={
    skillhi:{k:'skillhi',ko:'스킬 매치 높음',t:'ok'},
    careerlow:{k:'careerlow',ko:'경력 하한',t:'warn'},
    domainmiss:{k:'domainmiss',ko:'도메인 불일치',t:'warn'},
    dup:{k:'dup',ko:'중복 지원',t:'warn'},
    stability:{k:'stability',ko:'재직 안정성',t:'risk'},
    icmiss:{k:'icmiss',ko:'기대역할 차이(IC)',t:'risk'},
    star:{k:'star',ko:'추천',t:'ok'},
  };
  function _c(o){
    o.match=Math.round(o.sk*JOB.weight.skill/100 + o.ca*JOB.weight.career/100 + o.dm*JOB.weight.domain/100);
    return o;
  }
  const CAND=[
   _c({id:'c1',name:'정유진',ini:'정',yrs:6,cur:'쿠팡 · 시니어 백엔드',dom:'커머스',edu:'컴퓨터공학 학사',
     skills:['Kotlin','Spring','Kafka','MSA','AWS'],sk:96,ca:95,dm:96,stage:'shortlist',
     scores:[5,4,4,4,4],flags:['skillhi','star'],
     resume:'대용량 주문 처리 MSA 설계·운영 6년. Kotlin/Spring 주력, Kafka 기반 이벤트 파이프라인 구축. 피크 트래픽 12k TPS 안정화.',
     hi:'대용량 트래픽·MSA 직접 경험이 JD must/plus를 모두 충족'}),
   _c({id:'c2',name:'박서준',ini:'박',yrs:5,cur:'토스 · 백엔드',dom:'핀테크',edu:'전자공학 학사',
     skills:['Java','Spring','RDB','AWS'],sk:84,ca:88,dm:94,stage:'shortlist',
     scores:[4,4,5,4,4],flags:['skillhi'],
     resume:'금융 정산 시스템 백엔드 5년. Java/Spring, 트랜잭션·정합성 설계 강점. 코드리뷰·멘토링 주도.',
     hi:'협업·커뮤니케이션 평가 최상위(5), 정합성 설계 강점'}),
   _c({id:'c3',name:'이하늘',ini:'이',yrs:8,cur:'네이버 · 테크리드',dom:'검색 플랫폼',edu:'컴퓨터공학 석사',
     skills:['Java','Kotlin','MSA','Kafka','대용량'],sk:97,ca:92,dm:80,stage:'shortlist',
     scores:[5,5,3,3,3],flags:['skillhi','icmiss'],
     resume:'검색 플랫폼 테크리드 8년. 아키텍처 설계·대용량 처리 깊이 최상. 최근 3년 매니징 비중 높음.',
     hi:'기술 깊이 최상위지만 IC 포지션과 기대역할 차이 확인 필요'}),
   _c({id:'c4',name:'강지아',ini:'강',yrs:7,cur:'카카오 · 백엔드',dom:'커머스',edu:'컴퓨터공학 학사',
     skills:['Java','Spring','MSA','AWS'],sk:80,ca:90,dm:90,stage:'screened',
     scores:[4,4,4,3,4],flags:[],
     resume:'커머스 백엔드 7년. Java/Spring/MSA 안정적. Kafka 경험은 보조적. 정량 성과 명확.',
     hi:'must 전부 충족·안정적이나 Kafka(plus) 경험 보조 수준'}),
   _c({id:'c5',name:'최민수',ini:'최',yrs:4,cur:'배민 · 백엔드',dom:'배달·주문',edu:'정보통신 학사',
     skills:['Kotlin','Spring','RDB'],sk:74,ca:70,dm:88,stage:'screened',
     scores:[4,3,4,5,4],flags:['careerlow'],
     resume:'배달 주문 백엔드 4년. Kotlin/Spring 견고. Kafka·대용량은 학습 단계. 성장 의지·태도 우수.',
     hi:'성장 가능성 높으나 Kafka·대용량(plus) 미충족 — 경력 하한'}),
   _c({id:'c6',name:'한도윤',ini:'한',yrs:6,cur:'당근마켓 · 백엔드',dom:'커머스',edu:'소프트웨어 학사',
     skills:['Kotlin','Spring','Kafka','RDB'],sk:88,ca:86,dm:86,stage:'screened',
     scores:[4,4,4,4,4],flags:[],
     resume:'중고거래 플랫폼 백엔드 6년. Kotlin/Spring/Kafka 실무. 검색·추천 트래픽 대응 경험.',
     hi:'must·plus 균형 충족 — 안정적 중상위'}),
   _c({id:'c7',name:'서나윤',ini:'서',yrs:5,cur:'무신사 · 백엔드',dom:'커머스',edu:'컴퓨터공학 학사',
     skills:['Java','Spring','MSA','RDB'],sk:82,ca:84,dm:90,stage:'screened',
     scores:[4,4,4,4,3],flags:[],
     resume:'패션 커머스 주문·재고 백엔드 5년. Java/Spring/MSA 견고. 대용량은 이벤트 한정.',
     hi:'커머스 도메인 적합 높음 · 대용량 노출은 제한적'}),
   _c({id:'c8',name:'윤도현',ini:'윤',yrs:9,cur:'프리랜서 · 백엔드',dom:'SI·스타트업',edu:'산업공학 학사',
     skills:['Java','Spring','RDB'],sk:60,ca:78,dm:48,stage:'screened',
     scores:[3,4,2,2,2],flags:['stability','domainmiss'],
     resume:'다양한 SI/스타트업 백엔드 9년. 경력 길지만 MSA·대용량 노출 적고 단기 계약 반복.',
     hi:'경력 길지만 JD 핵심(MSA·대용량) 미충족 + 재직 안정성 신호'}),
   _c({id:'c9',name:'조예린',ini:'조',yrs:3,cur:'스타트업 · 백엔드',dom:'에듀테크',edu:'컴퓨터공학 학사',
     skills:['Kotlin','Spring'],sk:62,ca:52,dm:60,stage:'screened',
     scores:[3,2,4,5,4],flags:['careerlow','domainmiss'],
     resume:'에듀테크 백엔드 3년. Kotlin/Spring 기본기 탄탄. MSA·대용량·도메인 경험 부족.',
     hi:'경력 하한·도메인 불일치 — 잠재력 있으나 본 포지션 기준 미달'}),
   _c({id:'c10',name:'임재훈',ini:'임',yrs:7,cur:'쿠팡 · 백엔드',dom:'커머스',edu:'컴퓨터공학 학사',
     skills:['Java','Kotlin','Spring','MSA'],sk:86,ca:88,dm:92,stage:'screened',
     scores:[4,4,3,4,4],flags:['dup'],
     resume:'커머스 정산 백엔드 7년. Java/Kotlin/Spring/MSA. 사내 타 포지션에도 중복 지원 확인됨.',
     hi:'요건 적합 높으나 중복 지원 — 지원 의사·우선순위 확인 필요'}),
  ];
  const cById=id=>CAND.find(c=>c.id===id);
  /* 루브릭 가중 종합점수(0~100, 면접 스코어카드) */
  function totalScore(c){ let s=0; RUBRIC.forEach((r,i)=>s+=c.scores[i]*r.w); return Math.round(s/5); }
  function flagsOf(c){ return (c.flags||[]).map(k=>FLAG[k]).filter(Boolean); }
  function hasRisk(c){ return flagsOf(c).some(f=>f.t==='risk'); }
  /* match 분해(가중 기여도) — 후보 상세·근거 레일에서 '왜 이 점수인지' 설명 */
  function breakdown(c){
    return [
      {k:'스킬 적합', raw:c.sk, w:JOB.weight.skill, sub:`must ${c.skills.filter(s=>JOB.must.some(m=>m.includes(s.split('/')[0])||s.includes(m.split('/')[0]))).length}/${JOB.must.length} · plus ${c.skills.filter(s=>JOB.plus.includes(s)).length}/${JOB.plus.length}`},
      {k:'경력 적합', raw:c.ca, w:JOB.weight.career, sub:`${c.yrs}년 (요건 ${JOB.minYrs}~${JOB.maxYrs}년)`},
      {k:'도메인 적합', raw:c.dm, w:JOB.weight.domain, sub:`${c.dom} ↔ ${JOB.domain.split(' ')[0]}`},
    ].map(b=>({...b, contrib:Math.round(b.raw*b.w/100)}));
  }

  /* 숏리스트는 컷 기준(cutThreshold)으로 동적 산출(shortlistIds) — 고정 목록 제거. */
  const INTERVIEW=[
    {cid:'c1',slot:'6/24 (화) 14:00',panel:'오세훈·이서영',type:'1차 기술'},
    {cid:'c2',slot:'6/24 (화) 16:00',panel:'오세훈·이서영',type:'1차 기술'},
    {cid:'c3',slot:'6/25 (수) 10:00',panel:'오세훈·CTO',type:'1차 기술'},
  ];
  const OFFER={cid:'c1',base:'7,200만',sign:'500만',start:'7/15',band:'B2 상한 내'};

  /* approve 게이트의 '컷 기준' 슬롯 (match% 컷) — 통과 수는 CAND 에서 결정론 산출(숫자 일관) */
  const cutCount=th=>CAND.filter(c=>c.match>=th).length;
  const TIMES=[
    {t:'엄격 · match ≥ 90',s:`후보 ${cutCount(90)}명 · 정밀`},
    {t:'표준 · match ≥ 85',s:`후보 ${cutCount(85)}명 · 권장`},
    {t:'넓게 · match ≥ 80',s:`후보 ${cutCount(80)}명 · 풀 확대`},
  ];

  /* =======================================================================
     산출물(DLV) — 스크리닝 리포트(통과/보류/탈락 사유)·후보 비교표·면접 일정·오퍼(조건)
     ======================================================================= */
  /* 스크리닝 판정(결정론): 통과(≥85·리스크 없음)/보류(80~84 또는 리스크)/탈락(<80) */
  function screenVerdict(c){
    if(c.match>=85 && !hasRisk(c)) return {k:'pass',ko:'통과',t:'ok',why:'must·plus 충족 · 리스크 없음'};
    if(c.match>=80 || (c.match>=82 && hasRisk(c))) return {k:'hold',ko:'보류',t:'warn',why:hasRisk(c)?'요건 충족하나 검토 신호 있음':'우대 요건 일부 미충족'};
    return {k:'drop',ko:'탈락',t:'risk',why:c.match<70?'필수/경력 요건 미달':'요건 충족도 컷 미달'};
  }
  const PRODUCTS={
    jd:{ic:'briefcase',title:'직무 기술서 (JD)',sub:`${JOB.id} · ${JOB.headcount}명 채용`,body:`<div class="doc"><h5>${JOB.title}</h5>
      <div class="drow"><span class="dk">팀</span>${JOB.team} · ${JOB.level}</div>
      <div class="drow"><span class="dk">인원</span>${JOB.headcount}명</div>
      <div class="drow"><span class="dk">필수</span>${JOB.must.join(' · ')}</div>
      <div class="drow"><span class="dk">우대</span>${JOB.plus.join(' · ')}</div>
      <div class="drow"><span class="dk">도메인</span>${JOB.domain}</div>
      <div class="drow"><span class="dk">매칭 가중</span>스킬 ${JOB.weight.skill} · 경력 ${JOB.weight.career} · 도메인 ${JOB.weight.domain}</div>
      <div class="drow"><span class="dk">지원</span>총 ${JOB.applicants}명 → 1차 스크리닝 통과 ${JOB.screened}명</div></div>`},
    report:{ic:'file-text',title:'스크리닝 리포트',sub:`지원 ${JOB.applicants} → 통과/보류/탈락 분류`,body:(()=>{
      const pass=CAND.filter(c=>screenVerdict(c).k==='pass'), hold=CAND.filter(c=>screenVerdict(c).k==='hold'), drop=CAND.filter(c=>screenVerdict(c).k==='drop');
      const grp=(arr,label,t)=>arr.length?`<div class="dlv-sec">${label} <b>${arr.length}</b></div>${arr.map(c=>{const v=screenVerdict(c);return `<div class="row"><div style="flex:1"><div class="nm">${c.name} · ${c.match}%</div><div class="why">${v.why}</div></div><span class="tag ${t}">${v.ko}</span></div>`;}).join('')}`:'';
      return `<div class="dlv">
      <div class="dlv-sec">파싱·매칭 요약</div>
      <div class="row"><div style="flex:1"><div class="nm">이력서 파싱 ${JOB.applicants}건</div><div class="why">PDF·DOCX·이미지 OCR 정규화 완료</div></div><span class="tag ok">완료</span></div>
      <div class="row"><div style="flex:1"><div class="nm">JD 요건 매칭·랭킹</div><div class="why">스킬 ${JOB.weight.skill} · 경력 ${JOB.weight.career} · 도메인 ${JOB.weight.domain} 가중 스코어링</div></div><span class="tag ok">완료</span></div>
      <div class="row"><div style="flex:1"><div class="nm">차별금지·PII 점검</div><div class="why">성별·연령·출신 등 보호속성 매칭 제외</div></div><span class="tag ok">통과</span></div>
      ${grp(pass,'통과 (match ≥ 85 · 리스크 없음)','ok')}
      ${grp(hold,'보류 (재검토)','warn')}
      ${grp(drop,'탈락 (사유 기록)','block')}</div>`;})()},
    compare:{ic:'list',title:'후보 비교표',sub:`상위 후보 · 점수 분해`,body:`<div class="cmp-table">
      <div class="cmp-h"><span>후보</span><span>경력</span><span>스킬</span><span>경력적합</span><span>도메인</span><span>매칭</span><span>신호</span></div>
      ${CAND.slice().sort((a,b)=>b.match-a.match).slice(0,8).map(c=>{const fs=flagsOf(c);return `<div class="cmp-r"><span class="cmp-nm"><b class="recr-av sm">${c.ini}</b>${c.name}</span><span>${c.yrs}년</span><span>${c.sk}</span><span>${c.ca}</span><span>${c.dm}</span><span class="cmp-mt"><b>${c.match}%</b></span><span class="cmp-rk">${fs.length?fs.map(f=>`<i class="dot-${f.t==='ok'?'g':(f.t==='risk'?'r':'a')}"></i>`).join(''):'<i class="dot-g"></i>'}${fs.length?fs[0].ko:'해당없음'}</span></div>`;}).join('')}
    </div>`},
    schedule:{ic:'calendar',title:'면접 일정',sub:`${INTERVIEW.length}건 · 1차 기술`,body:`<div class="dlv">
      ${INTERVIEW.map(iv=>{const c=cById(iv.cid);return `<div class="row"><span class="recr-av sm">${c.ini}</span><div style="flex:1"><div class="nm">${c.name} · ${iv.type}</div><div class="why">${iv.slot} · 패널 ${iv.panel}</div></div><span class="tag ok">확정</span></div>`;}).join('')}
      <div class="dlv-sec">조율</div>
      <div class="row"><div style="flex:1"><div class="nm">캘린더 충돌 0 · 면접관 가용 확인</div><div class="why">후보·면접관 양측 캘린더 교차</div></div><span class="tag ok">완료</span></div></div>`},
    offer:{ic:'award',title:'오퍼 패키지',sub:(C)=>`${cById(OFFER.cid).name} · ${C.ex?'밴드 하한':'표준'}`,body:(C)=>{const c=cById(OFFER.cid);return `<div class="doc"><h5>오퍼 · ${c.name}</h5>
      <div class="drow"><span class="dk">직무</span>${JOB.title} (${JOB.team})</div>
      <div class="drow"><span class="dk">매칭</span>${c.match}% · 종합 ${totalScore(c)}</div>
      <div class="drow"><span class="dk">기본급</span>${C.ex?'6,800만':OFFER.base} · ${OFFER.band}</div>
      <div class="drow"><span class="dk">사이닝</span>${C.ex?'없음':OFFER.sign}</div>
      <div class="drow"><span class="dk">입사</span>${OFFER.start}</div>
      <div class="drow"><span class="dk">조건</span>1차+임원 면접 합격 · 레퍼런스 체크 후 확정</div>
      <div class="drow"><span class="dk">승인</span>보상밴드·헤드카운트 검증 통과</div></div>`;}},
  };

  /* =======================================================================
     WORK — 채용 8단계 안무 (캐논 id/actor/gate 구조 유지 · 라벨·ops=채용 고유)
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
    explain:`요건 분석은 추론 루프 <b>Semantic</b> 단계입니다. <b>L4</b>가 요청을 표준 직무 모델로 해석해 JD 초안을 만들고 매칭 가중(스킬·경력·도메인)을 정의하며, <b>L7</b>이 채용 시 적용할 차별금지·개인정보 정책을 답니다.`,
    ops:[{g:0,feed:'직무 유형 매핑',out:'백엔드(서버) · 시니어',L:'L4',comp:'온톨로지·시맨틱',
      detail:odTable('직무 매핑 (신뢰도)',[['백엔드 개발(서버)','0.93','g'],['플랫폼 엔지니어','0.05'],['풀스택','0.02']])},
     {g:1,feed:'JD·요건·가중 정의',out:`필수 4 · 우대 3 · 가중 50/30/20`,L:'L4',comp:'컨텍스트 조합·근거',
      detail:odTable('매칭 가중 정의',[['스킬 적합','50','g'],['경력 적합','30'],['도메인 적합','20'],['평가 항목','5개 (루브릭)']])},
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
     {g:1,feed:'숏리스트 컷 후보 산출',out:`엄격 ${cutCount(90)} / 표준 ${cutCount(85)} / 넓게 ${cutCount(80)}`,L:'L3',comp:'코어·실행 엔진',micro:['컷 시뮬레이션'],
      detail:odTable('컷 후보 (통과수)',[['match ≥ 90',cutCount(90)+'명','g'],['match ≥ 85',cutCount(85)+'명'],['match ≥ 80',cutCount(80)+'명']])},
     {g:2,feed:'검토 게이트 보류',out:'숏리스트 기준 선택 담당자 전달',L:'L3',comp:'HITL 런타임 게이트'}]},

   {id:'prepare',label:'이력서 파싱·매칭·랭킹',role:'AAP 실행',actor:'aap',doneModal:1,
    explain:`승인된 기준대로 AAP가 Agent들을 자율 가동합니다. <b>L5</b>가 이력서를 <b>병렬</b> 수집·OCR 파싱하고(<span class="v">AI:ON-U</span>), <b>L3 코어</b>가 스킬·경력·도메인 가중 매칭·스코어링·랭킹을 수행하며 <b>L6·L7</b>이 편향 점검·정규화합니다.`,
    ops:[{g:0,feed:'이력서 수집·OCR 파싱',out:`${JOB.applicants}건 파싱·정규화`,L:'L5',comp:'연결·수집',asset:1,badge:'AI:ON-U',micro:['ATS 커넥터','OCR'],
      detail:odTable('파싱 결과',[['이력서','38건'],['OCR 정규화','완료','g'],['경력·스킬 추출','완료','g'],['중복·스팸 제거','4건']])},
     {g:0,feed:'JD 요건 매칭 (스킬·경력·도메인)',out:'3축 가중 매칭',L:'L3',comp:'코어·실행 엔진',micro:['요건 매칭']},
     {g:1,feed:'스코어링·랭킹',out:`상위 ${JOB.screened}명 랭킹`,L:'L3',comp:'코어·실행 엔진',micro:['가중합 50/30/20'],
      detail:odTable('랭킹 (매칭% / 종합)',CAND.slice().sort((a,b)=>b.match-a.match).slice(0,5).map((c,i)=>[c.name,`${c.match} / ${totalScore(c)}`,i<2?'g':'']))},
     {g:1,feed:'편향·PII 점검',out:'보호속성 평가 제외 · PII 마스킹',L:'L7',comp:'정책 관리·통제',
      detail:odTable('편향 점검',[['성별·연령·출신','평가 미반영','g'],['사진·신상','마스킹','g'],['스코어 근거','요건 기반만','g']])},
     {g:2,feed:'스코어카드·리포트 반영',out:'스코어카드 10 · 통과/보류/탈락 분류',L:'L8',comp:'스토리지·DB',micro:['ats.write()'],
      detail:odTable('시스템 반영',[['스코어카드','10명 생성','g'],['스크리닝 리포트','생성','g'],['ATS 단계','스크리닝 통과','g']])}]},

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
   {type:'Agent',ty:'tyA',ic:'gauge',name:'요건 매칭 Agent',L:'L3',desc:'JD 필수·우대 요건과 후보 역량을 스킬·경력·도메인 3축으로 대조합니다 (RAG).',when:'파싱 직후 후보를 직무에 매칭할 때.',data:'JD 요건·가중, 파싱된 후보 역량, 스킬 온톨로지',how:'must/plus·경력·도메인을 의미 매칭 → 50/30/20 가중합으로 충족도(%)를 근거와 함께 산출.'},
   {type:'Agent',ty:'tyA',ic:'trending-up',name:'랭킹·스코어 Agent',L:'L3',desc:'가중 점수로 후보를 랭킹하고 통과/보류/탈락을 분류합니다.',when:'매칭 후 후보 우선순위를 정할 때.',data:'매칭 결과, 컷 기준, 직무 기준',how:'3축 가중합 → 매칭%·랭킹·판정·근거 코멘트 생성.'},
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
     보드 진행상태(reached/colOf)는 idxOf(sel) + 담당자 결정(S.decisions)으로 결정론.
     ======================================================================= */
  const STAGES=[
    {k:'screened',ko:'스크리닝 통과'},
    {k:'shortlist',ko:'숏리스트'},
    {k:'interview',ko:'면접'},
    {k:'offer',ko:'오퍼'},
  ];
  /* 현재 단계(sel)에 따라 후보 파이프라인이 어디까지 가시화됐는지(결정론) */
  function reached(C,stageK){
    const i=C.idxOf(C.S.sel);
    if(stageK==='screened'||stageK==='shortlist')return i>=4;   /* prepare 완료부터 */
    if(stageK==='interview')return i>=5;                         /* meeting 부터 */
    if(stageK==='offer')return i>=6;                             /* commit 부터 */
    return false;
  }
  /* 컷 기준(엄격/표준/넓게) → 숏리스트 후보 id 집합. ex(컷 좁힘)도 반영 = '담당자 결정'이 화면에 */
  function cutThreshold(C){
    if(C.ex)return 90;
    const pt=C.S.pickedTime||'';
    if(/90/.test(pt))return 90; if(/80/.test(pt))return 80; return 85;
  }
  function shortlistIds(C){
    const th=cutThreshold(C);
    return CAND.filter(c=>c.match>=th).sort((a,b)=>b.match-a.match).map(c=>c.id);
  }
  /* 후보의 표시 컬럼 — 진행 + 담당자 결정(reject/advance) 반영 */
  function colOf(C,c){
    const dec=(C.S.recrDecisions||{})[c.id];
    if(dec==='reject')return 'screened';            /* 탈락 처리 → 통과 풀로 강등 표시 */
    const i=C.idxOf(C.S.sel), sids=shortlistIds(C);
    if((i>=6||dec==='offer') && c.id===OFFER.cid)return 'offer';
    if((i>=5||dec==='interview') && sids.includes(c.id))return 'interview';
    if(dec==='shortlist'||sids.includes(c.id))return 'shortlist';
    return 'screened';
  }
  function candCard(c,C){
    const sc=totalScore(c), fs=flagsOf(c), top=fs[0];
    const dec=(C&&C.S.recrDecisions)?C.S.recrDecisions[c.id]:null;
    return `<button class="recr-card${hasRisk(c)?' risk':''}${dec==='reject'?' rejected':''}" data-cand="${c.id}">
      <div class="rc-top"><span class="recr-av">${c.ini}</span><div class="rc-id"><div class="rc-nm">${c.name}</div><div class="rc-cur">${c.yrs}년 · ${c.cur}</div></div><span class="rc-mt">${c.match}%</span></div>
      <div class="rc-foot"><span class="rc-sc">${I('gauge')}종합 ${sc}</span>${top?`<span class="rc-flag ${top.t}">${top.ko}</span>`:`<span class="rc-ok">적합</span>`}</div>
    </button>`;
  }

  function head(C){
    const S=C.S,i=C.idxOf(S.sel),w=C.W(S.sel);
    const map={request:['요건 접수','s-info','파이프라인'],understand:['요건 분석','s-info','파이프라인'],compose:['계획 구성','s-info','파이프라인'],
      approve:['검토 필요','s-amber','파이프라인'],prepare:['스크리닝 완료','s-green','후보'],
      meeting:['일정 조율','s-blue','면접'],commit:['오퍼 검토','s-amber','후보'],share:['채용 완료','s-green','후보']};
    const [stt,stc,tab]=map[w.id];
    const known=i>=2;
    const meta=`${JOB.id} · ${JOB.team} · ${known?`${JOB.headcount}명 채용 · 지원 ${JOB.applicants}`:'요건 정의 중'}`;
    const tabs=['파이프라인','후보','스코어카드','면접'].map(t=>`<span class="${t===tab?'on':''}">${t}</span>`).join('');
    return `<div class="hd-top"><span class="hd-ic">${I('briefcase')}</span>
       <div class="hd-main"><div class="hd-title">${JOB.title} <span class="hd-status ${stc}">${stt}</span></div>
       <div class="hd-meta">${meta}</div></div>
       <div class="hd-user">채용담당 한지원${I('chevron-down')}</div></div>
     <div class="hd-tabs">${tabs}<span class="hd-replay" id="replay">${I('rotate-ccw')}다시</span></div>`;
  }

  /* 정렬·필터 바 — 보드가 가시화된 단계(prepare~)부터 노출 */
  function boardTools(C){
    const sort=C.S.recrSort||'match';
    const filt=C.S.recrFilter||'all';
    const sopt=(k,lb)=>`<button class="rbt ${sort===k?'on':''}" data-sort="${k}">${lb}</button>`;
    const fopt=(k,lb)=>`<button class="rbt ${filt===k?'on':''}" data-filt="${k}">${lb}</button>`;
    return `<div class="recr-tools">
      <span class="rbt-lb">정렬</span>${sopt('match','매칭순')}${sopt('score','종합순')}${sopt('yrs','경력순')}
      <span class="rbt-sp"></span><span class="rbt-lb">필터</span>${fopt('all','전체')}${fopt('risk','검토신호')}${fopt('skillhi','스킬매치')}
    </div>`;
  }
  function sortCands(C,arr){
    const s=C.S.recrSort||'match';
    const f=C.S.recrFilter||'all';
    let a=arr.slice();
    if(f==='risk')a=a.filter(hasRisk);
    else if(f==='skillhi')a=a.filter(c=>(c.flags||[]).includes('skillhi'));
    a.sort((x,y)=> s==='score'?(totalScore(y)-totalScore(x)) : s==='yrs'?(y.yrs-x.yrs) : (y.match-x.match));
    return a;
  }

  /* 파이프라인 보드(ATS) */
  function board(C){
    let cols=STAGES.map(st=>{
      const on=reached(C,st.k);
      let cards=on?CAND.filter(c=>colOf(C,c)===st.k):[];
      cards=sortCands(C,cards);
      const n=on?cards.length:0;
      return `<div class="recr-col${on?'':' off'}">
        <div class="rcol-h"><span class="rcol-t">${st.ko}</span><span class="rcol-n">${on?n:'·'}</span></div>
        <div class="rcol-body">${on?(cards.length?cards.map(c=>candCard(c,C)).join(''):'<div class="rcol-empty">—</div>'):'<div class="rcol-empty">준비 전</div>'}</div>
      </div>`;
    }).join('');
    const tools=C.idxOf(C.S.sel)>=4?boardTools(C):'';
    return tools+`<div class="recr-board">${cols}</div>`;
  }

  function base(C){
    const S=C.S,R=C.R,w=C.W(S.sel),id=w.id,working=R.phase==='working';
    const stMap={request:working?'채용 요청을 받고 있어요…':'요건 접수됨 · 분석 시작',understand:working?'AAP가 요건을 분석하고 있어요':'JD·요건·가중 정리됨',
      compose:working?'AAP가 스크리닝 계획을 구성하고 있어요':'스크리닝 계획 준비됨',approve:working?'스크리닝 계획을 정리하고 있어요':'숏리스트 기준 확인 대기',
      prepare:working?'이력서를 파싱·매칭·랭킹하고 있어요':'스크리닝 완료 · 후보 카드를 눌러 상세를 보세요',meeting:working?'면접 일정을 조율하고 있어요':'면접 일정 확인 대기',
      commit:working?'평가를 취합하고 있어요':'오퍼 승인 대기',share:working?'결과를 발송·기록하고 있어요':'채용 완료'};
    let b=`<div class="ws-status">${working?'<span class="spin"></span>':''}${stMap[id]}</div>`;
    if(id==='request'){
      b+=`<div class="ws-req">${WORKLOAD.request}</div>`;
      b+=jdStrip(C,false);
    } else if(id==='understand'){
      const done=!working;
      b+=`<div class="ws-overview ${done?'show':''}"><div class="ov-row"><span>직무</span><b>${JOB.title}</b></div><div class="ov-row"><span>인원</span><b>${JOB.headcount}명 · ${JOB.level}</b></div><div class="ov-row"><span>필수</span><b>${JOB.must.join(' · ')}</b></div><div class="ov-row"><span>우대</span><b>${JOB.plus.join(' · ')}</b></div><div class="ov-row"><span>매칭 가중</span><b>스킬 ${JOB.weight.skill} · 경력 ${JOB.weight.career} · 도메인 ${JOB.weight.domain}</b></div></div>`;
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
  /* JD 요약 스트립(상단 직무 슬롯) */
  function jdStrip(C,known){
    return `<div class="recr-jd"><div class="rjd-l"><span class="rjd-ic">${I('briefcase')}</span><div><div class="rjd-t">${JOB.title}</div><div class="rjd-s">${known?`필수 ${JOB.must.length} · 우대 ${JOB.plus.length} · 가중 ${JOB.weight.skill}/${JOB.weight.career}/${JOB.weight.domain}`:'요건 정의 중'}</div></div></div>
      <div class="rjd-r"><span class="rjd-stat"><b>${JOB.headcount}</b>채용</span><span class="rjd-stat"><b>${C.idxOf(C.S.sel)>=4?JOB.screened:JOB.applicants}</b>${C.idxOf(C.S.sel)>=4?'통과':'지원'}</span><button class="wl-go" data-dlv="jd">JD 보기</button></div></div>`;
  }

  /* 후보 상세(클릭 모달) — 이력서 요약 · 점수 분해(스킬/경력/도메인) · 플래그 · 근거 · 결정 버튼 */
  function candDetail(c,C){
    const bd=breakdown(c), fs=flagsOf(c), v=screenVerdict(c);
    const dec=(C.S.recrDecisions||{})[c.id];
    const bars=bd.map(b=>`<div class="cd-bd-row"><span class="cd-bd-k">${b.k} <em>×${b.w}</em></span><span class="cd-bd-bar"><i style="width:${b.raw}%"></i></span><span class="cd-bd-raw">${b.raw}</span><span class="cd-bd-c">+${b.contrib}</span><span class="cd-bd-sub">${b.sub}</span></div>`).join('');
    const flagH=fs.length?`<div class="cd-flags">${fs.map(f=>`<span class="cd-flag ${f.t}">${f.ko}</span>`).join('')}</div>`:'';
    /* 단계에 따라 가능한 결정: prepare(4)=숏리스트/탈락, meeting(5)=면접확정/탈락, commit+(6)=오퍼 */
    const i=C.idxOf(C.S.sel);
    let acts='';
    if(i===4){
      acts=`<button class="cp-btn primary sm" data-rdec="shortlist" data-cid="${c.id}">숏리스트 승급</button><button class="cp-btn ghost sm" data-rdec="reject" data-cid="${c.id}">탈락 처리</button>`;
    } else if(i===5){
      acts=`<button class="cp-btn primary sm" data-rdec="interview" data-cid="${c.id}">면접 확정</button><button class="cp-btn ghost sm" data-rdec="reject" data-cid="${c.id}">탈락 처리</button>`;
    } else if(i>=6){
      acts=`<button class="cp-btn primary sm" data-rdec="offer" data-cid="${c.id}">오퍼 대상</button><button class="cp-btn ghost sm" data-rdec="reject" data-cid="${c.id}">제외</button>`;
    }
    const decBadge=dec?`<span class="cd-dec ${dec}">${({shortlist:'숏리스트',interview:'면접',offer:'오퍼',reject:'탈락'})[dec]} 처리됨</span>`:'';
    return `<button class="cmodal-back" data-cback>${I('chevron-left')}보드로</button>
      <div class="cd-h"><span class="recr-av lg">${c.ini}</span><div class="cd-id"><div class="cd-nm">${c.name} ${decBadge}</div><div class="cd-cur">${c.yrs}년 · ${c.cur} · ${c.edu}</div></div><div class="cd-mt"><div class="cd-mt-n">${c.match}%</div><div class="cd-mt-l">매칭</div></div></div>
      ${flagH}
      <div class="cd-resume">${c.resume}</div>
      <div class="cd-sec">매칭 점수 분해 <span class="cd-formula">스킬×${JOB.weight.skill} + 경력×${JOB.weight.career} + 도메인×${JOB.weight.domain} = ${c.match}</span></div>
      <div class="cd-bd">${bars}</div>
      <div class="cd-skills">${c.skills.map(s=>`<span class="${JOB.must.some(m=>s.includes(m.split('/')[0])||m.includes(s))?'must':(JOB.plus.includes(s)?'plus':'')}">${s}</span>`).join('')}</div>
      <div class="cd-verdict ${v.t==='ok'?'ok':(v.t==='risk'?'risk':'hold')}">${I(v.t==='risk'?'alert-triangle':'check')}1차 판정 · <b>${v.ko}</b> — ${v.why}</div>
      <div class="cd-hi">${c.hi}</div>
      ${acts?`<div class="cmodal-actions cd-acts">${acts}</div>`:''}`;
  }

  /* 스코어카드 미리보기(HITL/리뷰 내부에서 사용) */
  function scorecard(c){
    return `<div class="recr-sccard"><div class="rsc-h"><span class="recr-av">${c.ini}</span><div><div class="rsc-nm">${c.name} <span class="rsc-mt">매칭 ${c.match}%</span></div><div class="rsc-cur">${c.yrs}년 · ${c.cur} · ${c.edu}</div></div><span class="rsc-tot">${totalScore(c)}</span></div>
      <div class="rsc-resume">${c.resume}</div>
      <div class="rsc-rows">${RUBRIC.map((r,i)=>`<div class="rsc-row"><span class="rsc-k">${r.k}</span><span class="rsc-bar"><i style="width:${c.scores[i]*20}%"></i></span><span class="rsc-v">${c.scores[i]}.0</span></div>`).join('')}</div>
      ${hasRisk(c)?`<div class="rsc-risk">${I('alert-triangle')}${c.hi}</div>`:`<div class="rsc-hi">${c.hi}</div>`}</div>`;
  }

  /* kind: hitl | done | preview(코어 처리) | cand(후보 상세, 팩 커스텀). */
  function cmodal(kind,C){
    const S=C.S,sel=S.sel,ex=C.ex;
    if(kind==='cand'){ const c=cById(S.recrOpen); return c?candDetail(c,C):''; }
    if(kind==='hitl'){
      if(sel==='approve'){
        const th=cutThreshold(C), n=CAND.filter(c=>c.match>=th).length;
        const times=C.times.map((t,i)=>`<button class="rv-time ${t.t===S.pickedTime?'sel':''}" data-time="${i}">${t.t.split(' · ')[0]}<span>${t.t.split(' · ')[1]||''}</span></button>`).join('');
        const top=CAND.slice().sort((a,b)=>b.match-a.match).slice(0,3).map(c=>`${c.name} ${c.match}%`).join(' · ');
        return `<div class="cmodal-h">숏리스트 기준을 확인해 주세요</div><div class="cmodal-sub">AAP가 스크리닝 계획과 컷 후보를 준비했어요. 숏리스트 기준(컷)은 직접 정하세요.</div>
          <div class="rv">
            <div class="rv-sec"><div class="rv-k">스크리닝 계획<button class="rv-more" data-dlv="report">리포트 보기</button></div><div class="rv-sum">이력서 ${JOB.applicants}건 파싱 → 스킬·경력·도메인 ${JOB.weight.skill}/${JOB.weight.career}/${JOB.weight.domain} 가중 매칭 → 루브릭 스코어링 (편향·PII 점검 포함)</div></div>
            <div class="rv-sec"><div class="rv-k">숏리스트 기준 (컷) <span class="rv-hint">현재 ${th}% → ${n}명</span></div><div class="rv-times">${times}</div></div>
            <div class="rv-sec"><div class="rv-k">미리 본 상위 후보<button class="rv-more" data-dlv="compare">비교표 보기</button></div><div class="rv-sum">${top}</div></div>
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
        const top=CAND.slice().sort((a,b)=>b.match-a.match).slice(0,3);
        const pass=CAND.filter(c=>screenVerdict(c).k==='pass').length, hold=CAND.filter(c=>screenVerdict(c).k==='hold').length, drop=CAND.filter(c=>screenVerdict(c).k==='drop').length;
        return `<button class="cmodal-x" data-close>${I('x')}</button><div class="cmodal-h done">스크리닝이 끝났어요 <span class="cp-check">${I('check')}</span></div>
          <div class="mtcard"><div class="mt-row"><span class="mt-ic">${I('briefcase')}</span><div><div class="mt-title">${JOB.title}</div><div class="mt-when">지원 ${JOB.applicants} → 통과 ${pass} · 보류 ${hold} · 탈락 ${drop} · 스코어카드 ${JOB.screened}건</div></div></div>
          <div class="recr-mini">${top.map(c=>`<div class="rm-r"><span class="recr-av sm">${c.ini}</span><span class="rm-nm">${c.name}</span><span class="rm-mt">${c.match}%</span><span class="rm-sc">${totalScore(c)}</span></div>`).join('')}</div>
          <div class="mt-foot">${I('check')} 편향·PII 점검 통과 · 후보 카드를 눌러 점수 분해를 보세요 <button class="wl-go" data-dlv="compare" style="margin-left:6px">비교표</button></div></div>
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

  /* surface 가 코어에 노출하는 인터랙션 훅 (도메인 무관 코어가 호출).
     - currentCM: 후보 상세가 열렸으면 'cand' 모달을 우선 표시
     - wire: surface 내 후보 카드 클릭·정렬/필터·후보 결정 버튼 배선
     - decideHook: HITL decide 결과를 채용 보드 상태로 번역(컷·진행) */
  const SURF_HOOKS={
    /* 후보 상세 모달 우선 (HITL/done 보다 위) */
    currentCM:(S)=> S.recrOpen?'cand':null,
    /* surface 루트(#surfHead/#surfBody)·모달(#cmodal) 공통 배선 */
    wire:(root,S,rerender)=>{
      root.querySelectorAll('[data-cand]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();S.recrOpen=e.dataset.cand;rerender();});
      root.querySelectorAll('[data-sort]').forEach(e=>e.onclick=()=>{S.recrSort=e.dataset.sort;rerender();});
      root.querySelectorAll('[data-filt]').forEach(e=>e.onclick=()=>{S.recrFilter=e.dataset.filt;rerender();});
      root.querySelectorAll('[data-cback]').forEach(e=>e.onclick=()=>{S.recrOpen=null;rerender();});
      root.querySelectorAll('[data-rdec]').forEach(e=>e.onclick=()=>{
        S.recrDecisions=S.recrDecisions||{}; S.recrDecisions[e.dataset.cid]=e.dataset.rdec; S.recrOpen=null;
        rerender({persist:true, toast:({shortlist:'숏리스트로 승급했습니다',interview:'면접을 확정했습니다',offer:'오퍼 대상으로 지정했습니다',reject:'탈락 처리했습니다'})[e.dataset.rdec], trace:{t:'후보 결정 · '+e.dataset.cid+' → '+e.dataset.rdec,L:'L7',k:'HITL'}});
      });
    },
    /* HITL 게이트 결정을 보드 상태로 (decide 후 코어가 호출). v=yes/no */
    decideHook:(S,v,sel)=>{
      if(sel==='approve' && v==='yes'){ /* 표준 컷 확정 — 숏리스트 자동 배치 */ }
      if(sel==='commit' && v==='yes'){ S.recrDecisions=S.recrDecisions||{}; S.recrDecisions[OFFER.cid]='offer'; }
    },
    /* STATE 영속 키(코어 persistToCase/hydrate 가 케이스에 같이 저장) */
    persistKeys:['recrDecisions','recrSort','recrFilter'],
    /* 케이스 간 초기화할 transient 키(열린 상세 모달) */
    transientKeys:['recrOpen'],
  };

  /* 데모용 시드 케이스(인스턴스) — 서로 다른 진행 상태 */
  const SEEDS=[
    {title:'백엔드 개발자 2명 채용', customer:'플랫폼개발팀 · JD-2041', icon:'💼', request:WORKLOAD.request, atStep:'approve', pickedTime:'표준 · match ≥ 85'},
    {title:'프로덕트 디자이너 채용', customer:'디자인팀 · JD-2052', icon:'💼', request:'"프로덕트 디자이너 1명 채용해줘. 포트폴리오 1차 스크리닝부터."', atStep:'request'},
    {title:'데이터 분석가 채용 마감', customer:'데이터팀 · JD-2030', icon:'💼', request:'"데이터 분석가 1명, 오퍼까지 진행해줘."', status:'done'},
  ];

  /* =======================================================================
     시연 모드(Guide Mode) 시나리오 — 데이터로 정의(코어 가이드 엔진이 재생).
     ======================================================================= */
  const DEMO_SCENARIO={
    id:'recruiting',
    title:'채용 스크리닝·코디네이션',
    desc:'"백엔드 2명 충원" 요청 한 건이 AAP에서 요건 분해→구성요소 조합→자율 스크리닝→사람 승인→면접·오퍼로 이어지는 한 흐름을 짚어 봅니다.',
    icon:'briefcase',
    steps:[
      {do:{view:'inbox'}, target:'#inboxList, #gnav [data-view="inbox"]',
       title:'한 인박스로 여러 업무가 들어옵니다',
       body:'채용·VOC·회의 등 여러 유형의 요청이 하나의 통합 인박스로 들어옵니다. 채용 건을 열어 AAP가 이 요청을 어떻게 처리하는지 따라가 보겠습니다.'},
      {do:{open:1, go:'understand'}, target:'#seq',
       title:'AAP가 요청을 요건으로 분해합니다',
       body:'"백엔드 2명 충원" 한 문장을 AAP가 직무·인원·연차·필수 스택으로 분해하고, 매칭 가중(스킬·경력·도메인)과 차별금지·개인정보 정책까지 자율로 달아 실행 흐름을 세웁니다.'},
      {do:{go:'compose'}, target:'#flow',
       title:'필요한 구성요소를 골라 조합합니다',
       body:'AAP는 Agent를 많이 띄우는 게 아닙니다. 이력서 파싱·요건 매칭 Agent, OCR·편향 점검 Module, 기존 ATS, 캘린더 Connector, 차별금지 Policy를 업무에 맞게 골라 실행 구조로 조합합니다.'},
      {do:{go:'approve'}, target:'#cmodal .cmodal-card',
       title:'책임이 걸린 지점은 사람이 정합니다 (HITL ①)',
       body:'AAP가 스크리닝 계획과 숏리스트 컷 후보(엄격/표준/넓게)를 제시합니다. 어느 기준으로 거를지 — 숏리스트 컷은 채용담당이 직접 정하는 첫 번째 게이트입니다.'},
      {do:{go:'prepare'}, target:'.con-body .recr-board',
       title:'승인된 기준대로 AAP가 자율 실행합니다',
       body:'담당자가 정한 기준대로 AAP가 이력서 38건을 병렬 파싱·매칭·랭킹하고 편향·PII를 점검합니다. 후보 파이프라인 보드가 채워지고, 후보 카드를 누르면 점수 분해(스킬·경력·도메인)와 판정 근거가 보입니다.'},
      {do:{go:'meeting'}, target:'#cmodal .cmodal-card',
       title:'외부로 나가는 안내는 사람이 확인합니다 (HITL ②)',
       body:'AAP가 후보·면접관 캘린더를 교차해 충돌 0 슬롯을 잡았습니다. 후보에게 안내가 나가는 단계라, 일정·패널을 담당자가 확인한 뒤 발송합니다.'},
      {do:{go:'commit'}, target:'#cmodal .cmodal-card',
       title:'오퍼 발송 직전, 최종 승인을 받습니다 (HITL ③)',
       body:'AAP가 평가를 취합하고 보상밴드·헤드카운트·차별금지를 점검했습니다. 후보에게 오퍼가 나가는 마지막 행동은 담당자·현업 리드의 최종 승인으로 멈춰 둡니다.'},
      {do:{view:'logs'}, target:'#traceLog',
       title:'모든 판단이 기록되고 학습으로 남습니다',
       body:'요청→파싱→매칭→사람 승인→오퍼까지 전 구간이 Run Trace에 남아 감사·재현이 가능합니다. 이번 채용 패턴은 다음 포지션의 매칭 정확도를 높이는 학습 자산이 됩니다.'},
    ],
  };

  (window.AAP_PACKS=window.AAP_PACKS||{}).recruiting={
    id:'recruiting', label:'채용',
    times:TIMES, products:PRODUCTS, work:WORK, components:COMPONENTS, compose:COMPOSE,
    workload:WORKLOAD, planProduces:PLAN_PRODUCES, gates:GATES, govern:GOVERN, seeds:SEEDS,
    demoScenario:DEMO_SCENARIO,
    stepLoop:{request:'Data',understand:'Semantic',compose:'Reasoning',approve:'Decision',prepare:'Action',meeting:'Decision',commit:'Decision',share:'Learning'},
    extExcluded:(S)=>S.decisions['approve']==='no',
    /* (b) 함수형 surface — ATS 화면을 코어 generic 렌더 대신 이 팩이 직접 그린다 */
    surface:{head, base, cmodal},
    /* 도메인 인터랙션 훅(코어가 일반 메커니즘으로 호출) */
    surfaceHooks:SURF_HOOKS,
  };
})();
