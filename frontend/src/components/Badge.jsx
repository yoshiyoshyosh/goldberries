import { Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { MarkdownRenderer } from "../pages/Post";
import { hasFlag } from "../pages/Account";
import { BADGE_FLAGS } from "./forms/Badge";

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
      <Stack sx={{ maxWidth: "fit-content" }}>
        <BadgeImage badge={badge} />
      </Stack>
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
          background: "#000000",
          // background: badge.color || "#000000",
        }}
      />
    </Stack>
  );
}
function BadgeExplanation({ badge }) {
  return (
    <Stack direction="column" gap={1} sx={{ maxWidth: "300px" }} alignItems="center">
      <BadgeTitle badge={badge} />
      <BadgeImage badge={badge} full />
      <MarkdownRenderer markdown={badge.description} />
    </Stack>
  );
}
