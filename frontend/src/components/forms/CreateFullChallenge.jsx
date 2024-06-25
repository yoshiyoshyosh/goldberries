import { Button, Checkbox, Chip, Divider, FormControlLabel, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMemo } from "react";
import { DifficultySelectControlled, ObjectiveSelect } from "../GoldberriesComponents";
import { usePostCampaign, usePostChallenge, usePostMap } from "../../hooks/useApi";
import { FormOptions } from "../../util/constants";

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
  const { mutateAsync: postCampaign } = usePostCampaign(() => {
    toast.success("Campaign created!");
  });
  const { mutateAsync: postMap } = usePostMap(() => {
    toast.success("Map created!");
  });
  const { mutateAsync: postChallenge } = usePostChallenge((data) => {
    toast.success("Challenge created!");
    if (onSuccess) onSuccess(data);
  });

  const form = useForm({
    defaultValues: data,
  });
  const errors = form.formState.errors;
  const onCreateSubmit = form.handleSubmit((data) => {
    console.log("Data:", data);
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
        Create Full Challenge
      </Typography>

      <Divider>
        <Chip label="Campaign" size="small" sx={{ mb: 1 }} />
      </Divider>
      <TextField
        label="Campaign Name *"
        fullWidth
        {...form.register("campaign_name", FormOptions.Name128Required)}
        error={!!errors.campaign_name}
        helperText={errors.campaign_name ? errors.campaign_name.message : ""}
      />
      <TextField
        label="Campaign URL *"
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("campaign_url", FormOptions.UrlRequired)}
        error={!!errors.campaign_url}
        helperText={errors.campaign_url ? errors.campaign_url.message : ""}
      />
      <TextField
        label="Author GameBanana ID"
        fullWidth
        {...form.register("campaign_author_gb_id")}
        sx={{ mt: 2 }}
      />
      <TextField
        label="Author GameBanana Name"
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("campaign_author_gb_name")}
      />

      <Divider sx={{ mt: 2, mb: 1 }}>
        <Chip label="Map" size="small" />
      </Divider>
      <TextField
        label="Map Name *"
        fullWidth
        {...form.register("map_name", FormOptions.Name128Required)}
        error={!!errors.map_name}
        helperText={errors.map_name ? errors.map_name.message : ""}
      />

      <Divider sx={{ mt: 2, mb: 1 }}>
        <Chip label="Challenge" size="small" />
      </Divider>
      <Controller
        control={form.control}
        name="objective_id"
        render={({ field }) => (
          <ObjectiveSelect objectiveId={field.value} setObjectiveId={(id) => field.onChange(id)} fullWidth />
        )}
      />

      <TextField label="Description" sx={{ mt: 2 }} fullWidth {...form.register("description")} />

      <Controller
        control={form.control}
        name="requires_fc"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label="Requires FC"
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
            label="Has FC"
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
            label="Is Arbitrary"
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
            label="Difficulty"
          />
        )}
      />

      <Divider sx={{ my: 2 }} />

      <TextField label="Sort Order" type="number" fullWidth {...form.register("sort")} />

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color="success"
        onClick={onCreateSubmit}
        disabled={Object.keys(errors).length > 0}
      >
        Create Challenge
      </Button>
    </form>
  );
}
