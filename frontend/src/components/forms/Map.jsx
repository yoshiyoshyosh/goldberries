import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchMap, postMap } from "../../util/api";
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorDisplay, LoadingSpinner } from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
import { AnyImage, CampaignSelect, EmoteImage, OtherIcon } from "../GoldberriesComponents";
import { FormOptions } from "../../util/constants";
import { getQueryData, usePostMap } from "../../hooks/useApi";
import { useTranslation } from "react-i18next";
import { StringListEditor } from "../StringListEditor";

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
        url: null,
        is_rejected: false,
        rejection_reason: "",
        is_archived: false,
        sort_major: null,
        sort_minor: null,
        sort_order: null,
        author_gb_id: "",
        author_gb_name: "",
        collectibles: null,
        golden_changes: "",
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
  const [collectibles, setCollectibles] = useState(null);

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
  const url = form.watch("url");

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

      <TextField label={t("note")} sx={{ mt: 2 }} fullWidth {...form.register("note")} />

      <TextField
        label={t("golden_changes")}
        sx={{ mt: 2 }}
        fullWidth
        multiline
        {...form.register("golden_changes")}
      />

      <Divider sx={{ my: 2 }} />
      <Controller
        control={form.control}
        name="url"
        render={({ field }) => (
          <StringListEditor
            label="URL List"
            valueTypes={[{ type: "string" }, { type: "string" }]}
            valueLabels={["URL", "Description (optional)"]}
            list={field.value}
            setList={field.onChange}
            valueCount={2}
          />
        )}
      />
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

      <Controller
        control={form.control}
        name="collectibles"
        render={({ field }) => (
          <StringListEditor
            label={t("collectibles.label")}
            valueTypes={[
              {
                type: "enum",
                options: getCollectibleOptions(),
              },
              { type: "enum", options: (item, index, value) => getCollectibleVariantOptions(item[0]) },
              { type: "string" },
              { type: "string", multiline: true },
            ]}
            valueLabels={[
              t("collectibles.label"),
              t("collectibles.variant"),
              t("collectibles.count"),
              t("collectibles.note"),
            ]}
            list={field.value}
            setList={field.onChange}
            valueCount={4}
          />
        )}
      />

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

