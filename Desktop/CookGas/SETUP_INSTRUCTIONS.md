# Jupitra - Setup Instructions

## PowerShell Execution Policy Issue

You're encountering a PowerShell execution policy restriction. Here are **3 solutions**:

### ✅ Solution 1: Use Batch Scripts (Recommended)

I've created helper scripts for you:

1. **Run setup**: Double-click `setup.bat` in the project folder
2. **Start dev servers**: Double-click `start-dev.bat`

### ✅ Solution 2: Use Command Prompt (cmd.exe)

Instead of PowerShell, use Command Prompt:

1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to project: `cd C:\Users\ISAIAH\Desktop\CookGas`
4. Run commands:
   ```cmd
   npm install
   docker-compose up postgres redis -d
   cd apps\api
   npx prisma generate
   npx prisma migrate dev --name init
   cd ..\..
   npm run dev
   ```

### ✅ Solution 3: Fix PowerShell Policy (One-time)

Open PowerShell **as Administrator** and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then you can run npm commands normally in PowerShell.

---

## Manual Setup Steps

If you prefer to run commands manually:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Docker Services
Make sure Docker Desktop is running, then:
```bash
docker-compose up postgres redis -d
```

### 3. Setup Database
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

### 4. Start Development Servers
```bash
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

---

## Troubleshooting

### Docker Not Running
If you get Docker errors:
1. Open Docker Desktop
2. Wait for it to fully start
3. Try the setup again

### Port Already in Use
If ports 3000, 4000, 5432, or 6379 are in use:
```bash
# Stop existing Docker containers
docker-compose down

# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :4000
```

### Database Connection Issues
```bash
# Restart Docker services
docker-compose restart postgres redis

# Check service health
docker-compose ps
```

---

## Next Steps After Setup

1. **Test the Application**
   - Visit http://localhost:3000
   - Click "Get Started" to register
   - Try creating a customer account
   - Test the login flow

2. **Explore the API**
   - Visit http://localhost:4000/health
   - Check API endpoints in the walkthrough document

3. **Continue Development**
   - Implement vendor onboarding
   - Build product management
   - Add geospatial search
