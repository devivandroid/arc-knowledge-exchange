@echo off
setlocal

set "ROOT=%~dp0..\.."
set "NODE_HOME=C:\Git\IA\tools\node"
set "PORT=%~1"

if "%PORT%"=="" set "PORT=3000"
set "PATH=%NODE_HOME%;%PATH%"
set "NEXT_DIST_DIR=.next-local"

pushd "%ROOT%" >nul

if not exist "%NODE_HOME%\npm.cmd" (
  echo Portable npm was not found at %NODE_HOME%\npm.cmd
  exit /b 1
)

echo Starting KX on http://127.0.0.1:%PORT%
echo Logs: %ROOT%\dev-server-%PORT%.out.log
echo Next dist dir: %NEXT_DIST_DIR%
start "KX Dev Server" /min cmd /c ""%NODE_HOME%\npm.cmd" run dev -- -p %PORT% -H 127.0.0.1 > "%ROOT%\dev-server-%PORT%.out.log" 2> "%ROOT%\dev-server-%PORT%.err.log""

popd >nul
endlocal
