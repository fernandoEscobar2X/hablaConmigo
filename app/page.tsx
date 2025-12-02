"use client";
import React, { useState, useEffect } from 'react';
import { Star, Map, Trophy, Volume2, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ============================================================
// CONFIGURACIÓN
// ============================================================
const API_URL = 'http://localhost:5000';

// ============================================================
// COMPONENTE PRINCIPAL - DASHBOARD
// ============================================================

export default function Dashboard() {
  const [servidorConectado, setServidorConectado] = useState<boolean | null>(null);

  // Verificar conexión con el servidor Python
  useEffect(() => {
    const verificarConexion = async () => {
      try {
        const response = await fetch(`${API_URL}/api/salud`, {
          signal: AbortSignal.timeout(3000)
        });
        const data = await response.json();
        setServidorConectado(data.estado === 'activo');
      } catch {
        setServidorConectado(false);
      }
    };
    
    verificarConexion();
    const intervalo = setInterval(verificarConexion, 10000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 p-6 max-w-4xl mx-auto">
      
      {/* ===== HEADER: Perfil del Niño ===== */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-lg border-2 border-green-100">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full border-4 border-orange-500 flex items-center justify-center text-3xl shadow-lg cursor-pointer"
          >
            🐯
          </motion.div>
          <div>
            <h1 className="text-2xl font-black text-green-700">¡Hola, Leo!</h1>
            <p className="text-gray-500 font-medium">Nivel 3: Explorador</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {/* Puntos */}
          <div className="flex gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-xl text-orange-700 font-bold border border-orange-200">
            <Star className="fill-orange-400 stroke-orange-500" />
            <span>1,250 Puntos</span>
          </div>
          
          {/* Estado del servidor */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            servidorConectado === null 
              ? 'bg-gray-100 text-gray-500'
              : servidorConectado 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
          }`}>
            {servidorConectado === null ? (
              'Conectando...'
            ) : servidorConectado ? (
              <><Wifi size={12} /> Servidor Activo</>
            ) : (
              <><WifiOff size={12} /> Sin Servidor</>
            )}
          </div>
        </div>
      </header>

      {/* ===== AVISO SI NO HAY SERVIDOR ===== */}
      {servidorConectado === false && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-2 border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6"
        >
          <p className="font-bold">💡 Para usar las funciones de voz:</p>
          <p className="text-sm mt-1">
            Abre una terminal y ejecuta: <code className="bg-amber-100 px-2 py-1 rounded font-mono">python servidor_voz.py</code>
          </p>
        </motion.div>
      )}

      {/* ===== MAPA DE MISIONES ===== */}
      <main>
        <h2 className="text-3xl font-black mb-6 text-center text-gray-800">
          Tu Mapa de Aventuras 🇲🇽
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ===== MISIÓN 1: La Selva de los Sonidos (Disponible) ===== */}
          <Link href="/actividad">
            <motion.div 
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-3xl shadow-xl border-b-8 border-green-500 p-6 cursor-pointer group hover:shadow-2xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold text-sm border border-green-200">
                  RECOMENDADO
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Volume2 className="text-green-600 w-8 h-8" />
                </motion.div>
              </div>
              
              <h3 className="text-2xl font-black text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                🌴 La Selva de los Sonidos
              </h3>
              <p className="text-gray-500 mb-4 text-lg">
                Practica palabras con "R" y "L" junto al Jaguar.
              </p>
              
              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '33%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-green-400 to-green-500 h-4 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">33% completado</p>
            </motion.div>
          </Link>

          {/* ===== MISIÓN 2: El Mercado Mágico (Bloqueada) ===== */}
          <div className="bg-white rounded-3xl shadow-xl border-b-8 border-gray-300 p-6 opacity-70 relative overflow-hidden">
            {/* Overlay de bloqueo */}
            <div className="absolute inset-0 bg-gray-100/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <span className="bg-gray-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                🔒 Completa la anterior
              </span>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg font-bold text-sm">
                PRÓXIMAMENTE
              </span>
              <Map className="text-gray-400 w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-black text-gray-800 mb-2">
              🏪 El Mercado Mágico
            </h3>
            <p className="text-gray-500 mb-4 text-lg">
              Aprende nuevas palabras de comida mexicana.
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-gray-300 h-4 rounded-full w-0"></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">0% completado</p>
          </div>

          {/* ===== MISIÓN 3: La Fiesta de las Palabras (Bloqueada) ===== */}
          <div className="bg-white rounded-3xl shadow-xl border-b-8 border-gray-300 p-6 opacity-70 relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-100/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <span className="bg-gray-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                🔒 Completa la anterior
              </span>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg font-bold text-sm">
                PRÓXIMAMENTE
              </span>
              <Trophy className="text-gray-400 w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-black text-gray-800 mb-2">
              🎉 La Fiesta de las Palabras
            </h3>
            <p className="text-gray-500 mb-4 text-lg">
              Forma oraciones y cuenta historias divertidas.
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-gray-300 h-4 rounded-full w-0"></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">0% completado</p>
          </div>

          {/* ===== MISIÓN 4: El Castillo de los Cuentos (Bloqueada) ===== */}
          <div className="bg-white rounded-3xl shadow-xl border-b-8 border-gray-300 p-6 opacity-70 relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-100/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <span className="bg-gray-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                🔒 Completa la anterior
              </span>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg font-bold text-sm">
                PRÓXIMAMENTE
              </span>
              <span className="text-3xl">🏰</span>
            </div>
            
            <h3 className="text-2xl font-black text-gray-800 mb-2">
              🏰 El Castillo de los Cuentos
            </h3>
            <p className="text-gray-500 mb-4 text-lg">
              Escucha y comprende historias mágicas.
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-gray-300 h-4 rounded-full w-0"></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">0% completado</p>
          </div>
        </div>
      </main>

      {/* ===== MENÚ INFERIOR ===== */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-full shadow-2xl flex gap-10 z-50">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1 hover:text-green-400 transition-colors"
        >
          <Map size={24} />
          <span className="text-xs font-bold">Mapa</span>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1 hover:text-yellow-400 transition-colors"
        >
          <Trophy size={24} />
          <span className="text-xs font-bold">Logros</span>
        </motion.button>
        
        <Link href="/progreso">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 hover:text-blue-400 transition-colors"
          >
            <div className="bg-slate-700 p-1.5 rounded-lg">
              <TrendingUp size={18} />
            </div>
            <span className="text-xs font-bold text-slate-300">Progreso</span>
          </motion.button>
        </Link>
      </nav>

      {/* Espaciado para el menú inferior */}
      <div className="h-24"></div>
    </div>
  );
}