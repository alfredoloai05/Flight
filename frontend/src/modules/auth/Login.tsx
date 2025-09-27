import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Alert from '@mui/material/Alert';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [username, setU] = useState('agloaiza');
  const [password, setP] = useState('Clave123');
  const [show, setShow] = useState(false);
  const [error, setE] = useState<string | null>(null);
  const [loading, setL] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setE(null); setL(true);
    try {
      await login(username.trim(), password);
      nav('/new');
    } catch (err: any) {
      setE(err.message || 'Error al ingresar');
    } finally {
      setL(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: (t)=>t.palette.background.default }}>
      <Card sx={{ width: 380, p: 1 }} elevation={3}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom color="primary">Ingresar</Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Usuario" value={username} onChange={e=>setU(e.target.value)} autoFocus required />
            <TextField
              label="Clave"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e=>setP(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="mostrar u ocultar clave" onClick={()=>setShow(s=>!s)} edge="end">
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" disabled={loading} size="large">{loading ? 'Ingresando…' : 'Entrar'}</Button>
            <Typography variant="caption" color="text.secondary">Demo: admin/Clave123 o agloaiza/Clave123</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
