import Alert from "@mui/material/Alert";
import { JSX } from "react";

function ErrorBoundaryFallback(): JSX.Element {
  return (
    <Alert severity="error">Aw, Snap! Something went wrong while displaying this content.</Alert>
  );
}

export default ErrorBoundaryFallback;
