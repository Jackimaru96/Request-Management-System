import { ReactElement } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useSystemTheme } from "@nautilus/nds-react";
import { useNavigate } from "react-router";

function DefaultLandingPage(): ReactElement {
  const { handleSetMode, handleSetFontSize } = useSystemTheme();
  const navigate = useNavigate();

  return (
    <Container sx={{ p: 4 }}>
      <Typography variant="h4">Task Management System</Typography>
      <Box my={3}>
        <Typography gutterBottom>Theme</Typography>
        <Button
          onClick={() => {
            handleSetMode("light");
          }}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Light mode
        </Button>
        <Button
          onClick={() => {
            handleSetMode("dark");
          }}
          variant="outlined"
        >
          Dark mode
        </Button>
      </Box>
      <Box mb={6}>
        <Typography gutterBottom>Font size accessibility options</Typography>
        <Button
          onClick={() => {
            handleSetFontSize("normal");
          }}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Normal font size
        </Button>
        <Button
          onClick={() => {
            handleSetFontSize("large");
          }}
          variant="outlined"
        >
          Large font size
        </Button>
      </Box>
      <Button onClick={() => navigate("/request-listing-page")}>Go to application</Button>
    </Container>
  );
}

export default DefaultLandingPage;
