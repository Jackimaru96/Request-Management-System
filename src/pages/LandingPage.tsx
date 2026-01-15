import { Button, Container, Typography } from "@mui/material";
import { JSX } from "react";
import { useNavigate } from "react-router";

function LandingPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <Container sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        MFE ReactJS Template: version 1.1.0
      </Typography>
      <Typography>
        For remote MFE apps: this is the landing page of the remote MFE application and will not be
        shown to the users! &quot;/&quot; path will be used by the container MFE application. Please
        create a base route for all of your pages, like /app1, /app1/page1, /app1/page2 etc.
      </Typography>
      <Button onClick={() => navigate("/app1")}>Go to app1 landing page</Button>
    </Container>
  );
}

export default LandingPage;
