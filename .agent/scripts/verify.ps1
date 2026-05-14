# HM ERP -- FE Mobile Web Quick Verification Script
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

Write-Host "
[1/2] Building Angular App..." -ForegroundColor Cyan
$buildResult = ng build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] BUILD FAILED" -ForegroundColor Red
    $buildResult | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    exit 1
}
Write-Host "[OK] Build succeeded" -ForegroundColor Green

Write-Host "
[2/2] Checking for Mobile Web Anti-Patterns..." -ForegroundColor Cyan
$issues = 0

# Check for hardcoded colors in HTML/SCSS
$hardcodedColors = Get-ChildItem -Path ".\src\app" -Include "*.scss", "*.html" -Recurse | Select-String "#[0-9a-fA-F]{3,6}" -SimpleMatch
if ($hardcodedColors) {
    Write-Host "[WARN] Hardcoded Hex Colors found (Use variables instead):" -ForegroundColor Yellow
    $hardcodedColors | Select-Object -First 5 | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber)" -ForegroundColor Yellow }
    $issues++
}

# Check for loose typing 'any' in TypeScript
$anyTypes = Get-ChildItem -Path ".\src\app" -Include "*.ts" -Recurse | Select-String ": any" -SimpleMatch
if ($anyTypes) {
    Write-Host "[WARN] 'any' type used in TypeScript (Violates strict typing):" -ForegroundColor Yellow
    $anyTypes | Select-Object -First 5 | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber)" -ForegroundColor Yellow }
    $issues++
}

if ($issues -eq 0) {
    Write-Host "[OK] No common anti-patterns found" -ForegroundColor Green
}

exit 0
