# web-profile — 김태현 소개 페이지 배포 프로젝트

개인 소개 페이지를 html로 구현, Vercel에 배포하고,
프로필 정보를 돌려주는 FastAPI 백엔드를 Render에 배포해, 프론트엔드에서
백엔드 API를 호출하여 결과를 확인할 수 있도록 연동했습니다.

## 배포 주소

| 구분 | 주소 |
| --- | --- |
| 프론트엔드 (Vercel) | https://web-profile-kappa-eight.vercel.app |
| 백엔드 Swagger UI (Render) | https://web-profile-ptqp.onrender.com/docs |
| GitHub 저장소 | https://github.com/kth6449-ops/web-profile |

## 주요 구성

```
web-profile/
├─ app/                      FastAPI 백엔드 (Render 배포)
│  ├─ main.py                앱 생성 · CORS 설정 · 라우터 등록
│  ├─ models.py              Pydantic 응답 모델
│  └─ routers/
│     └─ profile.py          프로필 · 경력 · 학력 API
├─ frontend/                 Vercel 배포 (Root Directory = frontend)
│  ├─ index.html             개인 소개 페이지 — 서비스 화면
│  └─ api.html               프론트엔드·백엔드 연동 실습 페이지
├─ requirements.txt          Render가 설치할 패키지 목록
└─ .gitignore
```

## API 목록

| 메서드 | 경로 | 설명 | 상태 코드 |
| --- | --- | --- | --- |
| GET | `/` | 환영 메시지 | 200 |
| GET | `/health` | 서버 상태 확인 | 200 |
| GET | `/api/profile` | 소개 정보 반환 | 200 |
| GET | `/api/experience` | 경력 전체 목록 | 200 |
| GET | `/api/experience/{id}` | 경력 단건 조회 | 200 / 404 |
| GET | `/api/education` | 학력 전체 목록 | 200 |

## 프론트엔드·백엔드 연동 방식

페이지를 두 개로 나누었습니다. `index.html`은 사람에게 보여주는 소개 페이지,
`api.html`은 백엔드 호출을 확인하는 연동 실습 페이지이며, 서로 연결됩니다.

`api.html`에서 브라우저의 `fetch`로 Render의 API를 호출하고, 상태 코드·응답 시간·
응답 본문(JSON)을 화면에 그대로 출력합니다. Swagger UI(`/docs`)는 Render 백엔드가
제공하며, 이 페이지에서 링크로 엽니다.

프론트엔드(`*.vercel.app`)와 백엔드(`*.onrender.com`)는 서로 다른 도메인이므로,
브라우저가 요청을 차단하지 않도록 백엔드에 CORS 설정을 추가했습니다.

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

프론트엔드에서 호출 대상 주소는 `frontend/api.html` 하단 스크립트의 `API_BASE`
상수 한 줄로 관리합니다.

## 확인 순서

Vercel 주소를 열고 → 상단 연동 실습 ↗ 링크로 `api.html`로 이동 → 버튼을 누르면
호출 결과를 확인할 수 있습니다.

1. 서버 상태 — `{"status":"ok"}`
2. 프로필 — 소개 정보 JSON
3. 경력 — 경력 6건 배열
4. 학력 — 학력 5건 배열
5. 없는 경력 (404) — `{"detail":"999번 경력을 찾을 수 없습니다"}`

## 알아 둘 점

- **콜드 스타트** — Render 무료 플랜은 15분간 요청이 없으면 서버가 대기 상태가 됩니다.
  첫 호출은 30~60초 걸릴 수 있습니다. 연동 페이지는 열릴 때 `/health`를 미리 호출해
  서버를 깨웁니다.
- 프로필 데이터는 코드(`app/routers/profile.py`)에 담겨 있어 서버가 재시작되어도 유지됩니다.

## 로컬 실행

```bash
# 백엔드
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py         # http://127.0.0.1:8000/docs

# 프론트엔드
# frontend/api.html 의 API_BASE 를 http://127.0.0.1:8000 으로 바꾸고
# VS Code Live Server(5500 포트)로 index.html 을 연다
```

## 배포 설정

| 플랫폼 | 항목 | 값 |
| --- | --- | --- |
| Render | Language | Python 3 |
| Render | Build Command | `pip install -r requirements.txt` |
| Render | Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Vercel | Framework Preset | Other |
| Vercel | Root Directory | `frontend` |
| Vercel | Build / Output / Install | 비움 |
