#!/bin/bash

echo "============================================"
echo "   HABLACONMIGO - Instalacion Inicial"
echo "============================================"
echo ""
echo "Este script solo se ejecuta UNA VEZ"
echo ""

# Verificar Node.js
echo "[1/5] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no esta instalado"
    echo "Instalalo con: brew install node (Mac) o sudo apt install nodejs (Linux)"
    exit 1
fi
echo "      OK - Node.js instalado"

# Verificar Python
echo "[2/5] Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python no esta instalado"
    echo "Instalalo con: brew install python (Mac) o sudo apt install python3 (Linux)"
    exit 1
fi
echo "      OK - Python instalado"

# Verificar ffmpeg
echo "[3/5] Verificando ffmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "ERROR: ffmpeg no esta instalado"
    echo "Instalalo con: brew install ffmpeg (Mac) o sudo apt install ffmpeg (Linux)"
    exit 1
fi
echo "      OK - ffmpeg instalado"

# Instalar dependencias de Node
echo "[4/5] Instalando dependencias de Node.js..."
npm install
echo "      OK - Dependencias de Node instaladas"

# Crear entorno virtual e instalar dependencias de Python
echo "[5/5] Instalando dependencias de Python..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
echo "      OK - Dependencias de Python instaladas"

echo ""
echo "============================================"
echo "   INSTALACION COMPLETADA!"
echo "============================================"
echo ""
echo "Ahora ejecuta: ./iniciar.sh"
echo ""
