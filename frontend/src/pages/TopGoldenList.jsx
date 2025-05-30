import { Box, Button, Checkbox, FormControlLabel, Grid, IconButton, Stack, Typography } from "@mui/material";
import { TopGoldenList, sortChallengesForTGL } from "../components/TopGoldenList";
import { useParams } from "react-router-dom";
import {
  BasicBox,
  CustomIconButton,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
} from "../components/BasicComponents";
import { ChallengeFcIcon } from "../components/GoldberriesComponents";
import { useTranslation } from "react-i18next";
import { SubmissionFilter, getDefaultFilter } from "../components/SubmissionFilter";
import { useLocalStorage } from "@uidotdev/usehooks";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { getQueryData, useGetTopGoldenList } from "../hooks/useApi";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faFileExport } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";
import {
  getChallengeFcShort,
  getChallengeName,
  getChallengeSuffix,
  getDifficultyName,
  getMapName,
} from "../util/data_util";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useEffect } from "react";

export function PageTopGoldenList({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "top_golden_list" });
  const { type, id } = useParams();
  const theme = useTheme();

  const defaultFilter = getDefaultFilter(true);
  const [filter, setFilter] = useLocalStorage("top_golden_list_filter", defaultFilter);

  const exportModal = useModal();

  const title = t("title");

  return (
    <Box
      sx={{
        mx: {
          xs: 1,
          sm: 2,
        },
      }}
    >
      <HeadTitle title={title} />
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={12} sm="auto" display="flex" flexDirection="row" alignItems="center">
          <BasicBox sx={{ height: "fit-content" }}>
            <Typography variant="h4" gutterBottom>
              {title}
            </Typography>
            <Stack direction="row" gap={1}>
              <SubmissionFilter
                type={type}
                id={id}
                filter={filter}
                setFilter={setFilter}
                defaultFilter={defaultFilter}
              />
              <IconButton onClick={exportModal.open}>
                <FontAwesomeIcon
                  color={theme.palette.text.secondary}
                  icon={faFileExport}
                  fixedWidth
                  size="2xs"
                />
              </IconButton>
            </Stack>
          </BasicBox>
        </Grid>
        <Grid item xs={12} sm="auto">
          <BasicBox>
            <Stack direction="column" spacing={2}>
              <Stack direction="row" gap={1} alignItems="center">
                <ChallengeFcIcon challenge={{ requires_fc: true, has_fc: false }} height="1.5em" />
                <span>- {t("notes.fc")}</span>
              </Stack>
              <Stack direction="row" gap={1} alignItems="center">
                <ChallengeFcIcon challenge={{ requires_fc: false, has_fc: true }} height="1.5em" />
                <span>- {t("notes.c_fc")}</span>
              </Stack>
              <Stack direction="row" gap={1} alignItems="center">
                <span>[Old]</span>
                <span>- {t("notes.new_old")}</span>
              </Stack>
            </Stack>
          </BasicBox>
        </Grid>
      </Grid>
      <TopGoldenList type={type} id={id} filter={filter} isOverallList />

      <ExportTopGoldenListModal modalHook={exportModal} type={type} id={id} filter={filter} />
    </Box>
  );
}

export function ExportTopGoldenListModal({ modalHook, type, id, filter, isPersonal = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list.export" });
  const query = useGetTopGoldenList(type, id, filter);
  const topGoldenList = getQueryData(query);
  const { settings } = useAppSettings();
  const tpgSettings = settings.visual.topGoldenList;
  const [includeHeader, setIncludeHeader] = useLocalStorage("export_tgl_include_header", true);
  const [includeCount, setIncludeCount] = useLocalStorage("export_tgl_include_count", true);
  const [includeLink, setIncludeLink] = useLocalStorage("export_tgl_include_link", false);
  const [includeTimeTaken, setIncludeTimeTaken] = useLocalStorage("export_tgl_include_time_taken", false);

  const copyToClipboard = () => {
    let text = "";

    const { tiers, challenges, maps, campaigns } = topGoldenList;

    let hadContent = false;

    for (let index = 0; index < tiers.length; index++) {
      const difficulty = tiers[index];
      //Looping through subtiers
      const diff_id = difficulty.id;
      const filteredChallenges = challenges.filter((c) => c.difficulty_id === diff_id);

      if (filteredChallenges.length === 0) continue;

      sortChallengesForTGL(filteredChallenges, maps, campaigns);

      if (includeHeader) {
        if (index > 0 && hadContent) {
          text += "\n";
        }

        text += `${getDifficultyName(difficulty)}\n`;
        text += t("challenge_name");
        if (includeCount) {
          text += `\t${t("submission_count")}`;
        }
        if (includeLink) {
          text += `\t${t("first_clear_url")}`;
        }
        if (includeTimeTaken && isPersonal) {
          text += `\t${t("time_taken")}`;
        }
        text += "\n";
      }

      hadContent = true;

      for (const challenge of filteredChallenges) {
        const map = maps[challenge.map_id];
        const campaign = map ? campaigns[map.campaign_id] : campaigns[challenge.campaign_id];

        let nameSuffix = getChallengeSuffix(challenge) === null ? "" : `${getChallengeSuffix(challenge)}`;
        let name = getMapName(map, campaign);
        let combinedName = "";
        if (nameSuffix !== "") {
          combinedName = `${name} [${nameSuffix}]`;
        } else {
          combinedName = `${name}`;
        }

        if (challenge.requires_fc || challenge.has_fc) {
          combinedName += " " + getChallengeFcShort(challenge, true);
        }

        text += `${combinedName}`;
        if (includeCount) {
          text += `\t${challenge.data.submission_count}`;
        }
        if (includeLink) {
          text += `\t${challenge.submissions[0].proof_url}`;
        }
        if (includeTimeTaken && isPersonal) {
          text += `\t${challenge.submissions[0].time_taken ?? ""}`;
        }
        text += "\n";
      }
    }

    if (hadContent) {
      text += "\n";
    }

    //Remove last newline
    text = text.slice(0, -1);

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(t("feedback.copied"));
      })
      .catch(() => {
        toast.error(t("feedback.error"));
      });
  };

  return (
    <CustomModal modalHook={modalHook} actions={[ModalButtons.close]} options={{ title: t("header") }}>
      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}
      {query.isSuccess && (
        <>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("text")}
          </Typography>
          <Stack direction="column" gap={0} sx={{ mb: 2 }}>
            <FormControlLabel
              label={t("include_header")}
              checked={includeHeader}
              onChange={(e) => setIncludeHeader(e.target.checked)}
              control={<Checkbox />}
            />
            <FormControlLabel
              label={t("include_submission_count")}
              checked={includeCount}
              onChange={(e) => setIncludeCount(e.target.checked)}
              control={<Checkbox />}
            />
            <FormControlLabel
              label={t("include_first_clear_url")}
              checked={includeLink}
              onChange={(e) => setIncludeLink(e.target.checked)}
              control={<Checkbox />}
            />
            {isPersonal && (
              <FormControlLabel
                label={t("include_time_taken")}
                checked={includeTimeTaken}
                onChange={(e) => setIncludeTimeTaken(e.target.checked)}
                control={<Checkbox />}
              />
            )}
          </Stack>
          <Button
            variant="contained"
            fullWidth
            startIcon={<FontAwesomeIcon icon={faClipboard} />}
            onClick={copyToClipboard}
          >
            {t("button")}
          </Button>
        </>
      )}
    </CustomModal>
  );
}
