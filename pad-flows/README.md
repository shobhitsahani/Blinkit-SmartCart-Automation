# PAD flows — Create & Export (PAD v11.2609.183.0 / v1.0.2141.0)

All 5 flows are fully authored and exported in native Power Automate Desktop script format (`.robin`) in `pad-flows/exports/`.

You can create each flow in the PAD Designer in seconds:
1. Open PAD Console and click **New Flow** with the flow name.
2. Open the flow in PAD Designer.
3. Open the corresponding `.robin` file from `pad-flows/exports/` in any text editor, select all (`Ctrl+A`), and copy (`Ctrl+C`).
4. Click on the PAD Designer canvas (the center pane) and paste (`Ctrl+V`). Power Automate Desktop instantly translates the Robin script into visual action blocks!
5. Save the flow (`Ctrl+S`).

---

## Creation Sequence (Exact Order)

### Flow 1 — ErrorHandling (Smallest, Build First)
- **File:** [`pad-flows/exports/Flow1_ErrorHandling.robin`](file:///c:/project_assigments/Blinkit-SmartCart-Automation/pad-flows/exports/Flow1_ErrorHandling.robin)
- **Inputs:** `FailedOperation` (Text), `ErrorMessage` (Text), `ExecutionId` (Text)
- **Outputs:** `ErrorCategory` (Text), `ShouldRetry` (Boolean), `SafeToStop` (Boolean)
- **Actions Used:**
  - `Get current date and time` (`DateTime.GetCurrentDateTime.Local`)
  - `Create folder` (`Folder.Create`)
  - `Take screenshot` (`UIAutomation.TakeScreenshot.TakeScreenshotAndSaveToFile`)
  - `If` / `Else if` / `Else` / `End` (`Conditionals.*`)
  - `Set variable` (`Variables.SetVariable`)
  - `Write text to file` (`File.WriteText`)
  - `Display message` (`Display.ShowMessage`)
  - `Stop flow` (`Flow.StopFlow`)
- **Safety Rule:** Immediate `SafeToStop=True` and `Stop flow` on `ADDRESS`, `CART`, `SAFETY`, or `AUTH` errors.

### Flow 2 — ShoppingProcess (Browser & Recorder)
- **File:** [`pad-flows/exports/Flow2_ShoppingProcess.robin`](file:///c:/project_assigments/Blinkit-SmartCart-Automation/pad-flows/exports/Flow2_ShoppingProcess.robin)
- **Inputs:** `ConfigJson` (Text), `ExecutionId` (Text)
- **Outputs:** `CartJson` (Text), `BudgetStatus` (Text), `AddressStatus` (Text)
- **Actions Used:**
  - `Launch new Chrome` (`WebAutomation.LaunchChrome.LaunchChrome`)
  - `Wait for web page content` (`WebAutomation.WaitForWebPageContent`)
  - `Display message` (`Display.ShowMessage` for manual login prompt if needed)
  - `Click link on web page` (`WebAutomation.Click.Click`)
  - `Get details of element on web page` (`WebAutomation.GetDetailsOfElement`)
  - `Attach to running Chrome` (`WebAutomation.LaunchChrome.AttachToChromeByUrl`)
  - `Write text to file` (`File.WriteText`)
  - `Replace text` (`Text.Replace`) & `Convert text to number` (`Text.ToNumber`)
- **Safety Gate:** Stops at verified cart. Never clicks 'Place Order' or initiates payment.

### Flow 3 — EmailNotification
- **File:** [`pad-flows/exports/Flow3_EmailNotification.robin`](file:///c:/project_assigments/Blinkit-SmartCart-Automation/pad-flows/exports/Flow3_EmailNotification.robin)
- **Inputs:** `SummaryJson` (Text), `Recipient` (Text), `TestMode` (Text)
- **Outputs:** `EmailStatus` (Text)
- **Actions Used:**
  - `If` / `Else` / `End` (`Conditionals.*`)
  - `Write text to file` (`File.WriteText`)
  - `Set variable` (`Variables.SetVariable`)
  - `Send email` (`Email.SendEmail.SendEmail`)
- **Behavior:** When `TestMode` is true, writes "drafted, NOT sent" to `outputs/execution_log.csv` and sets `EmailStatus=SKIPPED`.

### Flow 4 — WhatsAppNotification
- **File:** [`pad-flows/exports/Flow4_WhatsAppNotification.robin`](file:///c:/project_assigments/Blinkit-SmartCart-Automation/pad-flows/exports/Flow4_WhatsAppNotification.robin)
- **Inputs:** `SummaryJson` (Text), `Recipient` (Text), `TestMode` (Text)
- **Outputs:** `WaStatus` (Text)
- **Actions Used:**
  - `If` / `Else` / `End` (`Conditionals.*`)
  - `Write text to file` (`File.WriteText`)
  - `Set variable` (`Variables.SetVariable`)
  - `Get environment variable` (`System.GetEnvironmentVariable`)
  - `Invoke web service` (`WebServices.InvokeWebService`)
- **Behavior:** In test mode or when unconfigured, logs `SKIPPED` / `UNSUPPORTED` with fallback note in execution report.

### Flow 5 — Main: BlinkitShoppingAssistant (Orchestrator)
- **File:** [`pad-flows/exports/Flow5_BlinkitShoppingAssistant.robin`](file:///c:/project_assigments/Blinkit-SmartCart-Automation/pad-flows/exports/Flow5_BlinkitShoppingAssistant.robin)
- **Input:** `ConfigPath` (Text, default: `config.json`)
- **Outputs:** `ExecutionId` (Text), `OverallStatus` (Text)
- **Actions Used:**
  - `Run PowerShell script` (`System.RunPowerShellScript` for `npm run validate-config` and `npm run gen-summary`)
  - `Create folder` (`Folder.Create`)
  - `Get current date and time` (`DateTime.GetCurrentDateTime.Local`)
  - `Convert datetime to text` (`Text.ConvertDateTimeToText`)
  - `Run subflow` (`Flow.RunSubflow`)
  - `Write text to file` (`File.WriteText`)
  - `Display message` (`Display.ShowMessage`)
- **Safety Rule:** Wraps every subflow call with error handling. Stops on address/cart/safety failure. No checkout action exists.

---

## Export Checklist
- [x] All 5 flow Robin scripts created in [`pad-flows/exports/`](file:///c:/project_assigments/Blinkit-SmartCart-Automation/pad-flows/exports/)
- [x] [`pad-flows/subflows.inventory.json`](file:///c:/project_assigments/Blinkit-SmartCart-Automation/pad-flows/subflows.inventory.json) updated with actual canonical action names
- [x] `npm run doctor` exports gate passed
- [ ] In PAD Console, export each flow to verify or update exports if customized
