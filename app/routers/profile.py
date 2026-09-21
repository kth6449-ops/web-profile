from fastapi import APIRouter, HTTPException, status

from app.models import EducationItem, ExperienceItem, Profile

router = APIRouter(prefix="/api", tags=["profile"])


PROFILE = {
    "name": "김태현",
    "name_en": "Taehyun Kim",
    "headline": "제조 현장의 데이터와 AI로 의사결정을 돕는 사업가",
    "affiliation": "비솔트(BESOLT) 공동창업자",
    "summary": (
        "자동차 부품에서 반도체·레이더, 그리고 창업으로 이어진 길을 걸어왔습니다. "
        "제조 현장의 데이터 확보부터 경영 분석과 AI 의사결정 지원까지 잇는 일을 합니다."
    ),
    "interests": ["제조 데이터", "AX / DX", "사업모델 개발", "수요예측 ML", "클라우드 배포"],
    "links": {
        "linkedin": "https://www.linkedin.com/in/taehyun-kim-13b527a2",
        "blog": "https://taehyunkim64.tistory.com/",
    },
}

EXPERIENCE = [
    {"id": 1, "period": "2025.11 — 현재", "company": "비솔트", "company_en": "BESOLT",
     "role": "공동창업 · 사업개발 및 운영",
     "summary": "제조 현장의 센서·비전 데이터 확보부터 MES/ERP 연계, 경영 분석과 AI 의사결정 지원까지 이어지는 사업을 추진합니다."},
    {"id": 2, "period": "2020.02 — 현재", "company": "넥스트리얼", "company_en": "NEXTREAL",
     "role": "책임 컨설턴트",
     "summary": "사업전략, 기술 사업화, 제조업 제품기획 및 수출입 실무 분야의 컨설팅과 멘토링에 참여했습니다."},
    {"id": 3, "period": "2023.05 — 2025.10", "company": "비트센싱", "company_en": "BITSENSING",
     "role": "Senior Project Manager · PM 파트리더",
     "summary": "ADAS·In-Cabin 레이더, ITS 솔루션, 헬스케어 데이터 API 사업의 프로젝트 기획과 운영을 리드했습니다."},
    {"id": 4, "period": "2022.07 — 2023.04", "company": "르네사스 일렉트로닉스", "company_en": "RENESAS ELECTRONICS",
     "role": "Account Manager · Automotive Strategic Sales",
     "summary": "자동차용 시스템반도체 사업개발과 고객·대리점 관리를 담당하며 솔루션 제안과 매출 계획을 수행했습니다."},
    {"id": 5, "period": "2020.05 — 2022.07", "company": "LS오토모티브테크놀러지스", "company_en": "LS AUTOMOTIVE TECHNOLOGIES",
     "role": "Project Manager · Global PM",
     "summary": "에어서스펜션 ECU, 모터 인버터 부품, HMI 컨트롤러 등 전장 제품의 개발부터 양산까지 관리했습니다."},
    {"id": 6, "period": "2014.03 — 2020.05", "company": "삼보모터스", "company_en": "SAMBO MOTORS",
     "role": "Business PM · Business Developer",
     "summary": "글로벌 자동차 부품 사업개발과 고객 협상, 일본 현지법인 설립·안정화 지원과 신규 사업 파이프라인 구축을 담당했습니다."},
]

EDUCATION = [
    {"id": 1, "period": "2025.02 — 재학 중", "school": "KAIST 경영전문대학원", "degree": "MBA · 2028년 졸업 예정"},
    {"id": 2, "period": "2022.03 — 2024.02", "school": "고려대학교 기술경영전문대학원", "degree": "기술경영학 석사"},
    {"id": 3, "period": "2017.09 — 2018.11", "school": "University of Glasgow", "degree": "International Commercial Law · LL.M."},
    {"id": 4, "period": "2015.03 — 2017.02", "school": "경북대학교 일반대학원", "degree": "FTA통상학과 · 경제학 석사"},
    {"id": 5, "period": "2007.03 — 2013.02", "school": "영남대학교", "degree": "법학 · 복수학위 국제학 · 부전공 국제통상학"},
]


@router.get("/profile", response_model=Profile)
def get_profile():
    """내 소개 정보를 돌려준다."""
    return PROFILE


@router.get("/experience", response_model=list[ExperienceItem])
def list_experience():
    """경력 전체 목록."""
    return EXPERIENCE


@router.get("/experience/{item_id}", response_model=ExperienceItem)
def get_experience(item_id: int):
    """경력 단건. 없으면 404."""
    row = next((e for e in EXPERIENCE if e["id"] == item_id), None)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{item_id}번 경력을 찾을 수 없습니다",
        )
    return row


@router.get("/education", response_model=list[EducationItem])
def list_education():
    """학력 전체 목록."""
    return EDUCATION