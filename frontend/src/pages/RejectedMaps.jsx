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
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
} from "../components/BasicComponents";
import { getQueryData, useGetRejectedMapList } from "../hooks/useApi";
import { getCampaignName } from "../util/data_util";
import { useTranslation } from "react-i18next";

export function PageRejectedMaps() {
  const { t } = useTranslation(undefined, { keyPrefix: "rejected_maps" });
  const query = useGetRejectedMapList();

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">{t("title")}</Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">{t("title")}</Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  const maps = getQueryData(query);

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={t("title")} />
      <RejectedMapsTable maps={maps} />
    </BasicContainerBox>
  );
}

function RejectedMapsTable({ maps }) {
  const { t } = useTranslation(undefined, { keyPrefix: "rejected_maps" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  return (
    <>
      <Typography variant="h6">{t("title")}</Typography>
      <Typography variant="body2" gutterBottom>
        {t("info_1")}
      </Typography>
      <Typography variant="body2" gutterBottom color="error.main">
        {t("info_2")}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t_g("campaign", { count: 1 })}</TableCell>
              <TableCell>{t_g("map", { count: 1 })}</TableCell>
              <TableCell>{t("reason")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maps.map((map) => (
              <TableRow key={map.id}>
                <TableCell>
                  <StyledLink to={"/campaign/" + map.campaign.id}>{getCampaignName(map.campaign)}</StyledLink>
                </TableCell>
                <TableCell>
                  <StyledLink to={"/map/" + map.id}>{map.name}</StyledLink>
                </TableCell>
                <TableCell>{map.rejection_reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
