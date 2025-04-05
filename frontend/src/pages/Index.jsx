import {
  BorderedBox,
  ErrorDisplay,
  HeadTitle,
  LanguageFlag,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import { Container, Grid, Stack, Typography } from "@mui/material";
import { getQueryData, useGetAllDifficulties, useGetStatsGlobal, useGetVerifierList } from "../hooks/useApi";
import { DifficultyValueChip, PlayerChip } from "../components/GoldberriesComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreativeCommonsBy, faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleQuestion,
  faCreditCard,
  faFileLines,
  faLegal,
  faMoneyBill1Wave,
  faQuestion,
  faScaleBalanced,
  faScroll,
} from "@fortawesome/free-solid-svg-icons";
import { RecentSubmissions } from "../components/RecentSubmissions";
import { DIFF_CONSTS, DISCORD_INVITE, getDifficultySubtierShares } from "../util/constants";
import { Trans, useTranslation } from "react-i18next";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { PostIndexWidget } from "./Post";
import { useAuth } from "../hooks/AuthProvider";

export function PageIndex() {
  const auth = useAuth();
  const { t } = useTranslation(undefined, { keyPrefix: "index" });
  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 2,
        pb: 3,
      }}
    >
      <HeadTitle title={t("title")} />
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Stack direction="column" spacing={2}>
            <BorderedBox>
              <WelcomeComponent />
            </BorderedBox>
            <BorderedBox>
              <PostIndexWidget />
            </BorderedBox>
            <BorderedBox>
              <GlobalStatsComponent />
            </BorderedBox>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Stack direction="column" spacing={2}>
            {!auth.hasPlayerClaimed && (
              <BorderedBox>
                <GettingStarted />
              </BorderedBox>
            )}
            <BorderedBox>
              <RecentSubmissions />
            </BorderedBox>
            <BorderedBox>
              <ErrorBoundary>
                <ReworkNotice />
              </ErrorBoundary>
            </BorderedBox>
            <BorderedBox>
              <UsefulLinksComponent />
            </BorderedBox>
            <BorderedBox>
              <IssueTrackerNotice />
            </BorderedBox>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export function WelcomeComponent() {
  const { t } = useTranslation(undefined, { keyPrefix: "index.welcome" });
  return (
    <>
      <Typography variant="h4">{t("header")}</Typography>
      <Typography variant="body1" gutterBottom>
        {t("text")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("info")}
      </Typography>
      <Typography variant="h6">{t("team_members")}</Typography>
      <TeamMemberList />
    </>
  );
}
export function TeamMemberList() {
  const query = useGetVerifierList();

  if (query.isLoading || query.isFetching) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const verifiers = getQueryData(query);
  const verfiersSorted = verifiers.sort((a, b) => {
    //Sort first by player.account.role, then by player.name
    if (a.account.role === b.account.role) {
      return a.name.localeCompare(b.name);
    } else {
      return b.account.role - a.account.role;
    }
  });

  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {verfiersSorted.map((verifier) => (
        <PlayerChip key={verifier.id} player={verifier} size="small" />
      ))}
    </Stack>
  );
}

export function UsefulLinksComponent() {
  const { t } = useTranslation(undefined, { keyPrefix: "index.links" });

  return (
    <>
      <Typography variant="h6">{t("header")}</Typography>
      <ul style={{ listStyleType: "none" }}>
        <li>
          <FontAwesomeIcon icon={faScaleBalanced} /> <StyledLink to="/rules">{t("rules")}</StyledLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleQuestion} /> <StyledLink to="/faq">{t("faq")}</StyledLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faDiscord} color="#5865f2" />{" "}
          <StyledExternalLink href={DISCORD_INVITE} target="_blank" rel="noreferrer">
            {t("modded_golden_team_discord")}
          </StyledExternalLink>
        </li>
      </ul>

      <Typography variant="h6">{t("header_other_lists")}</Typography>
      <ul style={{ listStyleType: "none" }}>
        <li>
          <FontAwesomeIcon icon={faScroll} />{" "}
          <StyledExternalLink
            href="https://docs.google.com/spreadsheets/d/1FesTb6qkgMz-dCn7YdioRydToWSQNTg1axFEIHU4FF8/edit#gid=0"
            target="_blank"
            rel="noreferrer"
          >
            {t("fwg_sheet")}
          </StyledExternalLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faScroll} />{" "}
          <StyledExternalLink
            href="https://docs.google.com/spreadsheets/d/1a32h6LErb1PAyYGsIO8hY-Y1pd-3r4co3M6RnuIRTZE/edit?usp=drivesdk"
            target="_blank"
            rel="noreferrer"
          >
            {t("survivors_list")}
          </StyledExternalLink>
        </li>
      </ul>

      <Typography variant="h6">{t("header_other")}</Typography>
      <ul style={{ listStyleType: "none" }}>
        <li>
          <FontAwesomeIcon icon={faDiscord} color="#5865f2" />{" "}
          <StyledExternalLink href="https://discord.gg/celeste" target="_blank" rel="noreferrer">
            {t("celeste_discord")}
          </StyledExternalLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faDiscord} color="#5865f2" />{" "}
          <StyledExternalLink href="https://discord.gg/XVxrn84eum" target="_blank" rel="noreferrer">
            {t("celeste_discord_fr")}
          </StyledExternalLink>{" "}
          <LanguageFlag code="fr" height="15" />
        </li>
        <li>
          <FontAwesomeIcon icon={faDiscord} color="#5865f2" />{" "}
          <StyledExternalLink href="https://discord.gg/QH3A9AfXk4" target="_blank" rel="noreferrer">
            {t("celeste_discord_pt_br")}
          </StyledExternalLink>{" "}
          <LanguageFlag code="pt" height="15" /> <LanguageFlag code="br" height="15" />
        </li>
        <li>
          <FontAwesomeIcon icon={faMoneyBill1Wave} />{" "}
          <StyledLink to="/server-costs">{t("server_costs")}</StyledLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faLegal} /> <StyledLink to="/legal-notice">{t("legal_notice")}</StyledLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faFileLines} /> <StyledLink to="/api-docs">{t("api_docs")}</StyledLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faCreativeCommonsBy} /> <StyledLink to="/credits">{t("credits")}</StyledLink>
        </li>
      </ul>
    </>
  );
}

