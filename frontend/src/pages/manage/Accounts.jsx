import { useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../../components/BasicComponents";
import { Autocomplete, Divider, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useGetAllAccounts } from "../../hooks/useApi";
import { getAccountName } from "../../util/data_util";
import { useState } from "react";
import { FormAccountWrapper } from "../../components/forms/Account";

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
  return <></>;
}
