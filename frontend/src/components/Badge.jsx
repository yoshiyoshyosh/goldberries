import { Box, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { MarkdownRenderer } from "../pages/Post";
import { hasFlag } from "../pages/Account";
import { BADGE_FLAGS } from "./forms/Badge";
import Color from "color";
import { getQueryData, useGetBadge } from "../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "./BasicComponents";

export function BadgeDisplay({ player }) {
  const badges = player.data?.badges || [];
  return (
    <Stack direction="row" gap={1} alignItems="center">
      {badges.map((badge) => (
        <Badge key={badge.id} badge={badge} />
      ))}
    </Stack>
  );
}

export function BadgeAsync({ id, inline = true }) {
  const query = useGetBadge(id);

  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError) return <ErrorDisplay error={query.error} />;

  const badge = getQueryData(query);
  return (
    <Stack
      direction="row"
      sx={{ display: inline ? "inline-block" : undefined, verticalAlign: inline ? "middle" : undefined }}
      justifyContent="space-around"
      alignItems="center"
    >
      <Badge badge={badge} />
    </Stack>
  );
}

export function Badge({ badge }) {
  const theme = useTheme();
  return (
    <Tooltip
      title={<BadgeExplanation badge={badge} />}
      placement="bottom"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: theme.palette.tooltip.background,
            color: theme.palette.text.primary,
          },
        },
      }}
    >
      <Box height={32}>
        <BadgeImage badge={badge} />
      </Box>
      {/* <Stack sx={{ maxWidth: "fit-content" }}>
        <BadgeImage badge={badge} />
      </Stack> */}
    </Tooltip>
  );
}

function BadgeTitle({ badge }) {
  return <Typography variant="h6">{badge.title}</Typography>;
}
function BadgeImage({ badge, full = false }) {
  const borderColor = badge.color ? badge.color : "#ffffff";
  const borderWidth = full ? "4px" : "2px";
  const shinyClass = hasFlag(badge.flags, BADGE_FLAGS.shiny.flag) ? " shine" : "";
  const glowClass = hasFlag(badge.flags, BADGE_FLAGS.glow.flag) ? " glow" : "";
  const level1Class = hasFlag(badge.flags, BADGE_FLAGS.level1.flag) ? " level bronze" : "";
  const level2Class = hasFlag(badge.flags, BADGE_FLAGS.level2.flag) ? " level silver" : "";
  const level3Class = hasFlag(badge.flags, BADGE_FLAGS.level3.flag) ? " level gold" : "";
  const levelClass = level3Class || level2Class || level1Class || "";
  const fullClass = full ? " large" : "";

  // var backgroundColor = "#000000";
  // var backgroundColor = new Color(borderColor).darken(0.5).hex();
  // var backgroundColor = new Color(borderColor).desaturate(0.5).darken(0.35).hex();
  var backgroundColor = new Color(borderColor).darken(0.45).desaturate(0.4).hex();

  return (
    <Stack
      className={"badge-container" + fullClass + shinyClass + glowClass + levelClass}
      sx={{ height: full ? "128px" : "32px", width: full ? "128px" : "32px" }}
    >
      <img
        src={badge.icon_url}
        className="badge"
        height={full ? 128 : 32}
        loading="lazy"
        alt={badge.title}
        style={{
          borderRadius: "4px",
          border: "solid " + borderWidth + " " + borderColor,
          background: backgroundColor,
        }}
      />
    </Stack>
  );
}
function BadgeExplanation({ badge }) {
  return (
    <Stack direction="column" gap={1} sx={{ maxWidth: "300px", minWidth: "200px" }} alignItems="center">
      <BadgeTitle badge={badge} />
      <BadgeImage badge={badge} full />
      <Stack sx={{ textAlign: "center" }}>
        <MarkdownRenderer markdown={badge.description} isCentered />
      </Stack>
    </Stack>
  );
}
