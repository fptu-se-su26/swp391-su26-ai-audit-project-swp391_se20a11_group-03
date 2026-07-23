[CmdletBinding(SupportsShouldProcess)]
param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8096
)

$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listeners) {
    Write-Host "Port $Port is available."
    exit 0
}

$processIds = $listeners.OwningProcess | Sort-Object -Unique
foreach ($processId in $processIds) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$processId" -ErrorAction Stop
    $isAuctionBackend =
        $processInfo.Name -eq "java.exe" -and
        $processInfo.CommandLine -match "com\.auction\.AuctionApplication"

    if (-not $isAuctionBackend) {
        throw "Port $Port is used by PID $processId ($($processInfo.Name)), not AuctionApplication. Stop it manually or choose another port."
    }

    if ($PSCmdlet.ShouldProcess("AuctionApplication PID $processId", "Stop process listening on port $Port")) {
        Stop-Process -Id $processId -ErrorAction Stop
        Wait-Process -Id $processId -Timeout 10 -ErrorAction SilentlyContinue
        Write-Host "Stopped previous AuctionApplication PID $processId on port $Port."
    }
}
