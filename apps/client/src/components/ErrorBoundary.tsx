import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetErrorBoundary={this.resetErrorBoundary} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0b141c]">
          <div className="max-w-md w-full text-center space-y-4 p-6 bg-[#161b22] border border-[#30363d] rounded-xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f85149]/20 border border-[#f85149] flex items-center justify-center text-[#f85149]">
              <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                <path d="M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#f0f6fc]">Something went wrong</h2>
            <p className="text-sm text-[#8b949e]">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.resetErrorBoundary}
              className="dev-btn dev-btn-primary mt-2"
            >
              Try again
            </button>
            <details className="text-left mt-4 text-[11px] text-[#6e7681] font-mono">
              <summary className="cursor-pointer text-[#8b949e]">Error details</summary>
              <pre className="mt-2 p-2 bg-[#0d1117] rounded overflow-auto max-h-40">
                {this.state.error?.stack ?? 'No stack trace'}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
