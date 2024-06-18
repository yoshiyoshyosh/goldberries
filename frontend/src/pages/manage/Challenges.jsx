import {
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
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
  getChallengeName,
  getChallengeNameShort,
  getMapName,
} from "../../util/data_util";
import { fetchChallenges } from "../../util/api";
import { useQuery } from "react-query";
import {
  CustomizedMenu,
  BasicContainerBox,
  ErrorDisplay,
  LoadingSpinner,
  HeadTitle,
} from "../../components/BasicComponents";
import { useLocalStorage } from "../../hooks/useStorage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsSplitUpAndLeft,
  faArrowsToDot,
  faCodeMerge,
  faEdit,
  faJoint,
  faMarker,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { FormChallengeWrapper } from "../../components/forms/Challenge";
import { FormMapWrapper } from "../../components/forms/Map";
import {
  useChallengeMarkPersonal,
  useDeleteCampaign,
  useDeleteChallenge,
  useDeleteMap,
  useMergeChallenges,
  useSplitChallenge,
} from "../../hooks/useApi";
import { FormCampaignWrapper } from "../../components/forms/Campaign";
import { FormCampaignMassAddMaps } from "../../components/forms/CampaignMassAddMaps";
import { FormCreateFullChallengeWrapper } from "../../components/forms/CreateFullChallenge";
import { FullChallengeSelect } from "../../components/GoldberriesComponents";
import { toast } from "react-toastify";

export function PageManageChallenges() {
  const [page, setPage] = useLocalStorage("manage_challenges_page", 1);
  const [perPage, setPerPage] = useLocalStorage("manage_challenges_perPage", 50);
  const [searchInternal, setSearchInternal] = useLocalStorage("manage_challenges_search", "");
  const [search, setSearch] = useState(searchInternal ?? "");

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
      <HeadTitle title="Manage Challenges" />
      <Grid container spacing={2}>
        <Grid item xs={12} md>
          <Typography variant="h4" sx={{ mt: 0 }} gutterBottom>
            Manage Challenges
          </Typography>
        </Grid>
        <Grid item xs={12} md="auto">
          <CreateAnyButton />
        </Grid>
      </Grid>
      <ManageChallengesSearchField search={search} setSearch={setSearch} />
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
  const [searchInternal, setSearchInternal] = useLocalStorage("manage_challenges_search", search);

  const setSearchDebounced = useDebouncedCallback(setSearch, 250);

  return (
    <TextField
      label="Search"
      value={searchInternal}
      onChange={(event) => {
        setSearchInternal(event.target.value);
        setSearchDebounced(event.target.value);
      }}
      sx={{ mb: 2, mt: { xs: 2, sm: 0 } }}
      fullWidth
      onFocus={(e) => {
        setSearchInternal("");
        setSearchDebounced("");
      }}
    />
  );
}

