import {
  Button,
  ButtonGroup,
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
import { getCampaignName, getChallengeName } from "../../util/data_util";
import { fetchChallenges } from "../../util/api";
import { useQuery } from "react-query";
import CustomizedMenu, {
  BasicContainerBox,
  ErrorDisplay,
  LoadingSpinner,
} from "../../components/BasicComponents";
import { useLocalStorage } from "../../hooks/useStorage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { FormChallengeWrapper } from "../../components/forms/Challenge";
import { FormMapWrapper } from "../../components/forms/Map";
import { useDeleteCampaign, useDeleteChallenge, useDeleteMap } from "../../hooks/useApi";
import { FormCampaignWrapper } from "../../components/forms/Campaign";

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
    },
  };

  const openModal = (ref, data) => {
    ref.current.open(data);
  };

  return (
    <BasicContainerBox maxWidth="lg" sx={{ mt: 0, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md>
          <Typography variant="h4" sx={{ mt: 0 }} gutterBottom>
            Manage Challenges
          </Typography>
        </Grid>
        <Grid item xs={12} md="auto">
          <ButtonGroup sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => openModal(modalRefs.campaign.create, null)}
            >
              New Campaign
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => openModal(modalRefs.map.create, null)}
            >
              New Map
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => openModal(modalRefs.challenge.create, null)}
            >
              New Challenge
            </Button>
          </ButtonGroup>
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
      sx={{ mb: 2 }}
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
            {challenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell align="left" width="35%">
                  <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                    <Typography variant="body2">{getCampaignName(challenge.map.campaign)}</Typography>
                    <CustomizedMenu
                      button={
                        <IconButton size="small" color="primary" aria-label="edit">
                          <FontAwesomeIcon size="xs" icon={faEdit} />
                        </IconButton>
                      }
                    >
                      <MenuItem
                        disableRipple
                        onClick={() => openModal(modalRefs.campaign.edit, challenge.map.campaign)}
                      >
                        <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                        Edit
                      </MenuItem>
                      <Divider sx={{ my: 0.5 }} />
                      <MenuItem disableRipple disableGutters sx={{ py: 0 }}>
                        <Button
                          onClick={() => openModal(modalRefs.campaign.delete, challenge.map.campaign)}
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
                  <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                    <Typography variant="body2">{challenge.map.name}</Typography>
                    <CustomizedMenu
                      button={
                        <IconButton size="small" color="primary" aria-label="edit">
                          <FontAwesomeIcon size="xs" icon={faEdit} />
                        </IconButton>
                      }
                    >
                      <MenuItem disableRipple onClick={() => openModal(modalRefs.map.edit, challenge.map)}>
                        <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                        Edit
                      </MenuItem>
                      <Divider sx={{ my: 0.5 }} />
                      <MenuItem disableRipple disableGutters sx={{ py: 0 }}>
                        <Button
                          onClick={() => openModal(modalRefs.map.delete, challenge.map)}
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
                      <MenuItem disableRipple onClick={() => openModal(modalRefs.challenge.edit, challenge)}>
                        <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                        Edit
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
            ))}
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

  const createCampaignModal = useModal();
  const editCampaignModal = useModal();
  const deleteCampaignModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteCampaign(data.id);
  });

  const createMapModal = useModal();
  const editMapModal = useModal();
  const deleteMapModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteMap(data.id);
  });

  const createChallengeModal = useModal();
  const editChallengeModal = useModal();
  const deleteChallengeModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteChallenge(data.id);
  });

  // Setting the refs
  modalRefs.campaign.create.current = createCampaignModal;
  modalRefs.campaign.edit.current = editCampaignModal;
  modalRefs.campaign.delete.current = deleteCampaignModal;

  modalRefs.map.create.current = createMapModal;
  modalRefs.map.edit.current = editMapModal;
  modalRefs.map.delete.current = deleteMapModal;

  modalRefs.challenge.create.current = createChallengeModal;
  modalRefs.challenge.edit.current = editChallengeModal;
  modalRefs.challenge.delete.current = deleteChallengeModal;

  return (
    <>
      <CustomModal modalHook={createCampaignModal} options={{ hideFooter: true }}>
        <FormCampaignWrapper id={null} onSave={createCampaignModal.close} />
      </CustomModal>
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

      <CustomModal modalHook={createMapModal} options={{ hideFooter: true }}>
        <FormMapWrapper id={null} onSave={createMapModal.close} />
      </CustomModal>
      <CustomModal modalHook={editMapModal} options={{ hideFooter: true }}>
        {editMapModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormMapWrapper id={editMapModal.data?.id} onSave={editMapModal.close} />
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

      <CustomModal modalHook={createChallengeModal} options={{ hideFooter: true }}>
        <FormChallengeWrapper id={null} onSave={createChallengeModal.close} />
      </CustomModal>
      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        {editChallengeModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormChallengeWrapper id={editChallengeModal.data?.id} onSave={editChallengeModal.close} />
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
    </>
  );
}
