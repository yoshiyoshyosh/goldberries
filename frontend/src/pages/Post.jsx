import {
  Button,
  Divider,
  Grid,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  colors,
  useTheme,
} from "@mui/material";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
  TooltipLineBreaks,
} from "../components/BasicComponents";
import { useParams } from "react-router-dom";
import {
  getQueryData,
  useGetAdjacentPosts,
  useGetChallenge,
  useGetPlayer,
  useGetPost,
  useGetPostPaginated,
} from "../hooks/useApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCalendar, faEdit } from "@fortawesome/free-solid-svg-icons";
import { dateToTimeAgoString, jsonDateToJsDate } from "../util/util";
import { DifficultyChip, PlayerChip } from "../components/GoldberriesComponents";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./Rules";
import { visit } from "unist-util-visit";
import emoji from "remark-emoji";
import { useAuth } from "../hooks/AuthProvider";
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";
import { useTranslation } from "react-i18next";
import { memo, useEffect, useState } from "react";
import { DIFFICULTIES } from "../util/constants";
import { ChallengeInline } from "./Player";
import { BadgeAsync } from "../components/Badge";

export function PagePostList({ type }) {
  const { id } = useParams();
  //if id is not set, then show the list. otherwise, show the exact post

  return (
    <BasicContainerBox maxWidth="md">
      {id ? <PostDetail type={type} id={id} /> : <PostList type={type} />}
    </BasicContainerBox>
  );
}

