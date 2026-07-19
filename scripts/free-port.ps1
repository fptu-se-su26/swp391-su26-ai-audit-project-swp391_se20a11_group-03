param(
    [Parameter(Mandatory = $false)]
    [int]$Port = 8096
)

$ErrorActionPreference = "SilentlyContinue"

function Get-ListeningPids([int]$TargetPort) {
    $pids = @()
    $pattern = ":$TargetPort\s"
    netstat -ano | Select-String $pattern | Select-String "LISTENING" | ForEach-Object {
        $parts = ($_.Line -replace '\s+', ' ').Trim().Split(' ')
        $processId = $parts[-1]
        if ($processId -match '^\d+$' -and [int]$processId -gt 0) {
            $pids += [int]$processId
        }
    }
    return $pids | Select-Object -Unique
}

$targetPids = Get-ListeningPids -TargetPort $Port
if (-not $targetPids -or $targetPids.Count -eq 0) {
    Write-Host "Port $Port is free."
    exit 0
}

foreach ($processId in $targetPids) {
    $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
    $name = if ($proc) { $proc.ProcessName } else { "unknown" }
    Write-Host "Stopping $name (PID $processId) on port $Port..."
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Milliseconds 500
$remaining = Get-ListeningPids -TargetPort $Port
if ($remaining -and $remaining.Count -gt 0) {
    Write-Host "Warning: port $Port may still be in use (PIDs: $($remaining -join ', '))."
    exit 1
}

Write-Host "Port $Port is now free."
exit 0
