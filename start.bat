@echo off
echo Starting Adaptive Learning Platform...
echo.

echo Starting backend server...
start "Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && python -m app.main"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Backend running at http://localhost:8000
echo Frontend running at http://localhost:3000
echo.
pause