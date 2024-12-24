import { useTheme } from "@emotion/react";
import { getQueryData, useGetServerSettings } from "../hooks/useApi";
import { Stack, Tooltip, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import Markdown from "react-markdown";
import { StyledExternalLink } from "./BasicComponents";

export function GlobalNoticesIcon({}) {
  const query = useGetServerSettings();
  const theme = useTheme();
  const serverSettings = getQueryData(query);
  if (serverSettings === null) return null;

  const { global_notices, maintenance_mode } = getQueryData(query);
  if (global_notices === null && maintenance_mode === false) {
    return null;
  }

  let severityInfo = getWorstSeverityInfo(theme, global_notices, maintenance_mode);

  return (
    <Tooltip
      title={
        <Stack direction="column" gap={1}>
          {maintenance_mode && (
            <GlobalNoticeRow
              notice={["info", "The site is currently in maintenance mode. Things might break."]}
            />
          )}
          {global_notices?.map((notice, index) => (
            <GlobalNoticeRow key={index} notice={notice} />
          ))}
        </Stack>
      }
      arrow
      leaveDelay={200}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: theme.palette.globalNotices.background,
            maxWidth: 400,
            boxShadow: theme.shadows[2],
          },
        },
        arrow: {
          sx: {
            color: theme.palette.globalNotices.background,
          },
        },
      }}
    >
      <FontAwesomeIcon
        icon={severityInfo.icon}
        color={severityInfo.color}
        fontSize="1.2em"
        style={{ marginRight: "5px" }}
      />
    </Tooltip>
  );
}
function GlobalNoticeRow({ notice }) {
  const theme = useTheme();
  const severity = notice[0];
  const message = notice[1];

  const severityInfo = getGlobalNoticeSeverityInfo(theme, severity);

  return (
    <Stack direction="row" gap={1} alignItems="center">
      <div style={{ backgroundColor: severityInfo.color, minWidth: "5px", alignSelf: "stretch" }} />
      <FontAwesomeIcon icon={severityInfo.icon} color={severityInfo.color} fontSize="1.5em" />
      <Typography variant="body1" fontSize="1.3em" color={theme.palette.text.primary}>
        <Markdown
          components={{
            a: ({ href, children, ...props }) => (
              <StyledExternalLink href={href}>{children}</StyledExternalLink>
            ),
            p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
            img: ({ src, alt }) => (
              <img src={src} alt={alt} style={{ maxWidth: "20px", transform: "translateY(4px)" }} />
            ),
            ul: ({ children }) => <ul style={{ margin: 0, paddingLeft: "16px" }}>{children}</ul>,
          }}
        >
          {message}
        </Markdown>
      </Typography>
    </Stack>
  );
}
export function getGlobalNoticeSeverityInfo(theme, severity) {
  const info = { icon: faInfoCircle, color: theme.palette.primary.main };
  switch (severity) {
    case "warning":
      return { icon: faExclamationCircle, color: theme.palette.warning.main };
    case "error":
      return { icon: faExclamationTriangle, color: theme.palette.error.main };
    case "success":
      return { icon: faCheckCircle, color: theme.palette.success.main };
  }
  return info;
}
function getWorstSeverityInfo(theme, globalNotices, isMaintenance) {
  if (globalNotices === null) return getGlobalNoticeSeverityInfo(theme, "info");

  const severities = ["success", "info", "warning", "error"];
  let worstIndex = isMaintenance ? 1 : 0;
  for (let i = 0; i < globalNotices.length; i++) {
    const severity = globalNotices[i][0];
    const index = severities.indexOf(severity);
    if (index > worstIndex) {
      worstIndex = index;
    }
  }
  return getGlobalNoticeSeverityInfo(theme, severities[worstIndex]);
}
