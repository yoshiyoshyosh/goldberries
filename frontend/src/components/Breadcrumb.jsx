import { Breadcrumbs, Typography } from "@mui/material";
import { getChallengeName } from "../util/data_util";
import { Link } from "react-router-dom";

export function GoldberriesBreadcrumbs({ campaign, map, challenge, submission, ...props }) {
  return (
    <Breadcrumbs {...props}>
      <Link to={"/campaign/" + campaign.id}>{campaign.name + " (by " + campaign.author_gb_name + ")"}</Link>
      {map && <Link to={"/map/" + map.id}>{map.name}</Link>}
      {challenge && <Link to={"/challenge/" + challenge.id}>{getChallengeName(challenge)}</Link>}
    </Breadcrumbs>
  );
}
