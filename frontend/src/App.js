import "./App.css";
import { Outlet } from "react-router";
import {
  createBrowserRouter,
  Link,
  RouterProvider,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { PageIndex } from "./pages/Index";

import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageForgotPassword, PageLogin, PageRegister, PageVerifyEmail } from "./pages/Login";
import { AuthProvider, useAuth } from "./hooks/AuthProvider";
import axios from "axios";
import { API_URL, CURRENT_VERSION } from "./util/constants";
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
  Stack,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBalanceScale,
  faBan,
  faBandage,
  faBars,
  faChartBar,
  faCheckCircle,
  faCheckToSlot,
  faChevronDown,
  faChevronLeft,
  faCircleQuestion,
  faCog,
  faCogs,
  faDatabase,
  faEdit,
  faExclamationCircle,
  faExclamationTriangle,
  faFileUpload,
  faHammer,
  faHome,
  faInbox,
  faInfoCircle,
  faMailBulk,
  faMoon,
  faNewspaper,
  faNoteSticky,
  faPlayCircle,
  faPooStorm,
  faQuestion,
  faRibbon,
  faSearch,
  faServer,
  faSignIn,
  faSignOut,
  faSquarePollHorizontal,
  faSun,
  faTable,
  faUser,
  faUserAlt,
  faUserEdit,
  faUserNinja,
} from "@fortawesome/free-solid-svg-icons";
import { createRef, useEffect, useState } from "react";
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
import { getQueryData, useGetServerSettings, useGetStatsVerifierTools } from "./hooks/useApi";
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
import { PageMonthlyRecap } from "./pages/MonthlyRecap";
import { PageServerCosts } from "./pages/ServerCosts";
import { useTranslation } from "react-i18next";
import { PageRules } from "./pages/Rules";
import { PageFAQ } from "./pages/FAQ";
import { PageStats } from "./pages/Stats";
import { ApiDocPage } from "./pages/ApiDoc";
import { useTheme } from "@emotion/react";
import { LegalNoticePage } from "./pages/LegalNotice";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import { PageCredits } from "./pages/Credits";
import { GlobalNoticesIcon } from "./components/GlobalNotices";
import { PageManageServerSettings } from "./pages/manage/ServerSettings";
import { PageTest } from "./pages/Test";
import { PageTrafficAnalytics } from "./pages/manage/TrafficAnalytics";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageFileUpload } from "./pages/manage/FileUpload";
import { PagePostList } from "./pages/Post";
import { PageManagePosts } from "./pages/manage/Posts";
import { PageManageBadges } from "./pages/manage/Badges";
import { useKeyboardShortcut } from "./hooks/useKeyboardShortcut";

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
          <DateLibraryWrapper>
            <Layout />
          </DateLibraryWrapper>
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
              <ProtectedRoute needsHelper redirect="manage/submission-queue">
                <PageSubmissionQueue />
              </ProtectedRoute>
            ),
          },
          {
            path: "challenges",
            element: (
              <ProtectedRoute needsHelper redirect="manage/challenges">
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
          {
            path: "server-settings",
            element: (
              <ProtectedRoute needsAdmin redirect="manage/server-settings">
                <PageManageServerSettings />
              </ProtectedRoute>
            ),
          },
          {
            path: "traffic/:tab?",
            element: (
              <ProtectedRoute needsAdmin redirect="manage/traffic">
                <PageTrafficAnalytics />
              </ProtectedRoute>
            ),
          },
          {
            path: "file-upload",
            element: (
              <ProtectedRoute needsHelper redirect="manage/file-upload">
                <PageFileUpload />
              </ProtectedRoute>
            ),
          },
          {
            path: "posts/:id?",
            element: (
              <ProtectedRoute needsHelper redirect="manage/posts">
                <PageManagePosts />
              </ProtectedRoute>
            ),
          },
          {
            path: "badges",
            element: (
              <ProtectedRoute needsVerifier redirect="manage/badges">
                <PageManageBadges />
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
      { path: "map/:id/:challengeId?", element: <PageMap /> },
      { path: "campaign/:id/:tab?", element: <PageCampaign /> },

      { path: "search/:q?", element: <PageSearch /> },
      { path: "suggestions/:id?", element: <PageSuggestions /> },
      { path: "monthly-recap/:month?", element: <PageMonthlyRecap /> },
      { path: "stats/:tab?/:subtab?", element: <PageStats /> },

      { path: "rules", element: <PageRules /> },
      { path: "faq/:entry?", element: <PageFAQ /> },

      { path: "settings/:tab?", element: <PageAppSettings /> },

      { path: "server-costs/:status?", element: <PageServerCosts /> },
      { path: "api-docs", element: <ApiDocPage /> },
      { path: "legal-notice", element: <LegalNoticePage /> },
      { path: "credits", element: <PageCredits /> },

      { path: "test/:tab?", element: <PageTest /> },

      { path: "news/:id?", element: <PagePostList type="news" /> },
      { path: "changelog/:id?", element: <PagePostList type="changelog" /> },

      //Catch all
      { path: "*", element: <Page404 /> },
    ],
  },
]);

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    contrastThreshold: 4.5,
    links: {
      main: "#1e90ff",
    },
    background: {
      other: "rgba(255,255,255,0.75)",
      subtle: "rgba(0,0,0,0.05)",
      lightShade: "rgba(0,0,0,10%)",
      lightSubtle: "rgba(0,0,0,4%)",
      mobileDrawer: "#ffffff",
    },
    tableDivider: "#949494",
    tableDividerStrong: "#949494",
    tableRowBorder: "rgba(224, 224, 224, 1)",
    box: {
      border: "#cccccc99",
      hover: "#f0f0f0",
    },
    infoBox: "rgba(205, 205, 205, 0.77)",
    errorBackground: "rgba(255,215,215,0.75)",
    campaignPage: {
      sweepBackground: "rgba(255,191,0,0.1)",
      highlightBackground: "rgba(0,0,0,0.1)",
      sweepHightlightBackground: "rgba(255,191,0,0.2)",
      noProgressBackground: "rgba(0,0,0,4%)",
    },
    stats: {
      chartBackdrop: "rgba(255,255,255,75%)",
    },
    globalNotices: {
      background: "#eeeeee",
    },
    code: {
      background: "#e8e8e8",
      border: "#c8c8c8",
    },
    posts: {
      background: "#f9f9f9",
      backgroundHover: "#e8e8e8",
      shadowColor: "#888",
      imageOutline: "#8a8a8a",
    },
    tooltip: {
      background: "rgba(230, 230, 230 ,1)",
    },
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
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 1830,
    },
  },
});
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    links: {
      main: "#1e90ff",
    },
    background: {
      other: "rgba(0,0,0,0.5)",
      subtle: "rgba(0,0,0,0.2)",
      lightShade: "rgba(255,255,255,10%)",
      lightSubtle: "rgba(255,255,255,4%)",
      mobileDrawer: "#181818",
    },
    tableDivider: "#515151",
    tableDividerStrong: "#515151",
    tableRowBorder: "rgba(81, 81, 81, 1)",
    box: {
      border: "#cccccc99",
      hover: "#333",
    },
    infoBox: "rgba(40, 40, 40, 0.77)",
    errorBackground: "rgba(40,0,0,0.5)",
    campaignPage: {
      sweepBackground: "rgba(255,191,0,0.1)",
      highlightBackground: "rgba(255,255,255,0.1)",
      sweepHightlightBackground: "rgba(255,191,0,0.2)",
      noProgressBackground: "rgba(255,255,255,7%)",
    },
    stats: {
      chartBackdrop: "rgba(0,0,0,25%)",
    },
    globalNotices: {
      background: "#333333",
    },
    code: {
      background: "#1f1f1f",
      border: "#333",
    },
    posts: {
      background: "#1e1e1e",
      backgroundHover: "#2e2e2e",
      shadowColor: "#888",
      imageOutline: "#b0b0b0",
    },
    tooltip: {
      background: "rgba(50, 50, 50, 1)",
    },
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
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 1830,
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
export function DateLibraryWrapper({ children }) {
  const adapterLocale = navigator.language === "en-US" ? "en" : "en-gb";
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      {children}
    </LocalizationProvider>
  );
}

