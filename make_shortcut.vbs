Set WshShell = CreateObject("WScript.Shell")

strAppDir = "C:\Users\NITU\.gemini\antigravity\scratch\hydraulic-billing-app"
strIconPath = strAppDir & "\dk_logo.ico"
strTargetPath = "wscript.exe"
strArgs = """" & strAppDir & "\run_silent.vbs"""

arrDesktops = Array( _
    WshShell.SpecialFolders("Desktop"), _
    "C:\Users\NITU\Desktop", _
    "C:\Users\NITU\OneDrive\Desktop" _
)

For Each strFolder In arrDesktops
    If CreateObject("Scripting.FileSystemObject").FolderExists(strFolder) Then
        Set oShellLink = WshShell.CreateShortcut(strFolder & "\DK Enterprise Billing.lnk")
        oShellLink.TargetPath = strTargetPath
        oShellLink.Arguments = strArgs
        oShellLink.WorkingDirectory = strAppDir
        oShellLink.WindowStyle = 1
        oShellLink.IconLocation = strIconPath
        oShellLink.Description = "DK Enterprise Billing & Letterpad System"
        oShellLink.Save
    End If
Next

WScript.Echo "Desktop shortcut updated to silent launcher!"
