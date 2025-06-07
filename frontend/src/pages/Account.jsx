import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  BasicContainerBox,
  CountrySelect,
  CustomIconButton,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import { useAuth } from "../hooks/AuthProvider";
import {
  getQueryData,
  useDeleteOwnAccount,
  useGetShowcaseSubmissions,
  usePostAccount,
  usePostPlayerSelf,
  usePostShowcase,
} from "../hooks/useApi";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import {
  INPUT_METHOD_ICONS,
  InputMethodIcon,
  PlayerChip,
  PlayerSubmissionSelect,
  SubmissionEmbed,
  VerificationStatusChip,
} from "../components/GoldberriesComponents";
import { useEffect, useState } from "react";
import { API_URL, DISCORD_INVITE, FormOptions } from "../util/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowRightArrowLeft,
  faArrowUp,
  faCheckSquare,
  faEdit,
  faEnvelope,
  faLink,
  faLinkSlash,
  faPlus,
  faSave,
  faTrash,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isValidHttpUrl, jsonDateToJsDate } from "../util/util";
import { MuiColorInput } from "mui-color-input";
import { getPlayerNameColorStyle } from "../util/data_util";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { SettingsEntry } from "./AppSettings";
import { Trans, useTranslation } from "react-i18next";
import { CharsCountLabel } from "./Suggestions";

export const NOTIFICATIONS = {
  sub_verified: { key: "sub_verified", flag: 1 },
  chall_personal: { key: "marked_personal", flag: 2 },
  suggestion_verified: { key: "suggestion_created", flag: 4 },
  chall_moved: { key: "challenge_moved", flag: 8 },
  suggestion_accepted: { key: "suggestion_accepted", flag: 16 },
};
export function hasFlag(flags, flag) {
  return (flags & flag) === flag;
}
export function setFlag(flags, flag, value) {
  return value ? flags | flag : flags & ~flag;
}

