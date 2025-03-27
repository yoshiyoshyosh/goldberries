import { useQuery } from "react-query";
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ErrorDisplay, LoadingSpinner, StyledLink } from "../BasicComponents";
import { Controller, set, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { FormOptions } from "../../util/constants";
import {
  getQueryData,
  useDeleteMap,
  useGetModInfo,
  usePostCampaign,
  usePostMap,
  useSearch,
} from "../../hooks/useApi";
import { fetchCampaign } from "../../util/api";
import { MuiColorInput } from "mui-color-input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckCircle,
  faDownload,
  faExclamationTriangle,
  faLightbulb,
  faPlus,
  faSpinner,
  faTrash,
  faXmark,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { getCampaignName } from "../../util/data_util";
import { useTranslation } from "react-i18next";
import { useDebounce } from "@uidotdev/usehooks";
import { useTheme } from "@emotion/react";

export function FormCampaignWrapper({
  id,
  onSave,
  isEditMaps = false,
  defaultCampaignName,
  defaultCampaignUrl,
  ...props
}) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const challenges = isEditMaps ? false : true;
  const submissions = isEditMaps ? false : true;

  const query = useQuery({
    queryKey: ["campaign", id, challenges, submissions],
    queryFn: () => fetchCampaign(id, true, challenges, submissions, true, true),
    staleTime: 0,
    cacheTime: 0,
    enabled: id !== null,
  });

  const data = getQueryData(query);
  const campaign = useMemo(() => {
    return (
      data ?? {
        id: null,
        name: defaultCampaignName ?? "",
        url: defaultCampaignUrl ?? "",
        icon_url: "",
        sort_major_name: "",
        sort_major_labels: [],
        sort_major_colors: [],
        sort_minor_name: "",
        sort_minor_labels: [],
        sort_minor_colors: [],
        author_gb_id: "",
        author_gb_name: "",
      }
    );
  }, [data]);

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">
          {t_g("campaign", { count: 1 })} ({id})
        </Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">
          {t_g("campaign", { count: 1 })} ({id})
        </Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  if (isEditMaps) return <FormCampaignEditMaps campaign={campaign} onSave={onSave} {...props} />;
  return <FormCampaign campaign={campaign} onSave={onSave} {...props} />;
}

