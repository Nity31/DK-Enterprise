@echo off
echo Starting Hydraulic Machinery Billing System...
echo ==============================================

start "Hydraulic Billing Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 2 >nul
start "Hydraulic Billing Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 >nul

echo Opening browser at http://localhost:5173
start http://localhost:5173
