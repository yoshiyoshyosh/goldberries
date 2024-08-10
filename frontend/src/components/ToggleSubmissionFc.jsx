import { toast } from "react-toastify";
import { usePostSubmission } from "../hooks/useApi";
import { Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";

export function ToggleSubmissionFcButton({ submission }) {
  const { mutate: updateSubmission } = usePostSubmission(() => {
    toast.success("Submission updated");
  });
  const handleToggleFcClicked = () => {
    updateSubmission({
      ...submission,
      is_fc: !submission.is_fc,
    });
  };

  return (
    <Button
      onClick={handleToggleFcClicked}
      variant="outlined"
      size="small"
      color={submission.is_fc ? "warning" : "success"}
      sx={{ whiteSpace: "nowrap", minWidth: "unset" }}
    >
      <FontAwesomeIcon icon={submission.is_fc ? faToggleOn : faToggleOff} />
    </Button>
  );
}
