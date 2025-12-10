@echo off
echo ========================================
echo Jupitra Setup Script
echo ========================================
echo.

echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Starting Docker services (PostgreSQL + Redis)...
docker-compose up postgres redis -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker services
    echo Make sure Docker Desktop is running
    pause
    exit /b 1
)

echo.
echo [3/5] Waiting for database to be ready...
timeout /t 10 /nobreak

echo.
echo [4/6] Setting up environment variables...
cd apps\api
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo IMPORTANT: Please update .env with your actual configuration values
) else (
    echo .env file already exists, skipping...
)

echo.
echo [5/6] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    cd ..\..
    pause
    exit /b 1
)

echo.
echo [6/6] Running database migrations...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations
    cd ..\..
    pause
    exit /b 1
)

cd ..\..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the development servers, run:
echo   npm run dev
echo.
echo The application will be available at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo.
pause
