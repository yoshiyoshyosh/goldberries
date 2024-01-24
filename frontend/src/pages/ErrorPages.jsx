import { Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function Page403({ message }) {
  const defaultMessage = "You don't have permission to access this page.";
  return (
    <Container sx={{ p: 5 }} maxWidth="sm">
      <h1>403</h1>
      <Typography color="error.main">Forbidden: {message ?? defaultMessage}</Typography>
    </Container>
  );
}

export function PageNoPlayerClaimed() {
  return (
    <Container sx={{ p: 5 }} maxWidth="sm">
      <Typography variant="h3" color="error">
        Error
      </Typography>
      <Typography color="error.main">Your Account is missing setup!</Typography>
      <Typography>
        Please go to <Link to="/claim-player">this page</Link> to create a new Player, or claim an existing
        one!
      </Typography>
    </Container>
  );
}

export function Page404() {
  return (
    <Container sx={{ p: 5 }} maxWidth="sm">
      <Typography variant="h3" color="error">
        404
      </Typography>
      <Typography color="error.main">Page not found.</Typography>
    </Container>
  );
}
