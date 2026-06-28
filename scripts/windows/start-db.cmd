@echo off
setlocal
cd /d "%~dp0\..\.."
docker compose -f docker-compose.postgres.yml up -d
docker compose -f docker-compose.postgres.yml ps

