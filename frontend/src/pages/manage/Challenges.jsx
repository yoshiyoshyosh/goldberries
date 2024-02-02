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
import { get } from "react-hook-form";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { FormChallengeWrapper } from "../../components/forms/Challenge";
import { FormMapWrapper } from "../../components/forms/Map";

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
            <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faPlus} />}>
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
                    <IconButton size="small" color="primary" aria-label="edit">
                      <FontAwesomeIcon size="xs" icon={faEdit} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell align="left" width="35%">
                  <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                    <Typography variant="body2">{challenge.map.name}</Typography>
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label="edit"
                      onClick={() => openModal(modalRefs.map.edit, challenge.map)}
                    >
                      <FontAwesomeIcon size="xs" icon={faEdit} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell align="left" width="30%">
                  <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                    <Typography variant="body2">{getChallengeName(challenge)}</Typography>
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label="edit"
                      onClick={() => openModal(modalRefs.challenge.edit, challenge)}
                    >
                      <FontAwesomeIcon size="xs" icon={faEdit} />
                    </IconButton>
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
  const createMapModal = useModal();
  const editMapModal = useModal();

  const createChallengeModal = useModal();
  const editChallengeModal = useModal();

  // Setting the refs
  modalRefs.map.create.current = createMapModal;
  modalRefs.map.edit.current = editMapModal;

  modalRefs.challenge.create.current = createChallengeModal;
  modalRefs.challenge.edit.current = editChallengeModal;

  return (
    <>
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
    </>
  );
}