export function PageAccount() {
  const { t } = useTranslation(undefined, { keyPrefix: "account" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
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

  useEffect(() => {
    if (tab !== selectedTab && selectedTab !== "login-methods") {
      setSelectedTab(tab);
    }
  }, [tab, selectedTab]);

  const claimVerified = auth.user.claimed_player !== null ? null : auth.user.player !== null;

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>

      {auth.user.player === null && auth.user.claimed_player === null ? (
        <>
          <Typography>
            <Trans
              i18nKey="account.no_player_claimed"
              components={{ CustomLink: <StyledLink to="/claim-player" /> }}
            />
          </Typography>
        </>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>{t_g("player", { count: 1 })}: </Typography>
              <PlayerChip player={auth.user.player ?? auth.user.claimed_player} />
              <VerificationStatusChip isVerified={claimVerified} i18keySuffix="claim_prefix" />
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
        <Tab label={t("tabs.login_methods.label")} value="login-methods" />
        <Tab label={t("tabs.notifications.label")} value="notifications" />
        <Tab label={t("tabs.profile.label")} value="profile" />
        <Tab label={t("tabs.showcase.label")} value="showcase" />
        <Tab label={t("tabs.player_rename.label")} value="rename" />
        <Tab label={t("tabs.danger_zone.label")} value="danger-zone" />
      </Tabs>
      {selectedTab === "login-methods" && <UserAccountLoginMethodsForm />}
      {selectedTab === "notifications" && <UserAccountNotificationsForm />}
      {selectedTab === "profile" && <UserAccountProfileForm />}
      {selectedTab === "showcase" && <UserAccountShowcaseForm />}
      {selectedTab === "rename" && <UserAccountRenameForm />}
      {selectedTab === "danger-zone" && <UserAccountDangerZoneForm />}
    </BasicContainerBox>
  );
}

export function UserAccountLoginMethodsForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "account.tabs.login_methods" });
  const { t: t_fa } = useTranslation(undefined, { keyPrefix: "forms.account" });
  const { t: t_l } = useTranslation(undefined, { keyPrefix: "login.login" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });

  const auth = useAuth();
  const [addEmail, setAddEmail] = useState(false);

  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success(t("feedback.updated"));
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
    return value === formAccount.password || t_l("feedback.passwords_not_match");
  };

  return (
    <form>
      <FormHelperText>{t("note")}</FormHelperText>

      <Typography variant="h6" gutterBottom>
        {t("email")}
      </Typography>
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={hasEmail || addEmail ? 9 : 3} style={{ paddingTop: 2 }}>
          <Stack direction="column" gap={2}>
            {hasEmail || addEmail ? (
              <>
                <TextField
                  label={t("email")}
                  {...form.register(
                    "email",
                    addEmail ? FormOptions.Email(t_ff) : FormOptions.EmailOptional(t_ff)
                  )}
                  fullWidth
                />
                <Stack direction="column">
                  <TextField
                    label={hasEmail ? t_fa("new_password") : t("password")}
                    type="password"
                    {...form.register(
                      "password",
                      addEmail ? FormOptions.Password(t_ff) : FormOptions.PasswordOptional(t_ff)
                    )}
                    fullWidth
                    error={!!errors.password}
                  />
                  {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
                </Stack>
                {hasEmail && (
                  <Stack direction="column">
                    <TextField
                      label={t("confirm_password")}
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
                {t("add_email")}
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
              {t(formAccount.unlink_email ? "undo" : "unlink")}
            </Button>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">{t("discord")}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={canUnlink ? 9 : 9} sx={{ display: "flex", alignItems: "center" }}>
          {hasDiscord ? (
            <Typography>
              {t("linked")} <FontAwesomeIcon icon={faCheckSquare} color="green" />
            </Typography>
          ) : (
            <a href={API_URL + "/auth/discord_auth?link_account=true"}>
              <Button
                startIcon={<FontAwesomeIcon icon={faLink} />}
                endIcon={<FontAwesomeIcon icon={faDiscord} />}
                variant="contained"
                color="primary"
              >
                {t("link_discord")}
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
              {t(formAccount.unlink_discord ? "undo" : "unlink")}
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
        {t("button")}
      </Button>
    </form>
  );
}

export function UserAccountNotificationsForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "account.tabs.notifications" });
  const { t: t_lm } = useTranslation(undefined, { keyPrefix: "account.tabs.login_methods" });
  const auth = useAuth();

  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success(t("feedback.updated"));
  }, true);

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      ...auth.user,
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    postAccount({
      ...data,
    });
  });

  const notifications = form.watch("notifications"); //Integer for bitwise flags for all notifications
  const updateNotification = (flag, value) => {
    form.setValue("notifications", setFlag(notifications, flag, value));
  };

  //Sort NOTIFICATIONS by flag value
  const availableNotifications = Object.values(NOTIFICATIONS).sort((a, b) => a.flag - b.flag);

  return (
    <form>
      <FormHelperText>
        <Trans
          i18nKey="account.tabs.notifications.note"
          components={{
            CustomLink1: <StyledExternalLink href={DISCORD_INVITE} />,
            CustomLink2: <StyledLink to="/my-account/login-methods" />,
          }}
        />
      </FormHelperText>

      <Divider sx={{ my: 2 }} />

      {availableNotifications.map((notification) => (
        <SettingsEntry
          note={t(notification.key + ".description")}
          title={t(notification.key + ".label")}
          shiftNote
        >
          <FormControlLabel
            checked={hasFlag(notifications, notification.flag)}
            onChange={(e) => updateNotification(notification.flag, e.target.checked)}
            control={<Switch />}
          />
        </SettingsEntry>
      ))}

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        startIcon={<FontAwesomeIcon icon={faSave} />}
        onClick={onSubmit}
      >
        {t_lm("button")}
      </Button>
    </form>
  );
}

