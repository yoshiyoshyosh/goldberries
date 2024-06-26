import { Button, Checkbox, Chip, Divider, FormControlLabel, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMemo } from "react";
import { DifficultySelectControlled, ObjectiveSelect } from "../GoldberriesComponents";
import { usePostCampaign, usePostChallenge, usePostMap } from "../../hooks/useApi";
import { FormOptions } from "../../util/constants";
import { useTranslation } from "react-i18next";

export function FormCreateFullChallengeWrapper({
  onSuccess,
  defaultName,
  defaultUrl,
  defaultDifficultyId,
  ...props
}) {
  const data = useMemo(() => {
    return {
      campaign_name: defaultName ?? "",
      campaign_url: defaultUrl ?? "",
      campaign_author_gb_id: null,
      campaign_author_gb_name: null,
      map_name: defaultName ?? "",

      objective_id: 1,
      description: "",
      requires_fc: false,
      has_fc: false,
      is_arbitrary: false,
      sort: 1,
      difficulty_id: defaultDifficultyId ?? 19, //Undetermined
    };
  }, []);

  return <FormCreateFullChallenge data={data} onSuccess={onSuccess} {...props} />;
}

export function FormCreateFullChallenge({ data, onSuccess, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.create_full_challenge" });
  const { t: t_ca } = useTranslation(undefined, { keyPrefix: "forms.create_full_challenge.campaign" });
  const { t: t_fch } = useTranslation(undefined, { keyPrefix: "forms.challenge" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { mutateAsync: postCampaign } = usePostCampaign(() => {
    toast.success(t("feedback.campaign"));
  });
  const { mutateAsync: postMap } = usePostMap(() => {
    toast.success(t("feedback.map"));
  });
  const { mutateAsync: postChallenge } = usePostChallenge((data) => {
    toast.success(t("feedback.challenge"));
    if (onSuccess) onSuccess(data);
  });

  const form = useForm({
    defaultValues: data,
  });
  const errors = form.formState.errors;
  const onCreateSubmit = form.handleSubmit((data) => {
    //Create all the data
    const campaign = {
      name: data.campaign_name,
      url: data.campaign_url,
      author_gb_id: data.campaign_author_gb_id,
      author_gb_name: data.campaign_author_gb_name,
    };
    const map = {
      name: data.map_name,
    };
    const challenge = {
      objective_id: data.objective_id,
      description: data.description,
      requires_fc: data.requires_fc,
      has_fc: data.has_fc,
      is_arbitrary: data.is_arbitrary,
      difficulty_id: data.difficulty_id,
      sort: data.sort,
    };

    postCampaign(campaign).then((campaignResponse) => {
      map.campaign_id = campaignResponse.data.id;
      postMap(map).then((mapResponse) => {
        challenge.map_id = mapResponse.data.id;
        postChallenge(challenge);
      });
    });
  });

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {t("title")}
      </Typography>

      <Divider>
        <Chip label={t_g("campaign", { count: 1 })} size="small" sx={{ mb: 1 }} />
      </Divider>
      <TextField
        label={t_ca("name") + " *"}
        fullWidth
        {...form.register("campaign_name", FormOptions.Name128Required)}
        error={!!errors.campaign_name}
        helperText={errors.campaign_name ? errors.campaign_name.message : ""}
      />
      <TextField
        label={t_ca("url") + " *"}
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("campaign_url", FormOptions.UrlRequired)}
        error={!!errors.campaign_url}
        helperText={errors.campaign_url ? errors.campaign_url.message : ""}
      />
      <TextField
        label={t_ca("author_gb_id")}
        fullWidth
        {...form.register("campaign_author_gb_id")}
        sx={{ mt: 2 }}
      />
      <TextField
        label={t_ca("author_gb_name")}
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("campaign_author_gb_name")}
      />

      <Divider sx={{ mt: 2, mb: 1 }}>
        <Chip label={t_g("map", { count: 1 })} size="small" />
      </Divider>
      <TextField
        label={t("map_name") + " *"}
        fullWidth
        {...form.register("map_name", FormOptions.Name128Required)}
        error={!!errors.map_name}
        helperText={errors.map_name ? errors.map_name.message : ""}
      />

      <Divider sx={{ mt: 2, mb: 1 }}>
        <Chip label={t_g("challenge", { count: 1 })} size="small" />
      </Divider>
      <Controller
        control={form.control}
        name="objective_id"
        render={({ field }) => (
          <ObjectiveSelect objectiveId={field.value} setObjectiveId={(id) => field.onChange(id)} fullWidth />
        )}
      />

      <TextField label={t_g("description")} sx={{ mt: 2 }} fullWidth {...form.register("description")} />

      <Controller
        control={form.control}
        name="requires_fc"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t_fch("requires_fc")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="has_fc"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t_fch("has_fc")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="is_arbitrary"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t_fch("is_arbitrary")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />

      <Controller
        control={form.control}
        name="difficulty_id"
        render={({ field }) => (
          <DifficultySelectControlled
            difficultyId={field.value}
            setDifficultyId={(id) => field.onChange(id)}
            sx={{ mt: 2 }}
            fullWidth
            label={t_g("difficulty", { count: 1 })}
          />
        )}
      />

      <Divider sx={{ my: 2 }} />

      <TextField label={t_fch("sort_order")} type="number" fullWidth {...form.register("sort")} />

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color="success"
        onClick={onCreateSubmit}
        disabled={Object.keys(errors).length > 0}
      >
        {t_fch("buttons.create")}
      </Button>
    </form>
  );
}
