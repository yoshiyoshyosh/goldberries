import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { BasicContainerBox, CustomIconButton, HeadTitle } from "../../components/BasicComponents";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { MuiFileInput } from "mui-file-input";
import { usePostUploadFile } from "../../hooks/useApi";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/AuthProvider";

export function PageFileUpload() {
  const { t } = useTranslation(undefined, { keyPrefix: "file_upload" });
  const auth = useAuth();
  const [destination, setDestination] = useState("post");
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const { mutate: uploadFile } = usePostUploadFile((data) => {
    setApiResponse(data);
  });
  const handleUpload = () => {
    setApiResponse(null);
    if (file) {
      uploadFile({ file, destination, file_name: fileName });
    }
  };

  useEffect(() => {
    if (file) {
      setFileName(file.name.split(".").slice(0, -1).join("."));
    }
  }, [file]);

  const isImageFile = file && file.type.startsWith("image/");
  const fileExtension = file ? file.name.split(".").pop() : "";
  const title = t("title");

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={title} />
      <Typography variant="h4">{title}</Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={12}>
          <Select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            MenuProps={{ disableScrollLock: true }}
            fullWidth
          >
            <MenuItem value="post">{t("destination.post")}</MenuItem>
            <MenuItem value="icon" disabled={!auth.hasHelperPriv}>
              {t("destination.icon")}
            </MenuItem>
            <MenuItem value="campaign_icon" disabled={!auth.hasHelperPriv}>
              {t("destination.campaign_icon")}
            </MenuItem>
            <MenuItem value="badge" disabled={!auth.hasHelperPriv}>
              {t("destination.badge")}
            </MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm="auto" display="flex" alignItems="center">
          <Typography variant="body1">{t("file_input_description")}</Typography>
        </Grid>
        <Grid item xs={12} sm>
          <MuiFileInput fullWidth plsaceholder={t("file_input")} value={file} onChange={setFile} />
        </Grid>
        <Box sx={{ width: "100%" }} />
        <Grid item xs>
          <TextField
            fullWidth
            label={t("file_name")}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </Grid>
        {fileExtension && (
          <Grid item xs="auto" display="flex" alignItems="center">
            <TextField
              value={"." + fileExtension}
              disabled
              sx={{ width: "80px", "&& input": { textAlign: "center" } }}
            />
          </Grid>
        )}
        {isImageFile && (
          <Grid item xs={12}>
            <Stack direction="column" gap={1}>
              <Typography variant="body1">{t("image_preview")}</Typography>
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                style={{ maxWidth: "100%", alignSelf: "flex-start" }}
              />
            </Stack>
          </Grid>
        )}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faFileUpload} size="sm" />}
            onClick={handleUpload}
            disabled={!file}
          >
            Upload as {t("destination." + destination)}
          </Button>
        </Grid>
        {apiResponse && (
          <>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="success" variant="filled">
                {t("feedback.success")}
              </Alert>
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                label={t("file_path")}
                value={apiResponse.path}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs="auto" display="flex" alignItems="stretch">
              <CustomIconButton
                variant="contained"
                onClick={() => {
                  navigator.clipboard.writeText(apiResponse.path);
                  toast.success(t("feedback.copy_success"));
                }}
              >
                <FontAwesomeIcon icon={faClipboard} size="lg" />
              </CustomIconButton>
            </Grid>
          </>
        )}
      </Grid>
    </BasicContainerBox>
  );
}
