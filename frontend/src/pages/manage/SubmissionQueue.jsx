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

export function PageSubmissionQueue() {
  const { submissionId } = useParams();
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
    return (
      <BasicContainerBox sx={{ mt: 0, p: 2 }}>
        <Typography variant="h4" sx={{ mt: 0 }}>
          Submission Queue
        </Typography>
        {query.data.data.length === 0 ? (
          <Typography variant="h5">No submissions in queue</Typography>
        ) : (
          <Navigate to={`/manage/submission-queue/${query.data.data[0].id}`} replace={true} />
        )}
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
    navigate(`/manage/submission-queue/${nextSubmission.id}`, { replace: true });
  };

  return (
    <>
      <BasicContainerBox sx={{ mt: 0, p: 2 }}>
        <FormSubmissionWrapper id={submissionId} onSave={goToNextSubmission} />
      </BasicContainerBox>
      <BasicContainerBox
        sx={{
          position: "absolute",
          p: 1,
          top: 0,
          right: "10px",
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
                window.scrollTo(0, 0);
                navigate(`/manage/submission-queue/${submission.id}`, { replace: true });
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
    </>
  );
}
