import {
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
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
  TooltipLineBreaks,
} from "../components/BasicComponents";
import { useParams } from "react-router-dom";
import { getQueryData, useGetPost } from "../hooks/useApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { dateToTimeAgoString, jsonDateToJsDate } from "../util/util";
import { PlayerChip } from "../components/GoldberriesComponents";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./Rules";
import { visit } from "unist-util-visit";

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
      <Grid item xs={12}>
        <StyledLink to={`/${type}`}>
          <Stack direction="row" gap={1} alignItems="center">
            <FontAwesomeIcon icon={faArrowLeft} />
            <Typography variant="body1">Back to list</Typography>
          </Stack>
        </StyledLink>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" gap={0.75} alignItems="center">
          <TooltipLineBreaks title={jsonDateToJsDate(post.date_created).toLocaleDateString()}>
            <Typography variant="body2" color={colorSecondary}>
              {dateToTimeAgoString(jsonDateToJsDate(post.date_created))}
            </Typography>
          </TooltipLineBreaks>
          <Typography variant="body2" color={colorSecondary}>
            ·
          </Typography>
          <Typography variant="body2" color={colorSecondary}>
            by
          </Typography>
          <PlayerChip player={post.author} size="small" />
        </Stack>
      </Grid>
      {post.image_url && (
        <Grid item xs={12}>
          <img src={post.image_url} style={{ width: "100%" }} alt={post.title} />
        </Grid>
      )}
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h4" fontWeight="bold">
              {post.title}
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{ "& > :first-child": { mt: 0 }, "& > :last-child": { mb: 0 } }}>
            <Markdown
              components={{
                a: ({ href, children, ...props }) => (
                  <StyledExternalLink href={href}>{children}</StyledExternalLink>
                ),
                // p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                img: ({ src, alt }) => {
                  //split alt by |
                  //if there are 2 values, the first will be the maxWidth percentage, the second will be the alt text
                  const altSplit = alt.split("|");
                  let altText = alt;
                  let maxWidth = "100%";
                  if (altSplit.length === 2) {
                    altText = altSplit[1];
                    maxWidth = altSplit[0];
                  }
                  return (
                    <Stack direction="row" justifyContent="center">
                      <img src={src} alt={altText} style={{ maxWidth: maxWidth }} />
                    </Stack>
                  );
                },
                // ul: ({ children }) => <ul style={{ margin: 0, paddingLeft: "16px" }}>{children}</ul>,
                table: ({ children }) => (
                  <TableContainer component={Paper}>
                    <Table size="small">{children}</Table>
                  </TableContainer>
                ),
                thead: ({ children }) => <TableHead>{children}</TableHead>,
                tbody: ({ children }) => <TableBody>{children}</TableBody>,
                tr: ({ children }) => <TableRow>{children}</TableRow>,
                th: ({ children }) => <TableCell>{children}</TableCell>,
                td: ({ children }) => <TableCell>{children}</TableCell>,
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
                    }}
                  >
                    {children}
                  </pre>
                ),
              }}
              remarkPlugins={[
                () => (tree) => {
                  visit(tree, "code", (node) => {
                    node.meta = "fence";
                  });
                },
                remarkGfm,
              ]}
            >
              {post.content}
            </Markdown>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
    </Grid>
  );
}
