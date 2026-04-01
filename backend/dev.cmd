@echo off
REM Run API without PowerShell blocking npm.ps1 (ExecutionPolicy). From backend folder: dev.cmd
cd /d "%~dp0"
node .\node_modules\nodemon\bin\nodemon.js server.js
