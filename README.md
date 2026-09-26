# web-profile — 김태현 개인 웹페이지

김태현의 개인 웹페이지입니다. 정적 HTML로 만들어 Vercel에 배포하며,
클라우드컴퓨팅 실습 과제로 만든 FastAPI 백엔드(Render)와의 연동 실습 페이지도 함께 운영합니다.

현재 버전: **v5.0** (2026-09-26)

## 배포 주소

| 구분 | 주소 |
| --- | --- |
| 웹페이지 (Vercel) | https://web-profile-kappa-eight.vercel.app |
| 연동 실습 페이지 | https://web-profile-kappa-eight.vercel.app/api.html |
| 백엔드 Swagger UI (Render) | https://web-profile-ptqp.onrender.com/docs |
| GitHub 저장소 | https://github.com/kth6449-ops/web-profile |

## 페이지 구성

| 파일 | 메뉴 | 내용 |
| --- | --- | --- |
| `index.html` | 나의 철학 | 프로필 사진과 간결한 소개 |
| `story.html` | 나의 이야기 | 배움·연결·선택·실행 네 장으로 구성한 이야기 |
| `notes.html` | 나의 생각 | 관찰과 질문의 게시글, 분류 필터 |
| `toolbox.html` | 생각을 실현하기 | 도구와 실험의 게시글 |
| `editor.html` | — | 글 작성 화면 (**내 컴퓨터에서만** 동작) |
| `api.html` | — | 프론트엔드·백엔드 연동 실습 (과제) |

## 저장소 구성

```
web-profile/
├─ frontend/                 Vercel 배포 대상 (Root Directory = frontend)
│  ├─ index.html · story.html · notes.html · toolbox.html
│  ├─ editor.html            글 작성 화면 (로컬 전용)
│  ├─ api.html               연동 실습 페이지
│  ├─ assets/
│  │  ├─ style.css           공통 디자인
│  │  ├─ app.js              메뉴·글 목록·편집 화면 동작
│  │  └─ posts.js            나의 생각·생각을 실현하기의 공개 글 원본
│  └─ images/                프로필 사진과 바다 유화 (WebP)
├─ app/                      FastAPI 백엔드 (Render 배포)
│  ├─ main.py                앱 생성 · CORS 설정 · 라우터 등록
│  ├─ models.py              Pydantic 응답 모델
│  └─ routers/profile.py     프로필 · 경력 · 학력 API
├─ docs/site/                작업 기록 (README · 원고 · 변경 이력) — 배포되지 않음
├─ preview.py                로컬 미리보기 서버 (frontend/ 를 띄움)
├─ start_windows.bat         preview.py 실행용
├─ requirements.txt          Render가 설치할 패키지 목록
└─ .gitignore
```

`frontend/` 밖의 파일은 Vercel에 배포되지 않습니다. 공개하지 않을 문서는 `docs/`에 둡니다.

## 편집 도구는 로컬 전용

"+ 새 글 작성" 버튼과 `editor.html`은 **내 컴퓨터의 로컬 미리보기에서만** 보입니다.
배포된 사이트의 방문자에게는 버튼이 보이지 않고, `editor.html`로 들어오면 첫 페이지로 이동합니다.
(`assets/app.js` 상단의 `isOwnerMachine` 검사 — `localhost`, `127.0.0.1`, `file://` 에서만 편집 도구를 켭니다.)

편집 화면은 글을 서버에 저장하지 않습니다. 브라우저에 임시 저장한 뒤 `posts.js` 파일로 내려받아
저장소에 반영하는 방식입니다.

## 새 글 올리기

1. `python preview.py` 실행 → 브라우저에서 "나의 생각" 또는 "생각을 실현하기"의 **+ 새 글 작성**
2. 글 작성 → **이 브라우저에 저장** → **게시 파일 내려받기**로 `posts.js` 받기
3. 받은 파일로 `frontend/assets/posts.js` 교체
4. 아래 배포 흐름대로 반영

## 배포 흐름

작업은 `dev`에서 하고, Vercel 미리보기로 확인한 뒤 `main`에 반영합니다.

```bash
git switch dev
git merge main                # 작업 전 main 최신 상태로 맞추기

# 파일 수정 → python preview.py 로 로컬 확인

git add .
git commit -m "..."
git push                      # → Vercel이 dev 미리보기 주소 생성, 여기서 확인

git switch main
git merge dev
git push                      # → 실서비스 반영 (1~2분)
git switch dev
```

## 로컬 실행

```bash
# 웹페이지 (파이썬 기본 기능만 사용, 설치 불필요)
python preview.py               # http://127.0.0.1:8765/index.html 자동으로 열림

# 백엔드 (연동 실습용)
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py         # http://127.0.0.1:8000/docs
```

## 연동 실습 (클라우드컴퓨팅 과제)

`api.html`에서 브라우저의 `fetch`로 Render의 FastAPI를 호출하고, 상태 코드·응답 시간·응답 본문(JSON)을
화면에 출력합니다. 호출 대상 주소는 `frontend/api.html` 하단 스크립트의 `API_BASE` 상수로 관리합니다.

| 메서드 | 경로 | 설명 | 상태 코드 |
| --- | --- | --- | --- |
| GET | `/` | 환영 메시지 | 200 |
| GET | `/health` | 서버 상태 확인 | 200 |
| GET | `/api/profile` | 소개 정보 반환 | 200 |
| GET | `/api/experience` | 경력 전체 목록 | 200 |
| GET | `/api/experience/{id}` | 경력 단건 조회 | 200 / 404 |
| GET | `/api/education` | 학력 전체 목록 | 200 |

프론트엔드(`*.vercel.app`)와 백엔드(`*.onrender.com`)는 도메인이 달라, 백엔드에 CORS 설정을 추가했습니다.

```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 배포 설정

| 플랫폼 | 항목 | 값 |
| --- | --- | --- |
| Vercel | Framework Preset | Other |
| Vercel | Root Directory | `frontend` |
| Vercel | Build / Output / Install | 비움 |
| Render | Language | Python 3 |
| Render | Build Command | `pip install -r requirements.txt` |
| Render | Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

## 알아 둘 점

- **Render 콜드 스타트** — 무료 플랜은 15분간 요청이 없으면 서버가 잠듭니다. 연동 실습 페이지의 첫 호출은
  30~60초 걸릴 수 있습니다. 웹페이지 자체는 Vercel 정적 배포라 영향이 없습니다.
- **편집 화면의 이미지** — 편집 화면으로 올린 사진은 `posts.js` 안에 글자(base64)로 들어갑니다.
  사진 붙은 글이 쌓이면 파일이 커지므로, 큰 사진은 `images/`에 WebP 파일로 두고 경로로 연결하는 편이 좋습니다.
- **다국어** — 영어·일본어 버튼은 현재 "준비 중"(비활성) 상태입니다.
- **저장소 위치** — OneDrive 폴더 안에 두면 동기화 중 폴더가 잠겨 git 브랜치 전환이 실패할 수 있습니다.

## 변경 이력

| 버전 | 날짜 | 내용 |
| --- | --- | --- |
| v5.0 | 2026-09-26 | 네 페이지(나의 철학·이야기·생각·생각을 실현하기)로 개편, 글 작성 화면 추가(로컬 전용), 작업 문서 `docs/` 분리 |
| v1.0 | 2026-09-21 | 개인 소개 페이지 + FastAPI 연동 실습 페이지 (클라우드컴퓨팅 과제) |

화면 수정 상세 이력은 `docs/site/CHANGELOG.md`에 있습니다.
