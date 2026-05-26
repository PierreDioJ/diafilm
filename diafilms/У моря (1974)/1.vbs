Set s = CreateObject("WScript.Shell")
Dim fso ' объявляем переменую fso – экземпляр FileSystemObject
Set fso = CreateObject("Scripting.FileSystemObject") ' создаем экземпляр объекта FileSystemObject
Set WshShell = WScript.CreateObject("WScript.Shell")
path = WshShell.CurrentDirectory
FileName = path & "\a01.jpg"
if  FSO.FileExists(FileName)  Then
s.Run "explorer.exe a01.jpg" 
end if
FileName = path & "\01.jpg"
if  FSO.FileExists(FileName)  Then
s.Run "explorer.exe 01.jpg"
end if
FileName = path & "\001.jpg"
if  FSO.FileExists(FileName)  Then
s.Run "explorer.exe 001.jpg"
end if
WScript.Sleep 500
s.SendKeys("{F11}")