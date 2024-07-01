import {
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Stack,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { ChallengeDetailsList, ChallengeSubmissionTable } from "./Challenge";
import {
  faBook,
  faEdit,
  faExternalLink,
  faFlagCheckered,
  faLandmark,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getCampaignName,
  getChallengeFcLong,
  getChallengeFcShort,
  getChallengeName,
  getGamebananaEmbedUrl,
  getMapAuthor,
  getMapLobbyInfo,
} from "../util/data_util";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledExternalLink,
} from "../components/BasicComponents";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { ChallengeFcIcon, DifficultyChip, GamebananaEmbed } from "../components/GoldberriesComponents";
import { CustomModal, useModal } from "../hooks/useModal";
import { FormMapWrapper } from "../components/forms/Map";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData, useGetMap } from "../hooks/useApi";
import { Changelog } from "../components/Changelog";
import { useTranslation } from "react-i18next";

export function PageMap() {
  const { id } = useParams();

  return (
    <BasicContainerBox maxWidth="md">
      <MapDisplay id={parseInt(id)} />
    </BasicContainerBox>
  );
}

export function MapDisplay({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map" });
  const auth = useAuth();
  const query = useGetMap(id);

  const editMapModal = useModal();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const map = getQueryData(query);
  const campaign = map.campaign;
  const title = map.name + " - " + getCampaignName(map.campaign);

  return (
    <>
      <HeadTitle title={title} />
      <GoldberriesBreadcrumbs campaign={map.campaign} map={map} />
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 1.5 }}>
        <GamebananaEmbed campaign={campaign} size="large" />
      </Stack>
      {auth.hasVerifierPriv && (
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
      {map.challenges.map((challenge) => {
        return (
          <>
            <Divider sx={{ my: 2 }}>
              <Link to={"/challenge/" + challenge.id}>
                <Chip label={getChallengeName(challenge, false)} size="small" />
              </Link>
            </Divider>
            <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1 }}>
              <ChallengeFcIcon challenge={challenge} showClear height="1.3em" />
              <span>{getChallengeFcShort(challenge)}</span>
              <DifficultyChip difficulty={challenge.difficulty} />
            </Stack>
            <ChallengeSubmissionTable key={challenge.id} challenge={challenge} />
          </>
        );
      })}

      <Divider sx={{ my: 2 }} />
      <Changelog type="map" id={id} />

      <CustomModal modalHook={editMapModal} options={{ hideFooter: true }}>
        <FormMapWrapper id={id} onSave={editMapModal.close} />
      </CustomModal>
    </>
  );
}
