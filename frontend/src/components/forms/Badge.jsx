import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchBadge, postBadge } from "../../util/api";
import { Button, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { ErrorDisplay, LoadingSpinner, StyledLink } from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
import {
  DifficultySelectControlled,
  ObjectiveSelect,
  CampaignSelect,
  MapSelect,
} from "../GoldberriesComponents";
import { getQueryData, useGetBadge, usePostBadge } from "../../hooks/useApi";
import { useTranslation } from "react-i18next";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";
import { useDebounce } from "@uidotdev/usehooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hasFlag, setFlag } from "../../pages/Account";
import { MuiColorInput } from "mui-color-input";
import { Badge } from "../Badge";

export const BADGE_FLAGS = {
  shiny: { key: "shiny", flag: 1 },
  glow: { key: "glow", flag: 2 },
  level1: { key: "level_1", flag: 4 },
  level2: { key: "level_2", flag: 8 },
  level3: { key: "level_3", flag: 16 },
};

export function FormBadgeWrapper({ id, onSave, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetBadge(id);
  const data = getQueryData(query);
  const badge = useMemo(() => {
    return (
      data ?? {
        id: null,
        icon_url: "",
        title: "",
        description: "",
        color: "#ffffff",
        flags: 0,
      }
    );
  }, [data]);

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">
          {t_g("badge", { count: 1 })} ({id})
        </Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">
          {t_g("badge", { count: 1 })} ({id})
        </Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  return <FormBadge badge={badge} onSave={onSave} {...props} />;
}

export function FormBadge({ badge, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.badge" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const theme = useTheme();

  const newBadge = badge.id === null;

  const { mutate: saveBadge } = usePostBadge((data) => {
    toast.success(t(newBadge ? "feedback.created" : "feedback.updated"));
    if (onSave) onSave(data);
  });

  const form = useForm({
    defaultValues: {
      ...badge,
      shiny: hasFlag(badge.flags, BADGE_FLAGS.shiny.flag),
      glow: hasFlag(badge.flags, BADGE_FLAGS.glow.flag),
      level1: hasFlag(badge.flags, BADGE_FLAGS.level1.flag),
      level2: hasFlag(badge.flags, BADGE_FLAGS.level2.flag),
      level3: hasFlag(badge.flags, BADGE_FLAGS.level3.flag),
    },
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    saveBadge(data);
  });
  const getFlagsValue = (data) => {
    let flags = setFlag(0, BADGE_FLAGS.shiny.flag, data.shiny);
    flags = setFlag(flags, BADGE_FLAGS.glow.flag, data.glow);
    flags = setFlag(flags, BADGE_FLAGS.level1.flag, data.level1);
    flags = setFlag(flags, BADGE_FLAGS.level2.flag, data.level2);
    flags = setFlag(flags, BADGE_FLAGS.level3.flag, data.level3);
    return flags;
  };

  const formBadge = form.watch();

  useEffect(() => {
    form.reset(badge);
  }, [badge]);
  useEffect(() => {
    //When formBadge changes, update the flags in the form
    const flags = getFlagsValue(formBadge);
    form.setValue("flags", flags);
  }, [formBadge]);

  return (
    <form {...props}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Typography variant="h6" gutterBottom>
          {t_g("badge", { count: 1 })} ({newBadge ? t_g("new") : badge.id})
        </Typography>
        <Badge badge={formBadge} />
      </Stack>

      <TextField
        label={t_g("icon_url") + " *"}
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("icon_url", { required: true })}
      />

      <TextField
        label={t("title") + " *"}
        sx={{ mt: 2 }}
        fullWidth
        {...form.register("title", { required: true })}
      />
      <TextField
        label={t_g("description") + " *"}
        sx={{ mt: 2 }}
        fullWidth
        multiline
        rows={3}
        {...form.register("description", { required: true })}
      />

      <Controller
        control={form.control}
        name="color"
        defaultValue={badge.color}
        render={({ field: { onChange, value } }) => (
          <MuiColorInput
            format="hex"
            label={t("color")}
            value={value}
            fullWidth
            onChange={(color, colors) => onChange(colors.hex)}
            isAlphaHidden
            sx={{ borderRadius: "4px", mt: 2 }}
          />
        )}
      />

      <Controller
        control={form.control}
        name="shiny"
        defaultValue={formBadge.shiny}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("shiny")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="glow"
        defaultValue={formBadge.glow}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("glow")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="level1"
        defaultValue={formBadge.level1}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("level1")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="level2"
        defaultValue={formBadge.level2}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("level2")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <Controller
        control={form.control}
        name="level3"
        defaultValue={formBadge.level3}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("level3")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color={newBadge ? "success" : "primary"}
        onClick={onUpdateSubmit}
        disabled={!form.formState.isValid}
      >
        {t(newBadge ? "buttons.create" : "buttons.update")}
      </Button>
    </form>
  );
}
