Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetAbsolutePathName(".")

' Launch setup_custom_domain.bat with Administrator elevation
WshShell.Run "powershell -Command ""Start-Process '" & strPath & "\setup_custom_domain.bat' -Verb RunAs""", 0, False
