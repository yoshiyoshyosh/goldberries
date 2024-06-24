import {
  faArrowDown,
  faChevronDown,
  faEdit,
  faFileExport,
  faInfoCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { APP_NAME_LONG } from "../util/constants";
import { useTheme } from "@emotion/react";
import { set } from "react-hook-form";
import { LANGUAGES } from "../i18n/config";

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
export function getErrorFromMultiple(...queries) {
  for (let query of queries) {
    if (query.isError) {
      return query.error;
    }
  }
  return null;
}

export function BasicContainerBox({ maxWidth = "sm", children, sx = {}, containerSx = {}, ...props }) {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        "&&": {
          pl: 0,
          pr: 0,
          ...containerSx,
        },
      }}
    >
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
          pb: {
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
export function BorderedBox({ children, sx = {}, ...props }) {
  return (
    <Box
      {...props}
      sx={{
        p: {
          xs: 2,
          sm: 3,
        },
        borderRadius: "10px",
        border: "1px solid #cccccc99",
        boxShadow: 1,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
export function BasicBox({ children, sx = {}, ...props }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: {
          xs: "100%",
          sm: "fit-content",
        },
        background: theme.palette.background.other,
        borderRadius: "10px",
        p: 1,
        border: "1px solid " + theme.palette.box.border,
        boxShadow: 1,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
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
  } else if (url.includes("bilibili.com")) {
    //get video id, which is after the last slash, and before a possible question mark
    const videoId = url.split("/").pop().split("?")[0];
    url = `https://player.bilibili.com/player.html?bvid=${videoId}&page=1&high_quality=1&autoplay=false`;

    return (
      <div {...props}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}>
          <iframe
            src={url}
            title="Bilibili video player"
            allowFullScreen
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

export function CustomizedMenu({ title, button, children, ...props }) {
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

export function HeadTitle({ title }) {
  return (
    <Helmet>
      <title>
        {title} - {APP_NAME_LONG}
      </title>
    </Helmet>
  );
}

export function StyledLink({ to, children, underline = false, style, ...props }) {
  const theme = useTheme();
  return (
    <Link to={to} style={{ color: theme.palette.links.main, ...style }} {...props} className="styled-link">
      {children}
    </Link>
  );
}

const SafeExternalDomains = [
  "https://www.youtube.com",
  "https://youtu.be",
  "https://discord.com",
  "https://discord.gg",
  "https://www.twitch.tv",
  "https://bilibili.com",
  "https://github.com",
  "https://archive.org",
  "https://gamebanana.com",
  "https://docs.google.com",
  "https://www.google.com",
];
export function StyledExternalLink({
  href,
  children,
  underline = true,
  target = "_blank",
  style,
  isSafe = false,
  ...props
}) {
  const theme = useTheme();

  //url has to start with one of the safe domains
  const isSafeLink = SafeExternalDomains.some((domain) => href.startsWith(domain)) || href.startsWith("#");
  const [openModal, setOpenModal] = useState(false);

  if (!isSafeLink && !isSafe) {
    const onCloseModal = () => {
      setOpenModal(false);
    };
    return (
      <>
        <a
          href={href}
          style={{ color: theme.palette.links.main, ...style }}
          onClick={(e) => {
            e.preventDefault();
            setOpenModal(true);
          }}
          {...props}
          className="styled-link"
        >
          {children}
        </a>
        <OpenExternalLinkModal href={href} isOpen={openModal} onClose={onCloseModal} />
      </>
    );
  }

  return (
    <a
      href={href}
      style={{ color: theme.palette.links.main, ...style }}
      {...props}
      className="styled-link"
      target={target}
      rel={target === "_blank" ? "noopener" : ""}
    >
      {children}
    </a>
  );
}
function OpenExternalLinkModal({ href, isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onClose={onClose} disableScrollLock>
      <DialogContent dividers>
        <DialogContentText>
          <Stack direction="column" gap={1} alignItems="center">
            <span>You are about to open an external link. Click this to continue:</span>
            <StyledExternalLink href={href} isSafe style={{ wordBreak: "break-all" }}>
              {href}
            </StyledExternalLink>
          </Stack>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

export function ShareButton({ text, ...props }) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Button onClick={handleClick} variant="outlined" color={copied ? "success" : "primary"} {...props}>
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}

export function TooltipInfoButton({ title }) {
  return (
    <Tooltip title={title}>
      <FontAwesomeIcon icon={faInfoCircle} />
    </Tooltip>
  );
}

export function InfoBox({ children }) {
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        bgcolor: (t) => t.palette.infoBox,
      }}
    >
      <Stack direction="column" gap={0.25}>
        {children}
      </Stack>
    </Box>
  );
}
export function InfoBoxIconTextLine({ icon, text, isSecondary = false }) {
  const theme = useTheme();
  const color = isSecondary ? theme.palette.text.secondary : theme.palette.text.primary;
  return (
    <Stack direction="row" gap={1} alignItems="center">
      {icon}
      <Typography variant="body1" color={color} fontWeight={isSecondary ? "normal" : "bold"}>
        {text}
      </Typography>
    </Stack>
  );
}

export function LanguageFlag({ code }) {
  const alt = LANGUAGES.find((lang) => lang.code === code)?.name;
  return <img src={`/locales/flags/${code}.png`} height="20" alt={alt} />;
}
