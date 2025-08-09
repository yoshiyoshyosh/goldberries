import { useNavigate, useParams } from "react-router-dom";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  TooltipLineBreaks,
} from "../../components/BasicComponents";
import { FormSubmissionWrapper, shouldMarkSubmissionDateAchieved } from "../../components/forms/Submission";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Grid,
  IconButton,
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
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  getQueryData,
  useDeleteVerificationNotice,
  useGetSubmissionQueue,
  useMassVerifySubmissions,
  usePostSubmission,
  usePostVerificationNotice,
} from "../../hooks/useApi";
import { DifficultyChip, SubmissionFcIcon } from "../../components/GoldberriesComponents";
import { useLocalStorage } from "@uidotdev/usehooks";
import { toast } from "react-toastify";
import {
  getCampaignName,
  getChallengeCampaign,
  getChallengeSuffix,
  getDifficultyName,
  getMapName,
} from "../../util/data_util";
import { useTranslation } from "react-i18next";
import { GridArrowDownwardIcon, GridArrowUpwardIcon } from "@mui/x-data-grid";
import { useTheme } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/AuthProvider";
import { jsonDateToJsDate } from "../../util/util";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";

export function PageSubmissionQueue() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.submission_queue" });
  const { submission } = useParams();
  const theme = useTheme();
  const isXlScreen = useMediaQuery(theme.breakpoints.up("xl"));
  const isXxlScreen = useMediaQuery(theme.breakpoints.up("xxl"));
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
  const data = getQueryData(query);

  useEffect(() => {
    if (data === null || data === undefined) return;
    const queue = data.queue;

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

  useEffect(() => {
    if (query.isRefetchError) {
      toast.error("Error while refetching submission queue");
    }
  }, [query.isRefetchError]);

  if (query.isLoading) {
    return (
      <BasicContainerBox sx={{ mt: 0, p: 2 }}>
        <Typography variant="h4" sx={{ mt: 0 }}>
          {t("title")}
        </Typography>
        <LoadingSpinner />
      </BasicContainerBox>
    );
  } else if (query.isError && data === null) {
    return (
      <BasicContainerBox sx={{ mt: 0, p: 2 }}>
        <Typography variant="h4" sx={{ mt: 0 }}>
          {t("title")}
        </Typography>
        <ErrorDisplay error={query.error} />
      </BasicContainerBox>
    );
  }

  const { queue, notices } = data;

  const goToNextSubmission = (currentSubmission) => {
    if (currentSubmission.is_verified === null) return;
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
  const isSmallView = isXlScreen && !isXxlScreen;
  const isBigView = isXxlScreen;

  return (
    <>
      <HeadTitle title={title} />
      <BasicContainerBox
        maxWidth={isSmallView ? "sm" : isBigView ? "md" : undefined}
        sx={{ mt: 0, p: 2, position: "relative" }}
      >
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
            notices={notices}
            selectedSubmissionId={parseInt(submissionId)}
            setSubmissionId={updateSubmissionId}
          />
          <Divider sx={{ my: 2, display: { xs: "block", lg: "none" } }} />
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

function SubmissionQueueTable({ queue, notices, selectedSubmissionId, setSubmissionId }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.submission_queue" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_a } = useTranslation();
  const theme = useTheme();
  const [rowsPerPage, setRowsPerPage] = useLocalStorage("submission_queue_rows_per_page", 10);
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState("");
  const [switchSort, setSwitchSort] = useState(false);
  const [filterText, setFilterText] = useLocalStorage("submission_queue_filter_text", "");
  const { mutateAsync: massVerifySubmissions } = useMassVerifySubmissions();
  const auth = useAuth();

  let defaultPage = 0;
  if (selectedSubmissionId !== null) {
    const index = queue.findIndex((submission) => submission.id === selectedSubmissionId);
    if (index !== -1) {
      defaultPage = Math.floor(index / rowsPerPage);
    }
  }
  const [page, setPage] = useState(defaultPage);

  const filterSubmission = (submission) => {
    //The filter text can include tokens like the following:
    //Normal Search Text -"exluding this text"
    //Make a regex that matches these tokens, put them in an array, and then remove them from the filter text
    let { search, excludeTokens } = parseSearchString(filterText);

    let text = submission.player.name;
    let difficulty = null;
    if (submission.challenge !== null) {
      const challenge = submission.challenge;
      difficulty = challenge.difficulty;
      const campaign = getChallengeCampaign(challenge);
      if (challenge.map !== null) {
        text += " " + getMapName(challenge.map, campaign);
      }
      text += " " + getCampaignName(campaign, t_g, true);
    } else {
      difficulty = submission.suggested_difficulty;
      text += "New Challenge: " + submission.new_challenge.name;
    }
    if (difficulty) {
      text += " " + getDifficultyName(difficulty);
    }

    //Find if the submission is locked by another verifier (present in the notices)
    const notice = notices.find((notice) => notice.submission_id === submission.id);
    if (notice && notice.verifier.id !== auth.user.player_id) {
      text += " Locked";
    }

    const containsText = text.toLowerCase().includes(search.toLowerCase());
    const doesntContainExcluded = excludeTokens.every(
      (token) => !text.toLowerCase().includes(token.toLowerCase())
    );
    return containsText && doesntContainExcluded;
  };

  const queueFlipped = switchSort ? queue.slice().reverse() : queue;
  const queueFiltered = filterText === "" ? queueFlipped : queueFlipped.filter(filterSubmission);

  const onSelectAllClick = (event) => {
    if (event.target.checked) {
      //Filter all new challenges
      const validSelects = queueFiltered.filter((submission) => submission.challenge !== null);
      const newSelecteds = validSelects.map((submission) => submission.id);
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

    const data = {
      ids: submissions.map((submission) => submission.id),
      is_verified: verified,
    };
    if (note !== undefined && note !== null && note !== "") {
      data.verifier_notes = note;
    }

    massVerifySubmissions(data)
      .then(() => {
        setSelected([]);
        setNote("");
        toast.success(t(verified ? "feedback.all_verified" : "feedback.all_rejected"));
      })
      .catch((error) => {
        //Do nothing, handled by api hook
        setNote("");
      });
  };

  const changedFilterText = (text) => {
    setFilterText(text);
    setPage(0);
  };

  return (
    <TableContainer component={Paper} sx={{ width: { xs: "100%", xl: "430px" } }}>
      <TablePagination
        labelRowsPerPage={t_g("table_rows_per_page")}
        rowsPerPageOptions={[5, 10, 25, 50, 100, { label: t_g("all"), value: -1 }]}
        component="div"
        count={queueFiltered.length}
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
        sx={{ borderBottom: `1px solid ${theme.palette.tableRowBorder}` }}
      />
      <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.tableRowBorder}` }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("filter_placeholder")}
          value={filterText}
          onChange={(event) => changedFilterText(event.target.value)}
          size="small"
        />
      </Box>
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
                <Typography variant="h6">{t("total", { count: queueFiltered.length })}</Typography>
              )}
            </TableCell>
            <TableCell sx={{ pl: 0, pr: 1 }} width={1}>
              <IconButton size="small" onClick={() => setSwitchSort(!switchSort)}>
                {switchSort ? <GridArrowDownwardIcon /> : <GridArrowUpwardIcon />}
              </IconButton>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queue.length === 0 && (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="body1">{t("queue_empty")}</Typography>
              </TableCell>
            </TableRow>
          )}
          {(rowsPerPage === -1
            ? queueFiltered
            : queueFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          ).map((submission) => {
            const notice = notices.find((notice) => notice.submission_id === submission.id);
            return (
              <SubmissionQueueTableRow
                key={submission.id}
                submission={submission}
                notice={notice}
                selectedSubmissionId={selectedSubmissionId}
                setSubmissionId={setSubmissionId}
                isSelected={selected.includes(submission.id)}
                onSelect={onSelectSubmission}
              />
            );
          })}
        </TableBody>
      </Table>
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
  notice,
  selectedSubmissionId,
  setSubmissionId,
  isSelected,
  onSelect,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.submission_queue" });
  const auth = useAuth();
  const { mutateAsync: postNotice } = usePostVerificationNotice();
  const { mutateAsync: deleteNotice } = useDeleteVerificationNotice();
  const noticeMessageModal = useModal(
    "",
    (cancelled, message) => {
      if (cancelled) return;
      message = message.trim();
      if (message === "") message = null;
      postNotice({ submission_id: submission.id, message: message });
    },
    { actions: [ModalButtons.cancel, ModalButtons.submit] }
  );

  const onClickNotice = (event) => {
    if (notice) {
      if (auth.user.player_id !== notice.verifier.id) {
        toast.error(t("feedback.already_locked"));
        return;
      }
      deleteNotice(notice.id);
    } else {
      if (event.ctrlKey) {
        noticeMessageModal.open();
      } else {
        postNotice({ submission_id: submission.id });
      }
    }
  };

  const challenge = submission.challenge;
  const map = challenge !== null ? challenge.map : null;
  const campaign = getChallengeCampaign(challenge);
  const playerName =
    submission.player.name.length > 17 ? submission.player.name.slice(0, 17) + "..." : submission.player.name;
  const textTop =
    playerName +
    (challenge === null
      ? ""
      : " - " + (map === null ? getChallengeSuffix(challenge) : getMapName(map, campaign)));
  const textBottom =
    challenge === null ? t("new_challenge") + " " + submission.new_challenge.name : campaign.name;
  const diff = challenge === null ? submission.suggested_difficulty : challenge.difficulty;
  const isNewChallenge = challenge === null;
  const markDateAchieved = shouldMarkSubmissionDateAchieved(submission);

  let noticeTooltipText = null;
  let noticeButtonColor = "primary";
  if (notice) {
    if (notice.verifier.id === auth.user.player_id) {
      noticeButtonColor = notice.message ? "secondary" : "primary";
    } else {
      noticeButtonColor = notice.message ? "warning" : "success";
    }
    noticeTooltipText = notice.verifier.name;
    if (notice.message) {
      noticeTooltipText += ": " + notice.message;
    }
  }

  const noticeButton = (
    <Button
      variant={notice ? "contained" : "outlined"}
      color={noticeButtonColor}
      size="small"
      sx={{ minWidth: "unset" }}
      onClick={onClickNotice}
    >
      {notice ? <FontAwesomeIcon icon={faLock} /> : <FontAwesomeIcon icon={faLockOpen} />}
    </Button>
  );

  return (
    <>
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
          colSpan={1}
        >
          <Stack direction="row">
            <Stack direction="row" sx={{ flex: 1 }} gap={0.25} alignItems="center">
              <Typography variant="body1">{textTop}</Typography>
              {markDateAchieved && (
                <Tooltip
                  title={
                    "Date Achieved set to more than 4 weeks ago: " +
                    jsonDateToJsDate(submission.date_achieved).toLocaleString(navigator.language)
                  }
                  placement="top"
                  arrow
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="16" height="16">
                    <circle cx="50" cy="50" r="40" fill="yellow" />
                  </svg>
                </Tooltip>
              )}
            </Stack>
            <Typography variant="body1">{submission.id}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center">
            <Stack direction="row" gap={1} alignItems="center" sx={{ flex: 1 }}>
              <Typography variant="body2">{textBottom}</Typography>
              <SubmissionFcIcon submission={submission} />
            </Stack>
            <DifficultyChip difficulty={diff} />
          </Stack>
        </TableCell>
        <TableCell sx={{ pl: 0, pr: 0 }} width={1}>
          {notice ? (
            <TooltipLineBreaks title={noticeTooltipText}>{noticeButton}</TooltipLineBreaks>
          ) : (
            noticeButton
          )}
        </TableCell>
      </TableRow>
      <CustomModal modalHook={noticeMessageModal} maxWidth="sm" options={{ title: "Attach Message" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("notice_message_modal.placeholder")}
          value={noticeMessageModal.data}
          onChange={(event) => noticeMessageModal.setData(event.target.value)}
          multiline
          rows={4}
        />
      </CustomModal>
    </>
  );
}

function parseSearchString(searchString) {
  // Regular expression to match exclusion terms
  const excludeRegex = /-"([^"]+)"/g;

  // Array to hold exclusion terms
  let excludeTokens = [];
  let match;

  // Find all matches and add them to the excludeTokens array
  while ((match = excludeRegex.exec(searchString)) !== null) {
    excludeTokens.push(match[1]);
  }

  // Remove the exclusion terms from the original search string to get the search part
  let search = searchString.replace(excludeRegex, "").trim();

  return {
    search: search,
    excludeTokens: excludeTokens,
  };
}
