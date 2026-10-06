import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ScanFace, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
  onOpenPresentation: () => void;
  onOpenTerminal: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onOpenPresentation, onOpenTerminal }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo || !senha) {
      setError('Por favor, informe seu e-mail e senha de acesso.');
      return;
    }

    setLoading(true);

    try {
      await login(emailLimpo, senha);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreencherEmail = (demoEmail: string) => {
    setEmail(demoEmail);
    setError(null);
  };

  return (
    <div className="w-full flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md card-corporate p-8 bg-[#111116] border-[#27272A] shadow-2xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1746B8] flex items-center justify-center text-white mx-auto shadow-lg shadow-[#1746B8]/30">
            <ScanFace size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">CONTROLE DE PONTO FACIAL</h2>
          <p className="text-xs text-[#6B7280]">Portal de Autenticação Segura • Acesso Corporativo</p>
        </div>

        {/* Botão de Acesso Direto ao Terminal Facial */}
        <button
          type="button"
          onClick={onOpenTerminal}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border border-emerald-500/40 hover:border-emerald-400 text-white font-bold text-xs flex items-center justify-between group transition shadow-lg shadow-emerald-950/20"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
              <ScanFace size={18} />
            </div>
            <div className="text-left">
              <div className="text-emerald-400 font-extrabold">Terminal de Ponto Facial</div>
              <div className="text-[10px] text-gray-400">Abrir tela de batida por câmera / Totem</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition" />
        </button>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">E-mail Corporativo</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com.br"
                className="input-corporate pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Senha de Acesso</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="input-corporate pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition"
                title={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
              >
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-sm py-2.5 justify-center shadow-md shadow-[#1746B8]/20 disabled:opacity-50"
          >
            {loading ? 'Validando Acesso...' : 'Entrar no Sistema'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Perfis de Acesso Rápido (Apenas seleciona o e-mail) */}
        <div className="pt-4 border-t border-[#27272A] space-y-2">
          <div className="text-[11px] font-semibold text-[#6B7280] text-center flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-400" />
            Contas de Teste (Preenche o e-mail de acesso):
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handlePreencherEmail('diretoria@imarf.com.br')}
              className="p-2.5 rounded-xl bg-[#18181B] hover:bg-[#222228] border border-[#27272A] hover:border-[#1746B8]/50 text-left transition"
            >
              <span className="font-bold text-white block">Admin Empresa</span>
              <span className="text-[#6B7280] truncate block">diretoria@imarf.com.br</span>
            </button>
            <button
              type="button"
              onClick={() => handlePreencherEmail('rh@imarf.com.br')}
              className="p-2.5 rounded-xl bg-[#18181B] hover:bg-[#222228] border border-[#27272A] hover:border-[#1746B8]/50 text-left transition"
            >
              <span className="font-bold text-white block">RH Operacional</span>
              <span className="text-[#6B7280] truncate block">rh@imarf.com.br</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onOpenPresentation}
            className="text-xs text-[#5E87F5] hover:underline"
          >
            ← Voltar para Apresentação Comercial
          </button>
        </div>
      </div>
    </div>
  );
};
