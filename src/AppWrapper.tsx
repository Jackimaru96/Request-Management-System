import { CssBaseline } from "@mui/material";
import type React from "react";
import { JSX } from "react";
import { SystemThemeProvider, GlobalStylesWrapper } from "@nautilus/nds-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface AppWrapperProps {
  children: React.ReactNode;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Only retry failed requests once
    },
  },
});

function AppWrapper(props: AppWrapperProps): JSX.Element {
  const { children } = props;

  return (
    <QueryClientProvider client={queryClient}>
      <SystemThemeProvider>
        <GlobalStylesWrapper>
          <CssBaseline />
          {children}
        </GlobalStylesWrapper>
      </SystemThemeProvider>
    </QueryClientProvider>
  );
}

export default AppWrapper;
