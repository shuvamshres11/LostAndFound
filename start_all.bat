@echo off
echo ==================================================
echo   Starting Lost & Found Tracker Ecosystem
echo ==================================================

echo.
echo [1/3] Starting AI Service (Port 8000)...
start "AI Microservice" cmd /k "cd ai_service && python -m uvicorn app:app --port 8000 --reload"

echo [2/3] Starting Node Backend Server (Port 5000)...
start "Node Backend" cmd /k "cd server && node server.js"

echo [3/3] Starting React Frontend (Port 5173)...
start "React Frontend" cmd /k "cd client && npm run dev"

echo.
echo All services have been launched in separate windows!
echo You can now close this window safely.
exit
