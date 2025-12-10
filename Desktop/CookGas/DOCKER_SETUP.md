# Docker Desktop Installation Guide

## Step-by-Step Installation

### 1️⃣ Download Docker Desktop

**I've opened the download page for you in your browser.**

- Click the **"Download for Windows"** button
- The installer file will be named: `Docker Desktop Installer.exe` (~500MB)
- Save it to your Downloads folder

### 2️⃣ Run the Installer

1. **Locate the downloaded file** in your Downloads folder
2. **Double-click** `Docker Desktop Installer.exe`
3. **Allow administrator access** when prompted (UAC dialog)

### 3️⃣ Installation Options

When the installer starts:

✅ **Check these options:**
- ✅ Use WSL 2 instead of Hyper-V (recommended)
- ✅ Add shortcut to desktop

Click **"OK"** to begin installation.

### 4️⃣ Wait for Installation

- Installation takes **3-5 minutes**
- You'll see progress bars for:
  - Unpacking files
  - Installing Docker Engine
  - Configuring WSL 2

### 5️⃣ Restart Your Computer

- The installer will prompt you to **restart**
- Click **"Close and restart"**
- **Save your work first!**

### 6️⃣ After Restart

1. **Docker Desktop will auto-start** (or find it in Start menu)
2. **Accept the service agreement** if prompted
3. **Wait for Docker to start** - you'll see:
   - "Docker Desktop is starting..."
   - Then: "Docker Desktop is running" ✅

**Look for the whale icon** in your system tray (bottom-right):
- 🐳 **Animated** = Starting
- 🐳 **Static** = Running ✅

### 7️⃣ Verify Installation

Open Command Prompt and run:
```cmd
docker --version
docker-compose --version
```

You should see version numbers like:
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

## ⏱️ Timeline

- **Download**: 2-5 minutes (depends on internet speed)
- **Installation**: 3-5 minutes
- **Restart**: 2 minutes
- **First startup**: 1-2 minutes
- **Total**: ~15 minutes

---

## 🔧 Troubleshooting

### "WSL 2 installation is incomplete"

If you see this error:
1. Click the link in the error message
2. Download and install the WSL 2 kernel update
3. Restart Docker Desktop

### "Hardware assisted virtualization is not enabled"

You need to enable virtualization in BIOS:
1. Restart computer
2. Enter BIOS (usually F2, F10, or Del during startup)
3. Find "Virtualization Technology" or "VT-x"
4. Enable it
5. Save and exit

### Docker won't start

1. Open Docker Desktop
2. Click the gear icon (Settings)
3. Go to "Resources" → "WSL Integration"
4. Enable integration with your distro
5. Click "Apply & Restart"

---

## ✅ After Docker is Running

Once you see the whale icon is static (not animated):

1. **Go back to your project folder**
2. **Run the setup script again:**
   ```cmd
   cd C:\Users\ISAIAH\Desktop\CookGas
   setup.bat
   ```

This time it will:
- ✅ Skip dependency installation (already done)
- ✅ Start PostgreSQL and Redis containers
- ✅ Run database migrations
- ✅ Set up everything automatically

---

## 📞 Need Help?

Let me know if you encounter:
- ❌ Download issues
- ❌ Installation errors
- ❌ Startup problems
- ❌ Any other issues

I'll help you troubleshoot! 🚀

---

## 🎯 What Happens Next

After Docker is installed and running:
1. Run `setup.bat` again
2. Wait ~30 seconds for database setup
3. Run `start-dev.bat` to launch the app
4. Visit http://localhost:3000
5. Start building! 🎉
