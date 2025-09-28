import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ p: 4, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  return user ? children : <Navigate to="/login" replace />;
}

export function OperatorRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ p: 4, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  return user && (user.is_staff || user.is_superuser) ? children : <Navigate to="/" replace />;
}

// Sólo usuarios finales (no admin/staff)
export function EndUserRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ p: 4, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/login" replace />;
  return (user.is_staff || user.is_superuser) ? <Navigate to="/" replace /> : children;
}
