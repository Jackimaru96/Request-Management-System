import React, { JSX } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps | Readonly<ErrorBoundaryProps>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(): void {}

  render(): JSX.Element {
    const { hasError } = this.state;
    const { fallbackComponent, children } = this.props;

    if (hasError) {
      return <div>{fallbackComponent}</div>;
    }

    return <div>{children}</div>;
  }
}

export default ErrorBoundary;