export const COLLECTIBLES = [
  {
    value: "0",
    name: "Golden Berry",
    icon: "/icons/goldenberry-8x.png",
    variants: [
      { value: "1", name: "Solaris Golden", icon: "/icons/golden-solaris.png" },
      { value: "2", name: "Anomaly Golden", icon: "/icons/golden-anomaly.png" },
      { value: "3", name: "Madeline in China Golden", icon: "/icons/golden-china.png" },
      { value: "4", name: "Cryoshock Golden", icon: "/icons/golden-cryoshock.png" },
      { value: "5", name: "Drizzle Golden", icon: "/icons/golden-drizzle.png" },
      { value: "6", name: "Neon Golden", icon: "/icons/golden-neon.png" },
      { value: "7", name: "Taswell Golden", icon: "/icons/golden-taswell.png" },
      { value: "8", name: "Velvet Golden", icon: "/icons/golden-velvet.png" },
      { value: "9", name: "FFFFF Golden", icon: "/icons/golden-fffff.png" },
    ],
  },
  { value: "1", name: "Silver Berry", icon: "/icons/silverberry-8x.png", variants: [] },
  { value: "4", name: "Winged Golden Berry", icon: "/icons/winged-goldenberry-8x.png", variants: [] },
  {
    value: "3",
    name: "Moonberry",
    icon: "/icons/moonberry-8x.png",
    variants: [
      { value: "2", name: "Solaris Moonberry", icon: "/icons/moonberry-solaris-1.png" },
      { value: "3", name: "Lunaris Moonberry", icon: "/icons/moonberry-solaris-2.png" },
      { value: "4", name: "Stellaris Moonberry", icon: "/icons/moonberry-solaris-3.png" },
      { value: "1", name: "Madeline in China Moonberry", icon: "/icons/moonberry-china.png" },
      { value: "5", name: "Cryoshock Moonberry", icon: "/icons/moonberry-cryoshock.png" },
      { value: "6", name: "Velvet Moonberry", icon: "/icons/moonberry-velvet.png" },
      { value: "7", name: "FFFFF Moonberry", icon: "/icons/moonberry-fffff.png" },
      { value: "8", name: "Voidberry", displayName: "Voidberry", icon: "/icons/voidberry.png" },
    ],
  },
  {
    value: "2",
    name: "Strawberry",
    icon: "/icons/strawberry-8x.png",
    variants: [
      { value: "5", name: "Solaris Strawberry", icon: "/icons/strawberry-solaris.png" },
      { value: "1", name: "Madeline in China Strawberry", icon: "/icons/strawberry-china.png" },
      { value: "2", name: "Cryoshock Strawberry", icon: "/icons/strawberry-cryoshock.png" },
      { value: "3", name: "Drizzle Strawberry", icon: "/icons/strawberry-drizzle.png" },
      { value: "8", name: "Neon Strawberry", icon: "/icons/strawberry-neon.png" },
      { value: "6", name: "Taswell Strawberry", icon: "/icons/strawberry-taswell.png" },
      { value: "7", name: "Velvet Strawberry", icon: "/icons/strawberry-velvet.png" },
      { value: "4", name: "FFFFF Strawberry", icon: "/icons/strawberry-fffff.png" },
    ],
  },
  {
    value: "7",
    name: "Crystal Heart",
    icon: "/icons/crystal-heart-a.png",
    variants: [
      { value: "1", name: "Red Heart", icon: "/icons/crystal-heart-b.png" },
      { value: "2", name: "Yellow Heart", icon: "/icons/crystal-heart-c.png" },
      { value: "3", name: "Watcher Egg", displayName: "Watcher Egg", icon: "/icons/watcheregg.png" },
      { value: "4", name: "DMR Heart", icon: "/icons/crystal-heart-dmr.png" },
      { value: "5", name: "Empty Heart", icon: "/icons/crystal-heart-empty.png" },
      { value: "6", name: "Glyph Main Heart", icon: "/icons/crystal-heart-glyph-main.png" },
      {
        value: "7",
        name: "Zescent Orb 1",
        displayName: "Zescent Orb 1",
        icon: "/icons/orb-zescent-1.png",
      },
      {
        value: "8",
        name: "Zescent Orb 2",
        displayName: "Zescent Orb 2",
        icon: "/icons/orb-zescent-2.png",
      },
      {
        value: "9",
        name: "Zescent Orb 3",
        displayName: "Zescent Orb 3",
        icon: "/icons/orb-zescent-3.png",
      },
    ],
  },
  {
    value: "6",
    name: "Cassette",
    icon: "/icons/cassette-crisp.png",
    variants: [{ value: "1", name: "D-Sides Cassette", icon: "/icons/cassette-crisp-d-sides.png" }],
  },
  { value: "5", name: "Platinum Berry", icon: "/icons/platinumberry-8x.png", variants: [] },
  { value: "11", name: "Diamond Berry", icon: "/icons/diamondberry.png", variants: [] },
  { value: "10", name: "Speedberry", icon: "/icons/speedberry.png", variants: [] },
  {
    value: "13",
    name: "Special Berry",
    icon: "/icons/bronzeberry.png",
    variants: [
      { value: "1", name: "Bronze Berry", displayName: "Bronze Berry", icon: "/icons/bronzeberry.png" },
      { value: "2", name: "Bouncy Berry", displayName: "Bouncy Berry", icon: "/icons/bouncy-berry.png" },
      { value: "3", name: "Rainbow Berry", displayName: "Rainbow Berry", icon: "/icons/rainbowberry-8x.png" },
    ],
  },
  {
    value: "14",
    name: "Other",
    icon: "/icons/key.png",
    variants: [
      { value: "1", name: "Key", displayName: "Key", icon: "/icons/key.png" },
      { value: "2", name: "A Jitio", displayName: "A Jitio", icon: "/icons/jitio.png" },
    ],
  },
];
export function getCollectibleIcon(collectibleId, variantId) {
  const collectible = COLLECTIBLES.find((c) => c.value === collectibleId);
  if (variantId) {
    const variant = collectible.variants.find((v) => v.value === variantId);
    if (variant) {
      return variant.icon;
    }
  }
  return collectible.icon;
}
export function getCollectibleName(collectibleId, variantId) {
  const collectible = COLLECTIBLES.find((c) => c.value === collectibleId);
  if (variantId) {
    const variant = collectible.variants.find((v) => v.value === variantId);
    if (variant && variant.displayName) {
      return variant.displayName;
    }
  }
  return collectible.name;
}
function getCollectibleOptions() {
  return COLLECTIBLES.map((collectible) => (
    <MenuItem key={collectible.value} value={collectible.value}>
      <Stack direction="row" gap={1} alignItems="center">
        <OtherIcon url={collectible.icon} />
        <Typography variant="body1">{collectible.name}</Typography>
      </Stack>
    </MenuItem>
  ));
}

function getCollectibleVariantOptions(collectibleId) {
  const collectible = COLLECTIBLES.find((c) => c.value === collectibleId);
  if (!collectible) {
    return [];
  }
  const options = collectible.variants.map((variant) => (
    <MenuItem key={variant.value} value={variant.value}>
      <Stack direction="row" gap={1} alignItems="center">
        <OtherIcon url={variant.icon} />
        <Typography variant="body1">{variant.name}</Typography>
      </Stack>
    </MenuItem>
  ));
  options.unshift(
    <MenuItem key="default" value="0">
      <Stack direction="row" gap={1} alignItems="center">
        <OtherIcon url={collectible.icon} />
        <Typography variant="body1">Default: {collectible.name}</Typography>
      </Stack>
    </MenuItem>
  );
  return options;
}
