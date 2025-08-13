import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
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
import { useEffect, useLayoutEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronDown, faChevronUp, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { getQueryData, useGetAllDifficulties } from "../hooks/useApi";
import { DifficultyChip } from "../components/GoldberriesComponents";
import { useNavigate, useParams } from "react-router-dom";

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
  const { entry } = useParams();
  const entryInt = parseInt(entry);

  const entries = t("entries", { returnObjects: true });
  const vanillaIndex = Object.keys(entries).length;

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
        <FAQEntry key={index} entry={entry} index={index} forceExpanded={index + 1 === entryInt} />
      ))}
      <FAQEntryVanillaReferences index={vanillaIndex} forceExpanded={vanillaIndex + 1 === entryInt} />
    </>
  );
}

function FAQEntry({ entry, index, forceExpanded = false }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(forceExpanded);

  useLayoutEffect(() => {
    if (forceExpanded) {
      const element = document.getElementById("entry-" + (index + 1));
      if (element) {
        const yOffset = -52;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }, []);

  const onClick = () => {
    setExpanded(!expanded);
    if (!expanded) {
      navigate(`/faq/${index + 1}`, { replace: true });
    }
  };

  const question = entry.question;
  const answer = entry.answer;
  return (
    <Paper style={{ marginBottom: "1em" }} id={"entry-" + (index + 1)}>
      <StyledLink onClick={onClick}>
        <Typography variant="h5" sx={{ p: "0.5em" }}>
          {question} <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} size="2xs" />
        </Typography>
      </StyledLink>
      {expanded && (
        <Typography variant="body1" sx={{ p: "1em", paddingTop: 0 }}>
          <Trans>{answer}</Trans>
        </Typography>
      )}
    </Paper>
  );
}

function FAQEntryVanillaReferences({ index, forceExpanded = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "faq.vanilla_references" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(forceExpanded);
  const query = useGetAllDifficulties();
  const difficulties = getQueryData(query);

  useEffect(() => {
    if (forceExpanded && query.isSuccess) {
      const element = document.getElementById("entry-" + (index + 1));
      if (element) {
        const yOffset = -52;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }, [query.isSuccess]);

  const onClick = () => {
    setExpanded(!expanded);
    if (!expanded) {
      navigate(`/faq/${index + 1}`, { replace: true });
    }
  };

  const vanilla_references = [
    { name: "1-8C, 1A [C/FC], 2A [C/FC], 1B, 2B, 4A [C]", difficulty_id: 21 },
    { name: "3A [C], 4A [FC], 5A [C], 6A [C/FC], 8A [C/FC], 3B, 4B, 5B", difficulty_id: 18 },
    { name: "3A [FC], 5A [FC], 7A [C], 6B, 7B, 8B", difficulty_id: 22 },
    { name: "7A [FC]", difficulty_id: 17 },
    { name: "1A Double Golden", difficulty_id: 18 },
    { name: "Farewell [C/FC]", difficulty_id: 14 },
    { name: "Farewell [No DTS] [C/FC]", difficulty_id: 12 },
    { name: "Any%", difficulty_id: 14, note: "Forsaken City through The Summit" },
    { name: "All Full Clears", difficulty_id: 10, note: "Forsaken City [FC] through Core [FC]" },
    { name: "True Ending", difficulty_id: 10, note: "Forsaken City through Farewell" },
    { name: "All B-Sides", difficulty_id: 10 },
    { name: "All C-Sides", difficulty_id: 17 },
    {
      name: "100%",
      difficulty_id: 4,
      note: "All Full Clears + All B-Sides + All C-Sides + Farewell with Moonberry",
    },
    { name: "202 Berries", difficulty_id: 3 },
  ];

  return (
    <Paper style={{ marginBottom: "1em" }} id={"entry-" + (index + 1)}>
      <StyledLink onClick={onClick}>
        <Typography variant="h5" sx={{ p: "0.5em" }}>
          {t("question")} <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} size="2xs" />
        </Typography>
      </StyledLink>
      {expanded && (
        <Stack direction="column" gap={1} sx={{ p: "1em", paddingTop: 0 }}>
          <Typography variant="body1">
            <Trans t={t} i18nKey="answer" components={{ StyledLink }} />
          </Typography>
          {query.isLoading && <LoadingSpinner />}
          {query.isError && <ErrorDisplay error={query.error} />}
          {query.isSuccess && (
            <Stack direction="row" justifyContent="space-around">
              <Table size="small" sx={{ width: "unset" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t_g("challenge", { count: 1 })}</TableCell>
                    <TableCell align="center">{t_g("difficulty", { count: 1 })}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vanilla_references.map((ref, index) => {
                    const difficulty = difficulties.find((d) => d.id === ref.difficulty_id);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Stack direction="row" gap={1} alignItems="center">
                            {ref.name}
                            {ref.note && (
                              <Tooltip title={ref.note} placement="top" arrow>
                                <FontAwesomeIcon icon={faInfoCircle} size="sm" />
                              </Tooltip>
                            )}
                          </Stack>
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