function ProtectedRoute({ needsPlayerClaimed, needsHelper, needsVerifier, needsAdmin, redirect, children }) {
  const auth = useAuth();
  if (auth.user === null) {
    return <Navigate to={"/login/" + encodeURIComponent(redirect)} replace />;
  }
  if (needsPlayerClaimed && auth.user.player === null) {
    return <PageNoPlayerClaimed />;
  }
  if (needsVerifier && !auth.hasHelperPriv) {
    return <Page403 message="Only helpers can access this page!" />;
  }
  if (needsVerifier && !auth.hasVerifierPriv) {
    return <Page403 message="Only verifiers can access this page!" />;
  }
  if (needsAdmin && !auth.hasAdminPriv) {
    return <Page403 message="Only admins can access this page!" />;
  }
  return children;
}

export function Layout() {
  const { t } = useTranslation(undefined, { keyPrefix: "navigation" });
  const theme = useTheme();
  const { settings } = useAppSettings();
  const darkmode = settings.visual.darkmode;
  const auth = useAuth();

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
      name: t("top_golden_list"),
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
      name: t("campaigns_menu.name"),
      items: [
        {
          name: t("campaigns_menu.campaign_list"),
          path: "/campaign-list",
          icon: <JournalIcon height="1.3em" />,
        },
        {
          name: t("campaigns_menu.rejected_maps"),
          path: "/rejected-maps",
          icon: <FontAwesomeIcon icon={faBan} />,
        },
        { divider: true },
        {
          name: "Strawberry Jam",
          path: "/campaign/1199",
          icon: <CampaignIcon campaign={{ name: "Strawberry Jam", icon_url: "/icons/campaigns/sj.png" }} />,
        },
        {
          name: "Spring Collab 2020",
          path: "/campaign/1200",
          icon: (
            <CampaignIcon
              campaign={{
                name: "Celeste 2020 Spring Collab",
                icon_url: "/icons/campaigns/spring-collab-20.png",
              }}
            />
          ),
        },
        {
          name: "Winter Collab 2021",
          path: "/campaign/977",
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
          path: "/campaign/867",
          icon: (
            <CampaignIcon
              campaign={{ name: "Monika's D-Sides", icon_url: "/icons/campaigns/d-sides-monika.png" }}
            />
          ),
        },
        {
          name: "Secret Santa Collab 2024",
          path: "/campaign/1216",
          icon: (
            <CampaignIcon
              campaign={{
                name: "Secret Santa Collab 2024",
                icon_url: "/icons/campaigns/secret-santa-collab-2024.png",
              }}
            />
          ),
        },
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
      name: auth.hasPlayerClaimed ? auth.user.player.name : t("player_menu.name"),
      icon: <FontAwesomeIcon icon={faUser} />,
      items: [
        {
          name: t("player_menu.claim_a_player"),
          path: "/claim-player",
          icon: <FontAwesomeIcon icon={faPlayCircle} />,
        },
        {
          name: t("player_menu.my_player_page"),
          path: auth.hasPlayerClaimed ? "/player/" + auth.user.player.id : "/my-player-page",
          icon: <FontAwesomeIcon icon={faUserAlt} />,
        },
        {
          name: t("player_menu.my_top_goldens"),
          path: auth.hasPlayerClaimed
            ? "/player/" + auth.user.player.id + "/top-golden-list"
            : "/my-top-goldens",
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
        { name: t("player_menu.name"), path: "/my-account", icon: <FontAwesomeIcon icon={faCog} /> },
        { divider: true },
        {
          name: t("player_menu.logout"),
          action: () => {
            auth.logout();
          },
          icon: <FontAwesomeIcon icon={faSignOut} />,
        },
        {
          name: t("player_menu.app_version", { version: CURRENT_VERSION }),
          isText: true,
        },
      ],
    },
    submit: {
      name: t("submit"),
      path: "/submit",
    },
    notUser: {
      name: t("login"),
      path: "/login",
      icon: <FontAwesomeIcon icon={faSignIn} />,
    },
    newsWriter: {
      name: t("internal_menu.name"),
      items: [
        {
          name: t("internal_menu.posts"),
          path: "/manage/posts/new",
          icon: <FontAwesomeIcon icon={faNewspaper} />,
        },
        {
          name: t("internal_menu.file_upload"),
          path: "/manage/file-upload",
          icon: <FontAwesomeIcon icon={faFileUpload} />,
        },
      ],
    },
    helper: {
      name: t("internal_menu.name"),
      items: [
        {
          name: t("internal_menu.submission_queue"),
          path: "/manage/submission-queue",
          icon: <FontAwesomeIcon icon={faMailBulk} />,
        },
        {
          name: t("internal_menu.manage_challenges"),
          path: "/manage/challenges",
          icon: <FontAwesomeIcon icon={faEdit} />,
        },
        {
          name: t("internal_menu.test"),
          path: "/test",
          icon: <FontAwesomeIcon icon={faQuestion} />,
        },
      ],
    },
    verifier: {
      name: t("internal_menu.name"),
      items: [
        { name: t("internal_menu.logs"), path: "/manage/logs", icon: <FontAwesomeIcon icon={faInbox} /> },
        {
          name: t("internal_menu.manage_accounts"),
          path: "/manage/accounts",
          icon: <FontAwesomeIcon icon={faUserEdit} />,
        },
        {
          name: t("internal_menu.manage_badges"),
          path: "/manage/badges",
          icon: <FontAwesomeIcon icon={faRibbon} />,
        },
      ],
    },
    admin: {
      icon: <FontAwesomeIcon icon={faHammer} />,
      name: "Admin",
      items: [
        {
          name: "Server Settings",
          path: "/manage/server-settings",
          icon: <FontAwesomeIcon icon={faServer} />,
        },
        {
          name: "Traffic Analytics",
          path: "/manage/traffic",
          icon: <FontAwesomeIcon icon={faDatabase} />,
        },
      ],
    },
    search: {
      name: t("search"),
      action: () => {
        console.log("Clicked search");
        searchOpenRef.current(true);
      },
      icon: <FontAwesomeIcon icon={faSearch} />,
      key: "S",
    },
    other: {
      name: t("other_menu.name"),
      items: [
        {
          name: t("other_menu.rules"),
          path: "/rules",
          icon: <FontAwesomeIcon icon={faBalanceScale} />,
        },
        {
          name: t("other_menu.faq"),
          path: "/faq",
          icon: <FontAwesomeIcon icon={faCircleQuestion} />,
        },
        { divider: true },
        {
          name: t("other_menu.suggestion_box"),
          path: "/suggestions",
          icon: <FontAwesomeIcon icon={faCheckToSlot} />,
        },
        {
          name: t("other_menu.monthly_recap"),
          path: "/monthly-recap",
          icon: <FontAwesomeIcon icon={faSquarePollHorizontal} />,
        },
        {
          name: t("other_menu.stats"),
          path: "/stats",
          icon: <FontAwesomeIcon icon={faTable} />,
        },
        {
          name: t("other_menu.news"),
          path: "/news",
          icon: <FontAwesomeIcon icon={faNewspaper} />,
        },
        {
          name: t("other_menu.changelog"),
          path: "/changelog",
          icon: <FontAwesomeIcon icon={faNoteSticky} />,
        },
      ],
    },
    suggestions: {},
  };

  if (auth.hasPlayerClaimed === true) {
    menus.user.items = menus.user.items.filter((item) => item.path !== "/claim-player");
  } else {
    menus.user.items = menus.user.items.filter((item) => item.path !== "/my-player-page");
    menus.user.items = menus.user.items.filter((item) => item.path !== "/my-top-goldens");
  }

  const leftMenu = [menus.lists, menus.campaigns, menus.other];
  const rightMenu = [];
  if (auth.hasNewsWriterPriv) {
    const newsWriterMenu = menus.newsWriter;
    if (auth.hasHelperPriv) {
      newsWriterMenu.items.push({ divider: true });
      menus.helper.items.forEach((item) => newsWriterMenu.items.push(item));
    }
    if (auth.hasVerifierPriv) {
      newsWriterMenu.items.push({ divider: true });
      menus.verifier.items.forEach((item) => newsWriterMenu.items.push(item));
    }
    if (auth.hasAdminPriv) {
      newsWriterMenu.items.push({ divider: true });
      menus.admin.items.forEach((item) => newsWriterMenu.items.push(item));
    }
    leftMenu.push(newsWriterMenu);
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
    }
  } else {
    if (backgroundSettings.darkCustom !== "") {
      background = 'black url("' + backgroundSettings.darkCustom + '") 0 0 / cover no-repeat';
    } else if (backgroundSettings.dark !== "") {
      background = 'black url("/img/' + backgroundSettings.dark + '") 0 0 / cover no-repeat';
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
          }}
        >
          <Toolbar sx={{ bgcolor: "#181818" }}>
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
              <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                <Stack direction="row" gap={0.5} alignItems="center">
                  <WebsiteIcon />
                  <span>goldberries.net</span>
                </Stack>
              </Link>
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
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                bgcolor: theme.palette.background.mobileDrawer,
                backgroundImage: "none",
              },
            }}
          >
            <MobileDrawer
              leftMenu={leftMenu}
              rightMenu={rightMenu}
              userMenu={userMenu}
              closeDrawer={handleDrawerClose}
            />
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
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
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

