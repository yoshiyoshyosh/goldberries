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
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { PlayerSelect } from "../GoldberriesComponents";
import { useGetAccount, useGetAllPlayers, usePostAccount } from "../../hooks/useApi";
import { getAccountName } from "../../util/data_util";
import { FormOptions } from "../../util/constants";
import { toast } from "react-toastify";

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

  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success("Account updated");
    if (onSave) onSave(account);
  });

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

      <Divider sx={{ my: 2 }} />

      <Controller
        control={form.control}
        name="reset_session"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label="Log User Out"
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />

      <Divider sx={{ my: 2 }} />

      <Button variant="contained" color="primary" fullWidth onClick={onSubmit}>
        Update Account
      </Button>
    </form>
  );
}
