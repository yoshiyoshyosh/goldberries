import { useTheme } from "@emotion/react";
import { getQueryData, useGetRecentSubmissions } from "../hooks/useApi";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  CampaignIcon,
  DifficultyChip,
  ObjectiveIcon,
  PlayerChip,
  SubmissionFcIcon,
  VerificationStatusChip,
  VerifierNotesIcon,
} from "./GoldberriesComponents";
import { ErrorDisplay, StyledLink } from "./BasicComponents";
import { getChallengeCampaign, getChallengeSuffix, getMapName } from "../util/data_util";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function RecentSubmissions({ playerId = null }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.recent_submissions" });
  const [verified, setVerified] = useLocalStorage("recent_submissions_verified", 1);
  const verifiedValue = verified === 0 ? null : verified === -1 ? false : true;

  const onChangeVerified = (value) => {
    setVerified(value);
  };

  return (
    <>
      <Grid container>
        <Grid item xs={12} sm>
          <Typography variant="h5">{t("title")}</Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pb: 1 }}>
            <Typography variant="body1">{t("show")}</Typography>
            <TextField
              select
              variant="standard"
              value={verified}
              onChange={(e) => onChangeVerified(e.target.value)}
              SelectProps={{
                MenuProps: {
                  disableScrollLock: true,
                },
              }}
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                border: (t) => "1px solid " + t.palette.box.border,
                borderRadius: "5px",
              }}
            >
              <MenuItem value={1}>
                <VerificationStatusChip isVerified={true} size="small" sx={{ mx: 1 }} />
              </MenuItem>
              <MenuItem value={0}>
                <VerificationStatusChip isVerified={null} size="small" sx={{ mx: 1 }} />
              </MenuItem>
              <MenuItem value={-1}>
                <VerificationStatusChip isVerified={false} size="small" sx={{ mx: 1 }} />
              </MenuItem>
            </TextField>
          </Stack>
        </Grid>
      </Grid>
      <RecentSubmissionsHeadless verified={verifiedValue} playerId={playerId} />
    </>
  );
}