function MobileDrawer({ leftMenu, rightMenu, userMenu, closeDrawer }) {
  const { t } = useTranslation(undefined, { keyPrefix: "navigation" });
  const auth = useAuth();
  const { settings, setSettings } = useAppSettings();
  const darkmode = settings.visual.darkmode;
  const nameStyle = getPlayerNameColorStyle(auth.user?.player, settings);

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
          return (
            <MobileSubMenu
              key={index}
              name={entry.name}
              icon={entry.icon}
              items={entry.items}
              closeDrawer={closeDrawer}
            />
          );
        } else {
          return <MobileMenuItem key={index} item={entry} closeDrawer={closeDrawer} />;
        }
      })}
      {rightMenu.map((entry, index) => {
        if (entry.items) {
          return (
            <MobileSubMenu
              key={index}
              name={entry.name}
              icon={entry.icon}
              items={entry.items}
              closeDrawer={closeDrawer}
            />
          );
        } else {
          return <MobileMenuItem key={index} item={entry} closeDrawer={closeDrawer} />;
        }
      })}
      {userMenu.items === undefined ? (
        <MobileMenuItem item={userMenu} closeDrawer={closeDrawer} />
      ) : (
        <MobileSubMenu
          name={userMenu.name}
          icon={userMenu.icon}
          items={userMenu.items}
          nameStyle={nameStyle}
          closeDrawer={closeDrawer}
        />
      )}
      <MobileMenuItem
        item={{ name: t("settings"), path: "/settings", icon: <FontAwesomeIcon icon={faCogs} /> }}
        closeDrawer={closeDrawer}
      />
      <MobileMenuItem
        item={{
          name: t(darkmode ? "switch_to_light_mode" : "switch_to_dark_mode"),
          action: toggleDarkmode,
          icon: <FontAwesomeIcon icon={darkmode ? faSun : faMoon} />,
        }}
        closeDrawer={closeDrawer}
      />
    </div>
  );
}

