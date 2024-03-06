import {
  Button,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { BasicContainerBox } from "../components/BasicComponents";
import { useAuth } from "../hooks/AuthProvider";
import { usePostAccount } from "../hooks/useApi";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { PlayerChip } from "../components/GoldberriesComponents";
import { useEffect, useState } from "react";
import { API_URL, FormOptions } from "../util/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckSquare,
  faLink,
  faLinkSlash,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export function PageAccount() {
  return (
    <BasicContainerBox maxWidth="sm">
      <UserAccountForm />
    </BasicContainerBox>
  );
}

export function UserAccountForm() {
  const auth = useAuth();
  const [addEmail, setAddEmail] = useState(false);
  const [addDiscord, setAddDiscord] = useState(false);

  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success("Account updated");
  });

  const form = useForm({
    defaultValues: {
      ...auth.user,
      unlink_discord: false,
      unlink_email: false,
    },
  });
  const errors = form.formState.errors;
  const onSubmit = form.handleSubmit((data) => {
    postAccount({
      ...data,
    });
  });

  useEffect(() => {
    form.reset({
      ...auth.user,
      reset_session: false,
    });
  }, [auth.user]);

  const formAccount = form.watch();
  const hasEmail = auth.user.email !== null;
  const hasDiscord = auth.user.discord_id !== null;
  const canUnlink = hasEmail && hasDiscord;

  return (
    <form>
      <Typography variant="h4" gutterBottom>
        My Account
      </Typography>

      {formAccount.player === null && formAccount.claimed_player === null ? (
        <>
          <Typography>
            You haven't claimed a player yet. Head over to <Link to="/claim-player">this page</Link> to create
            or claim one!
          </Typography>
        </>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>Player: </Typography>
              <PlayerChip player={formAccount.player} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>Claimed Player: </Typography>
              <PlayerChip player={formAccount.claimed_player} />
            </Stack>
          </Grid>
        </Grid>
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="h5">Login Methods</Typography>
      <FormHelperText>Note: One of the login methods must always be active!</FormHelperText>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={canUnlink ? 9 : 12}>
          <Stack direction="column" gap={2}>
            {hasEmail || addEmail ? (
              <>
                <TextField
                  label="Email"
                  {...form.register("email", addEmail ? FormOptions.Email : FormOptions.EmailOptional)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="New Password"
                  type="password"
                  {...form.register(
                    "password",
                    addEmail ? FormOptions.Password : FormOptions.PasswordOptional
                  )}
                  fullWidth
                />
              </>
            ) : (
              <Button
                startIcon={<FontAwesomeIcon icon={faPlus} />}
                variant="contained"
                color="primary"
                onClick={() => setAddEmail(true)}
              >
                Add Email
              </Button>
            )}
          </Stack>
        </Grid>
        {canUnlink && (
          <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<FontAwesomeIcon icon={faLinkSlash} />}
              onClick={() => setAddEmail(false)}
            >
              Unlink
            </Button>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={canUnlink ? 9 : 12} sx={{ display: "flex", alignItems: "center" }}>
          {hasDiscord ? (
            <Typography>
              Discord: <FontAwesomeIcon icon={faCheckSquare} color="green" /> Linked
            </Typography>
          ) : (
            <Link to={API_URL + "/auth/discord_auth.php?link_account=true"}>
              <Button startIcon={<FontAwesomeIcon icon={faLink} />} variant="contained" color="primary">
                Link Discord
              </Button>
            </Link>
          )}
        </Grid>
        {canUnlink && (
          <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<FontAwesomeIcon icon={faLinkSlash} />}
              onClick={() => setAddEmail(false)}
            >
              Unlink
            </Button>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Button variant="contained" color="primary" fullWidth onClick={onSubmit}>
        Update Account
      </Button>
    </form>
  );
}
