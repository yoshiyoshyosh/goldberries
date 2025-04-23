import {
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
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
  Typography,
} from "@mui/material";
import { useDebouncedCallback } from "use-debounce";
import { useRef, useState } from "react";
import {
  getCampaignName,
  getChallengeCampaign,
  getChallengeInvertHierarchy,
  getChallengeName,
  getChallengeNameShort,
  getMapName,
} from "../../util/data_util";
import { fetchCampaignsPaginated } from "../../util/api";
import { useQuery } from "react-query";
import {
  CustomizedMenu,
  BasicContainerBox,
  ErrorDisplay,
  LoadingSpinner,
  HeadTitle,
} from "../../components/BasicComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsSplitUpAndLeft,
  faArrowsToDot,
  faEdit,
  faMarker,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { FormChallengeWrapper } from "../../components/forms/Challenge";
import { FormMapWrapper } from "../../components/forms/Map";
import {
  getQueryData,
  useChallengeMarkPersonal,
  useDeleteCampaign,
  useDeleteChallenge,
  useDeleteMap,
  useGetManageChallenges,
  useMergeChallenges,
  useSplitChallenge,
} from "../../hooks/useApi";
import { FormCampaignWrapper } from "../../components/forms/Campaign";
import { FormCampaignMassAddMaps } from "../../components/forms/CampaignMassAddMaps";
import { FormCreateFullChallengeWrapper } from "../../components/forms/CreateFullChallenge";
import { FullChallengeSelect } from "../../components/GoldberriesComponents";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";
import { useLocalStorage } from "@uidotdev/usehooks";

export function PageManageChallenges() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.challenges" });
  const [page, setPage] = useLocalStorage("manage_challenges_page", 1);
  const [perPage, setPerPage] = useLocalStorage("manage_challenges_perPage", 50);
  const [searchInternal, setSearchInternal] = useLocalStorage("manage_challenges_search", "");
  const [search, setSearch] = useState(searchInternal ?? "");

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const modalRefs = {
    campaign: {
      create: useRef(),
      edit: useRef(),
      delete: useRef(),

      massAddMaps: useRef(),
      massEditMaps: useRef(),
    },
    map: {
      create: useRef(),
      edit: useRef(),
      delete: useRef(),
    },
    challenge: {
      create: useRef(),
      edit: useRef(),
      delete: useRef(),

      merge: useRef(),
      markPersonal: useRef(),
    },
  };

  return (
    <BasicContainerBox maxWidth="lg" sx={{ mt: 0, p: 2 }}>
      <HeadTitle title={t("title")} />
      <Grid container spacing={2}>
        <Grid item xs={12} md>
          <Typography variant="h4" sx={{ mt: 0 }} gutterBottom>
            {t("title")}
          </Typography>
        </Grid>
        <Grid item xs={12} md="auto">
          <CreateAnyButton />
        </Grid>
      </Grid>
      <ManageChallengesSearchField search={search} setSearch={updateSearch} />
      <ManageChallengesTable
        page={page}
        perPage={perPage}
        search={search}
        setPage={setPage}
        setPerPage={setPerPage}
        modalRefs={modalRefs}
      />
    </BasicContainerBox>
  );
}

function ManageChallengesSearchField({ search, setSearch }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.challenges" });
  const [searchInternal, setSearchInternal] = useLocalStorage("manage_challenges_search", search);

  const setSearchDebounced = useDebouncedCallback(setSearch, 250);

  return (
    <TextField
      label={t("search")}
      value={searchInternal}
      onChange={(event) => {
        setSearchInternal(event.target.value);
        setSearchDebounced(event.target.value);
      }}
      sx={{ mb: 2, mt: { xs: 2, sm: 0 } }}
      fullWidth
    />
  );
}

