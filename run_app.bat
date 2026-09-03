@echo off
setlocal enabledelayedexpansion

:: Check if port 5000 is already active
netstat -o -n -a | findstr ":5000 " >nul 2>&1
if %ERRORLEVEL% == 0 (
    start http://localhost:5000
    exit /b 0
)

:: Start backend server quietly
cd /d "%~dp0backend"
start /b node src/server.js >nul 2>&1

:: Wait 2 seconds for server boot
timeout /t 2 /nobreak >nul

:: Start Cloudflare .com Mobile Tunnel quietly
cd /d "%~dp0"
start /b cloudflared.exe tunnel --url http://localhost:5000 >nul 2>&1

:: Open browser
start http://localhost:5000
exit /b 0
