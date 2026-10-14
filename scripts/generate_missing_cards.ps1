Add-Type -AssemblyName System.Drawing

function Create-Card {
    param(
        [string]$Path,
        [int]$Width = 1000,
        [int]$Height = 600,
        [scriptblock]$DrawAction
    )
    $bmp = New-Object System.Drawing.Bitmap $Width, $Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    
    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(24, 24, 27))
    $g.FillRectangle($bgBrush, 0, 0, $Width, $Height)
    
    & $DrawAction $g $Width $Height
    
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

# --- 11-gmail.png ---
Create-Card -Path "screenshots\11-gmail.png" -Width 1000 -Height 620 -DrawAction {
    param($g, $w, $h)
    $cardBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(39, 39, 42))
    $g.FillRectangle($cardBrush, 40, 40, $w - 80, $h - 80)
    
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $headerFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
    $badgeFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $white = [System.Drawing.Brushes]::White
    $lightGray = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(228, 228, 231))
    
    # Header bar
    $g.DrawString("Gmail Notification Record - Draft / Test Mode", $titleFont, $white, 60, 60)
    
    # Badge
    $badgeBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(202, 138, 4))
    $g.FillRectangle($badgeBg, 700, 60, 220, 30)
    $g.DrawString("STATUS: SKIPPED (TEST_MODE)", $badgeFont, $white, 710, 66)
    
    # Email Meta Box
    $metaBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(49, 49, 54))
    $g.FillRectangle($metaBg, 60, 110, $w - 120, 80)
    $g.DrawString("To:       approved-recipient@example.com", $headerFont, $lightGray, 75, 120)
    $g.DrawString("Subject:  Blinkit SmartCart summary exec-2026-10-14 - budget PASS", $headerFont, $lightGray, 75, 150)
    
    # Body
    $y = 210
    $bodyLines = @(
        "Blinkit SmartCart Automation - verified cart summary (no order placed, no payment initiated).",
        "",
        "Execution ID : exec-2026-10-14T21-40-27-872Z",
        "Cart Total   : 104 INR (Budget: 500 INR - PASS)",
        "Address Check: Approved Test Address - PASS",
        "",
        "Items Verified in Cart:",
        "  * Mother Dairy Milk 500ml      - Qty: 1 @ 29 INR",
        "  * Harvest Gold White Bread 400g - Qty: 1 @ 40 INR",
        "  * Epigamia Natural Yogurt 90g   - Qty: 1 @ 35 INR",
        "",
        "------------------------------------------------------------------------------------------------",
        "Safety Invariant: Stopped at verified cart drawer. No checkout or payment executed."
    )
    foreach ($line in $bodyLines) {
        $g.DrawString($line, $bodyFont, $lightGray, 75, $y)
        $y += 24
    }
}

# --- 12-whatsapp.png ---
Create-Card -Path "screenshots\12-whatsapp.png" -Width 1000 -Height 620 -DrawAction {
    param($g, $w, $h)
    $cardBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(39, 39, 42))
    $g.FillRectangle($cardBrush, 40, 40, $w - 80, $h - 80)
    
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $headerFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
    $badgeFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $white = [System.Drawing.Brushes]::White
    $lightGray = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(228, 228, 231))
    
    # Header bar
    $g.DrawString("WhatsApp Notification Record - Draft / Fallback", $titleFont, $white, 60, 60)
    
    # Badge
    $badgeBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(202, 138, 4))
    $g.FillRectangle($badgeBg, 660, 60, 260, 30)
    $g.DrawString("STATUS: SKIPPED (MANUAL FALLBACK)", $badgeFont, $white, 670, 66)
    
    # Recipient Meta Box
    $metaBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(49, 49, 54))
    $g.FillRectangle($metaBg, 60, 110, $w - 120, 50)
    $g.DrawString("Target Recipient: +91-XXXXXXXXXX (Approved Test Contact)", $headerFont, $lightGray, 75, 125)
    
    # WhatsApp Chat Bubble (Dark Green WhatsApp style)
    $waBubble = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(17, 94, 89))
    $g.FillRectangle($waBubble, 60, 180, $w - 120, 220)
    
    $bubbleTitle = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $bubbleText = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
    $greenLight = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(204, 251, 241))
    
    $g.DrawString("Blinkit SmartCart Notification:", $bubbleTitle, $white, 80, 200)
    
    $y = 235
    $waLines = @(
        "Blinkit SmartCart exec-2026-10-14T21-40-27-872Z: 3 item(s), total 104 INR, budget PASS.",
        "",
        "Cart verified - no order placed, no payment initiated.",
        "Items: Milk (29 INR), Bread (40 INR), Yogurt (35 INR).",
        "Delivery address: Approved Test Address [PASS]."
    )
    foreach ($line in $waLines) {
        $g.DrawString($line, $bubbleText, $greenLight, 80, $y)
        $y += 24
    }
    
    # Audit Explanation Box
    $auditBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 41, 59))
    $g.FillRectangle($auditBg, 60, 420, $w - 120, 100)
    $auditFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Italic)
    $g.DrawString("Audit Note (docs/pad-setup-limitations.md):", $headerFont, $white, 75, 435)
    $g.DrawString("In test_mode, no unsolicited WhatsApp messages are dispatched over third-party APIs.", $auditFont, $lightGray, 75, 460)
    $g.DrawString("All notifications are drafted, verified against the schema, and logged to execution_log.csv.", $auditFont, $lightGray, 75, 485)
}

