import os
import sys
import uuid
import logging
import threading
import shutil
from datetime import datetime
from typing import Dict, Any, Optional, Tuple, List
from fastapi import UploadFile, BackgroundTasks

from app.config import settings
from app.api.routes import JobStatus, JobResponse
# Set up logging
logger = logging.getLogger("cypy_service")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [CYPY-Service] %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# Ensure CYPY engine directory is in sys.path
if settings.CYPY_ENGINE_DIR not in sys.path:
    sys.path.insert(0, settings.CYPY_ENGINE_DIR)

# Import original CYPY engine modules
from cypy.core.translator import (
    process_single_image,
    process_pdf,
    process_archive,
    _make_output_path
)
from cypy.core.yolo_onnx import YOLOONNX
from cypy.core.providers import create_provider
from cypy.core.config import config_manager
import cypy.core.config as cypy_config

LANG_NAME_MAP = {
    "en": "English",
    "id": "Indonesian",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese",
    "zh": "Chinese",
    "jp": "Japanese",
    "kr": "Korean",
}


class CypyService:
    """
    Singleton service managing the CYPY AI translation engine, job state store,
    file handling, and background task execution via real CYPY engine calls.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(CypyService, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return

        self._initialized = True
        self.jobs_store: Dict[str, Dict[str, Any]] = {}
        self.store_lock = threading.Lock()
        self._providers: Dict[str, Any] = {}

        # Ensure workspace directories exist
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        os.makedirs(settings.OUTPUT_DIR, exist_ok=True)

        self._yolo_model = None
        self._init_yolo_model()

    def _init_yolo_model(self):
        """Initialize YOLO ONNX model once."""
        if self._yolo_model is None:
            try:
                model_path = cypy_config.MODEL_YOLO
                logger.info(f"Initializing YOLO ONNX model from: {model_path}")
                self._yolo_model = YOLOONNX(model_path)
                logger.info("YOLO ONNX Engine initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize YOLO ONNX model: {e}", exc_info=True)

    def _get_provider(self, provider_name: str):
        """Initialize or retrieve cached provider instance."""
        p_key = provider_name.lower()
        if p_key in self._providers:
            return self._providers[p_key]

        with self._lock:
            if p_key in self._providers:
                return self._providers[p_key]

            api_key, model_name = config_manager.config.get_provider_config(p_key)
            if not api_key:
                meta = cypy_config.PROVIDER_REGISTRY.get(p_key)
                if meta and meta.env_key:
                    api_key = os.getenv(meta.env_key, "")

            logger.info(f"Creating provider '{p_key}' with model '{model_name}'")
            provider_inst = create_provider(p_key, api_key=api_key, model_name=model_name)
            self._providers[p_key] = provider_inst
            return provider_inst

    def is_engine_available(self) -> bool:
        """Check if underlying CYPY python package is installed and importable."""
        return True

    def get_available_providers(self) -> List[str]:
        """List translation providers supported by CYPY."""
        if hasattr(cypy_config, "PROVIDER_REGISTRY"):
            try:
                return list(cypy_config.PROVIDER_REGISTRY.keys())
            except Exception:
                pass
        return ["google", "gemini", "openai", "deepl", "openrouter", "zen", "opencodego", "custom"]

    def _save_job_state(self, job_id: str, data: Dict[str, Any]):
        """Thread-safe update to in-memory job store."""
        with self.store_lock:
            if job_id not in self.jobs_store:
                self.jobs_store[job_id] = {}
            self.jobs_store[job_id].update(data)

    def get_job_by_id(self, job_id: str) -> Optional[JobResponse]:
        """Retrieve job status information by ID."""
        with self.store_lock:
            job_data = self.jobs_store.get(job_id)
            if not job_data:
                return None

            return JobResponse(
                job_id=job_id,
                status=job_data.get("status", JobStatus.PENDING),
                message=job_data.get("message", "Job registered."),
                progress=job_data.get("progress", 0.0),
                created_at=job_data.get("created_at", datetime.utcnow().isoformat()),
                completed_at=job_data.get("completed_at"),
                input_filename=job_data.get("input_filename", "unknown"),
                output_filename=job_data.get("output_filename")
            )

    def get_download_file(self, job_id: str) -> Tuple[Optional[str], Optional[str]]:
        """Retrieve output file path and filename for a completed job."""
        with self.store_lock:
            job_data = self.jobs_store.get(job_id)
            if not job_data or job_data.get("status") != JobStatus.COMPLETED:
                return None, None

            output_path = job_data.get("output_path")
            output_filename = job_data.get("output_filename", f"translated_{job_id}")
            return output_path, output_filename

    async def _save_upload_file(self, file: UploadFile, prefix: str) -> Tuple[str, str]:
        """Helper to save uploaded file safely to storage."""
        job_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename or "")[1]
        saved_filename = f"{prefix}_{job_id}{ext}"
        saved_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

        content = await file.read()
        with open(saved_path, "wb") as f:
            f.write(content)

        return job_id, saved_path

    async def create_image_job(
        self,
        file: UploadFile,
        target_lang: str,
        provider: str,
        background_tasks: BackgroundTasks
    ) -> JobResponse:
        """Create and queue a single image translation job."""
        job_id, file_path = await self._save_upload_file(file, "img")

        job_data = {
            "job_id": job_id,
            "status": JobStatus.PENDING,
            "message": "Image uploaded. Queued for translation.",
            "progress": 0.0,
            "created_at": datetime.utcnow().isoformat(),
            "input_filename": file.filename or "image.png",
            "input_path": file_path,
            "target_lang": target_lang,
            "provider": provider,
            "job_type": "image"
        }
        self._save_job_state(job_id, job_data)

        background_tasks.add_task(self._process_translation_background, job_id)
        return self.get_job_by_id(job_id)

    async def create_pdf_job(
        self,
        file: UploadFile,
        target_lang: str,
        provider: str,
        background_tasks: BackgroundTasks
    ) -> JobResponse:
        """Create and queue a PDF document translation job."""
        job_id, file_path = await self._save_upload_file(file, "pdf")

        job_data = {
            "job_id": job_id,
            "status": JobStatus.PENDING,
            "message": "PDF uploaded. Queued for translation.",
            "progress": 0.0,
            "created_at": datetime.utcnow().isoformat(),
            "input_filename": file.filename or "manga.pdf",
            "input_path": file_path,
            "target_lang": target_lang,
            "provider": provider,
            "job_type": "pdf"
        }
        self._save_job_state(job_id, job_data)

        background_tasks.add_task(self._process_translation_background, job_id)
        return self.get_job_by_id(job_id)

    async def create_archive_job(
        self,
        file: UploadFile,
        target_lang: str,
        provider: str,
        background_tasks: BackgroundTasks
    ) -> JobResponse:
        """Create and queue an archive (ZIP/CBZ) translation job."""
        job_id, file_path = await self._save_upload_file(file, "arch")

        job_data = {
            "job_id": job_id,
            "status": JobStatus.PENDING,
            "message": "Archive uploaded. Queued for translation.",
            "progress": 0.0,
            "created_at": datetime.utcnow().isoformat(),
            "input_filename": file.filename or "manga.zip",
            "input_path": file_path,
            "target_lang": target_lang,
            "provider": provider,
            "job_type": "archive"
        }
        self._save_job_state(job_id, job_data)

        background_tasks.add_task(self._process_translation_background, job_id)
        return self.get_job_by_id(job_id)

    def _process_translation_background(self, job_id: str):
        """
        Background task invoking real CYPY engine translation functions.
        Calls process_single_image, process_pdf, or process_archive.
        """
        logger.info(f"Starting real CYPY translation for job {job_id}")
        self._save_job_state(job_id, {
            "status": JobStatus.PROCESSING,
            "message": "CYPY engine analyzing manga page(s)...",
            "progress": 20.0
        })

        try:
            with self.store_lock:
                job_info = self.jobs_store.get(job_id, {})

            input_path = job_info.get("input_path")
            input_filename = job_info.get("input_filename", "file")
            target_lang_code = job_info.get("target_lang", "en")
            provider_name = job_info.get("provider", "google")
            job_type = job_info.get("job_type", "image")

            target_lang_name = LANG_NAME_MAP.get(target_lang_code.lower(), target_lang_code)

            # Ensure YOLO model and Provider are initialized
            if self._yolo_model is None:
                self._init_yolo_model()

            if self._yolo_model is None:
                raise RuntimeError("YOLO ONNX model could not be initialized")

            provider_inst = self._get_provider(provider_name)

            self._save_job_state(job_id, {
                "progress": 40.0,
                "message": f"Detecting bubbles via YOLO & translating with {provider_name.upper()}..."
            })

            res_path = None
            if job_type == "image":
                res_path = process_single_image(
                    image_path=input_path,
                    yolo_model=self._yolo_model,
                    provider=provider_inst,
                    target_language=target_lang_name
                )
            elif job_type == "pdf":
                process_pdf(
                    pdf_path=input_path,
                    yolo_model=self._yolo_model,
                    provider=provider_inst,
                    target_language=target_lang_name
                )
                res_path = _make_output_path(input_path, target_lang_name, output_ext=".pdf")
            elif job_type == "archive":
                process_archive(
                    archive_path=input_path,
                    yolo_model=self._yolo_model,
                    provider=provider_inst,
                    target_language=target_lang_name
                )
                res_path = _make_output_path(input_path, target_lang_name, output_ext=".pdf")

            # Fallback path check
            if not res_path or not os.path.exists(res_path):
                ext = ".pdf" if job_type in ("pdf", "archive") else os.path.splitext(input_path)[1]
                expected_path = _make_output_path(input_path, target_lang_name, output_ext=ext)
                if os.path.exists(expected_path):
                    res_path = expected_path

            if not res_path or not os.path.exists(res_path):
                raise RuntimeError(f"CYPY engine did not generate output file for job {job_id}")

            out_filename = f"translated_{job_id}_{input_filename}"
            final_output_path = os.path.join(settings.OUTPUT_DIR, out_filename)
            shutil.move(res_path, final_output_path)

            self._save_job_state(job_id, {
                "status": JobStatus.COMPLETED,
                "message": "Translation completed successfully.",
                "progress": 100.0,
                "completed_at": datetime.utcnow().isoformat(),
                "output_path": final_output_path,
                "output_filename": out_filename
            })
            logger.info(f"Job {job_id} completed successfully via CYPY engine.")

        except Exception as e:
            logger.error(f"Error processing translation job {job_id}: {e}", exc_info=True)
            self._save_job_state(job_id, {
                "status": JobStatus.FAILED,
                "message": f"Translation failed: {str(e)}",
                "progress": 0.0,
                "completed_at": datetime.utcnow().isoformat()
            })
