import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
} from "../components/BasicComponents";
import { Trans, useTranslation } from "react-i18next";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { getQueryData, useGetAllDifficulties } from "../hooks/useApi";
import { DifficultyChip } from "../components/GoldberriesComponents";

export function PageFAQ() {
  const { t } = useTranslation(undefined, { keyPrefix: "faq" });

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <FAQList />
    </BasicContainerBox>
  );
}

function FAQList() {
  const { t } = useTranslation(undefined, { keyPrefix: "faq" });
  const { t: t_a } = useTranslation();

  const entries = t("entries", { returnObjects: true });

  return (
    <>
      <Stack direction="row">
        <Typography variant="h3" gutterBottom>
          {t("title")}
        </Typography>
        <StyledLink to="/rules" style={{ marginLeft: "auto" }}>
          <FontAwesomeIcon icon={faArrowRight} style={{ marginRight: "4px" }} />
          {t_a("rules.title")}
        </StyledLink>
      </Stack>
      {entries.map((entry, index) => (
        <FAQEntry key={index} entry={entry} />
      ))}
      <FAQEntryVanillaReferences />
    </>
  );
}

function FAQEntry({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const question = entry.question;
  const answer = entry.answer;
  return (
    <Paper style={{ marginBottom: "1em" }}>
      <StyledLink onClick={() => setExpanded(!expanded)}>
        <Typography variant="h5" sx={{ p: "0.5em" }}>
          {question} <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} size="2xs" />
        </Typography>
      </StyledLink>
      {expanded && (
        <Typography variant="body1" sx={{ p: "1em", paddingTop: 0 }}>
          {answer}
        </Typography>
      )}
    </Paper>
  );
}

function FAQEntryVanillaReferences({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "faq.vanilla_references" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [expanded, setExpanded] = useState(false);
  const query = useGetAllDifficulties();
  const difficulties = getQueryData(query);

  const vanilla_references = [
    { name: "The Summit A-Side [FC]", difficulty_id: 17 },
    { name: "Farewell [C/FC]", difficulty_id: 14 },
    { name: "Farewell [No DTS] [C/FC]", difficulty_id: 12 },
    { name: "Any%", difficulty_id: 14 },
    { name: "All Full Clears", difficulty_id: 10 },
    { name: "All B-Sides", difficulty_id: 10 },
    { name: "All C-Sides", difficulty_id: 17 },
    { name: "100%", difficulty_id: 4 },
    { name: "202 Berries", difficulty_id: 3 },
  ];

  return (
    <Paper style={{ marginBottom: "1em" }}>
      <StyledLink onClick={() => setExpanded(!expanded)}>
        <Typography variant="h5" sx={{ p: "0.5em" }}>
          {t("question")} <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} size="2xs" />
        </Typography>
      </StyledLink>
      {expanded && (
        <Stack direction="column" gap={1} sx={{ p: "1em", paddingTop: 0 }}>
          <Typography variant="body1">
            <Trans>{t("answer")}</Trans>
          </Typography>
          {query.isLoading && <LoadingSpinner />}
          {query.isError && <ErrorDisplay error={query.error} />}
          {query.isSuccess && (
            <Stack direction="row" justifyContent="space-around">
              <Table size="small" sx={{ width: "unset" }}>
                <TableHead>
                  <TableRow>
                    <TableCell width={1}>{t_g("challenge", { count: 1 })}</TableCell>
                    <TableCell align="center">{t_g("difficulty", { count: 1 })}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vanilla_references.map((ref, index) => {
                    const difficulty = difficulties.find((d) => d.id === ref.difficulty_id);
                    return (
                      <TableRow key={index}>
                        <TableCell width={1} sx={{ whiteSpace: "nowrap" }}>
                          {ref.name}
                        </TableCell>
                        <TableCell align="center">
                          <DifficultyChip difficulty={difficulty} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Stack>
          )}
        </Stack>
      )}
    </Paper>
  );
}
