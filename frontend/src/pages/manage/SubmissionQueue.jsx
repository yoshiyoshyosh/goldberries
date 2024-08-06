import { useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../../components/BasicComponents";
import { FormSubmissionWrapper } from "../../components/forms/Submission";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Grid,
  Paper,
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
import { useEffect, useState } from "react";
import { getQueryData, useGetSubmissionQueue, usePostSubmission } from "../../hooks/useApi";
import { DifficultyChip } from "../../components/GoldberriesComponents";
import { useLocalStorage } from "@uidotdev/usehooks";
import { toast } from "react-toastify";
import { getChallengeCampaign, getChallengeSuffix, getMapName } from "../../util/data_util";
import { useTranslation } from "react-i18next";

export function PageSubmissionQueue() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.submission_queue" });
  const { submission } = useParams();
  const defaultSubmission = submission === undefined ? null : parseInt(submission);
  const [submissionId, setSubmissionId] = useState(defaultSubmission ?? null);
  const navigate = useNavigate();

  const updateSubmissionId = (id) => {
    setSubmissionId(id);
    if (id === null) {
      navigate("/manage/submission-queue", { replace: true });
    } else {
      navigate(`/manage/submission-queue/${id}`, { replace: true });
    }
  };

  const query = useGetSubmissionQueue();
  const queue = getQueryData(query);

  useEffect(() => {
    if (queue === null || queue === undefined) return;

    if (submissionId === null && queue.length > 0) {
      updateSubmissionId(queue[0].id);
    } else if (submissionId !== null) {
      if (queue.length === 0) {
        toast.info(t("feedback.viewing_gone"));
        updateSubmissionId(null);
      } else {
        const index = queue.findIndex((submission) => submission.id === submissionId);
        if (index === -1) {
          toast.info(t("feedback.viewing_gone"));
          goToNextSubmission({ id: submissionId });
        }
      }
    } else if (submissionId !== null) {
    }
  }, [submissionId, query]);

  if (query.isLoading) {
    return (
      <BasicContainerBox sx={{ mt: 0, p: 2 }}>
        <Typography variant="h4" sx={{ mt: 0 }}>
          {t("title")}
        </Typography>
        <LoadingSpinner />
      </BasicContainerBox>
    );
  } else if (query.isError) {
    return (
      <BasicContainerBox sx={{ mt: 0, p: 2 }}>
        <Typography variant="h4" sx={{ mt: 0 }}>
          {t("title")}
        </Typography>
        <ErrorDisplay error={query.error} />
      </BasicContainerBox>
    );
  }

  const goToNextSubmission = (currentSubmission) => {
    const currentIndex = queue.findIndex((submission) => submission.id === currentSubmission.id);
    if (currentIndex === -1) {
      updateSubmissionId(null);
      return;
    }
    let nextSubmission = queue[currentIndex + 1];
    if (nextSubmission === undefined) {
      nextSubmission = queue[currentIndex];
      if (nextSubmission === undefined) {
        updateSubmissionId(null);
        return;
      }
    }
    updateSubmissionId(nextSubmission.id);
  };

  const title = t("title_with_count", { count: queue.length });

  return (
    <>
      <HeadTitle title={title} />
      <BasicContainerBox sx={{ mt: 0, p: 2, position: "relative" }}>
        <Box
          sx={{
            position: { xs: "relative", xl: "absolute" },
            mt: 0,
            p: 1,
            pt: 1,
            top: 0,
            left: 0,
            transform: { xs: "none", xl: "translate(calc(-100% - 20px), 0)" },
          }}
        >
          <SubmissionQueueTable
            queue={queue}
            selectedSubmissionId={parseInt(submissionId)}
            setSubmissionId={updateSubmissionId}
          />
          <Divider sx={{ my: 2, display: { xs: "block", xl: "none" } }} />
        </Box>
        {submissionId !== null ? (
          <FormSubmissionWrapper id={submissionId} onSave={goToNextSubmission} />
        ) : (
          <Typography variant="body1">{t("queue_empty")}</Typography>
        )}
      </BasicContainerBox>
    </>
  );
}

