import { faChevronDown, faInfoCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogContentText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { APP_NAME_LONG, APP_URL, TWITCH_EMBED_PARENT } from "../util/constants";
import { COUNTRY_CODES } from "../util/country_codes";
import { useTheme } from "@emotion/react";
import { LANGUAGES } from "../i18n/config";
import { useTranslation } from "react-i18next";

export function LoadingSpinner({ size = "normal", ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components" });
  const sizes = {
    normal: "h6",
    small: "body1",
  };
  const variant = sizes[size] ?? sizes["normal"];
  return (
    <Typography variant={variant} {...props}>
      {t("loading")} <FontAwesomeIcon icon={faSpinner} spin />
    </Typography>
  );
}

export function ErrorDisplay({ error }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components" });
  const errorMsg = getErrorMessage(error);
  return (
    <>
      <Typography variant="h4" color="error.main">
        {t("error")}
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

export function BasicContainerBox({
  maxWidth = "sm",
  children,
  sx = {},
  containerSx = {},
  ignoreNewMargins = false,
  ...props
}) {
  const newMargins = ignoreNewMargins
    ? {}
    : {
        mx: {
          xs: 0.5,
          sm: "auto",
        },
        width: {
          xs: "unset",
          sm: "unset",
        },
      };
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        "&&": {
          px: 0,
          ...newMargins,
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
            xs: 0,
            sm: 1,
          },
          borderRadius: {
            xs: "10px",
            sm: "10px",
          },
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
  const { t } = useTranslation(undefined, { keyPrefix: "components" });
  if (url === undefined || url === null || url === "") {
    return (
      <div {...props}>
        <Typography color="text.secondary">No clear video attached.</Typography>
      </div>
    );
  }

  const youtubeData = parseYouTubeUrl(url);
  if (youtubeData !== null) {
    //Create embed url
    let embedUrl = `https://www.youtube.com/embed/${youtubeData.videoId}`;
    if (youtubeData.timestamp) {
      embedUrl += `?start=${youtubeData.timestamp.replace("s", "")}`;
    }

    return (
      <div {...props}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            title="YouTube video player"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            style={{ width: "100%", height: "100%", position: "absolute", top: "0", left: "0" }}
          ></iframe>
        </div>
      </div>
    );
  } else if (url.includes("bilibili.com") && !url.includes("space.bilibili.com")) {
    let data = parseBilibiliUrl(url);
    url = `https://player.bilibili.com/player.html?bvid=${data.id}&page=${data.page}&high_quality=1&autoplay=false`;

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
  } else if (url.includes("twitch.tv")) {
    const { id } = parseTwitchUrl(url);
    const embedUrl = `https://player.twitch.tv/?video=${id}&parent=${TWITCH_EMBED_PARENT}`;
    return (
      <div {...props}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            title="Twitch Video Player"
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
        {t("video_embed.error")} <StyledExternalLink href={url}>{url}</StyledExternalLink>
      </Typography>
    </div>
  );
}
export function parseBilibiliUrl(link) {
  let id;

  // If it starts with 'av', it is an aid
  if (link.includes("/av")) {
    // Extract the AV id
    id = link.match(/av[0-9]+/g)[0];
  } else {
    // Extract the BV id
    id = link.match(/[bB][vV][0-9a-zA-Z]+/g)[0];
  }

  // Extract the page number, default to 1 if not found
  let pageMatch = link.match(/(\?|&)p=(\d+)/);
  let page = pageMatch ? parseInt(pageMatch[2]) : 1;

  // Return the result as an object
  return {
    id: id,
    page: page,
  };
}
export function parseTwitchUrl(url) {
  //URLs look like: https://www.twitch.tv/videos/2222820930
  const urlRegex = /^(https?:\/\/)?((www|m)\.)?(twitch\.tv)\/videos\/([^#&?]*).*/;
  const match = url.match(urlRegex);
  if (!match || !match[5]) {
    return null;
  }
  const id = match[5];
  return {
    id: id || null,
  };
}
export function parseYouTubeUrl(url) {
  const urlRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^#&?]*)(?:[?&][^#&?=]+=[^#&?]*)*/;
  const match = url.match(urlRegex);

  if (!match || !match[5]) {
    return null;
  }

  const videoId = match[5];

  try {
    const parsedUrl = new URL(url);
    const params = new URLSearchParams(parsedUrl.search);
    const timestamp = params.get("t") || null;

    return {
      videoId: videoId || null,
      timestamp: timestamp || null,
    };
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
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
  "https://www.bilibili.com",
  "https://github.com",
  "https://archive.org",
  "https://gamebanana.com",
  "https://docs.google.com",
  "https://www.google.com",
  "https://goldberries.net", //lmao
  "/", //lmao again
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
  const { t } = useTranslation(undefined, { keyPrefix: "components" });
  return (
    <Dialog open={isOpen} onClose={onClose} disableScrollLock>
      <DialogContent dividers>
        <DialogContentText>
          <Stack direction="column" gap={1} alignItems="center">
            <span>{t("external_link.warning")}</span>
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
  const { t } = useTranslation(undefined, { keyPrefix: "components.share_button" });
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
      {t(copied ? "copied" : "copy_link")}
    </Button>
  );
}

export function TooltipInfoButton({ title }) {
  return (
    <Tooltip title={title} placement="top" arrow>
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
export function InfoBoxIconTextLine({ icon, text, color, isSecondary = false, isMultiline = false }) {
  const theme = useTheme();
  let textColor = isSecondary ? theme.palette.text.secondary : theme.palette.text.primary;
  textColor = color ? color : textColor;
  return (
    <Stack direction="row" gap={1} alignItems="center">
      {icon}
      <Typography
        variant="body1"
        color={textColor}
        fontWeight={isSecondary ? "normal" : "bold"}
        sx={{ width: "100%", wordBreak: "break-word", whiteSpace: isMultiline ? "pre-line" : "unset" }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

export function LanguageFlag({ code, height = "20", style, showTooltip = false }) {
  const alt = COUNTRY_CODES[code];
  const img = (
    <img src={`/locales/flags/${code}.png`} height={height} loading="lazy" alt={alt} style={style} />
  );
  if (showTooltip) {
    return (
      <Tooltip title={alt} arrow placement="top">
        {img}
      </Tooltip>
    );
  }
  return img;
}

export function CustomIconButton({ children, sx = {}, ...props }) {
  return (
    <Button variant="outlined" sx={{ minWidth: "unset", ...sx }} {...props}>
      {children}
    </Button>
  );
}

export function TooltipLineBreaks({ title, children }) {
  return (
    <Tooltip title={<span style={{ whiteSpace: "pre-line" }}>{title}</span>} arrow placement="top">
      {children}
    </Tooltip>
  );
}

export function CountrySelect({ value, setValue, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.country_select" });
  return (
    <TextField
      select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      fullWidth
      SelectProps={{
        MenuProps: {
          disableScrollLock: true,
        },
      }}
      {...props}
    >
      <MenuItem value="">
        <em>{t("not_specified")}</em>
      </MenuItem>
      {Object.keys(COUNTRY_CODES).map((code) => (
        <MenuItem key={code} value={code}>
          <Stack direction="row" alignItems="center">
            <LanguageFlag code={code} height="20" style={{ marginRight: "0.5rem" }} />
            {COUNTRY_CODES[code]}
          </Stack>
        </MenuItem>
      ))}
    </TextField>
  );
}
