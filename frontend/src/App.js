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
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
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
  faChevronDown,
  faChevronLeft,
  faCog,
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
  faPerson,
  faPlayCircle,
  faPlus,
  faRegistered,
  faSearch,
  faSignIn,
  faSignOut,
  faSun,
  faTooth,
  faUser,
  faUserAlt,
  faUserEdit,
  faUserNinja,
  faWeight,
  faWeightHanging,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
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
import { useLocalStorage } from "@uidotdev/usehooks";

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
      <AuthWrapper>
        <Layout />
      </AuthWrapper>
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
      { path: "hard-golden-list", element: <PageGoldenList type="hard" /> },
      { path: "standard-golden-list", element: <PageGoldenList type="standard" /> },

      { path: "rejected-maps", element: <PageRejectedMaps /> },

      { path: "player/:id/:tab?", element: <PagePlayer /> },
      { path: "submission/:id", element: <PageSubmission /> },
      { path: "challenge/:id", element: <PageChallenge /> },
      { path: "map/:id", element: <PageMap /> },
      { path: "campaign/:id/:tab?", element: <PageCampaign /> },

      { path: "search/:q?", element: <PageSearch /> },

      //Catch all
      { path: "*", element: <Page404 /> },
    ],
  },
]);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#212121",
    },
    links: {
      main: "#1e90ff",
    },
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          background: "#121212",
        },
      },
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    links: {
      main: "#1e90ff",
    },
  },
});

