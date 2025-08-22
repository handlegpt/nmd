import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
} from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { trackError, logError } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundaryOptimized extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Track error for analytics
    trackError(error, 'ErrorBoundary');
    
    // Log error details
    logError('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    if (error) {
      // In a real app, you would send this to your error reporting service
      const errorReport = {
        id: errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: Platform.OS === 'web' ? navigator.userAgent : Platform.OS,
        platform: Platform.OS,
      };
      
      logError('Error Report:', errorReport);
      
      // TODO: Send to error reporting service (e.g., Sentry, Bugsnag)
      // sendErrorReport(errorReport);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Card style={styles.errorCard}>
            <Card.Content style={styles.errorContent}>
              <View style={styles.errorHeader}>
                <IconButton
                  icon="alert-circle"
                  size={48}
                  iconColor={colors.error}
                  style={styles.errorIcon}
                />
                <Title style={styles.errorTitle}>
                  Oops! Something went wrong
                </Title>
              </View>
              
              <Paragraph style={styles.errorMessage}>
                We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
              </Paragraph>

              {this.props.showErrorDetails && this.state.error && (
                <View style={styles.errorDetails}>
                  <Paragraph style={styles.errorDetailsTitle}>
                    Error Details:
                  </Paragraph>
                  <Paragraph style={styles.errorDetailsText}>
                    {this.state.error.message}
                  </Paragraph>
                  {this.state.errorInfo?.componentStack && (
                    <Paragraph style={styles.errorDetailsText}>
                      {this.state.errorInfo.componentStack}
                    </Paragraph>
                  )}
                </View>
              )}

              <View style={styles.errorActions}>
                <Button
                  mode="contained"
                  onPress={this.handleReset}
                  style={styles.resetButton}
                  labelStyle={styles.resetButtonLabel}
                >
                  Try Again
                </Button>
                
                <TouchableOpacity
                  onPress={this.handleReportError}
                  style={styles.reportButton}
                >
                  <Paragraph style={styles.reportButtonText}>
                    Report Issue
                  </Paragraph>
                </TouchableOpacity>
              </View>

              <View style={styles.errorFooter}>
                <Paragraph style={styles.errorFooterText}>
                  Error ID: {this.state.errorId}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export const useErrorBoundary = () => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
      trackError(event.error, 'useErrorBoundary');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setHasError(true);
      setError(new Error(event.reason));
      trackError(new Error(event.reason), 'useErrorBoundary');
    };

    if (Platform.OS === 'web') {
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  const resetError = () => {
    setHasError(false);
    setError(null);
  };

  return { hasError, error, resetError };
};

// Higher-order component for error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryOptimized {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundaryOptimized>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    elevation: 4,
  },
  errorContent: {
    padding: spacing.lg,
  },
  errorHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorIcon: {
    marginBottom: spacing.sm,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  errorMessage: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  errorDetails: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorDetailsTitle: {
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  errorDetailsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resetButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  resetButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportButton: {
    padding: spacing.sm,
  },
  reportButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorFooter: {
    alignItems: 'center',
  },
  errorFooterText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
