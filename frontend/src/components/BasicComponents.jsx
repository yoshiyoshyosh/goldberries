import {
  faArrowDown,
  faChevronDown,
  faEdit,
  faFileExport,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Container, Divider, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { get } from "react-hook-form";
import { Link } from "react-router-dom";

export function LoadingSpinner({ ...props }) {
  return (
    <Typography variant="h6" {...props}>
      Loading <FontAwesomeIcon icon={faSpinner} spin />
    </Typography>
  );
}

export function ErrorDisplay({ error }) {
  const errorMsg = getErrorMessage(error);
  return (
    <>
      <Typography variant="h4" color="error.main">
        Error
      </Typography>
      <Typography variant="body1" color="error.main">
        {errorMsg}
      </Typography>
    </>
  );
}
export function getErrorMessage(error) {
  return error.response?.data ? error.response.data.error : error.message;
}

export function BasicContainerBox({ maxWidth = "sm", children, sx = {}, ...props }) {
  return (
    <Container maxWidth={maxWidth}>
      <Box
        {...props}
        sx={{
          p: {
            xs: 2,
            sm: 5,
          },
          pt: {
            xs: 1,
            sm: 3,
          },
          mt: {
            xs: 5,
            sm: 1,
          },
          borderRadius: "10px",
          border: "1px solid #cccccc99",
          boxShadow: 1,
          ...sx,
        }}
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

export default function CustomizedMenu({ title, button, children, ...props }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const TriggerButton = button ?? (
    <Button variant="contained" disableElevation endIcon={<FontAwesomeIcon icon={faChevronDown} />}>
      {title}
    </Button>
  );

  return (
    <Box {...props}>
      <Box onClick={handleClick}>{TriggerButton}</Box>
      <Menu
        id="demo-customized-menu"
        disableScrollLock
        anchorEl={anchorEl}
        open={open}
        onClick={handleClose}
        onClose={handleClose}
      >
        {children}
      </Menu>
    </Box>
  );
}
