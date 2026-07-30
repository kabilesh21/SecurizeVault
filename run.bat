@echo off
title MemoryVerse Startup Portal
echo ==============================================================
echo            Starting MemoryVerse AI Full-Stack System          
echo ==============================================================
echo.

echo [1/3] Launching Python FastAPI AI Service...
start "MemoryVerse AI Service" cmd /k "cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Launching Spring Boot Backend API...
start "MemoryVerse Spring Boot Backend" cmd /k "cd backend && mvn spring-boot:run"

echo [3/3] Launching React Frontend Dev Server...
start "MemoryVerse React Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ==============================================================
echo Services have been spawned in separate Command Prompt windows.
echo  - AI Service:   http://localhost:8000
echo  - Backend API:  http://localhost:8080
echo  - Frontend:     http://localhost:5173
echo ==============================================================
pause
