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
import { BasicContainerBox, HeadTitle, StyledExternalLink, StyledLink } from "../components/BasicComponents";
import { Trans, useTranslation } from "react-i18next";
import { NewRules } from "../util/other_data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChain } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "@emotion/react";

export function PageRules() {
  const { t } = useTranslation(undefined, { keyPrefix: "rules" });

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <RulesList />
    </BasicContainerBox>
  );
}

function RulesList() {
  const { t } = useTranslation(undefined, { keyPrefix: "rules" });
  const { t: t_a } = useTranslation();
  const allRules = NewRules;
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        const yOffset = -52;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }, [hash]);

  return (
    <>
      <Stack direction="row">
        <Typography variant="h3" gutterBottom>
          {t("title")}
        </Typography>
        <StyledLink to="/faq" style={{ marginLeft: "auto" }}>
          <FontAwesomeIcon icon={faArrowRight} style={{ marginRight: "4px" }} />
          {t_a("faq.title")}
        </StyledLink>
      </Stack>
      <RulesTOC allRules={allRules} />
      <Typography variant="body2" gutterBottom>
        <Trans
          t={t}
          i18nKey={"description"}
          components={{
            CustomExternalLink: <StyledExternalLink />,
            CustomLink: <StyledLink />,
          }}
        />
      </Typography>
      <Typography variant="body2" color="error" gutterBottom sx={{ mt: 1 }}>
        PLEASE NOTE: These rules are currently in the process of being reworked and are temporarily only
        available in English.
      </Typography>
      {Object.keys(allRules).map((key) => (
        <RulesSection key={key} sectionKey={key} section={allRules[key]} />
      ))}
    </>
  );
}
function RulesTOC({ allRules }) {
  //Generate a Table of Contents
  //consiting of <StyledLink> elements linking to #id of each (sub)section
  const { t } = useTranslation(undefined, { keyPrefix: "rules" });
  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t("toc")}
      </Typography>
      <ul>
        {Object.keys(allRules).map((key) => {
          const section = allRules[key];
          const id = section.id;
          const headerText = t(key + ".header");
          return (
            <li key={key}>
              <StyledLink to={"#" + id}>{headerText}</StyledLink>
              {Object.keys(section).map((subKey) => {
                if (typeof section[subKey] === "object" && section[subKey].header !== false) {
                  const subSection = section[subKey];
                  const id = subSection.id;
                  const subHeaderText = t(key + "." + subKey + ".header");
                  return (
                    <ul key={subKey}>
                      <li>
                        <StyledLink to={"#" + id}>{subHeaderText}</StyledLink>
                      </li>
                    </ul>
                  );
                }
              })}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function RulesSection({ sectionKey, section }) {
  const theme = useTheme();
  const { t } = useTranslation(undefined, { keyPrefix: "rules." + sectionKey });
  const hasHeader = section.header !== false;
  const id = section.id;
  return (
    <>
      {hasHeader && (
        <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1, mt: 2 }}>
          <Typography id={id} variant="h4">
            {t("header")}
          </Typography>
          <StyledLink to={"#" + id}>
            <FontAwesomeIcon color={theme.palette.text.secondary} icon={faChain} />
          </StyledLink>
        </Stack>
      )}
      {Object.keys(section).map((subsectionKey) => {
        if (typeof section[subsectionKey] === "object") {
          return (
            <RulesSubSection
              key={subsectionKey}
              subSectionKey={subsectionKey}
              sectionKey={sectionKey}
              subsection={section[subsectionKey]}
            />
          );
        }
      })}
    </>
  );
}
function RulesSubSection({ sectionKey, subSectionKey, subsection }) {
  const theme = useTheme();
  const { t } = useTranslation(undefined, { keyPrefix: "rules." + sectionKey + "." + subSectionKey });
  const { type, count } = subsection;
  const entries = t("entries", { returnObjects: true });
  const tabelSize = subsection.size === "small" ? "small" : "medium";
  const hasExplanation = subsection.explanation === true;
  const hasHeader = subsection.header !== false;
  const id = subsection.id;

  return (
    <>
      {hasHeader && (
        <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 1 }}>
          <Typography id={id} variant="h6">
            {t("header")}
          </Typography>
          <StyledLink to={"#" + id}>
            <FontAwesomeIcon color={theme.palette.text.secondary} icon={faChain} />
          </StyledLink>
        </Stack>
      )}

      {hasExplanation && (
        <Typography variant="body2" gutterBottom>
          <Trans
            t={t}
            i18nKey={"explanation"}
            components={{
              CustomExternalLink: <StyledExternalLink />,
              CustomLink: <StyledLink />,
            }}
          />
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table size={tabelSize}>
          <TableBody>
            {entries.map((entry, i) => {
              const label = type === "ordered" ? i + 1 + "." : "-";
              return (
                <TableRow key={i}>
                  <TableCell align="center">{label}</TableCell>
                  <TableCell>
                    <>
                      {entry.heading && (
                        <Typography variant="body1" fontWeight="bold" sx={{ textDecoration: "underline" }}>
                          {entry.heading}
                        </Typography>
                      )}
                      <Trans
                        t={t}
                        components={{
                          CustomExternalLink: <StyledExternalLink />,
                          CustomLink: <StyledLink />,
                          code: <CodeBlock />,
                        }}
                      >
                        {entry.text}
                      </Trans>
                    </>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export function CodeBlock({ children, ...props }) {
  const theme = useTheme();
  const isDarkmode = theme.palette.mode === "dark";
  const codeStyle = {
    fontWeight: "bold",
    borderRadius: "5px",
    padding: "0 3px",
  };
  if (isDarkmode) {
    codeStyle.background = "rgba(255,255,255,.1)";
    codeStyle.border = "1px solid white";
  } else {
    codeStyle.background = "rgba(0,0,0,.07)";
    codeStyle.border = "1px solid black";
  }
  return (
    <code {...props} style={codeStyle}>
      {children}
    </code>
  );
}
