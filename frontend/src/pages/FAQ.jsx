import { Paper, Typography } from "@mui/material";
import { BasicContainerBox, HeadTitle, StyledLink } from "../components/BasicComponents";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

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

  const entryCount = 11;

  return (
    <>
      <Typography variant="h3" gutterBottom>
        {t("title")}
      </Typography>
      {Array.from({ length: entryCount }, (_, index) => (
        <FAQEntry key={index} index={index} />
      ))}
    </>
  );
}

function FAQEntry({ index }) {
  const { t } = useTranslation(undefined, { keyPrefix: "faq" });
  const [expanded, setExpanded] = useState(false);

  const question = t(index + ".question");
  const answer = t(index + ".answer");

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
