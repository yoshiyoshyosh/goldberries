import { useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../../components/BasicComponents";
import {
  Autocomplete,
  Button,
  Divider,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  getQueryData,
  useGetAllAccounts,
  useGetAllPlayerClaims,
  useGetAllPlayers,
  usePostAccount,
  usePostPlayer,
} from "../../hooks/useApi";
import { getAccountName } from "../../util/data_util";
import { useEffect, useState } from "react";
import { FormAccountWrapper } from "../../components/forms/Account";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/AuthProvider";

export function PageManageAccounts({}) {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [tabState, setTabState] = useState(tab || "");

  const setTab = (tab) => {
    setTabState(tab);
    if (tab === "accounts") {
      navigate("/manage/accounts", { replace: true });
    } else {
      navigate(`/manage/accounts/${tab}`, { replace: true });
    }
  };

  useEffect(() => {
    if (tabState !== tab) {
      setTabState(tab);
    }
  }, [tab]);

  const activeTab = tabState || "accounts";

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title="Manage Accounts" />
      <Typography variant="h4">Manage Accounts</Typography>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Accounts" value="accounts" />
        <Tab label="Player Claims" value="player-claims" />
        <Tab label="Player Rename" value="player-rename" />
      </Tabs>
      {activeTab === "accounts" && <ManageAccountsTab />}
      {activeTab === "player-claims" && <ManagePlayerClaimsTab />}
      {activeTab === "player-rename" && <ManagePlayerNamesTab />}
    </BasicContainerBox>
  );
}

function ManageAccountsTab() {
  const query = useGetAllAccounts();
  const [account, setAccount] = useState(null);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const onSave = (account) => {
    if (account === null) setAccount(null);
  };

  const accounts = getQueryData(query);
  //sort accounts by id
  accounts.sort((a, b) => a.id - b.id);

  return (
    <>
      <Autocomplete
        options={query.data.data}
        getOptionLabel={(option) => getAccountName(option)}
        onChange={(event, newValue) => setAccount(newValue)}
        renderInput={(params) => <TextField {...params} label="Select an Account" />}
        sx={{ mt: 2 }}
      />
      {account && (
        <>
          <Divider sx={{ my: 2 }} />
          <FormAccountWrapper id={account.id} account={null} onSave={onSave} />
        </>
      )}
    </>
  );
}

function ManagePlayerClaimsTab() {
  const query = useGetAllPlayerClaims();
  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.player_id !== null) {
      toast.success("Claim accepted");
    } else {
      toast.success("Claim rejected");
    }
  });

  const updateClaim = (account, accept) => {
    const data = { ...account };

    if (accept === true) data.player_id = data.claimed_player_id;

    data.claimed_player_id = null;

    postAccount(data);
  };

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={1}>ID</TableCell>
              <TableCell width={1}>Player</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.data.data.map((account) => (
              <TableRow key={account.id}>
                <TableCell width={1}>{account.id}</TableCell>
                <TableCell>{account.claimed_player.name}</TableCell>
                <TableCell width={1}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="nowrap">
                    <Button variant="contained" color="success" onClick={() => updateClaim(account, true)}>
                      Accept
                    </Button>
                    <Button variant="contained" color="error" onClick={() => updateClaim(account, false)}>
                      Reject
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {query.data.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>No player claims</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

function ManagePlayerNamesTab() {
  const auth = useAuth();
  const query = useGetAllPlayers();
  const [player, setPlayer] = useState(null);
  const [newName, setNewName] = useState("");

  const { mutate: renamePlayer } = usePostPlayer(() => {
    toast.success("Player renamed");
    if (auth.user && player.id === auth.user.player_id) {
      auth.checkSession();
    }
    setPlayer({ ...player, name: newName });
  });

  useEffect(() => {
    if (player !== null) {
      setNewName(player.name);
    }
  }, [player]);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const allPlayers = getQueryData(query);

  return (
    <>
      <Autocomplete
        options={allPlayers}
        getOptionLabel={(option) => option.name}
        onChange={(event, newValue) => setPlayer(newValue)}
        renderInput={(params) => <TextField {...params} label="Select a Player" />}
        sx={{ mt: 2 }}
      />
      {player && (
        <>
          <Divider sx={{ my: 2 }} />
          <TextField
            label="New Name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => renamePlayer({ ...player, name: newName })}
            disabled={newName === player.name || newName.trim() === "" || newName.length < 3}
            sx={{ mt: 2 }}
          >
            Rename Player
          </Button>
        </>
      )}
    </>
  );
}
