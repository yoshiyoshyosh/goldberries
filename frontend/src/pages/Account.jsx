import {
  Button,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { BasicContainerBox } from "../components/BasicComponents";
import { useAuth } from "../hooks/AuthProvider";
import { useDeleteOwnAccount, usePostAccount } from "../hooks/useApi";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { PlayerChip, VerificationStatusChip } from "../components/GoldberriesComponents";
import { useEffect, useState } from "react";
import { API_URL, FormOptions } from "../util/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckSquare,
  faEnvelope,
  faLink,
  faLinkSlash,
  faPlus,
  faSave,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isValidHttpUrl } from "../util/util";

export function PageAccount() {
  const auth = useAuth();
  const { tab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab ?? "login-methods");

  return (
    <BasicContainerBox maxWidth="md">
      <Typography variant="h4" gutterBottom>
        My Account
      </Typography>

      {auth.user.player === null && auth.user.claimed_player === null ? (
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
              <Typography>{auth.user.claimed_player === null ? "Player: " : "Player: "}</Typography>
              <PlayerChip player={auth.user.player ?? auth.user.claimed_player} />
              <VerificationStatusChip isVerified={auth.user.player !== null} prefix="Claim: " />
            </Stack>
          </Grid>
        </Grid>
      )}

      <Divider sx={{ my: 2 }} />

      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="Login Methods" value="login-methods" />
        <Tab label="Profile" value="profile" />
        <Tab label="Danger Zone" value="danger-zone" />
      </Tabs>
      {selectedTab === "login-methods" && <UserAccountLoginMethodsForm />}
      {selectedTab === "profile" && <UserAccountProfileForm />}
      {selectedTab === "danger-zone" && <UserAccountDangerZoneForm />}
    </BasicContainerBox>
  );
}

export function UserAccountLoginMethodsForm() {
  const auth = useAuth();
  const [addEmail, setAddEmail] = useState(false);

  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success("Account updated");
  }, true);

  const form = useForm({
    mode: "onBlur",
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
      unlink_discord: false,
      unlink_email: false,
    });
  }, [auth.user]);

  const formAccount = form.watch();
  const hasEmail = auth.user.email !== null;
  const hasDiscord = auth.user.discord_id !== null;
  const canUnlink = hasEmail && hasDiscord;

  const validateConfirmPassword = (value) => {
    if (!formAccount.password) return true;
    return value === formAccount.password || "Passwords do not match";
  };

  return (
    <form>
      <FormHelperText>Note: One of the login methods must always be active!</FormHelperText>

      <Typography variant="h6">Email</Typography>
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={hasEmail || addEmail ? 9 : 3} style={{ paddingTop: 2 }}>
          <Stack direction="column" gap={2}>
            {hasEmail || addEmail ? (
              <>
                <TextField
                  label="Email"
                  {...form.register("email", addEmail ? FormOptions.Email : FormOptions.EmailOptional)}
                  fullWidth
                />
                <Stack direction="column">
                  <TextField
                    label={hasEmail ? "New Password" : "Password"}
                    type="password"
                    {...form.register(
                      "password",
                      addEmail ? FormOptions.Password : FormOptions.PasswordOptional
                    )}
                    fullWidth
                    error={!!errors.password}
                  />
                  {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
                </Stack>
                {hasEmail && (
                  <Stack direction="column">
                    <TextField
                      label="Confirm Password"
                      type="password"
                      {...form.register("password_confirm", {
                        validate: validateConfirmPassword,
                      })}
                      fullWidth
                      error={!!errors.password_confirm}
                    />
                    {errors.password_confirm && (
                      <FormHelperText error>{errors.password_confirm.message}</FormHelperText>
                    )}
                  </Stack>
                )}
              </>
            ) : (
              <Button
                startIcon={<FontAwesomeIcon icon={faPlus} />}
                endIcon={<FontAwesomeIcon icon={faEnvelope} />}
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
              color={formAccount.unlink_email ? "success" : "error"}
              startIcon={<FontAwesomeIcon icon={formAccount.unlink_email ? faUndo : faLinkSlash} />}
              onClick={() => form.setValue("unlink_email", !formAccount.unlink_email)}
              disabled={formAccount.unlink_discord}
            >
              {formAccount.unlink_email ? "Undo" : "Unlink"}
            </Button>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Discord</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={canUnlink ? 9 : 9} sx={{ display: "flex", alignItems: "center" }}>
          {hasDiscord ? (
            <Typography>
              Linked <FontAwesomeIcon icon={faCheckSquare} color="green" />
            </Typography>
          ) : (
            <Link to={API_URL + "/auth/discord_auth.php?link_account=true"}>
              <Button
                startIcon={<FontAwesomeIcon icon={faLink} />}
                endIcon={<FontAwesomeIcon icon={faDiscord} />}
                variant="contained"
                color="primary"
              >
                Link Discord
              </Button>
            </Link>
          )}
        </Grid>
        {canUnlink && (
          <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Button
              variant="outlined"
              color={formAccount.unlink_discord ? "success" : "error"}
              startIcon={<FontAwesomeIcon icon={formAccount.unlink_discord ? faUndo : faLinkSlash} />}
              onClick={() => form.setValue("unlink_discord", !formAccount.unlink_discord)}
              disabled={formAccount.unlink_email}
            >
              {formAccount.unlink_discord ? "Undo" : "Unlink"}
            </Button>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        startIcon={<FontAwesomeIcon icon={faSave} />}
        onClick={onSubmit}
        disabled={Object.keys(errors).length > 0}
      >
        Save Changes
      </Button>
    </form>
  );
}

export function UserAccountProfileForm() {
  const auth = useAuth();
  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success("Account updated");
  }, true);

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      ...auth.user,
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
    });
  }, [auth.user]);

  const formAccount = form.watch();

  const addLink = () => {
    if (formAccount.links === null) form.setValue("links", [""]);
    else form.setValue("links", [...formAccount.links, ""]);
  };
  const deleteLink = (index) => {
    form.setValue(
      "links",
      formAccount.links.filter((_, i) => i !== index)
    );
  };

  return (
    <form>
      <Typography variant="h6">Custom Links</Typography>
      <Typography variant="body2">
        You can add custom links to your profile. This can be a link to your speedrun.com profile, a link to
        your YouTube channel, or any other link you want to share with the community.
      </Typography>
      <Controller
        name="links"
        control={form.control}
        render={({ field }) => <ManageUserLinks links={field.value} setLinks={field.onChange} />}
      />

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        startIcon={<FontAwesomeIcon icon={faSave} />}
        onClick={onSubmit}
        disabled={Object.keys(errors).length > 0}
      >
        Save Changes
      </Button>
    </form>
  );
}

