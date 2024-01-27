import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

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

export function BasicContainerBox({ maxWidth = "sm", children, sx = {}, ...props }) {
  return (
    <Container maxWidth={maxWidth}>
      <Box
        {...props}
        sx={{ mt: 8, p: 3, borderRadius: "10px", border: "1px solid #cccccc99", boxShadow: 1, ...sx }}
      >
        {children}
      </Box>
    </Container>
  );
}

export function ProofEmbed({ url, ...props }) {
  if (url === undefined || url === null || url === "") {
    return (
      <div {...props}>
        <Typography color="text.secondary">No clear video attached.</Typography>
      </div>
    );
  }

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let ytUrl = null;
    if (url.includes("youtu.be")) {
      ytUrl = url.replace("youtu.be", "youtube.com/embed");
    } else {
      ytUrl = url.replace("watch?v=", "embed/");
    }

    //Get rid of any extra url parameters
    ytUrl = ytUrl.split("&")[0];

    return (
      <div {...props}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}>
          <iframe
            src={ytUrl}
            title="YouTube video player"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            style={{ width: "100%", height: "100%", position: "absolute", top: "0", left: "0" }}
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div {...props}>
      <Typography color="text.secondary">
        Couldn't embed video:{" "}
        <Link to={url} target="_blank">
          {url}
        </Link>
      </Typography>
    </div>
  );
}
