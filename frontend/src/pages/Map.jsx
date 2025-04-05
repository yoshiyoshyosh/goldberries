import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ChallengeDetailsList, ChallengeSubmissionTable, NoteDisclaimer } from "./Challenge";
import {
  faArrowRightToBracket,
  faEdit,
  faExclamationTriangle,
  faInfoCircle,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCampaignName, getChallengeFcShort, getChallengeNameShort, getMapName } from "../util/data_util";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
  TooltipLineBreaks,
} from "../components/BasicComponents";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import {
  ChallengeFcIcon,
  DifficultyChip,
  GamebananaEmbed,
  ObjectiveIcon,
  VerificationStatusChip,
} from "../components/GoldberriesComponents";
import { CustomModal, useModal } from "../hooks/useModal";
import { FormMapWrapper } from "../components/forms/Map";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData, useGetMap } from "../hooks/useApi";
import { Changelog } from "../components/Changelog";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../components/Stats";
import { useTheme } from "@emotion/react";

export function PageMap() {
  const { id, challengeId } = useParams();

  return (
    <BasicContainerBox maxWidth="md">
      <MapDisplay id={parseInt(id)} challengeId={parseInt(challengeId)} />
    </BasicContainerBox>
  );
}

export function MapDisplay({ id, challengeId, isModal = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map" });
  const { t: t_c } = useTranslation(undefined, { keyPrefix: "challenge" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const query = useGetMap(id);
  const [selectedChallengeId, setSelectedChallengeId] = useState(challengeId ?? null);

  const updateSelectedChallenge = (challengeId) => {
    setSelectedChallengeId(challengeId);
    if (!isModal) {
      navigate("/map/" + id + "/" + challengeId, { replace: true });
    }
  };

  const editMapModal = useModal();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const map = getQueryData(query);
  const firstChallenge = map.challenges[0];
  const selectedChallenge = map.challenges.find((c) => c.id === selectedChallengeId) ?? firstChallenge;
  const campaign = map.campaign;
  const title = getMapName(map, campaign) + " - " + getCampaignName(map.campaign, t_g);

  return (
    <>
      <HeadTitle title={title} />
      <GoldberriesBreadcrumbs campaign={map.campaign} map={map} />
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 1.5 }}>
        <GamebananaEmbed campaign={campaign} size="large" />
      </Stack>
      {auth.hasHelperPriv && (
        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <Button
            onClick={editMapModal.open}
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faEdit} />}
            sx={{ mb: 1 }}
          >
            {t("buttons.edit")}
          </Button>
        </Stack>
      )}
      <ChallengeDetailsList map={map} />
      {map.note && <NoteDisclaimer note={map.note} title={"Map Note"} sx={{ mt: 1 }} />}
      <Divider sx={{ my: 2 }}>
        <Chip label="Challenges" size="small" />
      </Divider>
      {selectedChallenge === null || selectedChallenge === undefined ? (
        <Typography variant="body1">{t("no_challenges")}</Typography>
      ) : (
        <>
          <Box sx={{ mt: 1, p: 1, background: "rgba(0,0,0,0.2)", borderRadius: 1 }}>
            <MapChallengeTabs
              selected={selectedChallenge.id}
              setSelected={updateSelectedChallenge}
              map={map}
            />
          </Box>
          {selectedChallenge.description && !selectedChallenge.is_rejected && (
            <NoteDisclaimer
              note={selectedChallenge.description}
              title={t_c("description")}
              sx={{ mt: 1, mb: 1 }}
            />
          )}
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" sx={{ m: 1 }}>
            <ObjectiveIcon
              objective={selectedChallenge.objective}
              challenge={selectedChallenge}
              height="1.3em"
            />
            <ChallengeFcIcon challenge={selectedChallenge} showClear height="1.3em" />
            <span>{getChallengeFcShort(selectedChallenge)}</span>
            <DifficultyChip difficulty={selectedChallenge.difficulty} />
            {selectedChallenge.reject_note && (
              <>
                {selectedChallenge.is_rejected && <VerificationStatusChip isVerified={false} size="small" />}
                <TooltipLineBreaks title={selectedChallenge.reject_note}>
                  <FontAwesomeIcon
                    color={selectedChallenge.is_rejected ? theme.palette.error.main : undefined}
                    icon={faExclamationTriangle}
                  />
                </TooltipLineBreaks>
              </>
            )}
            {!selectedChallenge.is_rejected && (
              <StyledLink
                to={"/submit/single-challenge/" + selectedChallenge.id}
                style={{ marginLeft: "auto", display: isMdScreen ? "block" : "none" }}
              >
                <Button variant="outlined" startIcon={<FontAwesomeIcon icon={faPlus} />}>
                  {t("buttons.submit")}
                </Button>
              </StyledLink>
            )}
            <StyledLink
              to={"/challenge/" + selectedChallenge.id}
              style={{ marginLeft: isMdScreen && !selectedChallenge.is_rejected ? "0" : "auto" }}
            >
              <Button variant="text" startIcon={<FontAwesomeIcon icon={faArrowRightToBracket} />}>
                {t("buttons.view_challenge")}
              </Button>
            </StyledLink>
          </Stack>
          <ChallengeSubmissionTable key={selectedChallenge.id} challenge={selectedChallenge} />
          <Divider sx={{ my: 2 }}>
            <Chip label={t_c("difficulty_suggestions")} size="small" />
          </Divider>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SuggestedDifficultyChart challenge={selectedChallenge} />
          </div>
          <SuggestedDifficultyTierCounts
            challenge={selectedChallenge}
            sx={{
              mt: 2,
            }}
            hideIfEmpty
          />
          <Changelog type="challenge" id={selectedChallenge.id} sx={{ mt: 2 }} />
        </>
      )}

      <Divider sx={{ my: 2 }} />
      <Changelog type="map" id={id} />

      <CustomModal modalHook={editMapModal} options={{ hideFooter: true }}>
        <FormMapWrapper id={id} onSave={editMapModal.close} />
      </CustomModal>
    </>
  );
}

//controlled property: selected challenge ID
function MapChallengeTabs({ selected, setSelected, map }) {
  //If too many challenges, instead render as select dropdown
  if (map.challenges.length > 5) {
    return (
      <Select
        value={selected}
        fullWidth
        onChange={(e) => setSelected(e.target.value)}
        MenuProps={{ disableScrollLock: true }}
      >
        {map.challenges.map((challenge) => (
          <MenuItem key={challenge.id} value={challenge.id}>
            {getChallengeNameShort(challenge, true)}
          </MenuItem>
        ))}
      </Select>
    );
  }
  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {map.challenges.map((challenge) => (
        <Button
          key={challenge.id}
          onClick={() => setSelected(challenge.id)}
          variant={selected === challenge.id ? "contained" : "outlined"}
          sx={{ whiteSpace: "nowrap", textDecoration: challenge.is_rejected ? "line-through" : undefined }}
        >
          {getChallengeNameShort(challenge, true, true, false)}
        </Button>
      ))}
    </Stack>
  );
}
