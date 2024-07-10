import {
  Paper,
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
  const allRules = NewRules;

  return (
    <>
      <Typography variant="h3" gutterBottom>
        {t("title")}
      </Typography>
      {Object.keys(allRules).map((key) => (
        <RulesSection key={key} sectionKey={key} section={allRules[key]} />
      ))}
    </>
  );
}
function RulesSection({ sectionKey, section }) {
  const { t } = useTranslation(undefined, { keyPrefix: "rules." + sectionKey });
  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t("header")}
        {Object.keys(section).map((subsectionKey) => (
          <RulesSubSection
            key={subsectionKey}
            subSectionKey={subsectionKey}
            sectionKey={sectionKey}
            subsection={section[subsectionKey]}
          />
        ))}
      </Typography>
    </>
  );
}
function RulesSubSection({ sectionKey, subSectionKey, subsection }) {
  const { t } = useTranslation(undefined, { keyPrefix: "rules." + sectionKey + "." + subSectionKey });
  const { type, count } = subsection;
  const tabelSize = subsection.size === "small" ? "small" : "medium";
  const hasExplanation = subsection.explanation === true;
  return (
    <>
      <Typography variant="h6" sx={{ mt: 1 }}>
        {t("header")}
      </Typography>

      {hasExplanation && (
        <Typography variant="body2" gutterBottom>
          {t("explanation")}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table size={tabelSize}>
          <TableBody>
            {Array.from({ length: count }, (_, i) => i).map((i) => {
              const label = type === "ordered" ? i + 1 + "." : "-";
              return (
                <TableRow key={i}>
                  <TableCell align="center">{label}</TableCell>
                  <TableCell>
                    <>
                      <Trans
                        t={t}
                        i18nKey={"" + i}
                        components={{
                          CustomExternalLink: <StyledExternalLink />,
                          CustomLink: <StyledLink />,
                        }}
                      />
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
