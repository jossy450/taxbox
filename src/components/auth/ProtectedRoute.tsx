import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  requireFeature?: string;
}

export default function ProtectedRoute({ children, roles, requireFeature }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const { canAccess } = useSubscription();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (requireFeature && !canAccess(requireFeature)) {
    return <Navigate to="/app/subscription" replace />;
  }

  return <>{children}</>;
}
