"use client";
import React from 'react';
import { ArrowLeft, TrendingUp, Calendar, Clock, AlertCircle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ============================================================
// DATOS DE PROGRESO (en producción vendrían de una base de datos)
// ============================================================

const datosProgreso = {
  paciente: {
    nombre: 'Leo',
    edad: 6,
    ultimaSesion: 'Hoy'
  },
  estadisticas: {
    aciertos: 85,
    cambioAciertos: 5,
    racha: 4,
    tiempoPromedio: 15
  },
  areas: [
    { nombre: 'Semántica (Vocabulario)', porcentaje: 90, estado: 'Excelente', color: 'green' },
    { nombre: 'Fonología (Pronunciación)', porcentaje: 65, estado: 'En Progreso', color: 'orange' },
    { nombre: 'Morfosintaxis (Oraciones)', porcentaje: 78, estado: 'Bueno', color: 'blue' }
  ],
  focoAtencion: {
    titulo: 'Foco de Atención',
    descripcion: 'Se detectaron dificultades recurrentes con el fonema /r/ vibrante (ej. "ratón", "carro") y combinaciones trabadas.',
    recomendacion: 'Ver ejercicios recomendados'
  },
  tipCasa: {
    titulo: 'Tip para Casa 🏠',
    descripcion: 'Aprovecha la hora de la comida para practicar palabras como "Tortilla" y "Frijol", reforzando lo aprendido en la app.'
  }
};

// ============================================================
// COMPONENTE PRINCIPAL - PANEL DE PROGRESO
// ============================================================

export default function Progreso() {
  const { paciente, estadisticas, areas, focoAtencion, tipCasa } = datosProgreso;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6">
      
      {/* ===== HEADER ===== */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/" 
            className="bg-white p-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800">
              Panel de Seguimiento Clínico
            </h1>
            <p className="text-gray-500">
              Paciente: {paciente.nombre} ({paciente.edad} años) | Última sesión: {paciente.ultimaSesion}
            </p>
          </div>
        </div>

        {/* ===== TARJETAS DE ESTADÍSTICAS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Aciertos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-100"
          >
            <div className="flex items-center gap-2 text-green-600 font-bold mb-2">
              <TrendingUp size={20} />
              ACIERTOS
            </div>
            <p className="text-4xl font-black text-gray-800">{estadisticas.aciertos}%</p>
            <p className="text-sm text-green-600">↑ {estadisticas.cambioAciertos}% vs semana pasada</p>
          </motion.div>

          {/* Racha */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-100"
          >
            <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
              <Calendar size={20} />
              RACHA
            </div>
            <p className="text-4xl font-black text-gray-800">{estadisticas.racha} Días</p>
            <p className="text-sm text-gray-500">Consistencia media</p>
          </motion.div>

          {/* Tiempo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100"
          >
            <div className="flex items-center gap-2 text-purple-600 font-bold mb-2">
              <Clock size={20} />
              TIEMPO
            </div>
            <p className="text-4xl font-black text-gray-800">{estadisticas.tiempoPromedio}m</p>
            <p className="text-sm text-gray-500">Promedio por sesión</p>
          </motion.div>
        </div>

        {/* ===== CONTENIDO PRINCIPAL ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ===== DESEMPEÑO POR ÁREA ===== */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100"
          >
            <h2 className="text-xl font-black text-gray-800 mb-6">
              Desempeño por Área Lingüística
            </h2>
            
            <div className="space-y-6">
              {areas.map((area, index) => (
                <div key={area.nombre}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{area.nombre}</span>
                    <span className={`font-bold ${
                      area.color === 'green' ? 'text-green-600' :
                      area.color === 'orange' ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {area.estado} ({area.porcentaje}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${area.porcentaje}%` }}
                      transition={{ duration: 1, delay: 0.5 + (index * 0.2) }}
                      className={`h-4 rounded-full ${
                        area.color === 'green' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        area.color === 'orange' ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-blue-400 to-blue-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ===== PANEL LATERAL ===== */}
          <div className="space-y-6">
            
            {/* Foco de Atención */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl shadow-lg border-2 border-red-100"
            >
              <div className="flex items-center gap-2 text-red-600 font-bold mb-3">
                <AlertCircle size={20} />
                {focoAtencion.titulo}
              </div>
              <p className="text-gray-700 text-sm mb-4">
                {focoAtencion.descripcion}
              </p>
              <button className="w-full bg-white text-red-600 px-4 py-2 rounded-xl font-bold border-2 border-red-200 hover:bg-red-50 transition-colors">
                {focoAtencion.recomendacion}
              </button>
            </motion.div>

            {/* Tip para Casa */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl shadow-lg border-2 border-amber-100"
            >
              <div className="flex items-center gap-2 text-amber-700 font-bold mb-3">
                <Lightbulb size={20} />
                {tipCasa.titulo}
              </div>
              <p className="text-gray-700 text-sm">
                {tipCasa.descripcion}
              </p>
            </motion.div>
          </div>
        </div>

        {/* ===== INFORMACIÓN ADICIONAL ===== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100"
        >
          <h2 className="text-xl font-black text-gray-800 mb-4">
            Información para el Terapeuta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-bold text-gray-700 mb-2">Tecnologías utilizadas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Interfaz gráfica (GUI) con React/Next.js</li>
                <li>Interfaz de voz (VUI) con Python</li>
                <li>speech_recognition para reconocimiento</li>
                <li>pyttsx3 para síntesis de voz</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-700 mb-2">Modalidades de interacción:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Táctil: selección de opciones</li>
                <li>Auditiva: instrucciones por voz</li>
                <li>Verbal: respuestas habladas</li>
                <li>Visual: retroalimentación gráfica</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Espaciado inferior */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}