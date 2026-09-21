from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import profile

app = FastAPI(title="Taehyun Kim 프로필 API")

# ── CORS: 브라우저가 다른 도메인에서 이 API를 호출하도록 허용 ──
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Taehyun Kim 프로필 API에 오신 것을 환영합니다"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(profile.router)