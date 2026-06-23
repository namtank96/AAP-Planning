# 스튜디오 4영역 고도화 검토 (벤치마크 중심) v0.1 (260623)

> **성격**: '새 업무 요청(On-Ramp)·도메인팩·워크플로우·자산' 4영역의 고도화 포인트를 벤치마크(Palantir AIP·SK AX·메가존·LG CNS) 기준으로 도출한 **검토 노트**. 구현 계약(05 Pack Contract)·app/ 코드는 **다른 세션 소유** → 본 노트는 검토·제안·UX/디자인·적용 준비. (`reference_agentic_platform_benchmark.md` 근거)
> 적용 준비(index.html 반영) = `aap_onramp_apply_prep_v0_1.md`(동반).

---

## 1. 새 업무 요청 (On-Ramp)
**현재**: 텍스트 설명 → `matchPackByText`(토큰 겹침·임계 0.14) → 매칭=실행 / 미매칭=격상. `io.inputs/connectors` 빈 슬롯.

| 고도화 | 벤치마크 | 갭 |
|---|---|---|
| **① 입력 다양화**(파일·필드·커넥터, `io.inputs{text\|file\|field}`) | Palantir Workshop inputs · Pack v2 §3.2 | 텍스트만 |
| **② 명확화 질문**(모호 시 AAP 되묻기→정확 분해) | Palantir Chatbot Studio "Request Clarification" | 없음 |
| **③ 유형 인식 governed**(신뢰도%·top-N 후보·근거) | Palantir governed reasoning(온톨로지) | 단일·근거 없음 |
| **④ Work Event 메타**(출처/요청자/시각→감사) | 운영객체·Datadog | 없음 |
| **⑤ 드래프트 스테이징**(검토 후 실행) | Palantir Proposals | 격상=바로 등록(draft와 부분 정합) |
| **⑥ 커넥터 자동 유입**(잡코리아·ATS·메일 폴링 stub) | Palantir Command/Connector·SK AX MCP | `io.connectors` 빈칸 |
**임팩트 톱**: ①+② (요청을 *이해*함을 증명·단일 챗 차별), ③ (governed=블랙박스 ✕).

## 2. 도메인 팩
**현재**: 카탈로그 카드 + 개요/온톨로지/아키텍처 탭 + 배포 생애주기(draft/deployed) + 온톨로지 그래프(recruiting).

| 고도화 | 벤치마크 | 갭 |
|---|---|---|
| **① 온톨로지 1급화**(팩=객체모델+워크플로우+화면 패키지, 온톨로지 먼저) | Palantir 온톨로지 "디지털 트윈" 백본 | ontology=recruiting만, 타 팩 폴백 |
| **② 팩 버전·배포 이력·롤백** | Palantir **Apollo**(자율 배포) | draft/deployed만, 버전·이력 없음 |
| **③ 데이터 소스 연결 명시**(팩↔커넥터/데이터셋) | Palantir **Foundry** datasets | io.connectors 미연결 |
| **④ 팩 템플릿·복제**(새 도메인 빠르게) | — (생산성) | 신규=격상/자동저작만 |
| **⑤ 자산 사용 가시화**(이 팩이 쓰는 자산) | Copilot Studio 카탈로그 | usedBy 역링크 있음(확장 여지) |

## 3. 워크플로우
**현재**: 3패널 빌더(팔레트·캔버스·Run) + blockKind(det/llm) + dry-run + 경량 편집.

| 고도화 | 벤치마크 | 갭 |
|---|---|---|
| **① 블록 타입 완성**(Conditional·Loop·Variable 실동작, Use LLM/Action/Function) | Palantir **AIP Logic blocks** | 5타입+control 슬롯, 제어 실동작 미흡 |
| **② 디버거 강화**(블록별 입출력·체인 시각화·step 펼침·"View reasoning") | Palantir AIP Logic **Debugger** | dry-run 요약만 |
| **③ 분기(next) 실동작**(조건 분기 캔버스) | AIP Logic Conditionals | Pack v2 next 슬롯 예약 |
| **④ 버전·테스트·Eval 연결** | AIP Logic Run/**Evals** | 버전·테스트케이스 없음 |
| **⑤ 워크플로우 재사용 템플릿화**(팩 내부→1급) | — | 팩 종속 |

## 4. 자산
**현재**: 전 팩 union 카탈로그 + 5타입 + 스코프 필터 + usedBy + (도메인팩) 배포.

| 고도화 | 벤치마크 | 갭 |
|---|---|---|
| **① 자산 상세·편집**(Agent 프롬프트/툴·Module 규칙·Connector 엔드포인트·Policy 규칙) | Palantir Chatbot Studio 툴 설정·Copilot Studio | 읽기 카탈로그만 |
| **② 자산 배포 생애주기**(draft→active) | Palantir Apollo | 도메인팩만 배포, 자산 미적용 |
| **③ 자산 마켓·재사용 라이브러리**(표준 툴/레시피 검색·추가) | **SK AX MCP 재사용 툴·레시피**·Copilot 카탈로그 | union 표시만, 추가 흐름 없음 |
| **④ 타입별 스키마 정의**(5타입 각 필드) | Palantir 도구 타입 6종 | type/ty만, 상세 스키마 약함 |
| **⑤ MCP/외부 툴 연결**(Connector를 MCP로) | Palantir custom tools·SK AX/LG CNS MCP | stub |

## 우선순위 (전 영역 공통)
1. **On-Ramp ①②③** = 가장 가시적·차별적(요청 이해). → index.html 적용 준비 우선(동반 문서).
2. **자산 ① 편집 + 도메인팩 ① 온톨로지 1급화** = 표준화 요청(유저)와 직결.
3. **워크플로우 ①②** = Palantir 핵심 차별(블록·디버거).
4. 배포 생애주기 전 층(②) · MCP/커넥터(⑥/③/⑤) = Phase 3급(실연동).

## 경계 (충돌 회피)
- Pack 계약(`io`·flow·ontology 스키마)·core 로직 = **다른 세션(05 스펙·app/)**. 본 노트·적용 준비는 **UX·디자인·markup·적용 가이드**까지. 계약 본체 편집 ✕.
