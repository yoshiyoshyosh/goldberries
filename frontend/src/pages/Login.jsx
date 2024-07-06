import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormOptions } from "../util/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faRaspberryPi } from "@fortawesome/free-brands-svg-icons";

import "@mui/material";
import { Alert, Avatar, Box, Button, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import { BasicContainerBox, HeadTitle, StyledLink } from "../components/BasicComponents";
import {
  useForgotPasswordRequest,
  useForgotPasswordVerify,
  useRegister,
  useVerifyEmail,
} from "../hooks/useApi";
import { MemoWebsiteIcon } from "../components/GoldberriesComponents";
import { useTranslation } from "react-i18next";

export function PageLogin() {
  const { t } = useTranslation(undefined, { keyPrefix: "login.login" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const { redirect } = useParams();
  const form = useForm();
  const onSubmit = form.handleSubmit((data) => {
    auth.loginWithEmail(data.email, data.password, redirect);
  });
  const errors = form.formState.errors;

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }

  return (
    <LoginBox title={t("title")}>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label={t("email")}
          {...form.register("email", FormOptions.Email(t_ff))}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t("password")}
          {...form.register("password", FormOptions.Password(t_ff))}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("buttons.sign_in")}
        </Button>
        <Grid container>
          <Grid item xs>
            <StyledLink to="/forgot-password" variant="body2">
              {t("buttons.forgot_password")}
            </StyledLink>
          </Grid>
          <Grid item>
            <StyledLink to="/register" variant="body2">
              {t("buttons.sign_up")}
            </StyledLink>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mt: 2, mb: 0 }} flexItem>
        {t("or")}
      </Divider>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 1 }}
        onClick={() => auth.loginWithDiscord(redirect)}
        endIcon={<FontAwesomeIcon icon={faDiscord} />}
      >
        {t("buttons.discord")}
      </Button>
    </LoginBox>
  );
}

export function PageRegister() {
  const { t } = useTranslation(undefined, { keyPrefix: "login.register" });
  const { t: t_l } = useTranslation(undefined, { keyPrefix: "login.login" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const { error } = useParams();
  const [postRegister, setPostRegister] = useState(false);
  const { mutate: register } = useRegister(() => {
    setPostRegister(true);
  });
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    register({
      email: data.email,
      password: data.password,
    });
  });
  const errors = form.formState.errors;

  const validateConfirmPassword = (value) => {
    return value === form.watch("password") || t_l("feedback.password_not_match");
  };

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }
  if (postRegister) {
    return (
      <LoginBox title={t("title")} titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          {t("success")}
        </Typography>
      </LoginBox>
    );
  }

  return (
    <LoginBox title={t("title")}>
      {error && (
        <Alert severity="error" sx={{ mt: 2, alignSelf: "stretch" }}>
          {decodeURIComponent(error)}
        </Alert>
      )}
      <Typography variant="body2" textAlign="center">
        {t("info")}
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label={t_l("email")}
          {...form.register("email", FormOptions.Email(t_ff))}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t_l("password")}
          {...form.register("password", FormOptions.Password(t_ff))}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t("confirm_password")}
          {...form.register("confirmPassword", { validate: validateConfirmPassword })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("buttons.register")}
        </Button>
        <Grid container>
          <Grid item>
            <StyledLink to="/login" variant="body2">
              {t("buttons.sign_in")}
            </StyledLink>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mt: 2, mb: 0 }} flexItem>
        {t_l("or")}
      </Divider>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 1 }}
        onClick={() => auth.registerWithDiscord()}
        endIcon={<FontAwesomeIcon icon={faDiscord} />}
      >
        {t("buttons.discord")}
      </Button>
    </LoginBox>
  );
}

export function PageVerifyEmail() {
  const { t } = useTranslation(undefined, { keyPrefix: "login.verify_email" });
  const auth = useAuth();
  const { verify } = useParams();
  const [postSubmit, setPostSubmit] = useState(false);
  const { mutate: verifyEmail } = useVerifyEmail(() => {
    setPostSubmit(true);
  });
  const onSubmit = () => {
    verifyEmail(verify);
  };

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }
  if (postSubmit) {
    return (
      <LoginBox title={t("title")} titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          {t("success")}
        </Typography>
        <StyledLink to="/login">{t("to_login")}</StyledLink>
      </LoginBox>
    );
  }

  return (
    <LoginBox title={t("title")}>
      <Typography variant="body2" textAlign="center">
        {t("info")}
      </Typography>
      <Button onClick={onSubmit} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        {t("button")}
      </Button>
    </LoginBox>
  );
}

