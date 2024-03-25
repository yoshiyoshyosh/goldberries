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
} from "../components/BasicComponents";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { errorToast } from "../util/util";
import { PlayerSelect } from "../components/GoldberriesComponents";
import { useClaimPlayer } from "../hooks/useApi";

export function PageClaimPlayer() {
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
      <HeadTitle title="Claim a Player" />
      {auth.user.player_id !== null ? <ClaimPlayerLinkSuccess /> : null}
      {auth.user.claimed_player_id !== null ? <ClaimPlayerClaimMade /> : null}
      {auth.user.player_id === null && auth.user.claimed_player_id === null ? <ClaimPlayerMakeClaim /> : null}
    </BasicContainerBox>
  );
}

export function ClaimPlayerClaimMade() {
  const auth = useAuth();
  const query = useQuery({
    queryKey: ["player_list", "verifier"],
    queryFn: () => fetchPlayerList("verifier"),
  });

  console.log("Query:", query);

  return (
    <>
      <Typography variant="h4" gutterBottom color="success.main">
        Player claim submitted!
      </Typography>
      <Typography variant="body1">
        Your claim has been submitted! Please contact a team member on Discord (or any other means) to verify
        your claim.
      </Typography>

      <List dense>
        <ListSubheader>Your Data</ListSubheader>
        <ListItem>
          <ListItemText primary={"Claimed Player: " + auth.user.claimed_player.name} />
        </ListItem>
        <ListItem>
          <ListItemText primary={"Account ID: " + auth.user.id} />
        </ListItem>
      </List>

      {query.isLoading ? <LoadingSpinner /> : null}
      {query.isError ? <ErrorDisplay error={query.error} /> : null}
      {query.isSuccess ? (
        <List dense>
          <ListSubheader>Verifiers</ListSubheader>
          {query.data.data.map((player) => (
            <ListItem key={player.id}>
              <ListItemText primary={player.name} />
            </ListItem>
          ))}
        </List>
      ) : null}
    </>
  );
}

export function ClaimPlayerLinkSuccess() {
  return (
    <>
      <Typography variant="h4" gutterBottom color="success.main">
        Player claimed!
      </Typography>
      <Typography variant="body1">
        You have successfully claimed your player. You can now submit runs!
      </Typography>
    </>
  );
}

function ClaimPlayerMakeClaim() {
  const [createNewPlayer, setCreateNewPlayer] = useState(null);
  const onGoBack = () => setCreateNewPlayer(null);

  if (createNewPlayer === null) {
    return (
      <>
        <Typography variant="h4" gutterBottom>
          Claim Player
        </Typography>
        <Typography variant="body1">
          Your account is not linked to a player yet. If you have made submissions on the old spreadsheet, you
          should claim your player with the same name. Otherwise you can create a new player.
        </Typography>
        <Stack direction="column" gap={2} sx={{ mt: 2 }} justifyContent="center">
          <Button variant="contained" fullWidth size="large" onClick={() => setCreateNewPlayer(false)}>
            Link Existing Player
          </Button>
          <Divider flexItem>OR</Divider>
          <Button variant="contained" fullWidth size="large" onClick={() => setCreateNewPlayer(true)}>
            Create New Player
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
      toast.success("Player created!");
      auth.checkSession();
    },
    onError: errorToast,
  });
  const validateNameUnique = (value) => {
    if (query.data.data.find((player) => player.name.toLowerCase() === value.trim().toLowerCase())) {
      return "Player already exists!";
    }
    return true;
  };

  return (
    <>
      <Button variant="outlined" size="large" onClick={onGoBack}>
        Back
      </Button>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h4" gutterBottom>
        Create New Player
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Please enter the name you want to have on the list. If you already have existing submissions from the
        old spreadsheet, please go back and select "Link Existing Player".
      </Typography>
      {query.isLoading ? <LoadingSpinner /> : null}
      {query.isError ? <ErrorDisplay error={query.error} /> : null}
      {query.isSuccess ? (
        <form onSubmit={onSubmit}>
          <TextField
            label="Player Name"
            variant="outlined"
            fullWidth
            {...form.register("name", {
              required: "Please enter a player name",
              validate: validateNameUnique,
              minLength: {
                value: 3,
                message: "Player name must be at least 3 characters long",
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth disabled={!!errors.name}>
            Create Player
          </Button>
        </form>
      ) : null}
    </>
  );
}

function ClaimPlayerClaimExistingPlayer({ onGoBack }) {
  const auth = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [confirmCheck, setConfirmCheck] = useState(false);
  const { mutate: claimSelectedPlayer } = useClaimPlayer(() => {
    auth.checkSession();
  });
  const query = useQuery({
    queryKey: ["golden_list", "player", selectedPlayer?.id],
    queryFn: () => fetchGoldenList("player", selectedPlayer?.id),
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
        Back
      </Button>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h4" gutterBottom>
        Claim Existing Player
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        If you have made submission for the old spreadsheet, you can claim these for your account.
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        After making a claim, you will have to contact a team member to verify that you are who you claim to
        be!
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
            This u?
          </Typography>
          <ProofEmbed url={url} />
        </>
      ) : null}
      <Divider sx={{ my: 2 }} />
      <FormControlLabel
        control={<Checkbox checked={confirmCheck} onChange={(e) => setConfirmCheck(e.target.checked)} />}
        label="I confirm that I am the player shown in the video"
        disabled={selectedPlayer === null}
      />
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        fullWidth
        onClick={() => claimSelectedPlayer(selectedPlayer)}
        disabled={selectedPlayer === null || !confirmCheck}
      >
        Claim Player
      </Button>
    </>
  );
}
