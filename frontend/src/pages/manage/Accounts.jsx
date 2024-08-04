import { useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../../components/BasicComponents";
import {
  Autocomplete,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
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
  useDeletePlayer,
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
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function PageManageAccounts({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.accounts" });
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
      <HeadTitle title={t("title")} />
      <Typography variant="h4">{t("title")}</Typography>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label={t("tabs.accounts.label")} value="accounts" />
        <Tab label={t("tabs.player_claims.label")} value="player-claims" />
        <Tab label={t("tabs.player_rename.label")} value="player-rename" />
        <Tab label={t("tabs.player_delete.label")} value="player-delete" />
      </Tabs>
      {activeTab === "accounts" && <ManageAccountsTab />}
      {activeTab === "player-claims" && <ManagePlayerClaimsTab />}
      {activeTab === "player-rename" && <ManagePlayerNamesTab />}
      {activeTab === "player-delete" && <ManagePlayerDeleteTab />}
    </BasicContainerBox>
  );
}

function ManageAccountsTab() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.accounts.tabs.accounts" });
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
        renderInput={(params) => <TextField {...params} label={t("select")} />}
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
  const { t } = useTranslation(undefined, { keyPrefix: "manage.accounts.tabs.player_claims" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetAllPlayerClaims();
  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.player_id !== null) {
      toast.success(t("feedback.accepted"));
    } else {
      toast.success(t("feedback.rejected"));
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
              <TableCell width={1}>{t("id")}</TableCell>
              <TableCell width={1}>{t_g("player", { count: 1 })}</TableCell>
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
                      {t("buttons.accept")}
                    </Button>
                    <Button variant="contained" color="error" onClick={() => updateClaim(account, false)}>
                      {t("buttons.reject")}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {query.data.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>{t("no_claims")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

function ManagePlayerNamesTab() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.accounts.tabs.player_rename" });
  const auth = useAuth();
  const query = useGetAllPlayers();
  const [player, setPlayer] = useState(null);

  const { mutate: renamePlayer } = usePostPlayer(() => {
    toast.success(t("feedback.renamed"));
    if (auth.user && player.id === auth.user.player_id) {
      auth.checkSession();
    }
    setPlayer({ ...player, name: newName });
  });

  const form = useForm({
    defaultValues: {
      name: "",
      log_change: true,
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    renamePlayer({ ...player, name: newName, log_change: data.log_change });
  });

  useEffect(() => {
    form.reset({
      name: player ? player.name : "",
      log_change: true,
    });
  }, [player]);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const allPlayers = getQueryData(query);
  const newName = form.watch("name");

  return (
    <>
      <Autocomplete
        options={allPlayers}
        getOptionLabel={(option) => option.name}
        onChange={(event, newValue) => setPlayer(newValue)}
        renderInput={(params) => <TextField {...params} label={t("select")} />}
        sx={{ mt: 2 }}
      />
      {player && (
        <>
          <Divider sx={{ my: 2 }} />
          <Stack direction="column" spacing={2}>
            <TextField
              label={t("new_name")}
              {...form.register("name", { required: true, minLength: 2 })}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
            <Controller
              name="log_change"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  checked={field.value}
                  onChange={field.onChange}
                  control={<Checkbox {...field} />}
                  label={t("log_change")}
                />
              )}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={onSubmit}
              disabled={newName === player.name || newName.trim() === "" || newName.length < 2}
              sx={{ mt: 2 }}
            >
              {t("button")}
            </Button>
          </Stack>
        </>
      )}
    </>
  );
}

function ManagePlayerDeleteTab() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.accounts.tabs.player_delete" });
  const { t: t_pr } = useTranslation(undefined, { keyPrefix: "manage.accounts.tabs.player_rename" });
  const auth = useAuth();
  const query = useGetAllPlayers();
  const [player, setPlayer] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: deletePlayer } = useDeletePlayer(() => {
    toast.success(t("feedback.deleted"));
    if (auth.user && player.id === auth.user.player_id) {
      auth.checkSession();
    }
    setPlayer(null);
  });
  const onSubmit = () => {
    deletePlayer(player.id);
  };

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const allPlayers = getQueryData(query);
  const playerName = player ? "'" + player.name + "'" : "";

  return (
    <>
      <Typography variant="body1" color="error" sx={{ mt: 2 }}>
        {t("note")}
      </Typography>
      <Autocomplete
        options={allPlayers}
        getOptionLabel={(option) => option.name}
        onChange={(event, newValue) => setPlayer(newValue)}
        renderInput={(params) => <TextField {...params} label={t_pr("select")} />}
        sx={{ mt: 2 }}
      />
      {player && (
        <>
          <Divider sx={{ my: 2 }} />
          <Stack direction="column" spacing={2}>
            <FormControlLabel
              checked={confirmDelete}
              onChange={(event) => setConfirmDelete(event.target.checked)}
              control={<Checkbox />}
              color="error"
              label={t("confirm")}
            />
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={onSubmit}
              disabled={!confirmDelete}
              sx={{ mt: 2 }}
            >
              {t("button", { name: playerName })}
            </Button>
          </Stack>
        </>
      )}
    </>
  );
}
