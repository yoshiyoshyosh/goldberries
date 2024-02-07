import { useQuery } from "react-query";
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ErrorDisplay, LoadingSpinner } from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { FormOptions } from "../../util/constants";
import { useDeleteMap, usePostCampaign, usePostMap } from "../../hooks/useApi";
import { fetchCampaign } from "../../util/api";
import { MuiColorInput } from "mui-color-input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { getCampaignName, getMapLobbyInfo } from "../../util/data_util";

export function FormCampaignWrapper({ id, onSave, isEditMaps = false, ...props }) {
  const query = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => fetchCampaign(id),
    staleTime: 0,
    cacheTime: 0,
    enabled: id !== null,
  });

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">Campaign ({id})</Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">Campaign ({id})</Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  const campaign = query.data?.data ?? {
    id: null,
    name: "",
    url: "",
    icon_url: "",
    sort_major_name: "",
    sort_major_labels: [],
    sort_major_colors: [],
    sort_minor_name: "",
    sort_minor_labels: [],
    sort_minor_colors: [],
    author_gb_id: "",
    author_gb_name: "",
  };

  if (isEditMaps) return <FormCampaignEditMaps campaign={campaign} onSave={onSave} {...props} />;
  return <FormCampaign campaign={campaign} onSave={onSave} {...props} />;
}

export function FormCampaign({ campaign, onSave, ...props }) {
  const newCampaign = campaign.id === null;

  const { mutate: postCampaign } = usePostCampaign((newCampaign) => {
    const isNew = campaign.id === null;
    toast.success("Campaign " + (isNew ? "created" : "updated") + "!");
    if (onSave) onSave(newCampaign);
  });

  const form = useForm({
    defaultValues: campaign,
  });
  const errors = form.formState.errors;
  const onUpdateSubmit = form.handleSubmit((data) => {
    console.log("Submitting campaign", data);
    postCampaign(data);
  });

  useEffect(() => {
    form.reset(campaign);
  }, [campaign]);

  const major_labels = form.watch("sort_major_labels");
  const major_colors = form.watch("sort_major_colors");
  const minor_labels = form.watch("sort_minor_labels");
  const minor_colors = form.watch("sort_minor_colors");

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        Campaign ({newCampaign ? "New" : campaign.id})
      </Typography>

      <TextField
        label="Name *"
        fullWidth
        {...form.register("name", FormOptions.Name128Required)}
        error={!!errors.name}
        helperText={errors.name ? errors.name.message : ""}
      />
      <TextField
        label="URL *"
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("url", FormOptions.UrlRequired)}
        error={!!errors.url}
        helperText={errors.url ? errors.url.message : ""}
      />
      <TextField label="Icon URL" sx={{ mt: 2 }} fullWidth {...form.register("icon_url")} />

      <Divider sx={{ my: 2 }} />

      <TextField label="Author GameBanana ID" fullWidth {...form.register("author_gb_id")} />
      <TextField
        label="Author GameBanana Name"
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("author_gb_name")}
      />

      <Divider sx={{ my: 2 }}>
        <Chip size="small" label="Map Sort Major" />
      </Divider>
      <TextField
        label="Name"
        fullWidth
        {...form.register("sort_major_name")}
        error={!!errors.sort_major_name}
        helperText={errors.sort_major_name ? errors.sort_major_name.message : ""}
      />

      <CampaignSortCategoryEdit
        labels={major_labels ?? []}
        colors={major_colors ?? []}
        setLabels={(v) => form.setValue("sort_major_labels", v)}
        setColors={(v) => form.setValue("sort_major_colors", v)}
      />

      <Divider sx={{ my: 2 }}>
        <Chip size="small" label="Map Sort Minor" />
      </Divider>
      <TextField
        label="Name"
        fullWidth
        {...form.register("sort_minor_name")}
        error={!!errors.sort_minor_name}
        helperText={errors.sort_minor_name ? errors.sort_minor_name.message : ""}
      />

      <CampaignSortCategoryEdit
        labels={minor_labels ?? []}
        colors={minor_colors ?? []}
        setLabels={(v) => form.setValue("sort_minor_labels", v)}
        setColors={(v) => form.setValue("sort_minor_colors", v)}
      />

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color={newCampaign ? "success" : "primary"}
        onClick={onUpdateSubmit}
      >
        {newCampaign ? "Create" : "Update"} Campaign
      </Button>
    </form>
  );
}

function CampaignSortCategoryEdit({ labels, colors, setLabels, setColors }) {
  //labels and colors are arrays of strings, of the same size
  //This component should render the labels and colors as a list, with a button to delete each entry
  //It should also have a button to add a new entry
  return (
    <div>
      {labels.map((label, index) => (
        <Stack direction="row" gap={1} key={index} alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label="Name"
            fullWidth
            value={label}
            onChange={(e) => {
              const newLabels = [...labels];
              newLabels[index] = e.target.value;
              setLabels(newLabels);
            }}
          />

          <MuiColorInput
            format="hex"
            isAlphaHidden
            value={colors[index]}
            onChange={(c) => {
              const newColors = [...colors];
              newColors[index] = c;
              setColors(newColors);
            }}
          />

          <Button
            variant="contained"
            color="error"
            onClick={() => {
              const newLabels = [...labels];
              newLabels.splice(index, 1);
              setLabels(newLabels);
              const newColors = [...colors];
              newColors.splice(index, 1);
              setColors(newColors);
            }}
          >
            Delete
          </Button>
        </Stack>
      ))}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={() => {
          setLabels([...labels, "Label"]);
          setColors([...colors, "#555555"]);
        }}
        startIcon={<FontAwesomeIcon icon={faPlus} />}
      >
        Add Label
      </Button>
    </div>
  );
}

