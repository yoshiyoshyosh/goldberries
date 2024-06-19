import "./App.css";
import { Outlet } from "react-router";
import { createBrowserRouter, Link, RouterProvider, Navigate, useLocation } from "react-router-dom";
import { PageIndex } from "./pages/Index";

import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageForgotPassword, PageLogin, PageRegister, PageVerifyEmail } from "./pages/Login";
import { AuthProvider, useAuth } from "./hooks/AuthProvider";
import axios from "axios";
import { API_URL, APP_URL } from "./util/constants";
import { PageLogs } from "./pages/manage/Logs";
import { PagePostOAuthLogin } from "./pages/PostOAuthLogin";
import { Page403, Page404, PageNoPlayerClaimed } from "./pages/ErrorPages";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  AppBar,
  Box,
  Button,
  Collapse,
  CssBaseline,
  Dialog,
  DialogContent,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Modal,
  Stack,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faBan,
  faBars,
  faBook,
  faBullseye,
  faBurger,
  faCheckToSlot,
  faChevronDown,
  faChevronLeft,
  faCog,
  faCogs,
  faEdit,
  faEye,
  faHammer,
  faHeart,
  faHome,
  faInbox,
  faList,
  faMailBulk,
  faMailForward,
  faMoon,
  faOtter,
  faPerson,
  faPlayCircle,
  faPlus,
  faPoll,
  faRegistered,
  faSearch,
  faSignIn,
  faSignOut,
  faSquarePollHorizontal,
  faSun,
  faTooth,
  faUser,
  faUserAlt,
  faUserEdit,
  faUserNinja,
  faWeight,
  faWeightHanging,
} from "@fortawesome/free-solid-svg-icons";
import { createRef, useEffect, useState } from "react";
import { faBlackberry } from "@fortawesome/free-brands-svg-icons";
import { PageGoldenList } from "./pages/GoldenList";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import PopupState, { bindHover, bindMenu } from "material-ui-popup-state";
import { PageSubmit } from "./pages/Submit";
import { PageSubmission } from "./pages/Submission";
import { PageChallenge } from "./pages/Challenge";
import { PageMap } from "./pages/Map";
import { PageClaimPlayer } from "./pages/ClaimPlayer";
import { PageTopGoldenList } from "./pages/TopGoldenList";
import { PageSubmissionQueue } from "./pages/manage/SubmissionQueue";
import { PageManageChallenges } from "./pages/manage/Challenges";
import { PageManageAccounts } from "./pages/manage/Accounts";
import { useGetOverallStats } from "./hooks/useApi";
import { PagePlayer } from "./pages/Player";
import { PageCampaign } from "./pages/Campaign";
import { PageAccount } from "./pages/Account";
import { PageSearch } from "./pages/Search";
import { PageRejectedMaps } from "./pages/RejectedMaps";
import { getPlayerNameColorStyle } from "./util/data_util";
import { AppSettingsProvider, useAppSettings } from "./hooks/AppSettingsProvider";
import { PageAppSettings } from "./pages/AppSettings";
import { PageSuggestions } from "./pages/Suggestions";
import {
  CampaignIcon,
  JournalIcon,
  MemoWebsiteIcon,
  ObjectiveIcon,
  WebsiteIcon,
} from "./components/GoldberriesComponents";
import { PageMonthlyRecap } from "./pages/Stats";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const router = createBrowserRouter([
  {
    element: (
      <ThemeWrapper>
        <AuthWrapper>
          <Layout />
        </AuthWrapper>
      </ThemeWrapper>
    ),
    children: [
      { index: true, element: <PageIndex /> },
      {
        path: "manage",
        children: [
          {
            path: "logs",
            element: (
              <ProtectedRoute needsVerifier redirect="manage/logs">
                <PageLogs />
              </ProtectedRoute>
            ),
          },
          {
            path: "submission-queue/:submission?",
            element: (
              <ProtectedRoute redirect="manage/submission-queue">
                <PageSubmissionQueue />
              </ProtectedRoute>
            ),
          },
          {
            path: "challenges",
            element: (
              <ProtectedRoute needsVerifier redirect="manage/challenges">
                <PageManageChallenges />
              </ProtectedRoute>
            ),
          },
          {
            path: "accounts/:tab?",
            element: (
              <ProtectedRoute needsVerifier redirect="manage/accounts">
                <PageManageAccounts />
              </ProtectedRoute>
            ),
          },
        ],
      },

      { path: "login/:redirect?", element: <PageLogin /> },
      { path: "register/:error?", element: <PageRegister /> },
      { path: "verify-email/:verify", element: <PageVerifyEmail /> },
      { path: "forgot-password/:token?", element: <PageForgotPassword /> },
      { path: "post-oauth/:redirect?", element: <PagePostOAuthLogin /> },

      {
        path: "my-account/:tab?",
        element: (
          <ProtectedRoute redirect="my-account">
            <PageAccount />
          </ProtectedRoute>
        ),
      },
      {
        path: "claim-player",
        element: (
          <ProtectedRoute redirect="claim-player">
            <PageClaimPlayer />
          </ProtectedRoute>
        ),
      },
      {
        path: "submit/:tab?/:challengeId?",
        element: (
          <ProtectedRoute needsPlayerClaimed redirect="submit">
            <PageSubmit />
          </ProtectedRoute>
        ),
      },

      { path: "top-golden-list/:type?/:id?", element: <PageTopGoldenList /> },
      { path: "campaign-list/:type?", element: <PageGoldenList /> },

      { path: "rejected-maps", element: <PageRejectedMaps /> },

      { path: "player/:id/:tab?", element: <PagePlayer /> },
      { path: "submission/:id", element: <PageSubmission /> },
      { path: "challenge/:id", element: <PageChallenge /> },
      { path: "map/:id", element: <PageMap /> },
      { path: "campaign/:id/:tab?", element: <PageCampaign /> },

      { path: "search/:q?", element: <PageSearch /> },
      { path: "suggestions/:id?", element: <PageSuggestions /> },
      { path: "monthly-recap/:month?", element: <PageMonthlyRecap /> },

      { path: "settings/:tab?", element: <PageAppSettings /> },

      //Catch all
      { path: "*", element: <Page404 /> },
    ],
  },
]);

