param(
    [ValidateSet("1", "2", "3", "4", "5", "all", "status")]
    [string]$Flow = "1"
)

$flows = @{
    "1" = @{ File = "pad-flows\exports\Flow1_ErrorHandling.robin"; Name = "ErrorHandling"; Tab = "ErrorHandling" }
    "2" = @{ File = "pad-flows\exports\Flow2_ShoppingProcess.robin"; Name = "ShoppingProcess"; Tab = "ShoppingProcess" }
    "3" = @{ File = "pad-flows\exports\Flow3_EmailNotification.robin"; Name = "EmailNotification"; Tab = "EmailNotification" }
    "4" = @{ File = "pad-flows\exports\Flow4_WhatsAppNotification.robin"; Name = "WhatsAppNotification"; Tab = "WhatsAppNotification" }
    "5" = @{ File = "pad-flows\exports\Flow5_BlinkitShoppingAssistant.robin"; Name = "BlinkitShoppingAssistant"; Tab = "Main" }
}

if ($Flow -in @("1", "2", "3", "4", "5")) {
    $target = $flows[$Flow]
    $content = Get-Content $target.File -Raw
    Set-Clipboard -Value $content
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host " [COPIED] $($target.Name) to your Windows clipboard!" -ForegroundColor Green
    Write-Host " Target PAD Designer Tab: '$($target.Tab)'" -ForegroundColor Yellow
    Write-Host " Action: Click the '$($target.Tab)' canvas and press Ctrl+V" -ForegroundColor White
    Write-Host "========================================================`n" -ForegroundColor Cyan
} elseif ($Flow -eq "all") {
    foreach ($k in ("1", "2", "3", "4", "5")) {
        $target = $flows[$k]
        $content = Get-Content $target.File -Raw
        Set-Clipboard -Value $content
        Write-Host "`n---> Flow $k : $($target.Name) is now on your clipboard!" -ForegroundColor Green
        Write-Host "     Switch to PAD Designer -> click '$($target.Tab)' tab canvas -> press Ctrl+V." -ForegroundColor Yellow
        Read-Host "     Press [ENTER] when pasted to load the next flow..."
    }
    Write-Host "`nAll 5 flows copied successfully!" -ForegroundColor Cyan
}
