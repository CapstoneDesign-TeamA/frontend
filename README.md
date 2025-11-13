## 📁 프로젝트 구조 (Lovable Template 기반)

### 📁 루트 설정 파일
| 파일명 | 설명 |
|---------|------|
| `index.html` | 앱의 기본 HTML 템플릿, 메타 태그와 SEO 설정 |
| `vite.config.ts` | Vite 빌드 도구 설정 |
| `tailwind.config.ts` | Tailwind CSS 디자인 시스템 설정 (색상, 폰트, 그림자 등) |
| `eslint.config.js` | 코드 품질 검사 규칙 |

---

### 📁 src/ - 메인 소스 코드

#### 🎯 엔트리 포인트
| 파일명 | 설명 |
|---------|------|
| `src/main.tsx` | React 앱의 시작점, DOM에 앱을 마운트 |
| `src/App.tsx` | 라우팅 설정, 모든 페이지 경로 정의 |
| `src/index.css` | 전역 스타일, 디자인 토큰(색상, 그라디언트, 그림자) |

---

#### 📄 페이지 (src/pages/)
**랜딩 사이트**
- `Index.tsx` → 메인 랜딩 페이지 (히어로, 기능, FAQ 등)
- `Features.tsx` → 상세 기능 소개 페이지  
- `Pricing.tsx` → 가격 정책 페이지 (현재 베타 무료)
- `About.tsx` → 팀 소개 및 로드맵  
- `Contact.tsx` → 문의 폼  
- `NotFound.tsx` → 404 에러 페이지  

**앱 데모 (src/pages/app/)**
- `Login.tsx` → 로그인/회원가입 화면  
- `Onboarding.tsx` → 첫 가입 후 관심사 선택  
- `Dashboard.tsx` → 메인 대시보드 (일정, 추천 활동, 최근 앨범)  
- `Calendar.tsx` → 일정 관리  
- `Groups.tsx` → 그룹 관리  
- `Albums.tsx` → 추억 앨범 갤러리  

---

#### 🧩 컴포넌트 (src/components/)
**레이아웃**
- `Header.tsx` → 상단 네비게이션 바 (로고, 메뉴, 로그인 버튼)  
- `Footer.tsx` → 하단 푸터 (링크, 저작권)

**홈 섹션**
- `Hero.tsx` → 랜딩 히어로 섹션  
- `ValueProposition.tsx` → 가치 제안 3가지  
- `Features.tsx` → 핵심 기능 4개 카드  
- `UserScenarios.tsx` → 사용자 시나리오  
- `FAQ.tsx` → 자주 묻는 질문  

**UI 컴포넌트**
- `shadcn/ui` 라이브러리 기반 버튼, 카드, 다이얼로그, 폼 등 50+ 개  
- 일관된 디자인 시스템 유지 및 재사용 가능  

---

#### 🎨 에셋 (src/assets/)
- `hero-image.jpg` → 랜딩 페이지 히어로 이미지  
- `app-mockup.jpg` → 앱 화면 목업 이미지  

---

#### 🔧 유틸리티 & 훅
| 경로 | 설명 |
|------|------|
| `src/lib/utils.ts` | 공통 유틸 함수 (클래스 병합 등) |
| `src/hooks/` | 커스텀 React 훅 (toast, mobile 감지 등) |