export const lightTheme = createTheme({
  // typography: {
  //   fontFamily: [
  //     // "Renogare",
  //     "Roboto",
  //     "Arial",
  //     "Droid Sans",
  //     "Helvetica Neue",
  //     "sans-serif",
  //   ].join(","),
  // },
  palette: {
    mode: "light",
    contrastThreshold: 4.5,
    links: {
      main: "#1e90ff",
    },
    background: {
      other: "rgba(255,255,255,0.75)",
      lightShade: "rgba(0,0,0,10%)",
    },
    tableDivider: "#949494",
    tableDividerStrong: "#949494",
    box: {
      border: "#cccccc99",
      hover: "#f0f0f0",
    },
    infoBox: "rgba(215, 215, 215, 0.77)",
    errorBackground: "rgba(255,215,215,0.75)",
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.75)",
          borderRadius: "10px",
        },
      },
    },
  },
});
const darkTheme = createTheme({
  // typography: {
  //   fontFamily: [
  //     // '"Renogare"',
  //     '"Roboto"',
  //     '"Helvetica"',
  //     '"Arial"',
  //     "sans-serif",
  //   ].join(","),
  // },
  palette: {
    mode: "dark",
    links: {
      main: "#1e90ff",
    },
    background: {
      other: "rgba(0,0,0,0.5)",
      lightShade: "rgba(255,255,255,10%)",
    },
    tableDivider: "#515151",
    tableDividerStrong: "#515151",
    box: {
      border: "#cccccc99",
      hover: "#333",
    },
    infoBox: "rgba(40, 40, 40, 0.77)",
    errorBackground: "rgba(40,0,0,0.5)",
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          background: "rgba(0,0,0,0.5)",
          borderRadius: "10px",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          // background: "none",
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          background: "rgba(0,0,0,0)",
          // background: "#121212",
        },
      },
    },
  },
});

