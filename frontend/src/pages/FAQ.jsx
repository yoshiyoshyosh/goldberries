import { Paper, Stack, Typography } from "@mui/material";
import { BasicContainerBox, HeadTitle, StyledLink } from "../components/BasicComponents";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

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
        <Typography variant="body1" sx={{ p: "1em" }}>
          {answer}
        </Typography>
      )}
    </Paper>
  );
}
