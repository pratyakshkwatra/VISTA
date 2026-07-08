# TECH_STACK.md

# VISTA

### Visual Intelligence for Spatial Toxicity Assessment

Version: 1.0

---

# Engineering Philosophy

VISTA shall be built as a production-grade platform rather than a hackathon prototype. Every engineering decision must prioritize modularity, scalability, maintainability, and extensibility.

The system must follow an API-first architecture with clearly separated frontend, backend, AI, geospatial, and data processing services.

---

# Core Technology Stack

## Frontend

Framework

* Next.js 15 (App Router)

Language

* TypeScript

Styling

* Tailwind CSS

Component Library

* shadcn/ui

Icons

* Lucide Icons

Animations

* Framer Motion

Charts

* Recharts

Maps

* Mapbox GL JS

Geospatial Visualization

* deck.gl

State Management

* Zustand

Server State

* TanStack Query

Forms

* React Hook Form

Validation

* Zod

HTTP Client

* Axios

---

# Backend

Framework

* FastAPI

Language

* Python 3.12+

Authentication

* JWT

Authorization

* Role-Based Access Control

Validation

* Pydantic v2

ORM

* SQLAlchemy 2.0

Database Migrations

* Alembic

API Documentation

* OpenAPI / Swagger

Background Jobs

* Celery

Message Broker

* Redis

Streaming/Event Pipeline

* Kafka

---

# Database

Primary Database

PostgreSQL 16

Spatial Extension

PostGIS

Caching

Redis

Vector Database (Future)

pgvector

Object Storage

MinIO (development)

S3 Compatible Storage (production)

---

# AI / Machine Learning

## Computer Vision

Smoke Detection

YOLO

Scene Understanding

Florence-2

Segmentation

SAM2

Image Embeddings

CLIP

---

## Forecasting

Initial MVP

* XGBoost

Advanced

* Temporal Fusion Transformer

Future

* Graph Neural Networks

---

## Clustering

Hotspot Detection

* ST-DBSCAN

Alternative

* HDBSCAN

---

## Explainability

SHAP

Feature Attribution

LLM Generated Reasoning

---

# Geospatial Stack

Spatial Database

PostGIS

Python Libraries

GeoPandas

Shapely

Rasterio

GDAL

Grid Indexing

Uber H3

Coordinate System

WGS84

Geometry Types

* Point
* Polygon
* MultiPolygon
* LineString

---

# External Data Sources

Environmental Sensors

* CPCB
* OpenAQ

Weather

* Open-Meteo
* IMD (Future)

Maps

* OpenStreetMap

Geocoding

* Nominatim

Population

* Census datasets
* WorldPop (optional)

Satellite Context

* Sentinel-2
* Landsat
* Google Earth Engine (historical/contextual)

---

# AI Assistant

Primary Model

* GPT-5.5 (or configurable LLM)

Responsibilities

* Explain hotspot reasoning
* Summarize incidents
* Generate reports
* Answer natural language queries
* Recommend interventions

The assistant must never fabricate environmental measurements. It should ground every response in available platform data.

---

# Repository Structure

```text
vista/

├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   ├── lib/
│   ├── services/
│   └── types/
│
├── backend/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── workers/
│   ├── ai/
│   ├── geo/
│   └── utils/
│
├── ml/
│   ├── training/
│   ├── inference/
│   ├── datasets/
│   ├── notebooks/
│   └── models/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── scripts/
│   └── monitoring/
│
├── docs/
├── shared/
└── docker-compose.yml
```

---

# Backend Architecture

The backend shall follow a layered architecture.

Controller

↓

Service

↓

Repository

↓

Database

Business logic must never exist inside API routes.

---

# Frontend Architecture

Feature-first organization.

Example

components/

* dashboard/
* map/
* heatmap/
* ai/
* prediction/
* timeline/

Reusable UI components should remain independent of business logic.

---

# API Design Principles

REST-first

Consistent endpoint naming

Versioned APIs

/api/v1/

Standard response format

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Consistent error responses.

Pagination for all large datasets.

Filtering supported everywhere.

---

# Event Pipeline

Citizen Upload

↓

Kafka Event

↓

AI Image Analysis

↓

Hotspot Detection

↓

Prediction Engine

↓

Database Update

↓

Dashboard Refresh

This architecture allows asynchronous processing and future scalability.

---

# Caching Strategy

Redis shall cache

* Dashboard statistics
* Frequently requested heatmaps
* Weather data
* Prediction results
* Administrative boundaries

---

# Security

Mandatory

* HTTPS
* JWT Authentication
* Password Hashing
* Input Validation
* File Validation
* Image Size Limits
* API Rate Limiting
* CORS Protection
* SQL Injection Protection
* XSS Protection

---

# Image Processing Pipeline

Upload

↓

Validation

↓

Virus Scan (Future)

↓

Metadata Extraction

↓

AI Detection

↓

Segmentation

↓

Classification

↓

Store Results

↓

Generate Hotspot Event

---

# Logging

Structured JSON Logs

Log Levels

* INFO
* WARNING
* ERROR
* CRITICAL

Never log

* Passwords
* Tokens
* Personal Information

---

# Monitoring

Health Checks

Service Status

API Latency

Database Status

Redis Status

Kafka Status

Background Workers

Prediction Pipeline

---

# Testing

Frontend

* Vitest
* Playwright

Backend

* Pytest

Coverage Target

Minimum 80%

Critical services must include integration tests.

---

# Docker Requirements

Every service must run independently.

Services

* frontend
* backend
* postgres
* postgis
* redis
* kafka
* zookeeper
* minio
* nginx

Development must be executable using a single command.

```bash
docker compose up
```

---

# CI/CD

GitHub Actions

Pipeline

Lint

↓

Test

↓

Build

↓

Docker Image

↓

Deploy

Every pull request must pass automated checks.

---

# Coding Standards

Frontend

* ESLint
* Prettier

Backend

* Ruff
* Black
* isort

Type checking is mandatory.

Meaningful variable names only.

No duplicated business logic.

No hardcoded secrets.

Configuration through environment variables.

---

# Environment Variables

Frontend

* API URL
* Mapbox Token

Backend

* Database URL
* Redis URL
* Kafka URL
* JWT Secret
* Object Storage Keys
* AI Model Configuration

Secrets must never be committed to Git.

---

# Performance Targets

Dashboard Initial Load

< 3 seconds

Map Interaction

< 100 ms

Prediction API

< 5 seconds

Heatmap Rendering

Smooth at 60 FPS where possible

Concurrent Users

Scalable to at least 500 simultaneous dashboard users

---

# Future Scalability

The architecture should support

* Additional cities
* Multiple countries
* Water pollution monitoring
* Noise pollution monitoring
* IoT sensor integration
* Drone imagery
* CCTV analytics
* Edge AI deployments
* Mobile applications
* Digital twin simulations

No major architectural changes should be required to support these future capabilities.

---

# Non-Negotiable Engineering Principles

* Every service must be independently deployable.
* Every module must expose clear interfaces.
* All APIs must be documented automatically.
* Every AI prediction must include a confidence score and supporting evidence.
* Geospatial operations must use PostGIS and H3 rather than custom implementations.
* Long-running AI tasks must execute asynchronously.
* The UI must remain responsive even while AI processing is in progress.
* Every visualization should be interactive, performant, and accessible.
* Prefer open standards and open-source tooling wherever practical.
* Build for extensibility first, optimization second, and shortcuts never.
