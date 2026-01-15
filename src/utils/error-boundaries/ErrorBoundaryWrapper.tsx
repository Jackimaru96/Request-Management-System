import { Suspense, ReactNode, JSX } from "react";

import ErrorBoundary from "./ErrorBoundary";
import ErrorBoundaryFallback from "./ErrorBoundaryFallback";
import SuspenseFallback from "./SuspenseFallback";

export interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  suspenseFallbackComponent?: ReactNode;
  errorBoundaryFallbackComponent?: ReactNode;
}

function ErrorBoundaryWrapper(props: ErrorBoundaryWrapperProps): JSX.Element {
  const { children, suspenseFallbackComponent, errorBoundaryFallbackComponent } = props;

  return (
    <ErrorBoundary fallbackComponent={errorBoundaryFallbackComponent ?? <ErrorBoundaryFallback />}>
      <Suspense fallback={suspenseFallbackComponent ?? <SuspenseFallback />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

ErrorBoundaryWrapper.defaultProps = {
  suspenseFallbackComponent: null,
  errorBoundaryFallbackComponent: null,
};

export default ErrorBoundaryWrapper;
