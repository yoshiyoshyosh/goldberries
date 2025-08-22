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
import { ErrorDisplay, LoadingSpinner, StyledLink } from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
import { AnyImage, CampaignSelect, EmoteImage, MapSelect, OtherIcon } from "../GoldberriesComponents";
import { FormOptions } from "../../util/constants";
import { getQueryData, usePostMap } from "../../hooks/useApi";
import { useTranslation } from "react-i18next";
import { StringListEditor } from "../StringListEditor";
import { useDebounce } from "@uidotdev/usehooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";

export function FormMapWrapper({
  id,
  onSave,
  defaultMapName,
  defaultMapGoldenChanges,
  defaultMapCollectibles,
  ...props
}) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useQuery({
    queryKey: ["map", id],
    queryFn: () => fetchMap(id, true, true, true, true),
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
        is_archived: false,
        sort_major: null,
        sort_minor: null,
        sort_order: null,
        author_gb_id: "",
        author_gb_name: "",
        collectibles: defaultMapCollectibles ?? null,
        golden_changes:
          defaultMapGoldenChanges && defaultMapGoldenChanges.trim() !== ""
            ? defaultMapGoldenChanges
            : "Unknown",
        counts_for: null,
        is_progress: true,
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
  const theme = useTheme();

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
      counts_for_id: data.counts_for?.id,
    };
    saveMap(toSubmit);
  });

  useEffect(() => {
    form.reset(map);
  }, [map]);

  const campaign = form.watch("campaign");
  const counts_for = form.watch("counts_for");

  const name = form.watch("name");
  const nameDebounced = useDebounce(name, 200);
  let sameNameExists = false;
  if (newMap && nameDebounced.length > 0 && campaign !== null && campaign.maps !== null) {
    sameNameExists = campaign.maps.some((m) => m.name === nameDebounced);
  }

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {t_g("map", { count: 1 })} (
        {newMap ? t_g("new") : <StyledLink to={"/map/" + map.id}>{map.id}</StyledLink>})
      </Typography>

      <Controller
        control={form.control}
        name="campaign"
        render={({ field }) => (
          <CampaignSelect
            selected={field.value}
            setSelected={(campaign) => field.onChange(campaign)}
            empty
            rejected
            sx={{ mt: 2 }}
          />
        )}
      />

      <Typography variant="h6" sx={{ mt: 2, fontSize: ".9em" }} gutterBottom>
        {t("counts_for_map.label")}
      </Typography>
      <Controller
        control={form.control}
        name="counts_for"
        render={({ field }) => (
          <MapSelect campaign={campaign} selected={counts_for} setSelected={(map) => field.onChange(map)} />
        )}
      />
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {t("counts_for_map.note")}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <TextField
        label={t_g("name")}
        fullWidth
        {...form.register("name", FormOptions.Name128Required(t_ff))}
        error={!!errors.name}
        helperText={errors.name ? errors.name.message : ""}
      />

      {sameNameExists && (
        <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.25 }}>
          <FontAwesomeIcon icon={faXmarkCircle} fontSize=".8em" color={theme.palette.error.main} />
          <Typography variant="caption" color="error">
            {t("same_name_exists")}
          </Typography>
        </Stack>
      )}

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
      <Controller
        control={form.control}
        name="is_progress"
        defaultValue={map.is_progress}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("is_progress")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />

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
              { type: "string", multiline: true },
              { type: "string" },
              { type: "string" },
            ]}
            valueLabels={[
              t("collectibles.label"),
              t("collectibles.variant"),
              t("collectibles.note"),
              t("collectibles.count"),
              t("collectibles.global_count"),
            ]}
            list={field.value}
            setList={field.onChange}
            valueCount={5}
            reorderable
            inline={[6, 6, 12, 6, 6]}
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
      { value: "8", name: "Velvet Golden", icon: "/icons/golden-velvet.png" },
      { value: "9", name: "FFFFF Golden", icon: "/icons/golden-fffff.png" },
      { value: "10", name: "Blueberry Golden", icon: "/icons/golden-blueberry.png" },
      { value: "11", name: "Trans Golden", icon: "/icons/golden-trans.png" },
      { value: "12", name: "Anarchy Golden", icon: "/icons/golden-anarchy.png" },
      { value: "13", name: "Blackberry Golden", icon: "/icons/golden-blackberry.png" },
      { value: "14", name: "Moonstone Golden", icon: "/icons/golden-moonstone.png" },
      { value: "15", name: "Jim's Adventure Golden", icon: "/icons/golden-jim.png" },
      { value: "16", name: "Focus Golden", icon: "/icons/golden-focus.png" },
      { value: "17", name: "Balls 2 Golden", icon: "/icons/golden-balls2.png" },
    ],
  },
  {
    value: "1",
    name: "Silver Berry",
    icon: "/icons/silverberry-8x.png",
    variants: [
      { value: "1", name: "Taswell Silver", icon: "/icons/golden-taswell.png" },
      { value: "2", name: "Diamond Berry", icon: "/icons/diamondberry.png", variants: [] },
    ],
  },
  { value: "4", name: "Winged Golden Berry", icon: "/icons/winged-goldenberry-8x.png", variants: [] },
  {
    value: "3",
    name: "Moon Berry",
    icon: "/icons/moonberry-8x.png",
    variants: [
      { value: "2", name: "Solaris Moon Berry", icon: "/icons/moonberry-solaris-1.png" },
      { value: "3", name: "Lunaris Moon Berry", icon: "/icons/moonberry-solaris-2.png" },
      { value: "4", name: "Stellaris Moon Berry", icon: "/icons/moonberry-solaris-3.png" },
      { value: "1", name: "Madeline in China Moon Berry", icon: "/icons/moonberry-china.png" },
      { value: "5", name: "Cryoshock Moon Berry", icon: "/icons/moonberry-cryoshock.png" },
      { value: "6", name: "Velvet Moon Berry", icon: "/icons/moonberry-velvet.png" },
      { value: "7", name: "FFFFF Moon Berry", icon: "/icons/moonberry-fffff.png" },
      { value: "8", name: "Voidberry", displayName: "Void Berry", icon: "/icons/voidberry.png" },
      { value: "9", name: "Startside Moon Berry", icon: "/icons/moonberry-startside.png" },
      { value: "10", name: "DMR Moon Berry", icon: "/icons/moonberry-dmr.png" },
      { value: "11", name: "Vivid Abyss Moon Berry", icon: "/icons/moonberry-vabyss.png" },
      { value: "12", name: "Strawberry (hidden Moon Berry)", icon: "/icons/strawberry-8x.png" },
      { value: "13", name: "Balls 2 Moon Berry", icon: "/icons/moonberry-balls2.png" },
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
      { value: "9", name: "Blueberry", icon: "/icons/strawberry-blueberry.png" },
      { value: "10", name: "Anarchy Strawberry", icon: "/icons/strawberry-anarchy.png" },
      { value: "11", name: "Trans Strawberry", icon: "/icons/strawberry-trans.png" },
      { value: "12", name: "Moonstone Strawberry", icon: "/icons/strawberry-moonstone.png" },
      { value: "13", name: "Nutty Noon Strawberry", icon: "/icons/strawberry-nutty.png" },
      { value: "14", name: "Nutty Noon Core Strawberry", icon: "/icons/strawberry-nutty-core.png" },
      { value: "15", name: "Frozen Waterfall Blueberry", icon: "/icons/strawberry-blueberry-frozen.png" },
      { value: "17", name: "Celestecraft Strawberry", icon: "/icons/strawberry-celestecraft.png" },
      { value: "18", name: "Nyanwave Strawberry", icon: "/icons/strawberry-nyanwave.png" },
      { value: "19", name: "Crystallized Sanctuary Strawberry", icon: "/icons/strawberry-sanctuary.png" },
      { value: "20", name: "Megalophobia Strawberry", icon: "/icons/strawberry-megalophobia.png" },
      { value: "21", name: "Wednesday Strawberry", icon: "/icons/strawberry-wednesday.png" },
      { value: "22", name: "Focus Strawberry", icon: "/icons/strawberry-focus.png" },
      { value: "23", name: "Burnt Strawberry", icon: "/icons/strawberry-burnt.png" },
      { value: "24", name: "Getsuyuubyou Light Strawberry", icon: "/icons/strawberry-light.png" },
      { value: "25", name: "Getsuyuubyou Dark Strawberry", icon: "/icons/strawberry-dark.png" },
      { value: "26", name: "Chaos Complex Strawberry", icon: "/icons/strawberry-chaoscomplex.png" },
      { value: "27", name: "Winter Collab Strawberry", icon: "/icons/strawberry-wintercollab.png" },
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
        icon: "/icons/orb-zescent-1.png",
      },
      {
        value: "8",
        name: "Zescent Orb 2",
        icon: "/icons/orb-zescent-2.png",
      },
      {
        value: "9",
        name: "Zescent Orb 3",
        icon: "/icons/orb-zescent-3.png",
      },
      {
        value: "10",
        name: "Megalophobia Black Heart",
        icon: "/icons/crystal-heart-megalophobia-black.png",
      },
      {
        value: "11",
        name: "Megalophobia White Heart",
        icon: "/icons/crystal-heart-megalophobia-white.png",
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
  { value: "10", name: "Speedberry", icon: "/icons/speedberry.png", variants: [] },
  {
    value: "13",
    name: "Special Berry",
    icon: "/icons/bronzeberry.png",
    variants: [
      { value: "1", name: "Bronze Berry", displayName: "Bronze Berry", icon: "/icons/bronzeberry.png" },
      { value: "2", name: "Bouncy Berry", displayName: "Bouncy Berry", icon: "/icons/bouncy-berry.png" },
      { value: "3", name: "Rainbow Berry", displayName: "Rainbow Berry", icon: "/icons/rainbowberry-8x.png" },
      { value: "4", name: "SCA Green Berry", displayName: "Green Berry", icon: "/icons/sca-greenberry.png" },
      { value: "5", name: "SCA Blue Berry", displayName: "Blue Berry", icon: "/icons/sca-blueberry.png" },
      { value: "6", name: "Moonstone Gem Berry", displayName: "Gem Berry", icon: "/icons/gem-berry.png" },
      {
        value: "7",
        name: "Nutty Noon Dream Berry",
        displayName: "Dream Berry",
        icon: "/icons/nutty-dream-berry.png",
      },
      {
        value: "8",
        name: "Nutty Noon Rust Berry",
        displayName: "Rust Berry",
        icon: "/icons/nutty-rust-berry.png",
      },
      {
        value: "9",
        name: "Nutty Noon Water Berry",
        displayName: "Water Berry",
        icon: "/icons/nutty-water-berry.png",
      },
      { value: "10", name: "FLP Frog Berry", displayName: "Frog Berry", icon: "/icons/frogberry.png" },
      { value: "11", name: "Rotten Berry", displayName: "Rotten Berry", icon: "/icons/rottenberry.png" },
      {
        value: "12",
        name: "100 Clouds Storm Berry",
        displayName: "Storm Berry",
        icon: "/icons/stormberry-100-clouds.png",
      },
      {
        value: "13",
        name: "Minecire Bronze Berry",
        displayName: "Bronze Berry",
        icon: "/icons/bronzeberry-minecire.png",
      },
      {
        value: "14",
        name: "Corner Berry",
        icon: "/icons/cornerberry.png",
      },
    ],
  },
  {
    value: "14",
    name: "Other",
    icon: "/icons/key.png",
    variants: [
      { value: "1", name: "Key", displayName: "Key", icon: "/icons/key.png" },
      { value: "2", name: "A Jitio", displayName: "A Jitio", icon: "/icons/jitio.png" },
      {
        value: "3",
        name: "Summit Gem",
        icon: "/icons/orb-zescent-2.png",
      },
      { value: "4", name: "Intro Car", displayName: "Intro Car", icon: "/icons/intro-car.png" },
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
export function getCollectibleOptions() {
  return COLLECTIBLES.map((collectible) => (
    <MenuItem key={collectible.value} value={collectible.value}>
      <Stack direction="row" gap={1} alignItems="center">
        <OtherIcon url={collectible.icon} />
        <Typography variant="body1">{collectible.name}</Typography>
      </Stack>
    </MenuItem>
  ));
}

export function getCollectibleVariantOptions(collectibleId) {
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
