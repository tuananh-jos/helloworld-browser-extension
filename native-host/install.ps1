# install.ps1 -- Dang ky Hello Password Native Host vao Windows Registry
# Cach chay (trong PowerShell):
#   .\install.ps1 -ExtensionId "abcdefghijklmnopqrstuvwxyz123456"
#
# Lay Extension ID tai: chrome://extensions (bat Developer mode)

param(
    [Parameter(Mandatory=$true)]
    [string]$ExtensionId
)

$ErrorActionPreference = "Stop"
$HostName    = "com.hellopassword.native"
$ProjectDir  = Join-Path $PSScriptRoot "HelloPasswordHost"
$PublishDir  = Join-Path $ProjectDir "bin\Release\net10.0\win-x64\publish"
$ExePath     = Join-Path $PublishDir "HelloPasswordHost.exe"
$ManifestOut = Join-Path $PSScriptRoot "manifest.installed.json"

# Tim dotnet.exe (khong can PATH)
$DotnetExe = "C:\Program Files\dotnet\dotnet.exe"
if (-not (Test-Path $DotnetExe)) {
    $dotnetCmd = Get-Command dotnet -ErrorAction SilentlyContinue
    if ($dotnetCmd) {
        $DotnetExe = $dotnetCmd.Source
    } else {
        Write-Error "dotnet.exe not found. Install .NET SDK from https://dot.net"
        exit 1
    }
}

# --- 1. Build C# project ---
Write-Host ""
Write-Host "[1/4] Building C# native host..." -ForegroundColor Cyan
& $DotnetExe publish $ProjectDir -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true

if (-not (Test-Path $ExePath)) {
    Write-Error "Build failed -- exe not found at: $ExePath"
    exit 1
}
Write-Host "      OK: $ExePath" -ForegroundColor Green

# --- 2. Tao manifest voi path va extension ID that ---
Write-Host ""
Write-Host "[2/4] Writing host manifest..." -ForegroundColor Cyan
$manifest = [ordered]@{
    name            = $HostName
    description     = "Hello Password Native Host"
    path            = $ExePath
    type            = "stdio"
    allowed_origins = @("chrome-extension://$ExtensionId/")
}
$manifest | ConvertTo-Json | Set-Content -Path $ManifestOut -Encoding UTF8
Write-Host "      OK: $ManifestOut" -ForegroundColor Green

# --- 3. Dang ky vao Registry (Chrome + Edge) ---
Write-Host ""
Write-Host "[3/4] Registering in Windows Registry..." -ForegroundColor Cyan
$regPaths = @(
    "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$HostName",
    "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\$HostName"
)
foreach ($rp in $regPaths) {
    New-Item -Path $rp -Force | Out-Null
    Set-ItemProperty -Path $rp -Name "(Default)" -Value $ManifestOut
    Write-Host "      Registered: $rp" -ForegroundColor Green
}

# --- 4. Done ---
Write-Host ""
Write-Host "[4/4] Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Buoc tiep theo:"
Write-Host "  1. Vao chrome://extensions -> Reload extension"
Write-Host "  2. Mo popup -> click icon [Win32 App] -> click Ping"
Write-Host "  3. Ket qua PONG se hien thi thong tin may tinh nay"
Write-Host ""
