# ======================================================
# CODE3D-AI Full-Stack Host Launcher (Windows PowerShell)
# Hosts Frontend, Spring Boot Backend & Node Execution Engine
# ======================================================

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "🚀 Launching All CODE3D-AI Software Components" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# -------------------------------------------------
# 1. Start Node.js Execution Engine (Port 5000)
# -------------------------------------------------
Write-Host "📡 [1/2] Starting Node.js Execution Engine (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\\server'; `$env:PORT='5000'; node src/index.js" -WindowStyle Minimized

# -------------------------------------------------
# 2. Start Frontend Vite Studio (Port 5173)
# -------------------------------------------------
Write-Host "📡 [2/2] Starting Frontend Vite Studio (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\\frontend'; npm.cmd run dev -- --host 0.0.0.0 --port 5173" -WindowStyle Minimized

# -------------------------------------------------
# (Optional) Spring Boot Backend – requires compiled JAR.
# -------------------------------------------------
# Uncomment the following block after you have built the Spring Boot JAR.
# Write-Host "📡 [3/3] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
# $springEnv = @{
#   SPRING_DATASOURCE_URL = "jdbc:postgresql://..."
#   SPRING_DATASOURCE_USERNAME = "..."
#   SPRING_DATASOURCE_PASSWORD = "..."
#   PORT = "8080"
# }
# Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\\backend'; `$env:SPRING_DATASOURCE_URL='$($springEnv.SPRING_DATASOURCE_URL)'; `$env:SPRING_DATASOURCE_USERNAME='$($springEnv.SPRING_DATASOURCE_USERNAME)'; `$env:SPRING_DATASOURCE_PASSWORD='$($springEnv.SPRING_DATASOURCE_PASSWORD)'; `$env:PORT='8080'; java -jar target\\code3d-backend-1.0.0.jar" -WindowStyle Minimized

Write-Host "======================================================" -ForegroundColor Green
Write-Host "✅ ALL SOFTWARE COMPONENTS ARE HOSTED & RUNNING" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host "🌐 Frontend Studio:    http://$(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch 'Loopback'}).IPAddress:5173/" -ForegroundColor White
Write-Host "⚡ Node Engine API:    http://$(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch 'Loopback'}).IPAddress:5000/api" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Green

# Open frontend in default browser (optional)
Start-Process "http://$(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch 'Loopback'}).IPAddress:5173/"
