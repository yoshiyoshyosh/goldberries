import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../../components/BasicComponents";
import { FormSubmissionWrapper } from "../../components/forms/Submission";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import { fetchSubmissionQueue } from "../../util/api";
import { useState } from "react";
import { getQueryData, useGetSubmissionQueue } from "../../hooks/useApi";
import { DifficultyChip } from "../../components/GoldberriesComponents";
import { useLocalStorage } from "@uidotdev/usehooks";

export function PageSubmissionQueue() {
  const { submission } = useParams();
  const [submissionId, setSubmissionId] = useState(submission ?? undefined);
  const navigate = useNavigate();

  const updateSubmissionId = (id) => {
    setSubmissionId(id);
    if (id === undefined) {
      navigate("/manage/submission-queue", { replace: true });
    } else {
      navigate(`/manage/submission-queue/${id}`, { replace: true });
    }
  };

  const query = useGetSubmissionQueue();

  if (query.isLoading) {
    return (
      <BasicContainerBox sx={{ mt: 0, p: 2 }}>
        <Typography variant="h4" sx={{ mt: 0 }}>
          Submission Queue
        </Typography>
        <LoadingSpinner />
      </BasicContainerBox>
    );
  } else if (query.isError) {
    return (
      <BasicContainerBox sx={{ mt: 0, p: 2 }}>
        <Typography variant="h4" sx={{ mt: 0 }}>
          Submission Queue
        </Typography>
        <ErrorDisplay error={query.error} />
      </BasicContainerBox>
    );
  }

  const queue = getQueryData(query);
  console.log("queue", queue);

  if (submissionId === undefined) {
    if (queue.length === 0) {
      return (
        <BasicContainerBox sx={{ mt: 0, p: 2 }}>
          <Typography variant="h4" sx={{ mt: 0 }}>
            Submission Queue
          </Typography>
          <Typography variant="body1">No submissions in queue</Typography>
        </BasicContainerBox>
      );
    }

    updateSubmissionId(parseInt(queue[0].id));
    return (
      <BasicContainerBox sx={{ mt: 0, p: 2 }}>
        <Typography variant="h4" sx={{ mt: 0 }}>
          Submission Queue
        </Typography>
        <LoadingSpinner />
      </BasicContainerBox>
    );
  }

  const goToNextSubmission = (currentSubmission) => {
    console.log("goToNextSubmission", currentSubmission, "queue", queue);
    const currentIndex = queue.findIndex((submission) => submission.id === currentSubmission.id);
    if (currentIndex === -1) {
      updateSubmissionId(undefined);
      return;
    }
    let nextSubmission = queue[currentIndex + 1];
    if (nextSubmission === undefined) {
      nextSubmission = queue[currentIndex];
      if (nextSubmission === undefined) {
        updateSubmissionId(undefined);
        return;
      }
    }
    updateSubmissionId(nextSubmission.id);
  };

  return (
    <>
      <BasicContainerBox sx={{ mt: 0, p: 2, position: "relative" }}>
        <Box
          sx={{
            position: { xs: "relative", lg: "absolute" },
            mt: 0,
            p: 1,
            pt: 1,
            top: 0,
            left: 0,
            transform: { xs: "none", lg: "translate(calc(-100% - 20px), 0)" },
          }}
        >
          <SubmissionQueueTable
            queue={queue}
            selectedSubmissionId={parseInt(submissionId)}
            setSubmissionId={updateSubmissionId}
          />
          <Divider sx={{ my: 2, display: { xs: "block", lg: "none" } }} />
        </Box>
        {submissionId !== null ? (
          <FormSubmissionWrapper id={submissionId} onSave={goToNextSubmission} />
        ) : (
          <Typography variant="body1">No submissions in queue</Typography>
        )}
      </BasicContainerBox>
    </>
  );
}

function SubmissionQueueTable({ queue, selectedSubmissionId, setSubmissionId }) {
  const [rowsPerPage, setRowsPerPage] = useLocalStorage("submission_queue_rows_per_page", 10);

  let defaultPage = 0;
  if (selectedSubmissionId !== null) {
    const index = queue.findIndex((submission) => submission.id === selectedSubmissionId);
    if (index !== -1) {
      defaultPage = Math.floor(index / rowsPerPage);
    }
  }
  const [page, setPage] = useState(defaultPage);

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h5">Submissions ({queue.length} total)</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queue.length === 0 && (
            <TableRow>
              <TableCell>
                <Typography variant="body1">No submissions in queue</Typography>
              </TableCell>
            </TableRow>
          )}
          {(rowsPerPage === -1
            ? queue
            : queue.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          ).map((submission) => (
            <TableRow
              key={submission.id}
              selected={submission.id === selectedSubmissionId}
              onClick={() => {
                setSubmissionId(submission.id);
              }}
              sx={{ cursor: "pointer" }}
            >
              <TableCell>
                {submission.challenge !== null ? (
                  <>
                    <Stack direction="row">
                      <Typography variant="body1" sx={{ flex: 1 }}>
                        {submission.player.name} - {submission.challenge.map.name}
                      </Typography>
                      <Typography variant="body1">{submission.id}</Typography>
                    </Stack>
                    <Stack direction="row">
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {submission.challenge.map.campaign.name}
                      </Typography>
                      <DifficultyChip difficulty={submission.challenge.difficulty} />{" "}
                    </Stack>
                  </>
                ) : (
                  <>
                    <Stack direction="row">
                      <Typography variant="body1" sx={{ flex: 1 }}>
                        {submission.player.name}
                      </Typography>
                      <Typography variant="body1">{submission.id}</Typography>
                    </Stack>
                    <Stack direction="row">
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        New Challenge: {submission.new_challenge.name}
                      </Typography>
                      <DifficultyChip difficulty={submission.suggested_difficulty} />{" "}
                    </Stack>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100, { label: "All", value: -1 }]}
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
    </TableContainer>
  );
}
