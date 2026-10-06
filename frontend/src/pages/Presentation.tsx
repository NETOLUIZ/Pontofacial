import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ScanFace, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Clock, 
  Users, 
  Building2, 
  Layers, 
  Server, 
  Database, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Maximize2,
  Minimize2,
  Calendar,
  Lock,
  RefreshCw,
  FileText,
  Tablet,
  LayoutDashboard
} from 'lucide-react';

interface PresentationProps {
  onGoToApp: () => void;
}

export const Presentation: React.FC<PresentationProps> = ({ onGoToApp }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const totalSlides = 20;

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#09090B] text-white flex flex-col justify-between p-4 md:p-8 select-none">
      
      {/* Top Slide Header Bar */}
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-full text-xs font-mono text-[#A1A1AA]">
            SLIDE <span className="text-[#1746B8] font-bold">{String(currentSlide).padStart(2, '0')}</span> / {totalSlides}
          </div>
          <span className="text-xs text-[#6B7280] hidden sm:inline">Use as setas ⬅️ ➡️ do teclado para navegar</span>
        </div>

        {/* Quick jump pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide(1)}
            className="text-xs text-[#A1A1AA] hover:text-white px-2 py-1 rounded bg-[#18181B] border border-[#27272A]"
          >
            Início
          </button>
          <button
            onClick={() => setCurrentSlide(9)}
            className="text-xs text-[#A1A1AA] hover:text-white px-2 py-1 rounded bg-[#18181B] border border-[#27272A]"
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentSlide(14)}
            className="text-xs text-[#A1A1AA] hover:text-white px-2 py-1 rounded bg-[#18181B] border border-[#27272A]"
          >
            Arquitetura
          </button>
          <button
            onClick={onGoToApp}
            className="text-xs bg-[#1746B8] hover:bg-[#0D2F87] text-white px-3 py-1 rounded-md font-semibold transition"
          >
            Testar Sistema Live
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <main className="flex-1 flex items-center justify-center py-4">
        {/* ========================================================
            SLIDE 01: CAPA
        ======================================================== */}
        {currentSlide === 1 && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1746B8]/10 border border-[#1746B8]/30 text-[#2F5FD0] text-xs font-semibold">
                <Sparkles size={14} /> Solução SaaS Empresarial
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                CONTROLE DE PONTO <span className="text-[#1746B8]">FACIAL</span>
              </h1>
              <p className="text-xl font-medium text-[#A1A1AA]">
                A nova geração do controle de jornada empresarial.
              </p>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-lg">
                "Registre entradas, intervalos e saídas com reconhecimento facial, mesmo quando a internet estiver indisponível."
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-medium text-emerald-400">
                  <CheckCircle2 size={16} /> Reconhecimento facial
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-medium text-emerald-400">
                  <CheckCircle2 size={16} /> Registro offline
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-medium text-emerald-400">
                  <CheckCircle2 size={16} /> Sincronização automática
                </div>
              </div>
            </div>

            {/* Mockup Tablet Terminal Central */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md tablet-mockup p-6 bg-[#000000] border-8 border-[#1E1E24]">
                <div className="tablet-camera-notch mb-4"></div>
                <div className="bg-[#111116] rounded-2xl p-6 border border-[#27272A] text-center space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center text-xs text-[#6B7280] border-b border-[#27272A] pb-3">
                    <span className="font-bold text-white tracking-wider">EMPRESA XYZ</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Sistema online
                    </span>
                  </div>

                  {/* Câmera / Rosto Mockup */}
                  <div className="relative w-44 h-44 mx-auto rounded-2xl border-2 border-dashed border-[#1746B8] bg-[#18181B] flex flex-col items-center justify-center overflow-hidden">
                    <div className="scanner-laser absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#2F5FD0] to-transparent"></div>
                    <ScanFace size={64} className="text-[#1746B8] mb-2 opacity-80" />
                    <span className="text-xs text-[#A1A1AA] font-medium">Olhe para a câmera</span>
                  </div>

                  <div className="pt-2">
                    <div className="text-3xl font-bold font-mono text-white tracking-wider">07:02</div>
                    <div className="text-xs text-[#6B7280] font-mono mt-0.5">03 OUT 2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 02: O PROBLEMA
        ======================================================== */}
        {currentSlide === 2 && (
          <div className="w-full max-w-5xl space-y-10 text-center">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Desafios Atuais</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                Controle de ponto não precisa ser complicado.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="card-corporate p-6 space-y-3 bg-[#18181B] border-red-500/20">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-lg">
                  1
                </div>
                <h3 className="text-lg font-bold text-white">Registro manual</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Cartões de ponto vulneráveis a esquecimentos, trocas indevidas entre colegas e preenchimentos manuais imprecisos.
                </p>
                <div className="p-3 bg-[#111116] rounded border border-[#27272A] text-xs font-mono text-[#6B7280]">
                  ⚠️ "Esqueci meu cartão em casa"
                </div>
              </div>

              <div className="card-corporate p-6 space-y-3 bg-[#18181B] border-red-500/20">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-lg">
                  2
                </div>
                <h3 className="text-lg font-bold text-white">Dependência de internet</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  A conexão cai e a empresa inteira fica sem conseguir registrar a jornada, gerando filas, estresse e horas perdidas.
                </p>
                <div className="p-3 bg-[#111116] rounded border border-[#27272A] text-xs font-mono text-red-400">
                  🔴 "Terminal travado: sem conexão"
                </div>
              </div>

              <div className="card-corporate p-6 space-y-3 bg-[#18181B] border-red-500/20">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-lg">
                  3
                </div>
                <h3 className="text-lg font-bold text-white">Planilhas e conferência</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  O RH gasta dias no fechamento do mês corrigindo divergências, calculando horas extras e tratando justificativas manuais.
                </p>
                <div className="p-3 bg-[#111116] rounded border border-[#27272A] text-xs font-mono text-[#6B7280]">
                  ⚠️ "Horas de conferência manual"
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-r from-[#1746B8]/15 via-[#18181B] to-[#1746B8]/15 border border-[#1746B8]/40">
              <span className="text-sm md:text-base font-semibold text-white">
                A Solução: <span className="text-[#2F5FD0]">Um único sistema para registrar, acompanhar e administrar toda a jornada.</span>
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 03: COMO FUNCIONA
        ======================================================== */}
        {currentSlide === 3 && (
          <div className="w-full max-w-5xl space-y-8 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Fluxo Inteligente</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                Do rosto ao registro em segundos.
              </h2>
            </div>

            {/* Fluxo visual horizontal */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-2">
              {['FUNCIONÁRIO', 'CÂMERA', 'RECONHECIMENTO', 'VALIDAÇÃO', 'REGISTRO', 'CONFIRMAÇÃO'].map((etapa, idx) => (
                <React.Fragment key={etapa}>
                  <div className="px-3.5 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-bold font-mono text-white shadow-sm">
                    {etapa}
                  </div>
                  {idx < 5 && <ArrowRight size={16} className="text-[#1746B8]" />}
                </React.Fragment>
              ))}
            </div>

            {/* Mockup de confirmação */}
            <div className="max-w-md mx-auto card-corporate p-6 bg-[#111116] border border-emerald-500/40 shadow-xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">João Silva</h3>
                <div className="text-xs text-[#A1A1AA]">Auxiliar Administrativo • Matrícula 00152</div>
              </div>
              <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                <div className="text-xs text-[#6B7280]">Status do Registro</div>
                <div className="text-sm font-semibold text-emerald-400">Entrada registrada com sucesso</div>
                <div className="text-lg font-mono font-bold text-white mt-1">07:02:14</div>
              </div>
              <div className="text-xs text-[#6B7280] font-mono">
                ✓ Registro confirmado no terminal
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 04: RECONHECIMENTO FACIAL
        ======================================================== */}
        {currentSlide === 4 && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5 text-left">
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Biometria Segura</span>
              <h2 className="text-3xl font-extrabold text-white">Identificação rápida e inteligente</h2>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                O algoritmo compara vetores biométricos mapeados durante o cadastro, garantindo identificação consistente e sem atrito.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#18181B] border border-[#27272A]">
                  <div className="w-7 h-7 rounded bg-[#1746B8]/20 text-[#2F5FD0] flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-xs font-semibold text-white">Detecção facial instantânea</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#18181B] border border-[#27272A]">
                  <div className="w-7 h-7 rounded bg-[#1746B8]/20 text-[#2F5FD0] flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-xs font-semibold text-white">Validação de vivacidade e postura</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#18181B] border border-[#27272A]">
                  <div className="w-7 h-7 rounded bg-[#1746B8]/20 text-[#2F5FD0] flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-xs font-semibold text-white">Reconhecimento vetorial dos pontos</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#18181B] border border-[#27272A]">
                  <div className="w-7 h-7 rounded bg-[#1746B8]/20 text-[#2F5FD0] flex items-center justify-center text-xs font-bold">4</div>
                  <span className="text-xs font-semibold text-white">Confirmação e registro seguro</span>
                </div>
              </div>
            </div>

            {/* Mockup da câmera detectando o rosto */}
            <div className="card-corporate p-6 bg-[#111116] border border-[#27272A] relative">
              <div className="w-64 h-64 mx-auto rounded-2xl bg-[#18181B] border border-[#1746B8]/60 relative flex flex-col items-center justify-center">
                {/* Retículo biométrico */}
                <div className="absolute inset-4 border-2 border-dashed border-[#2F5FD0]/50 rounded-xl"></div>
                <ScanFace size={96} className="text-[#1746B8]" />
                <div className="absolute bottom-3 px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-[11px] font-mono text-emerald-400">
                  Similaridade: 98%
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="font-bold text-white">JOÃO SILVA</div>
                <div className="text-xs text-emerald-400 font-medium">✓ Pessoa identificada com sucesso</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 05: PROTEÇÃO CONTRA DUPLICIDADE
        ======================================================== */}
        {currentSlide === 5 && (
          <div className="w-full max-w-5xl space-y-8 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Integridade Operacional</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                Uma batida confirmada não vira duas.
              </h2>
              <p className="text-sm text-[#A1A1AA] max-w-xl mx-auto mt-2">
                O sistema confere o estado atual da jornada e aplica chaves de idempotência para evitar registros duplicados por engano.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              <div className="card-corporate p-6 bg-[#18181B] border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span>Primeira tentativa</span>
                  <span className="text-emerald-400 font-bold">SUCESSO</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">07:02:14</div>
                <div className="text-sm font-semibold text-emerald-400">✓ ENTRADA REGISTRADA</div>
                <p className="text-xs text-[#A1A1AA]">
                  Identificação validada e ponto lançado na jornada ativa.
                </p>
              </div>

              <div className="card-corporate p-6 bg-[#18181B] border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span>Tentativa 30s depois</span>
                  <span className="text-amber-400 font-bold">BLOQUEIO AUTOMÁTICO</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">07:02:44</div>
                <div className="text-sm font-semibold text-amber-400">⚠️ Registro já realizado</div>
                <p className="text-xs text-[#A1A1AA]">
                  Próximo evento esperado na jornada: <strong>Saída para intervalo ou fim de expediente</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#6B7280]">
              <span>Reconhecimento</span> → <span>Estado da Jornada</span> → <span>Anti-Duplicidade</span> → <span>Armazenamento Seguro</span>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 06: JORNADA FLEXÍVEL
        ======================================================== */}
        {currentSlide === 6 && (
          <div className="w-full max-w-5xl space-y-8 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Personalização</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                Cada empresa possui suas próprias regras.
              </h2>
              <p className="text-sm text-[#A1A1AA]">
                A empresa decide como deseja controlar sua jornada: com ou sem intervalo obrigatório.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
              {/* Exemplo 1: Administrativo */}
              <div className="card-corporate p-6 bg-[#18181B] space-y-4">
                <div className="flex justify-between items-center border-b border-[#27272A] pb-3">
                  <div>
                    <h3 className="font-bold text-white">Jornada Administrativa</h3>
                    <div className="text-xs text-[#6B7280]">4 batidas diárias</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-semibold">
                    Intervalo ATIVADO
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-[#111116] rounded border border-[#27272A]">
                    <div className="text-[#6B7280]">Entrada</div>
                    <div className="text-white font-bold text-sm">07:00</div>
                  </div>
                  <div className="p-2.5 bg-[#111116] rounded border border-[#27272A]">
                    <div className="text-[#6B7280]">Intervalo</div>
                    <div className="text-white font-bold text-sm">12:00</div>
                  </div>
                  <div className="p-2.5 bg-[#111116] rounded border border-[#27272A]">
                    <div className="text-[#6B7280]">Retorno</div>
                    <div className="text-white font-bold text-sm">13:00</div>
                  </div>
                  <div className="p-2.5 bg-[#111116] rounded border border-[#27272A]">
                    <div className="text-[#6B7280]">Saída</div>
                    <div className="text-white font-bold text-sm">17:00</div>
                  </div>
                </div>
              </div>

              {/* Exemplo 2: Comercial */}
              <div className="card-corporate p-6 bg-[#18181B] space-y-4">
                <div className="flex justify-between items-center border-b border-[#27272A] pb-3">
                  <div>
                    <h3 className="font-bold text-white">Jornada Comercial</h3>
                    <div className="text-xs text-[#6B7280]">2 batidas diárias</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full font-semibold">
                    Intervalo DESATIVADO
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-[#111116] rounded border border-[#27272A]">
                    <div className="text-[#6B7280]">Entrada</div>
                    <div className="text-white font-bold text-sm">07:00</div>
                  </div>
                  <div className="p-2.5 bg-[#111116] rounded border border-[#27272A]">
                    <div className="text-[#6B7280]">Saída</div>
                    <div className="text-white font-bold text-sm">17:00</div>
                  </div>
                </div>
                <div className="text-xs text-[#A1A1AA] pt-4">
                  Ideal para turnos corridos, plantões e regimes com intervalo livre.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 07: O SISTEMA REGISTRA O QUE REALMENTE ACONTECEU
        ======================================================== */}
        {currentSlide === 7 && (
          <div className="w-full max-w-4xl space-y-8 text-center">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Fidelidade e Transparência</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                Horário previsto não apaga horário real.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="card-corporate p-6 bg-[#18181B] space-y-3">
                <div className="text-xs font-bold text-[#6B7280] uppercase">Jornada Prevista (Regra de Contrato)</div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#27272A]">
                    <span>Entrada</span> <span>07:00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#27272A]">
                    <span>Intervalo</span> <span>12:00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#27272A]">
                    <span>Retorno</span> <span>13:00</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Saída</span> <span>17:00</span>
                  </div>
                </div>
              </div>

              <div className="card-corporate p-6 bg-[#111116] border-[#1746B8] space-y-3">
                <div className="text-xs font-bold text-[#1746B8] uppercase">Registro Real (Fato Ocorrido)</div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#27272A] text-emerald-400">
                    <span>Entrada Real</span> <span>07:02 (+2 min)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#27272A] text-white">
                    <span>Saída Real</span> <span>12:00</span>
                  </div>
                  <div className="flex justify-between py-1 text-[#6B7280]">
                    <span>Histórico Inviolável</span> <span>Preservado ✓</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs md:text-sm text-[#A1A1AA] max-w-xl mx-auto italic">
              "Os horários previstos são utilizados para apuração. As batidas realizadas permanecem registradas no histórico."
            </p>
          </div>
        )}

        {/* ========================================================
            SLIDE 08: FUNCIONAMENTO OFFLINE
        ======================================================== */}
        {currentSlide === 8 && (
          <div className="w-full max-w-5xl space-y-8 text-center">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Resiliência Operacional</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                A internet caiu? O ponto continua funcionando.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Lado Esquerdo: Online */}
              <div className="card-corporate p-6 bg-[#18181B] space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <Wifi size={18} /> MODO ONLINE
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-[#111116] rounded border border-[#27272A]">Terminal Tablet</div>
                  <div className="text-center text-[#1746B8]">↓ Conexão direta API</div>
                  <div className="p-2.5 bg-[#111116] rounded border border-[#27272A]">Servidor na Nuvem (VPS)</div>
                  <div className="text-center text-[#1746B8]">↓</div>
                  <div className="p-2.5 bg-[#111116] rounded border border-[#27272A]">Banco de Dados PostgreSQL</div>
                </div>
              </div>

              {/* Lado Direito: Offline */}
              <div className="card-corporate p-6 bg-[#111116] border-amber-500/40 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                  <WifiOff size={18} /> MODO OFFLINE (Sem Internet)
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-[#18181B] rounded border border-[#27272A]">Terminal Tablet</div>
                  <div className="text-center text-amber-400">↓ Gravação local imediata</div>
                  <div className="p-2.5 bg-[#18181B] rounded border border-[#27272A]">Banco Local Criptografado (SQLite)</div>
                  <div className="text-center text-amber-400">↓</div>
                  <div className="p-2.5 bg-[#18181B] rounded border border-[#27272A]">Fila de Sincronização Pendente</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#18181B] border border-emerald-500/40 flex items-center justify-center gap-4 text-xs font-mono text-emerald-400">
              <RefreshCw size={18} className="animate-spin text-emerald-400" />
              <span>INTERNET RESTABELECIDA ➔ SINCRONIZAÇÃO AUTOMÁTICA EM LOTE ➔ SERVIDOR ATUALIZADO</span>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 09: DASHBOARD DA EMPRESA
        ======================================================== */}
        {currentSlide === 9 && (
          <div className="w-full max-w-5xl space-y-6 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Gestão em Tempo Real</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Tudo sob controle em um único painel.
              </h2>
            </div>

            {/* Desktop RH Mockup */}
            <div className="card-corporate p-6 bg-[#111116] border border-[#27272A] shadow-2xl space-y-6 text-left">
              {/* Cards de Métricas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#18181B] rounded-xl border border-[#27272A]">
                  <div className="text-xs text-[#6B7280] font-semibold">FUNCIONÁRIOS</div>
                  <div className="text-3xl font-bold font-mono text-white mt-1">128</div>
                </div>
                <div className="p-4 bg-[#18181B] rounded-xl border border-emerald-500/30">
                  <div className="text-xs text-emerald-400 font-semibold">PRESENTES</div>
                  <div className="text-3xl font-bold font-mono text-white mt-1">96</div>
                </div>
                <div className="p-4 bg-[#18181B] rounded-xl border border-amber-500/30">
                  <div className="text-xs text-amber-400 font-semibold">ATRASADOS</div>
                  <div className="text-3xl font-bold font-mono text-white mt-1">7</div>
                </div>
                <div className="p-4 bg-[#18181B] rounded-xl border border-red-500/30">
                  <div className="text-xs text-red-400 font-semibold">AUSENTES</div>
                  <div className="text-3xl font-bold font-mono text-white mt-1">25</div>
                </div>
              </div>

              {/* Tabela de presença */}
              <div className="border border-[#27272A] rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#18181B] text-[#A1A1AA] border-b border-[#27272A]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Funcionário</th>
                      <th className="py-2.5 px-4 font-semibold">Horário de Entrada</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A] font-mono">
                    <tr>
                      <td className="py-2.5 px-4 text-white font-sans font-medium">João Silva</td>
                      <td className="py-2.5 px-4 text-[#A1A1AA]">07:02:14</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-sans">● Presente</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-white font-sans font-medium">Maria Souza</td>
                      <td className="py-2.5 px-4 text-[#A1A1AA]">06:58:42</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-sans">● Presente</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-white font-sans font-medium">Carlos Lima</td>
                      <td className="py-2.5 px-4 text-[#A1A1AA]">07:18:05</td>
                      <td className="py-2.5 px-4 text-amber-400 font-sans">● Atrasado (18 min)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 10: CADASTRO DO FUNCIONÁRIO
        ======================================================== */}
        {currentSlide === 10 && (
          <div className="w-full max-w-4xl space-y-6 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Simplicidade de Gestão</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Cadastre funcionários e configure suas jornadas.
              </h2>
            </div>

            {/* Mockup tela cadastro */}
            <div className="card-corporate p-6 bg-[#18181B] border border-[#27272A] max-w-2xl mx-auto text-left space-y-5">
              <div className="flex items-center gap-4 border-b border-[#27272A] pb-4">
                <div className="w-14 h-14 rounded-full bg-[#1746B8]/20 border border-[#1746B8] flex items-center justify-center text-[#2F5FD0]">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">João Silva</h3>
                  <div className="text-xs text-[#6B7280] font-mono">Matrícula: 00152 • CPF: ***.222.333-**</div>
                </div>
                <div className="ml-auto">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/40">
                    ● Ativo
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[#6B7280]">Cargo</div>
                  <div className="text-white font-semibold mt-0.5">Auxiliar Administrativo</div>
                </div>
                <div>
                  <div className="text-[#6B7280]">Departamento</div>
                  <div className="text-white font-semibold mt-0.5">Administrativo</div>
                </div>
                <div>
                  <div className="text-[#6B7280]">Jornada Vinculada</div>
                  <div className="text-white font-semibold mt-0.5">Administrativo (07h às 17h)</div>
                </div>
                <div>
                  <div className="text-[#6B7280]">Biometria Facial</div>
                  <div className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Cadastrada no sistema
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button className="btn-primary text-xs">
                  Editar Funcionário
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 11: CONFIGURAÇÃO DO TERMINAL
        ======================================================== */}
        {currentSlide === 11 && (
          <div className="w-full max-w-5xl space-y-6 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Hardware Acessível</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Transforme um tablet em um terminal de ponto.
              </h2>
              <p className="text-sm text-[#A1A1AA]">
                Sem necessidade de aparelhos proprietários caros. Um tablet comum na recepção assume o controle total.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              <div className="card-corporate p-6 bg-[#111116] border-[#1746B8] space-y-4">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Tablet size={18} className="text-[#1746B8]" />
                  Tablet Recepção Bloco A
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono">
                    ✓ Câmera conectada e calibrada
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-mono">
                    ✓ Reconhecimento ativo em tempo real
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-mono">
                    ✓ Banco local sincronizado
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-mono">
                    ✓ Internet disponível e estável
                  </div>
                </div>
              </div>

              <div className="card-corporate p-6 bg-[#18181B] border-amber-500/30 space-y-4">
                <div className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <WifiOff size={18} />
                  Modo de Operação Offline
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Mesmo em caso de instabilidade de rede ou energia do roteador, o tablet opera normalmente com bateria própria e armazenamento local.
                </p>
                <div className="p-2.5 bg-[#111116] rounded border border-[#27272A] text-xs font-mono text-amber-400">
                  ● MODO OFFLINE ATIVADO: Registros continuam funcionando normalmente.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 12: RELATÓRIOS
        ======================================================== */}
        {currentSlide === 12 && (
          <div className="w-full max-w-5xl space-y-6 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Inteligência de Dados</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Informações para tomar decisões.
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              {['Espelho de Ponto', 'Relatório Mensal', 'Horas Trabalhadas', 'Atrasos & Faltas', 'Horas Extras', 'Banco de Horas', 'Exportação Folha', 'Auditoria Fiscal'].map((rel) => (
                <div key={rel} className="card-corporate p-4 bg-[#18181B] space-y-2">
                  <FileText size={20} className="text-[#1746B8]" />
                  <div className="text-xs font-bold text-white">{rel}</div>
                  <div className="text-[11px] text-[#6B7280]">Exportação PDF e Excel</div>
                </div>
              ))}
            </div>

            {/* Tabela de exemplo */}
            <div className="card-corporate p-4 bg-[#111116] text-left text-xs font-mono overflow-x-auto border-[#27272A]">
              <div className="text-xs font-sans font-bold text-[#A1A1AA] mb-2">Simulação de Espelho de Ponto Fictício</div>
              <div className="text-[#6B7280] flex justify-between border-b border-[#27272A] pb-1">
                <span>DATA</span> <span>ENTRADA</span> <span>INTERVALO</span> <span>RETORNO</span> <span>SAÍDA</span> <span>TOTAL</span>
              </div>
              <div className="flex justify-between py-1 text-white">
                <span>01/10/2026</span> <span>07:02</span> <span>12:00</span> <span>13:00</span> <span>17:01</span> <span>08h59</span>
              </div>
              <div className="flex justify-between py-1 text-white">
                <span>02/10/2026</span> <span>06:58</span> <span>12:02</span> <span>13:00</span> <span>17:00</span> <span>09h00</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 13: SEGURANÇA
        ======================================================== */}
        {currentSlide === 13 && (
          <div className="w-full max-w-5xl space-y-6 text-center">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Proteção e Conformidade</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Segurança em cada etapa.
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
              <div className="card-corporate p-4 bg-[#18181B] space-y-2">
                <Lock size={20} className="text-[#1746B8]" />
                <div className="text-sm font-bold text-white">Controle de Acesso</div>
                <p className="text-xs text-[#6B7280]">Autenticação JWT, senhas com bcrypt e RBAC granular.</p>
              </div>
              <div className="card-corporate p-4 bg-[#18181B] space-y-2">
                <Building2 size={20} className="text-[#1746B8]" />
                <div className="text-sm font-bold text-white">Isolamento Multiempresa</div>
                <p className="text-xs text-[#6B7280]">Nenhum dado de uma empresa é acessado por outra no backend.</p>
              </div>
              <div className="card-corporate p-4 bg-[#18181B] space-y-2">
                <ShieldCheck size={20} className="text-[#1746B8]" />
                <div className="text-sm font-bold text-white">Trilha de Auditoria</div>
                <p className="text-xs text-[#6B7280]">Registro de todas as ações administrativas com IP e timestamp.</p>
              </div>
              <div className="card-corporate p-4 bg-[#18181B] space-y-2">
                <Server size={20} className="text-[#1746B8]" />
                <div className="text-sm font-bold text-white">Backups Persistentes</div>
                <p className="text-xs text-[#6B7280]">Volumes Docker com redundância e dumps automáticos.</p>
              </div>
              <div className="card-corporate p-4 bg-[#18181B] space-y-2">
                <ScanFace size={20} className="text-[#1746B8]" />
                <div className="text-sm font-bold text-white">Proteção Biométrica</div>
                <p className="text-xs text-[#6B7280]">Armazenamento seguro de descritores vetoriais matemáticos.</p>
              </div>
              <div className="card-corporate p-4 bg-[#18181B] space-y-2">
                <RefreshCw size={20} className="text-[#1746B8]" />
                <div className="text-sm font-bold text-white">Comunicação HTTPS / TLS</div>
                <p className="text-xs text-[#6B7280]">Túnel seguro gerenciado por proxy reverso Nginx.</p>
              </div>
            </div>

            <p className="text-xs text-[#6B7280]">
              "Arquitetura preparada para proteger os dados e controlar quem pode acessar cada informação."
            </p>
          </div>
        )}

        {/* ========================================================
            SLIDE 14: ARQUITETURA
        ======================================================== */}
        {currentSlide === 14 && (
          <div className="w-full max-w-5xl space-y-6 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Engenharia de Software</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Arquitetura Escalável e Robusta
              </h2>
            </div>

            <div className="card-corporate p-6 bg-[#111116] border border-[#27272A] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                  <Tablet size={18} className="text-[#1746B8] mx-auto mb-1" />
                  <div className="font-bold text-white">TERMINAL</div>
                  <div className="text-[10px] text-[#6B7280]">React / Android + SQLite</div>
                </div>
                <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                  <Layers size={18} className="text-[#1746B8] mx-auto mb-1" />
                  <div className="font-bold text-white">NGINX PROXY</div>
                  <div className="text-[10px] text-[#6B7280]">Reverse Proxy & SSL</div>
                </div>
                <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                  <Server size={18} className="text-[#1746B8] mx-auto mb-1" />
                  <div className="font-bold text-white">NODE / EXPRESS</div>
                  <div className="text-[10px] text-[#6B7280]">TypeScript & Prisma</div>
                </div>
                <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                  <Database size={18} className="text-[#1746B8] mx-auto mb-1" />
                  <div className="font-bold text-white">POSTGRESQL</div>
                  <div className="text-[10px] text-[#6B7280]">Dados & Multi-tenant</div>
                </div>
                <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                  <RefreshCw size={18} className="text-[#1746B8] mx-auto mb-1" />
                  <div className="font-bold text-white">REDIS CACHE</div>
                  <div className="text-[10px] text-[#6B7280]">Filas & Sync</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {['Docker Compose', 'React + Vite', 'Node.js 20', 'PostgreSQL 16', 'Redis 7', 'Nginx Alpine', 'Hostinger VPS'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-[#18181B] rounded-full border border-[#27272A] text-xs font-mono text-[#A1A1AA]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 15: EXPERIÊNCIA DO FUNCIONÁRIO
        ======================================================== */}
        {currentSlide === 15 && (
          <div className="w-full max-w-5xl space-y-8 text-center">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Zero Atrito</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
                Para o funcionário, é simples.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="card-corporate p-5 bg-[#18181B] space-y-2">
                <span className="text-2xl font-bold font-mono text-[#1746B8]">01</span>
                <h4 className="text-sm font-bold text-white">Funcionário chega</h4>
                <p className="text-xs text-[#6B7280]">Aproxima-se do terminal na entrada da empresa.</p>
              </div>
              <div className="card-corporate p-5 bg-[#18181B] space-y-2">
                <span className="text-2xl font-bold font-mono text-[#1746B8]">02</span>
                <h4 className="text-sm font-bold text-white">Olha para a câmera</h4>
                <p className="text-xs text-[#6B7280]">Sem necessidade de tocar na tela ou procurar cartão.</p>
              </div>
              <div className="card-corporate p-5 bg-[#18181B] space-y-2">
                <span className="text-2xl font-bold font-mono text-[#1746B8]">03</span>
                <h4 className="text-sm font-bold text-white">Sistema reconhece</h4>
                <p className="text-xs text-[#6B7280]">Identificação biométrica em menos de 1 segundo.</p>
              </div>
              <div className="card-corporate p-5 bg-[#18181B] space-y-2">
                <span className="text-2xl font-bold font-mono text-emerald-400">04</span>
                <h4 className="text-sm font-bold text-white">Ponto confirmado</h4>
                <p className="text-xs text-[#6B7280]">Sinal visual e sonoro confirmando o registro.</p>
              </div>
            </div>

            <div className="text-base font-bold text-white pt-4">
              Sem cartões. Sem planilhas. Sem complicação.
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 16: EXPERIÊNCIA DO RH
        ======================================================== */}
        {currentSlide === 16 && (
          <div className="w-full max-w-5xl space-y-8 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Produtividade de Gestão</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
                Para o RH, tudo fica mais organizado.
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-2">
              {['Funcionários', 'Jornadas', 'Registros', 'Apuração', 'Relatórios'].map((passo, idx) => (
                <React.Fragment key={passo}>
                  <div className="px-4 py-2 bg-[#18181B] border border-[#27272A] rounded-xl text-xs font-bold text-white">
                    {passo}
                  </div>
                  {idx < 4 && <ArrowRight size={16} className="text-[#1746B8]" />}
                </React.Fragment>
              ))}
            </div>

            <div className="card-corporate p-6 bg-[#111116] max-w-2xl mx-auto text-left space-y-3">
              <h4 className="text-sm font-bold text-white">Redução de até 80% no tempo de fechamento da folha</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Todas as batidas já chegam categorizadas, validadas e calculadas em relação à tolerância de atrasos e horas extras configuradas.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 17: VISÃO COMPLETA DO ECOSSISTEMA
        ======================================================== */}
        {currentSlide === 17 && (
          <div className="w-full max-w-5xl space-y-6 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Visão Geral</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Ecossistema Completo e Integrado
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              <div className="card-corporate p-5 bg-[#18181B] space-y-2 border-[#1746B8]">
                <Tablet className="text-[#1746B8]" size={24} />
                <h4 className="text-sm font-bold text-white">1. Terminal Facial</h4>
                <p className="text-xs text-[#6B7280]">Tablets nos locais de trabalho com captura ultrarrápida.</p>
              </div>
              <div className="card-corporate p-5 bg-[#18181B] space-y-2 border-[#1746B8]">
                <Server className="text-[#1746B8]" size={24} />
                <h4 className="text-sm font-bold text-white">2. Servidor & API</h4>
                <p className="text-xs text-[#6B7280]">Backend em Docker com balanceamento e segurança Nginx.</p>
              </div>
              <div className="card-corporate p-5 bg-[#18181B] space-y-2 border-[#1746B8]">
                <Database className="text-[#1746B8]" size={24} />
                <h4 className="text-sm font-bold text-white">3. Banco de Dados</h4>
                <p className="text-xs text-[#6B7280]">PostgreSQL com multi-tenancy e integridade criptográfica.</p>
              </div>
              <div className="card-corporate p-5 bg-[#18181B] space-y-2 border-[#1746B8]">
                <LayoutDashboard className="text-[#1746B8]" size={24} />
                <h4 className="text-sm font-bold text-white">4. Painel Web RH</h4>
                <p className="text-xs text-[#6B7280]">Acesso de qualquer computador com dashboard em tempo real.</p>
              </div>
            </div>

            <div className="p-4 bg-[#111116] rounded-xl border border-[#27272A] text-xs font-mono text-[#A1A1AA]">
              Fluxo Offline: TERMINAL ➔ BANCO LOCAL (SQLite) ➔ RECONEXÃO ➔ SINCRONIZAÇÃO ➔ SERVIDOR NUVEM
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 18: IMPLEMENTAÇÃO
        ======================================================== */}
        {currentSlide === 18 && (
          <div className="w-full max-w-5xl space-y-6 text-center">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Passo a Passo</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Implantação simples e gradual.
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-left">
              {[
                { n: '01', title: 'Empresa', desc: 'Configuração da conta e regras' },
                { n: '02', title: 'Funcionários', desc: 'Importação ou cadastro da equipe' },
                { n: '03', title: 'Jornadas', desc: 'Definição dos horários e intervalos' },
                { n: '04', title: 'Terminais', desc: 'Pareamento dos tablets' },
                { n: '05', title: 'Biometria', desc: 'Foto facial de referência' },
                { n: '06', title: 'Operação', desc: 'Início imediato das batidas' },
              ].map((step) => (
                <div key={step.n} className="card-corporate p-4 bg-[#18181B] space-y-2">
                  <div className="text-lg font-bold font-mono text-[#1746B8]">{step.n}</div>
                  <div className="text-xs font-bold text-white">{step.title}</div>
                  <div className="text-[10px] text-[#6B7280]">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            SLIDE 19: DIFERENTES TIPOS DE EMPRESA
        ======================================================== */}
        {currentSlide === 19 && (
          <div className="w-full max-w-5xl space-y-6 text-center">
            <div>
              <span className="text-xs font-bold text-[#1746B8] uppercase tracking-widest">Versatilidade</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Para diferentes tipos de operação.
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-left">
              {[
                { title: 'Comércio & Varejo', icon: '🏪' },
                { title: 'Restaurantes & Gastronomia', icon: '🍽️' },
                { title: 'Indústria & Fábricas', icon: '🏭' },
                { title: 'Escritórios & Coworking', icon: '🏢' },
                { title: 'Clínicas & Saúde', icon: '🏥' },
                { title: 'Construção Civil', icon: '🏗️' },
                { title: 'Instituições de Ensino', icon: '🎓' },
                { title: 'Logística & Frotas', icon: '🚚' },
              ].map((sec) => (
                <div key={sec.title} className="card-corporate p-4 bg-[#18181B] space-y-2">
                  <div className="text-2xl">{sec.icon}</div>
                  <div className="text-xs font-bold text-white">{sec.title}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#A1A1AA]">
              "Uma plataforma preparada para diferentes operações e jornadas."
            </p>
          </div>
        )}

        {/* ========================================================
            SLIDE 20: ENCERRAMENTO
        ======================================================== */}
        {currentSlide === 20 && (
          <div className="w-full max-w-4xl text-center space-y-8">
            <div className="w-16 h-16 rounded-2xl bg-[#1746B8] flex items-center justify-center text-white mx-auto shadow-xl shadow-[#1746B8]/30">
              <ScanFace size={36} />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                Mais controle.<br />
                Mais organização.<br />
                <span className="text-[#1746B8]">Mais confiança</span> no registro da jornada.
              </h2>
              <div className="text-lg text-[#A1A1AA]">
                Controle de Ponto Facial — Solução SaaS Empresarial
              </div>
            </div>

            {/* Dados de Contato e CTA */}
            <div className="card-corporate p-6 bg-[#111116] border border-[#27272A] max-w-lg mx-auto space-y-4">
              <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                IMARF TECNOLOGIA & SOLUÇÕES
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-left">
                <div className="text-[#A1A1AA]">🌐 Website: <span className="text-white font-medium">www.imarf.com.br</span></div>
                <div className="text-[#A1A1AA]">📱 WhatsApp: <span className="text-white font-medium">(11) 99999-9999</span></div>
                <div className="text-[#A1A1AA]">✉️ E-mail: <span className="text-white font-medium">contato@imarf.com.br</span></div>
                <div className="text-[#A1A1AA]">📍 Suporte: <span className="text-emerald-400 font-medium">24/7 Dedicado</span></div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onGoToApp}
                  className="w-full btn-primary text-sm py-3 justify-center"
                >
                  Entrar no Painel do Sistema (Demonstração Live)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slide Navigation Controls Footer */}
      <footer className="border-t border-[#27272A] pt-4 mt-6 flex items-center justify-between">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 1}
          className="btn-secondary text-xs disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Anterior
        </button>

        {/* Dots progress indicator */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
          {Array.from({ length: totalSlides }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentSlide(num)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentSlide === num
                  ? 'bg-[#1746B8] w-6'
                  : 'bg-[#27272A] hover:bg-[#6B7280]'
              }`}
              title={`Slide ${num}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides}
          className="btn-primary text-xs disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Próximo <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
};
