import { Typography } from "@mui/material";
import { BasicContainerBox, StyledLink } from "../components/BasicComponents";
import { Trans, useTranslation } from "react-i18next";

export function Page403({ message }) {
  const { t } = useTranslation(undefined, { keyPrefix: "error_pages" });
  const defaultMessage = t("403.description");
  return (
    <BasicContainerBox maxWidth="sm">
      <Typography variant="h3" color="error.main">
        403
      </Typography>
      <Typography color="error.main">
        {t("403.forbidden")}: {message ?? defaultMessage}
      </Typography>
    </BasicContainerBox>
  );
}

export function PageNoPlayerClaimed() {
  const { t } = useTranslation(undefined, { keyPrefix: "error_pages.no_player_claimed" });
  return (
    <BasicContainerBox maxWidth="sm">
      <Typography variant="h3" color="error.main">
        {t("title")}
      </Typography>
      <Typography>
        <Trans t={t} i18nKey="description" components={{ CustomLink: <StyledLink to="/claim-player" /> }} />
      </Typography>
    </BasicContainerBox>
  );
}

export function Page404() {
  const { t } = useTranslation(undefined, { keyPrefix: "error_pages" });
  return (
    <BasicContainerBox maxWidth="sm">
      <Typography variant="h3" color="error">
        404
      </Typography>
      <Typography color="error.main">{t("404")}</Typography>
      <img src="/emotes/boomeline.gif" alt="boomeline" style={{ width: "100%" }} />
    </BasicContainerBox>
  );
}
