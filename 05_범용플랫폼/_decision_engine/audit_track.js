/* =========================================================================
   AAP 결정 런타임 트랙 — 정합성·드리프트 결정론 감사 v0.1
   ─────────────────────────────────────────────────────────────────────────
   "결정 사다리" 적용: LLM 판정 전에 스크립트로 잡을 수 있는 건 다 잡는다.
   순환성 0(생성 LLM과 무관한 독립 검사), 재현성(같은 산출물=같은 리포트).
   검사: A 팩 evaluate smoke · B 드롭인 smoke · C 드롭인 app-load smoke ·
        D slot drift · E 문서↔산출물 참조/개수 정합 · F 과표현·정직성 문구 스캔.
   실행: node audit_track.js  (→ 콘솔 + audit_report.json)   ※app/ 무관
   exit code: blocking>0 → 1 (CI/cron 게이트용)
   ========================================================================= */
const fs = require('fs'), path = require('path');
const HERE = __dirname;
const ROOT = path.join(HERE, '..');                 // 05_범용플랫폼
const { evaluate } = require(path.join(HERE, 'evaluate.js'));
const V2 = path.join(ROOT, '_harness_out', 'packs_baked_v2');
const DROPIN = path.join(HERE, 'dropin');

const coerce = (v) => { if (typeof v !== 'string') return v; if (v === 'true') return true; if (v === 'false') return false; if (v === 'null' || v === '') return null; if (v === '[]') return []; if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v); if (v.includes('·')) return v.split('·').map(s => s.trim()); return v; };
const oOf = (r) => /자동승인/.test(r || '') ? 'AUTO_APPROVE' : /반려/.test(r || '') ? 'REJECT' : 'LEGAL_REVIEW';
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const findRefs = (node, acc) => { if (node == null) return acc; if (typeof node === 'string') { if (node[0] === '$') acc.add(node.slice(1)); return acc; } if (Array.isArray(node)) { node.forEach(n => findRefs(n, acc)); return acc; } if (typeof node === 'object') { for (const k in node) findRefs(node[k], acc); } return acc; };

const findings = [];   // {check, level:'pass'|'minor'|'blocking', msg}
const add = (check, level, msg) => findings.push({ check, level, msg });
const smoke = (pack) => { let ok = 0; const seeds = pack.seeds || []; seeds.forEach(s => { const c = {}; (s.input || []).forEach(x => c[x.slot] = coerce(x.value)); const exp = s.expectedOutcome || oOf(s.expectedRoute); try { if (evaluate(c, pack.knowledge).outcome === exp) ok++; } catch (e) {} }); return { ok, total: seeds.length }; };

/* ── A. baked v2 evaluate smoke ───────────────────────────────────── */
const v2files = fs.existsSync(V2) ? fs.readdirSync(V2).filter(f => /\.v2\.json$/.test(f)) : [];
v2files.forEach(f => { const p = read(path.join(V2, f)); const { ok, total } = smoke(p);
  add('A.smoke', ok === total && total > 0 ? 'pass' : 'blocking', `${f}: evaluate ${ok}/${total}`); });

/* ── B. 드롭인 결정팩 smoke ───────────────────────────────────────── */
const dropinPacks = fs.existsSync(DROPIN) ? fs.readdirSync(DROPIN).filter(f => /\.decision\.json$/.test(f)) : [];
dropinPacks.forEach(f => { const p = read(path.join(DROPIN, f)); const { ok, total } = smoke(p);
  add('B.dropin-smoke', ok === total && total > 0 ? 'pass' : 'blocking', `${f}: evaluate ${ok}/${total}`); });

/* ── C. 드롭인 app-load smoke (앱이 쓰는 방식 모사: caseData→verdict shape) ── */
if (dropinPacks.length) { const p = read(path.join(DROPIN, dropinPacks[0])); const seed = (p.seeds || [])[0];
  if (seed) { const c = {}; seed.input.forEach(x => c[x.slot] = coerce(x.value)); let v; try { v = evaluate(c, p.knowledge); } catch (e) { v = null; }
    const shapeOk = v && v.outcome && 'basis' in v && 'inputs' in v && v.reproducible === true;
    add('C.app-load', shapeOk ? 'pass' : 'blocking', shapeOk
      ? `${dropinPacks[0]} 드롭인 로드 모사 OK → {outcome:${v.outcome}, basis, inputs} (INTEGRATION.md 계약 shape 일치)`
      : `${dropinPacks[0]} verdict shape 불일치 — 앱 통합 계약 위반`); } }

/* ── D. slot drift (route $ref ⊆ caseModel) ───────────────────────── */
v2files.forEach(f => { const p = read(path.join(V2, f)); const keys = (p.caseModel.slots || []).map(s => s.key);
  const refs = new Set(); (p.knowledge.route.rules || []).forEach(r => findRefs(r.when, refs));
  const drift = [...refs].filter(k => keys.indexOf(k) < 0);
  add('D.drift', drift.length === 0 ? 'pass' : 'blocking', `${f}: drift ${drift.length}${drift.length ? ' ['+drift.join(',')+']' : ''}`); });

