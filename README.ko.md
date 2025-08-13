# 할일 관리 애플리케이션

Next.js, TypeScript, Tailwind CSS로 구축된 현대적이고 기능이 풍부한 할일 관리 애플리케이션입니다.

## 🚀 최신 업데이트 (v2.0)

### 새로운 기능
- 📅 **타임박스 뷰**: 30분 단위로 나뉜 24시간 타임라인에 할일 배치
- 🎯 **집중 모드**: 중요한 작업에 별표를 표시하고 필터링
- 📆 **캘린더 뷰**: 마감일이 있는 할일을 캘린더 형식으로 시각화
- 🔄 **반복 할일**: 매일, 매주, 매월 반복되는 할일 설정
- 📊 **난이도 레벨**: 쉬움/보통/어려움으로 작업 분류
- ⏱️ **타이머 시스템**: 작업 시간 추적을 위한 내장 타이머
- 📈 **타이머 통계**: 일일 시간 추적 분석
- 🎨 **미니멀 헤더**: 아이콘만 사용한 컴팩트한 툴바
- 📱 **보기 모드**: 전체/오늘 보기를 즉시 전환
- 🔔 **스마트 알림**: 타이머 마일스톤 브라우저 알림

## 핵심 기능

- ✅ 할일 생성, 완료, 삭제
- 📝 다단계 하위 작업 (최대 5단계 깊이)
- ⏰ 실시간 시계 표시
- 💾 로컬 파일 기반 저장소 (JSON)
- 🎨 shadcn/ui 컴포넌트를 활용한 모던 UI
- 🌙 다크 모드 지원
- ⭐ 중요 작업 표시 및 필터링
- 👁️ 완료 항목 보기/숨기기 토글
- 📋 하위 작업 포함 전체 할일 복사
- 🛡️ Zod를 통한 데이터 검증
- 🔄 모든 하위 작업 완료시 상위 작업 자동 완료
- 📊 실시간 진행률 통계
- 🗑️ 완료된 항목 일괄 삭제
- ⌨️ 키보드 단축키 지원
- 🚨 강력한 오류 처리를 위한 에러 바운더리
- 💪 React.memo와 디바운싱으로 성능 최적화
- 🎉 완료 애니메이션 및 축하 효과
- 🔍 같은 레벨 내에서 드래그 앤 드롭 재정렬
- 📐 3일 경과한 완료 작업 자동 정리

## 기술 스택