export function PageForgotPassword() {
  const { token } = useParams();

  if (token) {
    return <PageForgotPasswordVerify token={token} />;
  }

  return <PageForgotPasswordRequest />;
}

export function PageForgotPasswordRequest() {
  const { t } = useTranslation(undefined, { keyPrefix: "login.forgot_password.request" });
  const { t: t_l } = useTranslation(undefined, { keyPrefix: "login.login" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const [postSubmit, setPostSubmit] = useState(false);
  const { mutate: requestPasswordChange } = useForgotPasswordRequest(() => {
    setPostSubmit(true);
  });
  const form = useForm({
    defaultValues: {
      email: "",
    },
  });
  const errors = form.formState.errors;
  const onSubmit = form.handleSubmit((data) => {
    requestPasswordChange(data.email);
  });

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }
  if (postSubmit) {
    return (
      <LoginBox title={t("title")} titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          {t("info")}
        </Typography>
      </LoginBox>
    );
  }

  return (
    <LoginBox title="Forgot Password">
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label={t_l("email")}
          {...form.register("email", FormOptions.Email(t_ff))}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("button")}
        </Button>
      </Box>
    </LoginBox>
  );
}

export function PageForgotPasswordVerify({ token }) {
  const { t } = useTranslation(undefined, { keyPrefix: "login.forgot_password.verify" });
  const { t: t_l } = useTranslation(undefined, { keyPrefix: "login.login" });
  const { t: t_r } = useTranslation(undefined, { keyPrefix: "login.register" });
  const { t: t_ve } = useTranslation(undefined, { keyPrefix: "login.verify_email" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const [postSubmit, setPostSubmit] = useState(false);
  const { mutate: changePassword } = useForgotPasswordVerify(() => {
    setPostSubmit(true);
  });
  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: token,
    },
  });
  const errors = form.formState.errors;
  const onSubmit = form.handleSubmit((data) => {
    changePassword({ token, password: data.password });
  });

  const validateConfirmPassword = (value) => {
    return value === form.watch("password") || t_l("feedback.password_not_match");
  };

  if (auth.user) {
    return <AlreadyLoggedInBox title={t("title")} />;
  }
  if (postSubmit) {
    return (
      <LoginBox title={t("title")} titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          {t("success")}
        </Typography>
        <StyledLink to="/login">{t_ve("to_login")}</StyledLink>
      </LoginBox>
    );
  }

  return (
    <LoginBox title={t("title")}>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <Typography variant="body2" textAlign="center">
          {t("info")}
        </Typography>
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t("new_password")}
          {...form.register("password", FormOptions.Password(t_ff))}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label={t_r("confirm_password")}
          {...form.register("confirmPassword", { validate: validateConfirmPassword })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("button")}
        </Button>
      </Box>
    </LoginBox>
  );
}

function LoginBox({ children, title, titleColor }) {
  return (
    <BasicContainerBox maxWidth="xs" sx={{ mt: 8 }}>
      <HeadTitle title={title} />
      <Stack direction="column" justifyContent="center" alignItems="center">
        <LoginHeader title={title} titleColor={titleColor} />
        {children}
      </Stack>
    </BasicContainerBox>
  );
}
function LoginHeader({ title, titleColor }) {
  return (
    <>
      <MemoWebsiteIcon preventFunny height="3em" style={{ marginBottom: "4px" }} />
      <Typography component="h1" variant="h5" color={titleColor}>
        {title}
      </Typography>
    </>
  );
}

function AlreadyLoggedInBox({ title }) {
  const { t } = useTranslation(undefined, { keyPrefix: "login" });
  return (
    <BasicContainerBox maxWidth="xs" sx={{ mt: 8 }}>
      <HeadTitle title={title} />
      <Stack direction="column" justifyContent="center" alignItems="center">
        <MemoWebsiteIcon preventFunny height="3em" style={{ marginBottom: "4px" }} />
        <Typography component="h1" variant="h5">
          {title}
        </Typography>
        <Typography variant="body1">{t("already_logged_in")}</Typography>
      </Stack>
    </BasicContainerBox>
  );
}
