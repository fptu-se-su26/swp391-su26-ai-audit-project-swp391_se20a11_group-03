$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "==> Freeing port 8096..."
& "$PSScriptRoot\free-port.ps1" -Port 8096
if ($LASTEXITCODE -ne 0) {
    Write-Host "Could not free port 8096. Stop the old backend manually and retry."
    exit 1
}

$env:GOOGLE_CLIENT_ID = "875351769621-msohqgodeum8d07j56n9hiv76c161d3e.apps.googleusercontent.com"
# Gemini key: set in src/main/resources/application-local.properties (gitignored)

Write-Host "==> Starting Spring Boot on port 8096..."
Set-Location $Root
mvn spring-boot:run -DskipTests
