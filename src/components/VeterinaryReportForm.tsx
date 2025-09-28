import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Square, 
  Heart, 
  Stethoscope, 
  FileText, 
  User, 
  MapPin,
  Clock,
  Search,
  Lock,
  Mail,
  Send,
  Calendar,
  Scale,
  Home,
  Utensils
} from 'lucide-react';

const VeterinaryApp = () => {
  // Configurar para iframe
  useEffect(() => {
    if (window.self !== window.top) {
      try {
        window.parent.postMessage({ type: 'app_loaded', source: 'veterinary_app' }, '*');
      } catch (e) {
        console.log('Running in iframe with restricted access');
      }
    }
  }, []);

  // Estados para login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados del formulario principal
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedReport, setSelectedReport] = useState('');
  const [selectedVeterinarian, setSelectedVeterinarian] = useState('');
  const [audioData, setAudioData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [petData, setPetData] = useState({
    name: '',
    tutorName: '',
    species: '',
    sex: '',
    status: '',
    microchip: '',
    hasMicrochip: false,
    referenceClinic: '',
    additionalInfo: '',
    // Nuevos campos
    nhc: '',
    birthDate: '',
    breed: '',
    weight: '',
    habitat: '',
    diet: ''
  });

  // Webhook URL fijo
  const WEBHOOK_URL = 'https://automatizacion.aigencia.ai/webhook/c4e16388-532b-4a73-b6c1-d1f7e318041c';

  const reportTypes = [
    { value: 'anamnesis', label: 'Anamnesis', icon: FileText },
    { value: 'ecocardio', label: 'Informe ecocardio', icon: Heart },
    { value: 'cardiaco', label: 'Informe cardíaco', icon: Heart },
    { value: 'ecografia-general', label: 'Informe ecografía general', icon: Stethoscope },
    { value: 'consulta', label: 'Informe consulta', icon: FileText },
    { value: 'ecografia-abdomen', label: 'Ecografía abdomen', icon: Stethoscope }
  ];

  const veterinariansList = [
    { id: '001', name: 'Antonio' },
    { id: '002', name: 'Miguel' },
    { id: '003', name: 'Dra. Ana López' }
  ];

  const clinicsList = [
    { address: 'C/ lafuente, 32' }
  ];

  const speciesList = ['Perro', 'Gato', 'Conejo', 'Otro'];
  const sexList = ['Macho', 'Hembra'];
  const statusList = ['Entero', 'Castrado'];
  
  // Nuevas listas para los campos adicionales
  const breedsList = {
    perro: ['Labrador', 'Pastor Alemán', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire', 'Chihuahua', 'Mestizo', 'Otro'],
    gato: ['Persa', 'Siamés', 'Maine Coon', 'Británico', 'Ragdoll', 'Bengalí', 'Sphynx', 'Angora', 'Mestizo', 'Otro'],
    conejo: ['Holandés', 'Angora', 'Rex', 'Cabeza de León', 'Mini Lop', 'Flemish Giant', 'Mestizo', 'Otro'],
    otro: ['Mixta', 'Desconocida', 'Otro']
  };

  const habitatList = ['Doméstico interior', 'Doméstico exterior', 'Mixto (interior/exterior)', 'Granja', 'Refugio', 'Otro'];
  const dietList = ['Pienso comercial', 'Dieta casera', 'Dieta mixta', 'Dieta BARF', 'Dieta veterinaria', 'Otro'];

  // Función para formatear fecha para el input date
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Función de login
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      showToast("Error", "Por favor complete todos los campos", "destructive");
      return;
    }

    setIsLoggingIn(true);

    try {
      const loginWebhookUrl = "https://automatizacion.aigencia.ai/webhook/8fb72b52-94d5-42c3-b6f6-3600d8a8ae40";
      const formData = new FormData();
      formData.append('email', loginData.email);
      formData.append('password', loginData.password);

      const response = await fetch(loginWebhookUrl, {
        method: "POST",
        headers: {
          "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site"
        },
        body: formData
      });

      if (response.ok) {
        setIsLoggedIn(true);
        showToast("Login exitoso", `Bienvenido ${loginData.email}`);
      } else {
        console.error("Error del servidor:", response.status, response.statusText);
        showToast("Error", `Error del servidor (${response.status}). Credenciales inválidas o problema en el servidor.`, "destructive");
      }

    } catch (error) {
      console.error("Error en login:", error);
      showToast("Error", "Error de conexión al servidor. Por favor verifique su conexión e intente nuevamente.", "destructive");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ email: '', password: '' });
    clearForm();
  };

  // Función para mostrar notificaciones
  const showToast = (title, description, variant = "default") => {
    console.log(`Toast: ${title} - ${description}`);
    if (variant === "destructive") {
      alert(`Error: ${description}`);
    } else {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #10b981; color: white; padding: 16px 24px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-weight: 500; animation: slideIn 0.3s ease-out;
      `;
      notification.textContent = description;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    }
  };

  // Efecto de limpieza para el temporizador
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [recordingTimer]);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          } 
        });

        let mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/webm;codecs=opus';
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        const audioChunks = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          const reader = new FileReader();
          
          reader.onloadend = () => {
            let base64String = reader.result;
            if (mimeType.includes('webm')) {
              base64String = base64String.replace('data:audio/webm', 'data:audio/mp4');
            }
            setAudioData(base64String);
            showToast("Audio Guardado", `Grabación completada (${formatTime(recordingTime)})`);
          };
          
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setRecordingTime(0);

        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setRecordingTimer(timer);

      } catch (error) {
        console.error('Error accessing microphone:', error);
        showToast("Error", "No se pudo acceder al micrófono. Verifique los permisos.", "destructive");
      }
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateReport = async () => {
    if (!petData.name || !petData.tutorName || !selectedReport || !petData.species || !petData.sex || !petData.status) {
      showToast("Error", "Por favor complete los campos obligatorios", "destructive");
      return;
    }

    setIsLoading(true);

    try {
      const selectedVet = veterinariansList.find(vet => vet.id === selectedVeterinarian);
      
      const requestData = {
        createdAt: new Date().toISOString(),
        loggedIn: true,
        user: loginData.email,
        clientName: petData.name,
        tutorName: petData.tutorName,
        selectedReport: reportTypes.find(report => report.value === selectedReport)?.label || selectedReport,
        species: petData.species,
        sex: petData.sex,
        sterilization: petData.status,
        referralClinic: petData.referenceClinic || '',
        hasMicrochip: petData.hasMicrochip,
        microchipNumber: petData.hasMicrochip ? petData.microchip : '',
        infoAdicional: petData.additionalInfo || '',
        audioData: audioData || '',
        reportFileID: '',
        selectedVet: selectedVet ? selectedVet.name.replace(/^Dr\.|^Dra\./, '').trim() : null,
        selectedClinic: {
          address: 'C/ lafuente, 32'
        },
        vetList: veterinariansList.map(vet => ({
          name: vet.name,
          number: vet.id
        })),
        clinicList: clinicsList,
        // Nuevos campos
        nhc: petData.nhc || '',
        birthDate: petData.birthDate || '',
        breed: petData.breed || '',
        weight: petData.weight || '',
        habitat: petData.habitat || '',
        diet: petData.diet || ''
      };

      const formData = new FormData();
      Object.keys(requestData).forEach(key => {
        if (key === 'selectedClinic') {
          formData.append(key, JSON.stringify(requestData[key]));
        } else if (key === 'vetList' || key === 'clinicList') {
          formData.append(key, JSON.stringify(requestData[key]));
        } else {
          formData.append(key, String(requestData[key]));
        }
      });

      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
      });

      showToast("Informe Enviado", "El informe ha sido enviado correctamente al sistema de procesamiento.");

    } catch (error) {
      console.error("Error enviando el informe:", error);
      showToast("Error", "Error al enviar el informe. Por favor intente nuevamente.", "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setPetData({
      name: '',
      tutorName: '',
      species: '',
      sex: '',
      status: '',
      microchip: '',
      hasMicrochip: false,
      referenceClinic: '',
      additionalInfo: '',
      // Limpiar nuevos campos
      nhc: '',
      birthDate: '',
      breed: '',
      weight: '',
      habitat: '',
      diet: ''
    });
    setSelectedReport('');
    setSelectedVeterinarian('');
    setAudioData('');
    setRecordingTime(0);
    showToast("Formulario limpiado", "Todos los campos han sido restablecidos");
  };

  // Pantalla de Login con gradientes
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ 
        minHeight: window.self !== window.top ? '100vh' : 'auto',
        height: window.self !== window.top ? '100vh' : 'auto'
      }}>
        <style jsx>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: auto !important;
          }
        `}</style>
        
        {/* Header con gradiente como en la plantilla */}
        <div className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-400 text-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center space-x-4 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Automatización de informes clínicos</h1>
                <p className="text-cyan-100 text-lg mt-1">Automatización de consultas y reportes médicos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto p-3 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Lock className="h-8 w-8 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
                <p className="text-gray-600 text-sm mt-2">Ingrese sus credenciales para acceder al sistema</p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 px-6 pb-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Usuario
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Usuario"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      className="pl-11 h-12 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 rounded-lg"
                      disabled={isLoggingIn}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Contraseña"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="pl-11 h-12 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 rounded-lg"
                      disabled={isLoggingIn}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg"
              >
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              {/* Información de prueba */}
              <div className="text-center text-xs text-gray-500 bg-gradient-to-r from-cyan-50 to-teal-50 p-3 rounded-lg border border-cyan-200">
                <strong>Datos de prueba:</strong><br />
                Usuario: Testing<br />
                Contraseña: 20202
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Aplicación principal con el nuevo diseño
  return (
    <div className="min-h-screen bg-gray-50" style={{ 
      minHeight: window.self !== window.top ? '100vh' : 'auto',
      height: window.self !== window.top ? '100vh' : 'auto',
      overflow: window.self !== window.top ? 'auto' : 'visible'
    }}>
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        html, body {
          height: 100% !important;
          overflow-x: hidden !important;
        }
        
        .relative {
          z-index: 1;
        }
        
        [data-radix-portal] {
          z-index: 999999 !important;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header principal con gradiente como en la plantilla */}
        <div className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-400 text-white rounded-t-lg">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Automatización de informes clínicos humanos</h1>
                  <p className="text-cyan-100 text-lg mt-1">Automatización de consultas y reportes médicos</p>
                </div>
              </div>
              <Button 
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <User className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Botón Nueva Consulta */}
        <div className="bg-white border-l border-r border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg">
              <FileText className="h-5 w-5 mr-2" />
              Nueva Consulta
            </Button>
          </div>
        </div>

        {/* Resto del contenido */}
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-6 w-6 text-cyan-600" />
              <h2 className="text-xl font-semibold text-gray-800">Registro de Nueva Consulta</h2>
            </div>
          </div>

          {/* Grabación de Consulta - Sección central destacada */}
          <div className="mb-8">
            <Card className="bg-white shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-cyan-100">
                <div className="flex items-center space-x-3">
                  <Mic className="h-6 w-6 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Grabación de Consulta</h2>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-6">
                  {/* Círculo de grabación principal con gradiente */}
                  <div 
                    className={`
                      relative w-32 h-32 bg-gradient-to-br from-cyan-400 via-cyan-500 to-teal-500
                      rounded-full flex items-center justify-center cursor-pointer 
                      shadow-lg hover:shadow-xl transition-all duration-300
                      ${isRecording ? 'pulse-animation bg-gradient-to-br from-red-400 via-red-500 to-red-600' : ''}
                    `}
                    onClick={toggleRecording}
                  >
                    {isRecording ? (
                      <Square className="h-12 w-12 text-white" />
                    ) : (
                      <Mic className="h-12 w-12 text-white" />
                    )}
                    
                    {/* Anillo de grabación animado */}
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                    )}
                  </div>
                  
                  {/* Texto de estado */}
                  <div className="text-center space-y-2">
                    {!isRecording && !audioData && (
                      <p className="text-gray-600 font-medium">Haga clic para comenzar la grabación</p>
                    )}
                    {isRecording && (
                      <>
                        <p className="text-red-600 font-semibold">Grabando...</p>
                        <div className="text-2xl font-mono font-bold text-gray-700">
                          {formatTime(recordingTime)}
                        </div>
                      </>
                    )}
                    {audioData && !isRecording && (
                      <>
                        <p className="text-green-600 font-semibold">✓ Audio guardado</p>
                        <div className="text-lg font-mono text-gray-700">
                          Duración: {formatTime(recordingTime)}
                        </div>
                        <Button
                          onClick={() => {
                            setAudioData('');
                            setRecordingTime(0);
                          }}
                          variant="outline"
                          size="sm"
                          className="mt-2 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Borrar grabación
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Datos de la Consulta */}
          <div className="mb-8">
            <Card className="bg-white shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-cyan-100">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Datos de la Consulta</h2>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Columna 1 */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        Nombre Paciente *
                      </Label>
                      <Input
                        placeholder="Nombre completo del paciente"
                        value={petData.name}
                        onChange={(e) => setPetData({...petData, name: e.target.value})}
                        className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Nombre Cliente
                      </Label>
                      <Input
                        placeholder="Nombre del cliente/referente"
                        value={petData.tutorName}
                        onChange={(e) => setPetData({...petData, tutorName: e.target.value})}
                        className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        NHC
                      </Label>
                      <Input
                        placeholder="Número de Historia Clínica"
                        value={petData.nhc}
                        onChange={(e) => setPetData({...petData, nhc: e.target.value})}
                        className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        Fecha de Nacimiento
                      </Label>
                      <Input
                        type="date"
                        value={formatDateForInput(petData.birthDate)}
                        onChange={(e) => setPetData({...petData, birthDate: e.target.value})}
                        className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Especie *
                      </Label>
                      <Select value={petData.species} onValueChange={(value) => setPetData({...petData, species: value, breed: ''})}>
                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500">
                          <SelectValue placeholder="Seleccionar especie" />
                        </SelectTrigger>
                        <SelectContent>
                          {speciesList.map((species) => (
                            <SelectItem key={species} value={species.toLowerCase()}>
                              {species}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Raza
                      </Label>
                      <Select 
                        value={petData.breed} 
                        onValueChange={(value) => setPetData({...petData, breed: value})}
                        disabled={!petData.species}
                      >
                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500">
                          <SelectValue placeholder={petData.species ? "Seleccionar raza" : "Primero seleccione la especie"} />
                        </SelectTrigger>
                        <SelectContent>
                          {petData.species && breedsList[petData.species] && breedsList[petData.species].map((breed) => (
                            <SelectItem key={breed} value={breed.toLowerCase()}>
                              {breed}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Columna 2 */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Sexo *
                      </Label>
                      <Select value={petData.sex} onValueChange={(value) => setPetData({...petData, sex: value})}>
                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500">
                          <SelectValue placeholder="Seleccionar sexo" />
                        </SelectTrigger>
                        <SelectContent>
                          {sexList.map((sex) => (
                            <SelectItem key={sex} value={sex.toLowerCase()}>
                              {sex}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Estado *
                      </Label>
                      <Select value={petData.status} onValueChange={(value) => setPetData({...petData, status: value})}>
                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusList.map((status) => (
                            <SelectItem key={status} value={status.toLowerCase()}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Scale className="h-4 w-4 mr-2 text-gray-500" />
                        Peso (kg)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Peso en kilogramos"
                        value={petData.weight}
                        onChange={(e) => setPetData({...petData, weight: e.target.value})}
                        className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Home className="h-4 w-4 mr-2 text-gray-500" />
                        Hábitat
                      </Label>
                      <Select value={petData.habitat} onValueChange={(value) => setPetData({...petData, habitat: value})}>
                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500">
                          <SelectValue placeholder="Seleccionar hábitat" />
                        </SelectTrigger>
                        <SelectContent>
                          {habitatList.map((habitat) => (
                            <SelectItem key={habitat} value={habitat.toLowerCase()}>
                              {habitat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Utensils className="h-4 w-4 mr-2 text-gray-500" />
                        Alimentación
                      </Label>
                      <Select value={petData.diet} onValueChange={(value) => setPetData({...petData, diet: value})}>
                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500">
                          <SelectValue placeholder="Seleccionar tipo de alimentación" />
                        </SelectTrigger>
                        <SelectContent>
                          {dietList.map((diet) => (
                            <SelectItem key={diet} value={diet.toLowerCase()}>
                              {diet}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Tipo de Informe *
                      </Label>
                      <Select value={selectedReport} onValueChange={setSelectedReport}>
                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map((report) => (
                            <SelectItem key={report.value} value={report.value}>
                              {report.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Columna 3 */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Doctor *
                      </Label>
                      <Select value={selectedVeterinarian} onValueChange={setSelectedVeterinarian}>
                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500">
                          <SelectValue placeholder="Seleccionar doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {veterinariansList.map((vet) => (
                            <SelectItem key={vet.id} value={vet.id}>
                              {vet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Centro *
                      </Label>
                      <Select value="default" disabled>
                        <SelectTrigger className="h-11 border-gray-300 bg-gray-50">
                          <SelectValue placeholder="Seleccionar centro" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">C/ lafuente, 32</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="has-microchip"
                          checked={petData.hasMicrochip}
                          onCheckedChange={(checked) => 
                            setPetData({...petData, hasMicrochip: checked})
                          }
                        />
                        <Label htmlFor="has-microchip" className="text-sm font-medium text-gray-700">
                          Tiene Microchip
                        </Label>
                      </div>
                      
                      {petData.hasMicrochip && (
                        <Input
                          placeholder="Número de microchip"
                          value={petData.microchip}
                          onChange={(e) => setPetData({...petData, microchip: e.target.value})}
                          className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Clínica de referencia
                      </Label>
                      <Input
                        placeholder="Nombre de la clínica"
                        value={petData.referenceClinic}
                        onChange={(e) => setPetData({...petData, referenceClinic: e.target.value})}
                        className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Información adicional
                      </Label>
                      <Textarea
                        placeholder="Observaciones y comentarios..."
                        value={petData.additionalInfo}
                        onChange={(e) => setPetData({...petData, additionalInfo: e.target.value})}
                        className="min-h-[120px] border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 resize-y"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botón de envío con gradiente */}
          <div className="flex justify-center mb-6">
            <Button 
              onClick={generateReport}
              disabled={isLoading}
              className="w-full max-w-md h-14 bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-500 hover:from-cyan-600 hover:via-cyan-500 hover:to-teal-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg border-0"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Send className="mr-3 h-6 w-6" />
                  Generar informe
                </>
              )}
            </Button>
          </div>

          {/* Botones adicionales */}
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={clearForm}
              className="border-cyan-300 text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50"
            >
              Limpiar Formulario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeterinaryApp;