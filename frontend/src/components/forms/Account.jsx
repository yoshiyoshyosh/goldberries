import { useAuth } from "../../hooks/AuthProvider";
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorDisplay, LoadingSpinner } from "../BasicComponents";
import { Controller, set, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { PlayerSelect } from "../GoldberriesComponents";
import { useDeleteAccount, useGetAccount, useGetAllPlayers, usePostAccount } from "../../hooks/useApi";
import { getAccountName } from "../../util/data_util";
import { FormOptions } from "../../util/constants";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ManageUserLinks } from "../../pages/Account";

export function FormAccountWrapper({ account, id, onSave, ...props }) {
  const query = useGetAccount(id, {
    enabled: account === null,
  });
  const playersQuery = useGetAllPlayers();

  if (query.isLoading || query.isFetching || playersQuery.isLoading || playersQuery.isFetching) {
    return (
      <>
        <Typography variant="h6">Account ({id})</Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError || playersQuery.isError) {
    const error = query.error || playersQuery.error;
    return (
      <>
        <Typography variant="h6">Account ({id})</Typography>
        <ErrorDisplay error={error} />
      </>
    );
  }

  return (
    <FormAccount
      account={query.data?.data ?? query.data ?? account}
      allPlayers={playersQuery.data.data}
      onSave={onSave}
      {...props}
    />
  );
}

//This account form is used by team members, not users themselves
export function FormAccount({ account, allPlayers, onSave, ...props }) {
  const auth = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success("Account updated");
    if (onSave) onSave(account);
  });

  const { mutate: deleteAccount } = useDeleteAccount((account) => {
    toast.success("Account deleted");
    if (onSave) onSave(null); //Return null to indicate the account was deleted
  });
  const deleteSelectedAccount = () => {
    deleteAccount(account.id);
  };

  const form = useForm({
    defaultValues: {
      ...account,
      unlink_discord: false,
      reset_session: false,
    },
  });
  const errors = form.formState.errors;
  const onSubmit = form.handleSubmit((data) => {
    postAccount({
      ...data,
      player_id: data.player ? data.player.id : null,
      claimed_player_id: data.claimed_player ? data.claimed_player.id : null,
    });
  });

  useEffect(() => {
    form.reset({
      ...account,
      unlink_discord: false,
      reset_session: false,
    });
    setConfirmDelete(false);
  }, [account]);

  const formAccount = form.watch();

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        Account: {getAccountName(account)}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            control={form.control}
            name="player"
            render={({ field }) => (
              <PlayerSelect type="all" value={field.value} onChange={(e, v) => field.onChange(v)} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            control={form.control}
            name="claimed_player"
            render={({ field }) => (
              <PlayerSelect
                type="all"
                value={field.value}
                onChange={(e, v) => field.onChange(v)}
                label="Claimed Player"
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <TextField
        label="Email"
        {...form.register("email", FormOptions.EmailOptional)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <Controller
        control={form.control}
        name="email_verified"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label="Email Verified"
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <TextField
        label="New Password"
        {...form.register("password", FormOptions.PasswordOptional)}
        fullWidth
      />
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Discord ID"
          {...form.register("discord_id")}
          disabled
          InputLabelProps={{ shrink: true }}
        />
        <Controller
          control={form.control}
          name="unlink_discord"
          render={({ field }) => (
            <FormControlLabel
              onChange={field.onChange}
              label="Unlink Discord"
              checked={field.value}
              disabled={!formAccount.discord_id}
              control={<Checkbox />}
            />
          )}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6">User Links</Typography>
        <FontAwesomeIcon icon={faLink} />
      </Stack>
      <Controller
        control={form.control}
        name="links"
        render={({ field }) => <ManageUserLinks links={field.value} setLinks={field.onChange} />}
      />

      <Divider sx={{ my: 2 }} />

      <Controller
        control={form.control}
        name="is_suspended"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label="Suspended"
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />

      {auth.isAdmin && (
        <>
          <Controller
            control={form.control}
            name="is_verifier"
            render={({ field }) => (
              <FormControlLabel
                onChange={field.onChange}
                label="Is Verifier"
                checked={field.value}
                control={<Checkbox />}
              />
            )}
          />
          <Controller
            control={form.control}
            name="is_admin"
            render={({ field }) => (
              <FormControlLabel
                onChange={field.onChange}
                label="Is Admin"
                checked={field.value}
                control={<Checkbox />}
              />
            )}
          />
        </>
      )}

      {formAccount.is_suspended && (
        <TextField
          label="Suspension Reason"
          {...form.register("suspension_reason", { required: true })}
          fullWidth
          error={!!errors.suspended_reason}
          helperText={errors.suspended_reason?.message}
        />
      )}

      <Controller
        control={form.control}
        name="reset_session"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label="Logout User"
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />

      <Button variant="contained" color="primary" fullWidth onClick={onSubmit}>
        Update Account
      </Button>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Delete Account</Typography>
      <Typography variant="body2" gutterBottom>
        Deleting an account is permanent and cannot be undone. This does <b>not</b> delete the player
        associated with the account.
      </Typography>
      <Stack direction="row" spacing={2}>
        <FormControlLabel
          control={<Checkbox checked={confirmDelete} onChange={(e) => setConfirmDelete(e.target.checked)} />}
          label="Confirm"
        />
        <Button
          startIcon={<FontAwesomeIcon icon={faTrash} />}
          variant="contained"
          color="error"
          onClick={deleteSelectedAccount}
          disabled={!confirmDelete}
        >
          Delete
        </Button>
      </Stack>
    </form>
  );
}