function ManageChallengesTable({ page, perPage, search, setPage, setPerPage, modalRefs }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.challenges" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetManageChallenges(page, perPage, search);

  const openModal = (ref, data) => {
    ref.current.open(data);
  };

  if (query.isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">{t_g("campaign", { count: 1 })}</TableCell>
              <TableCell align="left">{t_g("map", { count: 1 })}</TableCell>
              <TableCell align="left">{t_g("challenge", { count: 1 })}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {t("num_sub")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: perPage }, (_, i) => i).map((index) => (
              <TableRow key={index + 987654}>
                <TableCell align="left" width="35%">
                  <Skeleton variant="text" height="23.5px" />
                </TableCell>
                <TableCell align="left" width="35%">
                  <Skeleton variant="text" height="23.5px" />
                </TableCell>
                <TableCell align="left" width="30%">
                  <Skeleton variant="text" height="23.5px" />
                </TableCell>
                <TableCell align="center" width={1}>
                  <Skeleton variant="text" height="23.5px" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={perPage}
          page={page - 1}
          onPageChange={(event, newPage) => {
            setPage(newPage + 1);
          }}
          disabled
          rowsPerPage={perPage}
          onRowsPerPageChange={(event) => {
            setPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
          labelRowsPerPage={t_g("table_rows_per_page")}
          rowsPerPageOptions={[10, 25, 50, 100]}
          slotProps={{
            select: {
              MenuProps: {
                disableScrollLock: true,
              },
            },
          }}
        />
      </TableContainer>
    );
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const { campaigns, max_page: maxPage, max_count: maxCount } = getQueryData(query);

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">{t_g("campaign", { count: 1 })}</TableCell>
              <TableCell align="left">{t_g("map", { count: 1 })}</TableCell>
              <TableCell align="left">{t_g("challenge", { count: 1 })}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {t("num_sub")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign, index) => {
              const map = campaign.maps[0];
              const challenge = map ? map.challenges[0] : campaign.challenges[0];

              //Get fixed structure for split/merge modals. They need the hierarchy challenge->map->campaign to be IN the challenge,
              //but the API doesnt return it like that, and just setting the foreign key objects creates a cyclical structure which
              //breaks the Autofill component
              let challengeForSplitMerge = challenge
                ? getChallengeInvertHierarchy(campaign, map, challenge)
                : null;

              //Both map and challenge can be undefined here
              const key = "" + campaign.id + (map ? map.id : "") + (challenge ? challenge.id : "");

              return (
                <TableRow key={key}>
                  <TableCell align="left" width="35%">
                    <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                      <Typography variant="body2">{getCampaignName(campaign, t_g)}</Typography>
                      <CustomizedMenu
                        button={
                          <IconButton size="small" color="primary" aria-label="edit">
                            <FontAwesomeIcon size="xs" icon={faEdit} />
                          </IconButton>
                        }
                      >
                        <MenuItem disableRipple onClick={() => openModal(modalRefs.campaign.edit, campaign)}>
                          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                          {t("buttons.campaign.edit")}
                        </MenuItem>
                        <MenuItem
                          disableRipple
                          onClick={() => openModal(modalRefs.campaign.massEditMaps, campaign)}
                        >
                          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                          {t("buttons.campaign.edit_maps")}
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem disableRipple disableGutters sx={{ py: 0 }}>
                          <Button
                            onClick={() => openModal(modalRefs.campaign.delete, campaign)}
                            color="error"
                            disableRipple
                            sx={{ px: "16px" }}
                          >
                            <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faTrash} />
                            {t("buttons.campaign.delete")}
                          </Button>
                        </MenuItem>
                      </CustomizedMenu>
                    </Stack>
                  </TableCell>
                  <TableCell align="left" width="35%">
                    {map && (
                      <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                        <Typography variant="body2">{getMapName(map, campaign)}</Typography>
                        <CustomizedMenu
                          button={
                            <IconButton
                              size="small"
                              color="primary"
                              aria-label="edit"
                              disabled={map === null}
                            >
                              <FontAwesomeIcon size="xs" icon={faEdit} />
                            </IconButton>
                          }
                        >
                          <MenuItem disableRipple onClick={() => openModal(modalRefs.map.edit, map)}>
                            <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                            {t("buttons.map.edit")}
                          </MenuItem>
                          <Divider sx={{ my: 0.5 }} />
                          <MenuItem disableRipple disableGutters sx={{ py: 0 }}>
                            <Button
                              onClick={() => openModal(modalRefs.map.delete, map)}
                              color="error"
                              disableRipple
                              sx={{ px: "16px" }}
                            >
                              <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faTrash} />
                              {t("buttons.map.delete")}
                            </Button>
                          </MenuItem>
                        </CustomizedMenu>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="left" width="30%">
                    {challenge && (
                      <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                        <Typography variant="body2">{getChallengeName(challenge)}</Typography>
                        <CustomizedMenu
                          button={
                            <IconButton size="small" color="primary" aria-label="edit">
                              <FontAwesomeIcon size="xs" icon={faEdit} />
                            </IconButton>
                          }
                        >
                          <MenuItem
                            disableRipple
                            onClick={() => openModal(modalRefs.challenge.edit, challenge)}
                          >
                            <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                            {t("buttons.challenge.edit")}
                          </MenuItem>
                          <MenuItem
                            disableRipple
                            onClick={() => openModal(modalRefs.challenge.merge, challengeForSplitMerge)}
                          >
                            <FontAwesomeIcon
                              style={{ marginRight: "5px" }}
                              icon={challenge.has_fc ? faArrowsSplitUpAndLeft : faArrowsToDot}
                            />
                            {t(challenge.has_fc ? "buttons.challenge.split" : "buttons.challenge.merge")}
                          </MenuItem>
                          <MenuItem
                            disableRipple
                            onClick={() =>
                              openModal(modalRefs.challenge.markPersonal, challengeForSplitMerge)
                            }
                          >
                            <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faMarker} />
                            {t("buttons.challenge.mark_personal")}
                          </MenuItem>
                          <Divider sx={{ my: 0.5 }} />
                          <MenuItem disableRipple disableGutters sx={{ py: 0 }}>
                            <Button
                              onClick={() => openModal(modalRefs.challenge.delete, challenge)}
                              color="error"
                              disableRipple
                              sx={{ px: "16px" }}
                            >
                              <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faTrash} />
                              {t("buttons.challenge.delete")}
                            </Button>
                          </MenuItem>
                        </CustomizedMenu>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="center" width={1}>
                    {challenge && <>{challenge.data.count_submissions}</>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={maxCount}
          page={page - 1}
          onPageChange={(event, newPage) => {
            setPage(newPage + 1);
          }}
          rowsPerPage={perPage}
          onRowsPerPageChange={(event) => {
            setPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
          labelRowsPerPage={t_g("table_rows_per_page")}
          rowsPerPageOptions={[10, 25, 50, 100, { value: -1, label: t_g("all") }]}
          slotProps={{
            select: {
              MenuProps: {
                disableScrollLock: true,
              },
            },
          }}
        />
      </TableContainer>
      <ManageModalContainer modalRefs={modalRefs} />
    </>
  );
}

function ManageModalContainer({ modalRefs }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.challenges.modals" });
  const { mutate: deleteCampaign } = useDeleteCampaign();
  const { mutate: deleteMap } = useDeleteMap();
  const { mutate: deleteChallenge } = useDeleteChallenge();

  const editCampaignModal = useModal();
  const deleteCampaignModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteCampaign(data.id);
  });

  const campaignMassEditMapsModal = useModal();

  const editMapModal = useModal();
  const deleteMapModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteMap(data.id);
  });

  const editChallengeModal = useModal();
  const deleteChallengeModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteChallenge(data.id);
  });
  const mergeChallengeModal = useModal();
  const markPersonalChallengeModal = useModal();

  // Setting the refs
  modalRefs.campaign.edit.current = editCampaignModal;
  modalRefs.campaign.delete.current = deleteCampaignModal;

  modalRefs.campaign.massEditMaps.current = campaignMassEditMapsModal;

  modalRefs.map.edit.current = editMapModal;
  modalRefs.map.delete.current = deleteMapModal;

  modalRefs.challenge.edit.current = editChallengeModal;
  modalRefs.challenge.delete.current = deleteChallengeModal;
  modalRefs.challenge.merge.current = mergeChallengeModal;
  modalRefs.challenge.markPersonal.current = markPersonalChallengeModal;

  return (
    <>
      <CustomModal modalHook={editCampaignModal} options={{ hideFooter: true }}>
        {editCampaignModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormCampaignWrapper id={editCampaignModal.data?.id} onSave={editCampaignModal.close} />
        )}
      </CustomModal>
      <CustomModal
        modalHook={deleteCampaignModal}
        options={{ title: t("delete_campaign.title") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">
          <Trans
            i18nKey="manage.challenges.modals.delete_campaign.description"
            values={{ name: deleteCampaignModal.data?.name ?? "" }}
          />
        </Typography>
      </CustomModal>

      <CustomModal maxWidth="lg" modalHook={campaignMassEditMapsModal} options={{ hideFooter: true }}>
        {campaignMassEditMapsModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormCampaignWrapper
            id={campaignMassEditMapsModal.data.id}
            isEditMaps
            onSave={campaignMassEditMapsModal.close}
          />
        )}
      </CustomModal>

      <CustomModal modalHook={editMapModal} options={{ hideFooter: true }}>
        {editMapModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormMapWrapper id={editMapModal.data.id} onSave={editMapModal.close} />
        )}
      </CustomModal>
      <CustomModal
        modalHook={deleteMapModal}
        options={{ title: t("delete_map.title") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">
          <Trans
            i18nKey="manage.challenges.modals.delete_map.description"
            values={{ name: deleteMapModal.data?.name ?? "" }}
          />
        </Typography>
      </CustomModal>

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        {editChallengeModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormChallengeWrapper id={editChallengeModal.data.id} onSave={editChallengeModal.close} />
        )}
      </CustomModal>
      <CustomModal
        modalHook={deleteChallengeModal}
        options={{ title: t("delete_challenge.title") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">
          <Trans
            i18nKey="manage.challenges.modals.delete_challenge.description"
            values={{
              name: deleteChallengeModal.data ? getChallengeName(deleteChallengeModal.data) : "",
              map: deleteChallengeModal.data?.map?.name,
            }}
          />
        </Typography>
      </CustomModal>

      <CustomModal modalHook={mergeChallengeModal} options={{ hideFooter: true }}>
        <MergeSplitChallengesForm
          defaultChallenge={mergeChallengeModal.data}
          onSuccess={mergeChallengeModal.close}
        />
      </CustomModal>

      <CustomModal
        modalHook={markPersonalChallengeModal}
        options={{ hideFooter: true, title: t("mark_personal.title") }}
      >
        <MarkPersonalChallengeForm
          challenge={markPersonalChallengeModal.data}
          onSuccess={markPersonalChallengeModal.close}
        />
      </CustomModal>
    </>
  );
}

export function CreateAnyButton({
  defaultCampaignName,
  defaultCampaignUrl,
  defaultMapName,
  defaultMapGoldenChanges,
  defaultMapCollectibles,
  defaultDifficultyId,
  onCreateChallenge,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.challenges.create_any_button" });
  const createCampaignModal = useModal();
  const campaignMassAddMapsModal = useModal();
  const createMapModal = useModal();
  const createChallengeModal = useModal();

  const createFullChallengeModal = useModal();

  const onCreatedChallenge = (data) => {
    createChallengeModal.close();
    if (onCreateChallenge) onCreateChallenge(data);
  };
  const onCreatedFullChallenge = (data) => {
    createFullChallengeModal.close();
    if (onCreateChallenge) onCreateChallenge(data);
  };

  return (
    <>
      <CustomizedMenu
        button={
          <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faEdit} />}>
            {t("create")}
          </Button>
        }
      >
        <MenuItem disableRipple onClick={createCampaignModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          {t("new_campaign")}
        </MenuItem>
        <MenuItem disableRipple onClick={createMapModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          {t("new_map")}
        </MenuItem>
        <MenuItem disableRipple onClick={createChallengeModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          {t("new_challenge")}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem disableRipple onClick={createFullChallengeModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          {t("create_full_challenge")}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem disableRipple onClick={campaignMassAddMapsModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          {t("mass_add_maps")}
        </MenuItem>
      </CustomizedMenu>

      <CustomModal modalHook={createCampaignModal} options={{ hideFooter: true }}>
        <FormCampaignWrapper
          id={null}
          onSave={createCampaignModal.close}
          defaultCampaignName={defaultCampaignName}
          defaultCampaignUrl={defaultCampaignUrl}
        />
      </CustomModal>

      <CustomModal modalHook={campaignMassAddMapsModal} options={{ hideFooter: true }}>
        <FormCampaignMassAddMaps onSave={campaignMassAddMapsModal.close} />
      </CustomModal>

      <CustomModal modalHook={createMapModal} options={{ hideFooter: true }}>
        <FormMapWrapper
          id={null}
          onSave={createMapModal.close}
          defaultMapName={defaultMapName}
          defaultMapGoldenChanges={defaultMapGoldenChanges}
          defaultMapCollectibles={defaultMapCollectibles}
        />
      </CustomModal>

      <CustomModal modalHook={createChallengeModal} options={{ hideFooter: true }}>
        <FormChallengeWrapper
          id={null}
          onSave={onCreatedChallenge}
          defaultDifficultyId={defaultDifficultyId}
        />
      </CustomModal>

      <CustomModal modalHook={createFullChallengeModal} options={{ hideFooter: true }}>
        <FormCreateFullChallengeWrapper
          onSuccess={onCreatedFullChallenge}
          defaultName={defaultMapName}
          defaultGoldenChanges={defaultMapGoldenChanges}
          defaultCollectibles={defaultMapCollectibles}
          defaultUrl={defaultCampaignUrl}
          defaultDifficultyId={defaultDifficultyId}
        />
      </CustomModal>
    </>
  );
}

export function MergeSplitChallengesForm({ defaultChallenge, onSuccess }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.challenges.modals.merge_split_challenges" });
  const { mutate: splitChallenge } = useSplitChallenge((data) => {
    toast.success(t("feedback.split"));
    onSuccess(data);
  });
  const { mutate: mergeChallenges } = useMergeChallenges((data) => {
    toast.success(t("feedback.merge"));
    onSuccess(data);
  });

  const [challengeOne, setChallengeOne] = useState(defaultChallenge ?? null);
  const [challengeTwo, setChallengeTwo] = useState(null);

  const isSplit = challengeOne !== null && challengeOne.has_fc;
  const cannotMerge =
    challengeOne !== null && challengeTwo !== null && challengeOne.requires_fc === challengeTwo.requires_fc;
  const submitDisabled =
    challengeOne === null || (!challengeOne.has_fc && challengeTwo === null) || cannotMerge;

  const onSubmit = () => {
    if (challengeOne === null) return;

    if (isSplit) {
      splitChallenge(challengeOne);
    } else {
      mergeChallenges({
        id_a: challengeOne.id,
        id_b: challengeTwo.id,
      });
    }
  };

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h6">{t("title")}</Typography>
      <Divider sx={{}}>
        <Chip label={t("challenge_num", { num: 1 })} size="small" />
      </Divider>
      <FullChallengeSelect challenge={challengeOne} setChallenge={setChallengeOne} />

      {challengeOne !== null &&
        (isSplit ? (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1">{t("split_note")}</Typography>
          </>
        ) : (
          <>
            <Divider sx={{ mt: 1 }}>
              <Chip label={t("challenge_num", { num: 2 })} size="small" />
            </Divider>
            <FullChallengeSelect challenge={challengeTwo} setChallenge={setChallengeTwo} />
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1">{t("merge_note")}</Typography>
          </>
        ))}
      {cannotMerge && (
        <Typography variant="body1" color="error">
          {t("unable_to_merge")}
        </Typography>
      )}
      <Divider sx={{ my: 1 }} />
      <Button variant="contained" color="primary" disabled={submitDisabled} onClick={onSubmit}>
        {t(challengeOne === null ? "buttons.neither" : isSplit ? "buttons.split" : "buttons.merge")}
      </Button>
    </Stack>
  );
}

export function MarkPersonalChallengeForm({ challenge, onSuccess }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.challenges.modals.mark_personal" });
  const { mutate: markSubmissions } = useChallengeMarkPersonal((data) => {
    toast.success(t("feedback"));
    onSuccess(data);
  });

  const onSubmit = () => {
    markSubmissions(challenge);
  };

  return (
    <>
      <Typography variant="body1">
        <Trans
          i18nKey="manage.challenges.modals.mark_personal.description"
          values={{ name: getMapName(challenge.map) + " - " + getChallengeNameShort(challenge) }}
        />
      </Typography>
      <Typography variant="body1">
        <Trans
          i18nKey="manage.challenges.modals.mark_personal.impacted"
          values={{ count: challenge.data.count_submissions }}
        />
      </Typography>
      <Button variant="contained" fullWidth color="primary" onClick={onSubmit} sx={{ mt: 2 }}>
        {t("button")}
      </Button>
    </>
  );
}
