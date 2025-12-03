#!/bin/bash

echo "============================================"
echo "   HABLACONMIGO - Iniciando Servidores"
echo "============================================"
echo ""

# Iniciar Backend Python en segundo plano
echo "Iniciando servidor Python..."
cd backend
source venv/bin/activate
python servidor_voz.py &
PYTHON_PID=$!
cd ..

# Esperar a que el backend inicie
sleep 3

# Iniciar Frontend Next.js en segundo plano
echo "Iniciando servidor Next.js..."
npm run dev &
NODE_PID=$!

# Esperar y abrir navegador
sleep 5
echo "Abriendo navegador..."

# Detectar sistema operativo para abrir navegador
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
else
    xdg-open http://localhost:3000 2>/dev/null || echo "Abre http://localhost:3000 en tu navegador"
fi

echo ""
echo "============================================"
echo "   Servidores iniciados!"
echo "============================================"
echo ""
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "   Presiona Ctrl+C para detener"
echo "============================================"

# Esperar a que el usuario presione Ctrl+C
trap "kill $PYTHON_PID $NODE_PID 2>/dev/null; exit" INT
wait
