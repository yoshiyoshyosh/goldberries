import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchMap, postMap } from "../../util/api";
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorDisplay, LoadingSpinner } from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useMemo } from "react";
import { CampaignSelect } from "../GoldberriesComponents";
import { FormOptions } from "../../util/constants";
import { getQueryData, usePostMap } from "../../hooks/useApi";
import { useTranslation } from "react-i18next";

export function FormMapWrapper({ id, onSave, defaultMapName, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useQuery({
    queryKey: ["map", id],
    queryFn: () => fetchMap(id),
    staleTime: 0,
    cacheTime: 0,
    enabled: id !== null,
  });

  const data = getQueryData(query);
  const map = useMemo(() => {
    return (
      data ?? {
        id: null,
        campaign: null,
        name: defaultMapName ?? "",
        url: "",
        has_fc: false,
        is_rejected: false,
        rejection_reason: "",
        is_archived: false,
        sort_major: null,
        sort_minor: null,
        sort_order: null,
        author_gb_id: "",
        author_gb_name: "",
      }
    );
  }, [data]);

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">
          {t_g("map", { count: 1 })} ({id})
        </Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">
          {t_g("map", { count: 1 })} ({id})
        </Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  return <FormMap map={map} onSave={onSave} {...props} />;
}

export function FormMap({ map, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.map" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_ch } = useTranslation(undefined, { keyPrefix: "forms.challenge" });
  const { t: t_ca } = useTranslation(undefined, { keyPrefix: "forms.campaign" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });

  const newMap = map.id === null;

  const { mutate: saveMap } = usePostMap((data) => {
    toast.success(t(newMap ? "feedback.created" : "feedback.updated"));
    if (onSave) onSave(data);
  });

  const form = useForm({
    defaultValues: map,
  });
  const errors = form.formState.errors;
  const onUpdateSubmit = form.handleSubmit((data) => {
    const toSubmit = {
      ...data,
      campaign_id: data.campaign.id,
    };
    saveMap(toSubmit);
  });

  useEffect(() => {
    form.reset(map);
  }, [map]);

  const campaign = form.watch("campaign");
  const is_rejected = form.watch("is_rejected");

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {t_g("map", { count: 1 })} ({newMap ? t_g("new") : map.id})
      </Typography>

      <Controller
        control={form.control}
        name="campaign"
        render={({ field }) => (
          <CampaignSelect
            selected={field.value}
            setSelected={(campaign) => field.onChange(campaign)}
            sx={{ mt: 2 }}
          />
        )}
      />

      <Divider sx={{ my: 2 }} />

      <TextField
        label={t_g("name")}
        fullWidth
        {...form.register("name", FormOptions.Name128Required(t_ff))}
        error={!!errors.name}
        helperText={errors.name ? errors.name.message : ""}
      />
      <TextField label={t_g("url")} sx={{ mt: 2 }} fullWidth {...form.register("url")} />

      <Controller
        control={form.control}
        name="has_fc"
        defaultValue={map.has_fc}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t_ch("has_fc")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="is_rejected"
        defaultValue={map.is_rejected}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("is_rejected")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="is_archived"
        defaultValue={map.is_archived}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("is_archived")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />

      {is_rejected && (
        <TextField
          label={t("rejection_reason")}
          sx={{ mt: 2 }}
          fullWidth
          {...form.register("rejection_reason", { requires: true })}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <TextField label={t_ca("author_gb_id")} fullWidth {...form.register("author_gb_id")} />
      <TextField
        label={t_ca("author_gb_name")}
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("author_gb_name")}
      />
      <FormHelperText>{t("author_note")}</FormHelperText>

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color={newMap ? "success" : "primary"}
        onClick={onUpdateSubmit}
        disabled={campaign === null}
      >
        {t(newMap ? "buttons.create" : "buttons.update")}
      </Button>
    </form>
  );
}
