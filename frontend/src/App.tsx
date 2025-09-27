import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './modules/auth/ProtectedRoute';
import { Login } from './modules/auth/Login';
import { AppLayout } from './modules/layout/AppLayout';
import NewRequestPage from './modules/flights/NewRequestPage';
import MyRequestsPage from './modules/flights/MyRequestsPage';
import RequestDetailPage from './modules/flights/RequestDetailPage';
import OperatorPendingPage from './modules/operator/OperatorPendingPage';
import DestinationsCrudPage from './modules/admin/DestinationsCrudPage';

function Home() { return <div>Bienvenido 👋 — usa el menú.</div>; }

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
      >
        <Route index element={<Home />} />
        <Route path="flights">
          <Route path="new" element={<NewRequestPage />} />
          <Route path="mine" element={<MyRequestsPage />} />
          <Route path=":id" element={<RequestDetailPage />} />
        </Route>
        <Route path="operator/pending" element={<OperatorPendingPage />} />
        <Route path="admin/destinations" element={<DestinationsCrudPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
