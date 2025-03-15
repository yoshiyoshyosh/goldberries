import {
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { getQueryData, useGetAdjacentPosts, useGetPost } from "../hooks/useApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCalendar, faEdit } from "@fortawesome/free-solid-svg-icons";
import { dateToTimeAgoString, jsonDateToJsDate } from "../util/util";
import { PlayerChip } from "../components/GoldberriesComponents";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./Rules";
import { visit } from "unist-util-visit";
import emoji from "remark-emoji";

export function PagePostList({ type }) {
  const { id } = useParams();
  //if id is not set, then show the list. otherwise, show the exact post

  return (
    <BasicContainerBox maxWidth="md">
      {id ? <PostDetail type={type} id={id} /> : <PostList type={type} />}
    </BasicContainerBox>
  );
}

export function PostList({ type }) {
  return <Typography variant="h4">Post List: {type}</Typography>;
}

export function PostDetail({ type, id }) {
  const theme = useTheme();
  const query = useGetPost(id);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const post = getQueryData(query);
  const colorSecondary = theme.palette.text.secondary;

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
      <Grid item xs="auto">
        <StyledLink to={`/manage/posts/${post.id}`}>
          <Button variant="outlined" startIcon={<FontAwesomeIcon icon={faEdit} size="sm" />}>
            Edit
          </Button>
        </StyledLink>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" gap={0.75} alignItems="center">
          <TooltipLineBreaks title={jsonDateToJsDate(post.date_created).toLocaleString()}>
            <Typography variant="body2" color={colorSecondary}>
              {dateToTimeAgoString(jsonDateToJsDate(post.date_created))}
            </Typography>
          </TooltipLineBreaks>
          {post.date_edited && (
            <>
              <TooltipLineBreaks title={jsonDateToJsDate(post.date_edited).toLocaleString()}>
                <Typography variant="body2" color={colorSecondary}>
                  (edited {dateToTimeAgoString(jsonDateToJsDate(post.date_edited))})
                </Typography>
              </TooltipLineBreaks>
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
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
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

export function AdjacentPostsDisplay({ type, id }) {
  const theme = useTheme();
  const query = useGetAdjacentPosts(id);
  const data = getQueryData(query);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const { previous, next } = data;

  const textShadow =
    "0px 0px 3px black, 0px 0px 3px black, 0px 0px 3px black, 0px 0px 3px black, 0px 0px 3px black";
  const dropShadow =
    "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)";

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        {previous && (
          <StyledLink to={`/${type}/${previous.id}`} style={{ textDecoration: "none" }}>
            <Stack
              direction="column"
              gap={0.5}
              sx={{
                p: "5px",
                borderRadius: "5px",
                alignItems: "center",
                // "&:hover": { background: theme.palette.background.subtle },
                //Background image: if previous.image_url is set
                backgroundImage: previous.image_url ? `url(${previous.image_url})` : "none",
                backgroundSize: "cover",
              }}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  color={theme.palette.text.secondary}
                  style={{ filter: dropShadow }}
                />
                <Typography variant="body1" color={theme.palette.text.secondary} sx={{ textShadow }}>
                  Previous Post
                </Typography>
              </Stack>
              <AdjacentPostDetails post={previous} />
            </Stack>
          </StyledLink>
        )}
      </Grid>
      <Grid item xs={6}>
        {next && (
          <StyledLink to={`/${type}/${next.id}`} style={{ textDecoration: "none" }}>
            <Stack
              direction="column"
              gap={0.5}
              sx={{
                p: "5px",
                borderRadius: "5px",
                alignItems: "center",
                // "&:hover": { background: theme.palette.background.subtle },
                backgroundImage: next.image_url ? `url(${next.image_url})` : "none",
                backgroundSize: "cover",
              }}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="body1" color={theme.palette.text.secondary} sx={{ textShadow }}>
                  Next Post
                </Typography>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  color={theme.palette.text.secondary}
                  style={{ filter: dropShadow }}
                />
              </Stack>
              <AdjacentPostDetails post={next} />
            </Stack>
          </StyledLink>
        )}
      </Grid>
    </Grid>
  );
}

function AdjacentPostDetails({ post }) {
  const theme = useTheme();
  const textShadow =
    "0px 0px 3px black, 0px 0px 3px black, 0px 0px 3px black, 0px 0px 3px black, 0px 0px 3px black";
  return (
    <Stack direction="row" gap={1} alignItems="center" sx={{ overflow: "hidden", maxWidth: "90%" }}>
      {/* {post.image_url && (
        <img src={post.image_url} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
      )} */}
      <Typography
        variant="body1"
        color={theme.palette.text.primary}
        sx={{ textShadow, textWrap: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
      >
        {post.title}
      </Typography>
    </Stack>
  );
}

//#region Post Components
export function MarkdownRenderer({ markdown }) {
  const theme = useTheme();
  const colorSecondary = theme.palette.text.secondary;

  return (
    <Markdown
      components={{
        a: ({ href, children, ...props }) => <StyledExternalLink href={href}>{children}</StyledExternalLink>,
        img: ({ src, alt }) => {
          //split alt by |
          //if there are 2 values, the first will be the width percentage, the second will be the alt text
          const altSplit = alt.split(";");
          let altText = alt;
          let displayAlt = false;
          let width = undefined;
          if (altSplit.length === 2) {
            altText = altSplit[1];
            width = altSplit[0];
          }
          if (altText.startsWith("!")) {
            altText = altText.substring(1);
            displayAlt = true;
          }
          return (
            <Stack direction="column" alignItems="center">
              <img src={src} alt={altText} style={{ width: width, maxWidth: "100%" }} />
              {displayAlt && (
                <Typography variant="caption" color={colorSecondary}>
                  {altText}
                </Typography>
              )}
            </Stack>
          );
        },
        table: ({ children }) => (
          <TableContainer component={Paper}>
            <Table size="small">{children}</Table>
          </TableContainer>
        ),
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
          return <CodeBlock className={className}>{children}</CodeBlock>;
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
        //text is NEVER a top level node, so this will never be called
        // text: ({ value, ...props }) => {
        //   console.log("p node:", value, props);
        //   return <span {...props}>{value}</span>;
        // },
        // emoji: ({ value, ...props }) => {
        //   console.log("emoji:", value, props);
        //   return <span style={{ color: "red" }}>{value}</span>;
        // },
      }}
      remarkPlugins={[/*pluginEmojis, */ pluginCodeFencer, remarkGfm, emoji]}
    >
      {markdown}
    </Markdown>
  );
}

export function PostImage({ image_url, title }) {
  return (
    <img
      src={image_url}
      style={{ width: "100%", maxHeight: "120px", objectFit: "cover", borderRadius: "5px" }}
      alt={title}
    />
  );
}

export function PostTitle({ title }) {
  return (
    <Typography variant="h4" fontWeight="bold">
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
