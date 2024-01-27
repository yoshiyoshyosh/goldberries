import {
  Autocomplete,
  Box,
  Button,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../hooks/AuthProvider";
import { useMutation, useQuery } from "react-query";
import { fetchAllPlayers, fetchPlayerList, postPlayer } from "../util/api";
import { ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { errorToast } from "../util/util";

export function PageClaimPlayer() {
  const auth = useAuth();

  if (auth.user.player_id !== null) {
    return <ClaimPlayerLinkSuccess />;
  } else if (auth.user.claimed_player_id !== null) {
    return <ClaimPlayerClaimMade />;
  } else {
    return <ClaimPlayerMakeClaim />;
  }
}

export function ClaimPlayerClaimMade() {
  const auth = useAuth();
  const query = useQuery({
    queryKey: ["player_list", "verifier"],
    queryFn: () => fetchPlayerList("verifier"),
  });

  console.log("Query:", query);

  return (
    <ClaimPlayerContainer>
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
    </ClaimPlayerContainer>
  );
}

export function ClaimPlayerLinkSuccess() {
  return (
    <ClaimPlayerContainer>
      <Typography variant="h4" gutterBottom color="success.main">
        Player claimed!
      </Typography>
      <Typography variant="body1">
        You have successfully claimed your player. You can now submit runs!
      </Typography>
    </ClaimPlayerContainer>
  );
}

function ClaimPlayerContainer({ children }) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ p: 2, borderRadius: "10px", border: "1px solid #cccccc99", padding: "20px", boxShadow: 1 }}>
        {children}
      </Box>
    </Container>
  );
}

function ClaimPlayerMakeClaim() {
  const [createNewPlayer, setCreateNewPlayer] = useState(null);
  const onGoBack = () => setCreateNewPlayer(null);

  if (createNewPlayer === null) {
    return (
      <ClaimPlayerContainer>
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
      </ClaimPlayerContainer>
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
    <ClaimPlayerContainer>
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
    </ClaimPlayerContainer>
  );
}

function ClaimPlayerClaimExistingPlayer({ onGoBack }) {
  const auth = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <ClaimPlayerContainer>
      <Button variant="outlined" size="large" onClick={onGoBack}>
        Back
      </Button>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h4" gutterBottom>
        Claim Existing Player
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        If you have made submission for the old spreadsheet, you can claim these for your account. Please
        select the player you want to claim below.
      </Typography>
      <PlayerSelect
        type="unclaimed"
        value={selectedPlayer}
        onChange={(e, value) => setSelectedPlayer(value)}
      />
      <Button variant="contained" sx={{ mt: 2 }} fullWidth>
        Claim Player
      </Button>
    </ClaimPlayerContainer>
  );
}

export function PlayerSelect({ type, value, onChange }) {
  const queryFn = type === "all" ? fetchAllPlayers : () => fetchPlayerList(type);
  const query = useQuery({
    queryKey: ["player_list", type],
    queryFn: queryFn,
  });

  const players = query.data?.data ?? [];
  //Sort alphabetically
  players.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Autocomplete
      options={players}
      getOptionLabel={(player) => player.name}
      renderInput={(params) => <TextField {...params} label="Player" variant="outlined" />}
      value={value}
      onChange={onChange}
    />
  );
}
