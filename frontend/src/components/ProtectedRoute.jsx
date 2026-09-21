import { Navigate } from 'react-router-dom';
import { getToken } from '../api';

// Only lets logged-in users through; everyone else is sent to /login
export default function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}