export function UserAccountProfileForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "account.tabs.profile" });
  const { t: t_nc } = useTranslation(undefined, { keyPrefix: "account.tabs.profile.name_color" });
  const { t: t_lm } = useTranslation(undefined, { keyPrefix: "account.tabs.login_methods" });
  const { t: t_im } = useTranslation(undefined, { keyPrefix: "components.input_methods" });
  const { t: t_cs } = useTranslation(undefined, { keyPrefix: "components.country_select" });
  const auth = useAuth();
  const { settings } = useAppSettings();
  const { mutate: postAccount } = usePostAccount((account) => {
    if (account.id === auth.user.id) auth.checkSession();
    toast.success(t("feedback.updated"));
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
      <Typography variant="h6">{t_nc("label")}</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body1">{t_nc("preview")}</Typography>
        <span style={{ fontSize: "1.4rem", ...nameColorStyle }}>
          {auth.user.player?.name ?? t_nc("name_placeholder")}
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
        label={t_nc("use_gradient")}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={5}>
          <Typography variant="body1">{useGradient ? t_nc("start_color") : t_nc("solid_color")}</Typography>
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
                {t_nc("switch")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant="body1">{t_nc("end_color")}</Typography>
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

      <Typography variant="h6">{t("about_me.label")}</Typography>
      <Controller
        name="about_me"
        control={form.control}
        render={({ field }) => (
          <TextField {...field} fullWidth multiline minRows={4} placeholder={t("about_me.placeholder")} />
        )}
      />
      <CharsCountLabel text={formAccount.about_me} maxChars={5000} />

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">{t_im("label", { count: 1 })}</Typography>
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
                  <em>{t_im("not_specified")}</em>
                </MenuItem>
                {Object.keys(INPUT_METHOD_ICONS).map((method) => (
                  <MenuItem value={method}>
                    {t_im(method)}
                    <InputMethodIcon method={method} style={{ marginLeft: "8px" }} />
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">{t_cs("label", { count: 1 })}</Typography>
          <Controller
            name="country"
            control={form.control}
            render={({ field }) => <CountrySelect value={field.value} setValue={field.onChange} fullWidth />}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">{t("custom_links.label")}</Typography>
      <Typography variant="body2">{t("custom_links.note")}</Typography>
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
        {t_lm("button")}
      </Button>
    </form>
  );
}

export function ManageUserLinks({ links, setLinks }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.custom_links" });
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
        {t("add_link")}
      </Button>
      <Stack direction="column" gap={2} sx={{ mt: 2 }}>
        {links !== null &&
          links.map((link, index) => {
            //validate link to be a valid URL
            const error = link.trim() !== "" && isValidHttpUrl(link) === false ? t("invalid_url") : "";
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
                  {t("remove_link")}
                </Button>
              </Stack>
            );
          })}
      </Stack>
    </>
  );
}

export function UserAccountShowcaseForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "account.tabs.showcase" });
  const auth = useAuth();
  const query = useGetShowcaseSubmissions(auth.hasPlayerClaimed ? auth.user.player.id : 0);

  if (!auth.hasPlayerClaimed) {
    return (
      <>
        <Typography variant="body1" gutterBottom color="error.main">
          {t("no_player_claimed")}
        </Typography>
      </>
    );
  }

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const { submissions, type } = getQueryData(query);
  let selectedSubmissions = [];
  if (type === "custom") {
    selectedSubmissions = [...submissions];
  }

  for (let i = selectedSubmissions.length; i < 9; i++) {
    selectedSubmissions.push(null);
  }

  return <UserAccountShowcaseSubForm playerId={auth.user.player.id} submissions={selectedSubmissions} />;
}
function UserAccountShowcaseSubForm({ playerId, submissions }) {
  const { t } = useTranslation(undefined, { keyPrefix: "account.tabs.showcase" });
  const [showcase, setShowcase] = useState(submissions);

  const { mutate: postShowcase } = usePostShowcase(() => {
    toast.success(t("feedback.updated"));
  });

  const onSubmit = () => {
    let submissionIds = showcase.filter((s) => s !== null);
    submissionIds = submissionIds.map((s) => s.id);
    postShowcase(submissionIds);
  };
  const setSubmission = (index, submission) => {
    setShowcase(showcase.map((s, i) => (i === index ? submission : s)));
  };
  const moveUp = (index) => {
    if (index > 0) {
      const newShowcase = [...showcase];
      newShowcase[index] = showcase[index - 1];
      newShowcase[index - 1] = showcase[index];
      setShowcase(newShowcase);
    }
  };
  const moveDown = (index) => {
    if (index < showcase.length - 1) {
      const newShowcase = [...showcase];
      newShowcase[index] = showcase[index + 1];
      newShowcase[index + 1] = showcase[index];
      setShowcase(newShowcase);
    }
  };

  return (
    <>
      <Typography variant="h6">{t("title")}</Typography>
      <Typography variant="body2" gutterBottom>
        {t("note_1")}
      </Typography>
      <Typography variant="body2" color={(t) => t.palette.text.secondary} gutterBottom>
        {t("note_2")}
      </Typography>

      <Stack direction="column" gap={2} sx={{ mt: 2 }}>
        {showcase.map((submission, index) => (
          <Stack direction="row" gap={2} alignItems="center">
            <Typography variant="body1">#{index + 1}</Typography>
            <UserAccountShowcaseEntry
              key={index}
              playerId={playerId}
              submission={submission}
              setSubmission={(s) => setSubmission(index, s)}
              moveUp={index === 0 ? null : () => moveUp(index)}
              moveDown={index === showcase.length - 1 ? null : () => moveDown(index)}
            />
          </Stack>
        ))}
        <Button
          variant="contained"
          color="primary"
          startIcon={<FontAwesomeIcon icon={faSave} />}
          onClick={onSubmit}
        >
          {t("buttons.save")}
        </Button>
      </Stack>
    </>
  );
}
function UserAccountShowcaseEntry({ playerId, submission, setSubmission, moveUp, moveDown }) {
  const { t } = useTranslation(undefined, { keyPrefix: "account.tabs.showcase" });
  const [isAdding, setIsAdding] = useState(false);

  const onSetSubmission = (sub) => {
    setSubmission(sub);
    setIsAdding(false);
  };

  return submission === null ? (
    isAdding ? (
      <PlayerSubmissionSelect playerId={playerId} submission={submission} setSubmission={onSetSubmission} />
    ) : (
      <Button variant="outlined" color="primary" onClick={() => setIsAdding(true)}>
        {t("buttons.add_submission")}
      </Button>
    )
  ) : (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <SubmissionEmbed submission={submission} style={{ width: "100%", maxWidth: "540px" }} />
      </Grid>
      <Grid item xs={12} sm="auto" display="flex" alignItems="center">
        <Stack direction="column" gap={1}>
          <CustomIconButton onClick={() => moveUp()} disabled={moveUp === null}>
            <FontAwesomeIcon icon={faArrowUp} />
          </CustomIconButton>
          <CustomIconButton onClick={() => moveDown()} disabled={moveDown === null}>
            <FontAwesomeIcon icon={faArrowDown} />
          </CustomIconButton>
        </Stack>
      </Grid>
      <Grid item xs={12} sm="auto" display="flex" alignItems="center">
        <Button variant="outlined" color="error" onClick={() => setSubmission(null)}>
          {t("buttons.remove_submission")}
        </Button>
      </Grid>
    </Grid>
  );
}

