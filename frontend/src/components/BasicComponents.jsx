import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography } from "@mui/material";

export function LoadingSpinner({}) {
  return (
    <Typography variant="h6">
      Loading <FontAwesomeIcon icon={faSpinner} spin />
    </Typography>
  );
}

export function ErrorDisplay({ error }) {
  const errorMsg = error.response.data ? error.response.data.message : error.message;
  return <Typography variant="h6">Error: {errorMsg}</Typography>;
}
