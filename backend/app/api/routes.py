from fastapi import APIRouter, File, UploadFile, BackgroundTasks, HTTPException, status, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
import os

from app.config import settings

class JobStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class HealthResponse(BaseModel):
    status: str = "online"
    service: str = "CYPY Web Engine API"
    version: str = settings.VERSION
    cypy_engine_available: bool


class EngineInfoResponse(BaseModel):
    name: str = "CYPY Manga Translator Engine"
    version: str = settings.VERSION
    cypy_engine_available: bool = True
    supported_formats: List[str] = Field(default_factory=lambda: ["png", "jpg", "jpeg", "webp", "pdf", "zip", "cbz", "rar", "cbr"])
    features: List[str] = Field(default_factory=lambda: [
        "YOLO ONNX Text Detection",
        "Manga Text Inpainting & Erasing",
        "Multi-provider Translation Engines",
        "Batch & Archive Processing"
    ])
    default_target_lang: str = "en"
    available_providers: List[str] = Field(default_factory=lambda: ["google", "deepl", "chatgpt", "gemini", "papago", "offline"])


class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str
    progress: float = 0.0
    created_at: str
    completed_at: Optional[str] = None
    input_filename: str
    output_filename: Optional[str] = None


class TranslationSubmitResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str


router = APIRouter(prefix="", tags=["CYPY Engine API"])


# Service dependency accessor - to be imported from services module
def get_cypy_service():
    from app.services.cypy_service import CypyService
    return CypyService()

@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def check_health(service=Depends(get_cypy_service)):
    """Check API server and CYPY engine connectivity status."""
    return HealthResponse(
        status="online",
        service="CYPY Web Engine API",
        version=settings.VERSION,
        cypy_engine_available=service.is_engine_available()
    )


@router.get("/engine", response_model=EngineInfoResponse, status_code=status.HTTP_200_OK)
async def get_engine_info(service=Depends(get_cypy_service)):
    """Retrieve capabilities and configuration of the underlying CYPY engine."""
    return EngineInfoResponse(
        cypy_engine_available=service.is_engine_available(),
        available_providers=service.get_available_providers()
    )


@router.post("/translate/image", response_model=TranslationSubmitResponse, status_code=status.HTTP_202_ACCEPTED)
async def translate_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_lang: str = "en",
    provider: str = "google",
    service=Depends(get_cypy_service)
):
    """Queue a single image manga translation task."""
    job = await service.create_image_job(file=file, target_lang=target_lang, provider=provider, background_tasks=background_tasks)
    return TranslationSubmitResponse(
        job_id=job.job_id,
        status=job.status,
        message="Image translation job queued successfully."
    )


@router.post("/translate/pdf", response_model=TranslationSubmitResponse, status_code=status.HTTP_202_ACCEPTED)
async def translate_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_lang: str = "en",
    provider: str = "google",
    service=Depends(get_cypy_service)
):
    """Queue a PDF manga document translation task."""
    job = await service.create_pdf_job(file=file, target_lang=target_lang, provider=provider, background_tasks=background_tasks)
    return TranslationSubmitResponse(
        job_id=job.job_id,
        status=job.status,
        message="PDF translation job queued successfully."
    )


@router.post("/translate/archive", response_model=TranslationSubmitResponse, status_code=status.HTTP_202_ACCEPTED)
async def translate_archive(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_lang: str = "en",
    provider: str = "google",
    service=Depends(get_cypy_service)
):
    """Queue a compressed archive (ZIP/CBZ/RAR/CBR) translation task."""
    job = await service.create_archive_job(file=file, target_lang=target_lang, provider=provider, background_tasks=background_tasks)
    return TranslationSubmitResponse(
        job_id=job.job_id,
        status=job.status,
        message="Archive translation job queued successfully."
    )


@router.get("/job/{job_id}", response_model=JobResponse, status_code=status.HTTP_200_OK)
async def get_job_status(job_id: str, service=Depends(get_cypy_service)):
    """Fetch status and progress details for a specific translation job."""
    job = service.get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{job_id}' not found."
        )
    return job


@router.get("/download/{job_id}", status_code=status.HTTP_200_OK)
async def download_result(job_id: str, service=Depends(get_cypy_service)):
    """Download translated result file for a completed job."""
    file_path, filename = service.get_download_file(job_id)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Result file for job '{job_id}' is not ready or does not exist."
        )
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )
