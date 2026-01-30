import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();

  // If context isn't ready, don't crash the whole app
  if (!auth) return <Navigate to="/login" replace />;

  const { user, loading } = auth;

  // wait while restoring localStorage
  if (loading) return <p>Loading...</p>;

  // not logged in
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
