@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Process postgres -ErrorAction SilentlyContinue | Where-Object { $_.Path -like 'C:\Git\ARC\tools\pgsql\bin\postgres.exe' } | Stop-Process -Force -ErrorAction SilentlyContinue"
