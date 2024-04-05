import { Breadcrumbs } from "@mui/material";
import { getCampaignName, getChallengeName } from "../util/data_util";
import { StyledLink } from "./BasicComponents";

export function GoldberriesBreadcrumbs({ campaign, map, challenge, submission, ...props }) {
  return (
    <Breadcrumbs {...props}>
      <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign)}</StyledLink>
      {map && <StyledLink to={"/map/" + map.id}>{map.name}</StyledLink>}
      {challenge && <StyledLink to={"/challenge/" + challenge.id}>{getChallengeName(challenge)}</StyledLink>}
    </Breadcrumbs>
  );
}