/* ── E. 문서↔산출물 참조/개수 정합 ────────────────────────────────── */
const idxPath = path.join(ROOT, '_AAP_결정런타임_진행내역_index.md');
const idx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, 'utf8') : '';
const domainCount = v2files.length;
const claims6 = (idx.match(/6\s*도메인/g) || []).length;
add('E.count', domainCount === 6 ? 'pass' : 'minor', `packs_baked_v2 도메인 ${domainCount}개 (인덱스 '6도메인' 언급 ${claims6}회)`);
['evaluate.js'].forEach(f => add('E.ref', fs.existsSync(path.join(HERE, f)) ? 'pass' : 'blocking', `엔진 ${f} 존재`));
// 드롭인 INTEGRATION.md가 언급한 결정팩이 실제 존재하나
const integ = fs.existsSync(path.join(DROPIN, 'INTEGRATION.md')) ? fs.readFileSync(path.join(DROPIN, 'INTEGRATION.md'), 'utf8') : '';
const mentioned = (integ.match(/pack_[a-z_]+\.decision\.json/g) || []);
const missing = [...new Set(mentioned)].filter(m => !fs.existsSync(path.join(DROPIN, m)));
add('E.dropin-ref', missing.length === 0 ? 'pass' : 'blocking', `INTEGRATION.md 언급 결정팩 누락 ${missing.length}${missing.length ? ' ['+missing.join(',')+']' : ''}`);

/* ── F. 과표현·정직성 문구 스캔 (claim 스코핑) ────────────────────── */
const docs = fs.readdirSync(ROOT).filter(f => /\.md$/.test(f));
const scanLines = [];   // {file, line, text}
docs.forEach(f => fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((t, i) => scanLines.push({ file: f, line: i + 1, text: t })));
const scanAll = scanLines.map(l => l.text).join('\n');
// 정정·부정 문맥(과표현을 '고치는' 줄)은 위반이 아니므로 제외
const CORRECTION = /과표현|아니라|정정|스코핑|✕|권장|=\s*과/;
const OVERCLAIM = [
  { re: /토큰\s*단위(로?\s*공유|\s*동일)/, why: '"토큰 단위 공유"=과표현 → "아키타입·3분기·엔진 공유, 단계 수 가변"으로 스코핑 권장' },
];
OVERCLAIM.forEach(o => { const hits = scanLines.filter(l => o.re.test(l.text) && !CORRECTION.test(l.text));
  if (hits.length) add('F.overclaim', 'minor', `과표현 ${hits.length}건(${hits.map(h => h.file + ':' + h.line).join(', ')}): ${o.why}`); });
// 정직성 가드: 게이트 통과를 말하는 문서에 '자기일관성/정확성 아님' 캐비엇이 있는가
const hasGatePass = /게이트\s*(전수\s*)?(통과|PASS)/.test(scanAll);
const hasCircCaveat = /자기일관성|정확성(을)?\s*(증명|보장)\s*(아님|하지)|순환성/.test(scanAll);
add('F.caveat-circ', !hasGatePass || hasCircCaveat ? 'pass' : 'minor', hasCircCaveat ? '순환성 캐비엇 존재' : '게이트통과 주장 있으나 "자기일관성≠정확성" 캐비엇 미발견 → 진단 문서로 보강 권장');
// SME 가드: 금융/공공 도메인 수치에 'SME 미검·가정값' 라벨이 있는가
const hasFinance = fs.existsSync(path.join(V2, 'pack_credit.v2.json'));
const hasSmeLabel = /SME\s*(미검|미검증|확인\s*필요)|가정값/.test(scanAll);
add('F.caveat-sme', !hasFinance || hasSmeLabel ? 'pass' : 'minor', hasSmeLabel ? 'SME/가정값 라벨 존재' : '여신·보조금 수치 SME 미검 라벨 미발견 → 시연 전 보강 권장');

/* ── 리포트 ───────────────────────────────────────────────────────── */
const blocking = findings.filter(f => f.level === 'blocking');
const minor = findings.filter(f => f.level === 'minor');
const report = { ts: process.env.AUDIT_TS || null, blocking: blocking.length, minor: minor.length, pass: findings.filter(f => f.level === 'pass').length, findings };
fs.writeFileSync(path.join(HERE, 'audit_report.json'), JSON.stringify(report, null, 2), 'utf8');

const ic = { pass: '✅', minor: '🟡', blocking: '🔴' };
console.log('AAP 트랙 결정론 감사 — audit_track.js v0.1');
console.log(`결과: 🔴 blocking ${blocking.length} · 🟡 minor ${minor.length} · ✅ pass ${report.pass}\n`);
findings.filter(f => f.level !== 'pass').forEach(f => console.log(`${ic[f.level]} [${f.check}] ${f.msg}`));
console.log('\n— pass —');
findings.filter(f => f.level === 'pass').forEach(f => console.log(`✅ [${f.check}] ${f.msg}`));
process.exit(blocking.length ? 1 : 0);