//#region Post List
export function PostList({ type }) {
  const { t } = useTranslation(undefined, { keyPrefix: "post.list" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const [page, setPage] = useLocalStorage(`post_list_${type}_page`, 1);
  const perPage = 15;
  const [search, setSearch] = useLocalStorage(`post_list_${type}_search`, "");
  const searchDebounced = useDebounce(search, 500);

  const onChangeSearch = (value) => {
    setPage(1);
    setSearch(value);
  };

  const query = useGetPostPaginated(type, page, perPage, searchDebounced);
  const data = getQueryData(query);

  const title = t("title_" + type);
  return (
    <Grid container spacing={2}>
      <HeadTitle title={title} />
      <Grid item xs={12}>
        <Typography variant="h4">{title}</Typography>
      </Grid>
      <Grid item xs={12}>
        <PostListSearch search={search} setSearch={onChangeSearch} />
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      {query.isLoading && (
        <Grid item xs={12}>
          <LoadingSpinner />
        </Grid>
      )}
      {query.isError && (
        <Grid item xs={12}>
          <ErrorDisplay error={query.error} />
        </Grid>
      )}
      {data && (
        <>
          <Grid item xs={12} display="flex" justifyContent="space-around">
            <Pagination count={data.max_page} page={page} onChange={(e, value) => setPage(value)} />
          </Grid>
          <Grid item xs={12}>
            <PostListResult type={type} posts={data.posts} />
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="space-around">
            <Pagination count={data.max_page} page={page} onChange={(e, value) => setPage(value)} />
          </Grid>
        </>
      )}
    </Grid>
  );
}

function PostListSearch({ search, setSearch }) {
  const { t } = useTranslation(undefined, { keyPrefix: "post.list" });
  const [localSearch, setLocalSearch] = useState(search);
  const localSearchDebounced = useDebounce(localSearch, 500);

  useEffect(() => {
    if (localSearch !== search) {
      setSearch(localSearch);
    }
  }, [localSearchDebounced]);

  return (
    <TextField
      label={t("search")}
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      fullWidth
    />
  );
}

function PostListResult({ type, posts }) {
  return (
    <Grid container spacing={2}>
      {posts.length === 0 && (
        <Grid item xs={12}>
          <Typography variant="body1">No posts found</Typography>
        </Grid>
      )}
      {posts.map((post) => (
        <Grid item xs={12} key={post.id}>
          <PostListPost post={post} />
        </Grid>
      ))}
    </Grid>
  );
}

function PostListPost({ post }) {
  const { t } = useTranslation(undefined, { keyPrefix: "post.list" });
  const theme = useTheme();
  const content = post.content;
  const firstParagraph = content.split("\n\n")[0];

  const hasMoreContent = content.length > firstParagraph.length;

  return (
    <StyledLink
      to={`/${post.type}/${post.id}`}
      style={{ textDecoration: "none", color: theme.palette.text.primary }}
    >
      <Paper
        sx={{
          p: 2,
          borderRadius: "5px",
          background: theme.palette.posts.background,
          "&:hover": { background: theme.palette.posts.backgroundHover },
        }}
      >
        <Grid container spacing={0}>
          <Grid item xs={12} sm={post.image_url ? 8 : 12}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <PostTitle title={post.title} />
              </Grid>
              <Grid item xs={12} sx={{ "& > :first-child": { mt: 0 }, "& > :last-child": { mb: 0 } }}>
                <MarkdownRenderer markdown={firstParagraph} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color={theme.palette.text.secondary}>
                  {hasMoreContent && t("show_more")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {post.image_url && (
            <Grid item xs={12} sm={4}>
              <PostImage image_url={post.image_url} title={post.title} />
            </Grid>
          )}
          <Grid item xs={12}>
            <PostAuthor post={post} />
          </Grid>
        </Grid>
      </Paper>
    </StyledLink>
  );
}
//#endregion

//#region Post Detail
export function PostDetail({ type, id }) {
  const auth = useAuth();
  const query = useGetPost(id);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const post = getQueryData(query);

  return (
    <Grid container spacing={2}>
      <HeadTitle title={post.title} />
      <Grid item xs>
        <StyledLink to={`/${type}`}>
          <Stack direction="row" gap={1} alignItems="center">
            <FontAwesomeIcon icon={faArrowLeft} />
            <Typography variant="body1">Back to list</Typography>
          </Stack>
        </StyledLink>
      </Grid>
      {((post.type === "news" && auth.hasNewsWriterPriv) ||
        (post.type === "changelog" && auth.hasAdminPriv)) && (
        <Grid item xs="auto">
          <StyledLink to={`/manage/posts/${post.id}`}>
            <Button variant="outlined" startIcon={<FontAwesomeIcon icon={faEdit} size="sm" />}>
              Edit
            </Button>
          </StyledLink>
        </Grid>
      )}
      {/* <Grid item xs={12}>
        <Divider />
      </Grid> */}
      {post.image_url && (
        <Grid item xs={12}>
          <PostImage image_url={post.image_url} title={post.title} />
        </Grid>
      )}
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12} sx={{ "&&": { pt: 0 } }}>
            <PostTitle title={post.title} />
          </Grid>
          <Grid item xs={12} sx={{ "&&": { pt: 0 } }}>
            <PostAuthor post={post} />
          </Grid>
          {/* <Grid item xs={12}>
            <Divider />
          </Grid> */}
          <Grid item xs={12} sx={{ "& > :first-child": { mt: 0 }, "& > :last-child": { mb: 0 } }}>
            <MarkdownRenderer markdown={post.content} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <AdjacentPostsDisplay type={type} id={id} />
      </Grid>
    </Grid>
  );
}

function PostAuthor({ post, noEdited = false, isPreview = false }) {
  const theme = useTheme();
  const colorSecondary = theme.palette.text.secondary;

  return (
    <Stack direction="row" gap={0.75} alignItems="center">
      {isPreview && !post.date_created ? (
        <Typography variant="body2" color={colorSecondary}>
          ... seconds ago
        </Typography>
      ) : (
        <>
          <DateRelativeTooltip date={post.date_created} color={colorSecondary} />
          {post.date_edited && !noEdited && (
            <DateRelativeTooltip
              date={post.date_edited}
              color={colorSecondary}
              formatter={(s) => `(edited ${s})`}
            />
          )}
        </>
      )}
      <Typography variant="body2" color={colorSecondary}>
        ·
      </Typography>
      <Typography variant="body2" color={colorSecondary}>
        by
      </Typography>
      <PlayerChip player={post.author} size="small" />
    </Stack>
  );
}

export function DateRelativeTooltip({ date, variant = "body2", formatter = null, ...props }) {
  const dateObj = jsonDateToJsDate(date);
  const timeAgo = dateToTimeAgoString(dateObj);
  const str = formatter ? formatter(timeAgo) : timeAgo;
  return (
    <TooltipLineBreaks title={dateObj.toLocaleString()}>
      <Typography variant={variant} {...props}>
        {str}
      </Typography>
    </TooltipLineBreaks>
  );
}

export function AdjacentPostsDisplay({ type, id }) {
  const query = useGetAdjacentPosts(id);
  const data = getQueryData(query);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const { previous, next } = data;

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        {previous && <AdjacentPostDetails post={previous} />}
      </Grid>
      <Grid item xs={6}>
        {next && <AdjacentPostDetails isNext post={next} />}
      </Grid>
    </Grid>
  );
}

function AdjacentPostDetails({ isNext = false, post }) {
  const theme = useTheme();
  const darkmode = theme.palette.mode === "dark";
  const color = darkmode ? "black" : "white";
  const radius = darkmode ? 3 : 2;

  const textShadow = `0px 0px ${radius}px ${color}, 0px 0px ${radius}px ${color}, 0px 0px ${radius}px ${color}, 0px 0px ${radius}px ${color}, 0px 0px ${radius}px ${color}`;
  const dropShadow = `drop-shadow(0 0 1px ${color}) drop-shadow(0 0 1px ${color}) drop-shadow(0 0 1px ${color}) drop-shadow(0 0 1px ${color})`;

  const text = isNext ? "Next Post" : "Previous Post";

  return (
    <StyledLink to={`/${post.type}/${post.id}`} style={{ textDecoration: "none" }}>
      <Stack
        direction="column"
        gap={0.5}
        sx={{
          p: "5px",
          borderRadius: "5px",
          alignItems: "center",
          backgroundImage: post.image_url ? `url(${post.image_url})` : "none",
          backgroundSize: "cover",
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          {!isNext && (
            <FontAwesomeIcon
              icon={faArrowLeft}
              color={theme.palette.text.secondary}
              style={{ filter: dropShadow }}
            />
          )}
          <Typography variant="body1" color={theme.palette.text.secondary} sx={{ textShadow }}>
            {text}
          </Typography>
          {isNext && (
            <FontAwesomeIcon
              icon={faArrowRight}
              color={theme.palette.text.secondary}
              style={{ filter: dropShadow }}
            />
          )}
        </Stack>
        <Stack direction="row" gap={1} alignItems="center" sx={{ overflow: "hidden", maxWidth: "90%" }}>
          <Typography
            variant="body1"
            color={theme.palette.text.primary}
            sx={{ textShadow, textWrap: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
          >
            {post.title}
          </Typography>
        </Stack>
      </Stack>
    </StyledLink>
  );
}

function parseImageAlt(alt) {
  const obj = {
    alt: "",
    displayAlt: false,
    noOutline: false,
    width: undefined,
  };

  const altSplit = alt.split(";");
  if (altSplit.length === 2) {
    obj.alt = altSplit[1];
    obj.width = altSplit[0];
  }
  const flags = [
    { flag: "!", prop: "displayAlt" },
    { flag: "_", prop: "noOutline" },
  ];
  //While there is still some flag at the start of the string, keep parsing
  while (flags.some((f) => obj.alt.startsWith(f.flag))) {
    const flag = flags.find((f) => obj.alt.startsWith(f.flag));
    obj.alt = obj.alt.substring(1);
    obj[flag.prop] = true;
  }
  return obj;
}

//#region Post Components
export const MarkdownRendererMemo = memo(MarkdownRenderer);
export function MarkdownRenderer({ markdown, isCentered = false }) {
  const theme = useTheme();
  const colorSecondary = theme.palette.text.secondary;

  return (
    <Markdown
      components={{
        p: ({ children, ...props }) => (
          <p style={{ textAlign: isCentered ? "center" : undefined }} {...props}>
            {children}
          </p>
        ),
        a: ({ href, children, ...props }) => <MarkdownAnchor href={href}>{children}</MarkdownAnchor>,
        img: ({ src, alt }) => {
          const { alt: altText, displayAlt, noOutline, width } = parseImageAlt(alt);
          const outlineStyle = !noOutline
            ? {
                border: `1px solid ${theme.palette.posts.imageOutline}`,
                boxShadow: `0px 0px 3px ${theme.palette.posts.imageOutline}`,
              }
            : {};
          return (
            <Stack direction="column" alignItems="center">
              <img
                src={src}
                alt={altText}
                style={{ width: width, maxWidth: "100%", borderRadius: "10px", ...outlineStyle }}
              />
              {displayAlt && (
                <Typography variant="caption" color={colorSecondary}>
                  {altText}
                </Typography>
              )}
            </Stack>
          );
        },
        table: ({ children }) => {
          return (
            <TableContainer component={Paper} sx={{ width: "fit-content" /*, margin: "auto" */ }}>
              <Table size="small">{children}</Table>
            </TableContainer>
          );
        },
        ul: ({ children }) => <ul style={{ paddingLeft: "25px" }}>{children}</ul>,
        thead: ({ children }) => <TableHead>{children}</TableHead>,
        tbody: ({ children }) => <TableBody>{children}</TableBody>,
        tr: ({ children }) => <TableRow>{children}</TableRow>,
        th: ({ children, style }) => <TableCell style={style}>{children}</TableCell>,
        td: ({ children, style }) => <TableCell style={style}>{children}</TableCell>,
        blockquote: ({ children }) => (
          <blockquote
            style={{
              borderLeft: `5px solid #8a8a8a`,
              paddingLeft: "16px",
              marginLeft: "16px",
              color: theme.palette.text.secondary,
            }}
          >
            {children}
          </blockquote>
        ),
        code: ({ children, className, node }) => {
          if (node.data?.meta === "fence") {
            return <code>{children}</code>;
          }
          return <MarkdownInlineCodeBlock className={className}>{children}</MarkdownInlineCodeBlock>;
        },
        pre: ({ children }) => (
          <pre
            style={{
              padding: "15px",
              background: theme.palette.code.background,
              borderRadius: "10px",
              borderColor: theme.palette.code.border,
              borderWidth: "2px",
              borderStyle: "solid",
              overflowX: "auto",
            }}
          >
            {children}
          </pre>
        ),
      }}
      remarkPlugins={[pluginCodeFencer, remarkGfm, emoji]}
    >
      {markdown}
    </Markdown>
  );
}

const _OWN_DOMAINS = ["/", "http://localhost", "https://goldberries.net"];
function MarkdownAnchor({ href, children }) {
  if (!_OWN_DOMAINS.some((d) => href.startsWith(d))) {
    return <StyledExternalLink href={href}>{children}</StyledExternalLink>;
  }
  return <StyledLink to={href}>{children}</StyledLink>;
}

function MarkdownInlineCodeBlock({ children, className }) {
  let match = null;
  if ((match = children.match(/^\{d:(\d+)\}$/)) !== null) {
    //Example: {d:12}
    const diffId = parseInt(match[1]);
    const diff = DIFFICULTIES[diffId];
    if (diff) {
      return (
        <DifficultyChip
          difficulty={{ id: diffId, name: diff.name, sort: diff.sort }}
          size="small"
          sx={{ position: "relative", top: "-1px" }}
        />
      );
    }
  } else if ((match = children.match(/^\{p:(\d+)\}$/)) !== null) {
    //Example: {p:12}
    const playerId = parseInt(match[1]);
    if (playerId >= 1) {
      return <PlayerChipAsync id={playerId} size="small" sx={{ position: "relative", top: "-1px" }} />;
    }
  } else if ((match = children.match(/^\{c:(\d+):?(.)?\}$/)) !== null) {
    //Example: {c:12:f}, {c:12}
    const challengeId = parseInt(match[1]);
    const full = match[2] === "f";
    if (challengeId >= 1) {
      return <ChallengeInlineAsync id={challengeId} full={full} size="small" />;
    }
  } else if ((match = children.match(/^\{b:(\d+)\}$/)) !== null) {
    //Example: {b:badgeId}
    const badgeId = parseInt(match[1]);
    if (badgeId >= 1) {
      return <BadgeAsync id={badgeId} />;
    }
  }
  return <CodeBlock className={className}>{children}</CodeBlock>;
}
export function PlayerChipAsync({ id, size, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.markdown.player_chip" });
  const query = useGetPlayer(id, () => {}); //Empty error handler
  let player = getQueryData(query);

  player = query.isLoading ? { id: 0, name: t("loading"), account: {} } : player;
  player = query.isError ? null : player;

  return <PlayerChip player={player} size={size} {...props} />;
}
export function ChallengeInlineAsync({ id, full = false, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.markdown.challenge_inline" });
  const query = useGetChallenge(id, () => {}); //Empty error handler
  let challenge = getQueryData(query);

  if (query.isLoading) {
    return <LoadingSpinner size="small" />;
  } else if (query.isError) {
    return (
      <Typography variant="body1" color={(t) => t.palette.error.main}>
        {t("error", { id })}
      </Typography>
    );
  }

  if (full) {
    return <ChallengeInline challenge={challenge} {...props} />;
  } else {
    return <ChallengeInline challenge={challenge} separateChallenge {...props} />;
  }
}

export function PostImage({ image_url, title, compact = false }) {
  const theme = useTheme();
  return (
    <img
      src={image_url}
      style={{
        width: "100%",
        maxHeight: compact ? "80px" : "120px",
        objectFit: "cover",
        borderRadius: "5px",
        border: `1px solid ${theme.palette.posts.imageOutline}`,
      }}
      alt={title}
    />
  );
}

export function PostTitle({ title, compact = false }) {
  const sx = compact ? { textWrap: "nowrap", textOverflow: "ellipsis", overflow: "hidden" } : {};
  return (
    <Typography variant={compact ? "h5" : "h4"} fontWeight="bold" sx={sx}>
      {title}
    </Typography>
  );
}
//#endregion

//#region Plugins
function pluginCodeFencer() {
  return (tree) => {
    visit(tree, "code", (node) => {
      node.meta = "fence";
    });
  };
}

const EMOJI_RE = /:\+1:|:-1:|:[\w-]+:/g;
function extractText(string, start, end) {
  const startLine = string.slice(0, start).split("\n");
  const endLine = string.slice(0, end).split("\n");

  return {
    type: "text",
    value: string.slice(start, end),
    position: {
      start: {
        line: startLine.length,
        column: startLine[startLine.length - 1].length + 1,
      },
      end: {
        line: endLine.length,
        column: endLine[endLine.length - 1].length + 1,
      },
    },
  };
}
//This plugin works properly to split the text into text and emoji nodes
//BUT react-markdown doesnt support custom components through its components prop i think?
function pluginEmojis() {
  return (tree) => {
    visit(tree, "text", (node, position, parent) => {
      const definition = [];
      let lastIndex = 0;
      let match;

      while ((match = EMOJI_RE.exec(node.value)) !== null) {
        const value = match[0];
        const type = "text";
        // const type = "emoji";

        if (match.index !== lastIndex) {
          definition.push(extractText(node.value, lastIndex, match.index));
        }

        definition.push({
          type,
          value,
        });

        lastIndex = match.index + value.length;
      }

      if (lastIndex !== node.value.length) {
        const text = extractText(node.value, lastIndex, node.value.length);
        definition.push(text);
      }

      const last = parent.children.slice(position + 1);
      parent.children = parent.children.slice(0, position);
      parent.children = parent.children.concat(definition);
      parent.children = parent.children.concat(last);
    });
    // console.log("tree after emoji pass:", JSON.stringify(tree, null, 2));
  };
}

//Other version that also doesnt work
// function pluginEmojis() {
//   return (tree) => {
//     visit(tree, "text", (node, position, parent) => {
//       if (!parent || typeof position !== "number") return;

//       const definition = [];
//       let lastIndex = 0;
//       let match;

//       while ((match = EMOJI_RE.exec(node.value)) !== null) {
//         const value = match[0];

//         // Push preceding text (if any)
//         if (match.index !== lastIndex) {
//           definition.push(extractText(node.value, lastIndex, match.index));
//         }

//         // Push emoji as a "text" node with a custom property
//         definition.push({
//           type: "text",
//           value,
//           data: { isEmoji: true }, // Custom property to detect emoji
//         });

//         lastIndex = match.index + value.length;
//       }

//       // Push any remaining text
//       if (lastIndex !== node.value.length) {
//         definition.push(extractText(node.value, lastIndex, node.value.length));
//       }

//       // Replace the original node with the new definition
//       parent.children.splice(position, 1, ...definition);
//     });
//     console.log("tree after emoji pass:", JSON.stringify(tree, null, 2));
//   };
// }
//#endregion

//#endregion

//#region Index Widget
export function PostIndexWidget({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "post.index" });

  return (
    <Grid container spacing={1.5}>
      <Grid item xs={12} sm={12}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
          <Typography variant="h5" gutterBottom sx={{ textWrap: "nowrap" }}>
            {t("header_news")}
          </Typography>
          <StyledLink to="/news">{t("view_all")}</StyledLink>
        </Stack>
        <PostIndexWidgetList type="news" />
      </Grid>
      {/* <Grid item xs={12} sm={12}>
        <Divider />
      </Grid> */}
      <Grid item xs={12} sm={12}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
          <Typography variant="h5" gutterBottom sx={{ textWrap: "nowrap" }}>
            {t("header_changelog")}
          </Typography>
          <StyledLink to="/changelog">{t("view_all")}</StyledLink>
        </Stack>
        <PostIndexWidgetList type="changelog" />
      </Grid>
    </Grid>
  );
}
function PostIndexWidgetList({ type }) {
  const query = useGetPostPaginated(type, 1, 3, "");
  const data = getQueryData(query);

  return (
    <Grid container spacing={1}>
      {query.isLoading && (
        <Grid item xs={12}>
          <LoadingSpinner />
        </Grid>
      )}
      {query.isError && (
        <Grid item xs={12}>
          <ErrorDisplay error={query.error} />
        </Grid>
      )}
      {data && data.posts.length === 0 && (
        <Grid item xs={12}>
          <Typography variant="body1">No posts found</Typography>
        </Grid>
      )}
      {data &&
        data.posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <PostIndexWidgetPost post={post} />
          </Grid>
        ))}
    </Grid>
  );
}
export function PostIndexWidgetPost({ post, isPreview = false }) {
  const { t: t_pl } = useTranslation(undefined, { keyPrefix: "post.list" });
  const theme = useTheme();
  const content = post.content;
  const firstParagraph = content.split("\n\n")[0];
  const hasMoreContent = content.length > firstParagraph.length;

  return (
    <StyledLink
      to={isPreview ? "#" : `/${post.type}/${post.id}`}
      style={{ textDecoration: "none", color: theme.palette.text.primary }}
    >
      <Paper
        sx={{
          p: 2,
          borderRadius: "5px",
          background: theme.palette.posts.background,
          "&:hover": { background: theme.palette.posts.backgroundHover },
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={post.image_url ? 9 : 12}>
            <Grid container rowSpacing={0} columnSpacing={2}>
              <Grid item xs={12}>
                <PostTitle title={post.title} compact />
              </Grid>
              <Grid item xs={12} sx={{ "& > :first-child": { mt: 0 }, "& > :last-child": { mb: 0 } }}>
                <MarkdownRenderer markdown={firstParagraph} />
              </Grid>
              <Grid item xs="auto">
                <PostAuthor post={post} noEdited isPreview={isPreview} />
              </Grid>
              {/* {hasMoreContent && (
                <Grid item xs>
                  <Typography variant="caption" color={theme.palette.text.secondary}>
                    {t_pl("show_more")}
                  </Typography>
                </Grid>
              )} */}
            </Grid>
          </Grid>
          {post.image_url && (
            <Grid item xs={12} sm={3}>
              <Grid item xs={12}>
                <Grid item xs={12}>
                  <PostImage image_url={post.image_url} title={post.title} compact />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>
    </StyledLink>
  );
}
//#endregion
