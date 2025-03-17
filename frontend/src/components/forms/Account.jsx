import { ROLES, useAuth } from "../../hooks/AuthProvider";
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorDisplay, LoadingSpinner } from "../BasicComponents";
import { Controller, set, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { PlayerSelect } from "../GoldberriesComponents";
import {
  getQueryData,
  useDeleteAccount,
  useGetAccount,
  useGetAllPlayers,
  usePostAccount,
} from "../../hooks/useApi";
import { getAccountName } from "../../util/data_util";
import { FormOptions } from "../../util/constants";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faLink, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ManageUserLinks } from "../../pages/Account";
import { useTranslation } from "react-i18next";
import { DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export function FormAccountWrapper({ account, id, onSave, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetAccount(id, {
    enabled: account === null,
  });
  const playersQuery = useGetAllPlayers();

  if (query.isLoading || query.isFetching || playersQuery.isLoading || playersQuery.isFetching) {
    return (
      <>
        <Typography variant="h6">
          {t_g("account", { count: 1 })} ({id})
        </Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError || playersQuery.isError) {
    const error = query.error || playersQuery.error;
    return (
      <>
        <Typography variant="h6">
          {t_g("account", { count: 1 })} ({id})
        </Typography>
        <ErrorDisplay error={error} />
      </>
    );
  }

  const data = getQueryData(query);
  const players = getQueryData(playersQuery);

  return <FormAccount account={data ?? account} allPlayers={players} onSave={onSave} {...props} />;
}

//This account form is used by team members, not users themselves
export function FormAccount({ account, allPlayers, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.account" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success(t("feedback.updated"));
    if (onSave) onSave(account);
  });

  const { mutate: deleteAccount } = useDeleteAccount((account) => {
    toast.success(t("feedback.deleted"));
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
  console.log(formAccount.role);

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        {t_g("account", { count: 1 })}: {getAccountName(account)}
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
                label={t("claimed_player")}
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <TextField
        label={t("new_email")}
        {...form.register("new_email", FormOptions.EmailOptional(t_ff))}
        fullWidth
      />
      <Controller
        control={form.control}
        name="email_verified"
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label={t("email_verified")}
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      <TextField
        label={t("new_password")}
        {...form.register("password", FormOptions.PasswordOptional(t_ff))}
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
              label={t("unlink_discord")}
              checked={field.value}
              disabled={!formAccount.discord_id}
              control={<Checkbox />}
            />
          )}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6">{t("user_links")}</Typography>
        <FontAwesomeIcon icon={faLink} />
      </Stack>
      <Controller
        control={form.control}
        name="links"
        render={({ field }) => <ManageUserLinks links={field.value} setLinks={field.onChange} />}
      />

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6">{t("about_me")}</Typography>
        <FontAwesomeIcon icon={faComment} />
      </Stack>
      <Controller
        name="about_me"
        control={form.control}
        render={({ field }) => (
          <TextField {...field} fullWidth multiline minRows={4} placeholder={t("about_me_placeholder")} />
        )}
      />

      <Controller
        control={form.control}
        name="last_player_rename"
        render={({ field }) => (
          <DateTimePicker
            label={t("last_player_rename")}
            value={field.value ? dayjs(field.value) : null}
            onChange={(value) => {
              field.onChange(value.toISOString());
            }}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
            }}
            sx={{ mt: 2, width: "100%" }}
          />
        )}
      />

      <Divider sx={{ my: 2 }} />

      <Stack direction="column" alignItems="flex-start">
        <FormControl sx={{ minWidth: "200px", mb: 2 }}>
          <InputLabel>{t("role")}</InputLabel>
          <Select
            label={t("role")}
            value={formAccount.role}
            onChange={(e) => form.setValue("role", e.target.value)}
            MenuProps={{ disableScrollLock: true }}
          >
            {getRoleOptions(auth).map((role) => (
              <MenuItem key={role.value} value={role.value} disabled={role.disabled}>
                {role.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Controller
          control={form.control}
          name="is_suspended"
          render={({ field }) => (
            <FormControlLabel
              onChange={field.onChange}
              label={t("suspended")}
              checked={field.value}
              control={<Checkbox />}
            />
          )}
        />

        {formAccount.is_suspended && (
          <TextField
            label={t("suspension_reason")}
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
              label={t("logout_user")}
              checked={field.value}
              control={<Checkbox />}
            />
          )}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Button variant="contained" color="primary" fullWidth onClick={onSubmit}>
        {t("button_update")}
      </Button>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">{t("delete.title")}</Typography>
      <Typography variant="body2" gutterBottom>
        {t("delete.description")}
      </Typography>
      <Stack direction="row" spacing={2}>
        <FormControlLabel
          control={<Checkbox checked={confirmDelete} onChange={(e) => setConfirmDelete(e.target.checked)} />}
          label={t("delete.confirm")}
        />
        <Button
          startIcon={<FontAwesomeIcon icon={faTrash} />}
          variant="contained"
          color="error"
          onClick={deleteSelectedAccount}
          disabled={!confirmDelete}
        >
          {t("delete.button")}
        </Button>
      </Stack>
    </form>
  );
}

function getRoleOptions(auth) {
  //Returns the the roles that the current user can assign as MenuOptions, or as disabled MenuOptions if they cannot assign them

  const isAdmin = auth.hasAdminPriv;

  const roleOptions = [
    { value: ROLES.USER, label: "User", disabled: false },
    { value: ROLES.EX_HELPER, label: "Ex-Helper", disabled: false },
    { value: ROLES.EX_VERIFIER, label: "Ex-Verifier", disabled: !isAdmin },
    { value: ROLES.EX_ADMIN, label: "Ex-Admin", disabled: !isAdmin },
    { value: ROLES.NEWS_WRITER, label: "News Writer", disabled: false },
    { value: ROLES.HELPER, label: "Helper", disabled: false },
    { value: ROLES.VERIFIER, label: "Verifier", disabled: !isAdmin },
    { value: ROLES.ADMIN, label: "Admin", disabled: !isAdmin },
  ];

  return roleOptions;
}
