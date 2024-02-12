import { useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../../components/BasicComponents";
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
import { useGetAllAccounts, useGetAllPlayerClaims, usePostAccount } from "../../hooks/useApi";
import { getAccountName } from "../../util/data_util";
import { useEffect, useState } from "react";
import { FormAccountWrapper } from "../../components/forms/Account";
import { toast } from "react-toastify";

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
      <Typography variant="h4">Manage Accounts</Typography>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Accounts" value="accounts" />
        <Tab label="Player Claims" value="player-claims" />
      </Tabs>
      {activeTab === "accounts" && <ManageAccountsTab />}
      {activeTab === "player-claims" && <ManagePlayerClaimsTab />}
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

  const accounts = query.data.data;
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
          <FormAccountWrapper id={account.id} account={null} />
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