function FormCampaignEditMaps({ campaign, onSave, ...props }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutateAsync: saveMaps } = usePostMap((response) => {
    toast.success("Campaign maps updated!");
    if (onSave) onSave(response);
  });
  const { mutateAsync: deleteMap } = useDeleteMap(() => {});

  const hasMajorSort = campaign.sort_major_name !== "" && campaign.sort_major_name !== null;
  const hasMinorSort = campaign.sort_minor_name !== "" && campaign.sort_minor_name !== null;
  const majorSorts = hasMajorSort ? campaign.sort_major_labels : [];
  const minorSorts = hasMinorSort ? campaign.sort_minor_labels : [];

  const transformMaps = (maps) => {
    return maps.map((map) => {
      return {
        ...map,
        sort_major: hasMajorSort ? majorSorts[map.sort_major] : null,
        sort_minor: hasMinorSort ? minorSorts[map.sort_minor] : null,
        sort_order: map.sort_order,
      };
    });
  };

  const form = useForm({
    defaultValues: {
      ...campaign,
      maps: transformMaps(campaign.maps),
      mapsToDelete: [],
    },
  });
  const errors = form.formState.errors;
  const onUpdateSubmit = form.handleSubmit((data) => {
    for (const map of data.maps) {
      if (map.sort_major !== "" && map.sort_major !== null)
        map.sort_major = campaign.sort_major_labels.indexOf(map.sort_major);
      if (map.sort_minor !== "" && map.sort_minor !== null)
        map.sort_minor = campaign.sort_minor_labels.indexOf(map.sort_minor);
      if (map.sort_order !== "" && map.sort_order !== null) map.sort_order = parseInt(map.sort_order);

      delete map.challenges;
    }
    saveMaps(data.maps);

    const mapsToDelete = data.mapsToDelete;
    if (mapsToDelete.length > 0) {
      Promise.all(mapsToDelete.map((mapId) => deleteMap(mapId))).then(() => {
        toast.success("Selected map(s) deleted!");
      });
    }
  });

  useEffect(() => {
    form.reset({
      ...campaign,
      maps: transformMaps(campaign.maps),
      mapsToDelete: [],
    });
  }, [campaign]);

  const mapsToDelete = form.watch("mapsToDelete");
  const canSubmit = mapsToDelete.length === 0 || confirmDelete;

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {getCampaignName(campaign)} {">"} Maps
      </Typography>

      {campaign.maps.map((map, i) => {
        const isMapDeleted = mapsToDelete.includes(map.id);
        return (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={{ xs: 1, sm: 2 }}
            key={map.id}
            sx={{ mt: 2 }}
            alignItems="center"
          >
            <TextField
              label="Name"
              fullWidth
              {...form.register(`maps[${i}].name`, FormOptions.Name128Required)}
              disabled={isMapDeleted}
            />
            {hasMajorSort && (
              <Controller
                control={form.control}
                name={`maps[${i}].sort_major`}
                render={({ field }) => (
                  <Autocomplete
                    options={campaign.sort_major_labels}
                    getOptionKey={(option) => campaign.sort_major_labels.indexOf(option)}
                    fullWidth
                    value={field.value}
                    onChange={(e, v) => field.onChange(v)}
                    renderInput={(params) => <TextField {...params} label={campaign.sort_major_name} />}
                    disabled={isMapDeleted}
                  />
                )}
              />
            )}
            {hasMinorSort && (
              <Controller
                control={form.control}
                name={`maps[${i}].sort_minor`}
                render={({ field }) => (
                  <Autocomplete
                    options={campaign.sort_minor_labels}
                    getOptionKey={(option) => campaign.sort_minor_labels.indexOf(option)}
                    fullWidth
                    value={field.value}
                    onChange={(e, v) => field.onChange(v)}
                    renderInput={(params) => <TextField {...params} label={campaign.sort_minor_name} />}
                    disabled={isMapDeleted}
                  />
                )}
              />
            )}
            <TextField
              label="Order"
              type="number"
              fullWidth
              {...form.register(`maps[${i}].sort_order`)}
              disabled={isMapDeleted}
            />
            <Tooltip title={isMapDeleted ? "Undo Delete" : "Delete Map"}>
              <IconButton
                color={isMapDeleted ? "success" : "error"}
                onClick={() => {
                  const newMapsToDelete = [...mapsToDelete];
                  if (isMapDeleted) {
                    newMapsToDelete.splice(newMapsToDelete.indexOf(map.id), 1);
                  } else {
                    newMapsToDelete.push(map.id);
                  }
                  form.setValue("mapsToDelete", newMapsToDelete);
                }}
              >
                <FontAwesomeIcon size="xs" icon={isMapDeleted ? faPlus : faTrash} />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      })}

      <Divider sx={{ my: 2 }} />
      {mapsToDelete.length > 0 && (
        <>
          <FormHelperText sx={{ color: "#ff0000" }}>
            Please confirm that you want to delete <b>{mapsToDelete.length}</b> maps. This cannot be undone!
          </FormHelperText>
          <FormControlLabel
            control={
              <Checkbox checked={confirmDelete} onChange={(e) => setConfirmDelete(e.target.checked)} />
            }
            label={
              "Yes, delete '" + mapsToDelete.length + "' map(s) and all attached challenges & submissions."
            }
          />
        </>
      )}

      <Button variant="contained" fullWidth color="primary" onClick={onUpdateSubmit} disabled={!canSubmit}>
        Save Maps
      </Button>
    </form>
  );
}
