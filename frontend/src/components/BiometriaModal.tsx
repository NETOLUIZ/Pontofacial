import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, AlertTriangle, RefreshCw, Upload, X, ScanFace, Sparkles } from 'lucide-react';
import { carregarModelosFaciais, extrairDescritorFacial, FaceDescriptorData } from '../services/faceRecognition';

interface BiometriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionarioNome: string;
  onBiometriaSalva: (biometria: FaceDescriptorData) => void;
}

export const BiometriaModal: React.FC<BiometriaModalProps> = ({
  isOpen,
  onClose,
  funcionarioNome,
  onBiometriaSalva,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [modelosCarregados, setModelosCarregados] = useState(false);
  const [carregandoModelos, setCarregandoModelos] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; mensagem: string } | null>(null);
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);
  const [descritorCapturado, setDescritorCapturado] = useState<number[] | null>(null);
  const [capturaConfirmada, setCapturaConfirmada] = useState(false);
  const [rostoDetectado, setRostoDetectado] = useState(false);
  const [agora, setAgora] = useState(new Date());
  const [modoAba, setModoAba] = useState<'camera' | 'upload'>('camera');

  const falar = (mensagem: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(mensagem));
  };

  // Inicializar modelos neurais e câmera
  useEffect(() => {
    if (!isOpen) return;

    let ativo = true;

    async function init() {
      setCarregandoModelos(true);
      setFeedback({ tipo: 'info', mensagem: 'Carregando rede neural de reconhecimento facial...' });
      
      const ok = await carregarModelosFaciais();
      if (!ativo) return;
      
      setModelosCarregados(ok);
      setCarregandoModelos(false);

      if (ok) {
        setFeedback({ tipo: 'info', mensagem: 'Posicione o rosto no centro do círculo para captura.' });
        falar('Posicione o rosto dentro do oval e olhe para a câmera.');
        iniciarCamera();
      } else {
        setFeedback({ tipo: 'erro', mensagem: 'Falha ao carregar modelos biométricos locais.' });
      }
    }

    init();

    return () => {
      ativo = false;
      pararCamera();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setInterval(() => setAgora(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !modelosCarregados || !stream || modoAba !== 'camera') return;
    let ativo = true;
    const timer = window.setInterval(async () => {
      if (!ativo || processando || !videoRef.current || videoRef.current.readyState < 2) return;
      const resultado = await extrairDescritorFacial(videoRef.current);
      if (!ativo) return;
      const detectado = Boolean(resultado);
      setRostoDetectado(detectado);
      if (detectado && !descritorCapturado) falar('Rosto detectado. Toque em confirmar captura.');
    }, 900);
    return () => { ativo = false; window.clearInterval(timer); };
  }, [isOpen, modelosCarregados, stream, modoAba, processando, descritorCapturado]);

  const iniciarCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        videoRef.current.play();
      }
    } catch (err) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Câmera não autorizada ou indisponível. Você também pode enviar uma foto pelo botão Enviar Arquivo.',
      });
    }
  };

  const pararCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  // Capturar frame da câmera e extrair vetor de 128 dimensões
  const capturarDaCamera = async () => {
    if (!videoRef.current || processando) return;

    setProcessando(true);
    setCapturaConfirmada(false);
    setFeedback({ tipo: 'info', mensagem: 'Analisando biometria facial e extraindo 128 pontos neurais...' });

    try {
      // 1. Extrai o descritor biométrico
      const resultado = await extrairDescritorFacial(videoRef.current);

      if (!resultado) {
        setFeedback({
          tipo: 'erro',
          mensagem: 'Nenhum rosto detectado com clareza. Mantenha a cabeça reta, boa iluminação e olhe para a câmera.',
        });
        setProcessando(false);
        return;
      }

      // 2. Tira snapshot fotográfico
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Enquadra o rosto recortado
        const { box } = resultado;
        const padding = 40;
        const sx = Math.max(0, box.x - padding);
        const sy = Math.max(0, box.y - padding);
        const sWidth = Math.min(videoRef.current.videoWidth - sx, box.width + padding * 2);
        const sHeight = Math.min(videoRef.current.videoHeight - sy, box.height + padding * 2);

        ctx.drawImage(videoRef.current, sx, sy, sWidth, sHeight, 0, 0, 320, 320);
        const fotoBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setFotoCapturada(fotoBase64);
      }

      const vetor = Array.from(resultado.descriptor);
      setDescritorCapturado(vetor);
      setRostoDetectado(true);
      falar('Captura realizada com sucesso. Confirme para salvar a biometria.');

      setFeedback({
        tipo: 'sucesso',
        mensagem: `✓ Biometria extraída com sucesso! Confiança neural: ${(resultado.score * 100).toFixed(1)}%`,
      });
    } catch (err: any) {
      setFeedback({ tipo: 'erro', mensagem: 'Erro na análise facial: ' + err.message });
    } finally {
      setProcessando(false);
    }
  };

  // Upload de arquivo de foto
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessando(true);
    setCapturaConfirmada(false);
    setFeedback({ tipo: 'info', mensagem: 'Processando imagem e extraindo descritor facial...' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const img = new Image();
      img.src = base64;
      img.onload = async () => {
        const resultado = await extrairDescritorFacial(img);
        if (!resultado) {
          setFeedback({
            tipo: 'erro',
            mensagem: 'Não foi possível detectar um rosto nítido nesta imagem. Tente outra foto frontal.',
          });
          setProcessando(false);
          return;
        }

        setFotoCapturada(base64);
        setDescritorCapturado(Array.from(resultado.descriptor));
        setFeedback({
          tipo: 'sucesso',
          mensagem: `✓ Biometria extraída da foto! Confiança: ${(resultado.score * 100).toFixed(1)}%`,
        });
        setProcessando(false);
      };
    };
    reader.readAsDataURL(file);
  };

  // Salvar biometria no colaborador
  const handleSalvarBiometria = () => {
    if (!descritorCapturado) return;

    onBiometriaSalva({
      descriptor: descritorCapturado,
      fotoBase64: fotoCapturada || undefined,
      dataCaptura: new Date().toISOString(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="card-corporate bg-[#111116] border-[#27272A] w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-5">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1746B8] flex items-center justify-center text-white shadow-md shadow-[#1746B8]/30">
              <ScanFace size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cadastro de Biometria Facial</h3>
              <p className="text-xs text-[#A1A1AA]">
                Colaborador: <span className="text-white font-semibold">{funcionarioNome || 'Novo Colaborador'}</span>
              </p>
              <p className="text-[11px] text-[#6B7280] mt-1">{agora.toLocaleDateString('pt-BR')} · {agora.toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-[#18181B] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas Câmera vs Upload */}
        <div className="flex border-b border-[#27272A] gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setModoAba('camera')}
            className={`pb-2.5 transition flex items-center gap-1.5 ${
              modoAba === 'camera'
                ? 'text-[#2F5FD0] border-b-2 border-[#1746B8]'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Camera size={14} /> Câmera ao Vivo
          </button>
          <button
            type="button"
            onClick={() => setModoAba('upload')}
            className={`pb-2.5 transition flex items-center gap-1.5 ${
              modoAba === 'upload'
                ? 'text-[#2F5FD0] border-b-2 border-[#1746B8]'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Upload size={14} /> Upload de Foto
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition ${
              feedback.tipo === 'sucesso'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : feedback.tipo === 'erro'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            {feedback.tipo === 'sucesso' && <CheckCircle2 size={16} className="shrink-0" />}
            {feedback.tipo === 'erro' && <AlertTriangle size={16} className="shrink-0" />}
            {feedback.tipo === 'info' && <RefreshCw size={16} className="shrink-0 animate-spin" />}
            <span>{feedback.mensagem}</span>
            {feedback.tipo === 'sucesso' && !capturaConfirmada && (
              <button
                type="button"
                onClick={() => setCapturaConfirmada(true)}
                className="ml-auto shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-[#07130E] hover:bg-emerald-400 transition"
              >
                OK, entendi
              </button>
            )}
          </div>
        )}

        {/* Área Central: Câmera com Guia de Rosto ou Upload */}
        {modoAba === 'camera' ? (
          <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-[#27272A] flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Retículo Oval Guia do Rosto */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-48 h-64 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
                  descritorCapturado ? 'border-emerald-400 bg-emerald-500/10' : 'border-[#2F5FD0]/70'
                }`}
              >
                {!descritorCapturado && (
                  <span className="text-[11px] text-[#5E87F5] font-mono uppercase bg-black/60 px-2 py-0.5 rounded">
                    Centralize o Rosto
                  </span>
                )}
              </div>
            </div>

            {/* Preview Miniatura se já capturado */}
            {fotoCapturada && (
              <div className="absolute bottom-3 right-3 p-1 rounded-xl bg-black/80 border border-emerald-500/50">
                <img
                  src={fotoCapturada}
                  alt="Snapshot"
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-[#27272A] hover:border-[#1746B8] rounded-2xl bg-[#18181B]/50 flex flex-col items-center justify-center text-center space-y-4">
            {fotoCapturada ? (
              <div className="space-y-3">
                <img
                  src={fotoCapturada}
                  alt="Preview"
                  className="w-32 h-32 rounded-2xl object-cover mx-auto border-2 border-emerald-500/50 shadow-lg"
                />
                <div className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={14} /> Biometria 128D Processada
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#1746B8]/15 border border-[#1746B8]/30 flex items-center justify-center text-[#2F5FD0]">
                  <Upload size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Carregar Foto Frontal</h4>
                  <p className="text-xs text-[#6B7280] mt-1">PNG, JPG ou JPEG com boa iluminação</p>
                </div>
              </>
            )}

            <label className="btn-secondary text-xs cursor-pointer">
              <span>{fotoCapturada ? 'Escolher Outra Foto' : 'Selecionar Arquivo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFoto}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-between border-t border-[#27272A] pt-4">
          <div className="text-xs text-[#6B7280] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#2F5FD0]" />
            Rede Neural: <span className="font-mono text-[#A1A1AA]">TinyFace + FaceRec 128D</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancelar
            </button>

            {modoAba === 'camera' && (
              <button
                type="button"
                onClick={capturarDaCamera}
                disabled={processando || carregandoModelos}
                className="btn-secondary text-xs border-[#1746B8]/50 text-white hover:bg-[#1746B8]/20"
              >
                <Camera size={14} />
                {processando ? 'Analisando...' : 'Capturar da Câmera'}
              </button>
            )}

            {modoAba === 'camera' && rostoDetectado && !descritorCapturado && (
              <button
                type="button"
                onClick={capturarDaCamera}
                disabled={processando}
                className="btn-primary text-xs"
              >
                <CheckCircle2 size={14} /> Confirmar captura
              </button>
            )}

            <button
              type="button"
              onClick={handleSalvarBiometria}
              disabled={!descritorCapturado}
              className="btn-primary text-xs disabled:opacity-40"
            >
              <CheckCircle2 size={14} />
              Confirmar & Vincular Biometria
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
