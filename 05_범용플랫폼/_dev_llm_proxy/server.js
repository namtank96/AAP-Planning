/* =========================================================================
   AAP 분해 프록시 — localhost dev 서버 (Phase 2 라이브 LLM)
   ─────────────────────────────────────────────────────────────────────────
   요청 텍스트 → Claude(Sonnet 4.6) 구조화 출력 → 표준 분해 JSON.
   · API 키는 이 서버(환경변수)에만 — 브라우저엔 0.
   · output_config.format(json_schema)로 Pack/viz 스키마 강제 → 환각·파싱 위험 ↓.
   · 시스템 프롬프트(8계층 캐논·5타입·온톨로지·Lineage 규칙)=프롬프트 캐싱.
   실행: ANTHROPIC_API_KEY=... node server.js   (기본 포트 8787)
   ========================================================================= */
import http from 'node:http';
import Anthropic from '@anthropic-ai/sdk';

const PORT = process.env.PORT || 8787;
const KEY = process.env.ANTHROPIC_API_KEY;
const DEFAULT_MODEL = process.env.AAP_MODEL || 'claude-sonnet-4-6';   // 저가 런타임 (haiku 도 허용)
const MODEL_ALLOW = new Set(['claude-sonnet-4-6', 'claude-haiku-4-5']);

if (!KEY) { console.error('✗ ANTHROPIC_API_KEY 환경변수가 없습니다. (.env.example 참고)'); process.exit(1); }
const client = new Anthropic({ apiKey: KEY });

/* ── 출력 스키마 (output_config.format) — viz_decomp / Pack 정합 ── */
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['label','type','purpose','work','compose','gates','ontology','lineage'],
  properties: {
    label: { type:'string' }, type: { type:'string' }, purpose: { type:'string' },
    work: { type:'array', items: { type:'object', additionalProperties:false,
      required:['id','nm','can','actor','gate','actions','data','dec','risk','why','ops'],
      properties: {
        id:{type:'string'}, nm:{type:'string'}, can:{type:'string'},
        actor:{type:'string', enum:['human','aap','hitl']},
        gate:{type:'integer', enum:[0,1]},
        actions:{type:'array', items:{type:'string'}},
        data:{type:'array', items:{type:'string'}},
        dec:{type:'array', items:{type:'string'}},
        risk:{type:'array', items:{type:'string'}},
        why:{type:'string'},
        ops:{ type:'array', items:{ type:'object', additionalProperties:false,
          required:['ty','L','nm','desc','reads','out','why'],
          properties:{ ty:{type:'string', enum:['A','M','S','C','P']}, L:{type:'string'},
            nm:{type:'string'}, desc:{type:'string'}, reads:{type:'string'}, out:{type:'string'}, why:{type:'string'} } } }
      } } },
    compose: { type:'array', items:{ type:'object', additionalProperties:false, required:['ty','n','items'],
      properties:{ ty:{type:'string', enum:['A','M','S','C','P']}, n:{type:'integer'}, items:{type:'array', items:{type:'string'}} } } },
    gates: { type:'array', items:{ type:'object', additionalProperties:false, required:['stepId','reason'],
      properties:{ stepId:{type:'string'}, reason:{type:'string'} } } },
    ontology: { type:'object', additionalProperties:false, required:['objects','links','touch'],
      properties:{
        objects:{ type:'array', items:{ type:'object', additionalProperties:false, required:['k','name','kind','props'],
          properties:{ k:{type:'string'}, name:{type:'string'}, kind:{type:'string', enum:['entity','event','document','master']}, props:{type:'array', items:{type:'string'}} } } },
        links:{ type:'array', items:{ type:'object', additionalProperties:false, required:['from','rel','to'],
          properties:{ from:{type:'string'}, rel:{type:'string'}, to:{type:'string'} } } },
        touch:{ type:'array', items:{ type:'object', additionalProperties:false, required:['stepId','objects'],
          properties:{ stepId:{type:'string'}, objects:{type:'array', items:{type:'string'}} } } }
      } },
    lineage: { type:'object', additionalProperties:false, required:['output','chain'],
      properties:{
        output:{ type:'object', additionalProperties:false, required:['name'], properties:{ name:{type:'string'} } },
        chain:{ type:'array', items:{ type:'object', additionalProperties:false, required:['role','label','note','det'],
          properties:{ role:{type:'string', enum:['source','transform','judgment','gate','output']}, label:{type:'string'}, note:{type:'string'}, det:{type:'boolean'} } } }
      } }
  }
};

