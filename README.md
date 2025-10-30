# Better Life Board (Frontend)

> 하루를 설계하고 반복 루틴을 관리할 수 있는 React 기반 대시보드입니다.

## 소개
- 개인의 할 일과 루틴을 한눈에 확인하고 관리할 수 있는 웹 애플리케이션입니다.
- 날짜별 Todo 관리, 반복 Todo 편집, 상태 변경 및 피드백 알림을 통해 하루의 진행 상황을 자연스럽게 추적합니다.
- 인증이 필요한 보호된 페이지와 API 연동을 통해 실제 서비스 환경을 염두에 두고 설계되었습니다.

## 주요 기능
- **인증**: 이메일/비밀번호 기반 로그인과 회원가입, 세션 유지·복구.
- **오늘의 할 일**: 날짜별 Todo 조회, 생성, 상세 수정, 상태(예정/완료/실패/취소) 전환.
- **반복 Todo 관리**: 반복 요일, 유형을 빠르게 수정하고 삭제할 수 있는 전용 화면.
- **사용성 개선 요소**: 날짜 선택, 성공/실패 피드백 배너, 모달 기반 상세 편집, 키보드 단축(Esc) 지원.

## 기술 스택
- React 19, TypeScript, Vite 7
- React Router 7, Axios
- ESLint, TypeScript ESLint, Pretendard 기반 커스텀 스타일

## 빠른 시작
### 1. 사전 준비
- Node.js 20 이상 (CI는 Node 24 사용)
- npm 10 이상 권장

### 2. 환경 변수
| 키 | 설명 | 기본값 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 백엔드 API 엔드포인트 | `http://localhost:8080`

- 로컬 개발: `.env` 파일 수정
- 프로덕션 배포: `.env.production` 사용 (예: `https://api.betterlifeboard.com`)

### 3. 설치 & 실행
```bash
npm install
npm run dev
```
- 개발 서버: http://localhost:5173 (기본값)
- 프로덕션 빌드: `npm run build`

## 프로젝트 스크립트
- `npm run dev`: Vite 개발 서버 실행
- `npm run build`: 타입 체크 후 프로덕션 번들 생성
- `npm run preview`: 빌드 산출물 미리보기 서버
- `npm run lint`: ESLint 정적 분석

## 디렉터리 구조
```text
frontend-react/
├─ src/
│  ├─ components/        # UI 컴포넌트와 모달, 레이아웃
│  ├─ contexts/          # 전역 상태(Context API)
│  ├─ hooks/             # 인증, Todo 관련 커스텀 훅
│  ├─ pages/             # 라우트 단위 페이지 컴포넌트
│  ├─ routes/            # 보호된 라우트 설정
│  ├─ services/          # Axios 인스턴스 등 API 클라이언트
│  ├─ styles/            # 전역 스타일
│  ├─ types/             # 도메인 타입 정의
│  └─ utils/             # 반복 요일 등 공통 유틸리티
├─ public/               # 정적 자산
└─ vite.config.ts        # Vite 및 플러그인 설정
```

## 배포 파이프라인
- `main` 브랜치에 푸시 시 GitHub Actions(`.github/workflows/deploy.yml`)가 자동 실행됩니다.
- 워크플로는 다음 단계를 거칩니다:
  1. Node 24 환경에서 종속성 설치(`npm ci`) 및 빌드
  2. 생성된 `dist/`를 S3 버킷(`www.betterlifeboard.com`)으로 동기화
  3. CloudFront 캐시 무효화로 최신 빌드를 전파
- AWS 자격 증명과 CloudFront 설정은 GitHub Secrets로 관리합니다.

## 기여 가이드
1. 새로운 브랜치를 생성하고 변경 사항을 커밋하세요.
2. `npm run lint`로 정적 분석을 통과했는지 확인합니다.
3. Pull Request를 생성하고 변경 요약 및 테스트 결과를 남겨주세요.

더 나은 하루를 위한 아이디어나 버그 제보는 언제든 환영합니다!
