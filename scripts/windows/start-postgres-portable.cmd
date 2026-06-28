@echo off
setlocal

set "ROOT=C:\Git\ARC"
set "PG_BIN=%ROOT%\tools\pgsql\bin"
set "PG_DATA=%ROOT%\tools\pgdata"
set "PG_LOG=%ROOT%\tools\pgdata\postgres.log"

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%PG_BIN%\postgres.exe' -ArgumentList '-D','%PG_DATA%','-p','5432' -RedirectStandardOutput '%PG_LOG%' -RedirectStandardError '%PG_LOG%.err' -WindowStyle Hidden"