/* ── 시스템 프롬프트 (8계층 캐논·5타입·온톨로지·Lineage 규칙) ── */
const SYSTEM = `당신은 AAP(Agentic AI Platform)의 업무 분해 엔진입니다. 한국어 업무 설명을 받아, 운영 가능한 워크플로우로 분해해 지정된 JSON 스키마로만 응답합니다.

[원칙]
- AAP는 Agent를 많이 띄우는 시스템이 아닙니다. 업무를 이해→실행 구조로 분해하고, 각 작업에 5타입(Agent·Module·기존 솔루션·Connector·Policy)을 골라 "조합"합니다.
- 분해는 입력에 따라 달라야 합니다(고정 골격 금지). 단계 수·구성·게이트 위치는 업무 성격에 맞게.

[work 단계] — 캐논 8단계를 참고하되 업무에 맞게 가변:
  request(요청 접수·actor:human) → understand(업무 이해·aap) → compose(실행 구조 구성·aap)
  → approve(계획/판단 승인·actor:hitl·gate:1) → prepare(처리 실행·aap)
  → commit(최종/발송 승인·actor:hitl·gate:1) → share(반영·기록·학습·aap)
  · can = 단계 캡션(입력/의미화/구성/HITL ①/실행/HITL ②/학습 등)
  · actor: human(사람 입력) | aap(자율 실행) | hitl(사람 통제점, gate:1)
  · 각 aap 단계의 ops = 그 단계가 실제 쓰는 구성요소들. human/hitl 단계는 ops:[] (빈 배열).
  · why = "왜 이 단계가 필요한가" 한 줄.

[ops 5타입] — ty:
  A=Agent(의미 해석·추론·생성, LLM 적합) / M=Module(결정론 검증·평가·계산) /
  S=기존 솔루션(ERP·MES·QMS 등 Buy·Integrate) / C=Connector(시스템 연동·수집) / P=Policy(통제·규정·차단)
  · L = 8계층(L1 경험 / L2 설계 / L3 코어·실행 / L4 지식·시맨틱 / L5 데이터·연동 / L6 품질·평가 / L7 거버넌스 / L8 인프라)
  · 결정론으로 충분한 일은 M/S/C/P, 의미 해석·추론만 A. "전부 Agent" 금지.
  · why = "왜 이 타입인가" 한 줄(예: "조회·연동은 결정론 Connector — LLM ✕").

[gates] — 책임이 걸리거나 되돌리기 어려운 지점(외부 발송·시스템 반영·고액·안전)에만. stepId=해당 work id, reason=한 줄. 게이트 0개 금지(자율 운영엔 사람 통제점이 전제).

[compose] — 5타입별 합계: {ty,n(개수),items[대표 이름 몇 개]}. work의 ops와 정합.

[ontology] — 이 업무가 딛는 도메인 객체:
  objects:[{k(영문키),name(한글),kind(entity|event|document|master),props[속성 3~5]}]
  links:[{from(k),rel(관계 한글),to(k)}]
  touch:[{stepId(work id),objects[k들]}]  — 각 aap 단계가 만지는 객체

[lineage] — 핵심 산출물 1개의 역추적:
  output:{name} / chain:[{role,label,note,det}]  (소스→산출물 순서)
  role: source(원천 데이터) | transform(결정론 변환) | judgment(LLM 판단) | gate(사람 통제점) | output(산출물)
  det: 결정론이면 true, LLM 판단이면 false. (게이트/소스/산출물은 적절히)

모든 값은 한국어. 추측 데이터는 도메인에 그럴듯한 더미로(허위 수치 남발 금지). JSON 스키마 외 텍스트 출력 금지.`;

/* ── Claude 호출 ── */
async function breakdown(text, model) {
  const useModel = MODEL_ALLOW.has(model) ? model : DEFAULT_MODEL;
  const msg = await client.messages.create({
    model: useModel,
    max_tokens: 8000,
    system: [{ type:'text', text: SYSTEM, cache_control:{ type:'ephemeral' } }],
    output_config: { format: { type:'json_schema', schema: SCHEMA } },
    messages: [{ role:'user', content: `다음 업무 설명을 분해하세요:\n\n${text}` }],
  });
  const block = (msg.content || []).find(b => b.type === 'text');
  if (!block) throw new Error('빈 응답');
  const data = JSON.parse(block.text);
  // touch 배열 → {stepId:[objects]} 객체로(viz_decomp 소비 형태)
  if (data.ontology && Array.isArray(data.ontology.touch)) {
    const t = {}; data.ontology.touch.forEach(x => { t[x.stepId] = x.objects; }); data.ontology.touch = t;
  }
  // links 는 [{from,rel,to}] 그대로 — viz_decomp normLinks 가 처리
  data._model = useModel;
  data._usage = msg.usage;
  return data;
}

/* ── HTTP ── */
function cors(res){ res.setHeader('Access-Control-Allow-Origin','*'); res.setHeader('Access-Control-Allow-Headers','content-type'); res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS'); }
function json(res, code, obj){ cors(res); res.writeHead(code, {'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify(obj)); }

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok:true, model:DEFAULT_MODEL });
  if (req.method === 'POST' && req.url === '/breakdown') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', async () => {
      try {
        const { text, model } = JSON.parse(body || '{}');
        if (!text || !String(text).trim()) return json(res, 400, { error: 'text 필요' });
        const t0 = Date.now();
        const data = await breakdown(String(text), model);
        console.log(`✓ 분해 [${data._model}] ${Date.now()-t0}ms · ${data.work?.length||0}단계 · in/out ${data._usage?.input_tokens}/${data._usage?.output_tokens}`);
        json(res, 200, data);
      } catch (e) {
        console.error('✗', e.message);
        json(res, 500, { error: e.message });
      }
    });
    return;
  }
  json(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`AAP 분해 프록시 · http://localhost:${PORT}  (model: ${DEFAULT_MODEL})`);
  console.log(`  POST /breakdown {text}  ·  GET /health`);
});
