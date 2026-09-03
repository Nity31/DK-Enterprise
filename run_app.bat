@echo off
setlocal enabledelayedexpansion

:: Check if port 5000 is already active
netstat -o -n -a | findstr ":5000 " >nul 2>&1
if %ERRORLEVEL% == 0 (
    :: Port 5000 is already running! Simply open browser quietly without duplicate server launch
    start http://localhost:5000
    exit /b 0
)

:: Otherwise start the backend server quietly
cd /d "%~dp0backend"
start /b node src/server.js >nul 2>&1

:: Wait 2 seconds for server boot
timeout /t 2 /nobreak >nul

:: Open browser
start http://localhost:5000
exit /b 0
