import { WODDetails, WODFormat } from '../types';

export const PRESET_WODS: WODDetails[] = [
  {
    id: 'preset-1',
    title: '골든타임 진압작전: 호스 드래그 & 해머링',
    format: 'FOR_TIME',
    timeCapMinutes: 20,
    description: '화재 현장 초기 진입 시 호스 전개 및 방화문 개방에 필요한 전신 파워와 악력 집중 훈련',
    tacticalObjective: '농연 속 65mm 수관 전개와 도끼/해머 파쇄를 모사한 고강도 전신 파워 훈련',
    equipmentNeeded: ['케틀벨', '덤벨 또는 바벨', '박스/스텝'],
    movements: [
      { id: 'm1', name: '수관 전개 모사: 케틀벨 파머스 캐리', reps: '50m (24kg x 2)', tacticalNote: '악력 및 척추 중립 유지' },
      { id: 'm2', name: '방화문 강제개방: 해머 슬램 or 덤벨 스내치', reps: '20회', tacticalNote: '코어와 둔근의 폭발적 파워' },
      { id: 'm3', name: '요구조자 견인: 샌드백/덤벨 드래그 버피', reps: '15회', tacticalNote: '실전 낮은 포복 자세 연계' },
      { id: 'm4', name: '연소 확대 저지: 케틀벨 스윙', reps: '30회', tacticalNote: '호흡 통제 훈련' },
      { id: 'm5', name: '옥상 탈출: 박스 점프 오버 (Step-over)', reps: '20회', tacticalNote: '다리 피로 누적 시 발 걸림 주의' },
    ]
  },
  {
    id: 'preset-2',
    title: '공기호흡기 잔량 경보: 탈출 AMRAP',
    format: 'AMRAP',
    timeCapMinutes: 15,
    description: '공기 잔압 50bar 비상 경보 상황을 가정한 15분 동안의 최대 라운드 집중 탈출 훈련',
    tacticalObjective: '호흡근 피로 극한 상태에서의 침착한 페이스 조절 및 유산소 임계점 극복',
    equipmentNeeded: ['맨몸', '풀업바 or 덤벨'],
    movements: [
      { id: 'm2-1', name: '방화복 중량 계단 오르기 (스텝업/런지)', reps: '24회 (좌우 12회씩)', tacticalNote: '하체 유산소 지구력' },
      { id: 'm2-2', name: '장애물 돌파 핸드리lease 푸시업', reps: '15회', tacticalNote: '가슴 및 상체 프레스 파워' },
      { id: 'm2-3', name: '좁은 배관 포복: 마운틴 클라이머', reps: '30회', tacticalNote: '복압 및 코어 안정성' },
      { id: 'm2-4', name: '비상 탈출 버피 (Burpee)', reps: '10회', tacticalNote: '산소 소비 극대화 환경 적응' },
    ]
  },
  {
    id: 'preset-3',
    title: '동료 소방관 구출작전 (RIT Rapid Intervention)',
    format: 'FOR_TIME',
    timeCapMinutes: 18,
    description: '붕괴 건물에 고립된 동료 소방관(80kg 상당)을 신속히 수색하여 안전지대로 이송하는 시나리오',
    tacticalObjective: '고중량 파머스 홀드와 데드리프트 중심의 후면 사슬 및 멘탈 극복',
    equipmentNeeded: ['바벨 or 헤비 케틀벨', '박스'],
    movements: [
      { id: 'm3-1', name: '장비 운반: 데드리프트 (체중의 100~120%)', reps: '15회', tacticalNote: '등 하부 및 햄스트링 동원' },
      { id: 'm3-2', name: '동료 어깨 메기: 헤비 샌드백/덤벨 클린', reps: '15회', tacticalNote: '척추 기립근 보호' },
      { id: 'm3-3', name: '비상구 돌파: 박스 점프', reps: '20회', tacticalNote: '순발력' },
      { id: 'm3-4', name: '방화벽 통과: 플랭크 숄더 탭', reps: '30회', tacticalNote: '어깨 안정성 및 코어' },
    ]
  },
  {
    id: 'preset-4',
    title: '초고층 화재 현장돌입: 버티컬 하이킹',
    format: 'AMRAP',
    timeCapMinutes: 20,
    description: '엘리베이터 정지 상황에서 30층 이상 고층 아파트로 진입하는 호흡곤란 극한 체력 훈련',
    tacticalObjective: '대퇴사두근 젖산 내성 증가와 심박수 급상승 방어',
    equipmentNeeded: ['덤벨/케틀벨', '스텝박스 or 계단'],
    movements: [
      { id: 'm4-1', name: '중량 스텝업 (덤벨 들고)', reps: '40회', tacticalNote: '발바닥 전체 접지' },
      { id: 'm4-2', name: '수관 직사 반동 제어: 쓰러스터 (Thruster)', reps: '15회', tacticalNote: '전신 연결 동작' },
      { id: 'm4-3', name: '연기 회피 오리걸음 (Duck Walk)', reps: '15m', tacticalNote: '고관절 모빌리티' },
      { id: 'm4-4', name: '악력 방전 방지: 행잉 니레이즈 or 플랭크', reps: '15회 (또는 45초)', tacticalNote: '악력 보존' },
    ]
  }
];

