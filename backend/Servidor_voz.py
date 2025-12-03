"""
Servidor de Voz para HablaConmigo
Backend Python con Flask usando las librerías vistas en clase:
- speech_recognition (STT - Speech to Text)
- pyttsx3 (TTS - Text to Speech)

Universidad Veracruzana - Interfaces de Usuario Avanzadas
Periodo: agosto 2025 - enero 2026
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
import pyttsx3
import os
import tempfile
import base64
import threading
import time
import subprocess

app = Flask(__name__)
CORS(app)  # Permitir peticiones desde el frontend Next.js

# ============ CONFIGURACIÓN DE VOZ ============

def crear_motor_voz():
    """Crear y configurar el motor de síntesis de voz"""
    motor = pyttsx3.init()
    
    # Configurar voz en español
    voces = motor.getProperty('voices')
    for voz in voces:
        if 'spanish' in voz.name.lower() or 'español' in voz.name.lower() or 'es_' in voz.id.lower():
            motor.setProperty('voice', voz.id)
            break
    
    # Velocidad más lenta para niños (normal es ~200)
    motor.setProperty('rate', 150)
    
    # Volumen (0.0 a 1.0)
    motor.setProperty('volume', 0.9)
    
    return motor

# Inicializar reconocedor de voz
reconocedor = sr.Recognizer()

# ============ RUTAS DEL API ============

@app.route('/api/salud', methods=['GET'])
def salud():
    """Verificar que el servidor está funcionando"""
    return jsonify({
        'estado': 'activo',
        'mensaje': 'Servidor de voz HablaConmigo funcionando correctamente',
        'librerias': {
            'speech_recognition': sr.__version__,
            'pyttsx3': 'instalado'
        }
    })


@app.route('/api/hablar', methods=['POST'])
def hablar():
    """
    Text-to-Speech: Convierte texto a audio usando pyttsx3
    Recibe: { "texto": "Hola, ¿qué es esto?" }
    Retorna: archivo de audio en base64
    """
    try:
        datos = request.get_json()
        texto = datos.get('texto', '')
        
        if not texto:
            return jsonify({'error': 'No se proporcionó texto'}), 400
        
        print(f"🔊 Generando audio para: {texto}")
        
        # Crear archivo temporal para el audio
        archivo_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        archivo_temp.close()
        
        # Generar audio con pyttsx3
        motor = crear_motor_voz()
        motor.save_to_file(texto, archivo_temp.name)
        motor.runAndWait()
        
        # Esperar a que el archivo se escriba completamente
        time.sleep(0.3)
        
        # Verificar que el archivo existe y tiene contenido
        if not os.path.exists(archivo_temp.name) or os.path.getsize(archivo_temp.name) == 0:
            # Fallback: intentar de nuevo
            motor = crear_motor_voz()
            motor.save_to_file(texto, archivo_temp.name)
            motor.runAndWait()
            time.sleep(0.5)
        
        # Leer el archivo y convertir a base64
        with open(archivo_temp.name, 'rb') as f:
            audio_bytes = f.read()
        
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Limpiar archivo temporal
        try:
            os.unlink(archivo_temp.name)
        except:
            pass
        
        print(f"✅ Audio generado exitosamente ({len(audio_bytes)} bytes)")
        
        return jsonify({
            'exito': True,
            'audio': audio_base64,
            'formato': 'wav',
            'texto': texto
        })
        
    except Exception as e:
        print(f"❌ Error en TTS: {e}")
        return jsonify({'error': str(e), 'exito': False}), 500


@app.route('/api/hablar-directo', methods=['POST'])
def hablar_directo():
    """
    Text-to-Speech directo: Reproduce el audio en las bocinas del servidor
    Útil para pruebas locales cuando frontend y backend están en la misma máquina
    """
    try:
        datos = request.get_json()
        texto = datos.get('texto', '')
        
        if not texto:
            return jsonify({'error': 'No se proporcionó texto'}), 400
        
        print(f"🔊 Reproduciendo en servidor: {texto}")
        
        # Ejecutar en un hilo separado para no bloquear
        def reproducir():
            motor = crear_motor_voz()
            motor.say(texto)
            motor.runAndWait()
        
        hilo = threading.Thread(target=reproducir)
        hilo.start()
        
        return jsonify({
            'exito': True,
            'mensaje': f'Reproduciendo: {texto}'
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e), 'exito': False}), 500


@app.route('/api/escuchar', methods=['POST'])
def escuchar():
    """
    Speech-to-Text: Escucha desde el micrófono del servidor usando speech_recognition
    Retorna: texto reconocido
    """
    try:
        datos = request.get_json() if request.is_json else {}
        duracion = datos.get('duracion', 5)  # segundos de escucha
        
        print(f"🎤 Escuchando por {duracion} segundos...")
        
        with sr.Microphone() as fuente:
            # Ajustar al ruido ambiente
            reconocedor.adjust_for_ambient_noise(fuente, duration=0.5)
            
            # Escuchar
            audio = reconocedor.listen(fuente, timeout=duracion, phrase_time_limit=duracion)
            
            # Reconocer con Google (español de México)
            texto = reconocedor.recognize_google(audio, language="es-MX")
            print(f"✅ Reconocido: {texto}")
            
            return jsonify({
                'exito': True,
                'texto': texto
            })
            
    except sr.WaitTimeoutError:
        print("⏱️ Timeout - no se detectó sonido")
        return jsonify({
            'exito': False,
            'error': 'No se detectó sonido',
            'texto': ''
        })
    except sr.UnknownValueError:
        print("❓ No se pudo entender el audio")
        return jsonify({
            'exito': False,
            'error': 'No se pudo entender el audio',
            'texto': ''
        })
    except sr.RequestError as e:
        print(f"🌐 Error del servicio: {e}")
        return jsonify({
            'exito': False,
            'error': f'Error del servicio de reconocimiento: {e}',
            'texto': ''
        })
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e), 'exito': False}), 500


@app.route('/api/transcribir', methods=['POST'])
def transcribir():
    """
    Speech-to-Text desde archivo de audio usando speech_recognition
    CORREGIDO: Convierte WebM a WAV usando ffmpeg antes de transcribir
    Recibe: archivo de audio en base64 (WebM del navegador)
    Retorna: texto reconocido
    """
    try:
        datos = request.get_json()
        audio_base64 = datos.get('audio', '')
        
        if not audio_base64:
            return jsonify({'error': 'No se proporcionó audio', 'exito': False}), 400
        
        print("🎤 Procesando audio recibido...")
        
        # Decodificar audio base64
        audio_bytes = base64.b64decode(audio_base64)
        print(f"📦 Audio recibido: {len(audio_bytes)} bytes")
        
        # Guardar como archivo temporal WebM (formato del navegador)
        webm_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.webm')
        webm_temp.write(audio_bytes)
        webm_temp.close()
        webm_path = webm_temp.name
        
        # Ruta para el archivo WAV convertido
        wav_path = webm_path.replace('.webm', '.wav')
        
        # CONVERTIR DE WEBM A WAV USANDO FFMPEG
        print("🔄 Convirtiendo WebM a WAV con ffmpeg...")
        
        comando = [
            'ffmpeg', '-y',           # -y para sobrescribir sin preguntar
            '-i', webm_path,          # archivo de entrada
            '-acodec', 'pcm_s16le',   # codec de audio WAV estándar
            '-ar', '16000',           # sample rate 16kHz (bueno para voz)
            '-ac', '1',               # mono (1 canal)
            wav_path                  # archivo de salida
        ]
        
        resultado = subprocess.run(comando, capture_output=True, text=True)
        
        # Eliminar archivo WebM temporal
        try:
            os.unlink(webm_path)
        except:
            pass
        
        if resultado.returncode != 0:
            print(f"❌ Error en ffmpeg: {resultado.stderr}")
            return jsonify({
                'exito': False,
                'error': 'Error al convertir audio. ¿Está instalado ffmpeg?',
                'texto': ''
            })
        
        print(f"✅ Conversión exitosa: {wav_path}")
        
        # Transcribir el WAV con speech_recognition
        try:
            with sr.AudioFile(wav_path) as fuente:
                audio = reconocedor.record(fuente)
                texto = reconocedor.recognize_google(audio, language="es-MX")
                print(f"✅ Transcrito: {texto}")
                
                # Limpiar archivo WAV
                try:
                    os.unlink(wav_path)
                except:
                    pass
                
                return jsonify({
                    'exito': True,
                    'texto': texto
                })
                
        except sr.UnknownValueError:
            print("❓ No se pudo entender el audio")
            try:
                os.unlink(wav_path)
            except:
                pass
            return jsonify({
                'exito': False,
                'error': 'No se pudo entender el audio. Intenta hablar más claro.',
                'texto': ''
            })
        except sr.RequestError as e:
            print(f"🌐 Error del servicio: {e}")
            try:
                os.unlink(wav_path)
            except:
                pass
            return jsonify({
                'exito': False,
                'error': f'Error del servicio de reconocimiento: {e}',
                'texto': ''
            })
        
    except Exception as e:
        print(f"❌ Error general: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'exito': False}), 500


@app.route('/api/verificar-respuesta', methods=['POST'])
def verificar_respuesta():
    """
    Verifica si la respuesta hablada coincide con la correcta
    Recibe: { "transcripcion": "el aguacate", "respuesta_correcta": "El Aguacate" }
    """
    try:
        datos = request.get_json()
        transcripcion = datos.get('transcripcion', '').lower().strip()
        respuesta_correcta = datos.get('respuesta_correcta', '').lower().strip()
        
        # Extraer palabra clave (sin artículos)
        palabra_clave = respuesta_correcta
        for articulo in ['el ', 'la ', 'los ', 'las ', 'un ', 'una ']:
            palabra_clave = palabra_clave.replace(articulo, '')
        
        # Verificar coincidencia
        es_correcta = palabra_clave in transcripcion
        
        print(f"🔍 Verificando: '{transcripcion}' contiene '{palabra_clave}'? {es_correcta}")
        
        return jsonify({
            'exito': True,
            'es_correcta': es_correcta,
            'transcripcion': transcripcion,
            'palabra_buscada': palabra_clave
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e), 'exito': False}), 500


# ============ INICIAR SERVIDOR ============

if __name__ == '__main__':
    print()
    print("=" * 60)
    print("🎙️  SERVIDOR DE VOZ - HABLACONMIGO")
    print("   Universidad Veracruzana - Interfaces de Usuario Avanzadas")
    print("=" * 60)
    print()
    
    # Verificar que ffmpeg esté instalado
    try:
        resultado = subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=5)
        if resultado.returncode == 0:
            print("✅ ffmpeg está instalado correctamente")
        else:
            print("⚠️  ffmpeg encontrado pero con errores")
    except FileNotFoundError:
        print("❌ ffmpeg NO está instalado")
        print("   El reconocimiento de voz NO funcionará sin ffmpeg.")
        print("   Instálalo con: winget install ffmpeg")
    except Exception as e:
        print(f"⚠️  Error verificando ffmpeg: {e}")
    
    print()
    print("📚 Librerías utilizadas (vistas en clase):")
    print(f"   • speech_recognition v{sr.__version__}")
    print("   • pyttsx3")
    print()
    print("🔌 Endpoints disponibles:")
    print("   GET  /api/salud              - Verificar estado del servidor")
    print("   POST /api/hablar             - Texto → Audio (pyttsx3)")
    print("   POST /api/hablar-directo     - Reproducir en servidor")
    print("   POST /api/escuchar           - Micrófono → Texto (speech_recognition)")
    print("   POST /api/transcribir        - Audio → Texto (speech_recognition)")
    print("   POST /api/verificar-respuesta - Verificar si respuesta es correcta")
    print()
    print("=" * 60)
    print("🚀 Iniciando servidor en http://localhost:5000")
    print("   Presiona Ctrl+C para detener")
    print("=" * 60)
    print()
    
    app.run(debug=True, port=5000, host='0.0.0.0')