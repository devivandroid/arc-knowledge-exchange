@echo off
setlocal

set "ROOT=%~dp0..\.."
set "NODE_HOME=C:\Git\IA\tools\node"
set "PORT=%~1"

if "%PORT%"=="" set "PORT=3000"
set "PATH=%NODE_HOME%;%PATH%"
set "HOSTNAME=127.0.0.1"
set "PORT=%PORT%"

pushd "%ROOT%" >nul

if not exist "%NODE_HOME%\node.exe" (
  echo Portable node was not found at %NODE_HOME%\node.exe
  exit /b 1
)

if not exist ".next\standalone\server.js" (
  echo Standalone build was not found. Run a successful build first.
  exit /b 1
)

echo Starting Knowledge Exchange production server on http://127.0.0.1:%PORT%
echo Logs: %ROOT%\prod-server-%PORT%.out.log
start "Knowledge Exchange Production Server" /min cmd /c ""%NODE_HOME%\node.exe" ".next\standalone\server.js" > "%ROOT%\prod-server-%PORT%.out.log" 2> "%ROOT%\prod-server-%PORT%.err.log""

popd >nul
endlocal