export interface WODGenerationParams {
  fatigueLevel: 'low' | 'medium' | 'high'; // 출동 피로도
  format: WODFormat;
  durationMinutes: number;
  equipment: string[];
  focusArea: string;
}

export async function generateFireWODWithGemini(
  apiKey: string,
  params: WODGenerationParams
): Promise<WODDetails> {
  const prompt = `당신은 대한민국 소방관 전술 체력단련(Tactical Strength & Conditioning) 수석 코치입니다.
현장 출동(화재진압, 인명구조, 구급)에 실질적으로 도움이 되는 고강도 기능성 서킷 WOD(CrossFit 스타일)를 1개 생성해 주세요.

[요청 조건]
- 당일 대원 피로도: ${params.fatigueLevel === 'high' ? '높음 (방금 화재/구조 출동 다녀옴, 부상방지 및 유연성/기초체력 중심)' : params.fatigueLevel === 'medium' ? '보통 (일반 당직 대기 상태)' : '낮음 (체력 만전, 최정예 특수구조대급 고강도 작전)'}
- WOD 포맷: ${params.format}
- 목표 제한 시간: ${params.durationMinutes}분
- 보유 기구: ${params.equipment.length > 0 ? params.equipment.join(', ') : '맨몸, 기본 덤벨/케틀벨'}
- 집중 영역: ${params.focusArea || '소방 현장 전술 체력(호스 끌기, 계단 등반, 코어, 악력, 요구조자 운반)'}

반드시 유효한 JSON 형식으로만 응답하세요. 다른 설명이나 마크다운 코드블록(\`\`\`json)은 최소화하고 순수 JSON만 출력해야 합니다:
{
  "title": "작전명 (소방 전술 느낌의 강렬한 제목)",
  "format": "${params.format}",
  "timeCapMinutes": ${params.durationMinutes},
  "description": "이 훈련의 소방 전술적 배경 및 의도 (2~3문장)",
  "tacticalObjective": "소방 현장 핵심 강화 목표 (예: 호흡기 잔압 부족 시 심폐 및 악력 통제)",
  "equipmentNeeded": ["기구1", "기구2"],
  "movements": [
    {
      "name": "운동 종목명 (소방 전술 매칭 설명 포함, 예: 호스 드래그 모사 케틀벨 스윙)",
      "reps": "횟수 또는 거리 (예: 20회, 40m)",
      "tacticalNote": "소방 현장 연계 팁 및 안전 주의점"
    }
  ]
}`;

  // Use gemini-2.5-flash (or gemini-1.5-flash compatibility)
  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `API Error HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini 응답 데이터가 비어 있습니다.');
      }

      // Clean JSON string (strip ```json and ``` if present)
      let cleanJson = rawText.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      }

      const parsed = JSON.parse(cleanJson);
      
      const wod: WODDetails = {
        id: 'ai-' + Date.now(),
        title: parsed.title || '오늘의 소방 전술 WOD',
        format: (parsed.format === 'AMRAP' ? 'AMRAP' : 'FOR_TIME') as WODFormat,
        timeCapMinutes: Number(parsed.timeCapMinutes) || params.durationMinutes,
        description: parsed.description || '소방 전술 강화 서킷 훈련',
        tacticalObjective: parsed.tacticalObjective || '소방 현장 대응력 및 심폐 지구력 증진',
        equipmentNeeded: Array.isArray(parsed.equipmentNeeded) ? parsed.equipmentNeeded : params.equipment,
        movements: (parsed.movements || []).map((m: { name?: string; reps?: string; tacticalNote?: string }, idx: number) => ({
          id: `ai-m-${idx}`,
          name: m.name || `동작 ${idx + 1}`,
          reps: m.reps || '15회',
          tacticalNote: m.tacticalNote || '자세와 호흡에 집중하세요.'
        }))
      };

      if (wod.movements.length === 0) {
        throw new Error('동작 목록을 파싱하지 못했습니다.');
      }

      return wod;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // try next model
    }
  }

  throw lastError || new Error('Gemini API 호출에 실패했습니다.');
}
