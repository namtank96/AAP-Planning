/* =========================================================================
   AAP Platform · 시연 모드 (Guide Mode) — 코어 · 도메인 무관 가이드 투어 엔진
   ─────────────────────────────────────────────────────────────────────────
   하나의 플랫폼, 두 모드(로드맵 §5): 운영 모드(기본)는 그대로 두고,
   '시연' 네비 진입 → 시나리오 선택 → **운영 콘솔 화면 위에** dim 스포트라이트
   + 말풍선 + 커서를 얹어 "AAP가 프로세스를 분해→구성→게이트→실행하는 흐름"을
   한 호흡으로 보여준다. 데모/실제가 같은 화면을 공유(실작동 진화해도 그대로).

   ★ 검증된 패턴(손해사정 v0.53+) 차용 + 교훈:
     스포트라이트는 fixed 1회 배치 ✕ → scroll/resize 마다 target rect 재계산
     (layoutGuide)해야 드리프트 안 생김. 화면 전환 후엔 rAF/폴링으로 위치 잡기.

   도메인 무관: 시나리오 스텝은 **데이터**(각 팩의 demoScenario). 코어는 그 데이터를
   해석해 운영 화면(인박스/케이스/실행/게이트/관리)을 실제 조작하며 내레이션한다.
   채용 전용 분기 0줄 — do.{view|open|go} 와 target 셀렉터만 일반 규칙으로 처리.
   ========================================================================= */