function GettingStarted() {
  const { t } = useTranslation(undefined, { keyPrefix: "index.getting_started" });
  return (
    <>
      <Typography variant="h5">{t("header")}</Typography>
      <Typography variant="body1" gutterBottom>
        {t("preface")}
      </Typography>
      <ul>
        <li>{t("video")}</li>
        <li>
          <Trans
            t={t}
            i18nKey="account"
            components={{
              RegisterLink: <StyledLink to="/register" />,
              LoginLink: <StyledLink to="/login" />,
            }}
          />
        </li>
        <li>
          <Trans t={t} i18nKey="player" components={{ CustomLink: <StyledLink to="/claim-player" /> }} />
        </li>
        <li>
          <Trans
            t={t}
            i18nKey="submit"
            components={{ RulesLink: <StyledLink to="/rules" />, CustomLink: <StyledLink to="/submit" /> }}
          />
        </li>
      </ul>
    </>
  );
}
function ReworkNotice() {
  const { t } = useTranslation(undefined, { keyPrefix: "index.rework" });
  const bulletPoints = t("bullet_points", { returnObjects: true });
  return (
    <>
      <Typography variant="h5">{t("header")}</Typography>
      <Typography variant="body1" gutterBottom>
        {t("text")}
      </Typography>
      <ul>
        {bulletPoints.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
      <Typography variant="body1" gutterBottom>
        {t("more_text")}
      </Typography>
      {/* <Typography variant="body1" gutterBottom>
        {t("migration")}
      </Typography> */}
    </>
  );
}

function IssueTrackerNotice() {
  const { t } = useTranslation(undefined, { keyPrefix: "index.issues" });
  return (
    <>
      <Typography variant="h5">{t("header")}</Typography>
      <Typography variant="body1" gutterBottom>
        <Trans t={t} i18nKey="text" components={{ CustomExternalLink: <StyledExternalLink /> }} />
      </Typography>
    </>
  );
}

export function GlobalStatsComponent() {
  const { t } = useTranslation(undefined, { keyPrefix: "index.global_stats" });
  const query = useGetStatsGlobal();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const { overall, difficulty } = getQueryData(query);
  const { campaigns, maps, challenges, submissions, players, real_campaigns } = overall;

  //difficulty is an object with key => value being id => submission count

  return (
    <>
      <Typography variant="h6">{t("header")}</Typography>
      <Typography variant="body1">{t("totals.header")}</Typography>
      <ul style={{ marginBottom: "4px", marginTop: "4px" }}>
        <li>
          <Trans
            t={t}
            i18nKey="totals.campaigns"
            values={{ campaigns, standalone: campaigns - real_campaigns }}
          />
        </li>
        <li>
          <Trans t={t} i18nKey="totals.maps" values={{ maps, challenges }} />
        </li>
        <li>
          <Trans t={t} i18nKey="totals.submissions" values={{ submissions, players }} />
        </li>
      </ul>
      <Typography variant="h6">{t("difficulty_stats.header")}</Typography>
      <Typography variant="body2" gutterBottom>
        {t("difficulty_stats.text")}
      </Typography>
      <TiersCountDisplay stats={difficulty} />
    </>
  );
}

export function TiersCountDisplay({ stats, differences, hideEmpty = false, equalWidths = 0 }) {
  const query = useGetAllDifficulties();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const difficulties = getQueryData(query);

  return (
    <Grid container rowSpacing={1} columnSpacing={2}>
      {difficulties.map((diff) => {
        // if (diff.id === DIFF_CONSTS.TRIVIAL_ID) return null; //Skip "trivial"
        const count = stats[diff.id] || 0;
        const difference = differences ? differences[diff.id] : null;
        const isEmpty = count === 0;

        let width = getDifficultySubtierShares(diff.id);
        return (
          <Grid item key={diff.id} xs={12} md={width}>
            <DifficultyValueChip
              difficulty={diff}
              value={count + (difference ? ` (+${difference})` : "")}
              useDarkening
              sx={{ width: 1, fontSize: "1em", opacity: isEmpty && hideEmpty ? 0.15 : 1 }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
