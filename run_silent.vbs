Set WshShell = CreateObject("WScript.Shell")
strPath = WshShell.CurrentDirectory & "\run_app.bat"
WshShell.Run """" & strPath & """", 0, False
