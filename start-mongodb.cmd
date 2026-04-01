@echo off
cd /d "%~dp0"
where docker >nul 2>&1
if errorlevel 1 (
  echo [Talé] Docker not found. Install Docker Desktop from https://docs.docker.com/desktop/install/windows-installer/
  echo Or install MongoDB Community Server and start the "MongoDB" Windows service.
  pause
  exit /b 1
)
echo Starting MongoDB on 127.0.0.1:27017 ...
docker compose up -d
docker compose ps
echo.
echo When status is "running", start the API: cd backend ^&^& npm.cmd run dev
pause
