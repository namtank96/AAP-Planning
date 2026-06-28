/* =========================================================================
   AAP_LLM_BREAKDOWN — 라이브 LLM 분해 클라이언트 어댑터 (Phase 2)
   ─────────────────────────────────────────────────────────────────────────
   요청 텍스트 → localhost 프록시(_dev_llm_proxy) POST → 표준 분해 JSON.
   · 프록시 미가동/오류 = throw → 호출부가 결정론 폴백(proposeBreakdown) 사용.
   · 반환 shape = viz_decomp(AAP_VIZ) 가 소비하는 표준 BREAKDOWN.
   · 키·모델 호출은 전부 프록시(서버)에 격리 — 브라우저엔 키 0.
   · file:// 단독에선 프록시 접근 불가 → 항상 폴백(데모 안정성 유지).

   설정: window.AAP_LLM_ENDPOINT 로 프록시 주소 override (기본 localhost:8787).
   사용:
     const live = await AAP_LLM_BREAKDOWN.available();      // 프록시 가동 여부
     const data = await AAP_LLM_BREAKDOWN.run(text);        // 실패 시 throw
     const data = await AAP_LLM_BREAKDOWN.runOr(text, ()=>deterministic(text)); // 폴백 동반
   ========================================================================= */
(function(){
  "use strict";
  var BASE=(window.AAP_LLM_ENDPOINT||'http://localhost:8787').replace(/\/+$/,'');

  /* LLM 출력 → 렌더 shape 정규화(누락 방어·enum 강제) */
  function normalize(d){
    d=d||{};
    var TY={A:1,M:1,S:1,C:1,P:1}, ACT={human:1,aap:1,hitl:1}, ROLE={source:1,transform:1,judgment:1,gate:1,output:1}, KND={entity:1,event:1,document:1,master:1};
    d.work=(d.work||[]).map(function(w,i){
      w.id=w.id||('step'+i); w.actor=ACT[w.actor]?w.actor:'aap';
      w.actions=w.actions||[]; w.data=w.data||[]; w.dec=w.dec||[]; w.risk=w.risk||[];
      w.gate=w.gate?1:0;
      w.ops=(w.ops||[]).map(function(op){ op.ty=TY[op.ty]?op.ty:'A'; return op; });
      return w;
    });
    d.compose=d.compose||[];
    d.gates=d.gates||[];
    if(d.ontology){ d.ontology.objects=(d.ontology.objects||[]).map(function(o){o.kind=KND[o.kind]?o.kind:'entity';o.props=o.props||[];return o;});
      d.ontology.links=d.ontology.links||[]; d.ontology.touch=d.ontology.touch||{}; }
    if(d.lineage){ d.lineage.output=d.lineage.output||{name:''};
      d.lineage.chain=(d.lineage.chain||[]).map(function(h){h.role=ROLE[h.role]?h.role:'transform';return h;}); }
    return d;
  }

  function run(text, opts){
    opts=opts||{};
    return fetch(BASE+'/breakdown',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({text:String(text||''),model:opts.model})})
      .then(function(r){ if(!r.ok)throw new Error('proxy '+r.status); return r.json(); })
      .then(function(j){ if(j&&j.error)throw new Error(j.error); return normalize(j); });
  }
  function available(){
    return fetch(BASE+'/health',{method:'GET'}).then(function(r){return r.ok;}).catch(function(){return false;});
  }
  /* 라이브 우선 · 실패 시 결정론 폴백(fn 은 동기/비동기 모두 허용) */
  function runOr(text, fallbackFn, opts){
    return run(text,opts).catch(function(e){
      if(window.console)console.warn('[AAP_LLM] live 분해 실패 → 결정론 폴백:',e&&e.message);
      return Promise.resolve(fallbackFn());
    });
  }

  window.AAP_LLM_BREAKDOWN={ run:run, runOr:runOr, available:available, normalize:normalize, endpoint:BASE };
})();
