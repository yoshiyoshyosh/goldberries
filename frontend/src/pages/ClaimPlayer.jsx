import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../hooks/AuthProvider";
import { useMutation, useQuery } from "react-query";
import { fetchAllPlayers, fetchGoldenList, fetchPlayerList, postPlayer } from "../util/api";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  ProofEmbed,
  StyledExternalLink,
} from "../components/BasicComponents";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { errorToast } from "../util/util";
import { PlayerChip, PlayerSelect } from "../components/GoldberriesComponents";
import { useClaimPlayer } from "../hooks/useApi";
import { Trans, useTranslation } from "react-i18next";
import { DISCORD_INVITE } from "../util/constants";

export function PageClaimPlayer() {
  const { t } = useTranslation(undefined, { keyPrefix: "claim_player" });
  const auth = useAuth();

  return (
    <BasicContainerBox
      sx={{
        mt: {
          xs: 0,
          sm: 3,
        },
      }}
    >
      <HeadTitle title={t("title")} />
      {auth.user.player_id !== null ? <ClaimPlayerLinkSuccess /> : null}
      {auth.user.claimed_player_id !== null ? <ClaimPlayerClaimMade /> : null}
      {auth.user.player_id === null && auth.user.claimed_player_id === null ? <ClaimPlayerMakeClaim /> : null}
    </BasicContainerBox>
  );
}

export function ClaimPlayerClaimMade() {
  const { t } = useTranslation(undefined, { keyPrefix: "claim_player.claim_made" });
  const auth = useAuth();
  const query = useQuery({
    queryKey: ["player_list", "verifier"],
    queryFn: () => fetchPlayerList("verifier"),
  });

  return (
    <>
      <Typography variant="h4" gutterBottom color="success.main">
        {t("title")}
      </Typography>
      <Typography variant="body1">
        <Trans
          i18nKey="claim_player.claim_made.info"
          components={{ CustomLink: <StyledExternalLink href={DISCORD_INVITE} /> }}
        />
      </Typography>

      <List dense>
        <ListSubheader>{t("your_data.title")}</ListSubheader>
        <ListItem>
          <ListItemText primary={t("your_data.account_id") + " " + auth.user.id} />
        </ListItem>
        <ListItem>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography variant="body2">{t("your_data.claimed_player")}</Typography>
            <PlayerChip player={auth.user.claimed_player} size="small" />
          </Stack>
        </ListItem>
      </List>

      {query.isLoading ? <LoadingSpinner /> : null}
      {query.isError ? <ErrorDisplay error={query.error} /> : null}
      {query.isSuccess ? (
        <List dense>
          <ListSubheader>{t("your_data.verifiers")}</ListSubheader>
          {query.data.data.map((player) => (
            <ListItem key={player.id}>
              <PlayerChip player={player} size="small" />
            </ListItem>
          ))}
        </List>
      ) : null}
    </>
  );
}

export function ClaimPlayerLinkSuccess() {
  const { t } = useTranslation(undefined, { keyPrefix: "claim_player.link_success" });
  return (
    <>
      <Typography variant="h4" gutterBottom color="success.main">
        {t("title")}
      </Typography>
      <Typography variant="body1">{t("info")}</Typography>
    </>
  );
}

function ClaimPlayerMakeClaim() {
  const { t } = useTranslation(undefined, { keyPrefix: "claim_player.make_claim" });
  const [createNewPlayer, setCreateNewPlayer] = useState(null);
  const onGoBack = () => setCreateNewPlayer(null);

  if (createNewPlayer === null) {
    return (
      <>
        <Typography variant="h4" gutterBottom>
          {t("title")}
        </Typography>
        <Typography variant="body1">{t("info")}</Typography>
        <Stack direction="column" gap={2} sx={{ mt: 2 }} justifyContent="center">
          <Button variant="contained" fullWidth size="large" onClick={() => setCreateNewPlayer(false)}>
            {t("buttons.link")}
          </Button>
          <Divider flexItem>OR</Divider>
          <Button variant="contained" fullWidth size="large" onClick={() => setCreateNewPlayer(true)}>
            {t("buttons.create")}
          </Button>
        </Stack>
      </>
    );
  }

  if (createNewPlayer) {
    return <ClaimPlayerCreateNewPlayer onGoBack={onGoBack} />;
  } else {
    return <ClaimPlayerClaimExistingPlayer onGoBack={onGoBack} />;
  }
}