export function UserAccountRenameForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "account.tabs.player_rename" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const { mutate: renameSelf } = usePostPlayerSelf(() => {
    toast.success(t("feedback.renamed"));
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
    return `${hours}h ${minutes}m`;
  };

  console.log(errors);

  return (
    <>
      {auth.user.player === null && (
        <>
          <Typography variant="body1" gutterBottom>
            {t("no_player_claimed")}
          </Typography>
          <Divider sx={{ my: 2 }} />
        </>
      )}
      <Typography variant="h6">{t("title")}</Typography>
      <Typography variant="body2" gutterBottom>
        {t("description")}
      </Typography>
      {canRename ? (
        <Typography variant="body2" color="green" gutterBottom>
          {t("can_rename")}
        </Typography>
      ) : (
        <Typography variant="body2" color="error" gutterBottom>
          {t("cannot_rename", { time: formatTime(timeUntilRename) })}
        </Typography>
      )}

      <form>
        <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label={t("new_name")}
            fullWidth
            disabled={auth.user.player === null}
            {...form.register("name", FormOptions.PlayerName(t_ff))}
            error={!!errors.name}
            helperText={errors.name?.message}
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
            disabled={auth.user.player === null || !form.formState.isValid || !canRename}
            onClick={onSubmit}
            startIcon={<FontAwesomeIcon icon={faEdit} />}
          >
            {t("button")}
          </Button>
        </Stack>
      </form>
    </>
  );
}

export function UserAccountDangerZoneForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "account.tabs.danger_zone" });
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
        {t("label")}
      </Typography>
      <Typography variant="body2" color="error" gutterBottom>
        {t("description")}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {t("note")}
      </Typography>

      <form>
        <Stack direction="column" spacing={2}>
          <TextField
            label={t("confirm")}
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <Button
            variant="contained"
            color="error"
            disabled={confirmText !== "DELETE"}
            onClick={() => deleteAccount()}
            startIcon={<FontAwesomeIcon icon={faTrash} />}
          >
            {t("button")}
          </Button>
        </Stack>
      </form>
    </>
  );
}
