import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth();

  if (loading) return null;

  if (!user || userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
