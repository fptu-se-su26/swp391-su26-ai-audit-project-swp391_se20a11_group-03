$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "==> Freeing port 8096..."
& "$PSScriptRoot\free-port.ps1" -Port 8096
if ($LASTEXITCODE -ne 0) {
    Write-Host "Could not free port 8096. Stop the old backend manually and retry."
    exit 1
}

Write-Host "==> Starting Spring Boot on port 8096..."
Set-Location $Root
mvn spring-boot:run -DskipTests
