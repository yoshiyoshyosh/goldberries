import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../../components/BasicComponents";
import { FormSubmissionWrapper } from "../../components/forms/Submission";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import { fetchSubmissionQueue } from "../../util/api";
import { useState } from "react";

export function PageSubmissionQueue() {
  const [submissionId, setSubmissionId] = useState(undefined);
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["submission_queue"],
    queryFn: () => fetchSubmissionQueue(),
  });

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

  if (submissionId === undefined) {
    if (query.data.data.length === 0) {
      return (
        <BasicContainerBox sx={{ mt: 0, p: 2 }}>
          <Typography variant="h4" sx={{ mt: 0 }}>
            Submission Queue
          </Typography>
          <Typography variant="body1">No submissions in queue</Typography>
        </BasicContainerBox>
      );
    }

    setSubmissionId(query.data.data[0].id);
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
    console.log("goToNextSubmission", currentSubmission);
    const currentIndex = query.data.data.findIndex((submission) => submission.id === currentSubmission.id);
    if (currentIndex === -1) {
      return;
    }
    const nextSubmission = query.data.data[currentIndex + 1];
    if (nextSubmission === undefined) {
      return;
    }
    setSubmissionId(nextSubmission.id);
  };

  return (
    <>
      <BasicContainerBox sx={{ mt: 0, p: 2, position: "relative" }}>
        <FormSubmissionWrapper id={submissionId} onSave={goToNextSubmission} />
        <BasicContainerBox
          sx={{
            position: "absolute",
            mt: 0,
            p: 1,
            top: 0,
            left: 0,
            transform: "translate(calc(-100% - 20px), 0)",
            display: {
              xs: "none",
              lg: "block",
            },
          }}
        >
          <List dense>
            <ListSubheader disableSticky>
              <Typography variant="h5">Submissions</Typography>
            </ListSubheader>
            {query.data.data.length === 0 && (
              <ListItem>
                <ListItemText primary="No submissions in queue" />
              </ListItem>
            )}
            {query.data.data.map((submission) => (
              <ListItemButton
                key={submission.id}
                disablePadding
                selected={submission.id === parseInt(submissionId)}
                onClick={() => {
                  // window.scrollTo(0, 0);
                  setSubmissionId(submission.id);
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      {submission.id} - {submission.challenge.map.name} - {submission.player.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2">
                      {submission.challenge.map.campaign.name} - {submission.challenge.difficulty.name}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </BasicContainerBox>
      </BasicContainerBox>
    </>
  );
}
