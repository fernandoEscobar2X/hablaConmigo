@echo off
title HablaConmigo - Instalacion

echo ============================================
echo    HABLACONMIGO - Instalacion Inicial
echo ============================================
echo.
echo Este script solo se ejecuta UNA VEZ
echo.

:: Verificar Node.js
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Descargalo de: https://nodejs.org
    pause
    exit
)
echo       OK - Node.js instalado

:: Verificar Python
echo [2/5] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no esta instalado
    echo Descargalo de: https://python.org
    pause
    exit
)
echo       OK - Python instalado

:: Verificar ffmpeg
echo [3/5] Verificando ffmpeg...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: ffmpeg no esta instalado
    echo Ejecuta: winget install ffmpeg
    echo O descarga de: https://ffmpeg.org
    pause
    exit
)
echo       OK - ffmpeg instalado

:: Instalar dependencias de Node
echo [4/5] Instalando dependencias de Node.js...
call npm install
echo       OK - Dependencias de Node instaladas

:: Crear entorno virtual e instalar dependencias de Python
echo [5/5] Instalando dependencias de Python...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..
echo       OK - Dependencias de Python instaladas

echo.
echo ============================================
echo    INSTALACION COMPLETADA!
echo ============================================
echo.
echo Ahora ejecuta INICIAR.bat para correr la app
echo.
pause