export default function App() {
  return (
    <AppSettingsProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}></RouterProvider>
        <ToastContainer position="bottom-right" closeOnClick />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppSettingsProvider>
  );
}

export function ThemeWrapper({ children }) {
  const { settings } = useAppSettings();
  return (
    <ThemeProvider theme={settings.visual.darkmode ? darkTheme : lightTheme}>
      {children}
      <CssBaseline />
    </ThemeProvider>
  );
}
export function AuthWrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function ProtectedRoute({ needsPlayerClaimed, needsVerifier, needsAdmin, redirect, children }) {
  const auth = useAuth();
  if (auth.user === null) {
    return <Navigate to={"/login/" + encodeURIComponent(redirect)} />;
  }
  if (needsPlayerClaimed && auth.user.player === null) {
    return <PageNoPlayerClaimed />;
  }
  if (needsVerifier && !auth.isVerifier && !auth.isAdmin) {
    return <Page403 message="Only verifiers can access this page!" />;
  }
  if (needsAdmin && !auth.isAdmin) {
    return <Page403 message="Only admins can access this page!" />;
  }
  return children;
}

export function Layout() {
  const { settings } = useAppSettings();
  const darkmode = settings.visual.darkmode;
  const auth = useAuth();
  const location = useLocation();

  const searchOpenRef = createRef();
  const settingsOpenRef = createRef();

  const drawerWidth = 260;
  const menus = {
    home: {
      name: "Home",
      path: "/",
      icon: <FontAwesomeIcon icon={faHome} />,
    },
    lists: {
      name: "Top Golden List",
      path: "/top-golden-list",
      icon: (
        <ObjectiveIcon
          objective={{
            name: "Top Golden List",
            description: "Top Golden List",
            icon_url: "/icons/goldenberry-8x.png",
          }}
        />
      ),
    },
    campaigns: {
      name: "Campaigns",
      items: [
        {
          name: "Campaign List",
          path: "/campaign-list",
          icon: <JournalIcon height="1.3em" />,
        },
        {
          name: "Rejected Maps",
          path: "/rejected-maps",
          icon: <FontAwesomeIcon icon={faBan} />,
        },
        { divider: true },
        {
          name: "Strawberry Jam",
          path: "/campaign/935",
          icon: <CampaignIcon campaign={{ name: "Strawberry Jam", icon_url: "/icons/campaigns/sj.png" }} />,
        },
        {
          name: "Celeste 2021 Winter Collab",
          path: "/campaign/778",
          icon: (
            <CampaignIcon
              campaign={{
                name: "Celeste 2021 Winter Collab",
                icon_url: "/icons/campaigns/winter-collab-21.png",
              }}
            />
          ),
        },
        {
          name: "Monika's D-Sides",
          path: "/campaign/238",
          icon: (
            <CampaignIcon
              campaign={{ name: "Monika's D-Sides", icon_url: "/icons/campaigns/d-sides-monika.png" }}
            />
          ),
        },
        { name: "Lunar Ruins", path: "/campaign/869", icon: <JournalIcon height="1.3em" /> },
      ],
    },
    otherChallenges: {
      name: "Other Challenges",
      items: [
        { name: "Full Game Runs", path: "/full-game", icon: <FontAwesomeIcon icon={faHome} /> },
        { name: "Archieved List", path: "/archieve", icon: <FontAwesomeIcon icon={faHome} /> },
      ],
    },
    user: {
      name: auth.hasPlayerClaimed ? auth.user.player.name : "My Account",
      icon: <FontAwesomeIcon icon={faUser} />,
      items: [
        { name: "Claim A Player", path: "/claim-player", icon: <FontAwesomeIcon icon={faPlayCircle} /> },
        {
          name: "My Player Page",
          path: auth.hasPlayerClaimed ? "/player/" + auth.user.player.id : "/claim-player",
          icon: <FontAwesomeIcon icon={faUserAlt} />,
        },
        {
          name: "My Top Goldens",
          path: auth.hasPlayerClaimed
            ? "/player/" + auth.user.player.id + "/top-golden-list"
            : "/claim-player",
          icon: (
            <ObjectiveIcon
              objective={{
                name: "Personal Golden List",
                description: "Personal Golden List",
                icon_url: "/icons/goldenberry-8x.png",
              }}
            />
          ),
        },
        { name: "My Account", path: "/my-account", icon: <FontAwesomeIcon icon={faCog} /> },
        { divider: true },
        {
          name: "Logout",
          action: () => {
            auth.logout();
          },
          icon: <FontAwesomeIcon icon={faSignOut} />,
        },
      ],
    },
    submit: {
      name: "Submit",
      path: "/submit",
    },
    notUser: {
      name: "Login",
      path: "/login",
      icon: <FontAwesomeIcon icon={faSignIn} />,
    },
    verifier: {
      name: "Internal",
      items: [
        { name: "Logs", path: "/manage/logs", icon: <FontAwesomeIcon icon={faInbox} /> },
        {
          name: "Submission Queue",
          path: "/manage/submission-queue",
          icon: <FontAwesomeIcon icon={faMailBulk} />,
        },
        {
          name: "Manage Challenges",
          path: "/manage/challenges",
          icon: <FontAwesomeIcon icon={faEdit} />,
        },
        {
          name: "Manage Accounts",
          path: "/manage/accounts",
          icon: <FontAwesomeIcon icon={faUserEdit} />,
        },
      ],
    },
    admin: {
      icon: <FontAwesomeIcon icon={faHammer} />,
      name: "Admin",
      items: [{ name: "Admin Stuff", path: "/admin-panel", icon: <FontAwesomeIcon icon={faHammer} /> }],
    },
    search: {
      name: "Search",
      action: () => {
        console.log("Clicked search");
        searchOpenRef.current(true);
      },
      icon: <FontAwesomeIcon icon={faSearch} />,
    },
    other: {
      name: "Other",
      items: [
        {
          name: "Suggestion Box",
          path: "/suggestions",
          icon: <FontAwesomeIcon icon={faCheckToSlot} />,
        },
        {
          name: "Monthly Recap",
          path: "/monthly-recap",
          icon: <FontAwesomeIcon icon={faSquarePollHorizontal} />,
        },
      ],
    },
    suggestions: {},
  };

  if (auth.hasPlayerClaimed === true) {
    menus.user.items = menus.user.items.filter((item) => item.name !== "Claim A Player");
  } else {
    menus.user.items = menus.user.items.filter((item) => item.name !== "My Player Page");
    menus.user.items = menus.user.items.filter((item) => item.name !== "My Top Goldens");
  }

  const leftMenu = [menus.lists, menus.campaigns, menus.other];
  const rightMenu = [];
  if (auth.isVerifier) {
    leftMenu.push(menus.verifier);
  }
  rightMenu.push(menus.submit);
  rightMenu.push(menus.search);
  const userMenu = auth.isLoggedIn ? menus.user : menus.notUser;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  let background = "rgba(0,0,0,0)";
  const backgroundSettings = settings.visual.background;
  if (!darkmode) {
    if (backgroundSettings.lightCustom !== "") {
      background = 'white url("' + backgroundSettings.lightCustom + '") 0 0 / cover no-repeat';
    } else if (backgroundSettings.light !== "") {
      background = 'white url("/img/' + backgroundSettings.light + '") 0 0 / cover no-repeat';
      // background = "white url(/img/" + general.backgroundLight + ") 0 0 / 100% 100% no-repeat";
    }
  } else {
    if (backgroundSettings.darkCustom !== "") {
      background = 'black url("' + backgroundSettings.darkCustom + '") 0 0 / cover no-repeat';
    } else if (backgroundSettings.dark !== "") {
      background = 'black url("/img/' + backgroundSettings.dark + '") 0 0 / cover no-repeat';
      // background = "black url(/img/" + general.backgroundDark + ") 0 0 / 100% 100% no-repeat";
    }
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          zIndex: -1,

          width: "100vw",
          height: "100vh",
          scrollbarGutter: "stable",

          background: background,
          filter: "blur(" + backgroundSettings.blur + "px) " + (darkmode ? "brightness(0.35)" : ""),
          transform: "scale(1.03)",
        }}
      ></div>
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          minHeight: "100vh",
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            display: { xs: "block", md: "none" },
            bgcolor: "#3e3e3e",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <FontAwesomeIcon icon={faBars} />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              <Stack direction="row" gap={0.5} alignItems="center">
                <WebsiteIcon />
                <span>goldberries.net</span>
              </Stack>
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, display: { xs: "block", md: "none" } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
            }}
          >
            <MobileDrawer leftMenu={leftMenu} rightMenu={rightMenu} userMenu={userMenu} />
          </Drawer>
        </Box>
        <DesktopNav
          leftMenu={leftMenu}
          rightMenu={rightMenu}
          userMenu={userMenu}
          settingsOpenRef={settingsOpenRef}
        />
        <Box
          component="main"
          sx={{
            mt: {
              xs: 8,
              md: "65px",
            },
            mb: 3,
            flexGrow: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <ModalContainer searchOpenRef={searchOpenRef} settingsOpenRef={settingsOpenRef} />
    </>
  );
}

