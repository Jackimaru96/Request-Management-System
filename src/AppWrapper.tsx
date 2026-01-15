import { CssBaseline } from "@mui/material";
import type React from "react";
import { JSX } from "react";
import { SystemThemeProvider, GlobalStylesWrapper } from "@nautilus/nds-react";

interface AppWrapperProps {
  children: React.ReactNode;
}

function AppWrapper(props: AppWrapperProps): JSX.Element {
  const { children } = props;

  return (
    <SystemThemeProvider>
      <GlobalStylesWrapper>
        <CssBaseline />
        {children}
      </GlobalStylesWrapper>
    </SystemThemeProvider>
  );
}

export default AppWrapper;
