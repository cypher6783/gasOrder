@echo off
echo Updating .env file with port 5434...
(
echo # Database
echo DATABASE_URL="postgresql://postgres:asphalt6@localhost:5434/jupitra_db"
echo.
echo # Redis
echo REDIS_URL="redis://localhost:6379"
echo.
echo # JWT
echo JWT_SECRET="your-super-secret-jwt-key-change-in-production"
echo JWT_EXPIRES_IN="7d"
echo JWT_REFRESH_EXPIRES_IN="30d"
echo.
echo # Server
echo PORT=4000
echo NODE_ENV=development
echo.
echo # CORS
echo ALLOWED_ORIGINS="http://localhost:3000"
echo.
echo # File Upload
echo MAX_FILE_SIZE=5242880
echo UPLOAD_DIR="./uploads"
echo.
echo # Payment Gateway ^(Paystack^)
echo PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key"
echo PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key"
echo.
echo # Email Service
echo SMTP_HOST="smtp.gmail.com"
echo SMTP_PORT=587
echo SMTP_USER="your-email@gmail.com"
echo SMTP_PASS="your-app-password"
echo FROM_EMAIL="noreply@jupitra.com"
) > .env
echo .env file updated successfully!
type .env | findstr DATABASE_URL
pause
