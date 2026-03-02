import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClassContext } from '@/contexts/ClassContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  skipDiagnosticCheck?: boolean;
}

// Routes that foundation (Class 6-10) students should NOT access
const COMPETITIVE_ONLY_ROUTES = ['/major-test', '/circles', '/tutorial-sessions'];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  skipDiagnosticCheck = false,
}) => {
  const { user, loading } = useAuth();
  const { diagnosticCompleted, isFoundation } = useClassContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Enforce diagnostic completion before accessing platform
  if (
    requireAuth &&
    user &&
    !skipDiagnosticCheck &&
    !diagnosticCompleted &&
    location.pathname !== '/diagnostic-test' &&
    location.pathname !== '/select-exam' &&
    location.pathname !== '/profile'
  ) {
    return <Navigate to="/diagnostic-test" replace />;
  }

  // Block foundation students from competitive-only routes
  if (requireAuth && user && isFoundation) {
    if (COMPETITIVE_ONLY_ROUTES.some(r => location.pathname.startsWith(r))) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
