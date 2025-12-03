@echo off
echo Deteniendo servidores...

:: Matar procesos de Python (Flask)
taskkill /f /im python.exe 2>nul

:: Matar procesos de Node (Next.js)
taskkill /f /im node.exe 2>nul

echo.
echo Servidores detenidos.
pause
