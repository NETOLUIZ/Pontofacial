import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Perfil } from '../types';

export const RequirePermission: React.FC<{ allowedProfiles: Perfil[]; children: React.ReactNode }> = ({ allowedProfiles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedProfiles.includes(user.perfil)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
};