function ModalContainer({ searchOpenRef, settingsOpenRef }) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  searchOpenRef.current = setSearchOpen;
  settingsOpenRef.current = setSettingsOpen;

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

function MobileDrawer({ leftMenu, rightMenu, userMenu }) {
  const auth = useAuth();
  const { settings } = useAppSettings();
  const nameStyle = getPlayerNameColorStyle(auth.user?.player, settings);

  return (
    <div>
      <Toolbar>
        <Typography variant="h5" noWrap letterSpacing={0.6} component="div">
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            <Stack direction="row" gap={0.5} alignItems="center">
              <WebsiteIcon />
              <span>goldberries.net</span>
            </Stack>
          </Link>
        </Typography>
      </Toolbar>
      <Divider />

      {leftMenu.map((entry, index) => {
        if (entry.items) {
          return <MobileSubMenu key={index} name={entry.name} icon={entry.icon} items={entry.items} />;
        } else {
          return <MobileMenuItem key={index} item={entry} />;
        }
      })}
      {rightMenu.map((entry, index) => {
        if (entry.items) {
          return <MobileSubMenu key={index} name={entry.name} icon={entry.icon} items={entry.items} />;
        } else {
          return <MobileMenuItem key={index} item={entry} />;
        }
      })}
      {userMenu.items === undefined ? (
        <MobileMenuItem item={userMenu} />
      ) : (
        <MobileSubMenu
          name={userMenu.name}
          icon={userMenu.icon}
          items={userMenu.items}
          nameStyle={nameStyle}
        />
      )}
      <MobileMenuItem
        item={{ name: "Settings", path: "/settings", icon: <FontAwesomeIcon icon={faCogs} /> }}
      />
    </div>
  );
}

