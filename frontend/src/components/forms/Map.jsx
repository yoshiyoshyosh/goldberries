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
import { useEffect } from "react";
import { CampaignSelect } from "../GoldberriesComponents";
import { FormOptions } from "../../util/constants";

export function FormMapWrapper({ id, onSave, defaultMapName, ...props }) {
  const query = useQuery({
    queryKey: ["map", id],
    queryFn: () => fetchMap(id),
    staleTime: 0,
    cacheTime: 0,
    enabled: id !== null,
  });

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">Map ({id})</Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">Map ({id})</Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  const map = query.data?.data ?? {
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
  };

  return <FormMap map={map} onSave={onSave} {...props} />;
}

export function FormMap({ map, onSave, ...props }) {
  const queryClient = useQueryClient();

  const newMap = map.id === null;

  const { mutate: saveMap } = useMutation({
    mutationFn: (map) => postMap(map),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["map", map.id]);
      queryClient.invalidateQueries(["submission_queue"]);
      queryClient.invalidateQueries(["manage_challenges"]);
      toast.success("Map " + (newMap ? "created" : "updated") + "!");
      if (onSave) onSave(response.data);
    },
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
        Map ({newMap ? "New" : map.id})
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
        label="Name"
        fullWidth
        {...form.register("name", FormOptions.Name128Required)}
        error={!!errors.name}
        helperText={errors.name ? errors.name.message : ""}
      />
      <TextField label="URL" sx={{ mt: 2 }} fullWidth {...form.register("url")} />

      <Controller
        control={form.control}
        name="has_fc"
        defaultValue={map.has_fc}
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
        name="is_rejected"
        defaultValue={map.is_rejected}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label="Is Rejected"
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
            label="Is Archived"
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />

      {is_rejected && (
        <TextField
          label="Rejection Reason"
          sx={{ mt: 2 }}
          fullWidth
          {...form.register("rejection_reason", { requires: true })}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <TextField label="Author GameBanana ID" fullWidth {...form.register("author_gb_id")} />
      <TextField
        label="Author GameBanana Name"
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("author_gb_name")}
      />
      <FormHelperText>Leave these blank if they match the author of the campaign.</FormHelperText>

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color={newMap ? "success" : "primary"}
        onClick={onUpdateSubmit}
        disabled={campaign === null}
      >
        {newMap ? "Create" : "Update"} Map
      </Button>
    </form>
  );
}
