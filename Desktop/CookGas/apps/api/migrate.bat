@echo off
echo Running Prisma migrations...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ERROR: Migration failed
    pause
    exit /b 1
)
echo Migration completed successfully!
pause
