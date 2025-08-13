import {
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMemo, useState } from "react";
import { DifficultySelectControlled, ObjectiveSelect } from "../GoldberriesComponents";
import {
  getQueryData,
  useGetModInfo,
  usePostCampaign,
  usePostChallenge,
  usePostMap,
  useSearch,
} from "../../hooks/useApi";
import { DIFF_CONSTS, FormOptions } from "../../util/constants";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faDownload, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useDebounce } from "@uidotdev/usehooks";
import { SameCampaignNameIndicator } from "./Campaign";
import { getCollectibleOptions, getCollectibleVariantOptions } from "./Map";
import { StringListEditor } from "../StringListEditor";

export function FormCreateFullChallengeWrapper({
  onSuccess,
  defaultName,
  defaultGoldenChanges,
  defaultCollectibles,
  defaultUrl,
  defaultDifficultyId,
  ...props
}) {
  const data = useMemo(() => {
    return {
      campaign_name: defaultName ?? "",
      campaign_url: defaultUrl ?? "",
      campaign_author_gb_id: "",
      campaign_author_gb_name: "",

      map_name: defaultName ?? "",
      map_golden_changes:
        defaultGoldenChanges && defaultGoldenChanges.trim() !== "" ? defaultGoldenChanges : "Unknown",
      map_collectibles: defaultCollectibles ?? null,

      objective_id: 1,
      label: "",
      description: "",
      requires_fc: false,
      has_fc: false,
      is_arbitrary: false,
      sort: 1,
      difficulty_id: defaultDifficultyId ?? DIFF_CONSTS.UNTIERED_ID,
    };
  }, []);

  return <FormCreateFullChallenge data={data} onSuccess={onSuccess} {...props} />;
}

export function FormCreateFullChallenge({ data, onSuccess, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.create_full_challenge" });
  const { t: t_ca } = useTranslation(undefined, { keyPrefix: "forms.create_full_challenge.campaign" });
  const { t: t_fch } = useTranslation(undefined, { keyPrefix: "forms.challenge" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { t: t_fm } = useTranslation(undefined, { keyPrefix: "forms.map" });
  const { t: t_a } = useTranslation();
  const [modFetchState, setModFetchState] = useState(0); //0 = not fetched, 1 = fetching, 2 = success, 3 = error
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
      golden_changes: data.map_golden_changes,
      collectibles: data.map_collectibles,
      is_progress: true,
    };
    const challenge = {
      objective_id: data.objective_id,
      label: data.label,
      description: data.description,
      requires_fc: data.requires_fc,
      has_fc: data.has_fc,
      is_arbitrary: data.is_arbitrary,
      is_rejected: data.is_rejected,
      reject_note: data.reject_note,
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

  const { mutate: getModInfo } = useGetModInfo(
    (response) => {
      setModFetchState(2);
      console.log("Mod info", response);
      //Set the form values
      form.setValue("campaign_name", response.name);
      form.setValue("campaign_author_gb_id", response.authorId);
      form.setValue("campaign_author_gb_name", response.author);
    },
    (error) => {
      setModFetchState(3);
    }
  );
  const fetchModInfo = () => {
    setModFetchState(1);
    getModInfo(form.getValues("campaign_url"));
  };
  const fetchingButtonColors = ["primary", "primary", "success", "error"];
  const fetchingButtonColor = fetchingButtonColors[modFetchState];
  const fetchingButtonIcons = [faDownload, faSpinner, faCheck, faXmark];
  const fetchingButtonIcon = fetchingButtonIcons[modFetchState];
  const fetchingButtonSpin = modFetchState === 1;

  const campaignName = form.watch("campaign_name");
  const challenge_is_rejected = form.watch("is_rejected");

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {t("title")}
      </Typography>

      <Divider>
        <Chip label={t_g("campaign", { count: 1 })} size="small" sx={{ mb: 1 }} />
      </Divider>
      <Controller
        control={form.control}
        name="campaign_name"
        defaultValue=""
        rules={FormOptions.Name128Required(t_ff)}
        render={({ field }) => (
          <TextField
            label={t_ca("name") + " *"}
            fullWidth
            value={field.value}
            onChange={field.onChange}
            error={!!errors.campaign_name}
            helperText={errors.campaign_name ? errors.campaign_name.message : ""}
          />
        )}
      />
      <SameCampaignNameIndicator name={campaignName} />
      <Grid container spacing={1} sx={{ mt: 2 }}>
        <Grid item xs={12} sm>
          <TextField
            label={t_g("url") + " *"}
            fullWidth
            {...form.register("campaign_url", FormOptions.UrlRequired(t_ff))}
            error={!!errors.campaign_url}
            helperText={errors.campaign_url ? errors.campaign_url.message : ""}
          />
        </Grid>
        <Grid item xs={12} sm="auto" display="flex" alignItems="center">
          <Tooltip title={t_a("forms.campaign.url_fetch_tooltip")}>
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
        name="campaign_author_gb_id"
        defaultValue=""
        render={({ field }) => (
          <TextField
            sx={{ mt: 2 }}
            label={t_ca("author_gb_id")}
            fullWidth
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={form.control}
        name="campaign_author_gb_name"
        defaultValue=""
        render={({ field }) => (
          <TextField
            sx={{ mt: 2 }}
            label={t_ca("author_gb_name")}
            fullWidth
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Divider sx={{ mt: 2, mb: 1 }}>
        <Chip label={t_g("map", { count: 1 })} size="small" />
      </Divider>
      <TextField
        label={t("map_name") + " *"}
        fullWidth
        {...form.register("map_name", FormOptions.Name128Required(t_ff))}
        error={!!errors.map_name}
        helperText={errors.map_name ? errors.map_name.message : ""}
      />
      <TextField
        label={t_fm("golden_changes")}
        fullWidth
        multiline
        minRows={2}
        {...form.register("map_golden_changes")}
        sx={{ mt: 2 }}
      />
      <Controller
        control={form.control}
        name="map_collectibles"
        render={({ field }) => (
          <StringListEditor
            label={t_fm("collectibles.label")}
            sx={{ mt: 2 }}
            valueTypes={[
              {
                type: "enum",
                options: getCollectibleOptions(),
              },
              { type: "enum", options: (item, index, value) => getCollectibleVariantOptions(item[0]) },
              { type: "string", multiline: true },
              { type: "string" },
              { type: "string" },
            ]}
            valueLabels={[
              t_fm("collectibles.label"),
              t_fm("collectibles.variant"),
              t_fm("collectibles.note"),
              t_fm("collectibles.count"),
              t_fm("collectibles.global_count"),
            ]}
            list={field.value}
            setList={field.onChange}
            valueCount={5}
            reorderable
            inline={[6, 6, 12, 6, 6]}
          />
        )}
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

      <TextField label={t_g("label")} sx={{ mt: 2 }} fullWidth {...form.register("label")} />
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
        name="is_rejected"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t_fch("is_rejected")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />

      <TextField
        label={t_fch(challenge_is_rejected ? "reject_note" : "reject_note_not_rejected")}
        sx={{ mt: 1 }}
        fullWidth
        {...form.register("reject_note", { required: challenge_is_rejected ? true : undefined })}
        error={form.formState.errors.reject_note !== undefined}
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
