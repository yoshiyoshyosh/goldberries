import {
  BorderedBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import {
  Container,
  Grid,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { getQueryData, useGetAllDifficulties, useGetStatsGlobal, useGetVerifierList } from "../hooks/useApi";
import { DifficultyValueChip, PlayerChip } from "../components/GoldberriesComponents";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faMoneyBill1Wave,
  faQuestion,
  faQuestionCircle,
  faScaleBalanced,
  faScroll,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import Markdown from "react-markdown";
import { useTheme } from "@emotion/react";
import { RecentSubmissions } from "../components/RecentSubmissions";
import { DISCORD_INVITE, getDifficultySubtierShares } from "../util/constants";
import { Trans, useTranslation } from "react-i18next";

export function PageIndex() {
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
              <GettingStarted />
            </BorderedBox>
            <BorderedBox>
              <GlobalStatsComponent />
            </BorderedBox>
            <BorderedBox>
              <ReleaseNotice />
            </BorderedBox>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Stack direction="column" spacing={2}>
            <BorderedBox>
              <RecentSubmissions />
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
  const verfiersSorted = verifiers.sort((a, b) => a.name.localeCompare(b.name));

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
          <FontAwesomeIcon icon={faQuestion} /> <StyledLink to="/faq">{t("faq")}</StyledLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faDiscord} color="#5865f2" />{" "}
          <StyledExternalLink href="https://discord.gg/celeste" target="_blank" rel="noreferrer">
            {t("celeste_discord")}
          </StyledExternalLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faDiscord} color="#5865f2" />{" "}
          <StyledExternalLink href={DISCORD_INVITE} target="_blank" rel="noreferrer">
            {t("modded_golden_team_discord")}
          </StyledExternalLink>
        </li>
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
        <li>
          <FontAwesomeIcon icon={faMoneyBill1Wave} />{" "}
          <StyledLink to="/server-costs">{t("server_costs")}</StyledLink>
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
          <Trans t={t} i18nKey="submit" components={{ CustomLink: <StyledLink to="/submit" /> }} />
        </li>
      </ul>
    </>
  );
}
function ReleaseNotice() {
  const { t } = useTranslation(undefined, { keyPrefix: "index.newly_released" });
  return (
    <>
      <Typography variant="h5">{t("header")}</Typography>
      <Typography variant="body1" gutterBottom>
        {t("text")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("migration")}
      </Typography>
    </>
  );
}

function PublicTestNotice() {
  return (
    <>
      <Typography variant="h5">Public Test</Typography>
      <Typography variant="body1" gutterBottom>
        The public test for this website has started! If you want to help test the website, please do so!
        Create an account, claim your player (from the data migrated from the spreadsheet) and just look
        around and checkout all the features. Other than for the player-claiming process feel free to make
        meme submissions/suggestions, as the data currently in the system will be wiped for the actual release
        anyways.
      </Typography>
      <Typography variant="body1" gutterBottom>
        Things you can test:
      </Typography>
      <ul>
        <li>Create an account</li>
        <li>Claim your player, or create a new one (pls no meme with this)</li>
        <li>Top Golden List</li>
        <li>Campaign List</li>
        <li>Create Submissions</li>
        <li>Change your account settings</li>
        <li>Change app settings</li>
        <li>Create Suggestions and vote on them</li>
        <li>Search for stuff</li>
        <li>... and a lot more</li>
      </ul>
      <Typography variant="body1" gutterBottom>
        Please note that the current data is outdated by ~6 months and the accuracy distorted through many
        tests.
      </Typography>
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
          <Trans t={t} i18nKey="totals.maps" values={{ maps }} />
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
        if (diff.id === 13) return null; //Skip "tier 3 (guard)"
        const count = stats[diff.id] || 0;
        const difference = differences ? differences[diff.id] : null;
        const isEmpty = count === 0;
        let width = 12;
        if (diff.id === 18 || diff.id === 19) {
          width = 6;
        } else if (diff.id === 14 || diff.id === 15 || diff.id === 16 || diff.id === 17) {
          width = 3;
        } else {
          const shares = getDifficultySubtierShares(diff.id, true);
          width = 12 / shares;
        }
        return (
          <Grid item key={diff.id} xs={12} md={width}>
            <DifficultyValueChip
              difficulty={diff}
              value={count + (difference ? ` (+${difference})` : "")}
              useSubtierColors
              useDarkening
              sx={{ width: 1, fontSize: "1em", opacity: isEmpty && hideEmpty ? 0.15 : 1 }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
