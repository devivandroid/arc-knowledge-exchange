@echo off
setlocal

set "PORT=%~1"
if "%PORT%"=="" set "PORT=3000"

call "%~dp0stop-site.cmd" %PORT%
call "%~dp0start-site.cmd" %PORT%

endlocal
