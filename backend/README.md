# CYPY Web - FastAPI Backend Service

Production-ready backend wrapper service for the **CYPY AI Manga Translator Engine**.

## Features

- **FastAPI Framework**: High performance async backend architecture.
- **CYPY Engine Integration**: Direct python engine binding for YOLO ONNX text detection and multi-provider translations.
- **Asynchronous Translation Queue**: Background worker execution using UUID job tracking.
- **Multi-format Support**: Process single images (`PNG`, `JPG`, `WEBP`), PDFs, and archives (`ZIP`, `CBZ`, `RAR`, `CBR`).
- **RESTful Endpoints**: Unified API contract for health, engine metadata, translation job submittal, status polling, and download retrieval.

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes.py         # REST API endpoints & route definitions
│   ├── services/
│   │   └── cypy_service.py   # Core CYPY engine integration & job manager
│   ├── config.py             # BaseSettings configuration
│   └── main.py               # FastAPI main application entry point
├── storage/                  # Local storage for uploads and outputs
│   ├── uploads/
│   └── output/
├── .env.example              # Environment variables template
├── Dockerfile                # Production Docker container setup
├── docker-compose.yml        # Local development compose configuration
└── requirements.txt          # Python dependencies
```

## Setup & Running

### 1. Local Environment

```bash
# Navigate to project root
cd /path/to/cypy-web

# Install dependencies
pip install -r backend/requirements.txt

# Run Uvicorn server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Docker Setup

```bash
cd backend
docker-compose up --build
```

## API Documentation

Interactive Swagger documentation is auto-generated and available at:
`http://localhost:8000/docs`

### API Route Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service and CYPY engine status |
| `GET` | `/api/v1/engine` | Engine capabilities & translation providers |
| `POST` | `/api/v1/translate/image` | Submit single image translation job |
| `POST` | `/api/v1/translate/pdf` | Submit PDF translation job |
| `POST` | `/api/v1/translate/archive` | Submit ZIP/CBZ archive translation job |
| `GET` | `/api/v1/job/{job_id}` | Poll translation job status & progress |
| `GET` | `/api/v1/download/{job_id}` | Download translated output file |
