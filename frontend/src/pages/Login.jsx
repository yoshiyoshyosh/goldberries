import { Link, useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormOptions } from "../util/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faRaspberryPi } from "@fortawesome/free-brands-svg-icons";

import "@mui/material";
import { Alert, Avatar, Box, Button, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import { BasicContainerBox, HeadTitle } from "../components/BasicComponents";
import {
  useForgotPasswordRequest,
  useForgotPasswordVerify,
  useRegister,
  useVerifyEmail,
} from "../hooks/useApi";

export function PageLogin() {
  const auth = useAuth();
  const { redirect } = useParams();
  const form = useForm();
  const onSubmit = form.handleSubmit((data) => {
    auth.loginWithEmail(data.email, data.password, redirect);
  });
  const errors = form.formState.errors;

  if (auth.user) {
    return <AlreadyLoggedInBox title="Login" />;
  }

  return (
    <LoginBox title="Login">
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label="Email Address"
          {...form.register("email", FormOptions.Email)}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label="Password"
          {...form.register("password", FormOptions.Password)}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <Link to="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link to="/register" variant="body2">
              Sign Up
            </Link>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mt: 2, mb: 0 }} flexItem>
        OR
      </Divider>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 1 }}
        onClick={() => auth.loginWithDiscord(redirect)}
        endIcon={<FontAwesomeIcon icon={faDiscord} />}
      >
        Sign in with Discord
      </Button>
    </LoginBox>
  );
}

export function PageRegister() {
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
    return value === form.watch("password") || "Passwords do not match";
  };

  if (auth.user) {
    return <AlreadyLoggedInBox title="Registration" />;
  }
  if (postRegister) {
    return (
      <LoginBox title="Register" titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          Check you inbox (and spam folder!) for the activation email
        </Typography>
      </LoginBox>
    );
  }

  return (
    <LoginBox title="Register">
      {error && (
        <Alert severity="error" sx={{ mt: 2, alignSelf: "stretch" }}>
          {decodeURIComponent(error)}
        </Alert>
      )}
      <Typography variant="body2" textAlign="center">
        Registering via email requires you to verify your email address. Register with Discord to skip this.
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label="Email Address"
          {...form.register("email", FormOptions.Email)}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label="Password"
          {...form.register("password", FormOptions.Password)}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label="Confirm Password"
          {...form.register("confirmPassword", { validate: validateConfirmPassword })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Register
        </Button>
        <Grid container>
          <Grid item>
            <Link to="/login" variant="body2">
              Have an account? Sign In instead!
            </Link>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mt: 2, mb: 0 }} flexItem>
        OR
      </Divider>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 1 }}
        onClick={() => auth.registerWithDiscord()}
        endIcon={<FontAwesomeIcon icon={faDiscord} />}
      >
        Register with Discord
      </Button>
    </LoginBox>
  );
}

export function PageVerifyEmail() {
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
    return <AlreadyLoggedInBox title="Verify Email" />;
  }
  if (postSubmit) {
    return (
      <LoginBox title="Verify Email" titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          Your email has been verified! You can now login to your account.
        </Typography>
        <Link to="/login">Go to the Login</Link>
      </LoginBox>
    );
  }

  return (
    <LoginBox title="Verify Email">
      <Typography variant="body2" textAlign="center">
        Click the button below to verify your email address
      </Typography>
      <Button onClick={onSubmit} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Verify Email
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
    return <AlreadyLoggedInBox title="Forgot Password" />;
  }
  if (postSubmit) {
    return (
      <LoginBox title="Forgot Password" titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          If an account with this email exists, you will receive an email with instructions to reset your
          password! (Check you spam folder too!)
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
          label="Email Address"
          {...form.register("email", FormOptions.Email)}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Send Recovery Email
        </Button>
      </Box>
    </LoginBox>
  );
}

export function PageForgotPasswordVerify({ token }) {
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
    return value === form.watch("password") || "Passwords do not match";
  };

  if (auth.user) {
    return <AlreadyLoggedInBox title="Forgot Password" />;
  }
  if (postSubmit) {
    return (
      <LoginBox title="Recover Password" titleColor="green">
        <Typography variant="body2" color="green" textAlign="center">
          Your password has been reset! You can now login with your new password.
        </Typography>
        <Link to="/login">Go to the Login</Link>
      </LoginBox>
    );
  }

  return (
    <LoginBox title="Recover Password">
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <Typography variant="body2" textAlign="center">
          Enter your new password below
        </Typography>
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label="New Password"
          {...form.register("password", FormOptions.Password)}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          margin="normal"
          type="password"
          fullWidth
          label="Confirm Password"
          {...form.register("confirmPassword", { validate: validateConfirmPassword })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Set New Password
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
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <FontAwesomeIcon icon={faRaspberryPi} />
      </Avatar>
      <Typography component="h1" variant="h5" color={titleColor}>
        {title}
      </Typography>
    </>
  );
}

function AlreadyLoggedInBox({ title }) {
  return (
    <BasicContainerBox maxWidth="xs" sx={{ mt: 8 }}>
      <HeadTitle title={title} />
      <Stack direction="column" justifyContent="center" alignItems="center">
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <FontAwesomeIcon icon={faRaspberryPi} />
        </Avatar>
        <Typography component="h1" variant="h5">
          {title}
        </Typography>
        <Typography variant="body1">You're already logged in, silly</Typography>
      </Stack>
    </BasicContainerBox>
  );
}
