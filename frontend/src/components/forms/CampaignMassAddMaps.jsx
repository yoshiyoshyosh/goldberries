import { Button, Chip, Divider, FormHelperText, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { CampaignSelect, ObjectiveSelect } from "../GoldberriesComponents";
import { useState } from "react";
import { usePostChallenge, usePostMap } from "../../hooks/useApi";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { DIFF_CONSTS } from "../../util/constants";

export function FormCampaignMassAddMaps({ onSave }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.campaign_mass_add_maps" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const [formState, setFormState] = useState(0); // 0 = input map names, 1 = input additional map data
  const { mutateAsync: addMapAsync } = usePostMap();
  const { mutateAsync: addChallengeAsync } = usePostChallenge();

  const form = useForm({
    defaultValues: {
      campaign: null,
      maps: "",
      mapObjs: [],
    },
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    const maps = data.mapObjs;
    const toastId = toast.loading(t("feedback.adding", { current: 0, count: maps.length }));

    const addMapRecursive = (mapIndex) => {
      if (mapIndex >= maps.length) {
        toast.update(toastId, {
          render: t("feedback.adding", { current: maps.length, count: maps.length }),
          isLoading: false,
          type: "success",
          autoClose: true,
        });
        return;
      }
      let map = maps[mapIndex];
      addMapAsync({
        name: map.name,
        campaign_id: data.campaign.id,
        has_fc: map.generate_challenges === "c_fc" || map.generate_challenges === "c_fc_distinct",
        golden_changes: "Unknown",
        is_progress: true,
      }).then((response) => {
        const newMapId = response.data.id;
        const promises = [];
        if (map.generate_challenges === "c_fc_distinct") {
          promises.push(
            addChallengeAsync({
              map_id: newMapId,
              objective_id: map.challenge_objective_id,
              difficulty_id: DIFF_CONSTS.UNTIERED_ID,
              requires_fc: true,
              has_fc: false,
            }),
            addChallengeAsync({
              map_id: newMapId,
              objective_id: map.challenge_objective_id,
              difficulty_id: DIFF_CONSTS.UNTIERED_ID,
              requires_fc: false,
              has_fc: false,
            })
          );
        } else {
          promises.push(
            addChallengeAsync({
              map_id: newMapId,
              objective_id: map.challenge_objective_id,
              difficulty_id: DIFF_CONSTS.UNTIERED_ID,
              has_fc: map.generate_challenges === "c_fc",
            })
          );
        }
        Promise.all(promises).then(() => {
          toast.update(toastId, {
            render: t("feedback.adding", { current: mapIndex + 1, count: maps.length }),
          });
          addMapRecursive(mapIndex + 1);
        });
      });
    };
    addMapRecursive(0);
  });

  const campaign = form.watch("campaign");
  const maps = form.watch("maps");
  const mapObjs = form.watch("mapObjs");

  const goToStep2 = () => {
    // Split the map names into an array of intermediary objects
    const mapNames = maps.split("\n");
    const newMapObjs = mapNames.map((name) => {
      return {
        name: name,
        generate_challenges: "c_fc", //c, c_fc, c_fc_distinct
        challenge_objective_id: 2,
      };
    });
    form.setValue("mapObjs", newMapObjs);
    setFormState(1);
  };

  return (
    <>
      <Typography variant="h6">{t("title")}</Typography>
      <CampaignSelect selected={campaign} setSelected={(c) => form.setValue("campaign", c)} empty rejected />
      <Divider sx={{ my: 2 }}>
        <Chip label={t("step", { current: formState + 1, total: 2 })} size="small" />
      </Divider>
      {formState === 0 && (
        <>
          <FormHelperText>{t("step_1.helper")}</FormHelperText>
          <TextField
            sx={{ mt: 2 }}
            label={t("step_1.label")}
            multiline
            rows={10}
            fullWidth
            {...form.register("maps", { required: "Required" })}
          />
          <Divider sx={{ my: 2 }} />
          <Button
            onClick={goToStep2}
            variant="contained"
            color="primary"
            fullWidth
            disabled={campaign === null}
          >
            {t("next")}
          </Button>
        </>
      )}
      {formState === 1 && (
        <>
          <FormHelperText>{t("step_2.helper")}</FormHelperText>
          {mapObjs.map((map, i) => (
            <Stack sx={{ mt: 2 }} direction="row" gap={2} key={i}>
              <TextField
                label={t("step_2.map_name")}
                value={map.name}
                {...form.register(`mapObjs.${i}.name`)}
                fullWidth
              />
              <TextField
                label={t("step_2.generate_challenges")}
                select
                fullWidth
                defaultValue={"c_fc"}
                {...form.register(`mapObjs.${i}.generate_challenges`)}
              >
                <MenuItem value="c">Clear</MenuItem>
                <MenuItem value="c_fc">C/FC</MenuItem>
                <MenuItem value="c_fc_distinct">{t("step_2.c_fc_distinct")}</MenuItem>
              </TextField>
              <Controller
                control={form.control}
                name={`mapObjs.${i}.challenge_objective_id`}
                render={({ field }) => (
                  <ObjectiveSelect
                    fullWidth
                    objectiveId={map.challenge_objective_id}
                    setObjectiveId={field.onChange}
                  />
                )}
              />
            </Stack>
          ))}
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" gap={2}>
            <Button onClick={() => setFormState(0)} variant="outlined" color="info" fullWidth>
              {t("back")}
            </Button>
            <Button
              onClick={onUpdateSubmit}
              variant="contained"
              color="primary"
              fullWidth
              disabled={campaign === null}
            >
              {t("step_2.create_maps")}
            </Button>
          </Stack>
        </>
      )}
    </>
  );
}
