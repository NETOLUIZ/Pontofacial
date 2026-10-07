import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#09090B] px-6 text-center text-white">
    <h1 className="text-3xl font-extrabold">Página não encontrada</h1>
    <p className="max-w-md text-sm text-slate-400">O endereço informado não corresponde a uma área disponível do portal RH.</p>
    <Link className="rounded-lg bg-[#1746B8] px-4 py-2 text-sm font-bold" to="/dashboard">Voltar ao dashboard</Link>
  </div>
);