export function FormCampaign({ campaign, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.campaign" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [modFetchState, setModFetchState] = useState(0); //0 = not fetched, 1 = fetching, 2 = success, 3 = error
  const newCampaign = campaign.id === null;

  const { mutate: postCampaign } = usePostCampaign((newCampaign) => {
    const isNew = campaign.id === null;
    toast.success(t(isNew ? "feedback.created" : "feedback.updated"));
    if (onSave) onSave(newCampaign);
  });

  const form = useForm({
    defaultValues: campaign,
  });
  const errors = form.formState.errors;
  const onUpdateSubmit = form.handleSubmit((data) => {
    console.log("Submitting campaign", data);
    //Unset maps field to save data
    data.maps = undefined;
    postCampaign(data);
  });

  useEffect(() => {
    form.reset(campaign);
  }, [campaign]);

  const { mutate: getModInfo } = useGetModInfo(
    (response) => {
      if (response.name === null) {
        setModFetchState(3);
        return;
      }
      setModFetchState(2);
      console.log("Mod info", response);
      //Set the form values
      form.setValue("name", response.name, { shouldDirty: true, shouldTouch: true });
      form.setValue("author_gb_id", response.authorId);
      form.setValue("author_gb_name", response.author);
    },
    (error) => {
      setModFetchState(3);
    }
  );
  const fetchModInfo = () => {
    setModFetchState(1);
    getModInfo(form.getValues("url"));
  };
  const fetchingButtonColors = ["primary", "primary", "success", "error"];
  const fetchingButtonColor = fetchingButtonColors[modFetchState];
  const fetchingButtonIcons = [faDownload, faSpinner, faCheck, faXmark];
  const fetchingButtonIcon = fetchingButtonIcons[modFetchState];
  const fetchingButtonSpin = modFetchState === 1;

  const major_labels = form.watch("sort_major_labels");
  const major_colors = form.watch("sort_major_colors");
  const minor_labels = form.watch("sort_minor_labels");
  const minor_colors = form.watch("sort_minor_colors");

  const name = form.watch("name");

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {t_g("campaign", { count: 1 })} (
        {newCampaign ? t_g("new") : <StyledLink to={"/campaign/" + campaign.id}>{campaign.id}</StyledLink>})
      </Typography>

      <Controller
        control={form.control}
        name="name"
        defaultValue=""
        rules={FormOptions.Name128Required(t_ff)}
        render={({ field }) => (
          <TextField
            label={t_g("name") + " *"}
            fullWidth
            value={field.value}
            onChange={field.onChange}
            error={!!errors.name}
            helperText={errors.name ? errors.name.message : ""}
          />
        )}
      />

      {newCampaign && <SameCampaignNameIndicator name={name} />}

      <Grid container spacing={1} sx={{ mt: 2 }}>
        <Grid item xs={12} sm>
          <TextField
            label={t_g("url") + " *"}
            fullWidth
            {...form.register("url")}
            error={!!errors.url}
            helperText={errors.url ? errors.url.message : ""}
          />
        </Grid>
        <Grid item xs={12} sm="auto" display="flex" alignItems="center">
          <Tooltip title={t("url_fetch_tooltip")}>
            <Button
              fullWidth
              variant="contained"
              color={fetchingButtonColor}
              sx={{ height: "50px" }}
              onClick={fetchModInfo}
            >
              <FontAwesomeIcon spin={fetchingButtonSpin} icon={fetchingButtonIcon} size="lg" />
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
      <Controller
        control={form.control}
        name="author_gb_id"
        defaultValue=""
        render={({ field }) => (
          <TextField
            label={t("author_gb_id")}
            fullWidth
            value={field.value}
            onChange={field.onChange}
            sx={{ mt: 2 }}
          />
        )}
      />
      <Controller
        control={form.control}
        name="author_gb_name"
        defaultValue=""
        render={({ field }) => (
          <TextField
            sx={{ mt: 2 }}
            label={t("author_gb_name")}
            fullWidth
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Divider sx={{ my: 2 }} />

      <TextField label={t("icon_url")} fullWidth {...form.register("icon_url")} />
      <TextField label={t("note")} sx={{ mt: 2 }} fullWidth {...form.register("note")} />

      <Divider sx={{ my: 2 }}>
        <Chip size="small" label={t("sort_category_major")} />
      </Divider>
      <TextField
        label={t_g("name")}
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
        <Chip size="small" label={t("sort_category_minor")} />
      </Divider>
      <TextField
        label={t_g("name")}
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
        {t(newCampaign ? "buttons.create" : "buttons.update")}
      </Button>
    </form>
  );
}

export function SameCampaignNameIndicator({ name }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.campaign.name_feedback" });
  const theme = useTheme();
  const nameDebounced = useDebounce(name, 500);
  const searchQuery = useSearch(nameDebounced, ["campaigns"], nameDebounced.length > 0);
  const data = getQueryData(searchQuery);
  let sameNameExists = false;
  if (searchQuery.isSuccess && data.campaigns.length > 0) {
    sameNameExists = data.campaigns.some((c) => c.name === nameDebounced);
  }

  if (nameDebounced.length === 0) return null;

  return (
    <Stack direction="row" gap={0.5} sx={{ mt: 0.25 }} alignItems="center">
      {searchQuery.isLoading && <LoadingSpinner sx={{ fontSize: ".8em" }} />}
      {searchQuery.isError && (
        <>
          <FontAwesomeIcon icon={faExclamationTriangle} fontSize=".8em" color={theme.palette.error.main} />
          <Typography variant="caption" color="error">
            {t("generic_error")}
          </Typography>
        </>
      )}
      {searchQuery.isSuccess &&
        nameDebounced.length > 0 &&
        (sameNameExists ? (
          <>
            <FontAwesomeIcon icon={faXmarkCircle} fontSize=".8em" color={theme.palette.error.main} />
            <Typography variant="caption" color="error">
              {t("duplicate")}
            </Typography>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faCheckCircle} fontSize=".8em" color={theme.palette.success.main} />
            <Typography variant="caption" color={(t) => t.palette.success.main}>
              {t("unique")}
            </Typography>
          </>
        ))}
    </Stack>
  );
}

function CampaignSortCategoryEdit({ labels, colors, setLabels, setColors }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.campaign.sort_editor" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  //labels and colors are arrays of strings, of the same size
  //This component should render the labels and colors as a list, with a button to delete each entry
  //It should also have a button to add a new entry
  return (
    <div>
      {labels.map((label, index) => (
        <Stack direction="row" gap={1} key={index} alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label={t_g("name")}
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
            {t("delete")}
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
        {t("add")}
      </Button>
    </div>
  );
}

function FormCampaignEditMaps({ campaign, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.campaign.edit_maps" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutateAsync: saveMaps } = usePostMap((response) => {
    toast.success(t("feedback.updated"));
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
        toast.success(t("feedback.deleted", { count: mapsToDelete.length }));
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
        {getCampaignName(campaign, t_g)} {">"} {t_g("map", { count: 30 })}
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
              label={t_g("name")}
              fullWidth
              {...form.register(`maps[${i}].name`, FormOptions.Name128Required(t_ff))}
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
              label={t("order")}
              type="number"
              fullWidth
              {...form.register(`maps[${i}].sort_order`)}
              disabled={isMapDeleted}
            />
            <Tooltip title={t(isMapDeleted ? "undo_delete" : "delete_map")}>
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
            {t("confirm_delete", { count: mapsToDelete.length })}
          </FormHelperText>
          <FormControlLabel
            control={
              <Checkbox checked={confirmDelete} onChange={(e) => setConfirmDelete(e.target.checked)} />
            }
            label={t("confirm_delete_label", { count: mapsToDelete.length })}
          />
        </>
      )}

      <Button variant="contained" fullWidth color="primary" onClick={onUpdateSubmit} disabled={!canSubmit}>
        {t("save_maps")}
      </Button>
    </form>
  );
}
