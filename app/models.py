from pydantic import BaseModel, Field


class ProfileLinks(BaseModel):
    linkedin: str
    blog: str


class Profile(BaseModel):
    """자기소개 페이지의 핵심 프로필."""
    name: str
    name_en: str
    headline: str
    affiliation: str
    summary: str
    interests: list[str]
    links: ProfileLinks


class ExperienceItem(BaseModel):
    id: int
    period: str
    company: str
    company_en: str
    role: str
    summary: str


class EducationItem(BaseModel):
    id: int
    period: str
    school: str
    degree: str