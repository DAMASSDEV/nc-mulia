# NC MULIA Production Protection Hook
# Blocks dangerous commands when Release Gate is not READY_FOR_PRODUCTION_APPROVAL
# Requires: PowerShell

param(
    [string]$Command,
    [string]$Args
)

$releaseGatePath = Join-Path $PSScriptRoot "..\..\docs\workflow\RELEASE_GATE.md"

function Get-ReleaseStatus {
    if (Test-Path $releaseGatePath) {
        $content = Get-Content $releaseGatePath -Raw
        if ($content -match "STATUS:\s*READY_FOR_PRODUCTION_APPROVAL") {
            return "READY"
        }
    }
    return "NOT_READY"
}

function Test-BlockedCommand {
    param([string]$Cmd, [string]$Arguments)

    $fullCommand = "$Cmd $Arguments"

    # Patterns that indicate production-destructive operations
    $blockedPatterns = @(
        "vercel.*--prod",
        "vercel.*deploy.*prod",
        "prisma migrate reset",
        "prisma db push.*--force",
        "git push.*--force",
        "git reset.*--hard",
        "taskkill.*node\.exe.*/F"
    )

    foreach ($pattern in $blockedPatterns) {
        if ($fullCommand -match $pattern) {
            return $true
        }
    }
    return $false
}

function Write-BlockedMessage {
    param([string]$Cmd, [string]$Reason)

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  PRODUCTION COMMAND BLOCKED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Command blocked: $Cmd" -ForegroundColor Yellow
    Write-Host "Reason: $Reason" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Release Gate Status: $(Get-ReleaseStatus)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To deploy to production:" -ForegroundColor White
    Write-Host "  1. Run /release-check" -ForegroundColor White
    Write-Host "  2. Run /deploy-preview" -ForegroundColor White
    Write-Host "  3. Get explicit approval" -ForegroundColor White
    Write-Host "  4. Run /deploy-production I-APPROVE-PRODUCTION" -ForegroundColor White
    Write-Host ""
}

# Check if this is a blocked production command
if (Test-BlockedCommand -Cmd $Command -Arguments $Args) {
    $status = Get-ReleaseStatus

    if ($status -ne "READY") {
        Write-BlockedMessage -Cmd "$Command $Args" -Reason "Release Gate is not READY_FOR_PRODUCTION_APPROVAL"
        exit 1
    }
}

# Allow the command to proceed
exit 0
