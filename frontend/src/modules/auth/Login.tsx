import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Box, Paper, Typography, TextField, Button, Stack } from '@mui/material';

export const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.username, form.password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Paper sx={{ p: 4, width: 380 }}>
        <Typography variant="h6" gutterBottom>Iniciar sesión</Typography>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Usuario"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            />
            <TextField
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" disabled={loading}>Entrar</Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};