function MobileSubMenu({ name, icon, items, nameStyle = {} }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const isItemSelected = items.some((item) => {
    return pathMatchesItem(pathname, item.path);
  });

  return (
    <>
      <Divider />
      <ListItemButton selected={isItemSelected} onClick={() => setOpen(!open)} sx={{ py: "2px" }}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={<span style={nameStyle}>{name}</span>} />
        <ListItemIcon sx={{ minWidth: 0 }}>
          <FontAwesomeIcon icon={open ? faChevronDown : faChevronLeft} />
        </ListItemIcon>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items.map((item, index) => (
            <MobileMenuItem key={index} item={item} indent={1} />
          ))}
        </List>
      </Collapse>
    </>
  );
}

function MobileMenuItem({ item, indent = 0 }) {
  const { pathname } = useLocation();
  const selected = item.action ? false : pathMatchesItem(pathname, item.path);

  if (item.divider) {
    return <Divider sx={{ ml: 2 }} />;
  }

  return (
    <ListItem disablePadding>
      {item.action !== undefined && (
        <ListItemButton onClick={item.action} sx={{ py: "2px", pl: 2 + indent * 2 }}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.name} />
        </ListItemButton>
      )}
      {item.action === undefined && (
        <ListItemButton
          selected={selected}
          component={Link}
          to={item.path}
          sx={{ py: "2px", pl: 2 + indent * 2 }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.name} />
        </ListItemButton>
      )}
    </ListItem>
  );
}

