import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchChallenge, postChallenge } from "../../util/api";
import { Button, Checkbox, Divider, FormControlLabel, TextField, Typography } from "@mui/material";
import { ErrorDisplay, LoadingSpinner } from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { DifficultySelectControlled, ObjectiveSelect, FullMapSelect } from "../GoldberriesComponents";

export function FormChallengeWrapper({ id, onSave, ...props }) {
  const query = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => fetchChallenge(id),
    staleTime: 0,
    cacheTime: 0,
    enabled: id !== null,
  });

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">Challenge ({id})</Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">Challenge ({id})</Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  const challenge = query.data?.data ?? {
    id: null,
    map: null,
    objective_id: 1,
    description: "",
    requires_fc: false,
    has_fc: false,
    is_arbitrary: false,
    difficulty_id: null,
  };

  return <FormChallenge challenge={challenge} onSave={onSave} {...props} />;
}

export function FormChallenge({ challenge, onSave, ...props }) {
  const queryClient = useQueryClient();

  const newChallenge = challenge.id === null;

  const { mutate: saveChallenge } = useMutation({
    mutationFn: (challenge) => postChallenge(challenge),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["challenge", challenge.id]);
      queryClient.invalidateQueries(["submission_queue"]);
      queryClient.invalidateQueries(["manage_challenges"]);
      toast.success("Challenge " + (newChallenge ? "created" : "updated") + "!");
      if (onSave) onSave(response.data);
    },
  });

  const form = useForm({
    defaultValues: challenge,
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    const toSubmit = {
      ...data,
      map_id: data.map.id,
    };
    saveChallenge(toSubmit);
  });

  useEffect(() => {
    form.reset(challenge);
  }, [challenge]);

  const map = form.watch("map");

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        Challenge ({newChallenge ? "New" : challenge.id})
      </Typography>

      <Controller
        control={form.control}
        name="map"
        render={({ field }) => (
          <FullMapSelect map={field.value} setMap={(map) => field.onChange(map)} sx={{ mt: 2 }} />
        )}
      />

      <Divider sx={{ my: 2 }} />

      <Controller
        control={form.control}
        name="objective_id"
        render={({ field }) => (
          <ObjectiveSelect
            objectiveId={field.value}
            setObjectiveId={(id) => field.onChange(id)}
            fullWidth
            label="Objective"
          />
        )}
      />

      <TextField label="Description" sx={{ mt: 2 }} fullWidth {...form.register("description")} />

      <Controller
        control={form.control}
        name="requires_fc"
        defaultValue={challenge.requires_fc}
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
        defaultValue={challenge.has_fc}
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
        defaultValue={challenge.is_arbitrary}
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

      <Button
        variant="contained"
        fullWidth
        color={newChallenge ? "success" : "primary"}
        onClick={onUpdateSubmit}
        disabled={map === null}
      >
        {newChallenge ? "Create" : "Update"} Challenge
      </Button>
    </form>
  );
}
