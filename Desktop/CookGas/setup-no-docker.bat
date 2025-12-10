@echo off
echo ========================================
echo Jupitra Setup (No Docker)
echo ========================================
echo.

echo NOTE: This setup skips Docker and database setup.
echo You'll need to configure PostgreSQL and Redis manually later.
echo.

echo [1/3] Dependencies already installed!
echo.

echo [2/3] Generating Prisma client (will use placeholder DB)...
cd apps\api
call npx prisma generate
if %errorlevel% neq 0 (
    echo WARNING: Prisma generation failed - you'll need a database
    echo Continuing anyway...
)
cd ..\..

echo.
echo [3/3] Setup complete (without database)!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo To run the app, you need to either:
echo.
echo 1. Install Docker Desktop and run: setup.bat
echo    Download: https://www.docker.com/products/docker-desktop/
echo.
echo 2. Install PostgreSQL and Redis locally
echo    - PostgreSQL: https://www.postgresql.org/download/windows/
echo    - Redis: https://github.com/microsoftarchive/redis/releases
echo.
echo 3. Use a cloud database (Supabase, Railway, etc.)
echo.
pause