- **프레임워크**: Next.js 15+ (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **검증**: Zod
- **아이콘**: Lucide React
- **애니메이션**: Framer Motion
- **날짜 처리**: date-fns
- **드래그 앤 드롭**: @dnd-kit

## 시작하기

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd my-app
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 프로젝트 구조

```
app/
├── api/
│   ├── todos/
│   │   └── route.ts      # 할일 CRUD 작업
│   └── timer/
│       └── route.ts      # 타이머 세션 관리
├── page.tsx              # 뷰 라우팅이 있는 메인 페이지
├── layout.tsx            # 프로바이더가 있는 루트 레이아웃
└── globals.css           # 전역 스타일

components/
├── todo/
│   ├── TodoList.tsx      # 메인 리스트 뷰
│   ├── TodoItem.tsx      # 모든 컨트롤이 있는 개별 할일
│   ├── TodoInput.tsx     # 입력 컴포넌트
│   ├── TodoToolbar.tsx   # 미니멀리스트 헤더 툴바
│   ├── CalendarView.tsx  # 캘린더 시각화
│   ├── TimeboxView.tsx   # 24시간 타임라인 뷰
│   ├── SortableTodoItem.tsx # 드래그-드롭 래퍼
│   └── EditableTodoText.tsx # 인라인 편집
├── timer/
│   ├── FloatingTimer.tsx # 활성 타이머 표시
│   └── TimerSidebar.tsx  # 타이머 통계 패널
└── ui/                   # shadcn/ui 컴포넌트

contexts/
├── TodoContext.tsx       # 전역 할일 상태
└── TimerContext.tsx      # 타이머 상태 관리

hooks/
├── useTodos.ts          # 메인 할일 로직
├── useTodoAPI.ts        # API 통신
├── useExpandedState.ts  # 펼치기/접기 상태
├── useTodoStyles.ts     # 스타일링과 단축키
└── useTimer.ts          # 타이머 기능

utils/
├── todo-helpers.ts      # 할일 CRUD 작업
├── todo-tree-utils.ts   # 트리 순회 유틸리티
├── date-helpers.ts      # 날짜 포맷팅
├── date-utils.ts        # 마감일 처리
├── timer-utils.ts       # 타이머 포맷팅
├── recurring-utils.ts   # 반복 작업 로직
└── difficulty-utils.ts  # 난이도 헬퍼

types/
├── todo.ts              # 할일 인터페이스
├── todo-tree.ts         # 트리 타입
└── timer.ts             # 타이머 타입
```

## 상세 기능

### 📅 타임박스 뷰 (신규)
- 30분 단위로 나뉜 24시간 타임라인
- 할일을 시간 블록으로 드래그 앤 드롭
- 현재 시간 시각적 표시
- 로드시 현재 시간으로 자동 스크롤
- 슬롯당 여러 작업을 보여주는 컴팩트 디자인

### 🔄 반복 할일 (신규)
- 자연어 입력: "운동 매일", "회의 매주 월요일"
- 지원 패턴:
  - 매일
  - 평일 (월-금)
  - 특정 요일 매주 (매주 X요일)
  - 특정 날짜 매월 (매월 X일)
- 완료시 다음 인스턴스 자동 생성

### 📊 난이도 시스템 (신규)
- 세 가지 레벨: 쉬움, 보통, 어려움
- 색상 코드 뱃지: 초록, 노랑, 빨강
- E/N/H/? 버튼으로 빠른 토글
- 하위 작업 포함 모든 할일에 적용

### ⏱️ 타이머 기능 (신규)
- 모든 작업에 대한 타이머 시작/중지
- 최소화 옵션이 있는 플로팅 타이머 창
- 일일 세션 추적
- 타이머 통계 사이드바
- 작업별 총 소요 시간
- 25분 마일스톤 알림

### 🎯 집중 모드
- 우선순위를 위해 중요한 작업에 별표 표시
- 집중 작업만 표시하도록 필터링
- 자동 우선순위 번호 매기기 (1-5)
- 앱 전체에 시각적 표시
- 완료시 스마트 재정렬

### 📱 보기 모드
- **전체 보기**: 모든 할일 표시
- **오늘 보기**: 오늘의 작업과 반복 항목만 표시
- 툴바에서 빠른 토글
- 세션 간 지속적인 선택

### 할일 관리
- Enter 키로 새 할일 추가
- 텍스트 클릭으로 인라인 편집
- 체크박스로 완료 토글
- 휴지통 아이콘으로 삭제
- 전체 할일 트리 복사
- 빠른 날짜가 있는 마감일 선택기
- 자동 상위 완료 로직

### 다단계 하위 작업
- 최대 5단계 중첩
- 계층 구조를 위한 시각적 들여쓰기
- 진행률 추적 (예: "2/5 완료")
- 모든 레벨에서 펼치기/접기
- 같은 레벨 내에서 드래그로 재정렬

### 키보드 단축키
- `Enter` - 새 할일 추가/편집 저장
- `Shift + Enter` - 형제 할일 추가
- `Tab` - 하위 작업 추가
- `Escape` - 편집 취소
- `Delete` - 할일 삭제
- 더블클릭 - 할일 텍스트 편집

### 데이터 지속성
- 로컬 JSON 파일 저장소 (`todos.json`, `timer-sessions.json`)
- 저장 전 자동 백업
- 성능을 위한 디바운스 저장
- Zod를 통한 데이터 검증
- 오래된 완료 작업 자동 정리

## 스크립트

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
npm run typecheck # TypeScript 검사 실행
```

## 설정

주요 파일:
- `constants/todo.ts` - 애플리케이션 상수
- `CLAUDE.md` - AI 어시스턴트 컨텍스트
- `tailwind.config.ts` - Tailwind 설정
- `components.json` - shadcn/ui 설정

## 데이터 형식

### 할일 구조
```json
{
  "id": 1234567890,
  "text": "메인 할일",
  "completed": false,
  "createdAt": "2025-01-24T12:00:00.000Z",
  "completedAt": null,
  "dueDate": "2025-01-25",
  "focusPriority": 1,
  "difficulty": "normal",
  "recurringPattern": {
    "type": "daily",
    "interval": 1,
    "nextDueDate": "2025-01-26"
  },
  "subtasks": []
}
```

### 타이머 세션 구조
```json
{
  "id": "session-123",
  "todoId": 1234567890,
  "todoText": "작업 이름",
  "startTime": "2025-01-24T10:00:00.000Z",
  "endTime": "2025-01-24T10:25:00.000Z",
  "duration": 1500000,
  "date": "2025-01-24"
}
```

## 브라우저 지원

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- JavaScript 활성화 필요
- 로컬 스토리지 접근 필요

## 성능

- 메모이제이션된 컴포넌트로 불필요한 리렌더링 방지
- 디바운스 저장 (500ms)으로 파일 I/O 감소
- 대규모 할일 목록을 위한 가상 스크롤링
- 즉각적인 피드백을 위한 낙관적 UI 업데이트
- 무거운 컴포넌트의 지연 로딩

## 알려진 제한사항

- 단일 사용자 로컬 애플리케이션
- 클라우드 동기화 또는 다중 장치 지원 없음
- 최대 5단계 중첩
- 파일 기반 저장소 (수천 개의 할일에는 부적합)
- 모바일 앱 없음 (웹 전용)

## 기여하기

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 감사의 말

- [Next.js](https://nextjs.org/)로 구축
- [shadcn/ui](https://ui.shadcn.com/)의 UI 컴포넌트
- [Lucide](https://lucide.dev/)의 아이콘
- [Framer Motion](https://www.framer.com/motion/)의 애니메이션