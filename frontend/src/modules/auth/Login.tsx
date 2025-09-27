import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [username, setU] = useState('agloaiza');
  const [password, setP] = useState('Clave123');
  const [error, setE] = useState<string | null>(null);
  const [loading, setL] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setE(null); setL(true);
    try {
      await login(username, password);
      nav('/new');
    } catch (err: any) {
      setE(err.message || 'Error');
    } finally {
      setL(false);
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Ingresar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Usuario" value={username} onChange={e=>setU(e.target.value)} />
        <input className="border p-2 w-full" type="password" placeholder="Clave" value={password} onChange={e=>setP(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white px-3 py-2 rounded w-full" disabled={loading}>
          {loading ? '...' : 'Entrar'}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-3">Demo: admin/Clave123 o agloaiza/Clave123</p>
    </div>
  );
}
