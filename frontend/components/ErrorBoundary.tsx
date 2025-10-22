/**
 * Error Boundary Component
 * 
 * React error'larını yakalar ve loglar.
 * 
 * Özellikler:
 * - React error'larını yakala ve logla
 * - Component stack trace
 * - User actions leading to error
 * - Fallback UI göster
 * - Error reporting (opsiyonel)
 * 
 * Kullanım:
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

// ===== INTERFACES =====

/**
 * Error Boundary Props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  component?: string;
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ===== ERROR BOUNDARY CLASS =====

/**
 * Error Boundary Class Component
 * 
 * React error'larını yakalar ve loglar
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }
  
  /**
   * Error yakalandığında çağrılır
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }
  
  /**
   * Error yakalandığında çağrılır
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // State'i güncelle
    this.setState({
      error,
      errorInfo,
    });
    
    // Error'ı logla
    logger.errorBoundary(error, errorInfo, this.props.component);
    
    // Custom error handler varsa çağır
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Error reporting (opsiyonel)
    this.reportError(error, errorInfo);
  }
  
  /**
   * Error reporting
   * 
   * External error reporting servisine gönder
   */
  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Production'da error reporting servisine gönder
    if (process.env.NODE_ENV === 'production') {
      // Sentry, Bugsnag, vb. servislere gönder
      console.error('Error reported to external service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        component: this.props.component,
      });
    }
  }
  
  /**
   * Error'ı temizle ve tekrar dene
   */
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    logger.info('Error Boundary retry triggered', {
      component: this.props.component,
    }, this.props.component || 'ERROR_BOUNDARY', 'RETRY');
  };
  
  /**
   * Sayfayı yenile
   */
  private handleReload = () => {
    logger.info('Error Boundary reload triggered', {
      component: this.props.component,
    }, this.props.component || 'ERROR_BOUNDARY', 'RELOAD');
    
    window.location.reload();
  };
  
  /**
   * Render
   */
  render() {
    if (this.state.hasError) {
      // Custom fallback UI varsa onu kullan
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Bir Hata Oluştu
              </h2>
              
              <p className="text-sm text-gray-600 mb-4">
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Development Error Details:
                  </h3>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-red-700 whitespace-pre-wrap mt-1">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Tekrar Dene
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Sayfayı Yenile
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Normal render
    return this.props.children;
  }
}

// ===== HOOK VERSION =====

/**
 * Error Boundary Hook
 * 
 * Functional component'ler için error handling
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = React.useCallback((error: Error) => {
    setError(error);
    logger.errorBoundary(error, { componentStack: '' }, 'HOOK_ERROR_BOUNDARY');
  }, []);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return { captureError, resetError };
};

// ===== HIGHER ORDER COMPONENT =====

/**
 * withErrorBoundary HOC
 * 
 * Component'i error boundary ile sarmalar
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary component={componentName || Component.displayName || Component.name}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// ===== ERROR BOUNDARY PROVIDER =====

/**
 * Error Boundary Context
 */
interface ErrorBoundaryContextType {
  captureError: (error: Error, errorInfo?: ErrorInfo) => void;
  resetError: () => void;
}

const ErrorBoundaryContext = React.createContext<ErrorBoundaryContextType | null>(null);

/**
 * Error Boundary Provider
 * 
 * Global error handling için context provider
 */
export const ErrorBoundaryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = React.useState<ErrorInfo | null>(null);
  
  const captureError = React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    setError(error);
    setErrorInfo(errorInfo || null);
    logger.errorBoundary(error, errorInfo || { componentStack: '' }, 'PROVIDER_ERROR_BOUNDARY');
  }, []);
  
  const resetError = React.useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);
  
  const value = React.useMemo(() => ({
    captureError,
    resetError,
  }), [captureError, resetError]);
  
  return (
    <ErrorBoundaryContext.Provider value={value}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
};

/**
 * useErrorBoundaryContext Hook
 * 
 * Error boundary context'ini kullan
 */
export const useErrorBoundaryContext = () => {
  const context = React.useContext(ErrorBoundaryContext);
  
  if (!context) {
    throw new Error('useErrorBoundaryContext must be used within ErrorBoundaryProvider');
  }
  
  return context;
};

// ===== EXPORTS =====

export default ErrorBoundary;
