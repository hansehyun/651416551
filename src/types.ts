/**
 * 할 일(Todo) 데이터 모델 및 필터 타입 정의
 * 
 * 시니어 팁:
 * TypeScript를 사용할 때는 데이터의 구조를 먼저 인터페이스나 타입으로 명확히 정의해 두면
 * 컴포넌트 간에 props를 전달할 때 실수를 방지하고 자동 완성의 도움을 받을 수 있습니다.
 */

// 할 일 개별 항목의 인터페이스
export interface Todo {
  // 각 할 일을 고유하게 식별하기 위한 고유 ID (예: 타임스탬프 또는 고유 문자열)
  id: string;
  // 할 일 내용
  text: string;
  // 완료 여부 (true: 완료, false: 진행 중)
  completed: boolean;
  // 생성 시각 (기록용 타임스탬프)
  createdAt: number;
}

// 필터 옵션 타입 ('all': 전체, 'active': 진행 중, 'completed': 완료)
export type FilterType = 'all' | 'active' | 'completed';
