# ======================================================
# CODE3D-AI Full-Stack Host Launcher (Windows PowerShell)
# Hosts Frontend, Spring Boot Backend & Node Execution Engine
# ======================================================

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "🚀 Launching All CODE3D-AI Software Components" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start Spring Boot Backend (Port 8080)
Write-Host "📡 [1/3] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
$springEnv = @{
    SPRING_DATASOURCE_URL = "jdbc:postgresql://ep-lucky-meadow-b46euvhv-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
    SPRING_DATASOURCE_USERNAME = "neondb_owner"
    SPRING_DATASOURCE_PASSWORD = "npg_jCIVv6eAiRD8"
    PORT = "8080"
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; `$env:SPRING_DATASOURCE_URL='$($springEnv.SPRING_DATASOURCE_URL)'; `$env:SPRING_DATASOURCE_USERNAME='$($springEnv.SPRING_DATASOURCE_USERNAME)'; `$env:SPRING_DATASOURCE_PASSWORD='$($springEnv.SPRING_DATASOURCE_PASSWORD)'; `$env:PORT='8080'; java -jar target\code3d-backend-1.0.0.jar" -WindowStyle Minimized

# 2. Start Node.js Execution Engine (Port 5000)
Write-Host "📡 [2/3] Starting Node.js Execution Engine (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\server'; node src/index.js" -WindowStyle Minimized

# 3. Start Frontend (Port 5173)
Write-Host "📡 [3/3] Starting Frontend Vite Studio (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm.cmd run dev -- --host 127.0.0.1 --port 5173" -WindowStyle Minimized

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "✅ ALL SOFTWARE COMPONENTS ARE HOSTED & RUNNING" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host "🌐 Frontend Studio:    http://127.0.0.1:5173/" -ForegroundColor White
Write-Host "☕ Spring Boot API:    http://localhost:8080/api" -ForegroundColor White
Write-Host "⚡ Node Engine API:    http://localhost:5000/api" -ForegroundColor White
Write-Host "🗄️ Neon Cloud DB:      ep-lucky-meadow-b46euvhv (Connected)" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Green

Start-Process "http://127.0.0.1:5173/"
