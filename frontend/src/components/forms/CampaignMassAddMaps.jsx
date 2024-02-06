import { Button, Chip, Divider, FormHelperText, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { CampaignSelect } from "../../pages/Submit";
import { useState } from "react";
import { usePostChallenge, usePostMap } from "../../hooks/useApi";
import { toast } from "react-toastify";

export function FormCampaignMassAddMaps({ onSave }) {
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
    const toastId = toast.loading("Adding maps (0/" + maps.length + ")");

    const addMapRecursive = (mapIndex) => {
      if (mapIndex >= maps.length) {
        toast.update(toastId, {
          render: "Added maps (" + maps.length + "/" + maps.length + ")",
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
      }).then((response) => {
        const newMapId = response.data.id;
        const promises = [];
        if (map.generate_challenges === "c_fc_distinct") {
          promises.push(
            addChallengeAsync({
              map_id: newMapId,
              objective_id: 1,
              difficulty_id: 19,
              requires_fc: true,
              has_fc: false,
            }),
            addChallengeAsync({
              map_id: newMapId,
              objective_id: 1,
              difficulty_id: 19,
              requires_fc: false,
              has_fc: false,
            })
          );
        } else {
          promises.push(
            addChallengeAsync({
              map_id: newMapId,
              objective_id: 1,
              difficulty_id: 19,
              has_fc: map.generate_challenges === "c_fc",
            })
          );
        }
        Promise.all(promises).then(() => {
          toast.update(toastId, { render: "Adding maps (" + (mapIndex + 1) + "/" + maps.length + ")" });
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
        generate_challenges: "c", //c, c_fc, c_fc_distinct
      };
    });
    form.setValue("mapObjs", newMapObjs);
    setFormState(1);
  };

  return (
    <>
      <Typography variant="h6">Mass Add Maps</Typography>
      <CampaignSelect selected={campaign} setSelected={(c) => form.setValue("campaign", c)} />
      <Divider sx={{ my: 2 }}>
        <Chip label={"Step " + (formState + 1) + " / 2"} size="small" />
      </Divider>
      {formState === 0 && (
        <>
          <FormHelperText>Each line corresponds to a map name.</FormHelperText>
          <TextField
            sx={{ mt: 2 }}
            label="Map Names"
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
            Next
          </Button>
        </>
      )}
      {formState === 1 && (
        <>
          <FormHelperText>Specify which challenges to generate for each map.</FormHelperText>
          {mapObjs.map((map, i) => (
            <Stack sx={{ mt: 2 }} direction="row" gap={2} key={i}>
              <TextField
                label="Map Name"
                value={map.name}
                {...form.register(`mapObjs.${i}.name`)}
                fullWidth
              />
              <TextField
                label="Generate Challenges"
                select
                fullWidth
                defaultValue={"c_fc"}
                {...form.register(`mapObjs.${i}.generate_challenges`)}
              >
                <MenuItem value="c">Clear</MenuItem>
                <MenuItem value="c_fc">C/FC</MenuItem>
                <MenuItem value="c_fc_distinct">Clear and FC separately</MenuItem>
              </TextField>
            </Stack>
          ))}
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" gap={2}>
            <Button onClick={() => setFormState(0)} variant="outlined" color="info" fullWidth>
              Back
            </Button>
            <Button
              onClick={onUpdateSubmit}
              variant="contained"
              color="primary"
              fullWidth
              disabled={campaign === null}
            >
              Create Maps
            </Button>
          </Stack>
        </>
      )}
    </>
  );
}
