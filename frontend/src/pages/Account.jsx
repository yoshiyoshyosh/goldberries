import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { BasicContainerBox, HeadTitle, StyledLink } from "../components/BasicComponents";
import { useAuth } from "../hooks/AuthProvider";
import { useDeleteOwnAccount, usePostAccount, usePostPlayerSelf } from "../hooks/useApi";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { InputMethodIcon, PlayerChip, VerificationStatusChip } from "../components/GoldberriesComponents";
import { useEffect, useState } from "react";
import { API_URL, FormOptions } from "../util/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightArrowLeft,
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
import { isValidHttpUrl, jsonDateToJsDate } from "../util/util";
import { MuiColorInput } from "mui-color-input";
import { getPlayerNameColorStyle } from "../util/data_util";
import { useAppSettings } from "../hooks/AppSettingsProvider";

export function PageAccount() {
  const auth = useAuth();
  const { tab } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(tab ?? "login-methods");

  const setTab = (tab) => {
    setSelectedTab(tab);
    if (tab === "login-methods") {
      navigate("/my-account", { replace: true });
    } else {
      navigate(`/my-account/${tab}`, { replace: true });
    }
  };

  const claimVerified = auth.user.claimed_player !== null ? null : auth.user.player !== null;

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title="My Account" />
      <Typography variant="h4" gutterBottom>
        My Account
      </Typography>

      {auth.user.player === null && auth.user.claimed_player === null ? (
        <>
          <Typography>
            You haven't claimed a player yet. Head over to{" "}
            <StyledLink to="/claim-player">this page</StyledLink> to create or claim one!
          </Typography>
        </>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>{auth.user.claimed_player === null ? "Player: " : "Player: "}</Typography>
              <PlayerChip player={auth.user.player ?? auth.user.claimed_player} />
              <VerificationStatusChip isVerified={claimVerified} prefix="Claim: " />
            </Stack>
          </Grid>
        </Grid>
      )}

      <Divider sx={{ my: 2 }} />

      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="Login Methods" value="login-methods" />
        <Tab label="Profile" value="profile" />
        <Tab label="Player Rename" value="rename" />
        <Tab label="Danger Zone" value="danger-zone" />
      </Tabs>
      {selectedTab === "login-methods" && <UserAccountLoginMethodsForm />}
      {selectedTab === "profile" && <UserAccountProfileForm />}
      {selectedTab === "rename" && <UserAccountRenameForm />}
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
            <a href={API_URL + "/auth/discord_auth.php?link_account=true"}>
              <Button
                startIcon={<FontAwesomeIcon icon={faLink} />}
                endIcon={<FontAwesomeIcon icon={faDiscord} />}
                variant="contained"
                color="primary"
              >
                Link Discord
              </Button>
            </a>
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
  const { settings } = useAppSettings();
  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success("Account updated");
  }, true);

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      ...auth.user,
      about_me: auth.user.about_me ?? "",
      name_color_start: auth.user.name_color_start ?? "rgb(0, 0, 0)",
      name_color_end: auth.user.name_color_end ?? "rgb(0, 0, 0)",
    },
  });
  const errors = form.formState.errors;
  const onSubmit = form.handleSubmit((data) => {
    postAccount({
      ...data,
      name_color_start: data.name_color_start === "rgb(0, 0, 0)" ? null : data.name_color_start,
      name_color_end: useGradient
        ? data.name_color_end === "rgb(0, 0, 0)"
          ? null
          : data.name_color_end
        : null,
    });
  });

  useEffect(() => {
    form.reset({
      ...auth.user,
      about_me: auth.user.about_me ?? "",
      name_color_start: auth.user.name_color_start ?? "rgb(0, 0, 0)",
      name_color_end: auth.user.name_color_end ?? "rgb(0, 0, 0)",
    });
  }, [auth.user]);

  const [useGradient, setUseGradient] = useState(auth.user.name_color_end !== null);

  const formAccount = form.watch();

  const switchColors = () => {
    const start = formAccount.name_color_start;
    const end = formAccount.name_color_end;
    form.setValue("name_color_start", end);
    form.setValue("name_color_end", start);
  };

  const nameColorStyle = getPlayerNameColorStyle(
    {
      account: {
        name_color_start:
          formAccount.name_color_start === "rgb(0, 0, 0)" ? null : formAccount.name_color_start,
        name_color_end: useGradient
          ? formAccount.name_color_end === "rgb(0, 0, 0)"
            ? null
            : formAccount.name_color_end
          : null,
      },
    },
    {
      visual: {
        playerNames: {
          showColors: true,
          preferSingleOverGradientColor: false,
          showOutline: settings.visual.playerNames.showOutline,
        },
      },
    }
  );

  return (
    <form>
      <Typography variant="h6">Name Color</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body1">Preview:</Typography>
        <span style={{ fontSize: "1.4rem", ...nameColorStyle }}>
          {auth.user.player?.name ?? "Player Name"}
        </span>
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            checked={useGradient}
            onChange={(e) => setUseGradient(e.target.checked)}
            color="primary"
          />
        }
        label="Use Gradient"
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={5}>
          <Typography variant="body1">{useGradient ? "Start Color" : "Solid Color"}</Typography>
          <Controller
            name="name_color_start"
            control={form.control}
            render={({ field }) => (
              <MuiColorInput
                format="hex"
                isAlphaHidden
                value={field.value}
                onChange={(value, colors) => field.onChange(colors.hex)}
                PopoverProps={{
                  disableScrollLock: true,
                }}
              />
            )}
          />
        </Grid>
        {useGradient && (
          <>
            <Grid item xs={12} sm={2} sx={{ display: "flex", placeItems: "center" }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FontAwesomeIcon icon={faArrowRightArrowLeft} />}
                onClick={switchColors}
              >
                Switch
              </Button>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant="body1">End Color</Typography>
              <Controller
                name="name_color_end"
                control={form.control}
                render={({ field }) => (
                  <MuiColorInput
                    format="hex"
                    isAlphaHidden
                    value={field.value}
                    onChange={(value, colors) => field.onChange(colors.hex)}
                    PopoverProps={{
                      disableScrollLock: true,
                    }}
                  />
                )}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">About Me</Typography>
      <Controller
        name="about_me"
        control={form.control}
        render={({ field }) => <TextField {...field} fullWidth multiline minRows={4} placeholder="Empty" />}
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Input Method</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="input_method"
            control={form.control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                value={field.value}
                onChange={field.onChange}
                SelectProps={{
                  MenuProps: { disableScrollLock: true },
                }}
              >
                <MenuItem value="">
                  <em>Not specified</em>
                </MenuItem>
                <MenuItem value="keyboard">
                  Keyboard
                  <InputMethodIcon method="keyboard" style={{ marginLeft: "8px" }} />
                </MenuItem>
                <MenuItem value="dpad">
                  Controller: D-Pad
                  <InputMethodIcon method="dpad" style={{ marginLeft: "8px" }} />
                </MenuItem>
                <MenuItem value="analog">
                  Controller: Analog
                  <InputMethodIcon method="analog" style={{ marginLeft: "8px" }} />
                </MenuItem>
                <MenuItem value="hybrid">
                  Hybrid
                  <InputMethodIcon method="hybrid" style={{ marginLeft: "8px" }} />
                </MenuItem>
                <MenuItem value="other">
                  Other
                  <InputMethodIcon method="other" style={{ marginLeft: "8px" }} />
                </MenuItem>
              </TextField>
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

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
    setLinks(links === null ? [""] : [...links, ""]);
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

export function UserAccountRenameForm() {
  const auth = useAuth();
  const { mutate: renameSelf } = usePostPlayerSelf(() => {
    toast.success("Rename successful");
    auth.checkSession();
  });

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      name: auth.user.player?.name ?? "",
      log_change: true,
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    renameSelf({ ...auth.user.player, name: data.name, log_change: data.log_change });
  });
  const errors = form.formState.errors;

  useEffect(() => {
    form.reset({
      name: auth.user.player?.name ?? "",
      log_change: true,
    });
  }, [auth.user]);

  const lastRename = auth.user.last_player_rename;
  const canRename =
    lastRename === null ||
    new Date().getTime() - jsonDateToJsDate(lastRename).getTime() > 24 * 60 * 60 * 1000;
  const timeUntilRename =
    lastRename === null
      ? 0
      : 24 * 60 * 60 * 1000 - (new Date().getTime() - jsonDateToJsDate(lastRename).getTime());

  //Format time remaining in this format: hh:mm
  const formatTime = (time) => {
    const hours = Math.floor(time / 60 / 60 / 1000);
    const minutes = Math.floor((time - hours * 60 * 60 * 1000) / 60 / 1000);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {auth.user.player === null && (
        <>
          <Typography variant="body1" gutterBottom>
            You don't have a player claimed yet!
          </Typography>
          <Divider sx={{ my: 2 }} />
        </>
      )}
      <Typography variant="h6">Rename your Player</Typography>
      <Typography variant="body2" gutterBottom>
        Give your player a new name. This can be done once every 24 hours.
      </Typography>
      {canRename ? (
        <Typography variant="body2" color="green" gutterBottom>
          You can rename your player!
        </Typography>
      ) : (
        <Typography variant="body2" color="error" gutterBottom>
          You can rename your player in {formatTime(timeUntilRename)}h.
        </Typography>
      )}

      <form>
        <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="New Name"
            fullWidth
            disabled={auth.user.player === null}
            {...form.register("name", FormOptions.PlayerName)}
          />
          <Controller
            name="log_change"
            control={form.control}
            render={({ field }) => (
              <FormControlLabel
                checked={field.value}
                onChange={field.onChange}
                control={<Checkbox {...field} />}
                label="Log the rename in your player's changelog"
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={auth.user.player === null || !form.formState.isValid || !canRename}
            onClick={onSubmit}
          >
            Rename
          </Button>
        </Stack>
      </form>
    </>
  );
}
