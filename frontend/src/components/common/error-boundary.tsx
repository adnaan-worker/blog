import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from '@emotion/styled';
import { Button } from 'adnaan-ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
`;

const ErrorDetails = styled.details`
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  text-align: left;

  summary {
    cursor: pointer;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  pre {
    font-size: 0.85rem;
    color: var(--text-tertiary);
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // 在开发环境打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('错误边界捕获到错误:', error);
      console.error('组件栈:', errorInfo.componentStack);
    }

    // 生产环境可以上报到错误监控服务
    // 例如: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <ErrorContainer>
          <ErrorTitle>😕 页面出错了</ErrorTitle>
          <ErrorMessage>抱歉，页面遇到了一些问题。您可以尝试刷新页面或返回首页。</ErrorMessage>

          <ButtonGroup>
            <Button variant="primary" onClick={this.handleReload}>
              刷新页面
            </Button>
            <Button variant="ghost" onClick={this.handleGoHome}>
              返回首页
            </Button>
          </ButtonGroup>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <summary>查看错误详情（仅开发环境）</summary>
              <pre>
                <strong>错误信息:</strong>
                {'\n'}
                {this.state.error.toString()}
                {'\n\n'}
                <strong>错误堆栈:</strong>
                {'\n'}
                {this.state.error.stack}
                {'\n\n'}
                {this.state.errorInfo && (
                  <>
                    <strong>组件栈:</strong>
                    {'\n'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
