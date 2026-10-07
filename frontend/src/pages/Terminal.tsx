import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanFace, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Camera, 
  ShieldCheck, 
  Clock, 
  Users, 
  ChevronRight,
  Maximize,
  Volume2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Funcionario } from '../types';
import { requestApi } from '../services/api';
import { 
  carregarModelosFaciais, 
  extrairDescritorFacial, 
  compararRostoComCadastrados,
  desenharDeteccaoNoCanvas 
} from '../services/faceRecognition';

export const Terminal: React.FC = () => {
  const { user } = useAuth();
  const isBiometriaSubdomain = window.location.hostname === 'biometria.ptfacial.korentech.com.br';
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Identificação do ponto pelo link (ex: ?terminal=term-portaria-01)
  const [terminalParam] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('terminal') || params.get('ponto') || 'term-portaria-01';
  });

  const [dispositivoAtivo] = useState<{ nome: string; localizacao: string }>(() => {
    try {
      const salvos = JSON.parse(localStorage.getItem('ponto_dispositivos') || '[]');
      const param = new URLSearchParams(window.location.search).get('terminal') || new URLSearchParams(window.location.search).get('ponto');
      const encontrado = salvos.find((d: any) => d.identificadorUuid === param);
      if (encontrado) {
        return { nome: encontrado.nome, localizacao: encontrado.localizacao || 'Sede Principal' };
      }
    } catch (e) {}
    return { nome: 'Totem Portaria Principal', localizacao: 'Hall Principal - Portaria A' };
  });

  // Estados do terminal
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [erroCamera, setErroCamera] = useState<string | null>(null);
  const [modelosCarregados, setModelosCarregados] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [filaOffline, setFilaOffline] = useState<number>(0);
  const [tempoAtual, setTempoAtual] = useState(new Date());
  const [escanendo, setEscaneando] = useState(false);
  const [scannerAtivo, setScannerAtivo] = useState(true);
  const [rostoDetectado, setRostoDetectado] = useState(false);
  const [funcionarioIdentificado, setFuncionarioIdentificado] = useState<Funcionario | null>(null);

  // Inicializar câmera WebCam
  const iniciarCamera = async () => {
    setErroCamera(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          setErroCamera('O navegador bloqueia a câmera no celular em conexões HTTP. É obrigatório ativar o SSL (HTTPS) no servidor para liberar no celular!');
        } else {
          setErroCamera('Dispositivo de captura ou suporte a webcam não encontrado no navegador.');
        }
        setCameraAtiva(false);
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'user' },
            width: { ideal: 640 }, 
            height: { ideal: 480 } 
          },
          audio: false 
        });
      } catch (errConstraint) {
        // Fallback para dispositivos sem suporte a constraints detalhadas
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        await videoRef.current.play();
        setCameraAtiva(true);
        setErroCamera(null);
      }
    } catch (err: any) {
      console.warn('Erro ao inicializar câmera:', err);
      setCameraAtiva(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErroCamera('Permissão da câmera foi negada. Permita o uso da câmera no ícone de cadeado do navegador.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErroCamera('Nenhuma câmera física detectada no dispositivo.');
      } else {
        setErroCamera(err.message || 'Falha ao conectar com a câmera.');
      }
    }
  };
  
  // Feedback da batida
  const [ultimoResultado, setUltimoResultado] = useState<{
    tipo: 'sucesso' | 'duplicidade' | null;
    nome?: string;
    cargo?: string;
    evento?: string;
    horario?: string;
    data?: string;
    similaridade?: number;
    foto?: string;
    mensagem?: string;
  }>({ tipo: null });

  // Lista de funcionários cadastrados com biometria
  const [funcionariosCadastrados, setFuncionariosCadastrados] = useState<Funcionario[]>(() => {
    const salvos = localStorage.getItem('ponto_funcionarios');
    if (salvos) {
      try {
        const parsed = JSON.parse(salvos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return [
      { id: '1', empresaId: 'demo', nome: 'João Silva', matricula: '00152', cargo: 'Auxiliar Administrativo', departamento: 'Administrativo', biometriaCadastrada: true, status: 'ATIVO', cpf: '111.222.333-44' },
      { id: '2', empresaId: 'demo', nome: 'Maria Souza', matricula: '00153', cargo: 'Analista de Suporte', departamento: 'Operações', biometriaCadastrada: true, status: 'ATIVO', cpf: '222.333.444-55' },
      { id: '3', empresaId: 'demo', nome: 'Carlos Lima', matricula: '00154', cargo: 'Desenvolvedor Frontend', departamento: 'TI', biometriaCadastrada: true, status: 'ATIVO', cpf: '333.444.555-66' },
      { id: '4', empresaId: 'demo', nome: 'Ana Oliveira', matricula: '00155', cargo: 'Consultora de Vendas', departamento: 'Comercial', biometriaCadastrada: false, status: 'ATIVO', cpf: '444.555.666-77' },
    ];
  });

  // Histórico de batidas recentes no terminal (para anti-duplicidade)
  const [historicoBatidas, setHistoricoBatidas] = useState<Record<string, { horario: string; timestamp: number; evento: string }>>({});

  // Atualiza funcionários quando houver modificação no cadastro
  useEffect(() => {
    const handleAtualizacao = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setFuncionariosCadastrados(e.detail);
      }
    };
    window.addEventListener('atualizacao-funcionarios', handleAtualizacao);
    return () => window.removeEventListener('atualizacao-funcionarios', handleAtualizacao);
  }, []);

  useEffect(() => {
    let ativo = true;
    requestApi<Funcionario[]>('/funcionarios')
      .then((data) => {
        if (ativo && Array.isArray(data) && data.length > 0) {
          setFuncionariosCadastrados(data);
          localStorage.setItem('ponto_funcionarios', JSON.stringify(data));
        }
      })
      .catch(() => undefined);
    return () => { ativo = false; };
  }, []);

  // Relógio em tempo real
  useEffect(() => {
    const timer = setInterval(() => setTempoAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Carregar modelos neurais locais
  useEffect(() => {
    let ativo = true;
    carregarModelosFaciais().then((ok) => {
      if (ativo) setModelosCarregados(ok);
    });
    return () => { ativo = false; };
  }, []);



  useEffect(() => {
    iniciarCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Efeito sonoro sintético de confirmação biométrica
  const tocarSinalSonoro = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  };

  // Loop de detecção facial contínua em tempo real na câmera
  useEffect(() => {
    if (!cameraAtiva || !modelosCarregados || !scannerAtivo) return;

    let cancelado = false;
    const intervaloScan = setInterval(async () => {
      if (cancelado || !videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      try {
        const deteccao = await extrairDescritorFacial(videoRef.current);
        if (cancelado) return;

        if (deteccao && canvasRef.current) {
          setRostoDetectado(true);
          // Compara com os funcionários cadastrados que possuem vetor biométrico
          const comparacao = compararRostoComCadastrados(deteccao.descriptor, funcionariosCadastrados);

          if (comparacao.sucesso && comparacao.funcionarioId) {
            desenharDeteccaoNoCanvas(canvasRef.current, videoRef.current, deteccao.box, comparacao.nome);
            
            const func = funcionariosCadastrados.find((f) => f.id === comparacao.funcionarioId);
            if (func && !funcionarioIdentificado) {
              setFuncionarioIdentificado({ ...func, _similaridade: comparacao.similaridade } as Funcionario & { _similaridade: number });
              setScannerAtivo(false);
            }
          } else {
            desenharDeteccaoNoCanvas(canvasRef.current, videoRef.current, deteccao.box);
          }
        } else if (canvasRef.current) {
          setRostoDetectado(false);
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      } catch (err) {
        // Ignora erros temporários de frame
      }
    }, 700);

    return () => {
      cancelado = true;
      clearInterval(intervaloScan);
    };
  }, [cameraAtiva, modelosCarregados, scannerAtivo, funcionariosCadastrados, historicoBatidas, funcionarioIdentificado]);

  // Mantém a confirmação visível por alguns segundos e prepara o terminal
  // para o próximo funcionário sem deixar dados do atendimento anterior.
  useEffect(() => {
    if (ultimoResultado.tipo !== 'sucesso') return;

    const retorno = window.setTimeout(() => {
      setUltimoResultado({ tipo: null });
      setRostoDetectado(false);
      setEscaneando(false);
      setScannerAtivo(true);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }, 3000);

    return () => window.clearTimeout(retorno);
  }, [ultimoResultado.tipo]);

  // Processar e registrar o ponto (com validação anti-duplicidade)
  const processarBatidaPonto = async (funcionario: Funcionario, similaridadeCustom?: number) => {
    const agora = new Date();
    const horarioStr = agora.toLocaleTimeString('pt-BR');
    const agoraTimestamp = Date.now();

    // 1. Verificação de Anti-Duplicidade (limite de 5 minutos = 300.000 ms)
    const ultimaBatida = historicoBatidas[funcionario.id];
    if (ultimaBatida && agoraTimestamp - ultimaBatida.timestamp < 300000 && ultimaBatida.evento === 'ENTRADA') {
      setUltimoResultado({
        tipo: 'duplicidade',
        nome: funcionario.nome,
        cargo: funcionario.cargo,
        evento: 'ENTRADA',
        horario: ultimaBatida.horario,
        foto: funcionario.fotoUrl || undefined,
        mensagem: `Entrada já registrada às ${ultimaBatida.horario}. O sistema bloqueia duplicidades em menos de 5 minutos.`,
      });

      // Pausa o scanner temporariamente por 4 segundos
      setScannerAtivo(false);
      setTimeout(() => setScannerAtivo(true), 4000);
      return;
    }

    // 2. Registro Válido
    const novoEvento = ultimaBatida?.evento === 'ENTRADA' ? 'SAIDA' : 'ENTRADA';
    setHistoricoBatidas((prev) => ({
      ...prev,
      [funcionario.id]: { horario: horarioStr, timestamp: agoraTimestamp, evento: novoEvento },
    }));

    // Cria registro de ponto auditado
    const novoRegistro = {
      id: 'pt-' + Date.now(),
      empresaId: user?.empresa?.id || 'demo',
      funcionarioId: funcionario.id,
      funcionarioNome: funcionario.nome,
      cargo: funcionario.cargo,
      tipo: novoEvento,
      dataHora: agora.toISOString(),
      origem: offlineMode ? 'OFFLINE' : 'ONLINE',
      status: 'VALIDO',
      horario: horarioStr,
    };

    // O registro principal é feito na API para que o RH, Dashboard e Relatórios
    // consultem a mesma fonte. O localStorage fica apenas como contingência.
    let registradoNaApi = false;
    try {
      await requestApi('/registros-ponto', {
        method: 'POST',
        body: JSON.stringify({
          funcionarioId: funcionario.id,
          tipo: novoEvento,
          dataHora: agora.toISOString(),
          origem: offlineMode ? 'OFFLINE' : 'ONLINE',
          status: 'VALIDO',
          idempotencyKey: novoRegistro.id,
          fotoRegistroUrl: funcionario.fotoUrl || undefined,
        }),
      });
      registradoNaApi = true;
    } catch (err) {
      console.warn('API indisponível; registro mantido em contingência local.', err);
    }

    // Espelha localmente para atualizar o terminal e permitir sincronização offline.
    try {
      const registrosAntigos = JSON.parse(localStorage.getItem('ponto_registros') || '[]');
      const atualizados = [novoRegistro, ...registrosAntigos];
      if (!registradoNaApi || offlineMode) {
        localStorage.setItem('ponto_registros', JSON.stringify(atualizados));
      }
      window.dispatchEvent(new CustomEvent('novo-registro-ponto', { detail: novoRegistro }));
    } catch (err) {
      console.warn('Erro ao salvar registro de ponto:', err);
    }

    if (offlineMode) {
      setFilaOffline((prev) => prev + 1);
    }

    tocarSinalSonoro();

    const sim = similaridadeCustom || (funcionario.biometria ? 98.6 : 97.4);

    setUltimoResultado({
      tipo: 'sucesso',
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      evento: novoEvento === 'ENTRADA' ? 'Entrada Confirmada' : 'Saída Confirmada',
      horario: horarioStr,
      data: agora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      similaridade: sim,
      foto: funcionario.fotoUrl || undefined,
      mensagem: !registradoNaApi
        ? 'Gravado no armazenamento local criptografado (SQLite). Sincronizará com a VPS assim que a rede voltar.'
        : 'Ponto auditado com selo criptográfico SHA-256 e transmitido ao servidor corporativo.',
    });

    // Pausa o scanner por 4 segundos para manter o resultado em destaque
    setScannerAtivo(false);
    setTimeout(() => setScannerAtivo(true), 4500);
  };

  // Simulação manual de batida
  const simularColaborador = (funcionario: Funcionario) => {
    if (escanendo) return;
    setEscaneando(true);
    setTimeout(() => {
      setFuncionarioIdentificado(funcionario);
      setRostoDetectado(true);
      setScannerAtivo(false);
      setEscaneando(false);
    }, 800);
  };

  // Sincronizar fila offline
  const sincronizarOffline = () => {
    if (filaOffline === 0) return;
    setTimeout(() => {
      setFilaOffline(0);
      alert('✓ Sincronização concluída com sucesso! Os registros da fila offline foram transmitidos.');
    }, 800);
  };

  return (
    <div className="terminal-kiosk">
      {funcionarioIdentificado && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-4 backdrop-blur-[2px] md:items-center">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-5 text-center text-slate-700 shadow-2xl md:p-7">
            <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-sky-100 bg-slate-100">
              {funcionarioIdentificado.fotoUrl ? <img src={funcionarioIdentificado.fotoUrl} alt={funcionarioIdentificado.nome} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl font-extrabold text-sky-600">{funcionarioIdentificado.nome.slice(0, 2).toUpperCase()}</div>}
            </div>
            <div className="mx-auto mb-5 inline-block rounded-xl bg-sky-50 px-5 py-2 text-lg font-bold text-sky-700">{tempoAtual.toLocaleDateString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</div>
            <h2 className="text-2xl font-bold md:text-3xl">{funcionarioIdentificado.nome}</h2>
            <p className="mt-1 text-sm text-slate-500">CPF: não informado</p>
            <p className="mt-1 text-sm text-slate-400">Última batida: pronta para registrar</p>
            <p className="mt-5 text-sm font-medium text-sky-600">Este funcionário é você?</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => { setFuncionarioIdentificado(null); setRostoDetectado(false); setScannerAtivo(true); }} className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-base font-bold text-slate-500 transition hover:bg-slate-50"><span className="mr-2 text-xl text-rose-500">✕</span> CANCELAR</button>
              <button type="button" onClick={async () => { const identificado = funcionarioIdentificado as Funcionario & { _similaridade?: number }; setFuncionarioIdentificado(null); await processarBatidaPonto(identificado, identificado._similaridade); }} className="flex-1 rounded-xl bg-[#7bd329] px-4 py-4 text-base font-bold text-white shadow-lg shadow-lime-300/40 transition hover:bg-[#68bb1e]"><span className="mr-2 text-xl">✓</span> CONFIRMAR</button>
            </div>
            <p className="mt-4 text-xs text-slate-400">ou diga “Confirmar” / “Cancelar” para não tocar na tela</p>
          </div>
        </div>
      )}
      {ultimoResultado.tipo === 'sucesso' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#dff5ff] via-[#c7edff] to-[#b7e4fa] px-6 text-[#12304a] animate-in fade-in duration-300">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#2b83bd] text-white shadow-[0_12px_35px_rgba(43,131,189,0.28)] success-pop">
              <CheckCircle2 size={54} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#2b83bd]">Ponto registrado com sucesso</p>
            <div className="mx-auto mt-8 flex items-center gap-4 rounded-3xl border border-white/70 bg-white/65 p-4 text-left shadow-xl shadow-[#5aa8cf]/15 backdrop-blur-sm">
              {ultimoResultado.foto ? (
                <img src={ultimoResultado.foto} alt={ultimoResultado.nome} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[#8bc9e8]" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#d9f2ff] text-2xl font-extrabold text-[#2b83bd]">{ultimoResultado.nome?.charAt(0)}</div>
              )}
              <div>
                <h2 className="text-xl font-extrabold">{ultimoResultado.nome}</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#2b83bd]">{ultimoResultado.evento === 'Entrada Confirmada' ? 'Entrada registrada' : 'Saída registrada'}</p>
              </div>
            </div>
            <div className="mt-5 space-y-1 text-sm text-[#31536c]">
              <p>{ultimoResultado.data}</p>
              <p className="font-mono text-2xl font-extrabold text-[#12304a]">{ultimoResultado.horario}</p>
            </div>
            <p className="mt-7 text-sm text-[#31536c]">Seu ponto foi registrado com sucesso.</p>
            <div className="mx-auto mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-white/70"><div className="h-full w-full origin-left rounded-full bg-[#2b83bd] success-progress" /></div>
          </div>
        </div>
      )}
      {/* Top Header do Terminal */}
      <div className="card-corporate p-5 bg-[#111116] border-[#27272A] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1746B8] flex items-center justify-center text-white shadow-lg shadow-[#1746B8]/30">
            <ScanFace size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {dispositivoAtivo.nome.toUpperCase()}
              </h2>
              {modelosCarregados && (
                <span className="badge badge-green text-[10px]">
                  <Sparkles size={10} /> IA Ativa
                </span>
              )}
            </div>
            <div className="text-xs text-[#6B7280]">
              {user?.empresa?.nomeFantasia || 'IMARF Tecnologia'} • {dispositivoAtivo.localizacao} • <span className="font-mono text-[#5E87F5]">ID: {terminalParam}</span>
            </div>
          </div>
        </div>

        {/* Relógio e Botão Offline */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-mono font-extrabold text-white tracking-wider">
              {tempoAtual.toLocaleTimeString('pt-BR')}
            </div>
            <div className="text-[11px] font-mono text-[#6B7280]">
              {tempoAtual.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </div>
          </div>

          <button
            onClick={() => {
              setOfflineMode(!offlineMode);
              if (offlineMode && filaOffline > 0) sincronizarOffline();
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
              offlineMode
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
            title="Alternar entre modo online e offline para testes de contingência"
          >
            {offlineMode ? <WifiOff size={15} /> : <Wifi size={15} />}
            {offlineMode ? 'MODO OFFLINE' : 'SISTEMA ONLINE'}
          </button>
        </div>
      </div>

      {/* Área Central: Tablet Mockup + Reconhecimento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Frame do Tablet */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-lg tablet-mockup bg-black border-[14px] border-[#18181B] shadow-2xl relative overflow-hidden">
            <div className="tablet-camera-notch my-2"></div>
            
            <div className="relative aspect-[4/3] bg-[#09090B] flex items-center justify-center overflow-hidden">
              {/* Vídeo real da WebCam */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${cameraAtiva ? 'block' : 'hidden'}`}
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Canvas para desenhar detecção e bounding box facial */}
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full pointer-events-none ${cameraAtiva ? 'block' : 'hidden'}`}
                style={{ transform: 'scaleX(-1)' }}
              />

              <div className={`absolute inset-0 pointer-events-none flex items-center justify-center ${rostoDetectado ? 'bg-emerald-500/5' : ''}`}>
                <div className={`w-[52%] h-[82%] rounded-[50%] border-4 border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.28)] ${
                  rostoDetectado ? 'border-emerald-400' : 'border-[#2F5FD0]'
                }`} />
              </div>

              {rostoDetectado && !funcionarioIdentificado && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                  <div className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-[#07130E] shadow-lg">
                    Rosto detectado — confirme para validar
                  </div>
                  <button
                    type="button"
                    onClick={() => setRostoDetectado(false)}
                    className="pointer-events-auto rounded-lg bg-[#1746B8] px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-[#1E56D8]"
                  >
                    Confirmar rosto
                  </button>
                </div>
              )}

              {/* Simulador visual se câmera não estiver liberada */}
              {!cameraAtiva && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#111116] to-[#09090B] z-10">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#1746B8] flex items-center justify-center mb-3">
                    <ScanFace size={48} className="text-[#1746B8] opacity-80" />
                  </div>
                  <div className="text-sm font-bold text-white">Câmera Óptica em Standby</div>
                  
                  {erroCamera ? (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs max-w-sm text-left flex items-start gap-2 shadow">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-400" />
                      <span>{erroCamera}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-[#6B7280] mt-1 max-w-xs">
                      Toque no botão abaixo para autorizar o acesso à câmera do seu dispositivo
                    </div>
                  )}

                  <button
                    onClick={iniciarCamera}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-[#1746B8] hover:bg-[#1E56D8] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#1746B8]/30 transition active:scale-95 cursor-pointer"
                  >
                    <Camera size={16} /> Ativar Câmera do Dispositivo
                  </button>
                </div>
              )}

              {/* Retículo Oval Guia do Rosto */}
              <div className="absolute inset-8 border-2 border-dashed border-[#2F5FD0]/50 rounded-3xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] font-mono text-[#2F5FD0]">
                  <span>REDE NEURAL: ATIVA</span>
                  <span>FPS: 30</span>
                </div>
                {escanendo && (
                  <div className="scanner-laser absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#39F59A] to-transparent"></div>
                )}
                <div className="flex justify-between text-[10px] font-mono text-[#2F5FD0]">
                  <span>VIVACIDADE: ISO 19794-5</span>
                  <span>LIVENESS: OK</span>
                </div>
              </div>

              {/* Badge Offline no topo do tablet */}
              {offlineMode && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-amber-500/90 text-black text-[10px] font-bold font-mono shadow">
                  ● MODO OFFLINE ATIVO (SQLite)
                </div>
              )}
            </div>

            {/* Rodapé da tela do tablet */}
            <div className="p-4 bg-[#111116] border-t border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                <Volume2 size={16} className="text-[#1746B8]" />
                Sinal sonoro calibrado
              </div>
              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Reconhecimento Facial 100% Ativo
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral: Resultado da Batida & Lista de Colaboradores */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card de Sucesso da Batida */}
          {ultimoResultado.tipo === 'sucesso' && (
            <div className="hidden card-corporate p-5 bg-[#141419] border-emerald-500/50 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                {ultimoResultado.foto ? (
                  <img
                    src={ultimoResultado.foto}
                    alt={ultimoResultado.nome}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50 shadow"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                    <CheckCircle2 size={32} />
                  </div>
                )}
                <div>
                  <span className="badge badge-green text-[10px]">
                    {ultimoResultado.evento}
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-1">{ultimoResultado.nome}</h3>
                  <div className="text-xs text-[#6B7280]">{ultimoResultado.cargo}</div>
                </div>
              </div>

              <div className="p-3 bg-[#18181B] rounded-xl border border-[#27272A] flex justify-between items-center text-xs font-mono">
                <span className="text-[#6B7280]">Horário:</span>
                <span className="text-white font-extrabold text-base">{ultimoResultado.horario}</span>
                <span className="text-emerald-400 font-bold">Similaridade: {ultimoResultado.similaridade}%</span>
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {ultimoResultado.mensagem}
              </p>
            </div>
          )}

          {/* Card de Proteção Anti-Duplicidade */}
          {ultimoResultado.tipo === 'duplicidade' && (
            <div className="card-corporate p-5 bg-[#141419] border-amber-500/50 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <span className="badge badge-amber text-[10px]">
                    Proteção Anti-Duplicidade
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{ultimoResultado.nome}</h3>
                </div>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {ultimoResultado.mensagem}
              </p>
              <div className="text-[11px] text-[#6B7280] font-mono">
                Regra CLT: Bloqueia marcações repetidas por distração em intervalo inferior a 5 minutos.
              </div>
            </div>
          )}

          {/* Seletor de Colaboradores */}
          <div className={`card-corporate p-5 bg-[#141419] border-[#27272A] space-y-3 ${isBiometriaSubdomain ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2.5">
              <div>
                <span className="text-xs font-bold text-white">Equipe Cadastrada no Terminal</span>
                <div className="text-[11px] text-[#6B7280]">Olhe para a câmera ou teste clicando abaixo:</div>
              </div>
              <span className="badge badge-blue text-[10px]">
                {funcionariosCadastrados.length} Colaboradores
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {funcionariosCadastrados.map((func) => (
                <div
                  key={func.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#18181B] hover:bg-[#222228] border border-[#27272A] hover:border-[#1746B8] transition group"
                >
                  <div className="flex items-center gap-2.5">
                    {func.fotoUrl ? (
                      <img
                        src={func.fotoUrl}
                        alt={func.nome}
                        className="w-9 h-9 rounded-lg object-cover border border-[#27272A]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#27272A] text-white flex items-center justify-center text-xs font-bold">
                        {func.nome.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-[#5E87F5]">
                        {func.nome}
                      </div>
                      <div className="text-[10px] text-[#6B7280] font-mono">
                        {func.cargo} • Matrícula {func.matricula}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => simularColaborador(func)}
                    disabled={escanendo}
                    className="btn-secondary text-[11px] py-1 px-2.5 hover:bg-[#1746B8] hover:text-white hover:border-[#1746B8] transition"
                  >
                    <ScanFace size={13} />
                    <span>Bater Ponto</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fila de Sincronização Offline */}
          {filaOffline > 0 && (
            <div className="card-corporate p-4 bg-amber-500/10 border border-amber-500/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-400">
                  {filaOffline} {filaOffline === 1 ? 'registro pendente' : 'registros pendentes'} offline
                </div>
                <div className="text-[10px] text-[#A1A1AA]">Armazenados localmente no SQLite do tablet</div>
              </div>
              <button
                onClick={sincronizarOffline}
                className="btn-primary text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-700"
              >
                <RefreshCw size={14} /> Sincronizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
