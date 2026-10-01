@echo off
:: Batch script to setup custom local domain names (http://dkenterprise or http://dkenterprise.com)
:: Requires Administrator privileges to update Windows hosts file and port forwarding

net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin
) else (
    echo Requesting Administrator permissions...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:admin
echo =========================================================
echo   Setting up Custom Local Domain for DK Enterprise
echo =========================================================
echo.

:: Add hosts file entries
findstr /C:"127.0.0.1 dkenterprise" %WINDIR%\System32\drivers\etc\hosts >nul
if %errorLevel% neq 0 (
    echo Adding 127.0.0.1 dkenterprise to hosts file...
    echo. >> %WINDIR%\System32\drivers\etc\hosts
    echo 127.0.0.1    dkenterprise >> %WINDIR%\System32\drivers\etc\hosts
    echo 127.0.0.1    dkenterprise.local >> %WINDIR%\System32\drivers\etc\hosts
    echo 127.0.0.1    dkenterprise.com >> %WINDIR%\System32\drivers\etc\hosts
    echo [OK] Added domain mappings to hosts file.
) else (
    echo [OK] Hosts file already contains custom domain entries.
)

:: Setup Port Forwarding from Port 80 -> Port 5000 so users don't need :5000
echo.
echo Setting up Port 80 forwarding to Port 5000...
netsh interface portproxy add v4tov4 listenport=80 listenaddress=127.0.0.1 connectport=5000 connectaddress=127.0.0.1 >nul 2>&1
echo [OK] Port 80 forwarding configured successfully!

echo.
echo =========================================================
echo   SUCCESS! Custom URLs are now active on your PC:
echo   - http://dkenterprise
echo   - http://dkenterprise.com
echo   - http://dkenterprise.local
echo =========================================================
echo.
pause