export function ManageUserLinks({ links, setLinks }) {
  const deleteLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };
  const addLink = () => {
    setLinks([...links, ""]);
  };
  const changeLink = (index, value) => {
    setLinks(links.map((link, i) => (i === index ? value : link)));
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<FontAwesomeIcon icon={faLink} />}
        onClick={addLink}
        sx={{ mt: 2 }}
      >
        Add Link
      </Button>
      <Stack direction="column" gap={2} sx={{ mt: 2 }}>
        {links !== null &&
          links.map((link, index) => {
            //validate link to be a valid URL
            const error = link.trim() !== "" && isValidHttpUrl(link) === false ? "Invalid URL" : "";
            return (
              <Stack direction="row" spacing={2} key={index}>
                <TextField
                  key={index}
                  label={`Link ${index + 1}`}
                  value={link}
                  onChange={(e) => changeLink(index, e.target.value)}
                  fullWidth
                  error={!!error}
                  helperText={error}
                />
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<FontAwesomeIcon icon={faLinkSlash} />}
                  onClick={() => deleteLink(index)}
                >
                  Remove
                </Button>
              </Stack>
            );
          })}
      </Stack>
    </>
  );
}

export function UserAccountDangerZoneForm() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { mutate: deleteAccount } = useDeleteOwnAccount(() => {
    auth.checkSession();
    navigate("/");
  });

  const [confirmText, setConfirmText] = useState("");

  return (
    <>
      <Typography variant="h6" color="error">
        Danger Zone
      </Typography>
      <Typography variant="body2" color="error" gutterBottom>
        Permanently delete your account.
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Please note that this does not delete your associated player! Any submissions will remain unchanged,
        and your 'player' will become unclaimed again. If you want to remove your name from this website or
        mass delete your own submissions, contact a team member!
      </Typography>

      <form>
        <Stack direction="column" spacing={2}>
          <TextField
            label="Type 'DELETE' to confirm"
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <Button
            variant="contained"
            color="error"
            disabled={confirmText !== "DELETE"}
            onClick={() => deleteAccount()}
          >
            Delete Account
          </Button>
        </Stack>
      </form>
    </>
  );
}
