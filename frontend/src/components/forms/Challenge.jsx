import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchChallenge, postChallenge } from "../../util/api";
import { Button, Checkbox, Divider, FormControlLabel, TextField, Typography } from "@mui/material";
import { ErrorDisplay, LoadingSpinner } from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
import {
  DifficultySelectControlled,
  ObjectiveSelect,
  FullMapSelect,
  CampaignSelect,
  MapSelect,
} from "../GoldberriesComponents";
import { getQueryData, usePostChallenge } from "../../hooks/useApi";
import { useTranslation } from "react-i18next";

export function FormChallengeWrapper({ id, onSave, defaultDifficultyId, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => fetchChallenge(id),
    staleTime: 0,
    cacheTime: 0,
    enabled: id !== null,
  });

  const data = getQueryData(query);
  const challenge = useMemo(() => {
    return (
      data ?? {
        id: null,
        campaign: null,
        map: null,
        objective_id: 1,
        description: "",
        requires_fc: false,
        has_fc: false,
        is_arbitrary: false,
        sort: null,
        difficulty_id: defaultDifficultyId ?? 19, //Undetermined
      }
    );
  }, [data]);

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">
          {t_g("challenge", { count: 1 })} ({id})
        </Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">
          {t_g("challenge", { count: 1 })} ({id})
        </Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  return <FormChallenge challenge={challenge} onSave={onSave} {...props} />;
}

export function FormChallenge({ challenge, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.challenge" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [map, setMap] = useState(challenge.map);
  const [campaign, setCampaign] = useState(challenge.map?.campaign ?? challenge.campaign);

  const newChallenge = challenge.id === null;

  const { mutate: saveChallenge } = usePostChallenge((data) => {
    toast.success(t(newChallenge ? "feedback.created" : "feedback.updated"));
    if (onSave) onSave(data);
  });

  const form = useForm({
    defaultValues: challenge,
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    const toSubmit = {
      ...data,
      map_id: map?.id,
    };
    if (map === null) {
      toSubmit.campaign_id = campaign.id;
    }
    saveChallenge(toSubmit);
  });

  useEffect(() => {
    form.reset(challenge);
  }, [challenge]);

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {t_g("challenge", { count: 1 })} ({newChallenge ? t_g("new") : challenge.id})
      </Typography>

      <CampaignSelect selected={campaign} setSelected={(campaign) => setCampaign(campaign)} sx={{ mt: 2 }} />
      {campaign && (
        <MapSelect campaign={campaign} selected={map} setSelected={(map) => setMap(map)} sx={{ mt: 2 }} />
      )}

      {campaign && map === null && (
        <Typography variant="body1" color="error">
          {t("full_game_notice")}
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

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
        defaultValue={challenge.requires_fc}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("requires_fc")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="has_fc"
        defaultValue={challenge.has_fc}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("has_fc")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="is_arbitrary"
        defaultValue={challenge.is_arbitrary}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("is_arbitrary")}
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

      <TextField label={t("sort_order")} type="number" fullWidth {...form.register("sort")} />

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color={newChallenge ? "success" : "primary"}
        onClick={onUpdateSubmit}
        disabled={campaign === null}
      >
        {t(newChallenge ? "buttons.create" : "buttons.update")}
      </Button>
    </form>
  );
}
