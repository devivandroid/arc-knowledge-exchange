@echo off
setlocal enabledelayedexpansion

set "PORTS=%*"
if "%PORTS%"=="" set "PORTS=3000 3001 3002"

for %%P in (%PORTS%) do (
  echo Looking for KX server on port %%P...
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
    echo Stopping process %%A on port %%P...
    taskkill /PID %%A /T /F >nul 2>nul
  )
)

echo Done.
endlocal
