import { Link, useOutletContext, useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormOptions } from "../util/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

import "@mui/material";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { BasicContainerBox } from "../components/BasicComponents";

export function PageLogin() {
  const auth = useAuth();
  const { redirect } = useParams();
  const [sucks, setSucks] = useState(false);
  const form = useForm();
  const onSubmit = form.handleSubmit((data) => {
    console.log(data);
    auth.loginWithEmail(data.email, data.password, redirect);
  });
  const errors = form.formState.errors;

  if (auth.user) {
    return (
      <div>
        <h1>Login</h1>
        <p>You are already logged in.</p>
      </div>
    );
  }

  if (sucks) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: "10px",
            border: "1px solid #cccccc99",
            padding: "20px",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>{/* <LockOutlinedIcon /> */}I</Avatar>
          <Typography component="h1" variant="h5">
            🤷
          </Typography>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    );
  }

  return (
    <BasicContainerBox
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 8,
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>{/* <LockOutlinedIcon /> */}I</Avatar>
      <Typography component="h1" variant="h5">
        Sign in
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
        {/* <FormControlLabel
            control={<Checkbox color="primary" {...form.register("remember")} />}
            label="Remember me"
          /> */}
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <Link onClick={() => setSucks(!sucks)} variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link href="#" variant="body2">
              {"Sign Up"}
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
    </BasicContainerBox>
  );
}

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        idk lmao
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
