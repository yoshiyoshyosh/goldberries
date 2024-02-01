import "./App.css";
import { Outlet } from "react-router";
import { createBrowserRouter, Link, RouterProvider, Navigate, useLocation } from "react-router-dom";
import { PageIndex } from "./pages/Index";

import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageLogin } from "./pages/Login";
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
  Toolbar,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faBars,
  faBook,
  faBurger,
  faChevronDown,
  faChevronLeft,
  faEdit,
  faEye,
  faHammer,
  faHeart,
  faHome,
  faInbox,
  faList,
  faMailBulk,
  faMailForward,
  faPerson,
  faPlayCircle,
  faPlus,
  faRegistered,
  faSignIn,
  faSignOut,
  faTooth,
  faUser,
  faUserAlt,
  faWeight,
  faWeightHanging,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { faBlackberry } from "@fortawesome/free-brands-svg-icons";
import { PageGoldenList } from "./pages/GoldenList";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import PopupState, { bindHover, bindMenu } from "material-ui-popup-state";
import { PageSubmit, PageUserSubmission } from "./pages/Submit";
import { PageSubmission } from "./pages/Submission";
import { PageChallenge } from "./pages/Challenge";
import { PageMap } from "./pages/Map";
import { PageClaimPlayer } from "./pages/ClaimPlayer";
import { PageTopGoldenList } from "./pages/TopGoldenList";
import { PageSubmissionQueue } from "./pages/manage/SubmissionQueue";
import { PageManageChallenges } from "./pages/manage/Challenges";

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
            path: "submission-queue/:submissionId?",
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
        ],
      },
      { path: "login/:redirect?", element: <PageLogin /> },
      { path: "post-oauth/:redirect?", element: <PagePostOAuthLogin /> },
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

      { path: "submission/:id", element: <PageSubmission /> },
      { path: "challenge/:id", element: <PageChallenge /> },
      { path: "map/:id", element: <PageMap /> },

      //Catch all
      { path: "*", element: <Page404 /> },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}></RouterProvider>
      <ToastContainer position="bottom-right" closeOnClick />
      <ReactQueryDevtools initialIsOpen={false} />
      <CssBaseline />
    </QueryClientProvider>
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
      ],
    },
    campaigns: {
      name: "Campaigns",
      icon: <FontAwesomeIcon icon={faBook} />,
      items: [
        { name: "Strawberry Jam", path: "/campaign/760", icon: <FontAwesomeIcon icon={faBlackberry} /> },
        { name: "Spring Collab 2020", path: "/campaign/761", icon: <FontAwesomeIcon icon={faBlackberry} /> },
        {
          name: "Secret Santa Collab 2022",
          path: "/campaign/762",
          icon: <FontAwesomeIcon icon={faBlackberry} />,
        },
        { name: "D-Sides", path: "/campaign/763", icon: <FontAwesomeIcon icon={faBlackberry} /> },
        { name: "Etselec", path: "/campaign/764", icon: <FontAwesomeIcon icon={faBlackberry} /> },
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
        { name: "My Profile", path: "/my-golden-list", icon: <FontAwesomeIcon icon={faUserAlt} /> },
        { name: "Claim A Player", path: "/claim-player", icon: <FontAwesomeIcon icon={faPlayCircle} /> },
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
      ],
    },
    admin: {
      icon: <FontAwesomeIcon icon={faHammer} />,
      name: "Admin",
      items: [{ name: "Admin Stuff", path: "/admin-panel", icon: <FontAwesomeIcon icon={faHammer} /> }],
    },
  };

  // const menu = [menus.home, menus.lists, menus.campaigns, menus.otherChallenges];
  const leftMenu = [menus.lists, menus.campaigns, menus.otherChallenges];
  const rightMenu = [];
  if (auth.isVerifier) {
    leftMenu.push(menus.verifier);
  }
  if (auth.isAdmin) {
    leftMenu.push(menus.admin);
  }
  rightMenu.push(menus.submit);
  if (auth.isLoggedIn) {
    rightMenu.push(menus.user);
  } else {
    rightMenu.push(menus.notUser);
  }

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
          <MobileDrawer leftMenu={leftMenu} rightMenu={rightMenu} />
        </Drawer>
      </Box>
      <DesktopNav leftMenu={leftMenu} rightMenu={rightMenu} />
      <Box
        component="main"
        sx={{
          mt: {
            xs: 8,
            sm: 1,
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

function MobileDrawer({ leftMenu, rightMenu }) {
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
    </div>
  );
}

function MobileSubMenu({ name, icon, items }) {
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
        <ListItemText primary={name} />
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

function DesktopNav({ leftMenu, rightMenu }) {
  return (
    <Box
      sx={{
        bgcolor: "#3e3e3e",
        display: {
          xs: "none",
          sm: "block",
        },
        width: "100%",
        pr: "calc(-100vw + 100%)",
        color: "primary.contrastText",
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
        {rightMenu.map((entry, index) => {
          if (entry.items) {
            return <DesktopSubMenu key={index} name={entry.name} icon={entry.icon} items={entry.items} />;
          } else {
            return <DesktopItem key={index} item={entry} />;
          }
        })}
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

function DesktopSubMenu({ name, icon, items }) {
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
            {name}
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

function pathMatchesItem(pathname, itemPath) {
  return (itemPath === "/" && pathname === "/") || (itemPath !== "/" && pathname.startsWith(itemPath));
}
