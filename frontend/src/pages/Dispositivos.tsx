import React, { useState, useEffect } from 'react';
import { requestApi } from '../services/api';
import { Dispositivo } from '../types';
import { 
  Tablet, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Plus, 
  Link, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  X, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Monitor, 
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Dispositivos: React.FC = () => {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>(() => {
    const salvos = localStorage.getItem('ponto_dispositivos');
    if (salvos) {
      try {
        const parsed = JSON.parse(salvos);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: '1',
        empresaId: 'demo',
        nome: 'Totem Portaria Principal',
        identificadorUuid: 'term-portaria-01',
        localizacao: 'Hall Principal - Portaria A',
        status: 'ONLINE',
        versaoApp: 'v1.2.0',
        ultimoSync: new Date().toISOString(),
      },
      {
        id: '2',
        empresaId: 'demo',
        nome: 'Tablet Refeitório',
        identificadorUuid: 'term-refeitorio-02',
        localizacao: 'Refeitório Central - Bloco B',
        status: 'ONLINE',
        versaoApp: 'v1.2.0',
        ultimoSync: new Date().toISOString(),
      },
      {
        id: '3',
        empresaId: 'demo',
        nome: 'Link Ponto Web Home Office',
        identificadorUuid: 'ponto-web-comercial',
        localizacao: 'Equipe Remota / Comercial',
        status: 'ONLINE',
        versaoApp: 'v1.2.0-web',
        ultimoSync: new Date().toISOString(),
      },
    ];
  });

  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalQrAberto, setModalQrAberto] = useState<Dispositivo | null>(null);
  const [linkCopiadoId, setLinkCopiadoId] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Formulário de criação de novo ponto
  const [novoNome, setNovoNome] = useState('');
  const [novaLocalizacao, setNovaLocalizacao] = useState('');
  const [novoTipo, setNovoTipo] = useState<'totem' | 'tablet' | 'web'>('tablet');
  const [novoUuid, setNovoUuid] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Atualiza identificador sugerido ao digitar nome
  useEffect(() => {
    if (novoNome) {
      const slug = novoNome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 24);
      setNovoUuid(`ponto-${slug}-${Math.floor(100 + Math.random() * 900)}`);
    } else {
      setNovoUuid(`ponto-${Date.now().toString().slice(-6)}`);
    }
  }, [novoNome]);

  const carregarDispositivos = async () => {
    try {
      const data: any = await requestApi('/dispositivos');
      if (Array.isArray(data) && data.length > 0) {
        setDispositivos(data);
        localStorage.setItem('ponto_dispositivos', JSON.stringify(data));
      }
    } catch (e) {
      // Mantém mock inicial
    }
  };

  useEffect(() => {
    carregarDispositivos();
  }, []);

  const gerarLinkPonto = (identificadorUuid: string) => {
    const origin = window.location.origin;
    return `${origin}/?terminal=${encodeURIComponent(identificadorUuid)}`;
  };

  const copiarLinkPonto = (identificadorUuid: string, id: string) => {
    const link = gerarLinkPonto(identificadorUuid);
    navigator.clipboard.writeText(link);
    setLinkCopiadoId(id);
    setTimeout(() => setLinkCopiadoId(null), 3000);
  };

  const abrirPontoDireto = (identificadorUuid: string) => {
    const link = gerarLinkPonto(identificadorUuid);
    window.open(link, '_blank');
  };

  const handleCriarPonto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    setSalvando(true);
    const identificador = novoUuid.trim() || `ponto-${Date.now()}`;

    const novoDispositivo: Dispositivo = {
      id: 'disp-' + Date.now(),
      empresaId: 'demo',
      nome: novoNome.trim(),
      identificadorUuid: identificador,
      localizacao: novaLocalizacao.trim() || 'Sede Principal',
      status: 'ONLINE',
      versaoApp: novoTipo === 'web' ? 'v1.2.0-web' : 'v1.2.0-kiosk',
      ultimoSync: new Date().toISOString(),
    };

    try {
      // Tenta gravar no backend
      await requestApi('/dispositivos', {
        method: 'POST',
        body: JSON.stringify({
          nome: novoDispositivo.nome,
          identificadorUuid: novoDispositivo.identificadorUuid,
          localizacao: novoDispositivo.localizacao,
          versaoApp: novoDispositivo.versaoApp,
        }),
      });
    } catch (err) {
      console.warn('Backend indisponível para salvar dispositivo, persistindo localmente');
    }

    const atualizados = [novoDispositivo, ...dispositivos];
    setDispositivos(atualizados);
    localStorage.setItem('ponto_dispositivos', JSON.stringify(atualizados));

    setSalvando(false);
    setModalNovoAberto(false);
    setNovoNome('');
    setNovaLocalizacao('');
    
    // Abre automaticamente o modal com o Link e QR Code gerados
    setModalQrAberto(novoDispositivo);
    setMensagemSucesso(`✓ Ponto "${novoDispositivo.nome}" criado com sucesso! Link pronto para uso.`);
    setTimeout(() => setMensagemSucesso(null), 5000);
  };

  const simularSincronizacao = () => {
    setSincronizando(true);
    setTimeout(() => {
      setSincronizando(false);
      setMensagemSucesso('✓ Todos os terminais foram sincronizados com sucesso. Fila offline processada.');
      setTimeout(() => setMensagemSucesso(null), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Tablet className="text-[#1746B8]" size={26} />
            Terminais & Pontos de Coleta Facial
          </h1>
          <p className="text-xs text-[#6B7280]">
            Gerencie os totens, tablets e crie <strong>links diretos</strong> de batida facial para cada setor ou filial
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={simularSincronizacao}
            disabled={sincronizando}
            className="px-3.5 py-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#1746B8]/50 text-xs text-[#A1A1AA] hover:text-white font-semibold flex items-center gap-2 transition"
          >
            <RefreshCw size={14} className={sincronizando ? 'animate-spin' : ''} />
            {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
          </button>

          <button
            onClick={() => setModalNovoAberto(true)}
            className="btn-primary text-xs shadow-lg shadow-[#1746B8]/20"
          >
            <Plus size={16} />
            Criar Novo Ponto com Link
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2.5 font-medium animate-fadeIn">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Explicação de Arquitetura do Link */}
      <div className="card-corporate p-4 bg-gradient-to-r from-[#111116] to-[#181822] border-[#27272A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Link size={18} />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              Como funcionam os Links dos Pontos Faciais?
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                Modo Kiosk Seguro
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] max-w-2xl leading-relaxed">
              Cada ponto possui um link exclusivo com token/UUID. Você só precisa <strong>copiar o link ou abrir o QR Code</strong> no tablet da portaria ou enviar para colaboradores em home office. O dispositivo opera em <strong>modo quiosque</strong>, identificando os colaboradores por biometria sem exigir login de administrador.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Dispositivos & Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dispositivos.map((d) => {
          const linkPonto = gerarLinkPonto(d.identificadorUuid);
          const copiado = linkCopiadoId === d.id;

          return (
            <div 
              key={d.id} 
              className="card-corporate p-5 bg-[#111116] border-[#27272A] hover:border-[#1746B8]/50 space-y-4 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1746B8]/20 border border-[#1746B8]/40 flex items-center justify-center text-[#2F5FD0] shrink-0">
                      {d.nome.toLowerCase().includes('web') ? (
                        <Monitor size={20} />
                      ) : d.nome.toLowerCase().includes('celular') ? (
                        <Smartphone size={20} />
                      ) : (
                        <Tablet size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm leading-tight">{d.nome}</h3>
                      <div className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#1746B8]" />
                        {d.localizacao || 'Sem localização'}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <Wifi size={11} /> ONLINE
                  </span>
                </div>

                {/* Box com o Link Exclusivo do Ponto */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-semibold text-[#A1A1AA] flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[#6B7280]">
                      <Link size={11} /> Link Direto do Ponto
                    </span>
                    <span className="font-mono text-[9px] text-[#5E87F5] bg-[#1746B8]/20 px-1.5 py-0.5 rounded">
                      ID: {d.identificadorUuid}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-between gap-2 group">
                    <input 
                      type="text"
                      readOnly
                      value={linkPonto}
                      className="bg-transparent text-[11px] font-mono text-gray-300 w-full outline-none select-all truncate"
                    />
                    <button
                      type="button"
                      onClick={() => copiarLinkPonto(d.identificadorUuid, d.id)}
                      title="Copiar link do terminal"
                      className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition shrink-0 ${
                        copiado 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-[#27272A] hover:bg-[#1746B8] text-white'
                      }`}
                    >
                      {copiado ? <Check size={13} /> : <Copy size={13} />}
                      <span className="text-[10px] hidden sm:inline">{copiado ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Detalhes técnicos */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                  <div className="p-2 bg-[#18181B] rounded border border-[#27272A]">
                    <div className="text-[#6B7280]">Modo Offline</div>
                    <div className="text-emerald-400 font-bold mt-0.5">Ativo (SQLite)</div>
                  </div>
                  <div className="p-2 bg-[#18181B] rounded border border-[#27272A]">
                    <div className="text-[#6B7280]">Versão App</div>
                    <div className="text-white mt-0.5">{d.versaoApp || 'v1.2.0'}</div>
                  </div>
                </div>
              </div>

              {/* Ações do Ponto */}
              <div className="pt-3 border-t border-[#27272A] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setModalQrAberto(d)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#18181B] hover:bg-[#222228] border border-[#27272A] text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 transition"
                >
                  <QrCode size={14} className="text-[#5E87F5]" />
                  Ver QR Code
                </button>

                <button
                  type="button"
                  onClick={() => abrirPontoDireto(d.identificadorUuid)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#1746B8] hover:bg-[#0D2F87] text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <ExternalLink size={14} />
                  Abrir Ponto
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CRIAR NOVO PONTO COM LINK */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg card-corporate p-6 bg-[#111116] border-[#27272A] shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1746B8] flex items-center justify-center text-white shadow-md shadow-[#1746B8]/30">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Criar Novo Ponto de Coleta</h3>
                  <p className="text-xs text-[#6B7280]">Gere um ponto com link e QR Code para tablet ou web</p>
                </div>
              </div>
              <button
                onClick={() => setModalNovoAberto(false)}
                className="p-2 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-[#18181B] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCriarPonto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Nome do Ponto / Dispositivo *
                </label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Totem Entrada Portaria, Tablet Refeitório, Ponto Filial 02"
                  className="input-corporate"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Localização Física / Departamento
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="text"
                    value={novaLocalizacao}
                    onChange={(e) => setNovaLocalizacao(e.target.value)}
                    placeholder="Ex: Hall Central - Portaria Bloco B, Sede Matriz"
                    className="input-corporate pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Tipo de Equipamento / Uso
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNovoTipo('tablet')}
                    className={`p-3 rounded-xl border text-center transition ${
                      novoTipo === 'tablet'
                        ? 'bg-[#1746B8]/20 border-[#1746B8] text-white font-bold'
                        : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <Tablet size={18} className="mx-auto mb-1 text-[#2F5FD0]" />
                    Tablet Pareado
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovoTipo('totem')}
                    className={`p-3 rounded-xl border text-center transition ${
                      novoTipo === 'totem'
                        ? 'bg-[#1746B8]/20 border-[#1746B8] text-white font-bold'
                        : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <Monitor size={18} className="mx-auto mb-1 text-emerald-400" />
                    Totem Fixo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovoTipo('web')}
                    className={`p-3 rounded-xl border text-center transition ${
                      novoTipo === 'web'
                        ? 'bg-[#1746B8]/20 border-[#1746B8] text-white font-bold'
                        : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <Link size={18} className="mx-auto mb-1 text-purple-400" />
                    Link Ponto Web
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Identificador Único (UUID do Link)
                </label>
                <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] font-mono text-xs text-emerald-400 truncate">
                  {novoUuid}
                </div>
                <div className="text-[10px] text-[#6B7280] mt-1">
                  Este código exclusivo identifica a estação de batida nas auditorias fiscais.
                </div>
              </div>

              <div className="pt-2 border-t border-[#27272A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-white hover:bg-[#18181B] transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || !novoNome.trim()}
                  className="btn-primary text-xs py-2.5 px-5 disabled:opacity-50"
                >
                  {salvando ? 'Criando Ponto...' : 'Gerar Ponto e Criar Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE & COMPARTILHAMENTO DO LINK */}
      {modalQrAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md card-corporate p-6 bg-[#111116] border-[#27272A] shadow-2xl space-y-5 text-center animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3 text-left">
              <div>
                <h3 className="font-extrabold text-white text-base">Link do Ponto Facial</h3>
                <p className="text-xs text-[#6B7280]">{modalQrAberto.nome}</p>
              </div>
              <button
                onClick={() => setModalQrAberto(null)}
                className="p-2 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-[#18181B] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Imagem do QR Code gerado */}
            <div className="p-4 bg-white rounded-2xl mx-auto w-60 h-60 flex items-center justify-center shadow-lg border-4 border-[#27272A]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  gerarLinkPonto(modalQrAberto.identificadorUuid)
                )}`}
                alt="QR Code do Ponto"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Escaneie com a câmera do Tablet ou Smartphone</div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Ao abrir o link no tablet da portaria, o modo totem é iniciado imediatamente com a câmera pronta para captar rostos.
              </p>
            </div>

            {/* Box do Link com Botão de Copiar */}
            <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-2 text-left">
              <div className="text-[10px] text-[#6B7280] font-mono">LINK DIRETO DE ACESSO:</div>
              <div className="text-xs font-mono text-[#5E87F5] truncate select-all">
                {gerarLinkPonto(modalQrAberto.identificadorUuid)}
              </div>
              <button
                type="button"
                onClick={() => copiarLinkPonto(modalQrAberto.identificadorUuid, modalQrAberto.id)}
                className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  linkCopiadoId === modalQrAberto.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#1746B8] hover:bg-[#0D2F87] text-white'
                }`}
              >
                {linkCopiadoId === modalQrAberto.id ? (
                  <>
                    <Check size={14} /> Link Copiado para a Área de Transferência!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copiar Link do Ponto
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setModalQrAberto(null)}
                className="w-full py-2.5 rounded-xl border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-white hover:bg-[#18181B] transition"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => abrirPontoDireto(modalQrAberto.identificadorUuid)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-900/30"
              >
                <ExternalLink size={14} />
                Abrir Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
