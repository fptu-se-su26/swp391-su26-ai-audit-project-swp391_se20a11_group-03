$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot

Write-Host "==> Launching backend (port 8096) and frontend (port 3000) in new windows..."
Write-Host ""

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", (Join-Path $ScriptDir "start-backend.ps1")
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", (Join-Path $ScriptDir "start-frontend.ps1")
)

Write-Host "Done. Wait until both windows show 'Ready' / 'Started', then open:"
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:8096"
