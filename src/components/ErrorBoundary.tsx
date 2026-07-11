import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary
 * Catches unhandled React rendering errors and shows a friendly recovery UI.
 * Prevents the entire app from crashing on a single page/component failure.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {this.props.fallbackMessage ||
                  "An unexpected error occurred. This has been logged. Please try refreshing."}
              </p>
            </div>
            {this.state.error && (
              <div className="text-left bg-red-100 border border-red-500 p-4 rounded-xl">
                <h3 className="font-bold text-red-700">Error Details:</h3>
                <p className="text-red-900 font-mono text-sm whitespace-pre-wrap">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-xs bg-red-50 text-red-800 rounded p-2 overflow-auto max-h-64">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-primary-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/student-hub'; }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight lazy-loading suspense wrapper with skeleton fallback.
 */
export const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);