function MobileSubMenu({ name, icon, items, nameStyle = {}, closeDrawer }) {
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
            <MobileMenuItem key={index} item={item} indent={1} closeDrawer={closeDrawer} />
          ))}
        </List>
      </Collapse>
    </>
  );
}

function MobileMenuItem({ item, indent = 0, closeDrawer }) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const selected = item.action ? false : pathMatchesItem(pathname, item.path);

  const onClick = () => {
    if (item.action !== undefined) {
      item.action();
    }
    closeDrawer();
  };

  if (item.divider) {
    return <Divider sx={{ ml: 2 }} />;
  } else if (item.isText) {
    return (
      <ListItemText
        primary={item.name}
        sx={{ py: "2px", pl: 2 + indent * 2, color: theme.palette.text.secondary }}
      />
    );
  }

  return (
    <ListItem disablePadding>
      {item.action !== undefined && (
        <ListItemButton onClick={onClick} sx={{ py: "2px", pl: 2 + indent * 2 }}>
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
          onClick={onClick}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.name} />
        </ListItemButton>
      )}
    </ListItem>
  );
}

function DesktopNav({ leftMenu, rightMenu, userMenu, settingsOpenRef }) {
  const { t } = useTranslation(undefined, { keyPrefix: "navigation" });
  const auth = useAuth();
  const navigate = useNavigate();
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

  const shift = true;
  const hotkeys = [
    {
      key: "q",
      shift,
      onKey: () => {
        if (!auth.hasHelperPriv) return;
        navigate("/manage/submission-queue");
      },
    },
    {
      key: "w",
      shift,
      onKey: () => {
        if (!auth.hasVerifierPriv) return;
        navigate("/manage/accounts/player-claims");
      },
    },
    { key: "e", shift, onKey: () => navigate("/suggestions") },
    { key: "r", shift, onKey: () => navigate("/submit") },
    { key: "a", shift, onKey: () => navigate("/top-golden-list") },
    { key: "d", shift, onKey: () => navigate("/") },
    {
      key: "f",
      shift,
      onKey: () => {
        if (!auth.hasPlayerClaimed) return;
        navigate("/player/" + auth.user.player.id);
      },
    },
    {
      key: "g",
      shift,
      onKey: () => {
        if (!auth.hasPlayerClaimed) return;
        navigate("/player/" + auth.user.player.id + "/top-golden-list");
      },
    },
  ];
  useKeyboardShortcut(hotkeys[0]);
  useKeyboardShortcut(hotkeys[1]);
  useKeyboardShortcut(hotkeys[2]);
  useKeyboardShortcut(hotkeys[3]);
  useKeyboardShortcut(hotkeys[4]);
  useKeyboardShortcut(hotkeys[5]);
  useKeyboardShortcut(hotkeys[6]);
  useKeyboardShortcut(hotkeys[7]);

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
        <Grid item sm={2} sx={{ pt: "0 !important", minWidth: "180px" }}>
          <Typography
            variant="h6"
            noWrap
            letterSpacing={0.6}
            component="div"
            sx={{ display: "flex", justifyContent: "space-around" }}
          >
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              <Stack direction="row" gap={0.5} alignItems="center">
                <MemoWebsiteIcon countLoad />
                <span>goldberries.net</span>
              </Stack>
            </Link>
          </Typography>
        </Grid>
        <Grid item sm={5} sx={{ pt: "0 !important" }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <GlobalNoticesIcon />
            {auth.hasHelperPriv && <VerifierStatsNavDesktop />}
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
            <Tooltip title={t("settings")}>
              <IconButton sx={{ color: "#fff", p: 0, mr: 0.5 }} onClick={() => settingsOpenRef.current(true)}>
                <FontAwesomeIcon icon={faCogs} style={{ fontSize: "75%" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t(darkmode ? "switch_to_light_mode" : "switch_to_dark_mode")}>
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
  const navigate = useNavigate();
  const handleShortcut = () => {
    if (item.key === undefined || item.key === null) return;
    if (item.action !== undefined) {
      item.action();
    } else {
      navigate(item.path);
    }
  };
  useKeyboardShortcut({ key: item.key || "Enter", shift: true, onKey: handleShortcut });

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
  const theme = useTheme();

  if (item.divider === true) {
    return <Divider />;
  } else if (item.isText === true) {
    return (
      <ListItem disablePadding>
        <ListItemText primary={item.name} sx={{ pl: 2, color: theme.palette.text.secondary }} />
      </ListItem>
    );
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
  const { t } = useTranslation(undefined, { keyPrefix: "navigation" });
  const query = useGetStatsVerifierTools();
  const data = getQueryData(query) ?? {
    submissions_in_queue: null,
    open_player_claims: null,
  };

  const auth = useAuth();
  const isVerifier = auth.hasVerifierPriv; //If not, then it's a helper

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Tooltip title={t("widgets.submission_queue")}>
        <Link to="/manage/submission-queue" style={{ color: "inherit", textDecoration: "none" }}>
          <FontAwesomeIcon icon={faMailBulk} style={{ marginRight: "5px" }} />
          {query.isError ? "X" : data.submissions_in_queue ?? "..."}
        </Link>
      </Tooltip>
      {isVerifier && (
        <Tooltip title={t("widgets.player_claims")}>
          <Link to="/manage/accounts/player-claims" style={{ color: "inherit", textDecoration: "none" }}>
            <FontAwesomeIcon icon={faUserNinja} style={{ marginRight: "5px" }} />
            {query.isError ? "X" : data.open_player_claims ?? "..."}
          </Link>
        </Tooltip>
      )}
      <Tooltip title={t("widgets.pending_suggestions")}>
        <Link to="/suggestions" style={{ color: "inherit", textDecoration: "none" }}>
          <FontAwesomeIcon icon={faChartBar} style={{ marginRight: "5px" }} />
          {query.isError ? "X" : data.pending_suggestions ?? "..."}
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
      <ErrorBoundary>
        <PageSearch isDirectSearch />
      </ErrorBoundary>
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
      <ErrorBoundary>
        <PageAppSettings isModal />
      </ErrorBoundary>
    </Dialog>
  );
}