export default function App() {
  const [darkmode, setDarkmode] = useLocalStorage("darkmode", true);

  return (
    <ThemeProvider theme={darkmode ? darkTheme : lightTheme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}></RouterProvider>
        <ToastContainer position="bottom-right" closeOnClick />
        <ReactQueryDevtools initialIsOpen={false} />
        <CssBaseline />
      </QueryClientProvider>
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
  const auth = useAuth();
  const { pathname } = useLocation();
  const drawerWidth = 260;
  const menus = {
    home: {
      name: "Home",
      path: "/",
      icon: <FontAwesomeIcon icon={faHome} />,
    },
    lists: {
      name: "Lists",
      icon: <FontAwesomeIcon icon={faList} />,
      items: [
        { name: "Top Golden List", path: "/top-golden-list", icon: <FontAwesomeIcon icon={faArrowUp} /> },
        {
          name: "Hard Golden List",
          path: "/hard-golden-list",
          icon: <FontAwesomeIcon icon={faWeightHanging} />,
        },
        {
          name: "Standard Golden List",
          path: "/standard-golden-list",
          icon: <FontAwesomeIcon icon={faHeart} />,
        },
        {
          name: "Rejected Maps",
          path: "/rejected-maps",
          icon: <FontAwesomeIcon icon={faBan} />,
        },
      ],
    },
    campaigns: {
      name: "Campaigns",
      icon: <FontAwesomeIcon icon={faBook} />,
      items: [
        { name: "Strawberry Jam", path: "/campaign/935", icon: <FontAwesomeIcon icon={faBlackberry} /> },
        {
          name: "Celeste 2021 Winter Collab",
          path: "/campaign/778",
          icon: <FontAwesomeIcon icon={faBlackberry} />,
        },
        { name: "D-Sides", path: "/campaign/238", icon: <FontAwesomeIcon icon={faBlackberry} /> },
        { name: "Lunar Ruins", path: "/campaign/869", icon: <FontAwesomeIcon icon={faBlackberry} /> },
      ],
    },
    otherChallenges: {
      name: "Other Challenges",
      icon: <FontAwesomeIcon icon={faTooth} />,
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
        { name: "My Account", path: "/my-account", icon: <FontAwesomeIcon icon={faCog} /> },
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
      name: "Submit A Golden",
      path: "/submit",
      icon: <FontAwesomeIcon icon={faPlus} />,
    },
    notUser: {
      name: "Login",
      path: "/login",
      icon: <FontAwesomeIcon icon={faSignIn} />,
    },
    verifier: {
      icon: <FontAwesomeIcon icon={faEye} />,
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
      path: "/search",
      icon: <FontAwesomeIcon icon={faSearch} />,
    },
  };

  if (auth.hasPlayerClaimed === true) {
    menus.user.items = menus.user.items.filter((item) => item.name !== "Claim A Player");
  } else {
    menus.user.items = menus.user.items.filter((item) => item.name !== "My Player Page");
  }

  // const menu = [menus.home, menus.lists, menus.campaigns, menus.otherChallenges];
  const leftMenu = [menus.lists, menus.campaigns, /*menus.otherChallenges,*/ menus.search];
  const rightMenu = [];
  if (auth.isVerifier) {
    leftMenu.push(menus.verifier);
  }
  if (auth.isAdmin) {
    leftMenu.push(menus.admin);
  }
  rightMenu.push(menus.submit);
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

  return (
    <Box display="flex" flexDirection="column">
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { xs: "block", sm: "none" },
          bgcolor: "#3e3e3e",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <FontAwesomeIcon icon={faBars} />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Goldberries.net
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, display: { xs: "block", sm: "none" } }}
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
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          <MobileDrawer leftMenu={leftMenu} rightMenu={rightMenu} userMenu={userMenu} />
        </Drawer>
      </Box>
      <DesktopNav leftMenu={leftMenu} rightMenu={rightMenu} userMenu={userMenu} />
      <Box
        component="main"
        sx={{
          mt: {
            xs: 8,
            sm: "65px",
          },
          mb: 3,
          flexGrow: 1,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

function MobileDrawer({ leftMenu, rightMenu, userMenu }) {
  const auth = useAuth();
  const nameStyle = getPlayerNameColorStyle(auth.user?.player);

  return (
    <div>
      <Toolbar>
        <Typography variant="h5" noWrap letterSpacing={0.6} component="div">
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            Goldberries.net
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

function DesktopNav({ leftMenu, rightMenu, userMenu }) {
  const auth = useAuth();
  const [darkmode, setDarkmode] = useLocalStorage("darkmode", true);
  const nameStyle = getPlayerNameColorStyle(auth.user?.player);

  console.log("DesktopNav, userMenu", userMenu, "auth.user", auth.user);

  return (
    <Box
      sx={{
        bgcolor: "#353535",
        display: {
          xs: "none",
          sm: "block",
        },
        width: "100%",
        pr: "calc(-100vw + 100%)",
        color: darkmode ? "unset" : "primary.contrastText",

        position: "fixed",
        top: "0",
        zIndex: "1000", //Above everything but dropdown popups, which are 1300
      }}
    >
      <Toolbar
        sx={{
          gap: 1,
        }}
        variant="dense"
      >
        <Typography variant="h6" noWrap letterSpacing={0.6} component="div">
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            Goldberries.net
          </Link>
        </Typography>
        {leftMenu.map((entry, index) => {
          if (entry.items) {
            return <DesktopSubMenu key={index} name={entry.name} icon={entry.icon} items={entry.items} />;
          } else {
            return <DesktopItem key={index} item={entry} />;
          }
        })}
        <Divider
          sx={{
            flexGrow: 1,
            borderColor: "#00000000",
          }}
        />
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
        <Tooltip title={"Switch to " + (darkmode ? "light" : "dark") + " mode"}>
          <IconButton onClick={() => setDarkmode(!darkmode)} sx={{ color: "#fff", p: 0 }}>
            <FontAwesomeIcon icon={darkmode ? faSun : faMoon} style={{ fontSize: "75%" }} />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </Box>
  );
}

function DesktopItem({ item }) {
  return (
    <Button
      component={Link}
      to={item.path}
      startIcon={item.icon}
      variant="text"
      color="inherit"
      sx={{
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
            endIcon={<FontAwesomeIcon size="2xs" icon={faChevronDown} />}
            sx={{
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
