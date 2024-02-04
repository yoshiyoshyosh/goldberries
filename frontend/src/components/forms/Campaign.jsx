import { useQuery } from "react-query";
import { Button, Chip, Divider, FormHelperText, Stack, TextField, Typography } from "@mui/material";
import { ErrorDisplay, LoadingSpinner } from "../BasicComponents";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { FormOptions } from "../../util/constants";
import { usePostCampaign } from "../../hooks/useApi";
import { fetchCampaign } from "../../util/api";
import { MuiColorInput } from "mui-color-input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

export function FormCampaignWrapper({ id, onSave, isMaps = false, ...props }) {
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


export function FormCampaignMaps({ campaign, onSave, ...props }) {
  const [maps, setMaps] = useState(campaign.maps ?? []);
}