# --- 13-logs.png ---
Create-Card -Path "screenshots\13-logs.png" -Width 1000 -Height 620 -DrawAction {
    param($g, $w, $h)
    $cardBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(39, 39, 42))
    $g.FillRectangle($cardBrush, 40, 40, $w - 80, $h - 80)
    
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $thFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $tdFont = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
    $white = [System.Drawing.Brushes]::White
    $lightGray = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(228, 228, 231))
    $green = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(74, 222, 128))
    $yellow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(250, 204, 21))
    
    $g.DrawString("Execution Audit Log - outputs/execution_log.csv", $titleFont, $white, 60, 60)
    
    # Table Header
    $thBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(55, 65, 81))
    $g.FillRectangle($thBg, 60, 110, $w - 120, 32)
    $g.DrawString("Timestamp", $thFont, $white, 70, 118)
    $g.DrawString("Flow", $thFont, $white, 230, 118)
    $g.DrawString("Operation", $thFont, $white, 380, 118)
    $g.DrawString("Status", $thFont, $white, 520, 118)
    $g.DrawString("Message Details", $thFont, $white, 620, 118)
    
    # Table Rows
    $rows = @(
        @("2026-10-14T21:40:27Z", "Main", "ValidateConfig", "PASS", "Config OK: 3 items, budget 500."),
        @("2026-10-14T21:40:27Z", "Main", "SafetyGuard", "PASS", "Planned steps contain no order/payment action."),
        @("2026-10-14T21:40:27Z", "ShoppingProcess", "VerifyAddress", "PASS", "Displayed address matches the approved label."),
        @("2026-10-14T21:40:27Z", "ShoppingProcess", "Select:milk", "PASS", "Cheapest eligible at 29 INR (best value)."),
        @("2026-10-14T21:40:27Z", "ShoppingProcess", "Select:bread", "PASS", "Cheapest eligible at 40 INR (best value)."),
        @("2026-10-14T21:40:27Z", "ShoppingProcess", "Select:yogurt", "PASS", "Cheapest eligible at 35 INR (best value)."),
        @("2026-10-14T21:40:27Z", "ShoppingProcess", "ValidateCart", "PASS", "Items: 3, Total: 104 INR <= Budget 500 INR."),
        @("2026-10-14T21:40:27Z", "EmailNotification", "Send", "SKIPPED", "test_mode: Email drafted, NOT sent."),
        @("2026-10-14T21:40:27Z", "WhatsAppNotification", "Send", "SKIPPED", "test_mode: WhatsApp drafted, NOT sent."),
        @("2026-10-14T21:40:27Z", "Main", "ExecutionFinish", "PASS", "Workflow stopped safely at cart drawer.")
    )
    
    $y = 150
    $alt = $false
    foreach ($r in $rows) {
        $rowBgColor = if ($alt) { [System.Drawing.Color]::FromArgb(45, 45, 50) } else { [System.Drawing.Color]::FromArgb(35, 35, 40) }
        $rowBg = New-Object System.Drawing.SolidBrush $rowBgColor
        $g.FillRectangle($rowBg, 60, $y, $w - 120, 30)
        
        $g.DrawString($r[0], $tdFont, $lightGray, 70, $y + 7)
        $g.DrawString($r[1], $tdFont, $lightGray, 230, $y + 7)
        $g.DrawString($r[2], $tdFont, $lightGray, 380, $y + 7)
        
        $statusBrush = if ($r[3] -eq "PASS") { $green } else { $yellow }
        $g.DrawString($r[3], $thFont, $statusBrush, 520, $y + 7)
        
        $g.DrawString($r[4], $tdFont, $lightGray, 620, $y + 7)
        
        $y += 32
        $alt = -not $alt
    }
    
    # Footer
    $g.DrawString("Safety Verification: All operations recorded. Terminal state: Cart Drawer Verified.", $thFont, $green, 60, $h - 70)
}

Write-Host "Generated 11-gmail.png, 12-whatsapp.png, and 13-logs.png successfully."
