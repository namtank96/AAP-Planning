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
  /* ── 케이스 단위 가중/컷 격리(P5) — 공유 JOB.weight·c.match 를 절대 mutate ✕ ──
     STATE.recrWeight(있으면 우선) 로 후보 match 를 결정론 재계산. 원본 c.sk/ca/dm·c.match(JOB.weight) 불변.
     정규화: 합 100 보장. STATE.recrCut(있으면 우선) 로 컷 임계값. */
  /* 정규화(합 100, domain=잔차) — 슬라이더 2축 + 잔차로 일관 */
  function normWeight(C){
    const w=(C&&C.S&&C.S.recrWeight)||JOB.weight;
    let sk=+w.skill||0, ca=+w.career||0, dm=+w.domain||0; const s=sk+ca+dm||1;
    sk=Math.round(sk/s*100); ca=Math.round(ca/s*100); dm=100-sk-ca;
    return { skill:sk, career:ca, domain:dm };
  }
  /* 후보 match(케이스 가중 반영) — STATE.recrWeight 없으면 기본 c.match 그대로(JOB.weight). */
  function mOf(C,c){
    if(!(C&&C.S&&C.S.recrWeight))return c.match;
    const w=normWeight(C);
    return Math.round(c.sk*w.skill/100 + c.ca*w.career/100 + c.dm*w.domain/100);
  }
  /* 케이스 컷 임계값(있으면 STATE.recrCut, 없으면 단계 선택값) */
  function cutOf(C){ const v=C&&C.S&&C.S.recrCut; return (typeof v==='number'&&v>=70&&v<=100)?v:null; }
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
  function breakdown(c,C){
    const w=C?normWeight(C):JOB.weight;   /* 케이스 가중(편집됐으면) 우선 — 공유 JOB.weight 불변 */
    return [
      {k:'스킬 적합', raw:c.sk, w:w.skill, sub:`must ${c.skills.filter(s=>JOB.must.some(m=>m.includes(s.split('/')[0])||s.includes(m.split('/')[0]))).length}/${JOB.must.length} · plus ${c.skills.filter(s=>JOB.plus.includes(s)).length}/${JOB.plus.length}`},
      {k:'경력 적합', raw:c.ca, w:w.career, sub:`${c.yrs}년 (요건 ${JOB.minYrs}~${JOB.maxYrs}년)`},
      {k:'도메인 적합', raw:c.dm, w:w.domain, sub:`${c.dom} ↔ ${JOB.domain.split(' ')[0]}`},
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
  /* ── 스크리닝 결정 룰(SCREEN_ROUTE) — 수렴 ②: 결정 메커니즘 1개(코어 evaluate)로 통합.
     점수(match)·리스크(has_risk)는 도메인 연산, 통과/보류/탈락 분기는 이 선언형 DSL 이 소유.
     outcome 3분기(도메인 무관) → 채용 의미 매핑: AUTO_APPROVE=통과 · LEGAL_REVIEW=보류 · REJECT=탈락.
     위→아래 첫 매칭(evaluate). 기존 screenVerdict 부등식과 동치(경계값 90/84/82/80/75/65 검증). ── */
  const SCREEN_ROUTE={ rules:[
    {id:'rc_pass',      outcome:'AUTO_APPROVE', label:'통과', basis:'must·plus 충족 · 리스크 없음',
      when:{ all:[ {'>=':['$match',85]}, {'==':['$has_risk',false]} ] }},
    {id:'rc_hold_risk', outcome:'LEGAL_REVIEW', label:'보류', basis:'요건 충족하나 검토 신호 있음',
      when:{ all:[ {'>=':['$match',80]}, {'==':['$has_risk',true]} ] }},
    {id:'rc_hold',      outcome:'LEGAL_REVIEW', label:'보류', basis:'우대 요건 일부 미충족',
      when:{ '>=':['$match',80] }},
    {id:'rc_drop_req',  outcome:'REJECT',       label:'탈락', basis:'필수/경력 요건 미달',
      when:{ '<':['$match',70] }},
  ], default:{ id:'rc_drop_cut', outcome:'REJECT', label:'탈락', basis:'요건 충족도 컷 미달' } };
  const SV_MAP={ AUTO_APPROVE:{k:'pass',ko:'통과',t:'ok'}, LEGAL_REVIEW:{k:'hold',ko:'보류',t:'warn'}, REJECT:{k:'drop',ko:'탈락',t:'risk'} };
  /* 스크리닝 판정 — 결정은 코어 evaluate(case,knowledge)가 소유. 점수·리스크만 도메인이 산출. */
  function screenVerdict(c){
    const ev=window.AAP_EVALUATE;
    if(ev&&ev.evaluate){
      const v=ev.evaluate({match:c.match, has_risk:hasRisk(c)}, {route:SCREEN_ROUTE});
      const m=SV_MAP[v.outcome]||SV_MAP.REJECT;
      return {k:m.k, ko:m.ko, t:m.t, why:v.basis};
    }
    /* 폴백(evaluate 미적재) — 동일 로직 */
    if(c.match>=85 && !hasRisk(c)) return {k:'pass',ko:'통과',t:'ok',why:'must·plus 충족 · 리스크 없음'};
    if(c.match>=80) return {k:'hold',ko:'보류',t:'warn',why:hasRisk(c)?'요건 충족하나 검토 신호 있음':'우대 요건 일부 미충족'};
    return {k:'drop',ko:'탈락',t:'risk',why:c.match<70?'필수/경력 요건 미달':'요건 충족도 컷 미달'};
  }
  const PRODUCTS={
    jd:{ic:'briefcase',title:'직무 기술서',readyAt:'analyze',sub:`${JOB.id} · ${JOB.headcount}명 채용`,body:`<div class="doc"><h5>${JOB.title}</h5>
      <div class="drow"><span class="dk">팀</span>${JOB.team} · ${JOB.level}</div>
      <div class="drow"><span class="dk">인원</span>${JOB.headcount}명</div>
      <div class="drow"><span class="dk">필수</span>${JOB.must.join(' · ')}</div>
      <div class="drow"><span class="dk">우대</span>${JOB.plus.join(' · ')}</div>
      <div class="drow"><span class="dk">도메인</span>${JOB.domain}</div>
      <div class="drow"><span class="dk">매칭 가중</span>스킬 ${JOB.weight.skill} · 경력 ${JOB.weight.career} · 도메인 ${JOB.weight.domain}</div>
      <div class="drow"><span class="dk">지원</span>총 ${JOB.applicants}명 → 1차 스크리닝 통과 ${JOB.screened}명</div></div>`},
    report:{ic:'file-text',title:'스크리닝 리포트',readyAt:'screen',sub:`지원 ${JOB.applicants} → 통과/보류/탈락 분류`,body:(()=>{
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
    compare:{ic:'list',title:'후보 비교표',readyAt:'screen',sub:`상위 후보 · 점수 분해`,body:`<div class="cmp-table">
      <div class="cmp-h"><span>후보</span><span>경력</span><span>스킬</span><span>경력적합</span><span>도메인</span><span>매칭</span><span>신호</span></div>
      ${CAND.slice().sort((a,b)=>b.match-a.match).slice(0,8).map(c=>{const fs=flagsOf(c);return `<div class="cmp-r"><span class="cmp-nm"><b class="recr-av sm">${c.ini}</b>${c.name}</span><span>${c.yrs}년</span><span>${c.sk}</span><span>${c.ca}</span><span>${c.dm}</span><span class="cmp-mt"><b>${c.match}%</b></span><span class="cmp-rk">${fs.length?fs.map(f=>`<i class="dot-${f.t==='ok'?'g':(f.t==='risk'?'r':'a')}"></i>`).join(''):'<i class="dot-g"></i>'}${fs.length?fs[0].ko:'해당없음'}</span></div>`;}).join('')}
    </div>`},
    schedule:{ic:'calendar',title:'면접 일정',readyAt:'interview_gate',sub:`${INTERVIEW.length}건 · 1차 기술`,body:`<div class="dlv">
      ${INTERVIEW.map(iv=>{const c=cById(iv.cid);return `<div class="row"><span class="recr-av sm">${c.ini}</span><div style="flex:1"><div class="nm">${c.name} · ${iv.type}</div><div class="why">${iv.slot} · 패널 ${iv.panel}</div></div><span class="tag ok">확정</span></div>`;}).join('')}
      <div class="dlv-sec">조율</div>
      <div class="row"><div style="flex:1"><div class="nm">캘린더 충돌 0 · 면접관 가용 확인</div><div class="why">후보·면접관 양측 캘린더 교차</div></div><span class="tag ok">완료</span></div></div>`},
    offer:{ic:'award',title:'오퍼',readyAt:'offer_gate',sub:(C)=>`${cById(OFFER.cid).name} · ${C.ex?'밴드 하한':'표준'}`,body:(C)=>{const c=cById(OFFER.cid);return `<div class="doc"><h5>오퍼 · ${c.name}</h5>
      <div class="drow"><span class="dk">직무</span>${JOB.title} (${JOB.team})</div>
      <div class="drow"><span class="dk">매칭</span>${c.match}% · 종합 ${totalScore(c)}</div>
      <div class="drow"><span class="dk">기본급</span>${C.ex?'6,800만':OFFER.base} · ${OFFER.band}</div>
      <div class="drow"><span class="dk">사이닝</span>${C.ex?'없음':OFFER.sign}</div>
      <div class="drow"><span class="dk">입사</span>${OFFER.start}</div>
      <div class="drow"><span class="dk">조건</span>1차+임원 면접 합격 · 레퍼런스 체크 후 확정</div>
      <div class="drow"><span class="dk">승인</span>보상밴드·헤드카운트 검증 통과</div></div>`;}},
  };

  /* =======================================================================
     FLOW — 채용 도메인 단계 그래프 (Pack Contract v2 · 2b 정통화)
     회의 틀(request/understand/compose/approve/prepare/meeting/commit/share) 탈피.
     채용 네이티브 9단계: intake→analyze→design→[shortlist_gate]→screen→
     [interview_gate]→evaluate→[offer_gate]→record. 게이트 3 · 면접은 조율(gate)과
     평가(auto) 분리(회의처럼 live 세션 ✕). screen 에서 후보 보류/탈락 분기(colOf).
     ======================================================================= */
  const FLOW=[
   {id:'intake',label:'요건 접수',role:'채용 요청',actor:'human',kind:'input',loopPhase:'Data',
    explain:`요건 접수는 추론 루프의 시작입니다. <b>L1 경험·접근</b>(채용 요청 폼)이 현업의 채용 요청을 접수하고, <b>L4 지식·시맨틱</b>이 직무·인원·필수역량 신호를 추출합니다.`,
    ops:[{g:0,feed:'채용 요청 수신',out:'"백엔드 개발자 2명, 4~8년차로 충원해줘"',L:'L1',comp:'채용 요청 폼·챗 UI',
      reads:['현업(플랫폼개발팀)의 한 줄 요청'],
      ev:{ data:['"백엔드 개발자 2명, 4~8년차로 충원해줘"'], logic:['채용 업무 요청으로 판단 → 추론 루프 시작'] },
      prod:{ sys:['채용 Work Event 생성'] }},
     {g:1,feed:'핵심 신호 추출',out:'직무·인원·연차·필수 스택',L:'L4',comp:'온톨로지·시맨틱',
      reads:['요청 문장','직무 온톨로지(스킬·직군 사전)'],
      ev:{ data:['추출 — 직무: 백엔드 개발자 / 인원: 2명 / 연차: 4~8년 / 필수: Java·Kotlin·Spring·MSA'],
        lookup:['요청 어휘를 직무 온톨로지에 대조'],
        logic:['명시된 신호와 표준 직무 속성을 매핑해 구조화'] },
      prod:{ doc:['구조화된 요건 신호'] },
      detail:odTable('추출된 신호',[['직무','백엔드 개발자'],['인원','2명'],['연차','경력 4~8년'],['필수 스택','Java/Kotlin·Spring·MSA']])},
     {g:2,feed:'정해진 것/빈 것 구분',out:'우대요건·스크리닝 기준 미정',L:'L4',comp:'컨텍스트 조합·근거',
      reads:['추출된 요건 신호','채용 프로세스 표준(필요 항목)'],
      ev:{ data:['정해짐 — 직무·인원·연차·필수 스택 / 미정 — 우대요건·스크리닝 컷·면접 패널·보상밴드'],
        rule:['스크리닝 시작 전 컷·평가기준·승인선이 정해져야 함'],
        logic:['표준 대비 빠진 항목을 식별 → 이후 단계·HITL에서 채움'] },
      prod:{ doc:['미정 항목 체크리스트'] },
      detail:odTable('미정 항목',[['우대요건','초안 필요','a'],['스크리닝 컷','미정','a'],['면접 패널','미정','a'],['보상밴드','승인 필요','a']])}]},

   {id:'analyze',label:'요건 분석',role:'AAP 분석',actor:'aap',kind:'auto',loopPhase:'Semantic',
    explain:`요건 분석은 추론 루프 <b>Semantic</b> 단계입니다. <b>L4</b>가 요청을 표준 직무 모델로 해석해 JD 초안을 만들고 매칭 가중(스킬·경력·도메인)을 정의하며, <b>L7</b>이 채용 시 적용할 차별금지·개인정보 정책을 답니다.`,
    ops:[{g:0,feed:'직무 유형 매핑',out:'백엔드(서버) · 시니어',L:'L4',comp:'온톨로지·시맨틱',
      reads:['구조화된 요건 신호','표준 직무 모델(직군 온톨로지)'],
      ev:{ data:['매핑 신뢰도 — 백엔드 개발(서버) 0.93 · 플랫폼 엔지니어 0.05 · 풀스택 0.02'],
        lookup:['필수 스택(Java·Kotlin·MSA)을 직군별 대표 역량과 대조'],
        rule:['최고 신뢰도 직군으로 1차 매핑, 0.1 미만 후보는 배제'],
        logic:['요청 역량 분포가 백엔드(서버) 대표 역량과 0.93 일치 → 시니어(연차 4~8) 확정'] },
      prod:{ doc:['직무 매핑 결과'] },
      detail:odTable('직무 매핑 (신뢰도)',[['백엔드 개발(서버)','0.93','g'],['플랫폼 엔지니어','0.05'],['풀스택','0.02']])},
     {g:1,feed:'JD·요건·가중 정의',out:`필수 4 · 우대 3 · 가중 50/30/20`,L:'L4',comp:'컨텍스트 조합·근거',
      reads:['직무 매핑 결과','직군 표준 JD 템플릿','과거 채용 가중 이력'],
      ev:{ data:['필수 4(Java/Kotlin·Spring·MSA·RDB) · 우대 3(Kafka·AWS·대용량) · 가중 스킬50/경력30/도메인20'],
        rule:['백엔드 직군 기본 가중 = 스킬 우선(50)','대용량 도메인 가산'],
        logic:['표준 JD에 매핑 직군·연차를 반영해 필수/우대 분류 → 매칭 가중·루브릭 5항 정의'] },
      prod:{ doc:['JD 초안','매칭 가중·루브릭'] },
      detail:odTable('매칭 가중 정의',[['스킬 적합','50','g'],['경력 적합','30'],['도메인 적합','20'],['평가 항목','5개 (루브릭)']])},
     {g:2,feed:'채용 정책 확인',out:'차별금지·PII → 보호속성 평가 제외',L:'L7',comp:'정책 관리·통제',
      reads:['채용 차별금지 규정 v2','개인정보(PII) 보호 정책'],
      ev:{ lookup:['적용 대상 정책 조회 — 채용 차별금지 v2'],
        rule:['성·연령·출신 등 보호속성은 스코어링 평가에서 제외','이력서 PII는 마스킹 후 처리'],
        logic:['스코어링 입력에서 보호속성 필드를 차단하도록 매칭 단계에 가드 부착'] },
      prod:{ sys:['평가 가드레일 설정(보호속성 차단)'] },
      detail:odTable('정책 점검',[['보호속성(성·연령·출신)','평가 제외','a'],['개인정보','마스킹 처리','a'],['적용 정책','채용 차별금지 v2']])}]},

   {id:'design',label:'스크리닝 설계',role:'AAP 구성',actor:'aap',kind:'auto',loopPhase:'Reasoning',showCompose:1,
    explain:`핵심 단계입니다. AAP는 Agent를 많이 띄우는 게 아니라, 채용 업무를 작업으로 분해하고 <b>L2 설계·개발</b>·<b>L3 코어</b>에서 필요한 <b>Agent·모듈·기존 ATS·Connector·정책</b>을 골라 운영 가능한 스크리닝 실행 구조로 조합합니다.`,
    ops:[{g:0,feed:'작업 분해',out:'파싱·매칭·랭킹·일정·평가취합 그래프',L:'L2',comp:'설계·개발 환경',
      reads:['JD·매칭 가중','채용 프로세스 표준'],
      ev:{ rule:['채용 업무를 표준 작업 그래프로 분해'],
        logic:['파싱→매칭→랭킹→일정→취합 5개 작업으로 분해 + 의존성 설정(T1→T2→T3, T4·T5)'] },
      prod:{ doc:['작업 그래프(T1~T5)'] },
      detail:odTable('작업 그래프 (5)',[['T1 이력서 파싱',''],['T2 요건 매칭',''],['T3 랭킹·스코어',''],['T4 면접 일정',''],['T5 평가 취합·반영','']])},
     {g:1,feed:'데이터·근거 식별',out:'ATS·지원자 DB·캘린더 연결 대상',L:'L5',comp:'연결·수집',
      reads:['작업별 입력 요구','연결 가능 시스템 목록'],
      ev:{ lookup:['각 작업이 필요로 하는 데이터원 식별'],
        data:['ATS(지원자 DB)·캘린더·메일·HRIS(보상밴드)'],
        logic:['작업→데이터원 매핑 → 커넥터 연결 대상 확정'] },
      prod:{ doc:['연결 대상 목록'] }},
     {g:2,feed:'구성요소 배정·조합',out:'Agent 6 · Module 3 · ATS 2 · Connector 4 · Policy 3',L:'L3',comp:'코어·실행 엔진',micro:['Agent','Module','Solution','Connector','Policy'],
      reads:['작업 그래프','구성요소 레지스트리(5타입)'],
      ev:{ rule:['추론 작업=Agent / 결정론=Module / 외부 시스템=기존솔루션·Connector / 통제=Policy'],
        logic:['작업 성격별로 적합 구성요소 선택·배정 → Agent6·Module3·ATS2·Connector4·Policy3 조합(Agent 남발 ✕)'] },
      prod:{ sys:['운영 가능한 스크리닝 실행 구조'] },
      detail:odTable('조합한 구성요소',[['Agent','6'],['Module','3'],['기존 ATS/HRIS','2'],['Connector','4'],['Policy','3']])},
     {g:3,feed:'누락·편향 점검',out:'편향·요건 누락 리스크 표시',L:'L6',comp:'품질·근거 평가',asset:1,badge:'Antbot',
      reads:['조합된 실행 구조','요건·차별금지 규칙'],
      ev:{ rule:['편향 신호·요건 누락·스코어 일관성 점검(Antbot)'],
        data:['편향 신호 평가제외 확인 · 요건 누락 없음 · 스코어 일관성 검증'] },
      prod:{ doc:['설계 리스크 리포트'] },
      detail:odTable('리스크 (Antbot)',[['편향 신호','평가 제외 확인','g'],['요건 누락','없음','g'],['스코어 일관성','검증','g']])}]},

   {id:'shortlist_gate',label:'숏리스트 기준 승인',role:'사람 확인 ①',actor:'hitl',hitl:1,kind:'gate',loopPhase:'Decision',
    gate:{label:'숏리스트 기준 승인',decisions:[{key:'yes',label:'이 기준으로 스크리닝',toast:'숏리스트 컷 확정 · 스크리닝을 시작합니다'},{key:'no',label:'컷 좁히기(≥90)',toast:'컷을 ≥90으로 좁혀 진행합니다'}]},
    explain:`<b>L3 런타임 게이트</b>가 스크리닝 실행 전 책임 지점을 멈춥니다. AAP가 스크리닝 계획과 숏리스트 컷 후보를 제시하고, <b>숏리스트 기준(컷)은 채용담당이 결정</b>합니다. (★ HITL ①)`,
    ops:[{g:0,feed:'스크리닝 계획 제시',out:'파싱·매칭 방식 · 평가 항목 요약',L:'L1',comp:'채용 콘솔·챗 UI',
      reads:['설계된 스크리닝 실행 구조'],
      ev:{ logic:['파싱·매칭 방식·평가 항목(루브릭 5)을 담당자가 보도록 요약 제시'] },
      prod:{ doc:['스크리닝 계획서'] }},
     {g:1,feed:'숏리스트 컷 후보 산출',out:`엄격 ${cutCount(90)} / 표준 ${cutCount(85)} / 넓게 ${cutCount(80)}`,L:'L3',comp:'코어·실행 엔진',micro:['컷 시뮬레이션'],
      reads:['후보 매칭 점수 분포'],
      ev:{ data:[`컷별 통과 — ≥90 ${cutCount(90)}명 / ≥85 ${cutCount(85)}명 / ≥80 ${cutCount(80)}명`],
        rule:['컷(매칭 임계)은 사람이 결정 — 자동 확정 ✕'],
        logic:['컷 임계별 통과 후보 수를 결정론적으로 시뮬레이션해 선택지로 제시'] },
      prod:{ doc:['컷 시뮬레이션'] },
      detail:odTable('컷 후보 (통과수)',[['match ≥ 90',cutCount(90)+'명','g'],['match ≥ 85',cutCount(85)+'명'],['match ≥ 80',cutCount(80)+'명']])},
     {g:2,feed:'검토 게이트 보류',out:'숏리스트 기준 선택 담당자 전달',L:'L3',comp:'HITL 런타임 게이트',
      reads:['컷 후보·스크리닝 계획'],
      ev:{ rule:['스크리닝 실행 전 컷 기준은 담당자 확정 필수 (HITL 게이트)'],
        logic:['기준 선택을 담당자에게 전달 → 승인 시에만 스크리닝 시작'] },
      prod:{ sys:['HITL 결정 대기 등록'] }}]},

   {id:'screen',label:'이력서 수집·스크리닝',role:'AAP 실행',actor:'aap',doneModal:1,kind:'auto',loopPhase:'Action',
    explain:`승인된 기준대로 AAP가 Agent들을 자율 가동합니다. <b>L5</b>가 이력서를 <b>병렬</b> 수집·OCR 파싱하고(<span class="v">AI:ON-U</span>), <b>L3 코어</b>가 스킬·경력·도메인 가중 매칭·스코어링·랭킹을 수행하며 후보를 통과/<b>보류</b>/<b>탈락</b>으로 분기합니다. <b>L6·L7</b>이 편향 점검·정규화합니다.`,
    ops:[{g:0,feed:'이력서 수집·OCR 파싱',out:`${JOB.applicants}건 파싱·정규화`,L:'L5',comp:'연결·수집',asset:1,badge:'AI:ON-U',micro:['ATS 커넥터','OCR'],
      reads:['ATS 지원자 풀','첨부 이력서(PDF·이미지)'],
      ev:{ data:[`지원 ${JOB.applicants}건 · 중복·스팸 4건 제거`],
        lookup:['ATS 커넥터로 지원자·이력서 조회'],
        logic:['OCR로 비정형 이력서 디지털화 → 경력·스킬·기간 구조화·정규화'] },
      prod:{ doc:['정규화 이력서'] },
      detail:odTable('파싱 결과',[['이력서','38건'],['OCR 정규화','완료','g'],['경력·스킬 추출','완료','g'],['중복·스팸 제거','4건']])},
     {g:0,feed:'JD 요건 매칭 (스킬·경력·도메인)',out:'3축 가중 매칭',L:'L3',comp:'코어·실행 엔진',micro:['요건 매칭'],
      reads:['정규화 이력서','JD 필수·우대·가중'],
      ev:{ rule:['스킬50·경력30·도메인20 가중'],
        logic:['must/plus·연차·도메인을 3축 의미매칭 → 후보별 충족도(%) 산출'] },
      prod:{ doc:['후보별 매칭 결과'] }},
     {g:1,feed:'스코어링·랭킹·분기',out:`상위 ${JOB.screened}명 랭킹 · 통과/보류/탈락`,L:'L3',comp:'코어·실행 엔진',micro:['가중합 50/30/20'],
      reads:['매칭 결과','컷 기준','리스크 신호'],
      ev:{ data:[`상위 ${JOB.screened}명 랭킹 — 정유진 96 · 이하늘 92 · 임재훈 88 …`],
        rule:['통과 ≥85·리스크없음 / 보류 ≥80 / 탈락 <80 (evaluate 룰)'],
        logic:['3축 가중합 → 랭킹 → evaluate 결정 룰로 통과/보류/탈락 분기(근거 동반)'] },
      prod:{ doc:['후보 랭킹·판정'] },
      detail:odTable('랭킹 (매칭% / 종합)',CAND.slice().sort((a,b)=>b.match-a.match).slice(0,5).map((c,i)=>[c.name,`${c.match} / ${totalScore(c)}`,i<2?'g':'']))},
     {g:1,feed:'편향·PII 점검',out:'보호속성 평가 제외 · PII 마스킹',L:'L7',comp:'정책 관리·통제',
      reads:['스코어 근거','PII 패턴·차별금지 규칙'],
      ev:{ rule:['보호속성(성·연령·출신) 평가 미반영 · 이력서 PII 마스킹'],
        data:['성·연령·출신 미반영 · 사진·신상 마스킹 · 스코어 근거=요건 기반만'],
        logic:['스코어 근거가 보호속성에 의존하는지 검증 → 의존 시 차단·재산출'] },
      prod:{ sys:['편향 점검 통과 라벨'] },
      detail:odTable('편향 점검',[['성별·연령·출신','평가 미반영','g'],['사진·신상','마스킹','g'],['스코어 근거','요건 기반만','g']])},
     {g:2,feed:'스코어카드·리포트 반영',out:'스코어카드 10 · 통과/보류/탈락 분류',L:'L8',comp:'스토리지·DB',micro:['ats.write()'],
      reads:['후보 판정 결과'],
      ev:{ data:['스코어카드 10명 생성 · 스크리닝 리포트 생성'],
        logic:['판정 결과를 스코어카드·리포트로 정리 → ATS 단계를 "스크리닝 통과"로 갱신'] },
      prod:{ sys:['ATS write · 스코어카드 10'] },
      detail:odTable('시스템 반영',[['스코어카드','10명 생성','g'],['스크리닝 리포트','생성','g'],['ATS 단계','스크리닝 통과','g']])}]},

   {id:'interview_gate',label:'면접 조율',role:'사람 확인 ②',actor:'hitl',hitl:1,kind:'gate',loopPhase:'Decision',
    gate:{label:'면접 일정·패널 확인',decisions:[{key:'yes',label:'일정 확정·안내 발송',toast:'면접 일정 확정 · 후보 안내를 발송합니다'},{key:'no',label:'일정 조정 요청',toast:'일정 조정을 요청합니다'}]},
    explain:`숏리스트 후보의 면접을 잡습니다. <b>L5</b>가 후보·면접관 캘린더를 교차해 충돌 없는 슬롯을 산출하고, <b>L3 코어</b>가 초대를 구성합니다. 외부(후보)로 안내가 나가므로 <b>담당자가 일정·패널을 확인</b>합니다. (★ HITL ②)`,
    ops:[{g:0,feed:'면접관·후보 가용 조회',out:'양측 캘린더 교차',L:'L5',comp:'연결·수집',micro:['캘린더 Connector'],
      reads:['숏리스트 후보 3인 캘린더','면접관(오세훈·이서영·CTO) 캘린더','면접 패널 구성 규칙'],
      ev:{ data:['후보 가용 — 정유진·박서준·이하늘 3인 응답','면접관 가용 — 오세훈(화 14–17시)·이서영(화 종일)·CTO(수 오전)'],
        lookup:['후보×면접관 캘린더 교차 조회 (Calendar API)','회의실(A동 301·B동) 가용 대조'],
        rule:['1차 기술면접 = 면접관 2인(현업 리드 오세훈 + 1인)','임원(CTO) 배석은 시니어 후보 한정'],
        logic:['양측 빈 시간 교집합 → 충돌 0 시간대 3개 추출'] },
      prod:{ doc:['후보별 가용 매트릭스'] },
      detail:odTable('가용 교차',[['후보 가용','3명 응답','g'],['면접관','오세훈·이서영·CTO','g'],['충돌','0','g']])},
     {g:1,feed:'면접 슬롯·패널 구성',out:`${INTERVIEW.length}슬롯 · 충돌 0`,L:'L3',comp:'코어·실행 엔진',micro:['슬롯 매칭'],
      reads:['교차 가용 시간대','후보 매칭 순위','면접관 패널 가용'],
      ev:{ data:['확정 슬롯 — 정유진 6/24 14:00 · 박서준 6/24 16:00 · 이하늘 6/25 10:00'],
        rule:['상위 매칭 후보 우선 배정','동일 면접관 연속 2슬롯 이하'],
        logic:['충돌 0 시간대에 후보 3인 배정 → 면접관·회의실 매칭 → 초대 초안 작성(발송 보류)'] },
      prod:{ doc:['면접 일정표 3건','후보 초대 메일 초안'], sys:['ATS 면접 단계 예약'] },
      detail:odTable('면접 슬롯',[['정유진','6/24 14:00','g'],['박서준','6/24 16:00','g'],['이하늘','6/25 10:00','g']])},
     {g:2,feed:'안내 게이트 보류',out:'일정·패널 확인 담당자 전달',L:'L3',comp:'HITL 런타임 게이트',
      reads:['생성된 일정·패널·초대안'],
      ev:{ rule:['외부(후보)로 나가는 안내 발송 = 담당자 확인 필수 (HITL 게이트)'],
        logic:['일정·패널 확정안을 담당자에게 전달 → 승인 시에만 초대 발송'] },
      prod:{ sys:['HITL 결정 대기 등록'] }}]},

   {id:'evaluate',label:'면접 평가 취합',role:'AAP 실행',actor:'aap',kind:'auto',loopPhase:'Action',
    explain:`면접이 끝나면 AAP가 면접관 스코어카드를 <b>병렬</b>로 모아 정합성을 점검하고, <b>L3 코어</b>가 합격 후보와 오퍼 패키지 초안을 정리합니다. <b>L7</b>이 보상밴드·차별금지를 사전 점검해 다음 게이트에 올립니다. (추론 루프 <b>Action</b>)`,
    ops:[{g:0,feed:'면접 스코어카드 취합',out:'면접관 평가 정합성 점검',L:'L3',comp:'코어·실행 엔진',micro:['평가 취합'],
      reads:[`면접관 스코어카드 ${INTERVIEW.length}건`,'루브릭 5항 기준'],
      ev:{ data:[`스코어카드 ${INTERVIEW.length}건 수집 · 최종 합격 후보 정유진`],
        lookup:['면접관(오세훈·이서영)별 평가 수집'],
        logic:['면접관 간 평가 편차·정합성 점검 → 이상치 확인'] },
      prod:{ doc:['취합 평가표'] },
      detail:odTable('평가 취합',[['스코어카드 수집',INTERVIEW.length+'건','g'],['평가 정합성','검증','g'],['최종 합격 후보','정유진','g']])},
     {g:1,feed:'합격 판정·오퍼안 정리',out:'합격 후보 · 오퍼 패키지 초안',L:'L3',comp:'코어·실행 엔진',
      reads:['취합 평가','직무 기준','보상밴드'],
      ev:{ rule:['종합 평가 우수 + 헤드카운트(2) 내'],
        logic:['합격 후보 확정 → 보상밴드 기준 오퍼 패키지 초안 정리'] },
      prod:{ doc:['오퍼 패키지 초안'] },
      detail:odTable('합격·오퍼안',[['최종 합격','정유진','g'],['종합 평가','우수','g'],['헤드카운트','1 / 2 충원']])},
     {g:2,feed:'보상·정책 사전 점검',out:'보상밴드 내 · 차별금지 통과',L:'L7',comp:'정책 관리·통제',asset:1,badge:'Antbot',
      reads:['오퍼안','직급 보상밴드','차별금지 규칙'],
      ev:{ rule:['기본급 밴드 내 · 헤드카운트 승인 범위 · 차별금지 · 처우 형평'],
        data:['기본급 밴드 상한 내 · 헤드카운트 승인 범위 · 차별금지 통과 · 형평 검증'],
        logic:['오퍼안을 보상·정책 규칙으로 사전 점검해 다음 게이트에 적재'] },
      prod:{ sys:['사전 점검 통과 라벨'] },
      detail:odTable('사전 점검 (Antbot)',[['기본급','밴드 상한 내','g'],['헤드카운트','승인 범위','g'],['차별금지','통과','g'],['처우 형평','검증','g']])}]},

   {id:'offer_gate',label:'합격·오퍼 승인',role:'사람 확인 ③',actor:'hitl',hitl:1,kind:'gate',loopPhase:'Decision',
    gate:{label:'합격·오퍼 승인',decisions:[{key:'yes',label:'승인·오퍼 발송',toast:'오퍼 승인 · 발송합니다'},{key:'no',label:'처우 하향(밴드 하한)',toast:'처우를 밴드 하한으로 조정합니다'}]},
    explain:`후보에게 오퍼가 나가는 마지막 행동 직전, <b>L7</b>이 보상밴드·헤드카운트·차별금지를 점검하고 <b>L3 런타임 게이트</b>가 오퍼 발송을 멈춰 담당자·현업 리드의 최종 승인을 받습니다. (★ HITL ③)`,
    ops:[{g:0,feed:'합격 후보·오퍼 패키지 제시',out:'오퍼 처우·조건 요약',L:'L1',comp:'채용 콘솔·챗 UI',
      reads:['오퍼 패키지 초안','합격 후보 평가'],
      ev:{ logic:[`합격 후보(${cById(OFFER.cid).name})·처우·조건을 담당자가 보도록 요약 제시`] },
      prod:{ doc:['오퍼 요약'] },
      detail:odTable('오퍼안',[['최종 합격','정유진','g'],['기본급',OFFER.base,'g'],['입사',OFFER.start]])},
     {g:1,feed:'오퍼 점검 (보상·정책)',out:'보상밴드 내 · 차별금지 통과',L:'L7',comp:'정책 관리·통제',
      reads:['오퍼 처우','보상밴드','헤드카운트·차별금지'],
      ev:{ rule:['기본급 밴드 내 · 헤드카운트 승인 범위 · 차별금지 · 처우 형평'],
        data:['기본급 밴드 상한 내 · 헤드카운트 승인 범위 · 차별금지 통과'],
        logic:['발송 직전 보상·정책을 최종 점검'] },
      prod:{ doc:['오퍼 점검 결과'] },
      detail:odTable('오퍼 점검',[['기본급','밴드 상한 내','g'],['헤드카운트','승인 범위','g'],['차별금지','통과','g'],['처우 형평','검증','g']])},
     {g:2,feed:'발송 게이트 보류',out:'오퍼 발송·기록 승인 대기',L:'L3',comp:'HITL 런타임 게이트',
      reads:['오퍼·점검 결과'],
      ev:{ rule:['후보에게 오퍼 발송 = 담당자·현업 리드 최종 승인 필수 (HITL 게이트)'],
        logic:['오퍼 발송·기록을 승인 대기로 보류 → 승인 시에만 발송'] },
      prod:{ sys:['HITL 결정 대기 등록'] }}]},

   {id:'record',label:'기록·학습',role:'AAP 마무리',actor:'aap',doneModal:1,kind:'auto',loopPhase:'Learning',
    explain:`승인 후 AAP가 결과를 <b>병렬</b> 전달·기록하고 ATS·온보딩에 반영하며, 이번 채용 패턴을 <b>L7 Self-Improving</b>으로 학습 자산화해 다음 포지션의 매칭 정확도를 높입니다. (추론 루프 <b>Learning</b>)`,
    ops:[{g:0,feed:'오퍼·결과 발송',out:'합격 안내 · 불합격 통지',L:'L3',comp:'코어·실행 엔진',micro:['mail.send()'],
      reads:['승인된 오퍼·후보 상태','안내 템플릿·톤 가이드'],
      ev:{ data:['오퍼 레터 정유진 발송 · 면접 안내 3명 · 불합격 정중 통지'],
        rule:['외부 발송은 승인 후에만','불합격 통지는 정중 톤'],
        logic:['후보 상태별 템플릿 적용 → 발송'] },
      prod:{ msg:['오퍼 레터·안내·통지'] },
      detail:odTable('발송 결과',[['오퍼 레터','정유진 발송','g'],['면접 안내','3명 발송','g'],['불합격 통지','정중 안내','g']])},
     {g:0,feed:'ATS 기록·단계 갱신',out:'채용 파이프라인 단계 반영',L:'L8',comp:'스토리지·DB',micro:['ats.update()'],
      reads:['최종 결정·후보 상태'],
      ev:{ logic:['합격/불합격을 ATS 파이프라인 단계에 반영(ats.update)'] },
      prod:{ sys:['ATS 단계 갱신'] }},
     {g:1,feed:'온보딩 작업 등록',out:'입사 준비 · 리마인더',L:'L3',comp:'코어·실행 엔진',
      reads:['합격자 정보','입사일·온보딩 워크플로'],
      ev:{ data:[`입사 ${OFFER.start} · 온보딩 체크리스트`],
        logic:['HRIS 온보딩 워크플로에 작업·리마인더 등록'] },
      prod:{ sys:['온보딩 작업 등록'] }},
     {g:2,feed:'학습 자산화',out:'직무 매칭 패턴 저장 · 기준 개선',L:'L7',comp:'Self-Improving',asset:1,badge:'Self-Improving',
      reads:['이번 채용 흐름·합격자 프로필·면접 결과·담당자 판단(컷·가중)'],
      ev:{ data:['저장 — 백엔드 매칭 패턴 · 갱신 — 스코어 기준 · 준비 — 다음 포지션 적용'],
        rule:['개인정보 제외, 패턴·기준만 자산화'],
        logic:['합격자 특성·담당자 조정(컷·가중)을 정규화 → 다음 포지션 매칭·구성 기준 개선'] },
      prod:{ sys:['지식베이스 갱신(매칭 기준)'] },
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
  const PLAN_PRODUCES={intake:[],analyze:['JD 초안'],design:['실행 구조(계획안)'],shortlist_gate:['스크리닝 계획','숏리스트 컷 후보 3안'],screen:['스크리닝 리포트·스코어카드·후보 비교표'],interview_gate:['면접 일정'],evaluate:['합격 판정·오퍼 패키지(초안)'],offer_gate:['오퍼 승인'],record:['오퍼 발송·ATS 기록·학습 자산']};
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
    {k:'hold',ko:'보류·탈락'},
  ];
  /* ── 단계 위치 판정 = stage id 기준(코어 idxOf 로 순서만, 숫자 임계값 금지) ──
     보드 가시화 = screen 단계 도달부터(이력서 수집·스크리닝 완료 시점). */
  const SCREEN_ID='screen', INTERVIEW_ID='interview_gate', EVAL_ID='evaluate', OFFER_ID='offer_gate';
  const atOrAfter=(C,id)=>C.idxOf(C.S.sel)>=C.idxOf(id);
  /* 보드가 채워졌나(후보 데이터 노출) = screen 단계 이상 */
  function boardReady(C){ return atOrAfter(C,SCREEN_ID); }
  /* io 반영 카운트(결정론) — 업로드(+이력서)·소싱(외부사이트)이 지원자 풀에 가산됨을 표시. */
  function uploadsOf(C){ return (C&&C.S&&+C.S.recrUploads)||0; }
  function sourcedOf(C){ return (C&&C.S&&+C.S.recrSourced)||0; }
  function applicantsOf(C){ return JOB.applicants + uploadsOf(C) + sourcedOf(C); }
  /* 현재 단계(sel)에 따라 후보 파이프라인 컬럼이 가시화됐는지(결정론) */
  function reached(C,stageK){
    if(stageK==='screened'||stageK==='shortlist'||stageK==='hold')return boardReady(C);   /* screen 부터 */
    if(stageK==='interview')return atOrAfter(C,INTERVIEW_ID);                              /* interview_gate 부터 */
    if(stageK==='offer')return atOrAfter(C,OFFER_ID);                                      /* offer_gate 부터 */
    return false;
  }
  /* 컷 기준(엄격/표준/넓게) → 숏리스트 후보 id 집합. ex(컷 좁힘=≥90)도 반영 = '담당자 결정'이 화면에 */
  function cutThreshold(C){
    const direct=cutOf(C); if(direct!=null)return direct;   /* 모달에서 직접 편집한 컷 우선(케이스 격리) */
    if(C.ex)return 90;
    const pt=C.S.pickedTime||'';
    if(/90/.test(pt))return 90; if(/80/.test(pt))return 80; return 85;
  }
  function shortlistIds(C){
    const th=cutThreshold(C);
    return CAND.filter(c=>mOf(C,c)>=th).sort((a,b)=>mOf(C,b)-mOf(C,a)).map(c=>c.id);
  }
  /* 케이스 가중 반영 통과 후보 수(컷 임계값 th) */
  function passCount(C,th){ return CAND.filter(c=>mOf(C,c)>=th).length; }
  /* 후보의 표시 컬럼 — 진행(stage id) + 담당자 결정(reject/advance) 반영.
     screen 단계 분기: 컷 미달(드롭 판정) 후보는 '보류·탈락' 컬럼으로 자동 분기. */
  function colOf(C,c){
    const dec=(C.S.recrDecisions||{})[c.id];
    if(dec==='reject')return 'hold';                /* 담당자 탈락 처리 → 보류·탈락 컬럼 */
    const sids=shortlistIds(C);
    if((atOrAfter(C,OFFER_ID)||dec==='offer') && c.id===OFFER.cid)return 'offer';
    if((atOrAfter(C,INTERVIEW_ID)||dec==='interview') && sids.includes(c.id))return 'interview';
    if(dec==='shortlist'||sids.includes(c.id))return 'shortlist';
    /* 컷 미달 = 스크리닝에서 탈락/보류로 자동 분기(보드에 분기 가시화) */
    if(screenVerdict(c).k==='drop')return 'hold';
    return 'screened';
  }
  function candCard(c,C){
    const sc=totalScore(c), fs=flagsOf(c), top=fs[0];
    const m=C?mOf(C,c):c.match;
    const dec=(C&&C.S.recrDecisions)?C.S.recrDecisions[c.id]:null;
    return `<button class="recr-card${hasRisk(c)?' risk':''}${dec==='reject'?' rejected':''}" data-cand="${c.id}">
      <div class="rc-top"><span class="recr-av">${c.ini}</span><div class="rc-id"><div class="rc-nm">${c.name}</div><div class="rc-cur">${c.yrs}년 · ${c.cur}</div></div><span class="rc-mt">${m}%</span></div>
      <div class="rc-bar" title="매칭 ${m}%"><i style="width:${Math.max(6,Math.min(100,m))}%"></i></div>
      <div class="rc-foot"><span class="rc-sc">${I('gauge')}종합 ${sc}</span>${top?`<span class="rc-flag ${top.t}">${top.ko}</span>`:`<span class="rc-ok">적합</span>`}</div>
    </button>`;
  }

  const TABS=['파이프라인','후보','스코어카드','면접'];
  /* 단계 기본 탭 = 파이프라인(보드). 보드가 메인 화면이고, 후보·스코어카드·면접은 사용자가
     탭을 눌러 탐색하는 보조 뷰(원래 본문=항상 보드였던 동작 보존). */
  const stepTab=()=>'파이프라인';
  /* 활성 탭 = 사용자가 누른 탭(S.activeTab)이 있으면 그것(탐색), 없으면 단계 기본.
     보드가 가시화되기 전(prepare 이전)에는 후보·스코어카드·면접 데이터가 비므로 파이프라인으로 폴백. */
  function activeTab(C){
    const reachedBoard=boardReady(C);   /* screen 이후 = 후보 데이터 채워짐 */
    let t=C.S.activeTab;
    if(!t||!TABS.includes(t))t=stepTab(C.W(C.S.sel).id);
    if(!reachedBoard&&t!=='파이프라인')t='파이프라인';
    return t;
  }
  /* ── 진행률(0~100) — 단계 인덱스 기반(코어 caseProgress 과 동톤, surface 내 계산) ── */
  function progressPct(C){ const i=C.idxOf(C.S.sel), n=FLOW.length; return Math.min(100,Math.round(((i+1)/n)*100)); }
  /* ── 업무 헤더 = 'AAP에게 맡긴 한 업무'(페르소나·제품 브랜딩 제거) ── */
  function head(C){
    const w=C.W(C.S.sel);
    const known=atOrAfter(C,'design');   /* JD·요건 정의됨 = 분석 이후(design~) */
    const gates=C.gates(), pend=gates.filter(g=>g.state==='pending').length;
    const sub=`${known?`${JOB.title}`:'요건 정의 중'} · ${JOB.team}`;
    return `<div class="ws-th">
       <div class="ws-th-k"><span class="dot"></span>AAP에게 맡긴 업무</div>
       <h1 class="ws-th-h1">채용 1차 스크리닝</h1>
       <div class="ws-th-sub">${sub}<span class="sep"></span>지원 ${applicantsOf(C)}명${(uploadsOf(C)+sourcedOf(C))?`<span class="io-delta">+${uploadsOf(C)+sourcedOf(C)}</span>`:''}<span class="sep"></span><span class="prog">진행 ${progressPct(C)}%</span>${pend?`<span class="sep"></span>결정 <b class="amber">${pend}건</b> 남음`:''}</div>
     </div>`;
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

  /* =======================================================================
     조작형 surface (목업 v0.1) — 의도 steering + 라이브 재분석 + FLIP + SVG 그래프.
     코어 프레임워크(AAP_LIVE/AAP_FLIP/wireSteer)가 메커니즘, 여기는 채용 컨트롤·recompute·그래프.
     단계 그룹: matching(스크리닝·랭킹) / interview(면접 조율) / evaloffer(평가·오퍼).
     ======================================================================= */
  /* 우선순위(매칭 가중) 프리셋 — 균형/도메인/경력/스킬 중시. recrWeight(케이스 격리)에만 씀. */
  const WPRESET={
    bal:{skill:50,career:30,domain:20,lab:'균형'},
    dom:{skill:30,career:20,domain:50,lab:'도메인 중시'},
    car:{skill:30,career:50,domain:20,lab:'경력 중시'},
    skl:{skill:70,career:20,domain:10,lab:'스킬 중시'},
  };
  /* 현재 우선순위 키 추정(recrWPreset 우선, 없으면 가중에서 역추정) */
  function wPresetOf(C){
    if(C&&C.S&&C.S.recrWPreset&&WPRESET[C.S.recrWPreset])return C.S.recrWPreset;
    const w=normWeight(C);
    let best='bal',bd=999; Object.keys(WPRESET).forEach(k=>{const p=WPRESET[k];const d=Math.abs(p.skill-w.skill)+Math.abs(p.career-w.career)+Math.abs(p.domain-w.domain); if(d<bd){bd=d;best=k;}});
    return best;
  }
  /* 의도 필터(재택/시니어/커머스) — recrIntentFilt{remote,senior,commerce} */
  function intentFilt(C){ return (C&&C.S&&C.S.recrIntentFilt)||{remote:false,senior:false,commerce:false}; }
  /* 후보에 재택·도메인 더미 속성 부여(결정론) — 데이터 보강 없이 기존 필드로 도출 */
  function isRemote(c){ return ['c1','c3','c5','c6','c10'].includes(c.id); }
  function isSenior(c){ return c.yrs>=6; }
  function isCommerce(c){ return c.dom==='커머스'; }
  /* 의도 필터 + 후보 제외(recrDropped) 적용된 후보 풀(컷·랭킹 이전) */
  function intentPool(C){
    const f=intentFilt(C), dropped=(C&&C.S&&C.S.recrDropped)||{};
    return CAND.filter(c=> !dropped[c.id] && (!f.remote||isRemote(c)) && (!f.senior||isSenior(c)) && (!f.commerce||isCommerce(c)) );
  }
  /* 면접 범위 분기(top3/std/wide) — 컷 후 면접 대상 N */
  function scopeOf(C){ return (C&&C.S&&C.S.recrScope)||'std'; }
  /* 조작형 랭킹 = 의도 풀 → 매칭 내림차순 */
  function opRanked(C){ return intentPool(C).slice().sort((a,b)=>mOf(C,b)-mOf(C,a)); }
  /* 면접 컷 인덱스(이 줄 위 = 면접 대상) */
  function opCutN(C){ const n=opRanked(C).length, s=scopeOf(C); return s==='top3'?Math.min(3,n):s==='wide'?n:Math.min(6,n); }

  /* 어떤 조작형 surface 인가(현재 단계 기준). 없으면 null → 코어가 스트림 폴백. */
  function opKind(C){
    const id=C.W(C.S.sel).id;
    if(id==='design')return 'compose';   /* 스크리닝 설계 = 업무 분해 → 구성요소 조합 도식 */
    if(id==='shortlist_gate'||id==='screen')return 'matching';
    if(id==='interview_gate')return 'interview';
    if(id==='evaluate'||id==='offer_gate')return 'evaloffer';
    if(id==='analyze')return 'analyze';   /* 요건 분석 = info 카드 + 온톨로지 그래프(의미 이해 증명) */
    /* 정보성 단계(접수·기록) = 같은 op-console 프레임에서 그 단계 작업을 표시 → stream 폴백 제거(수렴 ④). */
    if(id==='intake'||id==='record')return 'info';
    return null;
  }
  /* strip 단계(코어 strip 이 렌더) — 전체 9단계 진행을 일관 표시(부분 노드 ✕, 화면 점프 방지) */
  function opStages(){ return FLOW.map(w=>w.id); }

  /* ── 조작형 랭킹 surface (matching) — 후보 행(FLIP) + 근거 분해 막대 + 컷라인 ── */
  function matchRows(C){
    const arr=opRanked(C), cut=opCutN(C), w=normWeight(C);
    return arr.map((c,i)=>{
      const sc=mOf(C,c);
      const bd=breakdown(c,C);  /* [{k,raw,w,contrib}] 스킬/경력/도메인 */
      const tot=bd.reduce((s,b)=>s+b.contrib,0)||1;
      const fs=flagsOf(c), top=fs[0], warn=top&&top.t!=='ok';
      const cutline=(i===cut&&cut<arr.length)?' cutline':'';
      return `<div class="op-row${cutline}" data-flip="${c.id}" data-cand="${c.id}">
        <span class="op-rk">${i+1}</span>
        <span class="recr-av">${c.ini}</span>
        <div class="op-rmain"><div class="op-rn">${c.name}${warn?`<span class="op-rflag ${top.t}">${top.ko}</span>`:''}</div>
          <div class="op-rc">${c.yrs}년 · ${c.cur} · ${c.dom}${isRemote(c)?' · 재택':''}</div></div>
        <div class="op-bd" title="스킬 ${bd[0].contrib} · 경력 ${bd[1].contrib} · 도메인 ${bd[2].contrib}">
          <i class="sk" style="width:${bd[0].contrib/tot*100}%"></i><i class="ca" style="width:${bd[1].contrib/tot*100}%"></i><i class="dm" style="width:${bd[2].contrib/tot*100}%"></i></div>
        <div class="op-rmt"><b data-numtween="m-${c.id}" data-numsuf="">${sc}</b><span>매칭</span></div>
        <button class="op-rdel" data-opdrop="${c.id}" title="이 후보 빼고 다시">${I('x')}</button>
      </div>`;
    }).join('');
  }
  function opMatchMain(C){
    const arr=opRanked(C), cut=opCutN(C), w=normWeight(C), th=cutThreshold(C);
    const working=C.R.phase==='working';
    return `<div class="op-wh"><span class="op-t">후보 랭킹</span><span class="op-c">${arr.length}명 · ${WPRESET[wPresetOf(C)].lab} · 컷 ≥${th}%</span><span class="op-cut">면접 대상 ${cut}명</span></div>
      <div class="op-bdleg"><span><i class="sk"></i>스킬</span><span><i class="ca"></i>경력</span><span><i class="dm"></i>도메인</span><span class="muted">· 막대 = 매칭 기여(근거)</span></div>
      <div class="op-rows" id="opRows">${matchRows(C)}</div>
      <div class="op-hitlbar"><div><div class="op-hi">${I('user-check')}숏리스트 확정 — 여기서 당신이 결정</div><div class="op-hs">이 기준·범위로 면접 대상 ${cut}명을 확정합니다. (책임 걸린 지점 = HITL)</div></div>
        <button class="op-hbtn" data-gate="shortlist_gate">숏리스트 확정</button></div>`;
  }
  function opMatchSteer(C){
    const wp=wPresetOf(C), f=intentFilt(C), sc=scopeOf(C);
    const wbtn=(k)=>`<button class="op-opt ${wp===k?'on':''}" data-steer="weight" data-steerval="${k}">${WPRESET[k].lab}</button>`;
    const fbtn=(k,lb)=>`<button class="op-opt flt ${f[k]?'on':''}" data-steer="filter" data-steerval="${k}">${lb}</button>`;
    const sbtn=(k,lb)=>`<button class="op-opt br ${sc===k?'on':''}" data-steer="scope" data-steerval="${k}">${lb}</button>`;
    return `<div class="op-steer">
      <div class="op-sg"><span class="op-lab">우선순위</span>${wbtn('bal')}${wbtn('dom')}${wbtn('car')}${wbtn('skl')}</div>
      <div class="op-sg"><span class="op-lab">필터</span>${fbtn('remote','재택')}${fbtn('senior','시니어')}${fbtn('commerce','커머스')}</div>
      <div class="op-sg"><span class="op-lab">면접 범위(분기)</span>${sbtn('top3','톱 3')}${sbtn('std','표준 6')}${sbtn('wide','넓게')}</div>
      <span class="op-snote">${I('info')}기준을 바꾸면 AAP가 다시 분석합니다 (chat 아님 · 직접 조종)</span></div>`;
  }
  /* SVG 매칭 그래프 — 요건(JD) 허브 ← 후보, 엣지 굵기=매칭. 인라인 SVG(외부 라이브러리 0). */
  function opMatchGraph(C){
    const arr=opRanked(C).slice(0,6), w=normWeight(C);
    const cx=58, cy=112;
    let edges='', nodes='';
    arr.forEach((c,i)=>{
      const ang=(-58+i*23)*Math.PI/180, R=132;
      const x=cx+Math.cos(ang)*R+34, y=cy+Math.sin(ang)*92;
      const sc=mOf(C,c), op=Math.max(0,Math.min(1,(sc-65)/35)), top=i===0;
      /* 엣지 굵기·투명도=매칭(steering 에 반응) · 노드 강조=1위. data-gk=후보ID(재렌더 간 안정 키→트랜지션). */
      edges+=`<line class="op-gedge${top?' top':''}" data-gk="${c.id}" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${top?'#0d9488':'#94a3b8'}" stroke-width="${(1+op*3.5).toFixed(2)}" stroke-opacity="${(0.25+op*0.55).toFixed(2)}"/>`;
      nodes+=`<g class="op-gnode${top?' top':''}" data-gk="${c.id}"><circle cx="${x}" cy="${y}" r="${top?16:13}" fill="${top?'#0d9488':'#fff'}" stroke="${top?'#0d9488':'#cbd5e1'}" stroke-width="1.5"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${top?'#fff':'#475569'}">${c.ini}</text><text x="${x}" y="${y+26}" text-anchor="middle" font-size="8.5" fill="#64748b">${sc}</text></g>`;
    });
    return `<svg id="opGraph" class="op-greact" viewBox="0 0 300 224">${edges}<circle cx="${cx}" cy="${cy}" r="25" fill="#0f766e"/><text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#fff">JD 요건</text><text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="7.5" fill="#99f6e4">${WPRESET[wPresetOf(C)].lab}</text>${nodes}</svg>`;
  }
  function opMatchAside(C){
    const w=normWeight(C), pool=intentPool(C);
    const sids=shortlistIds(C);
    return `<div class="op-sh">매칭 그래프 <span>요건 ← 후보 · 굵기=매칭</span></div>
      <div class="op-graph">${opMatchGraph(C)}</div>
      ${recrDidFlow(C)}`;
  }
  function opFstep(ic,t,d,cls){ return `<div class="op-fstep ${cls||''}"><span class="op-fd">${I(ic)}</span><div class="op-ftx"><b>${t}</b><div class="op-fmono">${d}</div></div></div>`; }

  /* ── 근거(basis) 4유형 — v0_57 정합. AAP가 '무슨 데이터로·무슨 규칙으로·어떻게' 판단했는지 공개(더미 ✕). ── */
  const EV_T=[['data','참조 데이터','tyS'],['lookup','조회·대조','tyC'],['rule','규칙·정책','tyP'],['logic','판단 로직','tyA']];
  function opHasEv(op){ return !!(op&&(op.reads||op.ev||op.prod)); }
  /* AAP가 한 일 · 근거 = 그 단계 ops 를 데이터로 구동(손코딩 요약 ✕). 각 op = feed→out + [근거 보기]. */
  function recrDidFlow(C){
    const w=C.W(C.S.sel), ops=(w.ops||[]);
    const rows=ops.map((o,i)=>{
      const last=i===ops.length-1;
      const ev=opHasEv(o)?`<button class="op-evbtn" data-evid="${w.id}:${i}">${I('search')}근거 보기</button>`:'';
      return `<div class="op-fstep${last?' v':''}"><span class="op-fd">${I(last?'arrow-right':'check')}</span>
        <div class="op-ftx"><b>${o.feed||o.comp||''}</b><div class="op-fmono">${o.out||''}</div>${ev}</div></div>`;
    }).join('');
    return `<div class="op-sh">AAP가 한 일 · 근거 <span>${w.role||''}</span></div><div class="op-flow">${rows}</div>`;
  }
  /* 근거 드릴 모달 — 읽은 데이터(reads) + 판단 근거(ev 4유형 색구분) + 산출물(prod). S.recrEvid="stageId:idx". */
  function evidDrill(C){
    const parts=String(C.S.recrEvid||'').split(':'), w=C.W(parts[0]); if(!w)return '';
    const op=(w.ops||[])[+parts[1]]; if(!op)return '';
    const reads=(op.reads||[]).map(r=>`<span class="ev-chip">${r}</span>`).join('');
    const evRows=EV_T.filter(t=>op.ev&&op.ev[t[0]]&&op.ev[t[0]].length).map(t=>
      `<div class="ev-row"><span class="ev-k ${t[2]}">${t[1]}</span><div class="ev-v">${op.ev[t[0]].map(x=>`<div>${x}</div>`).join('')}</div></div>`).join('');
    let prod=''; if(op.prod){ Object.keys(op.prod).forEach(k=>{ (op.prod[k]||[]).forEach(x=>{ prod+=`<span class="ev-chip out">${x}</span>`; }); }); }
    return `<button class="cmodal-x" data-evback aria-label="닫기">${I('x')}</button>
      <div class="cmodal-h">근거 · ${op.nm||op.feed||op.comp}</div>
      <div class="cmodal-sub">${op.comp||''}${op.L?' · '+op.L:''} — AAP가 무슨 데이터로·무슨 규칙으로·어떻게 판단했는지</div>
      ${reads?`<div class="ev-sec"><div class="ev-sec-k">${I('database')}읽은 데이터</div><div class="ev-chips">${reads}</div></div>`:''}
      <div class="ev-sec"><div class="ev-sec-k">${I('git-branch')}판단 근거</div>${evRows||'<div class="ev-na">근거 데이터 준비 중</div>'}</div>
      ${prod?`<div class="ev-sec"><div class="ev-sec-k">${I('file-text')}산출물</div><div class="ev-chips">${prod}</div></div>`:''}`;
  }

  /* ── 정보성 단계(접수·요건분석·기록) op-console 메인 — 그 단계 작업(ops)을 구성요소·feed→out·detail 로.
     같은 op-console 프레임(상단 strip + 메인 + 보조)을 써서 stream 폴백 제거(화면 점프 방지·수렴 ④). ── */
  function opInfoMain(C){
    const w=C.W(C.S.sel), ops=w.ops||[];
    let intro='';
    if(w.id==='intake')intro=`<div class="op-genframe">${I('git-branch')}<div>이 <b>9단계 워크플로우</b>는 AAP가 <b>“백엔드 개발자 2명, 4~8년차로 충원해줘”</b> 한 줄에서 업무를 <b>분해·구성</b>한 결과입니다. 위 ↺처음·이전·다음으로 한 단계씩 따라가 보세요.</div></div>`;
    else if(w.id==='record')intro=`<div class="op-genframe">${I('repeat')}<div>이번 채용의 흐름·판단을 <b>학습 자산</b>으로 축적해 다음 포지션의 매칭·구성 정확도를 높입니다 — 끝내고 잊지 않습니다.</div></div>`;
    const cards=ops.map((o,i)=>`<div class="op-iorow">
      <div class="op-ior-h"><span class="op-ior-comp">${o.comp||''}</span>${o.L?`<span class="op-ior-l">${o.L}</span>`:''}${o.badge?`<span class="op-ior-bd">${o.badge}</span>`:''}${opHasEv(o)?`<button class="op-evbtn sm" data-evid="${w.id}:${i}">${I('search')}근거</button>`:''}</div>
      <div class="op-ior-fo"><span class="op-ior-feed">${o.feed||''}</span>${I('arrow-right')}<b class="op-ior-out">${o.out||''}</b></div>
      ${o.detail||''}</div>`).join('');
    return `<div class="op-wh"><span class="op-t">${w.label}</span><span class="op-c">${w.role} · AAP가 처리한 작업</span></div>
      ${intro}<div class="op-iolist">${cards}</div>`;
  }
  function opInfoAside(C){ return recrDidFlow(C); }

  /* ── 조작형 면접 조율 surface (interview) — 슬롯 카드 + 슬롯/패널/분기 steering ── */
  function ivSlotPref(C){ return (C&&C.S&&C.S.recrSlotPref)||'무관'; }
  function ivPanel(C){ return (C&&C.S&&C.S.recrPanel)||'표준'; }
  function opIvMain(C){
    const pref=ivSlotPref(C), pn=ivPanel(C);
    const rows=INTERVIEW.filter(iv=>shortlistIds(C).includes(iv.cid));
    const list=rows.length?rows:INTERVIEW;
    const slots=list.map(iv=>{ const c=cById(iv.cid);
      const time=pref==='오전'?iv.slot.replace(/1[46]:00/,'10:00'):iv.slot;
      return `<div class="op-slot" data-flip="iv-${iv.cid}"><span class="recr-av">${c.ini}</span>
        <div class="op-sm"><div class="op-sn2">${c.name}</div><div class="op-sd">${c.yrs}년 · ${c.cur}</div></div>
        <span class="op-time">${time}</span><span class="op-panel">${iv.panel}${pn==='임원 포함'?'·임원':''}</span><span class="op-ok">가용</span></div>`;}).join('');
    return `<div class="op-wh"><span class="op-t">면접 슬롯</span><span class="op-c">충돌 0 · 후보·면접관 캘린더 교차${pref!=='무관'?` (${pref}대 우선)`:''}</span></div>
      <div class="op-slots">${slots}</div>
      <div class="op-hitlbar"><div><div class="op-hi">${I('user-check')}면접 일정 확인 — 외부(후보) 안내 전</div><div class="op-hs">일정·패널을 확인하면 후보에게 안내가 나갑니다. (HITL)</div></div>
        <button class="op-hbtn" data-gate="interview_gate">일정 확정·발송</button></div>`;
  }
  function opIvSteer(C){
    const pref=ivSlotPref(C), pn=ivPanel(C);
    const pbtn=(k)=>`<button class="op-opt ${pref===k?'on':''}" data-steer="slotpref" data-steerval="${k}">${k}</button>`;
    const nbtn=(k)=>`<button class="op-opt ${pn===k?'on':''}" data-steer="panel" data-steerval="${k}">${k}</button>`;
    return `<div class="op-steer">
      <div class="op-sg"><span class="op-lab">슬롯 선호</span>${pbtn('오전')}${pbtn('오후')}${pbtn('무관')}</div>
      <div class="op-sg"><span class="op-lab">패널</span>${nbtn('표준')}${nbtn('임원 포함')}</div>
      <span class="op-snote">${I('info')}바꾸면 AAP가 캘린더를 다시 교차합니다 (chat ✕)</span></div>`;
  }
  function opIvAside(C){
    const pref=ivSlotPref(C), pn=ivPanel(C);
    return `<div class="op-sh">캘린더 교차 근거 <span>보조</span></div>
      <div class="op-basis"><div class="op-brow"><span class="bk">후보 가용</span><span class="bv g">3명 응답</span></div>
        <div class="op-brow"><span class="bk">면접관</span><span class="bv">오세훈·이서영${pn==='임원 포함'?' · CTO':''}</span></div>
        <div class="op-brow"><span class="bk">충돌</span><span class="bv g">0</span></div>
        <div class="op-brow"><span class="bk">선호 반영</span><span class="bv">${pref}</span></div></div>
      ${recrDidFlow(C)}`;
  }

  /* ── 조작형 평가·오퍼 surface (evaloffer) — 스코어카드 + 오퍼 + 평가가중/오퍼수준 steering ── */
  const EVALW={bal:[20,20,20,20,20],tech:[40,15,15,15,15],collab:[15,40,15,15,15],grow:[15,15,40,15,15]};
  const EVALW_LAB={bal:'균형',tech:'기술 중시',collab:'협업 중시',grow:'성장 중시'};
  function evalWOf(C){ return (C&&C.S&&C.S.recrEvalW&&EVALW[C.S.recrEvalW])?C.S.recrEvalW:'bal'; }
  function offerLvlOf(C){ return (C&&C.S&&C.S.recrOfferLvl)||'std'; }
  function opEvalMain(C){
    const c=cById(OFFER.cid);
    const wk=evalWOf(C), W=EVALW[wk];
    const tot=Math.round(c.scores.reduce((s,v,i)=>s+v*W[i],0)/100*20);
    const lvl=offerLvlOf(C);
    const base=lvl==='up'?'7,600만':lvl==='down'?'6,800만':OFFER.base;
    const sign=lvl==='up'?'800만':lvl==='down'?'없음':OFFER.sign;
    const rows=RUBRIC.map((r,i)=>`<div class="op-rub" data-flip="rub-${i}"><span class="rk">${r.k} <em>×${W[i]}</em></span><span class="rbar"><i style="width:${c.scores[i]*20}%"></i></span><span class="rv">${c.scores[i]}.0</span></div>`).join('');
    return `<div class="op-wh"><span class="op-t">합격 후보 · 평가</span><span class="op-c">${c.name} · 평가 가중 ${EVALW_LAB[wk]}</span></div>
      <div class="op-sc"><div class="op-sc-h"><span class="recr-av lg">${c.ini}</span><div><div class="op-sc-nm">${c.name}</div><div class="op-sc-cur">${c.yrs}년 · ${c.cur} · 매칭 ${c.match}%</div></div><div class="op-sc-tot"><b data-numtween="evtot">${tot}</b><span>종합</span></div></div>${rows}</div>
      <div class="op-offer"><h4>오퍼 패키지</h4>
        <div class="op-orow" data-flip="of-base"><span>기본급</span><b>${base} · ${OFFER.band}</b></div>
        <div class="op-orow" data-flip="of-sign"><span>사이닝</span><b>${sign}</b></div>
        <div class="op-orow"><span>입사</span><b>${OFFER.start}</b></div>
        <div class="op-orow"><span>점검</span><b class="g">보상밴드 내 · 차별금지 통과</b></div></div>
      <div class="op-hitlbar"><div><div class="op-hi">${I('user-check')}오퍼 승인 — 외부 발송 전</div><div class="op-hs">후보에게 나가는 마지막 단계. 사람이 최종 승인합니다. (HITL)</div></div>
        <button class="op-hbtn" data-gate="offer_gate">오퍼 승인·발송</button></div>`;
  }
  function opEvalSteer(C){
    const wk=evalWOf(C), lvl=offerLvlOf(C);
    const wbtn=(k)=>`<button class="op-opt ${wk===k?'on':''}" data-steer="evalw" data-steerval="${k}">${EVALW_LAB[k]}</button>`;
    const lbtn=(k,lb)=>`<button class="op-opt br ${lvl===k?'on':''}" data-steer="offerlvl" data-steerval="${k}">${lb}</button>`;
    return `<div class="op-steer">
      <div class="op-sg"><span class="op-lab">평가 가중</span>${wbtn('bal')}${wbtn('tech')}${wbtn('collab')}${wbtn('grow')}</div>
      <div class="op-sg"><span class="op-lab">오퍼 수준</span>${lbtn('std','표준')}${lbtn('up','상향')}${lbtn('down','하향')}</div>
      <span class="op-snote">${I('info')}가중을 바꾸면 종합 점수가 다시 계산됩니다 (chat ✕)</span></div>`;
  }
  function opEvalAside(C){
    const wk=evalWOf(C);
    return `<div class="op-sh">평가 근거 <span>보조</span></div>
      <div class="op-basis"><div class="op-brow"><span class="bk">종합 산식</span><span class="bv">루브릭 5항 × 가중</span></div>
        <div class="op-brow"><span class="bk">현재 가중</span><span class="bv">${EVALW_LAB[wk]}</span></div>
        <div class="op-brow"><span class="bk">보상밴드</span><span class="bv g">${OFFER.band}</span></div>
        <div class="op-brow"><span class="bk">차별금지</span><span class="bv g">통과</span></div></div>
      ${recrDidFlow(C)}`;
  }

  /* opstage = 코어 조작형 콘솔이 호출. {steer, main, aside}. null 이면 코어가 스트림 폴백. */
  function opstage(C){
    const k=opKind(C); if(!k)return null;
    if(k==='matching')return {steer:opMatchSteer(C), main:opMatchMain(C), aside:opMatchAside(C)};
    if(k==='interview')return {steer:opIvSteer(C), main:opIvMain(C), aside:opIvAside(C)};
    if(k==='evaloffer')return {steer:opEvalSteer(C), main:opEvalMain(C), aside:opEvalAside(C)};
    if(k==='analyze')return {steer:'', main:opInfoMain(C), aside:opOntologyAside(C)};
    if(k==='compose')return {steer:'', main:opComposeMain(C), aside:opComposeAside(C)};
    if(k==='info')return {steer:'', main:opInfoMain(C), aside:opInfoAside(C)};
    return null;
  }
  /* ── 구성요소 조합 도식(스크리닝 설계) — 업무 분해(T1~T5) + 5타입 조합. 회의 데모 composeNode 차용.
     "Agent 많이 띄우기 ✕ → 분해 + 구성요소 골라 조합" 핵심 명제 시각화. ── */
  const TY_CLASS={'Agent':'tyA','Module':'tyM','기존 솔루션':'tyS','Connector':'tyC','Policy':'tyP'};
  function opComposeMain(C){
    const tasks=[
      {tid:'T1',nm:'이력서 파싱',cs:['tyA','tyM']},
      {tid:'T2',nm:'요건 매칭 (RAG)',cs:['tyA','tyP']},
      {tid:'T3',nm:'랭킹·스코어',cs:['tyA','tyM']},
      {tid:'T4',nm:'면접 일정 조율',cs:['tyA','tyC']},
      {tid:'T5',nm:'평가 취합·반영',cs:['tyA','tyS']},
    ];
    const taskCards=tasks.map(t=>`<div class="op-task"><span class="op-task-id">${t.tid}</span><span class="op-task-nm">${t.nm}</span><span class="op-task-dots">${t.cs.map(c=>`<i class="op-tdot ${c}"></i>`).join('')}</span></div>`).join('');
    const grps=COMPOSE.map(g=>{ const cl=TY_CLASS[g.t]||'tyA';
      return `<div class="op-cmp-grp ${cl}"><div class="op-cmp-h"><span class="op-cmp-ty ${cl}">${g.t}</span><span class="op-cmp-sub">${g.sub}</span><span class="op-cmp-n">${g.n}</span></div>
        <div class="op-cmp-items">${g.items.map(it=>`<span class="op-cmp-chip">${it}</span>`).join('')}</div></div>`; }).join('');
    return `<div class="op-wh"><span class="op-t">스크리닝 설계</span><span class="op-c">업무 분해 → 구성요소 조합</span></div>
      <div class="op-compose-msg">${I('info')}AAP는 Agent를 많이 띄우는 게 아니라, 업무를 <b>분해</b>하고 적합한 <b>구성요소를 골라 조합</b>해 운영 가능한 실행 구조를 만듭니다.</div>
      <div class="op-sub-h">① 업무 분해 <span>작업 그래프</span></div>
      <div class="op-tasks">${taskCards}</div>
      <div class="op-sub-h">② 구성요소 조합 <span>Agent·Module·기존솔루션·Connector·Policy</span></div>
      <div class="op-cmp-grid">${grps}</div>`;
  }
  function opComposeAside(C){
    return `${recrDidFlow(C)}
      <div class="op-cmp-note">${I('info')}같은 플랫폼이라도 <b>요청이 다르면</b> 작업·구성요소·게이트가 다르게 재구성됩니다.</div>`;
  }
  /* ── 온톨로지 그래프(요건 분석) — 요청 → 표준 직무 모델 매핑(신뢰도=엣지 굵기). 인라인 SVG(외부 0).
     "키워드 매칭이 아니라 의미(온톨로지)로 이해" 증명 — opMatchGraph 패턴 차용. ── */
  function opOntologyGraph(C){
    const maps=[{k:'백엔드 개발 (서버)',v:0.93,top:1},{k:'플랫폼 엔지니어',v:0.05},{k:'풀스택',v:0.02}];
    const cx=48, cy=82; let edges='', nodes='';
    maps.forEach((m,i)=>{
      const y=30+i*52, x=150, sw=(1.2+m.v*5).toFixed(2), opv=(0.22+m.v*0.7).toFixed(2);
      edges+=`<line x1="${cx+26}" y1="${cy}" x2="${x}" y2="${y}" stroke="${m.top?'#0d9488':'#cbd5e1'}" stroke-width="${sw}" stroke-opacity="${opv}"/>`;
      nodes+=`<g><rect x="${x}" y="${y-13}" width="186" height="26" rx="7" fill="${m.top?'#0d9488':'#fff'}" stroke="${m.top?'#0d9488':'#cbd5e1'}" stroke-width="1.3"/>`+
        `<text x="${x+11}" y="${y+4}" font-size="11" font-weight="${m.top?800:600}" fill="${m.top?'#fff':'#475569'}">${m.k}</text>`+
        `<text x="${x+175}" y="${y+4}" text-anchor="end" font-size="10" font-weight="800" fill="${m.top?'#ccfbf1':'#94a3b8'}">${m.v.toFixed(2)}</text></g>`;
    });
    return `<svg class="op-greact" viewBox="0 0 350 168" preserveAspectRatio="xMidYMid meet">${edges}`+
      `<circle cx="${cx}" cy="${cy}" r="27" fill="#0f766e"/><text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#fff">요청</text><text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="7.5" fill="#99f6e4">백엔드 2명</text>`+
      `${nodes}</svg>`;
  }
  function opOntologyAside(C){
    return `<div class="op-sh">의미 이해 · 온톨로지 <span>요청 → 표준 직무 모델 (신뢰도)</span></div>
      <div class="op-graph">${opOntologyGraph(C)}</div>
      ${recrDidFlow(C)}`;
  }

  /* 파이프라인 보드(ATS) */
  function board(C){
    /* 현재 진행 프런티어 = reached 된 마지막 단계(현재 단계 컬럼 하이라이트 · 표시용) */
    const reachedKeys=STAGES.filter(st=>reached(C,st.k)).map(st=>st.k);
    const liveKey=reachedKeys[reachedKeys.length-1]||'';
    let cols=STAGES.map(st=>{
      const on=reached(C,st.k);
      let cards=on?CAND.filter(c=>colOf(C,c)===st.k):[];
      cards=sortCands(C,cards);
      const n=on?cards.length:0;
      const live=on&&st.k===liveKey;
      return `<div class="recr-col${on?'':' off'}${live?' live':''}">
        <div class="rcol-h"><span class="rcol-t">${st.ko}</span><span class="rcol-n">${on?n:'·'}</span></div>
        <div class="rcol-body">${on?(cards.length?cards.map(c=>candCard(c,C)).join(''):'<div class="rcol-empty">—</div>'):'<div class="rcol-empty">준비 전</div>'}</div>
      </div>`;
    }).join('');
    const tools=boardReady(C)?boardTools(C):'';
    return tools+`<div class="recr-board">${cols}</div>`;
  }

  /* ── 'AAP가 해둔 일' 밴드 = 완료된 auto 작업 체크리스트(녹임) ── */
  function doneBand(C){
    const reached=boardReady(C);
    const items=[
      {t:`이력서 ${applicantsOf(C)}건 수집·파싱`, on:atOrAfter(C,'screen')},
      {t:'스킬·경력·도메인 매칭·랭킹', on:atOrAfter(C,'screen')},
      {t:'편향·개인정보 점검', on:atOrAfter(C,'screen')},
    ];
    const resOn=reached;
    return `<div class="ws-done">
      <div class="ws-done-h">${I('sparkles')}AAP가 해둔 일<button class="ws-done-more" data-aapsee>어떻게 했는지 →</button></div>
      <div class="ws-done-grid">
        ${items.map(it=>`<div class="ws-done-i ${it.on?'':'pend'}"><span class="ck">${it.on?I('check'):''}</span>${it.t}</div>`).join('')}
        <div class="ws-done-i res ${resOn?'':'pend'}"><span class="ck">${I('arrow-right')}</span>상위 후보 ${resOn?JOB.screened:'—'}명 정리됨</div>
      </div></div>`;
  }
  /* ── '당신이 결정할 것' 결정 큐 히어로 — 코어 일반 도출(C.gates) + 채용 표현 ── */
  const GATE_TXT={
    shortlist_gate:{t:'숏리스트 기준 정하기', d:C=>{const th=cutThreshold(C),n=passCount(C,th);return `지원 <b>${JOB.applicants}명</b> → 컷 <b>매칭 ≥ ${th}%</b>면 <b>${n}명</b>. 기준을 정하면 면접 대상이 확정돼요.`;}, btn:'정하기', primary:true},
    interview_gate:{t:'면접 일정 확인', d:C=>{const n=INTERVIEW.filter(iv=>shortlistIds(C).includes(iv.cid)).length||INTERVIEW.length;return `<b>${n}건</b> 제안 · 캘린더 교차 <b>충돌 0</b>. 확인하면 후보에게 안내가 나가요.`;}, btn:'확인'},
    offer_gate:{t:'오퍼 승인', d:()=>{const c=cById(OFFER.cid);return `${c.name} · 기본급 <b>${OFFER.base}</b> · 보상밴드 내 · 차별금지 통과. 외부로 나가는 마지막 단계예요.`;}, btn:'검토'},
  };
  function decisionDeck(C){
    const gates=C.gates();
    const pend=gates.filter(g=>g.state==='pending');
    const items=pend.length?pend:gates;   /* pending 우선, 없으면 예정 게이트 안내 */
    if(!items.length)return '';
    const n=pend.length;
    return `<div class="ws-deck">
      <div class="ws-deck-h"><span class="t">당신이 결정할 것</span>${n?`<span class="c">${n}</span>`:''}<span class="hint">나머지는 AAP가 처리했어요</span></div>
      ${items.map((g,idx)=>{const tx=GATE_TXT[g.id]||{t:g.label,d:()=>g.role||'',btn:'확인'};
        const desc=typeof tx.d==='function'?tx.d(C):(tx.d||'');
        const up=g.state!=='pending';
        return `<div class="ws-q ${up?'upcoming':''}">
          <span class="ws-qn">${idx+1}</span>
          <div class="ws-qmain"><div class="ws-qt">${tx.t}</div><div class="ws-qd">${desc}</div></div>
          ${up?`<span class="ws-qup">진행 후</span>`:`<button class="ws-qbtn ${idx===0&&tx.primary!==false?'':'ghost'}" data-gate="${g.id}">${tx.btn}</button>`}
        </div>`;}).join('')}
    </div>`;
  }
  /* ── 근거·상위 후보(작은 리스트 · 결정 보조) + '전체 보기'(보드 접힘) ── */
  function evidList(C){
    if(!boardReady(C))return '';
    const sort=C.S.recrSort||'match';
    const top=CAND.slice().sort((a,b)=> sort==='score'?(totalScore(b)-totalScore(a)):(mOf(C,b)-mOf(C,a))).slice(0,4);
    const sg=(k,lb)=>`<button class="ws-sort ${sort===k?'on':''}" data-sort="${k}">${lb}</button>`;
    const rows=top.map(c=>{const fs=flagsOf(c),top0=fs[0],warn=top0&&top0.t!=='ok';
      return `<div class="ws-ev-r" data-cand="${c.id}"><span class="ws-ev-av">${c.ini}</span><div class="ws-ev-m"><div class="ws-ev-nm">${c.name}</div><div class="ws-ev-cur">${c.yrs}년 · ${c.cur}</div></div><span class="ws-ev-sig ${warn?'warn':'ok'}">${top0?top0.ko:'적합'}</span><span class="ws-ev-mt">${mOf(C,c)}%</span></div>`;}).join('');
    return `<div class="ws-ev-h"><span class="t">근거 · 상위 후보</span><span class="s">결정을 돕는 자료</span><div class="ws-ev-sort">${sg('match','매칭순')}${sg('score','종합순')}</div></div>
      <div class="ws-evlist">${rows}<button class="ws-ev-more" data-allboard>후보 ${JOB.screened}명 · 파이프라인 전체 보기 →</button></div>
      ${C.S.recrAllBoard?`<div class="ws-allboard"><div class="ws-allboard-h">파이프라인 보드 <button class="ws-allboard-x" data-allboard>접기</button></div>${board(C)}</div>`:''}`;
  }
  function base(C){
    const S=C.S,R=C.R,w=C.W(S.sel),id=w.id,working=R.phase==='working';
    const stMap={intake:working?'채용 요청을 받고 있어요…':'요건을 접수했어요 · 분석을 시작합니다',analyze:working?'AAP가 요건을 분석하고 있어요':'JD·요건·매칭 가중을 정리했어요',
      design:working?'AAP가 스크리닝 실행 구조를 구성하고 있어요':'스크리닝 계획을 준비했어요',shortlist_gate:working?'스크리닝 계획을 정리하고 있어요':'숏리스트 기준을 정해 주세요',
      screen:working?'이력서를 수집·파싱·매칭·랭킹하고 있어요':'스크리닝을 마쳤어요',interview_gate:working?'면접 일정을 조율하고 있어요':'면접 일정을 확인해 주세요',
      evaluate:working?'면접 평가를 취합하고 있어요':'평가를 취합했어요 · 오퍼안 준비됨',offer_gate:working?'오퍼안을 정리하고 있어요':'오퍼를 승인해 주세요',record:working?'결과를 발송·기록하고 있어요':'채용 처리를 마쳤어요'};
    let b=`<div class="ws-status">${working?'<span class="spin"></span>':''}${stMap[id]||(working?'처리 중…':'완료')}</div>`;
    /* 처리 중(working)이면 병렬 트랙으로 진행감만, 정착 시 워크스페이스 본문 */
    if(working && (id==='screen'||id==='record'||id==='interview_gate'||id==='evaluate'||id==='design')){
      b+=C.par(id==='screen'?['이력서 파싱(38)','요건 매칭','스코어·랭킹','편향 점검']:(id==='design'?['이력서 파싱','요건 매칭','랭킹·스코어','면접 일정']:(id==='interview_gate'?['후보 가용 조회','면접관 가용','슬롯 매칭']:(id==='evaluate'?['스코어카드 취합','합격 판정','보상·정책 점검']:['오퍼 발송','ATS 기록','온보딩 등록']))));
    }
    /* 'AAP가 해둔 일' 밴드는 분석 이후부터 의미 있음 */
    if(atOrAfter(C,'analyze')) b+=doneBand(C);
    /* 결정 큐 히어로 — 책임 지점 전면 */
    b+=decisionDeck(C);
    /* 근거·상위 후보(결정 보조 · 작게) + 전체 보기 */
    b+=evidList(C);
    return b;
  }
  /* 탭별 surface 본문 — 파이프라인(보드)/후보(정렬 가능 카드)/스코어카드/면접 */
  function tabBody(C){
    const t=activeTab(C);
    if(t==='후보')return candList(C);
    if(t==='스코어카드')return scoreTab(C);
    if(t==='면접')return interviewTab(C);
    return board(C);
  }
  /* 후보 탭 = 전체 후보를 정렬·필터로 훑어보는 그리드(보드 컬럼 대신 평면 카드) */
  function candList(C){
    const tools=boardTools(C);
    const cands=sortCands(C,CAND.slice());
    return tools+`<div class="recr-grid">${cands.map(c=>candCard(c,C)).join('')}</div>`;
  }
  /* 스코어카드 탭 = 숏리스트(컷 통과) 후보의 루브릭 스코어카드 */
  function scoreTab(C){
    const ids=shortlistIds(C);
    const list=(ids.length?ids:CAND.slice().sort((a,b)=>b.match-a.match).slice(0,5).map(c=>c.id));
    return `<div class="recr-sclist">${list.map(id=>scorecard(cById(id))).join('')}</div>`;
  }
  /* 면접 탭 = 확정 면접 일정 + 패널 */
  function interviewTab(C){
    const rows=INTERVIEW.filter(iv=>shortlistIds(C).includes(iv.cid));
    const list=(rows.length?rows:INTERVIEW);
    return `<div class="recr-ivlist">${list.map(iv=>{const c=cById(iv.cid);return `<div class="recr-iv"><span class="recr-av">${c.ini}</span><div class="riv-main"><div class="riv-nm">${c.name} <span class="riv-ty">${iv.type}</span></div><div class="riv-meta">${iv.slot} · 패널 ${iv.panel}</div></div><span class="riv-st">${I('calendar')}확정</span></div>`;}).join('')}</div>`;
  }
  /* JD 요약 스트립(상단 직무 슬롯) */
  function jdStrip(C,known){
    return `<div class="recr-jd"><div class="rjd-l"><span class="rjd-ic">${I('briefcase')}</span><div><div class="rjd-t">${JOB.title}</div><div class="rjd-s">${known?`필수 ${JOB.must.length} · 우대 ${JOB.plus.length} · 가중 ${JOB.weight.skill}/${JOB.weight.career}/${JOB.weight.domain}`:'요건 정의 중'}</div></div></div>
      <div class="rjd-r"><span class="rjd-stat"><b>${JOB.headcount}</b>채용</span><span class="rjd-stat"><b>${boardReady(C)?JOB.screened:applicantsOf(C)}</b>${boardReady(C)?'통과':'지원'}</span><button class="wl-go" data-dlv="jd">JD 보기</button></div></div>`;
  }

  /* 후보 상세(클릭 모달) — 이력서 요약 · 점수 분해(스킬/경력/도메인) · 플래그 · 근거 · 결정 버튼 */
  function candDetail(c,C){
    const m=mOf(C,c), bd=breakdown(c,C), fs=flagsOf(c), v=screenVerdict(c);
    const w=normWeight(C);
    const dec=(C.S.recrDecisions||{})[c.id];
    const bars=bd.map(b=>`<div class="cd-bd-row"><span class="cd-bd-k">${b.k} <em>×${b.w}</em></span><span class="cd-bd-bar"><i style="width:${b.raw}%"></i></span><span class="cd-bd-raw">${b.raw}</span><span class="cd-bd-c">+${b.contrib}</span><span class="cd-bd-sub">${b.sub}</span></div>`).join('');
    const flagH=fs.length?`<div class="cd-flags">${fs.map(f=>`<span class="cd-flag ${f.t}">${f.ko}</span>`).join('')}</div>`:'';
    /* 단계에 따라 가능한 결정(stage id 기준): screen=숏리스트/탈락,
       interview_gate~evaluate=면접확정/탈락, offer_gate~=오퍼/제외 */
    let acts='';
    if(atOrAfter(C,OFFER_ID)){
      acts=`<button class="cp-btn primary sm" data-rdec="offer" data-cid="${c.id}">오퍼 대상</button><button class="cp-btn ghost sm" data-rdec="reject" data-cid="${c.id}">제외</button>`;
    } else if(atOrAfter(C,INTERVIEW_ID)){
      acts=`<button class="cp-btn primary sm" data-rdec="interview" data-cid="${c.id}">면접 확정</button><button class="cp-btn ghost sm" data-rdec="reject" data-cid="${c.id}">탈락 처리</button>`;
    } else if(atOrAfter(C,SCREEN_ID)){
      acts=`<button class="cp-btn primary sm" data-rdec="shortlist" data-cid="${c.id}">숏리스트 승급</button><button class="cp-btn ghost sm" data-rdec="reject" data-cid="${c.id}">탈락 처리</button>`;
    }
    const decBadge=dec?`<span class="cd-dec ${dec}">${({shortlist:'숏리스트',interview:'면접',offer:'오퍼',reject:'탈락'})[dec]} 처리됨</span>`:'';
    return `<button class="cmodal-back" data-cback>${I('chevron-left')}보드로</button>
      <div class="cd-h"><span class="recr-av lg">${c.ini}</span><div class="cd-id"><div class="cd-nm">${c.name} ${decBadge}</div><div class="cd-cur">${c.yrs}년 · ${c.cur} · ${c.edu}</div></div><div class="cd-mt"><div class="cd-mt-n">${m}%</div><div class="cd-mt-l">매칭</div></div></div>
      ${flagH}
      <div class="cd-resume">${c.resume}</div>
      <div class="cd-sec">매칭 점수 분해 <span class="cd-formula">스킬×${w.skill} + 경력×${w.career} + 도메인×${w.domain} = ${m}</span></div>
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

  /* =======================================================================
     숏리스트 기준 편집기(io.editable 슬롯 구동) — 컷(임계값)·가중(스킬/경력/도메인) 직접 편집.
     편집은 STATE.recrCut/recrWeight(케이스 격리)에만 쓰고, 공유 JOB.weight·c.match 는 불변.
     슬라이더/프리셋 조작 → cutThreshold/mOf/shortlistIds 가 즉시 재산출(결정론).
     ======================================================================= */
  function editorBlock(C){
    const th=cutThreshold(C), w=normWeight(C), n=passCount(C,th);
    /* 프리셋(엄격 ≥90 / 표준 ≥85 / 넓게 ≥80) */
    const presets=[[90,'엄격'],[85,'표준'],[80,'넓게']].map(([v,lb])=>
      `<button class="ed-preset ${th===v?'on':''}" data-edcut="${v}">${lb}<span>≥ ${v}% · ${passCount(C,v)}명</span></button>`).join('');
    /* 가중 슬라이더 — 스킬·경력 2축 직접 + 도메인 잔차(합 100 자동) */
    const axis=(k,lb,val)=>`<div class="ed-w-row"><span class="ed-w-k">${lb}</span>
      <input type="range" class="ed-range" min="0" max="100" step="5" value="${val}" data-edw="${k}">
      <span class="ed-w-v">${val}</span></div>`;
    return `<div class="ed">
      <div class="ed-h"><span class="ed-t">${I('gauge')}숏리스트 기준 — 직접 조정</span><span class="ed-live">현재 컷 <b>≥ ${th}%</b> → 통과 <b class="ed-n">${n}명</b></span></div>
      <div class="ed-sec-k">컷(매칭 임계값)</div>
      <div class="ed-presets">${presets}</div>
      <div class="ed-cut"><input type="range" class="ed-range cut" min="70" max="100" step="1" value="${th}" data-edcut-range><span class="ed-cut-v">≥ ${th}%</span></div>
      <div class="ed-sec-k">매칭 가중 (합 100 자동 정규화)</div>
      ${axis('skill','스킬',w.skill)}
      ${axis('career','경력',w.career)}
      <div class="ed-w-row dom"><span class="ed-w-k">도메인 <em>(잔차)</em></span><span class="ed-w-bar"><i style="width:${w.domain}%"></i></span><span class="ed-w-v">${w.domain}</span></div>
      <div class="ed-note">${I('check')}편집은 이 케이스에만 적용돼요 — 공유 기준은 그대로예요.</div>
    </div>`;
  }
  /* kind: hitl | done | preview(코어 처리) | cand(후보 상세, 팩 커스텀). */
  function cmodal(kind,C){
    const S=C.S,sel=S.sel,ex=C.ex;
    if(kind==='evid'){ return evidDrill(C); }
    if(kind==='cand'){ const c=cById(S.recrOpen); return c?candDetail(c,C):''; }
    if(kind==='hitl'){
      if(sel==='shortlist_gate'){
        const th=cutThreshold(C);
        /* 상위 후보 = 케이스 가중(편집 반영) 적용 정렬 */
        const top=CAND.slice().sort((a,b)=>mOf(C,b)-mOf(C,a)).slice(0,5)
          .map(c=>`<div class="ed-prev-r ${mOf(C,c)>=th?'in':''}"><span class="recr-av sm">${c.ini}</span><span class="ed-prev-nm">${c.name}</span><span class="ed-prev-mt">${mOf(C,c)}%</span><span class="ed-prev-st">${mOf(C,c)>=th?'통과':'컷 미만'}</span></div>`).join('');
        return `<div class="cmodal-h">숏리스트 기준을 직접 정해 주세요</div><div class="cmodal-sub">AAP가 스크리닝 계획과 컷 후보를 준비했어요. 컷·가중을 조정하면 통과 후보가 바로 다시 계산돼요.</div>
          <div class="rv">
            <div class="rv-sec"><div class="rv-k">스크리닝 계획<button class="rv-more" data-dlv="report">리포트 보기</button></div><div class="rv-sum">이력서 ${JOB.applicants}건 파싱 → 스킬·경력·도메인 가중 매칭 → 루브릭 스코어링 (편향·PII 점검 포함)</div></div>
          </div>
          ${editorBlock(C)}
          <div class="ed-prev"><div class="ed-prev-h">통과 후보 미리보기<button class="rv-more" data-dlv="compare">비교표 보기</button></div>${top}</div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-yes>이 기준으로 스크리닝</button><button class="cp-btn ghost" data-no>컷 좁히기(≥90)</button></div>`;
      }
      if(sel==='interview_gate'){
        return `<div class="cmodal-h">면접 일정을 확인해 주세요</div><div class="cmodal-sub">AAP가 후보·면접관 캘린더를 교차해 충돌 0 슬롯을 잡았어요. 일정·패널을 확인하세요.</div>
          <div class="rv">
            ${INTERVIEW.filter(iv=>shortlistIds(C).includes(iv.cid)).map(iv=>{const c=cById(iv.cid);return `<div class="rv-sec"><div class="rv-k"><span class="recr-av sm">${c.ini}</span>${c.name} · ${iv.type}</div><div class="rv-sum">${iv.slot} · 패널 ${iv.panel}</div></div>`;}).join('')}
            <div class="rv-sec"><div class="rv-k">조율 결과<button class="rv-more" data-dlv="schedule">일정 보기</button></div><div class="rv-sum">충돌 0 · 후보 안내 발송 대기</div></div>
          </div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-yes>일정 확정·안내 발송</button><button class="cp-btn ghost" data-no>일정 조정 요청</button></div>`;
      }
      if(sel==='offer_gate'){
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
      if(sel==='screen'){
        const top=CAND.slice().sort((a,b)=>b.match-a.match).slice(0,3);
        const pass=CAND.filter(c=>screenVerdict(c).k==='pass').length, hold=CAND.filter(c=>screenVerdict(c).k==='hold').length, drop=CAND.filter(c=>screenVerdict(c).k==='drop').length;
        return `<button class="cmodal-x" data-close>${I('x')}</button><div class="cmodal-h done">스크리닝이 끝났어요 <span class="cp-check">${I('check')}</span></div>
          <div class="mtcard"><div class="mt-row"><span class="mt-ic">${I('briefcase')}</span><div><div class="mt-title">${JOB.title}</div><div class="mt-when">지원 ${JOB.applicants} → 통과 ${pass} · 보류 ${hold} · 탈락 ${drop} · 스코어카드 ${JOB.screened}건</div></div></div>
          <div class="recr-mini">${top.map(c=>`<div class="rm-r"><span class="recr-av sm">${c.ini}</span><span class="rm-nm">${c.name}</span><span class="rm-mt">${c.match}%</span><span class="rm-sc">${totalScore(c)}</span></div>`).join('')}</div>
          <div class="mt-foot">${I('check')} 편향·PII 점검 통과 · 후보 카드를 눌러 점수 분해를 보세요 <button class="wl-go" data-dlv="compare" style="margin-left:6px">비교표</button></div></div>
          <div class="cmodal-actions"><button class="cp-btn primary" data-close>확인</button></div>`;
      }
      if(sel==='record'){
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
    /* 근거 드릴 > 후보 상세 > HITL/done 순 우선 */
    currentCM:(S)=> S.recrEvid?'evid':(S.recrOpen?'cand':null),
    /* surface 루트(#surfHead/#surfBody)·모달(#cmodal) 공통 배선 */
    wire:(root,S,rerender)=>{
      root.querySelectorAll('[data-evid]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();S.recrEvid=e.dataset.evid;rerender();});
      root.querySelectorAll('[data-evback]').forEach(e=>e.onclick=()=>{S.recrEvid=null;rerender();});
      root.querySelectorAll('[data-cand]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();S.recrOpen=e.dataset.cand;rerender();});
      root.querySelectorAll('[data-sort]').forEach(e=>e.onclick=()=>{S.recrSort=e.dataset.sort;rerender();});
      root.querySelectorAll('[data-filt]').forEach(e=>e.onclick=()=>{S.recrFilter=e.dataset.filt;rerender();});
      root.querySelectorAll('[data-cback]').forEach(e=>e.onclick=()=>{S.recrOpen=null;rerender();});
      /* 결정 큐 아이템 → 해당 HITL 게이트 단계로 이동(코어 일반 메커니즘 · HITL 모달 자동 노출) */
      root.querySelectorAll('[data-gate]').forEach(e=>e.onclick=()=>{ if(window.AAP_CORE)window.AAP_CORE.go(e.dataset.gate); });
      /* 'AAP가 해둔 일 · 어떻게 했는지' → 「업무 진행」 탭으로 전환(코어 일반) */
      root.querySelectorAll('[data-aapsee]').forEach(e=>e.onclick=()=>{ if(window.AAP_setWsTab)window.AAP_setWsTab('progress'); });
      /* 파이프라인 전체 보기 토글 */
      root.querySelectorAll('[data-allboard]').forEach(e=>e.onclick=()=>{ S.recrAllBoard=!S.recrAllBoard; rerender(); });
      root.querySelectorAll('[data-rdec]').forEach(e=>e.onclick=()=>{
        S.recrDecisions=S.recrDecisions||{}; S.recrDecisions[e.dataset.cid]=e.dataset.rdec; S.recrOpen=null;
        rerender({persist:true, toast:({shortlist:'숏리스트로 승급했습니다',interview:'면접을 확정했습니다',offer:'오퍼 대상으로 지정했습니다',reject:'탈락 처리했습니다'})[e.dataset.rdec], trace:{t:'후보 결정 · '+e.dataset.cid+' → '+e.dataset.rdec,L:'L7',k:'HITL'}});
      });
      /* ── 숏리스트 기준 편집기(io.editable) — 컷·가중 직접 편집 → 결정론 재계산(케이스 격리) ──
         드래그 중 input = 라벨만 라이브 갱신(DOM 미재구성), 놓을 때 change = 전체 재계산+영속(드래그 끊김 방지). */
      root.querySelectorAll('[data-edcut]').forEach(e=>e.onclick=()=>{ S.recrCut=+e.dataset.edcut; rerender({persist:true, trace:{t:'숏리스트 컷 조정 → ≥'+S.recrCut+'%',L:'L7',k:'HITL'}}); });
      const cutR=root.querySelector('[data-edcut-range]');
      if(cutR){
        const lab=root.querySelector('.ed-cut-v');
        cutR.oninput=()=>{ if(lab)lab.textContent='≥ '+cutR.value+'%'; };
        cutR.onchange=()=>{ S.recrCut=+cutR.value; rerender({persist:true, trace:{t:'숏리스트 컷 조정 → ≥'+S.recrCut+'%',L:'L7',k:'HITL'}}); };
      }
      const applyW=(k,v)=>{
        const cur=S.recrWeight||{skill:JOB.weight.skill,career:JOB.weight.career,domain:JOB.weight.domain};
        const next={...cur,[k]:v};
        const other=k==='skill'?'career':'skill';
        if(v+(+next[other]||0)>100)next[other]=Math.max(0,100-v);   /* 합 100 초과 시 다른 직접 축 보정 */
        next.domain=Math.max(0,100-(+next.skill||0)-(+next.career||0));
        S.recrWeight=next;
      };
      root.querySelectorAll('[data-edw]').forEach(e=>{
        const lab=e.parentElement&&e.parentElement.querySelector('.ed-w-v');
        e.oninput=()=>{ if(lab)lab.textContent=e.value; };
        e.onchange=()=>{ applyW(e.dataset.edw,+e.value); rerender({persist:true, trace:{t:'매칭 가중 조정 · '+e.dataset.edw+' → '+e.value,L:'L4',k:''}}); };
      });
      /* 조작형 surface: 후보 빼고 다시(라이브 재분석) — 코어 wireSteer 와 별개로 즉시 재분석 트리거 */
      root.querySelectorAll('[data-opdrop]').forEach(e=>e.onclick=ev=>{ ev.stopPropagation();
        if(window.AAP_LIVE&&window.AAP_LIVE.busy())return;
        const id=e.dataset.opdrop; S.recrDropped=S.recrDropped||{}; S.recrDropped[id]=true;
        const cont=document.querySelector('.run-surface .con-body'); const cap=window.AAP_FLIP?window.AAP_FLIP.capture(cont):null;
        if(window.AAP_LIVE)window.AAP_LIVE.run({intent:'이 후보 제외하고 재구성', mono:'제외 후 풀 재계산', onDone:()=>{ rerender({persist:true, trace:{t:'후보 제외 → '+id,L:'L3',k:''}}); if(window.AAP_FLIP)requestAnimationFrame(()=>window.AAP_FLIP.play(document.querySelector('.run-surface .con-body'),cap)); }});
        else rerender({persist:true});
      });
    },
    /* ── 의도 steering 핸들러(코어 wireSteer 가 호출) — 결정론 recompute 는 STATE 갱신만.
       반환 {intent,mono,steps?,instant?,trace?,toast?} 로 코어가 라이브 재분석/FLIP 을 구동. ── */
    steerHook:(S,key,val)=>{
      if(key==='weight'){ const p=WPRESET[val]; if(!p)return {};
        /* #6 결과 diff: 가중 적용 '전' 지표 먼저 캡처(S 변경 전) */
        const Cb={S}; const thb=(typeof cutThreshold==='function')?cutThreshold(Cb):85;
        const passB=(typeof passCount==='function')?passCount(Cb,thb):'—';
        const topB=(typeof opRanked==='function')?(opRanked(Cb)[0]||{}).name:'';
        S.recrWPreset=val; S.recrWeight={skill:p.skill,career:p.career,domain:p.domain};
        /* 재분석을 '가중 적용 → 재산출 → 재랭킹 → 컷' 4단계로 펼쳐 각 단계 수치·근거를 보여줌(지적 1·2) */
        const Cx={S}; const pool=(typeof intentPool==='function')?intentPool(Cx):CAND;
        const th=(typeof cutThreshold==='function')?cutThreshold(Cx):85;
        const pass=(typeof passCount==='function')?passCount(Cx,th):'—';
        const topA=(typeof opRanked==='function')?(opRanked(Cx)[0]||{}).name:'';
        return {intent:p.lab+' 우선', mono:'가중 → '+p.skill+'/'+p.career+'/'+p.domain,
          steps:[
            {t:'가중 적용',tag:'읽기',d:'스킬·경력·도메인 '+p.skill+'/'+p.career+'/'+p.domain,basis:'normWeight ← preset '+val+' · 합 100 정규화'},
            {t:'매칭% 재산출',tag:'평가',d:pool.length+'명 점수 재계산',basis:'mOf = 스킬×'+p.skill+' + 경력×'+p.career+' + 도메인×'+p.domain+' (후보 '+pool.length+'명)'},
            {t:'재랭킹',tag:'판정',d:'매칭% 내림차순 정렬',basis:'opRanked() · 동점은 종합점수 차순'},
            {t:'컷 적용',tag:'판정',d:'컷 ≥'+th+'% → 통과 '+pass+'명',basis:'shortlistIds ← match ≥ '+th+'% · 면접 대상 확정'}
          ],
          diff:[ {label:'면접 대상(컷 통과)', from:passB+'명', to:pass+'명'},
                 {label:'1위 후보', from:topB||'—', to:topA||'—'} ],
          trace:{st:'매칭·랭킹',t:'우선순위 · '+p.lab+' (가중 '+p.skill+'/'+p.career+'/'+p.domain+')',L:'L4',k:''}}; }
      if(key==='filter'){ const f=Object.assign({remote:false,senior:false,commerce:false}, S.recrIntentFilt||{}); f[val]=!f[val]; S.recrIntentFilt=f;
        const lab={remote:'재택 가능자만',senior:'시니어만',commerce:'커머스 경험자만'}[val];
        return {intent:'필터: '+(f[val]?lab:'해제'), mono:'풀 재계산',
          trace:{st:'매칭·랭킹',t:'필터 · '+lab+(f[val]?' 적용':' 해제'),L:'L3',k:''}}; }
      if(key==='scope'){ S.recrScope=val;  /* 분기 = 즉시(재분석 없이) + 흐름 분기 */
        const m={top3:'정밀 — 톱 3만 면접',std:'표준 — 6명 면접',wide:'넓게 — 풀 확대'}[val];
        return {instant:true, trace:{st:'매칭·랭킹',t:'면접 범위 분기 · '+m,L:'L3',k:''}, toast:m+' → 면접 조율이 이 범위로 진행'}; }
      if(key==='slotpref'){ S.recrSlotPref=val;
        return {intent:val+' 선호로 슬롯 재교차', mono:'캘린더 교집합 재계산',
          steps:[{t:'선호 반영',tag:'읽기',d:val+'대 우선',basis:'slotPref = '+val+' · 후보·면접관 가용 시간대 필터'},
            {t:'캘린더 교차',tag:'대조',d:'후보 3 ∩ 면접관 가용',basis:'lookup: 후보 응답 ∩ 면접관 캘린더 → 후보 가용 슬롯'},
            {t:'슬롯 재배치',tag:'판정',d:'충돌 0 확인',basis:'중복·겹침 검사 → 충돌 0 · 슬롯 확정'}],
          trace:{st:'면접 조율',t:'슬롯 선호 · '+val,L:'L5',k:''}}; }
      if(key==='panel'){ S.recrPanel=val; const exec=val==='임원 포함';
        return {intent:'패널 재구성 · '+val, mono:'면접관 가용 재확인',
          steps:[{t:'패널 변경',tag:'읽기',d:val,basis:'panel = '+val+(exec?' · CTO/임원 추가':' · 표준 2인')},
            {t:'면접관 가용',tag:'대조',d:exec?'CTO/임원 포함':'표준 패널',basis:'lookup: 면접관 캘린더'+(exec?' + 임원 가용 교차':'')},
            {t:'슬롯 재확인',tag:'판정',d:'충돌 0',basis:'패널 변경 후 슬롯 충돌 재검사 → 0'}],
          trace:{st:'면접 조율',t:'패널 · '+val,L:'L3',k:''}}; }
      if(key==='evalw'){ S.recrEvalW=val; const W5=EVALW[val]||EVALW.bal;
        return {intent:'평가 가중 · '+EVALW_LAB[val], mono:'루브릭 5항 재가중',
          steps:[{t:'가중 변경',tag:'읽기',d:EVALW_LAB[val],basis:'루브릭 가중 ← '+W5.join('/')+' (합 100)'},
            {t:'종합 재계산',tag:'평가',d:'루브릭 5항 × 가중',basis:'종합 = Σ(항목점수 × 가중)/100 × 20'},
            {t:'스코어 갱신',tag:'판정',d:'종합 점수 재산출',basis:'합격 후보 종합점수 갱신 · 오퍼안 재구성'}],
          trace:{st:'평가·오퍼',t:'평가 가중 · '+EVALW_LAB[val],L:'L6',k:''}}; }
      if(key==='offerlvl'){ S.recrOfferLvl=val;
        const m={std:'표준',up:'상향',down:'하향(밴드 하한)'}[val];
        const base=val==='up'?'7,600만':val==='down'?'6,800만':OFFER.base, sign=val==='up'?'800만':val==='down'?'없음':OFFER.sign;
        return {intent:'오퍼 수준 · '+m, mono:'보상밴드 재점검',
          steps:[{t:'오퍼 수준',tag:'읽기',d:m,basis:'offerLevel = '+val+' · 기준 패키지 대비 '+(val==='up'?'+상향':val==='down'?'하향':'유지')},
            {t:'보상밴드 점검',tag:'대조',d:'밴드 내 확인',basis:'lookup: 직무 보상밴드 '+OFFER.band+' → '+base+' 밴드 내'},
            {t:'패키지 갱신',tag:'판정',d:'기본급 '+base+' · 사이닝 '+sign,basis:'기본급·사이닝 재산출 · 차별금지 통과'}],
          trace:{st:'평가·오퍼',t:'오퍼 수준 · '+m,L:'L7',k:''}}; }
      return {};
    },
    /* HITL 게이트 결정을 보드 상태로 (decide 후 코어가 호출). v=yes/no */
    decideHook:(S,v,sel)=>{
      if(sel==='shortlist_gate' && v==='yes'){ /* 편집한 컷·가중(recrCut/recrWeight) 그대로 확정 — 숏리스트 자동 배치 */ }
      if(sel==='shortlist_gate' && v==='no'){ S.recrCut=90; }   /* '컷 좁히기(≥90)' = 컷을 90으로 명시 고정 */
      if(sel==='offer_gate' && v==='yes'){ S.recrDecisions=S.recrDecisions||{}; S.recrDecisions[OFFER.cid]='offer'; }
    },
    /* STATE 영속 키(코어 persistToCase/hydrate 가 케이스에 같이 저장) — 컷·가중은 케이스 격리 편집값.
       조작형 steering 값(우선순위·필터·범위·면접 슬롯/패널·평가가중·오퍼수준·후보제외)도 케이스 격리 영속. */
    persistKeys:['recrDecisions','recrSort','recrFilter','recrCut','recrWeight','recrUploads','recrSourced','recrJdUploaded',
      'recrWPreset','recrIntentFilt','recrScope','recrSlotPref','recrPanel','recrEvalW','recrOfferLvl','recrDropped'],
    /* 케이스/단계 전환 시 초기화할 transient 키(열린 상세 모달 · 탭 탐색 · 전체 보드 펼침) */
    transientKeys:['recrOpen','activeTab','recrAllBoard'],
  };

  /* 데모용 시드 케이스(인스턴스) — 서로 다른 진행 상태 */
  const SEEDS=[
    {title:'백엔드 개발자 2명 채용', customer:'플랫폼개발팀 · JD-2041', icon:'💼', request:WORKLOAD.request, atStep:'intake', pickedTime:'표준 · match ≥ 85'},
    {title:'프로덕트 디자이너 채용', customer:'디자인팀 · JD-2052', icon:'💼', request:'"프로덕트 디자이너 1명 채용해줘. 포트폴리오 1차 스크리닝부터."', atStep:'intake'},
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
      {do:{open:1, go:'analyze'}, target:'.op-strip, .strm-left .sline',
       title:'AAP가 요청을 요건으로 분해합니다',
       body:'"백엔드 2명 충원" 한 문장을 AAP가 직무·인원·연차·필수 스택으로 분해하고, 매칭 가중(스킬·경력·도메인)과 차별금지·개인정보 정책까지 자율로 달아 실행 흐름을 세웁니다. 작업 스트림이 위에서 아래로 자동으로 쌓입니다.'},
      {do:{go:'design'}, target:'.op-steer, .op-main, .strm-left .sline',
       title:'필요한 구성요소를 골라 조합합니다',
       body:'AAP는 Agent를 많이 띄우는 게 아닙니다. 이력서 파싱·요건 매칭 Agent, OCR·편향 점검 Module, 기존 ATS, 캘린더 Connector, 차별금지 Policy를 업무에 맞게 골라 스크리닝 실행 구조로 조합합니다. 각 단계 카드의 구성요소 배지(5타입 색)로 확인할 수 있습니다.'},
      {do:{go:'shortlist_gate'}, target:'#cmodal .cmodal-card',
       title:'책임이 걸린 지점은 사람이 정합니다 (HITL ①)',
       body:'AAP가 스크리닝 계획과 숏리스트 컷 후보(엄격/표준/넓게)를 제시합니다. 어느 기준으로 거를지 — 숏리스트 컷은 채용담당이 직접 정하는 첫 번째 게이트입니다.'},
      {do:{go:'screen'}, target:'.op-main, .strm-arts',
       title:'승인된 기준대로 AAP가 자율 실행·랭킹을 구성합니다',
       body:'담당자가 정한 기준대로 AAP가 이력서 38건을 수집·파싱·매칭·랭킹하고 편향·PII를 점검합니다. 후보 랭킹은 정적 결과가 아닙니다 — 우선순위(스킬·경력·도메인)·필터·면접 범위를 직접 조정하면 AAP가 그 자리에서 다시 분석해 순위·근거·매칭 그래프가 갈라집니다.'},
      {do:{go:'interview_gate'}, target:'#cmodal .cmodal-card',
       title:'외부로 나가는 안내는 사람이 확인합니다 (HITL ②)',
       body:'AAP가 후보·면접관 캘린더를 교차해 충돌 0 슬롯을 잡았습니다. 후보에게 안내가 나가는 단계라, 일정·패널을 담당자가 확인한 뒤 발송합니다.'},
      {do:{go:'evaluate'}, target:'.op-main, .strm-left .sline',
       title:'면접이 끝나면 평가를 취합합니다',
       body:'AAP가 면접관 스코어카드를 모아 정합성을 점검하고 합격 후보·오퍼 패키지 초안을 정리합니다. 보상밴드·차별금지를 사전 점검해 다음 승인 게이트에 올립니다.'},
      {do:{go:'offer_gate'}, target:'#cmodal .cmodal-card',
       title:'오퍼 발송 직전, 최종 승인을 받습니다 (HITL ③)',
       body:'후보에게 오퍼가 나가는 마지막 행동은 담당자·현업 리드의 최종 승인으로 멈춰 둡니다. 보상밴드·헤드카운트·차별금지가 점검된 오퍼안을 확인하고 승인합니다.'},
      {do:{view:'logs'}, target:'#traceLog',
       title:'모든 판단이 기록되고 학습으로 남습니다',
       body:'요청→파싱→매칭→사람 승인→오퍼까지 전 구간이 Run Trace에 남아 감사·재현이 가능합니다. 이번 채용 패턴은 다음 포지션의 매칭 정확도를 높이는 학습 자산이 됩니다.'},
    ],
  };

  /* 온톨로지(L4) — AAP가 추론·편집하는 의미 레이어. LLM은 이 객체들을 통해서만 데이터에 접근(통제된 reasoning). */
  const ONTOLOGY={
    /* k = 그래프 매칭용 핵심 키(영문). n = 표시명. a = 속성. on = 이 객체에 걸리는 Action 키. */
    objects:[
      {k:'Candidate', n:'Candidate(후보)', a:['이름','경력','스킬','매칭%','상태'], on:['parse']},
      {k:'Job', n:'Job(직무)', a:['직무','필수/우대 스킬','인원','보상밴드']},
      {k:'Application', n:'Application(지원)', a:['후보↔직무','매칭 점수','판정'], on:['score','screen','shortlist']},
      {k:'Interview', n:'Interview(면접)', a:['슬롯','면접관','스코어카드'], on:['interview']},
      {k:'Offer', n:'Offer(오퍼)', a:['조건','상태'], on:['offer']},
    ],
    /* from/to = objects[].k 핵심 키로 매칭. label = 엣지 라벨. t = 하위호환 display 문자열. */
    relations:[
      {from:'Candidate', label:'applies', to:'Job', t:'Candidate —<em>applies</em>→ Job'},
      {from:'Application', label:'scored-by', to:'Candidate', t:'Application —<em>scored-by</em>→ 매칭(스킬·경력·도메인)'},
      {from:'Application', label:'for', to:'Job', t:'Application —<em>for</em>→ Job'},
      {from:'Interview', label:'for', to:'Candidate', t:'Interview —<em>for</em>→ Candidate'},
      {from:'Offer', label:'to', to:'Candidate', t:'Offer —<em>to</em>→ Candidate'},
    ],
    /* key = 객체의 on[]이 참조. mode = auto(자동·green) / confirm(사람 확인·amber). */
    actions:[
      {key:'parse', n:'이력서 파싱·정규화', mode:'auto'},
      {key:'score', n:'매칭 점수 산출', mode:'auto'},
      {key:'screen', n:'스크리닝 판정(통과/보류/탈락)', mode:'auto'},
      {key:'shortlist', n:'숏리스트 승급', mode:'confirm'},
      {key:'interview', n:'면접 확정', mode:'confirm'},
      {key:'offer', n:'합격·오퍼 발송', mode:'confirm'},
    ],
  };

  (window.AAP_PACKS=window.AAP_PACKS||{}).recruiting={
    id:'recruiting', label:'채용', ontology:ONTOLOGY,
    times:TIMES, products:PRODUCTS, flow:FLOW, work:FLOW, components:COMPONENTS, compose:COMPOSE,
    workload:WORKLOAD, planProduces:PLAN_PRODUCES, gates:GATES, govern:GOVERN, seeds:SEEDS,
    /* 인박스 카드 brief(개입 이유·판단·근거·액션) — 단계(sel) 기반 도메인 문장(지시서 #11) */
    inboxBrief:function(c){
      if(c.done)return {reason:'auto', judgment:'채용 절차가 끝까지 완료됐습니다 — 오퍼 발송·ATS 기록까지.', basis:['최종 후보','오퍼 승인','ATS 기록'], actions:[{l:'상세 보기',k:'secondary'}]};
      const G={
        shortlist_gate:{j:`지원 ${JOB.applicants}명을 점수화했고, 면접 대상 숏리스트 기준 승인이 필요합니다.`, b:['JD 요건','후보 매칭 점수','채용 정책'], a:[{l:'검토하기',k:'primary'},{l:'기준 조정',k:'secondary'}]},
        interview_gate:{j:'면접 일정 후보를 캘린더 교차로 잡았습니다 — 충돌 0건. 후보 안내 전 확인이 필요합니다.', b:['면접 슬롯','캘린더 가용성','면접 패널'], a:[{l:'검토하기',k:'primary'},{l:'기준 조정',k:'secondary'}]},
        offer_gate:{j:'합격 후보의 오퍼 패키지를 만들었습니다(보상밴드 내·차별금지 통과). 외부 발송 전 최종 승인이 필요합니다.', b:['보상밴드','차별금지 통과','오퍼 조건'], a:[{l:'검토하기',k:'primary'},{l:'반려',k:'secondary'}]},
      };
      if(G[c.sel])return {reason:'decision', judgment:G[c.sel].j, basis:G[c.sel].b, actions:G[c.sel].a};
      return {reason:'decision', judgment:'요청을 받아 JD·요건을 분해하고 스크리닝을 준비 중입니다. 곧 숏리스트 기준 승인이 필요합니다.', basis:['JD 요건','매칭 가중','채용 정책'], actions:[{l:'검토하기',k:'primary'},{l:'기준 조정',k:'secondary'}]};
    },
    demoScenario:DEMO_SCENARIO,
    /* ── 결정층(수렴 ②) — scored-list shape. 결정은 코어 evaluate(SCREEN_ROUTE)가 소유.
       단일케이스 evalCase 는 shape 가드로 skip(항목별 판정). caseModel.slots 없음 → 코어 generic
       single-case 콘솔 미발동(surface.opstage 가 채용 리치 ATS 콘솔을 그림). 표준 정합·향후 generic
       scored-list 렌더(2차)의 데이터 근거. axes = match 산출 3축(가중=weightKey → io.editable weight steering). ── */
    caseModel:{ shape:'scored-list', items:CAND, scoreKey:'match', riskKey:'has_risk', riskFlags:['stability','icmiss'],
      axes:[ {key:'sk', label:'스킬 적합', weightKey:'skill'}, {key:'ca', label:'경력 적합', weightKey:'career'}, {key:'dm', label:'도메인 적합', weightKey:'domain'} ] },
    knowledge:{ route:SCREEN_ROUTE, weights:JOB.weight,
      thresholds:[ {key:'cut', label:'숏리스트 컷(매칭 임계)', def:85, opts:[[90,'엄격 90'],[85,'표준 85'],[80,'넓게 80']]} ] },
    /* ── io 슬롯(Pack Contract v2 §3.2) — 실동작(결정론 mock). 코어 일반 핸들러가 구동 ──
       inputs = 자료 업로드(이력서/JD/평가기준). setKey 로 STATE 갱신 → surface 가 카운트 반영.
       editable = 숏리스트 컷·가중(모달 editorBlock 이 STATE.recrCut/recrWeight 로 결정론 재계산).
       connectors = 외부 채용사이트 소싱(잡코리아·사람인·링크드인) → recrSourced 가산. */
    io:{
      inputs:[
        {stage:'intake', type:'file', key:'resume', label:'이력서 일괄 업로드', accept:'.pdf,.docx', hint:'+8건', setKey:'recrUploads', delta:8, L:'L5', note:'이력서 8건 수집', toast:'이력서 8건이 파이프라인에 반영됐습니다'},
        {stage:'intake', type:'file', key:'jd', label:'JD·평가기준 첨부', accept:'.pdf,.docx', hint:'요건 반영', setKey:'recrJdUploaded', setVal:true, L:'L4', note:'JD·평가기준 반영', toast:'JD·평가기준을 요건에 반영했습니다'},
      ],
      editable:[
        {key:'cut', label:'숏리스트 컷(매칭 임계값)', type:'threshold', stage:'shortlist_gate', stateKey:'recrCut', recompute:'cutThreshold→shortlistIds'},
        {key:'weight', label:'매칭 가중(스킬/경력/도메인)', type:'weight', stage:'shortlist_gate', stateKey:'recrWeight', recompute:'mOf→shortlistIds'},
      ],
      connectors:[
        {id:'jobkorea', stage:'intake', label:'잡코리아', system:'JobKorea', stub:true, hint:'+12명', setKey:'recrSourced', delta:12, L:'L5', note:'잡코리아 12명 소싱', toast:'잡코리아에서 후보 12명을 소싱했습니다'},
        {id:'saramin', stage:'intake', label:'사람인', system:'Saramin', stub:true, hint:'+9명', setKey:'recrSourced', delta:9, L:'L5', note:'사람인 9명 소싱', toast:'사람인에서 후보 9명을 소싱했습니다'},
        {id:'linkedin', stage:'intake', label:'링크드인', system:'LinkedIn', stub:true, hint:'+6명', setKey:'recrSourced', delta:6, L:'L5', note:'링크드인 6명 소싱', toast:'링크드인에서 후보 6명을 소싱했습니다'},
      ],
    },
    stepLoop:{intake:'Data',analyze:'Semantic',design:'Reasoning',shortlist_gate:'Decision',screen:'Action',interview_gate:'Decision',evaluate:'Action',offer_gate:'Decision',record:'Learning'},
    extExcluded:(S)=>S.decisions['shortlist_gate']==='no',   /* 컷 좁히기(≥90) = ex(엄격 컷) */
    /* (b) 함수형 surface — ATS 화면을 코어 generic 렌더 대신 이 팩이 직접 그린다.
       opstage/opStages = 조작형 콘솔(의도 steering + 라이브 재분석 + FLIP + SVG 그래프) — 코어 프레임워크 구동. */
    surface:{head, base, cmodal, opstage, opStages},
    /* 도메인 인터랙션 훅(코어가 일반 메커니즘으로 호출) */
    surfaceHooks:SURF_HOOKS,
  };
})();
