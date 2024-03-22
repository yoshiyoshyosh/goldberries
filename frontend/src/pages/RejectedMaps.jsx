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
import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import { getQueryData, useGetRejectedMapList } from "../hooks/useApi";
import { Link } from "react-router-dom";
import { getCampaignName } from "../util/data_util";

export function PageRejectedMaps() {
  const query = useGetRejectedMapList();

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">Rejected Maps</Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">Rejected Maps</Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  const maps = getQueryData(query);

  return (
    <BasicContainerBox maxWidth="md">
      <RejectedMapsTable maps={maps} />
    </BasicContainerBox>
  );
}

function RejectedMapsTable({ maps }) {
  return (
    <>
      <Typography variant="h6">Rejected Maps</Typography>
      <Typography variant="body2" gutterBottom>
        These maps have been rejected from the map pool and are not eligible for submissions.
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Campaign</TableCell>
              <TableCell>Map</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maps.map((map) => (
              <TableRow key={map.id}>
                <TableCell>
                  <Link to={"/campaign/" + map.campaign.id}>{getCampaignName(map.campaign)}</Link>
                </TableCell>
                <TableCell>
                  <Link to={"/map/" + map.id}>{map.name}</Link>
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
