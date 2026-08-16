import React from 'react';
import { Result, Button } from 'antd';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Result
          status='error'
          title='Что-то пошло не так'
          subTitle={this.state.error?.message || 'Произошла непредвиденная ошибка'}
          extra={[
            <Button type='primary' key='retry' onClick={this.handleReset}>
              Попробовать снова
            </Button>,
            <Button key='reload' onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}