export function RecentSubmissionsHeadless({
  verified,
  playerId,
  showChip = false,
  hideIfEmpty = false,
  chipSx = {},
}) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage(
    "recent_submissions_per_page_" + (playerId === null ? "general" : "player"),
    10
  );
  const query = useGetRecentSubmissions(verified, page, perPage, null, playerId);

  useEffect(() => {
    setPage(1);
  }, [verified, playerId]);

  const data = getQueryData(query) ?? {
    submissions: null,
    page: 1,
    max_count: perPage,
  };

  if (hideIfEmpty && data.submissions !== null && data.submissions.length === 0) {
    return null;
  }

  return (
    <>
      {showChip && (
        <VerificationStatusChip
          isVerified={verified}
          sx={{ mb: 1, ...chipSx }}
          i18keySuffix="submissions_suffix"
          size="small"
        />
      )}
      {/* {query.isLoading && <LoadingSpinner />} */}
      {query.isError && <ErrorDisplay error={query.error} />}
      {(query.isLoading || query.isSuccess) && (
        <RecentSubmissionsTable
          verified={verified}
          data={data}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          hasPlayer={playerId !== null}
        />
      )}
    </>
  );
}
export function RecentSubmissionsTable({
  verified,
  data,
  page,
  perPage,
  setPage,
  setPerPage,
  hasPlayer = false,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.recent_submissions" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const noFoundStr = verified === null ? t("no_pending") : verified ? t("no_verified") : t("no_rejected");
  const hasMoreThanOnePage = data.max_count > perPage;
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        {data.submissions !== null && data.submissions.length !== 0 && (
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 1.5, pr: 0.5 }}>{t_g("submission", { count: 1 })}</TableCell>
              {!hasPlayer && (
                <TableCell align="center" sx={{ pr: 0.5, pl: 1 }}>
                  {t_g("player", { count: 1 })}
                </TableCell>
              )}
              <TableCell align="center" sx={{ pr: 1, pl: 1 }}>
                {t_g("difficulty", { count: 1 })}
              </TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {data.submissions === null ? (
            Array.from({ length: perPage }).map((_, index) => (
              <RecentSubmissionsTableRowFakeout key={index} hasPlayer={hasPlayer} />
            ))
          ) : data.submissions.length === 0 ? (
            <>
              <TableRow>
                <TableCell colSpan={hasPlayer ? 4 : 3} align="center">
                  <Typography variant="body1">{noFoundStr}</Typography>
                </TableCell>
              </TableRow>
            </>
          ) : (
            data.submissions.map((submission) => (
              <RecentSubmissionsTableRow key={submission.id} submission={submission} hasPlayer={hasPlayer} />
            ))
          )}
        </TableBody>
      </Table>
      {data.submissions !== null && data.submissions.length !== 0 && (hasMoreThanOnePage || perPage > 15) && (
        <TablePagination
          component="div"
          count={data.max_count ?? -1}
          page={page - 1}
          rowsPerPage={perPage}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          rowsPerPageOptions={[10, 15, 25, 50, 100]}
          labelRowsPerPage={t("submissions_per_page")}
          onRowsPerPageChange={(event) => {
            setPerPage(event.target.value);
            setPage(1);
          }}
          slotProps={{
            select: {
              MenuProps: {
                disableScrollLock: true,
              },
            },
          }}
        />
      )}
    </TableContainer>
  );
}
function RecentSubmissionsTableRowFakeout({ hasPlayer }) {
  return (
    <TableRow>
      <TableCell sx={{ width: "99%", pl: 1.5, pr: 0.5 }}>
        <Skeleton variant="text" width={25 + Math.random() * 75 + "%"} />
      </TableCell>
      {!hasPlayer && (
        <TableCell sx={{ pl: 1, pr: 0.5 }}>
          <Skeleton variant="text" width={90} height={24} />
        </TableCell>
      )}
      <TableCell sx={{ pl: 0.5, pr: 1 }}>
        <Skeleton variant="text" width={70} height={24} />
      </TableCell>
    </TableRow>
  );
}
function RecentSubmissionsTableRow({ submission, hasPlayer }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.recent_submissions" });
  const theme = useTheme();
  const challenge = submission.challenge;
  const new_challenge = submission.new_challenge;
  const map = challenge?.map;
  const campaign = getChallengeCampaign(challenge);
  const mapName = map ? getMapName(map, campaign, false) : null;
  const campaignNameSame = campaign?.name === mapName;

  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));

  const isAnnoyingCampaignName =
    isMdScreen && challenge && campaign.name.length > 20 && !campaign.name.includes(" ");
  const isAnnoyingMapName =
    isMdScreen && challenge && mapName && mapName.length > 20 && !mapName.includes(" ");

  return (
    <TableRow
      key={submission.id}
      sx={{
        "&:hover": { backgroundColor: theme.palette.background.lightShade, cursor: "pointer" },
        transition: "0.1s background",
      }}
    >
      <TableCell sx={{ width: "99%", p: 0 }}>
        <Link
          to={"/submission/" + submission.id}
          style={{ display: "block", textDecoration: "none", color: "inherit", padding: "5px 4px 5px 12px" }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {challenge ? (
              <>
                <CampaignIcon campaign={campaign} />
                {!campaignNameSame && (
                  <>
                    <StyledLink
                      to={"/campaign/" + campaign.id}
                      style={{ wordBreak: isAnnoyingCampaignName ? "break-all" : "unset" }}
                    >
                      {campaign.name}
                    </StyledLink>
                    {map && <Typography>-</Typography>}
                  </>
                )}
                {map && (
                  <StyledLink
                    to={"/map/" + map.id}
                    style={{ wordBreak: isAnnoyingMapName ? "break-all" : "unset" }}
                  >
                    {mapName}
                  </StyledLink>
                )}
                {getChallengeSuffix(challenge) !== null && (
                  <Typography variant="body2" color={theme.palette.text.secondary}>
                    [{getChallengeSuffix(challenge)}]
                  </Typography>
                )}
                <ObjectiveIcon objective={challenge.objective} challenge={challenge} height="1.3em" />
              </>
            ) : (
              <Typography variant="body2" color={theme.palette.text.secondary}>
                <Tooltip title={new_challenge.description ?? t("new_challenge_note")}>
                  {t("new_challenge")} {new_challenge.name}
                </Tooltip>
              </Typography>
            )}
            <SubmissionFcIcon submission={submission} height="1.3em" />
            {submission.verifier_notes && (
              <VerifierNotesIcon notes={submission.verifier_notes} fontSize="1.0em" />
            )}
          </Stack>
        </Link>
      </TableCell>
      {!hasPlayer && (
        <TableCell align="center" sx={{ pl: 1, pr: 0.5, py: 0 }}>
          <PlayerChip player={submission.player} size="small" trimLongNames />
        </TableCell>
      )}
      <TableCell align="center" sx={{ p: 0 }}>
        <Link
          to={"/submission/" + submission.id}
          style={{ display: "block", textDecoration: "none", color: "inherit", padding: "4px 8px 4px 8px" }}
        >
          <DifficultyChip difficulty={challenge ? challenge.difficulty : submission.suggested_difficulty} />
        </Link>
      </TableCell>
    </TableRow>
  );
}
