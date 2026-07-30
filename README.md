# MemoryVerse AI - Your Digital Identity, Powered by AI

MemoryVerse AI is a complete full-stack Digital Identity System that intelligently stores, understands, organizes, connects, and retrieves a student's academic and professional journey.

This is the code repository containing **Module 1: AI Data Ingestion** completed and fully integrated.

---

## Technical Stack

- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion + Chart.js + React Icons + Axios + React Router
- **Backend**: Spring Boot + Java 17 + Spring Data JPA + Spring Security + JWT Authentication + MySQL
- **AI Service**: Python + FastAPI
- **Database**: MySQL 8.0
- **Containerization**: Docker Compose

---

## Directory Structure

```text
/
├── frontend/             # React single page application (Port 5173)
├── backend/              # Spring Boot REST API (Port 8080)
├── ai-service/           # FastAPI mock AI integration service (Port 8000)
├── database/             # Database initialization schemas (schema.sql)
├── docker-compose.yml    # Development containers setup
└── README.md             # Setup guide (This file)
```

---

## Module 1 Ingestion Features

1. **Authentication**: Sign-in, Register, and Forgot Password screens powered by JWT tokens.
2. **Upload Center**: Modern drag-and-drop uploader supporting PDF, DOCX, and images with real-time individual progress bars and replace functionality.
3. **External Platform Linking**: Submit validated Portfolio and GitHub Repositories links stored separately.
4. **Document Previews**: Clean Modal dialog rendering PDFs or previewing images alongside mock OCR texts and classified category status tags.
5. **Ingestion Pipelines**: Spring Boot integrates with FastAPI to fetch raw OCR texts, extract category tags, and trigger mock embeddings.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Java JDK 17
- Python 3.9+
- MySQL Server

### 1. Database Setup
Run the initialization scripts inside MySQL to create the database:
```sql
SOURCE database/schema.sql;
```

### 2. Run the AI Service (FastAPI)
Navigate to `/ai-service`:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Swagger UI will be available at `http://localhost:8000/docs`.

### 3. Run the Backend API (Spring Boot)
Navigate to `/backend`:
- Make sure to update the database credentials in `src/main/resources/application.properties` if needed.
- Build and run:
```bash
./mvnw spring-boot:run
```

### 4. Run the Frontend (React + Vite)
Navigate to `/frontend`:
```bash
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Docker Compose Quickstart

To run the whole system in a multi-container environment:
```bash
docker-compose up -d --build
```
This builds and launches the frontend, backend, database (loaded with schema), and Python microservice automatically.
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Python AI Service: `http://localhost:8000`
