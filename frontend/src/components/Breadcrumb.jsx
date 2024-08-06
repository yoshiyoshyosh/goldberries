import { Breadcrumbs } from "@mui/material";
import { getChallengeNameShort, getMapName } from "../util/data_util";
import { StyledLink } from "./BasicComponents";

export function GoldberriesBreadcrumbs({ campaign, map, challenge, submission, ...props }) {
  return (
    <Breadcrumbs {...props}>
      <StyledLink to={"/campaign/" + campaign.id}>{campaign.name}</StyledLink>
      {map && <StyledLink to={"/map/" + map.id}>{getMapName(map, campaign, false)}</StyledLink>}
      {challenge && (
        <StyledLink to={"/challenge/" + challenge.id}>{getChallengeNameShort(challenge, true)}</StyledLink>
      )}
    </Breadcrumbs>
  );
}
