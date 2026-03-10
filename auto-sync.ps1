# Auto-Sync Script for BetterTime
# This script watches for changes and automatically pushes to GitHub.
# Run this in your OWN terminal on your computer, not in the AI terminal.

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "."
$watcher.Filter = "*.*"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

Write-Host "🚀 Auto-sync started! Monitoring changes in $pwd" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

$gitPath = "C:\Program Files\Git\bin\git.exe"
if (-not (Test-Path $gitPath)) { $gitPath = "git" } # Fallback

$action = {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -notmatch ".git" -and $path -notmatch ".next" -and $path -notmatch "node_modules") {
        Write-Host "🔄 Change detected: $($Event.SourceEventArgs.Name). Syncing..." -ForegroundColor Green
        & $gitPath add .
        & $gitPath commit -m "Auto-sync update: $(Get-Date -Format 'HH:mm:ss')"
        & $gitPath push
        Write-Host "✅ Sync complete! Vercel is building..." -ForegroundColor Blue
    }
}

Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action

while ($true) { Start-Sleep 1 }
