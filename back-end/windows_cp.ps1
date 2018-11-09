Get-ChildItem -Path "./back-end/static/" -Include *.* -Recurse | foreach { $_.Delete() }
cp .\build\* .\back-end\static\ -Recurse -Force