function DesktopNav({ leftMenu, rightMenu, userMenu, settingsOpenRef }) {
  const auth = useAuth();
  const { settings, setSettings } = useAppSettings();
  const nameStyle = getPlayerNameColorStyle(auth.user?.player, settings);

  const darkmode = settings.visual.darkmode;
  const toggleDarkmode = () => {
    setSettings({
      ...settings,
      visual: {
        ...settings.visual,
        darkmode: !darkmode,
      },
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "#181818",
        display: {
          xs: "none",
          md: "block",
        },
        width: "100vw",
        px: 3,
        scrollbarGutter: "stable",
        color: darkmode ? "unset" : "primary.contrastText",

        position: "fixed",
        top: "0",
        zIndex: "1000", //Above everything but dropdown popups, which are 1300
        minHeight: "48px",
        height: "48px",
      }}
    >
      <Grid container spacing={1} sx={{ mt: 0, height: "100%", alignItems: "center" }}>
        <Grid item sm={5} sx={{ pt: "0 !important" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {leftMenu.map((entry, index) => {
              if (entry.items) {
                return <DesktopSubMenu key={index} name={entry.name} icon={entry.icon} items={entry.items} />;
              } else {
                return <DesktopItem key={index} item={entry} />;
              }
            })}
          </Stack>
        </Grid>
        <Grid item sm={2} sx={{ pt: "0 !important" }}>
          <Typography
            variant="h6"
            noWrap
            letterSpacing={0.6}
            component="div"
            sx={{ display: "flex", justifyContent: "space-around" }}
          >
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              <Stack direction="row" gap={0.5} alignItems="center">
                <MemoWebsiteIcon />
                <span>goldberries.net</span>
              </Stack>
            </Link>
          </Typography>
        </Grid>
        <Grid item sm={5} sx={{ pt: "0 !important" }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            {auth.hasVerifierPriv && <VerifierStatsNavDesktop />}
            {rightMenu.map((entry, index) => {
              if (entry.items) {
                return <DesktopSubMenu key={index} name={entry.name} icon={entry.icon} items={entry.items} />;
              } else {
                return <DesktopItem key={index} item={entry} />;
              }
            })}
            {userMenu.items === undefined ? (
              <DesktopItem item={userMenu} />
            ) : (
              <DesktopSubMenu
                name={userMenu.name}
                icon={userMenu.icon}
                items={userMenu.items}
                nameStyle={nameStyle}
              />
            )}
            {/* <StyledLink to="/settings" sx={{ color: "#fff", p: 0 }}> */}
            <Tooltip title="Settings">
              <IconButton sx={{ color: "#fff", p: 0, mr: 0.5 }} onClick={() => settingsOpenRef.current(true)}>
                <FontAwesomeIcon icon={faCogs} style={{ fontSize: "75%" }} />
              </IconButton>
            </Tooltip>
            {/* </StyledLink> */}
            <Tooltip title={"Switch to " + (darkmode ? "light" : "dark") + " mode"}>
              <IconButton onClick={toggleDarkmode} sx={{ color: "#fff", p: 0 }}>
                <FontAwesomeIcon icon={darkmode ? faSun : faMoon} style={{ fontSize: "75%" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

function DesktopItem({ item }) {
  if (item.action !== undefined) {
    return (
      <Button
        variant="text"
        color="inherit"
        startIcon={item.icon}
        sx={{
          textTransform: "none",
          px: 1,
          "&:hover": {
            backgroundColor: "#555",
          },
        }}
        onClick={item.action}
      >
        {item.name}
      </Button>
    );
  }
  return (
    <Button
      component={Link}
      to={item.path}
      startIcon={item.icon}
      variant="text"
      color="inherit"
      sx={{
        textTransform: "none",
        px: 1,
        "&:hover": {
          backgroundColor: "#555",
        },
      }}
    >
      {item.name}
    </Button>
  );
}

function DesktopSubMenu({ name, icon, items, nameStyle = {} }) {
  return (
    <PopupState variant="popover" popupId="demoMenu">
      {(popupState) => (
        <>
          <Button
            variant="text"
            color="inherit"
            {...bindHover(popupState)}
            startIcon={icon}
            // endIcon={<FontAwesomeIcon size="2xs" icon={faChevronDown} />}
            sx={{
              textTransform: "none",
              px: 2,
              "&:hover": {
                backgroundColor: "#555",
              },
              "&[aria-controls]": {
                backgroundColor: "#555",
              },
            }}
          >
            <span style={nameStyle}>{name}</span>
          </Button>
          <HoverMenu {...bindMenu(popupState)} disableScrollLock transitionDuration={0}>
            {items.map((item, index) => (
              <DesktopSubMenuItem key={index} item={item} closeMenu={popupState.close} />
            ))}
          </HoverMenu>
        </>
      )}
    </PopupState>
  );
}

function DesktopSubMenuItem({ item, closeMenu }) {
  if (item.divider === true) {
    return <Divider />;
  }

  if (item.action !== undefined) {
    return (
      <MenuItem
        onClick={() => {
          item.action();
          closeMenu();
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.name} />
      </MenuItem>
    );
  }

  return (
    <MenuItem onClick={closeMenu} component={Link} to={item.path}>
      <ListItemIcon>{item.icon}</ListItemIcon>
      <ListItemText primary={item.name} />
    </MenuItem>
  );
}

function VerifierStatsNavDesktop() {
  const query = useGetOverallStats(true);
  const data = query.data?.data ?? {
    submissions_in_queue: null,
    open_player_claims: null,
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Tooltip title="Submissions in queue">
        <Link to="/manage/submission-queue" style={{ color: "inherit", textDecoration: "none" }}>
          <FontAwesomeIcon icon={faMailBulk} style={{ marginRight: "5px" }} />
          {query.isError ? "X" : data.submissions_in_queue ?? "..."}
        </Link>
      </Tooltip>
      <Tooltip title="Open player claims">
        <Link to="/manage/accounts/player-claims" style={{ color: "inherit", textDecoration: "none" }}>
          <FontAwesomeIcon icon={faUserNinja} style={{ marginRight: "5px" }} />
          {query.isError ? "X" : data.open_player_claims ?? "..."}
        </Link>
      </Tooltip>
    </Stack>
  );
}

function pathMatchesItem(pathname, itemPath) {
  return (itemPath === "/" && pathname === "/") || (itemPath !== "/" && pathname.startsWith(itemPath));
}

function SearchModal({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      maxWidth="md"
      fullWidth
      sx={{ background: "transparent" }}
      PaperProps={{
        sx: { borderRadius: "10px", border: "1px solid #cccccc99" },
      }}
      disableRestoreFocus
    >
      <PageSearch isDirectSearch />
    </Dialog>
  );
}

function SettingsModal({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      maxWidth="md"
      fullWidth
      sx={{ background: "transparent" }}
      PaperProps={{
        sx: {
          borderRadius: "10px",
          border: "1px solid #cccccc99",
          alignSelf: "flex-start",
          marginTop: "60px",
        },
      }}
      disableRestoreFocus
    >
      <PageAppSettings isModal />
    </Dialog>
  );
}
