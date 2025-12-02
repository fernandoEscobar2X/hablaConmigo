"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Volume2, CheckCircle, XCircle, Mic, MicOff, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import confetti from 'canvas-confetti';

// ============================================================
// CONFIGURACIÓN - Cambiar si el servidor está en otra dirección
// ============================================================
const API_URL = 'http://localhost:5000';

// ============================================================
// HOOK: Text-to-Speech usando pyttsx3 (backend Python)
// ============================================================
function useTextToSpeechPython() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (texto: string) => {
    setIsSpeaking(true);
    setError(null);

    try {
      // Llamar al endpoint /api/hablar del servidor Python
      const response = await fetch(`${API_URL}/api/hablar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto })
      });

      const data = await response.json();

      if (data.exito && data.audio) {
        // Decodificar el audio base64 recibido
        const audioBytes = atob(data.audio);
        const arrayBuffer = new ArrayBuffer(audioBytes.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioBytes.length; i++) {
          view[i] = audioBytes.charCodeAt(i);
        }

        // Crear blob y reproducir
        const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          setError('Error al reproducir audio');
        };

        await audio.play();
      } else {
        throw new Error(data.error || 'Error al generar audio');
      }
    } catch (err) {
      console.error('Error TTS:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
      setIsSpeaking(false);
    }
  }, []);

  return { speak, isSpeaking, error };
}

// ============================================================
// HOOK: Speech-to-Text usando speech_recognition (backend Python)
// ============================================================
function useSpeechRecognitionPython(options: {
  onResult?: (texto: string) => void;
} = {}) {
  const { onResult } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startListening = useCallback(async () => {
    setTranscript('');
    setError(null);

    try {
      // Pedir permiso del micrófono del navegador
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Determinar el formato de audio soportado
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Detener todas las pistas del stream
        stream.getTracks().forEach(track => track.stop());
        
        // Crear blob con el audio grabado
        const audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
        
        console.log(`Audio grabado: ${audioBlob.size} bytes, tipo: ${audioBlob.type}`);
        
        // Convertir a base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          
          try {
            // Enviar al servidor Python para transcribir con speech_recognition
            const response = await fetch(`${API_URL}/api/transcribir`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64 })
            });

            const data = await response.json();

            if (data.exito && data.texto) {
              console.log('Transcripción recibida:', data.texto);
              setTranscript(data.texto);
              onResult?.(data.texto);
            } else {
              const errorMsg = data.error || 'No se pudo transcribir el audio';
              console.log('Error de transcripción:', errorMsg);
              setError(errorMsg);
              setTranscript('');
            }
          } catch (err) {
            console.error('Error de conexión:', err);
            setError('Error de conexión con el servidor');
          }
          
          setIsListening(false);
        };
        
        reader.readAsDataURL(audioBlob);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsListening(true);

      console.log('Grabación iniciada...');

      // Detener automáticamente después de 4 segundos
      setTimeout(() => {
        if (recorder.state === 'recording') {
          console.log('Deteniendo grabación automáticamente...');
          recorder.stop();
        }
      }, 4000);

    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      setError('No se pudo acceder al micrófono. Verifica los permisos.');
      setIsListening(false);
    }
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsListening(false);
  }, [mediaRecorder]);

  return { 
    startListening, 
    stopListening, 
    isListening, 
    transcript, 
    error,
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices 
  };
}

// ============================================================
// DATOS DE LOS EJERCICIOS
// ============================================================

interface Ejercicio {
  id: number;
  imagen: string;
  palabraCorrecta: string;
  opciones: string[];
  pista: string;
}

const ejercicios: Ejercicio[] = [
  {
    id: 1,
    imagen: '🥑',
    palabraCorrecta: 'El Aguacate',
    opciones: ['La Manzana', 'El Aguacate', 'El Tomate'],
    pista: '¿Qué es esto? Es verde por dentro y se usa para hacer guacamole.'
  },
  {
    id: 2,
    imagen: '🌽',
    palabraCorrecta: 'El Elote',
    opciones: ['El Elote', 'La Zanahoria', 'El Pepino'],
    pista: '¿Qué es esto? Es amarillo y se come en las ferias con mayonesa y chile.'
  },
  {
    id: 3,
    imagen: '🦎',
    palabraCorrecta: 'El Ajolote',
    opciones: ['La Rana', 'El Ajolote', 'El Pez'],
    pista: '¿Qué es esto? Es un animalito mexicano que vive en el agua y tiene branquias.'
  },
  {
    id: 4,
    imagen: '🌮',
    palabraCorrecta: 'El Taco',
    opciones: ['La Torta', 'El Taco', 'El Burrito'],
    pista: '¿Qué es esto? Es una tortilla doblada con carne y salsa.'
  },
  {
    id: 5,
    imagen: '🍫',
    palabraCorrecta: 'El Chocolate',
    opciones: ['El Café', 'El Chocolate', 'La Leche'],
    pista: '¿Qué es esto? Es dulce, de color café, y México es famoso por hacerlo.'
  }
];

// ============================================================
// COMPONENTE PRINCIPAL DE LA ACTIVIDAD
// ============================================================

export default function Actividad() {
  // Estados del ejercicio
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [estado, setEstado] = useState<'espera' | 'correcto' | 'error'>('espera');
  const [puntos, setPuntos] = useState(0);
  const [servidorConectado, setServidorConectado] = useState<boolean | null>(null);

  // Datos del ejercicio actual
  const ejercicio = ejercicios[ejercicioActual];
  const progreso = ((ejercicioActual + (estado === 'correcto' ? 1 : 0)) / ejercicios.length) * 100;
  const esUltimoEjercicio = ejercicioActual === ejercicios.length - 1;

  // Hook de Text-to-Speech (pyttsx3)
  const { speak, isSpeaking } = useTextToSpeechPython();

  // Función para verificar respuesta por voz
  const verificarRespuestaVoz = useCallback((texto: string) => {
    const respuestaNormalizada = texto.toLowerCase().trim();
    const palabraCorrecta = ejercicio.palabraCorrecta.toLowerCase();
    
    // Extraer palabra clave sin artículos
    const palabraClave = palabraCorrecta
      .replace('el ', '')
      .replace('la ', '')
      .replace('los ', '')
      .replace('las ', '');
    
    console.log(`Verificando: "${respuestaNormalizada}" contiene "${palabraClave}"?`);
    
    if (respuestaNormalizada.includes(palabraClave)) {
      manejarRespuesta(true);
    } else {
      manejarRespuesta(false);
    }
  }, [ejercicio.palabraCorrecta]);

  // Hook de Speech-to-Text (speech_recognition)
  const { 
    startListening, 
    stopListening, 
    isListening, 
    transcript,
    error: errorVoz,
    isSupported: micSupported 
  } = useSpeechRecognitionPython({
    onResult: verificarRespuestaVoz
  });

  // Verificar conexión con el servidor Python al cargar
  useEffect(() => {
    const verificarConexion = async () => {
      try {
        const response = await fetch(`${API_URL}/api/salud`, {
          method: 'GET',
          // Timeout de 3 segundos
          signal: AbortSignal.timeout(3000)
        });
        const data = await response.json();
        setServidorConectado(data.estado === 'activo');
        console.log('Servidor Python conectado:', data);
      } catch (err) {
        console.error('No se pudo conectar al servidor Python:', err);
        setServidorConectado(false);
      }
    };
    
    verificarConexion();
    
    // Re-verificar cada 10 segundos
    const intervalo = setInterval(verificarConexion, 10000);
    return () => clearInterval(intervalo);
  }, []);

  // Leer la pista automáticamente al cambiar de ejercicio
  useEffect(() => {
    if (servidorConectado && estado === 'espera') {
      const timer = setTimeout(() => {
        speak(ejercicio.pista);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [ejercicioActual, servidorConectado, estado]);

  // Manejar respuesta (correcta o incorrecta)
  const manejarRespuesta = (esCorrecta: boolean) => {
    if (estado === 'correcto') return; // Evitar doble respuesta
    
    if (esCorrecta) {
      setEstado('correcto');
      setPuntos(p => p + 100);
      
      // Efecto de confeti
      confetti({ 
        particleCount: 100, 
        spread: 70, 
        origin: { y: 0.6 },
        colors: ['#22c55e', '#eab308', '#3b82f6']
      });
      
      // Felicitación por voz
      speak('¡Muy bien! ¡Excelente trabajo!');
      
      // Avanzar al siguiente ejercicio
      if (!esUltimoEjercicio) {
        setTimeout(() => {
          setEjercicioActual(e => e + 1);
          setEstado('espera');
        }, 2500);
      }
    } else {
      setEstado('error');
      speak('Inténtalo de nuevo, tú puedes.');
      
      setTimeout(() => {
        setEstado('espera');
      }, 1500);
    }
  };

  // Reproducir la pista de audio
  const reproducirPista = () => {
    if (!isSpeaking) {
      speak(ejercicio.pista);
    }
  };

  // ============================================================
  // RENDERIZADO
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-sky-100 flex flex-col p-4">
      
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <Link 
          href="/" 
          className="bg-white p-3 rounded-xl border-b-4 border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-600 font-bold flex gap-2 items-center transition-all"
        >
          <ArrowLeft size={20} /> Regresar al Mapa
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Indicador de conexión con servidor Python */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            servidorConectado === null 
              ? 'bg-gray-100 text-gray-500'
              : servidorConectado 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {servidorConectado === null ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Conectando...
              </>
            ) : servidorConectado ? (
              <><Wifi size={16} /> Python Activo</>
            ) : (
              <><WifiOff size={16} /> Sin Servidor</>
            )}
          </div>

          {/* Puntos */}
          <div className="bg-yellow-100 px-4 py-2 rounded-xl text-yellow-700 font-bold border border-yellow-200 flex items-center gap-2">
            <span className="text-xl">⭐</span> {puntos} puntos
          </div>
        </div>
      </div>

      {/* ===== AVISO DE CONEXIÓN ===== */}
      {servidorConectado === false && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-center"
        >
          <p className="font-bold mb-1">⚠️ No hay conexión con el servidor de voz</p>
          <p className="text-sm">
            Ejecuta en la terminal: <code className="bg-red-100 px-2 py-1 rounded font-mono">python servidor_voz.py</code>
          </p>
        </motion.div>
      )}

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="max-w-3xl mx-auto w-full flex-1 flex flex-col items-center">
        
        {/* Barra de Progreso */}
        <div className="w-full h-6 bg-gray-200 rounded-full mb-4 border-2 border-gray-300 overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progreso}%` }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-400 to-green-500"
          />
        </div>

        {/* Indicador de ejercicio */}
        <p className="text-gray-500 mb-4 font-medium">
          Ejercicio {ejercicioActual + 1} de {ejercicios.length}
        </p>

        {/* ===== TARJETA DEL EJERCICIO ===== */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-sky-200 mb-6 w-full text-center relative">
          
          {/* Etiqueta de pregunta */}
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-blue-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
            ¿Qué es esto?
          </span>

          {/* Imagen/Emoji del ejercicio */}
          <motion.div 
            key={ejercicio.id}
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="w-48 h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl mx-auto mb-6 flex items-center justify-center text-8xl shadow-inner border-2 border-gray-200"
          >
            {ejercicio.imagen}
          </motion.div>

          {/* ===== CONTROLES DE VOZ ===== */}
          <div className="flex justify-center gap-4 mb-4">
            
            {/* Botón de Audio (Text-to-Speech con pyttsx3) */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={reproducirPista}
              disabled={isSpeaking || !servidorConectado}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isSpeaking 
                  ? 'bg-green-500 text-white animate-pulse shadow-green-300' 
                  : servidorConectado
                    ? 'bg-sky-100 text-sky-700 hover:bg-sky-200 border-2 border-sky-300'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Escuchar instrucción"
              title="Escuchar (usa pyttsx3)"
            >
              <Volume2 size={36} />
            </motion.button>

            {/* Botón de Micrófono (Speech-to-Text con speech_recognition) */}
            {micSupported && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopListening : startListening}
                disabled={!servidorConectado || estado === 'correcto'}
                className={`p-4 rounded-full transition-all shadow-lg ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-red-300' 
                    : servidorConectado && estado !== 'correcto'
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-2 border-orange-300'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label={isListening ? 'Detener grabación' : 'Responder con voz'}
                title="Hablar (usa speech_recognition)"
              >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
              </motion.button>
            )}
          </div>

          {/* Indicador de escucha activa */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-orange-600 font-bold flex items-center justify-center gap-2"
              >
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
                Te estoy escuchando... di tu respuesta
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mostrar transcripción */}
          {transcript && !isListening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-gray-500 italic"
            >
              Escuché: "<span className="text-gray-700 font-medium">{transcript}</span>"
            </motion.p>
          )}

          {/* Mostrar error de voz */}
          {errorVoz && !isListening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-red-500 text-sm"
            >
              {errorVoz}
            </motion.p>
          )}
        </div>

        {/* ===== OPCIONES DE RESPUESTA ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
          {ejercicio.opciones.map((palabra, index) => (
            <motion.button
              key={palabra}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => manejarRespuesta(palabra === ejercicio.palabraCorrecta)}
              disabled={estado === 'correcto'}
              className={`
                p-5 rounded-2xl text-xl font-bold border-b-4 transition-all shadow-md
                ${estado === 'correcto' && palabra === ejercicio.palabraCorrecta 
                  ? 'bg-green-500 text-white border-green-700 shadow-green-200' 
                  : estado === 'error' && palabra !== ejercicio.palabraCorrecta
                    ? 'bg-gray-100 text-gray-400 border-gray-200' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-sky-50 hover:border-sky-400 hover:shadow-lg'}
              `}
            >
              {palabra}
            </motion.button>
          ))}
        </div>

        {/* Instrucción de uso */}
        {servidorConectado && estado === 'espera' && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-sm text-center mb-4"
          >
            💡 Toca una opción o presiona el micrófono 🎤 para responder con tu voz
          </motion.p>
        )}

        {/* ===== FEEDBACK VISUAL ===== */}
        <AnimatePresence mode="wait">
          {estado === 'correcto' && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-green-100 text-green-800 px-8 py-4 rounded-2xl flex items-center gap-4 text-2xl font-black border-2 border-green-400 shadow-lg"
            >
              <CheckCircle size={32} className="text-green-600" /> 
              ¡Excelente! +100 puntos
            </motion.div>
          )}
          
          {estado === 'error' && (
            <motion.div 
              initial={{ x: 0 }} 
              animate={{ x: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="bg-orange-100 text-orange-800 px-8 py-4 rounded-2xl flex items-center gap-4 text-xl font-bold border-2 border-orange-300 shadow-lg"
            >
              <XCircle size={32} className="text-orange-600" /> 
              Inténtalo de nuevo
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== PANTALLA DE FINALIZACIÓN ===== */}
        {esUltimoEjercicio && estado === 'correcto' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 text-center bg-white p-8 rounded-3xl shadow-xl border-4 border-green-200"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <p className="text-3xl font-black text-green-700 mb-2">
              ¡Felicidades!
            </p>
            <p className="text-xl text-gray-600 mb-6">
              Completaste todos los ejercicios con <span className="font-bold text-yellow-600">{puntos} puntos</span>
            </p>
            <Link 
              href="/"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-green-600 hover:to-green-700 transition-all inline-block shadow-lg hover:shadow-xl"
            >
              Volver al Mapa 🗺️
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}