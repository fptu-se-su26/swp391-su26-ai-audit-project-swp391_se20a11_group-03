$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Frontend = Join-Path $Root "src\frontend"

Write-Host "==> Freeing port 3000..."
& "$PSScriptRoot\free-port.ps1" -Port 3000
if ($LASTEXITCODE -ne 0) {
    Write-Host "Could not free port 3000. Close other Node/Next.js windows and retry."
    exit 1
}

if (-not (Test-Path (Join-Path $Frontend "node_modules"))) {
    Write-Host "==> Installing frontend dependencies (first run)..."
    Set-Location $Frontend
    npm install
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "==> Starting Next.js at http://localhost:3000 ..."
Write-Host "    Press Ctrl+C to stop."
Set-Location $Frontend
npm run dev