function ClaimPlayerCreateNewPlayer({ onGoBack }) {
  const { t } = useTranslation(undefined, { keyPrefix: "claim_player.make_claim.create" });
  const { t: t_mc } = useTranslation(undefined, { keyPrefix: "claim_player.make_claim" });
  const auth = useAuth();
  const form = useForm({
    mode: "onTouched",
  });
  const errors = form.formState.errors;
  const onSubmit = form.handleSubmit((data) => {
    console.log(data);
    createPlayer({
      name: data.name,
    });
  });
  const query = useQuery({
    queryKey: ["player_list", "all"],
    queryFn: () => fetchAllPlayers(),
  });
  const { mutate: createPlayer } = useMutation({
    mutationFn: (data) => postPlayer(data),
    onSuccess: (data) => {
      toast.success(t("feedback.created"));
      auth.checkSession();
    },
    onError: errorToast,
  });
  const validateNameUnique = (value) => {
    if (query.data.data.find((player) => player.name.toLowerCase() === value.trim().toLowerCase())) {
      return t("feedback.already_exists");
    }
    return true;
  };

  return (
    <>
      <Button variant="outlined" size="large" onClick={onGoBack}>
        {t_mc("back")}
      </Button>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {t("info")}
      </Typography>
      {query.isLoading ? <LoadingSpinner /> : null}
      {query.isError ? <ErrorDisplay error={query.error} /> : null}
      {query.isSuccess ? (
        <form onSubmit={onSubmit}>
          <TextField
            label={t("player_name")}
            variant="outlined"
            fullWidth
            {...form.register("name", {
              required: t("feedback.name_missing"),
              validate: validateNameUnique,
              minLength: {
                value: 3,
                message: t("feedback.name_short"),
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth disabled={!!errors.name}>
            {t("button")}
          </Button>
        </form>
      ) : null}
    </>
  );
}

function ClaimPlayerClaimExistingPlayer({ onGoBack }) {
  const { t } = useTranslation(undefined, { keyPrefix: "claim_player.make_claim.link" });
  const { t: t_mc } = useTranslation(undefined, { keyPrefix: "claim_player.make_claim" });
  const auth = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [confirmCheck, setConfirmCheck] = useState(false);
  const { mutate: claimSelectedPlayer } = useClaimPlayer(() => {
    auth.checkSession();
  });
  const query = useQuery({
    queryKey: ["golden_list", "player", selectedPlayer?.id],
    queryFn: () =>
      fetchGoldenList("player", selectedPlayer?.id, { include_arbitrary: true, include_archived: true }),
    enabled: selectedPlayer !== null,
  });

  let url = null;
  if (query.isSuccess) {
    let highestDiffChallenge = null;
    query.data.data.forEach((campaign) => {
      campaign.maps.forEach((map) => {
        map.challenges.forEach((challenge) => {
          if (
            highestDiffChallenge === null ||
            challenge.difficulty.sort > highestDiffChallenge.difficulty.sort
          ) {
            highestDiffChallenge = challenge;
          }
        });
      });
    });
    url = highestDiffChallenge.submissions[0].proof_url;
  }

  return (
    <>
      <Button variant="outlined" size="large" onClick={onGoBack}>
        {t_mc("back")}
      </Button>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {t("info_1")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {t("info_2")}
      </Typography>
      <PlayerSelect
        type="unclaimed"
        value={selectedPlayer}
        onChange={(e, value) => setSelectedPlayer(value)}
      />
      {query.isLoading ? <LoadingSpinner /> : null}
      {query.isError ? <ErrorDisplay error={query.error} /> : null}
      {query.isSuccess ? (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t("this_u")}
          </Typography>
          <ProofEmbed url={url} />
        </>
      ) : null}
      <Divider sx={{ my: 2 }} />
      <FormControlLabel
        control={<Checkbox checked={confirmCheck} onChange={(e) => setConfirmCheck(e.target.checked)} />}
        label={t("confirm")}
        disabled={selectedPlayer === null}
      />
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        fullWidth
        onClick={() => claimSelectedPlayer(selectedPlayer)}
        disabled={selectedPlayer === null || !confirmCheck}
      >
        {t("button")}
      </Button>
    </>
  );
}