function SubmissionQueueTable({ queue, selectedSubmissionId, setSubmissionId }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.submission_queue" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_a } = useTranslation();
  const [rowsPerPage, setRowsPerPage] = useLocalStorage("submission_queue_rows_per_page", 10);
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState("");
  const { mutateAsync: updateSubmission } = usePostSubmission();

  let defaultPage = 0;
  if (selectedSubmissionId !== null) {
    const index = queue.findIndex((submission) => submission.id === selectedSubmissionId);
    if (index !== -1) {
      defaultPage = Math.floor(index / rowsPerPage);
    }
  }
  const [page, setPage] = useState(defaultPage);

  const onSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = queue.map((submission) => submission.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const onSelectSubmission = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
  };

  const verifyAll = (verified) => {
    const submissions = queue.filter((submission) => selected.includes(submission.id));
    const promises = submissions.map((submission) => {
      const data = { ...submission, is_verified: verified };
      if (note !== undefined && note !== null && note !== "") {
        data.verifier_notes = note;
      }
      return updateSubmission(data);
    });
    Promise.all(promises)
      .then(() => {
        setSelected([]);
        toast.success(t(verified ? "feedback.all_verified" : "feedback.all_rejected"));
      })
      .catch(() => {
        //Do nothing, error is handled by usePostSubmission
      });
  };

  return (
    <TableContainer component={Paper} sx={{ width: { xs: "100%", xl: "400px" } }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ p: 0 }} width={1}>
              <Checkbox
                indeterminate={selected.length > 0 && selected.length < queue.length}
                onClick={onSelectAllClick}
              />
            </TableCell>
            <TableCell sx={{ pl: 1 }}>
              {selected.length > 0 ? (
                <Typography variant="h6">{t("selected", { count: selected.length })}</Typography>
              ) : (
                <Typography variant="h6">{t("total", { count: queue.length })}</Typography>
              )}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queue.length === 0 && (
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="body1">{t("queue_empty")}</Typography>
              </TableCell>
            </TableRow>
          )}
          {(rowsPerPage === -1
            ? queue
            : queue.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          ).map((submission) => (
            <SubmissionQueueTableRow
              key={submission.id}
              submission={submission}
              selectedSubmissionId={selectedSubmissionId}
              setSubmissionId={setSubmissionId}
              isSelected={selected.includes(submission.id)}
              onSelect={onSelectSubmission}
            />
          ))}
        </TableBody>
      </Table>
      <TablePagination
        labelRowsPerPage={t_g("table_rows_per_page")}
        rowsPerPageOptions={[5, 10, 25, 50, 100, { label: t_g("all"), value: -1 }]}
        component="div"
        count={queue.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        slotProps={{
          select: {
            MenuProps: {
              disableScrollLock: true,
            },
          },
        }}
      />
      {selected.length > 0 && (
        <Grid container spacing={1} sx={{ p: 1 }}>
          <Grid item xs={12} md={12}>
            <TextField
              label={t_a("forms.submission.verifier_notes")}
              fullWidth
              variant="outlined"
              placeholder={t("note_placeholder")}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Button variant="contained" fullWidth color="success" onClick={() => verifyAll(true)}>
              {t("buttons.verify", { count: selected.length })}
            </Button>
          </Grid>
          <Grid item xs={12} md={12}>
            <Divider>
              <Chip label={t("or")} size="small" />
            </Divider>
          </Grid>
          <Grid item xs={12} md={12}>
            <Button
              variant="contained"
              fullWidth
              color="error"
              onClick={() => verifyAll(false)}
              disabled={note === ""}
            >
              {t("buttons.reject", { count: selected.length })}
            </Button>
          </Grid>
        </Grid>
      )}
    </TableContainer>
  );
}

function SubmissionQueueTableRow({
  submission,
  selectedSubmissionId,
  setSubmissionId,
  isSelected,
  onSelect,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.submission_queue" });
  const challenge = submission.challenge;
  const map = challenge !== null ? challenge.map : null;
  const campaign = getChallengeCampaign(challenge);
  const textTop =
    submission.player.name +
    (challenge === null
      ? ""
      : " - " + (map === null ? getChallengeSuffix(challenge) : getMapName(map, campaign)));
  const textBottom =
    challenge === null ? t("new_challenge") + " " + submission.new_challenge.name : campaign.name;
  const diff = challenge === null ? submission.suggested_difficulty : challenge.difficulty;
  const isNewChallenge = challenge === null;
  return (
    <TableRow
      key={submission.id}
      selected={submission.id === selectedSubmissionId}
      sx={{ cursor: "pointer" }}
    >
      <TableCell sx={{ p: 0 }} width={1}>
        <Checkbox
          checked={isSelected}
          onClick={(event) => onSelect(event, submission.id)}
          disabled={isNewChallenge}
        />
      </TableCell>
      <TableCell
        onClick={() => {
          setSubmissionId(submission.id);
        }}
        sx={{ pl: 1 }}
      >
        <Stack direction="row">
          <Typography variant="body1" sx={{ flex: 1 }}>
            {textTop}
          </Typography>
          <Typography variant="body1">{submission.id}</Typography>
        </Stack>
        <Stack direction="row">
          <Typography variant="body2" sx={{ flex: 1 }}>
            {textBottom}
          </Typography>
          <DifficultyChip difficulty={diff} />
        </Stack>
      </TableCell>
    </TableRow>
  );
}
