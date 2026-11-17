param(
  [Parameter(Mandatory=$true)][string]$OriginalPath,
  [Parameter(Mandatory=$true)][string]$PackagePath,
  [Parameter(Mandatory=$true)][int]$PreviousProcessId,
  [Parameter(Mandatory=$true)][string]$ExpectedSHA256
)
$ErrorActionPreference = 'Stop'
$env:PSModulePath = [System.IO.Path]::Combine($PSHOME, 'Modules') + ';' + $env:PSModulePath
$originalFile = [System.IO.Path]::GetFullPath($OriginalPath)
$packageFile = [System.IO.Path]::GetFullPath($PackagePath)
if (-not $originalFile.EndsWith('.exe', [System.StringComparison]::OrdinalIgnoreCase) -or $originalFile -eq $packageFile) { throw 'Invalid portable update target' }
if ((Get-FileHash -LiteralPath $packageFile -Algorithm SHA256).Hash -ne $ExpectedSHA256) { throw 'Update checksum mismatch' }
$previousProcess = Get-Process -Id $PreviousProcessId -ErrorAction SilentlyContinue
if ($previousProcess) { $previousProcess | Wait-Process -Timeout 120 }
$stagedFile = Join-Path ([System.IO.Path]::GetDirectoryName($originalFile)) (([System.IO.Path]::GetFileNameWithoutExtension($originalFile)) + '.update-' + [guid]::NewGuid().ToString('N') + '.exe')
Copy-Item -LiteralPath $packageFile -Destination $stagedFile
$replaced = $false
try {
  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try { Move-Item -LiteralPath $stagedFile -Destination $originalFile -Force; $replaced = $true; break }
    catch { Start-Sleep -Seconds 1 }
  }
  if (-not $replaced) { throw 'Unable to replace portable executable' }
  Start-Process -FilePath $originalFile -WindowStyle Hidden
} finally {
  if (Test-Path -LiteralPath $stagedFile) { Remove-Item -LiteralPath $stagedFile }
}
