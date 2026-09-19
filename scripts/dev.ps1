# VisionGuard Local Dev Launcher for Windows
$env:Path = "C:\Windows\System32;$env:Path"

Write-Host "============================================================"
Write-Host "VISIONGUARD PLATFORM STARTING..."
Write-Host "Backend:  http://localhost:5001"
Write-Host "Frontend: http://localhost:5173"
Write-Host "============================================================"

npm run dev
