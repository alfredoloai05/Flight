import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-4">
            <Link to="/" className="font-semibold">Flights</Link>
            <Link to="/requests" className="text-sm">Mis solicitudes</Link>
            <Link to="/new" className="text-sm">Nueva</Link>
            {user?.is_staff && <Link to="/operator" className="text-sm">Operador</Link>}
          </nav>
          <div className="text-sm">
            {user ? (
              <div className="flex items-center gap-3">
                <span>{user.username}</span>
                <button onClick={logout} className="text-blue-600">Salir</button>
              </div>
            ) : <Link to="/login" className="text-blue-600">Ingresar</Link>}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t py-3 text-center text-xs text-gray-500">Demo · Django + React</footer>
    </div>
  );
}