(function(){
  const ICO=(n)=>window.AAP_ICON?window.AAP_ICON.svg(n):'';
  /* 등록된 팩에서 demoScenario 를 가진 것만 시나리오 레지스트리로 수집(데이터 기반) */
  function scenarios(){
    const P=window.AAP_PACKS||{};
    return Object.keys(P).map(k=>P[k]&&P[k].demoScenario?Object.assign({packId:k,label:P[k].label},P[k].demoScenario):null).filter(Boolean);
  }

  /* HITL(사람 승인) 스텝 판정 — 시나리오 데이터에 step.hitl 우선, 없으면 제목의 'HITL' 표기 */
  function isHitlStep(st){ return !!(st&&(st.hitl||/HITL/i.test(st.title||''))); }
  function hitlCount(steps){ return (steps||[]).filter(isHitlStep).length; }

  /* ===== 시연 뷰(시나리오 선택 화면) — '시연' 네비 클릭 시 코어가 호출 ===== */
  function renderDemoView(){
    const list=document.getElementById('demoList'); if(!list)return;
    const scs=scenarios();
    if(!scs.length){ list.innerHTML='<div class="ibx-empty">등록된 시연 시나리오가 없습니다 — 업무 유형(팩)에 <b>demoScenario</b> 데이터를 추가하면 자동 편입됩니다.</div>'; return; }
    list.innerHTML=scs.map(s=>{
      const n=(s.steps||[]).length, h=hitlCount(s.steps);
      return `
      <div class="demo-card">
        <div class="demo-card-h"><span class="demo-ic">${ICO(s.icon||'play-circle')}</span>
          <div><div class="demo-t">${s.title||s.label}</div><div class="demo-ty">${s.label} 업무 시연</div></div></div>
        <div class="demo-desc">${s.desc||''}</div>
        <div class="demo-flow">
          <span class="demo-chip">${ICO('layers')}${n}단계 흐름</span>
          ${h?`<span class="demo-chip hitl">${ICO('user-check')}사람 승인 ${h}회</span>`:''}
        </div>
        <button class="demo-start" data-demo="${s.packId}">${ICO('play-circle')}<span class="btn-l">시연 시작</span></button>
      </div>`;}).join('');
    list.querySelectorAll('[data-demo]').forEach(e=>e.onclick=()=>startTour(e.dataset.demo));
  }

  /* ===== 투어 상태 ===== */
  const T={ active:false, sc:null, i:0, els:null };

  /* 오버레이 DOM(1회 생성, body 직속 — 뷰 재렌더에 영향 안 받게) */
  function buildOverlay(){
    if(T.els)return T.els;
    const ov=document.createElement('div'); ov.id='guideOverlay'; ov.className='guide-ov';
    ov.innerHTML=`
      <div class="guide-spot" id="guideSpot"></div>
      <div class="guide-cursor" id="guideCursor">${ICO('mouse-pointer')}</div>
      <div class="guide-bubble" id="guideBubble">
        <div class="gb-tail" id="gbTail" aria-hidden="true"></div>
        <div class="gb-head">
          <span class="gb-step" id="gbStep"></span>
          <span class="gb-tag" id="gbTag"></span>
        </div>
        <div class="gb-dots" id="gbDots"></div>
        <div class="gb-title" id="gbTitle"></div>
        <div class="gb-body" id="gbBody"></div>
        <div class="gb-foot">
          <button class="gb-btn ghost" id="gbPrev">${ICO('chevron-left')}<span class="btn-l">이전</span></button>
          <button class="gb-btn ghost" id="gbStop">${ICO('x')}<span class="btn-l">중지</span></button>
          <button class="gb-btn primary" id="gbNext"><span class="btn-l">다음</span>${ICO('chevron-right')}</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const els={ ov, spot:ov.querySelector('#guideSpot'), cursor:ov.querySelector('#guideCursor'),
      bubble:ov.querySelector('#guideBubble'), step:ov.querySelector('#gbStep'),
      tag:ov.querySelector('#gbTag'), dots:ov.querySelector('#gbDots'), tail:ov.querySelector('#gbTail'),
      title:ov.querySelector('#gbTitle'), body:ov.querySelector('#gbBody'),
      prev:ov.querySelector('#gbPrev'), next:ov.querySelector('#gbNext'), stop:ov.querySelector('#gbStop') };
    els.prev.onclick=()=>gotoStep(T.i-1);
    els.next.onclick=()=>{ if(T.i>=T.sc.steps.length-1)stopTour(); else gotoStep(T.i+1); };
    els.stop.onclick=stopTour;
    T.els=els; return els;
  }

  /* ===== 운영 화면 조작 (do) — 코어 공개 API 재사용(채용 전용 분기 ✕) =====
     view: 네비 항목 클릭(setView) / open: 이 팩 첫 케이스 열기 / go: work step 이동 */
  function applyDo(d){
    if(!d)return;
    if(d.view){ const b=document.querySelector('#gnav [data-view="'+d.view+'"]'); if(b)b.click(); }
    if(d.open){ const C=window.AAP_CORE; if(C&&C.load)C.load(T.sc.packId); }
    if(d.go){ const C=window.AAP_CORE; if(C&&C.go)C.go(d.go); }
  }

  /* target 요소가 나타날 때까지 폴링(rAF) — HITL 모달은 실행 애니(최대 ~2.2s) 후
     표시되므로 넉넉히 대기(~4s). 한 스텝 내 재진입 가드(seq)로 늦은 콜백 무시. */
  function waitFor(sel,cb,tries){
    tries=tries==null?240:tries; /* 최대 ~4초(240 frame) */
    const myStep=T.i;
    const tick=(left)=>{
      if(!T.active||T.i!==myStep)return; /* 스텝이 바뀌면 이 대기는 폐기 */
      const el=pick(sel);
      if(el&&isVisible(el)){ cb(el); return; }
      if(left<=0){ cb(el||null); return; }
      requestAnimationFrame(()=>tick(left-1));
    };
    tick(tries);
  }
  /* 콤마 구분 셀렉터 중 첫 가시 요소 */
  function pick(sel){
    if(!sel)return null;
    const parts=sel.split(',').map(s=>s.trim()).filter(Boolean);
    for(const p of parts){ const el=document.querySelector(p); if(el&&isVisible(el))return el; }
    /* 가시 요소 없으면 첫 존재 요소라도 */
    for(const p of parts){ const el=document.querySelector(p); if(el)return el; }
    return null;
  }
  function isVisible(el){ const r=el.getBoundingClientRect(); return r.width>0&&r.height>0&&r.bottom>0&&r.top<window.innerHeight; }

  /* ===== 스텝 이동 ===== */
  function gotoStep(i){
    if(!T.active)return;
    const steps=T.sc.steps; i=Math.max(0,Math.min(steps.length-1,i)); T.i=i;
    const st=steps[i], els=T.els;
    /* 1) 운영 화면 실제 조작 */
    applyDo(st.do);
    /* 2) 말풍선 텍스트 갱신 + 버튼 상태 + HITL 악센트 */
    const hitl=isHitlStep(st);
    els.step.textContent=`STEP ${i+1} / ${steps.length}`;
    els.tag.innerHTML=hitl?`${ICO('user-check')}<span>사람이 승인</span>`:`${ICO('bot')}<span>AAP 자율 실행</span>`;
    els.dots.innerHTML=steps.map((s,k)=>`<i class="gb-dot${k===i?' on':''}${k<i?' done':''}${isHitlStep(s)?' hitl':''}"></i>`).join('');
    els.title.textContent=st.title||'';
    els.body.innerHTML=st.body||'';
    els.prev.style.visibility=i===0?'hidden':'visible';
    els.next.querySelector('.btn-l').textContent=(i>=steps.length-1)?'마침':'다음';
    els.bubble.classList.toggle('hitl',hitl);
    els.spot.classList.toggle('hitl',hitl);
    els.cursor.classList.toggle('hitl',hitl);
    /* 3) target 가 그려진 뒤 위치 잡기(전환·애니메이션 대기).
       즉시 1회 배치(현재 가시 요소 기준) → target 준비되면 재배치(드리프트 없이 부드럽게). */
    T.curSel=st.target;
    requestAnimationFrame(()=>{ if(T.active&&T.i===i)layoutGuide(); });
    waitFor(st.target,()=>layoutGuide());
  }

  /* ===== layoutGuide — ★ scroll/resize 마다 target rect 재계산(드리프트 방지) ===== */
  function layoutGuide(){
    if(!T.active||!T.els)return;
    const el=pick(T.curSel), els=T.els, pad=8;
    if(!el){ /* target 없으면 화면 중앙 안내(스포트라이트 숨김) */
      els.spot.style.opacity='0';
      placeBubbleCenter(); els.cursor.style.opacity='0'; return;
    }
    const r=el.getBoundingClientRect();
    /* 스포트라이트 = target 영역 + 패딩, box-shadow 로 바깥 dim */
    els.spot.style.opacity='1';
    els.spot.style.left=(r.left-pad)+'px';
    els.spot.style.top=(r.top-pad)+'px';
    els.spot.style.width=(r.width+pad*2)+'px';
    els.spot.style.height=(r.height+pad*2)+'px';
    /* 커서 = target 우하단 안쪽 */
    els.cursor.style.opacity='1';
    els.cursor.style.left=(r.left+Math.min(r.width*0.5,r.width-18))+'px';
    els.cursor.style.top=(r.top+Math.min(r.height*0.5,r.height-18))+'px';
    /* 말풍선 = target 옆 빈 공간(오른쪽 우선, 안되면 아래/위/왼쪽) */
    placeBubble(r);
  }
  function placeBubble(r){
    const els=T.els, b=els.bubble, bw=b.offsetWidth||320, bh=b.offsetHeight||180, gap=18, m=12;
    const vw=window.innerWidth, vh=window.innerHeight;
    let left,top,side;
    if(r.right+gap+bw<=vw-m){ left=r.right+gap; top=clamp(r.top, m, vh-bh-m); side='left'; }      /* 말풍선 오른쪽 → 꼬리 왼쪽 */
    else if(r.left-gap-bw>=m){ left=r.left-gap-bw; top=clamp(r.top, m, vh-bh-m); side='right'; }   /* 왼쪽 */
    else if(r.bottom+gap+bh<=vh-m){ top=r.bottom+gap; left=clamp(r.left, m, vw-bw-m); side='top'; } /* 아래 */
    else if(r.top-gap-bh>=m){ top=r.top-gap-bh; left=clamp(r.left, m, vw-bw-m); side='bottom'; }    /* 위 */
    else { placeBubbleCenter(); return; }
    b.style.left=left+'px'; b.style.top=top+'px'; b.classList.remove('center');
    b.classList.remove('tail-left','tail-right','tail-top','tail-bottom');
    b.classList.add('tail-'+side);
    /* 꼬리를 target 중심 쪽으로 정렬(말풍선 박스 안 좌표) */
    if(els.tail){
      if(side==='left'||side==='right'){
        const ty=clamp(r.top+r.height/2-top, 14, bh-14);
        els.tail.style.top=ty+'px'; els.tail.style.left='';
      }else{
        const tx=clamp(r.left+r.width/2-left, 16, bw-16);
        els.tail.style.left=tx+'px'; els.tail.style.top='';
      }
    }
  }
  function placeBubbleCenter(){
    const b=T.els.bubble, bw=b.offsetWidth||320, bh=b.offsetHeight||180;
    b.style.left=((window.innerWidth-bw)/2)+'px'; b.style.top=((window.innerHeight-bh)/2)+'px';
    b.classList.add('center');
    b.classList.remove('tail-left','tail-right','tail-top','tail-bottom');
  }
  function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }

  /* scroll/resize(capture) 마다 재배치 — 운영 화면 내부 스크롤 포함(capture=true) */
  function onReflow(){ if(T.active)layoutGuide(); }

  /* ===== start / stop ===== */
  function startTour(packId){
    const scs=scenarios(); const sc=scs.find(s=>s.packId===packId)||scs[0];
    if(!sc||!sc.steps||!sc.steps.length)return;
    buildOverlay();
    T.active=true; T.sc=sc; T.i=-1; T.els.ov.classList.add('show');
    document.body.classList.add('guiding');
    window.addEventListener('scroll',onReflow,true);
    window.addEventListener('resize',onReflow);
    gotoStep(0);
  }
  function stopTour(){
    T.active=false;
    window.removeEventListener('scroll',onReflow,true);
    window.removeEventListener('resize',onReflow);
    if(T.els){ T.els.ov.classList.remove('show'); }
    document.body.classList.remove('guiding');
  }

  /* 코어가 '시연' 뷰 진입/이탈 시 호출 (도메인 무관 훅) */
  window.AAP_DEMO={ renderDemoView, startTour, stopTour, isActive:()=>T.active };

  /* '시연' 네비 클릭 시 운영 setView 가 demo 뷰를 표시 → 여기서 카드 렌더.
     코어 setView 가 AAP_DEMO.renderDemoView 를 부르도록 코어가 위임(아래 보강). */
})();
