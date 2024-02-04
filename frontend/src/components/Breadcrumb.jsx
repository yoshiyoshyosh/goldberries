import { Breadcrumbs, Typography } from "@mui/material";
import { getCampaignName, getChallengeName } from "../util/data_util";
import { Link } from "react-router-dom";

export function GoldberriesBreadcrumbs({ campaign, map, challenge, submission, ...props }) {
  return (
    <Breadcrumbs {...props}>
      <Link to={"/campaign/" + campaign.id}>{getCampaignName(campaign)}</Link>
      {map && <Link to={"/map/" + map.id}>{map.name}</Link>}
      {challenge && <Link to={"/challenge/" + challenge.id}>{getChallengeName(challenge)}</Link>}
    </Breadcrumbs>
  );
}
