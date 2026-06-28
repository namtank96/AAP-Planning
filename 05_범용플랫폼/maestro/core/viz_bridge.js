/* =========================================================================
   AAP_VIZ_BRIDGE — 업무 설명 → 분해 뷰(AAP_VIZ) 연결
   ─────────────────────────────────────────────────────────────────────────
   analyze(text, el): 라이브 LLM(AAP_LLM_BREAKDOWN) 우선 → 실패/미가동 시
   결정론 detViz(text) 폴백 → AAP_VIZ.mount(el, data).
   · detViz = 자기완결 결정론 분해(키워드 신호 → 캐논 가변 단계 + 5타입 ops + 게이트).
     온톨로지/Lineage 는 LLM 만 생성(결정론 폴백은 분해·재구성만) → 빈 탭 ✕(조건부 탭).
   · 의존: viz_decomp.js(AAP_VIZ) 필수, llm_breakdown.js(AAP_LLM_BREAKDOWN) 선택.
   ========================================================================= */
(function(){
  "use strict";
  var KW={
    external:['발송','전송','통지','안내','공유','초대','메일','메시지','대외','외부','공시','신고','제출'],
    write:['등록','반영','기록','갱신','저장','입력','발행','확정','승인','처리','조치','지급','결제','정산'],
    risk:['책임','승인','보안','리스크','위험','규정','제재','컴플라이언스','감사','개인정보','법','계약','금액','고액','안전'],
    data:['조회','확인','검토','수집','분석','대조','검색','이력','데이터','시스템','db','erp','문서','영수증'],
    decide:['판단','결정','선택','심사','평가','정한','여부','승인','분류','산정']
  };
  function hit(t,a){return a.filter(function(k){return t.indexOf(k)>=0;});}
  function op(ty,L,nm,desc,reads,out,why){return {ty:ty,L:L,nm:nm,desc:desc,reads:reads,out:out,why:why};}

  /* 결정론 분해 — 입력 신호에 따라 단계·구성·게이트 가변(고정 골격 ✕) */
  function detViz(text){
    var t=String(text||'').toLowerCase();
    var sExt=hit(t,KW.external).length, sWr=hit(t,KW.write).length, sRk=hit(t,KW.risk).length,
        sDt=hit(t,KW.data).length, sDc=hit(t,KW.decide).length;
    var firstLine=(String(text||'').split('\n')[0]||'새 업무').replace(/\.$/,'').slice(0,30);
    var work=[], compose={A:0,M:0,S:0,C:0,P:0}, items={A:[],M:[],S:[],C:[],P:[]};
    function add(ty,nm){compose[ty]++;if(items[ty].length<5)items[ty].push(nm);}

    work.push({id:'request',can:'입력',nm:'요청 접수',actor:'human',
      actions:['업무 요청 수신','핵심 신호·대상 추출'],data:['요청 본문'],dec:[],risk:[],
      why:'사람이 낸 업무 요청이 출발점입니다. AAP가 대상·요구를 구조화합니다.',ops:[]});

    var uOps=[op('A','L4','분류 Agent','요청을 업무 유형으로 구조화','요청·유형 온톨로지',firstLine,'요청 의미 해석은 Agent — 규칙으로 다 못 잡음.')];
    add('A','분류');
    if(sRk){uOps.push(op('P','L7','정책 플래그','규정·책임 신호 표시','규정·정책',sRk?'규정 플래그':'—','규정 적용은 정책 엔진.'));add('P','규정 플래그');}
    work.push({id:'understand',can:'의미화',nm:'업무 이해·분석',actor:'aap',
      actions:uOps.map(function(o){return o.nm;}),data:sDt?['업무 이력','연결 시스템']:['업무 이력'],
      dec:sDc?['처리 경로 분류']:['처리 경로'],risk:sRk?['규정·책임 신호']:[],
      why:'유형을 의미 분류해 처리 경로를 정하고, 정책 신호로 뒤 단계 게이트를 예고합니다.',ops:uOps});

    var cOps=[op('A','L2','작업 분해','운영 단위 작업으로 분해','업무 정의','작업 그래프','실행 단위 설계 판단은 Agent.')];
    add('A','작업분해');
    if(sDt){cOps.push(op('C','L5','데이터 Connector','연결 대상·근거 데이터 식별','연결 권한','데이터 경로','시스템 연동은 결정론 Connector.'));add('C','데이터 연동');}
    cOps.push(op('A','L3','구성요소 배정','5타입을 작업에 배정·조합','작업 그래프','실행 구조','필요 구성 판단·조합은 Supervisor Agent.'));add('A','배정');
    cOps.push(op('M','L6','리스크 점검','누락·리스크 결정론 점검','체크리스트','리스크 표시','결정론 검증은 Module.'));add('M','검증');
    work.push({id:'compose',can:'구성',nm:'실행 구조 구성',actor:'aap',
      actions:cOps.map(function(o){return o.nm;}),data:sDt?['연결 시스템·문서']:['업무 정의'],dec:['실행 그래프'],risk:[],
      why:'작업으로 쪼개고 각 작업에 맞는 5타입을 골라 조합합니다 — Agent만 띄우는 그림이 아닙니다.',ops:cOps});

    var gates=[];
    if(sDc||sRk){
      work.push({id:'approve',can:'HITL ①',nm:'계획·판단 승인',actor:'hitl',gate:1,
        actions:['계획·옵션 제시','검토 게이트 보류'],data:['처리안·옵션'],dec:['처리 수준 결정'],risk:['책임 판단'],
        why:'처리 수준·판단은 책임이 걸린 결정 — 사람이 정합니다. AAP는 옵션을 제시할 뿐.',ops:[]});
      gates.push({stepId:'approve',reason:'처리 수준·판단 = 책임 판단 (사람이 결정)'});
    }

    var pOps=[];
    if(sDt){pOps.push(op('C','L5','데이터 조회','근거 데이터 수집·조회','연결 시스템','근거 확보','수집·연동은 Connector.'));add('C','조회');}
    pOps.push(op('A','L3','처리·산출물 생성','분석·판단·산출물 생성','근거·템플릿','산출물 초안','분석·생성은 Agent.'));add('A','처리');
    if(sWr){pOps.push(op('S','L8','시스템 반영','기간계 반영·기록','시스템 API','반영 완료','조회·반영은 기존 솔루션(Buy·Integrate).'));add('S','기간계');}
    work.push({id:'prepare',can:'실행',nm:'처리 실행',actor:'aap',
      actions:pOps.map(function(o){return o.nm;}),data:sDt?['근거 데이터']:['업무 데이터'],dec:[],risk:sWr?['시스템 반영=정정 비용']:[],
      why:'승인된 대로 자율 실행합니다. 조회는 결정론, 산출물 생성은 Agent — 전 구간 기록됩니다.',ops:pOps});

    if(sExt||sWr){
      work.push({id:'commit',can:'HITL ②',nm:'최종·발송 승인',actor:'hitl',gate:1,
        actions:['결과 취합',sExt?'발송·정책 점검':'반영·정책 점검','게이트 보류'],data:['산출물'],dec:['발송/반영 여부'],
        risk:[sExt?'대외 영향 되돌리기 어려움':'시스템 반영 정정 비용'],
        why:(sExt?'외부 발송':'시스템 반영')+'은 되돌리기 어려운 행동 — 직전에 사람이 확인합니다.',ops:[]});
      gates.push({stepId:'commit',reason:sExt?'대외 발송·통지 = 외부 영향':'시스템 반영 = 되돌리기 어려움'});
    }

    var sOps=[op('A','L3','결과 전달','결과 전달·산출물 제공','산출물','전달 완료','산출물 전달은 Agent.')];add('A','전달');
    if(sWr){sOps.push(op('S','L8','시스템 기록','이력 등록·기록','기록 시스템','기록 완료','기록은 기존 솔루션 연동.'));add('S','기록');}
    sOps.push(op('A','L7','학습 자산화','패턴 축적·룰 개선','유형·처리·피드백','패턴 저장','학습 되먹임은 Agent.'));add('A','자산화');
    work.push({id:'share',can:'학습',nm:'반영·기록·학습',actor:'aap',
      actions:sOps.map(function(o){return o.nm;}),data:['처리 이력'],dec:[],risk:[],
      why:'결과를 전달·기록하고 패턴을 축적해 다음 처리를 개선합니다.',ops:sOps});

    var TYL={A:'Agent',M:'Module',S:'기존 솔루션',C:'Connector',P:'Policy'};
    var composeArr=['A','M','S','C','P'].map(function(k){return {ty:k,n:compose[k],items:items[k]};}).filter(function(c){return c.n>0;});
    return {label:firstLine,type:firstLine,purpose:'분석 · 판단 · 처리 · 기록',
      work:work, compose:composeArr, gates:gates};   /* ontology/lineage 는 라이브 LLM 만 */
  }

  /* 결정론 분해를 즉시 렌더(빈 화면·로딩 지연 ✕) → 라이브 LLM 가용 시 조용히 갱신.
     온톨로지/Lineage 탭은 라이브 결과가 오면 추가로 나타남(조건부 탭). */
  function analyze(text, el){
    if(typeof el==='string')el=document.getElementById(el);
    if(!el||!window.AAP_VIZ)return Promise.resolve(null);
    window.AAP_VIZ.mount(el, detViz(text));                 /* 즉시 결정론 */
    if(window.AAP_LLM_BREAKDOWN&&window.AAP_LLM_BREAKDOWN.run){
      window.AAP_LLM_BREAKDOWN.run(text)
        .then(function(d){ window.AAP_VIZ.mount(el, d); })  /* 라이브로 업그레이드(온톨로지·Lineage 포함) */
        .catch(function(){});                               /* 프록시 없음 = 결정론 유지 */
    }
    return Promise.resolve();
  }

  window.AAP_VIZ_BRIDGE={ detViz:detViz, analyze:analyze };
})();
