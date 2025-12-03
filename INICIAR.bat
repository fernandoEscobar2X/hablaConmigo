@echo off
title HablaConmigo - Iniciando...

echo ============================================
echo    HABLACONMIGO - Iniciando Servidores
echo ============================================
echo.

:: Iniciar Backend Python en una nueva ventana
echo Iniciando servidor Python...
start "HablaConmigo - Backend Python" cmd /k "cd backend && venv\Scripts\activate && python servidor_voz.py"

:: Esperar 3 segundos para que el backend inicie
timeout /t 3 /nobreak > nul

:: Iniciar Frontend Next.js en otra ventana
echo Iniciando servidor Next.js...
start "HablaConmigo - Frontend Next.js" cmd /k "npm run dev"

:: Esperar 5 segundos y abrir el navegador
timeout /t 5 /nobreak > nul

echo.
echo Abriendo navegador...
start http://localhost:3000

echo.
echo ============================================
echo    Servidores iniciados correctamente!
echo ============================================
echo.
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:3000
echo.
echo    Para detener, cierra las ventanas de terminal.
echo ============================================