function ManageChallengesTable({ page, perPage, search, setPage, setPerPage, modalRefs }) {
  const query = useQuery({
    queryKey: ["manage_challenges", page, perPage, search],
    queryFn: () => fetchChallenges(page, perPage, search),
  });

  const openModal = (ref, data) => {
    ref.current.open(data);
  };

  if (query.isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Campaign</TableCell>
              <TableCell align="left">Map</TableCell>
              <TableCell align="left">Challenge</TableCell>
              <TableCell align="center"># Sub.</TableCell>
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
          rowsPerPageOptions={[10, 25, 50, 100, { value: -1, label: "All" }]}
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

  const { challenges, max_page: maxPage, max_count: maxCount } = query.data.data;

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Campaign</TableCell>
              <TableCell align="left">Map</TableCell>
              <TableCell align="left">Challenge</TableCell>
              <TableCell align="center"># Sub.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {challenges.map((challenge) => {
              const map = challenge.map;
              const campaign = getChallengeCampaign(challenge);

              return (
                <TableRow key={challenge.id}>
                  <TableCell align="left" width="35%">
                    <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                      <Typography variant="body2">{getCampaignName(campaign)}</Typography>
                      <CustomizedMenu
                        button={
                          <IconButton size="small" color="primary" aria-label="edit">
                            <FontAwesomeIcon size="xs" icon={faEdit} />
                          </IconButton>
                        }
                      >
                        <MenuItem disableRipple onClick={() => openModal(modalRefs.campaign.edit, campaign)}>
                          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          disableRipple
                          onClick={() => openModal(modalRefs.campaign.massEditMaps, campaign)}
                        >
                          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                          Edit Maps
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
                            Delete
                          </Button>
                        </MenuItem>
                      </CustomizedMenu>
                    </Stack>
                  </TableCell>
                  <TableCell align="left" width="35%">
                    {map && (
                      <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                        <Typography variant="body2">{challenge.map.name}</Typography>
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
                            Edit
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
                              Delete
                            </Button>
                          </MenuItem>
                        </CustomizedMenu>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="left" width="30%">
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
                          Edit
                        </MenuItem>
                        <MenuItem
                          disableRipple
                          onClick={() => openModal(modalRefs.challenge.merge, challenge)}
                        >
                          <FontAwesomeIcon
                            style={{ marginRight: "5px" }}
                            icon={challenge.has_fc ? faArrowsSplitUpAndLeft : faArrowsToDot}
                          />
                          {challenge.has_fc ? "Split Challenge" : "Merge Challenges"}
                        </MenuItem>
                        <MenuItem
                          disableRipple
                          onClick={() => openModal(modalRefs.challenge.markPersonal, challenge)}
                        >
                          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faMarker} />
                          Mark Suggestions
                          <br />
                          as Personal
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
                            Delete
                          </Button>
                        </MenuItem>
                      </CustomizedMenu>
                    </Stack>
                  </TableCell>
                  <TableCell align="center" width={1}>
                    {challenge.data.count_submissions}
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
          rowsPerPageOptions={[10, 25, 50, 100, { value: -1, label: "All" }]}
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
        options={{ title: "Delete Campaign?" }}
        actions={[ModalButtons.Cancel, ModalButtons.Delete]}
      >
        <Typography variant="body1">
          Are you sure you want to delete the campaign <b>'{deleteCampaignModal.data?.name ?? ""}'</b> and{" "}
          <b>all of the attached maps, challenges and submissions</b> ?
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
        options={{ title: "Delete Map?" }}
        actions={[ModalButtons.Cancel, ModalButtons.Delete]}
      >
        <Typography variant="body1">
          Are you sure you want to delete the map <b>'{deleteMapModal.data?.name ?? ""}'</b> and{" "}
          <b>all of the attached challenges and submissions</b> ?
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
        options={{ title: "Delete Challenge?" }}
        actions={[ModalButtons.Cancel, ModalButtons.Delete]}
      >
        <Typography variant="body1">
          Are you sure you want to delete the challenge{" "}
          <b>'{deleteChallengeModal.data ? getChallengeName(deleteChallengeModal.data) : ""}'</b> for the map{" "}
          <b>'{deleteChallengeModal.data?.map?.name}'</b> and <b>all of the attached submissions</b> ?
        </Typography>
      </CustomModal>

      <CustomModal modalHook={mergeChallengeModal} options={{ hideFooter: true }}>
        <MergeJoinChallengesForm
          defaultChallenge={mergeChallengeModal.data}
          onSuccess={mergeChallengeModal.close}
        />
      </CustomModal>

      <CustomModal
        modalHook={markPersonalChallengeModal}
        options={{ hideFooter: true, title: "Mark As Personal" }}
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
  defaultDifficultyId,
  onCreateChallenge,
}) {
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
            Create
          </Button>
        }
      >
        <MenuItem disableRipple onClick={createCampaignModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          New Campaign
        </MenuItem>
        <MenuItem disableRipple onClick={createMapModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          New Map
        </MenuItem>
        <MenuItem disableRipple onClick={createChallengeModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          New Challenge
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem disableRipple onClick={createFullChallengeModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          Create Full Challenge
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem disableRipple onClick={campaignMassAddMapsModal.open}>
          <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faPlus} />
          Mass Add Maps to Campaign
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
        <FormMapWrapper id={null} onSave={createMapModal.close} defaultMapName={defaultMapName} />
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
          defaultUrl={defaultCampaignUrl}
          defaultDifficultyId={defaultDifficultyId}
        />
      </CustomModal>
    </>
  );
}

export function MergeJoinChallengesForm({ defaultChallenge, onSuccess }) {
  const { mutate: splitChallenge } = useSplitChallenge((data) => {
    toast.success("Split challenge!");
    onSuccess(data);
  });
  const { mutate: mergeChallenges } = useMergeChallenges((data) => {
    toast.success("Merged challenges!");
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
      <Typography variant="h6">Split/Merge Challenges</Typography>
      <Divider sx={{}}>
        <Chip label="Challenge 1" size="small" />
      </Divider>
      <FullChallengeSelect challenge={challengeOne} setChallenge={setChallengeOne} />

      {challengeOne !== null &&
        (isSplit ? (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1">
              This challenge will be split from a single C/FC challenge into 2 separate challenges. All FC
              submissions will be automatically moved to the FC challenge.
            </Typography>
          </>
        ) : (
          <>
            <Divider sx={{ mt: 1 }}>
              <Chip label="Challenge 2" size="small" />
            </Divider>
            <FullChallengeSelect challenge={challengeTwo} setChallenge={setChallengeTwo} />
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1">
              The submissions of the 2nd challenge will be merged into the first challenge. The first
              challenge will be modified accordingly, and the 2nd challenge deleted after all submissions have
              been moved.
            </Typography>
          </>
        ))}
      {cannotMerge && (
        <Typography variant="body1" color="error">
          These challenges cannot be merged. You can only merge a regular clear challenge with an FC
          challenge.
        </Typography>
      )}
      <Divider sx={{ my: 1 }} />
      <Button variant="contained" color="primary" disabled={submitDisabled} onClick={onSubmit}>
        {challengeOne === null ? "Split / Merge" : isSplit ? "Split Challenge" : "Merge Challenges"}
      </Button>
    </Stack>
  );
}

export function MarkPersonalChallengeForm({ challenge, onSuccess }) {
  const { mutate: markSubmissions } = useChallengeMarkPersonal((data) => {
    toast.success("Marked all submissions as personal!");
    onSuccess(data);
  });

  const onSubmit = () => {
    markSubmissions(challenge);
  };

  console.log("Challenge to mark: ", challenge);

  return (
    <>
      <Typography variant="body1">
        Mark all difficulty suggestions for{" "}
        <b>
          {getMapName(challenge.map)} - {getChallengeNameShort(challenge)}
        </b>{" "}
        as personal?
      </Typography>
      <Typography variant="body1">
        At most <b>{challenge.data.count_submissions}</b> submissions will be impacted.
      </Typography>
      <Button variant="contained" fullWidth color="primary" onClick={onSubmit} sx={{ mt: 2 }}>
        Mark as Personal
      </Button>
    </>
  );
}
