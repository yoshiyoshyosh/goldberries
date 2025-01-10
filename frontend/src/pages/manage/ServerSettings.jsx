import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../../components/BasicComponents";
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { getQueryData, useGetServerSettings, usePostServerSettings } from "../../hooks/useApi";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { StringListEditor } from "../../components/StringListEditor";
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getGlobalNoticeSeverityInfo } from "../../components/GlobalNotices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "@emotion/react";

export function PageManageServerSettings({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.server_settings" });

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <ServerSettingsFormWrapper />
    </BasicContainerBox>
  );
}

function ServerSettingsFormWrapper({}) {
  const query = useGetServerSettings();
  const serverSettings = getQueryData(query);

  if (query.isLoading) return <LoadingSpinner />;
  else if (query.isError) return <ErrorDisplay error={query.error} />;

  return <ServerSettingsForm serverSettings={serverSettings} />;
}

function ServerSettingsForm({ serverSettings }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.server_settings.form" });
  const theme = useTheme();
  const form = useForm({
    defaultValues: serverSettings,
  });
  const onSubmit = form.handleSubmit((data) => {
    updateServerSettings(data);
  });

  const { mutate: updateServerSettings } = usePostServerSettings((data) => {
    toast.success(t("feedback.updated"));
  });

  // console.log(serverSettings);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Controller
          control={form.control}
          name="registrations_enabled"
          render={({ field }) => (
            <FormControlLabel
              onChange={field.onChange}
              label={t("registrations_enabled")}
              checked={field.value}
              control={<Checkbox />}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={form.control}
          name="submissions_enabled"
          render={({ field }) => (
            <FormControlLabel
              onChange={field.onChange}
              label={t("submissions_enabled")}
              checked={field.value}
              control={<Checkbox />}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={form.control}
          name="maintenance_mode"
          render={({ field }) => (
            <FormControlLabel
              onChange={field.onChange}
              label={t("maintenance_mode")}
              checked={field.value}
              control={<Checkbox />}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={form.control}
          name="global_notices"
          render={({ field }) => (
            <StringListEditor
              label={t("global_notices.label")}
              valueTypes={[
                {
                  type: "enum",
                  options: getSeverityOptions(theme),
                },
                { type: "string", multiline: true },
              ]}
              valueLabels={[t("global_notices.severity"), t("global_notices.message")]}
              list={field.value}
              setList={field.onChange}
              valueCount={2}
              reorderable
              inline={[3, 9]}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" fullWidth color="primary" onClick={onSubmit}>
          {t("buttons.update")}
        </Button>
      </Grid>
    </Grid>
  );
}

const SEVERITIES = [
  { value: "success", name: "Success" },
  { value: "info", name: "Info" },
  { value: "warning", name: "Warning" },
  { value: "error", name: "Error" },
];

function getSeverityOptions(theme) {
  return SEVERITIES.map((severity) => {
    const info = getGlobalNoticeSeverityInfo(theme, severity.value);
    return (
      <MenuItem key={severity.value} value={severity.value}>
        <Stack direction="row" gap={1} alignItems="center">
          <FontAwesomeIcon icon={info.icon} color={info.color} fontSize="1.5em" />
          <Typography variant="body1" color={info.color}>
            {severity.name}
          </Typography>
        </Stack>
      </MenuItem>
    );
  });
}
